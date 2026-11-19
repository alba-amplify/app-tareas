"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const ERRORS: Record<string, string> = {
  "sin-acceso": "Esa cuenta de Google no está en el equipo de Amplify. Entra con el email que tienes dado de alta o avisa a Alba.",
  google: "No se pudo completar el inicio de sesión con Google. Inténtalo de nuevo.",
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("error");
    if (code) setError(ERRORS[code] ?? "No se pudo iniciar sesión.");
  }, []);

  async function handleGoogle() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) {
      setError(ERRORS.google);
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setError("Email o contraseña incorrectos.");
      setLoading(false);
      return;
    }

    // Navegación completa: "/" es el panel (route handler).
    window.location.href = "/";
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-card p-8 border border-black/[0.06]">
        <div className="mb-6 text-center">
          <div className="inline-block bg-paprika text-white font-extrabold text-lg px-5 py-2 rounded-full mb-3 tracking-tight">
            Amplify
          </div>
          <h1 className="text-xl font-bold text-ink tracking-tight">Panel de Tareas</h1>
          <p className="text-sm text-ink/50 mt-1">Entra con tu cuenta de Google del equipo</p>
          <div className="mt-3" data-lang-switch="" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border border-black/15 bg-white hover:bg-black/[0.03] text-ink font-semibold py-2.5 rounded-full transition-colors disabled:opacity-60"
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
            <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
          </svg>
          {loading ? "Conectando…" : "Entrar con Google"}
        </button>

        {error && <p className="text-sm text-paprika font-medium mt-4">{error}</p>}

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="text-xs text-ink/50 hover:text-ink underline underline-offset-2"
          >
            {showPassword ? "Ocultar" : "Entrar con email y contraseña"}
          </button>
        </div>

        {showPassword && (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-1">Email</label>
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
              <label className="block text-sm font-semibold text-ink mb-1">Contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-black/10 bg-black/[0.02] px-3 py-2 text-ink outline-none focus:border-paprika focus:ring-2 focus:ring-paprika/15"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-paprika hover:bg-paprika-dark text-white font-semibold py-2.5 rounded-full transition-colors disabled:opacity-60"
            >
              {loading ? "Entrando…" : "Entrar"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
