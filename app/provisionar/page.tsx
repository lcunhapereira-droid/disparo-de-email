"use client";

import { useState } from "react";

interface SuccessData {
  scriptCode: string;
  tituloEmail: string;
  assunto: string;
  email: string;
  horario: number;
}

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

export default function ProvisionarPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [horario, setHorario] = useState(20);
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [success, setSuccess] = useState<SuccessData | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(null);
    setLoading(true);
    setLoadingMsg("Analisando perfil com Gemini...");

    const msgs = [
      { t: 4000, m: "Selecionando feeds especializados..." },
      { t: 9000, m: "Gerando código personalizado..." },
    ];
    const timers = msgs.map(({ t, m }) => setTimeout(() => setLoadingMsg(m), t));

    try {
      const res = await fetch("/api/provisionar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, horario, descricao }),
      });
      timers.forEach(clearTimeout);
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Erro desconhecido.");
      } else {
        setSuccess(data);
      }
    } catch (err) {
      timers.forEach(clearTimeout);
      setError(err instanceof Error ? err.message : "Erro de rede.");
    } finally {
      setLoading(false);
      setLoadingMsg("");
    }
  }

  function handleCopy() {
    if (!success) return;
    navigator.clipboard.writeText(success.scriptCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  }

  if (success) {
    return (
      <main style={{ fontFamily: "Georgia, serif", minHeight: "100vh", background: "#000", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <header style={{ width: "100%", background: "#000", padding: "32px 20px 28px", textAlign: "center", borderBottom: "1px solid #222" }}>
          <svg width="48" height="42" viewBox="0 0 72 62" fill="none" style={{ marginBottom: 12 }}>
            <polygon points="36,2 70,60 2,60" fill="none" stroke="#C9A462" strokeWidth="2.5" />
            <polygon points="36,18 58,58 14,58" fill="#000" />
          </svg>
          <div style={{ color: "#C9A462", fontSize: 13, letterSpacing: 4 }}>AGENTE GERADO</div>
        </header>

        <div style={{ maxWidth: 680, width: "100%", padding: "32px 20px 60px", boxSizing: "border-box" }}>

          {/* Resumo */}
          <div style={{ background: "#0a0a0a", border: "1px solid #222", borderRadius: 4, padding: 20, marginBottom: 24, display: "flex", gap: 32 }}>
            <div>
              <div style={{ color: "#555", fontSize: 10, letterSpacing: 2, marginBottom: 4 }}>DESTINATÁRIO</div>
              <div style={{ color: "#fff", fontSize: 13 }}>{success.email}</div>
            </div>
            <div>
              <div style={{ color: "#555", fontSize: 10, letterSpacing: 2, marginBottom: 4 }}>HORÁRIO</div>
              <div style={{ color: "#fff", fontSize: 13 }}>{String(success.horario).padStart(2, "0")}:00 Brasília</div>
            </div>
            <div>
              <div style={{ color: "#555", fontSize: 10, letterSpacing: 2, marginBottom: 4 }}>ASSUNTO</div>
              <div style={{ color: "#fff", fontSize: 13 }}>{success.assunto}</div>
            </div>
          </div>

          {/* Instruções */}
          <div style={{ background: "#0d0d00", border: "1px solid #C9A462", borderRadius: 4, padding: 24, marginBottom: 24 }}>
            <div style={{ color: "#C9A462", fontSize: 10, letterSpacing: 4, marginBottom: 16 }}>3 PASSOS PARA ATIVAR</div>
            {[
              { n: "1", txt: "Copie o código abaixo", sub: "Clique no botão COPIAR CÓDIGO" },
              { n: "2", txt: "Abra o Google Apps Script", sub: "Acesse script.google.com → Novo projeto → cole o código (Ctrl+A, depois Ctrl+V)" },
              { n: "3", txt: "Execute a função setup", sub: 'No menu superior: Run → Run function → setup → autorize quando solicitado → pronto' },
            ].map(({ n, txt, sub }) => (
              <div key={n} style={{ display: "flex", gap: 16, marginBottom: 16, alignItems: "flex-start" }}>
                <div style={{ background: "#C9A462", color: "#000", width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: "bold", flexShrink: 0 }}>{n}</div>
                <div>
                  <div style={{ color: "#fff", fontSize: 13, marginBottom: 3 }}>{txt}</div>
                  <div style={{ color: "#666", fontSize: 12 }}>{sub}</div>
                </div>
              </div>
            ))}
            <a
              href="https://script.google.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-block", marginTop: 8, background: "#1a1a1a", border: "1px solid #333", color: "#C9A462", padding: "8px 16px", borderRadius: 3, fontSize: 12, letterSpacing: 2, textDecoration: "none" }}
            >
              ABRIR SCRIPT.GOOGLE.COM →
            </a>
          </div>

          {/* Código */}
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ color: "#555", fontSize: 10, letterSpacing: 3 }}>CÓDIGO DO AGENTE</div>
              <button
                onClick={handleCopy}
                style={{ background: copied ? "#2a5a2a" : "#C9A462", border: "none", borderRadius: 3, color: copied ? "#4CAF50" : "#000", padding: "8px 20px", fontSize: 11, letterSpacing: 2, cursor: "pointer", fontFamily: "Georgia, serif", fontWeight: "bold", transition: "background 0.2s" }}
              >
                {copied ? "✓ COPIADO" : "COPIAR CÓDIGO"}
              </button>
            </div>
            <textarea
              readOnly
              value={success.scriptCode}
              style={{ ...inputStyle, height: 320, resize: "vertical", fontFamily: "monospace", fontSize: 11, lineHeight: 1.5, color: "#ccc" }}
              onClick={e => (e.target as HTMLTextAreaElement).select()}
            />
          </div>

          <div style={{ textAlign: "center", marginTop: 32 }}>
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
          <svg width="48" height="42" viewBox="0 0 72 62" fill="none" style={{ marginBottom: 12 }}>
            <polygon points="36,2 70,60 2,60" fill="none" stroke="#C9A462" strokeWidth="2.5" />
            <polygon points="36,18 58,58 14,58" fill="#000" />
          </svg>
        </a>
        <div style={{ color: "#fff", fontSize: 22, letterSpacing: 8, fontWeight: 300, marginBottom: 6 }}>VÉRTICE</div>
        <div style={{ color: "#C9A462", fontSize: 10, letterSpacing: 5 }}>PROVISIONAR NOVO AGENTE</div>
      </header>

      <form onSubmit={handleSubmit} style={{ maxWidth: 560, width: "100%", padding: "32px 20px 60px", boxSizing: "border-box" }}>

        <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 24, marginTop: 8 }}>
          <div style={{ color: "#C9A462", fontSize: 10, letterSpacing: 4, marginBottom: 18 }}>DESTINATÁRIO</div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>NOME COMPLETO *</label>
            <input style={inputStyle} required value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Dra. Ana Silva" />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>E-MAIL *</label>
            <input style={inputStyle} type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="cliente@exemplo.com" />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>HORÁRIO DE ENVIO (Brasília)</label>
            <select style={{ ...inputStyle, cursor: "pointer" }} value={horario} onChange={e => setHorario(parseInt(e.target.value))}>
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{String(i).padStart(2, "0")}:00</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 24, marginTop: 8 }}>
          <div style={{ color: "#C9A462", fontSize: 10, letterSpacing: 4, marginBottom: 18 }}>PERFIL E INTERESSES</div>
          <div style={{ marginBottom: 6 }}>
            <label style={labelStyle}>DESCRIÇÃO LIVRE *</label>
            <textarea
              style={{ ...inputStyle, height: 140, resize: "vertical", lineHeight: 1.6 }}
              required
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              placeholder="Ex: Médico cardiologista em São Paulo, atende adultos e idosos. Quer receber notícias sobre cardiologia, arritmias, insuficiência cardíaca, novos medicamentos e pesquisas clínicas. Prefere conteúdo científico em português."
            />
            <div style={{ color: "#444", fontSize: 11, marginTop: 6 }}>Quanto mais detalhes, mais personalizado o agente.</div>
          </div>
        </div>

        {error && (
          <div style={{ background: "#1a0000", border: "1px solid #5a0000", borderRadius: 3, padding: "12px 16px", marginTop: 24 }}>
            <div style={{ color: "#ff6b6b", fontSize: 12 }}>{error}</div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ color: "#C9A462", fontSize: 12, letterSpacing: 3, marginBottom: 8 }}>{loadingMsg}</div>
            <div style={{ color: "#444", fontSize: 11 }}>Aguarde alguns segundos...</div>
          </div>
        ) : (
          <button type="submit" style={{ width: "100%", marginTop: 32, padding: "16px", background: "#C9A462", border: "none", borderRadius: 3, color: "#000", fontSize: 13, letterSpacing: 4, fontFamily: "Georgia, serif", cursor: "pointer", fontWeight: "bold" }}>
            GERAR AGENTE
          </button>
        )}
      </form>
    </main>
  );
}
