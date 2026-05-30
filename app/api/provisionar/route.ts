import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

type Feed = { url: string; categoria: string; fonte: string };

interface GeminiConfig {
  feeds: Feed[];
  secoes: string[];
  filtro: { incluir: string[]; excluir: string[] };
  assunto: string;
  tituloEmail: string;
}

async function getGoogleAccessToken(): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json() as { access_token?: string; error?: string };
  if (!data.access_token) throw new Error(`Falha ao obter token Google: ${data.error}`);
  return data.access_token;
}

function buildAppsScript(params: {
  nome: string; email: string; horario: number; geminiKey: string;
  gmailUser: string; config: GeminiConfig;
}): string {
  const { nome, email, horario, geminiKey, gmailUser, config } = params;
  const feedsJson = JSON.stringify(config.feeds, null, 2);
  const secoesJson = JSON.stringify(config.secoes);
  const incluirJson = JSON.stringify(config.filtro.incluir);
  const excluirJson = JSON.stringify(config.filtro.excluir);

  return `// Agente de Curadoria IA — ${nome}
// Gerado automaticamente pelo Portal Vértice

var GEMINI_API_KEY = "${geminiKey}";
var GMAIL_REMETENTE = "${gmailUser}";

var CONFIG = {
  nome: ${JSON.stringify(nome)},
  email: ${JSON.stringify(email)},
  horario: ${horario},
  assunto: ${JSON.stringify(config.assunto)},
  tituloEmail: ${JSON.stringify(config.tituloEmail)},
  feeds: ${feedsJson},
  secoes: ${secoesJson},
  filtro: { incluir: ${incluirJson}, excluir: ${excluirJson} },
};

function setup() {
  ScriptApp.getProjectTriggers().forEach(function(t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger("enviarEmail")
    .timeBased()
    .atHour(CONFIG.horario)
    .everyDays(1)
    .inTimezone("America/Sao_Paulo")
    .create();
  Logger.log("✓ Trigger criado: todos os dias às " + CONFIG.horario + "h (Brasília)");
}

function enviarEmail() {
  var noticias = coletarNoticias();
  if (!noticias.length) { Logger.log("Nenhuma notícia coletada."); return; }
  var conteudo = processarComGemini(noticias);
  var html = montarEmail(conteudo);
  var data = Utilities.formatDate(new Date(), "America/Sao_Paulo", "dd/MM/yyyy");
  GmailApp.sendEmail(CONFIG.email, CONFIG.assunto + " — " + data, "", {
    htmlBody: html,
    name: "Curadoria IA",
    from: GMAIL_REMETENTE,
  });
  Logger.log("✓ Email enviado para " + CONFIG.email);
}

function coletarNoticias() {
  var noticias = [];
  for (var i = 0; i < CONFIG.feeds.length; i++) {
    var feed = CONFIG.feeds[i];
    try {
      var response = UrlFetchApp.fetch(feed.url, {
        muteHttpExceptions: true,
        headers: { "User-Agent": "Mozilla/5.0 (compatible; CuradoriaIA/1.0)" },
      });
      var doc = XmlService.parse(response.getContentText());
      var root = doc.getRootElement();
      var channel = root.getChild("channel");
      if (!channel) continue;
      var items = channel.getChildren("item").slice(0, 8);
      for (var j = 0; j < items.length; j++) {
        var item = items[j];
        var titulo = (item.getChildText("title") || "").replace(/<[^>]*>/g, "").trim();
        var link = (item.getChildText("link") || item.getChildText("guid") || "").trim();
        var desc = (item.getChildText("description") || item.getChildText("summary") || "")
          .replace(/<[^>]*>/g, "").trim().substring(0, 600);
        if (!titulo || !link) continue;
        noticias.push({ titulo: titulo, link: link, descricao: desc, categoria: feed.categoria, fonte: feed.fonte });
      }
    } catch(e) {
      Logger.log("Erro feed " + feed.fonte + ": " + e);
    }
  }
  return noticias;
}

function processarComGemini(noticias) {
  var noticiasTexto = noticias.map(function(n, i) {
    return "[" + (i+1) + "] " + n.categoria + "\\nFonte: " + n.fonte + "\\nTítulo: " + n.titulo + "\\nResumo: " + n.descricao + "\\nLink: " + n.link;
  }).join("\\n\\n---\\n\\n");

  var secoesTexto = CONFIG.secoes.join(", ");
  var incluirTexto = CONFIG.filtro.incluir.join("; ");
  var excluirTexto = CONFIG.filtro.excluir.join("; ");

  var prompt = "Você é um agente de curadoria de conteúdo para " + CONFIG.nome + ".\\n\\n" +
    "TAREFA: Analise os " + noticias.length + " itens abaixo e crie um RESUMO EXECUTIVO em HTML formatado.\\n" +
    "Traduza todo o conteúdo para português brasileiro.\\n\\n" +
    "INCLUA APENAS: " + incluirTexto + "\\n" +
    "EXCLUA: " + excluirTexto + "\\n\\n" +
    "SEÇÕES (use apenas estas): " + secoesTexto + "\\n\\n" +
    "Para cada item: título em negrito, 2-3 linhas objetivas, relevância prática, fonte com link.\\n" +
    "Use HTML com style inline. Cor dos títulos: #9B8559, fundo de seção: #f5f0e8, texto: #333.\\n" +
    "Se nenhum item de uma seção passar no filtro, omita a seção.\\n" +
    "Retorne APENAS o HTML do conteúdo (sem html/head/body tags).\\n\\n" +
    "CONTEÚDO:\\n" + noticiasTexto;

  var payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
  };

  var response = UrlFetchApp.fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + GEMINI_API_KEY,
    { method: "post", contentType: "application/json", payload: JSON.stringify(payload), muteHttpExceptions: true }
  );

  var result = JSON.parse(response.getContentText());
  return (result.candidates && result.candidates[0] && result.candidates[0].content &&
    result.candidates[0].content.parts && result.candidates[0].content.parts[0].text) ||
    "<p>Erro ao gerar conteúdo.</p>";
}

function montarEmail(conteudo) {
  var data = Utilities.formatDate(new Date(), "America/Sao_Paulo", "EEEE, dd 'de' MMMM 'de' yyyy");
  return '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"></head>' +
    '<body style="margin:0;padding:0;background-color:#F9F8F7;font-family:Georgia,serif;">' +
    '<div style="background:linear-gradient(135deg,#9B8559,#b8a07a);padding:30px 40px;text-align:center;">' +
    '<h1 style="color:#fff;margin:0;font-size:22px;letter-spacing:2px;font-weight:normal;">' + CONFIG.tituloEmail + '</h1>' +
    '<p style="color:#F6E6EA;margin:8px 0 0;font-size:13px;">' + CONFIG.nome.toUpperCase() + '</p></div>' +
    '<div style="background:#DDE8E2;padding:12px 40px;text-align:center;">' +
    '<p style="margin:0;color:#4a6741;font-size:13px;">' + data + '</p></div>' +
    '<div style="max-width:700px;margin:0 auto;padding:40px 20px;">' + conteudo + '</div>' +
    '<div style="background:#1a1a1a;padding:25px 40px;text-align:center;margin-top:40px;">' +
    '<p style="color:#9B8559;margin:0;font-size:12px;">RESUMO GERADO AUTOMATICAMENTE — GEMINI 2.5 FLASH</p>' +
    '<p style="color:#555;margin:8px 0 0;font-size:11px;">Vértice Consultoria Estratégica</p></div></body></html>';
}
`;
}

