import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  Clock,
  Copy,
  Download,
  FileCheck2,
  FileSearch,
  FileText,
  Gavel,
  History,
  Lock,
  Mail,
  Plus,
  RefreshCcw,
  Search,
  ShieldAlert,
  Sparkles,
  Trash2,
  Upload,
  Wand2,
  X,
} from "lucide-react";

const contracts = [
  {
    title: "Software Service Agreement",
    party: "MonPay LLC",
    type: "Service Contract",
    date: "2026-04-21",
    status: "Approved",
    score: 88,
  },
  {
    title: "NDA for Vendor Access",
    party: "BlueTech Asia",
    type: "NDA",
    date: "2026-04-18",
    status: "Review Needed",
    score: 63,
  },
  {
    title: "Employment Contract",
    party: "New Hire Batch Q2",
    type: "Employment",
    date: "2026-04-12",
    status: "Draft",
    score: 74,
  },
];

const contractTypes = [
  "Service Agreement",
  "NDA",
  "Employment Contract",
  "Sales Contract",
  "Lease Agreement",
  "Partnership Agreement",
];

function App() {
  const [screen, setScreen] = useState("landing");
  const [activeFlow, setActiveFlow] = useState("dashboard");
  const [search, setSearch] = useState("");

  const filteredContracts = useMemo(() => {
    return contracts.filter((item) =>
      `${item.title} ${item.party} ${item.type} ${item.date} ${item.status}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search]);

  if (screen === "login") return <LoginPage onLogin={() => setScreen("app")} />;
  if (screen === "landing") return <LandingPage onLogin={() => setScreen("login")} />;

  return (
    <div className="min-h-screen bg-[#f6f3ed] text-[#151515]">
      <Header
        activeFlow={activeFlow}
        setActiveFlow={setActiveFlow}
        search={search}
        setSearch={setSearch}
      />
      <main className="mx-auto max-w-7xl px-8 py-8">
        {activeFlow === "dashboard" && <Dashboard setActiveFlow={setActiveFlow} />}
        {activeFlow === "create" && <CreateContractFlow />}
        {activeFlow === "upload" && <UploadContractFlow />}
        {activeFlow === "search" && <SearchManageFlow filteredContracts={filteredContracts} />}
      </main>
    </div>
  );
}

function LandingPage({ onLogin }) {
  return (
    <div className="min-h-screen bg-[#0f0f0d] text-[#f7f3e8]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
        <Logo light />
        <button
          onClick={onLogin}
          className="rounded-full border border-white/20 px-5 py-2 text-sm hover:bg-white hover:text-black"
        >
          Login
        </button>
      </nav>

      <section className="mx-auto grid max-w-7xl grid-cols-[1.05fr_0.95fr] gap-10 px-8 pb-20 pt-16">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/70">
            <Sparkles size={16} /> AI-Based Contract & Document Automation
          </div>
          <h1 className="max-w-4xl text-7xl font-semibold leading-[0.96] tracking-[-0.055em]">
            Build, review, and manage contracts with AI.
          </h1>
          <p className="mt-8 max-w-2xl text-xl leading-8 text-white/62">
            Create new agreements, analyze existing contracts, detect risky clauses,
            and manage your legal documents from one secure desktop workspace.
          </p>
          <div className="mt-10 flex gap-3">
            <button
              onClick={onLogin}
              className="rounded-full bg-[#f4efe2] px-7 py-3 font-medium text-black hover:bg-white"
            >
              Get started <ArrowRight className="ml-2 inline" size={17} />
            </button>
            <button className="rounded-full border border-white/18 px-7 py-3 font-medium text-white/80 hover:bg-white/8">
              Review 3 contracts free
            </button>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/12 bg-[#171713] p-5 shadow-2xl">
          <div className="rounded-[1.5rem] bg-[#f6f3ed] p-5 text-black">
            <div className="flex items-center justify-between border-b border-black/10 pb-4">
              <div>
                <p className="text-sm text-black/50">Risk analysis</p>
                <h3 className="text-xl font-semibold">Vendor Service Agreement</h3>
              </div>
              <span className="rounded-full bg-black px-3 py-1 text-xs text-white">Analyzed</span>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              <Metric label="Risk score" value="72%" />
              <Metric label="Missing clauses" value="4" />
              <Metric label="Estimated cost" value="₮12.5M" />
            </div>
            <div className="mt-6 space-y-3">
              <RiskRow icon={<ShieldAlert size={17} />} title="Payment term is unclear" level="High" />
              <RiskRow icon={<FileSearch size={17} />} title="Termination clause missing" level="Medium" />
              <RiskRow icon={<Gavel size={17} />} title="Compliance warning found" level="Medium" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function LoginPage({ onLogin }) {
  return (
    <div className="grid min-h-screen grid-cols-[0.9fr_1.1fr] bg-[#0f0f0d] text-white">
      <div className="flex flex-col justify-between p-10">
        <Logo light />
        <div>
          <h1 className="text-6xl font-semibold leading-none tracking-[-0.05em]">
            Secure legal AI for modern teams.
          </h1>
          <p className="mt-6 max-w-md text-lg text-white/55">
            Desktop-only workspace for contract generation, review, approval, and document intelligence.
          </p>
        </div>
      </div>
      <div className="m-5 flex items-center justify-center rounded-[2rem] bg-[#f6f3ed] text-black">
        <div className="w-full max-w-md rounded-[1.75rem] bg-white p-8 shadow-xl">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">Welcome back</h2>
          <p className="mt-2 text-black/50">Choose a login method to continue.</p>
          <div className="mt-8 space-y-3">
            <LoginButton icon={<Mail size={18} />} label="Sign up with Gmail" onClick={onLogin} />
            <LoginButton icon={<Lock size={18} />} label="Login with email" onClick={onLogin} />
            <LoginButton icon={<Building2 size={18} />} label="Enter through company SSO" onClick={onLogin} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Header({ activeFlow, setActiveFlow, search, setSearch }) {
  return (
    <header className="sticky top-0 z-10 border-b border-black/10 bg-[#f6f3ed]/90 px-8 py-5 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-5">
        <button onClick={() => setActiveFlow("dashboard")}>
          <Logo />
        </button>
        <div className="ml-auto flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-black/5">
          <Search size={17} className="text-black/40" />
          <input
            value={search}
            onFocus={() => setActiveFlow("search")}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contracts, parties, dates, status..."
            className="w-80 bg-transparent text-sm outline-none"
          />
        </div>
        <NavButton active={activeFlow === "create"} onClick={() => setActiveFlow("create")} icon={<Plus size={16} />} label="Create new contract" />
        <NavButton active={activeFlow === "upload"} onClick={() => setActiveFlow("upload")} icon={<Upload size={16} />} label="Upload existing" />
      </div>
    </header>
  );
}

function Dashboard({ setActiveFlow }) {
  return (
    <div className="space-y-8">
      <section className="grid grid-cols-[1.1fr_0.9fr] gap-7">
        <div className="rounded-[2rem] bg-[#11110f] p-10 text-[#f7f3e8] shadow-xl">
          <p className="mb-6 text-sm uppercase tracking-[0.25em] text-white/40">AI Contract Intelligence</p>
          <h1 className="max-w-3xl text-6xl font-semibold leading-[0.96] tracking-[-0.055em]">
            Your contract work, automated from draft to approval.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-7 text-white/56">
            Generate contracts from business details, review risky wording, extract key terms from PDFs and Word files,
            and manage every contract in one searchable workspace.
          </p>
          <div className="mt-9 flex gap-3">
            <button onClick={() => setActiveFlow("create")} className="rounded-full bg-[#f4efe2] px-6 py-3 text-black">
              Create contract
            </button>
            <button onClick={() => setActiveFlow("upload")} className="rounded-full border border-white/15 px-6 py-3 text-white/80">
              Analyze document
            </button>
          </div>
        </div>
        <div className="rounded-[2rem] bg-white p-7 shadow-sm ring-1 ring-black/5">
          <div className="rounded-[1.5rem] bg-[#f6f3ed] p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold tracking-[-0.035em]">Free AI review</h3>
              <span className="rounded-full bg-[#11110f] px-3 py-1 text-xs text-white">3 contracts</span>
            </div>
            <p className="mt-4 text-black/55">
              Upload your first three existing contracts for free and get summary, clause breakdown, risk score,
              missing terms, and compliance warnings.
            </p>
            <button onClick={() => setActiveFlow("upload")} className="mt-6 w-full rounded-full bg-black py-3 text-white">
              Use free review
            </button>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <FeatureCard icon={<Wand2 />} title="AI Drafting" />
            <FeatureCard icon={<ShieldAlert />} title="Risk Analysis" />
            <FeatureCard icon={<FileCheck2 />} title="Clause Review" />
            <FeatureCard icon={<History />} title="Approval History" />
          </div>
        </div>
      </section>
      <RecentContracts />
    </div>
  );
}

function CreateContractFlow() {
  const [step, setStep] = useState(1);
  return (
    <FlowShell title="Create new contract" subtitle="Choose a contract type, enter details, generate an AI draft, review risks, then approve or edit.">
      <Progress steps={["Type", "Details", "AI Draft", "Review", "Decision"]} current={step} />
      {step === 1 && (
        <Card>
          <h2 className="section-title">Choose contract type</h2>
          <div className="grid grid-cols-3 gap-3">
            {contractTypes.map((type) => (
              <button key={type} onClick={() => setStep(2)} className="rounded-2xl border border-black/10 bg-[#f8f6f1] p-5 text-left hover:bg-black hover:text-white">
                <FileText className="mb-8" />
                <b>{type}</b>
              </button>
            ))}
          </div>
        </Card>
      )}
      {step === 2 && (
        <Card>
          <h2 className="section-title">Enter contract details</h2>
          <FormGrid fields={["Effective date", "Expiry date", "Payment terms", "Scope / obligations", "Special clauses", "Party names"]} />
          <NextButton onClick={() => setStep(3)} label="Generate AI draft" />
        </Card>
      )}
      {step === 3 && (
        <Card>
          <h2 className="section-title">AI generated draft</h2>
          <DraftPreview />
          <div className="mt-5 flex gap-3">
            <ActionButton icon={<Wand2 />} label="Rewrite" />
            <ActionButton icon={<FileText />} label="Simplify" />
            <ActionButton icon={<Plus />} label="Add clause" />
            <ActionButton icon={<X />} label="Remove clause" />
          </div>
          <NextButton onClick={() => setStep(4)} label="Run risk analysis" />
        </Card>
      )}
      {step === 4 && (
        <Card>
          <h2 className="section-title">Risk analysis</h2>
          <AnalysisGrid />
          <NextButton onClick={() => setStep(5)} label="Continue to decision" />
        </Card>
      )}
      {step === 5 && (
        <Card>
          <h2 className="section-title">Decision</h2>
          <div className="grid grid-cols-3 gap-4">
            <DecisionCard icon={<Check />} title="Approved" text="Continue to payment" />
            <DecisionCard icon={<RefreshCcw />} title="Rejected" text="Edit and resubmit" />
            <DecisionCard icon={<Trash2 />} title="Delete" text="Remove whole draft" />
          </div>
        </Card>
      )}
    </FlowShell>
  );
}

function UploadContractFlow() {
  return (
    <FlowShell title="Upload existing contract" subtitle="Upload PDF, DOCS, or Word files. AI extracts data, analyzes risks, then gives review actions.">
      <div className="grid grid-cols-[0.9fr_1.1fr] gap-6">
        <Card>
          <div className="flex h-72 flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-black/20 bg-[#f8f6f1] text-center">
            <Upload size={40} />
            <h2 className="mt-5 text-2xl font-semibold">Upload file</h2>
            <p className="mt-2 text-black/50">PDF, DOCS, WORD</p>
            <button className="mt-6 rounded-full bg-black px-6 py-3 text-white">Choose document</button>
          </div>
        </Card>
        <Card>
          <h2 className="section-title">AI process</h2>
          <LoadingStep title="Extracting contract data..." items={["Parties", "Dates", "Key clauses", "Obligations", "Risks"]} />
          <LoadingStep title="Analyzing contract..." items={["Summary", "Clause breakdown", "Risk score", "Missing terms", "Compliance warnings"]} />
          <div className="mt-6 grid grid-cols-3 gap-3">
            <ActionButton icon={<Check />} label="Accept extraction" />
            <ActionButton icon={<FileText />} label="Correct data" />
            <ActionButton icon={<FileSearch />} label="Compare template" />
          </div>
        </Card>
      </div>
    </FlowShell>
  );
}

function SearchManageFlow({ filteredContracts }) {
  return (
    <FlowShell title="Search and manage contracts" subtitle="Search by title, party name, type, date, or status. Open full contract details and manage actions.">
      <div className="grid grid-cols-[0.9fr_1.1fr] gap-6">
        <Card>
          <h2 className="section-title">Results</h2>
          <div className="space-y-3">
            {filteredContracts.map((item) => <ContractListItem key={item.title} item={item} />)}
          </div>
        </Card>
        <Card>
          <h2 className="section-title">Contract details</h2>
          <div className="rounded-[1.5rem] bg-[#f8f6f1] p-5">
            <h3 className="text-2xl font-semibold">Software Service Agreement</h3>
            <p className="mt-2 text-black/50">Full contract • Risk analysis • Approval history</p>
            <AnalysisGrid />
            <div className="mt-6 grid grid-cols-3 gap-3">
              <ActionButton icon={<Download />} label="Download" />
              <ActionButton icon={<Wand2 />} label="Edit" />
              <ActionButton icon={<Copy />} label="Duplicate" />
              <ActionButton icon={<RefreshCcw />} label="Renew" />
              <ActionButton icon={<X />} label="Terminate" />
              <ActionButton icon={<Trash2 />} label="Delete" />
            </div>
          </div>
        </Card>
      </div>
    </FlowShell>
  );
}

function Logo({ light = false }) {
  return (
    <div className="flex items-center gap-2 font-semibold">
      <div className={`grid h-9 w-9 place-items-center rounded-full ${light ? "bg-[#f4efe2] text-black" : "bg-black text-white"}`}>
        <Gavel size={18} />
      </div>
      <span>ContractAI</span>
    </div>
  );
}

function LoginButton({ icon, label, onClick }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-2xl border border-black/10 px-5 py-4 text-left hover:bg-black hover:text-white">
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

function NavButton({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm ${active ? "bg-black text-white" : "bg-white text-black shadow-sm ring-1 ring-black/5"}`}>
      {icon}
      {label}
    </button>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-xs text-black/45">{label}</p>
      <b className="text-2xl">{value}</b>
    </div>
  );
}

function RiskRow({ icon, title, level }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white p-4">
      <div className="flex items-center gap-3">
        {icon}
        <span>{title}</span>
      </div>
      <span className="text-sm text-black/50">{level}</span>
    </div>
  );
}

