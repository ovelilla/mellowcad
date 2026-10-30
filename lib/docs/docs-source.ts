import { defineI18n } from "fumadocs-core/i18n"
import { loader } from "fumadocs-core/source"
import { applyMdxPreset } from "fumadocs-mdx/config"
import { defineDocs } from "fumadocs-mdx/macro"
import { createCssVariablesTheme } from "shiki/core"

import { localePath } from "../../i18n/navigation"
import { routing } from "../../i18n/routing"

import { DOCS_PATH } from "./packages"
import { remarkPackageSource } from "./remark-package-source"
import { docsPageSchema, metaSchema } from "./schema"

// Code is coloured by the site's tokens (`--syntax-*` in marketing.css), not
// by a theme's literal colours.
const codeTheme = createCssVariablesTheme({
  name: "mellowcad",
  variablePrefix: "--syntax-",
  variableDefaults: {},
  fontStyle: true,
})

// WHY literals: the macro reads `dir` statically.
const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: docsPageSchema,
    postprocess: { includeProcessedMarkdown: { headingIds: false } },
    mdxOptions: applyMdxPreset({
      remarkPlugins: (plugins) => [remarkPackageSource, ...plugins],
      rehypeCodeOptions: {
        themes: { dark: codeTheme },
        defaultColor: "dark",
        icon: false,
      },
    }),
  },
  meta: { schema: metaSchema },
})

/**
 * Every page in English, the source; a language without a page of its own is
 * served the English one under its prefix (`/es/docs/engine`).
 */
export const docsSource = loader({
  baseUrl: DOCS_PATH,
  source: docs.toFumadocsSource(),
  i18n: defineI18n({
    languages: [...routing.locales],
    defaultLanguage: routing.defaultLocale,
    fallbackLanguage: routing.defaultLocale,
    parser: "dot",
  }),
  url: (slugs, locale) =>
    localePath(
      routing.locales.find((tag) => tag === locale) ?? routing.defaultLocale,
      [DOCS_PATH, ...slugs].join("/")
    ),
})
