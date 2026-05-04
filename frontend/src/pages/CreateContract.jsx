import React, { useState } from "react";
import { Bot, CheckCircle2, FileText, Plus, Wand2 } from "lucide-react";
import AppShell from "../components/AppShell.jsx";

const contractTypes = ["Service Agreement", "NDA", "Lease", "Employment", "Vendor Agreement"];
const clauses = ["Confidentiality", "Termination", "Payment milestones", "Data protection"];

export default function CreateContract() {
  const [selectedType, setSelectedType] = useState(contractTypes[0]);

  return (
    <AppShell
      eyebrow="Create New Contract"
      title="Guide the AI with the facts, then review the draft before approval."
      description="This screen is frontend-only for now, but every field maps cleanly to contract, document, template, and risk-analysis backend data."
    >
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="surface-panel p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-black/42">Contract Type</p>
          <div className="mt-4 grid gap-2">
            {contractTypes.map((type) => (
              <button
                key={type}
                className={`type-option ${selectedType === type ? "type-option-active" : ""}`}
                onClick={() => setSelectedType(type)}
              >
                <FileText size={17} />
                {type}
              </button>
            ))}
          </div>

          <div className="mt-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-black/42">Special Clauses</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {clauses.map((clause) => (
                <button key={clause} className="clause-chip">
                  <Plus size={14} />
                  {clause}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6">
          <form className="surface-panel p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="field-label">
                Contract title
                <input placeholder="Service Agreement - BrightPath" />
              </label>
              <label className="field-label">
                Counterparty
                <input placeholder="Company or person name" />
              </label>
              <label className="field-label">
                Effective date
                <input type="date" />
              </label>
              <label className="field-label">
                Expiry date
                <input type="date" />
              </label>
              <label className="field-label md:col-span-2">
                Payment terms
                <input placeholder="Example: 50% upfront, 50% after delivery" />
              </label>
              <label className="field-label md:col-span-2">
                Scope and obligations
                <textarea rows="5" placeholder="Describe deliverables, responsibilities, deadlines, and acceptance criteria." />
              </label>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button className="primary-button" type="button"><Wand2 size={16} /> Generate Draft</button>
              <button className="secondary-button" type="button">Save as Draft</button>
            </div>
          </form>

          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="surface-panel p-6">
              <div className="mb-4 flex items-center gap-3">
                <Bot size={18} />
                <h2 className="text-xl font-semibold">AI draft workspace</h2>
              </div>
              <div className="contract-paper compact">
                <h3>{selectedType}</h3>
                <p>The provider shall deliver the agreed services according to the scope, payment schedule, and special clauses supplied by the user.</p>
                <p>The parties shall review risk findings before approval, payment, export, or signature.</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button className="secondary-button">Rewrite</button>
                <button className="secondary-button">Simplify</button>
                <button className="secondary-button">Explain Clause</button>
              </div>
            </div>

            <div className="surface-panel p-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-black/42">AI Risk Analysis</p>
              <div className="mt-5 grid gap-3">
                {["Missing limitation of liability", "Payment timing is clear", "Compliance check pending"].map((item, index) => (
                  <div key={item} className="risk-row">
                    <CheckCircle2 size={16} className={index === 0 ? "text-[#9d4b28]" : "text-black/60"} />
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-md bg-black p-5 text-white">
                <p className="text-sm text-white/58">Estimated contract cost</p>
                <strong className="mt-2 block text-2xl">MNT 18,000,000</strong>
              </div>
              <div className="mt-5 grid gap-3">
                <button className="primary-button">Approve and Continue</button>
                <button className="secondary-button">Edit and Resubmit</button>
                <button className="danger-button">Delete Draft</button>
              </div>
            </div>
          </section>
        </section>
      </div>
    </AppShell>
  );
}
