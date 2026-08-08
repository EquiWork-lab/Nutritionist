"use client";

import { useState } from "react";
import Link from "next/link";

// Products / subscription tiers. In a full build these come from the Supabase
// `products` table; here they are seeded so the checkout flow is testable.
const PRODUCTS = [
  {
    id: "single",
    name: "Разовая консультация",
    priceMinor: 8000,
    price: "80 BYN",
    recurring: false,
    features: ["60 минут онлайн", "Разбор рациона", "Письменное резюме"],
  },
  {
    id: "monthly",
    name: "Месячное сопровождение",
    priceMinor: 22000,
    price: "220 BYN / мес",
    recurring: true,
    features: ["Стартовая консультация", "Еженедельная поддержка", "Корректировка плана"],
    highlight: true,
  },
  {
    id: "materials",
    name: "Доступ к материалам",
    priceMinor: 3500,
    price: "35 BYN / мес",
    recurring: true,
    features: ["Библиотека разборов", "Шаблоны и чек-листы", "Новые материалы каждый месяц"],
  },
];

export default function Pricing() {
  const [loading, setLoading] = useState<string | null>(null);

  async function buy(p: (typeof PRODUCTS)[number]) {
    setLoading(p.id);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: p.id,
          priceMinor: p.priceMinor,
          currency: "BYN",
          description: p.name,
          recurring: p.recurring,
        }),
      });
      const data = await res.json();
      if (data.redirectUrl) window.location.href = data.redirectUrl;
      else alert(data.error ?? "Ошибка оплаты");
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Link href="/" className="text-sm text-[var(--color-sage-dark)]">
        ← На главную
      </Link>
      <h1 className="mt-4 text-3xl font-semibold md:text-4xl">Форматы работы</h1>
      <p className="mt-2 max-w-2xl text-[var(--color-graphite)]/70">
        Выберите формат под вашу задачу. Оплата — в тестовом режиме (mock),
        подключение bePaid происходит через переменные окружения.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {PRODUCTS.map((p) => (
          <div
            key={p.id}
            className={`flex flex-col rounded-2xl border p-6 ${
              p.highlight
                ? "border-[var(--color-sage)] bg-white shadow-sm"
                : "border-[var(--color-graphite)]/15 bg-white/50"
            }`}
          >
            <h3 className="text-lg font-semibold">{p.name}</h3>
            <p className="mt-1 text-2xl font-semibold text-[var(--color-sage-dark)]">
              {p.price}
            </p>
            <ul className="mt-4 flex-1 space-y-2 text-sm text-[var(--color-graphite)]/75">
              {p.features.map((f) => (
                <li key={f}>· {f}</li>
              ))}
            </ul>
            <button
              onClick={() => buy(p)}
              disabled={loading === p.id}
              className="mt-6 rounded-full bg-[var(--color-graphite)] px-5 py-2.5 text-sm font-medium text-[var(--color-cream)] disabled:opacity-50"
            >
              {loading === p.id ? "Переход к оплате…" : "Оформить"}
            </button>
          </div>
        ))}
      </div>

      <p className="mt-10 text-xs text-[var(--color-graphite)]/60">
        Работа нутрициолога не заменяет консультацию врача. Оплата и выставление
        чека зависят от правового статуса (ИП / НПД) — см. README.
      </p>
    </main>
  );
}
