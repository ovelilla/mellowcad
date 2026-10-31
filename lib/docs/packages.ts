/**
 * The packages "Build with MellowCAD" documents, each a folder of
 * `content/docs/` whose pages include its README, its `api.md` and its guides
 * (`docs/<name>.md`): the one place that ties a docs slug to a package's
 * folder, for the pages, the links the package's files make to each other and
 * `docs:check`.
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
 * The folder of a package's guides: `cad/docs/concepts.md` is the page
 * `/docs/engine/concepts`. A guide is a file of the package, as its README is,
 * so GitHub and npm read the same words the site serves.
 */
export const GUIDES_DIR = "docs"

const GUIDE = /^[a-z][a-z0-9-]*$/

/** The guide a page name stands for, or `undefined` for the package's own pages. */
function guideFile(page: string): string | undefined {
  const own = PACKAGE_PAGES.some((entry) => (entry.page || "index") === page)
  return !own && GUIDE.test(page) ? `${GUIDES_DIR}/${page}.md` : undefined
}

/**
 * The docs path of a repository file that is a page (`cad/api.md` →
 * `/docs/engine/api`, `cad/docs/concepts.md` → `/docs/engine/concepts`), or
 * `undefined` when no page includes it.
 */
export function packagePagePath(repoPath: string): string | undefined {
  for (const pkg of DOCS_PACKAGES) {
    for (const { file, page } of PACKAGE_PAGES) {
      if (repoPath === `${pkg.dir}/${file}`) {
        return page ? `${DOCS_PATH}/${pkg.slug}/${page}` : `${DOCS_PATH}/${pkg.slug}`
      }
    }
    const prefix = `${pkg.dir}/${GUIDES_DIR}/`
    const guide = repoPath.startsWith(prefix)
      ? repoPath.slice(prefix.length).replace(/\.md$/, "")
      : undefined
    if (guide && repoPath === `${pkg.dir}/${guideFile(guide)}`) {
      return `${DOCS_PATH}/${pkg.slug}/${guide}`
    }
  }
  return undefined
}

/**
 * The repository file a page of a package's folder includes, by the page's
 * name (`index`, `api` or a guide's), from the repository root.
 */
export function packagePageFile(pkg: DocsPackage, page: string): string | undefined {
  const entry = PACKAGE_PAGES.find((candidate) => (candidate.page || "index") === page)
  const file = entry?.file ?? guideFile(page)
  return file && `${pkg.dir}/${file}`
}

/** The package a page of `content/docs/` belongs to, by its first folder. */
export function pagePackage(contentPath: string): DocsPackage | undefined {
  const match = /(?:^|\/)content\/docs\/([^/]+)\//.exec(contentPath)
  return DOCS_PACKAGES.find((pkg) => pkg.slug === match?.[1])
}
