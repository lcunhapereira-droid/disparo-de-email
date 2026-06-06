// Agente de Curadoria IA — Leonardo Cunha Pereira
// Newsletter: Inteligência Artificial — Modelos, Agentes & Ferramentas
// Para ativar: execute a função setup() uma única vez

var GEMINI_API_KEY = "AIzaSyAb8RN6I7oob-UWX_ahMhc6PXLEGtSiDFEetCI928RIaeGJRyOw";
var GMAIL_REMETENTE = "lcunhapereira@gmail.com";

var CONFIG = {
  nome: "Leonardo Cunha Pereira",
  email: "lcunhapereira@yahoo.com.br",
  horario: 8,
  assunto: "Curadoria IA — Modelos, Agentes & Ferramentas",
  tituloEmail: "CURADORIA IA",
  feeds: [
    { url: "https://www.anthropic.com/rss.xml", categoria: "Anthropic / Claude", fonte: "Anthropic Blog" },
    { url: "https://openai.com/blog/rss.xml", categoria: "Novos Modelos", fonte: "OpenAI Blog" },
    { url: "https://huggingface.co/blog/feed.xml", categoria: "Novos Modelos", fonte: "HuggingFace Blog" },
    { url: "https://ai.googleblog.com/feeds/posts/default?alt=rss", categoria: "Novos Modelos", fonte: "Google AI Blog" },
    { url: "https://machinelearning.apple.com/rss.xml", categoria: "Novos Modelos", fonte: "Apple ML Research" },
    { url: "https://www.deeplearning.ai/blog/feed/", categoria: "Tutoriais", fonte: "DeepLearning.AI" },
    { url: "https://www.marktechpost.com/feed/", categoria: "Ferramentas Gratuitas", fonte: "MarkTechPost" },
    { url: "https://www.unite.ai/feed/", categoria: "Agentes IA", fonte: "Unite.AI" },
    { url: "https://towardsdatascience.com/feed", categoria: "Tutoriais", fonte: "Towards Data Science" },
    { url: "https://pub.towardsai.net/feed", categoria: "Pesquisa", fonte: "Towards AI" },
    { url: "https://venturebeat.com/category/ai/feed/", categoria: "Novos Modelos", fonte: "VentureBeat AI" },
    { url: "https://techcrunch.com/category/artificial-intelligence/feed/", categoria: "Novos Agentes", fonte: "TechCrunch AI" },
    { url: "https://the-decoder.com/feed/", categoria: "Novos Modelos", fonte: "The Decoder" },
    { url: "https://aiweekly.co/issues.rss", categoria: "Resumo Executivo", fonte: "AI Weekly" },
    { url: "https://simonwillison.net/atom/everything/", categoria: "MCP Servers & Agentes", fonte: "Simon Willison" },
  ],
  secoes: [
    "RESUMO EXECUTIVO",
    "NOVOS MODELOS E LANÇAMENTOS",
    "NOVOS AGENTES E AUTOMAÇÕES",
    "MCP SERVERS E INTEGRAÇÕES",
    "FERRAMENTAS GRATUITAS E OPEN SOURCE",
    "ECONOMIA DE TOKENS E OTIMIZAÇÃO",
    "TUTORIAIS E GUIAS PRÁTICOS",
    "TOP TENDÊNCIAS DA SEMANA",
  ],
  filtro: {
    incluir: [
      "Lançamentos de novos modelos de linguagem e suas capacidades",
      "Novos frameworks e ferramentas de agentes de IA",
      "MCP servers, integrações e protocolos para agentes",
      "Ferramentas gratuitas ou open source para IA",
      "Tutoriais práticos sobre Claude, ChatGPT, Gemini e similares",
      "Otimização de prompts e economia de tokens",
      "Tendências de mercado em IA generativa",
    ],
    excluir: [
      "Conteúdo publicitário ou patrocinado",
      "Análises financeiras ou de investimento",
      "Notícias corporativas sem impacto técnico",
      "Política e regulamentação sem relevância prática imediata",
    ],
  },
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
    Logger.log("Nenhuma notícia coletada. Verifique os feeds.");
    return;
  }
  var conteudo = processarComGemini(noticias);
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
  // 1. media:content (usado por VentureBeat, TechCrunch, MarkTechPost)
  var mediaNs = XmlService.getNamespace("http://search.yahoo.com/mrss/");
  var mediaContent = item.getChild("content", mediaNs);
  if (mediaContent) {
    var url = (mediaContent.getAttribute("url") || { getValue: function() { return ""; } }).getValue();
    if (url) return url;
  }

  // 2. media:thumbnail
  var mediaThumbnail = item.getChild("thumbnail", mediaNs);
  if (mediaThumbnail) {
    var url = (mediaThumbnail.getAttribute("url") || { getValue: function() { return ""; } }).getValue();
    if (url) return url;
  }

  // 3. enclosure (podcast/imagem direto no RSS)
  var enclosure = item.getChild("enclosure");
  if (enclosure) {
    var type = (enclosure.getAttribute("type") || { getValue: function() { return ""; } }).getValue();
    if (type.indexOf("image") !== -1) {
      var url = (enclosure.getAttribute("url") || { getValue: function() { return ""; } }).getValue();
      if (url) return url;
    }
  }

  // 4. Tenta extrair primeira <img> do description/content
  var descEl = item.getChild("description") || item.getChild("summary") || item.getChild("content");
  if (descEl) {
    var html = descEl.getValue() || descEl.getText();
    var match = html.match(/src=["']([^"']+\.(?:jpg|jpeg|png|webp|gif)[^"']*)/i);
    if (match && match[1]) return match[1];
  }

  return "";
}

