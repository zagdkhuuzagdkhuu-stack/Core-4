import React, { useState } from "react";
import { AlertTriangle, Check, FileText, Upload } from "lucide-react";
import AppShell from "../components/AppShell.jsx";

const extractedItems = [
  ["Parties", "Altai Growth Partners, North Square Properties"],
  ["Key dates", "Effective May 15, 2026. Expires May 14, 2027."],
  ["Obligations", "Monthly payment, maintenance reporting, notice requirements."],
  ["Risks", "Repair duty and late payment language need review."],
];

export default function UploadContract() {
  const [fileName, setFileName] = useState("");

  return (
    <AppShell
      eyebrow="Upload Existing Contract"
      title="Turn a signed or draft file into structured contract intelligence."
      description="Upload a PDF, DOCX, or Word document. The backend will extract parties, dates, clauses, obligations, and risk signals for review."
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="surface-panel p-6">
          <label className="upload-drop">
            <Upload size={26} />
            <span className="text-lg font-semibold">{fileName || "Drop contract file here"}</span>
            <span className="text-sm text-black/50">PDF, DOCX, or Word document</span>
            <input
              className="sr-only"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(event) => setFileName(event.target.files?.[0]?.name || "")}
            />
          </label>

          <div className="mt-6 grid gap-3">
            {["AI extracting data", "AI analyzing clauses", "Human review before saving"].map((item, index) => (
              <div key={item} className="workflow-row">
                <span className="workflow-index">{index + 1}</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="surface-panel p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-black/42">Extraction Preview</p>
              <h2 className="mt-2 text-2xl font-semibold">Ready for review</h2>
            </div>
            <span className="risk-pill risk-pill-medium">58 risk</span>
          </div>

          <div className="grid gap-3">
            {extractedItems.map(([label, value]) => (
              <article key={label} className="compact-card">
                <FileText size={17} />
                <div>
                  <h3>{label}</h3>
                  <p>{value}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <button className="primary-button">
              <Check size={16} />
              Accept
            </button>
            <button className="secondary-button">Correct Data</button>
            <button className="secondary-button">
              <AlertTriangle size={16} />
              Compare
            </button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
