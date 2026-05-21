import { useEffect, useMemo, useState } from "react";
import colorTokens from "./colors.json";

const STORAGE_KEY = "draftly-theme";
const DEFAULT_THEME = "pastelLight";

export const themes = colorTokens.themes;

export const themeNames = Object.keys(themes);

function setVariable(name, value) {
  document.documentElement.style.setProperty(`--${name}`, value);
}

export function applyTheme(themeName) {
  const theme = themes[themeName] ?? themes[DEFAULT_THEME];
  const gradient = theme.background.gradient.join(", ");

  setVariable("color-bg-primary", theme.background.primary);
  setVariable("color-bg-secondary", theme.background.secondary);
  setVariable("color-bg-gradient", gradient);
  setVariable("color-surface-card", theme.surface.card);
  setVariable("color-surface-soft", theme.surface.soft);
  setVariable("color-surface-glass", theme.surface.glass);
  setVariable("color-text-primary", theme.text.primary);
  setVariable("color-text-secondary", theme.text.secondary);
  setVariable("color-text-light", theme.text.light ?? theme.text.primary);
  setVariable("color-text-accent", theme.text.accent ?? theme.button.primary);
  setVariable("color-button-primary", theme.button.primary);
  setVariable("color-button-primary-text", theme.button.primaryText);
  setVariable("color-button-secondary", theme.button.secondary);
  setVariable("color-button-secondary-text", theme.button.secondaryText);
  setVariable("color-danger", theme.button.danger ?? theme.button.secondary);
  setVariable("color-border-light", theme.border.light);
  setVariable("color-border-soft", theme.border.soft);
  setVariable("color-shadow-soft", theme.shadow.soft);
  setVariable("color-shadow-medium", theme.shadow.medium);

  document.documentElement.dataset.theme = themeName;
}

export function useTheme() {
  const [themeName, setThemeName] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
  });

  useEffect(() => {
    applyTheme(themeName);
    localStorage.setItem(STORAGE_KEY, themeName);
  }, [themeName]);

  return useMemo(
    () => ({
      themeName,
      setThemeName,
      theme: themes[themeName] ?? themes[DEFAULT_THEME],
      themeNames,
    }),
    [themeName],
  );
}
