import { HeroBanner }      from './HeroBanner';
import { PortfolioSection } from './PortfolioSection';
import { AboutSection }     from './AboutSection';
import { ServicesSection }  from './ServicesSection';
import { ContactSection }   from './ContactSection';

type SectionProps = { content: any; slug?: string };

export const sectionsMap: Record<string, React.ComponentType<SectionProps>> = {
  hero:      ({ content, slug }) => <HeroBanner content={content} slug={slug} />,
  portfolio: ({ content })       => <PortfolioSection content={content} />,
  about:     ({ content })       => <AboutSection content={content} />,
  services:  ({ content })       => <ServicesSection content={content} />,
  contact:   ({ content })       => <ContactSection content={content} />,
};
