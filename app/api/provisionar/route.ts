import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const GITHUB_OWNER = "lcunhapereira-droid";

type Feed = { url: string; categoria: string; fonte: string };

const FEEDS_POR_AREA: Record<string, Feed[]> = {
  medicina: [
    { url: "https://www.sciencedaily.com/rss/health_medicine.xml", categoria: "Medicina", fonte: "ScienceDaily Health" },
    { url: "https://www.nejm.org/action/showFeed?jc=nejm&type=etoc&feed=rss", categoria: "Medicina Geral", fonte: "NEJM" },
    { url: "https://www.bmj.com/rss/current.xml", categoria: "Medicina Geral", fonte: "BMJ" },
    { url: "https://www.thelancet.com/rssfeed/lancet_online.xml", categoria: "Medicina Geral", fonte: "The Lancet" },
  ],
  tecnologia: [
    { url: "https://feeds.feedburner.com/TechCrunch", categoria: "Tecnologia", fonte: "TechCrunch" },
    { url: "https://dev.to/feed", categoria: "Programação", fonte: "Dev.to" },
    { url: "https://hnrss.org/frontpage", categoria: "Tech", fonte: "Hacker News" },
    { url: "https://www.technologyreview.com/topnews.rss", categoria: "Inovação", fonte: "MIT Technology Review" },
  ],
  direito: [
    { url: "https://www.conjur.com.br/rss.xml", categoria: "Direito", fonte: "Conjur" },
    { url: "https://www.migalhas.com.br/rss/quentes.xml", categoria: "Jurídico", fonte: "Migalhas" },
  ],
  financas: [
    { url: "https://feeds.bloomberg.com/markets/news.rss", categoria: "Mercados", fonte: "Bloomberg Markets" },
    { url: "https://www.infomoney.com.br/feed/", categoria: "Finanças", fonte: "InfoMoney" },
  ],
  marketing: [
    { url: "https://contentmarketinginstitute.com/feed/", categoria: "Conteúdo", fonte: "Content Marketing Institute" },
    { url: "https://neilpatel.com/blog/feed/", categoria: "Marketing", fonte: "Neil Patel Blog" },
  ],
  programacao: [
    { url: "https://dev.to/feed", categoria: "Programação", fonte: "Dev.to" },
    { url: "https://hnrss.org/frontpage", categoria: "Tech", fonte: "Hacker News" },
    { url: "https://github.blog/feed/", categoria: "GitHub", fonte: "GitHub Blog" },
    { url: "https://stackoverflow.blog/feed/", categoria: "Dev", fonte: "Stack Overflow Blog" },
  ],
  saude: [
    { url: "https://www.sciencedaily.com/rss/health_medicine.xml", categoria: "Saúde", fonte: "ScienceDaily Health" },
    { url: "https://www.who.int/rss-feeds/news-english.xml", categoria: "Saúde Global", fonte: "WHO" },
  ],
  negocios: [
    { url: "https://feeds.bloomberg.com/markets/news.rss", categoria: "Negócios", fonte: "Bloomberg" },
    { url: "https://hbr.org/resources/rss/hbr-rss.xml", categoria: "Gestão", fonte: "Harvard Business Review" },
  ],
  educacao: [
    { url: "https://www.edsurge.com/news.rss", categoria: "Educação", fonte: "EdSurge" },
    { url: "https://www.sciencedaily.com/rss/mind_brain/learning_memory.xml", categoria: "Aprendizagem", fonte: "ScienceDaily Learning" },
  ],
};

