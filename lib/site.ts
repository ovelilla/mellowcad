/**
 * Facts about the site itself, shared by both root layouts, the metadata
 * routes and the structured data. The canonical host is the apex over https
 * (`www` already redirects there), whatever deployment happens to render it.
 */
export const SITE_URL = "https://mellowcad.com"

export const SITE_NAME = "MellowCAD"

export const EDITOR_PATH = "/draw"

/** Where the drawings the editor opens by URL are served, one per name: `/drawings/gasket.json`. */
export const DRAWINGS_PATH = "/drawings"

/**
 * The commands the hero's command line suggests, in each language
 * (`CommandTry`), fetched when that line is first used: in the page they
 * were 1.5 KiB of a first load at its budget (`i18n.md`).
 */
export const COMMAND_LIST_PATH = "/command-list.json"

/** The docs' search index in each language (`DocsSearch`), fetched by whoever searches. */
export const SEARCH_INDEX_PATH = "/search-index.json"

/**
 * Where the editor keeps this device's layout (`CadEditor`'s
 * `layoutStorage`). FROZEN, the first two under the old product name: a renamed key orphans
 * what every user already saved (`lib/site.test.ts`).
 */
export const EDITOR_LAYOUT_STORAGE = {
  palette: "easycad:palette:v1",
  statusBar: "easycad:status-bar:v1",
  ribbon: "mellowcad:ribbon:v1",
  properties: "mellowcad:properties:v1",
  quickAccess: "mellowcad:quick-access:v1",
} as const

/**
 * The landing's share image in each language, `app/[locale]/og.png`; the
 * editor's is `/og/draw.png`. A static file takes its type from the extension
 * (`.claude/rules/marketing.md`); the old `/og` and `/og/draw` redirect here.
 */
export const OG_IMAGE_PATH = "/og.png"

/** The editor's share image in each language, `app/[locale]/og/draw.png`. */
export const EDITOR_OG_IMAGE_PATH = "/og/draw.png"

/** The contact address the landing publishes: footer, Status and the privacy notice. */
export const CONTACT_EMAIL = "hello@mellowcad.com"

/** The public repository, whose code is MIT: the footer, Engine and the FAQ link it. */
export const REPOSITORY_URL = "https://github.com/ovelilla/mellowcad"

/** The engine's package, the one the landing links (`.claude/rules/i18n.md`, "Claims and copy"). */
export const ENGINE_PACKAGE = "@mellowcad/engine"
export const ENGINE_PACKAGE_URL = `https://www.npmjs.com/package/${ENGINE_PACKAGE}`

/**
 * Who is responsible for personal data, as GDPR requires the privacy notice to
 * say (Article 13). That notice is the one place the site names a person; it
 * is signed as MellowCAD everywhere else.
 */
export const DATA_CONTROLLER = "Oscar Velilla Abril"

/**
 * The site's IndexNow key (Bing, Yandex, Seznam, Naver, Yep), served as
 * `/<key>.txt` from `public/`: it proves the URLs `npm run indexnow` submits
 * are this host's. Public by design; a new one needs only its file.
 */
export const INDEXNOW_KEY = "1eb5d0fec5dc99d5695b010f04667a07"

/**
 * When the landing's copy last changed materially. It is the sitemap's
 * `lastModified`, which Google only trusts if it moves with the content, so it
 * is bumped by hand with the copy — never stamped with the build time.
 */
export const CONTENT_UPDATED = "2026-11-27"

/**
 * When the privacy notice last changed: what it says it keeps, measures or
 * hands on. Bumped by hand with the notice, apart from the landing's copy.
 */
export const PRIVACY_UPDATED = "2026-11-15"
