import { notifyProductAdded, notifyCartCleared, confirmCheckout } from "../coffee/alerts.coffee";
import { storageGetJSON, storageSetJSON, storageGetNumber, storageSetNumber, storageGetString, storageSetString } from "../ts/storage";
import type { CatalogProduct, CatalogProductData, CartEntry } from "../ts/models";
import { isUserLoggedIn, openRegisterModal, createOrder } from "../ts/auth";

const ORDER_COUNTER_KEY = "irbis_order_counter";

// ===============================
// IRBIS SUPPLIES - SCRIPT AVANZADO
// - Orden automática
// - QR en comprobante
// - Factura + imprimir
// - Descargar PDF
// - Historial en localStorage
// - Notificación Netlify Forms
// ===============================

// ===============================
// REFERENCIAS DOM (compatibles con tu index remodelado)
// ===============================
const contenedorProductos = document.getElementById('productosContainer');
const carritoContainer = document.getElementById('carritoContainer');
const totalCarritoDOM = document.getElementById('totalCarrito');
const btnVaciarCarrito = document.getElementById('vaciarCarrito');
const btnCheckout = document.getElementById('btnCheckout');
const productSearch = document.getElementById('productSearch');
const categoryFilter = document.getElementById('categoryFilter');
const priceFilter = document.getElementById('priceFilter');
const colorFilter = document.getElementById('colorFilter');
const sortProducts = document.getElementById('sortProducts');
const filterResults = document.getElementById('filterResults');
const productFilters = document.getElementById('productFilters');

// Drawer del carrito
const btnCart = document.getElementById("btnCart");
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const btnCloseCart = document.getElementById("btnCloseCart");
let cartPreviousFocus: HTMLElement | null = null;
let previousBodyOverflow = "";

// Nuevos elementos de facturación
const invoiceTypeDOM = document.getElementById("invoiceType");
const invoiceNumberDOM = document.getElementById("invoiceNumber");
const cuitDOM = document.getElementById("cuit");

const shippingSelect = document.getElementById("shippingMethod");
const paymentSelect = document.getElementById("paymentMethod");
const cardFields = document.getElementById("cardFields");
const qrSection = document.getElementById("qrSection");
const btnConfirmQR = document.getElementById("btnConfirmQR");
const couponInput = document.getElementById("couponInput");
const applyCouponBtn = document.getElementById("applyCoupon");
const couponFeedback = document.getElementById("couponFeedback");

const subtotalDOM = document.getElementById("subtotal");
const discountDOM = document.getElementById("discount");
const ivaDOM = document.getElementById("iva");
const shippingCostDOM = document.getElementById("shippingCost");

// Opcional: Sección de historial con ID para renderizar
const historialContainer = document.getElementById('historialCompras');

// ===============================
// STORAGE KEYS
// ===============================
const CART_KEY = "carrito";
const ORDERS_KEY = "irbis_orders";
const LANGUAGE_KEY = "irbis_language";


const legacyCheckoutTranslations: Record<"es" | "en", Record<string, string>> = {
  es: {
    colorRequired: "Seleccioná un color antes de agregar al carrito.",
    couponFreeTitle: "Cupón gratis", createAccount: "Crear cuenta", later: "Más tarde",
    orderNotFound: "No se encontró esa orden en el historial.",
    noHistoryTitle: "Sin historial", noHistoryText: "Todavía no hay compras registradas.",
    historyTitle: "Historial de Compras", popupBlocked: "El navegador bloqueó la ventana emergente.",
    cartRequired: "Agregá productos antes de finalizar la compra.",
    qrPaymentRequired: "Confirmá el pago QR antes de continuar.",
    checkoutTitle: "Finalizar compra", fullName: "Nombre completo",
    emailAddress: "Correo electrónico", deliveryAddress: "Dirección de entrega",
    fullNamePlaceholder: "Nombre completo", emailPlaceholder: "nombre@correo.com",
    addressPlaceholder: "Calle, número, localidad", confirmTotal: "Total a confirmar:",
    confirmPurchase: "Confirmar compra",
    checkoutValidation: "Completá nombre, email válido y dirección.",
    orderCompleted: "Compra registrada",
    orderSuccess: "La orden se registró correctamente. El comprobante está disponible.",
    orderErrorTitle: "Error", orderErrorText: "No se pudo registrar la orden de compra. Intentalo más tarde.",
    addonPrompt: "¿Querés agregar estos accesorios?", continue: "Continuar",
    cartHasNoItems: "El carrito no posee artículos", cartCleared: "Carrito limpiado",
    qrConfirmed: "Pago QR confirmado", couponAlreadyUsed: "Ya se aplicó un cupón en esta compra.",
    couponEnterCode: "Ingresá un código para continuar.",
    couponRegisteredOnly: "Este cupón está disponible para clientes registrados.",
    accountRequired: "Cuenta requerida",
    couponRegisteredMessage: "El cupón IRBIS15 es exclusivo para clientes registrados. Creá tu cuenta para obtener el beneficio.",
    cancel: "Cancelar", couponApplied: "Cupón aplicado",
    couponAppliedText: "Se aplicó un 15% adicional por ser cliente oficial.",
    couponInvalid: "El código ingresado no es válido.", couponInvalidTitle: "Cupón inválido."
  },
  en: {
    colorRequired: "Select a color before adding this item to your cart.",
    couponFreeTitle: "Free coupon", createAccount: "Create account", later: "Later",
    orderNotFound: "That order could not be found in your history.",
    noHistoryTitle: "No history", noHistoryText: "No purchases have been recorded yet.",
    historyTitle: "Purchase history", popupBlocked: "Your browser blocked the pop-up window.",
    cartRequired: "Add products before checking out.",
    qrPaymentRequired: "Confirm the QR payment before continuing.",
    checkoutTitle: "Checkout", fullName: "Full name",
    emailAddress: "Email address", deliveryAddress: "Delivery address",
    fullNamePlaceholder: "Full name", emailPlaceholder: "name@example.com",
    addressPlaceholder: "Street, number, city", confirmTotal: "Total to confirm:",
    confirmPurchase: "Confirm purchase",
    checkoutValidation: "Enter your name, a valid email address and delivery address.",
    orderCompleted: "Order completed",
    orderSuccess: "Your order was registered successfully. The receipt is available.",
    orderErrorTitle: "Error", orderErrorText: "The order could not be registered. Please try again later.",
    addonPrompt: "Would you like to add these accessories?", continue: "Continue",
    cartHasNoItems: "Your cart has no items", cartCleared: "Cart cleared",
    qrConfirmed: "QR payment confirmed", couponAlreadyUsed: "A coupon has already been applied to this purchase.",
    couponEnterCode: "Enter a coupon code to continue.",
    couponRegisteredOnly: "This coupon is available to registered customers.",
    accountRequired: "Account required",
    couponRegisteredMessage: "The IRBIS15 coupon is exclusive to registered customers. Create an account to get the benefit.",
    cancel: "Cancel", couponApplied: "Coupon applied",
    couponAppliedText: "An additional 15% discount has been applied for official customers.",
    couponInvalid: "The entered code is invalid.", couponInvalidTitle: "Invalid coupon."
  }
};

