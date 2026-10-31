# Un sistema para los idiomas — brief

> **Estado:** fases 1 a 5 hechas (2026-10-31): el portugués de Brasil es `live` en `/pt-br` con el
> sistema entero (plan `docs/plans/pt-BR-language.md`, ya un resumen con sus commits). Sin
> publicar: el push a `main` es del dueño. Se borra cuando esté publicado.

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
  desviaciones y estado de revisión (antes repartidos entre el glosario y la cobertura del español
  y del árabe); un README en esa carpeta, lo común.
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
   El español sigue saliendo igual. Hecho así: `--lang` toma la etiqueta BCP 47 de los catálogos
   (`pt-BR`), que nombra también las tablas (`all_pt-BR.tsv`), y por defecto es `es`;
   `extract-strings.mjs` la traduce a la cultura de AutoCAD (la misma, o la única de su idioma:
   `es` → `es-ES`) y copia también `acad.pgp`, porque los alias salen de él. El código común está
   en `scripts/research/tables.mjs`; el «o» que precede a la lista de palabras clave se deduce de
   las tablas, no de una lista por idioma. `propose-commands.mjs` escribe en `research/proposals/`
   (ignorado: es texto de Autodesk, y fuera de `cad/locales/` nada lo compila sin leerlo) un JSON
   con solo lo que una cadena decide y un informe con todas las claves; lo dudoso (cadenas que
   discrepan, un `select` de ICU, plurales, coincidencias parciales o de otras mayúsculas) queda
   fuera del JSON y marcado en el informe. Comprobado con el español: las tablas extraídas son las
   de antes byte a byte, `pair.mjs` sale idéntico y `catalog-sweep.mjs` también salvo el nombre de
   los estados (`lang-2027`, `lang-differs`, `lang-several`); de las 967 propuestas, 941 son ya
   las de `es.json`, y el resto son decisiones tomadas con la consola (alias del `acad.pgp` que el
   catálogo no recoge, filas `lang-differs` del barrido). **Queda para la fase 5**, porque solo se
   prueba con otro idioma: abrir un pack sin instalarlo (7-Zip, que no está en WSL; dónde guarda
   sus DLL y su `acad.pgp`), y si las tablas de `pt-BR` emparejan como las españolas (su «ou», sus
   initget).
4. **Conocimiento.** La carpeta de idiomas de §4, comprobando las citas de `lib/docs/differences.ts`; el test
   de `live` exige también su `docs/i18n/<tag>.md`. Reglas `i18n.md`, `cad-catalogs.md` y
   `autocad-research.md` sin el español como caso único; `add-language` por fases con plan
   `docs/plans/<tag>-language.md` (investigación fija: AutoCAD y language pack, `acad.pgp`, formato
   de las palabras clave, fuentes, plurales, longitud, IME); skill nuevo `language-review` para el
   mantenimiento; `new-command`, `finish-feature` y `command-review` recorren los idiomas declarados.
   Hecho así: el glosario y las dos páginas de cobertura se movieron sin reescribirse; la tabla de
   términos se partió por idioma (columna inglesa en cada una) y el README lleva lo común (qué
   tiene cada página y en qué orden, las marcas, lo que nunca se traduce, las fuentes de un
   `localized`). La fuente de Readex Pro pasó de `i18n.md` a `ar.md`. La ayuda de 2027 responde en
   `ESP`, `PTB`, `FRA`, `DEU` e `ITA` con los mismos GUID; el MCP con `pt_BR` devuelve resultados
   ingleses, así que se busca en inglés y se lee en la carpeta del idioma. `probe.sh` toma
   `--lang` como los demás scripts y lee de la tabla (22843) el `Comando:` en que debe acabar cada
   probe; en español sale idéntico. `language-review` mide también un archivo estático contra los
   20 MB de Vercel, nueva fila de los presupuestos. `cad/locales/locales.test.ts` sigue fijando el
   árabe a mano: `cad/` no puede importar `i18n/routing.ts`, y `i18n/languages.test.ts` ya lo
   cubre por `COMMAND_LANGUAGE`.