function coletarNoticias() {
  var noticias = [];
  for (var i = 0; i < CONFIG.feeds.length; i++) {
    var feed = CONFIG.feeds[i];
    try {
      var response = UrlFetchApp.fetch(feed.url, {
        muteHttpExceptions: true,
        followRedirects: true,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; CuradoriaIA/1.0; +https://vertice.io)",
          "Accept": "application/rss+xml, application/xml, text/xml, */*",
        },
      });

      if (response.getResponseCode() !== 200) {
        Logger.log("Feed com erro HTTP " + response.getResponseCode() + ": " + feed.fonte);
        continue;
      }

      var xml = response.getContentText();
      var items = [];

      try {
        var doc = XmlService.parse(xml);
        var root = doc.getRootElement();

        // RSS 2.0
        var channel = root.getChild("channel");
        if (channel) {
          items = channel.getChildren("item");
        }
        // Atom
        if (!items.length) {
          var atomNs = XmlService.getNamespace("http://www.w3.org/2005/Atom");
          items = root.getChildren("entry", atomNs);
          if (!items.length) {
            items = root.getChildren("entry");
          }
        }
      } catch(parseErr) {
        Logger.log("Erro de parse XML em " + feed.fonte + ": " + parseErr);
        continue;
      }

      var count = 0;
      for (var j = 0; j < items.length && count < 8; j++) {
        var item = items[j];
        var titulo = "";
        var link = "";
        var desc = "";
        var imagem = "";

        var titleEl = item.getChild("title");
        if (titleEl) titulo = titleEl.getText().replace(/<[^>]*>/g, "").trim();

        var linkEl = item.getChild("link");
        if (linkEl) {
          link = linkEl.getText().trim();
          if (!link) {
            link = (linkEl.getAttribute("href") || { getValue: function() { return ""; } }).getValue().trim();
          }
        }
        if (!link) {
          var guidEl = item.getChild("guid");
          if (guidEl) link = guidEl.getText().trim();
        }

        var descEl = item.getChild("description") || item.getChild("summary") || item.getChild("content");
        if (descEl) desc = descEl.getText().replace(/<[^>]*>/g, "").trim().substring(0, 500);

        // Extrai imagem
        try { imagem = extrairImagem(item); } catch(e) { imagem = ""; }

        if (!titulo || !link) continue;

        noticias.push({
          titulo: titulo,
          link: link,
          descricao: desc,
          imagem: imagem,
          categoria: feed.categoria,
          fonte: feed.fonte,
        });
        count++;
      }

      Logger.log("Feed OK: " + feed.fonte + " (" + count + " itens)");
    } catch(e) {
      Logger.log("Erro no feed " + feed.fonte + ": " + e.toString());
    }
  }
  return noticias;
}

