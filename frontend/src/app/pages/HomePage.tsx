import type { Dispatch, RefObject, SetStateAction } from "react";
import { motion } from "motion/react";
import { ArrowRight, FileText, Shield, BarChart3, Search, Download, Smartphone, Users, Building2, ScrollText } from "lucide-react";
import type { AppContent, FolderNavControls, HeaderTab } from "../shared/types";

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

const FEATURES = [
  { icon: Search, title: "Contract Analysis", desc: "AI-powered review that identifies risks, missing clauses, and compliance issues in seconds." },
  { icon: FileText, title: "Template Generation", desc: "Generate professional legal documents from smart templates tailored to your needs." },
  { icon: Shield, title: "Risk Detection", desc: "Advanced algorithms detect risky terms, inconsistent wording, and potential liabilities." },
  { icon: BarChart3, title: "Smart Analytics", desc: "Get detailed insights with risk scores, compliance metrics, and actionable recommendations." },
  { icon: Download, title: "Export & Share", desc: "Download contracts as PDF, DOCX, or share securely with your team." },
  { icon: Smartphone, title: "Mobile Ready", desc: "Access and review your documents from anywhere, on any device." },
];

const STATS = [
  { value: "50K+", label: "Documents Analyzed" },
  { value: "10K+", label: "Active Users" },
  { value: "98%", label: "Accuracy Rate" },
  { value: "150+", label: "Countries" },
];

const CUSTOMER_LOGOS = [
  "Vinson & Elkins", "Reed Smith", "CMS", "Dentons", "BakerHostetler",
  "Macfarlanes", "Gleiss Lutz", "Cuatrecasas", "A&O Shearman", "PwC UK",
];

const DEPLOY_MARKER = "purple-draftly-2026-05-28";

export function HomePage({
  content,
  partners: _PARTNERS,
  templates: _TEMPLATES,
  featuresRef: _featuresRef,
  templateRef: _templateRef,
  uploadRef: _uploadRef,
  footerRef: _footerRef,
  activeFeature: _activeFeature,
  setActiveFeature: _setActiveFeature,
  circleTilt: _circleTilt,
  setCircleTilt: _setCircleTilt,
  isDragging: _isDragging,
  setIsDragging: _setIsDragging,
  onTabSelect: handleTabSelect,
  navControls: _navControls,
  homeScrollRef: _homeScrollRef,
}: HomePageProps) {
  return (
    <>
      {/* Hero Section */}
      <section data-deploy-marker={DEPLOY_MARKER} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0A0A0A]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.15),transparent_50%),radial-gradient(ellipse_at_bottom,rgba(124,58,237,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.08),transparent_40%)]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#2A2A2A] bg-[#141414] px-4 py-1.5">
              <span className="h-2 w-2 rounded-full bg-[#7C3AED]" />
              <span className="text-xs font-medium text-gray-400">AI-Powered Legal Intelligence</span>
            </div>
          </motion.div>

          <motion.h1
            className="mb-6 text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          >
            Practice Made
            <br />
            <span className="bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] bg-clip-text text-transparent">Perfect</span>
          </motion.h1>

          <motion.p
            className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-gray-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            Today's law firms and in-house legal teams trust Draftly to elevate their craft,
            <br className="hidden sm:block" />
            streamline contract review, and navigate complexity with confidence.
          </motion.p>

          <motion.div
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          >
            <button
              type="button"
              onClick={() => handleTabSelect("Analysis")}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-sm font-semibold text-black transition-all duration-200 hover:bg-gray-200"
            >
              {content.hero.primaryCta} <ArrowRight size={16} />
            </button>
            <button
              type="button"
              onClick={() => handleTabSelect("Template")}
              className="inline-flex items-center gap-2 rounded-lg border border-[#2A2A2A] px-8 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/5"
            >
              {content.hero.secondaryCta}
            </button>
          </motion.div>
        </div>

        {/* Customer logos */}
        <motion.div
          className="absolute bottom-12 left-0 right-0 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <p className="mb-4 text-center text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
            {content.hero.partnerLabel}
          </p>
          <div className="overflow-hidden">
            <div className="animate-marquee flex items-center gap-16 px-8">
              {[...CUSTOMER_LOGOS, ...CUSTOMER_LOGOS].map((name, i) => (
                <span
                  key={i}
                  className="shrink-0 text-sm font-medium text-gray-600"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-[#1F1F1F] bg-[#0A0A0A] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-2 gap-8 md:grid-cols-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-bold text-white sm:text-5xl">{stat.value}</p>
                <p className="mt-2 text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-[#0A0A0A] py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Everything you need to
              <br />
              manage legal documents
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-400">
              AI-powered tools designed for legal professionals to work faster, smarter, and with greater precision.
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  className="group rounded-xl border border-[#1F1F1F] bg-[#141414] p-6 transition-all duration-300 hover:border-[#7C3AED]/50 hover:bg-[#1A1A1A]"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#7C3AED]/10 text-[#7C3AED]">
                    <Icon size={24} />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-400">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="border-t border-[#1F1F1F] bg-[#0A0A0A] py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-[#7C3AED]/10">
              <Users size={28} className="text-[#7C3AED]" />
            </div>
            <blockquote className="mb-8 text-2xl leading-relaxed text-gray-300 sm:text-3xl">
              "Draftly has transformed how we review contracts. The AI-powered analysis
              catches issues we would have missed and saves our team hours of manual review."
            </blockquote>
            <div>
              <p className="font-semibold text-white">Sarah Chen</p>
              <p className="text-sm text-gray-400">General Counsel, TechCorp International</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#0A0A0A] py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="relative overflow-hidden rounded-2xl border border-[#1F1F1F] bg-gradient-to-br from-[#141414] to-[#1A1A1A] p-12 text-center sm:p-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.08),transparent_60%)]" />
            <div className="relative z-10">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[#7C3AED]/10">
                <ScrollText size={28} className="text-[#7C3AED]" />
              </div>
              <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
                {content.upload.title}
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-gray-400">
                {content.upload.description}
              </p>
              <button
                type="button"
                onClick={() => handleTabSelect("Analysis")}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-sm font-semibold text-black transition-all duration-200 hover:bg-gray-200"
              >
                {content.upload.cta} <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1F1F1F] bg-[#0A0A0A] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-4 text-xl font-bold text-white">Draftly.</div>
              <p className="text-sm leading-relaxed text-gray-400">
                {content.footer.tagline}
              </p>
            </div>
            <div>
              <h6 className="mb-4 text-sm font-semibold text-white">{content.footer.companyTitle}</h6>
              <ul className="space-y-3">
                {content.footer.companyLinks.map(l => (
                  <li key={l}>
                    <a href="#" className="text-sm text-gray-400 transition-colors hover:text-white">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h6 className="mb-4 text-sm font-semibold text-white">{content.footer.contactTitle}</h6>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm text-gray-400">
                  <Building2 size={14} />
                  <span>{content.footer.address}</span>
                </li>
              </ul>
            </div>
            <div>
              <h6 className="mb-4 text-sm font-semibold text-white">{content.footer.additionalTitle}</h6>
              <ul className="space-y-3">
                {content.footer.additionalLinks.map(l => (
                  <li key={l}>
                    <a href="#" className="text-sm text-gray-400 transition-colors hover:text-white">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-[#1F1F1F] pt-8 text-center text-sm text-gray-500">
            {content.footer.copyright}
          </div>
        </div>
      </footer>
    </>
  );
}
