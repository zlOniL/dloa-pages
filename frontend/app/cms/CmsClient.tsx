'use client';
import { useState, useEffect, useCallback } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const SLUGS = ['cliente-a', 'cliente-b'];

/* ── Types ── */
interface Section { id: string; type: string; enabled: boolean; content: any; order: number; }
interface Site { id: string; slug: string; companyName: string; designTokens: any; sections: Section[]; }

type SimpleField   = { key: string; label: string; type: 'text' | 'textarea' };
type ArrayField    = { key: string; label: string; type: 'array'; itemFields: SimpleField[] };
type ProductsField = { key: string; label: string; type: 'products-list' };
type FieldDef      = SimpleField | ArrayField | ProductsField;

const PRODUCT_DEFAULTS = [
  { id: 'aptanutri',  label: 'Aptanutri',  sublabel: 'Aptanutri Premium, Profutura e Soja', color: '#71bff3', imageUrl: '' },
  { id: 'fortini',    label: 'Fortini',    sublabel: 'Fortini Complete e Plus',              color: '#602A68', imageUrl: '' },
  { id: 'nutridrink', label: 'Nutridrink', sublabel: 'Nutridrink Protein e Protein Sênior',  color: '#c55871', imageUrl: '' },
  { id: 'neoforte',   label: 'Neoforte',   sublabel: 'Neoforte',                             color: '#FF6B7A', imageUrl: '' },
];
type ColorDef    = { key: 'primary' | 'secondary'; label: string };
type ImageDef    = { key: string; label: string; defaultSrc: string };
type SectionSchema = { colors: ColorDef[]; fields: FieldDef[]; images: ImageDef[] };

/* ── Section schemas ── */
const SCHEMAS: Record<string, SectionSchema> = {
  hero: {
    colors: [
      { key: 'primary',   label: 'Cor de fundo' },
      { key: 'secondary', label: 'Cor do botão' },
    ],
    fields: [
      { key: 'title',     label: 'Título',                        type: 'text' },
      { key: 'subtitle',  label: 'Subtítulo (suporta HTML)',       type: 'textarea' },
      { key: 'ctaText',   label: 'Texto do botão',                 type: 'text' },
      { key: 'ctaTarget', label: 'Link do botão (âncora ou URL)',  type: 'text' },
    ],
    images: [
      { key: 'desktopProducts', label: 'Imagem produtos (desktop)', defaultSrc: '/assets/hero-products.png' },
      { key: 'mobileProducts',  label: 'Imagem produtos (mobile)',  defaultSrc: '/assets/hero-products-mobile.png' },
    ],
  },
  'how-it-works': {
    colors: [{ key: 'primary', label: 'Cor de fundo' }],
    fields: [],
    images: [
      { key: 'steps', label: 'Imagem dos passos', defaultSrc: '/assets/como-funciona-steps.svg' },
    ],
  },
  pharmacy: {
    colors: [
      { key: 'primary',   label: 'Cor de fundo' },
      { key: 'secondary', label: 'Cor do botão de busca' },
    ],
    fields: [
      { key: 'title', label: 'Título', type: 'text' },
    ],
    images: [],
  },
  faq: {
    colors: [{ key: 'secondary', label: 'Cor ativa do acordeão' }],
    fields: [
      { key: 'title', label: 'Título', type: 'text' },
      {
        key: 'items', label: 'Perguntas & Respostas', type: 'array',
        itemFields: [
          { key: 'question', label: 'Pergunta', type: 'text' },
          { key: 'answer',   label: 'Resposta',  type: 'textarea' },
        ],
      },
    ],
    images: [],
  },
  about:    { colors: [], fields: [], images: [{ key: 'banner', label: 'Banner', defaultSrc: '/assets/about-banner.png' }] },
  products: {
    colors: [],
    images: [],
    fields: [{ key: 'products', label: 'Produtos', type: 'products-list' }],
  },
  partners: { colors: [], fields: [], images: [{ key: 'strip', label: 'Faixa de parceiros', defaultSrc: '/assets/partners-strip.svg' }] },
};

