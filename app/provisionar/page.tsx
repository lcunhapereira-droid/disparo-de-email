"use client";

import { useState, useEffect } from "react";

type Area =
  | "medicina"
  | "tecnologia"
  | "direito"
  | "financas"
  | "marketing"
  | "programacao"
  | "saude"
  | "negocios"
  | "educacao"
  | "outro";

interface FormData {
  nomeDestinatario: string;
  descricaoProfissional: string;
  identificacao: string;
  localidade: string;
  emailDestinatario: string;
  assunto: string;
  horario: number;
  area: Area;
  areaCustom: string;
  feedsCustom: string;
  geminiKey: string;
  resendKey: string;
  repoName: string;
}

interface SuccessData {
  repoUrl: string;
  appUrl: string;
  testUrl: string;
  cronSecret: string;
}

function slugify(name: string): string {
  return (
    "agente-" +
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 30)
  );
}

const AREA_LABELS: Record<Area, string> = {
  medicina: "Medicina",
  tecnologia: "Tecnologia",
  direito: "Direito",
  financas: "Finanças",
  marketing: "Marketing",
  programacao: "Programação",
  saude: "Saúde",
  negocios: "Negócios",
  educacao: "Educação",
  outro: "Outro",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#0a0a0a",
  border: "1px solid #333",
  borderRadius: 3,
  color: "#fff",
  padding: "10px 12px",
  fontSize: 13,
  fontFamily: "Georgia, serif",
  boxSizing: "border-box",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  color: "#888",
  fontSize: 11,
  letterSpacing: 2,
  marginBottom: 6,
  display: "block",
};

const sectionStyle: React.CSSProperties = {
  borderTop: "1px solid #1a1a1a",
  paddingTop: 24,
  marginTop: 24,
};

const sectionTitleStyle: React.CSSProperties = {
  color: "#C9A462",
  fontSize: 10,
  letterSpacing: 4,
  marginBottom: 18,
};