const legacyTranslations: Record<"es" | "en", Record<string, string>> = {
  es: { details: "Detalles", selectColor: "Seleccionar", addToCart: "Agregar al carrito", emptyCart: "El carrito está vacío.", emptyHistory: "No hay compras registradas aún.", colorLabel: "Color:", unitPrice: "c/u", coupon: "Cupón", cardSurcharge: "Recargo tarjeta", cashDiscount: "Descuento efectivo", noProducts: "No encontramos productos con esos filtros.", results: "productos encontrados", result: "producto encontrado" },
  en: { details: "Details", selectColor: "Select", addToCart: "Add to cart", emptyCart: "Cart is empty.", emptyHistory: "No purchases have been recorded yet.", colorLabel: "Color:", unitPrice: "each", coupon: "Coupon", cardSurcharge: "Card surcharge", cashDiscount: "Cash discount", noProducts: "No products matched those filters.", results: "products found", result: "product found" },
};

function currentLanguage(): "es" | "en" {
  return storageGetString(LANGUAGE_KEY, "es") === "en" ? "en" : "es";
}

function t(key: string): string {
  return legacyCheckoutTranslations[currentLanguage()][key] || legacyTranslations[currentLanguage()][key] || legacyCheckoutTranslations.es[key] || legacyTranslations.es[key] || key;
}

// ===============================
// ESTADO
// ===============================
let carrito: CartEntry[] = storageGetJSON<CartEntry[]>(CART_KEY, []);

const COUPON_PROMPT_KEY = "irbis_coupon_prompted";

let descuentoCupon = 0;
let ajustePago = 0; // positivo = recargo, negativo = descuento
let qrConfirmado = false;
let cuponAplicado = false;
const IVA_RATE = 0.21;
const DESCUENTO_PERMANENTE = 0.30; // 30% fijo siempre

let orders = storageGetJSON(ORDERS_KEY, []);

// ===============================
// PRODUCTOS
// ===============================
let productos: CatalogProduct[] = [];

// Add-ons (solo accesorios no regulados)
const ADDONS = [
  {
    id: 9001,
    nombre: "Kit de limpieza universal",
    precio: 12000,
    imagen: "./images/addons/cleaning-kit.svg",
  },
  {
    id: 9002,
    nombre: "Guantes tácticos",
    precio: 18000,
    imagen: "./images/addons/gloves.svg",
  },
  {
    id: 9003,
    nombre: "Gafas protectoras",
    precio: 16000,
    imagen: "./images/addons/goggles.svg",
  },
  {
    id: 9004,
    nombre: "Rodilleras reforzadas",
    precio: 22000,
    imagen: "./images/addons/knee-pads.svg",
  },
  {
    id: 9005,
    nombre: "Botas tácticas",
    precio: 64000,
    imagen: "./images/addons/boots.svg",
  },
  {
    id: 9006,
    nombre: "Coderas reforzadas",
    precio: 20000,
    imagen: "./images/addons/elbow-pad.svg",
  },
  {
    id: 9007,
    nombre: "Casco táctico",
    precio: 85000,
    imagen: "./images/addons/helmet.svg",
  },
  {
    id: 9008,
    nombre: "Máscara protectora",
    precio: 27000,
    imagen: "./images/addons/mask.svg",
  },
  {
    id: 9009,
    nombre: "Protector de cuello",
    precio: 15000,
    imagen: "./images/addons/neck.svg",
  },
  {
    id: 9010,
    nombre: "Muslera táctica",
    precio: 30000,
    imagen: "./images/addons/thighband.svg",
  },
  {
    id: 9011,
    nombre: "Munición adicional",
    precio: 40000,
    imagen: "./images/addons/ammo.svg",
  },
  {
    id: 9012,
    nombre: "Mochila táctica",
    precio: 52000,
    imagen: "./images/addons/backpack.svg",
  },
  {
    id: 9013,
    nombre: "Chaleco antibalas",
    precio: 120000,
    imagen: "./images/addons/bulletproof-vest.svg",
  },
];

function openCartDrawer() {
  if (!cartDrawer || cartDrawer.classList.contains("is-open")) return;
  cartPreviousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  previousBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  cartDrawer.inert = false;
  cartDrawer.classList.add("is-open");
  cartDrawer.setAttribute("aria-hidden", "false");
  cartOverlay?.classList.add("is-open");
  cartOverlay?.setAttribute("aria-hidden", "false");
  btnCloseCart?.focus();
}

function closeCartDrawer() {
  if (!cartDrawer?.classList.contains("is-open")) return;
  cartDrawer.classList.remove("is-open");
  cartDrawer.setAttribute("aria-hidden", "true");
  cartDrawer.inert = true;
  cartOverlay?.classList.remove("is-open");
  cartOverlay?.setAttribute("aria-hidden", "true");
  document.body.style.overflow = previousBodyOverflow;
  cartPreviousFocus?.focus();
  cartPreviousFocus = null;
}

btnCart?.addEventListener("click", openCartDrawer);
btnCloseCart?.addEventListener("click", closeCartDrawer);
cartOverlay?.addEventListener("click", closeCartDrawer);

