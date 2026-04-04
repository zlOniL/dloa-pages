import { HeroBanner } from './HeroBanner';
import { AboutSection } from './AboutSection';
import { ProductsSection } from './ProductsSection';
import { HowItWorks } from './HowItWorks';
import { FAQSection } from './FAQSection';
import { PharmacyFinder } from './PharmacyFinder';
import { PartnersSection } from './PartnersSection';

type SectionProps = { content: any; slug?: string };

export const sectionsMap: Record<string, React.ComponentType<SectionProps>> = {
  hero:           ({ content, slug }) => <HeroBanner content={content} slug={slug ?? ''} />,
  about:          ({ content })       => <AboutSection content={content} />,
  products:       ({ content })       => <ProductsSection content={content} />,
  'how-it-works': ({ content })       => <HowItWorks content={content} />,
  faq:            ({ content })       => <FAQSection content={content} />,
  pharmacy:       ({ content })       => <PharmacyFinder content={content} />,
  partners:       ({ content })       => <PartnersSection content={content} />,
};
