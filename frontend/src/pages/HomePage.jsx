import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ImageIcon, Play } from "lucide-react";
import BrandLogo from "../components/BrandLogo.jsx";

const logos = [
  "ANYA",
  "ZAGDAA",
  "TUYA",
  "UNDRAMM",
  "ANYA",
  "ZAGDAA",
  "TUYA",
  "OCHIROO",
];

const featureWords = [
  "Гэрээ шинжлэх",
  "Ажлын урсгал",
  "Баримт хадгалах",
  "Хуулийн судалгаа",
  "Хэлцэл удирдах",
  "Нарийвчилсан шалгалт",
  "Гэрээ боловсруулах",
];

const homepagePictures = {
  hero: {
    src: null,
    alt: "DraftLy гэрээ хянах ажлын орчин",
    label: "Ажлын орчны зураг",
  },
};

const walkthroughVideo = {
  src: null,
  poster: null,
  label: "Ашиглах зааврын бичлэг",
  title: "DraftLy ашиглах заавар",
};

const footerSections = [
  {
    title: "Платформ",
    links: [
      { label: "Гэрээ боловсруулах", href: "#" },
      { label: "Гэрээ шинжлэх", href: "#" },
      { label: "Эрсдэл илрүүлэх", href: "#" },
      { label: "Баримт бичиг удирдах", href: "#" },
    ],
  },
  {
    title: "Шийдэл",
    links: [
      { label: "Байгууллагад", href: "#" },
      { label: "Хуулийн багт", href: "#" },
      { label: "Стартапуудад", href: "#" },
    ],
  },
  {
    title: "Компани",
    links: [
      { label: "Бидний тухай", href: "#" },
      { label: "Аюулгүй байдал", href: "#" },
    ],
  },
  {
    title: "Холбоо барих",
    links: [
      { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61589540814058" },
      { label: "Instagram", href: "https://instagram.com" },
      { label: "YouTube", href: "https://youtube.com" },
    ],
  },
];

export default function HomePage() {
  const [isHero, setIsHero] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem("lexpilot_token")));
  const [activeFeature, setActiveFeature] = useState(3);

  useEffect(() => {
    const handleScroll = () => {
      setIsHero(window.scrollY < 800);
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
      ? "bg-black text-white " : "bg-black/20 text-black backdrop-blur-md"
  }`}
>
  {/* Logo */}
  <Link
    to="/"
    className={`brand-wordmark text-[34px] transition-colors duration-500 ${
      isHero ? "text-white" : "text-black"
    }`}
  >
    DraftLy.
  </Link>

  {/* Navbar Links */}
  <nav
    className={`flex min-w-0 justify-center gap-5 whitespace-nowrap text-[13px] font-semibold transition-colors duration-500 sm:gap-9 sm:text-[15px] ${
      isHero ? "text-white" : "text-black"
    }`}
  >
    <Link className="homepage-nav-link" to="/solution">
      Solution
    </Link>

    <Link className="homepage-nav-link" to="/contracts/create">
      Create New Contract
    </Link>

    <Link className="homepage-nav-link" to="/contracts/upload">
      Upload Existing Contract
    </Link>

    <div className="group">
  <Link
    type = "button"
    className="homepage-nav-link"
  >
    About
  </Link>

  <div className="cursor-pointer invisible fixed left-0 top-[78px] z-40 w-screen translate-y-2 bg-black/70 backdrop-blur-xl text-white opacity-0 transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
    <div className="grid min-h-[520px] grid-cols-2 gap-20 border-t border-white/10 px-16 py-20">
      <div>
        <h3 className="mb-4 text-[14px] font-semibold text-white">
          Company
        </h3>
        <p className="max-w-[360px] text-[14px] leading-7 text-white/75">
          DraftLy-ийн тухай, платформын зорилго болон хөгжүүлэлтийн мэдээлэл.
        </p>
      </div>

      <div>
        <h3 className="mb-4 text-[14px] font-semibold text-white">
          Newsroom
        </h3>
        <p className="max-w-[380px] text-[14px] leading-7 text-white/75">
          Платформын шинэчлэлт, мэдээ болон хөгжүүлэлтийн мэдээлэл.
        </p>
      </div>
    </div>
  </div>
</div>
    
  </nav>

  {/* Right side */}
  <div className="flex items-center justify-end gap-5">
    <Link
      to="/login"
      className={`inline-flex h-[42px] items-center gap-2 rounded-md border px-4 text-[15px] font-semibold transition-all duration-500 ${
        isHero
          ? "border-white text-white hover:bg-white hover:text-black"
          : "border-black text-black hover:bg-black hover:text-white"
      }`}
    >
      Нэвтрэх
    </Link>
  </div>
</header>

      <section className="relative grid min-h-[620px] grid-cols-[0.88fr_1.12fr] items-center gap-20 overflow-hidden bg-gradient-to-b from-black to-[#111111] px-16 pb-14 pt-12 text-white max-lg:grid-cols-1">
        <LayeredSineWaveBackground />

        <div className="relative z-10 max-w-[560px]">
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
              Үнэгүй эхлэх
            </Link>
            <a href="#overview" className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity duration-500 hover:opacity-60">
              Дэлгэрэнгүй <ArrowRight size={16} />
            </a>
          </div>
        </div>

        <div className="relative z-10 flex justify-end">
          <PictureSlot picture={homepagePictures.hero} className="picture-slot-hero" />
        </div>
      </section>

      <section className="logo-marquee-section">
        <p className="logo-marquee-label">
          Итгэл хүлээсэн
          <br />
          байгууллагууд
        </p>
        <div className="logo-marquee-track" aria-label="Хамтрагч байгууллагууд">
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
            <span> ажлын хурд болон үр ашгийг нэмэгдүүлэх зорилготой орчин үеийн шийдэл юм. </span>
          </h2>
        </div>

        <VideoSlot video={walkthroughVideo} />
      </section>

      <section className="feature-slider-section">
        <div>
          <p className="feature-kicker">Хуулийн багууд DraftLy-г ашигладаг чиглэлүүд</p>
        </div>

        <div className="feature-word-window" aria-label="Платформын боломжууд">
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

        <button className="feature-action">Платформ үзэх</button>
      </section>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <Link to="/" className="site-footer-logo" aria-label="DraftLy нүүр хуудас">
            <BrandLogo size="xl" />
          </Link>

          <nav className="site-footer-grid" aria-label="Доод цэс">
            {footerSections.map((section) => (
              <div key={section.title} className="site-footer-column">
                <h2>{section.title}</h2>
                <ul>
                  {section.links.map((item) => (
                    <li key={item.label}>
                      <a href={item.href}>{item.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </footer>
    </main>
  );
}

function LayeredSineWaveBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const ctx = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let time = 0;
    let frameId = 0;

    const bands = [
      { freq: 0.008, speed: 0.3, y: 0.35, color: [83, 210, 170] },
      { freq: 0.011, speed: 0.5, y: 0.45, color: [130, 80, 220] },
      { freq: 0.007, speed: 0.2, y: 0.55, color: [60, 160, 255] },
    ];

    const resizeCanvas = () => {
      const scale = window.devicePixelRatio || 1;
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.floor(width * scale);
      canvas.height = Math.floor(height * scale);
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      bands.forEach((band) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, height);

        gradient.addColorStop(0, "transparent");
        gradient.addColorStop(0.4, `rgba(${band.color.join(",")},0.12)`);
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.beginPath();

        for (let x = 0; x <= width; x += 3) {
          const wave =
            Math.sin(x * band.freq + time * band.speed) * 80 +
            Math.sin(x * band.freq * 1.7 + time * band.speed * 0.7) * 40;
          const y = height * band.y + wave;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();
      });

      time += 0.02;
      frameId = requestAnimationFrame(draw);
    };

    resizeCanvas();
    draw();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-100"
      aria-hidden="true"
    />
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
          <button className="video-play" aria-label="Зааврын бичлэг тоглуулах" type="button">
            <Play size={22} fill="currentColor" />
          </button>
        </div>
      )}
    </div>
  );
}