document.addEventListener("keydown", (e) => {
  if (!cartDrawer?.classList.contains("is-open")) return;
  if (e.key === "Escape") {
    closeCartDrawer();
    return;
  }
  if (e.key === "Tab") {
    const focusable = Array.from(cartDrawer.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter((element) => element.offsetParent !== null);
    if (!focusable.length) {
      e.preventDefault();
      cartDrawer.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});

const FECHA_BASE = new Date("2024-01-01");
const INFLACION_MENSUAL = 0.08; // 8% mensual

// ===============================
// CALCULAR INFLACIÓN LOCAL
// ===============================
function calcularPrecioInflacion(precioBase: number): number {
  const hoy = new Date();

  const meses =
    (hoy.getFullYear() - FECHA_BASE.getFullYear()) * 12 +
    (hoy.getMonth() - FECHA_BASE.getMonth());

  return Math.round(
    precioBase * Math.pow(1 + INFLACION_MENSUAL, meses)
  );
}

// ===============================
// VALORIZACIÓN PRODUCOTS
// ===============================
function obtenerFactorValorizacion(producto: CatalogProductData): number {
  let factor = 1;

  if (producto.precioBase >= 4000) factor += 0.30;
  if (producto.nombre.includes("Táctica") || producto.nombre.includes("Tactical")) factor += 0.20;
  if (producto.nombre.includes("AK") || producto.nombre.includes("FN")) factor += 0.15;
  if (producto.colores.length >= 5) factor += 0.05;

  return factor;
}

function obtenerFactorTiempo(): number {
  const añoBase = 2026;
  const añoActual = new Date().getFullYear();
  const diferencia = añoActual - añoBase;

  return Math.pow(1.05, diferencia); // 5% anual acumulativo
}

// ===============================
// CARGAR PRODUCTOS
// ===============================
function isCatalogProductData(value: unknown): value is CatalogProductData {
  if (!value || typeof value !== "object") return false;
  const product = value as Partial<CatalogProductData>;
  return Number.isInteger(product.id) &&
    typeof product.nombre === "string" &&
    typeof product.descripcion === "string" &&
    typeof product.precioBase === "number" &&
    Number.isFinite(product.precioBase) &&
    product.precioBase > 0 &&
    typeof product.imagen === "string" &&
    Array.isArray(product.colores) &&
    product.colores.every((color) =>
      color && typeof color.nombre === "string" && typeof color.hex === "string"
    );
}

async function cargarProductos() {
  try {
    const response = await fetch("./data.json");
    if (!response.ok) throw new Error("No se pudo cargar el catálogo (HTTP " + response.status + ").");

    const catalogo: unknown = await response.json();
    if (!Array.isArray(catalogo) || !catalogo.every(isCatalogProductData)) {
      throw new Error("El catálogo tiene un formato inválido.");
    }
    const productosBase = catalogo as CatalogProductData[];

    let factorInflacion: number | null = null;

    // Intentar usar Netlify Function
    try {
      const api = await fetch("/.netlify/functions/prices");
      if (!api.ok) throw new Error("Servicio de precios no disponible (HTTP " + api.status + ").");
      const data: unknown = await api.json();
      const factor = (data as { factor?: unknown } | null)?.factor;
      if (typeof factor !== "number" || !Number.isFinite(factor) || factor <= 0) {
        throw new Error("El servicio devolvió un factor de precios inválido.");
      }
      factorInflacion = factor;
    } catch (e) {
      console.log("Netlify no disponible. Usando inflación local.");
    }

      productos = productosBase.map(p => {
      
        const inflacion = factorInflacion
          ? factorInflacion
          : calcularPrecioInflacion(p.precioBase) / p.precioBase;
      
        const valorizacion = obtenerFactorValorizacion(p);
        const tiempo = obtenerFactorTiempo();
      
        const precioFinal = Math.round(
          p.precioBase * inflacion * valorizacion * tiempo
        );
      
        return {
          ...p,
          precio: precioFinal
        };
      });
    
      // ORDEN ALFABÉTICO
      productos.sort((a, b) =>
        a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
      );

    renderProductos();

  } catch (error) {
    console.error("Error cargando productos:", error);
  }
}

// ===============================
// HELPERS
// ===============================
function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function safeAssetPath(value: unknown): string {
  const path = typeof value === "string" ? value : "";
  return /^(?:\.\/)?[a-zA-Z0-9_./-]+$/.test(path) && !path.includes("..") ? path : "";
}

function currency(n: number): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n);
}

function nowARString(): string {
  return new Date().toLocaleString('es-AR', { hour12: false });
}

function generarOrdenId(): string {
  let counter = storageGetNumber(ORDER_COUNTER_KEY, 0);
  counter++;
  storageSetNumber(ORDER_COUNTER_KEY, counter);

  const year = new Date().getFullYear();
  return `IRB-${year}-${String(counter).padStart(6, "0")}`;
}

function generarFactura() {
  if (!invoiceTypeDOM || !invoiceNumberDOM) return;

  const tipos = ["A", "B", "C"];
  const tipo = tipos[Math.floor(Math.random() * tipos.length)];
  const numero = Math.floor(10000000 + Math.random() * 90000000);

  invoiceTypeDOM.innerText = tipo;
  invoiceNumberDOM.innerText = numero;
}

function guardarCarrito() {
  storageSetJSON(CART_KEY, carrito);
}

function guardarOrders() {
  // Limitamos historial para que no explote el storage
  if (orders.length > 50) orders = orders.slice(0, 50);
  storageSetJSON(ORDERS_KEY, orders);
}

function totalActual(): number {
  return carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
}

function calcularResumen() {

  const subtotal = totalActual();
  const envioSeleccionado = shippingSelect ? Number(shippingSelect.value) : 0;
  const envio = Number.isFinite(envioSeleccionado) && envioSeleccionado >= 0 ? envioSeleccionado : 0;

  // 30% permanente
  const descuentoBase = subtotal * DESCUENTO_PERMANENTE;
  // Cupón adicional
  const descuentoExtra = subtotal * descuentoCupon;
  const descuentoTotal = descuentoBase + descuentoExtra;
  const baseImponible = subtotal - descuentoTotal;
  const iva = baseImponible * IVA_RATE;
  const totalAntesPago = baseImponible + iva + envio;
  const total = totalAntesPago + (totalAntesPago * ajustePago);

  return {
    subtotal,
    descuentoBase,
    descuentoExtra,
    iva,
    envio,
    ajusteMonto: totalAntesPago * ajustePago,
    total
  };
}

function traducirMetodoPago(valor: string): string {
  switch (valor) {
    case "cash":
      return "Efectivo";
    case "card":
      return "Tarjeta (crédito / débito)";
    case "qr":
      return "Código QR";
    default:
      return "No especificado";
  }
}

function maskCard(num) {
  const clean = String(num || "").replace(/\s+/g, "");
  const last4 = clean.slice(-4);
  return last4 ? `**** **** **** ${last4}` : "**** **** **** ****";
}

function normalizarTextoCatalogo(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase(currentLanguage());
}

function obtenerCategoriaProducto(producto) {
  const texto = normalizarTextoCatalogo(`${producto.nombre} ${producto.descripcion}`);

  if (texto.includes("escopeta")) return "shotgun";
  if (texto.includes("pistola") || texto.includes("revolver")) return "handgun";
  if (texto.includes("subfusil")) return "smg";
  if (texto.includes("rifle") || texto.includes("fusil") || texto.includes("carabina")) return "rifle";

  return "accessory";
}

function obtenerProductosFiltrados(): CatalogProduct[] {
  const busqueda = normalizarTextoCatalogo((productSearch?.value || "").trim());
  const categoria = categoryFilter?.value || "all";
  const rangoPrecio = priceFilter?.value || "all";
  const color = colorFilter?.value || "all";
  const orden = sortProducts?.value || "name-asc";

  let visibles = productos.filter(producto => {
    const coincideBusqueda = !busqueda ||
      normalizarTextoCatalogo(producto.nombre).includes(busqueda) ||
      normalizarTextoCatalogo(producto.descripcion).includes(busqueda);
    const coincideCategoria = categoria === "all" || obtenerCategoriaProducto(producto) === categoria;
    let coincidePrecio = true;

    if (rangoPrecio !== "all") {
      const [min, max] = rangoPrecio.split("-").map(Number);
      coincidePrecio = producto.precio >= min && producto.precio <= max;
    }

    const coincideColor = color === "all" || producto.colores.some(
      variante => normalizarTextoCatalogo(variante.nombre) === normalizarTextoCatalogo(color)
    );

    return coincideBusqueda && coincideCategoria && coincidePrecio && coincideColor;
  });

  visibles = [...visibles].sort((a, b) => {
    if (orden === "price-asc") return a.precio - b.precio;
    if (orden === "price-desc") return b.precio - a.precio;
    return a.nombre.localeCompare(b.nombre, currentLanguage(), { sensitivity: "base" });
  });

  return visibles;
}

// ===============================
// RENDER PRODUCTOS
// ===============================
function renderProductos(): void {
  if (!contenedorProductos) return;

  contenedorProductos.innerHTML = "";

  const productosVisibles = obtenerProductosFiltrados();

  if (filterResults) {
    const sinResultados = productosVisibles.length === 0;
    filterResults.innerText = sinResultados
      ? t("noProducts")
      : `${productosVisibles.length} ${t(productosVisibles.length === 1 ? "result" : "results")}`;
    filterResults.classList.toggle("is-empty", sinResultados);
    filterResults.dataset.resultCount = String(productosVisibles.length);
    filterResults.setAttribute("role", "status");
    filterResults.setAttribute("aria-live", "polite");
    filterResults.setAttribute("aria-atomic", "true");
  }

  productosVisibles.forEach(producto => {

    const card = document.createElement("div");
    card.classList.add("contenedorDeCard");

    card.innerHTML = `
      <img src="${escapeHtml(safeAssetPath(producto.imagen))}" alt="${escapeHtml(producto.nombre)}" width="320" height="220" loading="lazy" decoding="async">
      <h3>${escapeHtml(producto.nombre)}</h3>

      <button class="btn-detalles" type="button" data-id="${producto.id}" aria-expanded="false" aria-controls="detalles-${producto.id}">
        ${t("details")}
      </button>

      <div class="detalles-container" id="detalles-${producto.id}" hidden>
        
        <p class="descripcion-producto">
          ${escapeHtml(producto.descripcion)}
        </p>

        <div class="colores-container">
          ${producto.colores.map(c => `
            <button type="button" class="color-swatch"
                  data-producto="${producto.id}"
                  data-color="${escapeHtml(c.nombre)}"
                  title="${escapeHtml(c.nombre)}"
                  aria-label="${t("selectColor")} ${escapeHtml(c.nombre)}"
                  aria-pressed="false"
                  style="appearance:none;padding:0;border-radius:50%;min-width:18px;min-height:18px;line-height:0;
                    background:${/^#[0-9a-fA-F]{3,8}$/.test(c.hex) ? c.hex : '#777'};
                    display:inline-block;
                    width:18px;
                    height:18px;
                    border-radius:50%;
                    margin-right:4px;
                    border:1px solid #333;
                    cursor:pointer;
                  ">
            </button>
          `).join("")}
        </div>

      </div>

      <p class="precio-producto">
        ${currency(producto.precio)}
      </p>

      <button type="button" class="btn-primary" data-id="${producto.id}" aria-label="${t("addToCart")}: ${escapeHtml(producto.nombre)}">
        ${t("addToCart")}
      </button>
    `;

    contenedorProductos.appendChild(card);
  });
}

// ===============================
// CARRITO
// ===============================

// 🔹 FUNCIÓN GLOBAL
function agregarAlCarrito(id) {

  const carritoEstabaVacio = carrito.length === 0;

  const producto = productos.find(p => p.id === id);
  if (!producto) return;

  const colorActivo = document.querySelector(
    `.color-swatch.color-activo[data-producto="${id}"]`
  );

  if (!colorActivo) {
    alertaError(t("colorRequired"));
    return;
  }

  const color = colorActivo.dataset.color;

  const existe = carrito.find(
    p => p.id === id && p.color === color
  );

  if (existe) {
    existe.cantidad++;
  } else {
    carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: 1,
      color: color,
      imagen: producto.imagen
    });
  }

  guardarCarrito();
  renderCarrito();
  alertaProductoAgregado(`${escapeHtml(producto.nombre)} (${color})`);

  // Abrimos el drawer para que el usuario vea que se cargó.
  openCartDrawer();

  // Pop-up: 1er producto agregado => incentivo de registro + cupón
  const yaMostrado = storageGetString(COUPON_PROMPT_KEY) === "1";
  if (carritoEstabaVacio && !yaMostrado && !isUserLoggedIn()) {
    storageSetString(COUPON_PROMPT_KEY, "1");
    Swal.fire({
      title: t("couponFreeTitle"),
      html: `Creá tu cuenta y obtené <strong>15% OFF</strong> con el cupón <code>IRBIS15</code>.`,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: t("createAccount"),
      cancelButtonText: t("later"),
      background: "#1e1e1e",
      color: "#fff",
    }).then(async (r) => {
      if (r.isConfirmed) {
        await openRegisterModal();
      }
    });
  }
}

