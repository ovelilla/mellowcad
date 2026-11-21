import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

import { routing } from "../i18n/routing"

const ROOT = path.resolve(import.meta.dirname, "..")
const OUTPUT = path.join(ROOT, ".vercel/output")

type Route = {
  src?: string
  dest?: string
  status?: number
  handle?: string
  headers?: Record<string, string>
}

/**
 * What `vercel build` made of the export (`scripts/vercel/serve-output.mjs`
 * says how to run it offline): only where one has been run, so never in the
 * gate. WHY: the export's rewrites, redirects and headers reach Vercel only
 * because its builder still reads `.next/routes-manifest.json`, which Next
 * says it does not apply; a builder that stopped would ship a site with no
 * English pages, no redirects and no 404s, and these fail first.
 */
describe.runIf(existsSync(path.join(OUTPUT, "config.json")))(
  "vercel build's output",
  () => {
    const config = existsSync(path.join(OUTPUT, "config.json"))
      ? (JSON.parse(readFileSync(path.join(OUTPUT, "config.json"), "utf8")) as {
          routes: Route[]
          overrides?: Record<string, unknown>
        })
      : { routes: [] }
    const phase = (name: string | null) => {
      const start =
        name === null
          ? 0
          : config.routes.findIndex((route) => route.handle === name) + 1
      const end = config.routes.findIndex(
        (route, index) => index >= start && route.handle !== undefined
      )
      return config.routes.slice(start, end === -1 ? undefined : end)
    }
    const fill = (value: string, match: RegExpExecArray) =>
      value.replace(/\$(\d)/g, (_, n: string) => match[Number(n)] ?? "")
    const resolve = (routes: Route[], url: string) => {
      for (const route of routes) {
        // A route that only adds headers lets the request go on.
        if (route.src === undefined || (!route.dest && !route.status)) continue
        const match = new RegExp(route.src).exec(url)
        if (!match) continue
        return {
          dest: route.dest && fill(route.dest, match),
          status: route.status,
          location:
            route.headers?.Location && fill(route.headers.Location, match),
        }
      }
      return undefined
    }

    it("serves every exported page without its .html", () => {
      expect(Object.keys(config.overrides ?? {}).length).toBeGreaterThan(1000)
      expect(config.overrides).toHaveProperty(["en/draw.html"])
    })

    it("emits the config's headers", () => {
      const headers = (url: string) => {
        const found: Record<string, string> = {}
        for (const route of phase(null)) {
          if (route.src === undefined || route.status) continue
          const match = new RegExp(route.src).exec(url)
          if (!match) continue
          for (const [key, value] of Object.entries(route.headers ?? {}))
            found[key] = fill(value, match)
        }
        return found
      }
      expect(headers("/es/docs/commands/line.md").Link).toBe(
        '<https://mellowcad.com/es/docs/commands/line>; rel="canonical"'
      )
      expect(headers("/command-list.json")["X-Robots-Tag"]).toBe("noindex")
      expect(headers("/")["X-Frame-Options"]).toBe("DENY")
    })

    it("emits the config's redirects and rewrites", () => {
      expect(resolve(phase(null), "/en/draw")).toMatchObject({
        status: 308,
        location: "/draw",
      })
      expect(resolve(phase(null), "/og")).toMatchObject({
        location: "/og.png",
      })
      expect(resolve(phase(null), "/mcp")?.dest).toBe("/api/mcp")
      expect(resolve(phase(null), "/docs/engine.md")?.dest).toBe(
        "/en/docs-md/engine.md"
      )
      expect(resolve(phase("filesystem"), "/")?.dest).toBe("/en")
      expect(resolve(phase("filesystem"), "/index.txt")?.dest).toBe("/en.txt")
      expect(resolve(phase("filesystem"), "/draw")?.dest).toBe("/en/draw/")
    })

    it("answers an unknown path with its language's 404", () => {
      const error = phase("error")
      expect(resolve(error, "/es/nope")).toMatchObject({
        status: 404,
        dest: "/es/404",
      })
      expect(resolve(error, "/xx/yy")).toMatchObject({
        status: 404,
        dest: `/${routing.defaultLocale}/404`,
      })
    })

    it("builds the MCP function with its deadline", () => {
      const fn = path.join(OUTPUT, "functions/api/mcp.func/.vc-config.json")
      expect(existsSync(fn)).toBe(true)
      expect(JSON.parse(readFileSync(fn, "utf8"))).toMatchObject({
        maxDuration: 5,
      })
    })
  }
)
