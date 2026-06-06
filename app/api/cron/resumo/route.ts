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
      for (const item of lista.slice(0, 15)) {
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
  const { identidade, secoes, filtro, idiomaSaida, visual, promptCustom } = CONFIG as typeof CONFIG & { promptCustom?: string };

  const noticiasTexto = noticias.map((n, i) =>
    `[${i + 1}] CATEGORIA: ${n.categoria}\nFONTE: ${n.fonte}\nTITULO: ${n.titulo}\nRESUMO: ${n.descricao}\nLINK: ${n.link}`
  ).join("\n\n---\n\n");

  const secoesTexto = secoes.map((s, i) => `${i + 1}. ${s}`).join("\n");
  const incluirTexto = filtro.incluir.map(i => `- ${i}`).join("\n");
  const excluirTexto = filtro.excluir.map(e => `- ${e}`).join("\n");

  const contexto = promptCustom || `Voce e um agente de curadoria de conteudo para ${identidade.nomeDestinatario}, ${identidade.descricaoProfissional}, ${identidade.localidade}.`;

  const prompt = `${contexto}\n\nTAREFA: Analise os ${noticias.length} itens abaixo e crie um RESUMO EXECUTIVO em HTML de newsletter profissional.\nTraduza todo o conteudo para ${idiomaSaida}.\n\nFILTRO DE QUALIDADE - INCLUA APENAS:\n${incluirTexto}\n\nEXCLUA COMPLETAMENTE:\n${excluirTexto}\n\nORGANIZACAO (use apenas as secoes abaixo, maximo 5 artigos por secao):\n${secoesTexto}\n\nFORMATO HTML OBRIGATORIO:\nPara cada SECAO use este padrao:\n<div style="margin-bottom:32px;">\n  <div style="background:${visual.corPrimaria};padding:10px 20px;margin-bottom:0;">\n    <span style="color:#fff;font-size:11px;letter-spacing:4px;font-family:Arial,sans-serif;font-weight:bold;">NOME DA SECAO</span>\n  </div>\n  <!-- Para cada artigo dentro da secao: -->\n  <div style="border-left:4px solid ${visual.corPrimaria};background:#fff;padding:16px 20px;margin-bottom:8px;border-bottom:1px solid #eee;">\n    <a href="LINK" style="color:#1a1a1a;font-size:14px;font-weight:bold;text-decoration:none;font-family:Georgia,serif;line-height:1.4;">TITULO EM ${idiomaSaida}</a>\n    <p style="color:#555;font-size:12px;line-height:1.7;margin:8px 0 6px;font-family:Arial,sans-serif;">RESUMO DE 2-3 LINHAS OBJETIVAS COM RELEVANCIA CLINICA</p>\n    <span style="color:${visual.corPrimaria};font-size:10px;letter-spacing:2px;font-family:Arial,sans-serif;">FONTE: NOME DA FONTE</span>\n  </div>\n</div>\n\nSe nenhum item de uma secao passar no filtro, omita a secao completamente.\nAo final adicione: <p style="color:#999;font-size:10px;font-family:Arial,sans-serif;text-align:right;border-top:1px solid #eee;padding-top:12px;margin-top:24px;">Total de itens analisados: ${noticias.length}</p>\n\nCONTEUDO PARA ANALISE:\n${noticiasTexto}\n\nRetorne APENAS o HTML do conteudo (sem html, head ou body tags).`;

  const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
  return response.text || "<p>Nao foi possivel gerar o resumo.</p>";
}

function montarEmailHTML(conteudo: string): string {
  const { identidade, visual } = CONFIG;
  const logoUrl = "https://disparo-de-email.vercel.app/logo-vertice.png";
  const dataHoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "America/Sao_Paulo" });
  const edicao = `Edição ${new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Sao_Paulo" })}`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#EDEAE4;font-family:Georgia,'Times New Roman',serif;">
<div style="max-width:680px;margin:0 auto;">

  <!-- CABEÇALHO -->
  <div style="background:#0a0a0a;padding:32px 40px 24px;text-align:center;">
    <img src="${logoUrl}" alt="Vértice" style="height:70px;width:auto;display:block;margin:0 auto 20px;" />
    <div style="border-top:1px solid #333;border-bottom:1px solid #333;padding:12px 0;margin-bottom:16px;">
      <div style="color:${visual.corPrimaria};font-size:11px;letter-spacing:5px;font-family:Arial,sans-serif;">${identidade.tituloEmail}</div>
    </div>
    <div style="color:#888;font-size:11px;letter-spacing:2px;font-family:Arial,sans-serif;">${identidade.nomeDestinatario.toUpperCase()} &nbsp;·&nbsp; ${identidade.identificacao}</div>
  </div>

  <!-- FAIXA DE DATA -->
  <div style="background:${visual.corPrimaria};padding:10px 40px;display:flex;justify-content:space-between;align-items:center;">
    <span style="color:#fff;font-size:12px;font-family:Arial,sans-serif;text-transform:capitalize;">${dataHoje}</span>
    <span style="color:rgba(255,255,255,0.7);font-size:11px;font-family:Arial,sans-serif;">${edicao}</span>
  </div>

  <!-- DESTAQUE EDITORIAL -->
  <div style="background:#fff;border-left:5px solid ${visual.corPrimaria};margin:24px 20px 0;padding:20px 24px;">
    <div style="color:${visual.corPrimaria};font-size:10px;letter-spacing:3px;font-family:Arial,sans-serif;margin-bottom:8px;">NOTA EDITORIAL</div>
    <p style="margin:0;color:#555;font-size:13px;line-height:1.6;font-style:italic;">Curadoria científica selecionada para a prática clínica em Saúde Feminina e Medicina Funcional. Fontes: PubMed, The Lancet, NEJM, JAMA, BMJ, Nature Medicine, Cochrane, OMS e NIH.</p>
  </div>

  <!-- CONTEÚDO PRINCIPAL -->
  <div style="background:#fff;margin:16px 20px 0;padding:32px 32px 16px;">
    ${conteudo}
  </div>

  <!-- RODAPÉ -->
  <div style="background:#0a0a0a;padding:28px 40px;text-align:center;margin-top:0;">
    <img src="${logoUrl}" alt="Vértice" style="height:44px;width:auto;opacity:0.5;margin-bottom:16px;" />
    <div style="color:${visual.corPrimaria};font-size:11px;letter-spacing:3px;font-family:Arial,sans-serif;margin-bottom:6px;">VÉRTICE CONSULTORIA ESTRATÉGICA</div>
    <div style="color:#444;font-size:10px;font-family:Arial,sans-serif;">${identidade.localidade}</div>
  </div>

</div>
</body>
</html>`;
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