// 🔹 MODIFICAR CANTIDADES
function modificarCantidad(id, color, cambio) {

  const index = carrito.findIndex(
    p => p.id === id && p.color === color
  );

  if (index === -1) return;

  carrito[index].cantidad += cambio;

  if (carrito[index].cantidad <= 0) {
    carrito.splice(index, 1);
  }

  guardarCarrito();
  renderCarrito();
}

window.modificarCantidad = modificarCantidad;
window.agregarAlCarrito = agregarAlCarrito;

// 🔹 RENDER DEL CARRITO
function renderCarrito(): void {
  if (!carritoContainer || !totalCarritoDOM) return;

  carritoContainer.innerHTML = "";

  if (carrito.length === 0) {
    carritoContainer.innerHTML = `<p class="cart-empty-state">${t("emptyCart")}</p>`;
    totalCarritoDOM.innerText = currency(0);
    if (subtotalDOM) subtotalDOM.innerText = currency(0);
    if (discountDOM) discountDOM.innerText = currency(0);
    if (ivaDOM) ivaDOM.innerText = currency(0);
    if (shippingCostDOM) shippingCostDOM.innerText = currency(0);
    if (btnVaciarCarrito) {
      btnVaciarCarrito.disabled = true;
      btnVaciarCarrito.classList.add("btn-disabled");
    }
    if (btnCheckout) {
      btnCheckout.disabled = true;
      btnCheckout.classList.add("btn-disabled");
    }
    return;
  }

  // DESHABILITA BOTÓN SI EL CARRITO ESTÁ VACÍO
  if (btnVaciarCarrito) {
    btnVaciarCarrito.disabled = false;
    btnVaciarCarrito.classList.remove("btn-disabled");
  }
  if (btnCheckout) {
    const checkoutBlocked = paymentSelect?.value === "qr" && !qrConfirmado;
    btnCheckout.disabled = checkoutBlocked;
    btnCheckout.classList.toggle("btn-disabled", checkoutBlocked);
  }

  carrito.forEach(p => {
    const row = document.createElement("div");
    row.classList.add("item-carrito");

    const imgSrc = p.imagen || productos.find(x => x.id === p.id)?.imagen || "";

    row.innerHTML = `
      ${imgSrc ? `<img class="item-carrito__thumb" src="${escapeHtml(safeAssetPath(imgSrc))}" alt="" width="64" height="64" loading="lazy" decoding="async">` : ""}
      <div class="item-carrito__info">
        <h4>${escapeHtml(p.nombre)}</h4>
        <p class="item-carrito__variant">${t("colorLabel")} <strong>${escapeHtml(p.color)}</strong></p>
        <p class="item-carrito__precio">
          <span>${currency(p.precio)} ${t("unitPrice")}</span>
          <strong>${currency(p.precio * p.cantidad)}</strong>
        </p>
      </div>
      <div class="item-carrito__acciones" aria-label="Cantidad de ${escapeHtml(p.nombre)}">
        <button class="btn-secondary" type="button" data-quantity-change="-1" data-product-id="${Number(p.id)}" data-color="${escapeHtml(p.color)}" aria-label="Reducir cantidad de ${escapeHtml(p.nombre)}">−</button>
        <output class="item-carrito__cantidad" aria-live="polite" aria-label="Cantidad">${p.cantidad}</output>
        <button class="btn-secondary" type="button" data-quantity-change="1" data-product-id="${Number(p.id)}" data-color="${escapeHtml(p.color)}" aria-label="Aumentar cantidad de ${escapeHtml(p.nombre)}">+</button>
      </div>
    `;
    carritoContainer.appendChild(row);
  });

  const resumen = calcularResumen();
  
  if (paymentSelect) {
  const metodo = paymentSelect.value;

  if (!metodo) {
    console.log("Ajuste: -----");
  } else if (resumen.ajusteMonto !== 0) {
    console.log(
      resumen.ajusteMonto > 0
        ? `${t("cardSurcharge")}: + ${currency(resumen.ajusteMonto)}`
        : `${t("cashDiscount")}: - ${currency(Math.abs(resumen.ajusteMonto))}`
    );
  }
}

  if (subtotalDOM) subtotalDOM.innerText = currency(resumen.subtotal);
  if (discountDOM) {
    let texto = `- ${currency(resumen.descuentoBase)}`;
  
    if (resumen.descuentoExtra > 0) {
      texto += `  |  ${t("coupon")}: - ${currency(resumen.descuentoExtra)}`;
    }
  
    discountDOM.innerText = texto;
  }
  
  if (ivaDOM) ivaDOM.innerText = currency(resumen.iva);
  if (shippingCostDOM) shippingCostDOM.innerText = currency(resumen.envio);
  
  totalCarritoDOM.innerText = currency(resumen.total);

}

