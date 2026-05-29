import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import { parseStringPromise } from "xml2js";
import { Resend } from "resend";

const RSS_FEEDS = [
  { url: "https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=gynecology+women+health&format=rss&limit=10", especialidade: "Ginecologia e Saude da Mulher" },
  { url: "https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=endocrinology+obesity+weight+loss&format=rss&limit=10", especialidade: "Endocrinologia e Emagrecimento" },
  { url: "https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=aesthetic+dermatology+skin&format=rss&limit=10", especialidade: "Dermatologia Estetica" },
  { url: "https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=menopause+climacteric+hormone&format=rss&limit=10", especialidade: "Menopausa e Climaterio" },
];

type Noticia = { titulo: string; link: string; descricao: string; especialidade: string };

async function coletarNoticias(): Promise<Noticia[]> {
  const noticias: Noticia[] = [];
  for (const feed of RSS_FEEDS) {
    try {
      const response = await axios.get(feed.url, { timeout: 15000, headers: { "User-Agent": "AutomacaoMedica/1.0" } });
      const resultado = await parseStringPromise(response.data, { explicitArray: false });
      const itens = resultado?.rss?.channel?.item || [];
      const lista = Array.isArray(itens) ? itens : [itens];
      for (const item of lista) {
        const titulo = String(item.title || "").replace(/<[^>]*>/g, "").trim();
        const link = String(item.link || item.guid || "").trim();
        const descricao = String(item.description || item.summary || "").replace(/<[^>]*>/g, "").trim().substring(0, 500);
        if (!link || !titulo) continue;
        noticias.push({ titulo, link, descricao, especialidade: feed.especialidade });
      }
    } catch { console.error(`Erro no feed ${feed.especialidade}`); }
  }
  return noticias;
}

async function processarComGemini(noticias: Noticia[], apiKey: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });
  const noticiasTexto = noticias.map((n, i) => `[${i + 1}] ESPECIALIDADE: ${n.especialidade}\nTITULO: ${n.titulo}\nRESUMO: ${n.descricao}\nLINK: ${n.link}`).join("\n\n---\n\n");
  const prompt = `Voce e uma curadora cientifica para a Dra. Eriane Faria, medica especialista em Saude Feminina e Funcional (CRM MG 100709), Belo Horizonte.\n\nTAREFA: Analise as noticias abaixo e crie um RESUMO EXECUTIVO em HTML formatado e elegante.\n\nREGRAS:\n1. Traduza do ingles para portugues brasileiro\n2. Foque em aplicacoes praticas na consulta medica\n3. Agrupe por especialidade\n4. Use HTML limpo com style inline\n5. Estilo objetivo e rigoroso\n\nNOTICIAS:\n${noticiasTexto}\n\nRetorne APENAS o HTML do conteudo principal (sem html, head ou body tags).`;
  const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
  return response.text || "<p>Nao foi possivel gerar o resumo.</p>";
}

function montarEmailHTML(conteudo: string): string {
  const dataHoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "America/Sao_Paulo" });
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background-color:#F9F8F7;font-family:Georgia,serif;"><div style="background:linear-gradient(135deg,#9B8559,#b8a07a);padding:30px 40px;text-align:center;"><h1 style="color:#fff;margin:0;font-size:22px;letter-spacing:2px;font-weight:normal;">CURADORIA CIENTIFICA</h1><p style="color:#F6E6EA;margin:8px 0 0;font-size:13px;">DRA. ERIANE FARIA - SAUDE FEMININA E FUNCIONAL - CRM MG 100709</p></div><div style="background:#DDE8E2;padding:12px 40px;text-align:center;"><p style="margin:0;color:#4a6741;font-size:13px;">${dataHoje}</p></div><div style="max-width:700px;margin:0 auto;padding:40px 20px;">${conteudo}</div><div style="background:#1a1a1a;padding:25px 40px;text-align:center;margin-top:40px;"><p style="color:#9B8559;margin:0;font-size:12px;">RESUMO GERADO AUTOMATICAMENTE - GEMINI 2.5 FLASH</p><p style="color:#555;margin:8px 0 0;font-size:11px;">Uso pessoal e educativo. Fontes: PubMed.</p></div></body></html>`;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const geminiKey = process.env.GEMINI_API_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  if (!geminiKey || !resendKey) {
    return NextResponse.json({ error: "Variaveis de ambiente nao configuradas" }, { status: 500 });
  }
  try {
    const noticias = await coletarNoticias();
    if (noticias.length === 0) return NextResponse.json({ message: "Nenhuma noticia encontrada" });
    const conteudo = await processarComGemini(noticias, geminiKey);
    const resend = new Resend(resendKey);
    const { error } = await resend.emails.send({
      from: "Curadoria Medica <onboarding@resend.dev>",
      to: "erianefariadamasia@gmail.com",
      subject: "Resumo Medico Diario - Curadoria Executiva",
      html: montarEmailHTML(conteudo),
    });
    if (error) return NextResponse.json({ error: "Falha ao enviar e-mail", detail: error }, { status: 500 });
    return NextResponse.json({ success: true, noticias: noticias.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
