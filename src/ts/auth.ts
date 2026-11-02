import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  updateProfile,
  type User,
} from "firebase/auth";

import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

declare global {
  interface Window {
    IRBIS_FIREBASE_CONFIG?: Record<string, string>;
  }
}

let app: FirebaseApp | null = null;

function uiText(spanish: string, english: string): string {
  try {
    return window.localStorage.getItem("irbis_language") === "en" ? english : spanish;
  } catch {
    return spanish;
  }
}

function getConfig() {
  const cfg = window.IRBIS_FIREBASE_CONFIG;
  if (!cfg || !cfg.apiKey || cfg.apiKey === "REEMPLAZAR") return null;
  return cfg;
}

export function initAuth() {
  const cfg = getConfig();
  if (!cfg) return { enabled: false as const };

  app = initializeApp(cfg);
  const auth = getAuth(app);
  const db = getFirestore(app);

  return { enabled: true as const, auth, db };
}

export function wireAuthUI() {
  const authMenuBtn = document.getElementById("btnAuthMenu") as HTMLButtonElement | null;
  const badge = document.getElementById("authBadge") as HTMLSpanElement | null;

  const init = initAuth();
  if (!authMenuBtn || !badge) return;

  const authButton = authMenuBtn;
  const authBadge = badge;

  if (!init.enabled) {
    authButton.addEventListener("click", () => explainNoFirebase());
    authBadge.textContent = "";
    return;
  }

  const { auth } = init;

  function renderUser(u: User | null) {
    if (!u) {
      authBadge.textContent = "";
      authButton.style.display = "inline-flex";
      return;
    }

    const label = u.displayName
      ? `${u.displayName} · ${u.email}`
      : (u.email || uiText("Sesión iniciada", "Signed in"));

    authBadge.textContent = label;

    authButton.style.display = "none";

    authBadge.style.cursor = "pointer";
    authBadge.title = uiText("Click para cerrar sesión", "Click to sign out");
    authBadge.onclick = async () => {
      const ok = await (window as any).Swal?.fire?.({
        title: uiText("Cerrar sesión", "Sign out"),
        text: uiText("¿Querés salir de tu cuenta?", "Do you want to sign out?"),
        icon: "question",
        showCancelButton: true,
        confirmButtonText: uiText("Sí, salir", "Sign out"),
        cancelButtonText: uiText("Cancelar", "Cancel"),
        background: "#1e1e1e",
        color: "#fff",
      });
      if (ok?.isConfirmed) await signOut(auth);
    };
  }

  onAuthStateChanged(auth, (u) => renderUser(u));

  authButton.addEventListener("click", () => openAuthMenu(auth));
}

async function openAuthMenu(auth = getAuth(app!)) {
  const Swal = (window as any).Swal;
  if (!Swal) return;

  const res = await Swal.fire({
    title: uiText("Acceso", "Account access"),
    text: uiText("Elegí cómo querés continuar.", "Choose how you would like to continue."),
    icon: "question",
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: uiText("Ingresar", "Sign in"),
    denyButtonText: uiText("Registrarse", "Register"),
    cancelButtonText: "Cancelar",
    background: "#1e1e1e",
    color: "#fff",
  });

  if (res.isConfirmed) await openLoginModal(auth);
  if (res.isDenied) await openRegisterModal(auth);
}

export function isUserLoggedIn(): boolean {
  const cfg = getConfig();
  if (!cfg || !app) return false;
  const auth = getAuth(app);
  return !!auth.currentUser;
}