async function appsScriptRequest(path: string, method: string, body: unknown, token: string) {
  const res = await fetch(`https://script.googleapis.com/v1${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json() as Promise<Record<string, unknown>>;
}

export async function POST(request: NextRequest) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const gmailUser = process.env.GMAIL_USER;
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const googleRefreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!geminiKey || !gmailUser) {
    return NextResponse.json({ error: "GEMINI_API_KEY ou GMAIL_USER não configurados." }, { status: 500 });
  }
  if (!googleClientId || !googleClientSecret || !googleRefreshToken) {
    return NextResponse.json({ error: "Credenciais Google não configuradas. Configure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET e GOOGLE_REFRESH_TOKEN no Vercel." }, { status: 500 });
  }

  let nome: string, email: string, horario: number, descricao: string;
  try {
    const body = await request.json() as { nome: string; email: string; horario: number; descricao: string };
    nome = body.nome;
    email = body.email;
    horario = body.horario ?? 20;
    descricao = body.descricao;
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  if (!nome || !email || !descricao) {
    return NextResponse.json({ error: "Campos obrigatórios faltando." }, { status: 400 });
  }

  // 1. Gemini gera a configuração baseada na descrição livre
  let config: GeminiConfig;
  try {
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const prompt = `Analise este perfil profissional e gere uma configuração JSON para curadoria de notícias por email.

PERFIL: ${descricao}
DESTINATÁRIO: ${nome}

Retorne APENAS JSON válido (sem markdown, sem explicações) com esta estrutura exata:
{
  "feeds": [
    {"url": "URL_RSS_VALIDA", "categoria": "Nome da Categoria", "fonte": "Nome da Fonte"}
  ],
  "secoes": ["SEÇÃO 1", "SEÇÃO 2", "SEÇÃO 3"],
  "filtro": {
    "incluir": ["critério 1", "critério 2", "critério 3"],
    "excluir": ["critério 1", "critério 2"]
  },
  "assunto": "Assunto do email",
  "tituloEmail": "TÍTULO DO CABEÇALHO"
}

Regras:
- feeds: 4 a 6 feeds RSS reais e ativos, relevantes para o perfil
- secoes: 3 nomes de seções em maiúsculas, específicos para a área
- filtro.incluir: tipos de conteúdo que interessam ao perfil
- filtro.excluir: tipos de conteúdo a evitar
- assunto e tituloEmail: em português, concisos e profissionais`;

    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    const text = (response.text || "").replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    config = JSON.parse(text) as GeminiConfig;
  } catch (err) {
    return NextResponse.json({ error: `Erro ao gerar configuração com Gemini: ${err instanceof Error ? err.message : String(err)}` }, { status: 500 });
  }

  // 2. Obtém token Google
  let googleToken: string;
  try {
    googleToken = await getGoogleAccessToken();
  } catch (err) {
    return NextResponse.json({ error: `Erro de autenticação Google: ${err instanceof Error ? err.message : String(err)}` }, { status: 500 });
  }

  // 3. Cria projeto no Google Apps Script
  const project = await appsScriptRequest("/projects", "POST", {
    title: `Curadoria IA — ${nome}`,
  }, googleToken);

  if (!project.scriptId) {
    return NextResponse.json({ error: `Falha ao criar script Google: ${JSON.stringify(project)}` }, { status: 500 });
  }

  const scriptId = project.scriptId as string;

  // 4. Faz upload do código
  const scriptCode = buildAppsScript({ nome, email, horario, geminiKey, gmailUser, config });
  await appsScriptRequest(`/projects/${scriptId}/content`, "PUT", {
    files: [
      { name: "Agente", type: "SERVER_JS", source: scriptCode },
      {
        name: "appsscript",
        type: "JSON",
        source: JSON.stringify({
          timeZone: "America/Sao_Paulo",
          dependencies: {},
          exceptionLogging: "STACKDRIVER",
          runtimeVersion: "V8",
          oauthScopes: [
            "https://www.googleapis.com/auth/gmail.send",
            "https://www.googleapis.com/auth/script.scriptapp",
            "https://www.googleapis.com/auth/script.external_request",
          ],
        }),
      },
    ],
  }, googleToken);

  // 5. Tenta criar trigger automaticamente via deploy + run
  let autoTrigger = false;
  try {
    const version = await appsScriptRequest(`/projects/${scriptId}/versions`, "POST", { description: "v1" }, googleToken);
    if (version.versionNumber) {
      await appsScriptRequest(`/projects/${scriptId}/deployments`, "POST", {
        versionNumber: version.versionNumber,
        manifestFileName: "appsscript",
        description: "deploy",
      }, googleToken);

      const runRes = await fetch(`https://script.googleapis.com/v1/scripts/${scriptId}:run`, {
        method: "POST",
        headers: { Authorization: `Bearer ${googleToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ function: "setup", devMode: true }),
      });
      const runData = await runRes.json() as Record<string, unknown>;
      if (!runData.error) autoTrigger = true;
    }
  } catch (e) {
    console.error("Auto-trigger falhou (normal):", e);
  }

  const scriptUrl = `https://script.google.com/d/${scriptId}/edit`;
  return NextResponse.json({
    success: true,
    scriptUrl,
    titulo: config.tituloEmail,
    email,
    horario,
    autoTrigger,
  });
}
