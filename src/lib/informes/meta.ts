// Lectura de Meta Ads (Marketing API, endpoint de insights).
// Dos formas de conectarlo:
//  · Puente (por defecto): el proyecto amplify-web hace las consultas con su
//    META_TOKEN (api/informes-proxy.js). Aquí basta INFORMES_PROXY_SECRET.
//  · Directo: META_ACCESS_TOKEN en este proyecto.
// META_AD_ACCOUNT_ID es opcional (por defecto la cuenta de Amplify).

const VERSION = process.env.META_API_VERSION || "v26.0";
const DEFAULT_ACCOUNT = "act_1232179058699666"; // cuenta publicitaria de Amplify (ID público, no secreto)
export const PROXY_URL = process.env.INFORMES_PROXY_URL || "https://amp.amplifyesp.com/api/informes-proxy";
const viaProxy = () => !process.env.META_ACCESS_TOKEN && Boolean(process.env.INFORMES_PROXY_SECRET);

export function metaConfigured() {
  return Boolean(process.env.META_ACCESS_TOKEN || process.env.INFORMES_PROXY_SECRET);
}

function account() {
  const id = (process.env.META_AD_ACCOUNT_ID || DEFAULT_ACCOUNT).trim();
  return id.startsWith("act_") ? id : `act_${id}`;
}

type Action = { action_type: string; value: string };
export type InsightRow = {
  campaign_id?: string;
  campaign_name?: string;
  ad_id?: string;
  ad_name?: string;
  spend?: string;
  impressions?: string;
  clicks?: string;
  inline_link_clicks?: string;
  reach?: string;
  ctr?: string;
  actions?: Action[];
  date_start?: string;
  country?: string;
  age?: string;
  gender?: string;
};

async function get(path: string, params: Record<string, string>) {
  let url: URL;
  const init: RequestInit = { cache: "no-store" };
  if (viaProxy()) {
    url = new URL(PROXY_URL);
    url.searchParams.set("target", "meta");
    url.searchParams.set("path", path);
    init.headers = { "x-informes-secret": process.env.INFORMES_PROXY_SECRET || "" };
  } else {
    url = new URL(`https://graph.facebook.com/${VERSION}/${path}`);
    url.searchParams.set("access_token", process.env.META_ACCESS_TOKEN || "");
  }
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, init);
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) {
    const msg = json?.error?.message || `HTTP ${res.status}`;
    throw new Error(`Meta: ${msg}`);
  }
  return json as { data: unknown[]; paging?: { next?: string; cursors?: { after?: string } } };
}

// Lee todas las páginas (hasta un límite razonable).
async function getAll<T>(path: string, params: Record<string, string>, maxPages = 20): Promise<T[]> {
  const out: T[] = [];
  let page = await get(path, { limit: "500", ...params });
  out.push(...(page.data as T[]));
  // Paginación por cursor (el puente quita las URLs "next", que llevan el token)
  for (let i = 1; i < maxPages && page.data.length >= 500 && page.paging?.cursors?.after; i++) {
    page = await get(path, { limit: "500", ...params, after: page.paging.cursors.after });
    if (!Array.isArray(page.data)) break;
    out.push(...(page.data as T[]));
  }
  return out;
}

const LEAD_TYPES = ["lead", "offsite_conversion.fb_pixel_lead", "onsite_conversion.lead_grouped"];

export function leadsOf(r: InsightRow) {
  const acts = r.actions ?? [];
  for (const t of LEAD_TYPES) {
    const a = acts.find((x) => x.action_type === t);
    if (a) return Number(a.value) || 0;
  }
  return 0;
}

export function visitsOf(r: InsightRow) {
  const a = (r.actions ?? []).find((x) => x.action_type === "landing_page_view");
  return a ? Number(a.value) || 0 : 0;
}

export type MetaWindow = { since: string | null; until: string };

function timeParams(w: MetaWindow): Record<string, string> {
  return w.since
    ? { time_range: JSON.stringify({ since: w.since, until: w.until }) }
    : { date_preset: "maximum" };
}

const BASE_FIELDS = "spend,impressions,clicks,inline_link_clicks,reach,ctr,actions";

// Filtro por nombre de campaña: Meta solo admite un CONTAIN por campo, así que se usa
// la primera palabra como filtro grueso y el resto se afina al leer.
function campaignFilter(keywords: string[]): Record<string, string> {
  return keywords.length
    ? {
        filtering: JSON.stringify([
          { field: "campaign.name", operator: "CONTAIN", value: keywords[0] },
        ]),
      }
    : {};
}

export async function fetchMeta(w: MetaWindow, keywords: string[]) {
  const t = timeParams(w);
  const kw = keywords.map((k) => k.toLowerCase());
  const matches = (name?: string) => !kw.length || kw.some((k) => (name || "").toLowerCase().includes(k));

  // Con varias palabras no se filtra en Meta (se filtra aquí), para no perder campañas.
  const filter: Record<string, string> = kw.length === 1 ? campaignFilter(kw) : {};
  const act = account();

  const [campaigns, daily, ads, countries, audience, adStatus] = await Promise.all([
    getAll<InsightRow>(`${act}/insights`, {
      level: "campaign",
      fields: `campaign_id,campaign_name,${BASE_FIELDS}`,
      ...t,
      ...filter,
    }),
    getAll<InsightRow>(`${act}/insights`, {
      level: "campaign",
      fields: `campaign_name,spend,actions`,
      time_increment: "1",
      ...t,
      ...filter,
    }),
    getAll<InsightRow>(`${act}/insights`, {
      level: "ad",
      fields: `ad_id,ad_name,campaign_name,${BASE_FIELDS}`,
      ...t,
      ...filter,
    }),
    getAll<InsightRow>(`${act}/insights`, {
      level: "campaign",
      fields: `campaign_name,spend,clicks,inline_link_clicks,actions`,
      breakdowns: "country",
      ...t,
      ...filter,
    }),
    getAll<InsightRow>(`${act}/insights`, {
      level: "campaign",
      fields: `campaign_name,spend,actions`,
      breakdowns: "age,gender",
      ...t,
      ...filter,
    }),
    getAll<{ id: string; effective_status?: string }>(`${act}/ads`, {
      fields: "id,effective_status",
    }, 10).catch(() => [] as { id: string; effective_status?: string }[]),
  ]);

  const active = new Set(adStatus.filter((a) => a.effective_status === "ACTIVE").map((a) => a.id));

  return {
    campaigns: campaigns.filter((r) => matches(r.campaign_name)),
    daily: daily.filter((r) => matches(r.campaign_name)),
    ads: ads.filter((r) => matches(r.campaign_name)).map((r) => ({ ...r, active: active.has(r.ad_id || "") })),
    countries: countries.filter((r) => matches(r.campaign_name)),
    audience: audience.filter((r) => matches(r.campaign_name)),
  };
}

// Nombres de campañas de los últimos 90 días, para elegir palabras clave en Ajustes.
export async function listCampaignNames() {
  const rows = await getAll<{ name: string; effective_status?: string }>(`${account()}/campaigns`, {
    fields: "name,effective_status",
  }, 5);
  return rows.map((r) => ({ name: r.name, active: r.effective_status === "ACTIVE" }));
}
