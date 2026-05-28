import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Archive, ArrowLeft, ArrowRight, FileText, LoaderCircle, QrCode, Search, Trash2 } from "lucide-react";
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
    <div className="flex gap-2 lg:flex-col">
      {TEMPLATE_STEPS.map((item, index) => {
        const active = item.key === step;
        const completed = index < currentIndex;
        const color = active ? "var(--button)" : completed ? "var(--highlight)" : "var(--border)";

        return (
          <motion.div
            key={item.key}
            className="flex items-center gap-3"
            animate={{ opacity: active || completed ? 1 : 0.55 }}
            transition={{ duration: 0.3 }}
          >
            <motion.span
              className="h-2.5 w-16 rounded-full lg:h-14 lg:w-2.5"
              animate={{ backgroundColor: color, scale: active ? 1.08 : 1 }}
              transition={{ duration: 0.35 }}
            />
            <span className="hidden text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground/70 dark:text-foreground/70 lg:block">
              {stepLabels[item.key]}
            </span>
          </motion.div>
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
    <section className="min-h-screen bg-background px-3 pb-6 pt-3 sm:px-4">
      <div className="relative flex min-h-[calc(100vh-9.5rem)] overflow-hidden rounded-[1.7rem] border border-border/65 bg-secondary shadow-[0_22px_70px_rgba(12,21,25,0.13)] dark:border-highlight/15 dark:bg-secondary dark:shadow-[0_22px_80px_rgba(0,0,0,0.30)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(207,157,123,0.10),transparent_24%),radial-gradient(circle_at_84%_10%,rgba(216,198,186,0.16),transparent_22%)]" />
        <div className="relative z-10 flex w-full flex-col px-4 py-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <button
              type="button"
              onClick={onBackHome}
              className="group flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/65 text-foreground shadow-[0_10px_24px_rgba(12,21,25,0.10)] transition-all duration-300 hover:border-highlight hover:bg-secondary dark:border-highlight/25 dark:bg-card/70 dark:text-foreground dark:hover:bg-card"
              aria-label={ui.actions.back}
            >
              <ArrowLeft size={17} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
            </button>
            <span className="font-display text-2xl font-black text-foreground dark:text-foreground">Draftly.</span>
          </div>
          {step === "template" ? (
            <div className="relative min-h-[calc(100vh-15rem)] overflow-hidden">
              {children}
            </div>
          ) : (
            <div className="grid flex-1 gap-8 lg:grid-cols-[140px_minmax(0,1fr)]">
              <aside className="pt-2">
                <TemplateStepper step={step} ui={ui} />
              </aside>
              <div className="relative min-h-[calc(100vh-15rem)] overflow-hidden rounded-[1.4rem]">
                {children}
              </div>
            </div>
          )}
        </div>
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
        if (templates[0]) {
          setSelectedTemplate(templates[0].name);
        }
      })
      .catch((error) => {
        if (cancelled) return;
        setTemplateError(error instanceof Error ? error.message : "Failed to load backend templates.");
      });

    return () => {
      cancelled = true;
    };
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

    const assigned = new Set(groups.flatMap(item => item.key === group.key ? [] : item.items.map(template => template.name)));
    return {
      ...group,
      items: templateCards.filter(template => group.items.some(item => item.name === template.name) || !assigned.has(template.name)),
    };
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
        <div className="mx-auto max-w-[1260px] pb-5">
          <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_300px] lg:items-end">
            <div className="text-center lg:pl-[300px]">
              <h1 className="font-display text-3xl font-bold leading-tight text-foreground dark:text-foreground md:text-[2.35rem]">{ui.template.chooseTitle}</h1>
              <p className="mt-1.5 text-sm text-muted-foreground/66 dark:text-muted-foreground/62">{ui.template.chooseSubtitle}</p>
            </div>
            <div className="group flex h-10 items-center rounded-lg border border-border/60 bg-card px-4 text-foreground shadow-[0_10px_24px_rgba(12,21,25,0.08)]">
              <Search size={16} className="mr-3 text-muted-foreground/55" />
              <input
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
                placeholder={ui.template.searchPlaceholder}
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/45"
              />
            </div>
          </div>

          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {templateGroups.map(group => {
              const Icon = group.Icon;
              const active = activeGroup === group.key;
              return (
                <button
                  key={group.name}
                  type="button"
                  onClick={() => {
                    setActiveGroup(group.key);
                    setSearchTerm("");
                    if (group.items[0]) setSelectedTemplate(group.items[0].name);
                  }}
                  className={`group min-h-[118px] rounded-xl border bg-card p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-button/50 hover:shadow-[0_16px_34px_rgba(12,21,25,0.11)] ${
                    active ? "border-button shadow-[0_16px_38px_rgba(12,21,25,0.14)]" : "border-border/70 shadow-[0_10px_28px_rgba(12,21,25,0.05)]"
                  }`}
                >
                  <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg border ${
                    active ? "border-button/20 bg-button/10 text-button" : "border-border bg-secondary text-foreground"
                  }`}>
                    <Icon size={20} strokeWidth={1.8} />
                  </div>
                  <h3 className={`mb-2 text-sm font-bold ${active ? "text-button" : "text-foreground"}`}>{group.name}</h3>
                  <p className="text-xs leading-5 text-muted-foreground/68">{group.items.length} {ui.template.fallbackDescription}</p>
                </button>
              );
            })}
          </div>

          {templateError && (
            <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {ui.template.loadErrorPrefix} {templateError}
            </p>
          )}

          <div className="rounded-xl border border-border/70 bg-card/72 p-5 shadow-[0_18px_48px_rgba(12,21,25,0.09)]">
            <div className="mb-5 grid gap-4 lg:grid-cols-[1fr_230px] lg:items-start">
              <div>
                <h2 className="mb-2 text-lg font-bold text-button">{activeTemplateGroup.name}</h2>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground/72">{activeTemplateGroup.desc}</p>
              </div>
              {selectedTemplateData && (
                <div className="rounded-lg border border-border/70 bg-secondary px-4 py-3 text-xs leading-5 text-muted-foreground/72 shadow-inner">
                  <span className="font-semibold text-foreground">{selectedTemplateData.variables.length}</span> {ui.template.fieldsCount}
                </div>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {filteredTemplates.map(card => (
                <button
                  key={card.name}
                  type="button"
                  onClick={() => setSelectedTemplate(card.name)}
                  className={`group flex min-h-[74px] items-start gap-4 rounded-xl border bg-secondary p-4 text-left transition-all duration-250 hover:-translate-y-0.5 hover:border-button/40 hover:bg-background hover:shadow-[0_14px_30px_rgba(12,21,25,0.09)] ${
                    selectedTemplate === card.name ? "border-button bg-background shadow-[0_12px_28px_rgba(12,21,25,0.10)]" : "border-border/70"
                  }`}
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                    selectedTemplate === card.name ? "border-button/20 bg-button/10 text-button" : "border-border bg-card text-button"
                  }`}>
                    <FileText size={17} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-foreground">{card.name}</span>
                    <span className="mt-1 line-clamp-2 block text-xs leading-5 text-muted-foreground/66">{card.description || `${card.category} ${ui.template.fallbackDescription}`}</span>
                  </span>
                  <ArrowRight size={15} className="mt-1 shrink-0 text-button transition-transform duration-300 group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={nextStep}
              disabled={!selectedTemplate}
              className="inline-flex items-center gap-3 rounded-md bg-button px-7 py-3 text-sm font-semibold text-button-text shadow-[0_12px_26px_rgba(12,21,25,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              {ui.actions.continue} <ArrowRight size={16} />
            </button>
          </div>
        </div>
      );
    }

    if (step === "details") {
      return (
        <TemplateDetails
          template={selectedTemplateData}
          values={templateValues}
          ui={ui}
          onValueChange={(key, value) => setTemplateValues(current => ({ ...current, [key]: value }))}
          onBack={previousStep}
          onContinue={nextStep}
        />
      );
    }
    if (step === "verification") return <TemplateVerification template={selectedTemplateData} values={templateValues} ui={ui} onBack={previousStep} onContinue={nextStep} />;
    if (step === "payment") return <TemplatePayment ui={ui} onBack={previousStep} onContinue={nextStep} />;
    const previewContent = renderTemplateContent(selectedTemplateData, templateValues, ui);
    return (
      <TemplateResult
        template={selectedTemplateData}
        values={templateValues}
        ui={ui}
        onBack={previousStep}
        onSave={() => void onSaveTemplate({
          title: selectedTemplateData?.name || "Generated Contract",
          content: previewContent,
          template: selectedTemplateData,
        })}
        onExport={() => void onExportTemplate({
          title: selectedTemplateData?.name || "Generated Contract",
          content: previewContent,
          template: selectedTemplateData,
        })}
        onFinish={() => setShowConfirm(true)}
      />
    );
  };

  return (
    <TemplateShell step={step} onBackHome={onBackHome} onTabSelect={onTabSelect} navControls={navControls} ui={ui}>
      <div
        key={step}
        className="absolute inset-0 overflow-y-auto rounded-[1.4rem] bg-secondary/95 px-1 pb-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
      >
        {renderStep()}
      </div>

      <AnimatePresence>
        {showConfirm && (
          <motion.div
            className="fixed inset-0 z-10 flex items-center justify-center bg-background/50 px-5 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md rounded-[2rem] border border-border/35 bg-secondary p-8 text-center shadow-[0_30px_90px_rgba(0,0,0,0.32)]"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
            >
              <h2 className="mb-8 font-display text-3xl font-bold text-foreground">{ui.confirm.title}</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const previewContent = renderTemplateContent(selectedTemplateData, templateValues, ui);
                    void onSaveTemplate({
                      title: selectedTemplateData?.name || "Generated Contract",
                      content: previewContent,
                      template: selectedTemplateData,
                    });
                    setShowConfirm(false);
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-button px-5 py-3 text-sm font-semibold text-button-text transition-transform duration-300 hover:scale-[1.03]"
                >
                  <Archive size={16} /> {ui.actions.archive}
                </button>
                <button onClick={() => setShowConfirm(false)} className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-muted-foreground transition-transform duration-300 hover:scale-[1.03]">
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

function CoffeeButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full bg-button px-9 py-3.5 text-sm font-semibold text-button-text shadow-[0_0_0_rgba(207,157,123,0)] transition-all duration-300 hover:scale-[1.02] hover:bg-accent hover:shadow-[0_0_30px_rgba(207,157,123,0.28)]"
    >
      {children}
    </button>
  );
}

function StepActions({ ui, onBack, onContinue }: { ui: UiContent; onBack: () => void; onContinue: () => void }) {
  return (
    <div className="mt-8 flex items-center justify-between gap-4">
      <button
        type="button"
        onClick={onBack}
        className="group flex items-center gap-2 rounded-full border border-border/35 bg-secondary/70 px-6 py-3 text-sm font-semibold text-foreground transition-all duration-300 hover:border-highlight hover:bg-card"
      >
        <ArrowLeft size={15} className="transition-transform duration-300 group-hover:-translate-x-0.5" /> {ui.actions.back}
      </button>
      <CoffeeButton onClick={onContinue}>{ui.actions.continue}</CoffeeButton>
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
      if (group.keywords.length === 0) {
        return !groups.slice(0, -1).some(item => item.keywords.some(keyword => haystack.includes(keyword)));
      }
      return group.keywords.some(keyword => haystack.includes(keyword));
    }),
  })).filter(group => group.variables.length > 0);
}

