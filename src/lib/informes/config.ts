import type { SupabaseClient } from "@supabase/supabase-js";
import type { FunnelConfig, InformesConfig } from "./types";
import { loadPanel, savePanel } from "@/lib/panel";

// Funnels por defecto. Las etiquetas de GHL y las palabras de las campañas se pueden
// cambiar desde Informes > Ajustes (eligiendo entre las etiquetas reales de GHL).
export const DEFAULT_FUNNELS: FunnelConfig[] = [
  {
    id: "intensivo",
    name: "Intensivo Marca Personal",
    landing: "https://amp.amplifyesp.com/intensivo-marca-personal",
    campaignKeywords: ["intensivo", "masterclass"],
    tags: { registro: "", asistio: "", cita: "", compra: "" },
    pipelineId: "",
    pipelineName: "Masterclass Pipeline Funnel - BF",
    purchaseStage: "Acceso compra",
    price: 297,
  },
  {
    id: "amplify-20",
    name: "Amplify 2.0",
    landing: "https://amp.amplifyesp.com/amplify-20",
    campaignKeywords: ["amplify 2.0", "amplify 2", "amplify-20", "amplify20"],
    tags: { registro: "", asistio: "", cita: "", compra: "" },
    pipelineId: "",
    pipelineName: "",
    purchaseStage: "Acceso Amplify 2.0",
    price: 997,
  },
];

function clean(f: Partial<FunnelConfig>, base: FunnelConfig): FunnelConfig {
  const str = (v: unknown, d: string) => (typeof v === "string" ? v.trim().slice(0, 200) : d);
  const tags = (f.tags ?? {}) as Partial<FunnelConfig["tags"]>;
  return {
    id: base.id,
    name: str(f.name, base.name) || base.name,
    landing: str(f.landing, base.landing),
    campaignKeywords: Array.isArray(f.campaignKeywords)
      ? f.campaignKeywords.map((k) => String(k).trim().toLowerCase()).filter(Boolean).slice(0, 12)
      : base.campaignKeywords,
    tags: {
      registro: str(tags.registro, base.tags.registro),
      asistio: str(tags.asistio, base.tags.asistio),
      cita: str(tags.cita, base.tags.cita),
      compra: str(tags.compra, base.tags.compra),
    },
    pipelineId: str(f.pipelineId, base.pipelineId),
    pipelineName: str(f.pipelineName, base.pipelineName),
    purchaseStage: str(f.purchaseStage, base.purchaseStage),
    price: Number.isFinite(Number(f.price)) && Number(f.price) >= 0 ? Number(f.price) : base.price,
  };
}

export function normalizeConfig(raw: unknown): InformesConfig {
  const saved = (raw && typeof raw === "object" ? (raw as InformesConfig).funnels : null) ?? [];
  const byId = new Map(saved.filter((f) => f && typeof f.id === "string").map((f) => [f.id, f]));
  return { funnels: DEFAULT_FUNNELS.map((d) => clean(byId.get(d.id) ?? {}, d)) };
}

export async function loadConfig(supabase: SupabaseClient): Promise<InformesConfig> {
  try {
    const { state } = await loadPanel(supabase);
    return normalizeConfig(state.informes);
  } catch {
    return normalizeConfig(null);
  }
}

// Guarda los ajustes dentro del documento del panel, respetando la versión (rev)
// para no pisar cambios que alguien esté haciendo a la vez en las tareas.
export async function saveConfig(supabase: SupabaseClient, userId: string, cfg: InformesConfig) {
  const next = normalizeConfig(cfg);
  for (let i = 0; i < 4; i++) {
    const { state, rev } = await loadPanel(supabase);
    const r = await savePanel(supabase, userId, { ...state, informes: next }, rev);
    if (!r.conflict) return next;
  }
  throw new Error("El panel se está guardando a la vez desde otro sitio. Prueba de nuevo.");
}
