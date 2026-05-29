export const metadata = { title: "Vértice Consultoria Estratégica — Plataforma de Curadoria IA" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, background: "#F9F8F7" }}>{children}</body>
    </html>
  );
}
