// Agente de Curadoria IA — Leonardo Cunha Pereira
// Newsletter: Inteligência Artificial — Modelos, Agentes & Ferramentas
// Para ativar: execute a função setup() uma única vez

var GEMINI_API_KEY = "AIzaSyCzfeYjLd-DXud6sYo9gf9bFe6mhW9FEHk";
var GMAIL_REMETENTE = "lcunhapereira@gmail.com";

var CONFIG = {
  nome: "Leonardo Cunha Pereira",
  email: "lcunhapereira@yahoo.com.br",
  horario: 8,
  assunto: "Curadoria IA — Modelos, Agentes & Ferramentas",
  tituloEmail: "CURADORIA IA",
  feeds: [
    { url: "https://openai.com/blog/rss.xml", categoria: "Novos Modelos", fonte: "OpenAI Blog" },
    { url: "https://huggingface.co/blog/feed.xml", categoria: "Novos Modelos", fonte: "HuggingFace Blog" },
    { url: "https://blog.google/technology/ai/rss/", categoria: "Novos Modelos", fonte: "Google AI Blog" },
    { url: "https://www.marktechpost.com/feed/", categoria: "Ferramentas Gratuitas", fonte: "MarkTechPost" },
    { url: "https://towardsdatascience.com/feed", categoria: "Tutoriais", fonte: "Towards Data Science" },
    { url: "https://pub.towardsai.net/feed", categoria: "Pesquisa", fonte: "Towards AI" },
    { url: "https://venturebeat.com/category/ai/feed/", categoria: "Novos Modelos", fonte: "VentureBeat AI" },
    { url: "https://techcrunch.com/category/artificial-intelligence/feed/", categoria: "Novos Agentes", fonte: "TechCrunch AI" },
    { url: "https://the-decoder.com/feed/", categoria: "Novos Modelos", fonte: "The Decoder" },
    { url: "https://simonwillison.net/atom/everything/", categoria: "MCP Servers & Agentes", fonte: "Simon Willison" },
  ],
};

