"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FunnelConfig, InformesConfig, Origin, Range, Report } from "@/lib/informes/types";

/* ---------- formato ---------- */
// Idioma elegido en el selector (cookie amplify_lang): formatos en inglés o en español
const LOC = typeof document !== "undefined" && /(?:^|;\s*)amplify_lang=en/.test(document.cookie) ? "en-IE" : "es-ES";
const DEC = LOC === "es-ES" ? "," : ".";
// "always": 2.485 € en vez de 2485 € (en español el punto de miles se omite por defecto con 4 cifras)
const GROUP = "always" as unknown as boolean;
const eur = (v: number, dec = 0) =>
  new Intl.NumberFormat(LOC, { style: "currency", currency: "EUR", maximumFractionDigits: dec, minimumFractionDigits: dec, useGrouping: GROUP }).format(v || 0);
const int = (v: number) => new Intl.NumberFormat(LOC, { useGrouping: GROUP }).format(Math.round(v || 0));
const pct = (v: number, dec = 1) => (Number.isFinite(v) ? `${(v * 100).toFixed(dec).replace(".", DEC)} %` : "—");
const ratio = (a: number, b: number) => (b > 0 ? a / b : NaN);
const money = (a: number, b: number, dec = 2) => (b > 0 ? eur(a / b, dec) : "—");
const regionName = (() => {
  try {
    const dn = new Intl.DisplayNames([LOC.slice(0, 2)], { type: "region" });
    return (c: string) => (c && c.length === 2 ? dn.of(c) || c : c === "??" ? "Sin país" : c);
  } catch {
    return (c: string) => c;
  }
})();
const shortDate = (d: string) => {
  const [, m, dd] = d.split("-");
  return `${Number(dd)}/${Number(m)}`;
};
const ago = (iso: string) => {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  return m < 1 ? "ahora mismo" : m === 1 ? "hace 1 min" : `hace ${m} min`;
};
const GENDER: Record<string, string> = { female: "Mujeres", male: "Hombres", unknown: "Sin dato" };

const RANGES: [Range, string][] = [["7", "7 d"], ["14", "14 d"], ["30", "30 d"], ["all", "Todo"]];
const ORIGINS: [Origin, string][] = [["all", "Todos"], ["paid", "De pago"], ["organico", "Orgánico"]];

function cplClass(cpl: number) {
  if (!Number.isFinite(cpl)) return "";
  return cpl <= 4 ? "good" : cpl <= 8 ? "warn" : "bad";
}

/* ---------- piezas ---------- */
function Section({ eyebrow, title, right, children }: { eyebrow: string; title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="ic">
      <div className="ich">
        <div>
          <div className="eb">{eyebrow}</div>
          <h3>{title}</h3>
        </div>
        {right ? <div className="icr">{right}</div> : null}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="empty">{children}</p>;
}

function Seg<T extends string>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div className="seg">
      {options.map(([v, l]) => (
        <button key={v} className={v === value ? "on" : ""} onClick={() => onChange(v)} type="button">
          {l}
        </button>
      ))}
    </div>
  );
}

/* Evolución diaria: barras de registros + línea de coste por registro */
function DailyChart({ daily }: { daily: Report["daily"] }) {
  const [hover, setHover] = useState<number | null>(null);
  if (!daily.length) return <Empty>Aún no hay datos en este rango.</Empty>;
  const W = 760, H = 230, P = { l: 36, r: 46, t: 14, b: 26 };
  const iw = W - P.l - P.r, ih = H - P.t - P.b;
  const regs = daily.map((d) => d.registros || d.metaLeads);
  const cpl = daily.map((d, i) => (regs[i] > 0 ? d.spend / regs[i] : NaN));
  const maxR = Math.max(1, ...regs);
  const maxC = Math.max(1, ...cpl.filter(Number.isFinite));
  const bw = iw / daily.length;
  const x = (i: number) => P.l + i * bw + bw / 2;
  const yR = (v: number) => P.t + ih - (v / maxR) * ih;
  const yC = (v: number) => P.t + ih - (v / maxC) * ih;
  let path = "";
  cpl.forEach((v, i) => {
    if (!Number.isFinite(v)) return;
    path += (path ? "L" : "M") + x(i).toFixed(1) + " " + yC(v).toFixed(1);
  });
  const step = Math.max(1, Math.ceil(daily.length / 10));
  const h = hover != null ? daily[hover] : null;
  return (
    <div className="chartwrap">
      <div className="legend">
        <span><i className="sw bar" /> Registros</span>
        <span><i className="sw line" /> Coste por registro</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="chart" onMouseLeave={() => setHover(null)} role="img" aria-label="Registros y coste por registro por día">
        {[0, 0.5, 1].map((g) => (
          <g key={g}>
            <line x1={P.l} x2={W - P.r} y1={P.t + ih * (1 - g)} y2={P.t + ih * (1 - g)} className="grid" />
            <text x={P.l - 6} y={P.t + ih * (1 - g) + 4} textAnchor="end" className="ax">{int(maxR * g)}</text>
            <text x={W - P.r + 6} y={P.t + ih * (1 - g) + 4} className="ax">{eur(maxC * g, maxC < 10 ? 1 : 0)}</text>
          </g>
        ))}
        {daily.map((d, i) => (
          <g key={d.date} onMouseEnter={() => setHover(i)}>
            <rect x={P.l + i * bw} y={P.t} width={bw} height={ih} fill="transparent" />
            <rect x={x(i) - Math.min(18, bw * 0.32)} y={yR(regs[i])} width={Math.min(36, bw * 0.64)} height={Math.max(0, P.t + ih - yR(regs[i]))} rx={3} className={hover === i ? "bar on" : "bar"} />
            {i % step === 0 || i === daily.length - 1 ? (
              <text x={x(i)} y={H - 8} textAnchor="middle" className="ax">{shortDate(d.date)}</text>
            ) : null}
          </g>
        ))}
        <path d={path} className="line" />
        {cpl.map((v, i) => (Number.isFinite(v) ? <circle key={i} cx={x(i)} cy={yC(v)} r={hover === i ? 4 : 2.5} className="dot" /> : null))}
      </svg>
      {h ? (
        <div className="tip" style={{ left: `${(x(hover!) / W) * 100}%` }}>
          <b>{shortDate(h.date)}</b>
          <span>{int(regs[hover!])} registros</span>
          <span>{eur(h.spend)} gasto</span>
          <span>{Number.isFinite(cpl[hover!]) ? eur(cpl[hover!], 2) : "—"} por registro</span>
        </div>
      ) : null}
    </div>
  );
}

