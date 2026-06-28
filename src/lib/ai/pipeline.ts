import { prisma } from "@/lib/db/prisma";
import { hashInput } from "@/lib/utils/hash";
import {
  mockFinalAnalysis,
  mockMateriality,
  mockSufficiency,
  mockUpdateAnalysis
} from "./mock";
import { PROMPT_VERSION, PROMPTS } from "./prompts";
import { SCHEMA_CONTRACTS } from "./schemaContracts";
import {
  FinalAnalysisResultSchema,
  MaterialityResult,
  MaterialityResultSchema,
  SufficiencyResultSchema,
  UpdateAnalysisResultSchema,
  type FinalAnalysisResult,
  type SufficiencyResult
} from "./schemas";
import { isMockMode, runOpenAIJson } from "./client";

export async function runMaterialityAnalysis(input: {
  companyId: string;
  assessmentId: string;
  userId: string;
  name: string;
  phase: string;
  industry: string;
  journeyText: string;
  ideaText: string;
}) {
  const inputHash = hashInput(input);
  const job = await prisma.aIJob.create({
    data: {
      companyId: input.companyId,
      assessmentId: input.assessmentId,
      jobType: "MATERIALITY",
      status: "RUNNING",
      inputHash,
      modelName: isMockMode() ? "mock" : process.env.OPENAI_MODEL,
      promptVersion: PROMPT_VERSION
    }
  });

  try {
    const raw = isMockMode()
      ? mockMateriality(input)
      : await runOpenAIJson(PROMPTS.materiality, input, MaterialityResultSchema, SCHEMA_CONTRACTS.materiality);
    const result = MaterialityResultSchema.parse(raw);

    await prisma.$transaction([
      prisma.aIJob.update({
        where: { id: job.id },
        data: { status: "COMPLETE", outputJson: result, completedAt: new Date() }
      }),
      prisma.assessment.update({
        where: { id: input.assessmentId },
        data: {
          materialityJson: result,
          status: "MATERIALITY_REVIEW",
          modelName: isMockMode() ? "mock" : process.env.OPENAI_MODEL,
          promptVersion: PROMPT_VERSION,
          inputHash
        }
      }),
      prisma.company.update({
        where: { id: input.companyId },
        data: { status: "MATERIALITY_REVIEW" }
      })
    ]);

    return result;
  } catch (error) {
    await markJobFailed(job.id, error);
    throw error;
  }
}

export async function runSufficiencyAnalysis(input: {
  companyId: string;
  assessmentId: string;
  phase: string;
  materiality: MaterialityResult;
  documentText: string;
}) {
  const inputHash = hashInput(input);
  const job = await prisma.aIJob.create({
    data: {
      companyId: input.companyId,
      assessmentId: input.assessmentId,
      jobType: "SUFFICIENCY",
      status: "RUNNING",
      inputHash,
      modelName: isMockMode() ? "mock" : process.env.OPENAI_MODEL,
      promptVersion: PROMPT_VERSION
    }
  });

  try {
    const raw = isMockMode()
      ? mockSufficiency(input)
      : await runOpenAIJson(PROMPTS.sufficiency, input, SufficiencyResultSchema, SCHEMA_CONTRACTS.sufficiency);
    const result = SufficiencyResultSchema.parse(raw);

    await prisma.$transaction([
      prisma.aIJob.update({
        where: { id: job.id },
        data: { status: "COMPLETE", outputJson: result, completedAt: new Date() }
      }),
      prisma.assessment.update({
        where: { id: input.assessmentId },
        data: {
          sufficiencyJson: result,
          status: "NEEDS_MORE_INFO",
          informationQualityScore: result.overallInformationQuality
        }
      }),
      prisma.company.update({
        where: { id: input.companyId },
        data: { status: "NEEDS_MORE_INFO" }
      })
    ]);

    await prisma.gapQuestion.deleteMany({ where: { assessmentId: input.assessmentId } });
    await prisma.gapQuestion.createMany({
      data: result.aspectChecks
        .filter((check) => check.question)
        .map((check) => ({
          assessmentId: input.assessmentId,
          aspectCode: check.code,
          question: check.question!.question,
          missingInformation: check.question!.missingInformation,
          severity: check.question!.severity
        }))
    });

    return result;
  } catch (error) {
    await markJobFailed(job.id, error);
    throw error;
  }
}

