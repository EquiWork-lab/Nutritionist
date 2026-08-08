import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Mini-CRM. When Supabase is configured, loads clients from the `clients`
// table. Until then it renders demo rows so the layout is reviewable.
const DEMO_CLIENTS = [
  { id: "1", name: "Client A", email: "a@example.com", plan: "Месячное сопровождение", status: "active" },
  { id: "2", name: "Client B", email: "b@example.com", plan: "Разовая консультация", status: "lead" },
];

export default async function Dashboard() {
  let clients = DEMO_CLIENTS;
  let live = false;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("clients")
        .select("id,name,email,plan,status")
        .order("created_at", { ascending: false });
      if (data && data.length) {
        clients = data as typeof DEMO_CLIENTS;
        live = true;
      }
    } catch {
      // table not created yet — fall back to demo rows
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/" className="text-sm text-[var(--color-sage-dark)]">
            ← На главную
          </Link>
          <h1 className="mt-2 text-3xl font-semibold">Кабинет · Клиенты</h1>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs">
          {live ? "Supabase: подключён" : "Демо-данные"}
        </span>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-[var(--color-graphite)]/10 bg-white">
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
              <tr key={c.id} className="border-t border-[var(--color-graphite)]/8">
                <td className="px-4 py-3">{c.name}</td>
                <td className="px-4 py-3 text-[var(--color-graphite)]/70">{c.email}</td>
                <td className="px-4 py-3">{c.plan}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      c.status === "active"
                        ? "bg-[var(--color-sage)]/20 text-[var(--color-sage-dark)]"
                        : "bg-[var(--color-graphite)]/10"
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
