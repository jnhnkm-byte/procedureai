import "./globals.css";

export const metadata = {
  title: "ProcureAI",
  description: "AI procurement decision assistant",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