function TemplateField({
  variable,
  value,
  onChange,
}: {
  variable: TemplateVariable;
  value: string;
  onChange: (value: string) => void;
}) {
  const baseClass = "w-full rounded-md border border-border/70 bg-background px-4 py-3 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground/42 focus:border-button focus:shadow-[0_0_0_4px_rgba(13,39,76,0.08)]";
  const label = variable.label || variable.key;

  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold text-muted-foreground/80">
        <span>{label}</span>
        {variable.required && <span className="text-button">*</span>}
      </span>
      {variable.type === "textarea" ? (
        <textarea
          value={value}
          onChange={event => onChange(event.target.value)}
          placeholder={label}
          rows={4}
          className={`${baseClass} min-h-[112px] resize-y`}
        />
      ) : variable.type === "boolean" ? (
        <button
          type="button"
          onClick={() => onChange(value === "true" ? "false" : "true")}
          className={`flex h-12 w-full items-center justify-between rounded-md border px-4 text-sm font-semibold transition-colors ${
            value === "true" ? "border-button bg-button/10 text-button" : "border-border/70 bg-background text-muted-foreground"
          }`}
        >
          <span>{label}</span>
          <span className={`h-5 w-9 rounded-full p-0.5 transition-colors ${value === "true" ? "bg-button" : "bg-border"}`}>
            <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${value === "true" ? "translate-x-4" : ""}`} />
          </span>
        </button>
      ) : (
        <input
          value={value}
          onChange={event => onChange(event.target.value)}
          placeholder={label}
          type={variable.type === "number" || variable.type === "date" || variable.type === "email" ? variable.type : "text"}
          className={baseClass}
        />
      )}
    </label>
  );
}

function TemplateDetails({
  template,
  values,
  ui,
  onValueChange,
  onBack,
  onContinue,
}: {
  template?: TemplateSummary;
  values: Record<string, string>;
  ui: UiContent;
  onValueChange: (key: string, value: string) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const groups = groupTemplateVariables(template?.variables || [], ui);
  const preview = renderTemplateContent(template, values, ui);

  return (
    <motion.div
      key="details"
      className="mx-auto flex max-w-[1280px] flex-col"
    >
      <div className="mb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-button">{ui.template.editor.eyebrow}</p>
        <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">{template?.name || "Selected template"}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground/70">
          {ui.template.editor.helper}
        </p>
      </div>

      <div className="grid flex-1 gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section className="min-h-[620px] overflow-hidden rounded-md border border-border/70 bg-card shadow-[0_18px_50px_rgba(12,21,25,0.06)]">
          <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">{ui.template.editor.preview}</p>
              <h2 className="mt-1 text-sm font-bold text-foreground">{template?.category || "Contract"}</h2>
            </div>
            <span className="rounded-md bg-button/10 px-3 py-1 text-xs font-semibold text-button">AI</span>
          </div>
          <div className="h-[560px] overflow-y-auto bg-background px-8 py-8">
            <article className="mx-auto max-w-[760px] whitespace-pre-wrap rounded-sm bg-white px-8 py-10 text-sm leading-7 text-slate-900 shadow-[0_16px_40px_rgba(12,21,25,0.08)] dark:bg-card dark:text-foreground">
              {preview}
            </article>
          </div>
        </section>

        <aside className="min-h-[620px] overflow-hidden rounded-md border border-border/70 bg-card shadow-[0_18px_50px_rgba(12,21,25,0.06)]">
          <div className="border-b border-border/70 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">{ui.template.editor.fields}</p>
            <h2 className="mt-1 text-lg font-bold text-foreground">{template?.variables.length || 0} {ui.template.editor.fieldUnit}</h2>
          </div>
          <div className="h-[560px] overflow-y-auto px-5 py-5">
            {groups.length === 0 ? (
              <p className="rounded-md border border-border/70 bg-secondary p-4 text-sm leading-6 text-muted-foreground/70">
                {ui.template.editor.emptyFields}
              </p>
            ) : (
              <div className="space-y-6">
                {groups.map(group => (
                  <div key={group.title}>
                    <h3 className="mb-3 text-sm font-bold text-button">{group.title}</h3>
                    <div className="space-y-4">
                      {group.variables.map(variable => (
                        <TemplateField
                          key={variable.key}
                          variable={variable}
                          value={values[variable.key] || ""}
                          onChange={(value) => onValueChange(variable.key, value)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
      <StepActions ui={ui} onBack={onBack} onContinue={onContinue} />
    </motion.div>
  );
}

function TemplateVerification({
  template,
  values,
  ui,
  onBack,
  onContinue,
}: {
  template?: TemplateSummary;
  values: Record<string, string>;
  ui: UiContent;
  onBack: () => void;
  onContinue: () => void;
}) {
  const preview = renderTemplateContent(template, values, ui);

  return (
    <motion.div
      key="verification"
      className="flex flex-col"
    >
      <div className="flex flex-1 items-center justify-center">
        <motion.div
          className="w-full max-w-3xl rounded-[2rem] border border-border/25 bg-secondary/80 p-10 text-foreground shadow-[0_26px_70px_rgba(0,0,0,0.25)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-highlight">{ui.template.verification.eyebrow}</p>
          <h1 className="mb-5 font-display text-4xl font-bold">{template?.name || ui.template.verification.title}</h1>
          <div className="max-h-[420px] overflow-y-auto whitespace-pre-wrap rounded-md border border-border/70 bg-background p-5 text-sm leading-7 text-muted-foreground/80">
            {preview}
          </div>
        </motion.div>
      </div>
      <StepActions ui={ui} onBack={onBack} onContinue={onContinue} />
    </motion.div>
  );
}

function TemplatePayment({ ui, onBack, onContinue }: { ui: UiContent; onBack: () => void; onContinue: () => void }) {
  const amount = 5000;
  const [invoice, setInvoice] = useState<QPayInvoiceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const qrImage = invoice?.qr_image
    ? invoice.qr_image.startsWith("data:") ? invoice.qr_image : `data:image/png;base64,${invoice.qr_image}`
    : "";

  const createInvoice = async () => {
    setIsLoading(true);
    setPaymentError("");

    try {
      const createdInvoice = await createPublicQPayInvoice({
        amount,
        description: "Draftly гэрээний загвар үүсгэх төлбөр",
      });
      setInvoice(createdInvoice);
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "QPay invoice үүсгэж чадсангүй.");
    } finally {
      setIsLoading(false);
    }
  };

  const checkPayment = async () => {
    if (!invoice?.invoice_id) return;
    setIsChecking(true);
    setPaymentError("");

    try {
      const status = await checkQPayInvoice(invoice.invoice_id);
      setIsPaid(status.paid);
      if (status.paid) {
        onContinue();
      } else {
        setPaymentError("Төлбөр хараахан баталгаажаагүй байна.");
      }
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "Төлбөр шалгаж чадсангүй.");
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    void createInvoice();
  }, []);

  return (
    <motion.div
      key="payment"
      className="flex flex-col"
    >
      <div className="flex flex-1 items-center justify-center">
        <motion.div
          className="w-full max-w-lg rounded-[2rem] border border-border/25 bg-secondary p-8 text-center text-foreground shadow-[0_28px_80px_rgba(0,0,0,0.28)]"
          animate={{ scale: [1, 1.015, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-highlight">QPay</p>
          <h1 className="mb-2 font-display text-3xl font-bold">Төлбөр төлөх</h1>
          <p className="mb-6 text-sm text-muted-foreground/75">
            Гэрээний загвар үүсгэх төлбөр: {amount.toLocaleString("mn-MN")} MNT
          </p>
          <motion.div
            className="mx-auto mb-6 flex h-64 w-64 items-center justify-center rounded-[1.5rem] border border-border bg-card p-4 shadow-inner"
            animate={{ boxShadow: ["0 0 0 rgba(207,157,123,0)", "0 0 34px rgba(207,157,123,0.28)", "0 0 0 rgba(207,157,123,0)"] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            {isLoading ? (
              <LoaderCircle className="h-14 w-14 animate-spin text-foreground" strokeWidth={1.5} />
            ) : qrImage ? (
              <img src={qrImage} alt="QPay QR" className="h-full w-full object-contain" />
            ) : (
              <QrCode size={132} strokeWidth={1.25} className="text-foreground" />
            )}
          </motion.div>
          {invoice?.urls?.length ? (
            <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {invoice.urls.filter(item => item.link).slice(0, 6).map(item => (
                <a
                  key={`${item.name}-${item.link}`}
                  href={item.link}
                  className="rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-background"
                >
                  {item.name || item.description || "Bank"}
                </a>
              ))}
            </div>
          ) : null}
          {paymentError && (
            <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {paymentError}
            </p>
          )}
          {isPaid && (
            <p className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Төлбөр амжилттай баталгаажлаа.
            </p>
          )}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={createInvoice}
              disabled={isLoading}
              className="flex-1 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-transform duration-300 hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Дахин үүсгэх
            </button>
            <button
              type="button"
              onClick={checkPayment}
              disabled={!invoice || isChecking}
              className="flex-1 rounded-full bg-button px-6 py-3 text-sm font-semibold text-button-text transition-transform duration-300 hover:scale-[1.03] hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isChecking ? "Шалгаж байна..." : ui.template.payment.check}
            </button>
          </div>
        </motion.div>
      </div>
      <div className="mt-8 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="group flex items-center gap-2 rounded-full border border-border/35 bg-secondary/70 px-6 py-3 text-sm font-semibold text-foreground transition-all duration-300 hover:border-highlight hover:bg-card"
        >
          <ArrowLeft size={15} className="transition-transform duration-300 group-hover:-translate-x-0.5" /> {ui.actions.back}
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="rounded-full bg-button px-9 py-3.5 text-sm font-semibold text-button-text shadow-[0_0_0_rgba(207,157,123,0)] transition-all duration-300 hover:scale-[1.02] hover:bg-accent hover:shadow-[0_0_30px_rgba(207,157,123,0.28)]"
        >
          {isPaid ? ui.actions.continue : "Дараа төлөөд үргэлжлүүлэх"}
        </button>
      </div>
    </motion.div>
  );
}

function TemplateResult({
  template,
  values,
  ui,
  onBack,
  onSave,
  onExport,
  onFinish,
}: {
  template?: TemplateSummary;
  values: Record<string, string>;
  ui: UiContent;
  onBack: () => void;
  onSave: () => void;
  onExport: () => void;
  onFinish: () => void;
}) {
  const preview = renderTemplateContent(template, values, ui);
  const completedFields = (template?.variables || []).filter(variable => values[variable.key]?.trim()).length;
  const totalFields = template?.variables.length || 0;
  const completionRate = totalFields ? Math.round((completedFields / totalFields) * 100) : 100;
  const missingFields = (template?.variables || [])
    .filter(variable => variable.required && !values[variable.key]?.trim())
    .map(variable => variable.label || variable.key);
  const previewLines = preview.split(/\n{2,}/).filter(Boolean);

  return (
    <motion.div
      key="template-result"
      className="grid gap-8 pb-6 lg:grid-cols-[minmax(0,1fr)_380px]"
    >
      <motion.div
        className="relative min-h-[560px] overflow-hidden rounded-[2rem] border border-border/30 bg-secondary p-8 text-foreground shadow-[0_28px_80px_rgba(0,0,0,0.28)]"
      >
        <div className="absolute -inset-x-4 top-6 -z-10 h-full rounded-[2rem] bg-background/70" />
        <div className="absolute -inset-x-8 top-12 -z-20 h-full rounded-[2rem] bg-border/65" />
        <div className="h-full overflow-y-auto pr-3 text-sm leading-7 text-muted-foreground/80">
          <div className="mb-7">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-highlight">{template?.category || "Contract"}</p>
            <h2 className="text-2xl font-semibold text-foreground">{template?.name || ui.template.result.previewTitle}</h2>
          </div>
          <article className="whitespace-pre-wrap rounded-md bg-white px-8 py-9 text-sm leading-7 text-slate-900 shadow-[0_16px_40px_rgba(12,21,25,0.08)] dark:bg-card dark:text-foreground">
            {previewLines.length ? previewLines.map((paragraph, index) => (
              <p key={index} className="mb-5 last:mb-0">
                {paragraph}
              </p>
            )) : preview}
          </article>
        </div>
      </motion.div>

      <div className="flex flex-col gap-4">
        {[
          [`${completionRate}% бөглөгдсөн`, `${completedFields}/${totalFields || completedFields} талбар бөглөгдсөн байна.`],
          [ui.template.result.missingTitle, missingFields.length ? missingFields.join(", ") : ui.template.result.missingText],
          [ui.template.result.analysisTitle, ui.template.result.analysisText],
        ].map(([title, text], index) => (
          <motion.div
            key={title}
            className="rounded-[1.5rem] border border-border/20 bg-card/80 p-6 text-foreground shadow-[0_16px_38px_rgba(0,0,0,0.18)]"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay: index * 0.12 }}
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-highlight">{title}</p>
            <p className="text-sm leading-6 text-muted-foreground/68">{text}</p>
          </motion.div>
        ))}

        <div className="mt-auto space-y-4 pt-3">
          <div className="flex flex-wrap gap-2">
            {["PPT", "Word", "Docs"].map(label => (
              <button key={label} type="button" onClick={onExport} className="flex h-11 min-w-16 items-center justify-center rounded-full border border-border/25 bg-secondary/80 px-4 text-xs font-semibold text-foreground transition-all duration-300 hover:-translate-y-1 hover:border-highlight">
                {label}
              </button>
            ))}
            <button type="button" onClick={onSave} className="flex h-11 w-11 items-center justify-center rounded-full border border-border/25 bg-secondary/80 text-highlight transition-all duration-300 hover:-translate-y-1 hover:border-highlight">
              <Archive size={16} />
            </button>
            <button type="button" onClick={onFinish} className="flex h-11 w-11 items-center justify-center rounded-full border border-border/25 bg-secondary/80 text-highlight transition-all duration-300 hover:-translate-y-1 hover:border-highlight">
              <Trash2 size={16} />
            </button>
          </div>
          <div className="flex items-center justify-between gap-4">
            <button type="button" onClick={onBack} className="rounded-full border border-border/35 bg-secondary/70 px-6 py-3 text-sm font-semibold text-foreground transition-all duration-300 hover:bg-card">
              {ui.actions.back}
            </button>
            <button type="button" onClick={onFinish} className="flex-1 rounded-full bg-button px-8 py-3.5 text-sm font-semibold text-button-text shadow-[0_0_0_rgba(207,157,123,0)] transition-all duration-300 hover:scale-[1.02] hover:bg-accent hover:shadow-[0_0_30px_rgba(207,157,123,0.28)]">
              {ui.template.result.create}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
