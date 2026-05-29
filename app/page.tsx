export default function Home() {
  return (
    <main style={{ fontFamily: "Georgia,serif", maxWidth: 600, margin: "80px auto", padding: "0 20px", textAlign: "center" }}>
      <h1 style={{ color: "#9B8559", letterSpacing: 2, fontWeight: "normal", fontSize: 24 }}>CURADORIA AUTOMÁTICA</h1>
      <p style={{ color: "#555", marginBottom: 40 }}>Agente de e-mail inteligente com curadoria de conteúdo via IA</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <a href="/chat" style={{ display: "block", padding: "16px 24px", background: "linear-gradient(135deg,#9B8559,#b8a07a)", color: "#fff", borderRadius: 10, textDecoration: "none", fontSize: 15, letterSpacing: 1 }}>
          💬 ASSISTENTE — Criar e configurar agentes
        </a>
        <a href="/setup" style={{ display: "block", padding: "16px 24px", background: "#fff", color: "#9B8559", border: "1px solid #ddd", borderRadius: 10, textDecoration: "none", fontSize: 15, letterSpacing: 1 }}>
          ⚙️ SETUP — Formulário de configuração
        </a>
      </div>

      <p style={{ color: "#bbb", fontSize: 12, marginTop: 48 }}>
        Resumo enviado automaticamente todo dia às 20h · Dra. Eriane Faria
      </p>
    </main>
  );
}
