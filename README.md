# IRBIS SUPPLIES

## 🛠 Tech Stack

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)

![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

![esbuild](https://img.shields.io/badge/esbuild-FFCF00?style=for-the-badge&logo=esbuild&logoColor=black)

![Nodemailer](https://img.shields.io/badge/Nodemailer-009688?style=for-the-badge)

![CoffeeScript](https://img.shields.io/badge/CoffeeScript-2F2625?style=for-the-badge&logo=coffeescript&logoColor=white)

![MIT License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

E-commerce estático de alto nivel desarrollado originalmente en **JavaScript Vanilla** y posteriormente evolucionado con un enfoque profesional orientado a escalabilidad, tipado fuerte y arquitectura modular moderna.

Proyecto construido bajo una premisa clara:

> Mejorar sin destruir lo anterior. Evolucionar sin depender de frameworks pesados.

---

# 🧭 Visión del proyecto

Irbis-Supplies no es solo un carrito funcional.

Es una demostración práctica de:

- Refactorización progresiva
- Migración incremental hacia tipado fuerte
- Arquitectura modular sin frameworks SPA
- Integración de autenticación real
- Optimización UX enfocada en conversión

---

# 🏗 Arquitectura técnica

El proyecto fue evolucionado en capas, respetando la base original.

### 🔹 Fase 1 — JavaScript vanilla
- DOM manipulation manual
- Eventos personalizados
- Persistencia con Web Storage
- Renderizado dinámico de productos

### 🔹 Fase 2 — Modularización
- Separación por responsabilidades
- Helpers desacoplados
- Mejor organización de estados

### 🔹 Fase 3 — TypeScript
- Tipado fuerte
- Interfaces para productos y carrito
- Mayor seguridad en build
- Escalabilidad futura asegurada

### 🔹 Fase 4 — CoffeeScript
- Helpers UI declarativos
- Simplificación de lógica repetitiva
- Código más expresivo en interacciones

### 🔹 Fase 5 — Build moderno
- Bundler ligero (esbuild)
- Minificación automática
- Pipeline optimizado para producción

---

# 🛒 Funcionalidades implementadas

## Carrito Drawer (UX Moderna)
- Panel lateral fijo a la derecha
- Scroll interno independiente
- Persistencia automática con LocalStorage
- Imagen visible en cada ítem agregado

## Sistema de incentivo
- Pop-up automático al agregar el primer producto
- Cupón promocional: `IRBIS15`
- 15% OFF aplicado dinámicamente

## Autenticación real
Integración con **Firebase Authentication (Email/Password)**

Incluye:

- Registro con validación mínima
- Confirmación de contraseña
- Envío de email de verificación
- Inicio y cierre de sesión
- Manejo de estados autenticado / no autenticado

> Si Firebase no está configurado, la UI informa la ausencia sin romper la app.

## Upsell Inteligente
Antes del checkout:

- Modal opcional de accesorios no regulados
- Suma dinámica al total
- Mejora de ticket promedio simulada

---

# 🔐 Configuración de Firebase

1. Crear proyecto en Firebase
2. Activar:
   Authentication → Sign-in Method → Email/Password
3. Editar:

```
public/firebase-config.js
```

Reemplazar valores `REEMPLAZAR` por tu configuración.

⚠ La configuración cliente no es secreta.
Nunca subir claves privadas.

---

# 🧠 Persistencia y estado

- Carrito guardado en LocalStorage
- Recuperación automática en reload
- Limpieza automática al finalizar compra
- Validación de stock simulada

---

# 📦 Estructura del proyecto

```
.
├── src/
│   ├── legacy/          # Código JS original (base histórica)
│   ├── ts/              # Módulos tipados y lógica fuerte
│   ├── coffee/          # Helpers UI declarativos
│   └── styles/          # Estilos modulares
├── public/
│   └── firebase-config.js
├── dist/                # Build optimizado producción
├── netlify/
│   └── functions/       # Serverless
├── package.json
├── tsconfig.json
├── vite.config.ts
└── netlify.toml
```

---

# 🚀 Stack tecnológico

- JavaScript (Vanilla)
- TypeScript
- CoffeeScript
- SweetAlert2 (Dark Theme)
- esbuild
- Netlify (Deploy + Serverless Functions)
- Firebase Authentication

---

# ⚙ Instalación

```
npm install
npm run dev
npm run build
```

---

# 🌐 Deploy

Configurado para Netlify.

- Build Command: `npm run build`
- Publish Directory: `dist`
- Archivo `netlify.toml` incluido

---

# 📈 Decisiones arquitectónicas clave

✔ No migrar a React/Next.js  
✔ Evolución progresiva sin reescritura total  
✔ Mantener compatibilidad con código legacy  
✔ Modularización por responsabilidad  
✔ Preparación para futura API backend  

---

# 🎯 Objetivo profesional

Este proyecto demuestra:

- Dominio profundo de JavaScript puro
- Capacidad de refactorización sin romper producción
- Migración progresiva hacia tipado fuerte
- Arquitectura limpia sin depender de frameworks
- Pensamiento orientado a escalabilidad

---

# 🔮 Roadmap futuro

- Integración con API real de productos
- Backend con Node.js + Express
- Sistema real de pagos (Stripe / MercadoPago)
- Panel administrativo
- Autenticación JWT server-side
- Testing automatizado

---
