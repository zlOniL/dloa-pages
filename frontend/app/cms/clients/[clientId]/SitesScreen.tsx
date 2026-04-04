'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface Site {
  id: string;
  companyName: string;
  siteSlug: string;
  slug: string;
  createdAt: string;
  template: { id: string; name: string; key: string } | null;
  _count: { sections: number };
}

export function SitesScreen({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [sites, setSites]     = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientSlug, setClientSlug] = useState('');

  const load = async () => {
    setLoading(true);
    const res = await fetch(`${API}/clients/${clientId}/sites`);
    if (res.status === 404) { router.push('/cms'); return; }
    const data = await res.json();
    setSites(data);

    const clientsRes = await fetch(`${API}/clients?limit=100`);
    const clientsData = await clientsRes.json();
    const client = clientsData.items?.find((c: any) => c.id === clientId);
    if (client) { setClientName(client.name); setClientSlug(client.slug); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [clientId]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deletar site "${name}"?`)) return;
    setDeleting(id);
    await fetch(`${API}/sites/${id}`, { method: 'DELETE' });
    setDeleting(null);
    load();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/cms" className="text-gray-400 hover:text-gray-600 text-sm">← Clientes</Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-base font-semibold text-gray-800">{clientName || 'Cliente'}</h1>
        </div>
        <button
          onClick={() => router.push(`/cms/clients/${clientId}/sites/new`)}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition"
        >
          + Novo Site
        </button>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Sites</h2>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-400">Carregando...</div>
          ) : sites.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">
              Nenhum site criado ainda.{' '}
              <button onClick={() => router.push(`/cms/clients/${clientId}/sites/new`)} className="text-blue-600 hover:underline">Criar primeiro site →</button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nome</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Slug</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Template</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Seções</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {sites.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-800">{s.companyName}</td>
                    <td className="px-5 py-3 font-mono text-xs text-gray-400">{s.siteSlug || s.slug}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{s.template?.name ?? '—'}</td>
                    <td className="px-5 py-3 text-center">
                      <span className="bg-green-50 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">{s._count.sections}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/${clientSlug}/${s.siteSlug || s.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-gray-400 hover:text-gray-600 font-medium px-2 py-1 rounded hover:bg-gray-100"
                        >
                          Ver →
                        </a>
                        <button
                          onClick={() => router.push(`/cms/sites/${s.id}`)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded hover:bg-blue-50"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, s.companyName)}
                          disabled={deleting === s.id}
                          className="text-xs text-red-400 hover:text-red-600 font-medium px-2 py-1 rounded hover:bg-red-50 disabled:opacity-50"
                        >
                          {deleting === s.id ? '...' : 'Deletar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
