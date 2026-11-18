import type { FunnelConfig, Range, Report } from "./types";
import { fetchMeta, leadsOf, metaConfigured, visitsOf, type InsightRow } from "./meta";
import {
  contactsWithTag,
  countryOfPhone,
  ghlConfigured,
  opportunities,
  pipelines,
  type GhlContact,
} from "./ghl";

// Fechas en hora de Madrid (AAAA-MM-DD).
function ymd(d: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(d);
}
export function windowFor(range: Range) {
  const until = ymd(new Date());
  if (range === "all") return { since: null, until };
  const days = Number(range);
  const s = new Date(Date.now() - (days - 1) * 86400000);
  return { since: ymd(s), until };
}

const num = (v: unknown) => Number(v) || 0;

// Caché de 5 minutos por funnel y rango (igual que el panel de referencia).
const cache = new Map<string, { at: number; data: Report }>();
const TTL = 5 * 60 * 1000;

export async function buildReport(f: FunnelConfig, range: Range, fresh = false): Promise<Report> {
  const key = JSON.stringify([f, range]);
  const hit = cache.get(key);
  if (!fresh && hit && Date.now() - hit.at < TTL) return hit.data;

  const w = windowFor(range);
  const today = w.until;
  const r: Report = {
    funnel: { id: f.id, name: f.name, landing: f.landing },
    range,
    since: w.since,
    until: w.until,
    generatedAt: new Date().toISOString(),
    demo: false,
    sources: {
      meta: { configured: metaConfigured(), ok: false },
      ghl: { configured: ghlConfigured(), ok: false },
    },
    totals: { spend: 0, impressions: 0, clicks: 0, reach: 0, metaLeads: 0, visits: 0, registros: 0, asistio: 0, citas: 0, compras: 0, ingresos: 0 },
    today: { spend: 0, visits: 0, registros: 0, citas: 0, compras: 0 },
    daily: [],
    countries: [],
    ads: [],
    campaigns: [],
    audience: [],
    leadStatus: [],
    pipeline: null,
  };

  const days = new Map<string, { spend: number; registros: number; metaLeads: number }>();
  const day = (d: string) => {
    if (!days.has(d)) days.set(d, { spend: 0, registros: 0, metaLeads: 0 });
    return days.get(d)!;
  };
  const countries = new Map<string, { spend: number; clicks: number; metaLeads: number; inscritos: number }>();
  const cty = (c: string) => {
    if (!countries.has(c)) countries.set(c, { spend: 0, clicks: 0, metaLeads: 0, inscritos: 0 });
    return countries.get(c)!;
  };

  const [meta, ghl] = await Promise.allSettled([
    r.sources.meta.configured ? fetchMeta(w, f.campaignKeywords) : Promise.resolve(null),
    r.sources.ghl.configured
      ? Promise.all([
          contactsWithTag(f.tags.registro, w.since, w.until),
          contactsWithTag(f.tags.asistio, w.since, w.until),
          contactsWithTag(f.tags.cita, w.since, w.until),
          contactsWithTag(f.tags.compra, w.since, w.until),
          f.pipelineId ? Promise.all([opportunities(f.pipelineId, w.since, w.until), pipelines()]) : Promise.resolve(null),
        ])
      : Promise.resolve(null),
  ]);

  // ---------- Meta ----------
  if (meta.status === "rejected") r.sources.meta.error = String(meta.reason?.message || meta.reason);
  else if (meta.value) {
    r.sources.meta.ok = true;
    const m = meta.value;
    for (const c of m.campaigns) {
      const row = {
        id: c.campaign_id || c.campaign_name || "",
        name: c.campaign_name || "(sin nombre)",
        spend: num(c.spend),
        leads: leadsOf(c),
        ctr: num(c.ctr),
        reach: num(c.reach),
        clicks: num(c.inline_link_clicks ?? c.clicks),
        impressions: num(c.impressions),
      };
      r.campaigns.push(row);
      r.totals.spend += row.spend;
      r.totals.metaLeads += row.leads;
      r.totals.impressions += row.impressions;
      r.totals.clicks += row.clicks;
      r.totals.reach += row.reach; // aproximado: el alcance de varias campañas se solapa
      r.totals.visits += visitsOf(c);
    }
    r.campaigns.sort((a, b) => b.spend - a.spend);
    for (const d of m.daily as InsightRow[]) {
      const k = d.date_start || "";
      if (!k) continue;
      const x = day(k);
      x.spend += num(d.spend);
      x.metaLeads += leadsOf(d);
      if (k === today) {
        r.today.spend += num(d.spend);
        r.today.visits += visitsOf(d);
      }
    }
    r.ads = m.ads
      .map((a) => ({
        id: a.ad_id || "",
        name: a.ad_name || "(sin nombre)",
        campaign: a.campaign_name || "",
        active: a.active,
        spend: num(a.spend),
        impressions: num(a.impressions),
        ctr: num(a.ctr),
        leads: leadsOf(a),
      }))
      .sort((a, b) => b.spend - a.spend);
    for (const c of m.countries) {
      const x = cty(c.country || "??");
      x.spend += num(c.spend);
      x.clicks += num(c.inline_link_clicks ?? c.clicks);
      x.metaLeads += leadsOf(c);
    }
    const aud = new Map<string, { age: string; gender: string; spend: number; leads: number }>();
    for (const a of m.audience) {
      const k = `${a.age}|${a.gender}`;
      if (!aud.has(k)) aud.set(k, { age: a.age || "?", gender: a.gender || "unknown", spend: 0, leads: 0 });
      const x = aud.get(k)!;
      x.spend += num(a.spend);
      x.leads += leadsOf(a);
    }
    r.audience = [...aud.values()].sort((a, b) => a.age.localeCompare(b.age));
  }

  // ---------- GHL ----------
  if (ghl.status === "rejected") r.sources.ghl.error = String(ghl.reason?.message || ghl.reason);
  else if (ghl.value) {
    r.sources.ghl.ok = true;
    const [reg, asis, cita, compra, pipe] = ghl.value;
    const ids = (cs: GhlContact[]) => new Set(cs.map((c) => c.id));
    const sAsis = ids(asis), sCita = ids(cita), sCompra = ids(compra);
    r.totals.registros = reg.length;
    r.totals.asistio = asis.length;
    r.totals.citas = cita.length;
    r.totals.compras = compra.length;
    for (const c of reg) {
      const d = c.dateAdded ? ymd(new Date(c.dateAdded)) : "";
      if (d) day(d).registros += 1;
      if (d === today) r.today.registros += 1;
      const cc = countryOfPhone(c.phone) || (c.country ? c.country.toUpperCase() : null);
      if (cc) cty(cc).inscritos += 1;
    }
    const todayCount = (cs: GhlContact[]) => cs.filter((c) => c.dateAdded && ymd(new Date(c.dateAdded)) === today).length;
    r.today.citas = todayCount(cita);
    r.today.compras = todayCount(compra);

    // Dónde está cada registro: el paso más avanzado al que ha llegado.
    let soloReg = 0, hastaAsis = 0, hastaCita = 0, hastaCompra = 0;
    for (const c of reg) {
      if (sCompra.has(c.id)) hastaCompra++;
      else if (sCita.has(c.id)) hastaCita++;
      else if (sAsis.has(c.id)) hastaAsis++;
      else soloReg++;
    }
    r.leadStatus = [
      { key: "registro", label: "Solo registrado", count: soloReg },
      { key: "asistio", label: "Asistió", count: hastaAsis },
      { key: "cita", label: "Cita reservada", count: hastaCita },
      { key: "compra", label: "Compró", count: hastaCompra },
    ];

    if (pipe) {
      const [opps, pls] = pipe;
      const pl = pls.find((p) => p.id === f.pipelineId);
      if (pl) {
        const stages = pl.stages.map((s) => ({ id: s.id, name: s.name, count: 0, value: 0 }));
        for (const o of opps) {
          const st = stages.find((s) => s.id === o.pipelineStageId);
          if (st) {
            st.count += 1;
            st.value += num(o.monetaryValue);
          }
        }
        r.pipeline = { name: pl.name, stages: stages.map(({ name, count, value }) => ({ name, count, value })) };
        const won = opps.filter((o) => o.status === "won");
        const wonValue = won.reduce((s, o) => s + num(o.monetaryValue), 0);
        if (wonValue > 0) r.totals.ingresos = wonValue;
      }
    }
  }
  if (!r.totals.ingresos && f.price > 0) r.totals.ingresos = r.totals.compras * f.price;

  r.daily = [...days.entries()]
    .map(([date, v]) => ({ date, ...v }))
    .filter((d) => !w.since || d.date >= w.since)
    .sort((a, b) => a.date.localeCompare(b.date));
  r.countries = [...countries.entries()]
    .map(([country, v]) => ({ country, ...v }))
    .sort((a, b) => b.spend - a.spend || b.inscritos - a.inscritos);

  if (r.sources.meta.ok || r.sources.ghl.ok) cache.set(key, { at: Date.now(), data: r });
  return r;
}