// ===============================
// ALERTAS (SweetAlert2 dark)
// ===============================
function alertaProductoAgregado(nombre) {
  notifyProductAdded(nombre);
}

function alertaError(msg) {
  Swal.fire({
    title: "Error",
    text: msg,
    icon: "error",
    background: "#1e1e1e",
    color: "#fff"
  });
}

// ===============================
// HISTORIAL
// ===============================

function renderHistorial(): void {
  if (!historialContainer) return;

  historialContainer.innerHTML = "";

  if (!orders.length) {
    historialContainer.innerHTML = `<p>${t("emptyHistory")}</p>`;
    return;
  }

  const ul = document.createElement("ul");
  ul.classList.add("historial-lista");

  orders.forEach(o => {
    const li = document.createElement("li");
    li.classList.add("historial-item");

    li.innerHTML = `
      <div>
        <strong>${escapeHtml(o.orderId)}</strong> — ${escapeHtml(o.date)}
        <div>Total: ${currency(o.total)}</div>
      </div>
      <button class="btn-secondary ver-factura-btn"
              data-order="${escapeHtml(o.orderId)}">
        Ver factura
      </button>
    `;

    ul.appendChild(li);
  });

  historialContainer.appendChild(ul);
}

function abrirFacturaDesdeHistorial(orderId) {
  const o = orders.find(x => x.orderId === orderId);
  if (!o) {
    alertaError(t("orderNotFound"));
    return;
  }

  abrirVentanaFactura(o);
}

// ===============================
// BOTÓN NAVBAR HISTORIAL
// ===============================

const btnHistorial = document.getElementById("btnHistorial");

btnHistorial?.addEventListener("click", () => {

  if (!orders.length) {
    Swal.fire({
      title: t("noHistoryTitle"),
      text: t("noHistoryText"),
      icon: "info",
      background: "#1e1e1e",
      color: "#fff"
    });
    return;
  }

  const lista = orders.map(o => `
    <div class="historial-item historial-item--modal">
      <div>
        <strong>${escapeHtml(o.orderId)}</strong>
        <p>Fecha: ${escapeHtml(o.date)}</p>
        <p>Total: <strong>${currency(o.total)}</strong></p>
      </div>
      <button class="btn-secondary ver-factura-modal" type="button"
              data-order="${escapeHtml(o.orderId)}">
        Ver factura
      </button>
    </div>
  `).join("");

  Swal.fire({
    title: t("historyTitle"),
    html: `<div style="max-height:350px; overflow:auto;">${lista}</div>`,
    width: 600,
    background: "#1e1e1e",
    color: "#fff",
    showConfirmButton: false,
    didOpen: () => {

      document.querySelectorAll<HTMLButtonElement>(".ver-factura-modal").forEach((btn) => {
        btn.addEventListener("click", () => {
          const orderId = btn.dataset.order;
          if (orderId) abrirFacturaDesdeHistorial(orderId);
        });
      });

    }
  });

});

// ===============================
// EVENT DELEGATION PARA LISTA FIJA
// ===============================

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("ver-factura-btn")) {
    const orderId = e.target.dataset.order;
    abrirFacturaDesdeHistorial(orderId);
  }
});

// Toggle Detalles
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-detalles");
  if (!btn) return;

  const id = btn.dataset.id;
  const contenedor = document.getElementById(`detalles-${id}`);

  if (!contenedor) return;

  const expanded = btn.getAttribute("aria-expanded") === "true";
  btn.setAttribute("aria-expanded", String(!expanded));
  contenedor.hidden = expanded;
});

// Selección de color
document.addEventListener("click", (e) => {
  const swatch = e.target.closest(".color-swatch");
  if (!swatch) return;

  const productoId = swatch.dataset.producto;

  // Limpiar selección previa del mismo producto
  document.querySelectorAll(`.color-swatch[data-producto="${productoId}"]`)
    .forEach(el => {
      el.classList.remove("color-activo");
      el.setAttribute("aria-pressed", "false");
    });

  swatch.classList.add("color-activo");
  swatch.setAttribute("aria-pressed", "true");
});

