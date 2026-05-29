import { motion } from "motion/react";
import { BookOpen, ExternalLink, FileText, Globe2, Landmark, Scale } from "lucide-react";
import type { AppContent, FolderNavControls, HeaderTab, UiContent } from "../shared/types";

type InformationContent = AppContent["information"];

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
    <section className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <motion.div
          className="relative mb-8 overflow-hidden rounded-xl border border-border bg-card px-6 py-16 text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-muted">
            <Landmark size={24} className="text-accent" />
          </div>
          <h1 className="text-4xl font-bold text-foreground md:text-5xl">
            {content.hero.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            {content.hero.subtitle}
          </p>
        </motion.div>

        <motion.div
          className="mb-7 rounded-xl border border-border bg-card p-5 sm:p-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div className="grid gap-4 lg:grid-cols-4">
            {content.constitutions.map((item, index) => (
              <motion.article
                key={`${item.year}-${item.title}`}
                className="flex flex-col rounded-xl border border-border bg-muted p-5 text-center transition-all hover:border-accent/50"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card">
                  <Scale size={20} className="text-accent" />
                </div>
                <p className="mt-4 text-3xl font-bold text-foreground">{item.year}</p>
                <h2 className="mt-2 text-base font-semibold text-foreground">{item.title}</h2>
                <p className="mt-3 flex-1 text-xs leading-5 text-muted-foreground">{item.description}</p>
                <dl className="mt-5 space-y-3 rounded-lg border border-border bg-card/70 p-4 text-left">
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-xs font-medium text-muted-foreground">{item.whenLabel}</dt>
                    <dd className="text-right text-xs font-bold text-foreground">{item.whenValue}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-xs font-medium text-muted-foreground">{item.sizeLabel}</dt>
                    <dd className="text-right text-xs font-bold text-foreground">{item.sizeValue}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-xs font-medium text-muted-foreground">{item.governanceLabel}</dt>
                    <dd className="max-w-[58%] text-right text-xs font-bold leading-5 text-foreground">{item.governanceValue}</dd>
                  </div>
                </dl>
              </motion.article>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="mb-8 grid gap-6 rounded-xl border border-border bg-card p-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:p-7"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-foreground">{content.sources.title}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{content.sources.subtitle}</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {content.sources.items.map((source, index) => (
              <motion.a
                key={source.name}
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-4 rounded-lg border border-border bg-muted p-4 text-left transition-all hover:border-accent/50"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground">
                  {index % 2 === 0 ? <Globe2 size={18} /> : <FileText size={18} />}
                </span>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground">{source.name}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{source.description}</span>
                </span>
                <ExternalLink size={16} className="shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
              </motion.a>
            ))}
          </div>
        </motion.div>

        <footer className="mt-auto flex flex-col gap-3 border-t border-border py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>{content.footer.copyright}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {content.footer.links.map(link => (
              <a key={link} href="#" className="transition-colors hover:text-foreground">{link}</a>
            ))}
          </div>
        </footer>
      </div>
    </section>
  );
}
