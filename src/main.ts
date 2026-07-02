/**
 * Irbis Supplies - entrypoint
 * - Mantiene el core JS (legacy) pero permite sumar TS/Coffee y build para Netlify.
 */
import "./legacy/script.js";
import { wireAuthUI } from "./ts/auth";
import { wirePreferencesUI } from "./ts/preferences";

// Auth UI (Firebase si está configurado)
wireAuthUI();

// Preferencias visuales de idioma y tema
wirePreferencesUI();
