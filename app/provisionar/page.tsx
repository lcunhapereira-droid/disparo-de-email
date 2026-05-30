"use client";

import { useState } from "react";

interface SuccessData {
  scriptUrl: string;
  titulo: string;
  email: string;
  horario: number;
  autoTrigger: boolean;
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(null);
    setLoading(true);
    setLoadingMsg("Analisando perfil com Gemini...");

    const msgs = [
      { t: 4000, m: "Gerando configuração personalizada..." },
      { t: 8000, m: "Criando script no Google..." },
      { t: 12000, m: "Configurando envio automático..." },
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

  if (success) {
    return (
      <main style={{ fontFamily: "Georgia, serif", minHeight: "100vh", background: "#000", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <header style={{ width: "100%", background: "#000", padding: "32px 20px 28px", textAlign: "center", borderBottom: "1px solid #222" }}>
          <svg width="48" height="42" viewBox="0 0 72 62" fill="none" style={{ marginBottom: 12 }}>
            <polygon points="36,2 70,60 2,60" fill="none" stroke="#C9A462" strokeWidth="2.5" />
            <polygon points="36,18 58,58 14,58" fill="#000" />
          </svg>
          <div style={{ color: "#C9A462", fontSize: 13, letterSpacing: 4 }}>AGENTE CRIADO</div>
        </header>
        <div style={{ maxWidth: 560, width: "100%", padding: "40px 20px", boxSizing: "border-box" }}>
          <div style={{ background: "#0a0a0a", border: "1px solid #C9A462", borderRadius: 4, padding: 28 }}>
            <div style={{ color: "#C9A462", fontSize: 10, letterSpacing: 4, marginBottom: 20 }}>AGENTE CONFIGURADO</div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: "#555", fontSize: 11, marginBottom: 4 }}>DESTINATÁRIO</div>
              <div style={{ color: "#fff", fontSize: 13 }}>{success.nome || nome} — {success.email || email}</div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ color: "#555", fontSize: 11, marginBottom: 4 }}>HORÁRIO DE ENVIO</div>
              <div style={{ color: "#fff", fontSize: 13 }}>{String(success.horario ?? horario).padStart(2, "0")}:00 (Brasília)</div>
            </div>
            {success.autoTrigger ? (
              <div style={{ background: "#0a1a0a", border: "1px solid #2a5a2a", borderRadius: 3, padding: 16, marginBottom: 20 }}>
                <div style={{ color: "#4CAF50", fontSize: 11, letterSpacing: 2, marginBottom: 6 }}>ENVIO AUTOMÁTICO ATIVO</div>
                <div style={{ color: "#888", fontSize: 12 }}>O agente já está configurado e enviará o email automaticamente no horário definido.</div>
              </div>
            ) : (
              <div style={{ background: "#1a1200", border: "1px solid #5a4400", borderRadius: 3, padding: 16, marginBottom: 20 }}>
                <div style={{ color: "#C9A462", fontSize: 11, letterSpacing: 2, marginBottom: 8 }}>AÇÃO NECESSÁRIA — 1 CLIQUE</div>
                <div style={{ color: "#888", fontSize: 12, marginBottom: 12 }}>Abra o script e execute a função <strong style={{ color: "#C9A462" }}>setup</strong> uma única vez para ativar o envio automático.</div>
                <a href={success.scriptUrl} target="_blank" rel="noopener noreferrer" style={{ display: "block", background: "#C9A462", color: "#000", padding: "10px 16px", borderRadius: 3, textAlign: "center", fontSize: 12, letterSpacing: 2, textDecoration: "none", fontWeight: "bold" }}>
                  ABRIR SCRIPT →
                </a>
                <div style={{ color: "#555", fontSize: 11, marginTop: 10 }}>No script: clique em ▶ Run → selecione <code style={{ color: "#C9A462" }}>setup</code> → autorize → pronto.</div>
              </div>
            )}
            <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 16 }}>
              <div style={{ color: "#555", fontSize: 11, marginBottom: 8 }}>LINK DO SCRIPT (para edições futuras)</div>
              <a href={success.scriptUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#C9A462", fontSize: 12, wordBreak: "break-all" }}>{success.scriptUrl}</a>
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
          <svg width="48" height="42" viewBox="0 0 72 62" fill="none" style={{ marginBottom: 12 }}>
            <polygon points="36,2 70,60 2,60" fill="none" stroke="#C9A462" strokeWidth="2.5" />
            <polygon points="36,18 58,58 14,58" fill="#000" />
          </svg>
        </a>
        <div style={{ color: "#fff", fontSize: 22, letterSpacing: 8, fontWeight: 300, marginBottom: 6 }}>VÉRTICE</div>
        <div style={{ color: "#C9A462", fontSize: 10, letterSpacing: 5 }}>PROVISIONAR NOVO AGENTE</div>
      </header>

      <form onSubmit={handleSubmit} style={{ maxWidth: 560, width: "100%", padding: "32px 20px 60px", boxSizing: "border-box" }}>
        <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 24, marginTop: 24 }}>
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

        <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 24, marginTop: 24 }}>
          <div style={{ color: "#C9A462", fontSize: 10, letterSpacing: 4, marginBottom: 18 }}>PERFIL E INTERESSES</div>
          <div style={{ marginBottom: 6 }}>
            <label style={labelStyle}>DESCRIÇÃO LIVRE *</label>
            <textarea
              style={{ ...inputStyle, height: 140, resize: "vertical", lineHeight: 1.6 }}
              required
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              placeholder={"Ex: Médico cardiologista em São Paulo, atende adultos e idosos. Quer receber notícias sobre cardiologia, arritmias, insuficiência cardíaca, novos medicamentos e pesquisas clínicas. Prefere conteúdo científico em português."}
            />
            <div style={{ color: "#444", fontSize: 11, marginTop: 6 }}>Quanto mais detalhes, mais personalizado será o agente.</div>
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
            CRIAR AGENTE
          </button>
        )}
      </form>
    </main>
  );
}
