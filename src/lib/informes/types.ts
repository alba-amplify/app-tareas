// Tipos del informe de funnels (Meta Ads + GoHighLevel).

// Cómo se reconoce cada funnel en Meta y en GHL. Se edita desde Informes > Ajustes
// y se guarda en el panel (panel_state.data.informes).
export type FunnelConfig = {
  id: string;
  name: string;
  landing: string; // URL de la landing
  // Meta: campañas cuyo nombre contiene alguna de estas palabras (sin distinguir mayúsculas)
  campaignKeywords: string[];
  // GHL: etiquetas que marcan cada paso del embudo
  tags: { registro: string; asistio: string; cita: string; compra: string };
  // GHL: pipeline comercial del funnel. Si hay pipeline, los pasos del embudo se
  // cuentan por sus etapas (registro = entra en el pipeline, cita = etapa con "cita",
  // asistió = etapa con "asist", compra = etapa de compra o posterior / ganada).
  pipelineId: string;
  pipelineName: string; // se usa si no hay pipelineId (p. ej. "Masterclass Pipeline Funnel - BF")
  purchaseStage: string; // nombre de la etapa que cuenta como compra (p. ej. "Acceso compra")
  // Precio de venta para estimar ingresos si GHL no trae importe en la oportunidad
  price: number;
};

export type InformesConfig = { funnels: FunnelConfig[] };

export type Range = "7" | "14" | "30" | "all";

export type Row = Record<string, string | number | null>;

export type Report = {
  funnel: { id: string; name: string; landing: string };
  range: Range;
  since: string | null; // AAAA-MM-DD
  until: string;
  generatedAt: string;
  demo: boolean;
  sources: {
    meta: { configured: boolean; ok: boolean; error?: string };
    ghl: { configured: boolean; ok: boolean; error?: string };
  };
  totals: {
    spend: number;
    impressions: number;
    clicks: number;
    reach: number;
    metaLeads: number;
    visits: number;
    registros: number;
    asistio: number;
    citas: number;
    compras: number;
    ingresos: number;
  };
  today: { spend: number; visits: number; registros: number; citas: number; compras: number };
  daily: { date: string; spend: number; registros: number; metaLeads: number }[];
  countries: {
    country: string;
    spend: number;
    clicks: number;
    metaLeads: number;
    inscritos: number;
  }[];
  ads: {
    id: string;
    name: string;
    campaign: string;
    active: boolean;
    spend: number;
    impressions: number;
    ctr: number;
    leads: number;
  }[];
  campaigns: {
    id: string;
    name: string;
    spend: number;
    leads: number;
    ctr: number;
    reach: number;
    clicks: number;
    impressions: number;
  }[];
  audience: { age: string; gender: string; spend: number; leads: number }[];
  leadStatus: { key: string; label: string; count: number }[];
  pipeline: { name: string; stages: { name: string; count: number; value: number }[] } | null;
};
