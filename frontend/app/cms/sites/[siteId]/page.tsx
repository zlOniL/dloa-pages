import { SiteEditor } from './SiteEditor';

export default function SiteEditorPage({ params }: { params: { siteId: string } }) {
  return <SiteEditor siteId={params.siteId} />;
}
