import { findNeighbour } from "fumadocs-core/page-tree"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"

import { DocsMobileNav } from "@/components/docs/docs-mobile-nav"
import { docsMdxComponents } from "@/components/docs/docs-mdx-components"
import { DocsNav } from "@/components/docs/docs-nav"
import { DocsSearch } from "@/components/docs/docs-search"
import { DocsToc } from "@/components/docs/docs-toc"
import { ForwardArrow } from "@/components/marketing/forward-arrow"
import { localePath } from "@/i18n/navigation"
import type { AppLocale } from "@/i18n/routing"
import { docsSource } from "@/lib/docs/docs-source"
import { DOCS_PACKAGES, DOCS_PATH } from "@/lib/docs/packages"
import {
  canonicalPath,
  type DocsPage,
  isPublished,
  pageLanguage,
  pageSource,
} from "@/lib/docs/pages"
import { pageMetadata } from "@/lib/metadata"
import { SITE_NAME } from "@/lib/site"

// Every page of every language is prerendered; any other slug is a 404.
export const dynamicParams = false

export function generateStaticParams({
  params: { locale },
}: {
  params: { locale: string }
}) {
  return [
    { slug: [] },
    ...docsSource.getPages(locale).map((page) => ({ slug: page.slugs })),
  ]
}

async function find(slug: string[] | undefined) {
  const locale = await getLocale()
  return { locale, page: slug?.length ? docsSource.getPage(slug, locale) : undefined }
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/docs/[[...slug]]">): Promise<Metadata> {
  const { slug } = await params
  const { page } = await find(slug)
  const t = await getTranslations("Docs")
  if (!page) {
    return {
      title: t("metaTitle"),
      description: t("metaDescription"),
      ...(await pageMetadata({
        path: DOCS_PATH,
        title: `${t("metaTitle")} · ${SITE_NAME}`,
        description: t("metaDescription"),
      })),
    }
  }
  return {
    title: page.data.title,
    description: page.data.description,
    ...(await pageMetadata({
      path: canonicalPath(page),
      title: `${page.data.title} · ${SITE_NAME}`,
      description: page.data.description,
      contentLocale: pageLanguage(page),
    })),
  }
}

function StatusBadge({
  published,
  label,
  lang,
}: {
  published: boolean
  label: string
  lang: AppLocale
}) {
  return (
    <span
      lang={lang}
      dir="auto"
      className={`inline-flex h-6 items-center rounded-full border border-border px-2.5 text-xs ${published ? "text-fg-muted" : "border-dashed text-fg-subtle"}`}
    >
      {label}
    </span>
  )
}

