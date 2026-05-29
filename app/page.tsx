export default function Home() {
  return (
    <main style={{ fontFamily: "Georgia,serif", minHeight: "100vh", background: "#F9F8F7", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "linear-gradient(135deg,#1a3a5c,#2a5a8c)", padding: "40px 20px", textAlign: "center" }}>
        <p style={{ color: "#a0c0e0", margin: "0 0 8px", fontSize: 12, letterSpacing: 3 }}>VÉRTICE CONSULTORIA ESTRATÉGICA</p>
        <h1 style={{ color: "#fff", margin: "0 0 10px", fontSize: 26, fontWeight: "normal", letterSpacing: 2 }}>PLATAFORMA DE CURADORIA IA</h1>
        <p style={{ color: "#c0d8f0", margin: 0, fontSize: 14 }}>Agentes inteligentes de monitoramento e síntese de conteúdo</p>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "50px 20px", display: "flex", flexDirection: "column", gap: 16, width: "100%", boxSizing: "border-box" }}>
        <a href="/chat" style={{ display: "block", padding: "20px 28px", background: "linear-gradient(135deg,#1a3a5c,#2a5a8c)", color: "#fff", borderRadius: 12, textDecoration: "none", fontSize: 15, letterSpacing: 1 }}>
          <div style={{ fontWeight: "bold", marginBottom: 4 }}>💬 ASSISTENTE IA</div>
          <div style={{ fontSize: 13, color: "#c0d8f0" }}>Criar e configurar agentes conversando</div>
        </a>
        <a href="/setup" style={{ display: "block", padding: "20px 28px", background: "#fff", color: "#1a3a5c", border: "1px solid #ddd", borderRadius: 12, textDecoration: "none", fontSize: 15, letterSpacing: 1 }}>
          <div style={{ fontWeight: "bold", marginBottom: 4 }}>⚙️ CONFIGURAÇÃO</div>
          <div style={{ fontSize: 13, color: "#888" }}>Formulário completo de configuração</div>
        </a>
      </div>

      <div style={{ textAlign: "center", padding: "20px", marginTop: "auto" }}>
        <p style={{ color: "#bbb", fontSize: 11, margin: 0 }}>© Vértice Consultoria Estratégica · Sistema proprietário</p>
      </div>
    </main>
  );
}
