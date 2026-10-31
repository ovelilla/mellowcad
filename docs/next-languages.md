# Un sistema para los idiomas — brief

> **Estado:** fases 1 y 2 hechas (2026-10-31); las 3 a 5, sin empezar. Se borra cuando el portugués
> de Brasil esté `live` con el sistema entero.

## 1. Objetivo

Antes de añadir un idioma más, que crear uno y mantener los existentes no deje deuda: **un idioma
`live` está completo y al día, y lo dice un test, no una lista que alguien recuerda**. Un `draft`
puede estar a medias; un `live`, nunca, tampoco cuando el inglés cambia después.

## 2. Lo que ya había (2026-10-31)

- Cada mapa por idioma es `Record<AppLocale, …>`: `typecheck` falla si falta uno.
- Los tres catálogos (sitio, editor, motor) se comprueban: ICU, claves y argumentos de inglés, y un
  `live` tiene todas las claves. El lenguaje de comandos del motor es completo o ausente.
- Las páginas «Use» de `/docs` existen en cada idioma y detectan su desfase con `sourceHash`.

## 3. Los huecos

1. **Ninguna traducción de un JSON detecta su desfase**: si el inglés de una clave cambia, la
   traducción vieja sigue pasando los tests.
2. **«Completo» no se comprueba como un todo**: sin su entrada en `ENGINE_LOCALES` o
   `EDITOR_LOCALES` (mapas `Partial`) un idioma sale en inglés sin que nada falle.
3. **El tipo de lenguaje de comandos no está declarado**: que el árabe usa el global se deduce de que
   su catálogo no tiene `commands`, y un test lo fija con `"ar"` escrito a mano.
4. **Conocimiento y herramientas suponen un único idioma con AutoCAD, el español**: `new-command`
   («three languages»), `cad-catalogs.md`, `pair.mjs` y `catalog-sweep.mjs` (`all_es.tsv`, estados
   `es-2027`…), las consolas en `es-ES`/`en-US`.
5. **El glosario es una tabla con una columna por idioma**: no escala.
6. **El coste de cada comando nuevo se multiplica por cada lenguaje de comandos** mientras emparejar
   con la tabla de AutoCAD sea manual.
7. **Nada mantiene los idiomas** como `command-review` mantiene los comandos: desfases tras una
   actualización de AutoCAD, texto que no cabe, términos †, revisión nativa pendiente, presupuestos
   (el índice de búsqueda ya chocó con el límite de Vercel con tres idiomas).

## 4. Decisiones

- **Dos tipos de idioma**, declarados en `i18n/routing.ts` (`COMMAND_LANGUAGE`): `localized`, con el
  lenguaje de comandos de su AutoCAD, copiado y completo; `global`, solo la interfaz, cuando
  Autodesk no lo publica (árabe). **Un idioma con AutoCAD propio no sale `live` sin su lenguaje de
  comandos**: un usuario de ese AutoCAD escribe sus nombres, y la fidelidad no admite otra cosa.
- **La escritura de cada idioma, declarada** (`SCRIPT`): una escritura sin cara de Inter obliga, por
  tipos, a dar su fuente.
- **La frescura se guarda por clave, con el texto inglés del que salió** cada traducción (no un hash:
  así el aviso enseña qué cambió). Al implantarla, las traducciones de hoy se dan por al día.
- **Etiquetas BCP 47**: `pt-BR` en catálogos, `lang` y `og:locale`; la URL, en minúsculas (`/pt-br`)
  si next-intl lo permite con root params (se comprueba en la fase 5; si no, `/pt-BR`).
- **Una sola fuente por idioma en `docs/`**: `docs/i18n/<tag>.md` reúne sus términos, fuentes,
  desviaciones y estado de revisión (hoy repartidos entre el glosario y `docs/coverage/spanish.md` /
  `arabic.md`); un README en esa carpeta, lo común.
- Orden de idiomas tras el sistema: portugués de Brasil (piloto), francés, alemán, italiano; los demás
  según la analítica (`@vercel/analytics`). Los de solo interfaz (turco, persa…), cuando la
  analítica los pida.

## 5. Fases

Una fase, un commit (o varios si se separan solos). Las 1 a 4 no cambian nada visible.

1. **Registro y test de `live`.** `COMMAND_LANGUAGE` y `SCRIPT` en `i18n/routing.ts`;
   `scriptFontVariables` lee `SCRIPT`; `i18n/languages.test.ts` exige a cada idioma `live` su
   catálogo del motor y del editor cargables con su etiqueta, y `commands` si y solo si es
   `localized`. Español y árabe lo pasan tal cual.
2. **Frescura.** Cada traducción de los tres catálogos guarda junto a ella el inglés de cada clave;
   el test lista las desfasadas con el inglés viejo y el nuevo, y `npm run locales` da por al día lo
   que se haya revisado. Las páginas «Use» siguen con su `sourceHash`. Hecho así: un
   `translated-from/<tag>.json` por catálogo e idioma, en una carpeta propia porque next-intl infiere
   los idiomas de los `*.json` de `messages/`; la revisión es clave a clave
   (`npm run locales -- --reviewed es:<clave>`), porque `npm run locales` se ejecuta tras cada
   cambio del inglés y por idioma bendeciría lo no leído; lo escribe `scripts/locales/sources.ts`,
   un tercer paso que no toca lo compilado; lo comprueba `i18n/freshness.test.ts`.
3. **Herramientas por idioma.** Extraer `acadres.dll` de cualquier language pack a
   `research/strings/`; `pair.mjs` y `catalog-sweep.mjs` con `--lang` (estados sin `es-`); un script
   que proponga las entradas de `commands` de un idioma desde los ids emparejados, para revisarlas.
   El español sigue saliendo igual.
4. **Conocimiento.** La carpeta de idiomas de §4, comprobando las citas de `lib/docs/differences.ts`; el test
   de `live` exige también su `docs/i18n/<tag>.md`. Reglas `i18n.md`, `cad-catalogs.md` y
   `autocad-research.md` sin el español como caso único; `add-language` por fases con plan
   `docs/plans/<tag>-language.md` (investigación fija: AutoCAD y language pack, `acad.pgp`, formato
   de las palabras clave, fuentes, plurales, longitud, IME); skill nuevo `language-review` para el
   mantenimiento; `new-command`, `finish-feature` y `command-review` recorren los idiomas declarados.
5. **Piloto: `pt-BR`.** Con el sistema entero, de `draft` a `live`; lo que no encaje se corrige en el
   sistema, no en el idioma. Instalar su language pack en el AutoCAD del dueño (para las consolas) se
   le confirma antes.
