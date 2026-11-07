import { readFileSync, readdirSync } from "node:fs"
import path from "node:path"
import { describe, expect, it, vi } from "vitest"
import { parse } from "yaml"

import { buildVersion } from "./facts"
import { REPORT_FIELDS, reportUrl } from "./report"
import { REPOSITORY_URL } from "./site"

// GitHub reads the forms from the default branch only, so a field the link
// fills that no form has, or a form GitHub refuses, would show only after the
// push: these hold the forms to the link, and to the rules GitHub enforces.

const TEMPLATES = path.resolve(import.meta.dirname, "../.github/ISSUE_TEMPLATE")

interface Element {
  readonly type: string
  readonly id?: string
  readonly attributes?: { readonly label?: string; readonly value?: string }
}

interface Form {
  readonly name: string
  readonly description: string
  readonly body: readonly Element[]
}

const read = (file: string): unknown =>
  parse(readFileSync(path.join(TEMPLATES, file), "utf8"))

const forms = readdirSync(TEMPLATES)
  .filter((file) => file.endsWith(".yml") && file !== "config.yml")
  .map((file) => ({ file, form: read(file) as Form }))

describe("the issue forms", () => {
  it("are the bug's and the AutoCAD difference's", () => {
    expect(forms.map(({ file }) => file).sort()).toEqual([
      "autocad.yml",
      "bug.yml",
    ])
  })

  it.each(forms)(
    "$file has an input for every field the link fills",
    ({ form }) => {
      const inputs = form.body.filter(
        (element) => element.type === "input" || element.type === "textarea"
      )
      for (const field of REPORT_FIELDS) {
        expect(inputs.map((element) => element.id)).toContain(field)
      }
    }
  )

  it.each(forms)("$file is a form GitHub takes", ({ form }) => {
    expect(form.name).toBeTruthy()
    expect(form.description).toBeTruthy()
    const fields = form.body.filter((element) => element.type !== "markdown")
    for (const element of fields) {
      expect(["input", "textarea", "dropdown", "checkboxes"]).toContain(
        element.type
      )
      expect(element.attributes?.label).toBeTruthy()
      expect(element.id).toMatch(/^[A-Za-z0-9_-]+$/)
    }
    const ids = fields.map((element) => element.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("have names of their own", () => {
    const names = forms.map(({ form }) => form.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it("leave no blank issue, and send a vulnerability to the security policy", () => {
    const config = read("config.yml") as {
      blank_issues_enabled: boolean
      contact_links: { url: string }[]
    }
    expect(config.blank_issues_enabled).toBe(false)
    // No address here: GitHub drops a `mailto:` contact link (this
    // repository's and Mbed TLS's, read through its API on 2026-11-07), and
    // shows the chooser only to someone signed in. Whoever has no account
    // finds the address beside the footer's Report a problem.
    expect(config.contact_links.map((link) => link.url)).toEqual([
      `${REPOSITORY_URL}/security/policy`,
    ])
  })
})

describe("a report link", () => {
  it("opens the chooser with the fields given, and only those", () => {
    const url = new URL(
      reportUrl({
        version: "0.2.0+1a2b3c4",
        browser: "Mozilla/5.0 (X11; Linux x86_64) Chrome/142.0.0.0",
        language: "pt-BR",
      })
    )
    expect(`${url.origin}${url.pathname}`).toBe(
      `${REPOSITORY_URL}/issues/new/choose`
    )
    expect(Object.fromEntries(url.searchParams)).toEqual({
      version: "0.2.0+1a2b3c4",
      browser: "Mozilla/5.0 (X11; Linux x86_64) Chrome/142.0.0.0",
      language: "pt-BR",
    })
  })

  it("leaves out what it does not know", () => {
    expect(reportUrl({ language: "ar", browser: "" })).toBe(
      `${REPOSITORY_URL}/issues/new/choose?language=ar`
    )
    expect(reportUrl({})).toBe(`${REPOSITORY_URL}/issues/new/choose`)
  })

  it("names the engine's version, and the commit Vercel built", () => {
    vi.stubEnv("VERCEL_GIT_COMMIT_SHA", "")
    const version = buildVersion()
    expect(version).toMatch(/^\d+\.\d+\.\d+$/)
    vi.stubEnv("VERCEL_GIT_COMMIT_SHA", "1a2b3c4d5e6f")
    expect(buildVersion()).toBe(`${version}+1a2b3c4`)
  })
})
