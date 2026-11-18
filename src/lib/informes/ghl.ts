// Lectura de GoHighLevel (API v2, services.leadconnectorhq.com).
// Dos formas de conectarlo:
//  · Puente (por defecto): amplify-web hace las consultas con su GHL_TOKEN
//    (api/informes-proxy.js). Aquí basta INFORMES_PROXY_SECRET.
//  · Directo: GHL_TOKEN en este proyecto.
// GHL_LOCATION_ID es opcional (por defecto la sub-cuenta de Amplify).
import { PROXY_URL } from "./meta";

const BASE = "https://services.leadconnectorhq.com";
const DEFAULT_LOCATION = "kQUjggPAg7eMIMoRci38"; // sub-cuenta de Amplify (ID público, no secreto)
const viaProxy = () => !process.env.GHL_TOKEN && Boolean(process.env.INFORMES_PROXY_SECRET);

export function ghlConfigured() {
  return Boolean(process.env.GHL_TOKEN || process.env.INFORMES_PROXY_SECRET);
}

const loc = () => (process.env.GHL_LOCATION_ID || DEFAULT_LOCATION).trim();

async function call(path: string, init: RequestInit & { version?: string } = {}) {
  const { version = "2021-07-28", ...rest } = init;
  const ctype: Record<string, string> = rest.body ? { "Content-Type": "application/json" } : {};
  let res: Response;
  if (viaProxy()) {
    const [p, qs] = path.split("?");
    const u = new URL(PROXY_URL);
    new URLSearchParams(qs || "").forEach((v, k) => u.searchParams.set(k, v));
    u.searchParams.set("target", "ghl");
    u.searchParams.set("path", p);
    res = await fetch(u, {
      ...rest,
      cache: "no-store",
      headers: { "x-informes-secret": process.env.INFORMES_PROXY_SECRET || "", "x-ghl-version": version, Accept: "application/json", ...ctype },
    });
  } else {
    res = await fetch(BASE + path, {
      ...rest,
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${process.env.GHL_TOKEN || ""}`,
        Version: version,
        Accept: "application/json",
        ...ctype,
      },
    });
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json?.message || json?.error || `HTTP ${res.status}`;
    throw new Error(`GHL: ${Array.isArray(msg) ? msg.join(", ") : msg}`);
  }
  return json;
}

export type GhlContact = {
  id: string;
  phone?: string | null;
  country?: string | null;
  tags?: string[];
  dateAdded?: string;
};

// Contactos con una etiqueta (y opcionalmente dados de alta en un rango de fechas).
export async function contactsWithTag(tag: string, since: string | null, until: string) {
  if (!tag) return [] as GhlContact[];
  const filters: unknown[] = [{ field: "tags", operator: "eq", value: tag }];
  if (since) {
    filters.push({
      field: "dateAdded",
      operator: "range",
      value: { gte: `${since}T00:00:00Z`, lte: `${until}T23:59:59Z` },
    });
  }
  const out: GhlContact[] = [];
  let searchAfter: unknown[] | undefined;
  for (let i = 0; i < 20; i++) {
    const body: Record<string, unknown> = {
      locationId: loc(),
      pageLimit: 500,
      filters,
      sort: [{ field: "dateAdded", direction: "asc" }],
    };
    if (searchAfter) body.searchAfter = searchAfter;
    const json = await call("/contacts/search", { method: "POST", body: JSON.stringify(body) });
    const batch = (json.contacts ?? []) as (GhlContact & { searchAfter?: unknown[] })[];
    out.push(...batch);
    if (batch.length < 500) break;
    searchAfter = batch[batch.length - 1]?.searchAfter;
    if (!searchAfter) break;
  }
  return out;
}

export type GhlOpportunity = {
  id: string;
  monetaryValue?: number;
  pipelineStageId?: string;
  status?: string;
  createdAt?: string;
  contactId?: string;
  contact?: { phone?: string | null; tags?: string[] };
};

const mdy = (d: string) => {
  const [y, m, dd] = d.split("-");
  return `${m}-${dd}-${y}`;
};

export async function opportunities(pipelineId: string, since: string | null, until: string) {
  const out: GhlOpportunity[] = [];
  for (let page = 1; page <= 30; page++) {
    const q = new URLSearchParams({
      location_id: loc(),
      pipeline_id: pipelineId,
      status: "all",
      limit: "100",
      page: String(page),
    });
    if (since) {
      q.set("date", mdy(since));
      q.set("endDate", mdy(until));
    }
    const json = await call(`/opportunities/search?${q}`);
    const batch = (json.opportunities ?? []) as GhlOpportunity[];
    out.push(...batch);
    if (batch.length < 100 || !json.meta?.nextPage) break;
  }
  return out;
}

export type GhlPipeline = { id: string; name: string; stages: { id: string; name: string; position: number }[] };

export async function pipelines(): Promise<GhlPipeline[]> {
  const path = `/opportunities/pipelines?locationId=${encodeURIComponent(loc())}`;
  let json;
  try {
    json = await call(path);
  } catch {
    json = await call(path, { version: "v3" });
  }
  return ((json.pipelines ?? []) as GhlPipeline[]).map((p) => ({
    id: p.id,
    name: p.name,
    stages: [...(p.stages ?? [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
  }));
}

export async function tags(): Promise<string[]> {
  const json = await call(`/locations/${encodeURIComponent(loc())}/tags`);
  return ((json.tags ?? []) as { name: string }[]).map((t) => t.name).sort((a, b) => a.localeCompare(b, "es"));
}

// País por prefijo telefónico (los inscritos de GHL se asignan así).
const PREFIXES: [string, string][] = [
  ["+593", "EC"], ["+598", "UY"], ["+595", "PY"], ["+591", "BO"], ["+507", "PA"], ["+506", "CR"],
  ["+505", "NI"], ["+504", "HN"], ["+503", "SV"], ["+502", "GT"], ["+351", "PT"], ["+376", "AD"],
  ["+1809", "DO"], ["+1829", "DO"], ["+1849", "DO"], ["+1787", "PR"], ["+1939", "PR"],
  ["+34", "ES"], ["+52", "MX"], ["+57", "CO"], ["+54", "AR"], ["+56", "CL"], ["+51", "PE"],
  ["+58", "VE"], ["+53", "CU"], ["+33", "FR"], ["+39", "IT"], ["+44", "GB"], ["+49", "DE"],
  ["+41", "CH"], ["+32", "BE"], ["+31", "NL"], ["+55", "BR"], ["+1", "US"],
];

export function countryOfPhone(phone?: string | null): string | null {
  if (!phone) return null;
  const p = phone.replace(/[^\d+]/g, "");
  const n = p.startsWith("+") ? p : p.startsWith("00") ? "+" + p.slice(2) : null;
  if (!n) return null;
  for (const [pre, cc] of PREFIXES) if (n.startsWith(pre)) return cc;
  return null;
}
