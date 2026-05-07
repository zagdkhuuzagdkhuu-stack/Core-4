import React from "react";
import { useParams } from "react-router-dom";
import { Copy, Download, FilePenLine, RefreshCw, Trash2 } from "lucide-react";
import AppShell from "../components/AppShell.jsx";
import { contracts } from "../data/mockContracts.js";

export default function ContractDetails() {
  const { id } = useParams();
  const contract = contracts.find((item) => item.id === id) || contracts[0];

  return (
    <AppShell
      eyebrow={contract.type}
      title={contract.title}
      description={contract.summary}
      action={<button className="primary-button hidden sm:inline-flex"><Download size={16} /> Download</button>}
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="surface-panel p-7">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-black/42">Full Contract</p>
              <h2 className="mt-2 text-2xl font-semibold">Draft preview</h2>
            </div>
            <span className="status-chip">{contract.status}</span>
          </div>
          <div className="contract-paper">
            <h3>{contract.title}</h3>
            <p>
              This agreement is made between DraftLy Workspace and {contract.party}. The parties agree to the scope,
              payment terms, confidentiality duties, and operational obligations described in the attached schedule.
            </p>
            <p>
              The contract begins on {contract.date}. Payment, renewal, termination, liability, and dispute terms remain
              subject to final legal review before approval.
            </p>
            <p>
              AI review highlights should be confirmed by the responsible user before signature or payment processing.
            </p>
          </div>
        </section>

        <aside className="grid gap-6">
          <section className="surface-panel p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-black/42">Risk Analysis</p>
            <div className="mt-4 flex items-end gap-3">
              <span className="font-serif text-7xl leading-none">{contract.riskScore}</span>
              <span className="pb-3 text-sm font-semibold text-black/50">/ 100</span>
            </div>
            <div className="mt-5 grid gap-3">
              {contract.risks.map((risk) => (
                <div key={risk} className="risk-row">{risk}</div>
              ))}
            </div>
          </section>

          <section className="surface-panel p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-black/42">Actions</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button className="secondary-button"><FilePenLine size={16} /> Edit</button>
              <button className="secondary-button"><Copy size={16} /> Duplicate</button>
              <button className="secondary-button"><RefreshCw size={16} /> Renew</button>
              <button className="danger-button"><Trash2 size={16} /> Delete</button>
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
