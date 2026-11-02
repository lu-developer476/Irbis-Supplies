import { storageGetString, storageSetString } from "./storage";

const LANGUAGE_KEY = "irbis_language";
const THEME_KEY = "irbis_theme";

type Language = "es" | "en";
type Theme = "dark" | "light";

const translations: Record<Language, Record<string, string>> = {
  es: {
    login: "Ingresar", register: "Registrarse", menu: "Menú", preferences: "Preferencias", catalogLink: "🛍️ Catálogo", cartAction: "🛒 Carrito", authMenu: "Ingresar o registrarse", products: "Catálogo", history: "📝 Historial", cart: "Carrito", closeCart: "Cerrar carrito", fiscal: "Datos fiscales", ivaStatus: "IVA: Responsable Inscripto", shippingLabel: "Forma de envío:", pickup: "Retiro sin cargo", courier: "Courier - $25.000", express: "Envío express – A coordinar", paymentLabel: "Medio de pago:", select: "Seleccionar", cash: "Efectivo", card: "Tarjeta (crédito / débito)", qr: "QR", cardNumber: "Número de tarjeta", cardName: "Nombre en la tarjeta", cardExpiry: "MM/AA", cardCvv: "CVV", qrHelp: "Escaneá para completar el pago.", couponPlaceholder: "Código de cupón", applyCoupon: "Aplicar", discountNote: "*Todos los precios incluyen un 30% de descuento permanente.", subtotal: "Subtotal:", discount: "Descuento:", vat: "IVA (21%):", shipping: "Envío:", total: "Total:", clearCart: "Limpiar Carrito", checkout: "Finalizar Compra", footerRights: "Todos los derechos reservados", footerBuilt: "Built with HTML5, CSS3, JavaScript, TypeScript & CoffeeScript", footerUx: "UX/UI Interface", footerDb: "Database powered by Firebase", footerDeploy: "Deployed on Netlify ®", hero1: "Antes que llegue el final...", hero2: "asegurate de contar con lo necesario para sobrevivir.", hero3: "El momento de prepararse no es cuando ya empezó...", hero4: "Prevenir siempre costará menos que improvisar.", hero5: "Mantente listo para lo que suceda después.", filterSearchLabel: "Buscar", filterSearchPlaceholder: "Nombre o descripción", filterCategoryLabel: "Categoría", filterAllCategories: "Todas", filterRifles: "Rifles", filterShotguns: "Escopetas", filterHandguns: "Pistolas", filterSmgs: "Subfusiles", filterPriceLabel: "Precio", filterAnyPrice: "Cualquier precio", filterColorLabel: "Color", filterAnyColor: "Cualquier color", colorBlack: "Negro", colorGray: "Gris", colorWhite: "Blanco", colorBrown: "Marrón", colorOlive: "Oliva", colorGold: "Dorado", colorOchre: "Ocre", colorGreige: "Greige", colorLilac: "Lila", colorYellow: "Amarillo", colorRed: "Rojo", colorGreen: "Verde", colorPurple: "Púrpura", colorMossGreen: "Verde Musgo", colorTurquoise: "Turquesa", colorPink: "Rosa", colorOrange: "Naranja", filterSortLabel: "Ordenar", sortNameAsc: "Nombre A-Z", sortPriceAsc: "Menor precio", sortPriceDesc: "Mayor precio", clearFilters: "Limpiar filtros", survivalTip1: "Almacená agua potable: calculá al menos 3 litros por persona por día.", survivalTip2: "Prepará un botiquín y revisá periódicamente sus vencimientos.", survivalTip3: "Acordá un punto de encuentro familiar por si se interrumpen las comunicaciones.", survivalTip4: "Tené una linterna y pilas de repuesto en un lugar accesible.", survivalTip5: "Guardá copias de documentos importantes en un lugar seguro y seco.", survivalTip6: "Mantené cargado un power bank para emergencias.", survivalTip7: "Conocé las vías de evacuación y las salidas de tu vivienda.", survivalTip8: "Incluí alimentos no perecederos y un abrelatas manual en tu reserva.", survivalTip9: "Consultá fuentes oficiales antes de actuar ante una alerta.", survivalTip10: "Si usás un generador, mantenelo siempre al aire libre y lejos de ventanas.", newsletterTitle: "Newsletter", newsletterDescription: "Recibí consejos de preparación, seguridad y novedades útiles directamente en tu correo.", newsletterEmailLabel: "Correo electrónico", newsletterEmailPlaceholder: "Tu correo electrónico", newsletterSubmit: "Suscribirme", contactTitle: "Contacto y atención", contactDescription: "¿Tenés una consulta o necesitás asistencia? Escribinos mediante este formulario.", contactNameLabel: "Nombre", contactNamePlaceholder: "Nombre", contactEmailLabel: "Correo electrónico", contactEmailPlaceholder: "Correo electrónico", contactMessageLabel: "Mensaje", contactMessagePlaceholder: "Contanos cómo podemos ayudarte", contactSubmit: "Enviar consulta", claimsLink: "Para reclamos, ingresá acá.", regretLink: "Botón de arrepentimiento"
  },
  en: {
    login: "Sign in", register: "Register", menu: "Menu", preferences: "Preferences", catalogLink: "🛍️ Catalog", cartAction: "🛒 Cart", authMenu: "Sign in or register", products: "Catalog", history: "📝 History", cart: "Cart", closeCart: "Close cart", fiscal: "Tax information", ivaStatus: "VAT: Registered taxpayer", shippingLabel: "Shipping method:", pickup: "Free pickup", courier: "Courier - $25,000", express: "Express shipping – To be arranged", paymentLabel: "Payment method:", select: "Select", cash: "Cash", card: "Card (credit / debit)", qr: "QR", cardNumber: "Card number", cardName: "Name on card", cardExpiry: "MM/YY", cardCvv: "CVV", qrHelp: "Scan to complete payment.", couponPlaceholder: "Coupon code", applyCoupon: "Apply", discountNote: "*All prices include a permanent 30% discount.", subtotal: "Subtotal:", discount: "Discount:", vat: "VAT (21%):", shipping: "Shipping:", total: "Total:", clearCart: "Clear Cart", checkout: "Checkout", footerRights: "All rights reserved", footerBuilt: "Built with HTML5, CSS3, JavaScript, TypeScript & CoffeeScript", footerUx: "UX/UI Interface", footerDb: "Database powered by Firebase", footerDeploy: "Deployed on Netlify ®", hero1: "Before the end arrives...", hero2: "make sure you have what you need to survive.", hero3: "The time to prepare is not once it has already begun...", hero4: "Prevention will always cost less than improvisation.", hero5: "Stay ready for what comes next.", filterSearchLabel: "Search", filterSearchPlaceholder: "Name or description", filterCategoryLabel: "Category", filterAllCategories: "All", filterRifles: "Rifles", filterShotguns: "Shotguns", filterHandguns: "Handguns", filterSmgs: "SMGs", filterPriceLabel: "Price", filterAnyPrice: "Any price", filterColorLabel: "Color", filterAnyColor: "Any color", colorBlack: "Black", colorGray: "Gray", colorWhite: "White", colorBrown: "Brown", colorOlive: "Olive", colorGold: "Gold", colorOchre: "Ochre", colorGreige: "Greige", colorLilac: "Lilac", colorYellow: "Yellow", colorRed: "Red", colorGreen: "Green", colorPurple: "Purple", colorMossGreen: "Moss green", colorTurquoise: "Turquoise", colorPink: "Pink", colorOrange: "Orange", filterSortLabel: "Sort", sortNameAsc: "Name A-Z", sortPriceAsc: "Lowest price", sortPriceDesc: "Highest price", clearFilters: "Clear filters", survivalTip1: "Store drinking water: plan for at least 3 liters per person per day.", survivalTip2: "Prepare a first-aid kit and check expiration dates regularly.", survivalTip3: "Choose a family meeting point in case communications are disrupted.", survivalTip4: "Keep a flashlight and spare batteries somewhere easy to reach.", survivalTip5: "Store copies of important documents in a safe, dry place.", survivalTip6: "Keep a power bank charged for emergencies.", survivalTip7: "Learn the evacuation routes and exits from your home.", survivalTip8: "Include non-perishable food and a manual can opener in your supplies.", survivalTip9: "Check official sources before taking action during an alert.", survivalTip10: "If you use a generator, keep it outdoors and away from windows.", newsletterTitle: "Newsletter", newsletterDescription: "Get practical preparation and safety tips, plus useful updates, straight to your inbox.", newsletterEmailLabel: "Email address", newsletterEmailPlaceholder: "Your email address", newsletterSubmit: "Subscribe", contactTitle: "Contact and support", contactDescription: "Have a question or need assistance? Send us a message using this form.", contactNameLabel: "Name", contactNamePlaceholder: "Name", contactEmailLabel: "Email address", contactEmailPlaceholder: "Email address", contactMessageLabel: "Message", contactMessagePlaceholder: "Tell us how we can help", contactSubmit: "Send message", claimsLink: "For complaints, click here.", regretLink: "Withdrawal button"
  },
};

