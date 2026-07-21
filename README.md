# IRBIS SUPPLIES

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![CoffeeScript](https://img.shields.io/badge/CoffeeScript-2F2625?style=for-the-badge&logo=coffeescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)
![esbuild](https://img.shields.io/badge/esbuild-FFCF00?style=for-the-badge&logo=esbuild&logoColor=black)
![Nodemailer](https://img.shields.io/badge/Nodemailer-009688?style=for-the-badge)
![MIT License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

Irbis Supplies es un e-commerce estático de catálogo y carrito, desarrollado sobre una base de **JavaScript vanilla** y actualizado con **TypeScript**, **CoffeeScript**, **Firebase Authentication**, funciones serverless de **Netlify** y un pipeline propio con **esbuild**.

La premisa técnica del proyecto sigue siendo:

> Mejorar sin destruir lo anterior. Evolucionar sin depender de frameworks pesados.

---

## Estado actual

- Aplicación web estática con `index.html`, assets públicos y estilos globales en `public/styles.css`.
- Entrada principal en `src/main.ts`, que integra el código legacy, autenticación, preferencias visuales y navegación.
- Build propio con scripts Node + esbuild; no usa Vite, React, Next.js ni otro framework SPA.
- Catálogo cargado desde `public/data.json` con imágenes en `public/images/`.
- Carrito persistido en `localStorage`, drawer lateral, historial local de compras y comprobantes simulados.
- Autenticación opcional con Firebase Authentication y creación de perfil de usuario en Firestore cuando Firebase está configurado.
- Funciones serverless de Netlify para factor de precios por inflación y envío de facturas por email con Nodemailer.

---

## Funcionalidades principales

### Catálogo

- Render dinámico de productos desde JSON.
- Búsqueda por nombre o descripción.
- Filtros por categoría y rango de precio.
- Ordenamiento por nombre o precio.
- Detalle de producto mediante modales SweetAlert2.
- Precios ajustados localmente por inflación mensual simulada desde enero de 2024.

### Carrito y checkout

- Drawer lateral con overlay y cierre por botón, click externo o tecla `Escape`.
- Persistencia automática del carrito en `localStorage`.
- Cantidades, subtotales, IVA, envío y total recalculados en la UI.
- Cupón promocional `IRBIS15`.
- Descuento permanente del 30% sobre los precios mostrados.
- Métodos de pago simulados: efectivo, tarjeta y QR.
- Ajustes de pago: descuento en efectivo y recargo por tarjeta.
- Validación básica de stock simulado.
- Upsell previo al checkout con accesorios tácticos no regulados.
- Generación de orden local, historial de compras, comprobante imprimible y descarga PDF desde el navegador.

### Autenticación y usuarios

Integración opcional con **Firebase Authentication (Email/Password)**:

- Registro con nombre, email, contraseña y confirmación.
- Validación básica de email y longitud mínima de contraseña.
- Envío de email de verificación.
- Inicio y cierre de sesión.
- Estado visual de sesión en la navbar.
- Creación de documento de usuario en Firestore con rol inicial `official`.

Si Firebase no está configurado, la UI informa la ausencia de configuración sin romper el flujo principal.

### Preferencias de interfaz

- Selector de idioma español / inglés.
- Selector de tema oscuro / claro.
- Preferencias persistidas en `localStorage`.
- Textos traducidos mediante atributos `data-i18n` y eventos internos de cambio de idioma.

### Serverless

El proyecto incluye funciones Netlify en `netlify/functions/`:

- `prices.js`: expone un factor de inflación mensual calculado desde enero de 2024.
- `sendInvoice.js`: recibe datos de compra por POST, recalcula el total en backend y envía una factura por email usando Gmail SMTP vía Nodemailer.

---

## Stack tecnológico

- HTML5 + CSS3
- JavaScript vanilla
- TypeScript
- CoffeeScript
- SweetAlert2 + tema oscuro
- Swiper
- esbuild
- Firebase Authentication
- Firestore
- Netlify Functions
- Nodemailer

---

## Estructura del proyecto

```text
.
├── index.html                 # Documento principal de la tienda
├── public/
│   ├── data.json              # Catálogo de productos
│   ├── firebase-config.js     # Configuración cliente opcional de Firebase
│   ├── styles.css             # Estilos globales
│   └── images/                # Logo, productos, flags y add-ons
├── src/
│   ├── main.ts                # Entrypoint de la app
│   ├── legacy/script.ts       # Lógica principal heredada y checkout
│   ├── ts/
│   │   ├── auth.ts            # Firebase Auth + Firestore
│   │   ├── models.ts          # Tipos compartidos
│   │   ├── preferences.ts     # Idioma y tema
│   │   └── storage.ts         # Helpers seguros de localStorage
│   ├── coffee/alerts.coffee   # Helpers de alertas SweetAlert2
│   └── types/global.d.ts      # Tipos globales para imports no TS
├── scripts/
│   ├── dev.mjs                # Build watch + servidor local esbuild
│   └── build.mjs              # Build productivo
├── netlify/
│   └── functions/
│       ├── prices.js          # Factor serverless de inflación
│       └── sendInvoice.js     # Envío serverless de factura
├── netlify.toml               # Configuración de deploy Netlify
├── package.json               # Scripts y dependencias
└── tsconfig.json              # Configuración TypeScript
```

---

## Instalación y uso local

Requisitos recomendados:

- Node.js 18 o superior.
- npm.

```bash
npm install
npm run dev
```

El servidor de desarrollo sirve el build en:

```text
http://127.0.0.1:5173
```

> El script de desarrollo limpia `dist/`, copia `public/` e `index.html`, compila `src/main.ts`, observa cambios y sirve la carpeta `dist/`.

---

## Scripts disponibles

```bash
npm run dev
```

Inicia esbuild en modo watch y sirve `dist/` localmente.

```bash
npm run build
```

Genera el build productivo en `dist/`, copiando assets públicos y creando `dist/assets/app.js` con sourcemap.

```bash
npm run typecheck
```

Ejecuta TypeScript en modo verificación sin emitir archivos.

---

## Configuración de Firebase

1. Crear un proyecto en Firebase.
2. Activar **Authentication → Sign-in Method → Email/Password**.
3. Crear o habilitar Firestore si se quiere persistir el perfil del usuario.
4. Editar:

```text
public/firebase-config.js
```

5. Reemplazar los valores `REEMPLAZAR` por la configuración web del proyecto Firebase.

La configuración cliente de Firebase no es una clave privada, pero no deben subirse credenciales administrativas ni service accounts al repositorio.

---

## Configuración de email para Netlify

La función `sendInvoice.js` usa Gmail SMTP. Para habilitarla en Netlify, configurar estas variables de entorno:

```text
GMAIL_USER
GMAIL_APP_PASSWORD
```

`GMAIL_APP_PASSWORD` debe ser una contraseña de aplicación de Google, no la contraseña personal de la cuenta.

---

## Deploy

El proyecto está preparado para Netlify con `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"
```

Configuración esperada:

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`

---

## Decisiones arquitectónicas

- Mantener una arquitectura liviana sin framework SPA.
- Preservar el código legacy funcional y encapsular mejoras alrededor de él.
- Usar TypeScript para módulos nuevos y contratos compartidos.
- Usar CoffeeScript solo para helpers declarativos de UI ya integrados al build.
- Centralizar el build en scripts propios para mantener control del pipeline.
- Mantener el catálogo y los assets como contenido estático versionado.
- Usar Netlify Functions únicamente para responsabilidades backend puntuales.

---

## Roadmap sugerido

- Endurecer validaciones de checkout en backend.
- Agregar tests automatizados unitarios y de integración.
- Migrar progresivamente más lógica legacy a módulos TypeScript.
- Conectar el catálogo a una API real o CMS.
- Integrar pagos reales con Stripe o MercadoPago.
- Crear panel administrativo para productos, stock y órdenes.
- Implementar reglas de seguridad Firestore ajustadas por rol.

---

## Licencia

Este proyecto está publicado bajo licencia MIT. Ver `LICENSE` para más información.
