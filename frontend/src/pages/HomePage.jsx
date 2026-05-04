import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, Play, X } from "lucide-react";

const logos = [
  "ANYA",
  "ZAGDAA",
  "OCHROO",
  "UNDRAMM",
  "ANYA",
  "ZAGDAA",
  "OCHROO",
  "UNDRAMM",
];

const featureWords = [
  "Fund Formation",
  "Contract Analysis",
  "Complex Workflows",
  "Document Storage",
  "Legal Research",
  "Deal Management",
  "Due Diligence",
  "Fund Formation",
  "Contract Analysis",
  "Complex Workflows",
];

export default function HomePage() {
  const [isHero, setIsHero] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsHero(window.scrollY < 120);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="relative flex h-11 items-center justify-center bg-[#0d0d0c] px-8 text-sm text-white">
        <p className="font-medium">
          AI contract automation for fast-moving legal teams.
          <span className="ml-4 underline underline-offset-4">Learn more</span>
        </p>
        <button className="absolute right-8 top-1/2 -translate-y-1/2 text-white/80 hover:text-white">
          <X size={17} />
        </button>
      </div>

      <header
        className={`sticky top-0 z-50 flex h-20 items-center justify-between px-12 transition-all duration-500 ease-in-out ${
          isHero
            ? "bg-black text-white border-none"
            : "bg-[#FAFAF9]/78 text-black backdrop-blur-md border-b border-black/5"
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`grid h-12 w-12 place-items-center rounded-full transition-colors duration-500 ${
              isHero ? "bg-white text-black" : "bg-black text-white"
            }`}
          >
            <ArrowRight size={20} className="-rotate-45" />
          </div>
          <span className="text-lg font-medium">LexPilot</span>
        </div>

        <nav className="hidden items-center gap-12 text-[15px] font-medium lg:flex">
          <a href="#">Platform</a>
          <a className="flex items-center gap-1" href="#">
            Solutions <ChevronDown size={15} />
          </a>
          <a href="#">Customers</a>
          <a className="flex items-center gap-1" href="#">
            Resources <ChevronDown size={15} />
          </a>
          <a className="flex items-center gap-1" href="#">
            Company <ChevronDown size={15} />
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className={`rounded-lg border px-4 py-2 text-xs font-medium transition-all duration-500 ${
              isHero
                ? "border-white/40 text-white hover:bg-white hover:text-black"
                : "border-black text-black hover:bg-black hover:text-white"
            }`}
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className={`rounded-lg px-5 py-2 text-xs font-medium transition-all duration-500 ${
              isHero
                ? "bg-white text-black hover:bg-white/85"
                : "bg-black text-white hover:bg-black/85"
            }`}
          >
            Request a Demo
          </Link>
        </div>
      </header>

      <section className="grid min-h-[620px] grid-cols-[0.88fr_1.12fr] items-center gap-20 bg-gradient-to-b from-black to-[#111111] px-16 pb-14 pt-12 text-white max-lg:grid-cols-1">
        <div className="max-w-[590px]">
          <h1 className="font-serif text-[88px] leading-[0.98] text-white max-md:text-[56px]">
            Legal work,
            <br />
            accelerated by
            <br />
            intelligent AI.
          </h1>
          <p className="mt-9 max-w-[470px] text-[17px] leading-8 text-white/70">
            Create, review, analyze, and manage contracts from one secure workspace built for modern legal teams.
          </p>
          <div className="mt-9 flex items-center gap-8">
            <Link to="/register" className="rounded-lg bg-white px-8 py-4 text-sm font-semibold text-black hover:bg-white/85">
              Start free reviews
            </Link>
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity duration-500 hover:opacity-60">
              Learn more <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div className="flex justify-end">
          <div className="hero-product-shell">
            <div className="hero-document">
              <div className="doc-toolbar" />
              <p className="doc-title">Subject: Summary of Contract Risk Assessment</p>
              {Array.from({ length: 11 }).map((_, index) => (
                <span key={index} className="doc-line" style={{ width: `${78 - (index % 4) * 8}%` }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="logo-marquee-section">
        <p className="logo-marquee-label">
          Trusted by leading
          <br />
          organizations
        </p>
        <div className="logo-marquee-track" aria-label="Partner logos">
          <div className="logo-marquee-content">
            {[...logos, ...logos, ...logos].map((logo, index) => (
              <span key={`${logo}-${index}`}>{logo}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="video-showcase">
        <div className="video-copy">
          <h2>
            LexPilot is AI designed for legal and professional services.
            <span> Advance your expertise on a secure platform that lets you focus on high-value work.</span>
          </h2>
        </div>

        <div className="video-frame">
          <div className="video-paper">
            <div className="video-toolbar" />
            <p className="video-subject">Subject: Summary of Complaint and Initial Defense Assessment</p>
            {Array.from({ length: 14 }).map((_, index) => (
              <span key={index} className="video-line" style={{ width: `${86 - (index % 5) * 7}%` }} />
            ))}
          </div>
          <button className="video-play" aria-label="Play video">
            <Play size={22} fill="currentColor" />
          </button>
        </div>
      </section>

      <section className="feature-slider-section">
        <div>
          <p className="feature-kicker">The top legal teams use LexPilot for</p>
        </div>

        <div className="feature-word-window" aria-label="Legal platform capabilities">
          <div className="feature-word-stack">
            {featureWords.map((item, index) => (
              <span key={`${item}-${index}`}>{item}</span>
            ))}
          </div>
        </div>

        <button className="feature-action">Explore Platform</button>
      </section>

      <section className="px-16 pb-16">
        <div className="flex items-center justify-between rounded-xl border border-black/15 bg-[#FAFAF9] px-8 py-7 max-md:flex-col max-md:items-start max-md:gap-6">
          <div>
            <h3 className="text-lg font-semibold">Turn contract work into a calm, searchable workflow.</h3>
            <p className="mt-1 text-sm text-black/60">Draft, review, and analyze documents without leaving your workspace.</p>
          </div>
          <Link to="/register" className="rounded-md bg-black px-7 py-4 text-sm font-semibold text-white hover:bg-black/85">
            Start free reviews
          </Link>
        </div>
      </section>
    </main>
  );
}
