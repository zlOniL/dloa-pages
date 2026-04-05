'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface Template {
  id: string;
  key: string;
  name: string;
  previewUrl: string | null;
  defaultConfig: any;
}

export function NewSiteScreen({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [templates, setTemplates]     = useState<Template[]>([]);
  const [selected, setSelected]       = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [siteSlug, setSiteSlug]       = useState('');
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState('');

  useEffect(() => {
    fetch(`${API}/templates?clientId=${clientId}`)
      .then((r) => r.json())
      .then(setTemplates);
  }, [clientId]);

  const slugify = (str: string) =>
    str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) { setError('Selecione um template ou HTML Personalizado'); return; }
    setSaving(true);
    setError('');
    try {
      const isHtml = selected === '__html__';
      const res = await fetch(`${API}/sites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isHtml
            ? { clientId, siteSlug, companyName, type: 'html' }
            : { clientId, templateId: selected, siteSlug, companyName, type: 'template' },
        ),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message ?? 'Erro ao criar site');
      }
      const site = await res.json();
      router.push(`/cms/sites/${site.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center gap-3">
        <Link href={`/cms/clients/${clientId}`} className="text-gray-400 hover:text-gray-600 text-sm">← Sites</Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-base font-semibold text-gray-800">Novo Site</h1>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Site info */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700">Informações do site</h2>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nome do site / empresa</label>
              <input
                required
                value={companyName}
                onChange={(e) => { setCompanyName(e.target.value); setSiteSlug(slugify(e.target.value)); }}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                placeholder="Ex: Meu Cupom Danone"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Slug do site (URL)</label>
              <input
                required
                value={siteSlug}
                onChange={(e) => setSiteSlug(slugify(e.target.value))}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono"
                placeholder="meu-cupom-danone"
              />
              <p className="text-xs text-gray-400 mt-1">URL pública: /[slug-do-cliente]/[slug-do-site]</p>
            </div>
          </div>

          {/* Template / HTML selection */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Selecione o tipo de site</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* HTML Personalizado — always first */}
              <button
                type="button"
                onClick={() => setSelected('__html__')}
                className={`text-left border-2 rounded-xl p-4 transition ${
                  selected === '__html__'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="w-full h-28 rounded-lg mb-3 bg-gray-900 flex items-center justify-center text-gray-300 text-3xl font-mono select-none">
                  {'</>'}
                </div>
                <p className="text-sm font-semibold text-gray-800">HTML Personalizado</p>
                <p className="text-xs text-gray-400 mt-0.5">Cole seu próprio código HTML</p>
                {selected === '__html__' && (
                  <span className="mt-2 inline-block text-xs font-medium text-blue-600">✓ Selecionado</span>
                )}
              </button>

              {/* Template cards */}
              {templates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelected(t.id)}
                  className={`text-left border-2 rounded-xl p-4 transition ${
                    selected === t.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  {t.previewUrl ? (
                    <img src={t.previewUrl} alt={t.name} className="w-full h-28 object-cover rounded-lg mb-3 bg-gray-100" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <div className="w-full h-28 rounded-lg mb-3 bg-gray-100 flex items-center justify-center text-gray-300 text-xs">Sem preview</div>
                  )}
                  <p className="text-sm font-semibold text-gray-800">{t.name}</p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{t.key}</p>
                  {selected === t.id && (
                    <span className="mt-2 inline-block text-xs font-medium text-blue-600">✓ Selecionado</span>
                  )}
                </button>
              ))}

              {templates.length === 0 && selected !== '__html__' && (
                <p className="text-sm text-gray-400 col-span-2">Nenhum template disponível para este cliente.</p>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <Link
              href={`/cms/clients/${clientId}`}
              className="flex-1 text-center border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm hover:bg-gray-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving || !selected}
              className="flex-1 bg-gray-800 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition"
            >
              {saving ? 'Criando...' : 'Criar Site →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
