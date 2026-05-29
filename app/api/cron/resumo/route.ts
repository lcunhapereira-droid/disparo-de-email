import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import { parseStringPromise } from "xml2js";
import { Resend } from "resend";

const RSS_FEEDS = [
  // ===== ENDOCRINOLOGIA =====
  {
    url: "https://www.thelancet.com/rssfeed/landef_online.xml",
    especialidade: "Endocrinologia",
    fonte: "The Lancet Diabetes & Endocrinology",
  },
  {
    url: "https://academic.oup.com/rss/site_5508/advanceaccess.xml",
    especialidade: "Endocrinologia",
    fonte: "Journal of Clinical Endocrinology & Metabolism (Endocrine Society)",
  },
  {
    url: "https://diabetesjournals.org/care/rss/current.xml",
    especialidade: "Endocrinologia",
    fonte: "Diabetes Care (ADA)",
  },
  {
    url: "https://www.sciencedaily.com/rss/health_medicine/obesity.xml",
    especialidade: "Endocrinologia",
    fonte: "ScienceDaily - Obesidade e Metabolismo",
  },
  // ===== GINECOLOGIA =====
  {
    url: "https://www.ajog.org/rss/S0002-9378.xml",
    especialidade: "Ginecologia",
    fonte: "American Journal of Obstetrics & Gynecology (AJOG)",
  },
  {
    url: "https://www.fertstert.org/rss/S0015-0282.xml",
    especialidade: "Ginecologia",
    fonte: "Fertility and Sterility",
  },
  {
    url: "https://www.sciencedaily.com/rss/health_medicine/womens_health.xml",
    especialidade: "Ginecologia",
    fonte: "ScienceDaily - Saude da Mulher",
  },
  {
    url: "https://www.sciencedaily.com/rss/health_medicine/menopause.xml",
    especialidade: "Ginecologia",
    fonte: "ScienceDaily - Menopausa e Climaterio",
  },
  {
    url: "https://obgyn.onlinelibrary.wiley.com/feed/14710528/most-recent",
    especialidade: "Ginecologia",
    fonte: "BJOG - British Journal of Obstetrics and Gynaecology",
  },
  // ===== DERMATOLOGIA ESTETICA =====
  {
    url: "https://www.jaad.org/rss/S0190-9622.xml",
    especialidade: "Dermatologia Estetica",
    fonte: "JAAD - Journal of the American Academy of Dermatology",
  },
  {
    url: "https://jamanetwork.com/rss/site_3/68.xml",
    especialidade: "Dermatologia Estetica",
    fonte: "JAMA Dermatology",
  },
  {
    url: "https://onlinelibrary.wiley.com/feed/13652133/most-recent",
    especialidade: "Dermatologia Estetica",
    fonte: "British Journal of Dermatology",
  },
  {
    url: "https://www.sciencedaily.com/rss/health_medicine/skin_care.xml",
    especialidade: "Dermatologia Estetica",
    fonte: "ScienceDaily - Dermatologia",
  },
  // ===== GRANDES REVISTAS GERAIS (cobrem todas as areas) =====
  {
    url: "https://www.nejm.org/action/showFeed?jc=nejm&type=etoc&feed=rss",
    especialidade: "Medicina Geral",
    fonte: "New England Journal of Medicine (NEJM)",
  },
  {
    url: "https://www.thelancet.com/rssfeed/lancet_online.xml",
    especialidade: "Medicina Geral",
    fonte: "The Lancet",
  },
  {
    url: "https://www.bmj.com/rss/current.xml",
    especialidade: "Medicina Geral",
    fonte: "BMJ - British Medical Journal",
  },
];

type Noticia = {
  titulo: string;
  link: string;
  descricao: string;
  especialidade: string;
  fonte: string;
};

async function coletarNoticias(): Promise<Noticia[]> {
  const noticias: Noticia[] = [];

  for (const feed of RSS_FEEDS) {
    try {
      const response = await axios.get(feed.url, {
        timeout: 15000,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; MedicalCurationBot/1.0)",
          "Accept": "application/rss+xml, application/xml, text/xml, */*",
        },
      });

      const resultado = await parseStringPromise(response.data, { explicitArray: false });
      const itens = resultado?.rss?.channel?.item || resultado?.feed?.entry || [];
      const lista = Array.isArray(itens) ? itens : [itens];

      for (const item of lista.slice(0, 4)) {
        const titulo = String(item.title?.["_"] || item.title || "").replace(/<[^>]*>/g, "").trim();
        const link = String(item.link?.$.href || item.link || item.guid || "").trim();
        const descricao = String(
          item.description ||
          item.summary?.["_"] ||
          item.summary ||
          item["content:encoded"] ||
          ""
        ).replace(/<[^>]*>/g, "").trim().substring(0, 600);

        if (!link || !titulo) continue;
        noticias.push({
          titulo,
          link,
          descricao,
          especialidade: feed.especialidade,
          fonte: feed.fonte,
        });
      }
    } catch (err) {
      console.error(`Erro no feed ${feed.fonte}:`, err instanceof Error ? err.message : err);
    }
  }

  return noticias;
}

