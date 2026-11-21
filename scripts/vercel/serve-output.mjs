// Serves `.vercel/output` (what `vercel build` leaves) the way Vercel's router
// reads its config.json, closely enough to check the routing, the 404s and
// the router's payload requests in a browser without deploying. `next start`
// serves no export (`.claude/rules/i18n.md`).
//
//   vercel build --prod --yes
//   node scripts/vercel/serve-output.mjs 3010
//
// `vercel build` runs offline, deploying nothing, given a gitignored
// `.vercel/project.json` of made-up ids: {"projectId":"prj_local",
// "orgId":"team_local","settings":{"framework":"nextjs","installCommand":
// "true"}} (no install over the linked node_modules). Never deploy from
// a tree that has one.
//
// An approximation written from the Build Output API's description of the
// phases (null, filesystem, resource, miss, hit, error), not Vercel's router:
// what a deployment answers is checked on a preview.
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs"
import { createServer } from "node:http"
import path from "node:path"

const root = path.resolve(process.argv[3] ?? ".vercel/output")
const port = Number(process.argv[2] ?? 3010)
const config = JSON.parse(readFileSync(path.join(root, "config.json"), "utf8"))
const statics = path.join(root, "static")

// `overrides` serves `en/draw.html` at `en/draw`.
const overridden = new Map(
  Object.entries(config.overrides ?? {}).map(([file, { path: served }]) => [
    `/${served}`,
    file,
  ])
)

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json",
}

function fileFor(pathname) {
  const decoded = decodeURIComponent(pathname)
  const file = overridden.get(decoded) ?? decoded.slice(1)
  // A file served under a clean path is no longer at its own.
  if (!overridden.has(decoded) && config.overrides?.[file]) return null
  const full = path.join(statics, file)
  if (!full.startsWith(statics)) return null
  return existsSync(full) && statSync(full).isFile() ? full : null
}

const phases = { null: [] }
let phase = "null"
for (const route of config.routes) {
  if (route.handle) {
    phase = route.handle
    phases[phase] ??= []
  } else phases[phase].push(route)
}

function match(route, pathname) {
  const source = route.src.startsWith("^") ? route.src : `^${route.src}`
  return new RegExp(source.endsWith("$") ? source : `${source}$`).exec(pathname)
}

function fill(template, groups) {
  return template.replace(/\$(\d)/g, (_, n) => groups[Number(n)] ?? "")
}

function resolve(pathname) {
  const headers = {}
  let status
  let current = pathname
  const trail = []

  for (const route of phases.null) {
    const groups = match(route, current)
    if (!groups) continue
    for (const [key, value] of Object.entries(route.headers ?? {})) {
      headers[key] = fill(value, groups)
    }
    if (route.status >= 300 && route.status < 400 && headers.Location) {
      return { status: route.status, headers, trail }
    }
    if (route.status) status = route.status
    if (route.dest) {
      current = fill(route.dest, groups)
      trail.push(current)
    }
    if (!route.continue) break
  }

  let file = fileFor(current)
  if (!file) {
    for (const route of [
      ...(phases.filesystem ?? []),
      ...(phases.resource ?? []),
    ]) {
      const groups = match(route, current)
      if (!groups) continue
      if (route.dest) {
        current = fill(route.dest, groups).replace(/\/$/, "") || "/"
        trail.push(current)
        file = fileFor(current)
        if (file) break
        continue
      }
      if (route.status) {
        status = route.status
        break
      }
    }
  }
  if (!file) {
    status = 404
    for (const route of phases.error ?? []) {
      const groups = match(route, current) ?? match(route, pathname)
      if (!groups || !route.dest) continue
      const destination = fill(route.dest, groups)
      trail.push(`error:${destination}`)
      file = fileFor(destination)
      if (file) {
        status = route.status ?? 404
        break
      }
    }
  }
  if (file) {
    for (const route of phases.hit ?? []) {
      if (!match(route, pathname)) continue
      for (const [key, value] of Object.entries(route.headers ?? {})) {
        headers[key] = value
      }
    }
  }
  return { status: file ? (status ?? 200) : 404, headers, file, trail }
}

createServer((request, response) => {
  const { pathname } = new URL(request.url, "http://localhost")
  const { status, headers, file, trail } = resolve(pathname)
  console.log(
    `${request.method} ${pathname} ${status}${trail.length ? ` (${trail.join(" → ")})` : ""}`
  )
  if (!file) {
    response.writeHead(status, headers)
    response.end()
    return
  }
  response.writeHead(status, {
    "cache-control": "public, max-age=0, must-revalidate",
    "content-type": TYPES[path.extname(file)] ?? "application/octet-stream",
    "content-length": statSync(file).size,
    ...headers,
  })
  if (request.method === "HEAD") response.end()
  else createReadStream(file).pipe(response)
}).listen(port, () => console.log(`serving ${root} on ${port}`))
