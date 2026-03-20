import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

type AIAction = "improve" | "summarize" | "generate_seo" | "command";

type EditorAIPayload = {
  action?: AIAction;
  text?: string;
  titulo?: string;
  subtitulo?: string;
  categoria?: string;
  customCommand?: string;
};

const FORCED_MODEL = "gemini-3-flash-preview";
const API_VERSION = "v1beta";

function buildPrompt(payload: Required<Pick<EditorAIPayload, "action" | "text">> & Omit<EditorAIPayload, "action" | "text">) {
  const context = [
    payload.titulo ? `Título atual: ${payload.titulo}` : "",
    payload.subtitulo ? `Subtítulo atual: ${payload.subtitulo}` : "",
    payload.categoria ? `Categoria: ${payload.categoria}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  if (payload.action === "improve") {
    return `Você é editor jornalístico em português do Brasil. Reescreva o texto abaixo com clareza, fluidez e tom profissional, sem inventar fatos. Preserve nomes, números e sentido original. Retorne apenas o texto final sem explicações.\n\n${context}\n\nTexto:\n${payload.text}`;
  }

  if (payload.action === "summarize") {
    return `Você é editor jornalístico em português do Brasil. Resuma o texto abaixo em 2 a 3 parágrafos curtos, mantendo os fatos centrais. Não invente informações. Retorne apenas o resumo.\n\n${context}\n\nTexto:\n${payload.text}`;
  }

  if (payload.action === "command") {
    return `Você é um jornalista profissional em português do Brasil. Siga estritamente o comando do jornalista abaixo usando apenas os fatos fornecidos. Não invente fatos, nomes, datas ou números. Se o comando pedir uma notícia completa, escreva a matéria completa com linguagem jornalística clara e objetiva. Retorne apenas o texto final, sem markdown e sem comentários extras.\n\n${context}\n\nComando do jornalista:\n${payload.customCommand || ""}\n\nFatos/base:\n${payload.text}`;
  }

  return `Você é editor-chefe e especialista em SEO jornalístico em português do Brasil. Com base no texto abaixo, gere: (1) um TÍTULO chamativo e factual com até 65 caracteres; (2) uma META DESCRIPTION para SEO com 140 a 160 caracteres, clara e atrativa. Não invente fatos. Responda estritamente em JSON no formato: {"titulo":"...","metaDescription":"..."}.\n\n${context}\n\nTexto:\n${payload.text}`;
}

function safeParseJson<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    const match = value.match(/\{[\s\S]*\}/);
    if (!match) return null;

    try {
      return JSON.parse(match[0]) as T;
    } catch {
      return null;
    }
  }
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Variável GEMINI_API_KEY não configurada no servidor." },
      { status: 500 }
    );
  }

  let body: EditorAIPayload;

  try {
    body = (await req.json()) as EditorAIPayload;
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const action = body.action;
  const text = body.text?.trim() || "";

  if (!action || !["improve", "summarize", "generate_seo", "command"].includes(action)) {
    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  }

  if (!text) {
    return NextResponse.json({ error: "Texto vazio para processar." }, { status: 400 });
  }

  if (action === "command" && !body.customCommand?.trim()) {
    return NextResponse.json({ error: "Informe o comando para IA." }, { status: 400 });
  }

  const prompt = buildPrompt({
    action,
    text,
    titulo: body.titulo,
    subtitulo: body.subtitulo,
    categoria: body.categoria,
    customCommand: body.customCommand,
  });

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel(
    { model: FORCED_MODEL },
    { apiVersion: API_VERSION }
  );

  let modelText = "";

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: action === "generate_seo" ? 0.7 : 0.4,
      },
    });

    const response = result.response;
    modelText = response.text().trim();
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : "Erro desconhecido ao consultar IA.";

    return NextResponse.json(
      {
        error: "Falha ao consultar IA.",
        details: `${details} (modelo forçado: ${FORCED_MODEL}, apiVersion: ${API_VERSION})`,
      },
      { status: 502 }
    );
  }

  if (!modelText) {
    return NextResponse.json({ error: "Resposta vazia da IA." }, { status: 502 });
  }

  if (action === "generate_seo") {
    const parsed = safeParseJson<{ titulo?: string; metaDescription?: string }>(modelText);

    if (!parsed?.titulo && !parsed?.metaDescription) {
      return NextResponse.json({ error: "IA não retornou título/meta description válidos." }, { status: 502 });
    }

    return NextResponse.json({
      data: {
        titulo: (parsed?.titulo || "").trim(),
        metaDescription: (parsed?.metaDescription || "").trim(),
      },
    });
  }

  return NextResponse.json({ data: { text: modelText.trim() } });
}
