import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ImageIcon, Play } from "lucide-react";


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
  "Contract Analysis",
  "Complex Workflows",
  "Document Storage",
  "Legal Research",
  "Deal Management",
  "Due Diligence",
  "Fund Formation",
];

const homepagePictures = {
  hero: {
    src: null,
    alt: "DraftLy contract review workspace",
    label: "Draft workspace image",
  },
};

const walkthroughVideo = {
  src: null,
  poster: null,
  label: "How-to walkthrough video",
  title: "How to use DraftLy",
};

export default function HomePage() {
  const [isHero, setIsHero] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem("lexpilot_token")));
  const [activeFeature, setActiveFeature] = useState(3);

  useEffect(() => {
    const handleScroll = () => {
      setIsHero(window.scrollY < 120);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const syncAuth = () => setIsLoggedIn(Boolean(localStorage.getItem("lexpilot_token")));

    window.addEventListener("storage", syncAuth);
    window.addEventListener("focus", syncAuth);
    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("focus", syncAuth);
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveFeature((current) => (current + 1) % featureWords.length);
    }, 1800);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-white text-black">
      <header
        className={`sticky top-0 z-50 grid h-[78px] grid-cols-[auto_1fr_auto] items-center gap-8 px-11 transition-all duration-500 ease-in-out ${
          isHero
            ? "bg-[#090806] text-white border-none"
            : "bg-[#FAFAF9]/78 text-black backdrop-blur-md border-b border-black/5"
        }`}
      >
        <Link to="/" className="brand-wordmark text-[34px]">
          DraftLy
        </Link>

        <nav
          className={`flex min-w-0 justify-center gap-5 whitespace-nowrap text-[13px] font-semibold transition-colors duration-500 sm:gap-9 sm:text-[15px] ${
            isHero ? "text-white" : "text-black"
          }`}
        >
          <Link className="homepage-nav-link" to="/contracts/create">
            Create new Contract
          </Link>
          <Link className="homepage-nav-link" to="/contracts/upload">
            Upload existing Contract
          </Link>
        </nav>

        <div className="flex items-center justify-end gap-5">
          <Link
            to="/login"
            className={`inline-flex h-[42px] items-center gap-2 rounded-md border px-4 text-[15px] font-semibold transition-all duration-500 ${
              isHero
                ? "border-white text-white hover:bg-white hover:text-black"
                : "border-black text-black hover:bg-black hover:text-white"
            }`}
          >
            Login
          </Link>
          <Link
            to="/register"
            className={`hidden h-[42px] items-center rounded-md px-4 text-[15px] font-semibold transition-all duration-500 sm:inline-flex ${
              isHero
                ? "bg-white text-black hover:bg-white/86"
                : "bg-black text-white hover:bg-black/82"
            }`}
          >
            Request a Demo
          </Link>
        </div>
      </header>

      <section className="grid min-h-[620px] grid-cols-[0.88fr_1.12fr] items-center gap-20 bg-gradient-to-b from-black to-[#111111] px-16 pb-14 pt-12 text-white max-lg:grid-cols-1">
        <div className="max-w-[560px]">
          <h1 className="font-serif text-[clamp(30px,3.1vw,44px)] leading-[1.2] text-white max-md:text-[28px]">
            <span className="block">Хиймэл оюунд суурилсан</span>
            <span className="block">гэрээ, баримт бичиг</span>
            <span className="block">боловсруулах</span>
            <span className="block">автоматжуулалтын систем.</span>
          </h1>
          <p className="mt-6 max-w-[500px] text-[15px] leading-[1.75] text-white/72 max-md:text-[14px] max-md:leading-6">
            Шинэ гэрээ боловсруулах, одоо байгаа гэрээг шинжлэх, эрсдэл илрүүлэх, заалтуудыг тайлбарлах зэрэг үйлдлүүдийг нэг дороос хялбар удирдах боломжийг олгоно.
          </p>
          <div className="mt-9 flex items-center gap-8">
            <Link to={isLoggedIn ? "/contracts/upload" : "/login"} className="rounded-lg bg-white px-8 py-4 text-sm font-semibold text-black hover:bg-white/85">
              Start free reviews
            </Link>
            <a href="#overview" className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity duration-500 hover:opacity-60">
              Learn more <ArrowRight size={16} />
            </a>
          </div>
        </div>

        <div className="flex justify-end">
          <PictureSlot
            picture={homepagePictures.hero}
            className="picture-slot-hero"
          />
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

      <section id="overview" className="video-showcase">
        <div className="video-copy">
          <h2>
            Манай платформ нь гэрээ, баримт бичиг боловсруулах, хянах, удирдах үйл явцыг хиймэл оюуны тусламжтайгаар автоматжуулж,
            <span> ажлын хурд болон үр ашигийг нэмэгдүүлэх зорилготой орчин үеийн шийдэл юм. </span>
          </h2>
        </div>

        <VideoSlot video={walkthroughVideo} />
      </section>

      <section className="feature-slider-section">
        <div>
          <p className="feature-kicker">The top legal teams use DraftLy for</p>
        </div>

        <div className="feature-word-window" aria-label="Legal platform capabilities">
          <div className="feature-word-stack">
            {featureWords.map((item, index) => {
              let offset = index - activeFeature;
              const half = Math.floor(featureWords.length / 2);

              if (offset > half) {
                offset -= featureWords.length;
              }

              if (offset < -half) {
                offset += featureWords.length;
              }

              const distance = Math.abs(offset);
              const tone = distance === 0 ? "active" : distance === 1 ? "near" : distance === 2 ? "mid" : "far";

              return (
                <span
                  key={item}
                  className={`feature-word feature-word-${tone}`}
                  style={{ "--feature-offset": offset }}
                >
                  {item}
                </span>
              );
            })}
          </div>
        </div>

        <button className="feature-action">Explore Platform</button>
      </section>

    </main>
  );
}

function PictureSlot({ picture, className = "" }) {
  return (
    <figure className={`picture-slot ${className}`}>
      {picture.src ? (
        <img src={picture.src} alt={picture.alt} />
      ) : (
        <div className="picture-placeholder" aria-label={picture.alt}>
          <ImageIcon size={34} />
          <span>{picture.label}</span>
        </div>
      )}
    </figure>
  );
}

function VideoSlot({ video }) {
  return (
    <div className="picture-stage">
      {video.src ? (
        <video
          className="picture-slot picture-slot-overview"
          controls
          poster={video.poster || undefined}
          preload="metadata"
          title={video.title}
        >
          <source src={video.src} />
        </video>
      ) : (
        <div className="picture-slot picture-slot-overview">
          <div className="picture-placeholder video-placeholder" aria-label={video.title}>
            <ImageIcon size={34} />
            <span>{video.label}</span>
          </div>
          <button className="video-play" aria-label="Play walkthrough video" type="button">
            <Play size={22} fill="currentColor" />
          </button>
        </div>
      )}
    </div>
  );
}