const SECOES_POR_AREA: Record<string, string[]> = {
  medicina: ["CLÍNICA E MEDICINA GERAL", "ESPECIALIDADES MÉDICAS", "PESQUISA E INOVAÇÃO"],
  tecnologia: ["INTELIGÊNCIA ARTIFICIAL", "DESENVOLVIMENTO E ENGENHARIA", "TENDÊNCIAS E MERCADO"],
  direito: ["LEGISLAÇÃO E JURISPRUDÊNCIA", "PRÁTICA JURÍDICA", "MERCADO JURÍDICO"],
  financas: ["MERCADOS E INVESTIMENTOS", "ECONOMIA E CONJUNTURA", "FINANÇAS PESSOAIS"],
  marketing: ["MARKETING DIGITAL", "CONTEÚDO E REDES SOCIAIS", "ESTRATÉGIA E CRESCIMENTO"],
  programacao: ["DESENVOLVIMENTO WEB", "FERRAMENTAS E BIBLIOTECAS", "BOAS PRÁTICAS E ARQUITETURA"],
  saude: ["SAÚDE E BEM-ESTAR", "MEDICINA PREVENTIVA", "SAÚDE MENTAL"],
  negocios: ["ESTRATÉGIA E GESTÃO", "STARTUPS E INOVAÇÃO", "LIDERANÇA E CULTURA"],
  educacao: ["APRENDIZAGEM E PEDAGOGIA", "TECNOLOGIA EDUCACIONAL", "TENDÊNCIAS EM EDUCAÇÃO"],
};

function getCronSchedule(horaBrasilia: number): string {
  return `0 ${(horaBrasilia + 3) % 24} * * *`;
}

function buildConfig(data: {
  nomeDestinatario: string; descricaoProfissional: string; identificacao: string;
  localidade: string; emailDestinatario: string; assunto: string; horario: number;
  area: string; areaCustom: string; feedsCustom: string;
}): string {
  const feeds = data.area === "outro"
    ? data.feedsCustom.split("\n").map(l => { const p = l.split("|").map(x => x.trim()); return p.length >= 3 ? { url: p[0], categoria: p[1], fonte: p[2] } : null; }).filter(Boolean) as Feed[]
    : FEEDS_POR_AREA[data.area] || FEEDS_POR_AREA.tecnologia;
  const secoes = data.area === "outro" ? ["PRINCIPAIS NOTÍCIAS", "TENDÊNCIAS", "ANÁLISES"] : SECOES_POR_AREA[data.area] || SECOES_POR_AREA.tecnologia;
  const areaLabel = data.area === "outro" ? data.areaCustom : data.area;
  const feedsStr = feeds.map(f => `    { url: "${f.url}", categoria: "${f.categoria}", fonte: "${f.fonte}" },`).join("\n");
  const secoesStr = secoes.map(s => `    "${s}",`).join("\n");
  return `export const CONFIG = {
  identidade: {
    nomeDestinatario: "${data.nomeDestinatario}",
    descricaoProfissional: "${data.descricaoProfissional}",
    identificacao: "${data.identificacao}",
    localidade: "${data.localidade}",
    tituloEmail: "CURADORIA ${areaLabel.toUpperCase()}",
  },
  email: {
    destinatario: "${data.emailDestinatario}",
    assunto: "${data.assunto}",
    remetente: "Curadoria IA",
  },
  cronSchedule: "${getCronSchedule(data.horario)}",
  visual: {
    corPrimaria: "#9B8559", corSecundaria: "#b8a07a", corFundo: "#F9F8F7",
    corBannerTexto: "#F6E6EA", corDataFundo: "#DDE8E2", corDataTexto: "#4a6741", corRodape: "#1a1a1a",
  },
  feeds: [
${feedsStr}
  ],
  secoes: [
${secoesStr}
  ],
  filtro: {
    incluir: ["Análises e estudos com resultados concretos", "Tendências relevantes para profissionais da área", "Inovações com impacto prático"],
    excluir: ["Conteúdo promocional ou publicitário", "Eventos e chamadas de trabalhos", "Opinião sem embasamento técnico"],
  },
  idiomaSaida: "portugues brasileiro",
};
`;
}

