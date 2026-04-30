import React, { useEffect, useState } from "react";
import { ArrowRight, ChevronDown, Image, Plus, X } from "lucide-react";

const logos = ["LOGO", "LOGO", "LOGO", "LOGO", "LOGO", "LOGO", "LOGO"];
const features = [
  "Contract Analysis",
  "Due Diligence",
  "Deal Management",
  "Document Automation",
  "Knowledge Management",
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
    <main className="min-h-screen bg-white/5 border border-black/10 text-[#000000]">
      {/* Announcement */}
      <div className="relative flex h-11 items-center justify-center bg-[#0d0d0c] px-8 text-sm text-white">
        <p className="font-medium">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. <span className="ml-4 underline underline-offset-4">Learn more</span>
        </p>
        <button className="absolute right-8 top-1/2 -translate-y-1/2 text-white/80 hover:text-white">
          <X size={17} />
        </button>
      </div>

      {/* Navbar */}
        <header
  className={`sticky top-0 z-50 flex h-20 items-center justify-between px-12 
  transition-all duration-500 ease-in-out backdrop-blur-xl border-b ${
    isHero
      ? "bg-black text-white border-white/10"
      : "bg-[#FAFAF9] text-black border-black/10"
  }`}
>
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-black text-white">
            <ArrowRight size={20} className="-rotate-45" />
          </div>
          <span className="text-lg font-medium transition-colors duration-500 ease-in-out">
  Lorem Ipsum
</span>
        </div>

        <nav className="hidden items-center gap-12 text-[15px] font-medium lg:flex">
          <a className="transition-colors duration-500 ease-in-out" href="#">
  Platform
</a>
          <a className="flex items-center gap-1 transition-colors duration-500 ease-in-out" href="#">Solutions <ChevronDown size={15} /></a>
          <a className="transition-colors duration-500 ease-in-out" href="#">Customers</a>
          <a className="flex items-center gap-1 transition-colors duration-500 ease-in-out" href="#">Resources <ChevronDown size={15} /></a>
          <a className="flex items-center gap-1 transition-colors duration-500 ease-in-out" href="#">Company <ChevronDown size={15} /></a>
        </nav>

        <div className="flex items-center gap-4">
          <button
          className="transition-all duration-700 ease-in-out"
  className={`rounded-lg border px-4 py-2 text-xs font-medium transition ${
    isHero
      ? "border-white/40 text-white hover:bg-white hover:text-black"
      : "border-black text-black hover:bg-black hover:text-white"
  }`}
>
  Sign in
</button>
          <button
          className="transition-all duration-700 ease-in-out"
  className={`rounded-lg px-5 py-2 text-xs font-semibold transition ${
    isHero
      ? "bg-white text-black hover:bg-white/85"
      : "bg-black text-white hover:bg-black/85"
  }`}
>
  Request a Demo
</button>
        </div>
      </header>

      {/* Hero */}
      <section className="grid min-h-[620px] grid-cols-[0.88fr_1.12fr] items-center gap-20 px-16 pb-14 pt-12 bg-gradient-to-b from-black to-[#111111] text-white">
        <div className="max-w-[560px]">
          <h1 className="font-serif text-[88px] leading-[0.98] tracking-[-0.055em] text-white">
            Lorem ipsum<br />
            dolor sit amet,<br />
            consectetur<br />
            adipiscing elit.
          </h1>
          <p className="mt-9 max-w-[470px] text-[17px] leading-8 text-white/7">
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.
          </p>
          <div className="mt-9 flex items-center gap-8">
            <button className="rounded-lg bg-black px-8 py-4 text-sm font-semibold text-white hover:bg-black/85 text-white">
              Request a Demo
            </button>
            <button className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity duration-500 ease-in-out hover:opacity-60">
              Learn more <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <div className="grid h-[475px] w-full max-w-[650px] place-items-center rounded-xl bg-[#FAFAF9] shadow-[inset_0_0_80px_rgba(0,0,0,0.04)]">
            <div className="grid h-16 w-16 place-items-center rounded-lg border border-black/15 text-black/35">
              <Image size={34} />
            </div>
          </div>
        </div>
      </section>

      {/* Logo Strip */}
      <section className="flex h-28 items-center gap-14 bg-[#FAFAF9]/55 px-16">
        <p className="w-48 text-[12px] font-semibold uppercase leading-5 tracking-[0.12em] text-black/80">
          Trusted by leading<br />organizations
        </p>
        <div className="grid flex-1 grid-cols-7 items-center gap-10 text-center font-serif text-3xl font-semibold text-black/70">
          {logos.map((logo, index) => (
            <span key={index}>{logo}</span>
          ))}
        </div>
      </section>

      {/* Platform Preview Section */}
      <section className="grid grid-cols-[0.75fr_1.25fr] gap-24 px-16 py-24">
        <div className="pt-6">
          <h2 className="max-w-[410px] font-serif text-[46px] leading-[1.05] tracking-[-0.035em]">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </h2>
          <p className="mt-7 max-w-[430px] text-[16px] leading-8 text-black/65">
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.
          </p>
          <button className="mt-9 inline-flex items-center gap-2 text-sm font-semibold hover:opacity-60">
            Explore Platform <ArrowRight size={16} />
          </button>
        </div>

        <div className="rounded-xl border border-black/15 bg-[#FAFAF9] p-0 shadow-[0_20px_80px_rgba(0,0,0,0.05)]">
          <div className="grid h-[390px] grid-cols-[130px_1fr] overflow-hidden rounded-xl">
            <aside className="border-r border-black/15 bg-[#FAFAF9]/40 p-8">
              <div className="mb-9 grid h-7 w-7 place-items-center rounded-md bg-black text-white">
                <ArrowRight size={14} className="-rotate-45" />
              </div>
              <div className="space-y-6">
                {Array.from({ length: 7 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded border border-black/20" />
                    <div className="h-1.5 w-10 rounded-full bg-black/18" />
                  </div>
                ))}
              </div>
            </aside>

            <div className="p-8">
              <div className="mb-7 flex items-center justify-between">
                <div className="h-2 w-48 rounded-full bg-black/10" />
                <div className="h-2 w-24 rounded-full bg-black/8" />
              </div>
              <div className="space-y-5">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="rounded-lg border border-black/15 bg-white/45 p-7">
                    <div className="h-2.5 w-56 rounded-full bg-black/18" />
                    <div className="mt-4 h-2 w-80 rounded-full bg-black/10" />
                    <div className="mt-3 h-2 w-64 rounded-full bg-black/10" />
                    <div className="float-right -mt-10 h-8 w-20 rounded-full bg-black/7" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature List */}
      <section className="grid grid-cols-[0.6fr_1.4fr] gap-24 px-16 pb-24">
        <div className="flex gap-8 pt-4">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.22em]">Built for legal work</p>
            <p className="mt-8 max-w-[220px] text-[16px] leading-7">The all-in-one workspace for modern legal teams.</p>
          </div>
          <div className="mt-2 h-px w-24 bg-black/25" />
        </div>

        <div>
          {features.map((item, index) => (
            <button key={item} className="flex w-full items-center justify-between border-b border-black/15 py-5 text-left">
              <span className={`font-serif text-[42px] leading-none tracking-[-0.035em] ${index === 0 ? "text-black" : "text-black/42"}`}>
                {item}
              </span>
              <Plus size={22} />
            </button>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-16 pb-16">
        <div className="flex items-center justify-between rounded-xl border border-black/15 bg-[#FAFAF9] px-8 py-7">
          <div className="flex items-center gap-6">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white shadow-sm">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-black text-white">
                <ArrowRight size={16} className="-rotate-45" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</h3>
              <p className="mt-1 text-sm text-black/60">Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.</p>
            </div>
          </div>
          <button className="rounded-md bg-black px-7 py-4 text-sm font-semibold text-white hover:bg-black/85">
            Request a Demo
          </button>
        </div>
      </section>
    </main>
  );
}
