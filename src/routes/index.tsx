import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import BranchMenu from "@/components/BranchMenu";
import heroStaticImg from "../../ямато_фото/картw-static-effect.webp";
import kartImg from "../../ямато_фото/картw-optimized.webp";
import wavePattern from "../../ямато_фото/wave-pattern.jpg";
import foodImg from "../../ямато_фото/еда.png";
import hallImg from "../../ямато_фото/зал.png";
import streetImg from "../../ямато_фото/улицабезводы.jpeg";
import teapotImg from "../../ямато_фото/чайник.png";
import malayaChaynayaLogoText from "../../ямато_фото/malaya-chaynaya-upscaled.png";

const heroImg = heroStaticImg;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Yamato Lounge — Кальянная в японском стиле | Барнаул" },
      {
        name: "description",
        content:
          "Yamato Lounge — атмосферная кальянная в Барнауле в японском стиле. Классические и сигарные чаши, каскады. Две локации. Бронирование стола 18+.",
      },
      { property: "og:title", content: "Yamato Lounge — Кальянная в Барнауле" },
      {
        property: "og:description",
        content: "Японская эстетика, премиум табаки, две локации в Барнауле.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: heroImg },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      { rel: "preload", as: "image", href: heroImg, fetchPriority: "high" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Unicase:wght@400;500;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Inter:wght@700;800&family=Shippori+Mincho+B1:wght@500;700;800&family=Italiana&family=Noto+Sans+JP:wght@300;400;500;700&family=Ruslan+Display&family=Zen+Old+Mincho:wght@400;500;700;900&family=Spectral:wght@400;500;600&family=Cinzel:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: Index,
});

const LOCATIONS = [
  {
    title: "Улица 65 лет Победы",
    address: "ул. 65 лет Победы, 20, Барнаул",
    map: "https://yandex.ru/map-widget/v1/?ll=83.683700%2C53.366500&mode=search&text=%D1%83%D0%BB%D0%B8%D1%86%D0%B0%2065%20%D0%BB%D0%B5%D1%82%20%D0%9F%D0%BE%D0%B1%D0%B5%D0%B4%D1%8B%2020%20%D0%91%D0%B0%D1%80%D0%BD%D0%B0%D1%83%D0%BB&z=16",
    yLink: "https://yandex.ru/maps/?text=улица+65+лет+Победы+20+Барнаул",
  },
  {
    title: "Гостиница «Алтай»",
    address: "проспект Ленина, 24, Барнаул",
    map: "https://yandex.ru/map-widget/v1/?ll=83.778000%2C53.346500&mode=search&text=%D0%BF%D1%80%D0%BE%D1%81%D0%BF%D0%B5%D0%BA%D1%82%20%D0%9B%D0%B5%D0%BD%D0%B8%D0%BD%D0%B0%2024%20%D0%91%D0%B0%D1%80%D0%BD%D0%B0%D1%83%D0%BB&z=16",
    yLink: "https://yandex.ru/maps/?text=проспект+Ленина+24+Барнаул",
  },
];

const SPACE = [
  { src: hallImg, alt: "Главный зал Yamato Lounge", caption: "Главный зал" },
  { src: foodImg, alt: "Еда в Yamato Lounge", caption: "Еда" },
  { src: streetImg, alt: "Фасад заведения Yamato Lounge", caption: "Снаружи" },
  { src: teapotImg, alt: "Чайник в Yamato Lounge", caption: "Чайная церемония" },
];

const PHONE = "+7 (923) 111-22-33";
const PHONE_TEL = "+79231112233";
const TG = "yamato_lounge_brn";

const NAV_LINKS = [
  { href: "#menu", label: "Меню" },
  { href: "#space", label: "Пространство" },
  { href: "#locations", label: "Локации" },
  { href: "#contacts", label: "Контакты" },
];

