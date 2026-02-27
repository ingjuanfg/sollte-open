# SOLLTE Fitness and Wellness — CrossFit Open 2026

Página estática del CrossFit Open 2026 de Sollte. Sin base de datos; ideal para **GitHub Pages**.

## Despliegue en GitHub Pages

1. Crea un repositorio en GitHub y sube esta carpeta.
2. En el repo: **Settings → Pages**.
3. En **Source** elige **Deploy from a branch**.
4. Branch: **main** (o **master**), carpeta **/ (root)**.
5. Guarda. En unos minutos la página estará en `https://tu-usuario.github.io/nombre-repo/`.

## Estructura

- `index.html` — Página única (SPA): Workouts y Leaderboard en la misma página, sin recargas.
- `styles.css` — Estilos responsive y colores Sollte.
- `app.js` — Navegación y renderizado del contenido.
- `data.js` — Datos estáticos (workouts y leaderboard). **Edita aquí** para cambiar textos y resultados.
- `assets/` — Coloca aquí el logo de Sollte (`sollte_logo_nombre_icono-583104eb-9112-45de-8837-ba08f6649c68.png` o renombra la ruta en `index.html`).

## Cómo editar contenido

Abre `data.js` y modifica los arrays `workouts` y `leaderboard` (por sede: belmonte, envigado, cuba). No hace falta tocar HTML ni despliegue.

## Requisitos

Ninguno. Solo navegador; funciona sin servidor ni build.