// Execute UMA VEZ para ativar o envio diário automático
function setup() {
  ScriptApp.getProjectTriggers().forEach(function(t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger("enviarEmail")
    .timeBased()
    .atHour(CONFIG.horario)
    .everyDays(1)
    .inTimezone("America/Sao_Paulo")
    .create();
  Logger.log("✅ Trigger criado: todos os dias às " + CONFIG.horario + "h (Brasília)");
  Logger.log("📧 Emails serão enviados para: " + CONFIG.email);
}

function enviarEmail() {
  var noticias = coletarNoticias();
  Logger.log("Total de notícias coletadas: " + noticias.length);
  if (!noticias.length) {
    Logger.log("Nenhuma notícia coletada.");
    return;
  }
  var selecionadas = selecionarComGemini(noticias);
  Logger.log("Artigos selecionados: " + selecionadas.length);
  var conteudo = montarConteudoHTML(selecionadas);
  var html = montarEmail(conteudo);
  var data = Utilities.formatDate(new Date(), "America/Sao_Paulo", "dd/MM/yyyy");
  GmailApp.sendEmail(CONFIG.email, CONFIG.assunto + " — " + data, "", {
    htmlBody: html,
    name: "Curadoria IA — Vértice",
    from: GMAIL_REMETENTE,
  });
  Logger.log("✅ Email enviado para " + CONFIG.email);
}

// Extrai URL de imagem de um item RSS/Atom
function extrairImagem(item) {
  try {
    var mediaNs = XmlService.getNamespace("http://search.yahoo.com/mrss/");
    var mediaContent = item.getChild("content", mediaNs);
    if (mediaContent) {
      var url = (mediaContent.getAttribute("url") || { getValue: function() { return ""; } }).getValue();
      if (url) return url;
    }
    var mediaThumbnail = item.getChild("thumbnail", mediaNs);
    if (mediaThumbnail) {
      var url = (mediaThumbnail.getAttribute("url") || { getValue: function() { return ""; } }).getValue();
      if (url) return url;
    }
    var enclosure = item.getChild("enclosure");
    if (enclosure) {
      var type = (enclosure.getAttribute("type") || { getValue: function() { return ""; } }).getValue();
      if (type.indexOf("image") !== -1) {
        var url = (enclosure.getAttribute("url") || { getValue: function() { return ""; } }).getValue();
        if (url) return url;
      }
    }
    var descEl = item.getChild("description") || item.getChild("summary") || item.getChild("content");
    if (descEl) {
      var html = descEl.getValue() || descEl.getText();
      var match = html.match(/src=["']([^"']+\.(?:jpg|jpeg|png|webp|gif)[^"']*)/i);
      if (match && match[1]) return match[1];
    }
  } catch(e) {}
  return "";
}

function coletarNoticias() {
  var noticias = [];
  var atomNs = XmlService.getNamespace("http://www.w3.org/2005/Atom");

  for (var i = 0; i < CONFIG.feeds.length; i++) {
    var feed = CONFIG.feeds[i];
    try {
      var response = UrlFetchApp.fetch(feed.url, {
        muteHttpExceptions: true,
        followRedirects: true,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; CuradoriaIA/1.0)",
          "Accept": "application/rss+xml, application/xml, text/xml, */*",
        },
      });

      if (response.getResponseCode() !== 200) {
        Logger.log("HTTP " + response.getResponseCode() + ": " + feed.fonte);
        continue;
      }

      var doc, root, items = [];
      try {
        doc = XmlService.parse(response.getContentText());
        root = doc.getRootElement();
      } catch(e) {
        Logger.log("Parse error " + feed.fonte + ": " + e);
        continue;
      }

      // RSS 2.0
      var channel = root.getChild("channel");
      if (channel) {
        items = channel.getChildren("item");
      }
      // Atom (com ou sem namespace)
      if (!items.length) {
        items = root.getChildren("entry", atomNs);
      }
      if (!items.length) {
        items = root.getChildren("entry");
      }

      var count = 0;
      for (var j = 0; j < items.length && count < 5; j++) {
        var item = items[j];
        var titulo = "", link = "", desc = "", imagem = "";

        var titleEl = item.getChild("title") || item.getChild("title", atomNs);
        if (titleEl) titulo = titleEl.getText().replace(/<[^>]*>/g, "").trim();

        var linkEl = item.getChild("link") || item.getChild("link", atomNs);
        if (linkEl) {
          link = linkEl.getText().trim();
          if (!link) link = (linkEl.getAttribute("href") || { getValue: function() { return ""; } }).getValue().trim();
        }
        if (!link) {
          var guidEl = item.getChild("guid");
          if (guidEl) link = guidEl.getText().trim();
        }
        // link alternativo Atom: primeiro <link> com rel=alternate ou sem rel
        if (!link) {
          var links = item.getChildren("link", atomNs);
          for (var k = 0; k < links.length; k++) {
            var rel = (links[k].getAttribute("rel") || { getValue: function() { return "alternate"; } }).getValue();
            if (rel === "alternate" || rel === "") {
              link = (links[k].getAttribute("href") || { getValue: function() { return ""; } }).getValue().trim();
              if (link) break;
            }
          }
        }

        var descEl = item.getChild("description") || item.getChild("summary") || item.getChild("content");
        if (!descEl) descEl = item.getChild("summary", atomNs) || item.getChild("content", atomNs);
        if (descEl) desc = descEl.getText().replace(/<[^>]*>/g, "").trim().substring(0, 400);

        imagem = extrairImagem(item);

        if (!titulo || !link) continue;

        noticias.push({ titulo: titulo, link: link, descricao: desc, imagem: imagem, categoria: feed.categoria, fonte: feed.fonte });
        count++;
      }

      Logger.log("OK: " + feed.fonte + " (" + count + " itens)");
    } catch(e) {
      Logger.log("Erro " + feed.fonte + ": " + e);
    }
  }
  return noticias;
}

