import { SitesScreen } from './SitesScreen';

export default function ClientSitesPage({ params }: { params: { clientId: string } }) {
  return <SitesScreen clientId={params.clientId} />;
}