function Index() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-30 border-b border-border/40 bg-background/70 backdrop-blur-md">
        <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <a href="#top" className="flex items-center">
            <span className="font-display text-lg font-bold tracking-widest text-primary sm:text-xl">
              大和
            </span>
          </a>
          {/* Desktop nav — centered */}
          <nav className="pointer-events-none absolute inset-x-0 top-1/2 hidden -translate-y-1/2 justify-center gap-10 text-sm tracking-[0.2em] uppercase text-muted-foreground md:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="nav-link pointer-events-auto relative pb-1 transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </nav>
          {/* Spacer to balance flex on desktop */}
          <div className="hidden w-12 md:block" />
          {/* Mobile nav */}
          <nav className="flex gap-4 text-xs tracking-wider text-muted-foreground md:hidden">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="nav-link relative pb-1 uppercase">
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section
        id="top"
        className="relative flex min-h-screen items-center justify-center pt-20"
      >
        <div className="absolute inset-0">
          <img
            src={heroStaticImg}
            alt=""
            fetchPriority="high"
            width={1536}
            height={1024}
            className="h-full w-full object-cover opacity-90"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background z-10" />
        <div
          className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay z-10"
          style={{ background: "var(--gradient-ember)" }}
        />

        <div className="pointer-events-none relative z-10 mx-auto max-w-4xl px-6 text-center [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
          <p className="font-jp animate-in fade-in slide-in-from-top-2 duration-700 text-base tracking-[0.5em] text-accent sm:text-lg">
            煙 と 魂
          </p>
          <h1 className="mt-6 text-center text-foreground">
            <span
              className="hero-title-haze block text-7xl font-extrabold uppercase leading-[0.95] tracking-[0.22em] text-[#fff7df] sm:text-7xl md:text-8xl lg:text-[9rem]"
              style={{
                fontFamily: '"Inter", sans-serif',
                textShadow:
                  '1.25px 0 0 rgba(212, 175, 55, 0.98), -1.25px 0 0 rgba(212, 175, 55, 0.98), 0 1.25px 0 rgba(212, 175, 55, 0.98), 0 -1.25px 0 rgba(212, 175, 55, 0.98), 0 0 9px rgba(212, 175, 55, 0.52), 0 0 20px rgba(191, 144, 45, 0.26)',
              }}
            >
              ЯМАТО
            </span>
            <span className="hero-kanji-float mt-4 block font-jp text-xl tracking-[0.5em] text-accent sm:text-2xl">
              火
            </span>
            <img
              src={malayaChaynayaLogoText}
              alt="Малая чайная"
              className="hero-subtitle-haze gold-outline-glow hero-gold-breathe mx-auto mt-4 block h-[6.5rem] w-auto sm:h-[6rem] md:h-[8rem] lg:h-[10rem]"s
            />
          </h1>
          <p className="mx-auto mt-8 max-w-2xl font-jp text-2xl tracking-[0.25em] text-foreground/90 sm:text-3xl md:text-4xl">
            煙の中に、静けさを。
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <button
              onClick={() => setOpen(true)}
              className="group relative w-full overflow-hidden rounded-md bg-primary px-10 py-4 btn-text text-sm font-medium uppercase tracking-[0.35em] text-primary-foreground shadow-[var(--shadow-crimson)] transition hover:scale-[1.02] hover:shadow-[var(--shadow-gold)] sm:w-auto"
            >
              <span className="relative z-10">Забронировать стол</span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-accent/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </button>
            <a
              href="#menu"
              className="w-full rounded-md border border-border px-10 py-4 btn-text text-sm font-medium uppercase tracking-[0.35em] text-foreground/90 transition hover:border-accent hover:text-accent sm:w-auto"
            >
              Меню
            </a>
          </div>
        </div>

        <div className="kanji-watermark absolute left-4 top-1/3 hidden text-[10rem] leading-none lg:block">
          龍
        </div>
        <div className="kanji-watermark absolute right-4 bottom-20 hidden text-[10rem] leading-none lg:block">
          鬼
        </div>
      </section>

      {/* MENU / PRICE */}
      <section id="menu" className="relative py-24 sm:py-32">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `url(${wavePattern})`,
            backgroundSize: "400px",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <p className="font-accent text-xs tracking-[0.4em] text-accent">品書き</p>
            <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Меню
            </h2>
            <div className="gold-divider mx-auto mt-6 w-40" />
          </div>

          <div className="mt-14">
            <BranchMenu />
          </div>
        </div>
      </section>

      {/* SPACE */}
      <section id="space" className="relative bg-card/40 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <p className="font-accent text-xs tracking-[0.4em] text-accent">空間</p>
            <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Наше пространство
            </h2>
            <div className="gold-divider mx-auto mt-6 w-40" />
            <p className="mt-4 max-w-xl mx-auto text-muted-foreground">
              Загляните внутрь — атмосфера, в которой хочется задержаться.
            </p>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SPACE.map((img, i) => (
              <figure
                key={img.src}
                className={`group relative overflow-hidden rounded-lg border border-border shadow-[var(--shadow-crimson)] transition hover:border-primary ${
                  i === 0 ? "lg:col-span-2 lg:row-span-2" : ""
                }`}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  width={1280}
                  height={896}
                  className={`w-full object-cover transition duration-700 group-hover:scale-105 ${
                    i === 0 ? "h-72 sm:h-80 lg:h-full" : "h-56 sm:h-64"
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent" />
                <figcaption className="absolute bottom-3 left-4 font-serif-display text-lg italic text-foreground/90">
                  {img.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* LOCATIONS */}
      <section id="locations" className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <p className="font-accent text-xs tracking-[0.4em] text-accent">場所</p>
            <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Локации
            </h2>
            <div className="gold-divider mx-auto mt-6 w-40" />
            <p className="mt-4 text-muted-foreground">Две точки в Барнауле</p>
          </div>

          <div className="mt-16 grid gap-10 lg:grid-cols-2">
            {LOCATIONS.map((loc) => (
              <div key={loc.title} className="group">
                <div className="mb-4">
                  <h3 className="font-display text-2xl font-bold text-foreground">
                    {loc.title}
                  </h3>
                  <p className="mt-1 text-muted-foreground">{loc.address}</p>
                </div>
                <div className="overflow-hidden rounded-lg border border-border shadow-[var(--shadow-crimson)] transition group-hover:border-primary">
                  <iframe
                    src={loc.map}
                    title={`Карта: ${loc.title}`}
                    className="h-72 w-full border-0 sm:h-80"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <a
                  href={loc.yLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-sm tracking-wider text-accent hover:underline"
                >
                  Открыть в Яндекс.Картах →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACTS */}
      <section id="contacts" className="relative bg-card/40 py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="font-accent text-xs tracking-[0.4em] text-accent">連絡先</p>
          <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Контакты
          </h2>
          <div className="gold-divider mx-auto mt-6 w-40" />

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            <a
              href={`tel:${PHONE_TEL}`}
              className="group rounded-lg border border-border bg-card p-8 transition hover:border-primary hover:shadow-[var(--shadow-crimson)]"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Телефон
              </p>
              <p className="mt-3 font-sans text-2xl font-medium tracking-wide text-foreground transition group-hover:text-accent sm:text-3xl">
                {PHONE}
              </p>
            </a>
            <a
              href={`https://t.me/${TG}`}
              target="_blank"
              rel="noreferrer"
              className="group rounded-lg border border-border bg-card p-8 transition hover:border-primary hover:shadow-[var(--shadow-crimson)]"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Telegram
              </p>
              <p className="mt-3 font-sans text-2xl font-medium tracking-wide text-foreground transition group-hover:text-accent sm:text-3xl">
                @{TG}
              </p>
            </a>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="mt-12 rounded-md bg-primary px-10 py-4 btn-text text-sm font-medium uppercase tracking-[0.35em] text-primary-foreground shadow-[var(--shadow-crimson)] transition hover:scale-[1.02]"
          >
            Забронировать стол
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border bg-card/40 py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <p className="font-display text-lg font-bold tracking-widest text-primary">
                大和 · YAMATO LOUNGE
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                © {new Date().getFullYear()} Yamato Lounge, Барнаул
              </p>
            </div>
            <p className="max-w-sm text-xs text-muted-foreground leading-relaxed">
              Курение вредит вашему здоровью.<br />
              Заведение для лиц старше 18 лет.
            </p>
          </div>
        </div>
      </footer>

      {/* BOOKING MODAL */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-md"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-xl border border-primary/60 bg-card p-8 text-center shadow-[var(--shadow-crimson)] sm:p-10"
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Закрыть"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-primary hover:text-primary"
            >
              ✕
            </button>
            <span className="kanji-watermark absolute -right-6 -bottom-10 text-[10rem] leading-none">
              予約
            </span>
            <div className="relative">
              <p className="font-accent text-xs tracking-[0.4em] text-accent">
                予約 · BOOKING
              </p>
              <h3 className="mt-3 font-display text-2xl font-bold sm:text-3xl">
                Забронировать стол
              </h3>
              <div className="gold-divider mx-auto mt-4 w-24" />
              <p className="mt-5 text-sm text-muted-foreground">
                Позвоните нам — забронируем место и подготовим вашу любимую чашу.
              </p>
              <a
                href={`tel:${PHONE_TEL}`}
                className="mt-6 block font-sans text-3xl font-medium tracking-wide text-primary transition hover:text-accent sm:text-4xl"
              >
                {PHONE}
              </a>
              <a
                href={`https://t.me/${TG}`}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-block rounded-md border border-border px-6 py-3 text-sm tracking-wider text-foreground transition hover:border-accent hover:text-accent"
              >
                Написать в Telegram
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