function buildCronRoute(): string {
  return `import { NextRequest, NextResponse } from "next/server";
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
      const res = await axios.get(feed.url, { timeout: 15000, headers: { "User-Agent": "Mozilla/5.0" } });
      const r = await parseStringPromise(res.data, { explicitArray: false });
      const itens = r?.rss?.channel?.item || [];
      const lista = Array.isArray(itens) ? itens : [itens];
      for (const item of lista.slice(0, 8)) {
        const titulo = String(item.title || "").replace(/<[^>]*>/g, "").trim();
        const link = String(item.link || item.guid || "").trim();
        const descricao = String(item.description || item.summary || "").replace(/<[^>]*>/g, "").trim().substring(0, 600);
        if (!link || !titulo) continue;
        noticias.push({ titulo, link, descricao, categoria: feed.categoria, fonte: feed.fonte });
      }
    } catch { console.error("Erro feed:", feed.fonte); }
  }
  return noticias;
}

async function processarComGemini(noticias: Noticia[], apiKey: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });
  const { identidade, secoes, filtro, idiomaSaida, visual } = CONFIG;
  const noticiasTexto = noticias.map((n, i) => \`[\${i+1}] CATEGORIA: \${n.categoria}\\nFONTE: \${n.fonte}\\nTITULO: \${n.titulo}\\nRESUMO: \${n.descricao}\\nLINK: \${n.link}\`).join("\\n\\n---\\n\\n");
  const identificacao = identidade.identificacao ? \` (\${identidade.identificacao})\` : "";
  const prompt = \`Voce e um agente de curadoria para \${identidade.nomeDestinatario}, \${identidade.descricaoProfissional}\${identificacao}, \${identidade.localidade}.\\nCrie um RESUMO EXECUTIVO em HTML elegante com style inline.\\nOrganize em secoes: \${secoes.join(", ")}.\\nInclua apenas: \${filtro.incluir.join("; ")}.\\nExclua: \${filtro.excluir.join("; ")}.\\nTraduz para \${idiomaSaida}.\\nCor dos titulos: \${visual.corPrimaria}.\\nAo final: "Total analisados: \${noticias.length}"\\n\\nCONTEUDO:\\n\${noticiasTexto}\\n\\nRetorne APENAS o HTML do conteudo (sem html/head/body tags).\`;
  const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
  return response.text || "<p>Nao foi possivel gerar o resumo.</p>";
}

function montarEmailHTML(conteudo: string): string {
  const { identidade, visual } = CONFIG;
  const dataHoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "America/Sao_Paulo" });
  const subtitulo = [identidade.nomeDestinatario, identidade.descricaoProfissional, identidade.identificacao].filter(Boolean).join(" — ");
  return \`<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:\${visual.corFundo};font-family:Georgia,serif;"><div style="background:linear-gradient(135deg,\${visual.corPrimaria},\${visual.corSecundaria});padding:30px 40px;text-align:center;"><h1 style="color:#fff;margin:0;font-size:22px;letter-spacing:2px;font-weight:normal;">\${identidade.tituloEmail}</h1><p style="color:\${visual.corBannerTexto};margin:8px 0 0;font-size:13px;">\${subtitulo.toUpperCase()}</p></div><div style="background:\${visual.corDataFundo};padding:12px 40px;text-align:center;"><p style="margin:0;color:\${visual.corDataTexto};font-size:13px;">\${dataHoje}</p></div><div style="max-width:700px;margin:0 auto;padding:40px 20px;">\${conteudo}</div><div style="background:\${visual.corRodape};padding:25px 40px;text-align:center;margin-top:40px;"><p style="color:\${visual.corPrimaria};margin:0;font-size:12px;">RESUMO GERADO AUTOMATICAMENTE — GEMINI 2.5 FLASH</p></div></body></html>\`;
}

export async function GET(request: NextRequest) {
  const querySecret = request.nextUrl.searchParams.get("secret");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && querySecret !== cronSecret && request.headers.get("authorization") !== \`Bearer \${cronSecret}\`) {
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
    if (noticias.length === 0) return NextResponse.json({ message: "Nenhuma noticia encontrada" });
    const conteudo = await processarComGemini(noticias, geminiKey);
    const transporter = nodemailer.createTransport({ service: "gmail", auth: { user: gmailUser, pass: gmailPass } });
    await transporter.sendMail({
      from: \`Curadoria IA <\${gmailUser}>\`,
      to: CONFIG.email.destinatario,
      subject: \`\${CONFIG.email.assunto} - \${new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}\`,
      html: montarEmailHTML(conteudo),
    });
    return NextResponse.json({ success: true, noticias: noticias.length });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
`;
}