async function processarComGemini(noticias: Noticia[], apiKey: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });

  const noticiasTexto = noticias
    .map((n, i) =>
      `[${i + 1}]\nEspecialidade: ${n.especialidade}\nFonte: ${n.fonte}\nTitulo: ${n.titulo}\nResumo: ${n.descricao}\nLink: ${n.link}`
    )
    .join("\n\n---\n\n");

  const prompt = `Voce e a curadora cientifica pessoal da Dra. Eriane Faria, medica especialista em Saude Feminina e Funcional (CRM MG 100709), Belo Horizonte, Brasil.

TAREFA: Analise as noticias cientificas abaixo (podem estar em ingles ou outro idioma) e produza um BOLETIM CIENTIFICO DIARIO completo em HTML.

INSTRUCOES:
1. TRADUZA tudo para portugues brasileiro com linguagem tecnica e acessivel para medicos
2. Selecione apenas noticias com relevancia clinica real para as areas de Endocrinologia, Ginecologia e Dermatologia Estetica
3. Organize em 3 secoes: Endocrinologia | Ginecologia | Dermatologia Estetica
4. Para cada noticia inclua:
   - Titulo traduzido em destaque
   - O que foi descoberto/publicado
   - Relevancia clinica pratica
   - Nivel de evidencia (quando disponivel)
   - Fonte original com link clicavel
5. HTML elegante com style inline, cores suaves, tipografia medica profissional
6. Se a noticia nao for relevante para as 3 especialidades, ignore-a

NOTICIAS:
${noticiasTexto}

Retorne APENAS o HTML do conteudo (sem as tags html, head ou body).`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text || "<p>Nao foi possivel gerar o resumo.</p>";
}

function montarEmailHTML(conteudo: string): string {
  const dataHoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/Sao_Paulo",
  });

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F9F8F7;font-family:Georgia,serif;">
  <div style="background:linear-gradient(135deg,#9B8559,#b8a07a);padding:30px 40px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:22px;letter-spacing:2px;font-weight:normal;">CURADORIA CIENTIFICA DIARIA</h1>
    <p style="color:#F6E6EA;margin:8px 0 0;font-size:13px;letter-spacing:1px;">DRA. ERIANE FARIA &middot; SAUDE FEMININA E FUNCIONAL &middot; CRM MG 100709</p>
  </div>
  <div style="background:#DDE8E2;padding:12px 40px;text-align:center;">
    <p style="margin:0;color:#4a6741;font-size:13px;text-transform:capitalize;">${dataHoje}</p>
  </div>
  <div style="max-width:700px;margin:0 auto;padding:40px 20px;">
    ${conteudo}
  </div>
  <div style="background:#1a1a1a;padding:25px 40px;text-align:center;margin-top:40px;">
    <p style="color:#9B8559;margin:0;font-size:12px;letter-spacing:1px;">RESUMO GERADO AUTOMATICAMENTE &middot; GEMINI 2.5 FLASH</p>
    <p style="color:#666;margin:8px 0 0;font-size:11px;">Fontes: NEJM &middot; The Lancet &middot; JAMA &middot; BMJ &middot; AJOG &middot; JAAD &middot; Endocrine Society &middot; ScienceDaily</p>
    <p style="color:#555;margin:6px 0 0;font-size:10px;">Uso pessoal e educativo. Sempre consulte as fontes originais.</p>
  </div>
</body>
</html>`;
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
    console.log("Coletando noticias dos feeds internacionais...");
    const noticias = await coletarNoticias();
    console.log(`${noticias.length} noticias coletadas`);

    if (noticias.length === 0) {
      return NextResponse.json({ message: "Nenhuma noticia encontrada nos feeds" });
    }

    console.log("Processando com Gemini 2.5 Flash...");
    const conteudo = await processarComGemini(noticias, geminiKey);

    console.log("Enviando e-mail...");
    const resend = new Resend(resendKey);
    const { error } = await resend.emails.send({
      from: "Curadoria Medica <onboarding@resend.dev>",
      to: "erianefariadamasia@gmail.com",
      subject: `Curadoria Cientifica Diaria - ${new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}`,
      html: montarEmailHTML(conteudo),
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
