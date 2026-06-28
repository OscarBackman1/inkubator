import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";
import {
  mockFinalAnalysis,
  mockMateriality,
  mockSufficiency
} from "../src/lib/ai/mock";
import { PROMPT_VERSION } from "../src/lib/ai/prompts";

const prisma = new PrismaClient();

async function main() {
  await prisma.aIJob.deleteMany();
  await prisma.note.deleteMany();
  await prisma.updateEvent.deleteMany();
  await prisma.document.deleteMany();
  await prisma.gapQuestion.deleteMany();
  await prisma.materialityOverride.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      name: "Movexum Admin",
      email: "admin@movexum.se",
      passwordHash: hashPassword("demo"),
      role: "ADMIN"
    }
  });

  const coach = await prisma.user.create({
    data: {
      name: "Demo Coach",
      email: "coach@movexum.se",
      passwordHash: hashPassword("demo"),
      role: "COACH"
    }
  });

  const companies = [
    {
      name: "GreenTech Solutions AB",
      phase: "INKUBATOR" as const,
      industry: "SaaS / Programvara",
      journeyText:
        "Bolaget utvecklar AI-stöd för energioptimering i fastigheter och har tidiga pilotkunder."
    },
    {
      name: "CircuMat Nordic AB",
      phase: "BOOST_CHAMBER" as const,
      industry: "Industri / Material",
      journeyText:
        "Bolaget utvecklar återvunnet kompositmaterial för bygg- och industrikomponenter."
    },
    {
      name: "CareLens Health AB",
      phase: "SCREENING" as const,
      industry: "Life science / Hälsoteknik",
      journeyText:
        "Bolaget bygger en digital triageringslösning med AI-stöd för primärvården."
    }
  ];

  for (const [index, data] of companies.entries()) {
    const company = await prisma.company.create({
      data: {
        ...data,
        status: index === 0 ? "ANALYZED" : "MATERIALITY_REVIEW",
        createdById: admin.id,
        assignedToId: coach.id
      }
    });

    const materiality = mockMateriality({
      name: company.name,
      phase: company.phase,
      industry: company.industry,
      journeyText: company.journeyText,
      ideaText: company.journeyText
    });
    const sufficiency = mockSufficiency({ materiality, documentText: company.journeyText });
    const dashboard = mockFinalAnalysis({
      companyName: company.name,
      industry: company.industry,
      materiality,
      sufficiency,
      gapAnswers: []
    });

    const assessment = await prisma.assessment.create({
      data: {
        companyId: company.id,
        version: 1,
        type: "INITIAL",
        status: index === 0 ? "COMPLETE" : "MATERIALITY_REVIEW",
        frameworkVersion: "movexum-v0.1",
        materialityJson: materiality,
        sufficiencyJson: index === 0 ? sufficiency : undefined,
        dashboardJson: index === 0 ? dashboard : undefined,
        informationQualityScore: index === 0 ? dashboard.informationQualityScore : undefined,
        modelName: "mock",
        promptVersion: PROMPT_VERSION,
        inputHash: `seed-${index}`,
        createdById: admin.id,
        completedAt: index === 0 ? new Date() : undefined
      }
    });

    await prisma.document.create({
      data: {
        companyId: company.id,
        uploadedById: admin.id,
        assessmentId: assessment.id,
        uploadStage: "IDEA_DESCRIPTION",
        originalName: `${company.name} idebeskrivning.txt`,
        mimeType: "text/plain",
        sizeBytes: company.journeyText.length,
        storagePath: "seed://idea-description",
        extractedText: company.journeyText,
        extractionStatus: "COMPLETE"
      }
    });
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
