export default function Home() {
  return (
    <main style={{ fontFamily: "'Georgia', serif", minHeight: "100vh", background: "#000", display: "flex", flexDirection: "column", alignItems: "center" }}>

      <header style={{ width: "100%", background: "#000", padding: "48px 20px 40px", textAlign: "center", borderBottom: "1px solid #222" }}>
        <svg width="72" height="62" viewBox="0 0 72 62" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: 20 }}>
          <polygon points="36,2 70,60 2,60" fill="none" stroke="#C9A462" strokeWidth="2.5" />
          <polygon points="36,18 58,58 14,58" fill="#000" />
        </svg>
        <div style={{ color: "#fff", fontSize: 32, letterSpacing: 12, fontWeight: 300, fontFamily: "Georgia, serif", marginBottom: 8 }}>VÉRTICE</div>
        <div style={{ color: "#C9A462", fontSize: 11, letterSpacing: 6, fontWeight: 300 }}>CONSULTORIA ESTRATÉGICA</div>
      </header>

      <div style={{ textAlign: "center", padding: "48px 20px 32px" }}>
        <h1 style={{ color: "#fff", fontSize: 18, fontWeight: "normal", letterSpacing: 3, margin: "0 0 12px" }}>PLATAFORMA DE CURADORIA IA</h1>
        <p style={{ color: "#666", fontSize: 13, margin: 0, letterSpacing: 1 }}>Agentes inteligentes de monitoramento e síntese de conteúdo</p>
      </div>

      <div style={{ maxWidth: 560, width: "100%", padding: "0 20px 60px", display: "flex", flexDirection: "column", gap: 14, boxSizing: "border-box" }}>
        <a href="/provisionar" style={{ display: "block", padding: "24px 28px", background: "#0d0900", border: "2px solid #C9A462", borderRadius: 4, textDecoration: "none" }}>
          <div style={{ color: "#C9A462", fontSize: 11, letterSpacing: 4, marginBottom: 8 }}>NOVO AGENTE</div>
          <div style={{ color: "#fff", fontSize: 14, fontWeight: "normal" }}>Provisionar agente para novo cliente</div>
          <div style={{ color: "#555", fontSize: 12, marginTop: 4 }}>Cria repositório GitHub + deploy Vercel automaticamente</div>
        </a>
        <a href="/chat" style={{ display: "block", padding: "24px 28px", background: "#0a0a0a", border: "1px solid #333", borderRadius: 4, textDecoration: "none" }}>
          <div style={{ color: "#C9A462", fontSize: 11, letterSpacing: 4, marginBottom: 8 }}>ASSISTENTE IA</div>
          <div style={{ color: "#fff", fontSize: 14, fontWeight: "normal" }}>Criar e configurar agentes conversando</div>
          <div style={{ color: "#555", fontSize: 12, marginTop: 4 }}>Configure um novo agente em minutos</div>
        </a>
        <a href="/setup" style={{ display: "block", padding: "24px 28px", background: "#0a0a0a", border: "1px solid #333", borderRadius: 4, textDecoration: "none" }}>
          <div style={{ color: "#C9A462", fontSize: 11, letterSpacing: 4, marginBottom: 8 }}>CONFIGURAÇÃO</div>
          <div style={{ color: "#fff", fontSize: 14, fontWeight: "normal" }}>Formulário completo de configuração</div>
          <div style={{ color: "#555", fontSize: 12, marginTop: 4 }}>Preencha os campos e gere o config.ts</div>
        </a>
      </div>

      <footer style={{ marginTop: "auto", borderTop: "1px solid #111", width: "100%", padding: "20px", textAlign: "center" }}>
        <p style={{ color: "#333", fontSize: 11, margin: 0, letterSpacing: 2 }}>© VÉRTICE CONSULTORIA ESTRATÉGICA</p>
      </footer>
    </main>
  );
}
