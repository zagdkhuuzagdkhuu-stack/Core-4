import type { Dispatch, RefObject, SetStateAction } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Facebook, FileText, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react";
import {
  ORBIT_ANGLES,
  ORBIT_FEATURES,
  ORBIT_PARTICLES,
  ORBIT_RADII,
  REVEAL_ITEM,
  SECTION_REVEAL,
} from "../shared/constants";
import type { AppContent, FolderNavControls, HeaderTab } from "../shared/types";
import { HomeSimpleNav } from "./Navbar";

type InViewRef = {
  ref: RefObject<HTMLElement>;
  inView: boolean;
};

type HomePageProps = {
  content: AppContent;
  partners: string[];
  templates: string[];
  featuresRef: InViewRef;
  templateRef: InViewRef;
  uploadRef: InViewRef;
  footerRef: InViewRef;
  activeFeature: number;
  setActiveFeature: Dispatch<SetStateAction<number>>;
  circleTilt: number;
  setCircleTilt: Dispatch<SetStateAction<number>>;
  isDragging: boolean;
  setIsDragging: Dispatch<SetStateAction<boolean>>;
  onTabSelect: (tab: HeaderTab) => void;
  navControls: FolderNavControls;
  homeScrollRef: RefObject<HTMLDivElement>;
};

