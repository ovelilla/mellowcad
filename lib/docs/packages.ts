/**
 * The packages "Build with MellowCAD" documents, each a folder of
 * `content/docs/` whose pages include its README and its `api.md`: the one
 * place that ties a docs slug to a package's folder, for the pages, the links
 * the READMEs make to each other and `docs:check`.
 */
export const DOCS_PACKAGES = [
  { slug: "engine", dir: "cad", name: "@mellowcad/engine" },
  { slug: "react", dir: "packages/react", name: "@mellowcad/react" },
  { slug: "editor", dir: "packages/editor", name: "@mellowcad/editor" },
] as const

export type DocsPackage = (typeof DOCS_PACKAGES)[number]

/** The docs' own URL space, unprefixed: English, as every page is built. */
export const DOCS_PATH = "/docs"

/** The page each package file is: its README the package's, `api.md` its reference. */
export const PACKAGE_PAGES = [
  { file: "README.md", page: "" },
  { file: "api.md", page: "api" },
] as const

/**
 * The docs path of a repository file that is a page (`cad/api.md` →
 * `/docs/engine/api`), or `undefined` when no page includes it.
 */
export function packagePagePath(repoPath: string): string | undefined {
  for (const pkg of DOCS_PACKAGES) {
    for (const { file, page } of PACKAGE_PAGES) {
      if (repoPath === `${pkg.dir}/${file}`) {
        return page ? `${DOCS_PATH}/${pkg.slug}/${page}` : `${DOCS_PATH}/${pkg.slug}`
      }
    }
  }
  return undefined
}

/** The package a page of `content/docs/` belongs to, by its first folder. */
export function pagePackage(contentPath: string): DocsPackage | undefined {
  const match = /(?:^|\/)content\/docs\/([^/]+)\//.exec(contentPath)
  return DOCS_PACKAGES.find((pkg) => pkg.slug === match?.[1])
}