function Funnel({ r }: { r: Report }) {
  const steps = [
    { k: "Visitas", v: r.totals.visits, ev: "landing_page_view (píxel)" },
    { k: "Registro", v: r.totals.registros || r.totals.metaLeads, ev: r.totals.registros ? "etiqueta de registro (GHL)" : "leads de Meta" },
    { k: "Asistió", v: r.totals.asistio, ev: "etiqueta de asistencia" },
    { k: "Cita", v: r.totals.citas, ev: "etiqueta de cita" },
    { k: "Compra", v: r.totals.compras, ev: "etiqueta de compra" },
  ];
  const max = Math.max(1, ...steps.map((s) => s.v));
  return (
    <div className="funnel">
      {steps.map((s, i) => (
        <div key={s.k} className="fstep">
          <div className="fhead">
            <b>{s.k}</b>
            <span className="num">{int(s.v)}</span>
          </div>
          <div className="ftrack">
            <div className="ffill" style={{ width: `${Math.max(2, (s.v / max) * 100)}%`, opacity: 1 - i * 0.13 }} />
          </div>
          <div className="fmeta">
            <span>{s.ev}</span>
            {i > 0 ? <span className="conv">{pct(ratio(s.v, steps[i - 1].v))} del paso anterior</span> : <span />}
          </div>
        </div>
      ))}
    </div>
  );
}

