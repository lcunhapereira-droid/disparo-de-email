export const metadata = { title: "Vértice Consultoria Estratégica" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, background: "#000" }}>{children}</body>
    </html>
  );
}
