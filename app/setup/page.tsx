"use client";
import { useState } from "react";

const CORES_PRESET = [
  { nome: "Azul Vértice", primaria: "#1a3a5c", secundaria: "#2a5a8c" },
  { nome: "Dourado Elegante", primaria: "#9B8559", secundaria: "#b8a07a" },
  { nome: "Verde Saude", primaria: "#2e7d5e", secundaria: "#4aa07d" },
  { nome: "Roxo Tech", primaria: "#6b3fa0", secundaria: "#8f5cc7" },
  { nome: "Vermelho Juridico", primaria: "#a02020", secundaria: "#c74040" },
  { nome: "Cinza Moderno", primaria: "#444444", secundaria: "#666666" },
];

const FEEDS_EXEMPLO = {
  medicina: [
    { url: "https://www.sciencedaily.com/rss/health_medicine/obesity.xml", categoria: "Endocrinologia", fonte: "ScienceDaily - Obesidade" },
    { url: "https://www.nejm.org/action/showFeed?jc=nejm&type=etoc&feed=rss", categoria: "Geral", fonte: "New England Journal of Medicine" },
  ],
  tecnologia: [
    { url: "https://dev.to/feed", categoria: "Programacao", fonte: "Dev.to" },
    { url: "https://feeds.feedburner.com/TechCrunch", categoria: "Tecnologia", fonte: "TechCrunch" },
  ],
  direito: [
    { url: "https://www.conjur.com.br/rss.xml", categoria: "Geral", fonte: "Conjur" },
  ],
  financas: [
    { url: "https://feeds.bloomberg.com/markets/news.rss", categoria: "Mercado", fonte: "Bloomberg Markets" },
  ],
};

type Feed = { url: string; categoria: string; fonte: string };

