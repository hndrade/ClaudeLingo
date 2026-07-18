import type { Metadata } from "next";
import Notificacoes from "@/components/Notificacoes";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClaudeLingo",
  description: "Aprendizado gamificado de IA aplicada",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-papel text-tinta antialiased">
        <Notificacoes />
        {children}
      </body>
    </html>
  );
}