function Audience({ rows }: { rows: Report["audience"] }) {
  const [metric, setMetric] = useState<"leads" | "cpl" | "spend">("leads");
  if (!rows.length) return <Empty>Sin datos de audiencia.</Empty>;
  const ages = [...new Set(rows.map((r) => r.age))].sort();
  const genders = ["female", "male"].filter((g) => rows.some((r) => r.gender === g));
  const val = (a: string, g: string) => {
    const x = rows.find((r) => r.age === a && r.gender === g);
    if (!x) return 0;
    return metric === "leads" ? x.leads : metric === "spend" ? x.spend : x.leads > 0 ? x.spend / x.leads : 0;
  };
  const max = Math.max(1, ...ages.flatMap((a) => genders.map((g) => val(a, g))));
  const fmt = (v: number) => (metric === "leads" ? int(v) : eur(v, metric === "cpl" ? 2 : 0));
  return (
    <>
      <div className="ictools">
        <Seg value={metric} options={[["leads", "Leads"], ["cpl", "CPL"], ["spend", "Gasto"]]} onChange={setMetric} />
        <div className="legend">
          {genders.map((g) => (
            <span key={g}><i className={`sw g-${g}`} /> {GENDER[g]}</span>
          ))}
        </div>
      </div>
      <div className="aud">
        {ages.map((a) => (
          <div key={a} className="audrow">
            <span className="audl">{a}</span>
            <div className="audbars">
              {genders.map((g) => (
                <div key={g} className="audbar">
                  <div className={`audfill g-${g}`} style={{ width: `${(val(a, g) / max) * 100}%` }} />
                  <span>{fmt(val(a, g))}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------- Ajustes ---------- */
type Options = {
  meta: { configured: boolean; error?: string };
  ghl: { configured: boolean; error?: string };
  tags: string[];
  pipelines: { id: string; name: string }[];
  campaigns: { name: string; active: boolean }[];
};

function Settings({ config, onClose, onSaved }: { config: InformesConfig; onClose: () => void; onSaved: (c: InformesConfig) => void }) {
  const [draft, setDraft] = useState<FunnelConfig[]>(() => JSON.parse(JSON.stringify(config.funnels)));
  const [opts, setOpts] = useState<Options | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => {
    fetch("/api/informes/opciones").then((r) => r.json()).then(setOpts).catch(() => setOpts(null));
  }, []);
  const set = (i: number, patch: Partial<FunnelConfig>) => setDraft((d) => d.map((f, j) => (j === i ? { ...f, ...patch } : f)));
  const setTag = (i: number, k: keyof FunnelConfig["tags"], v: string) => setDraft((d) => d.map((f, j) => (j === i ? { ...f, tags: { ...f.tags, [k]: v } } : f)));
  async function save() {
    setSaving(true);
    setErr("");
    const res = await fetch("/api/informes", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ funnels: draft }) });
    const json = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) return setErr(json.error || "No se pudo guardar");
    onSaved(json.config);
  }
  return (
    <div className="ov" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Ajustes de informes">
        <div className="dh">
          <h3>Ajustes de los informes</h3>
          <button className="btn" onClick={onClose} type="button">Cerrar</button>
        </div>
        <p className="muted small">
          Cada funnel se reconoce por el nombre de sus campañas en Meta y por su pipeline de GHL (o, si no tiene, por las etiquetas de cada paso).
        </p>
        {opts && (!opts.meta.configured || !opts.ghl.configured) ? (
          <div className="note warn">
            {!opts.meta.configured ? "Meta Ads aún no está conectado. " : ""}
            {!opts.ghl.configured ? "GoHighLevel aún no está conectado. " : ""}
            Cuando lo esté, aquí podrás elegir entre tus etiquetas, pipelines y campañas reales.
          </div>
        ) : null}
        {opts?.meta.error ? <div className="note bad">{opts.meta.error}</div> : null}
        {opts?.ghl.error ? <div className="note bad">{opts.ghl.error}</div> : null}
        <datalist id="ghl-tags">{opts?.tags.map((t) => <option key={t} value={t} />)}</datalist>

        {draft.map((f, i) => (
          <div key={f.id} className="fcfg">
            <h4>{f.name}</h4>
            <label className="fl">Nombre<input className="in" value={f.name} onChange={(e) => set(i, { name: e.target.value })} /></label>
            <label className="fl">Landing<input className="in" value={f.landing} onChange={(e) => set(i, { landing: e.target.value })} /></label>
            <label className="fl">
              Campañas de Meta que contienen (separa con comas)
              <input className="in" value={f.campaignKeywords.join(", ")} onChange={(e) => set(i, { campaignKeywords: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
              {opts?.campaigns.length ? (
                <span className="hint">
                  Coinciden:{" "}
                  {opts.campaigns.filter((c) => f.campaignKeywords.some((k) => c.name.toLowerCase().includes(k.toLowerCase()))).map((c) => c.name).slice(0, 6).join(" · ") || "ninguna"}
                </span>
              ) : null}
            </label>
            <div className="g2">
              {(["registro", "asistio", "cita", "compra"] as const).map((k) => (
                <label key={k} className="fl">
                  Etiqueta GHL · {k === "asistio" ? "asistió" : k}
                  <input className="in" list="ghl-tags" value={f.tags[k]} onChange={(e) => setTag(i, k, e.target.value)} />
                </label>
              ))}
            </div>
            <div className="g2">
              <label className="fl">
                Pipeline GHL
                <select className="in" value={f.pipelineId} onChange={(e) => set(i, { pipelineId: e.target.value, pipelineName: e.target.value ? opts?.pipelines.find((p) => p.id === e.target.value)?.name ?? f.pipelineName : "" })}>
                  <option value="">{f.pipelineName ? f.pipelineName : "— Sin pipeline —"}</option>
                  {opts?.pipelines.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  {f.pipelineId && !opts?.pipelines.some((p) => p.id === f.pipelineId) ? <option value={f.pipelineId}>{f.pipelineId}</option> : null}
                </select>
              </label>
              <label className="fl">
                Etapa de compra
                <input className="in" value={f.purchaseStage} onChange={(e) => set(i, { purchaseStage: e.target.value })} />
                <span className="hint">Esta etapa y las siguientes cuentan como venta.</span>
              </label>
              <label className="fl">
                Precio de venta (€)
                <input className="in" type="number" min={0} value={f.price} onChange={(e) => set(i, { price: Number(e.target.value) })} />
                <span className="hint">Solo se usa si las oportunidades ganadas de GHL no traen importe.</span>
              </label>
            </div>
          </div>
        ))}
        {err ? <div className="note bad">{err}</div> : null}
        <div className="dfoot">
          <button className="btn" onClick={onClose} type="button">Cancelar</button>
          <button className="btn dark" onClick={save} disabled={saving} type="button">{saving ? "Guardando…" : "Guardar ajustes"}</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- vista ---------- */
export default function Informes() {
  const [funnel, setFunnel] = useState<string>("");
  const [range, setRange] = useState<Range>("7");
  const [origin, setOrigin] = useState<Origin>("all");
  const [demo, setDemo] = useState(false);
  const [adsFilter, setAdsFilter] = useState<"all" | "active">("all");
  const [data, setData] = useState<{ report: Report; config: InformesConfig } | null>(null);
  const [config, setConfig] = useState<InformesConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState(false);
  const [, tick] = useState(0);

  // Recordar funnel y rango elegidos
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("amplify-informes") || "{}");
      if (s.funnel) setFunnel(s.funnel);
      if (s.range) setRange(s.range);
      if (s.origin) setOrigin(s.origin);
      if (s.demo) setDemo(true);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("amplify-informes", JSON.stringify({ funnel, range, demo, origin }));
    } catch {}
  }, [funnel, range, demo, origin]);

  const load = useCallback(
    async (fresh = false) => {
      setLoading(true);
      setError("");
      const q = new URLSearchParams({ range });
      if (origin !== "all") q.set("origin", origin);
      if (funnel) q.set("funnel", funnel);
      if (demo) q.set("demo", "1");
      if (fresh) q.set("fresh", "1");
      try {
        const res = await fetch(`/api/informes?${q}`, { cache: "no-store" });
        const json = await res.json();
        if (json.config) setConfig(json.config);
        if (!res.ok) throw new Error(json.error || "No se pudo cargar el informe");
        setData(json);
        if (!funnel) setFunnel(json.report.funnel.id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error");
      } finally {
        setLoading(false);
      }
    },
    [funnel, range, demo, origin],
  );

  useEffect(() => {
    load();
    const t = setInterval(() => load(), 5 * 60 * 1000);
    const c = setInterval(() => tick((n) => n + 1), 30000);
    return () => {
      clearInterval(t);
      clearInterval(c);
    };
  }, [load]);

  const r = data?.report;
  const funnels = config?.funnels ?? [];
  const notConfigured = r && !r.demo && !r.sources.meta.configured && !r.sources.ghl.configured;
  const registros = r ? r.totals.registros || r.totals.metaLeads : 0;
  const ads = useMemo(() => (r ? r.ads.filter((a) => adsFilter === "all" || a.active) : []), [r, adsFilter]);

  return (
    <div className="inf">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <header className="ihead">
        <div>
          <div className="eb">Informes · Meta Ads + GoHighLevel</div>
          <h1>{r?.funnel.name || "Informes de funnels"}</h1>
          {r?.funnel.landing ? (
            <a className="landing" href={r.funnel.landing} target="_blank" rel="noreferrer">
              {r.funnel.landing.replace(/^https?:\/\//, "")} ↗
            </a>
          ) : null}
        </div>
        <div className="iacts">
          {r ? (
            <span className={`status ${r.demo ? "demo" : loading ? "busy" : "ok"}`}>
              <i />
              {r.demo ? "Datos de ejemplo" : loading ? "Actualizando…" : `Actualizado ${ago(r.generatedAt)}`}
            </span>
          ) : null}
          <button className="btn" onClick={() => load(true)} disabled={loading} type="button">Actualizar</button>
          <button className="btn" onClick={() => setSettings(true)} disabled={!config} type="button">Ajustes</button>
        </div>
      </header>

      <div className="filters">
        <div className="seg big">
          {funnels.map((f) => (
            <button key={f.id} className={f.id === (funnel || r?.funnel.id) ? "on" : ""} onClick={() => setFunnel(f.id)} type="button">
              {f.name}
            </button>
          ))}
        </div>
        <div className="fright">
          <Seg value={origin} options={ORIGINS} onChange={setOrigin} />
          <Seg value={range} options={RANGES} onChange={setRange} />
        </div>
      </div>

      {notConfigured ? (
        <div className="note setup">
          <div>
            <b>Falta conectar Meta Ads y GoHighLevel</b>
            <span>
              Falta la clave del puente con amplify-web (<code>INFORMES_PROXY_SECRET</code>) en Vercel. Mientras tanto puedes ver cómo quedará con datos de ejemplo.
            </span>
          </div>
          <button className="btn dark" onClick={() => setDemo(true)} type="button">Ver con datos de ejemplo</button>
        </div>
      ) : null}
      {r?.demo ? (
        <div className="note demo">
          <div>
            <b>Estás viendo datos de ejemplo</b>
            <span>Las cifras son inventadas para enseñar la vista. No son de tus campañas.</span>
          </div>
          <button className="btn" onClick={() => setDemo(false)} type="button">Ver datos reales</button>
        </div>
      ) : null}
      {r && !r.demo && r.sources.meta.configured && !r.sources.meta.ok ? <div className="note bad">No se pudo leer Meta Ads: {r.sources.meta.error}</div> : null}
      {r && !r.demo && r.sources.ghl.configured && !r.sources.ghl.ok ? <div className="note bad">No se pudo leer GoHighLevel: {r.sources.ghl.error}</div> : null}
      {error ? <div className="note bad">{error}</div> : null}

      {!r ? (
        <div className="loading">{loading ? "Cargando…" : null}</div>
      ) : (
        <div className={loading ? "body dim" : "body"}>
          {/* KPIs */}
          <div className="kpis">
            {[
              ["Gasto en Meta", eur(r.totals.spend)],
              ["Registros", int(registros)],
              ["CPL real", money(r.totals.spend, registros)],
              ["Citas", int(r.totals.citas)],
              ["Ventas", int(r.totals.compras)],
              ["ROAS", r.totals.spend > 0 ? `${ratio(r.totals.ingresos, r.totals.spend).toFixed(2).replace(".", DEC)}x` : "—"],
            ].map(([l, v]) => (
              <div key={l} className="kpi">
                <span>{l}</span>
                <b className="num">{v}</b>
              </div>
            ))}
          </div>

          {r.origin === "organico" ? (
            <div className="note">
              <div>
                <b>Solo orgánico</b>
                <span>Leads con la etiqueta origen-organico en GHL. No tienen gasto en anuncios, así que no se muestran los datos de Meta.</span>
              </div>
            </div>
          ) : null}

          {r.origins ? (
            <Section eyebrow="Origen" title="De pago y orgánico" right={<span className="muted small">Etiquetas origen-paid / origen-organico de GHL</span>}>
              <div className="tw">
                <table className="tbl">
                  <thead><tr><th>Origen</th><th className="r">Registros</th><th className="r">Citas</th><th className="r">Ventas</th><th className="r">Registro → venta</th><th className="r">Ingresos</th><th className="r">CPL</th></tr></thead>
                  <tbody>
                    {(() => {
                      const tot = r.origins!.reduce((a, o) => ({ registros: a.registros + o.registros, citas: a.citas + o.citas, compras: a.compras + o.compras, ingresos: a.ingresos + o.ingresos }), { registros: 0, citas: 0, compras: 0, ingresos: 0 });
                      return [...r.origins!.filter((o) => o.key !== "sin" || o.registros > 0), { key: "tot", label: "Total", ...tot }].map((o) => (
                        <tr key={o.key} className={o.key === "tot" ? "tot" : o.key === r.origin ? "sel" : ""} onClick={() => (o.key === "paid" || o.key === "organico") && setOrigin(origin === o.key ? "all" : (o.key as Origin))}>
                          <td><span className={`orig o-${o.key}`} />{o.label}</td>
                          <td className="r num">{int(o.registros)}</td>
                          <td className="r num">{int(o.citas)}</td>
                          <td className="r num">{int(o.compras)}</td>
                          <td className="r num">{pct(ratio(o.compras, o.registros))}</td>
                          <td className="r num">{eur(o.ingresos)}</td>
                          <td className="r num">{o.key === "paid" && r.origin !== "organico" ? money(r.totals.spend, o.registros) : "—"}</td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
              <p className="foot">Pulsa «De pago» u «Orgánico» para ver todo el informe solo con ese origen. El CPL de pago es el gasto de Meta entre los registros de pago.</p>
            </Section>
          ) : null}

          <Section eyebrow="Hoy" title="Cómo va el día">
            <div className="today">
              {[
                ["Gasto", eur(r.today.spend)],
                ["Visitas", int(r.today.visits)],
                ["Registros", int(r.today.registros)],
                ["Citas", int(r.today.citas)],
                ["Ventas", int(r.today.compras)],
              ].map(([l, v], i) => (
                <div key={l} className="tstep">
                  {i > 0 ? <span className="arrow">→</span> : null}
                  <div>
                    <span>{l}</span>
                    <b className="num">{v}</b>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section eyebrow="Evolución diaria" title="Registros y coste por registro">
            <DailyChart daily={r.daily} />
          </Section>

          <div className="two">
            <Section eyebrow="Embudo de conversión" title="De la landing a la venta">
              <Funnel r={r} />
            </Section>
            <Section eyebrow="Rentabilidad" title="Lo que cuesta y lo que deja">
              <div className="prof">
                {[
                  ["CPL real", money(r.totals.spend, registros), "gasto de Meta ÷ registros en GHL"],
                  ["Coste por cita", money(r.totals.spend, r.totals.citas), "gasto ÷ citas reservadas"],
                  ["CPA", money(r.totals.spend, r.totals.compras), "gasto ÷ ventas"],
                  ["Ingresos", eur(r.totals.ingresos), "oportunidades ganadas en GHL"],
                  ["ROAS", r.totals.spend > 0 ? `${ratio(r.totals.ingresos, r.totals.spend).toFixed(2).replace(".", DEC)}x` : "—", "ingresos ÷ gasto"],
                  ["CPL Meta", money(r.totals.spend, r.totals.metaLeads), "gasto ÷ leads que cuenta Meta"],
                ].map(([l, v, d]) => (
                  <div key={l} className="pm">
                    <span>{l}</span>
                    <b className="num">{v}</b>
                    <small>{d}</small>
                  </div>
                ))}
              </div>
            </Section>
          </div>

          <div className="two">
            <Section eyebrow="Estado de los leads" title="Dónde está cada registro">
              {r.leadStatus.length && r.leadStatus.some((s) => s.count) ? (
                <>
                  <div className="stack">
                    {r.leadStatus.map((s) => (
                      <div key={s.key} className={`stk s-${s.key}`} style={{ flexGrow: Math.max(s.count, 0.0001) }} title={`${s.label}: ${s.count}`} />
                    ))}
                  </div>
                  <div className="stlist">
                    {r.leadStatus.map((s) => {
                      const tot = r.leadStatus.reduce((a, b) => a + b.count, 0);
                      return (
                        <div key={s.key} className="strow">
                          <i className={`sw s-${s.key}`} />
                          <span>{s.label}</span>
                          <b className="num">{int(s.count)}</b>
                          <span className="muted">{pct(ratio(s.count, tot), 0)}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <Empty>Se rellena con las etiquetas de GHL de cada paso.</Empty>
              )}
            </Section>
            <Section eyebrow="Pipeline comercial" title={r.pipeline ? `Embudo GHL · ${r.pipeline.name}` : "Embudo GHL"}>
              {r.pipeline && r.pipeline.stages.length ? (
                <div className="pipe">
                  {(() => {
                    const max = Math.max(1, ...r.pipeline!.stages.map((s) => s.count));
                    return r.pipeline!.stages.map((s) => (
                      <div key={s.name} className="prow">
                        <span className="pl">{s.name}</span>
                        <div className="ptrack"><div style={{ width: `${(s.count / max) * 100}%` }} /></div>
                        <b className="num">{int(s.count)}</b>
                        <span className="muted num">{s.value ? eur(s.value) : ""}</span>
                      </div>
                    ));
                  })()}
                </div>
              ) : (
                <Empty>Elige el pipeline de GHL de este funnel en Ajustes.</Empty>
              )}
            </Section>
          </div>

          {r.origin !== "organico" ? (
          <Section eyebrow="Nivel anuncio" title="Anuncios" right={
            <div className="ictools">
              <span className="legend sem"><i className="dot good" />≤ 4 € <i className="dot warn" />≤ 8 € <i className="dot bad" />&gt; 8 €</span>
              <Seg value={adsFilter} options={[["all", "Todos"], ["active", "Activos"]]} onChange={setAdsFilter} />
            </div>
          }>
            {ads.length ? (
              <div className="tw">
                <table className="tbl">
                  <thead><tr><th>Anuncio</th><th className="r">Gasto</th><th className="r">Impr.</th><th className="r">CTR</th><th className="r">Leads</th><th className="r">CPL</th></tr></thead>
                  <tbody>
                    {ads.map((a) => {
                      const cpl = ratio(a.spend, a.leads);
                      return (
                        <tr key={a.id}>
                          <td><div className="tn">{a.active ? <i className="live" title="Activo" /> : null}<div><b>{a.name}</b><span>{a.campaign}</span></div></div></td>
                          <td className="r num">{eur(a.spend)}</td>
                          <td className="r num">{int(a.impressions)}</td>
                          <td className="r num">{a.ctr.toFixed(2).replace(".", DEC)} %</td>
                          <td className="r num">{int(a.leads)}</td>
                          <td className="r num"><span className={`cpl ${cplClass(cpl)}`}>{Number.isFinite(cpl) ? eur(cpl, 2) : "—"}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty>No hay anuncios con gasto en este rango.</Empty>
            )}
          </Section>

          ) : null}

          <Section eyebrow="Geografía" title="Leads por país">
            {r.countries.length ? (
              <div className="tw">
                <table className="tbl">
                  <thead><tr><th>País</th><th className="r">Gasto</th><th className="r">Clics</th><th className="r">Leads Meta</th><th className="r">CPL Meta</th><th className="r">Inscritos GHL</th><th className="r">% inscritos</th></tr></thead>
                  <tbody>
                    {(() => {
                      const totIns = r.countries.reduce((s, c) => s + c.inscritos, 0);
                      return r.countries.map((c) => (
                        <tr key={c.country}>
                          <td><b>{regionName(c.country)}</b></td>
                          <td className="r num">{eur(c.spend)}</td>
                          <td className="r num">{int(c.clicks)}</td>
                          <td className="r num">{int(c.metaLeads)}</td>
                          <td className="r num">{money(c.spend, c.metaLeads)}</td>
                          <td className="r num">{int(c.inscritos)}</td>
                          <td className="r num">{pct(ratio(c.inscritos, totIns), 0)}</td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty>Sin datos por país.</Empty>
            )}
            <p className="foot">Los inscritos de GHL se asignan por el prefijo del teléfono: solo cuentan los registros con teléfono.</p>
          </Section>

          {r.origin !== "organico" ? (
          <>
          <div className="two">
            <Section eyebrow="Segmentación Meta" title="Audiencia por edad y género">
              <Audience rows={r.audience} />
            </Section>
            <Section eyebrow="Meta Ads" title="Tráfico">
              <div className="prof">
                {[
                  ["Impresiones", int(r.totals.impressions)],
                  ["Alcance", int(r.totals.reach)],
                  ["Clics en el enlace", int(r.totals.clicks)],
                  ["CTR", pct(ratio(r.totals.clicks, r.totals.impressions), 2)],
                  ["CPC", money(r.totals.spend, r.totals.clicks)],
                  ["CPM", r.totals.impressions ? eur((r.totals.spend / r.totals.impressions) * 1000, 2) : "—"],
                ].map(([l, v]) => (
                  <div key={l} className="pm"><span>{l}</span><b className="num">{v}</b></div>
                ))}
              </div>
            </Section>
          </div>

          <Section eyebrow="Detalle" title="Campañas Meta">
            {r.campaigns.length ? (
              <div className="tw">
                <table className="tbl">
                  <thead><tr><th>Campaña</th><th className="r">Gasto</th><th className="r">Leads</th><th className="r">CPL</th><th className="r">CTR</th><th className="r">Alcance</th></tr></thead>
                  <tbody>
                    {r.campaigns.map((c) => (
                      <tr key={c.id}>
                        <td><b>{c.name}</b></td>
                        <td className="r num">{eur(c.spend)}</td>
                        <td className="r num">{int(c.leads)}</td>
                        <td className="r num"><span className={`cpl ${cplClass(ratio(c.spend, c.leads))}`}>{money(c.spend, c.leads)}</span></td>
                        <td className="r num">{c.ctr.toFixed(2).replace(".", DEC)} %</td>
                        <td className="r num">{int(c.reach)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty>No hay campañas que coincidan con este funnel. Revisa las palabras clave en Ajustes.</Empty>
            )}
          </Section>

          </>
          ) : null}

          <p className="ifoot">Amplify · Datos de GoHighLevel y Meta Ads · Se actualizan cada 5 minutos · Sin datos personales</p>
        </div>
      )}

      {settings && config ? (
        <Settings
          config={config}
          onClose={() => setSettings(false)}
          onSaved={(c) => {
            setConfig(c);
            setSettings(false);
            load(true);
          }}
        />
      ) : null}
    </div>
  );
}

/* ---------- estilos (los mismos tokens que el panel de tareas) ---------- */
const CSS = `
.inf{--line:#ebebe8;--line2:#f2f2ef;--text:#18181b;--muted:#6b6b70;--faint:#a1a1a6;--accent:#b5402f;--accent-soft:#fbeeeb;--hover:#f3f3f1;--good:#22a06b;--good-soft:#e6f4ec;--warn:#b7791f;--warn-soft:#fbf1df;--bad:#c2412d;--bad-soft:#fbeae6;--fem:#b5402f;--mal:#4f6889;
  font-family:Geist,Inter,system-ui,-apple-system,sans-serif;color:var(--text);font-size:14px;line-height:1.45;font-feature-settings:"tnum" 1;padding:28px 32px 40px;max-width:1240px;margin:0 auto}
.inf *{box-sizing:border-box}
.inf h1{font-size:28px;font-weight:600;letter-spacing:-.03em;margin:2px 0 4px;line-height:1.1}
.inf h3{font-size:15px;font-weight:600;letter-spacing:-.01em;margin:2px 0 0}
.inf h4{font-size:14px;font-weight:600;margin:0 0 10px}
.inf .eb{font-size:11px;text-transform:uppercase;letter-spacing:.07em;color:var(--faint);font-weight:500}
.inf .muted{color:var(--muted)} .inf .small{font-size:13px}
.inf .num{font-variant-numeric:tabular-nums}
.inf .landing{font-size:13px;color:var(--muted);text-decoration:none}.inf .landing:hover{color:var(--text)}
.ihead{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:18px}
.iacts{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.inf .btn{display:inline-flex;align-items:center;gap:6px;border-radius:8px;padding:7px 12px;font-weight:500;font-size:13px;border:1px solid var(--line);background:#fff;white-space:nowrap;cursor:pointer;font-family:inherit;color:inherit}
.inf .btn:hover{background:var(--hover)}.inf .btn:disabled{opacity:.5;cursor:default}
.inf .btn.dark{background:var(--text);border-color:var(--text);color:#fff}.inf .btn.dark:hover{background:#2c2c30}
.inf .status{font-size:12px;color:var(--faint);display:flex;align-items:center;gap:6px;white-space:nowrap;margin-right:4px}
.inf .status i{width:6px;height:6px;border-radius:50%;background:#d4d4d8}.inf .status.ok i{background:var(--good)}.inf .status.busy i{background:#d9a22b}.inf .status.demo i{background:var(--accent)}
.fright{display:flex;gap:14px;flex-wrap:wrap;align-items:center}
.orig{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:8px;vertical-align:1px}
.o-paid{background:var(--accent)}.o-organico{background:var(--good)}.o-sin{background:#d4d4d8}.o-tot{display:none}
.tbl tr.tot td{font-weight:600;background:#fafaf9}.tbl tr.sel td{background:var(--accent-soft)}
.filters{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid var(--line)}
.inf .seg{display:inline-flex;gap:2px;flex-wrap:wrap}
.inf .seg button{border:0;background:none;padding:6px 10px;border-radius:7px;font-weight:500;font-size:13px;color:var(--muted);cursor:pointer;font-family:inherit}
.inf .seg button:hover{color:var(--text);background:var(--hover)}
.inf .seg button.on{background:#efefec;color:var(--text)}
.inf .seg.big button{font-size:14px;padding:7px 12px}
.inf .note{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;padding:12px 14px;border-radius:10px;margin:0 0 14px;font-size:13px;border:1px solid var(--line);background:#fff}
.inf .note b{display:block;font-weight:600;font-size:13.5px;margin-bottom:2px}.inf .note span{color:var(--muted);max-width:78ch;display:block}
.inf .note code{font:12px ui-monospace,SFMono-Regular,Menlo,monospace;background:var(--hover);padding:1px 5px;border-radius:5px;color:var(--text)}
.inf .note.setup{background:#fff;border-color:#e5e0d6}
.inf .note.demo{background:var(--accent-soft);border-color:transparent}
.inf .note.bad{background:var(--bad-soft);border-color:transparent;color:var(--bad)}
.inf .note.warn{background:var(--warn-soft);border-color:transparent;color:var(--warn)}
.inf .loading{padding:80px 0;text-align:center;color:var(--faint)}
.inf .body{display:flex;flex-direction:column;gap:14px;transition:opacity .2s}.inf .body.dim{opacity:.6}
.kpis{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px}
.kpi{background:#fff;border:1px solid var(--line);border-radius:12px;padding:13px 14px}
.kpi span{display:block;font-size:12px;color:var(--muted)}.kpi b{display:block;font-size:24px;font-weight:600;letter-spacing:-.03em;margin-top:4px;white-space:nowrap}
.ic{background:#fff;border:1px solid var(--line);border-radius:12px;padding:16px 18px;min-width:0}
.ich{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px}
.icr,.ictools{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.ictools{justify-content:space-between;margin-bottom:12px}
.two{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px}
.inf .empty{margin:0;padding:18px;border:1px dashed var(--line);border-radius:10px;color:var(--muted);font-size:13px;text-align:center}
.today{display:flex;gap:8px;flex-wrap:wrap}
.tstep{display:flex;align-items:center;gap:8px;flex:1;min-width:120px}
.tstep>div{flex:1;background:var(--line2);border-radius:10px;padding:10px 12px}
.tstep span{display:block;font-size:12px;color:var(--muted)}.tstep b{font-size:20px;font-weight:600;letter-spacing:-.02em}
.tstep .arrow{color:var(--faint);flex:none}
.chartwrap{position:relative}
.legend{display:flex;gap:14px;flex-wrap:wrap;font-size:12px;color:var(--muted);margin-bottom:6px}
.legend span{display:inline-flex;align-items:center;gap:6px}
.sw{width:10px;height:10px;border-radius:3px;display:inline-block;flex:none}
.sw.bar{background:#e4c3bc}.sw.line{background:var(--text);height:2px;width:14px;border-radius:2px}
.chart{width:100%;height:auto;display:block}
.chart .grid{stroke:var(--line2)}.chart .ax{fill:var(--faint);font-size:10.5px;font-family:inherit}
.chart .bar{fill:#efd6d0}.chart .bar.on{fill:var(--accent)}
.chart .line{fill:none;stroke:var(--text);stroke-width:1.8;stroke-linejoin:round}
.chart .dot{fill:#fff;stroke:var(--text);stroke-width:1.5}
.tip{position:absolute;top:28px;transform:translateX(-50%);background:#fff;border:1px solid var(--line);border-radius:9px;padding:8px 10px;font-size:12px;box-shadow:0 6px 20px rgba(0,0,0,.08);pointer-events:none;display:flex;flex-direction:column;gap:1px;white-space:nowrap}
.tip b{font-weight:600}.tip span{color:var(--muted)}
.funnel{display:flex;flex-direction:column;gap:12px}
.fhead{display:flex;justify-content:space-between;align-items:baseline}.fhead b{font-weight:500}.fhead .num{font-weight:600;font-size:15px}
.ftrack{height:10px;border-radius:6px;background:var(--line2);margin:5px 0 4px;overflow:hidden}
.ffill{height:100%;border-radius:6px;background:var(--accent)}
.fmeta{display:flex;justify-content:space-between;gap:8px;font-size:11.5px;color:var(--faint)}.fmeta .conv{color:var(--muted)}
.prof{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.pm{background:var(--line2);border-radius:10px;padding:10px 12px}
.pm span{display:block;font-size:12px;color:var(--muted)}.pm b{display:block;font-size:20px;font-weight:600;letter-spacing:-.02em;margin-top:2px}.pm small{display:block;font-size:11px;color:var(--faint);margin-top:2px}
.stack{display:flex;height:14px;border-radius:7px;overflow:hidden;gap:2px;margin-bottom:12px}
.stk{min-width:2px}
.s-registro{background:#d4d4d8}.s-asistio{background:#e4b363}.s-cita{background:#4f6889}.s-compra{background:var(--good)}
.stlist{display:flex;flex-direction:column;gap:6px}
.strow{display:grid;grid-template-columns:12px 1fr auto 48px;gap:10px;align-items:center;font-size:13px}.strow .muted{text-align:right}
.pipe{display:flex;flex-direction:column;gap:8px}
.prow{display:grid;grid-template-columns:minmax(90px,150px) minmax(0,1fr) 44px 80px;gap:10px;align-items:center;font-size:13px}
.prow .pl{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.prow b{text-align:right}.prow .muted{text-align:right;font-size:12px}
.ptrack{height:8px;border-radius:5px;background:var(--line2);overflow:hidden}.ptrack div{height:100%;border-radius:5px;background:#4f6889}
.tw{overflow-x:auto;margin:0 -18px;padding:0 18px}
.tbl{width:100%;border-collapse:collapse;font-size:13px}
.tbl th{font-weight:500;font-size:11.5px;color:var(--faint);text-align:left;padding:8px 10px;border-bottom:1px solid var(--line);white-space:nowrap}
.tbl td{padding:9px 10px;border-bottom:1px solid var(--line2);white-space:nowrap}
.tbl tr:last-child td{border-bottom:0}.tbl tbody tr:hover td{background:#fafaf9}
.tbl .r{text-align:right}.tbl b{font-weight:500}
.tn{display:flex;align-items:center;gap:8px}.tn span{display:block;font-size:11.5px;color:var(--faint)}
.live{width:7px;height:7px;border-radius:50%;background:var(--good);flex:none}
.cpl{display:inline-block;padding:1px 8px;border-radius:20px;font-weight:500}
.cpl.good{background:var(--good-soft);color:var(--good)}.cpl.warn{background:var(--warn-soft);color:var(--warn)}.cpl.bad{background:var(--bad-soft);color:var(--bad)}
.legend.sem{margin:0;gap:6px;align-items:center}.legend.sem .dot{width:8px;height:8px;border-radius:50%;display:inline-block;margin-left:6px}
.dot.good{background:var(--good)}.dot.warn{background:#d9a22b}.dot.bad{background:var(--bad)}
.inf .foot{margin:10px 0 0;font-size:11.5px;color:var(--faint)}
.aud{display:flex;flex-direction:column;gap:8px}
.audrow{display:grid;grid-template-columns:48px minmax(0,1fr);gap:10px;align-items:center}
.audl{font-size:12.5px;color:var(--muted)}
.audbars{display:flex;flex-direction:column;gap:3px}
.audbar{display:flex;align-items:center;gap:8px;font-size:11.5px;color:var(--muted)}
.audfill{height:9px;border-radius:4px;min-width:2px}
.g-female{background:var(--fem)}.g-male{background:var(--mal)}
.ifoot{text-align:center;font-size:12px;color:var(--faint);margin:10px 0 0}
.ov{position:fixed;inset:0;background:rgba(24,24,27,.28);z-index:50;display:flex;justify-content:flex-end}
.drawer{background:#fff;width:min(560px,100%);height:100%;overflow-y:auto;padding:20px 22px;display:flex;flex-direction:column;gap:12px;box-shadow:-10px 0 40px rgba(0,0,0,.1)}
.dh{display:flex;justify-content:space-between;align-items:center}
.fcfg{border:1px solid var(--line);border-radius:12px;padding:14px;display:flex;flex-direction:column;gap:10px}
.inf .fl{display:flex;flex-direction:column;gap:5px;font-size:12.5px;color:var(--muted)}
.inf .in{width:100%;border:1px solid var(--line);border-radius:8px;padding:8px 10px;outline:none;background:#fff;font-size:14px;color:var(--text);font-family:inherit}
.inf .in:focus{border-color:#a1a1a6;box-shadow:0 0 0 3px #f1f1ef}
.inf .hint{font-size:11.5px;color:var(--faint)}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.dfoot{display:flex;justify-content:flex-end;gap:8px;position:sticky;bottom:-20px;background:#fff;padding:12px 0 4px;border-top:1px solid var(--line)}
html.embedded .inf{padding:20px 22px 30px}
@media (max-width:1000px){.kpis{grid-template-columns:repeat(3,minmax(0,1fr))}.two{grid-template-columns:minmax(0,1fr)}}
@media (max-width:600px){.inf{padding:18px 16px 30px}.tstep .arrow{display:none}.tstep{min-width:calc(50% - 4px)}.kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.g2,.prof{grid-template-columns:1fr}.prow{grid-template-columns:90px minmax(0,1fr) 36px}.prow .muted{display:none}}
`;
