import React from "react";
import { Link, NavLink } from "react-router-dom";
import { FilePlus2, LayoutDashboard, Search, Upload } from "lucide-react";
import BackButton from "./BackButton.jsx";
import BrandLogo from "./BrandLogo.jsx";

const navItems = [
  { label: "Нүүр", to: "/", icon: LayoutDashboard },
  { label: "Үүсгэх", to: "/contracts/create", icon: FilePlus2 },
  { label: "Оруулах", to: "/contracts/upload", icon: Upload },
];

export default function AppShell({ children, eyebrow, title, description, action }) {
  return (
    <main className="min-h-screen bg-[#f6f5f1] text-black">
      <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-black/10 bg-[#f6f5f1]/88 px-8 backdrop-blur-md max-md:px-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <Link to="/" className="flex items-center gap-4">
            <BrandLogo />
            <span className="brand-wordmark text-2xl">DraftLy</span>
          </Link>
        </div>
        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map(({ label, to, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `app-nav-link ${isActive ? "app-nav-link-active" : ""}`}>
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden h-10 items-center gap-2 rounded-md border border-black/10 bg-white px-3 text-sm text-black/50 lg:flex">
            <Search size={15} />
            Гэрээ хайх
          </div>
          {action}
        </div>
      </header>

      <section className="px-8 py-8 max-md:px-4">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7 flex items-end justify-between gap-6 max-md:flex-col max-md:items-start">
            <div>
              {eyebrow && <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-black/48">{eyebrow}</p>}
              <h1 className="max-w-3xl font-serif text-[56px] leading-none max-md:text-[40px]">{title}</h1>
              {description && <p className="mt-5 max-w-2xl text-[16px] leading-7 text-black/58">{description}</p>}
            </div>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
