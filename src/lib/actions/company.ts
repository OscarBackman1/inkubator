"use server";

import { rm } from "fs/promises";
import os from "os";
import path from "path";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";
import { combineDocumentText } from "@/lib/documents/chunking";
import { extractTextFromFile } from "@/lib/documents/extractText";
import { saveUploadedFile } from "@/lib/documents/storage";
import {
  runFinalAnalysis,
  runMaterialityAnalysis,
  runSufficiencyAnalysis,
  runUpdateAnalysis
} from "@/lib/ai/pipeline";
import type { FinalAnalysisResult, MaterialityResult, SufficiencyResult } from "@/lib/ai/schemas";

async function persistDocument(input: {
  file: File;
  companyId: string;
  uploadedById: string;
  assessmentId?: string;
  gapQuestionId?: string;
  uploadStage: "IDEA_DESCRIPTION" | "FULL_INFORMATION" | "GAP_RESPONSE" | "UPDATE";
}) {
  const saved = await saveUploadedFile(input.file, input.companyId);
  const extraction = await extractTextFromFile(saved.storagePath, input.file.type, saved.originalName);
  const extractionStatus = extraction.text || !extraction.warning ? "COMPLETE" : "FAILED";

  return prisma.document.create({
    data: {
      companyId: input.companyId,
      uploadedById: input.uploadedById,
      assessmentId: input.assessmentId,
      gapQuestionId: input.gapQuestionId,
      uploadStage: input.uploadStage,
      originalName: saved.originalName,
      mimeType: input.file.type || "application/octet-stream",
      sizeBytes: saved.sizeBytes,
      storagePath: saved.storagePath,
      extractedText: extraction.text,
      extractionStatus,
      extractionWarning: extraction.warning
    }
  });
}

export async function createCompanyAction(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const phase = String(formData.get("phase") ?? "SCREENING");
  const industry = String(formData.get("industry") ?? "").trim();
  const journeyText = String(formData.get("journeyText") ?? "").trim();
  const ideaFile = formData.get("ideaFile");
  const supportingFiles = formData
    .getAll("supportingFiles")
    .filter((file): file is File => file instanceof File && file.size > 0);

  if (!name || !industry || !journeyText || !(ideaFile instanceof File) || ideaFile.size === 0) {
    redirect("/companies/new?error=missing");
  }

  const company = await prisma.company.create({
    data: {
      name,
      phase: phase as never,
      industry,
      journeyText,
      status: "DRAFT",
      createdById: user.id,
      assignedToId: user.id
    }
  });

  const assessment = await prisma.assessment.create({
    data: {
      companyId: company.id,
      version: 1,
      type: "INITIAL",
      status: "MATERIALITY_PENDING",
      frameworkVersion: "movexum-v0.1",
      createdById: user.id
    }
  });

  const documents: Array<{ originalName: string; extractedText: string | null }> = [];
  documents.push(await persistDocument({
    file: ideaFile,
    companyId: company.id,
    uploadedById: user.id,
    assessmentId: assessment.id,
    uploadStage: "IDEA_DESCRIPTION"
  }));

  for (const file of supportingFiles) {
    documents.push(await persistDocument({
      file,
      companyId: company.id,
      uploadedById: user.id,
      assessmentId: assessment.id,
      uploadStage: "FULL_INFORMATION"
    }));
  }

  await runMaterialityAnalysis({
    companyId: company.id,
    assessmentId: assessment.id,
    userId: user.id,
    name,
    phase,
    industry,
    journeyText,
    documentText: combineDocumentText(documents)
  });

  redirect(`/companies/${company.id}/materiality`);
}

