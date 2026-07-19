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
