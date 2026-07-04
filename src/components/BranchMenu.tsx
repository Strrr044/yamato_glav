import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BRANCHES, type BranchId } from "@/data/menu-data";

export default function BranchMenu() {
  const [branch, setBranch] = useState<BranchId>("lenina");
  const active = BRANCHES.find((b) => b.id === branch)!;

  return (
    <div>
      {/* Переключатель филиалов */}
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-3">
        <p className="text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Выберите филиал
        </p>
        <div className="relative flex w-full rounded-full border border-border bg-card p-1">
          <span
            className="absolute inset-y-1 w-1/2 rounded-full bg-primary shadow-[var(--shadow-crimson)] transition-transform duration-300 ease-out"
            style={{
              transform: branch === "lenina" ? "translateX(0%)" : "translateX(100%)",
            }}
          />
          {BRANCHES.map((b) => (
            <button
              key={b.id}
              onClick={() => setBranch(b.id)}
              className={`btn-text relative z-10 w-1/2 rounded-full px-4 py-2.5 text-xs font-medium uppercase tracking-[0.15em] transition-colors duration-300 sm:text-sm ${
                branch === b.id ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground">
          {branch === "lenina"
            ? "Полное меню кухни, чайной и кальянной."
            : "Кальянное меню, чайные услуги и ограниченная кухня."}
        </p>
      </div>

      {/* Категории меню */}
      <div className="mt-12 space-y-6">
        {active.menu.map((category) => (
          <div
            key={category.id}
            className="group relative overflow-hidden rounded-lg border border-border bg-card px-5 transition hover:border-primary/60 hover:shadow-[var(--shadow-crimson)] sm:px-8"
          >
            <span className="kanji-watermark absolute -right-4 -top-6 text-[6rem] leading-none transition group-hover:text-primary/20 sm:text-[7rem]">
              {category.kanji}
            </span>
            <Accordion type="single" collapsible className="relative">
              <AccordionItem value={category.id} className="border-b-0">
                <AccordionTrigger className="py-6 hover:no-underline sm:py-7">
                  <h3 className="font-serif-display text-2xl italic font-semibold text-foreground sm:text-3xl">
                    {category.title}
                  </h3>
                </AccordionTrigger>
                <AccordionContent>
                  {category.note && (
                    <p className="mb-6 border-l-2 border-accent/50 pl-4 text-sm italic text-muted-foreground">
                      {category.note}
                    </p>
                  )}
                  <div className="space-y-8">
                    {category.subcategories.map((sub, i) => (
                      <div key={sub.title ?? i}>
                        {sub.title && (
                          <div className="mb-4 flex items-center gap-3">
                            <span className="font-accent text-xs tracking-[0.35em] text-accent">
                              {sub.title}
                            </span>
                            <div className="gold-divider flex-1" />
                          </div>
                        )}
                        <div className="space-y-4">
                          {sub.items.map((item) => (
                            <div
                              key={item.name}
                              className="flex items-start justify-between gap-4 border-b border-border/50 pb-4 last:border-0 last:pb-0"
                            >
                              <div>
                                <div className="flex flex-wrap items-baseline gap-2">
                                  <span className="font-serif-display text-base italic font-medium text-foreground sm:text-lg">
                                    {item.name}
                                  </span>
                                  {item.weight && (
                                    <span className="text-xs text-muted-foreground">
                                      {item.weight}
                                    </span>
                                  )}
                                </div>
                                {item.desc && (
                                  <p className="mt-1 max-w-md text-sm text-muted-foreground">
                                    {item.desc}
                                  </p>
                                )}
                              </div>
                              <span className="shrink-0 whitespace-nowrap font-serif-display text-base font-semibold italic text-accent sm:text-lg">
                                {item.price}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  );
}
