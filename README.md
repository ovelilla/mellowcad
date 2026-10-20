# mellowcad

App de dibujo CAD en el navegador, modelada sobre AutoCAD. `cad/` es el motor (sin framework ni
DOM); Next.js/React es solo la capa de presentación. Las reglas de trabajo están en
[AGENTS.md](AGENTS.md).

## Montar el proyecto en un ordenador nuevo

### Requisitos

- **WSL2 con Ubuntu**: todo se desarrolla dentro de WSL, con Bash. El proyecto vive en el disco
  de Linux (`~/projects/mellowcad`), nunca en `/mnt/c`, y VS Code se conecta con Remote-WSL.
- **Node 24** dentro de WSL (instalado con nvm, npm 11).
- **Git**.
- **Google Chrome para Linux**, instalado dentro de WSL, para las comprobaciones en el navegador
  con Playwright.
- **Vercel CLI**, para desplegar: `npm i -g vercel`.

### Pasos

1. Trae el código, de una de estas dos formas:
   - clona el repositorio: `git clone https://github.com/ovelilla/mellowcad.git`;
   - o copia la carpeta del proyecto con `.git` incluida. Si viene de Windows, sin `node_modules`
     (sus binarios nativos son de Windows) y con `git checkout -- .` después, para devolver los
     finales de línea a LF.
2. Instala las dependencias:

   ```
   npm ci
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

### Qué no está en git y hay que copiar a mano

- **`research/`**: las tablas de textos de AutoCAD en inglés y en español, con las que se
  comprueba la redacción de cada mensaje. Son textos de Autodesk, por eso no van en git. Cómo se
  usan está en
  [.github/instructions/autocad-research.instructions.md](.github/instructions/autocad-research.instructions.md).
- **`.playwright-mcp/`**: capturas y material de investigación de sesiones anteriores (`research/`,
  `help/`), como volcados de la ayuda de Autodesk. No se regenera.

Todo lo que el proyecto necesita para seguir está dentro de esta carpeta. No hace falta conservar
la memoria de Claude Code (`~/.claude/`): sus reglas se pasaron a `AGENTS.md` y a
`.github/instructions/`.

Para comprobar comportamientos con la consola de AutoCAD (`scripts/research/runacc.sh`), hay que
tener AutoCAD instalado en Windows; el script lo lanza desde WSL. Hoy es AutoCAD 2027 en español.
Si se instala otra versión, se indica su ruta en la variable `ACCORE`.

### Qué se regenera solo (no hace falta copiarlo)

| Carpeta / archivo                       | Se regenera con                    |
| --------------------------------------- | ---------------------------------- |
| `node_modules/`                         | `npm ci`                           |
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