// ===============================
// NETLIFY FORMS (notificación)
// ===============================
function notificarNetlify(order) {
  const formData = new FormData();
  formData.append("form-name", "orden-compra");
  formData.append("orderId", order.orderId);
  formData.append("nombre", order.customer.nombre);
  formData.append("email", order.customer.email);
  formData.append("direccion", order.customer.direccion);
  formData.append("detalle", order.items.map(i => `${escapeHtml(i.nombre)} x${i.cantidad}`).join(", "));
  formData.append("total", order.total);

  // No frenamos el UX si falla: es notificación, no “pago”
  fetch("/", { method: "POST", body: formData }).catch(() => {});
}

// ===============================
// FACTURA + QR + PDF
// ===============================
function invoiceHTML(order) {
  const itemsRows = order.items.map(i => `
    <tr>
      <td>${escapeHtml(i.nombre)}<div class="muted small">Color: ${escapeHtml(i.color || "N/A")}</div></td>
      <td style="text-align:center;">${i.cantidad}</td>
      <td style="text-align:right;">${currency(i.precio)}</td>
      <td style="text-align:right;">${currency(i.precio * i.cantidad)}</td>
    </tr>
  `).join("");

  // En el QR codificamos un “payload” útil (podés cambiarlo por URL real)
  const qrPayload = JSON.stringify({
    orderId: order.orderId,
    total: order.total,
    date: order.date,
    email: order.customer.email
  });

  // Recalculamos el resumen para mostrar desglose real
  const subtotalBruto = order.items.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  const descuentoBase = subtotalBruto * DESCUENTO_PERMANENTE;
  const descuentoExtra = subtotalBruto * (order.couponRate || 0);
  const descuentoTotal = descuentoBase + descuentoExtra;
  
  const baseImponible = subtotalBruto - descuentoTotal;
  const iva = baseImponible * IVA_RATE;

  // envío estimado (si lo querés mostrar correctamente después)
  const envio = Number.isFinite(order.envio) && order.envio > 0 ? order.envio : 0;

  // reconstruimos el total antes del ajuste
  const totalAntesPago = baseImponible + iva + envio;
  const ajusteMonto = totalAntesPago * order.ajustePago;
    
  // En el PDF usamos el total guardado en la orden
  const totalFinal = order.total;

  return `
  <div id="invoice" class="invoice">
    <div class="top">
      <div>
        <div class="brand">IRBIS SUPPLIES</div>
        <div class="muted">Comprobante de pago</div>
      </div>
      <div class="meta">
        <div><strong>Factura ${escapeHtml(order.invoiceType)} Nº ${escapeHtml(order.invoiceNumber)}</strong></div>
        <div><strong>Orden:</strong> ${escapeHtml(order.orderId)}</div>
        <div><strong>Fecha:</strong> ${escapeHtml(order.date)}</div>
      </div>
    </div>

    <div class="grid">
      <div class="box">
        <div class="boxTitle">Cliente</div>
        <div><strong>${escapeHtml(order.customer.nombre)}</strong></div>
        <div>${escapeHtml(order.customer.email)}</div>
        <div>${escapeHtml(order.customer.direccion)}</div>
      </div>

      <div class="box">
        <div class="boxTitle">Pago</div>
        <div><strong>Método:</strong> ${traducirMetodoPago(order.payment.metodo)}</div>
        ${order.payment.metodo === "card"
          ? `<div><strong>Tarjeta:</strong> ${order.payment.cardMasked}</div>`
          : ""}
        <div><strong>Estado:</strong> Aprobado</div>
      </div>

      <div class="box qrBox">
        <div id="qr"></div>
        <div class="muted small">Más información</div>
      </div>
    </div>

    <table class="items">
      <thead>
        <tr>
          <th>Producto</th>
          <th style="text-align:center;">Cantidad</th>
          <th style="text-align:right;">Precio</th>
          <th style="text-align:right;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <div class="totals">
      <div class="totalsBox">
        <div class="row">
          <span>Subtotal bruto</span>
          <span>${currency(subtotalBruto)}</span>
        </div>
    
        <div class="row">
          <span>Descuento permanente (30%)</span>
          <span>- ${currency(descuentoBase)}</span>
        </div>
    
        ${descuentoExtra > 0 ? `
        <div class="row">
          <span>Cupón adicional (15%)</span>
          <span>- ${currency(descuentoExtra)}</span>
        </div>
        ` : ""}
    
        <div class="row">
          <span>IVA (21%)</span>
          <span>${currency(iva)}</span>
        </div>
    
        <div class="row">
          <span>Envío</span>
          <span>${currency(envio)}</span>
        </div>
        
        ${order.ajustePago !== 0 ? `
          <div class="row">
            <span>
              ${order.ajustePago > 0
                ? "Recargo por tarjeta (10%)"
                : "Descuento por pago en efectivo (5%)"}
            </span>
            <span>
              ${order.ajustePago > 0 ? "+" : "-"} ${currency(Math.abs(ajusteMonto))}
            </span>
          </div>
        ` : ""}
    
        <div class="row grand">
          <span>Total</span>
          <span>${currency(totalFinal)}</span>
        </div>
      </div>
    </div>

    <div class="footer">
      <div class="muted small">
        Irbis Supplies · Gracias por tu compra. Conservá este comprobante para cualquier consulta relacionada con tu pedido.
      </div>
    </div>
  </div>
  `;
}

function generarNumeroFactura() {
  return String(
    Math.floor(10000000 + Math.random() * 90000000)
  );
}

  // Inyectamos libs en la ventana para QR + PDF
function abrirVentanaFactura(order) {
  const w = window.open("", "_blank");

  if (!w) {
    alertaError(t("popupBlocked"));
    return;
  }
  
  w.document.write(`
    <html>
      <head>
        <title>Factura ${escapeHtml(order.orderId)} - Irbis Supplies</title>
        <meta charset="UTF-8" />

        <style>
          body {
            font-family: Arial, Helvetica, sans-serif;
            padding: 24px;
            background:#0f0f12;
            color:#eaeaea;
          }

          .invoice {
            background:#14141a;
            border:1px solid #2a2a33;
            border-radius:16px;
            padding:18px;
          }

          .top {
            display:flex;
            justify-content:space-between;
            border-bottom:1px solid #2a2a33;
            padding-bottom:12px;
            margin-bottom:12px;
          }

          .brand { font-size:20px; font-weight:900; }
          .muted { color:#a9a9b2; }

          .grid {
            display:grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap:12px;
            margin:12px 0;
          }

          .box {
            background:#101016;
            border:1px solid #2a2a33;
            border-radius:12px;
            padding:12px;
          }

          table {
            width:100%;
            border-collapse:collapse;
            margin-top:12px;
          }

          th, td {
            padding:8px;
            border-bottom:1px solid #2a2a33;
          }

          th { text-align:left; }

          .totals {
            display:flex;
            justify-content:flex-end;
            margin-top:20px;
          }

          .totalsBox {
            width:320px;
            background:#101016;
            border:1px solid #2a2a33;
            border-radius:12px;
            padding:12px;
          }

          .row {
            display:flex;
            justify-content:space-between;
            padding:6px 0;
          }

          .grand {
            font-weight:900;
            border-top:1px solid #2a2a33;
            margin-top:8px;
            padding-top:10px;
          }

          .small { font-size:12px; }
          .meta { text-align:right; overflow-wrap:anywhere; }
          .items { table-layout:fixed; }
          .items th:first-child, .items td:first-child { width:42%; }
          .items td { overflow-wrap:anywhere; }
          @media (max-width:700px) {
            body { padding:12px; }
            .invoice { padding:12px; }
            .top { flex-direction:column; gap:12px; }
            .meta { text-align:left; }
            .grid { grid-template-columns:1fr; }
            .items { font-size:12px; }
            .items th, .items td { padding:6px 4px; }
            .totalsBox { width:100%; }
          }
          @media print {
            body { padding:0; background:#fff; color:#111; }
            .invoice, .box, .totalsBox { background:#fff; color:#111; border-color:#ddd; }
            .muted { color:#555; }
          }
        </style>

        <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
      </head>

      <body>
        ${invoiceHTML(order)}

        <script>
          const payload = ${JSON.stringify({
            orderId: order.orderId,
            total: order.total,
            date: order.date,
            email: order.customer.email
          })};

          new QRCode(document.getElementById("qr"), {
            text: JSON.stringify(payload),
            width: 120,
            height: 120
          });
        </script>
      </body>
    </html>
  `);

  w.document.close();
}

