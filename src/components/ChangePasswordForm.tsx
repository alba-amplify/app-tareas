"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ChangePasswordForm() {
  const supabase = createClient();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (pw.length < 6) {
      setMsg({ ok: false, text: "La contraseña debe tener al menos 6 caracteres." });
      return;
    }
    if (pw !== pw2) {
      setMsg({ ok: false, text: "Las contraseñas no coinciden." });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setLoading(false);
    if (error) {
      setMsg({ ok: false, text: "No se pudo cambiar: " + error.message });
      return;
    }
    setPw("");
    setPw2("");
    setMsg({ ok: true, text: "✓ Contraseña actualizada correctamente." });
  }

  const field =
    "w-full rounded-xl border border-black/10 bg-black/[0.02] px-3 py-2 text-ink outline-none focus:border-paprika focus:ring-2 focus:ring-paprika/15";

  return (
    <div className="max-w-md bg-white rounded-3xl border border-transparent hover:border-biscuit shadow-soft p-6">
      <h2 className="text-lg font-display font-medium text-ink tracking-tight">
        Cambiar contraseña
      </h2>
      <p className="text-sm text-ink/50 mt-1 mb-4">
        Cambia tu contraseña inicial por una tuya.
      </p>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm font-semibold text-ink mb-1">
            Nueva contraseña
          </label>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className={field}
            placeholder="••••••••"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-ink mb-1">
            Repite la contraseña
          </label>
          <input
            type="password"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            className={field}
            placeholder="••••••••"
          />
        </div>

        {msg && (
          <p
            className={`text-sm font-medium ${
              msg.ok ? "text-green-700" : "text-paprika"
            }`}
          >
            {msg.text}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-paprika hover:bg-paprika-dark text-white font-medium px-5 py-2 rounded-xl disabled:opacity-60"
        >
          {loading ? "Guardando…" : "Cambiar contraseña"}
        </button>
      </form>
    </div>
  );
}