export default function SetupPage() {
  const [form, setForm] = useState({
    nomeDestinatario: "",
    descricaoProfissional: "",
    identificacao: "",
    localidade: "",
    tituloEmail: "",
    emailDestinatario: "",
    assunto: "Curadoria Diaria",
    corPreset: 0,
    secoes: "SECAO 1\nSECAO 2\nSECAO 3",
    incluir: "Conteudo relevante e atual\nEstudos e pesquisas reconhecidas\nNovidades com impacto pratico",
    excluir: "Conteudo promocional ou publicitario\nEventos e chamadas de trabalhos\nOpiniao sem embasamento",
    idioma: "portugues brasileiro",
    horario: "20",
  });
  const [feeds, setFeeds] = useState<Feed[]>([{ url: "", categoria: "", fonte: "" }]);
  const [gerado, setGerado] = useState("");
  const [copiado, setCopiado] = useState(false);

  function set(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  function addFeed() {
    setFeeds(f => [...f, { url: "", categoria: "", fonte: "" }]);
  }

  function updateFeed(i: number, k: keyof Feed, v: string) {
    setFeeds(f => f.map((feed, idx) => idx === i ? { ...feed, [k]: v } : feed));
  }

  function removeFeed(i: number) {
    setFeeds(f => f.filter((_, idx) => idx !== i));
  }

  function usarExemplo(area: keyof typeof FEEDS_EXEMPLO) {
    setFeeds(FEEDS_EXEMPLO[area]);
  }

  function gerar() {
    const hora = parseInt(form.horario) + 3;
    const cron = `0 ${hora % 24} * * *`;
    const cor = CORES_PRESET[form.corPreset];
    const feedsStr = feeds.filter(f => f.url).map(f =>
      `    {\n      url: "${f.url}",\n      categoria: "${f.categoria}",\n      fonte: "${f.fonte}",\n    },`
    ).join("\n");
    const secoesStr = form.secoes.split("\n").filter(Boolean).map(s => `    "${s.trim()}",`).join("\n");
    const incluirStr = form.incluir.split("\n").filter(Boolean).map(s => `      "${s.trim()}",`).join("\n");
    const excluirStr = form.excluir.split("\n").filter(Boolean).map(s => `      "${s.trim()}",`).join("\n");

    const config = `export const CONFIG = {\n\n  identidade: {\n    nomeDestinatario: "${form.nomeDestinatario}",\n    descricaoProfissional: "${form.descricaoProfissional}",\n    identificacao: "${form.identificacao}",\n    localidade: "${form.localidade}",\n    tituloEmail: "${form.tituloEmail || "CURADORIA DIARIA"}",\n  },\n\n  email: {\n    destinatario: "${form.emailDestinatario}",\n    assunto: "${form.assunto}",\n    remetente: "Curadoria IA <onboarding@resend.dev>",\n  },\n\n  cronSchedule: "${cron}",\n\n  visual: {\n    corPrimaria: "${cor.primaria}",\n    corSecundaria: "${cor.secundaria}",\n    corFundo: "#F9F8F7",\n    corBannerTexto: "#F0F0F0",\n    corDataFundo: "#E8EEF0",\n    corDataTexto: "#336655",\n    corRodape: "#1a1a1a",\n  },\n\n  feeds: [\n${feedsStr}\n  ],\n\n  secoes: [\n${secoesStr}\n  ],\n\n  filtro: {\n    incluir: [\n${incluirStr}\n    ],\n    excluir: [\n${excluirStr}\n    ],\n  },\n\n  idiomaSaida: "${form.idioma}",\n\n};`;

    setGerado(config);
    setCopiado(false);
  }

  function copiar() {
    navigator.clipboard.writeText(gerado);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  }

  const cor = "#1a3a5c";

  return (
    <main style={{ background: "#F9F8F7", minHeight: "100vh", fontFamily: "Georgia,serif" }}>
      <div style={{ background: "linear-gradient(135deg,#1a3a5c,#2a5a8c)", padding: "30px 40px", textAlign: "center" }}>
        <p style={{ color: "#a0c0e0", margin: "0 0 6px", fontSize: 11, letterSpacing: 3 }}>VÉRTICE CONSULTORIA ESTRATÉGICA</p>
        <h1 style={{ color: "#fff", margin: 0, fontSize: 22, letterSpacing: 2, fontWeight: "normal" }}>CONFIGURAÇÃO DE AGENTE</h1>
        <p style={{ color: "#c0d8f0", margin: "8px 0 0", fontSize: 13 }}>Preencha o formulário e receba o config.ts pronto</p>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px" }}>

        <div style={{ background: "#fff", border: "1px solid #dce8f0", borderRadius: 10, padding: 24, marginBottom: 20 }}>
          <h2 style={{ color: cor, fontSize: 16, margin: "0 0 20px", letterSpacing: 1 }}>1. QUEM VAI RECEBER</h2>
          {([
            ["nomeDestinatario", "Nome completo *", "Ex: Dr. João Silva / Maria Souza"],
            ["descricaoProfissional", "Área ou profissão *", "Ex: Advogado Tributarista / Desenvolvedor Full Stack"],
            ["identificacao", "Registro profissional (opcional)", "Ex: CRM MG 12345 / OAB SP 98765"],
            ["localidade", "Cidade / País *", "Ex: São Paulo, Brasil"],
            ["tituloEmail", "Título do e-mail *", "Ex: CURADORIA TECH / RADAR JURIDICO / RESUMO DIARIO"],
          ] as [string, string, string][]).map(([k, lbl, ph]) => (
            <div key={k} style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, color: "#666", marginBottom: 6 }}>{lbl}</label>
              <input style={{ width: "100%", padding: "10px 12px", border: "1px solid #c0d0e0", borderRadius: 6, fontSize: 14, fontFamily: "Georgia,serif", boxSizing: "border-box" }} placeholder={ph} value={(form as Record<string,string>)[k]} onChange={e => set(k, e.target.value)} />
            </div>
          ))}
        </div>

        <div style={{ background: "#fff", border: "1px solid #dce8f0", borderRadius: 10, padding: 24, marginBottom: 20 }}>
          <h2 style={{ color: cor, fontSize: 16, margin: "0 0 20px", letterSpacing: 1 }}>2. CONFIGURAÇÃO DE E-MAIL</h2>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, color: "#666", marginBottom: 6 }}>E-mail de destino *</label>
            <input style={{ width: "100%", padding: "10px 12px", border: "1px solid #c0d0e0", borderRadius: 6, fontSize: 14, fontFamily: "Georgia,serif", boxSizing: "border-box" }} placeholder="email@exemplo.com" value={form.emailDestinatario} onChange={e => set("emailDestinatario", e.target.value)} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, color: "#666", marginBottom: 6 }}>Assunto do e-mail</label>
            <input style={{ width: "100%", padding: "10px 12px", border: "1px solid #c0d0e0", borderRadius: 6, fontSize: 14, fontFamily: "Georgia,serif", boxSizing: "border-box" }} value={form.assunto} onChange={e => set("assunto", e.target.value)} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, color: "#666", marginBottom: 6 }}>Horário de envio (horário de Brasília)</label>
            <select style={{ width: "100%", padding: "10px 12px", border: "1px solid #c0d0e0", borderRadius: 6, fontSize: 14, fontFamily: "Georgia,serif" }} value={form.horario} onChange={e => set("horario", e.target.value)}>
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{String(i).padStart(2, "0")}h00</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #dce8f0", borderRadius: 10, padding: 24, marginBottom: 20 }}>
          <h2 style={{ color: cor, fontSize: 16, margin: "0 0 20px", letterSpacing: 1 }}>3. COR DO E-MAIL</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {CORES_PRESET.map((c, i) => (
              <button key={i} onClick={() => set("corPreset", String(i))} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", border: form.corPreset === i ? `2px solid ${cor}` : "2px solid #ddd", borderRadius: 20, background: "#fff", cursor: "pointer", fontSize: 13, fontFamily: "Georgia,serif" }}>
                <span style={{ width: 16, height: 16, borderRadius: "50%", background: c.primaria, display: "inline-block" }} />
                {c.nome}
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #dce8f0", borderRadius: 10, padding: 24, marginBottom: 20 }}>
          <h2 style={{ color: cor, fontSize: 16, margin: "0 0 8px", letterSpacing: 1 }}>4. FONTES DE CONTEÚDO (RSS)</h2>
          <p style={{ fontSize: 13, color: "#888", margin: "0 0 16px" }}>Use exemplos prontos ou cole as URLs dos seus sites favoritos</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {(Object.keys(FEEDS_EXEMPLO) as Array<keyof typeof FEEDS_EXEMPLO>).map(area => (
              <button key={area} onClick={() => usarExemplo(area)} style={{ padding: "6px 14px", background: "#eef4fa", border: "1px solid #c0d0e0", borderRadius: 20, cursor: "pointer", fontSize: 13, fontFamily: "Georgia,serif", color: cor }}>
                + {area.charAt(0).toUpperCase() + area.slice(1)}
              </button>
            ))}
          </div>
          {feeds.map((feed, i) => (
            <div key={i} style={{ background: "#f8fbff", border: "1px solid #dce8f0", borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: "#999" }}>Feed {i + 1}</span>
                {feeds.length > 1 && <button onClick={() => removeFeed(i)} style={{ background: "none", border: "none", color: "#c00", cursor: "pointer", fontSize: 13 }}>remover</button>}
              </div>
              {(["url", "categoria", "fonte"] as const).map(k => (
                <input key={k} style={{ width: "100%", padding: "8px 10px", border: "1px solid #c0d0e0", borderRadius: 6, fontSize: 13, fontFamily: "Georgia,serif", marginBottom: 8, boxSizing: "border-box" }} placeholder={k === "url" ? "https://site.com/rss.xml" : k === "categoria" ? "Ex: Tecnologia" : "Ex: TechCrunch"} value={feed[k]} onChange={e => updateFeed(i, k, e.target.value)} />
              ))}
            </div>
          ))}
          <button onClick={addFeed} style={{ width: "100%", padding: "10px", border: `2px dashed #c0d0e0`, borderRadius: 8, background: "none", cursor: "pointer", color: cor, fontSize: 14, fontFamily: "Georgia,serif" }}>+ Adicionar feed</button>
        </div>

        <div style={{ background: "#fff", border: "1px solid #dce8f0", borderRadius: 10, padding: 24, marginBottom: 20 }}>
          <h2 style={{ color: cor, fontSize: 16, margin: "0 0 8px", letterSpacing: 1 }}>5. SEÇÕES DO E-MAIL</h2>
          <p style={{ fontSize: 13, color: "#888", margin: "0 0 12px" }}>Uma seção por linha — como o conteúdo será agrupado</p>
          <textarea style={{ width: "100%", padding: "10px 12px", border: "1px solid #c0d0e0", borderRadius: 6, fontSize: 14, fontFamily: "Georgia,serif", boxSizing: "border-box", minHeight: 100 }} value={form.secoes} onChange={e => set("secoes", e.target.value)} />
        </div>

        <div style={{ background: "#fff", border: "1px solid #dce8f0", borderRadius: 10, padding: 24, marginBottom: 20 }}>
          <h2 style={{ color: cor, fontSize: 16, margin: "0 0 8px", letterSpacing: 1 }}>6. FILTRO DE QUALIDADE</h2>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, color: "#666", marginBottom: 6 }}>O que incluir (um por linha)</label>
            <textarea style={{ width: "100%", padding: "10px 12px", border: "1px solid #c0d0e0", borderRadius: 6, fontSize: 14, fontFamily: "Georgia,serif", boxSizing: "border-box", minHeight: 80 }} value={form.incluir} onChange={e => set("incluir", e.target.value)} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, color: "#666", marginBottom: 6 }}>O que excluir (um por linha)</label>
            <textarea style={{ width: "100%", padding: "10px 12px", border: "1px solid #c0d0e0", borderRadius: 6, fontSize: 14, fontFamily: "Georgia,serif", boxSizing: "border-box", minHeight: 80 }} value={form.excluir} onChange={e => set("excluir", e.target.value)} />
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #dce8f0", borderRadius: 10, padding: 24, marginBottom: 28 }}>
          <h2 style={{ color: cor, fontSize: 16, margin: "0 0 12px", letterSpacing: 1 }}>7. IDIOMA DE SAÍDA</h2>
          <select style={{ width: "100%", padding: "10px 12px", border: "1px solid #c0d0e0", borderRadius: 6, fontSize: 14, fontFamily: "Georgia,serif" }} value={form.idioma} onChange={e => set("idioma", e.target.value)}>
            <option value="portugues brasileiro">Português Brasileiro</option>
            <option value="ingles">Inglês</option>
            <option value="espanhol">Espanhol</option>
            <option value="frances">Francês</option>
          </select>
        </div>

        <button onClick={gerar} style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg,#1a3a5c,#2a5a8c)", color: "#fff", border: "none", borderRadius: 10, fontSize: 16, fontFamily: "Georgia,serif", cursor: "pointer", letterSpacing: 1, marginBottom: 32 }}>
          GERAR MEU CONFIG.TS
        </button>

        {gerado && (
          <div style={{ background: "#fff", border: "1px solid #dce8f0", borderRadius: 10, padding: 24, marginBottom: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ color: cor, fontSize: 16, margin: 0, letterSpacing: 1 }}>SEU CONFIG.TS PRONTO</h2>
              <button onClick={copiar} style={{ padding: "8px 20px", background: copiado ? "#2e7d5e" : cor, color: "#fff", border: "none", borderRadius: 20, cursor: "pointer", fontSize: 13, fontFamily: "Georgia,serif" }}>
                {copiado ? "✓ Copiado!" : "Copiar"}
              </button>
            </div>
            <pre style={{ background: "#1a1a1a", color: "#e8e8e8", padding: 20, borderRadius: 8, fontSize: 12, overflow: "auto", lineHeight: 1.6, margin: 0 }}>{gerado}</pre>

            <div style={{ background: "#eef4fa", border: "1px solid #c0d0e0", borderRadius: 8, padding: 20, marginTop: 20 }}>
              <h3 style={{ color: cor, fontSize: 14, margin: "0 0 12px", letterSpacing: 1 }}>PRÓXIMOS PASSOS</h3>
              <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "#555", lineHeight: 2 }}>
                <li>Copie o código acima</li>
                <li>Abra o GitHub → repositório → arquivo <strong>config.ts</strong></li>
                <li>Clique no lápis (editar) e cole o conteúdo</li>
                <li>Clique em <strong>Commit changes</strong></li>
                <li>No Vercel, configure as variáveis de ambiente:<br />
                  <code style={{ background: "#fff", padding: "2px 6px", borderRadius: 4, fontSize: 12 }}>GEMINI_API_KEY</code> &nbsp;
                  <code style={{ background: "#fff", padding: "2px 6px", borderRadius: 4, fontSize: 12 }}>RESEND_API_KEY</code> &nbsp;
                  <code style={{ background: "#fff", padding: "2px 6px", borderRadius: 4, fontSize: 12 }}>CRON_SECRET</code>
                </li>
                <li>Acesse <strong>/api/cron/resumo?secret=SUA_SENHA</strong> para testar</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
