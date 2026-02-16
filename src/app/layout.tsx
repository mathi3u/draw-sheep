import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dessine-moi un mouton',
  description: 'Dessine un mouton et regarde-le courir sous les etoiles',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
