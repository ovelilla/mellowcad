/**
 * SVG markup to inline in a page, its attributes in single quotes.
 *
 * WHY: a server component's inlined markup is written twice, in the HTML and
 * again in the router's payload, a JavaScript string where every `"` is
 * escaped (`\"`), so Brotli found nothing of the first copy in the second.
 * With single quotes, which a JavaScript string leaves alone, the payload's
 * copy matches the HTML's between tags: some 1.7 KB less on every landing
 * (Simplified Chinese going live, /fr at its 250 KiB: docs/i18n/zh-CN.md).
 * A value holding a `'` keeps its double quotes.
 */
export function inlineSvg(markup: string): string {
  return markup.replace(/<[^<>]+>/g, (tag) =>
    tag.replace(/(\s[\w:.-]+)="([^"']*)"/g, "$1='$2'")
  )
}
