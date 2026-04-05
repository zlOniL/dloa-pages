import { NextRequest, NextResponse } from 'next/server';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only match /{slug}/{siteSlug} — exactly two path segments
  const match = pathname.match(/^\/([^/]+)\/([^/]+)\/?$/);
  if (!match) return NextResponse.next();

  const [, slug, siteSlug] = match;

  // Skip internal Next.js routes and CMS
  if (['cms', 'api', '_next'].includes(slug)) return NextResponse.next();

  try {
    const res = await fetch(`${API}/sites/view/${slug}/${siteSlug}`);
    if (!res.ok) return NextResponse.next();

    const site = await res.json();

    if (site.type === 'html') {
      const html = site.customHtml || '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body></body></html>';
      return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
  } catch {
    // Fall through to Next.js page on error
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)'],
};
