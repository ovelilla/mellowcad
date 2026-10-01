/**
 * Facts about the site itself, shared by both root layouts, the metadata
 * routes and the structured data. The canonical host is the apex over https
 * (`www` already redirects there), whatever deployment happens to render it.
 */
export const SITE_URL = "https://mellowcad.com"

export const SITE_NAME = "MellowCAD"

export const EDITOR_PATH = "/draw"

/** The landing's share image in each language, `app/[locale]/og`. */
export const OG_IMAGE_PATH = "/og"

/** The contact address the landing publishes: footer, Status and the privacy notice. */
export const CONTACT_EMAIL = "o.velillaa@gmail.com"

/**
 * Who is responsible for personal data, as GDPR requires the privacy notice to
 * say (Article 13). That notice is the one place the site names a person; it
 * is signed as MellowCAD everywhere else.
 */
export const DATA_CONTROLLER = "Oscar Velilla Abril"

/**
 * When the landing's copy last changed materially. It is the sitemap's
 * `lastModified`, which Google only trusts if it moves with the content, so it
 * is bumped by hand with the copy — never stamped with the build time.
 */
export const CONTENT_UPDATED = "2026-10-01"