// Usa Gemini apenas para SELECIONAR e TRADUZIR — retorna JSON com artigos escolhidos
function selecionarComGemini(noticias) {
  var noticiasTexto = noticias.map(function(n, i) {
    return i + "|" + n.categoria + "|" + n.fonte + "|" + n.titulo + "|" + n.link + "|" + n.imagem + "|" + n.descricao.replace(/\|/g, " ");
  }).join("\n");

  var prompt = "Você é curador de IA para Leonardo Cunha Pereira.\n\n" +
    "LISTA DE ARTIGOS (formato: índice|categoria|fonte|título|link|imagem|descrição):\n" +
    noticiasTexto + "\n\n" +
    "TAREFA:\n" +
    "1. Selecione os 15 artigos mais relevantes sobre: novos modelos de IA, agentes, MCP servers, ferramentas open source, tutoriais práticos, otimização de tokens.\n" +
    "2. Exclua: conteúdo publicitário, análises financeiras, política.\n" +
    "3. Para cada selecionado, traduza o título e escreva um resumo de 2 frases em português brasileiro.\n\n" +
    "Retorne SOMENTE um array JSON válido, sem markdown, sem explicações:\n" +
    '[{"titulo":"TÍTULO TRADUZIDO","link":"URL ORIGINAL","imagem":"URL IMAGEM OU VAZIO","fonte":"NOME DA FONTE","categoria":"CATEGORIA","resumo":"2 FRASES DE RESUMO"}]\n\n' +
    "IMPORTANTE: preserve os links e imagens exatamente como estão na lista original.";

  var payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.3, maxOutputTokens: 4096 },
  };

  var response = UrlFetchApp.fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + GEMINI_API_KEY,
    { method: "post", contentType: "application/json", payload: JSON.stringify(payload), muteHttpExceptions: true }
  );

  var result = JSON.parse(response.getContentText());
  if (!result.candidates || !result.candidates[0]) {
    Logger.log("Erro Gemini: " + response.getContentText());
    return noticias.slice(0, 15);
  }

  var text = result.candidates[0].content.parts[0].text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  try {
    return JSON.parse(text);
  } catch(e) {
    Logger.log("Erro parse JSON Gemini: " + e + "\n" + text);
    return noticias.slice(0, 15);
  }
}

// Monta o HTML dos artigos localmente — sem depender do Gemini para formatação
function montarConteudoHTML(artigos) {
  var categorias = {};
  for (var i = 0; i < artigos.length; i++) {
    var a = artigos[i];
    var cat = a.categoria || "Destaques";
    if (!categorias[cat]) categorias[cat] = [];
    categorias[cat].push(a);
  }

  var html = "";
  for (var cat in categorias) {
    html += '<div style="margin-bottom:40px;">';
    html += '<div style="background:#1a1a2e;padding:12px 20px;margin-bottom:4px;">';
    html += '<span style="color:#e0c97f;font-size:11px;letter-spacing:4px;font-family:Arial,sans-serif;font-weight:bold;">' + cat.toUpperCase() + '</span>';
    html += '</div>';

    var items = categorias[cat];
    for (var j = 0; j < items.length; j++) {
      var art = items[j];
      var temImagem = art.imagem && art.imagem.length > 0;

      if (temImagem) {
        html += '<div style="background:#fff;border:1px solid #eee;margin-bottom:12px;overflow:hidden;">';
        html += '<img src="' + art.imagem + '" alt="" style="width:100%;max-height:200px;object-fit:cover;display:block;" onerror="this.style.display=\'none\'" />';
        html += '<div style="padding:16px 20px;">';
      } else {
        html += '<div style="background:#fff;border-left:4px solid #e0c97f;border-bottom:1px solid #eee;padding:16px 20px;margin-bottom:12px;">';
        html += '<div style="padding:0;">';
      }

      html += '<a href="' + art.link + '" style="color:#1a1a2e;font-size:15px;font-weight:bold;text-decoration:none;font-family:Georgia,serif;line-height:1.4;display:block;margin-bottom:8px;">' + art.titulo + '</a>';
      html += '<p style="color:#555;font-size:13px;line-height:1.7;margin:0 0 10px;font-family:Arial,sans-serif;">' + (art.resumo || "") + '</p>';
      html += '<span style="color:#e0c97f;font-size:10px;letter-spacing:2px;font-family:Arial,sans-serif;font-weight:bold;">▶ ' + art.fonte + '</span>';
      html += '</div></div>';
    }

    html += '</div>';
  }

  html += '<p style="color:#999;font-size:10px;text-align:right;border-top:1px solid #eee;padding-top:12px;margin-top:8px;font-family:Arial,sans-serif;">Total de artigos selecionados: ' + artigos.length + '</p>';
  return html;
}