export default function ProvisionarPage() {
  const [form, setForm] = useState<FormData>({
    nomeDestinatario: "",
    descricaoProfissional: "",
    identificacao: "",
    localidade: "",
    emailDestinatario: "",
    assunto: "Curadoria Diaria",
    horario: 20,
    area: "tecnologia",
    areaCustom: "",
    feedsCustom: "",
    geminiKey: "",
    resendKey: "",
    repoName: "",
  });

  const [repoEdited, setRepoEdited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [success, setSuccess] = useState<SuccessData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!repoEdited && form.nomeDestinatario) {
      setForm((f) => ({ ...f, repoName: slugify(form.nomeDestinatario) }));
    }
  }, [form.nomeDestinatario, repoEdited]);

  function set(field: keyof FormData, value: string | number) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(null);
    setLoading(true);
    setLoadingStep("Criando repositório GitHub...");

    const steps = [
      { delay: 1200, msg: "Enviando arquivos do projeto..." },
      { delay: 2500, msg: "Configurando projeto Vercel..." },
      { delay: 4000, msg: "Definindo variáveis de ambiente..." },
      { delay: 5500, msg: "Aguarde ~2 minutos para o primeiro deploy..." },
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < steps.length) {
        setLoadingStep(steps[stepIdx].msg);
        stepIdx++;
      }
    }, 1500);

    try {
      const res = await fetch("/api/provisionar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      clearInterval(interval);
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Erro desconhecido ao provisionar.");
      } else {
        setSuccess(data);
      }
    } catch (err) {
      clearInterval(interval);
      setError(err instanceof Error ? err.message : "Erro de rede.");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  }

  if (success) {
    return (
      <main style={{ fontFamily: "Georgia, serif", minHeight: "100vh", background: "#000", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <header style={{ width: "100%", background: "#000", padding: "32px 20px 28px", textAlign: "center", borderBottom: "1px solid #222" }}>
          <svg width="48" height="42" viewBox="0 0 72 62" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: 12 }}>
            <polygon points="36,2 70,60 2,60" fill="none" stroke="#C9A462" strokeWidth="2.5" />
            <polygon points="36,18 58,58 14,58" fill="#000" />
          </svg>
          <div style={{ color: "#C9A462", fontSize: 13, letterSpacing: 4 }}>AGENTE CRIADO COM SUCESSO</div>
        </header>
        <div style={{ maxWidth: 560, width: "100%", padding: "40px 20px", boxSizing: "border-box" }}>
          <div style={{ background: "#0a0a0a", border: "1px solid #C9A462", borderRadius: 4, padding: 28 }}>
            <div style={{ color: "#C9A462", fontSize: 10, letterSpacing: 4, marginBottom: 20 }}>DADOS DO AGENTE</div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ color: "#555", fontSize: 11, marginBottom: 4 }}>REPOSITÓRIO GITHUB</div>
              <a href={success.repoUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#C9A462", fontSize: 13, wordBreak: "break-all" }}>{success.repoUrl}</a>
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ color: "#555", fontSize: 11, marginBottom: 4 }}>URL DO APP (disponível após ~2 min)</div>
              <a href={success.appUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#C9A462", fontSize: 13, wordBreak: "break-all" }}>{success.appUrl}</a>
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ color: "#555", fontSize: 11, marginBottom: 4 }}>URL DE TESTE DO EMAIL</div>
              <a href={success.testUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#C9A462", fontSize: 13, wordBreak: "break-all" }}>{success.testUrl}</a>
            </div>

            <div style={{ background: "#111", border: "1px solid #333", borderRadius: 3, padding: 16, marginTop: 8 }}>
              <div style={{ color: "#C9A462", fontSize: 10, letterSpacing: 3, marginBottom: 8 }}>CRON_SECRET — SALVE AGORA</div>
              <div style={{ color: "#fff", fontSize: 13, fontFamily: "monospace", wordBreak: "break-all" }}>{success.cronSecret}</div>
              <div style={{ color: "#555", fontSize: 11, marginTop: 8 }}>Guarde este valor. É necessário para testar o envio manualmente.</div>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 24 }}>
            <a href="/provisionar" style={{ color: "#C9A462", fontSize: 12, letterSpacing: 2, textDecoration: "none" }}>← CRIAR OUTRO AGENTE</a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ fontFamily: "Georgia, serif", minHeight: "100vh", background: "#000", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <header style={{ width: "100%", background: "#000", padding: "32px 20px 28px", textAlign: "center", borderBottom: "1px solid #222" }}>
        <a href="/" style={{ textDecoration: "none" }}>
          <svg width="48" height="42" viewBox="0 0 72 62" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: 12 }}>
            <polygon points="36,2 70,60 2,60" fill="none" stroke="#C9A462" strokeWidth="2.5" />
            <polygon points="36,18 58,58 14,58" fill="#000" />
          </svg>
        </a>
        <div style={{ color: "#fff", fontSize: 22, letterSpacing: 8, fontWeight: 300, marginBottom: 6 }}>VÉRTICE</div>
        <div style={{ color: "#C9A462", fontSize: 10, letterSpacing: 5 }}>PROVISIONAR NOVO AGENTE</div>
      </header>

      <form onSubmit={handleSubmit} style={{ maxWidth: 560, width: "100%", padding: "32px 20px 60px", boxSizing: "border-box" }}>

        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>DADOS DO DESTINATÁRIO</div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>NOME COMPLETO *</label>
            <input style={inputStyle} required value={form.nomeDestinatario} onChange={(e) => set("nomeDestinatario", e.target.value)} placeholder="Ex: Dra. Maria Silva" />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>DESCRIÇÃO PROFISSIONAL *</label>
            <input style={inputStyle} required value={form.descricaoProfissional} onChange={(e) => set("descricaoProfissional", e.target.value)} placeholder="Ex: Médica especialista em cardiologia" />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>IDENTIFICAÇÃO (opcional)</label>
            <input style={inputStyle} value={form.identificacao} onChange={(e) => set("identificacao", e.target.value)} placeholder="Ex: CRM SP 12345, OAB/RJ 67890" />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>LOCALIDADE *</label>
            <input style={inputStyle} required value={form.localidade} onChange={(e) => set("localidade", e.target.value)} placeholder="Ex: São Paulo, Brasil" />
          </div>
        </div>

        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>E-MAIL</div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>E-MAIL DO DESTINATÁRIO *</label>
            <input style={inputStyle} type="email" required value={form.emailDestinatario} onChange={(e) => set("emailDestinatario", e.target.value)} placeholder="cliente@exemplo.com" />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>ASSUNTO</label>
            <input style={inputStyle} value={form.assunto} onChange={(e) => set("assunto", e.target.value)} placeholder="Curadoria Diaria" />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>HORÁRIO DE ENVIO (Brasília)</label>
            <select style={{ ...inputStyle, cursor: "pointer" }} value={form.horario} onChange={(e) => set("horario", parseInt(e.target.value))}>
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{String(i).padStart(2, "0")}:00</option>
              ))}
            </select>
          </div>
        </div>

        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>ÁREA DE INTERESSE</div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>ÁREA *</label>
            <select style={{ ...inputStyle, cursor: "pointer" }} value={form.area} onChange={(e) => set("area", e.target.value as Area)}>
              {(Object.entries(AREA_LABELS) as [Area, string][]).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          {form.area === "outro" && (
            <>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>ÁREA PERSONALIZADA *</label>
                <input style={inputStyle} value={form.areaCustom} onChange={(e) => set("areaCustom", e.target.value)} placeholder="Ex: Arquitetura, Nutrição Esportiva..." required={form.area === "outro"} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>FEEDS RSS (um por linha)</label>
                <textarea style={{ ...inputStyle, height: 100, resize: "vertical" }} value={form.feedsCustom} onChange={(e) => set("feedsCustom", e.target.value)} placeholder={"https://exemplo.com/rss.xml | Categoria | Fonte"} />
                <div style={{ color: "#444", fontSize: 11, marginTop: 4 }}>Formato: URL | Categoria | Fonte</div>
              </div>
            </>
          )}
        </div>

        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>CHAVES DE API</div>
          <div style={{ background: "#0d0900", border: "1px solid #3a2f00", borderRadius: 3, padding: "10px 14px", marginBottom: 16 }}>
            <div style={{ color: "#C9A462", fontSize: 11 }}>⚠ Estas chaves são enviadas de forma segura e nunca armazenadas pelo sistema.</div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>GEMINI_API_KEY *</label>
            <input style={inputStyle} required value={form.geminiKey} onChange={(e) => set("geminiKey", e.target.value)} placeholder="AIza..." type="password" autoComplete="off" />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>RESEND_API_KEY *</label>
            <input style={inputStyle} required value={form.resendKey} onChange={(e) => set("resendKey", e.target.value)} placeholder="re_..." type="password" autoComplete="off" />
          </div>
        </div>

        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>NOME DO PROJETO</div>
          <div style={{ marginBottom: 6 }}>
            <label style={labelStyle}>IDENTIFICADOR DO REPOSITÓRIO *</label>
            <input style={inputStyle} required value={form.repoName} onChange={(e) => { setRepoEdited(true); set("repoName", e.target.value); }} placeholder="agente-nome-cliente" />
          </div>
          {form.repoName && (
            <div style={{ color: "#555", fontSize: 11, marginBottom: 4 }}>
              Repositório: <span style={{ color: "#C9A462" }}>lcunhapereira-droid/{form.repoName}</span>
            </div>
          )}
        </div>

        {error && (
          <div style={{ background: "#1a0000", border: "1px solid #5a0000", borderRadius: 3, padding: "12px 16px", marginTop: 24 }}>
            <div style={{ color: "#ff6b6b", fontSize: 12 }}>{error}</div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ color: "#C9A462", fontSize: 12, letterSpacing: 3, marginBottom: 12 }}>{loadingStep}</div>
            <div style={{ color: "#444", fontSize: 11 }}>Aguarde ~2 minutos</div>
          </div>
        ) : (
          <button type="submit" style={{ width: "100%", marginTop: 32, padding: "16px", background: "#C9A462", border: "none", borderRadius: 3, color: "#000", fontSize: 13, letterSpacing: 4, fontFamily: "Georgia, serif", cursor: "pointer", fontWeight: "bold" }}>
            CRIAR MEU AGENTE
          </button>
        )}
      </form>
    </main>
  );
}
