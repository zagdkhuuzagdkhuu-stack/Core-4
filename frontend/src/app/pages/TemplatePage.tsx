import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Archive, ArrowLeft, ArrowRight, FileText, LoaderCircle, QrCode, Search, Trash2 } from "lucide-react";
import QRCode from "qrcode";
import { checkQPayInvoice, createPublicQPayInvoice, fetchTemplates } from "../api";
import type { QPayInvoiceResponse, TemplateSummary, TemplateVariable } from "../api";
import { TEMPLATE_CARDS, TEMPLATE_GROUPS, TEMPLATE_STEPS } from "../shared/constants";
import type { FolderNavControls, HeaderTab, TemplateStep, UiContent } from "../shared/types";

function TemplateStepper({ step, ui }: { step: TemplateStep; ui: UiContent }) {
  const currentIndex = TEMPLATE_STEPS.findIndex(item => item.key === step);
  const stepLabels: Record<TemplateStep, string> = {
    template: ui.steps.template,
    details: ui.steps.details,
    verification: ui.steps.verification,
    payment: ui.steps.payment,
    result: ui.steps.result,
  };

  return (
    <div className="flex items-center gap-2">
      {TEMPLATE_STEPS.map((item, index) => {
        const active = item.key === step;
        const completed = index < currentIndex;
        return (
          <div key={item.key} className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-all ${
                active ? "bg-white text-black" : completed ? "bg-accent text-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {completed ? "✓" : index + 1}
            </span>
            <span className={`hidden text-xs font-medium md:block ${active ? "text-foreground" : "text-muted-foreground"}`}>
              {stepLabels[item.key]}
            </span>
            {index < TEMPLATE_STEPS.length - 1 && <span className="hidden h-px w-5 bg-muted md:block" />}
          </div>
        );
      })}
    </div>
  );
}

function TemplateShell({
  step,
  onBackHome,
  onTabSelect,
  navControls,
  ui,
  children,
}: {
  step: TemplateStep;
  onBackHome: () => void;
  onTabSelect: (tab: HeaderTab) => void;
  navControls: FolderNavControls;
  ui: UiContent;
  children: ReactNode;
}) {
  void onTabSelect;
  void navControls;

  return (
    <section className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-center">
          {step !== "template" && <TemplateStepper step={step} ui={ui} />}
        </div>
        {children}
      </div>
    </section>
  );
}

export function TemplateWorkflow({
  onBackHome,
  onTabSelect,
  navControls,
  ui,
  onSaveTemplate,
  onExportTemplate,
}: {
  onBackHome: () => void;
  onTabSelect: (tab: HeaderTab) => void;
  navControls: FolderNavControls;
  ui: UiContent;
  onSaveTemplate: (payload: { title: string; content: string; template?: TemplateSummary }) => Promise<void>;
  onExportTemplate: (payload: { title: string; content: string; template?: TemplateSummary }) => Promise<void>;
}) {
  const [step, setStep] = useState<TemplateStep>("template");
  const [activeGroup, setActiveGroup] = useState(TEMPLATE_GROUPS[0].key);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [stepDirection, setStepDirection] = useState(1);
  const [apiTemplates, setApiTemplates] = useState<TemplateSummary[]>([]);
  const [templateError, setTemplateError] = useState("");
  const [templateValues, setTemplateValues] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    fetchTemplates()
      .then(({ templates }) => {
        if (cancelled) return;
        setApiTemplates(templates);
        setTemplateError("");
        if (templates[0]) setSelectedTemplate(templates[0].name);
      })
      .catch((error) => {
        if (cancelled) return;
        setTemplateError(error instanceof Error ? error.message : "Failed to load backend templates.");
      });
    return () => { cancelled = true; };
  }, []);

  const templateCards = apiTemplates.length ? apiTemplates : TEMPLATE_CARDS.map((template, index) => ({
    id: String(index + 1),
    name: template.name,
    category: "Business",
    description: template.desc,
    content: "",
    variables: [],
  }));
  const selectedTemplateData = apiTemplates.find(template => template.name === selectedTemplate);

  useEffect(() => {
    if (!selectedTemplateData) return;
    setTemplateValues((current) => {
      const nextValues: Record<string, string> = {};
      selectedTemplateData.variables.forEach((variable) => {
        nextValues[variable.key] = current[variable.key] || "";
      });
      return nextValues;
    });
  }, [selectedTemplateData]);

  const templateGroups = TEMPLATE_GROUPS.map(group => ({
    ...group,
    name: ui.template.groups[group.key].name,
    desc: ui.template.groups[group.key].desc,
    items: templateCards.filter(template => {
      const haystack = `${template.category} ${template.name} ${template.description}`.toLowerCase();
      return group.keywords.some(keyword => haystack.includes(keyword.toLowerCase()));
    }),
  })).map((group, index, groups) => {
    if (group.key !== "special") return group;
    const assigned = new Set(groups.flatMap(item => item.key === group.key ? [] : item.items.map(t => t.name)));
    return { ...group, items: templateCards.filter(t => group.items.some(i => i.name === t.name) || !assigned.has(t.name)) };
  });

  const activeTemplateGroup = templateGroups.find(group => group.key === activeGroup) || templateGroups[0];
  const filteredTemplates = activeTemplateGroup.items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const nextStep = () => {
    const current = TEMPLATE_STEPS.findIndex(item => item.key === step);
    const next = TEMPLATE_STEPS[Math.min(current + 1, TEMPLATE_STEPS.length - 1)];
    setStepDirection(1);
    setStep(next.key);
  };

  const previousStep = () => {
    const current = TEMPLATE_STEPS.findIndex(item => item.key === step);
    const previous = TEMPLATE_STEPS[Math.max(current - 1, 0)];
    setStepDirection(-1);
    setStep(previous.key);
  };

  const renderStep = () => {
    if (step === "template") {
      return (
        <div>
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{ui.template.chooseTitle}</h1>
            <p className="mt-2 text-muted-foreground">{ui.template.chooseSubtitle}</p>
          </div>

          <div className="relative mb-6">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              placeholder={ui.template.searchPlaceholder}
              className="w-full rounded-lg border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
            />
          </div>

          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {templateGroups.map(group => {
              const Icon = group.Icon;
              const active = activeGroup === group.key;
              return (
                <button
                  key={group.name}
                  type="button"
                  onClick={() => { setActiveGroup(group.key); setSearchTerm(""); if (group.items[0]) setSelectedTemplate(group.items[0].name); }}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    active ? "border-accent bg-accent/10" : "border-border bg-card hover:border-accent/50"
                  }`}
                >
                  <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${
                    active ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"
                  }`}>
                    <Icon size={20} />
                  </div>
                  <h3 className={`mb-1 text-sm font-semibold ${active ? "text-accent" : "text-foreground"}`}>{group.name}</h3>
                  <p className="text-xs text-muted-foreground">{group.items.length} {ui.template.fallbackDescription}</p>
                </button>
              );
            })}
          </div>

          {templateError && (
            <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {ui.template.loadErrorPrefix} {templateError}
            </p>
          )}

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-accent">{activeTemplateGroup.name}</h2>
              <p className="text-sm text-muted-foreground">{activeTemplateGroup.desc}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {filteredTemplates.map(card => (
                <button
                  key={card.name}
                  type="button"
                  onClick={() => setSelectedTemplate(card.name)}
                  className={`flex items-start gap-4 rounded-xl border p-4 text-left transition-all ${
                    selectedTemplate === card.name
                      ? "border-accent bg-accent/5"
                      : "border-border bg-muted hover:border-accent/30"
                  }`}
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    selectedTemplate === card.name ? "bg-accent/20 text-accent" : "bg-background text-muted-foreground"
                  }`}>
                    <FileText size={17} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-foreground">{card.name}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{card.description || `${card.category}`}</span>
                  </span>
                  <ArrowRight size={15} className="mt-1 shrink-0 text-accent" />
                </button>
              ))}
            </div>
          </div>

          <StepActions ui={ui} step={step} disabledContinue={!selectedTemplate} onBack={() => {}} onContinue={nextStep} />
        </div>
      );
    }

    if (step === "details") return (
      <TemplateDetails
        template={selectedTemplateData}
        values={templateValues}
        ui={ui}
        step={step}
        onValueChange={(key, value) => setTemplateValues(current => ({ ...current, [key]: value }))}
        onBack={previousStep}
        onContinue={nextStep}
      />
    );
    if (step === "verification") return <TemplateVerification template={selectedTemplateData} values={templateValues} ui={ui} step={step} onBack={previousStep} onContinue={nextStep} />;
    if (step === "payment") return <TemplatePayment ui={ui} onBack={previousStep} onContinue={nextStep} />;
    const previewContent = renderTemplateContent(selectedTemplateData, templateValues, ui);
    return (
      <TemplateResult
        template={selectedTemplateData}
        values={templateValues}
        ui={ui}
        onBack={previousStep}
        onSave={() => void onSaveTemplate({ title: selectedTemplateData?.name || "Generated Contract", content: previewContent, template: selectedTemplateData })}
        onExport={() => void onExportTemplate({ title: selectedTemplateData?.name || "Generated Contract", content: previewContent, template: selectedTemplateData })}
        onFinish={() => setShowConfirm(true)}
      />
    );
  };

  return (
    <TemplateShell step={step} onBackHome={onBackHome} onTabSelect={onTabSelect} navControls={navControls} ui={ui}>
      <div key={step}>
        {renderStep()}
      </div>

      <AnimatePresence>
        {showConfirm && (
          <motion.div
            className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 px-5 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
            >
              <h2 className="mb-8 text-2xl font-bold text-foreground">{ui.confirm.title}</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const c = renderTemplateContent(selectedTemplateData, templateValues, ui);
                    void onSaveTemplate({ title: selectedTemplateData?.name || "Generated Contract", content: c, template: selectedTemplateData });
                    setShowConfirm(false);
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-black transition-all hover:bg-gray-200"
                >
                  <Archive size={16} /> {ui.actions.archive}
                </button>
                <button onClick={() => setShowConfirm(false)} className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-5 py-3 text-sm font-semibold text-foreground transition-all hover:bg-muted">
                  <Trash2 size={16} /> {ui.actions.delete}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </TemplateShell>
  );
}

function CoffeeButton({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="rounded-lg bg-white px-8 py-3 text-sm font-semibold text-black transition-all hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50">
      {children}
    </button>
  );
}

function StepActions({ ui, step, disabledContinue, onBack, onContinue }: { ui: UiContent; step: TemplateStep; disabledContinue?: boolean; onBack: () => void; onContinue: () => void }) {
  const currentIndex = TEMPLATE_STEPS.findIndex(s => s.key === step);

  return (
    <div className="fixed bottom-10 right-8 z-30 flex items-center gap-3">
      <div className="rounded-lg border border-border bg-card px-4 py-2.5 text-xs font-semibold text-muted-foreground shadow-lg">
        {currentIndex + 1} / {TEMPLATE_STEPS.length}
      </div>
      {currentIndex > 0 && (
        <button type="button" onClick={onBack} className="rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground shadow-lg transition-all hover:bg-muted">
          <ArrowLeft size={15} /> {ui.actions.back}
        </button>
      )}
      <CoffeeButton onClick={onContinue} disabled={disabledContinue}>{ui.actions.continue}</CoffeeButton>
    </div>
  );
}

function renderTemplateContent(template: TemplateSummary | undefined, values: Record<string, string>, ui: UiContent) {
  const content = template?.content || ui.template.editor.fallbackContent;
  const labelsByKey = new Map((template?.variables || []).map(variable => [variable.key, variable.label || variable.key]));
  return content.replace(/{{\s*([A-Za-z0-9_]+)\s*}}/g, (_match, key: string) => {
    const value = values[key]?.trim();
    return value || `[${labelsByKey.get(key) || key}]`;
  });
}

function groupTemplateVariables(variables: TemplateVariable[], ui: UiContent) {
  const groups = [
    { title: ui.template.fieldGroups.parties, keywords: ["name", "representative", "company", "client", "buyer", "seller", "address", "phone", "bank", "email", "ner", "tal"] },
    { title: ui.template.fieldGroups.main, keywords: ["contract", "work", "service", "description", "purpose", "location", "type", "duration", "date", "start", "end"] },
    { title: ui.template.fieldGroups.payment, keywords: ["payment", "amount", "price", "cost", "rent", "fee", "currency", "rate", "percent", "value"] },
    { title: ui.template.fieldGroups.additional, keywords: [] },
  ];
  return groups.map(group => ({
    title: group.title,
    variables: variables.filter(variable => {
      const haystack = `${variable.key} ${variable.label}`.toLowerCase();
      if (group.keywords.length === 0) return !groups.slice(0, -1).some(item => item.keywords.some(k => haystack.includes(k)));
      return group.keywords.some(keyword => haystack.includes(keyword));
    }),
  })).filter(group => group.variables.length > 0);
}

function TemplateField({ variable, value, onChange }: {
  variable: TemplateVariable; value: string; onChange: (value: string) => void;
}) {
  const baseClass = "w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-accent";
  const label = variable.label || variable.key;

  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <span>{label}</span>
        {variable.required && <span className="text-accent">*</span>}
      </span>
      {variable.type === "textarea" ? (
        <textarea value={value} onChange={event => onChange(event.target.value)} placeholder={label} rows={4} className={`${baseClass} min-h-[100px] resize-y`} />
      ) : variable.type === "boolean" ? (
        <button type="button" onClick={() => onChange(value === "true" ? "false" : "true")}
          className={`flex h-12 w-full items-center justify-between rounded-lg border px-4 text-sm font-medium ${
            value === "true" ? "border-accent bg-accent/10 text-accent" : "border-border bg-background text-muted-foreground"
          }`}
        >
          <span>{label}</span>
          <span className={`h-5 w-9 rounded-full p-0.5 transition-colors ${value === "true" ? "bg-accent" : "bg-muted"}`}>
            <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${value === "true" ? "translate-x-4" : ""}`} />
          </span>
        </button>
      ) : (
        <input value={value} onChange={event => onChange(event.target.value)} placeholder={label}
          type={variable.type === "number" || variable.type === "date" || variable.type === "email" ? variable.type : "text"}
          className={baseClass} />
      )}
    </label>
  );
}

