import enContent from "../content/en.json";

export type Locale = "mn" | "en";
export type HeaderTab = "Home" | "Template" | "Analysis" | "Information";
export type AppPage = "home" | "template" | "analysis" | "information" | "auth";
export type AnalysisStep = "upload" | "processing" | "result";
export type TemplateStep = "template" | "details" | "verification" | "payment" | "result";
export type UiContent = typeof enContent.ui;
export type AppContent = typeof enContent;

export type AccessState = {
  isPaid: boolean;
  profileComplete: boolean;
  missingFields: string[];
};

export type FolderNavControls = {
  isDark: boolean;
  languageLabel: string;
  loginLabel: string;
  isAuthenticated: boolean;
  userAvatarUrl?: string | null;
  onThemeToggle: () => void;
  onLanguageToggle: () => void;
  onLoginClick: () => void;
  onProfileClick: () => void;
};
