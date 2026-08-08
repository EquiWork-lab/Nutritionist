"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/config";

// Magic-link login via Supabase Auth. Works once NEXT_PUBLIC_SUPABASE_* are set.
export default function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const configured = isSupabaseConfigured();

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <Link href="/" className="text-sm text-[var(--color-sage-dark)]">
        ← На главную
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">Вход в кабинет</h1>

      {!configured && (
        <p className="mt-4 rounded-lg bg-white p-3 text-sm text-[var(--color-graphite)]/70">
          Supabase ещё не настроен. Заполни NEXT_PUBLIC_SUPABASE_URL и
          NEXT_PUBLIC_SUPABASE_ANON_KEY в .env.local.
        </p>
      )}

      {sent ? (
        <p className="mt-6 rounded-lg bg-white p-4 text-sm">
          Ссылка для входа отправлена на {email}. Проверьте почту.
        </p>
      ) : (
        <form onSubmit={signIn} className="mt-6 space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-[var(--color-graphite)]/20 bg-white px-4 py-3"
          />
          <button
            type="submit"
            disabled={!configured}
            className="w-full rounded-full bg-[var(--color-sage)] px-5 py-3 font-medium text-white disabled:opacity-50"
          >
            Получить ссылку для входа
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      )}
    </main>
  );
}