/* ── CmsClient ── */
export function CmsClient() {
  const [slug, setSlug]         = useState(SLUGS[0]);
  const [site, setSite]         = useState<Site | null>(null);
  const [tokens, setTokens]     = useState<any>({});
  const [sections, setSections] = useState<Section[]>([]);
  const [saving, setSaving]     = useState<string | null>(null);
  const [message, setMessage]   = useState('');
  const [previewKey, setPreviewKey] = useState(0);

  const load = async (s: string) => {
    setMessage('');
    const res  = await fetch(`${API}/sites/${s}`);
    const data: Site = await res.json();
    setSite(data);
    setTokens({ ...data.designTokens });
    setSections([...data.sections].sort((a, b) => a.order - b.order));
  };

  useEffect(() => { load(slug); }, [slug]);

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
    await fetch(`${API}/sites/${slug}`, {
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
    await fetch(`${API}/sites/${slug}/sections/${section.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: updated.enabled }),
    });
    flash(`✅ Seção "${section.type}" ${updated.enabled ? 'ativada' : 'desativada'}`);
    reloadPreview();
  };

  const saveContent = async (section: Section, content: any) => {
    setSaving(section.id);
    await fetch(`${API}/sites/${slug}/sections/${section.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    setSections((prev) => prev.map((s) => (s.id === section.id ? { ...s, content } : s)));
    setSaving(null);
    flash(`✅ Seção "${section.type}" salva!`);
    reloadPreview();
  };

  if (!site) return <div className="p-8 text-gray-500">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0">
        <h1 className="text-xl font-bold text-gray-800">DLOA Pages — CMS</h1>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600 font-medium">Site:</label>
          <select
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white"
          >
            {SLUGS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <a
            href={`/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm bg-gray-800 text-white px-3 py-1.5 rounded hover:bg-gray-700 transition"
          >
            Abrir em nova aba →
          </a>
        </div>
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
        <div className="w-[440px] shrink-0 overflow-y-auto border-r bg-gray-100">
          <div className="p-4 space-y-4">

            {/* Aparência global */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 border-b bg-gray-50">
                <h2 className="font-semibold text-gray-800 text-sm">🎨 Aparência global</h2>
                <p className="text-xs text-gray-400 mt-0.5">Aplicado a todas as seções sem override</p>
              </div>
              <div className="p-5 grid grid-cols-1 gap-3">
                <TokenField label="Cor Primária (fundos)"         field="colorPrimary"   tokens={tokens} onChange={setTokens} type="color" />
                <TokenField label="Cor Secundária (acentos/botões)" field="colorSecondary" tokens={tokens} onChange={setTokens} type="color" />
                <TokenField label="Fonte"          field="fontFamily"    tokens={tokens} onChange={setTokens} />
                <ImageField
                  label="Logo Nav"
                  defaultSrc="/assets/header-logo.svg"
                  value={tokens.logoUrl ?? ''}
                  slug={slug}
                  onChange={(url) => setTokens({ ...tokens, logoUrl: url })}
                  onClear={() => setTokens({ ...tokens, logoUrl: '' })}
                />
                <ImageField
                  label="Logo Rodapé"
                  defaultSrc="/assets/logo-meu-cupom-danone.webp"
                  value={tokens.footerLogoUrl ?? ''}
                  slug={slug}
                  onChange={(url) => setTokens({ ...tokens, footerLogoUrl: url })}
                  onClear={() => setTokens({ ...tokens, footerLogoUrl: '' })}
                />
              </div>
              <div className="px-5 pb-4">
                <button
                  onClick={saveTokens}
                  disabled={saving === 'tokens'}
                  className="w-full bg-gray-800 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition"
                >
                  {saving === 'tokens' ? 'Salvando...' : 'Salvar aparência'}
                </button>
              </div>
            </div>

            {/* Seções */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 border-b bg-gray-50">
                <h2 className="font-semibold text-gray-800 text-sm">🧩 Seções</h2>
              </div>
              <div className="divide-y">
                {sections.map((section) => (
                  <SectionRow
                    key={section.id}
                    section={section}
                    slug={slug}
                    saving={saving === section.id}
                    onToggle={() => toggleSection(section)}
                    onSave={(content) => saveContent(section, content)}
                  />
                ))}
              </div>
            </div>

            {/* Navegação */}
            <NavLinksPanel
              label="🔗 Menu de navegação"
              tokenKey="navItems"
              tokens={tokens}
              saving={saving === 'tokens'}
              onSave={saveTokens}
            />

            {/* Rodapé */}
            <NavLinksPanel
              label="🔗 Links do rodapé"
              tokenKey="footerLinks"
              tokens={tokens}
              saving={saving === 'tokens'}
              onSave={saveTokens}
            />

          </div>
        </div>

        {/* Right — iframe preview */}
        <div className="flex-1 flex flex-col bg-gray-200">
          <div className="px-4 py-2 bg-white border-b flex items-center gap-2">
            <span className="text-xs text-gray-500 font-mono flex-1 truncate">Preview: /{slug}</span>
            <button
              onClick={() => reloadPreview(0)}
              className="text-xs text-gray-500 hover:text-gray-800 transition px-2 py-1 rounded hover:bg-gray-100"
            >
              ↺ Recarregar
            </button>
          </div>
          <iframe
            key={previewKey}
            src={`/${slug}`}
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
function SectionRow({ section, saving, slug, onToggle, onSave }: {
  section: Section; saving: boolean; slug: string;
  onToggle: () => void; onSave: (content: any) => void;
}) {
  const schema = SCHEMAS[section.type] ?? { colors: [], fields: [], images: [] };
  const hasConfig = schema.fields.length > 0 || schema.colors.length > 0 || schema.images.length > 0;
  const [open, setOpen] = useState(false);

  const { _colors: initColors = {}, _images: initImages = {}, ...initFields } = section.content ?? {};
  const [fields, setFields] = useState<Record<string, any>>(initFields);
  const [colors, setColors] = useState<Record<string, string>>(initColors);
  const [images, setImages] = useState<Record<string, string>>(initImages);

  const handleSave = () => {
    const content: any = { ...fields };
    if (schema.colors.some((c) => colors[c.key])) content._colors = colors;
    if (schema.images.some((i) => images[i.key]))  content._images = images;
    onSave(content);
  };

  const setField = (key: string, value: any) => setFields((prev) => ({ ...prev, [key]: value }));
  const setColor = (key: string, value: string) => setColors((prev) => ({ ...prev, [key]: value }));
  const setImage = (key: string, value: string) => setImages((prev) => ({ ...prev, [key]: value }));

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
                  slug={slug}
                  onChange={(url) => setImage(imgDef.key, url)}
                  onClear={() => setImage(imgDef.key, '')}
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
                    <ProductsEditor value={fields[fieldDef.key]} slug={slug} onChange={(val) => setField(fieldDef.key, val)} />
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
function ImageField({ label, defaultSrc, value, slug, onChange, onClear }: {
  label: string; defaultSrc: string; value: string; slug: string;
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
      const res  = await fetch(`${API}/sites/${slug}/upload`, { method: 'POST', body: form });
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

/* ── ProductsEditor ── */
type ProductEntry = { id: string; label: string; sublabel: string; color: string; imageUrl: string };

function ProductsEditor({ value, slug, onChange }: {
  value?: ProductEntry[]; slug: string;
  onChange: (val: ProductEntry[]) => void;
}) {
  const merged: ProductEntry[] = PRODUCT_DEFAULTS.map((def) => {
    const ov = value?.find((p) => p.id === def.id);
    return { ...def, ...ov };
  });

  const updateProduct = (id: string, field: keyof ProductEntry, val: string) => {
    const next = merged.map((p) => p.id === id ? { ...p, [field]: val } : p);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {merged.map((product) => (
        <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden">
          {/* header with color */}
          <div className="flex items-center gap-3 px-3 py-2" style={{ backgroundColor: product.color + '22' }}>
            <input
              type="color"
              value={product.color}
              onChange={(e) => updateProduct(product.id, 'color', e.target.value)}
              className="w-7 h-7 rounded border border-gray-200 cursor-pointer p-0.5 shrink-0"
              title="Cor de fundo"
            />
            <span className="text-xs font-bold text-gray-700 flex-1">Item {PRODUCT_DEFAULTS.findIndex(d => d.id === product.id) + 1}</span>
            {product.color !== PRODUCT_DEFAULTS.find(d => d.id === product.id)!.color && (
              <button
                onClick={() => updateProduct(product.id, 'color', PRODUCT_DEFAULTS.find(d => d.id === product.id)!.color)}
                className="text-xs text-gray-400 hover:text-red-500"
                title="Restaurar cor padrão"
              >
                ↺
              </button>
            )}
          </div>

          <div className="p-3 space-y-2">
            {/* label */}
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">Título</label>
              <input
                type="text"
                value={product.label}
                onChange={(e) => updateProduct(product.id, 'label', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
              />
            </div>
            {/* sublabel */}
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">Subtítulo</label>
              <input
                type="text"
                value={product.sublabel}
                onChange={(e) => updateProduct(product.id, 'sublabel', e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
              />
            </div>
            {/* image */}
            <ImageField
              label="Imagem do produto"
              defaultSrc={
                product.id === 'aptanutri'  ? '/assets/extracted-aptanutri.webp'
                : product.id === 'fortini'    ? '/assets/extracted-fortini.svg'
                : product.id === 'nutridrink' ? '/assets/nutridrink-potes.svg'
                : '/assets/neoforte-potes.svg'
              }
              value={product.imageUrl}
              slug={slug}
              onChange={(url) => updateProduct(product.id, 'imageUrl', url)}
              onClear={() => updateProduct(product.id, 'imageUrl', '')}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── NavLinksPanel ── */
const DEFAULT_NAV_ITEMS  = [
  { label: 'Início', href: '' }, { label: 'Produtos', href: 'produtos' },
  { label: 'Sobre nós', href: 'sobre' }, { label: 'Como funciona', href: 'como-funciona' },
  { label: 'Dúvidas', href: 'duvidas' },
];
const DEFAULT_FOOTER_LINKS = [
  { label: 'Início', href: '' }, { label: 'Sobre nós', href: 'sobre' },
  { label: 'Como funciona', href: 'como-funciona' }, { label: 'Dúvidas', href: 'duvidas' },
];

function NavLinksPanel({ label, tokenKey, tokens, saving, onSave }: {
  label: string; tokenKey: 'navItems' | 'footerLinks';
  tokens: any; saving: boolean; onSave: (extra: any) => void;
}) {
  const defaults = tokenKey === 'navItems' ? DEFAULT_NAV_ITEMS : DEFAULT_FOOTER_LINKS;
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<{ label: string; href: string }[]>(
    () => tokens[tokenKey] ?? defaults
  );

  // Sync when tokens change externally (e.g. site switch)
  useEffect(() => { setItems(tokens[tokenKey] ?? defaults); }, [tokens, tokenKey]);

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
          <p className="text-xs text-gray-400 mb-3">
            Link: use o ID da seção (ex: <code>produtos</code>) para rolar até ela, ou uma URL completa (ex: <code>https://...</code>).
          </p>
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