const isLanguage = (value: string | null): value is Language => value === "es" || value === "en";
const isTheme = (value: string | null): value is Theme => value === "dark" || value === "light";

function setPressed(button: HTMLElement | null, active: boolean) {
  button?.classList.toggle("is-active", active);
  button?.setAttribute("aria-pressed", String(active));
}

function translatePage(language: Language) {
  const dictionary = translations[language];

  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (key && dictionary[key]) element.textContent = dictionary[key];
  });

  document.querySelectorAll<HTMLInputElement>("[data-i18n-placeholder]").forEach((element) => {
    const key = element.dataset.i18nPlaceholder;
    if (key && dictionary[key]) element.placeholder = dictionary[key];
  });

  document.querySelectorAll<HTMLElement>("[data-i18n-aria-label]").forEach((element) => {
    const key = element.dataset.i18nAriaLabel;
    if (key && dictionary[key]) element.setAttribute("aria-label", dictionary[key]);
  });
}

function applyLanguage(language: Language) {
  document.documentElement.lang = language;
  storageSetString(LANGUAGE_KEY, language);

  setPressed(document.getElementById("btnLangEs"), language === "es");
  setPressed(document.getElementById("btnLangEn"), language === "en");
  translatePage(language);
  window.dispatchEvent(new CustomEvent("irbis:languagechange", { detail: { language } }));
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  storageSetString(THEME_KEY, theme);

  setPressed(document.getElementById("btnThemeDark"), theme === "dark");
  setPressed(document.getElementById("btnThemeLight"), theme === "light");
}

export function wirePreferencesUI() {
  const storedLanguage = storageGetString(LANGUAGE_KEY, "");
  const storedTheme = storageGetString(THEME_KEY, "");

  applyLanguage(isLanguage(storedLanguage) ? storedLanguage : "es");
  applyTheme(isTheme(storedTheme) ? storedTheme : "dark");

  document.getElementById("btnLangEs")?.addEventListener("click", () => applyLanguage("es"));
  document.getElementById("btnLangEn")?.addEventListener("click", () => applyLanguage("en"));
  document.getElementById("btnThemeDark")?.addEventListener("click", () => applyTheme("dark"));
  document.getElementById("btnThemeLight")?.addEventListener("click", () => applyTheme("light"));
}
