export interface NavItem   { label: string; href: string }
export interface FooterLink { label: string; href: string }

export interface DesignTokens {
  colorPrimary: string;
  colorSecondary: string;
  fontFamily?: string;
  logoUrl?: string;
  footerLogoUrl?: string;
  navItems?: NavItem[];
  footerLinks?: FooterLink[];
}

export interface Section {
  id: string;
  type: string;
  enabled: boolean;
  content: Record<string, any>;
  order: number;
}

export interface Site {
  id: string;
  slug: string;
  siteSlug?: string;
  companyName: string;
  type: 'template' | 'html';
  templateKey?: string;
  customHtml?: string;
  designTokens: DesignTokens;
  sections: Section[];
  assets: any[];
}
