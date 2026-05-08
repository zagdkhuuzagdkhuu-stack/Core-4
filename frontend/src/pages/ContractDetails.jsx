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
      action={<button className="primary-button hidden sm:inline-flex"><Download size={16} /> Татах</button>}
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="surface-panel p-7">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-black/42">Бүтэн гэрээ</p>
              <h2 className="mt-2 text-2xl font-semibold">Ноорог урьдчилан харах</h2>
            </div>
            <span className="status-chip">{contract.status}</span>
          </div>
          <div className="contract-paper">
            <h3>{contract.title}</h3>
            <p>
              Энэхүү гэрээ нь DraftLy ажлын орчин болон {contract.party} хооронд байгуулагдсан. Талууд хавсралтад дурдсан ажлын хүрээ, төлбөрийн нөхцөл, нууцлалын үүрэг болон үйл ажиллагааны үүргийг зөвшөөрнө.
            </p>
            <p>
              Гэрээ {contract.date}-нд эхэлнэ. Төлбөр, сунгалт, цуцлалт, хариуцлага болон маргааны нөхцөлийг батлахаас өмнө хуулийн эцсийн хяналт шаардлагатай.
            </p>
            <p>
              Гарын үсэг зурах эсвэл төлбөр боловсруулахын өмнө AI хяналтын онцолсон эрсдэлийг хариуцсан хэрэглэгч баталгаажуулна.
            </p>
          </div>
        </section>

        <aside className="grid gap-6">
          <section className="surface-panel p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-black/42">Эрсдэлийн шинжилгээ</p>
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
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-black/42">Үйлдлүүд</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button className="secondary-button"><FilePenLine size={16} /> Засах</button>
              <button className="secondary-button"><Copy size={16} /> Хуулах</button>
              <button className="secondary-button"><RefreshCw size={16} /> Сунгах</button>
              <button className="danger-button"><Trash2 size={16} /> Устгах</button>
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
