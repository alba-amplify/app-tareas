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
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-card p-8 border border-black/[0.06]">
        <div className="mb-6 text-center">
          <div className="inline-block bg-paprika text-white font-extrabold text-lg px-5 py-2 rounded-full mb-3 tracking-tight">
            Amplify
          </div>
          <h1 className="text-xl font-bold text-ink tracking-tight">
            Panel de Tareas
          </h1>
          <p className="text-sm text-ink/50 mt-1">Accede con tu email de equipo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-black/[0.02] px-3 py-2 text-ink outline-none focus:border-paprika focus:ring-2 focus:ring-paprika/15"
              placeholder="tu@amplifyesp.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-black/[0.02] px-3 py-2 text-ink outline-none focus:border-paprika focus:ring-2 focus:ring-paprika/15"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-paprika font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-paprika hover:bg-paprika-dark text-white font-semibold py-2.5 rounded-full transition-colors disabled:opacity-60"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
