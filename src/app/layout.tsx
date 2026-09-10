import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Poppins } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const poppins = Poppins({
  weight: ['600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jbmono',
  display: 'swap',
});

const site = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: {
    default: 'The Shade Diagnosis',
    template: '%s | The Shade Diagnosis',
  },
  description:
    'There are 240 personalities. Which one are you? A five-minute diagnosis from Skreed that finds the shade that actually fits you.',
  openGraph: {
    title: 'The Shade Diagnosis',
    description: 'There are 240 personalities. Which one are you?',
    siteName: 'Skreed',
    type: 'website',
    images: [{ url: '/api/og', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Shade Diagnosis',
    description: 'There are 240 personalities. Which one are you?',
    images: ['/api/og'],
  },
};

export const viewport: Viewport = {
  themeColor: '#F7F6F3',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gtm = process.env.NEXT_PUBLIC_GTM_ID;
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable} ${mono.variable} antialiased`}>
      <body>
        {gtm ? (
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}
          </Script>
        ) : null}
        {children}
      </body>
    </html>
  );
}
