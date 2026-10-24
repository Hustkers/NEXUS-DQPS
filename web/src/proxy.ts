import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * The NEXUS marketing site is a static build served from `public/`.
 *
 * Next serves `public/` files by exact path only, so a directory-style URL
 * such as `/solutions/ad-library/` needs an explicit rewrite to its
 * `index.html`. This middleware does that for the site's own routes and
 * touches nothing else - `/api`, `/auth` and `/dashboard` belong to the app
 * router, and `/` now serves the marketing landing page instead of the old
 * React one.
 */
const STATIC_ROUTES = new Set([
  '/',
  '/about',
  '/affiliate',
  '/blog',
  '/blog/ai-ad-creative-testing-isolate-what-actually-won',
  '/blog/ai-agents-for-D2C-what-makes-something-an-agent',
  '/blog/ai-copyright-risks',
  '/blog/ai-creative-fatigue',
  '/blog/best-alihunter-alternatives',
  '/blog/where-to-buy-prebuilt-shopify-stores',
  '/contact',
  '/cookie-policy',
  '/de',
  '/es',
  '/faq',
  '/fr',
  '/free-tools/beroas-calculator',
  '/free-tools/cpa-calculator',
  '/free-tools/interest-explorer',
  '/free-tools/numbers-breakdown',
  '/free-tools/roas-calculator',
  '/nl',
  '/privacy-policy',
  '/solutions/ad-library',
  '/solutions/advertiser-library',
  '/solutions/advertiser-tracker',
  '/solutions/competitor-research',
  '/solutions/creator-library',
  '/solutions/magic-ai-search',
  '/solutions/portfolio',
  '/solutions/product-library',
  '/solutions/sales-tracker',
  '/solutions/shop-library',
  '/terms-and-conditions',
]);

const APP_PREFIXES = ['/api', '/auth', '/dashboard', '/_next', '/__nextjs'];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (APP_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  if (!STATIC_ROUTES.has(clean)) return NextResponse.next();

  const target = clean === '/' ? '/index.html' : `${clean}/index.html`;
  return NextResponse.rewrite(new URL(target, request.url));
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)'
  ]
};
