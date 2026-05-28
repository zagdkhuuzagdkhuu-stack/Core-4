import { motion } from "motion/react";
import { BookOpen, ExternalLink, FileText, Globe2, Landmark, PenLine, Scale } from "lucide-react";
import type { AppContent, FolderNavControls, HeaderTab, UiContent } from "../shared/types";

type InformationContent = AppContent["information"];

function ConstitutionEmblem() {
  return (
    <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-border bg-secondary text-foreground shadow-[0_12px_26px_rgba(12,21,25,0.08)]">
      <div className="absolute inset-2 rounded-full border border-border/70" />
      <Landmark size={24} strokeWidth={1.55} />
    </div>
  );
}

function DecorationField() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <Scale className="absolute left-6 top-12 h-44 w-44 text-foreground/[0.08] md:left-14 md:top-14 md:h-56 md:w-56" strokeWidth={1.05} />
      <BookOpen className="absolute left-10 bottom-8 h-28 w-28 text-foreground/[0.07] md:left-24 md:bottom-10 md:h-36 md:w-36" strokeWidth={1.05} />

      <div className="absolute right-8 top-10 h-56 w-40 rotate-3 rounded-lg border-2 border-foreground/[0.075] bg-card/[0.08] md:right-20 md:top-12 md:h-64 md:w-48">
        <div className="absolute left-5 right-5 top-8 h-px bg-foreground/[0.08]" />
        <div className="absolute left-5 right-9 top-14 h-px bg-foreground/[0.07]" />
        <div className="absolute left-5 right-12 top-20 h-px bg-foreground/[0.06]" />
        <div className="absolute bottom-14 left-6 h-px w-24 bg-foreground/[0.09]" />
        <div className="absolute bottom-8 right-7 h-14 w-14 rounded-full border-2 border-foreground/[0.08]" />
      </div>
      <FileText className="absolute right-12 top-16 h-40 w-40 text-foreground/[0.075] md:right-28 md:top-20 md:h-48 md:w-48" strokeWidth={1.05} />
      <PenLine className="absolute right-14 bottom-10 h-28 w-28 -rotate-12 text-foreground/[0.08] md:right-28 md:bottom-14 md:h-36 md:w-36" strokeWidth={1.05} />

      <div className="absolute left-[14%] top-[18%] h-32 w-32 rounded-full border border-border/45" />
      <div className="absolute right-[18%] top-[16%] h-24 w-24 rounded-full border border-border/40" />
      <div className="absolute left-[46%] top-[10%] h-44 w-44 rounded-full border border-border/30" />
    </div>
  );
}

export function InformationPage({
  onTabSelect,
  navControls,
  ui,
  content,
}: {
  onTabSelect: (tab: HeaderTab) => void;
  navControls: FolderNavControls;
  ui: UiContent;
  content: InformationContent;
}) {
  void onTabSelect;
  void navControls;
  void ui;

  return (
    <section className="flex min-h-screen flex-col bg-background">
      <motion.main className="relative flex-1 overflow-x-hidden bg-secondary dark:bg-secondary">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(207,157,123,0.10),transparent_25%),radial-gradient(circle_at_82%_12%,rgba(216,198,186,0.16),transparent_24%)]" />

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-7rem)] max-w-[1280px] flex-col px-5 py-7 sm:px-8 lg:px-10">
          <motion.section
            className="relative mb-8 overflow-hidden rounded-[2rem] border border-border/70 bg-background px-6 py-16 text-center shadow-[0_18px_52px_rgba(12,21,25,0.08)] sm:px-10"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <DecorationField />
            <div className="relative z-10 mx-auto max-w-3xl">
              <h1 className="font-display text-4xl font-bold leading-tight text-foreground md:text-5xl">
                {content.hero.title}
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                {content.hero.subtitle}
              </p>
            </div>
          </motion.section>

          <motion.section
            className="mb-7 rounded-[2rem] border border-border/70 bg-card/80 p-5 shadow-[0_18px_52px_rgba(12,21,25,0.08)] dark:border-highlight/15 dark:bg-card/80 sm:p-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div className="grid gap-4 lg:grid-cols-4">
              {content.constitutions.map((item, index) => (
                <motion.article
                  key={`${item.year}-${item.title}`}
                  className="group flex min-h-[390px] flex-col rounded-[1.35rem] border border-border/70 bg-secondary p-5 text-center shadow-[0_14px_34px_rgba(12,21,25,0.06)] transition-all duration-300 ease-out hover:scale-[1.02] hover:border-highlight/80 hover:shadow-[0_20px_46px_rgba(12,21,25,0.11)] dark:border-highlight/15"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <ConstitutionEmblem />
                  <div className="mt-5 flex flex-1 flex-col">
                    <p className="font-display text-3xl font-black text-foreground">{item.year}</p>
                    <h2 className="mt-2 min-h-[3rem] text-base font-bold leading-6 text-foreground">{item.title}</h2>
                    <p className="mt-3 flex-1 text-xs leading-5 text-muted-foreground">{item.description}</p>
                    <dl className="mt-5 space-y-3 rounded-xl border border-border/65 bg-card/70 p-4 text-left">
                      <div className="flex items-start justify-between gap-4">
                        <dt className="text-xs font-semibold text-muted-foreground">{item.whenLabel}</dt>
                        <dd className="text-right text-xs font-bold text-foreground">{item.whenValue}</dd>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <dt className="text-xs font-semibold text-muted-foreground">{item.sizeLabel}</dt>
                        <dd className="text-right text-xs font-bold text-foreground">{item.sizeValue}</dd>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <dt className="text-xs font-semibold text-muted-foreground">{item.governanceLabel}</dt>
                        <dd className="max-w-[58%] text-right text-xs font-bold leading-5 text-foreground">{item.governanceValue}</dd>
                      </div>
                    </dl>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.section>

          <motion.section
            className="mb-8 grid gap-7 rounded-[2rem] border border-border/70 bg-card/80 p-6 shadow-[0_18px_52px_rgba(12,21,25,0.08)] dark:border-highlight/15 dark:bg-card/80 lg:grid-cols-[320px_minmax(0,1fr)] lg:p-7"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div className="flex flex-col justify-center">
              <h2 className="font-display text-4xl font-bold text-foreground">{content.sources.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {content.sources.subtitle}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {content.sources.items.map((source, index) => (
                <motion.a
                  key={source.name}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex min-h-[92px] items-center gap-4 rounded-xl border border-border/70 bg-secondary p-4 text-left shadow-[0_12px_28px_rgba(12,21,25,0.05)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.02] hover:border-highlight/80 hover:shadow-[0_18px_42px_rgba(12,21,25,0.12)] dark:border-highlight/15"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-foreground">
                    {index % 2 === 0 ? <Globe2 size={18} /> : <FileText size={18} />}
                  </span>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-button text-xs font-bold text-button-text">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-foreground">{source.name}</span>
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">{source.description}</span>
                  </span>
                  <ExternalLink size={16} className="shrink-0 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                </motion.a>
              ))}
            </div>
          </motion.section>

          <footer className="mt-auto flex flex-col gap-3 border-t border-border/70 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>{content.footer.copyright}</p>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {content.footer.links.map(link => (
                <a key={link} href="#" className="transition-colors duration-300 hover:text-foreground">
                  {link}
                </a>
              ))}
            </div>
          </footer>
        </div>
      </motion.main>
    </section>
  );
}