function processarComGemini(noticias) {
  var noticiasTexto = noticias.map(function(n, i) {
    return "[" + (i + 1) + "] CATEGORIA: " + n.categoria +
      "\nFONTE: " + n.fonte +
      "\nTITULO: " + n.titulo +
      "\nRESUMO: " + n.descricao +
      "\nLINK: " + n.link +
      (n.imagem ? "\nIMAGEM: " + n.imagem : "");
  }).join("\n\n---\n\n");

  var secoesTexto = CONFIG.secoes.join(", ");
  var incluirTexto = CONFIG.filtro.incluir.join("; ");
  var excluirTexto = CONFIG.filtro.excluir.join("; ");

  var prompt = "Você é o curador de conteúdo de IA de Leonardo Cunha Pereira, especialista em inteligência artificial, agentes, MCP servers e ferramentas modernas de IA.\n\n" +
    "TAREFA: Analise os " + noticias.length + " itens abaixo e crie um RESUMO EXECUTIVO em HTML de newsletter visual profissional.\n" +
    "Traduza todo o conteúdo para português brasileiro.\n\n" +
    "INCLUA APENAS: " + incluirTexto + "\n" +
    "EXCLUA: " + excluirTexto + "\n\n" +
    "SEÇÕES (use apenas as relevantes, máximo 5 artigos por seção): " + secoesTexto + "\n\n" +
    "FORMATO HTML OBRIGATÓRIO:\n\n" +
    "Para cada SEÇÃO:\n" +
    '<div style="margin-bottom:40px;">\n' +
    '  <div style="background:#1a1a2e;padding:12px 20px;margin-bottom:4px;">\n' +
    '    <span style="color:#e0c97f;font-size:11px;letter-spacing:4px;font-family:Arial,sans-serif;font-weight:bold;">NOME DA SEÇÃO</span>\n' +
    '  </div>\n' +
    "  Para cada artigo NESTA SEÇÃO, use este card:\n" +
    "  SE o item tiver IMAGEM no campo IMAGEM:\n" +
    '  <div style="background:#fff;border:1px solid #eee;margin-bottom:12px;overflow:hidden;">\n' +
    '    <img src="URL_IMAGEM" alt="" style="width:100%;max-height:200px;object-fit:cover;display:block;" />\n' +
    '    <div style="padding:16px 20px;">\n' +
    '      <a href="LINK" style="color:#1a1a2e;font-size:15px;font-weight:bold;text-decoration:none;font-family:Georgia,serif;line-height:1.4;display:block;margin-bottom:8px;">TÍTULO</a>\n' +
    '      <p style="color:#555;font-size:13px;line-height:1.7;margin:0 0 10px;font-family:Arial,sans-serif;">RESUMO 2-3 LINHAS</p>\n' +
    '      <span style="color:#e0c97f;font-size:10px;letter-spacing:2px;font-family:Arial,sans-serif;font-weight:bold;">▶ FONTE: NOME</span>\n' +
    '    </div>\n' +
    '  </div>\n' +
    "  SE o item NÃO tiver imagem:\n" +
    '  <div style="background:#fff;border-left:4px solid #e0c97f;border-bottom:1px solid #eee;padding:16px 20px;margin-bottom:12px;">\n' +
    '    <a href="LINK" style="color:#1a1a2e;font-size:15px;font-weight:bold;text-decoration:none;font-family:Georgia,serif;line-height:1.4;display:block;margin-bottom:8px;">TÍTULO</a>\n' +
    '    <p style="color:#555;font-size:13px;line-height:1.7;margin:0 0 10px;font-family:Arial,sans-serif;">RESUMO 2-3 LINHAS</p>\n' +
    '    <span style="color:#e0c97f;font-size:10px;letter-spacing:2px;font-family:Arial,sans-serif;font-weight:bold;">▶ FONTE: NOME</span>\n' +
    '  </div>\n' +
    '</div>\n\n' +
    "Se nenhum item de uma seção passar no filtro, omita completamente.\n" +
    'Ao final: <p style="color:#999;font-size:10px;text-align:right;border-top:1px solid #eee;padding-top:12px;margin-top:24px;font-family:Arial,sans-serif;">Total de itens analisados: ' + noticias.length + '</p>\n\n' +
    "Retorne APENAS o HTML do conteúdo (sem html/head/body tags).\n\n" +
    "CONTEÚDO:\n" + noticiasTexto;

  var payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.5, maxOutputTokens: 8192 },
  };

  var response = UrlFetchApp.fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + GEMINI_API_KEY,
    {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    }
  );

  var result = JSON.parse(response.getContentText());
  if (!result.candidates || !result.candidates[0]) {
    Logger.log("Erro Gemini: " + response.getContentText());
    return "<p>Erro ao gerar conteúdo com Gemini.</p>";
  }
  return result.candidates[0].content.parts[0].text || "<p>Sem conteúdo gerado.</p>";
}