function buildPageTsx(nomeDestinatario: string): string {
  return `export default function Home() {
  return (
    <main style={{ fontFamily: "Georgia,serif", minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <svg width="56" height="48" viewBox="0 0 72 62" fill="none" style={{ marginBottom: 24 }}>
          <polygon points="36,2 70,60 2,60" fill="none" stroke="#C9A462" strokeWidth="2.5" />
          <polygon points="36,18 58,58 14,58" fill="#000" />
        </svg>
        <div style={{ color: "#C9A462", fontSize: 13, letterSpacing: 5, marginBottom: 12 }}>AGENTE ATIVO</div>
        <div style={{ color: "#fff", fontSize: 20, letterSpacing: 3, fontWeight: 300 }}>${nomeDestinatario}</div>
        <div style={{ color: "#444", fontSize: 11, marginTop: 40, letterSpacing: 2 }}>CURADORIA IA — VÉRTICE CONSULTORIA ESTRATÉGICA</div>
      </div>
    </main>
  );
}
`;
}

function buildLayoutTsx(tituloEmail: string): string {
  return `export const metadata = { title: "${tituloEmail}" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="pt-BR"><body style={{ margin: 0, background: "#000" }}>{children}</body></html>);
}
`;
}

function buildPackageJson(repoName: string): string {
  return JSON.stringify({
    name: repoName, version: "1.0.0", private: true,
    scripts: { dev: "next dev", build: "next build", start: "next start" },
    dependencies: { next: "^14.2.0", "@google/genai": "^1.0.0", axios: "^1.7.9", xml2js: "^0.6.2", nodemailer: "^6.9.14" },
    devDependencies: { "@types/node": "^20.0.0", "@types/nodemailer": "^6.4.14", "@types/react": "^18.0.0", "@types/react-dom": "^18.0.0", "@types/xml2js": "^0.4.14", typescript: "^5.0.0" },
  }, null, 2);
}

const TSCONFIG = JSON.stringify({
  compilerOptions: {
    target: "ES2017", lib: ["dom", "dom.iterable", "esnext"], allowJs: true, skipLibCheck: true,
    strict: true, noEmit: true, esModuleInterop: true, module: "esnext", moduleResolution: "bundler",
    resolveJsonModule: true, isolatedModules: true, jsx: "preserve", incremental: true,
    plugins: [{ name: "next" }], paths: { "@/*": ["./*"] },
  },
  include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  exclude: ["node_modules"],
}, null, 2);

const GITIGNORE = `.next\nnode_modules\n.env.local\n.env\n`;

async function githubApi(path: string, method: string, body: unknown, token: string) {
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "Content-Type": "application/json", "X-GitHub-Api-Version": "2022-11-28" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function createBlob(owner: string, repo: string, content: string, token: string): Promise<string> {
  const { data } = await githubApi(`/repos/${owner}/${repo}/git/blobs`, "POST", { content: Buffer.from(content).toString("base64"), encoding: "base64" }, token);
  return data.sha as string;
}

async function uploadVercelFile(content: string, token: string): Promise<string> {
  const buf = Buffer.from(content);
  const sha1 = crypto.createHash("sha1").update(buf).digest("hex");
  await fetch("https://api.vercel.com/v2/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/octet-stream",
      "x-vercel-digest": sha1,
      "Content-Length": String(buf.length),
    },
    body: buf,
  });
  return sha1;
}

