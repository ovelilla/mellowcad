# mellowcad

App de dibujo CAD en el navegador, modelada sobre AutoCAD. `cad/` es el motor (sin framework ni
DOM); Next.js/React es solo la capa de presentación. Las reglas de trabajo están en
[AGENTS.md](AGENTS.md).

## Montar el proyecto en un ordenador nuevo

### Requisitos

- **Node 24** (desarrollado con 24.16.0 y npm 11, instalado con nvm-windows).
- **Git**.
- **Google Chrome**, para las comprobaciones en el navegador con Playwright.
- **Vercel CLI**, para desplegar: `npm i -g vercel`.

### Pasos

1. Trae el código, de una de estas dos formas:
   - clona el repositorio: `git clone https://github.com/ovelilla/mellowcad.git`;
   - o copia la carpeta del proyecto con `.git` incluida.
2. Instala las dependencias:

   ```
   npm install
   ```

   El script `prepare` activa el hook de pre-commit (`git config core.hooksPath .githooks`).
   Para comprobarlo, `git config core.hooksPath` debe devolver `.githooks`.

3. Vincula el proyecto con Vercel:

   ```
   vercel login
   vercel link        # proyecto "mellowcad" de la cuenta ovelilla
   vercel env pull .env.local
   ```

   `.env.local` solo guarda `VERCEL_OIDC_TOKEN`, y el último comando lo vuelve a generar.

4. Arranca el servidor de desarrollo con `npm run dev`. La URL es `http://localhost:3000`, o la
   siguiente libre si ese puerto está ocupado. El editor está en `/draw`.
5. Comprueba que todo está en verde:

   ```
   npm run typecheck
   npm run lint
   npm run test:coverage
   ```

   En Windows, lanza los tests desde PowerShell (`C:\...`), no desde Git Bash (`/c/...`). Con la
   letra de unidad en minúscula, Vitest carga los archivos dos veces y todos fallan con
   "Vitest failed to find the current suite".

### Qué no está en git y hay que copiar a mano

- **`.playwright-mcp/`**: capturas y material de investigación sobre AutoCAD (`research/`, `help/`),
  como volcados de la ayuda de Autodesk y tablas en español. No se regenera.
- **La memoria de Claude Code** de este proyecto, en
  `C:\Users\<usuario>\.claude\projects\<ruta-del-proyecto>\memory\`. El nombre de esa carpeta sale
  de la ruta del proyecto, con `\` y `:` cambiados por `-`. Por ejemplo,
  `C:\Users\oveli\Desktop\mellowcad` da `c--Users-oveli-Desktop-mellowcad`. Si el proyecto cambia
  de ruta, abre Claude Code una vez en la ruta nueva para que cree su carpeta, y copia dentro el
  contenido de `memory\`.

### Qué se regenera solo (no hace falta copiarlo)

| Carpeta / archivo                       | Se regenera con                    |
| --------------------------------------- | ---------------------------------- |
| `node_modules/`                         | `npm install`                      |
| `.next/`                                | `npm run dev` / `npm run build`    |
| `coverage/`                             | `npm run test:coverage`            |
| `tsconfig.tsbuildinfo`, `next-env.d.ts` | `npm run typecheck` / `npm run dev` |

## Seguir con el desarrollo

- [AGENTS.md](AGENTS.md): la arquitectura, las invariantes y cómo se da por terminada una
  funcionalidad.
- [docs/autocad-coverage.md](docs/autocad-coverage.md): lo que hace cada comando y lo que le falta
  respecto a AutoCAD.
- [.github/instructions/](.github/instructions/): las reglas de cada área (motor, herramientas, UI,
  tests, i18n, landing).