5. **Piloto: `pt-BR`.** Con el sistema entero, de `draft` a `live`; lo que no encaje se corrige en el
   sistema, no en el idioma. Instalar su language pack en el AutoCAD del dueño (para las consolas) se
   le confirma antes. En curso por el plan `docs/plans/pt-BR-language.md`. Resuelto en su fase 0:
   abrir un pack sin instalarlo es `scripts/research/open-pack.sh` (7-Zip en su compilación para
   Linux, `7zz`; las DLL van en un zip, `acadlp.adix`, dentro del `.exe`), y **las tablas salen de
   la actualización, no del pack**: el pack es la build de lanzamiento, y 2027.1 cambia 101 cadenas
   de pt-BR (el español de la actualización es el instalado, byte a byte). Las tablas de pt-BR
   emparejan como las españolas: «ou» deducido, initget con la mayúscula dentro de la palabra
   (`LInha`), 991 propuestas. Lo que no encajó, corregido en el sistema: `forms()` quitaba
   `(or|o|u)` fijo en vez del «ou» del idioma, y `probe.sh` solo reconocía los sufijos `.es` y `.en`.
   La URL es `/pt-br`: el segmento `[locale]` lleva el prefijo de `localePrefix.prefixes` y
   `i18n/request.ts` lo traduce a la etiqueta. Fase 1 hecha: `pt-BR` registrado como `draft`, con
   catálogos vacíos y su `docs/i18n/pt-BR.md`; lo que no encajó, corregido en el sistema: los
   sufijos de idioma de las páginas de `/docs` (solo dos letras), el nombre exportado de un
   catálogo con región (`ptBR`), y una página «Use» que le falta a un draft cae al inglés en vez
   de romper `docs:check` (`isTranslated` cuenta solo los idiomas `live`). Fases 2 y 3 hechas, en un
   commit: sitio, editor, las cuatro páginas «Use» e `interface` del motor, cada término con su
   fuente en `docs/i18n/pt-BR.md`. Lo que no encajó: las etiquetas de un idioma `localized` no
   están en las tablas sino en las DLL de interfaz del pack y su `acad.cuix` (cómo leerlas, en el
   skill `autocad-research`); `add-language` dice ahora de dónde salen y que `EDITOR_LOCALES` va en
   la fase 2. Fase 4 empezada: el dueño pidió que el language pack lo instalara la sesión (desde
   WSL, con su UAC, y la 2027.1 aplicada de nuevo después), y `commands` salió entero de la consola:
   `scripts/research/console-pair.mjs` empareja las transcripciones de las sondas de las revisiones
   en pt-BR con las inglesas y redacta cada clave desde la consola. Lo que no encajó, corregido en
   el sistema: `runacc.sh` solo reconocía el banner en inglés y español, y su timeout dejaba la
   consola colgada en Windows. Segunda sesión de la fase 4: cada prompt que el inglés comparte y pt-BR
   redacta por comando tiene su id, y las keywords por prompt su `promptKeywords`. Lo que no
   encajó, corregido en el sistema: una etiqueta igual a la palabra del comando tapaba la de un
   prompt que la escribe a su manera (`EngineText.keywordLabel` recibe el prompt), y las palabras
   de -OSNAP con una sola mayúscula robaban la letra de cada keyword en un prompt de punto (ahora
   llevan tres, como la consola, y el listado usa los nombres cortos de AutoCAD en todos los
   idiomas). Tercera sesión: la forma pegada o espaciada del valor por defecto, y la etiqueta que un prompt da a
   una keyword, pasan al catálogo por id de prompt (`promptForms`, `promptKeywordLabels`), porque
   pt-BR espacia donde el inglés pega y el español espacia el prompt de las matrices que el inglés
   y pt-BR pegan; y las claves que ninguna sonda imprimía, sondeadas en los dos idiomas. Lo que no
   encajó, corregido en el sistema: la consola no conocía MATCHPROP hasta cargar `acmatch.crx`.
   Cuarta sesión, que cierra la fase 4: el escritorio pt-BR contra el inglés (dos líneas de los
   conmutadores corregidas; las etiquetas de la entrada dinámica son nuestras y siguen sin fuente),
   y el espacio tras los dos puntos de un prompt pasa al catálogo por id (`answerForms`), porque el
   historial escribe la respuesta pegada donde la cadena del idioma no lo lleva: DIMSPACE en los
   tres idiomas, EDITARP o REFAZERM solo en pt-BR. Lo que no encajó, corregido en el sistema: ese
   espacio se lee del `Message` de la consola, no de la tabla, que lo pierde en sus `%s`.
   Fase 6, que cierra el piloto: el gate y una build de producción (todo `●`), los presupuestos,
   las capturas y las teclas muertas de ABNT2, y `pt-BR` pasa a `live`. Lo que no encajó,
   corregido en el sistema: los presupuestos fijos de los catálogos del motor, rebasados desde el
   11/10 porque crecen con cada comando (ahora un test los mide contra el inglés); seis textos que
   no cabían, todos del layout y cortados también en otros idiomas; y tres tests con el español y
   el árabe escritos a mano, que ahora leen los idiomas de `routing`.
