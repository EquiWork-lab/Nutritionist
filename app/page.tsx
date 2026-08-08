import Link from "next/link";
import { config } from "@/lib/config";

// Landing page. Copy follows the brand positioning: evidence-informed,
// calm, premium — NO medical claims (no "лечу / диагностирую / гарантирую").
export default function Home() {
  const brand = config.site.brand;
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <span className="text-lg font-semibold tracking-tight">{brand}</span>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/pricing" className="hover:text-[var(--color-sage-dark)]">
            Услуги
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-[var(--color-graphite)] px-4 py-2 text-[var(--color-cream)]"
          >
            Кабинет
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-5xl px-6 pb-16 pt-10 md:pt-20">
        <p className="text-sm uppercase tracking-widest text-[var(--color-sage-dark)]">
          Nutritionist · Консультант по питанию
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
          Еда должна помогать вам жить, а не управлять вашей жизнью.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-[var(--color-graphite)]/80">
          Evidence-informed питание и персональное сопровождение. Без голодных
          диет, без запретов, без чувства вины и без магических обещаний —
          понятные изменения маленькими шагами.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/pricing"
            className="rounded-full bg-[var(--color-sage)] px-6 py-3 font-medium text-white hover:bg-[var(--color-sage-dark)]"
          >
            Выбрать формат работы
          </Link>
          <a
            href="#about"
            className="rounded-full border border-[var(--color-graphite)]/20 px-6 py-3 font-medium"
          >
            Как это работает
          </a>
        </div>
      </section>

      <section id="about" className="border-t border-[var(--color-graphite)]/10 bg-white/40">
        <div className="mx-auto grid max-w-5xl gap-8 px-6 py-16 md:grid-cols-3">
          <div>
            <h3 className="font-semibold">Разбор, а не диагноз</h3>
            <p className="mt-2 text-sm text-[var(--color-graphite)]/70">
              Помогаю проанализировать пищевые привычки, структуру рациона и
              образ жизни и составить понятную стратегию питания под вашу
              реальную жизнь.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Маленькие шаги</h3>
            <p className="mt-2 text-sm text-[var(--color-graphite)]/70">
              Никаких резких запретов. Постепенные изменения, которые
              встраиваются в ваш ритм и остаются с вами надолго.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Честный подход</h3>
            <p className="mt-2 text-sm text-[var(--color-graphite)]/70">
              Современный, спокойный, без псевдонауки и продажи БАДов. Понятно
              объясняю, почему рекомендую именно это.
            </p>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-5xl px-6 py-10 text-xs text-[var(--color-graphite)]/60">
        <p>
          Работа нутрициолога не заменяет консультацию врача и не является
          медицинской услугой. При наличии заболеваний обратитесь к профильному
          специалисту.
        </p>
        <p className="mt-3">
          © {new Date().getFullYear()} {brand}
        </p>
      </footer>
    </main>
  );
}
