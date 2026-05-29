import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import { parseStringPromise } from "xml2js";
import { Resend } from "resend";

const RSS_FEEDS = [
  { url: "https://www.sciencedaily.com/rss/health_medicine/obesity.xml", especialidade: "Endocrinologia", fonte: "ScienceDaily - Obesidade e Metabolismo" },
  { url: "https://www.sciencedaily.com/rss/health_medicine/menopause.xml", especialidade: "Ginecologia", fonte: "ScienceDaily - Menopausa e Climaterio" },
  { url: "https://www.sciencedaily.com/rss/health_medicine/skin_care.xml", especialidade: "Dermatologia", fonte: "ScienceDaily - Dermatologia" },
  { url: "https://www.nejm.org/action/showFeed?jc=nejm&type=etoc&feed=rss", especialidade: "Medicina Geral", fonte: "New England Journal of Medicine" },
  { url: "https://www.bmj.com/rss/current.xml", especialidade: "Medicina Geral", fonte: "British Medical Journal" },
  { url: "https://jamanetwork.com/rss/site_3/68.xml", especialidade: "Dermatologia", fonte: "JAMA Dermatology" },
  { url: "https://www.thelancet.com/rssfeed/lancet_online.xml", especialidade: "Medicina Geral", fonte: "The Lancet" },
  { url: "https://www.thelancet.com/rssfeed/landef_online.xml", especialidade: "Endocrinologia", fonte: "The Lancet Diabetes & Endocrinology" },
];

type Noticia = { titulo: string; link: string; descricao: string; especialidade: string; fonte: string };

async function coletarNoticias(): Promise<Noticia[]> {
  const noticias: Noticia[] = [];
  for (const feed of RSS_FEEDS) {
    try {
      const response = await axios.get(feed.url, { timeout: 15000, headers: { "User-Agent": "Mozilla/5.0 (compatible; AutomacaoMedica/1.0)" } });
      const resultado = await parseStringPromise(response.data, { explicitArray: false });
      const itens = resultado?.rss?.channel?.item || [];
      const lista = Array.isArray(itens) ? itens : [itens];
      for (const item of lista.slice(0, 8)) {
        const titulo = String(item.title || "").replace(/<[^>]*>/g, "").trim();
        const link = String(item.link || item.guid || "").trim();
        const descricao = String(item.description || item.summary || "").replace(/<[^>]*>/g, "").trim().substring(0, 600);
        if (!link || !titulo) continue;
        noticias.push({ titulo, link, descricao, especialidade: feed.especialidade, fonte: feed.fonte });
      }
    } catch { console.error(`Erro no feed ${feed.fonte}`); }
  }
  return noticias;
}

async function processarComGemini(noticias: Noticia[], apiKey: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });
  const noticiasTexto = noticias.map((n, i) =>
    `[${i + 1}] ESPECIALIDADE: ${n.especialidade}\nFONTE: ${n.fonte}\nTITULO: ${n.titulo}\nRESUMO: ${n.descricao}\nLINK: ${n.link}`
  ).join("\n\n---\n\n");

  const prompt = `Voce e uma curadora cientifica para a Dra. Eriane Faria, medica especialista em Saude Feminina e Funcional (CRM MG 100709), Belo Horizonte.\n\nTAREFA: Analise os ${noticias.length} artigos abaixo e crie um RESUMO EXECUTIVO em HTML formatado e elegante.\n\nFILTRO RIGOROSO - INCLUA APENAS:\n- Estudos clinicos randomizados (RCTs)\n- Meta-analises e revisoes sistematicas\n- Estudos clinicos com resultados relevantes para pratica medica\n- Diretrizes e consensos de sociedades medicas\n- Pesquisas com impacto direto no manejo de pacientes\n\nEXCLUA COMPLETAMENTE:\n- Editoriais, cartas ao editor, opinoes\n- Noticias institucionais, eventos, congressos, chamadas de trabalhos\n- Obituarios, homenagens, premiacoes\n- Conteudo promocional ou comercial\n- Estudos apenas em animais ou in vitro sem aplicacao clinica clara\n- Qualquer conteudo sem relevancia clinica direta\n\nORGANIZACAO DO EMAIL (apenas as 3 secoes abaixo):\n1. ENDOCRINOLOGIA E METABOLISMO (emagrecimento, obesidade, diabetes, tireoide)\n2. GINECOLOGIA, SAUDE DA MULHER E MENOPAUSA\n3. DERMATOLOGIA ESTETICA\n\nFORMATO DE CADA ARTIGO SELECIONADO:\n- Titulo traduzido para portugues brasileiro (em negrito)\n- Principais achados clinicos (2-3 linhas objetivas)\n- Relevancia pratica para a consulta\n- Nivel de evidencia (Ex: Meta-analise | Estudo Clinico | Revisao Sistematica)\n- Fonte: [nome da revista] com link clicavel\n\nUSE HTML limpo com style inline. Cores: titulos de secao em #9B8559, fundo de secao em #f5f0e8, texto em #333.\nSe nenhum artigo de uma secao passar no filtro, omita a secao.\nAo final inclua: "Total de artigos analisados: ${noticias.length}"\n\nARTIGOS PARA ANALISE:\n${noticiasTexto}\n\nRetorne APENAS o HTML do conteudo principal (sem html, head ou body tags).`;

  const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
  return response.text || "<p>Nao foi possivel gerar o resumo.</p>";
}

function montarEmailHTML(conteudo: string): string {
  const dataHoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "America/Sao_Paulo" });
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background-color:#F9F8F7;font-family:Georgia,serif;"><div style="background:linear-gradient(135deg,#9B8559,#b8a07a);padding:30px 40px;text-align:center;"><h1 style="color:#fff;margin:0;font-size:22px;letter-spacing:2px;font-weight:normal;">CURADORIA CIENTIFICA</h1><p style="color:#F6E6EA;margin:8px 0 0;font-size:13px;">DRA. ERIANE FARIA - SAUDE FEMININA E FUNCIONAL - CRM MG 100709</p></div><div style="background:#DDE8E2;padding:12px 40px;text-align:center;"><p style="margin:0;color:#4a6741;font-size:13px;">${dataHoje}</p></div><div style="max-width:700px;margin:0 auto;padding:40px 20px;">${conteudo}</div><div style="background:#1a1a1a;padding:25px 40px;text-align:center;margin-top:40px;"><p style="color:#9B8559;margin:0;font-size:12px;">RESUMO GERADO AUTOMATICAMENTE - GEMINI 2.5 FLASH</p><p style="color:#555;margin:8px 0 0;font-size:11px;">Uso pessoal e educativo. Fontes: ScienceDaily, NEJM, BMJ, JAMA, The Lancet.</p></div></body></html>`;
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
    if (noticias.length === 0) return NextResponse.json({ message: "Nenhuma noticia encontrada nos feeds" });
    const conteudo = await processarComGemini(noticias, geminiKey);
    const resend = new Resend(resendKey);
    const { error } = await resend.emails.send({
      from: "Curadoria Medica <onboarding@resend.dev>",
      to: "erianefariadamasia@gmail.com",
      subject: `Curadoria Cientifica - ${new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}`,
      html: montarEmailHTML(conteudo),
    });
    if (error) return NextResponse.json({ error: "Falha ao enviar e-mail", detail: error }, { status: 500 });
    return NextResponse.json({ success: true, noticias: noticias.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
