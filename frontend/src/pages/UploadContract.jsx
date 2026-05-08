import React, { useState } from "react";
import { AlertTriangle, Check, FileText, Upload } from "lucide-react";
import AppShell from "../components/AppShell.jsx";

const extractedItems = [
  ["Талууд", "Altai Growth Partners, North Square Properties"],
  ["Гол огноо", "2026-05-15-нд эхэлж, 2027-05-14-нд дуусна."],
  ["Үүрэг", "Сарын төлбөр, засвар үйлчилгээний тайлан, мэдэгдлийн шаардлага."],
  ["Эрсдэл", "Засварын үүрэг болон хугацаа хэтрэлтийн нөхцөлийг хянах шаардлагатай."],
];

export default function UploadContract() {
  const [fileName, setFileName] = useState("");

  return (
    <AppShell
      eyebrow="Одоо байгаа гэрээ оруулах"
      title="Гарын үсэг зурсан эсвэл ноорог файлыг бүтэцтэй гэрээний мэдээлэл болго."
      description="PDF, DOCX эсвэл Word файл оруулна уу. Систем талууд, огноо, заалт, үүрэг болон эрсдэлийн дохиог гаргана."
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="surface-panel p-6">
          <label className="upload-drop">
            <Upload size={26} />
            <span className="text-lg font-semibold">{fileName || "Гэрээний файлаа энд оруулна уу"}</span>
            <span className="text-sm text-black/50">PDF, DOCX эсвэл Word файл</span>
            <input
              className="sr-only"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(event) => setFileName(event.target.files?.[0]?.name || "")}
            />
          </label>

          <div className="mt-6 grid gap-3">
            {["AI өгөгдөл гаргаж байна", "AI заалтуудыг шинжилж байна", "Хадгалахаас өмнө хүн хянана"].map((item, index) => (
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
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-black/42">Мэдээлэл танилт</p>
              <h2 className="mt-2 text-2xl font-semibold">Хянахад бэлэн</h2>
            </div>
            <span className="risk-pill risk-pill-medium">58 эрсдэл</span>
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
              Зөвшөөрөх
            </button>
            <button className="secondary-button">Засах</button>
            <button className="secondary-button">
              <AlertTriangle size={16} />
              Харьцуулах
            </button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
