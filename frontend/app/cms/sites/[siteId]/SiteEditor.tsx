'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getTemplate, type NavItem } from '@/components/templates/registry';
import type { SectionSchema, SimpleField, ProductsField, ProductEntry } from '@/components/templates/types';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

/* ── Types ── */
interface Section { id: string; type: string; enabled: boolean; content: any; order: number; }
interface Site { id: string; slug: string; siteSlug: string; companyName: string; clientId: string; type: 'template' | 'html'; templateKey?: string; customHtml?: string; client: { id: string; slug: string } | null; designTokens: any; sections: Section[]; }

/* ── SiteEditor ── */
export function SiteEditor({ siteId }: { siteId: string }) {
  const [site, setSite]         = useState<Site | null>(null);
  const [tokens, setTokens]     = useState<any>({});
  const [sections, setSections] = useState<Section[]>([]);
  const [customHtml, setCustomHtml] = useState('');
  const [saving, setSaving]     = useState<string | null>(null);
  const [message, setMessage]   = useState('');
  const [previewKey, setPreviewKey] = useState(0);
  const [tokensOpen, setTokensOpen]     = useState(true);
  const [sectionsOpen, setSectionsOpen] = useState(true);
  const [sidebarOpen, setSidebarOpen]   = useState(true);

  const load = async () => {
    setMessage('');
    const res  = await fetch(`${API}/sites/by-id/${siteId}`);
    const data: Site = await res.json();
    setSite(data);
    setTokens({ ...data.designTokens });
    setSections([...data.sections].sort((a, b) => a.order - b.order));
    setCustomHtml(data.customHtml ?? '');
  };

  useEffect(() => { load(); }, [siteId]);

  const reloadPreview = useCallback((delay = 400) => {
    setTimeout(() => setPreviewKey((k) => k + 1), delay);
  }, []);

  const flash = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const saveTokens = async (extra?: any) => {
    setSaving('tokens');
    const designTokens = extra ? { ...tokens, ...extra } : tokens;
    await fetch(`${API}/sites/by-id/${siteId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ designTokens }),
    });
    if (extra) setTokens(designTokens);
    setSaving(null);
    flash('✅ Salvo!');
    reloadPreview();
  };

  const toggleSection = async (section: Section) => {
    const updated = { ...section, enabled: !section.enabled };
    setSections((prev) => prev.map((s) => (s.id === section.id ? updated : s)));
    await fetch(`${API}/sites/by-id/${siteId}/sections/${section.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: updated.enabled }),
    });
    flash(`✅ Seção "${section.type}" ${updated.enabled ? 'ativada' : 'desativada'}`);
    reloadPreview();
  };

  const saveContent = async (section: Section, content: any) => {
    setSaving(section.id);
    await fetch(`${API}/sites/by-id/${siteId}/sections/${section.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    setSections((prev) => prev.map((s) => (s.id === section.id ? { ...s, content } : s)));
    setSaving(null);
    flash(`✅ Seção "${section.type}" salva!`);
    reloadPreview();
  };

  const saveHtml = async () => {
    setSaving('html');
    await fetch(`${API}/sites/by-id/${siteId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customHtml }),
    });
    setSaving(null);
    flash('✅ HTML salvo!');
    reloadPreview();
  };

  if (!site) return <div className="p-8 text-gray-500">Carregando...</div>;

  if (site.type === 'html') {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Link href={`/cms/clients/${site.clientId}`} className="text-gray-400 hover:text-gray-600 text-sm">← Voltar</Link>
            <span className="text-gray-300">/</span>
            <h1 className="text-base font-semibold text-gray-800">{site.companyName}</h1>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-mono">HTML</span>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title={sidebarOpen ? 'Minimizar painel' : 'Expandir painel'}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded px-2 py-1 hover:bg-gray-50 transition"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
              {sidebarOpen ? 'Ocultar painel' : 'Mostrar painel'}
            </button>
          </div>
          <a
            href={`/${site.client?.slug}/${site.siteSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm bg-gray-800 text-white px-3 py-1.5 rounded hover:bg-gray-700 transition"
          >
            Abrir em nova aba →
          </a>
        </div>

        {/* Flash */}
        {message && (
          <div className="fixed top-4 right-4 bg-white border border-gray-200 shadow-lg rounded-lg px-4 py-3 text-sm z-50">
            {message}
          </div>
        )}

        {/* Two-column layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left — HTML editor */}
          {sidebarOpen && <div className="w-[520px] shrink-0 flex flex-col border-r bg-white">
            <div className="px-5 py-3 border-b bg-gray-50 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-800 text-sm">Código HTML</h2>
                <p className="text-xs text-gray-400 mt-0.5">Cole aqui o HTML completo da página</p>
              </div>
            </div>
            <textarea
              className="flex-1 w-full p-4 font-mono text-xs text-gray-800 resize-none focus:outline-none"
              placeholder="<!DOCTYPE html>&#10;<html>&#10;  ...&#10;</html>"
              value={customHtml}
              onChange={(e) => setCustomHtml(e.target.value)}
              spellCheck={false}
            />
            <div className="p-4 border-t">
              <button
                onClick={saveHtml}
                disabled={saving === 'html'}
                className="w-full bg-gray-800 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition"
              >
                {saving === 'html' ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </div>}

          {/* Right — iframe preview */}
          <div className="flex-1 flex flex-col bg-gray-200">
            <div className="px-4 py-2 bg-white border-b flex items-center gap-2">
              <span className="text-xs text-gray-500 font-mono flex-1 truncate">Preview: /{site.client?.slug}/{site.siteSlug}</span>
              <button
                onClick={() => reloadPreview(0)}
                className="text-xs text-gray-500 hover:text-gray-800 transition px-2 py-1 rounded hover:bg-gray-100"
              >
                ↺ Recarregar
              </button>
            </div>
            <iframe
              key={previewKey}
              src={`/${site.client?.slug}/${site.siteSlug}`}
              className="flex-1 w-full border-0"
              title="Preview do site"
            />
          </div>
        </div>
      </div>
    );
  }

  const { schemas, defaultNavItems, defaultFooterLinks, hasFooterLinks, footerLinksLabel, defaultLogoSrc, defaultFooterLogoSrc } = getTemplate(site.templateKey);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link href={`/cms/clients/${site.clientId}`} className="text-gray-400 hover:text-gray-600 text-sm">← Voltar</Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-base font-semibold text-gray-800">{site.companyName}</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? 'Minimizar painel' : 'Expandir painel'}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded px-2 py-1 hover:bg-gray-50 transition"
          >
            {sidebarOpen
              ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg> Ocultar painel</>
              : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg> Mostrar painel</>
            }
          </button>
        </div>
        <a
          href={`/${site.client?.slug}/${site.siteSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm bg-gray-800 text-white px-3 py-1.5 rounded hover:bg-gray-700 transition"
        >
          Abrir em nova aba →
        </a>
      </div>

      {/* Flash */}
      {message && (
        <div className="fixed top-4 right-4 bg-white border border-gray-200 shadow-lg rounded-lg px-4 py-3 text-sm z-50">
          {message}
        </div>
      )}

      {/* Two-column layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left — controls */}
        {sidebarOpen && <div className="w-[440px] shrink-0 overflow-y-auto border-r bg-gray-100">
          <div className="p-4 space-y-4">

            {/* Aparência global */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 border-b bg-gray-50 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-800 text-sm">🎨 Aparência global</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Aplicado a todas as seções sem override</p>
                </div>
                <button onClick={() => setTokensOpen(!tokensOpen)} className="text-xs text-blue-600 hover:text-blue-800 font-medium shrink-0">
                  {tokensOpen ? 'Fechar ▲' : 'Editar ▼'}
                </button>
              </div>
              {tokensOpen && <div className="p-5 grid grid-cols-1 gap-3">
                <TokenField label="Cor Primária (fundos)"           field="colorPrimary"   tokens={tokens} onChange={setTokens} type="color" />
                <TokenField label="Cor Secundária (acentos/botões)" field="colorSecondary" tokens={tokens} onChange={setTokens} type="color" />
                <TokenField label="Fonte"                           field="fontFamily"     tokens={tokens} onChange={setTokens} />
                <ImageField
                  label="Logo Nav"
                  defaultSrc={defaultLogoSrc}
                  value={tokens.logoUrl ?? ''}
                  siteId={siteId}
                  onChange={(url) => setTokens({ ...tokens, logoUrl: url })}
                  onClear={() => setTokens({ ...tokens, logoUrl: '' })}
                />
                <ImageField
                  label="Logo Rodapé"
                  defaultSrc={defaultFooterLogoSrc}
                  value={tokens.footerLogoUrl ?? ''}
                  siteId={siteId}
                  onChange={(url) => setTokens({ ...tokens, footerLogoUrl: url })}
                  onClear={() => setTokens({ ...tokens, footerLogoUrl: '' })}
                />
              </div>}
              {tokensOpen && <div className="px-5 pb-4">
                <button
                  onClick={() => saveTokens()}
                  disabled={saving === 'tokens'}
                  className="w-full bg-gray-800 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition"
                >
                  {saving === 'tokens' ? 'Salvando...' : 'Salvar aparência'}
                </button>
              </div>}
            </div>

            {/* Seções */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 border-b bg-gray-50 flex items-center justify-between">
                <h2 className="font-semibold text-gray-800 text-sm">🧩 Seções</h2>
                <button onClick={() => setSectionsOpen(!sectionsOpen)} className="text-xs text-blue-600 hover:text-blue-800 font-medium shrink-0">
                  {sectionsOpen ? 'Fechar ▲' : 'Editar ▼'}
                </button>
              </div>
              {sectionsOpen && <div className="divide-y">
                {sections.map((section) => (
                  <SectionRow
                    key={section.id}
                    section={section}
                    siteId={siteId}
                    schemas={schemas}
                    saving={saving === section.id}
                    onToggle={() => toggleSection(section)}
                    onSave={(content) => saveContent(section, content)}
                  />
                ))}
              </div>}
            </div>

            {/* Navegação */}
            <NavLinksPanel
              label="🔗 Menu de navegação"
              tokenKey="navItems"
              defaultItems={defaultNavItems}
              tokens={tokens}
              saving={saving === 'tokens'}
              onSave={saveTokens}
            />

            {/* Rodapé — só para templates que usam footerLinks */}
            {hasFooterLinks && (
              <NavLinksPanel
                label={footerLinksLabel}
                tokenKey="footerLinks"
                defaultItems={defaultFooterLinks}
                tokens={tokens}
                saving={saving === 'tokens'}
                onSave={saveTokens}
              />
            )}

          </div>
        </div>}

        {/* Right — iframe preview */}
        <div className="flex-1 flex flex-col bg-gray-200">
          <div className="px-4 py-2 bg-white border-b flex items-center gap-2">
            <span className="text-xs text-gray-500 font-mono flex-1 truncate">Preview: /{site.client?.slug}/{site.siteSlug}</span>
            <button
              onClick={() => reloadPreview(0)}
              className="text-xs text-gray-500 hover:text-gray-800 transition px-2 py-1 rounded hover:bg-gray-100"
            >
              ↺ Recarregar
            </button>
          </div>
          <iframe
            key={previewKey}
            src={`/${site.client?.slug}/${site.siteSlug}`}
            className="flex-1 w-full border-0"
            title="Preview do site"
          />
        </div>

      </div>
    </div>
  );
}

/* ── TokenField ── */
function TokenField({ label, field, tokens, onChange, type = 'text' }: {
  label: string; field: string; tokens: any;
  onChange: (t: any) => void; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        {type === 'color' && (
          <input
            type="color"
            value={tokens[field] ?? '#000000'}
            onChange={(e) => onChange({ ...tokens, [field]: e.target.value })}
            className="w-9 h-9 rounded border border-gray-200 cursor-pointer p-0.5 shrink-0"
          />
        )}
        <input
          type="text"
          value={tokens[field] ?? ''}
          onChange={(e) => onChange({ ...tokens, [field]: e.target.value })}
          className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm font-mono"
          placeholder={field}
        />
      </div>
    </div>
  );
}

/* ── SectionRow ── */
function SectionRow({ section, saving, siteId, schemas, onToggle, onSave }: {
  section: Section; saving: boolean; siteId: string;
  schemas: Record<string, SectionSchema>;
  onToggle: () => void; onSave: (content: any) => void;
}) {
  const schema = schemas[section.type] ?? { colors: [], fields: [], images: [], videos: [] };
  const hasConfig = schema.fields.length > 0 || schema.colors.length > 0 || schema.images.length > 0 || (schema.videos?.length ?? 0) > 0;
  const [open, setOpen] = useState(false);

  const { _colors: initColors = {}, _images: initImages = {}, _videos: initVideos = {}, ...initFields } = section.content ?? {};
  const [fields, setFields] = useState<Record<string, any>>(initFields);
  const [colors, setColors] = useState<Record<string, string>>(initColors);
  const [images, setImages] = useState<Record<string, string>>(initImages);
  const [videos, setVideos] = useState<Record<string, string>>(initVideos);

  const handleSave = () => {
    const content: any = { ...fields };
    if (schema.colors.some((c) => colors[c.key]))            content._colors = colors;
    if (schema.images.some((i) => images[i.key]))            content._images = images;
    if (schema.videos?.some((v) => videos[v.key]))           content._videos = videos;
    onSave(content);
  };

  const setField = (key: string, value: any) => setFields((prev) => ({ ...prev, [key]: value }));
  const setColor = (key: string, value: string) => setColors((prev) => ({ ...prev, [key]: value }));
  const setImage = (key: string, value: string) => setImages((prev) => ({ ...prev, [key]: value }));
  const setVideo = (key: string, value: string) => setVideos((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="px-5 py-3">
      {/* Toggle row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggle}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${section.enabled ? 'bg-green-500' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${section.enabled ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
          </button>
          <span className="text-sm font-mono font-medium text-gray-800">{section.type}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${section.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {section.enabled ? 'ativa' : 'inativa'}
          </span>
        </div>
        {hasConfig && (
          <button onClick={() => setOpen(!open)} className="text-xs text-blue-600 hover:text-blue-800 font-medium shrink-0">
            {open ? 'Fechar ▲' : 'Editar ▼'}
          </button>
        )}
      </div>

      {/* Editor */}
      {open && hasConfig && (
        <div className="mt-3 space-y-4">

          {/* Color overrides */}
          {schema.colors.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Cores desta seção</p>
              {schema.colors.map((colorDef) => (
                <div key={colorDef.key}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{colorDef.label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={colors[colorDef.key] ?? '#000000'}
                      onChange={(e) => setColor(colorDef.key, e.target.value)}
                      className="w-9 h-9 rounded border border-gray-200 cursor-pointer p-0.5 shrink-0"
                    />
                    <input
                      type="text"
                      value={colors[colorDef.key] ?? ''}
                      onChange={(e) => setColor(colorDef.key, e.target.value)}
                      placeholder="Vazio = usa cor global"
                      className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm font-mono"
                    />
                    {colors[colorDef.key] && (
                      <button onClick={() => setColor(colorDef.key, '')} className="text-xs text-gray-400 hover:text-red-500 shrink-0" title="Remover override">✕</button>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Vazio = usa a cor {colorDef.key === 'primary' ? 'primária' : 'secundária'} global
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Image overrides */}
          {schema.images.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Imagens desta seção</p>
              {schema.images.map((imgDef) => (
                <ImageField
                  key={imgDef.key}
                  label={imgDef.label}
                  defaultSrc={imgDef.defaultSrc}
                  value={images[imgDef.key] ?? ''}
                  siteId={siteId}
                  onChange={(url) => setImage(imgDef.key, url)}
                  onClear={() => setImage(imgDef.key, '')}
                />
              ))}
            </div>
          )}

          {/* Video overrides */}
          {(schema.videos?.length ?? 0) > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Vídeos desta seção</p>
              {schema.videos!.map((vidDef) => (
                <VideoField
                  key={vidDef.key}
                  label={vidDef.label}
                  value={videos[vidDef.key] ?? ''}
                  siteId={siteId}
                  onChange={(url) => setVideo(vidDef.key, url)}
                  onClear={() => setVideo(vidDef.key, '')}
                />
              ))}
            </div>
          )}

          {/* Content fields */}
          {schema.fields.length > 0 && (
            <div className="space-y-3">
              {(schema.colors.length > 0 || schema.images.length > 0) && (
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Conteúdo</p>
              )}
              {schema.fields.map((fieldDef) => (
                <div key={fieldDef.key}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{fieldDef.label}</label>
                  {fieldDef.type === 'products-list' ? (
                    <ProductsEditor fieldDef={fieldDef as ProductsField} value={fields[fieldDef.key]} siteId={siteId} onChange={(val) => setField(fieldDef.key, val)} />
                  ) : fieldDef.type === 'array' ? (
                    <ArrayEditor value={fields[fieldDef.key] ?? []} itemFields={fieldDef.itemFields} onChange={(val) => setField(fieldDef.key, val)} />
                  ) : fieldDef.type === 'textarea' ? (
                    <textarea value={fields[fieldDef.key] ?? ''} onChange={(e) => setField(fieldDef.key, e.target.value)} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 resize-y" />
                  ) : (
                    <input type="text" value={fields[fieldDef.key] ?? ''} onChange={(e) => setField(fieldDef.key, e.target.value)} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" />
                  )}
                </div>
              ))}
            </div>
          )}

          <button onClick={handleSave} disabled={saving} className="w-full bg-blue-600 text-white py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50 transition">
            {saving ? 'Salvando...' : 'Salvar seção'}
          </button>
        </div>
      )}
    </div>
  );
}

/* ── ImageField ── */
function ImageField({ label, defaultSrc, value, siteId, onChange, onClear }: {
  label: string; defaultSrc: string; value: string; siteId: string;
  onChange: (url: string) => void; onClear: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const preview = value || defaultSrc;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const res  = await fetch(`${API}/sites/by-id/${siteId}/upload`, { method: 'POST', body: form });
      const data = await res.json();
      const fullUrl = data.url.startsWith('http') ? data.url : `${API}${data.url}`;
      onChange(fullUrl);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>

      {/* Preview */}
      <div className="mb-2 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center h-24">
        <img src={preview} alt={label} className="max-h-full max-w-full object-contain" />
      </div>

      {/* URL input */}
      <div className="flex items-center gap-2 mb-1.5">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Cole uma URL ou faça upload →"
          className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-xs font-mono"
        />
        {value && (
          <button onClick={onClear} className="text-xs text-gray-400 hover:text-red-500 shrink-0" title="Restaurar padrão">✕</button>
        )}
      </div>

      {/* Upload button */}
      <label className={`inline-flex items-center gap-1.5 cursor-pointer text-xs font-medium px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 transition ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
        {uploading ? 'Enviando...' : '⬆ Upload de arquivo'}
        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
      </label>

      {!value && (
        <p className="text-xs text-gray-400 mt-1">Usando imagem padrão do projeto</p>
      )}
    </div>
  );
}

/* ── VideoField ── */
function VideoField({ label, value, siteId, onChange, onClear }: {
  label: string; value: string; siteId: string;
  onChange: (url: string) => void; onClear: () => void;
}) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const res  = await fetch(`${API}/sites/by-id/${siteId}/upload`, { method: 'POST', body: form });
      const data = await res.json();
      const fullUrl = data.url.startsWith('http') ? data.url : `${API}${data.url}`;
      onChange(fullUrl);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>

      {/* Preview */}
      {value ? (
        <div className="mb-2 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center h-24">
          <video src={value} className="max-h-full max-w-full object-contain" muted playsInline controls={false} />
        </div>
      ) : (
        <div className="mb-2 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center h-24 text-gray-400 text-xs">
          Nenhum vídeo selecionado
        </div>
      )}

      {/* URL input */}
      <div className="flex items-center gap-2 mb-1.5">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Cole uma URL ou faça upload →"
          className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-xs font-mono"
        />
        {value && (
          <button onClick={onClear} className="text-xs text-gray-400 hover:text-red-500 shrink-0" title="Remover vídeo">✕</button>
        )}
      </div>

      {/* Upload button */}
      <label className={`inline-flex items-center gap-1.5 cursor-pointer text-xs font-medium px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 transition ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
        {uploading ? 'Enviando...' : '⬆ Upload de vídeo'}
        <input type="file" accept="video/*" className="hidden" onChange={handleUpload} disabled={uploading} />
      </label>
    </div>
  );
}

/* ── ProductsEditor ── */
function ProductsEditor({ fieldDef, value, siteId, onChange }: {
  fieldDef: ProductsField; value?: ProductEntry[]; siteId: string;
  onChange: (val: ProductEntry[]) => void;
}) {
  const defaults = fieldDef.productDefaults;

  const merged: ProductEntry[] = defaults.map((def) => {
    const ov = value?.find((p) => p.id === def.id);
    return { ...def, ...ov };
  });

  const updateProduct = (id: string, field: keyof ProductEntry, val: string) => {
    const next = merged.map((p) => p.id === id ? { ...p, [field]: val } : p);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {merged.map((product, idx) => {
        const def = defaults.find(d => d.id === product.id)!;
        return (
          <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center gap-3 px-3 py-2" style={{ backgroundColor: product.color + '22' }}>
              <input
                type="color"
                value={product.color}
                onChange={(e) => updateProduct(product.id, 'color', e.target.value)}
                className="w-7 h-7 rounded border border-gray-200 cursor-pointer p-0.5 shrink-0"
                title="Cor de fundo"
              />
              <span className="text-xs font-bold text-gray-700 flex-1">Item {idx + 1}</span>
              {product.color !== def.color && (
                <button
                  onClick={() => updateProduct(product.id, 'color', def.color)}
                  className="text-xs text-gray-400 hover:text-red-500"
                  title="Restaurar cor padrão"
                >↺</button>
              )}
            </div>
            <div className="p-3 space-y-2">
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Título</label>
                <input type="text" value={product.label} onChange={(e) => updateProduct(product.id, 'label', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Subtítulo</label>
                <input type="text" value={product.sublabel} onChange={(e) => updateProduct(product.id, 'sublabel', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
              </div>
              <ImageField
                label="Imagem do produto"
                defaultSrc={def.defaultImageSrc ?? ''}
                value={product.imageUrl}
                siteId={siteId}
                onChange={(url) => updateProduct(product.id, 'imageUrl', url)}
                onClear={() => updateProduct(product.id, 'imageUrl', '')}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── NavLinksPanel ── */
function NavLinksPanel({ label, tokenKey, defaultItems, tokens, saving, onSave }: {
  label: string; tokenKey: 'navItems' | 'footerLinks';
  defaultItems: NavItem[];
  tokens: any; saving: boolean; onSave: (extra: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NavItem[]>(
    () => tokens[tokenKey] ?? defaultItems
  );

  useEffect(() => { setItems(tokens[tokenKey] ?? defaultItems); }, [tokens, tokenKey]);

  const update = (i: number, field: 'label' | 'href', val: string) => {
    const next = [...items];
    next[i] = { ...next[i], [field]: val };
    setItems(next);
  };
  const add    = () => setItems([...items, { label: 'Novo item', href: '' }]);
  const remove = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-5 py-3 border-b bg-gray-50 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800 text-sm">{label}</h2>
        <button onClick={() => setOpen(!open)} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
          {open ? 'Fechar ▲' : 'Editar ▼'}
        </button>
      </div>

      {open && (
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-400">
              Use o ID da seção (ex: <code>portfolio</code>) para rolar, ou URL completa.
            </p>
            <button
              onClick={() => setItems([...defaultItems])}
              className="text-xs text-amber-600 hover:text-amber-800 font-medium shrink-0 ml-2"
              title="Restaurar links padrão do template"
            >
              ↺ Padrão
            </button>
          </div>
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={item.label}
                onChange={(e) => update(i, 'label', e.target.value)}
                placeholder="Texto"
                className="w-[40%] border border-gray-300 rounded px-2 py-1.5 text-xs"
              />
              <input
                type="text"
                value={item.href}
                onChange={(e) => update(i, 'href', e.target.value)}
                placeholder="Link / âncora"
                className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-xs font-mono"
              />
              <button onClick={() => remove(i)} className="text-gray-300 hover:text-red-500 text-xs font-bold shrink-0">✕</button>
            </div>
          ))}
          <button onClick={add} className="text-xs text-blue-600 hover:text-blue-800 font-medium">+ Adicionar item</button>
          <button
            onClick={() => onSave({ [tokenKey]: items })}
            disabled={saving}
            className="w-full mt-2 bg-gray-800 text-white py-1.5 rounded-lg text-xs font-medium hover:bg-gray-700 disabled:opacity-50 transition"
          >
            {saving ? 'Salvando...' : 'Salvar links'}
          </button>
        </div>
      )}
    </div>
  );
}

/* ── ArrayEditor ── */
function ArrayEditor({ value, itemFields, onChange }: {
  value: any[]; itemFields: SimpleField[];
  onChange: (val: any[]) => void;
}) {
  const updateItem = (index: number, key: string, val: string) => {
    const next = [...value];
    next[index] = { ...next[index], [key]: val };
    onChange(next);
  };

  const addItem = () => {
    const empty = Object.fromEntries(itemFields.map((f) => [f.key, '']));
    onChange([...value, empty]);
  };

  const removeItem = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {value.map((item, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50 relative">
          <button
            onClick={() => removeItem(index)}
            className="absolute top-2 right-2 text-gray-300 hover:text-red-500 text-xs font-bold leading-none"
            title="Remover"
          >
            ✕
          </button>
          <p className="text-xs text-gray-400 font-medium">#{index + 1}</p>
          {itemFields.map((f) => (
            <div key={f.key}>
              <label className="block text-xs text-gray-500 mb-0.5">{f.label}</label>
              {f.type === 'textarea' ? (
                <textarea
                  value={item[f.key] ?? ''}
                  onChange={(e) => updateItem(index, f.key, e.target.value)}
                  rows={2}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs bg-white resize-y"
                />
              ) : (
                <input
                  type="text"
                  value={item[f.key] ?? ''}
                  onChange={(e) => updateItem(index, f.key, e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs bg-white"
                />
              )}
            </div>
          ))}
        </div>
      ))}
      <button
        onClick={addItem}
        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
      >
        + Adicionar item
      </button>
    </div>
  );
}