function TemplateDetails({ template, values, ui, step, onValueChange, onBack, onContinue }: {
  template?: TemplateSummary; values: Record<string, string>; ui: UiContent; step: TemplateStep;
  onValueChange: (key: string, value: string) => void; onBack: () => void; onContinue: () => void;
}) {
  const groups = groupTemplateVariables(template?.variables || [], ui);
  const preview = renderTemplateContent(template, values, ui);

  return (
    <motion.div key="details" className="flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">{template?.name || "Selected template"}</h1>
        <p className="mt-2 text-muted-foreground">{ui.template.editor.helper}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{ui.template.editor.preview}</p>
              <h2 className="mt-1 text-sm font-semibold text-foreground">{template?.category || "Contract"}</h2>
            </div>
            <span className="rounded-md bg-accent/10 px-3 py-1 text-xs font-medium text-accent">AI</span>
          </div>
          <div className="bg-background px-6 py-6">
            <article className="whitespace-pre-wrap rounded-lg bg-white px-8 py-8 text-sm leading-7 text-gray-900">
              {preview}
            </article>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{ui.template.editor.fields}</p>
            <h2 className="mt-1 text-lg font-bold text-foreground">{template?.variables.length || 0} {ui.template.editor.fieldUnit}</h2>
          </div>
          <div className="px-5 py-5">
            {groups.length === 0 ? (
              <p className="rounded-lg border border-border bg-muted p-4 text-sm text-muted-foreground">{ui.template.editor.emptyFields}</p>
            ) : (
              <div className="space-y-6">
                {groups.map(group => (
                  <div key={group.title}>
                    <h3 className="mb-3 text-sm font-semibold text-accent">{group.title}</h3>
                    <div className="space-y-4">
                      {group.variables.map(variable => (
                        <TemplateField key={variable.key} variable={variable} value={values[variable.key] || ""}
                          onChange={(value) => onValueChange(variable.key, value)} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <StepActions ui={ui} step={step} onBack={onBack} onContinue={onContinue} />
    </motion.div>
  );
}

function TemplateVerification({ template, values, ui, step, onBack, onContinue }: {
  template?: TemplateSummary; values: Record<string, string>; ui: UiContent; step: TemplateStep; onBack: () => void; onContinue: () => void;
}) {
  const preview = renderTemplateContent(template, values, ui);

  return (
    <motion.div key="verification" className="flex flex-col">
      <div className="flex flex-1 items-center justify-center py-12">
        <div className="w-full max-w-3xl rounded-xl border border-border bg-card p-8">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-accent">{ui.template.verification.eyebrow}</p>
          <h1 className="mb-6 text-3xl font-bold text-foreground">{template?.name || ui.template.verification.title}</h1>
          <div className="whitespace-pre-wrap rounded-lg border border-border bg-background p-6 text-sm leading-7 text-muted-foreground">
            {preview}
          </div>
        </div>
      </div>
      <StepActions ui={ui} step={step} onBack={onBack} onContinue={onContinue} />
    </motion.div>
  );
}

function TemplatePayment({ ui, onBack, onContinue }: { ui: UiContent; onBack: () => void; onContinue: () => void }) {
  const amount = 10;
  const [invoice, setInvoice] = useState<QPayInvoiceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");

  const realQrImage = invoice?.qr_image
    ? invoice.qr_image.startsWith("data:") ? invoice.qr_image : `data:image/png;base64,${invoice.qr_image}`
    : "";

  const displayQr = realQrImage || qrDataUrl;

  useEffect(() => {
    if (!invoice?.qr_text || invoice.qr_image) return;
    QRCode.toDataURL(invoice.qr_text, { width: 300, margin: 2 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [invoice]);

  const createInvoice = async () => {
    setIsLoading(true);
    setPaymentError("");
    try {
      const createdInvoice = await createPublicQPayInvoice({ amount, description: "Draftly гэрээний загвар үүсгэх төлбөр" });
      setInvoice(createdInvoice);
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "QPay invoice үүсгэж чадсангүй.");
    } finally { setIsLoading(false); }
  };

  const checkPayment = async () => {
    if (!invoice?.invoice_id) return;
    setIsChecking(true);
    setPaymentError("");
    try {
      const status = await checkQPayInvoice(invoice.invoice_id);
      setIsPaid(status.paid);
      if (status.paid) onContinue();
      else setPaymentError("Төлбөр хараахан баталгаажаагүй байна.");
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "Төлбөр шалгаж чадсангүй.");
    } finally { setIsChecking(false); }
  };

  useEffect(() => { void createInvoice(); }, []);

  return (
    <motion.div key="payment" className="flex flex-col">
      <div className="flex flex-1 items-center justify-center py-12">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-accent">QPay</p>
          <h1 className="mb-2 text-2xl font-bold text-foreground">Төлбөр төлөх</h1>
          <p className="mb-6 text-sm text-muted-foreground">{amount.toLocaleString("mn-MN")} MNT</p>
          <div className="mx-auto mb-6 flex h-56 w-56 items-center justify-center rounded-xl border border-border bg-background p-4">
            {isLoading ? (
              <LoaderCircle className="h-14 w-14 animate-spin text-muted-foreground" strokeWidth={1.5} />
            ) : displayQr ? (
              <img src={displayQr} alt="QPay QR" className="h-full w-full object-contain" />
            ) : (
              <QrCode size={120} strokeWidth={1.25} className="text-muted-foreground" />
            )}
          </div>
          {invoice?.urls?.length ? (
            <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {invoice.urls.filter(item => item.link).slice(0, 6).map(item => (
                <a key={`${item.name}-${item.link}`} href={item.link}
                  className="rounded-lg border border-border bg-muted px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-background">
                  {item.name || item.description || "Bank"}
                </a>
              ))}
            </div>
          ) : null}
          {paymentError && <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{paymentError}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={createInvoice} disabled={isLoading}
              className="flex-1 rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground transition-all hover:bg-muted disabled:opacity-60">
              Дахин үүсгэх
            </button>
            <button type="button" onClick={checkPayment} disabled={!invoice || isChecking}
              className="flex-1 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-gray-200 disabled:opacity-60">
              {isChecking ? "Шалгаж байна..." : ui.template.payment.check}
            </button>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4">
        <button type="button" onClick={onBack} className="flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground transition-all hover:bg-muted">
          <ArrowLeft size={15} /> {ui.actions.back}
        </button>
        <button type="button" onClick={onContinue} className="rounded-lg bg-white px-8 py-3 text-sm font-semibold text-black transition-all hover:bg-gray-200">
          {isPaid ? ui.actions.continue : "Дараа төлөөд үргэлжлүүлэх"}
        </button>
      </div>
    </motion.div>
  );
}

function TemplateResult({ template, values, ui, onBack, onSave, onExport, onFinish }: {
  template?: TemplateSummary; values: Record<string, string>; ui: UiContent;
  onBack: () => void; onSave: () => void; onExport: () => void; onFinish: () => void;
}) {
  const preview = renderTemplateContent(template, values, ui);
  const completedFields = (template?.variables || []).filter(variable => values[variable.key]?.trim()).length;
  const totalFields = template?.variables.length || 0;
  const completionRate = totalFields ? Math.round((completedFields / totalFields) * 100) : 100;
  const missingFields = (template?.variables || [])
    .filter(variable => variable.required && !values[variable.key]?.trim())
    .map(variable => variable.label || variable.key);

  return (
    <motion.div key="template-result" className="grid gap-6 pb-6 lg:grid-cols-[1fr_320px]">
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-accent">{template?.category || "Contract"}</p>
        <h2 className="mb-6 text-2xl font-bold text-foreground">{template?.name || ui.template.result.previewTitle}</h2>
        <article className="whitespace-pre-wrap rounded-lg bg-white px-8 py-8 text-sm leading-7 text-gray-900">
          {preview}
        </article>
      </div>

      <div className="flex flex-col gap-4">
        {[
          [`${completionRate}% бөглөгдсөн`, `${completedFields}/${totalFields || completedFields} талбар бөглөгдсөн байна.`],
          [ui.template.result.missingTitle, missingFields.length ? missingFields.join(", ") : ui.template.result.missingText],
          [ui.template.result.analysisTitle, ui.template.result.analysisText],
        ].map(([title, text], index) => (
          <div key={title} className="rounded-xl border border-border bg-card p-5">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-accent">{title}</p>
            <p className="text-sm text-muted-foreground">{text}</p>
          </div>
        ))}

        <div className="mt-auto space-y-4 pt-3">
          <div className="flex flex-wrap gap-2">
            {["PPT", "Word", "Docs"].map(label => (
              <button key={label} type="button" onClick={onExport}
                className="rounded-lg border border-border bg-muted px-4 py-2 text-xs font-medium text-foreground transition-all hover:border-accent/50">
                {label}
              </button>
            ))}
            <button type="button" onClick={onSave} className="rounded-lg border border-border bg-muted px-4 py-2 text-accent transition-all hover:border-accent/50">
              <Archive size={16} />
            </button>
            <button type="button" onClick={onFinish} className="rounded-lg border border-border bg-muted px-4 py-2 text-red-400 transition-all hover:border-red-500/50">
              <Trash2 size={16} />
            </button>
          </div>
          <div className="flex items-center justify-between gap-4">
            <button type="button" onClick={onBack} className="rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground transition-all hover:bg-muted">
              {ui.actions.back}
            </button>
            <button type="button" onClick={onFinish} className="rounded-lg bg-white px-8 py-3 text-sm font-semibold text-black transition-all hover:bg-gray-200">
              {ui.template.result.create}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
