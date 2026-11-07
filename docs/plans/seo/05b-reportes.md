# Sesión 05b — Un sitio para reportar problemas

> Para el dueño: pega todo este fichero en una sesión nueva de Claude Code en `~/projects/mellowcad`,
> con el razonamiento al máximo, antes del lanzamiento suave en r/SideProject (jueves 12/11, L5).

Eres la sesión 05b del plan de visibilidad de MellowCAD. Lee primero `AGENTS.md`,
`docs/next-seo.md` (L5 y su calendario, §7 y §8), `docs/next-autocad-ui.md` (la disposición de la
interfaz pasa a ser la de AutoCAD 2027), `.claude/rules/ui.md`,
`.claude/rules/marketing.md`, `.claude/rules/i18n.md` («Claims and copy») y
`.claude/rules/engine-package.md`. Responde en español; el código, los comentarios y el
conocimiento del repo, en inglés. Decide sin preguntar.

## Contexto

El lanzamiento empieza el 12/11 (L5): r/SideProject pidiendo opiniones, la semana del 16/11 para
arreglar lo que salga y Show HN el 18/11. Hoy no hay dónde reportar un fallo salvo el correo. El
repositorio es público, con las issues activadas y ninguna abierta, sin plantillas ni SECURITY.md.
El editor no tiene menú de ayuda: su menú de la aplicación tiene Nuevo, Abrir, Guardar, Guardar
como, Unidades e Idioma, y los enlaces de idioma se los pasa la app (`components/draw-editor.tsx`).
El pie del sitio enlaza el repositorio y hello@mellowcad.com (`CONTACT_EMAIL` en `lib/site.ts`),
que Cloudflare reenvía al buzón del dueño.

## Lo decidido (7/11/2026)

Lo habitual en un proyecto abierto sin servidor propio:

- **Issues de GitHub con formularios** (en .github/ISSUE_TEMPLATE): uno para un fallo —qué hiciste
  (los comandos tecleados, los clics), qué pasó, qué hace AutoCAD, la versión, el navegador y el
  idioma— y otro para un comando o una opción que falta o no hace lo de AutoCAD. Su `config.yml`
  quita la issue en blanco y ofrece el correo a quien no tiene cuenta de GitHub. Van en inglés
  (GitHub no los traduce) y dicen que se puede escribir en español, portugués o árabe, y que una
  issue es pública: nada de datos personales ni de dibujos que no se puedan enseñar.
- **Un enlace que abre el formulario ya relleno**: GitHub rellena un campo desde la URL por su
  `id`, así que la app pone la versión, el navegador y el idioma, y quien reporta lo revisa antes
  de enviarlo. Nada pasa por un servidor nuestro: el aviso de privacidad no cambia.
- **En el editor**, donde lo busca un usuario de AutoCAD: AutoCAD 2027 tiene **Send Feedback** en
  la pestaña Inicio (su ayuda, «How to Provide Feedback»), que aquí no existe. Compruébalo en el
  escritorio (skill `autocad-research`), toma su nombre en cada idioma de sus tablas de cadenas y
  ponlo donde menos se aparte, con la desviación en un `WHY`; cuando la interfaz tenga su pestaña
  Inicio (`docs/next-autocad-ui.md`), irá allí. `@mellowcad/editor` es un paquete
  publicado: la URL se la pasa la app, como los enlaces de idioma; el paquete no conoce el
  repositorio de MellowCAD.
- **En el sitio**: «Reportar un problema» en el pie, en los cuatro idiomas, junto al correo.
- **SECURITY.md**: una vulnerabilidad va por el reporte privado de GitHub, nunca en una issue. El
  interruptor de la configuración del repositorio lo activa el dueño: apúntalo en §7.
- **Lo que no**: un formulario propio que cree issues o mande correos (con react-email, Resend o
  similares). Pide un servidor con un token, abre un tablero público al spam y a los datos
  personales de cualquiera, deja sin poder contestar a quien reporta y añade un encargado del
  tratamiento al aviso de privacidad de un producto sin cuentas ni servidores. Tampoco informes de
  errores automáticos (Sentry o similares), por la misma promesa. Se replantea si el correo se
  llena de reportes de gente sin cuenta de GitHub.

## Terminado cuando

- Las plantillas en el repositorio; el enlace en el editor y en el pie, en los cuatro idiomas; un
  test que comprueba que cada campo que rellena la URL es un `id` de su formulario. GitHub lee las
  plantillas de la rama principal, así que abrir el enlace de verdad le toca al dueño tras el push:
  apúntalo en §7.
- El gate verde, las reglas al día, un commit por bloque (skill `finish-feature`), y la línea de
  05b en `docs/next-seo.md` §8.

## Qué no tocar

Nada en GitHub fuera de los ficheros del repositorio: ni issues de prueba, ni etiquetas, ni la
configuración. Ni push ni publicaciones.

## Cómo trabajar

Otras sesiones pueden estar trabajando en el árbol: añade solo tus ficheros. Subagentes, con
moderación.
