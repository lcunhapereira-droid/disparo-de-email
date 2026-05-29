export const metadata = { title: "Curadoria Medica - Dra. Eriane Faria" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, background: "#F9F8F7" }}>{children}</body>
    </html>
  );
}
