import Link from "next/link";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase/admin";
import { addClient, signOut } from "./actions";

export const dynamic = "force-dynamic";

type ClientRow = {
  id: string;
  name: string | null;
  email: string | null;
  plan: string | null;
  status: string;
};
type SubRow = {
  id: string;
  order_id: string;
  product_id: string | null;
  status: string;
  amount_minor: number | null;
  currency: string | null;
};

const DEMO_CLIENTS: ClientRow[] = [
  { id: "1", name: "Client A", email: "a@example.com", plan: "Месячное сопровождение", status: "active" },
  { id: "2", name: "Client B", email: "b@example.com", plan: "Разовая консультация", status: "lead" },
];

function money(minor: number | null, cur: string | null) {
  if (minor == null) return "—";
  return `${(minor / 100).toFixed(2)} ${cur ?? "BYN"}`;
}

export default async function Dashboard() {
  // Protect the route when auth is configured.
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");
  }

  let clients = DEMO_CLIENTS;
  let subs: SubRow[] = [];
  let live = false;

  if (isAdminConfigured()) {
    try {
      const admin = createAdminClient();
      const [{ data: c }, { data: s }] = await Promise.all([
        admin.from("clients").select("id,name,email,plan,status").order("created_at", { ascending: false }),
        admin.from("subscriptions").select("id,order_id,product_id,status,amount_minor,currency").order("created_at", { ascending: false }),
      ]);
      if (c) clients = c as ClientRow[];
      if (s) subs = s as SubRow[];
      live = true;
    } catch {
      // tables not created yet — keep demo data
    }
  }

  const activeCount = clients.filter((c) => c.status === "active").length;
  const leadCount = clients.filter((c) => c.status === "lead").length;
  const mrrMinor = subs
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + (s.amount_minor ?? 0), 0);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/" className="text-sm text-[var(--color-sage-dark)]">← На главную</Link>
          <h1 className="mt-2 text-3xl font-semibold">Кабинет</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-white px-3 py-1 text-xs">
            {live ? "Supabase: подключён" : "Демо-данные"}
          </span>
          {isSupabaseConfigured() && (
            <form action={signOut}>
              <button className="rounded-full border border-[var(--color-graphite)]/20 px-3 py-1 text-xs">
                Выйти
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Stat tiles */}
      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        <Stat label="Всего контактов" value={String(clients.length)} />
        <Stat label="Активные клиенты" value={String(activeCount)} />
        <Stat label="Лиды" value={String(leadCount)} />
        <Stat label="MRR (активные)" value={money(mrrMinor, "BYN")} />
      </div>

      {/* Add client */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold">Добавить контакт</h2>
        <form action={addClient} className="mt-3 grid gap-3 rounded-2xl border border-[var(--color-graphite)]/10 bg-white p-4 sm:grid-cols-5">
          <input name="name" placeholder="Имя" className="rounded-lg border border-[var(--color-graphite)]/20 px-3 py-2 text-sm sm:col-span-1" />
          <input name="email" placeholder="Email" className="rounded-lg border border-[var(--color-graphite)]/20 px-3 py-2 text-sm sm:col-span-1" />
          <input name="plan" placeholder="План" className="rounded-lg border border-[var(--color-graphite)]/20 px-3 py-2 text-sm sm:col-span-1" />
          <select name="status" className="rounded-lg border border-[var(--color-graphite)]/20 px-3 py-2 text-sm sm:col-span-1">
            <option value="lead">lead</option>
            <option value="active">active</option>
            <option value="paused">paused</option>
            <option value="churned">churned</option>
          </select>
          <button className="rounded-lg bg-[var(--color-graphite)] px-4 py-2 text-sm font-medium text-[var(--color-cream)] sm:col-span-1">
            Добавить
          </button>
        </form>
        {!isAdminConfigured() && (
          <p className="mt-2 text-xs text-[var(--color-graphite)]/60">
            Форма заработает после настройки Supabase (SUPABASE_SERVICE_ROLE_KEY).
          </p>
        )}
      </section>

      {/* Clients table */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold">Клиенты</h2>
        <div className="mt-3 overflow-hidden rounded-2xl border border-[var(--color-graphite)]/10 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--color-cream)] text-[var(--color-graphite)]/60">
              <tr>
                <th className="px-4 py-3 font-medium">Имя</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">План</th>
                <th className="px-4 py-3 font-medium">Статус</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-t border-[var(--color-graphite)]/10">
                  <td className="px-4 py-3">{c.name ?? "—"}</td>
                  <td className="px-4 py-3 text-[var(--color-graphite)]/70">{c.email ?? "—"}</td>
                  <td className="px-4 py-3">{c.plan ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${c.status === "active" ? "bg-[var(--color-sage)]/20 text-[var(--color-sage-dark)]" : "bg-[var(--color-graphite)]/10"}`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Subscriptions */}
      {live && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">Подписки и заказы</h2>
          <div className="mt-3 overflow-hidden rounded-2xl border border-[var(--color-graphite)]/10 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--color-cream)] text-[var(--color-graphite)]/60">
                <tr>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Продукт</th>
                  <th className="px-4 py-3 font-medium">Сумма</th>
                  <th className="px-4 py-3 font-medium">Статус</th>
                </tr>
              </thead>
              <tbody>
                {subs.length === 0 ? (
                  <tr><td className="px-4 py-4 text-[var(--color-graphite)]/60" colSpan={4}>Пока нет заказов.</td></tr>
                ) : (
                  subs.map((s) => (
                    <tr key={s.id} className="border-t border-[var(--color-graphite)]/10">
                      <td className="px-4 py-3 font-mono text-xs">{s.order_id}</td>
                      <td className="px-4 py-3">{s.product_id ?? "—"}</td>
                      <td className="px-4 py-3">{money(s.amount_minor, s.currency)}</td>
                      <td className="px-4 py-3">{s.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--color-graphite)]/10 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-[var(--color-graphite)]/50">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