export async function openRegisterModal(auth = getAuth(app!)) {
  const Swal = (window as any).Swal;
  if (!Swal) return;

  const res = await Swal.fire({
    title: uiText("Crear cuenta", "Create account"),
    html: `
      <input id="regName" class="swal2-input" placeholder="${uiText("Nombre", "Name")}">
      <input id="regEmail" class="swal2-input" placeholder="${uiText("Email", "Email")}" type="email">
      <input id="regPass" class="swal2-input" placeholder="${uiText("Contraseña", "Password")}" type="password">
      <input id="regPass2" class="swal2-input" placeholder="${uiText("Repetir contraseña", "Repeat password")}" type="password">
      <p style="font-size:0.9rem; opacity:0.8; margin:8px 0 0; text-align:left;">
        ${uiText("Te vamos a enviar un correo de verificación.", "We will send you a verification email.")}
      </p>
    `,
    confirmButtonText: uiText("Crear", "Create"),
    showCancelButton: true,
    cancelButtonText: "Cancelar",
    background: "#1e1e1e",
    color: "#fff",
    focusConfirm: false,
    preConfirm: () => {
      const name = (document.getElementById("regName") as HTMLInputElement)?.value.trim();
      const email = (document.getElementById("regEmail") as HTMLInputElement)?.value.trim();
      const pass = (document.getElementById("regPass") as HTMLInputElement)?.value;
      const pass2 = (document.getElementById("regPass2") as HTMLInputElement)?.value;

      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const strongEnough = (pass || "").length >= 8;

      if (!name || !email || !pass || !pass2) {
        Swal.showValidationMessage(uiText("Completá todos los campos.", "Complete all fields."));
        return;
      }
      if (!emailOk) {
        Swal.showValidationMessage(uiText("Email inválido.", "Invalid email address."));
        return;
      }
      if (!strongEnough) {
        Swal.showValidationMessage(uiText("La contraseña debe tener al menos 8 caracteres.", "The password must be at least 8 characters long."));
        return;
      }
      if (pass !== pass2) {
        Swal.showValidationMessage(uiText("Las contraseñas no coinciden.", "The passwords do not match."));
        return;
      }
      return { name, email, pass };
    },
  });

  if (!res.isConfirmed) return;

  try {
    const cred = await createUserWithEmailAndPassword(auth, res.value.email, res.value.pass);

    if (res.value.name) {
      await updateProfile(cred.user, { displayName: res.value.name });
    }

    auth.languageCode = window.localStorage.getItem("irbis_language") === "en" ? "en" : "es";
    await sendEmailVerification(cred.user);

    // 🔥 CREACIÓN DOCUMENTO FIRESTORE
    const db = getFirestore(app!);

    await setDoc(doc(db, "users", cred.user.uid), {
      uid: cred.user.uid,
      name: res.value.name,
      email: res.value.email,
      role: "official",
      couponUsed: false,
      createdAt: serverTimestamp(),
    });

    await Swal.fire({
      title: uiText("Cuenta creada", "Account created"),
      html: `${uiText("Listo. Te mandamos un email de verificación a", "Done. We sent a verification email to")} <strong>${res.value.email}</strong>.`,
      icon: "success",
      background: "#1e1e1e",
      color: "#fff",
    });

  } catch (e: any) {
    await Swal.fire({
      title: uiText("No se pudo crear", "Could not create account"),
      text: e?.message || uiText("Error inesperado.", "Unexpected error."),
      icon: "error",
      background: "#1e1e1e",
      color: "#fff",
    });
  }
}

export async function openLoginModal(auth = getAuth(app!)) {
  const Swal = (window as any).Swal;
  if (!Swal) return;

  const res = await Swal.fire({
    title: uiText("Iniciar sesión", "Sign in"),
    html: `
      <input id="loginEmail" class="swal2-input" placeholder="Email" type="email">
      <input id="loginPass" class="swal2-input" placeholder="Contraseña" type="password">
    `,
    confirmButtonText: uiText("Entrar", "Continue"),
    showCancelButton: true,
    cancelButtonText: "Cancelar",
    background: "#1e1e1e",
    color: "#fff",
    focusConfirm: false,
    preConfirm: () => {
      const email = (document.getElementById("loginEmail") as HTMLInputElement)?.value.trim();
      const pass = (document.getElementById("loginPass") as HTMLInputElement)?.value;
      if (!email || !pass) {
        Swal.showValidationMessage(uiText("Completá email y contraseña.", "Enter your email and password."));
        return;
      }
      return { email, pass };
    },
  });

  if (!res.isConfirmed) return;

  try {
    await signInWithEmailAndPassword(auth, res.value.email, res.value.pass);
    await Swal.fire({
      title: uiText("Bienvenido", "Welcome"),
      text: uiText("Sesión iniciada.", "You are now signed in."),
      icon: "success",
      background: "#1e1e1e",
      color: "#fff",
      timer: 1400,
      showConfirmButton: false,
    });
  } catch (e: any) {
    await Swal.fire({
      title: uiText("No se pudo iniciar", "Sign-in failed"),
      text: e?.message || "Error inesperado.",
      icon: "error",
      background: "#1e1e1e",
      color: "#fff",
    });
  }
}

function explainNoFirebase() {
  const Swal = (window as any).Swal;
  if (!Swal) return;
  Swal.fire({
    title: uiText("Auth no configurado", "Authentication not configured"),
    html: `
      ${uiText("Para que", "To enable")} <strong>${uiText("Iniciar sesión / Registrarse", "Sign in / Register")}</strong> ${uiText("sea real, necesitás Firebase.", "with real accounts, configure Firebase.")}<br>
      ${uiText("Editá", "Edit")} <code>public/firebase-config.js</code> ${uiText("con tu config.", "with your config.")}
    `,
    icon: "info",
    background: "#1e1e1e",
    color: "#fff",
  });
}

import { addDoc, collection } from "firebase/firestore";

export async function createOrder(orderData: any) {
  const cfg = getConfig();
  if (!cfg) throw new Error("Firebase no configurado");

  // Inicializar si no está inicializado
  if (!app) {
    app = initializeApp(cfg);
  }

  const db = getFirestore(app);
  const auth = getAuth(app);

  // El acceso es opcional: las órdenes de invitados se conservan localmente
  // y no intentan escribir en Firestore.
  if (!auth.currentUser) {
    return { localOnly: true as const };
  }

  const order = {
    ...orderData,
    uid: auth.currentUser.uid,
    email: auth.currentUser.email,
    status: "pending",
    createdAt: serverTimestamp(),
  };

  return await addDoc(collection(db, "orders"), order);
}
