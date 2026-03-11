import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/components/providers/session-provider'
import { GlobalPasswordReset } from '@/components/providers/password-interceptor'
import { Toaster } from 'sonner'
import Script from 'next/script'
import { Suspense } from 'react'
import { TranslationObserver } from '@/components/providers/translation-observer'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Agro Puthalvan Technologies - AI-Powered Smart Farming',
  description: 'Transform your farming with AI-powered crop recommendations, disease detection, weather monitoring, and market insights.',
  generator: 'v0.app',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
          {/* <GlobalPasswordReset /> */}
          <Toaster position="top-center" />
          <Analytics />
          <Suspense fallback={null}>
            <TranslationObserver />
          </Suspense>
          <div id="google_translate_element" style={{ display: 'none' }}></div>
          <Script strategy="afterInteractive" src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" />
          <Script id="google-translate" strategy="afterInteractive">
            {`
              function googleTranslateElementInit() {
                new window.google.translate.TranslateElement({ pageLanguage: 'en', autoDisplay: false }, 'google_translate_element');
              }
            `}
          </Script>
        </AuthProvider>
      </body>
    </html>
  )
}
