import React, { useState } from "react";
import { Bot, CheckCircle2, FileText, Plus, Wand2 } from "lucide-react";
import AppShell from "../components/AppShell.jsx";

const contractTypes = [
  "Үйлчилгээний гэрээ",
  "Нууцлалын гэрээ",
  "Түрээсийн гэрээ",
  "Хөдөлмөрийн гэрээ",
  "Нийлүүлэгчийн гэрээ",
];

const clauses = ["Нууцлал", "Цуцлалт", "Төлбөрийн үе шат", "Өгөгдөл хамгаалалт"];

export default function CreateContract() {
  const [selectedType, setSelectedType] = useState(contractTypes[0]);

  return (
    <AppShell
      eyebrow="Шинэ гэрээ үүсгэх"
      title="Гэрээний үндсэн мэдээллийг оруулаад AI нооргоо хянаарай."
      description="Энэ хэсэг одоогоор frontend загвар боловч талбар бүр гэрээ, баримт, загвар, эрсдэлийн шинжилгээний системийн өгөгдөлтэй холбогдохоор бүтээгдсэн."
    >
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="surface-panel p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-black/42">Гэрээний төрөл</p>
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
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-black/42">Тусгай заалтууд</p>
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
                Гэрээний нэр
                <input placeholder="Үйлчилгээний гэрээ - BrightPath" />
              </label>
              <label className="field-label">
                Нөгөө тал
                <input placeholder="Компани эсвэл хүний нэр" />
              </label>
              <label className="field-label">
                Эхлэх огноо
                <input type="date" />
              </label>
              <label className="field-label">
                Дуусах огноо
                <input type="date" />
              </label>
              <label className="field-label md:col-span-2">
                Төлбөрийн нөхцөл
                <input placeholder="Жишээ: 50% урьдчилгаа, 50% гүйцэтгэлийн дараа" />
              </label>
              <label className="field-label md:col-span-2">
                Ажлын хүрээ ба үүрэг
                <textarea rows="5" placeholder="Гүйцэтгэх ажил, үүрэг, хугацаа, хүлээн авах шалгуурыг бичнэ үү." />
              </label>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button className="primary-button" type="button"><Wand2 size={16} /> Ноорог үүсгэх</button>
              <button className="secondary-button" type="button">Ноорог хадгалах</button>
            </div>
          </form>

          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="surface-panel p-6">
              <div className="mb-4 flex items-center gap-3">
                <Bot size={18} />
                <h2 className="text-xl font-semibold">AI ноорог орчин</h2>
              </div>
              <div className="contract-paper compact">
                <h3>{selectedType}</h3>
                <p>Үйлчилгээ үзүүлэгч нь хэрэглэгчийн оруулсан ажлын хүрээ, төлбөрийн хуваарь болон тусгай заалтын дагуу ажлаа гүйцэтгэнэ.</p>
                <p>Талууд батлах, төлөх, файл гаргах эсвэл гарын үсэг зурахаас өмнө эрсдэлийн дүгнэлтийг хянана.</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button className="secondary-button">Дахин бичих</button>
                <button className="secondary-button">Энгийн болгох</button>
                <button className="secondary-button">Заалт тайлбарлах</button>
              </div>
            </div>

            <div className="surface-panel p-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-black/42">AI эрсдэлийн шинжилгээ</p>
              <div className="mt-5 grid gap-3">
                {["Хариуцлагын хязгаарлалт дутуу", "Төлбөрийн хугацаа тодорхой", "Нийцлийн шалгалт хүлээгдэж байна"].map((item, index) => (
                  <div key={item} className="risk-row">
                    <CheckCircle2 size={16} className={index === 0 ? "text-[#9d4b28]" : "text-black/60"} />
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-md bg-black p-5 text-white">
                <p className="text-sm text-white/58">Тооцоолсон гэрээний дүн</p>
                <strong className="mt-2 block text-2xl">MNT 18,000,000</strong>
              </div>
              <div className="mt-5 grid gap-3">
                <button className="primary-button">Батлаад үргэлжлүүлэх</button>
                <button className="secondary-button">Засаж дахин илгээх</button>
                <button className="danger-button">Ноорог устгах</button>
              </div>
            </div>
          </section>
        </section>
      </div>
    </AppShell>
  );
}
