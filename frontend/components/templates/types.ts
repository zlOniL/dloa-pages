// Tipos compartilhados entre todos os templates — não importar de template específico

export type SimpleField   = { key: string; label: string; type: 'text' | 'textarea' };
export type ArrayField    = { key: string; label: string; type: 'array'; itemFields: SimpleField[] };
export type ProductEntry  = { id: string; label: string; sublabel: string; color: string; imageUrl: string; defaultImageSrc?: string };
export type ProductsField = { key: string; label: string; type: 'products-list'; productDefaults: ProductEntry[] };
export type FieldDef      = SimpleField | ArrayField | ProductsField;
export type ColorDef      = { key: 'primary' | 'secondary'; label: string };
export type ImageDef      = { key: string; label: string; defaultSrc: string };
export type VideoDef      = { key: string; label: string };
export type SectionSchema = { colors: ColorDef[]; fields: FieldDef[]; images: ImageDef[]; videos?: VideoDef[] };
