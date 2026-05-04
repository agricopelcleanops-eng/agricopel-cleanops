import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Agricopel · Gestão de Limpeza',
  description: 'Sistema de chamados de limpeza - Agricopel',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  )
}