// ---------- Datos de ejemplo (para ver la vista antes de conectar las cuentas) ----------
export function demoReport(f: FunnelConfig, range: Range): Report {
  const w = windowFor(range);
  const n = range === "all" ? 45 : Number(range);
  let seed = [...f.id].reduce((s, c) => s + c.charCodeAt(0), 7);
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const daily = Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.now() - (n - 1 - i) * 86400000);
    const spend = Math.round(60 + rnd() * 90 + i * 2);
    const regs = Math.round(spend / (3.2 + rnd() * 4));
    return { date: ymd(d), spend, registros: regs, metaLeads: Math.round(regs * 1.15) };
  });
  const spend = daily.reduce((s, d) => s + d.spend, 0);
  const registros = daily.reduce((s, d) => s + d.registros, 0);
  const metaLeads = daily.reduce((s, d) => s + d.metaLeads, 0);
  const asistio = Math.round(registros * 0.38), citas = Math.round(asistio * 0.3), compras = Math.round(citas * 0.32);
  const price = f.price || 497;
  const cs = [["ES", 0.46], ["MX", 0.2], ["CO", 0.12], ["AR", 0.09], ["CL", 0.07], ["PE", 0.06]] as const;
  const adNames = ["VSL Alessio · 45s", "Carrusel testimonios", "Reel 'Tu marca, tu negocio'", "Estático precio", "Story directo", "Vídeo caso de éxito"];
  const ads = adNames.map((name, i) => {
    const s = Math.round(spend * [0.28, 0.22, 0.18, 0.14, 0.1, 0.08][i]);
    const leads = Math.round(s / [3.1, 4.6, 6.2, 9.4, 5.1, 12][i]);
    return { id: "ad" + i, name, campaign: f.name + (i < 3 ? " · Captación" : " · Retargeting"), active: i !== 5, spend: s, impressions: s * 95, ctr: 0.9 + rnd() * 1.6, leads };
  });
  return {
    funnel: { id: f.id, name: f.name, landing: f.landing },
    range,
    since: w.since,
    until: w.until,
    generatedAt: new Date().toISOString(),
    demo: true,
    sources: { meta: { configured: false, ok: true }, ghl: { configured: false, ok: true } },
    totals: { spend, impressions: spend * 95, clicks: Math.round(spend * 1.9), reach: spend * 60, metaLeads, visits: Math.round(registros * 3.4), registros, asistio, citas, compras, ingresos: compras * price },
    today: { spend: daily[n - 1].spend, visits: Math.round(daily[n - 1].registros * 3.4), registros: daily[n - 1].registros, citas: Math.round(daily[n - 1].registros * 0.05), compras: 1 },
    daily,
    countries: cs.map(([country, p]) => ({ country, spend: Math.round(spend * p), clicks: Math.round(spend * 1.9 * p), metaLeads: Math.round(metaLeads * p), inscritos: Math.round(registros * p * 0.9) })),
    ads,
    campaigns: [
      { id: "c1", name: f.name + " · Captación", spend: Math.round(spend * 0.68), leads: Math.round(metaLeads * 0.74), ctr: 1.8, reach: spend * 42, clicks: Math.round(spend * 1.3), impressions: spend * 64 },
      { id: "c2", name: f.name + " · Retargeting", spend: Math.round(spend * 0.32), leads: Math.round(metaLeads * 0.26), ctr: 2.4, reach: spend * 12, clicks: Math.round(spend * 0.6), impressions: spend * 31 },
    ],
    audience: ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"].flatMap((age, i) => {
      const k = [0.06, 0.27, 0.31, 0.2, 0.11, 0.05][i];
      return [
        { age, gender: "female", spend: Math.round(spend * k * 0.58), leads: Math.round(metaLeads * k * 0.61) },
        { age, gender: "male", spend: Math.round(spend * k * 0.42), leads: Math.round(metaLeads * k * 0.39) },
      ];
    }),
    leadStatus: [
      { key: "registro", label: "Solo registrado", count: registros - asistio },
      { key: "asistio", label: "Asistió", count: asistio - citas },
      { key: "cita", label: "Cita reservada", count: citas - compras },
      { key: "compra", label: "Compró", count: compras },
    ],
    pipeline: {
      name: "Pipeline " + f.name,
      stages: [
        { name: "Nuevo lead", count: registros - asistio, value: 0 },
        { name: "Cita agendada", count: citas, value: citas * price },
        { name: "Cita realizada", count: Math.round(citas * 0.8), value: Math.round(citas * 0.8) * price },
        { name: "Ganado", count: compras, value: compras * price },
        { name: "Perdido", count: Math.round(citas * 0.4), value: 0 },
      ],
    },
  };
}
