import { useState, type Dispatch, type RefObject, type SetStateAction } from "react";
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
  { icon: Search, title: "Гэрээний анализ", desc: "AI-д суурилсан хяналт нь эрсдэл, дутуу заалт, нийцлийн асуудлуудыг секундэд илрүүлнэ." },
  { icon: FileText, title: "Загвар үүсгэх", desc: "Таны хэрэгцээнд тохирсон ухаалаг загвараас мэргэжлийн хуулийн баримт бичиг үүсгэнэ." },
  { icon: Shield, title: "Эрсдэл илрүүлэх", desc: "Дэвшилтэт алгоритмууд эрсдэлтэй нэр томьёо, зөрчилтэй найруулга, болзошгүй хариуцлагыг илрүүлнэ." },
  { icon: BarChart3, title: "Ухаалаг аналитик", desc: "Эрсдэлийн оноо, нийцлийн үзүүлэлт, зөвлөмж бүхий дэлгэрэнгүй мэдээллийг авах." },
  { icon: Download, title: "Экспорт & Хуваалцах", desc: "Гэрээг PDF, DOCX хэлбэрээр татах эсвэл багтайгаа аюулгүй хуваалцах." },
  { icon: Smartphone, title: "Мобайл бэлэн", desc: "Дурын төхөөрөмжөөс баримтаа нээж, хянах." },
];

function getStoredCount(key: string, fallback: number): number {
  try { return Number(localStorage.getItem(key)) || fallback; } catch { return fallback; }
}

const CUSTOMER_LOGOS = [
  "legalinfo.mn", "nli.gov.mn", "lawforum.parliament.mn", "e-geree.mn",
  "legalinfo.mn", "nli.gov.mn", "lawforum.parliament.mn", "e-geree.mn",
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
  navControls,
  homeScrollRef: _homeScrollRef,
}: HomePageProps) {
  const [docCount] = useState(() => Math.max(10, getStoredCount("draftly_docs_analyzed", 10)));
  const [userCount] = useState(() => Math.max(4, getStoredCount("draftly_active_users", 4)));

  return (
    <>
      {/* Hero Section */}
      <section data-deploy-marker={DEPLOY_MARKER} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0A0A0A]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15),transparent_50%),radial-gradient(ellipse_at_bottom,rgba(59,130,246,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.08),transparent_40%)]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#1F1F1F] bg-[#141414] px-4 py-1.5">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <span className="text-xs font-medium text-gray-400">AI-д суурилсан хуулийн оюун ухаан</span>
            </div>
          </motion.div>

          <motion.h1
            className="mb-6 text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          >
            Smarter Contracts.
            <br />
            <span className="bg-gradient-to-r from-accent to-[#60A5FA] bg-clip-text text-transparent">Faster Business</span>
          </motion.h1>

          <motion.p
            className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-gray-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            Draftly-д итгэж, өндөр чанартай хуулийн үйлчилгээг хүргэж,
            <br className="hidden sm:block" />
            гэрээний хяналтыг хялбарчилж, итгэлтэйгээр ажиллаарай.
          </motion.p>

          <motion.div
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          >
            <button
              type="button"
              onClick={() => navControls.isAuthenticated ? handleTabSelect("Analysis") : navControls.onLoginClick()}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-sm font-semibold text-black transition-all duration-200 hover:bg-gray-200"
            >
              {content.hero.primaryCta} <ArrowRight size={16} />
            </button>
            <button
              type="button"
              onClick={() => navControls.isAuthenticated ? handleTabSelect("Template") : navControls.onLoginClick()}
              className="inline-flex items-center gap-2 rounded-lg border border-[#1F1F1F] px-8 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/5"
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
          <p className="mb-4 text-center text-xs font-medium uppercase tracking-[0.2em] text-gray-400">
            {content.hero.partnerLabel}
          </p>
          <div className="overflow-hidden">
            <div className="animate-marquee flex items-center gap-16 px-8">
              {[...CUSTOMER_LOGOS, ...CUSTOMER_LOGOS].map((name, i) => (
                <span
                  key={i}
                  className="shrink-0 text-sm font-medium text-gray-400"
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
            {[
              { value: docCount.toLocaleString() + "+", label: "Анализ хийгдсэн баримт" },
              { value: userCount.toLocaleString() + "+", label: "Идэвхтэй хэрэглэгч" },
              { value: "94%", label: "Нарийвчлал" },
              { value: "Монгол", label: "Улс" },
            ].map((stat) => (
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
              Хэрэгтэй бүхэн
              <br />
              хуулийн баримт бичгийг удирдах
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-400">
              Хуулийн мэргэжилтнүүдэд зориулсан AI-д суурилсан хэрэгслүүд.
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  className="group rounded-xl border border-[#1F1F1F] bg-[#141414] p-6 transition-all duration-300 hover:border-accent/50 hover:bg-[#1A1A1A]"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
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
            <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
              <Users size={28} className="text-accent" />
            </div>
            <blockquote className="mb-8 text-2xl leading-relaxed text-gray-300 sm:text-3xl">
              "Draftly нь гэрээний хяналтыг бүрэн өөрчилсөн. AI-анализ нь бидний анзааралгүй өнгөрөөх
              асуудлуудыг илрүүлж, багийнхаа цагийг хэмнэж байна."
            </blockquote>
            <div>
              <p className="font-semibold text-white">Сарантуяа</p>
              <p className="text-sm text-gray-400">Ерөнхий зөвлөх, TechCorp International</p>
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
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.08),transparent_60%)]" />
            <div className="relative z-10">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10">
                <ScrollText size={28} className="text-accent" />
              </div>
              <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
                {content.upload.title}
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-gray-400">
                {content.upload.description}
              </p>
              <button
                type="button"
                onClick={() => navControls.isAuthenticated ? handleTabSelect("Analysis") : navControls.onLoginClick()}
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
          <div className="mt-12 border-t border-[#1F1F1F] pt-8 text-center text-sm text-gray-400">
            {content.footer.copyright}
          </div>
        </div>
      </footer>
    </>
  );
}
