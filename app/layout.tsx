import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: '글자수세기 | 실시간 글자수 계산 도구',
  description: '글자수세기는 이력서, 자기소개서, 블로그 글 등 다양한 글의 글자수를 공백 포함 또는 제외로 실시간 계산할 수 있는 편리한 웹 도구입니다.',
  keywords: [
    '글자수세기 도구',
    '이력서 글자수',
    '자기소개서 글자수',
    '블로그 글자수',
    '공백제외 글자수',
    '이력서 글자수세기',
    '자기소개서 글자수세기',
    '블로그 글자수세기',
    '공백제외 글자수 세기'
  ],
  openGraph: {
    title: '글자수세기 | 실시간 글자수 계산 도구',
    description: '간단하고 빠른 글자수세기 웹 도구로, 공백 포함·제외 기준으로 글자수를 정확히 계산해보세요.',
    url: 'https://text.newsda.kr',
    siteName: '글자수세기',
    locale: 'ko_KR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://text.newsda.kr',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <head>
        {/* ✅ 구글 애드센스 자동광고 코드 삽입 */}
        <Script
          id="adsense-script"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9591765421576424"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
