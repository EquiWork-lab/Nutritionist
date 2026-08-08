import Link from "next/link";
import { config } from "@/lib/config";
import { submitLead } from "./actions";

// Landing page. Copy follows the brand positioning: evidence-informed,
// calm, premium — NO medical claims (no "лечу / диагностирую / гарантирую").
export default function Home() {
  const brand = config.site.brand;
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <span className="text-lg font-semibold tracking-tight">{brand}</span>
        <nav className="flex items-center gap-6 text-sm">
          <a href="#services" className="hidden hover:text-[var(--color-sage-dark)] sm:inline">Услуги</a>
          <a href="#process" className="hidden hover:text-[var(--color-sage-dark)] sm:inline">Как это работает</a>
          <Link href="/pricing" className="hover:text-[var(--color-sage-dark)]">Цены</Link>
          <Link href="/login" className="rounded-full bg-[var(--color-graphite)] px-4 py-2 text-[var(--color-cream)]">Кабинет</Link>
        </nav>
      </header>

      {/* Hero */}
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
          <Link href="/pricing" className="rounded-full bg-[var(--color-sage)] px-6 py-3 font-medium text-white hover:bg-[var(--color-sage-dark)]">
            Выбрать формат работы
          </Link>
          <a href="#contact" className="rounded-full border border-[var(--color-graphite)]/20 px-6 py-3 font-medium">
            Оставить заявку
          </a>
        </div>
      </section>

      {/* Value props */}
      <section id="services" className="border-t border-[var(--color-graphite)]/10 bg-white/40">
        <div className="mx-auto grid max-w-5xl gap-8 px-6 py-16 md:grid-cols-3">
          <Feature title="Разбор, а не диагноз" body="Помогаю проанализировать пищевые привычки, структуру рациона и образ жизни и составить понятную стратегию питания под вашу реальную жизнь." />
          <Feature title="Маленькие шаги" body="Никаких резких запретов. Постепенные изменения, которые встраиваются в ваш ритм и остаются с вами надолго." />
          <Feature title="Честный подход" body="Современный, спокойный, без псевдонауки и продажи БАДов. Понятно объясняю, почему рекомендую именно это." />
        </div>
      </section>

      {/* Process */}
      <section id="process" className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-2xl font-semibold md:text-3xl">Как это работает</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-4">
          <Step n="01" title="Заявка" body="Оставляете заявку — коротко о цели и текущей ситуации." />
          <Step n="02" title="Разбор" body="Смотрим рацион, привычки и образ жизни на созвоне." />
          <Step n="03" title="Стратегия" body="Получаете понятный план маленьких шагов под вашу жизнь." />
          <Step n="04" title="Сопровождение" body="Поддержка и корректировки, пока изменения не закрепятся." />
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-[var(--color-graphite)]/10 bg-white/40">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="text-2xl font-semibold md:text-3xl">Частые вопросы</h2>
          <div className="mt-8 space-y-6">
            <Faq q="Это диета?" a="Нет. Мы не про запреты и голодание, а про устойчивые привычки и понятную структуру питания под вашу жизнь." />
            <Faq q="Вы ставите диагнозы и назначаете лечение?" a="Нет. Работа нутрициолога не заменяет консультацию врача и не является медицинской услугой. При заболеваниях нужно обращаться к профильному специалисту." />
            <Faq q="Как проходит работа?" a="Онлайн: разбор, письменная стратегия и сопровождение с корректировками. Форматы и цены — на странице «Цены»." />
          </div>
        </div>
      </section>

      {/* Contact / lead form */}
      <section id="contact" className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="text-2xl font-semibold md:text-3xl">Оставить заявку</h2>
        <p className="mt-2 text-[var(--color-graphite)]/70">
          Коротко расскажите о цели — свяжусь с вами и предложу подходящий формат.
        </p>
        <form action={submitLead} className="mt-6 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <input name="name" placeholder="Ваше имя" className="rounded-lg border border-[var(--color-graphite)]/20 bg-white px-4 py-3" />
            <input name="email" type="email" required placeholder="Email" className="rounded-lg border border-[var(--color-graphite)]/20 bg-white px-4 py-3" />
          </div>
          <textarea name="note" rows={4} placeholder="Ваша цель и текущая ситуация (по желанию)" className="rounded-lg border border-[var(--color-graphite)]/20 bg-white px-4 py-3" />
          <button className="justify-self-start rounded-full bg-[var(--color-sage)] px-6 py-3 font-medium text-white hover:bg-[var(--color-sage-dark)]">
            Отправить заявку
          </button>
        </form>
      </section>

      <footer className="mx-auto max-w-5xl px-6 py-10 text-xs text-[var(--color-graphite)]/60">
        <p>
          Работа нутрициолога не заменяет консультацию врача и не является
          медицинской услугой. При наличии заболеваний обратитесь к профильному
          специалисту.
        </p>
        <p className="mt-3">© {new Date().getFullYear()} {brand}</p>
      </footer>
    </main>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-[var(--color-graphite)]/70">{body}</p>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-[var(--color-graphite)]/10 bg-white p-5">
      <span className="text-sm font-semibold text-[var(--color-sage-dark)]">{n}</span>
      <h3 className="mt-2 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-[var(--color-graphite)]/70">{body}</p>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div>
      <h3 className="font-medium">{q}</h3>
      <p className="mt-1 text-sm text-[var(--color-graphite)]/70">{a}</p>
    </div>
  );
}
