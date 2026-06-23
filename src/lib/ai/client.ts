import OpenAI from "openai";
import { z } from "zod";
import { COMMON_SYSTEM_PROMPT } from "./prompts";

export function isMockMode() {
  return process.env.AI_MOCK_MODE !== "false" || !process.env.OPENAI_API_KEY;
}

export function getAiRuntimeStatus() {
  const hasApiKey = Boolean(process.env.OPENAI_API_KEY);
  const forcedMock = process.env.AI_MOCK_MODE !== "false";
  return {
    mode: isMockMode() ? "mock" : "openai",
    hasApiKey,
    forcedMock,
    model: isMockMode() ? "mock" : process.env.OPENAI_MODEL ?? "gpt-4.1-mini"
  };
}

export async function runOpenAIJson<T>(
  prompt: string,
  input: unknown,
  schema: z.ZodSchema<T>,
  schemaContract: string
): Promise<T> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY saknas.");
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
  const controller = new AbortController();
  const timeoutMs = Number(process.env.OPENAI_TIMEOUT_MS ?? 120000);
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const response = await client.chat.completions
    .create(
      {
        model,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: COMMON_SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              prompt,
              "",
              "JSON-kontrakt som måste följas exakt:",
              schemaContract,
              "",
              "Viktigt:",
              "- Svara endast med giltig JSON, utan Markdown.",
              "- Hitta inte på information som inte finns i underlaget.",
              "- Markera saknad information som osäkerhet, antagande eller begränsning.",
              "- Skriv konkret för Movexums coacher, inte som generisk ESG-text.",
              "",
              "Input JSON:",
              JSON.stringify(input)
            ].join("\n")
          }
        ]
      },
      { signal: controller.signal }
    )
    .finally(() => clearTimeout(timeout));

  const content = response.choices[0]?.message.content;
  if (!content) {
    throw new Error("OpenAI returnerade inget JSON-innehåll.");
  }

  return schema.parse(JSON.parse(content));
}