export async function POST(request: NextRequest) {
  const githubToken = process.env.GITHUB_TOKEN;
  const vercelToken = process.env.VERCEL_TOKEN;
  const geminiKey = process.env.GEMINI_API_KEY;
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!githubToken || !vercelToken || !geminiKey || !gmailUser || !gmailPass) {
    return NextResponse.json({ error: "Variáveis de ambiente não configuradas no servidor." }, { status: 500 });
  }

  let body: {
    nomeDestinatario: string; descricaoProfissional: string; identificacao: string;
    localidade: string; emailDestinatario: string; assunto: string; horario: number;
    area: string; areaCustom: string; feedsCustom: string; repoName: string;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const { repoName, nomeDestinatario } = body;
  if (!repoName || !nomeDestinatario) {
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
  }

  const cronSecret = crypto.randomUUID().replace(/-/g, "");
  const areaLabel = body.area === "outro" ? body.areaCustom : body.area;
  const tituloEmail = `CURADORIA ${areaLabel.toUpperCase()}`;

  const files: Array<{ path: string; content: string }> = [
    { path: "package.json", content: buildPackageJson(repoName) },
    { path: "tsconfig.json", content: TSCONFIG },
    { path: "vercel.json", content: JSON.stringify({ framework: "nextjs", crons: [{ path: "/api/cron/resumo", schedule: getCronSchedule(body.horario || 20) }] }, null, 2) },
    { path: ".gitignore", content: GITIGNORE },
    { path: "config.ts", content: buildConfig(body) },
    { path: "app/layout.tsx", content: buildLayoutTsx(tituloEmail) },
    { path: "app/page.tsx", content: buildPageTsx(nomeDestinatario) },
    { path: "app/api/cron/resumo/route.ts", content: buildCronRoute() },
  ];

  // Use a project name with prefix to avoid GitHub auto-link (Vercel auto-links repos with same name)
  const vercelProjectName = `vertice-${repoName}`;

  // Delete any existing Vercel project with this name
  await fetch(`https://api.vercel.com/v9/projects/${vercelProjectName}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${vercelToken}` },
  });

  // 1. Create Vercel project (standalone, no GitHub)
  let vercelProjectId: string;
  const vercelRes = await fetch("https://api.vercel.com/v10/projects", {
    method: "POST",
    headers: { Authorization: `Bearer ${vercelToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name: vercelProjectName, framework: "nextjs" }),
  });
  const vercelData = await vercelRes.json() as Record<string, unknown>;
  if (!vercelRes.ok) {
    return NextResponse.json({ error: `Falha ao criar projeto Vercel: ${JSON.stringify(vercelData)}` }, { status: 500 });
  }
  vercelProjectId = vercelData.id as string;

  // 2. Set env vars
  await fetch(`https://api.vercel.com/v10/projects/${vercelProjectId}/env`, {
    method: "POST",
    headers: { Authorization: `Bearer ${vercelToken}`, "Content-Type": "application/json" },
    body: JSON.stringify([
      { key: "GEMINI_API_KEY", value: geminiKey, type: "encrypted", target: ["production"] },
      { key: "GMAIL_USER", value: gmailUser, type: "encrypted", target: ["production"] },
      { key: "GMAIL_APP_PASSWORD", value: gmailPass, type: "encrypted", target: ["production"] },
      { key: "CRON_SECRET", value: cronSecret, type: "encrypted", target: ["production"] },
    ]),
  });

  // 3. Upload files and deploy directly to Vercel (no GitHub needed)
  let deployOk = false;
  try {
    const vercelFiles = await Promise.all(
      files.map(async f => ({ file: f.path, sha: await uploadVercelFile(f.content, vercelToken), size: Buffer.byteLength(f.content) }))
    );
    const deployRes = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: { Authorization: `Bearer ${vercelToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: vercelProjectName,
        project: vercelProjectId,
        target: "production",
        files: vercelFiles,
        projectSettings: { framework: "nextjs" },
      }),
    });
    const deployData = await deployRes.json() as Record<string, unknown>;
    if (!deployRes.ok) console.error("Deploy error:", JSON.stringify(deployData));
    else deployOk = true;
  } catch (err) {
    console.error("Deploy error:", err);
  }

  const appUrl = `https://${vercelProjectName}.vercel.app`;
  return NextResponse.json({
    success: true,
    appUrl,
    testUrl: `${appUrl}/api/cron/resumo?secret=${cronSecret}`,
    cronSecret,
    deployOk,
    nota: "Projeto criado sem GitHub. O código roda diretamente no Vercel.",
  });
}
