import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { LocaleProvider } from '@/lib/LocaleContext'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mosaico Digital Acambaro – Posee un Píxel en la Historia de Internet',
  description: 'Compra un bloque permanente de publicidad de 10x10 píxeles en el mosaico digital más grande de internet. Cada bloque es único y permanente.',
  keywords: ['pixel advertising', 'mosaico digital', 'publicidad pixels', 'million dollar homepage', 'acambaro'],
  authors: [{ name: 'Mosaico Digital Acambaro' }],
  openGraph: {
    title: 'Mosaico Digital Acambaro – Posee un Píxel en la Historia de Internet',
    description: 'Compra un bloque permanente de publicidad de 10x10 píxeles. 8,160 bloques disponibles a $100 USD cada uno.',
    type: 'website',
    locale: 'es_MX',
    siteName: 'Mosaico Digital Acambaro',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mosaico Digital Acambaro',
    description: 'Compra un bloque permanente de publicidad de 10x10 píxeles.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Mosaico Digital Acambaro',
              description: 'Plataforma de publicidad permanente en píxeles',
              url: process.env.NEXT_PUBLIC_BASE_URL || 'https://mosaico-acambaro.vercel.app',
              potentialAction: {
                '@type': 'SearchAction',
                target: '{search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <LocaleProvider>
            {children}
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