function FeatureCard({ icon, title }) {
  return (
    <div className="rounded-2xl border border-black/8 bg-[#f8f6f1] p-4">
      {React.cloneElement(icon, { size: 21 })}
      <p className="mt-5 font-medium">{title}</p>
    </div>
  );
}

function FlowShell({ title, subtitle, children }) {
  return (
    <div>
      <div className="mb-7">
        <h1 className="text-5xl font-semibold tracking-[-0.05em]">{title}</h1>
        <p className="mt-3 max-w-3xl text-black/55">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function Card({ children }) {
  return <div className="rounded-[2rem] bg-white p-7 shadow-sm ring-1 ring-black/5">{children}</div>;
}

function Progress({ steps, current }) {
  return (
    <div className="mb-6 flex gap-2">
      {steps.map((s, i) => (
        <div key={s} className={`flex-1 rounded-full px-4 py-3 text-sm ${i + 1 <= current ? "bg-black text-white" : "bg-white text-black/45"}`}>
          {i + 1}. {s}
        </div>
      ))}
    </div>
  );
}

function FormGrid({ fields }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {fields.map((f) => (
        <label key={f} className="block">
          <span className="text-sm text-black/50">{f}</span>
          <div className="mt-2 flex items-center justify-between rounded-2xl bg-[#f8f6f1] px-4 py-4">
            <span className="text-black/35">Enter {f.toLowerCase()}</span>
            <ChevronDown size={16} />
          </div>
        </label>
      ))}
    </div>
  );
}

function NextButton({ label, onClick }) {
  return (
    <button onClick={onClick} className="mt-6 rounded-full bg-black px-6 py-3 text-white">
      {label} <ArrowRight className="ml-2 inline" size={17} />
    </button>
  );
}

function ActionButton({ icon, label }) {
  return (
    <button className="flex items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm hover:bg-black hover:text-white">
      {icon}
      {label}
    </button>
  );
}

function DraftPreview() {
  return (
    <div className="rounded-[1.5rem] bg-[#f8f6f1] p-6 leading-8 text-black/68">
      <b className="text-black">Service Agreement Draft</b>
      <br />
      This agreement is entered into between Party A and Party B. The service provider shall deliver the agreed scope of obligations before the expiry date. Payment terms, confidentiality duties, termination rights, and liability limits are included for review.
    </div>
  );
}

function AnalysisGrid() {
  return (
    <div className="mt-5 grid grid-cols-2 gap-3">
      <RiskRow icon={<ShieldAlert size={17} />} title="Missing liability limitation" level="High" />
      <RiskRow icon={<FileSearch size={17} />} title="Inconsistent payment wording" level="Medium" />
      <RiskRow icon={<Gavel size={17} />} title="Compliance concern" level="Medium" />
      <RiskRow icon={<Clock size={17} />} title="Estimated cost: ₮12.5M" level="Info" />
    </div>
  );
}

function DecisionCard({ icon, title, text }) {
  return (
    <button className="rounded-[1.5rem] border border-black/10 bg-[#f8f6f1] p-6 text-left hover:bg-black hover:text-white">
      {icon}
      <h3 className="mt-8 text-xl font-semibold">{title}</h3>
      <p className="mt-2 opacity-60">{text}</p>
    </button>
  );
}

function LoadingStep({ title, items }) {
  return (
    <div className="mt-4 rounded-[1.5rem] bg-[#f8f6f1] p-5">
      <div className="flex items-center gap-3">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
        <b>{title}</b>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="rounded-full bg-white px-3 py-1 text-sm text-black/55">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function RecentContracts() {
  return (
    <Card>
      <h2 className="section-title">Recent contracts</h2>
      <div className="mt-4 grid grid-cols-3 gap-4">
        {contracts.map((item) => <ContractListItem key={item.title} item={item} />)}
      </div>
    </Card>
  );
}

function ContractListItem({ item }) {
  return (
    <div className="rounded-[1.5rem] bg-[#f8f6f1] p-5">
      <div className="flex items-start justify-between">
        <FileText />
        <span className="rounded-full bg-white px-3 py-1 text-xs">{item.status}</span>
      </div>
      <h3 className="mt-7 font-semibold">{item.title}</h3>
      <p className="mt-1 text-sm text-black/50">{item.party} • {item.type}</p>
      <div className="mt-4 flex justify-between text-sm">
        <span>{item.date}</span>
        <span>Risk {item.score}%</span>
      </div>
    </div>
  );
}

export default App;