// ===============================
// CHECKOUT (con orden + historial + factura)
// ===============================
btnCheckout?.addEventListener("click", () => {
  if (!carrito.length) {
    return alertaError(t("cartRequired"));
  }

  if (paymentSelect?.value === "qr" && !qrConfirmado) {
    return alertaError(t("qrPaymentRequired"));
  }

  const mostrarFormularioCheckout = () => {
    const resumen = calcularResumen();
    const total = resumen.total;

    Swal.fire({
      title: t("checkoutTitle"),
      html: `
        <label class="checkout-field" for="nombreCliente">${t("fullName")}
          <input id="nombreCliente" class="swal2-input" type="text" autocomplete="name" maxlength="120" placeholder="${t("fullNamePlaceholder")}" required>
        </label>
        <label class="checkout-field" for="emailCliente">${t("emailAddress")}
          <input id="emailCliente" class="swal2-input" type="email" autocomplete="email" maxlength="160" placeholder="${t("emailPlaceholder")}" required>
        </label>
        <label class="checkout-field" for="direccionCliente">${t("deliveryAddress")}
          <input id="direccionCliente" class="swal2-input" type="text" autocomplete="street-address" maxlength="240" placeholder="${t("addressPlaceholder")}" required>
        </label>
        <p class="checkout-total">${t("confirmTotal")} <strong>${currency(total)}</strong></p>
      `,
      customClass: { htmlContainer: "checkout-form-content" },
      confirmButtonText: t("confirmPurchase"),
      showCancelButton: true,
      background: "#1e1e1e",
      color: "#fff",
      didOpen: () => {
        (document.getElementById("nombreCliente") as HTMLInputElement | null)?.focus();
      },
      preConfirm: () => {
        const nombre = (document.getElementById("nombreCliente") as HTMLInputElement | null)?.value.trim() || "";
        const email = (document.getElementById("emailCliente") as HTMLInputElement | null)?.value.trim() || "";
        const direccion = (document.getElementById("direccionCliente") as HTMLInputElement | null)?.value.trim() || "";
        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!nombre || nombre.length > 120 || !emailValido || !direccion || direccion.length > 240) {
          Swal.showValidationMessage(t("checkoutValidation"));
          return;
        }

        return { nombre, email, direccion };
      }
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      const order = {
        orderId: generarOrdenId(),
        date: nowARString(),
        invoiceType: "B",
        invoiceNumber: generarNumeroFactura(),
        customer: {
          nombre: result.value.nombre,
          email: result.value.email,
          direccion: result.value.direccion
        },
        items: carrito.map(p => ({
          id: p.id,
          nombre: p.nombre,
          precio: p.precio,
          cantidad: p.cantidad,
          color: p.color,
          imagen: p.imagen
        })),
        total: total,
        couponRate: descuentoCupon,
        envio: resumen.envio,
        payment: {
          metodo: paymentSelect?.value || "tarjeta",
          cardMasked: "****"
        },
        ajustePago: ajustePago
      };

      try {
        await createOrder(order);
        
        // 🔹 ENVÍO DE FACTURA POR EMAIL (Serverless)
        const invoiceResponse = await fetch("/.netlify/functions/sendInvoice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: order.customer.email,
            name: order.customer.nombre,
            total: order.total,
            items: order.items.map(i => ({
              name: i.nombre,
              price: i.precio,
              quantity: i.cantidad
            })),
            orderId: order.orderId,
            date: order.date
          }),
        });
        if (!invoiceResponse.ok) {
          const invoiceError = await invoiceResponse.json().catch(() => ({}));
          console.warn("Comprobante no enviado:", invoiceError.message || invoiceResponse.status);
        }
        
        // respaldo visual local
        orders = [order, ...orders];
        guardarOrders();
        renderHistorial();
        
        notificarNetlify(order);
        abrirVentanaFactura(order);

        Swal.fire({
          title: t("orderCompleted"),
          text: t("orderSuccess"),
          icon: "success",
          background: "#1e1e1e",
          color: "#fff"
        });

        carrito = [];
        descuentoCupon = 0;
        cuponAplicado = false;
        qrConfirmado = false;
        ajustePago = 0;
        if (paymentSelect) paymentSelect.value = "";
        cardFields?.classList.add("hidden");
        qrSection?.classList.add("hidden");
        if (couponInput) {
          (couponInput as HTMLInputElement).value = "";
          (couponInput as HTMLInputElement).readOnly = false;
        }
        if (applyCouponBtn) (applyCouponBtn as HTMLButtonElement).disabled = false;
        if (couponFeedback) {
          couponFeedback.textContent = "";
          couponFeedback.removeAttribute("data-state");
        }
        guardarCarrito();
        renderCarrito();

      } catch (error) {
        console.error("Error guardando orden:", error);

        Swal.fire({
          title: t("orderErrorTitle"),
          text: t("orderErrorText"),
          icon: "error",
          background: "#1e1e1e",
          color: "#fff"
        });
      }
    });
  };

  // Paso previo: Add-ons
  const addonsHtml = ADDONS.map(a => `
    <label style="display:flex; align-items:center; gap:12px; margin:10px 0;">
      <input type="checkbox" class="addon-check" value="${a.id}">
      <img src="${escapeHtml(safeAssetPath(a.imagen))}"
           alt="${escapeHtml(a.nombre)}"
           width="40" height="40" loading="lazy" decoding="async"
           style="width:40px; height:40px; object-fit:contain;">
      <span>${a.nombre} — <strong>${currency(a.precio)}</strong></span>
    </label>
  `).join("");

  Swal.fire({
    title: t("addonPrompt"),
    html: `<div style="max-height:300px;overflow:auto;">${addonsHtml}</div>`,
    showCancelButton: true,
    confirmButtonText: t("continue"),
    background: "#1e1e1e",
    color: "#fff",
    preConfirm: () => {
      return Array.from(document.querySelectorAll(".addon-check:checked"))
        .map((el: any) => Number(el.value));
    }
  }).then((r) => {
    if (!r.isConfirmed) return;

    const ids = r.value || [];

    ids.forEach((id: number) => {
      const a = ADDONS.find(x => x.id === id);
      if (!a) return;
      carrito.push({
        id: a.id,
        nombre: a.nombre,
        precio: a.precio,
        cantidad: 1,
        color: "N/A",
        imagen: a.imagen
      });
    });

    guardarCarrito();
    renderCarrito();
    mostrarFormularioCheckout();
  });
});

