import { NewSiteScreen } from './NewSiteScreen';

export default function NewSitePage({ params }: { params: { clientId: string } }) {
  return <NewSiteScreen clientId={params.clientId} />;
}
