import Providers from '@/components/layout/providers';
import { Toaster } from '@/components/ui/sonner';
import { AppAiAssistant } from '@/features/ai-assistant';
import { fontVariables } from '@/components/themes/font.config';
import { DEFAULT_THEME, THEMES } from '@/components/themes/theme.config';
import ThemeProvider from '@/components/themes/theme-provider';
import { cn } from '@/lib/utils';
import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import NextTopLoader from 'nextjs-toploader';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import localFont from 'next/font/local';
import '../styles/globals.css';

const ranade = localFont({
  src: [
    {
      path: '../../public/fonts/ranade/Ranade-Variable.woff2',
      style: 'normal',
      weight: '100 700'
    },
    {
      path: '../../public/fonts/ranade/Ranade-VariableItalic.woff2',
      style: 'italic',
      weight: '100 700'
    }
  ],
  variable: '--font-ranade',
  display: 'swap'
});

const META_THEME_COLORS = {
  light: '#ffffff',
  dark: '#000000'
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://nexus-dqps.vercel.app'),
  title: {
    default: 'NEXUS-D2C | Autonomous Advertising Decision Engine',
    template: '%s | NEXUS-D2C'
  },
  description:
    'Next-Generation Autonomous D2C Advertising Intelligence & Decision Engine (DataQuest 3.0)',
  openGraph: {
    title: 'NEXUS-D2C | Autonomous Advertising Decision Engine',
    description:
      'Next-Generation Autonomous D2C Advertising Intelligence & Decision Engine (DataQuest 3.0)',
    siteName: 'NEXUS-D2C',
    type: 'website',
    images: [
      {
        url: '/shadcn-dashboard.png',
        width: 3200,
        height: 1600,
        alt: 'NEXUS-D2C Mission Control Console'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NEXUS-D2C | Autonomous Advertising Decision Engine',
    description:
      'Next-Generation Autonomous D2C Advertising Intelligence & Decision Engine (DataQuest 3.0)',
    images: ['/shadcn-dashboard.png']
  }
};

export const viewport: Viewport = {
  themeColor: META_THEME_COLORS.dark
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const activeThemeValue = cookieStore.get('active_theme')?.value;
  const isValidTheme = THEMES.some((t) => t.value === activeThemeValue);
  const themeToApply = isValidTheme ? activeThemeValue! : DEFAULT_THEME;

  return (
    <html lang='en' suppressHydrationWarning data-theme={themeToApply}>
        <link rel='preconnect' href='https://api.fontshare.com' crossOrigin='anonymous' />
        <link rel='preconnect' href='https://cdn.fontshare.com' crossOrigin='anonymous' />
        <link
          rel='stylesheet'
          href='https://api.fontshare.com/v2/css?f[]=ranade@100,300,400,500,700&display=swap'
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const storedTheme = localStorage.getItem('theme');
                if (storedTheme === 'light') {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '${META_THEME_COLORS.light}');
                } else if (storedTheme === 'dark') {
                  document.documentElement.classList.remove('light');
                  document.documentElement.classList.add('dark');
                  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '${META_THEME_COLORS.dark}');
                }
              } catch (_) {}
            `
          }}
        />
      </head>
      <body
        className={cn(
          'bg-background font-sans antialiased',
          ranade.variable,
          fontVariables
        )}
      >
        <NextTopLoader color='var(--primary)' showSpinner={false} />
        <NuqsAdapter>
          <ThemeProvider
            attribute='class'
            defaultTheme='dark'
            enableSystem
            disableTransitionOnChange
            enableColorScheme
          >
            <Providers activeThemeValue={themeToApply}>
              <BackgroundShader />
              <Toaster />
              {children}
              <AppAiAssistant />
            </Providers>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
