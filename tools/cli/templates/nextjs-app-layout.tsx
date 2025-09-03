import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SynthProvider } from '@synthkit/client'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '{{projectName}}',
  description: 'Generated with Synthkit',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SynthProvider>
          {children}
        </SynthProvider>
      </body>
    </html>
  )
}