// ===============================
// VACIAR CARRITO
// ===============================
btnVaciarCarrito?.addEventListener("click", () => {

  if (!carrito.length) {
    Swal.fire({
      title: t("cartHasNoItems"),
      icon: "info",
      background: "#1e1e1e",
      color: "#fff",
      timer: 1200,
      showConfirmButton: false
    });
    return;
  }

  carrito.length = 0; // Más limpio que reasignar el array
  descuentoCupon = 0;
  cuponAplicado = false;
  qrConfirmado = false;
  ajustePago = 0;
  if (paymentSelect) paymentSelect.value = "";
  cardFields?.classList.add("hidden");
  qrSection?.classList.add("hidden");
  if (couponInput) {
    (couponInput as HTMLInputElement).value = "";
    (couponInput as HTMLInputElement).readOnly = false;
  }
  if (applyCouponBtn) (applyCouponBtn as HTMLButtonElement).disabled = false;
  if (couponFeedback) {
    couponFeedback.textContent = "";
    couponFeedback.removeAttribute("data-state");
  }
  guardarCarrito();
  renderCarrito();

  Swal.fire({
    title: t("cartCleared"),
    icon: "success",
    background: "#1e1e1e",
    color: "#fff",
    timer: 1200,
    showConfirmButton: false
  });
});

// ===============================
// EVENTOS PRODUCTOS (delegación)
// ===============================
document.addEventListener("click", (e) => {
  const quantityButton = e.target.closest("[data-quantity-change]");
  if (quantityButton) {
    modificarCantidad(Number(quantityButton.dataset.productId), quantityButton.dataset.color || "", Number(quantityButton.dataset.quantityChange));
    return;
  }

  const btn = e.target.closest(".btn-primary");
  if (!btn) return;

  const id = parseInt(btn.dataset.id, 10);
  if (Number.isNaN(id)) return;

  agregarAlCarrito(id);
});

// ===============================
// EVENTOS HISTORIAL (si existe contenedor)
// ===============================
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-order]");
  if (!btn) return;
  abrirFacturaDesdeHistorial(btn.dataset.order);
});

// ===============================
// EVENTO ENVÍO
// ===============================
shippingSelect?.addEventListener("change", () => {
  renderCarrito();
});

[productSearch, categoryFilter, priceFilter, colorFilter, sortProducts].forEach((control) => {
  control?.addEventListener("input", renderProductos);
  control?.addEventListener("change", renderProductos);
});

productFilters?.addEventListener("reset", () => {
  window.setTimeout(renderProductos, 0);
});

window.addEventListener("irbis:languagechange", () => {
  renderProductos();
  renderCarrito();
});

// ===============================
// EVENTO MÉTODO DE PAGO
// ===============================

paymentSelect?.addEventListener("change", () => {

  const metodo = paymentSelect.value;

  ajustePago = 0;
  qrConfirmado = false;

  cardFields?.classList.add("hidden");
  qrSection?.classList.add("hidden");

  if (metodo === "card") {
    ajustePago = 0.10;
    cardFields?.classList.remove("hidden");
  }

  if (metodo === "cash") {
    ajustePago = -0.05;
  }

  if (metodo === "qr") {
    qrSection?.classList.remove("hidden");
    btnCheckout.disabled = true;

    const qrContainer = document.getElementById("qrContainer");
    qrContainer.innerHTML = "";

    const resumen = calcularResumen();
    const ahora = new Date().toLocaleString("es-AR", { hour12: false });

    new QRCode(qrContainer, {
      text: `
      Irbis Supplies
      Total: ${currency(resumen.total)}
      Fecha: ${ahora}
      Referencia: PRE-${Date.now()}
      `,
      width: 160,
      height: 160
    });
  }

  renderCarrito();
});

btnConfirmQR?.addEventListener("click", () => {
  qrConfirmado = true;
  btnCheckout.disabled = carrito.length === 0;
  btnCheckout.classList.toggle("btn-disabled", carrito.length === 0);

  Swal.fire({
    title: t("qrConfirmed"),
    icon: "success",
    background: "#1e1e1e",
    color: "#fff",
    timer: 1200,
    showConfirmButton: false
  });
});

// ===============================
// CUPÓN
// ===============================
applyCouponBtn?.addEventListener("click", () => {
  const setCouponFeedback = (message: string, state: "success" | "error" | "info") => {
    if (couponFeedback) {
      couponFeedback.textContent = message;
      couponFeedback.dataset.state = state;
    }
  };

  if (cuponAplicado) {
    setCouponFeedback(t("couponAlreadyUsed"), "info");
    return;
  }

  const code = (couponInput as HTMLInputElement | null)?.value.trim().toUpperCase() || "";
  if (!code) {
    setCouponFeedback(t("couponEnterCode"), "error");
    couponInput?.focus();
    return;
  }

  if (!isUserLoggedIn()) {
    setCouponFeedback(t("couponRegisteredOnly"), "info");
    Swal.fire({
      title: t("accountRequired"),
      html: `
        ${t("couponRegisteredMessage")}
      `,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: t("createAccount"),
      cancelButtonText: t("cancel"),
      background: "#1e1e1e",
      color: "#fff",
    }).then(async (r) => {
      if (r.isConfirmed) {
        await openRegisterModal();
      }
    });
    return;
  }

  if (code === "IRBIS15") {
    descuentoCupon = 0.15;
    cuponAplicado = true;
    setCouponFeedback("IRBIS15: " + t("couponAppliedText"), "success");
    if (couponInput) (couponInput as HTMLInputElement).readOnly = true;
    if (applyCouponBtn) (applyCouponBtn as HTMLButtonElement).disabled = true;
    renderCarrito();

    Swal.fire({
      title: t("couponApplied"),
      text: t("couponAppliedText"),
      icon: "success",
      background: "#1e1e1e",
      color: "#fff"
    });

  } else {
    setCouponFeedback(t("couponInvalid"), "error");
    alertaError(t("couponInvalidTitle"));
  }
});

// ===============================
// INIT
// ===============================
cargarProductos();  // 👈 PRIMERO
renderCarrito();
renderHistorial();
generarFactura();
