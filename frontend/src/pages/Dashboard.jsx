import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FilePlus2, Search, Upload } from "lucide-react";
import AppShell from "../components/AppShell.jsx";
import { contracts } from "../data/mockContracts.js";

const filters = ["All", "Draft", "Review", "Approved", "Signed"];

export default function Dashboard() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const visibleContracts = useMemo(() => {
    return contracts.filter((contract) => {
      const matchesFilter = filter === "All" || contract.status === filter;
      const text = `${contract.title} ${contract.party} ${contract.type} ${contract.status}`.toLowerCase();
      return matchesFilter && text.includes(query.toLowerCase());
    });
  }, [filter, query]);

  return (
    <AppShell
      eyebrow="Dashboard"
      title="Create, review, and manage contracts from one calm workspace."
      description="Start a new contract, upload an existing file for AI review, or search across your contract lifecycle."
      action={<Link className="primary-button" to="/contracts/create"><FilePlus2 size={16} /> New</Link>}
    >
      <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
        <section className="grid gap-6">
          <div className="surface-panel dark-panel p-7">
            <p className="text-sm font-semibold text-white/62">Free review offer</p>
            <h2 className="mt-4 font-serif text-5xl leading-none text-white">3 contract reviews on us.</h2>
            <p className="mt-5 leading-7 text-white/62">
              Upload or create your first three contracts and get AI summaries, missing clause checks, and risk flags.
            </p>
            <div className="mt-7 flex gap-3">
              <Link className="light-button" to="/contracts/upload"><Upload size={16} /> Upload</Link>
              <Link className="ghost-light-button" to="/contracts/create">Create draft</Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {[
              ["Drafts", "4", "Contracts being prepared"],
              ["In review", "2", "Need legal attention"],
              ["Approved", "12", "Ready for signature or payment"],
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
                placeholder="Search by title, party, type, date, or status"
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
                  <p className="mt-2 text-sm font-semibold text-black/54">Risk {contract.riskScore}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