export async function runFinalAnalysis(input: {
  companyId: string;
  assessmentId: string;
  companyName: string;
  phase: string;
  industry: string;
  materiality: MaterialityResult;
  sufficiency: SufficiencyResult;
  gapAnswers: string[];
}) {
  const inputHash = hashInput(input);
  const job = await prisma.aIJob.create({
    data: {
      companyId: input.companyId,
      assessmentId: input.assessmentId,
      jobType: "FINAL_ANALYSIS",
      status: "RUNNING",
      inputHash,
      modelName: isMockMode() ? "mock" : process.env.OPENAI_MODEL,
      promptVersion: PROMPT_VERSION
    }
  });

  try {
    const raw = isMockMode()
      ? mockFinalAnalysis(input)
      : await runOpenAIJson(PROMPTS.final, input, FinalAnalysisResultSchema, SCHEMA_CONTRACTS.final);
    const result = FinalAnalysisResultSchema.parse(raw);

    await prisma.$transaction([
      prisma.aIJob.update({
        where: { id: job.id },
        data: { status: "COMPLETE", outputJson: result, completedAt: new Date() }
      }),
      prisma.assessment.update({
        where: { id: input.assessmentId },
        data: {
          dashboardJson: result,
          status: "COMPLETE",
          informationQualityScore: result.informationQualityScore ?? input.sufficiency.overallInformationQuality,
          completedAt: new Date()
        }
      }),
      prisma.company.update({
        where: { id: input.companyId },
        data: { status: "ANALYZED" }
      })
    ]);

    return result;
  } catch (error) {
    await markJobFailed(job.id, error);
    throw error;
  }
}

export async function runUpdateAnalysis(input: {
  companyId: string;
  userId: string;
  previousAssessmentId: string;
  previousDashboard: FinalAnalysisResult;
  narrative: string;
  companyName: string;
  phase: string;
  materiality: MaterialityResult;
  sufficiency: SufficiencyResult;
}) {
  const previous = await prisma.assessment.findUniqueOrThrow({
    where: { id: input.previousAssessmentId }
  });
  const nextVersion = previous.version + 1;
  const assessment = await prisma.assessment.create({
    data: {
      companyId: input.companyId,
      version: nextVersion,
      type: "UPDATE",
      status: "FINAL_PENDING",
      frameworkVersion: "movexum-v0.1",
      materialityJson: input.materiality,
      sufficiencyJson: input.sufficiency,
      previousAssessmentId: previous.id,
      createdById: input.userId,
      modelName: isMockMode() ? "mock" : process.env.OPENAI_MODEL,
      promptVersion: PROMPT_VERSION,
      inputHash: hashInput(input)
    }
  });

  await prisma.updateEvent.create({
    data: {
      companyId: input.companyId,
      assessmentId: assessment.id,
      createdById: input.userId,
      narrative: input.narrative
    }
  });

  const job = await prisma.aIJob.create({
    data: {
      companyId: input.companyId,
      assessmentId: assessment.id,
      jobType: "UPDATE_ANALYSIS",
      status: "RUNNING",
      inputHash: hashInput(input),
      modelName: isMockMode() ? "mock" : process.env.OPENAI_MODEL,
      promptVersion: PROMPT_VERSION
    }
  });

  try {
    const raw = isMockMode()
      ? mockUpdateAnalysis(input)
      : await runOpenAIJson(PROMPTS.update, input, UpdateAnalysisResultSchema, SCHEMA_CONTRACTS.update);
    const result = UpdateAnalysisResultSchema.parse(raw);

    await prisma.$transaction([
      prisma.aIJob.update({
        where: { id: job.id },
        data: { status: "COMPLETE", outputJson: result, completedAt: new Date() }
      }),
      prisma.assessment.update({
        where: { id: assessment.id },
        data: {
          dashboardJson: result.updatedDashboard,
          updateDeltaJson: result.deltaSummary,
          status: "COMPLETE",
          informationQualityScore: result.updatedDashboard.informationQualityScore ?? input.sufficiency.overallInformationQuality,
          completedAt: new Date()
        }
      }),
      prisma.company.update({
        where: { id: input.companyId },
        data: { status: "ANALYZED" }
      })
    ]);

    return result;
  } catch (error) {
    await markJobFailed(job.id, error);
    throw error;
  }
}

async function markJobFailed(jobId: string, error: unknown) {
  await prisma.aIJob.update({
    where: { id: jobId },
    data: {
      status: "FAILED",
      error: error instanceof Error ? error.message : "Okänt analysfel",
      completedAt: new Date()
    }
  });
}