function montarEmail(conteudo) {
  var data = Utilities.formatDate(new Date(), "America/Sao_Paulo", "EEEE, dd 'de' MMMM 'de' yyyy");
  var edicao = "Edição " + Utilities.formatDate(new Date(), "America/Sao_Paulo", "dd/MM/yyyy");
  var logo = "https://disparo-de-email.vercel.app/logo-vertice.png";

  return '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>' +
    '<body style="margin:0;padding:0;background:#0d0d1a;font-family:Georgia,\'Times New Roman\',serif;">' +
    '<div style="max-width:680px;margin:0 auto;background:#EDEAE4;">' +

    '<div style="background:#0a0a1a;padding:32px 40px 24px;text-align:center;">' +
    '<img src="' + logo + '" alt="Vértice" style="height:60px;width:auto;display:block;margin:0 auto 20px;" />' +
    '<div style="border-top:1px solid #333;border-bottom:1px solid #333;padding:12px 0;margin-bottom:16px;">' +
    '<div style="color:#e0c97f;font-size:11px;letter-spacing:5px;font-family:Arial,sans-serif;">' + CONFIG.tituloEmail + '</div>' +
    '</div>' +
    '<div style="color:#888;font-size:11px;letter-spacing:2px;font-family:Arial,sans-serif;">LEONARDO CUNHA PEREIRA &nbsp;·&nbsp; CURADORIA DIÁRIA</div>' +
    '</div>' +

    '<div style="background:#e0c97f;padding:10px 40px;">' +
    '<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>' +
    '<td style="color:#0a0a1a;font-size:12px;font-family:Arial,sans-serif;text-transform:capitalize;font-weight:bold;">' + data + '</td>' +
    '<td align="right" style="color:rgba(10,10,26,0.6);font-size:11px;font-family:Arial,sans-serif;">' + edicao + '</td>' +
    '</tr></table>' +
    '</div>' +

    '<div style="background:#fff;border-left:5px solid #e0c97f;margin:20px 20px 0;padding:18px 22px;">' +
    '<div style="color:#e0c97f;font-size:10px;letter-spacing:3px;font-family:Arial,sans-serif;margin-bottom:6px;">NOTA EDITORIAL</div>' +
    '<p style="margin:0;color:#555;font-size:13px;line-height:1.6;font-style:italic;">Curadoria diária de inteligência artificial: novos modelos, agentes, MCP servers, ferramentas open source e tutoriais práticos. Fontes: OpenAI, HuggingFace, Google AI, VentureBeat, TechCrunch, The Decoder, Simon Willison e mais.</p>' +
    '</div>' +

    '<div style="background:#EDEAE4;padding:20px 20px 8px;">' +
    conteudo +
    '</div>' +

    '<div style="background:#0a0a1a;padding:28px 40px;text-align:center;">' +
    '<img src="' + logo + '" alt="Vértice" style="height:40px;width:auto;opacity:0.5;margin-bottom:16px;display:block;margin-left:auto;margin-right:auto;" />' +
    '<div style="color:#e0c97f;font-size:11px;letter-spacing:3px;font-family:Arial,sans-serif;margin-bottom:6px;">VÉRTICE CONSULTORIA ESTRATÉGICA</div>' +
    '<div style="color:#444;font-size:10px;font-family:Arial,sans-serif;">Belo Horizonte, Brasil</div>' +
    '</div>' +

    '</div></body></html>';
}
