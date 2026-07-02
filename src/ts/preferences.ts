const LANGUAGE_KEY = "irbis_language";
const THEME_KEY = "irbis_theme";

type Language = "es" | "en";
type Theme = "dark" | "light";

const isLanguage = (value: string | null): value is Language => value === "es" || value === "en";
const isTheme = (value: string | null): value is Theme => value === "dark" || value === "light";

function setPressed(button: HTMLElement | null, active: boolean) {
  button?.classList.toggle("is-active", active);
  button?.setAttribute("aria-pressed", String(active));
}

function applyLanguage(language: Language) {
  document.documentElement.lang = language;
  localStorage.setItem(LANGUAGE_KEY, language);

  setPressed(document.getElementById("btnLangEs"), language === "es");
  setPressed(document.getElementById("btnLangEn"), language === "en");
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);

  setPressed(document.getElementById("btnThemeDark"), theme === "dark");
  setPressed(document.getElementById("btnThemeLight"), theme === "light");
}

export function wirePreferencesUI() {
  const storedLanguage = localStorage.getItem(LANGUAGE_KEY);
  const storedTheme = localStorage.getItem(THEME_KEY);

  applyLanguage(isLanguage(storedLanguage) ? storedLanguage : "es");
  applyTheme(isTheme(storedTheme) ? storedTheme : "dark");

  document.getElementById("btnLangEs")?.addEventListener("click", () => applyLanguage("es"));
  document.getElementById("btnLangEn")?.addEventListener("click", () => applyLanguage("en"));
  document.getElementById("btnThemeDark")?.addEventListener("click", () => applyTheme("dark"));
  document.getElementById("btnThemeLight")?.addEventListener("click", () => applyTheme("light"));
}