export function HomePage({
  content,
  partners: PARTNERS,
  templates: TEMPLATES,
  featuresRef,
  templateRef,
  uploadRef,
  footerRef,
  activeFeature,
  setActiveFeature,
  circleTilt,
  setCircleTilt,
  isDragging,
  setIsDragging,
  onTabSelect: handleTabSelect,
  navControls,
  homeScrollRef,
}: HomePageProps) {
  return (
    <>
      <HomeSimpleNav onSelect={handleTabSelect} controls={navControls} ui={content.ui} scrollContainerRef={homeScrollRef} />

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          PAGE 1 â€” HERO
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <motion.section
        className="draftly-hero-section relative min-h-screen overflow-hidden rounded-t-[2rem] bg-secondary px-3 pb-6 pt-3 shadow-[0_-18px_55px_rgba(0,0,0,0.10)] flex flex-col"
        variants={SECTION_REVEAL}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.16 }}
      >
        {/* Document body */}
        <motion.div
          className="draftly-hero-surface relative flex-1 bg-background border border-border rounded-[2rem] shadow-[0_12px_70px_rgba(0,0,0,0.07)] overflow-hidden flex flex-col"
        >
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-px w-[920px] max-w-[calc(100vw-1.5rem)] bg-background" />
          {/* Hero content */}
          <motion.div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12 md:py-14">
            <motion.h1
              className="font-display text-4xl md:text-[3.55rem] lg:text-[3.9rem] font-bold leading-[1.08] max-w-3xl text-foreground mb-7"
              variants={REVEAL_ITEM}
            >
              {content.hero.title}
            </motion.h1>

            <motion.div
              className="flex gap-3 mb-11"
              variants={REVEAL_ITEM}
            >
              <button className="flex min-w-[10rem] items-center justify-center gap-2 bg-button text-button-text px-8 py-3.5 rounded-full text-sm font-medium hover:opacity-85 active:scale-95 transition-all duration-200">
                {content.hero.primaryCta} <ArrowRight size={14} />
              </button>
              <button className="min-w-[10rem] px-8 py-3.5 rounded-full text-sm font-medium border border-border hover:bg-secondary active:scale-95 transition-all duration-200 text-foreground">
                {content.hero.secondaryCta}
              </button>
            </motion.div>

            {/* Partner logos */}
            <motion.div
              className="space-y-3 w-full max-w-lg"
              variants={REVEAL_ITEM}
            >
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {content.hero.partnerLabel}
              </p>
              <div className="overflow-hidden">
                <div className="animate-marquee gap-10">
                  {[...PARTNERS, ...PARTNERS].map((p, i) => (
                    <span
                      key={i}
                      className="shrink-0 text-sm font-medium text-muted-foreground/55 hover:text-muted-foreground transition-colors"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          PAGE 2 â€” WHAT DO WE DO?
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <motion.section
        className="draftly-solar-section relative min-h-screen overflow-hidden rounded-t-[2rem] bg-background py-16 shadow-[0_-18px_55px_rgba(0,0,0,0.12)] md:py-24"
        ref={featuresRef.ref}
        variants={SECTION_REVEAL}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.14 }}
      >
        <div
          className="flex min-h-[calc(100vh-9rem)] flex-col items-center gap-10 px-4 md:px-6 lg:flex-row lg:gap-0"
          onMouseMove={event => {
            const rect = event.currentTarget.getBoundingClientRect();
            const offset = (event.clientX - rect.left) / rect.width - 0.5;
            setCircleTilt(offset * 10);
          }}
          onMouseLeave={() => setCircleTilt(0)}
        >
          {/* â”€â”€ Circle carousel â”€â”€ */}
          <motion.div className="relative aspect-square w-[min(88vw,460px)] flex-shrink-0 lg:-ml-[2vw] lg:w-[41vw] lg:min-w-[390px] lg:max-w-[650px]" variants={REVEAL_ITEM}>

            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(207,157,123,0.10),transparent_48%)]" />

            {/* Subtle orbital field */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{ rotate: 360 + circleTilt }}
              transition={{ duration: 96, repeat: Infinity, ease: "linear" }}
            >
              {ORBIT_RADII.map((radius, index) => (
                <div
                  key={radius}
                  className={`absolute rounded-full border ${
                    index === activeFeature
                      ? "border-highlight/42 shadow-[0_0_28px_rgba(207,157,123,0.16)]"
                      : "border-accent/18"
                  }`}
                  style={{
                    inset: `${(100 - radius) / 2}%`,
                  }}
                />
              ))}
              <div className="absolute inset-[5%] rounded-full border border-highlight/12 shadow-[0_0_80px_rgba(207,157,123,0.12)]" />
              {ORBIT_PARTICLES.map((particle, index) => (
                <span
                  key={`${particle.left}-${particle.top}`}
                  className="absolute h-1 w-1 rounded-full bg-button/55 shadow-[0_0_12px_rgba(207,157,123,0.22)]"
                  style={{
                    left: particle.left,
                    top: particle.top,
                    opacity: 0.26 + (index % 4) * 0.08,
                  }}
                />
              ))}
            </motion.div>

            {/* Nodes */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{ rotate: 360 + circleTilt * 1.35 }}
              transition={{ duration: 118, repeat: Infinity, ease: "linear" }}
            >
              {ORBIT_FEATURES.map((feature, index) => {
                const isActive = index === activeFeature;
                const rad = (ORBIT_ANGLES[index] * Math.PI) / 180;
                const radius = ORBIT_RADII[index] / 2;
                const x = 50 + radius * Math.sin(rad);
                const y = 50 - radius * Math.cos(rad);

                return (
                  <motion.button
                    key={feature.num}
                    type="button"
                    className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border font-mono leading-none backdrop-blur-md transition-colors duration-500 ${
                      isActive
                        ? "h-16 w-16 border-highlight bg-secondary/88 text-2xl font-bold text-foreground shadow-[0_0_34px_rgba(207,157,123,0.42),inset_0_0_24px_rgba(207,157,123,0.08)]"
                        : "h-11 w-11 border-border/20 bg-card/26 text-sm font-semibold text-foreground/50 shadow-[0_12px_30px_rgba(0,0,0,0.22)] hover:border-accent/70 hover:text-foreground/80"
                    }`}
                    style={{ left: `${x}%`, top: `${y}%` }}
                    animate={{ scale: isActive ? 1.08 : 1, opacity: isActive ? 1 : 0.58 }}
                    transition={{ duration: 0.48, ease: "easeOut" }}
                    onClick={() => setActiveFeature(index)}
                    aria-label={`Show ${feature.title}`}
                  >
                    <motion.span
                      animate={{ rotate: -360 - circleTilt * 1.35 }}
                      transition={{ duration: 118, repeat: Infinity, ease: "linear" }}
                    >
                      {feature.num}
                    </motion.span>
                  </motion.button>
                );
              })}
            </motion.div>

            {/* Quiet center field */}
            <div className="pointer-events-none absolute inset-[30%] rounded-full border border-accent/22 bg-background/24 shadow-[inset_0_0_54px_rgba(0,0,0,0.22)]">
              <div className="absolute inset-[22%] rounded-full border border-border/20 bg-background/18" />
            </div>
          </motion.div>

          {/* â”€â”€ Feature content â”€â”€ */}
          <motion.div className="flex-1 px-2 text-center sm:px-6 lg:px-12 lg:text-left xl:pr-24" variants={REVEAL_ITEM}>
            <div className="mb-7 inline-flex rounded-full border border-highlight/24 bg-secondary px-5 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.18)] sm:px-7">
              <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl md:text-3xl">
                {content.featuresSectionTitle}
              </h2>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.45 }}
              >
                <p className="mb-5 font-mono text-sm text-highlight">
                  {ORBIT_FEATURES[activeFeature].num}
                </p>
                <h3 className="mb-7 font-display text-4xl font-bold leading-none text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                  {ORBIT_FEATURES[activeFeature].title}
                </h3>
                <p className="mx-auto max-w-sm text-base leading-relaxed text-foreground/68 sm:text-lg lg:mx-0">
                  {ORBIT_FEATURES[activeFeature].desc}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Progress indicators */}
            <div className="mt-9 flex gap-2">
              {ORBIT_FEATURES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveFeature(i)}
                  className={`h-0.5 rounded-full transition-all duration-500 ${
                    i === activeFeature
                      ? "w-10 bg-highlight"
                      : "w-2 bg-secondary/18 hover:bg-highlight/48"
                  }`}
                  aria-label={`Go to feature ${i + 1}`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          PAGE 3 â€” TEMPLATE FLOW
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <motion.section
        className="draftly-template-section relative min-h-screen overflow-hidden rounded-t-[2rem] bg-secondary py-16 shadow-[0_-18px_55px_rgba(0,0,0,0.12)] md:py-28"
        ref={templateRef.ref}
        variants={SECTION_REVEAL}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.16 }}
      >
        <div className="mx-auto flex w-full max-w-screen-xl flex-col-reverse items-center gap-10 px-4 sm:px-6 lg:flex-row lg:gap-16 lg:px-8 xl:gap-24">

          {/* â”€â”€ 3D screen card â”€â”€ */}
          <motion.div
            className="w-full max-w-[20rem] flex-shrink-0"
            variants={REVEAL_ITEM}
          >
            <div
              className="bg-secondary dark:bg-secondary rounded-3xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.13)] border border-border"
            >
              {/* Title bar */}
              <div className="bg-muted/50 dark:bg-card/50 px-5 py-3.5 flex items-center gap-2 border-b border-border/50">
                <div className="w-2.5 h-2.5 rounded-full bg-highlight" />
                <div className="w-2.5 h-2.5 rounded-full bg-border" />
                <div className="w-2.5 h-2.5 rounded-full bg-border/50" />
                <span className="ml-3 text-[11px] text-muted-foreground">{content.templateFlow.windowTitle}</span>
              </div>

              {/* Scrolling list */}
              <div className="h-[340px] overflow-hidden relative p-3">
                <div className="animate-scrollup space-y-2">
                  {[...TEMPLATES, ...TEMPLATES].map((t, i) => (
                    <div
                      key={i}
                      className="bg-background rounded-2xl px-4 py-3.5 flex items-center gap-3 border border-border/60"
                    >
                      <div className="w-8 h-8 rounded-xl bg-secondary dark:bg-background flex items-center justify-center flex-shrink-0">
                        <FileText size={13} className="text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground">{t}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{content.templateFlow.itemSubtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-secondary to-transparent pointer-events-none" />
              </div>
            </div>
          </motion.div>

          {/* â”€â”€ Text â”€â”€ */}
          <motion.div
            className="flex-1 text-center lg:text-left"
            variants={REVEAL_ITEM}
          >
            <h2 className="mb-6 font-display text-3xl font-bold leading-[1.15] text-foreground sm:text-4xl md:text-5xl">
              {content.templateFlow.titleLines.map((line, index) => (
                <span key={line}>
                  {line}
                  {index < content.templateFlow.titleLines.length - 1 && <br />}
                </span>
              ))}
            </h2>
            <p className="mx-auto mb-10 max-w-md text-base leading-relaxed text-muted-foreground lg:mx-0">
              {content.templateFlow.description}
            </p>
            <button className="flex min-w-[10rem] items-center justify-center gap-2 bg-foreground text-background px-7 py-3.5 rounded-full text-sm font-medium hover:opacity-85 active:scale-95 transition-all duration-200">
              {content.templateFlow.cta} <ArrowRight size={14} />
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          PAGE 4 â€” UPLOAD & ANALYSE
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <motion.section
        className="draftly-analysis-section relative min-h-screen overflow-hidden rounded-t-[2rem] bg-secondary py-16 shadow-[0_-18px_55px_rgba(0,0,0,0.12)] md:py-28"
        ref={uploadRef.ref}
        variants={SECTION_REVEAL}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.16 }}
      >
        <div className="mx-auto flex w-full max-w-screen-xl flex-col items-stretch gap-10 px-4 sm:px-6 lg:flex-row lg:items-start lg:gap-16 lg:px-8 xl:gap-24">

          {/* â”€â”€ Analysis labels â”€â”€ */}
          <div className="flex-1 pt-4">
            {content.upload.labels.map((text, i) => (
              <motion.div
                key={text}
                className="py-9 border-b border-border"
                variants={REVEAL_ITEM}
                transition={{ duration: 0.65, delay: i * 0.1, ease: "easeOut" }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
                    {text}
                  </h3>
                  <span className="font-mono text-sm text-muted-foreground/50">0{i + 1}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* â”€â”€ Upload card â”€â”€ */}
          <motion.div
            className="w-full max-w-sm self-center pt-2 lg:w-80 lg:self-auto lg:pt-4"
            variants={REVEAL_ITEM}
          >
            {/* Bouncing icon */}
            <motion.div
              className="w-14 h-14 bg-background border border-border rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm"
            >
              <FileText size={24} className="text-muted-foreground" />
            </motion.div>

            <div
              className={`relative bg-background border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-300 ${
                isDragging
                  ? "border-highlight bg-highlight/5 scale-[1.01]"
                  : "border-border"
              }`}
              onDragEnter={() => setIsDragging(true)}
              onDragLeave={() => setIsDragging(false)}
              onDragOver={e => e.preventDefault()}
              onDrop={() => setIsDragging(false)}
            >
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.16em] mb-4">
                {content.upload.eyebrow}
              </p>
              <h4 className="text-base font-semibold text-foreground mb-2">
                {content.upload.title}
              </h4>
              <p className="text-sm text-muted-foreground mb-7">
                {content.upload.description}
              </p>
              <button className="w-full bg-foreground text-background py-3.5 rounded-full text-sm font-medium hover:opacity-85 transition-opacity">
                {content.upload.cta}
              </button>

              {/* Accent line at bottom */}
              <div className="absolute bottom-0 left-6 right-6 h-px rounded-full bg-gradient-to-r from-transparent via-highlight to-transparent opacity-60" />
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          PAGE 5 â€” FOOTER
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <motion.footer
        className="draftly-footer-section relative z-10 mt-16 overflow-hidden rounded-t-[2rem] border-t border-border bg-secondary shadow-[0_-18px_55px_rgba(0,0,0,0.12)]"
        ref={footerRef.ref}
        variants={SECTION_REVEAL}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.16 }}
      >
        <div className="mx-auto max-w-screen-xl px-6 py-8 lg:px-8 lg:py-10">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4 md:gap-12">

            {/* Brand */}
            <motion.div className="space-y-5" variants={REVEAL_ITEM}>
              <div className="font-display text-2xl font-bold text-foreground">{content.brand}</div>
              <p className="text-sm text-muted-foreground">{content.footer.tagline}</p>
              <div className="flex gap-2">
                {[Twitter, Linkedin, Instagram, Facebook].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                  >
                      <Icon size={12} className="text-muted-foreground" />
                  </a>
                ))}
              </div>
              <p className="text-xs text-muted-foreground pt-2">{content.footer.copyright}</p>
            </motion.div>

            {/* Company */}
            <motion.div variants={REVEAL_ITEM}>
              <h6 className="text-sm font-semibold text-foreground mb-5">{content.footer.companyTitle}</h6>
              <ul className="space-y-3.5">
                {content.footer.companyLinks.map(l => (
                  <li key={l}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Contact */}
            <motion.div variants={REVEAL_ITEM}>
              <h6 className="text-sm font-semibold text-foreground mb-5">{content.footer.contactTitle}</h6>
              <ul className="space-y-4">
                <li className="flex items-start gap-2.5">
                  <MapPin size={12} className="text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">{content.footer.address}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone size={12} className="text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">{content.footer.phone}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail size={12} className="text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">{content.footer.email}</span>
                </li>
              </ul>
            </motion.div>

            {/* Additional */}
            <motion.div variants={REVEAL_ITEM}>
              <h6 className="text-sm font-semibold text-foreground mb-5">{content.footer.additionalTitle}</h6>
              <ul className="space-y-3.5">
                {content.footer.additionalLinks.map(l => (
                  <li key={l}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </motion.footer>
    </>
  );
}
