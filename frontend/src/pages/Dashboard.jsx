import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FilePlus2, Search, Upload } from "lucide-react";
import AppShell from "../components/AppShell.jsx";
import { contracts } from "../data/mockContracts.js";

const filters = ["Бүгд", "Ноорог", "Хянах", "Батлагдсан", "Гарын үсэгтэй"];

export default function Dashboard() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Бүгд");

  const visibleContracts = useMemo(() => {
    return contracts.filter((contract) => {
      const matchesFilter = filter === "Бүгд" || contract.status === filter;
      const text = `${contract.title} ${contract.party} ${contract.type} ${contract.status}`.toLowerCase();
      return matchesFilter && text.includes(query.toLowerCase());
    });
  }, [filter, query]);

  return (
    <AppShell
      eyebrow="Хянах самбар"
      title="Гэрээ үүсгэх, хянах, удирдах ажлаа нэг тайван орчноос."
      description="Шинэ гэрээ үүсгэж, байгаа файлаа AI-аар шинжлүүлж, гэрээний бүх мэдээллээс хайлт хийнэ."
      action={<Link className="primary-button" to="/contracts/create"><FilePlus2 size={16} /> Шинэ</Link>}
    >
      <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
        <section className="grid gap-6">
          <div className="surface-panel dark-panel p-7">
            <p className="text-sm font-semibold text-white/62">Үнэгүй хяналтын санал</p>
            <h2 className="mt-4 font-serif text-5xl leading-none text-white">3 гэрээний хяналт үнэгүй.</h2>
            <p className="mt-5 leading-7 text-white/62">
              Эхний гурван гэрээгээ оруулж эсвэл үүсгээд AI хураангуй, дутуу заалтын шалгалт, эрсдэлийн дохио аваарай.
            </p>
            <div className="mt-7 flex gap-3">
              <Link className="light-button" to="/contracts/upload"><Upload size={16} /> Оруулах</Link>
              <Link className="ghost-light-button" to="/contracts/create">Ноорог үүсгэх</Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {[
              ["Ноорог", "4", "Бэлтгэж буй гэрээнүүд"],
              ["Хянагдаж буй", "2", "Хуулийн анхаарал шаардлагатай"],
              ["Батлагдсан", "12", "Гарын үсэг эсвэл төлбөрт бэлэн"],
            ].map(([label, value, hint]) => (
              <article key={label} className="metric-card">
                <span>{label}</span>
                <strong>{value}</strong>
                <p>{hint}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="surface-panel p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div className="search-field">
              <Search size={17} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Нэр, тал, төрөл, огноо эсвэл төлөвөөр хайх"
              />
            </div>
            <div className="segmented-control">
              {filters.map((item) => (
                <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            {visibleContracts.map((contract) => (
              <Link key={contract.id} to={`/contracts/${contract.id}`} className="contract-list-item">
                <div>
                  <h3>{contract.title}</h3>
                  <p>{contract.party} · {contract.type} · {contract.date}</p>
                </div>
                <div className="text-right">
                  <span className="status-chip">{contract.status}</span>
                  <p className="mt-2 text-sm font-semibold text-black/54">Эрсдэл {contract.riskScore}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
