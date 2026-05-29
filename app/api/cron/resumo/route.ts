import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import { parseStringPromise } from "xml2js";
import { Resend } from "resend";

// Apenas feeds confirmados funcionando
const RSS_FEEDS = [
  { url: "https://www.sciencedaily.com/rss/health_medicine/obesity.xml", especialidade: "Endocrinologia", fonte: "ScienceDaily - Obesidade e Metabolismo" },
  { url: "https://www.sciencedaily.com/rss/health_medicine/menopause.xml", especialidade: "Ginecologia", fonte: "ScienceDaily - Menopausa e Climaterio" },
  { url: "https://www.sciencedaily.com/rss/health_medicine/skin_care.xml", especialidade: "Dermatologia", fonte: "ScienceDaily - Dermatologia" },
  { url: "https://www.nejm.org/action/showFeed?jc=nejm&type=etoc&feed=rss", especialidade: "Medicina Geral", fonte: "NEJM" },
  { url: "https://www.bmj.com/rss/current.xml", especialidade: "Medicina Geral", fonte: "BMJ" },
  { url: "https://jamanetwork.com/rss/site_3/68.xml", especialidade: "Dermatologia", fonte: "JAMA Dermatology" },
  { url: "https://www.thelancet.com/rssfeed/lancet_online.xml", especialidade: "Medicina Geral", fonte: "The Lancet" },
  { url: "https://www.thelancet.com/rssfeed/landef_online.xml", especialidade: "Endocrinologia", fonte: "The Lancet Diabetes & Endocrinology" },
];

type Noticia = { titulo: string; link: string; descricao: string; especialidade: string; fonte: string };

async function coletarNoticias(): Promise<Noticia[]> {
  const noticias: Noticia[] = [];
  for (const feed of RSS_FEEDS) {
    try {
      const response = await axios.get(feed.url, {
        timeout: 8000,
        headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/rss+xml, */*" },
      });
      const resultado = await parseStringPromise(response.data, { explicitArray: false });
      const itens = resultado?.rss?.channel?.item || resultado?.feed?.entry || [];
      const lista = Array.isArray(itens) ? itens : [itens];
      for (const item of lista.slice(0, 5)) {
        const titulo = String(item.title?.["_"] || item.title || "").replace(/<[^>]*>/g, "").trim();
        const link = String(item.link?.$.href || item.link || item.guid || "").trim();
        const descricao = String(item.description || item.summary?.["_"] || item.summary || "").replace(/<[^>]*>/g, "").trim().substring(0, 500);
        if (!link || !titulo) continue;
        noticias.push({ titulo, link, descricao, especialidade: feed.especialidade, fonte: feed.fonte });
      }
    } catch (err) {
      console.error(`Erro ${feed.fonte}:`, err instanceof Error ? err.message : err);
    }
  }
  return noticias;
}

async function processarComGemini(noticias: Noticia[], apiKey: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });
  const noticiasTexto = noticias
    .map((n, i) => `[${i + 1}]\nEspecialidade: ${n.especialidade}\nFonte: ${n.fonte}\nTitulo: ${n.titulo}\nResumo: ${n.descricao}\nLink: ${n.link}`)
    .join("\n\n---\n\n");

  const prompt = `Voce e a curadora cientifica pessoal da Dra. Eriane Faria, medica especialista em Saude Feminina e Funcional (CRM MG 100709), Belo Horizonte, Brasil.

TAREFA: Analisar as noticias abaixo e produzir um BOLETIM CIENTIFICO DIARIO de alto valor clinico.

CRITERIOS DE SELECAO RIGOROSOS — inclua APENAS noticias que:
- Sejam estudos clinicos, ensaios randomizados, meta-analises ou revisoes sistematicas
- Tenham relevancia direta para a pratica clinica em Endocrinologia, Ginecologia ou Dermatologia Estetica
- Sejam publicacoes originais de fontes cientificas reconhecidas
- NAO sejam: editoriais de opiniao, noticias institucionais, anuncios, chamadas de congresso, obituarios ou conteudo promocional
- NAO repita informacoes ja conhecidas sem novidade cientifica

Se uma noticia nao atender aos criterios acima, IGNORE completamente.

PARA CADA NOTICIA SELECIONADA inclua:
- Titulo traduzido para portugues brasileiro em destaque
- O que foi estudado e o que foi descoberto
- Por que isso importa na pratica clinica da Dra. Eriane
- Nivel de evidencia (ex: Ensaio clinico randomizado, Meta-analise, Estudo observacional)
- Fonte com link clicavel

ORGANIZE em 3 secoes:
1. Endocrinologia e Metabolismo
2. Ginecologia, Saude da Mulher e Menopausa
3. Dermatologia Estetica

USE HTML elegante com style inline. Tipografia profissional. Se nenhuma noticia for relevante em uma secao, omita a secao.

NOTICIAS PARA ANALISAR:
${noticiasTexto}

Retorne APENAS o HTML do conteudo (sem html, head ou body).`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  return response.text || "<p>Nenhuma noticia relevante encontrada hoje.</p>";
}

function montarEmailHTML(conteudo: string, totalNoticias: number): string {
  const dataHoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "America/Sao_Paulo" });
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F9F8F7;font-family:Georgia,serif;">
<div style="background:linear-gradient(135deg,#9B8559,#b8a07a);padding:30px 40px;text-align:center;">
  <h1 style="color:#fff;margin:0;font-size:22px;letter-spacing:2px;font-weight:normal;">CURADORIA CIENTIFICA DIARIA</h1>
  <p style="color:#F6E6EA;margin:8px 0 0;font-size:13px;">DRA. ERIANE FARIA &middot; SAUDE FEMININA E FUNCIONAL &middot; CRM MG 100709</p>
</div>
<div style="background:#DDE8E2;padding:12px 40px;text-align:center;">
  <p style="margin:0;color:#4a6741;font-size:13px;text-transform:capitalize;">${dataHoje}</p>
</div>
<div style="max-width:700px;margin:0 auto;padding:40px 20px;">
  ${conteudo}
</div>
<div style="background:#1a1a1a;padding:25px 40px;text-align:center;margin-top:40px;">
  <p style="color:#9B8559;margin:0;font-size:12px;">CURADORIA AUTOMATICA &middot; GEMINI 2.5 FLASH &middot; ${totalNoticias} FONTES ANALISADAS</p>
  <p style="color:#666;margin:8px 0 0;font-size:11px;">NEJM &middot; The Lancet &middot; JAMA &middot; BMJ &middot; ScienceDaily</p>
  <p style="color:#555;margin:6px 0 0;font-size:10px;">Uso pessoal e educativo. Sempre consulte as fontes originais.</p>
</div>
</body></html>`;
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
    console.log(`${noticias.length} noticias coletadas`);
    if (noticias.length === 0) {
      return NextResponse.json({ message: "Nenhuma noticia encontrada nos feeds" });
    }
    const conteudo = await processarComGemini(noticias, geminiKey);
    const resend = new Resend(resendKey);
    const { error } = await resend.emails.send({
      from: "Curadoria Medica <onboarding@resend.dev>",
      to: "erianefariadamasia@gmail.com",
      subject: `Curadoria Cientifica - ${new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}`,
      html: montarEmailHTML(conteudo, noticias.length),
    });
    if (error) {
      return NextResponse.json({ error: "Falha ao enviar e-mail", detail: error }, { status: 500 });
    }
    return NextResponse.json({ success: true, noticias: noticias.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Erro:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
