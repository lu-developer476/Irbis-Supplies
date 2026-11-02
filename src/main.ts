/**
 * Irbis Supplies - entrypoint
 * - Mantiene el core JS (legacy) pero permite sumar TS/Coffee y build para Netlify.
 */
import "./legacy/script.js";
import { wireAuthUI } from "./ts/auth";
import { wirePreferencesUI } from "./ts/preferences";


function wireNavDropdown() {
  const menuButton = document.getElementById("btnNavMenu");
  const dropdown = document.getElementById("navDropdown");
  if (!menuButton || !dropdown) return;

  function setOpen(open: boolean) {
    dropdown?.classList.toggle("is-open", open);
    menuButton?.setAttribute("aria-expanded", String(open));
  }

  menuButton.addEventListener("click", (event) => {
    event.stopPropagation();
    setOpen(!dropdown.classList.contains("is-open"));
  });

  dropdown.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest("a, #btnCart, #btnHistorial")) setOpen(false);
  });

  document.addEventListener("click", (event) => {
    const target = event.target as Node | null;
    if (target && !dropdown.contains(target) && !menuButton.contains(target)) setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });
}

// Auth UI (Firebase si está configurado)
wireAuthUI();

// Preferencias visuales de idioma, tema y menú principal
wirePreferencesUI();
wireNavDropdown();
wireCategoryShortcuts();


function wireCategoryShortcuts() {
  const shortcuts = document.querySelectorAll<HTMLButtonElement>("[data-category-shortcut]");
  const categorySelect = document.getElementById("categoryFilter") as HTMLSelectElement | null;
  if (!shortcuts.length || !categorySelect) return;

  shortcuts.forEach((shortcut) => {
    shortcut.addEventListener("click", () => {
      categorySelect.value = shortcut.dataset.categoryShortcut || "all";
      shortcuts.forEach((item) => {
        const active = item === shortcut;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      categorySelect.dispatchEvent(new Event("change", { bubbles: true }));
      document.getElementById("productos")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  const syncShortcuts = () => {
    shortcuts.forEach((item) => {
      const active = item.dataset.categoryShortcut === categorySelect.value;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
  };

  categorySelect.addEventListener("change", syncShortcuts);
  document.getElementById("productFilters")?.addEventListener("reset", () => {
    window.setTimeout(syncShortcuts, 0);
  });
}
