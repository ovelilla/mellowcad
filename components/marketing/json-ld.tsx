import type { Graph } from "schema-dts"

/**
 * Structured data as a plain `<script>` — it is data, not code, so not
 * `next/script` — with `<` escaped so no string in it can close the tag.
 */
export function JsonLd({ data }: { data: Graph }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\u003c"),
      }}
    />
  )
}