export async function approveMaterialityAction(companyId: string, assessmentId: string, formData: FormData) {
  const user = await requireUser();
  const assessment = await prisma.assessment.findUniqueOrThrow({
    where: { id: assessmentId },
    include: { company: true, documents: true }
  });
  const materiality = assessment.materialityJson as MaterialityResult | null;
  if (!materiality) redirect(`/companies/${companyId}/materiality?error=no-materiality`);

  const overrideWrites: Array<Promise<unknown>> = [];
  const summaryComment = String(formData.get("summaryComment") ?? "").trim();
  const updated: MaterialityResult = {
    ...materiality,
    companySummary: summaryComment
      ? `${materiality.companySummary}\n\nAnvändarkorrigering av bolagssummering: ${summaryComment}`
      : materiality.companySummary,
    selectedAspects: materiality.selectedAspects.map((aspect) => {
      const newStatus = String(formData.get(`status-${aspect.code}`) ?? aspect.status);
      const comment = String(formData.get(`comment-${aspect.code}`) ?? "").trim();
      if (newStatus !== aspect.status || comment) {
        overrideWrites.push(prisma.materialityOverride.create({
          data: {
            assessmentId,
            aspectCode: aspect.code,
            originalStatus: aspect.status,
            newStatus,
            comment,
            createdById: user.id
          }
        }));
      }
      return {
        ...aspect,
        status: newStatus === "UNCERTAIN" ? "UNCERTAIN" : "MATERIAL",
        uncertaintyNotes: comment ? [...aspect.uncertaintyNotes, `Användarkommentar: ${comment}`] : aspect.uncertaintyNotes
      };
    })
  };

  const customName = String(formData.get("customName") ?? "").trim();
  if (customName) {
    updated.selectedAspects.push({
      code: `CUSTOM-${Date.now()}`,
      name: customName,
      category: "CUSTOM",
      status: "MATERIAL",
      materialityStrength: 3,
      materialityDrivers: ["RISK"],
      underlyingAspects: String(formData.get("customUnderlying") ?? customName)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      rationale: "Tillagt av användaren i materialitetsgranskningen.",
      startupSpecificReason: "Movexum bedömer att området bör diskuteras med bolaget.",
      futureDevelopmentRelevance: "Området kan påverka bolagets framtida utveckling och bör följas upp.",
      evidence: [{ note: "Användartillägg." }],
      confidence: "LOW",
      uncertaintyNotes: ["Tillagt manuellt och bör verifieras i nästa analyssteg."]
    });
  }

  await Promise.all(overrideWrites);
  await prisma.$transaction([
    prisma.assessment.update({
      where: { id: assessmentId },
      data: { materialityJson: updated, status: "INFO_PENDING" }
    }),
    prisma.company.update({ where: { id: companyId }, data: { status: "INFO_COLLECTION" } })
  ]);

  await runSufficiencyAnalysis({
    companyId,
    assessmentId,
    phase: assessment.company.phase,
    materiality: updated,
    documentText: combineDocumentText(assessment.documents)
  });

  revalidatePath(`/companies/${companyId}`);
  redirect(`/companies/${companyId}/analysis#gap`);
}

export async function uploadInformationAction(companyId: string, assessmentId: string, formData: FormData) {
  const user = await requireUser();
  const files = formData.getAll("documents").filter((file): file is File => file instanceof File && file.size > 0);

  for (const file of files) {
    await persistDocument({
      file,
      companyId,
      uploadedById: user.id,
      assessmentId,
      uploadStage: "FULL_INFORMATION"
    });
  }

  const assessment = await prisma.assessment.findUniqueOrThrow({
    where: { id: assessmentId },
    include: { company: true, documents: true }
  });
  const materiality = assessment.materialityJson as MaterialityResult;
  const documentText = combineDocumentText(assessment.documents);

  await runSufficiencyAnalysis({
    companyId,
    assessmentId,
    phase: assessment.company.phase,
    materiality,
    documentText
  });

  redirect(`/companies/${companyId}/analysis#gap`);
}

