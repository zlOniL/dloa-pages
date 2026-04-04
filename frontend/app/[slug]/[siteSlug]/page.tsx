import { notFound } from 'next/navigation';
import { Site } from '@/types/site';
import { getTemplate } from '@/components/templates/registry';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function getSite(clientSlug: string, siteSlug: string): Promise<Site | null> {
  try {
    const res = await fetch(`${API_URL}/sites/view/${clientSlug}/${siteSlug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function SitePage({ params }: { params: { slug: string; siteSlug: string } }) {
  const site = await getSite(params.slug, params.siteSlug);
  if (!site) notFound();

  const { colorPrimary, colorSecondary, fontFamily, logoUrl, footerLogoUrl, navItems, footerLinks } = site.designTokens;
  const { sectionsMap, Footer } = getTemplate(site.templateKey);

  const cssVars = {
    '--color-primary': colorPrimary,
    '--color-secondary': colorSecondary,
    '--font-family': fontFamily ?? 'sans-serif',
  } as React.CSSProperties;

  return (
    <main style={{ ...cssVars, fontFamily: 'var(--font-family)' }} className="box-border w-full flex flex-col items-center overflow-x-hidden bg-white m-0 p-0">
      {site.sections
        .filter((section) => section.enabled)
        .map((section) => {
          const Component = sectionsMap[section.type];
          if (!Component) return null;
          const overrideColors = (section.content as Record<string, Record<string, string>>)?._colors ?? {};
          const overrideStyle: React.CSSProperties & Record<string, string> = {};
          if (overrideColors.primary)   overrideStyle['--color-primary']   = overrideColors.primary;
          if (overrideColors.secondary) overrideStyle['--color-secondary'] = overrideColors.secondary;
          const content = section.type === 'hero'
            ? { ...section.content, _navItems: navItems, logoUrl: logoUrl || undefined }
            : section.content;
          const inner = <Component key={section.id} content={content} slug={`${params.slug}/${params.siteSlug}`} />;
          return Object.keys(overrideStyle).length > 0
            ? <div key={section.id} style={overrideStyle}>{inner}</div>
            : inner;
        })}
      <Footer footerLogoUrl={footerLogoUrl} navItems={navItems} footerLinks={footerLinks} />
    </main>
  );
}

export async function generateMetadata({ params }: { params: { slug: string; siteSlug: string } }) {
  const site = await getSite(params.slug, params.siteSlug);
  return { title: site?.companyName ?? `${params.slug}/${params.siteSlug}` };
}