async function DocsIndex({ locale }: { locale: AppLocale }) {
  const t = await getTranslations("Docs")
  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-4">
        <p className="label-mono">{t("label")}</p>
        <h1 className="text-h2">{t("title")}</h1>
        <p className="text-lead measure">{t("lead")}</p>
      </header>
      <section aria-labelledby="build" className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 id="build" className="text-h3">
            {t("buildTitle")}
          </h2>
          <p className="text-fg-muted measure">{t("buildLead")}</p>
        </div>
        <ul className="grid gap-4 md:grid-cols-3">
          {DOCS_PACKAGES.map((pkg) => {
            const guide = docsSource.getPage([pkg.slug], locale)
            const api = docsSource.getPage([pkg.slug, "api"], locale)
            const published = isPublished(pkg)
            if (!guide) return null
            return (
              <li
                key={pkg.slug}
                className="flex flex-col gap-4 rounded-lg border border-border bg-bg-raised p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold">{guide.data.title}</h3>
                  <StatusBadge
                    published={published}
                    label={published ? t("published") : t("notPublished")}
                    lang={locale}
                  />
                </div>
                <p dir="ltr" lang="en" className="data-mono text-xs text-fg-subtle">
                  {pkg.name}
                </p>
                <p lang="en" className="flex-1 text-sm text-fg-muted">
                  {guide.data.description}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  <Link href={guide.url} className="underline-link">
                    {t("guide")}
                  </Link>
                  {api && (
                    <Link href={api.url} className="underline-link">
                      {t("api")}
                    </Link>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}

async function DocsArticle({ page, locale }: { page: DocsPage; locale: AppLocale }) {
  const t = await getTranslations("Docs")
  const language = pageLanguage(page)
  const source = pageSource(page)
  const published = source ? isPublished(source.pkg) : true
  const { previous, next } = findNeighbour(docsSource.getPageTree(locale), page.url)
  const Body = page.data.body
  return (
    <div className="flex flex-col gap-10">
      {language !== locale && (
        <p className="rounded-md border border-border bg-bg-raised px-4 py-3 text-sm text-fg-muted">
          {t("englishOnly")}
        </p>
      )}
      <article lang={language} dir="ltr" className="min-w-0">
        <header className="mb-10 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <p className="label-mono" lang={locale} dir="auto">
              {t(`types.${page.data.type}`)}
            </p>
            {source && (
              <StatusBadge
                published={published}
                label={published ? t("published") : t("notPublished")}
                lang={locale}
              />
            )}
          </div>
          <h1 className="text-h2">{page.data.title}</h1>
          <p className="text-lead">{page.data.description}</p>
        </header>
        <Body
          components={docsMdxComponents(locale, { copy: t("copy"), copied: t("copied") })}
        />
      </article>
      <footer className="flex flex-col gap-6 border-t border-border pt-6 text-sm">
        <div className="flex flex-wrap gap-x-5 gap-y-1">
          <a href={`${canonicalPath(page)}.md`} className="underline-link">
            {t("markdown")}
          </a>
          {source && (
            <a href={source.url} className="underline-link">
              {t("source")}
            </a>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {previous && (
            <Link
              href={previous.url}
              className="flex flex-col gap-1 rounded-lg border border-border p-4 hover:bg-bg-raised"
            >
              <span className="label-mono">{t("previous")}</span>
              <span className="text-fg">{previous.name}</span>
            </Link>
          )}
          {next && (
            <Link
              href={next.url}
              className="flex flex-col items-end gap-1 rounded-lg border border-border p-4 text-end hover:bg-bg-raised sm:col-start-2"
            >
              <span className="label-mono">{t("next")}</span>
              <span className="text-fg">
                {next.name}
                <span aria-hidden="true">
                  &nbsp;
                  <ForwardArrow />
                </span>
              </span>
            </Link>
          )}
        </div>
      </footer>
    </div>
  )
}

/**
 * `/docs` and its pages, in every language: the chrome is the page's
 * language, and a page with no file of its own in it is served the English
 * one under its prefix, marked so (`docs.md`).
 */
export default async function DocsPageRoute({
  params,
}: PageProps<"/[locale]/docs/[[...slug]]">) {
  const { slug } = await params
  const { locale, page } = await find(slug)
  if (slug?.length && !page) notFound()
  const t = await getTranslations("Docs")
  const tree = docsSource.getPageTree(locale)
  const active = page?.url ?? localePath(locale, DOCS_PATH)
  const nav = (
    <DocsNav tree={tree} active={active} title={t("buildTitle")} label={t("navLabel")} />
  )

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
      <div className="flex h-14 items-center justify-between gap-4 border-b border-border">
        <div className="flex items-center gap-2">
          <DocsMobileNav labels={{ menu: t("menu"), close: t("closeMenu") }}>
            {nav}
          </DocsMobileNav>
          <Link href={localePath(locale, DOCS_PATH)} className="hidden text-sm text-fg-muted hover:text-fg lg:inline">
            {t("label")}
          </Link>
        </div>
        <DocsSearch
          locale={locale}
          labels={{
            search: t("search"),
            title: t("searchTitle"),
            placeholder: t("searchPlaceholder"),
            empty: t("searchEmpty", { query: "{query}" }),
            failed: t("searchFailed"),
            searching: t("searching"),
            close: t("close"),
          }}
        />
      </div>
      <div className="grid gap-10 py-10 lg:grid-cols-[14rem_minmax(0,1fr)] xl:grid-cols-[14rem_minmax(0,1fr)_13rem] lg:py-12">
        <aside className="hidden lg:block">
          <div className="sticky top-24">{nav}</div>
        </aside>
        <div className="min-w-0">
          {page ? <DocsArticle page={page} locale={locale} /> : <DocsIndex locale={locale} />}
        </div>
        {page && (
          <aside className="hidden xl:block">
            <div className="sticky top-24 max-h-[calc(100svh-8rem)] overflow-y-auto">
              <DocsToc items={page.data.toc} title={t("onThisPage")} />
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}