export async function finalizeAnalysisAction(companyId: string, assessmentId: string, formData: FormData) {
  const user = await requireUser();
  const assessment = await prisma.assessment.findUniqueOrThrow({
    where: { id: assessmentId },
    include: { gapQuestions: true, company: true }
  });

  for (const question of assessment.gapQuestions) {
    const answerText = String(formData.get(`answer-${question.id}`) ?? "").trim();
    const status = String(formData.get(`status-${question.id}`) ?? (answerText ? "ANSWERED" : "OPEN"));
    await prisma.gapQuestion.update({
      where: { id: question.id },
      data: {
        answerText: answerText || null,
        status: status === "NOT_AVAILABLE" ? "NOT_AVAILABLE" : answerText ? "ANSWERED" : "OPEN"
      }
    });
    const files = formData
      .getAll(`file-${question.id}`)
      .filter((file): file is File => file instanceof File && file.size > 0);
    for (const file of files) {
      await persistDocument({
        file,
        companyId,
        uploadedById: user.id,
        assessmentId,
        gapQuestionId: question.id,
        uploadStage: "GAP_RESPONSE"
      });
    }
  }

  const refreshed = await prisma.assessment.findUniqueOrThrow({
    where: { id: assessmentId },
    include: { gapQuestions: true, company: true }
  });

  await runFinalAnalysis({
    companyId,
    assessmentId,
    companyName: refreshed.company.name,
    phase: refreshed.company.phase,
    industry: refreshed.company.industry,
    materiality: refreshed.materialityJson as MaterialityResult,
    sufficiency: refreshed.sufficiencyJson as SufficiencyResult,
    gapAnswers: refreshed.gapQuestions.map((question) => question.answerText ?? "")
  });

  redirect(`/companies/${companyId}/dashboard`);
}

export async function updateCompanyAction(companyId: string, formData: FormData) {
  const user = await requireUser();
  const narrative = String(formData.get("narrative") ?? "").trim();
  if (!narrative) redirect(`/companies/${companyId}/dashboard?error=update-empty`);

  const company = await prisma.company.findUniqueOrThrow({
    where: { id: companyId },
    include: {
      assessments: {
        orderBy: { version: "desc" },
        take: 1
      }
    }
  });
  const previous = company.assessments[0];
  if (!previous?.dashboardJson || !previous.materialityJson || !previous.sufficiencyJson) {
    redirect(`/companies/${companyId}/analysis`);
  }

  const result = await runUpdateAnalysis({
    companyId,
    userId: user.id,
    previousAssessmentId: previous.id,
    previousDashboard: previous.dashboardJson as FinalAnalysisResult,
    narrative,
    companyName: company.name,
    phase: company.phase,
    materiality: previous.materialityJson as MaterialityResult,
    sufficiency: previous.sufficiencyJson as SufficiencyResult
  });

  const latestAssessment = await prisma.assessment.findFirstOrThrow({
    where: { companyId },
    orderBy: { version: "desc" }
  });
  const updateEvent = await prisma.updateEvent.findFirst({
    where: { assessmentId: latestAssessment.id },
    orderBy: { createdAt: "desc" }
  });
  const files = formData.getAll("documents").filter((file): file is File => file instanceof File && file.size > 0);
  for (const file of files) {
    await persistDocument({
      file,
      companyId,
      uploadedById: user.id,
      assessmentId: latestAssessment.id,
      uploadStage: "UPDATE"
    });
    if (updateEvent) {
      await prisma.document.updateMany({
        where: { companyId, assessmentId: latestAssessment.id, uploadStage: "UPDATE", updateEventId: null },
        data: { updateEventId: updateEvent.id }
      });
    }
  }

  void result;
  redirect(`/companies/${companyId}/dashboard`);
}

export async function addNoteAction(companyId: string, formData: FormData) {
  const user = await requireUser();
  const body = String(formData.get("body") ?? "").trim();
  if (body) {
    await prisma.note.create({ data: { companyId, userId: user.id, body } });
  }
  revalidatePath(`/companies/${companyId}/notes`);
}

export async function deleteCompanyAction(companyId: string) {
  await requireUser();

  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) {
    redirect("/companies");
  }

  await prisma.company.delete({ where: { id: companyId } });

  const uploadRoot = process.env.VERCEL ? os.tmpdir() : path.join(process.cwd(), "uploads");
  const uploadDir = path.join(uploadRoot, companyId);
  await rm(uploadDir, { recursive: true, force: true });

  revalidatePath("/companies");
  redirect("/companies");
}
