/**
 * Facts about the site itself, shared by both root layouts, the metadata
 * routes and the structured data. The canonical host is the apex over https
 * (`www` already redirects there), whatever deployment happens to render it.
 */
export const SITE_URL = "https://mellowcad.com"

export const SITE_NAME = "MellowCAD"

export const EDITOR_PATH = "/draw"

/** The hero's drawing as a drawing file: what the live sketch opens with. */
export const HERO_SKETCH_PATH = "/sketches/hero.json"

/** The site-wide share image, `app/opengraph-image.tsx`. */
export const OG_IMAGE_PATH = "/opengraph-image"

/** The address the About panel publishes; the landing adds no new personal data. */
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
export const CONTENT_UPDATED = "2026-09-26"
