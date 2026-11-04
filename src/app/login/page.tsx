"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setError("Email o contraseña incorrectos.");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] bg-cream">
      {/* Panel de marca */}
      <section
        className="relative hidden lg:flex flex-col justify-between overflow-hidden p-10 text-[#FFF8F2]"
        style={{
          background:
            "radial-gradient(120% 140% at 100% 0%, #C2392E 0%, transparent 55%), radial-gradient(90% 120% at 0% 100%, #1A110B 0%, transparent 60%), linear-gradient(135deg, #2A1D14, #8E1C17)",
        }}
      >
        <span className="font-display font-semibold text-[28px] leading-none tracking-[-0.035em] text-sun">
          amplify
        </span>
        <div className="max-w-md">
          <h2 className="font-display text-[40px] leading-[1.05] font-medium">
            Todo el trabajo del equipo, en un solo tablero.
          </h2>
          <p className="mt-3 text-[#FFF8F2]/75">
            Tareas, contenido, accesos y redes sociales de Amplify.
          </p>
        </div>
        <p className="text-xs text-[#FFF8F2]/55">Panel interno del equipo</p>
      </section>

      <div className="flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-soft p-8">
        <div className="mb-6">
          <div className="lg:hidden inline-block font-display font-semibold text-xl leading-none tracking-[-0.035em] bg-cacao text-sun px-3 py-2 rounded-lg mb-5">
            amplify
          </div>
          <h1 className="font-display text-[26px] leading-tight font-medium text-ink">
            Panel de tareas
          </h1>
          <p className="text-sm text-muted mt-1">Accede con tu email de equipo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[12.5px] font-medium text-muted mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-biscuit bg-white px-3 py-2.5 text-ink outline-none focus:border-paprika focus:ring-2 focus:ring-paprika/15"
              placeholder="tu@amplifyesp.com"
            />
          </div>
          <div>
            <label className="block text-[12.5px] font-medium text-muted mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-biscuit bg-white px-3 py-2.5 text-ink outline-none focus:border-paprika focus:ring-2 focus:ring-paprika/15"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-bad bg-bad-soft rounded-xl px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-paprika hover:bg-paprika-dark text-white font-medium py-2.5 rounded-xl transition-colors disabled:opacity-60"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
      </div>
    </main>
  );
}
