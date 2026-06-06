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

function buildAppsScript(params: {
  nome: string; email: string; horario: number; geminiKey: string;
  gmailUser: string; config: GeminiConfig;
}): string {
  const { nome, email, horario, geminiKey, gmailUser, config } = params;

  return `// Agente de Curadoria IA — ${nome}
// Gerado pelo Portal Vértice
// Para ativar: clique em Run > setup

var GEMINI_API_KEY = "${geminiKey}";
var GMAIL_REMETENTE = "${gmailUser}";

var CONFIG = {
  nome: ${JSON.stringify(nome)},
  email: ${JSON.stringify(email)},
  horario: ${horario},
  assunto: ${JSON.stringify(config.assunto)},
  tituloEmail: ${JSON.stringify(config.tituloEmail)},
  feeds: ${JSON.stringify(config.feeds, null, 2)},
  secoes: ${JSON.stringify(config.secoes)},
  filtro: {
    incluir: ${JSON.stringify(config.filtro.incluir)},
    excluir: ${JSON.stringify(config.filtro.excluir)},
  },
};

// Execute esta função UMA VEZ para ativar o envio diário automático
function setup() {
  ScriptApp.getProjectTriggers().forEach(function(t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger("enviarEmail")
    .timeBased()
    .atHour(CONFIG.horario)
    .everyDays(1)
    .inTimezone("America/Sao_Paulo")
    .create();
  Logger.log("Trigger criado: todos os dias às " + CONFIG.horario + "h (Brasília)");
  Logger.log("Emails serão enviados para: " + CONFIG.email);
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
  Logger.log("Email enviado para " + CONFIG.email);
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

  var prompt = "Você é um agente de curadoria para " + CONFIG.nome + ".\\n\\n" +
    "TAREFA: Analise os " + noticias.length + " itens e crie um RESUMO EXECUTIVO em HTML.\\n" +
    "Traduza tudo para português brasileiro.\\n\\n" +
    "INCLUA: " + CONFIG.filtro.incluir.join("; ") + "\\n" +
    "EXCLUA: " + CONFIG.filtro.excluir.join("; ") + "\\n\\n" +
    "SEÇÕES: " + CONFIG.secoes.join(", ") + "\\n\\n" +
    "Para cada item: título em negrito, 2-3 linhas objetivas, relevância prática, fonte com link clicável.\\n" +
    "Use HTML com style inline. Cor dos títulos de seção: #9B8559, fundo de seção: #f5f0e8, texto: #333.\\n" +
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
  return (result.candidates && result.candidates[0] &&
    result.candidates[0].content.parts[0].text) || "<p>Erro ao gerar conteúdo.</p>";
}

function montarEmail(conteudo) {
  var data = Utilities.formatDate(new Date(), "America/Sao_Paulo", "EEEE, dd 'de' MMMM 'de' yyyy");
  var logo = "https://raw.githubusercontent.com/lcunhapereira-droid/disparo-de-email/main/public/logo-vertice-dark.png";
  return '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"></head>' +
    '<body style="margin:0;padding:0;background-color:#F9F8F7;font-family:Georgia,serif;">' +
    '<div style="background:linear-gradient(135deg,#9B8559,#b8a07a);padding:24px 40px 20px;text-align:center;">' +
    '<img src="' + logo + '" alt="Vértice Consultoria Estratégica" style="height:64px;width:auto;margin-bottom:12px;display:block;margin-left:auto;margin-right:auto;" />' +
    '<h1 style="color:#fff;margin:0;font-size:20px;letter-spacing:2px;font-weight:normal;">' + CONFIG.tituloEmail + '</h1>' +
    '<p style="color:#F6E6EA;margin:8px 0 0;font-size:12px;">' + CONFIG.nome.toUpperCase() + '</p></div>' +
    '<div style="background:#DDE8E2;padding:12px 40px;text-align:center;">' +
    '<p style="margin:0;color:#4a6741;font-size:13px;">' + data + '</p></div>' +
    '<div style="max-width:700px;margin:0 auto;padding:40px 20px;">' + conteudo + '</div>' +
    '<div style="background:#1a1a1a;padding:25px 40px;text-align:center;margin-top:40px;">' +
    '<img src="' + logo + '" alt="Vértice" style="height:36px;width:auto;margin-bottom:12px;opacity:0.7;" />' +
    '<p style="color:#9B8559;margin:0;font-size:12px;">VÉRTICE CONSULTORIA ESTRATÉGICA</p></div></body></html>';
}
`;
}

export async function POST(request: NextRequest) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const gmailUser = process.env.GMAIL_USER;

  if (!geminiKey || !gmailUser) {
    return NextResponse.json({ error: "GEMINI_API_KEY ou GMAIL_USER não configurados." }, { status: 500 });
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

  // Gemini gera a configuração baseada na descrição livre
  let config: GeminiConfig;
  try {
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const prompt = `Analise este perfil e gere uma configuração JSON para curadoria de notícias por email.

PERFIL: ${descricao}
DESTINATÁRIO: ${nome}

Retorne APENAS JSON válido (sem markdown, sem explicações) com esta estrutura:
{
  "feeds": [
    {"url": "URL_RSS_REAL", "categoria": "Categoria", "fonte": "Nome da Fonte"}
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
- feeds: 4 a 6 feeds RSS reais e funcionais, relevantes para o perfil
- secoes: 3 nomes de seções em maiúsculas, específicos para a área
- filtro.incluir: tipos de conteúdo relevantes para este profissional
- filtro.excluir: tipos de conteúdo a evitar (publicidade, eventos, etc.)
- assunto e tituloEmail: em português, concisos e profissionais`;

    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    const text = (response.text || "").replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    config = JSON.parse(text) as GeminiConfig;
  } catch (err) {
    return NextResponse.json({ error: `Erro ao gerar configuração: ${err instanceof Error ? err.message : String(err)}` }, { status: 500 });
  }

  const scriptCode = buildAppsScript({ nome, email, horario, geminiKey, gmailUser, config });

  return NextResponse.json({
    success: true,
    scriptCode,
    tituloEmail: config.tituloEmail,
    assunto: config.assunto,
    email,
    horario,
  });
}
