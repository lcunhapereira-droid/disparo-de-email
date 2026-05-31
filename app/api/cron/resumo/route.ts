import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import { parseStringPromise } from "xml2js";
import nodemailer from "nodemailer";
import { CONFIG } from "../../../../config";

type Noticia = { titulo: string; link: string; descricao: string; categoria: string; fonte: string };

async function coletarNoticias(): Promise<Noticia[]> {
  const noticias: Noticia[] = [];
  for (const feed of CONFIG.feeds) {
    try {
      const response = await axios.get(feed.url, { timeout: 15000, headers: { "User-Agent": "Mozilla/5.0 (compatible; CuradoriaIA/1.0)" } });
      const resultado = await parseStringPromise(response.data, { explicitArray: false });
      const itens = resultado?.rss?.channel?.item || [];
      const lista = Array.isArray(itens) ? itens : [itens];
      for (const item of lista.slice(0, 8)) {
        const titulo = String(item.title || "").replace(/<[^>]*>/g, "").trim();
        const link = String(item.link || item.guid || "").trim();
        const descricao = String(item.description || item.summary || "").replace(/<[^>]*>/g, "").trim().substring(0, 600);
        if (!link || !titulo) continue;
        noticias.push({ titulo, link, descricao, categoria: feed.categoria, fonte: feed.fonte });
      }
    } catch { console.error(`Erro no feed ${feed.fonte}`); }
  }
  return noticias;
}

async function processarComGemini(noticias: Noticia[], apiKey: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });
  const { identidade, secoes, filtro, idiomaSaida, visual } = CONFIG;

  const noticiasTexto = noticias.map((n, i) =>
    `[${i + 1}] CATEGORIA: ${n.categoria}\nFONTE: ${n.fonte}\nTITULO: ${n.titulo}\nRESUMO: ${n.descricao}\nLINK: ${n.link}`
  ).join("\n\n---\n\n");

  const secoesTexto = secoes.map((s, i) => `${i + 1}. ${s}`).join("\n");
  const incluirTexto = filtro.incluir.map(i => `- ${i}`).join("\n");
  const excluirTexto = filtro.excluir.map(e => `- ${e}`).join("\n");
  const identificacao = identidade.identificacao ? ` (${identidade.identificacao})` : "";

  const prompt = `Voce e um agente de curadoria de conteudo para ${identidade.nomeDestinatario}, ${identidade.descricaoProfissional}${identificacao}, ${identidade.localidade}.\n\nTAREFA: Analise os ${noticias.length} itens abaixo e crie um RESUMO EXECUTIVO em HTML formatado e elegante.\nTraduza todo o conteudo para ${idiomaSaida}.\n\nFILTRO DE QUALIDADE - INCLUA APENAS:\n${incluirTexto}\n\nEXCLUA COMPLETAMENTE:\n${excluirTexto}\n\nORGANIZACAO (use apenas as secoes abaixo):\n${secoesTexto}\n\nFORMATO DE CADA ITEM SELECIONADO:\n- Titulo em ${idiomaSaida} (em negrito)\n- Principais pontos (2-3 linhas objetivas)\n- Relevancia pratica para ${identidade.nomeDestinatario}\n- Fonte: [nome] com link clicavel\n\nUSE HTML limpo com style inline.\nCor dos titulos de secao: ${visual.corPrimaria}, fundo de secao: #f5f0e8, texto: #333.\nSe nenhum item de uma secao passar no filtro, omita a secao.\nAo final inclua: "Total de itens analisados: ${noticias.length}"\n\nCONTEUDO PARA ANALISE:\n${noticiasTexto}\n\nRetorne APENAS o HTML do conteudo principal (sem html, head ou body tags).`;

  const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
  return response.text || "<p>Nao foi possivel gerar o resumo.</p>";
}

function montarEmailHTML(conteudo: string): string {
  const { identidade, visual } = CONFIG;
  const dataHoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "America/Sao_Paulo" });
  const subtitulo = [identidade.nomeDestinatario, identidade.descricaoProfissional, identidade.identificacao].filter(Boolean).join(" — ");
  const logoUrl = "https://disparo-de-email.vercel.app/logo-vertice.svg";
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background-color:${visual.corFundo};font-family:Georgia,serif;">\n<div style="background:linear-gradient(135deg,${visual.corPrimaria},${visual.corSecundaria});padding:24px 40px 20px;text-align:center;">\n  <img src="${logoUrl}" alt="Vértice Consultoria Estratégica" style="height:64px;width:auto;margin-bottom:12px;display:block;margin-left:auto;margin-right:auto;" />\n  <h1 style="color:#fff;margin:0;font-size:20px;letter-spacing:2px;font-weight:normal;">${identidade.tituloEmail}</h1>\n  <p style="color:${visual.corBannerTexto};margin:8px 0 0;font-size:12px;">${subtitulo.toUpperCase()}</p>\n</div>\n<div style="background:${visual.corDataFundo};padding:12px 40px;text-align:center;">\n  <p style="margin:0;color:${visual.corDataTexto};font-size:13px;">${dataHoje}</p>\n</div>\n<div style="max-width:700px;margin:0 auto;padding:40px 20px;">${conteudo}</div>\n<div style="background:${visual.corRodape};padding:25px 40px;text-align:center;margin-top:40px;">\n  <img src="${logoUrl}" alt="Vértice" style="height:36px;width:auto;margin-bottom:12px;opacity:0.7;" />\n  <p style="color:${visual.corPrimaria};margin:0;font-size:12px;">RESUMO GERADO AUTOMATICAMENTE — GEMINI 2.5 FLASH</p>\n  <p style="color:#555;margin:8px 0 0;font-size:11px;">Vértice Consultoria Estratégica</p>\n</div></body></html>`;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const querySecret = request.nextUrl.searchParams.get("secret");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}` && querySecret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const geminiKey = process.env.GEMINI_API_KEY;
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  if (!geminiKey || !gmailUser || !gmailPass) {
    return NextResponse.json({ error: "Variaveis de ambiente nao configuradas" }, { status: 500 });
  }
  try {
    const noticias = await coletarNoticias();
    if (noticias.length === 0) return NextResponse.json({ message: "Nenhuma noticia encontrada nos feeds" });
    const conteudo = await processarComGemini(noticias, geminiKey);
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: gmailUser, pass: gmailPass },
    });
    await transporter.sendMail({
      from: `Curadoria IA <${gmailUser}>`,
      to: CONFIG.email.destinatario,
      subject: `${CONFIG.email.assunto} - ${new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}`,
      html: montarEmailHTML(conteudo),
    });
    return NextResponse.json({ success: true, noticias: noticias.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
