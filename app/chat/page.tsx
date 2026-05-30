"use client";
import { useState, useEffect, useRef } from "react";

type Message = { role: "user" | "assistant"; content: string };

function renderContent(text: string) {
  const configMatch = text.match(/```config\n([\s\S]*?)```/);
  if (configMatch) {
    const fullMatch = text.match(/```config[\s\S]*?```/)![0];
    const before = text.slice(0, text.indexOf("```config"));
    const after = text.slice(text.indexOf("```config") + fullMatch.length);
    const json = configMatch[1].trim();
    return (
      <div>
        {before && <span style={{ whiteSpace: "pre-wrap" }}>{formatText(before)}</span>}
        <ConfigBlock json={json} />
        {after && <span style={{ whiteSpace: "pre-wrap" }}>{formatText(after)}</span>}
      </div>
    );
  }
  return <span style={{ whiteSpace: "pre-wrap" }}>{formatText(text)}</span>;
}

function formatText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**")
      ? <strong key={i}>{p.slice(2, -2)}</strong>
      : p
  );
}

function ConfigBlock({ json }: { json: string }) {
  const [copiado, setCopiado] = useState(false);

  function copiar() {
    try {
      const obj = JSON.parse(json);
      const ts = jsonParaConfigTs(obj);
      navigator.clipboard.writeText(ts);
    } catch {
      navigator.clipboard.writeText(json);
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  }

  return (
    <div style={{ background: "#111", borderRadius: 2, margin: "12px 0", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", background: "#1a1a1a", borderBottom: "1px solid #C9A462" }}>
        <span style={{ color: "#C9A462", fontSize: 11, fontFamily: "monospace", letterSpacing: 2 }}>CONFIG.TS GERADO</span>
        <button onClick={copiar} style={{ padding: "4px 14px", background: copiado ? "#2e7d5e" : "#C9A462", color: "#000", border: "none", borderRadius: 2, cursor: "pointer", fontSize: 11, fontFamily: "Georgia,serif", letterSpacing: 1, fontWeight: "bold" }}>
          {copiado ? "✓ COPIADO" : "COPIAR"}
        </button>
      </div>
      <pre style={{ color: "#e8e8e8", padding: 16, fontSize: 11, overflow: "auto", margin: 0, lineHeight: 1.5 }}>{json}</pre>
    </div>
  );
}

function jsonParaConfigTs(obj: Record<string, unknown>): string {
  const lines = ["export const CONFIG = {", ""];
  function val(v: unknown, indent: number): string {
    const pad = " ".repeat(indent);
    if (typeof v === "string") return `"${v}"`;
    if (typeof v === "number" || typeof v === "boolean") return String(v);
    if (Array.isArray(v)) {
      if (v.length === 0) return "[]";
      if (typeof v[0] === "string") {
        return `[\n${v.map((s: unknown) => `${pad}  "${s}",`).join("\n")}\n${pad}]`;
      }
      return `[\n${v.map((item: unknown) => `${pad}  {\n${Object.entries(item as Record<string,unknown>).map(([k2, v2]) => `${pad}    ${k2}: "${v2}",`).join("\n")}\n${pad}  },`).join("\n")}\n${pad}]`;
    }
    if (typeof v === "object" && v !== null) {
      return `{\n${Object.entries(v as Record<string,unknown>).map(([k2, v2]) => `${pad}  ${k2}: ${val(v2, indent + 2)},`).join("\n")}\n${pad}}`;
    }
    return String(v);
  }
  for (const [k, v] of Object.entries(obj)) {
    lines.push(`  ${k}: ${val(v, 2)},`);
    lines.push("");
  }
  lines.push("};");
  return lines.join("\n");
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [iniciado, setIniciado] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function iniciar() {
    setIniciado(true);
    setLoading(true);
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [] }),
    });
    const data = await res.json();
    setMessages([{ role: "assistant", content: data.reply }]);
    setLoading(false);
  }

  async function enviar() {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const novas = [...messages, userMsg];
    setMessages(novas);
    setInput("");
    setLoading(true);
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: novas }),
    });
    const data = await res.json();
    setMessages([...novas, { role: "assistant", content: data.reply }]);
    setLoading(false);
  }

  const sugestoes = ["Criar novo agente", "Como testar o envio?", "Quais áreas posso monitorar?", "Como mudar o horário?"];

  return (
    <main style={{ background: "#000", minHeight: "100vh", fontFamily: "Georgia,serif", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "#000", borderBottom: "1px solid #222", padding: "24px 40px", textAlign: "center" }}>
        <a href="/" style={{ textDecoration: "none" }}>
          <div style={{ color: "#C9A462", fontSize: 11, letterSpacing: 4, marginBottom: 4 }}>VÉRTICE CONSULTORIA ESTRATÉGICA</div>
        </a>
        <h1 style={{ color: "#fff", margin: 0, fontSize: 18, letterSpacing: 3, fontWeight: "normal" }}>ASSISTENTE IA</h1>
        <p style={{ color: "#555", margin: "6px 0 0", fontSize: 12, letterSpacing: 1 }}>Configure agentes de curadoria para qualquer área</p>
      </div>

      <div style={{ flex: 1, maxWidth: 720, width: "100%", margin: "0 auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 16, boxSizing: "border-box" }}>

        {!iniciado ? (
          <div style={{ textAlign: "center", marginTop: 60 }}>
            <svg width="52" height="44" viewBox="0 0 72 62" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: 20 }}>
              <polygon points="36,2 70,60 2,60" fill="none" stroke="#C9A462" strokeWidth="2.5" />
            </svg>
            <h2 style={{ color: "#fff", fontWeight: "normal", fontSize: 18, margin: "0 0 8px", letterSpacing: 2 }}>ASSISTENTE DE CURADORIA</h2>
            <p style={{ color: "#555", fontSize: 13, margin: "0 0 32px", letterSpacing: 1 }}>Crie e gerencie agentes de e-mail automático conversando</p>
            <button onClick={iniciar} style={{ padding: "14px 40px", background: "#C9A462", color: "#000", border: "none", borderRadius: 2, fontSize: 13, fontFamily: "Georgia,serif", cursor: "pointer", letterSpacing: 3, fontWeight: "bold" }}>
              INICIAR
            </button>
          </div>
        ) : (
          <>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "85%",
                    padding: "12px 16px",
                    borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    background: m.role === "user" ? "#C9A462" : "#111",
                    color: m.role === "user" ? "#000" : "#ddd",
                    border: m.role === "user" ? "none" : "1px solid #222",
                    fontSize: 14,
                    lineHeight: 1.6,
                  }}>
                    {renderContent(m.content)}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div style={{ padding: "12px 20px", background: "#111", border: "1px solid #222", borderRadius: "18px 18px 18px 4px", color: "#555", fontSize: 14 }}>
                    digitando...
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {messages.length <= 2 && !loading && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {sugestoes.map(s => (
                  <button key={s} onClick={() => setInput(s)} style={{ padding: "6px 14px", background: "#000", border: "1px solid #C9A462", borderRadius: 2, cursor: "pointer", fontSize: 11, fontFamily: "Georgia,serif", color: "#C9A462", letterSpacing: 1 }}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, paddingTop: 8 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && enviar()}
                placeholder="Digite sua mensagem..."
                style={{ flex: 1, padding: "12px 16px", border: "1px solid #333", borderRadius: 2, fontSize: 14, fontFamily: "Georgia,serif", outline: "none", background: "#111", color: "#fff" }}
              />
              <button onClick={enviar} disabled={loading || !input.trim()} style={{ padding: "12px 24px", background: input.trim() && !loading ? "#C9A462" : "#222", color: input.trim() && !loading ? "#000" : "#555", border: "none", borderRadius: 2, cursor: input.trim() && !loading ? "pointer" : "default", fontSize: 13, fontFamily: "Georgia,serif", letterSpacing: 2, fontWeight: "bold" }}>
                ENVIAR
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
