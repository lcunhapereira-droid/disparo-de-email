"use client";
import { useState } from "react";

const CORES_PRESET = [
  { nome: "Dourado Vértice", primaria: "#C9A462", secundaria: "#b8945a" },
  { nome: "Azul Corporativo", primaria: "#1a3a5c", secundaria: "#2a5a8c" },
  { nome: "Verde Saúde", primaria: "#2e7d5e", secundaria: "#4aa07d" },
  { nome: "Roxo Tech", primaria: "#6b3fa0", secundaria: "#8f5cc7" },
  { nome: "Vermelho Jurídico", primaria: "#a02020", secundaria: "#c74040" },
  { nome: "Cinza Moderno", primaria: "#888888", secundaria: "#aaaaaa" },
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

  const ouro = "#C9A462";

  return (
    <main style={{ background: "#000", minHeight: "100vh", fontFamily: "Georgia,serif" }}>
      <div style={{ background: "#000", borderBottom: "1px solid #222", padding: "30px 40px", textAlign: "center" }}>
        <a href="/" style={{ textDecoration: "none" }}>
          <div style={{ color: ouro, margin: "0 0 6px", fontSize: 11, letterSpacing: 4 }}>VÉRTICE CONSULTORIA ESTRATÉGICA</div>
        </a>
        <h1 style={{ color: "#fff", margin: 0, fontSize: 20, letterSpacing: 3, fontWeight: "normal" }}>CONFIGURAÇÃO DE AGENTE</h1>
        <p style={{ color: "#555", margin: "8px 0 0", fontSize: 12, letterSpacing: 1 }}>Preencha o formulário e receba o config.ts pronto</p>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px" }}>

        {[
          { titulo: "1. QUEM VAI RECEBER", campos: [
            ["nomeDestinatario", "Nome completo *", "Ex: Dr. João Silva / Maria Souza"],
            ["descricaoProfissional", "Área ou profissão *", "Ex: Advogado Tributarista / Dev Full Stack"],
            ["identificacao", "Registro profissional (opcional)", "Ex: CRM MG 12345 / OAB SP 98765"],
            ["localidade", "Cidade / País *", "Ex: São Paulo, Brasil"],
            ["tituloEmail", "Título do e-mail *", "Ex: CURADORIA TECH / RADAR JURIDICO"],
          ]},
        ].map(({ titulo, campos }) => (
          <div key={titulo} style={{ background: "#0a0a0a", border: "1px solid #222", borderRadius: 2, padding: 24, marginBottom: 20 }}>
            <h2 style={{ color: ouro, fontSize: 13, margin: "0 0 20px", letterSpacing: 2 }}>{titulo}</h2>
            {(campos as [string, string, string][]).map(([k, lbl, ph]) => (
              <div key={k} style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 11, color: "#666", marginBottom: 6, letterSpacing: 1 }}>{lbl}</label>
                <input style={{ width: "100%", padding: "10px 12px", border: "1px solid #333", borderRadius: 2, fontSize: 14, fontFamily: "Georgia,serif", boxSizing: "border-box", background: "#111", color: "#ddd" }} placeholder={ph} value={(form as Record<string,string>)[k]} onChange={e => set(k, e.target.value)} />
              </div>
            ))}
          </div>
        ))}

        <div style={{ background: "#0a0a0a", border: "1px solid #222", borderRadius: 2, padding: 24, marginBottom: 20 }}>
          <h2 style={{ color: ouro, fontSize: 13, margin: "0 0 20px", letterSpacing: 2 }}>2. CONFIGURAÇÃO DE E-MAIL</h2>
          {[
            ["emailDestinatario", "E-mail de destino *", "email@exemplo.com"],
            ["assunto", "Assunto do e-mail", "Curadoria Diaria"],
          ].map(([k, lbl, ph]) => (
            <div key={k} style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, color: "#666", marginBottom: 6, letterSpacing: 1 }}>{lbl}</label>
              <input style={{ width: "100%", padding: "10px 12px", border: "1px solid #333", borderRadius: 2, fontSize: 14, fontFamily: "Georgia,serif", boxSizing: "border-box", background: "#111", color: "#ddd" }} placeholder={ph} value={(form as Record<string,string>)[k]} onChange={e => set(k, e.target.value)} />
            </div>
          ))}
          <div>
            <label style={{ display: "block", fontSize: 11, color: "#666", marginBottom: 6, letterSpacing: 1 }}>HORÁRIO DE ENVIO (BRASÍLIA)</label>
            <select style={{ width: "100%", padding: "10px 12px", border: "1px solid #333", borderRadius: 2, fontSize: 14, fontFamily: "Georgia,serif", background: "#111", color: "#ddd" }} value={form.horario} onChange={e => set("horario", e.target.value)}>
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{String(i).padStart(2, "0")}h00</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ background: "#0a0a0a", border: "1px solid #222", borderRadius: 2, padding: 24, marginBottom: 20 }}>
          <h2 style={{ color: ouro, fontSize: 13, margin: "0 0 20px", letterSpacing: 2 }}>3. COR DO E-MAIL</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {CORES_PRESET.map((c, i) => (
              <button key={i} onClick={() => set("corPreset", String(i))} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", border: form.corPreset === i ? `1px solid ${ouro}` : "1px solid #333", borderRadius: 2, background: "#000", cursor: "pointer", fontSize: 12, fontFamily: "Georgia,serif", color: form.corPreset === i ? ouro : "#666" }}>
                <span style={{ width: 14, height: 14, borderRadius: "50%", background: c.primaria, display: "inline-block", flexShrink: 0 }} />
                {c.nome}
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: "#0a0a0a", border: "1px solid #222", borderRadius: 2, padding: 24, marginBottom: 20 }}>
          <h2 style={{ color: ouro, fontSize: 13, margin: "0 0 8px", letterSpacing: 2 }}>4. FONTES DE CONTEÚDO (RSS)</h2>
          <p style={{ fontSize: 12, color: "#555", margin: "0 0 16px", letterSpacing: 1 }}>Use exemplos ou cole URLs de feeds RSS</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {(Object.keys(FEEDS_EXEMPLO) as Array<keyof typeof FEEDS_EXEMPLO>).map(area => (
              <button key={area} onClick={() => usarExemplo(area)} style={{ padding: "6px 14px", background: "#000", border: `1px solid ${ouro}`, borderRadius: 2, cursor: "pointer", fontSize: 11, fontFamily: "Georgia,serif", color: ouro, letterSpacing: 1 }}>
                + {area.toUpperCase()}
              </button>
            ))}
          </div>
          {feeds.map((feed, i) => (
            <div key={i} style={{ background: "#111", border: "1px solid #222", borderRadius: 2, padding: 16, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: "#555", letterSpacing: 1 }}>FEED {i + 1}</span>
                {feeds.length > 1 && <button onClick={() => removeFeed(i)} style={{ background: "none", border: "none", color: "#c00", cursor: "pointer", fontSize: 12 }}>remover</button>}
              </div>
              {(["url", "categoria", "fonte"] as const).map(k => (
                <input key={k} style={{ width: "100%", padding: "8px 10px", border: "1px solid #333", borderRadius: 2, fontSize: 13, fontFamily: "Georgia,serif", marginBottom: 8, boxSizing: "border-box", background: "#0a0a0a", color: "#ddd" }} placeholder={k === "url" ? "https://site.com/rss.xml" : k === "categoria" ? "Ex: Tecnologia" : "Ex: TechCrunch"} value={feed[k]} onChange={e => updateFeed(i, k, e.target.value)} />
              ))}
            </div>
          ))}
          <button onClick={addFeed} style={{ width: "100%", padding: "10px", border: "1px dashed #333", borderRadius: 2, background: "none", cursor: "pointer", color: "#555", fontSize: 13, fontFamily: "Georgia,serif" }}>+ Adicionar feed</button>
        </div>

        <div style={{ background: "#0a0a0a", border: "1px solid #222", borderRadius: 2, padding: 24, marginBottom: 20 }}>
          <h2 style={{ color: ouro, fontSize: 13, margin: "0 0 8px", letterSpacing: 2 }}>5. SEÇÕES DO E-MAIL</h2>
          <p style={{ fontSize: 12, color: "#555", margin: "0 0 12px", letterSpacing: 1 }}>Uma seção por linha</p>
          <textarea style={{ width: "100%", padding: "10px 12px", border: "1px solid #333", borderRadius: 2, fontSize: 14, fontFamily: "Georgia,serif", boxSizing: "border-box", minHeight: 100, background: "#111", color: "#ddd" }} value={form.secoes} onChange={e => set("secoes", e.target.value)} />
        </div>

        <div style={{ background: "#0a0a0a", border: "1px solid #222", borderRadius: 2, padding: 24, marginBottom: 20 }}>
          <h2 style={{ color: ouro, fontSize: 13, margin: "0 0 8px", letterSpacing: 2 }}>6. FILTRO DE QUALIDADE</h2>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 11, color: "#666", marginBottom: 6, letterSpacing: 1 }}>O QUE INCLUIR (um por linha)</label>
            <textarea style={{ width: "100%", padding: "10px 12px", border: "1px solid #333", borderRadius: 2, fontSize: 14, fontFamily: "Georgia,serif", boxSizing: "border-box", minHeight: 80, background: "#111", color: "#ddd" }} value={form.incluir} onChange={e => set("incluir", e.target.value)} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, color: "#666", marginBottom: 6, letterSpacing: 1 }}>O QUE EXCLUIR (um por linha)</label>
            <textarea style={{ width: "100%", padding: "10px 12px", border: "1px solid #333", borderRadius: 2, fontSize: 14, fontFamily: "Georgia,serif", boxSizing: "border-box", minHeight: 80, background: "#111", color: "#ddd" }} value={form.excluir} onChange={e => set("excluir", e.target.value)} />
          </div>
        </div>

        <div style={{ background: "#0a0a0a", border: "1px solid #222", borderRadius: 2, padding: 24, marginBottom: 28 }}>
          <h2 style={{ color: ouro, fontSize: 13, margin: "0 0 12px", letterSpacing: 2 }}>7. IDIOMA DE SAÍDA</h2>
          <select style={{ width: "100%", padding: "10px 12px", border: "1px solid #333", borderRadius: 2, fontSize: 14, fontFamily: "Georgia,serif", background: "#111", color: "#ddd" }} value={form.idioma} onChange={e => set("idioma", e.target.value)}>
            <option value="portugues brasileiro">Português Brasileiro</option>
            <option value="ingles">Inglês</option>
            <option value="espanhol">Espanhol</option>
            <option value="frances">Francês</option>
          </select>
        </div>

        <button onClick={gerar} style={{ width: "100%", padding: "16px", background: ouro, color: "#000", border: "none", borderRadius: 2, fontSize: 13, fontFamily: "Georgia,serif", cursor: "pointer", letterSpacing: 3, marginBottom: 32, fontWeight: "bold" }}>
          GERAR MEU CONFIG.TS
        </button>

        {gerado && (
          <div style={{ background: "#0a0a0a", border: "1px solid #222", borderRadius: 2, padding: 24, marginBottom: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ color: ouro, fontSize: 13, margin: 0, letterSpacing: 2 }}>CONFIG.TS PRONTO</h2>
              <button onClick={copiar} style={{ padding: "8px 20px", background: copiado ? "#2e7d5e" : ouro, color: "#000", border: "none", borderRadius: 2, cursor: "pointer", fontSize: 11, fontFamily: "Georgia,serif", letterSpacing: 2, fontWeight: "bold" }}>
                {copiado ? "✓ COPIADO" : "COPIAR"}
              </button>
            </div>
            <pre style={{ background: "#000", color: "#e8e8e8", padding: 20, borderRadius: 2, fontSize: 12, overflow: "auto", lineHeight: 1.6, margin: 0, border: "1px solid #222" }}>{gerado}</pre>

            <div style={{ background: "#000", border: `1px solid ${ouro}`, borderRadius: 2, padding: 20, marginTop: 20 }}>
              <h3 style={{ color: ouro, fontSize: 12, margin: "0 0 12px", letterSpacing: 2 }}>PRÓXIMOS PASSOS</h3>
              <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "#888", lineHeight: 2 }}>
                <li>Copie o código acima</li>
                <li>Abra o GitHub → repositório → arquivo <strong style={{ color: ouro }}>config.ts</strong></li>
                <li>Clique no lápis (editar) e cole o conteúdo</li>
                <li>Clique em <strong style={{ color: ouro }}>Commit changes</strong></li>
                <li>No Vercel, configure: <code style={{ background: "#111", padding: "2px 6px", borderRadius: 2, fontSize: 11, color: ouro }}>GEMINI_API_KEY</code> <code style={{ background: "#111", padding: "2px 6px", borderRadius: 2, fontSize: 11, color: ouro }}>RESEND_API_KEY</code> <code style={{ background: "#111", padding: "2px 6px", borderRadius: 2, fontSize: 11, color: ouro }}>CRON_SECRET</code></li>
                <li>Acesse <strong style={{ color: ouro }}>/api/cron/resumo?secret=SUA_SENHA</strong> para testar</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