function montarEmail(conteudo) {
  var data = Utilities.formatDate(new Date(), "America/Sao_Paulo", "EEEE, dd 'de' MMMM 'de' yyyy");
  var edicao = "Edição " + Utilities.formatDate(new Date(), "America/Sao_Paulo", "dd/MM/yyyy");
  var logo = "https://disparo-de-email.vercel.app/logo-vertice.png";

  return '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>' +
    '<body style="margin:0;padding:0;background:#0d0d1a;font-family:Georgia,\'Times New Roman\',serif;">' +
    '<div style="max-width:680px;margin:0 auto;background:#EDEAE4;">' +

    // Cabeçalho
    '<div style="background:#0a0a1a;padding:32px 40px 24px;text-align:center;">' +
    '<img src="' + logo + '" alt="Vértice" style="height:60px;width:auto;display:block;margin:0 auto 20px;" />' +
    '<div style="border-top:1px solid #333;border-bottom:1px solid #333;padding:12px 0;margin-bottom:16px;">' +
    '<div style="color:#e0c97f;font-size:11px;letter-spacing:5px;font-family:Arial,sans-serif;">' + CONFIG.tituloEmail + '</div>' +
    '</div>' +
    '<div style="color:#888;font-size:11px;letter-spacing:2px;font-family:Arial,sans-serif;">LEONARDO CUNHA PEREIRA &nbsp;·&nbsp; CURADORIA DIÁRIA</div>' +
    '</div>' +

    // Faixa de data
    '<div style="background:#e0c97f;padding:10px 40px;">' +
    '<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>' +
    '<td style="color:#0a0a1a;font-size:12px;font-family:Arial,sans-serif;text-transform:capitalize;font-weight:bold;">' + data + '</td>' +
    '<td align="right" style="color:rgba(10,10,26,0.6);font-size:11px;font-family:Arial,sans-serif;">' + edicao + '</td>' +
    '</tr></table>' +
    '</div>' +

    // Nota editorial
    '<div style="background:#fff;border-left:5px solid #e0c97f;margin:20px 20px 0;padding:18px 22px;">' +
    '<div style="color:#e0c97f;font-size:10px;letter-spacing:3px;font-family:Arial,sans-serif;margin-bottom:6px;">NOTA EDITORIAL</div>' +
    '<p style="margin:0;color:#555;font-size:13px;line-height:1.6;font-style:italic;">Curadoria diária de inteligência artificial: novos modelos, agentes, MCP servers, ferramentas open source e tutoriais práticos. Fontes: Anthropic, OpenAI, HuggingFace, Google AI, DeepLearning.AI, VentureBeat, TechCrunch e Simon Willison.</p>' +
    '</div>' +

    // Conteúdo principal
    '<div style="background:#EDEAE4;padding:20px 20px 8px;">' +
    conteudo +
    '</div>' +

    // Rodapé
    '<div style="background:#0a0a1a;padding:28px 40px;text-align:center;">' +
    '<img src="' + logo + '" alt="Vértice" style="height:40px;width:auto;opacity:0.5;margin-bottom:16px;display:block;margin-left:auto;margin-right:auto;" />' +
    '<div style="color:#e0c97f;font-size:11px;letter-spacing:3px;font-family:Arial,sans-serif;margin-bottom:6px;">VÉRTICE CONSULTORIA ESTRATÉGICA</div>' +
    '<div style="color:#444;font-size:10px;font-family:Arial,sans-serif;">Belo Horizonte, Brasil</div>' +
    '</div>' +

    '</div></body></html>';
}
