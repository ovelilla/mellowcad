/**
 * Generador del proyecto "Chalet unifamiliar de dos plantas" en formato
 * mellowcad (.ecad.json, esquema v7). Todo en milimetros, escala 1:1 en
 * espacio modelo; cada plano se coloca en una zona distinta del modelo.
 *
 * El motor no tiene entidad TEXTO todavia, asi que los rotulos se dibujan
 * con una fuente vectorial de un solo trazo (polilineas) en las capas de
 * texto/cotas. Por eso los literales van en mayusculas y sin acentos.
 *
 * Uso:  node scripts/chalet/generate.mjs
 */

import { writeFileSync, mkdirSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(HERE, "../../chalet-unifamiliar.ecad.json")

/* ------------------------------------------------------------------ capas */

const LAYERS = [
  ["PARCELA", "#facc15", "Phantom", 0.35],
  ["MUROS", "#f8fafc", "Continuous", 0.5],
  ["TABIQUES", "#cbd5e1", "Continuous", 0.25],
  ["ESTRUCTURA", "#94a3b8", "Continuous", 0.35],
  ["PUERTAS", "#38bdf8", "Continuous", 0.18],
  ["VENTANAS", "#22d3ee", "Continuous", 0.18],
  ["ESCALERA", "#e2e8f0", "Continuous", 0.18],
  ["MOBILIARIO", "#a78bfa", "Continuous", 0.13],
  ["SANITARIOS", "#67e8f9", "Continuous", 0.13],
  ["COCINA", "#c084fc", "Continuous", 0.13],
  ["VEHICULOS", "#94a3b8", "Continuous", 0.13],
  ["COTAS", "#fbbf24", "Continuous", 0.13],
  ["TEXTOS", "#fde68a", "Continuous", 0.13],
  ["SUPERFICIES", "#f59e0b", "Continuous", 0.13],
  ["INSTALACIONES", "#f472b6", "DashDot", 0.18],
  ["VEGETACION", "#4ade80", "Continuous", 0.13],
  ["PAVIMENTOS", "#a8a29e", "Continuous", 0.13],
  ["PISCINA", "#38bdf8", "Continuous", 0.18],
  ["CUBIERTA", "#e2e8f0", "Continuous", 0.25],
  ["TERRENO", "#a3a3a3", "Continuous", 0.35],
  ["PROYECCIONES", "#64748b", "Dashed", 0.13],
  ["EJES", "#ef4444", "Center", 0.13],
]

const L = {}
for (const [name] of LAYERS) L[name] = name

/* ------------------------------------------------------ fabrica entidades */

const entities = []
let seq = 0
const nid = (p) => `${p}${(seq++).toString(36)}`

let OX = 0
let OY = 0
const px = (x) => x + OX
const py = (y) => y + OY

function line(layer, x1, y1, x2, y2) {
  entities.push({
    id: nid("l"),
    type: "line",
    layerId: layer,
    start: { x: px(x1), y: py(y1) },
    end: { x: px(x2), y: py(y2) },
  })
}

function pline(layer, pts, closed = false, bulges) {
  if (pts.length < 2) return
  const e = {
    id: nid("p"),
    type: "polyline",
    layerId: layer,
    vertices: pts.map(([x, y]) => ({ x: px(x), y: py(y) })),
    closed,
  }
  if (bulges && bulges.some((b) => b !== 0)) e.bulges = bulges
  entities.push(e)
}

function rect(layer, x1, y1, x2, y2) {
  pline(
    layer,
    [
      [x1, y1],
      [x2, y1],
      [x2, y2],
      [x1, y2],
    ],
    true
  )
}

function circle(layer, cx, cy, r) {
  entities.push({
    id: nid("c"),
    type: "circle",
    layerId: layer,
    center: { x: px(cx), y: py(cy) },
    radius: r,
  })
}

function arc(layer, cx, cy, r, a0, a1) {
  entities.push({
    id: nid("a"),
    type: "arc",
    layerId: layer,
    center: { x: px(cx), y: py(cy) },
    radius: r,
    startAngle: a0,
    endAngle: a1,
  })
}

const TAU = Math.PI * 2
const norm = (a) => ((a % TAU) + TAU) % TAU

/* --------------------------------------------------- fuente de un trazo */

// Glifos en una caja de 0..4 (ancho) x 0..6 (alto). Cada glifo es una lista
// de trazos, cada trazo una polilinea de puntos.
const GLYPHS = {
  A: [
    [
      [0, 0],
      [2, 6],
      [4, 0],
    ],
    [
      [0.7, 2],
      [3.3, 2],
    ],
  ],
  B: [
    [
      [0, 0],
      [0, 6],
      [3, 6],
      [4, 5],
      [4, 4],
      [3, 3],
      [0, 3],
    ],
    [
      [3, 3],
      [4, 2],
      [4, 1],
      [3, 0],
      [0, 0],
    ],
  ],
  C: [
    [
      [4, 5],
      [3, 6],
      [1, 6],
      [0, 5],
      [0, 1],
      [1, 0],
      [3, 0],
      [4, 1],
    ],
  ],
  D: [
    [
      [0, 0],
      [0, 6],
      [2, 6],
      [4, 4],
      [4, 2],
      [2, 0],
      [0, 0],
    ],
  ],
  E: [
    [
      [4, 6],
      [0, 6],
      [0, 0],
      [4, 0],
    ],
    [
      [0, 3],
      [3, 3],
    ],
  ],
  F: [
    [
      [4, 6],
      [0, 6],
      [0, 0],
    ],
    [
      [0, 3],
      [3, 3],
    ],
  ],
  G: [
    [
      [4, 5],
      [3, 6],
      [1, 6],
      [0, 5],
      [0, 1],
      [1, 0],
      [3, 0],
      [4, 1],
      [4, 3],
      [2, 3],
    ],
  ],
  H: [
    [
      [0, 6],
      [0, 0],
    ],
    [
      [4, 6],
      [4, 0],
    ],
    [
      [0, 3],
      [4, 3],
    ],
  ],
  I: [
    [
      [1, 6],
      [3, 6],
    ],
    [
      [2, 6],
      [2, 0],
    ],
    [
      [1, 0],
      [3, 0],
    ],
  ],
  J: [
    [
      [3, 6],
      [3, 1],
      [2, 0],
      [1, 0],
      [0, 1],
    ],
  ],
  K: [
    [
      [0, 6],
      [0, 0],
    ],
    [
      [4, 6],
      [0, 2.6],
    ],
    [
      [1.4, 3.7],
      [4, 0],
    ],
  ],
  L: [
    [
      [0, 6],
      [0, 0],
      [4, 0],
    ],
  ],
  M: [
    [
      [0, 0],
      [0, 6],
      [2, 3],
      [4, 6],
      [4, 0],
    ],
  ],
  N: [
    [
      [0, 0],
      [0, 6],
      [4, 0],
      [4, 6],
    ],
  ],
  O: [
    [
      [1, 6],
      [3, 6],
      [4, 5],
      [4, 1],
      [3, 0],
      [1, 0],
      [0, 1],
      [0, 5],
      [1, 6],
    ],
  ],
  P: [
    [
      [0, 0],
      [0, 6],
      [3, 6],
      [4, 5],
      [4, 4],
      [3, 3],
      [0, 3],
    ],
  ],
  Q: [
    [
      [1, 6],
      [3, 6],
      [4, 5],
      [4, 1],
      [3, 0],
      [1, 0],
      [0, 1],
      [0, 5],
      [1, 6],
    ],
    [
      [2.4, 1.6],
      [4, 0],
    ],
  ],
  R: [
    [
      [0, 0],
      [0, 6],
      [3, 6],
      [4, 5],
      [4, 4],
      [3, 3],
      [0, 3],
    ],
    [
      [2, 3],
      [4, 0],
    ],
  ],
  S: [
    [
      [4, 5],
      [3, 6],
      [1, 6],
      [0, 5],
      [0, 4],
      [1, 3],
      [3, 3],
      [4, 2],
      [4, 1],
      [3, 0],
      [1, 0],
      [0, 1],
    ],
  ],
  T: [
    [
      [0, 6],
      [4, 6],
    ],
    [
      [2, 6],
      [2, 0],
    ],
  ],
  U: [
    [
      [0, 6],
      [0, 1],
      [1, 0],
      [3, 0],
      [4, 1],
      [4, 6],
    ],
  ],
  V: [
    [
      [0, 6],
      [2, 0],
      [4, 6],
    ],
  ],
  W: [
    [
      [0, 6],
      [1, 0],
      [2, 3.4],
      [3, 0],
      [4, 6],
    ],
  ],
  X: [
    [
      [0, 6],
      [4, 0],
    ],
    [
      [0, 0],
      [4, 6],
    ],
  ],
  Y: [
    [
      [0, 6],
      [2, 3],
      [4, 6],
    ],
    [
      [2, 3],
      [2, 0],
    ],
  ],
  Z: [
    [
      [0, 6],
      [4, 6],
      [0, 0],
      [4, 0],
    ],
  ],
  0: [
    [
      [1, 6],
      [3, 6],
      [4, 5],
      [4, 1],
      [3, 0],
      [1, 0],
      [0, 1],
      [0, 5],
      [1, 6],
    ],
  ],
  1: [
    [
      [1, 5],
      [2, 6],
      [2, 0],
    ],
    [
      [0.8, 0],
      [3.2, 0],
    ],
  ],
  2: [
    [
      [0, 5],
      [1, 6],
      [3, 6],
      [4, 5],
      [4, 4],
      [0, 0],
      [4, 0],
    ],
  ],
  3: [
    [
      [0, 6],
      [4, 6],
      [2, 3.4],
      [3, 3.4],
      [4, 2.4],
      [4, 1],
      [3, 0],
      [1, 0],
      [0, 1],
    ],
  ],
  4: [
    [
      [3, 0],
      [3, 6],
      [0, 2],
      [4, 2],
    ],
  ],
  5: [
    [
      [4, 6],
      [0, 6],
      [0, 3.4],
      [3, 3.4],
      [4, 2.4],
      [4, 1],
      [3, 0],
      [1, 0],
      [0, 1],
    ],
  ],
  6: [
    [
      [4, 5],
      [3, 6],
      [1, 6],
      [0, 5],
      [0, 1],
      [1, 0],
      [3, 0],
      [4, 1],
      [4, 2],
      [3, 3],
      [1, 3],
      [0, 2],
    ],
  ],
  7: [
    [
      [0, 6],
      [4, 6],
      [1.2, 0],
    ],
  ],
  8: [
    [
      [1, 3],
      [0, 4],
      [0, 5],
      [1, 6],
      [3, 6],
      [4, 5],
      [4, 4],
      [3, 3],
      [1, 3],
      [0, 2],
      [0, 1],
      [1, 0],
      [3, 0],
      [4, 1],
      [4, 2],
      [3, 3],
    ],
  ],
  9: [
    [
      [0, 1],
      [1, 0],
      [3, 0],
      [4, 1],
      [4, 5],
      [3, 6],
      [1, 6],
      [0, 5],
      [0, 4],
      [1, 3],
      [3, 3],
      [4, 4],
    ],
  ],
  ".": [
    [
      [1.7, 0],
      [2.3, 0],
    ],
  ],
  ",": [
    [
      [2.2, 0.6],
      [1.5, -0.8],
    ],
  ],
  "-": [
    [
      [0.5, 3],
      [3.5, 3],
    ],
  ],
  "+": [
    [
      [0.5, 3],
      [3.5, 3],
    ],
    [
      [2, 1.5],
      [2, 4.5],
    ],
  ],
  ":": [
    [
      [1.7, 4],
      [2.3, 4],
    ],
    [
      [1.7, 1.4],
      [2.3, 1.4],
    ],
  ],
  "/": [
    [
      [0, 0],
      [4, 6],
    ],
  ],
  "(": [
    [
      [3, 6],
      [1.4, 4],
      [1.4, 2],
      [3, 0],
    ],
  ],
  ")": [
    [
      [1, 6],
      [2.6, 4],
      [2.6, 2],
      [1, 0],
    ],
  ],
  "%": [
    [
      [0, 0],
      [4, 6],
    ],
    [
      [0.4, 5],
      [1.4, 5],
    ],
    [
      [2.6, 1],
      [3.6, 1],
    ],
  ],
  "=": [
    [
      [0.4, 4],
      [3.6, 4],
    ],
    [
      [0.4, 2],
      [3.6, 2],
    ],
  ],
  "'": [
    [
      [2, 6],
      [2, 5],
    ],
  ],
  "^": [
    [
      [1.2, 4.4],
      [2, 6],
      [2.8, 4.4],
    ],
  ],
}
// "@" se usa como simbolo de metro cuadrado (m2 elevado)
GLYPHS["@"] = [
  [
    [0, 4.6],
    [0.7, 5.4],
    [2.1, 5.4],
    [2.8, 4.6],
    [2.8, 4.2],
    [0, 2.4],
    [2.8, 2.4],
  ],
]

const ACCENTS = {
  Á: "A",
  É: "E",
  Í: "I",
  Ó: "O",
  Ú: "U",
  Ñ: "N",
  Ü: "U",
  á: "A",
  é: "E",
  í: "I",
  ó: "O",
  ú: "U",
  ñ: "N",
}

const GLYPH_W = 4
const ADVANCE = 5.6
const GLYPH_H = 6

function textWidth(str, h) {
  const s = h / GLYPH_H
  return str.length > 0 ? (str.length * ADVANCE - (ADVANCE - GLYPH_W)) * s : 0
}

/**
 * Rotula `str` con la fuente vectorial. `align`: "left" | "center" | "right".
 * `angle` en radianes (rotacion alrededor del punto de insercion).
 */
function text(layer, str, x, y, h, { align = "left", angle = 0 } = {}) {
  const raw = String(str)
  let s = ""
  for (const ch of raw) s += ACCENTS[ch] ?? ch
  s = s.toUpperCase()

  const scale = h / GLYPH_H
  const w = textWidth(s, h)
  let cursor = align === "center" ? -w / 2 : align === "right" ? -w : 0
  const ca = Math.cos(angle)
  const sa = Math.sin(angle)
  const place = (lx, ly) => [x + lx * ca - ly * sa, y + lx * sa + ly * ca]

  for (const ch of s) {
    const glyph = GLYPHS[ch]
    if (glyph) {
      for (const stroke of glyph) {
        pline(
          layer,
          stroke.map(([gx, gy]) => place(cursor + gx * scale, gy * scale))
        )
      }
    }
    cursor += ADVANCE * scale
  }
}

const m2 = (mm2) => (mm2 / 1e6).toFixed(1).replace(".", ",")
const m = (mm) => (mm / 1000).toFixed(2).replace(".", ",")

/* ------------------------------------------------------------- cotas */

const TICK = 120

function dimH(x1, x2, y, label, h = 220) {
  line(L.COTAS, x1, y - 250, x1, y + 250)
  line(L.COTAS, x2, y - 250, x2, y + 250)
  line(L.COTAS, x1, y, x2, y)
  line(L.COTAS, x1 - TICK, y - TICK, x1 + TICK, y + TICK)
  line(L.COTAS, x2 - TICK, y - TICK, x2 + TICK, y + TICK)
  text(L.COTAS, label ?? m(Math.abs(x2 - x1)), (x1 + x2) / 2, y + 140, h, {
    align: "center",
  })
}

function dimV(y1, y2, x, label, h = 220) {
  line(L.COTAS, x - 250, y1, x + 250, y1)
  line(L.COTAS, x - 250, y2, x + 250, y2)
  line(L.COTAS, x, y1, x, y2)
  line(L.COTAS, x - TICK, y1 - TICK, x + TICK, y1 + TICK)
  line(L.COTAS, x - TICK, y2 - TICK, x + TICK, y2 + TICK)
  text(L.COTAS, label ?? m(Math.abs(y2 - y1)), x - 140, (y1 + y2) / 2, h, {
    align: "center",
    angle: Math.PI / 2,
  })
}

/* ------------------------------------------------------ muros y huecos */

/** Rotulo de estancia: nombre + superficie util en m2. */
function room(name, x1, y1, x2, y2, extra) {
  const cx = (x1 + x2) / 2
  const cy = (y1 + y2) / 2
  const area = Math.abs((x2 - x1) * (y2 - y1))
  text(L.TEXTOS, name, cx, cy + 90, 320, { align: "center" })
  text(L.SUPERFICIES, `${m2(area)} M@`, cx, cy - 380, 240, { align: "center" })
  if (extra) text(L.TEXTOS, extra, cx, cy - 760, 200, { align: "center" })
}

function jambH(x, yb, yt) {
  line(L.MUROS, x, yb, x, yt)
}

function jambV(y, xl, xr) {
  line(L.MUROS, xl, y, xr, y)
}

function windowH(a, b, yb, yt) {
  const t = yt - yb
  line(L.VENTANAS, a, yb + t / 3, b, yb + t / 3)
  line(L.VENTANAS, a, yb + (2 * t) / 3, b, yb + (2 * t) / 3)
  line(L.VENTANAS, a, yb, b, yb)
  line(L.VENTANAS, a, yt, b, yt)
}

function windowV(a, b, xl, xr) {
  const t = xr - xl
  line(L.VENTANAS, xl + t / 3, a, xl + t / 3, b)
  line(L.VENTANAS, xl + (2 * t) / 3, a, xl + (2 * t) / 3, b)
  line(L.VENTANAS, xl, a, xl, b)
  line(L.VENTANAS, xr, a, xr, b)
}

/** Hoja + barrido de una puerta abatible. */
function leaf(hx, hy, ox, oy, dx, dy) {
  const w = Math.hypot(ox - hx, oy - hy)
  const ex = hx + dx * w
  const ey = hy + dy * w
  line(L.PUERTAS, hx, hy, ex, ey)
  const a0 = Math.atan2(oy - hy, ox - hx)
  const a1 = Math.atan2(dy, dx)
  if (norm(a1 - a0) <= Math.PI) arc(L.PUERTAS, hx, hy, w, a0, a1)
  else arc(L.PUERTAS, hx, hy, w, a1, a0)
}

/**
 * Muro horizontal (banda yb..yt) de x1 a x2 con huecos.
 * hueco: {a,b,t:"v"|"p"|"o"|"c", h:"a"|"b", into:1|-1}
 *   v ventana, p puerta abatible, o paso libre, c puerta corredera
 */
function wallH(layer, x1, x2, yb, yt, holes = []) {
  const hs = [...holes].sort((p, q) => p.a - q.a)
  let cur = x1
  for (const hole of hs) {
    if (hole.a > cur) rect(layer, cur, yb, hole.a, yt)
    cur = hole.b
  }
  if (cur < x2) rect(layer, cur, yb, x2, yt)

  for (const hole of hs) {
    jambH(hole.a, yb, yt)
    jambH(hole.b, yb, yt)
    if (hole.t === "v") windowH(hole.a, hole.b, yb, yt)
    else if (hole.t === "c") {
      const mid = (yb + yt) / 2
      line(L.PUERTAS, hole.a, mid, hole.b, mid)
      line(L.PUERTAS, hole.a + 60, mid + 90, hole.b - 60, mid + 90)
    } else if (hole.t === "p") {
      const into = hole.into ?? 1
      const hx = hole.h === "b" ? hole.b : hole.a
      const ox = hole.h === "b" ? hole.a : hole.b
      const hy = into > 0 ? yt : yb
      leaf(hx, hy, ox, hy, 0, into)
    }
  }
}

/** Muro vertical (banda xl..xr) de y1 a y2 con huecos. */
function wallV(layer, y1, y2, xl, xr, holes = []) {
  const hs = [...holes].sort((p, q) => p.a - q.a)
  let cur = y1
  for (const hole of hs) {
    if (hole.a > cur) rect(layer, xl, cur, xr, hole.a)
    cur = hole.b
  }
  if (cur < y2) rect(layer, xl, cur, xr, y2)

  for (const hole of hs) {
    jambV(hole.a, xl, xr)
    jambV(hole.b, xl, xr)
    if (hole.t === "v") windowV(hole.a, hole.b, xl, xr)
    else if (hole.t === "c") {
      const mid = (xl + xr) / 2
      line(L.PUERTAS, mid, hole.a, mid, hole.b)
      line(L.PUERTAS, mid + 90, hole.a + 60, mid + 90, hole.b - 60)
    } else if (hole.t === "p") {
      const into = hole.into ?? 1
      const hy = hole.h === "b" ? hole.b : hole.a
      const oy = hole.h === "b" ? hole.a : hole.b
      const hx = into > 0 ? xr : xl
      leaf(hx, hy, hx, oy, into, 0)
    }
  }
}

/* ------------------------------------------------------------ mobiliario */

function bed(x, y, w, len) {
  rect(L.MOBILIARIO, x, y, x + w, y + len)
  line(L.MOBILIARIO, x, y + len - 400, x + w, y + len - 400)
  rect(
    L.MOBILIARIO,
    x + w / 2 - 350,
    y + len - 350,
    x + w / 2 + 350,
    y + len - 60
  )
  if (w > 1500) {
    rect(L.MOBILIARIO, x + 120, y + len - 350, x + 120 + 600, y + len - 60)
    rect(L.MOBILIARIO, x + w - 720, y + len - 350, x + w - 120, y + len - 60)
  }
}

function nightstand(x, y) {
  rect(L.MOBILIARIO, x, y, x + 450, y + 400)
}

function wardrobe(x1, y1, x2, y2) {
  rect(L.MOBILIARIO, x1, y1, x2, y2)
  const horizontal = x2 - x1 > y2 - y1
  const n = horizontal
    ? Math.round((x2 - x1) / 600)
    : Math.round((y2 - y1) / 600)
  for (let i = 1; i < n; i++) {
    if (horizontal) {
      const x = x1 + ((x2 - x1) * i) / n
      line(L.MOBILIARIO, x, y1, x, y2)
    } else {
      const y = y1 + ((y2 - y1) * i) / n
      line(L.MOBILIARIO, x1, y, x2, y)
    }
  }
}

function shelves(x1, y1, x2, y2) {
  rect(L.MOBILIARIO, x1, y1, x2, y2)
  const horizontal = x2 - x1 > y2 - y1
  const n = horizontal
    ? Math.round((x2 - x1) / 800)
    : Math.round((y2 - y1) / 800)
  for (let i = 1; i < n; i++) {
    if (horizontal) {
      const x = x1 + ((x2 - x1) * i) / n
      line(L.MOBILIARIO, x, y1, x, y2)
    } else {
      const y = y1 + ((y2 - y1) * i) / n
      line(L.MOBILIARIO, x1, y, x2, y)
    }
  }
}

function sofa(x, y, w, d, facing = "N") {
  rect(L.MOBILIARIO, x, y, x + w, y + d)
  if (facing === "N") line(L.MOBILIARIO, x, y + 250, x + w, y + 250)
  if (facing === "S") line(L.MOBILIARIO, x, y + d - 250, x + w, y + d - 250)
  if (facing === "E") line(L.MOBILIARIO, x + 250, y, x + 250, y + d)
  if (facing === "W") line(L.MOBILIARIO, x + w - 250, y, x + w - 250, y + d)
}

function chair(cx, cy) {
  rect(L.MOBILIARIO, cx - 230, cy - 230, cx + 230, cy + 230)
}

function diningTable(x1, y1, x2, y2, seatsPerSide) {
  rect(L.MOBILIARIO, x1, y1, x2, y2)
  const w = x2 - x1
  for (let i = 0; i < seatsPerSide; i++) {
    const cx = x1 + (w * (i + 0.5)) / seatsPerSide
    chair(cx, y1 - 340)
    chair(cx, y2 + 340)
  }
  chair(x1 - 340, (y1 + y2) / 2)
  chair(x2 + 340, (y1 + y2) / 2)
}

function wc(x, y, dir = "N") {
  // dir = pared a la que se adosa la cisterna
  const w = 400
  const d = 700
  if (dir === "N" || dir === "S") {
    const sy = dir === "N" ? y - d : y
    rect(L.SANITARIOS, x - w / 2, sy, x + w / 2, sy + d)
    circle(L.SANITARIOS, x, dir === "N" ? sy + 250 : sy + d - 250, 180)
  } else {
    const sx = dir === "W" ? x : x - d
    rect(L.SANITARIOS, sx, y - w / 2, sx + d, y + w / 2)
    circle(L.SANITARIOS, dir === "W" ? sx + d - 250 : sx + 250, y, 180)
  }
}

function basin(x1, y1, x2, y2) {
  rect(L.SANITARIOS, x1, y1, x2, y2)
  circle(
    L.SANITARIOS,
    (x1 + x2) / 2,
    (y1 + y2) / 2,
    Math.min(x2 - x1, y2 - y1) * 0.3
  )
}

function shower(x1, y1, x2, y2) {
  rect(L.SANITARIOS, x1, y1, x2, y2)
  line(L.SANITARIOS, x1, y1, x2, y2)
  line(L.SANITARIOS, x1, y2, x2, y1)
}

function bathtub(x1, y1, x2, y2) {
  rect(L.SANITARIOS, x1, y1, x2, y2)
  rect(L.SANITARIOS, x1 + 90, y1 + 90, x2 - 90, y2 - 90)
}

function counter(x1, y1, x2, y2) {
  rect(L.COCINA, x1, y1, x2, y2)
}

function sink(cx, cy) {
  rect(L.COCINA, cx - 350, cy - 250, cx + 350, cy + 250)
  circle(L.COCINA, cx, cy, 90)
}

function hob(cx, cy) {
  rect(L.COCINA, cx - 350, cy - 250, cx + 350, cy + 250)
  for (const [dx, dy] of [
    [-160, 110],
    [160, 110],
    [-160, -110],
    [160, -110],
  ])
    circle(L.COCINA, cx + dx, cy + dy, 80)
}

function appliance(x1, y1, x2, y2) {
  rect(L.COCINA, x1, y1, x2, y2)
  circle(
    L.COCINA,
    (x1 + x2) / 2,
    (y1 + y2) / 2,
    Math.min(x2 - x1, y2 - y1) * 0.3
  )
}

function car(x, y, angle = 0) {
  // coche tipo 4.60 x 1.85 con morro redondeado simplificado
  const w = 1850
  const len = 4600
  const pts = [
    [0, 300],
    [250, 0],
    [w - 250, 0],
    [w, 300],
    [w, len - 300],
    [w - 300, len],
    [300, len],
    [0, len - 300],
  ]
  const ca = Math.cos(angle)
  const sa = Math.sin(angle)
  pline(
    L.VEHICULOS,
    pts.map(([lx, ly]) => [x + lx * ca - ly * sa, y + lx * sa + ly * ca]),
    true
  )
}

function tree(cx, cy, r) {
  circle(L.VEGETACION, cx, cy, r)
  circle(L.VEGETACION, cx, cy, r * 0.18)
  for (let i = 0; i < 8; i++) {
    const a = (i * TAU) / 8 + 0.2
    line(
      L.VEGETACION,
      cx + Math.cos(a) * r * 0.18,
      cy + Math.sin(a) * r * 0.18,
      cx + Math.cos(a) * r,
      cy + Math.sin(a) * r
    )
  }
}

/** Rayado a 45 grados dentro de un rectangulo. */
function hatch45(layer, x1, y1, x2, y2, step) {
  const w = x2 - x1
  const h = y2 - y1
  for (let d = -h; d < w; d += step) {
    const ax = Math.max(x1 + d, x1)
    const ay = d < 0 ? y1 - d : y1
    const bx = Math.min(x1 + d + h, x2)
    const by = ay + (bx - ax)
    if (bx > ax) line(layer, ax, ay, bx, by)
  }
}

const arrow = (layer, x1, y1, x2, y2, size = 250) => {
  line(layer, x1, y1, x2, y2)
  const a = Math.atan2(y2 - y1, x2 - x1)
  line(
    layer,
    x2,
    y2,
    x2 - size * Math.cos(a - 0.4),
    y2 - size * Math.sin(a - 0.4)
  )
  line(
    layer,
    x2,
    y2,
    x2 - size * Math.cos(a + 0.4),
    y2 - size * Math.sin(a + 0.4)
  )
}

function northArrow(cx, cy, r) {
  circle(L.TEXTOS, cx, cy, r)
  pline(
    L.TEXTOS,
    [
      [cx, cy + r * 0.85],
      [cx - r * 0.35, cy - r * 0.6],
      [cx, cy - r * 0.25],
      [cx + r * 0.35, cy - r * 0.6],
    ],
    true
  )
  text(L.TEXTOS, "N", cx, cy + r * 1.25, r * 0.6, { align: "center" })
}

function sheetTitle(str, x, y, sub) {
  text(L.TEXTOS, str, x, y, 900)
  line(L.TEXTOS, x, y - 350, x + textWidth(str.toUpperCase(), 900), y - 350)
  if (sub) text(L.TEXTOS, sub, x, y - 1100, 420)
}

/* ================================================================== */
/*  GEOMETRIA BASE DEL EDIFICIO (coordenadas locales de la vivienda)   */
/* ================================================================== */

const EXT = 300 // espesor muro exterior
const W = 15600 // ancho total vivienda
const D = 9600 // fondo total vivienda

// bandas interiores
const IX0 = 300
const IX1 = 15300
const IY0 = 300
const IY1 = 9300

// PLANTA BAJA: franja de dia (sur) y franja de servicio (norte)
const GB = 6000 // cara sur del muro de crujia
const GBt = 6100 // cara norte

// garaje
const GAR = { x1: -6600, x2: 0, y1: 2400, y2: 9600 }

// porche
const POR = { x1: 4100, x2: 12300, y1: -3800, y2: 0 }

/* ------------------------------------------------------- PLANTA BAJA */

function groundFloorShell() {
  // muro sur con huecos
  wallH(L.MUROS, 0, W, 0, EXT, [
    { a: 1000, b: 3200, t: "v" }, // cocina
    { a: 4600, b: 6800, t: "c" }, // comedor - corredera al porche
    { a: 7700, b: 10100, t: "c" }, // salon - corredera al porche
    { a: 10800, b: 11900, t: "v" }, // salon
    { a: 13000, b: 14600, t: "v" }, // despacho
  ])
  // muro norte
  wallH(L.MUROS, 0, W, D - EXT, D, [
    { a: 900, b: 1900, t: "v" }, // vestidor entrada / mudroom
    { a: 5000, b: 5900, t: "p", h: "a", into: -1 }, // lavadero - salida servicio
    { a: 8200, b: 9200, t: "p", h: "a", into: -1 }, // acceso principal
    { a: 11200, b: 12000, t: "v" }, // bano
    { a: 13400, b: 14300, t: "p", h: "b", into: -1 }, // acceso cuarto tecnico
  ])
  // muro oeste
  wallV(L.MUROS, 0, D, 0, EXT, [
    { a: 800, b: 2300, t: "v" }, // cocina
    { a: 6400, b: 7300, t: "p", h: "a", into: 1 }, // garaje -> mudroom
  ])
  // muro este
  wallV(L.MUROS, 0, D, W - EXT, W, [
    { a: 2000, b: 4000, t: "v" }, // despacho
    { a: 7000, b: 8600, t: "v" }, // cuarto tecnico
  ])
}

function groundFloorPartitions() {
  // muro de crujia (sur/norte)
  wallH(L.TABIQUES, IX0, IX1, GB, GBt, [
    { a: 2900, b: 3800, t: "p", h: "a", into: -1 }, // despensa -> cocina
    { a: 8600, b: 10300, t: "o" }, // vestibulo -> salon (paso doble)
    { a: 13500, b: 14400, t: "p", h: "a", into: 1 }, // despacho -> cuarto tecnico
  ])

  // franja norte
  wallV(L.TABIQUES, GBt, IY1, 2500, 2600, [
    { a: 6600, b: 7500, t: "p", h: "a", into: 1 },
  ])
  wallV(L.TABIQUES, GBt, IY1, 4000, 4100, [
    { a: 6500, b: 7400, t: "p", h: "a", into: 1 },
  ])
  wallV(L.TABIQUES, GBt, IY1, 6800, 6900, [
    { a: 6500, b: 7400, t: "p", h: "b", into: 1 },
  ])
  wallV(L.TABIQUES, GBt, IY1, 10700, 10800, [
    { a: 7500, b: 8400, t: "p", h: "a", into: 1 },
  ])
  wallV(L.TABIQUES, GBt, IY1, 12400, 12500)

  // franja sur
  wallV(L.TABIQUES, IY0, GB, 4000, 4100, [{ a: 3000, b: 5000, t: "o" }])
  wallV(L.TABIQUES, IY0, GB, 7100, 7200, [{ a: 1500, b: 4500, t: "c" }])
  wallV(L.TABIQUES, IY0, GB, 12200, 12300, [
    { a: 3500, b: 4400, t: "p", h: "a", into: -1 },
  ])

  // armario / hueco reservado para futuro ascensor junto a la escalera
  rect(L.TABIQUES, 9600, 7900, 10700, 8000)
  rect(L.TABIQUES, 9600, 8000, 9700, 9300)
  text(L.TEXTOS, "RESERVA ASCENSOR", 10150, 8600, 170, { align: "center" })
  text(L.TEXTOS, "(ARMARIO)", 10150, 8330, 170, { align: "center" })
}

function stairGround() {
  // escalera en U: 15 contrahuellas de 20,3 cm / huella 27 cm
  const x1 = 7200
  const x2 = 9500
  const y1 = 6300
  const y2 = 9200
  rect(L.ESCALERA, x1, y1, x2, y2)

  // tramo 1 (subida hacia el norte)
  for (let i = 1; i <= 6; i++)
    line(L.ESCALERA, x1, y1 + i * 270, x1 + 1100, y1 + i * 270)
  line(L.ESCALERA, x1 + 1100, y1, x1 + 1100, y1 + 1620)
  // meseta
  line(L.ESCALERA, x1, y1 + 1620, x2, y1 + 1620)
  // tramo 2 (bajada hacia el sur, lado este)
  for (let i = 0; i < 7; i++)
    line(L.ESCALERA, x1 + 1200, 9110 - i * 270, x2, 9110 - i * 270)
  line(L.ESCALERA, x1 + 1200, y1 + 920, x1 + 1200, 9110)

  arrow(L.ESCALERA, 7750, 6450, 7750, 7800, 220)
  text(L.TEXTOS, "SUBE", 7950, 7000, 200)
}

function groundFurniture() {
  // ---- COCINA (300..4000 x 300..6000)
  counter(IX0, 4300, 1000, GB) // frente norte
  counter(IX0, 700, 900, 4200) // frente oeste
  sink(700, 3000)
  appliance(IX0, 5000, 1000, 5900) // frigorifico
  counter(1500, 2400, 3700, 3400) // isla 2,20 x 1,00
  hob(2600, 2900)
  text(L.TEXTOS, "ISLA 2,20 X 1,00", 2600, 2100, 180, { align: "center" })

  // ---- DESPENSA (2600..4000 x 6100..9300)
  shelves(2600, 8700, 4000, 9300)
  shelves(2600, 6100, 2900, 8700)

  // ---- LAVADERO (4100..6800 x 6100..9300)
  appliance(4200, 8500, 4800, 9200) // lavadora
  appliance(4900, 8500, 5500, 9200) // secadora
  counter(4200, 6200, 4800, 8200)
  sink(4500, 7600)
  shelves(6100, 6200, 6800, 9200)

  // ---- MUDROOM (300..2500 x 6100..9300)
  rect(L.MOBILIARIO, 400, 6300, 1000, 7800) // banco
  wardrobe(1500, 8600, 2500, 9200) // taquillas
  shelves(400, 8000, 1000, 9200)

  // ---- VESTIBULO / ESCALERA
  wardrobe(6950, 6200, 7150, 8200) // armario abrigos

  // ---- BANO PB (10800..12400 x 6100..9300)
  shower(11500, 8300, 12400, 9300)
  basin(10800, 8500, 11400, 9300)
  wc(11000, 6100, "S")

  // ---- CUARTO TECNICO (12500..15300 x 6100..9300)
  rect(L.INSTALACIONES, 12600, 6200, 13500, 7100) // bomba de calor interior
  circle(L.INSTALACIONES, 14300, 6800, 450) // acumulador ACS
  rect(L.INSTALACIONES, 12600, 8600, 14000, 9200) // cuadros y telecos
  text(L.TEXTOS, "BC + ACS", 13050, 6650, 170, { align: "center" })
  text(L.TEXTOS, "CUADROS/RED", 13300, 8900, 170, { align: "center" })

  // ---- COMEDOR (4100..7100 x 300..6000)
  diningTable(4500, 2200, 6700, 3800, 3)

  // ---- SALON (7200..12200 x 300..6000)
  sofa(8300, 900, 2400, 950, "N")
  sofa(7350, 2200, 900, 1900, "E")
  sofa(11150, 2200, 900, 1900, "W")
  rect(L.MOBILIARIO, 8900, 2500, 10300, 3200) // mesa de centro
  rect(L.MOBILIARIO, 8600, 5500, 10600, 5950) // mueble TV
  line(L.MOBILIARIO, 9300, 5950, 9900, 5950)
  shelves(11700, 700, 12200, 3000) // libreria

  // ---- DESPACHO / INVITADOS (12300..15300 x 300..6000)
  rect(L.MOBILIARIO, 12600, 5200, 14200, 5900) // escritorio
  chair(13400, 4800)
  bed(13500, 800, 1400, 2000)
  wardrobe(12400, 800, 13000, 3400)

  // ---- GARAJE
  car(GAR.x1 + 700, GAR.y1 + 900)
  car(GAR.x1 + 3300, GAR.y1 + 900)
  shelves(GAR.x1 + 300, GAR.y2 - 900, GAR.x2 - 300, GAR.y2 - 300)
  rect(L.MOBILIARIO, GAR.x1 + 300, GAR.y1 + 300, GAR.x1 + 1100, GAR.y1 + 700) // bicicletas
  text(L.TEXTOS, "BICIS", GAR.x1 + 700, GAR.y1 + 430, 170, { align: "center" })
  rect(L.INSTALACIONES, -400, 5200, -300, 5900)
  text(L.TEXTOS, "CARGADOR VE", -600, 5550, 180, { align: "right" })
}

function groundPorch() {
  rect(L.PAVIMENTOS, POR.x1, POR.y1, POR.x2, POR.y2)
  for (const x of [POR.x1, (POR.x1 + POR.x2) / 2, POR.x2]) {
    rect(L.ESTRUCTURA, x - 150, POR.y1 - 150, x + 150, POR.y1 + 150)
  }
  // mobiliario de terraza
  diningTable(5000, -2800, 7400, -1200, 3)
  sofa(9000, -2600, 2200, 900, "S")
  sofa(11400, -2600, 900, 900, "S")
  rect(L.MOBILIARIO, 9600, -1400, 10800, -800)
  text(L.TEXTOS, "PORCHE CUBIERTO", (POR.x1 + POR.x2) / 2, POR.y1 + 400, 300, {
    align: "center",
  })
  text(
    L.SUPERFICIES,
    `${m2((POR.x2 - POR.x1) * (POR.y2 - POR.y1))} M@`,
    (POR.x1 + POR.x2) / 2,
    POR.y1 + 40,
    240,
    {
      align: "center",
    }
  )
}

function groundRooms() {
  room("COCINA", IX0, IY0, 4000, GB)
  room("COMEDOR", 4100, IY0, 7100, GB)
  room("SALON", 7200, IY0, 12200, GB)
  room("DESPACHO / INVITADOS", 12300, IY0, IX1, GB)
  room("MUDROOM", IX0, GBt, 2500, IY1)
  room("DESPENSA", 2600, GBt, 4000, IY1)
  room("LAVADERO", 4100, GBt, 6800, IY1)
  text(L.TEXTOS, "VESTIBULO", 8800, 6600, 320, { align: "center" })
  text(L.SUPERFICIES, "12,2 M@", 8800, 6250, 240, { align: "center" })
  room("BANO", 10800, GBt, 12400, IY1)
  room("C. TECNICO", 12500, GBt, IX1, IY1)
  text(L.TEXTOS, "GARAJE 2 PLAZAS", (GAR.x1 + GAR.x2) / 2, 4400, 340, {
    align: "center",
  })
  text(L.SUPERFICIES, "37,8 M@", (GAR.x1 + GAR.x2) / 2, 4000, 260, {
    align: "center",
  })
}

function garageShell() {
  wallH(L.MUROS, GAR.x1, GAR.x2, GAR.y1, GAR.y1 + EXT)
  wallH(L.MUROS, GAR.x1, GAR.x2, GAR.y2 - EXT, GAR.y2, [
    { a: GAR.x1 + 800, b: GAR.x1 + 5900, t: "o" },
  ])
  wallV(L.MUROS, GAR.y1, GAR.y2, GAR.x1, GAR.x1 + EXT)
  // puerta seccional
  line(L.PUERTAS, GAR.x1 + 800, GAR.y2 - 150, GAR.x1 + 5900, GAR.y2 - 150)
  text(L.TEXTOS, "PUERTA SECCIONAL 5,10", GAR.x1 + 3350, GAR.y2 + 350, 220, {
    align: "center",
  })
}

function buildGroundFloor() {
  sheetTitle(
    "PLANO 2 - PLANTA BAJA",
    -6600,
    13500,
    "ESCALA 1:100  -  COTAS EN METROS"
  )
  groundFloorShell()
  garageShell()
  groundFloorPartitions()
  stairGround()
  groundPorch()
  groundFurniture()
  groundRooms()

  // linea de seccion A-A
  line(L.EJES, 9000, -5200, 9000, 11000)
  text(L.EJES, "A", 9000, 11200, 400, { align: "center" })
  text(L.EJES, "A", 9000, -5800, 400, { align: "center" })

  // cotas generales
  dimH(0, W, -6200, null, 260)
  dimH(GAR.x1, 0, -6200, null, 260)
  dimH(0, 4100, -5200)
  dimH(4100, 7200, -5200)
  dimH(7200, 12300, -5200)
  dimH(12300, W, -5200)
  dimV(0, D, -7600, null, 260)
  dimV(0, GB, -6600)
  dimV(GBt, D, -6600)
  dimV(GAR.y1, GAR.y2, GAR.x1 - 1400, null, 260)

  northArrow(17800, 10500, 900)
}

/* ---------------------------------------------------- PLANTA PRIMERA */

const FS = 4800 // cara norte de los dormitorios
const FSt = 4900
const FN = 6300 // cara sur de la franja norte
const FNt = 6400

function firstFloorShell() {
  wallH(L.MUROS, 0, W, 0, EXT, [
    { a: 1300, b: 3200, t: "v" },
    { a: 5200, b: 6800, t: "v" },
    { a: 8700, b: 10300, t: "v" },
    { a: 12500, b: 14300, t: "v" },
  ])
  wallH(L.MUROS, 0, W, D - EXT, D, [
    { a: 3800, b: 5000, t: "v" },
    { a: 10500, b: 11700, t: "v" },
    { a: 13400, b: 14400, t: "v" },
  ])
  wallV(L.MUROS, 0, D, 0, EXT, [{ a: 1200, b: 3600, t: "v" }])
  wallV(L.MUROS, 0, D, W - EXT, W, [{ a: 1500, b: 3500, t: "v" }])
}

function firstFloorPartitions() {
  // muro sur del pasillo (dormitorios)
  wallH(L.TABIQUES, IX0, IX1, FS, FSt, [
    { a: 1800, b: 2700, t: "p", h: "a", into: -1 },
    { a: 5600, b: 6500, t: "p", h: "a", into: -1 },
    { a: 9100, b: 10000, t: "p", h: "a", into: -1 },
    { a: 12800, b: 14000, t: "o" },
  ])
  // muro norte del pasillo
  wallH(L.TABIQUES, IX0, IX1, FN, FNt, [
    { a: 1200, b: 2100, t: "p", h: "a", into: 1 },
    { a: 4000, b: 4900, t: "p", h: "a", into: 1 },
    { a: 6300, b: 7000, t: "p", h: "a", into: 1 },
    { a: 8400, b: 9500, t: "o" },
    { a: 10600, b: 11500, t: "p", h: "a", into: 1 },
    { a: 13400, b: 14300, t: "p", h: "a", into: 1 },
  ])
  // divisiones dormitorios
  wallV(L.TABIQUES, IY0, FS, 4200, 4300)
  wallV(L.TABIQUES, IY0, FS, 7700, 7800)
  wallV(L.TABIQUES, IY0, FS, 11200, 11300)
  // divisiones franja norte
  wallV(L.TABIQUES, FNt, IY1, 2800, 2900)
  wallV(L.TABIQUES, FNt, IY1, 6000, 6100)
  wallV(L.TABIQUES, FNt, IY1, 7100, 7200)
  wallV(L.TABIQUES, FNt, IY1, 9500, 9600)
  wallV(L.TABIQUES, FNt, IY1, 12300, 12400)
}

function stairFirst() {
  const x1 = 7200
  const x2 = 9500
  const y1 = 6400
  const y2 = 9200
  rect(L.ESCALERA, x1, y1, x2, y2)
  line(L.ESCALERA, x1 + 1100, y1, x1 + 1100, y2 - 1190)
  line(L.ESCALERA, x1, y2 - 1190, x2, y2 - 1190)
  for (let i = 0; i < 7; i++)
    line(L.ESCALERA, x1 + 1200, 9110 - i * 270, x2, 9110 - i * 270)
  for (let i = 1; i <= 6; i++)
    line(L.PROYECCIONES, x1, y1 + i * 250, x1 + 1100, y1 + i * 250)
  arrow(L.ESCALERA, 8900, 7300, 8900, 8900, 220)
  text(L.TEXTOS, "BAJA", 8300, 7200, 200)
}

function firstFurniture() {
  // ---- DORMITORIO PRINCIPAL (300..4200 x 300..4800)
  bed(1350, IY0 + 100, 1800, 2100)
  nightstand(850, 1900)
  nightstand(3200, 1900)
  rect(L.MOBILIARIO, 2900, 3700, 4100, 4200) // comoda

  // ---- DORMITORIO 3 (4300..7700 x 300..4800)
  bed(4600, IY0 + 100, 1500, 2000)
  nightstand(6200, 1600)
  rect(L.MOBILIARIO, 6100, 3900, 7600, 4600) // escritorio 1,50
  wardrobe(4400, 3400, 5600, 4000)

  // ---- DORMITORIO 4 (7800..11200 x 300..4800)
  bed(8100, IY0 + 100, 1500, 2000)
  nightstand(9700, 1600)
  rect(L.MOBILIARIO, 9600, 3900, 11100, 4600)
  wardrobe(7900, 3400, 9100, 4000)

  // ---- SALA FAMILIAR (11300..15300 x 300..4800)
  sofa(11800, 700, 2200, 900, "N")
  rect(L.MOBILIARIO, 12300, 2100, 13500, 2700)
  shelves(14600, 700, 15200, 3600)

  // ---- VESTIDOR (300..2800 x 6400..9300)
  wardrobe(400, 8600, 2700, 9200)
  wardrobe(400, 6500, 1000, 8500)

  // ---- BANO PRINCIPAL (2900..6000 x 6400..9300)
  basin(3000, 8600, 4600, 9200)
  shower(4900, 8100, 5900, 9200)
  wc(3200, 6400, "S")
  bathtub(4200, 6450, 5900, 7250)

  // ---- ARMARIO ROPA BLANCA (6100..7100)
  shelves(6100, 8100, 7100, 9200)

  // ---- BANO FAMILIAR (9600..12300 x 6400..9300)
  basin(9700, 8600, 11300, 9200)
  bathtub(11400, 7400, 12200, 9100)
  wc(9900, 6400, "S")
  shower(11300, 6500, 12200, 7300)

  // ---- ALMACENAJE (12400..15300 x 6400..9300)
  shelves(12500, 8600, 15200, 9200)
  wardrobe(12500, 6500, 13100, 8400)
  text(L.TEXTOS, "MALETAS", 14200, 7500, 200, { align: "center" })
}

function firstRooms() {
  room("DORM. PRINCIPAL", IX0, IY0, 4200, FS)
  room("DORMITORIO 3", 4300, IY0, 7700, FS)
  room("DORMITORIO 4", 7800, IY0, 11200, FS)
  room("SALA FAMILIAR", 11300, IY0, IX1, FS)
  room("VESTIDOR", IX0, FNt, 2800, IY1)
  room("BANO PRINCIPAL", 2900, FNt, 6000, IY1)
  text(L.TEXTOS, "ROPA", 6600, 7600, 200, { align: "center" })
  text(L.TEXTOS, "BLANCA", 6600, 7350, 200, { align: "center" })
  room("BANO FAMILIAR", 9600, FNt, 12300, IY1)
  room("ALMACENAJE", 12400, FNt, IX1, IY1)
  text(L.TEXTOS, "PASILLO", 2500, 5450, 280)
  text(L.TEXTOS, "DISTRIBUIDOR", 10000, 5450, 280)
}

function buildFirstFloor() {
  sheetTitle(
    "PLANO 3 - PLANTA PRIMERA",
    0,
    13500,
    "ESCALA 1:100  -  COTAS EN METROS"
  )
  firstFloorShell()
  firstFloorPartitions()
  stairFirst()
  firstFurniture()
  firstRooms()

  // proyeccion del porche y del garaje bajo cubierta
  rect(L.PROYECCIONES, POR.x1, POR.y1, POR.x2, POR.y2)
  rect(L.PROYECCIONES, GAR.x1, GAR.y1, GAR.x2, GAR.y2)
  text(L.TEXTOS, "CUBIERTA PLANA GARAJE", (GAR.x1 + GAR.x2) / 2, 6000, 260, {
    align: "center",
  })
  text(L.TEXTOS, "PROY. PORCHE", (POR.x1 + POR.x2) / 2, POR.y1 + 500, 260, {
    align: "center",
  })

  dimH(0, W, -5400, null, 260)
  dimH(0, 4300, -4600)
  dimH(4300, 7800, -4600)
  dimH(7800, 11300, -4600)
  dimH(11300, W, -4600)
  dimV(0, D, -1800, null, 260)
  dimV(0, FS, -1000)
  dimV(FSt, FN, -1000)
  dimV(FNt, D, -1000)

  northArrow(17800, 10500, 900)
}

/* ------------------------------------------------------------ CUBIERTA */

function buildRoof() {
  sheetTitle("PLANO 4 - CUBIERTA", 0, 13500, "PENDIENTE 25%  -  ALERO 0,60 M")

  const o = 600
  const x1 = -o
  const x2 = W + o
  const y1 = -o
  const y2 = D + o
  rect(L.CUBIERTA, x1, y1, x2, y2)
  rect(L.PROYECCIONES, 0, 0, W, D)

  // cumbrera y limas de la cubierta a cuatro aguas
  const half = (y2 - y1) / 2
  const ry = (y1 + y2) / 2
  const rx1 = x1 + half
  const rx2 = x2 - half
  line(L.CUBIERTA, rx1, ry, rx2, ry)
  line(L.CUBIERTA, x1, y1, rx1, ry)
  line(L.CUBIERTA, x1, y2, rx1, ry)
  line(L.CUBIERTA, x2, y1, rx2, ry)
  line(L.CUBIERTA, x2, y2, rx2, ry)

  // flechas de pendiente
  arrow(L.CUBIERTA, 3000, ry - 500, 3000, y1 + 400, 300)
  arrow(L.CUBIERTA, 12000, ry + 500, 12000, y2 - 400, 300)
  text(L.TEXTOS, "25%", 3300, 2400, 300)
  text(L.TEXTOS, "25%", 12300, 7600, 300)
  text(L.TEXTOS, "CUMBRERA", (rx1 + rx2) / 2, ry + 200, 280, {
    align: "center",
  })

  // canalones y bajantes
  line(L.INSTALACIONES, x1, y1, x2, y1)
  line(L.INSTALACIONES, x1, y2, x2, y2)
  for (const [bx, by] of [
    [x1 + 200, y1 + 200],
    [x2 - 200, y1 + 200],
    [x1 + 200, y2 - 200],
    [x2 - 200, y2 - 200],
    [W / 2, y1 + 200],
  ]) {
    circle(L.INSTALACIONES, bx, by, 90)
    circle(L.INSTALACIONES, bx, by, 160)
  }
  text(L.TEXTOS, "BAJANTE PLUVIALES (5 UD)", x2 + 700, y1 + 200, 260)

  // captacion fotovoltaica en el falton sur
  const pw = 1750
  const ph = 1050
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 6; c++) {
      const bx = 3600 + c * (pw + 60)
      const by = 900 + r * (ph + 60)
      rect(L.INSTALACIONES, bx, by, bx + pw, by + ph)
      line(L.INSTALACIONES, bx, by, bx + pw, by + ph)
    }
  }
  text(
    L.TEXTOS,
    "FOTOVOLTAICA 12 MODULOS (~5,0 KWP) - FALDON SUR",
    3600,
    3300,
    280
  )

  // unidad exterior de la bomba de calor sobre cubierta plana del garaje
  rect(L.CUBIERTA, GAR.x1 - o, GAR.y1 - o, GAR.x2, GAR.y2 + o)
  text(L.TEXTOS, "CUBIERTA PLANA", (GAR.x1 + GAR.x2) / 2, 6600, 280, {
    align: "center",
  })
  text(L.TEXTOS, "GARAJE", (GAR.x1 + GAR.x2) / 2, 6200, 280, {
    align: "center",
  })
  rect(
    L.INSTALACIONES,
    GAR.x1 + 800,
    GAR.y1 + 800,
    GAR.x1 + 2200,
    GAR.y1 + 1700
  )
  text(L.TEXTOS, "UE BOMBA DE CALOR", GAR.x1 + 800, GAR.y1 + 2000, 240)
  arrow(L.CUBIERTA, GAR.x1 + 3000, 7000, GAR.x1 + 3000, GAR.y1 + 900, 300)
  text(L.TEXTOS, "2%", GAR.x1 + 3200, 6000, 260)

  dimH(x1, x2, y1 - 2200, null, 280)
  dimV(y1, y2, x2 + 2600, null, 280)
  northArrow(x2 + 4200, 9500, 900)
}

/* ------------------------------------------------------------ SECCION */

// Alturas (referidas a la cota +-0,00 = suelo acabado de planta baja)
const H = {
  terreno: -300,
  cimiento: -900,
  pb: 0,
  pbTecho: 2750,
  forjado: 300,
  pp: 3050,
  ppTecho: 5750,
  cubierta: 6050,
}

function buildSection() {
  sheetTitle(
    "PLANO 5 - SECCION A-A",
    -9000,
    12000,
    "JARDIN / SALON / ESCALERA / PLANTA PRIMERA"
  )

  const gy1 = -8000 // jardin (sur)
  const gy2 = D + 1500 // norte

  // terreno
  line(L.TERRENO, gy1, H.terreno, POR.y1, H.terreno)
  line(L.TERRENO, POR.y1, H.terreno, POR.y1, H.pb)
  line(L.TERRENO, POR.y1, H.pb, 0, H.pb)
  line(L.TERRENO, D, H.pb, D + 400, H.pb)
  line(L.TERRENO, D + 400, H.terreno, gy2, H.terreno)
  line(L.TERRENO, D + 400, H.pb, D + 400, H.terreno)

  // solera y cimentacion
  rect(L.ESTRUCTURA, 0, H.cimiento, D, H.pb)
  hatch45(L.ESTRUCTURA, 0, H.cimiento, D, H.pb, 900)

  // muros cortados (sur y norte)
  rect(L.MUROS, 0, H.pb, EXT, H.pbTecho)
  rect(L.MUROS, D - EXT, H.pb, D, H.pbTecho)
  rect(L.MUROS, 0, H.pp, EXT, H.ppTecho)
  rect(L.MUROS, D - EXT, H.pp, D, H.ppTecho)

  // forjados
  rect(L.ESTRUCTURA, 0, H.pbTecho, D, H.pp)
  rect(L.ESTRUCTURA, 0, H.ppTecho, D, H.cubierta)

  // porche
  rect(L.ESTRUCTURA, POR.y1, H.pbTecho, 0, H.pbTecho + 300)
  line(L.ESTRUCTURA, POR.y1, H.pb, POR.y1, H.pbTecho)
  rect(L.PAVIMENTOS, POR.y1, H.pb - 120, 0, H.pb)

  // cubierta inclinada (seccion transversal: dos faldones al 25%)
  const rise = ((D / 2 + 600) * 25) / 100
  pline(L.CUBIERTA, [
    [-600, H.cubierta],
    [D / 2, H.cubierta + rise],
    [D + 600, H.cubierta],
  ])
  pline(L.CUBIERTA, [
    [-600, H.cubierta - 200],
    [D / 2, H.cubierta + rise - 200],
    [D + 600, H.cubierta - 200],
  ])

  // huecos en fachada sur (salon planta baja + dormitorio 4 planta primera)
  rect(L.VENTANAS, 0, H.pb + 50, EXT, H.pbTecho - 300)
  rect(L.VENTANAS, 0, H.pp + 900, EXT, H.pp + 2300)
  rect(L.VENTANAS, D - EXT, H.pp + 900, D, H.pp + 2300)

  // escalera esquematica (15 tabicas de 20,3)
  let sx = 6300
  let sy = H.pb
  for (let i = 0; i < 7; i++) {
    line(L.ESCALERA, sx, sy, sx, sy + 203)
    line(L.ESCALERA, sx, sy + 203, sx + 270, sy + 203)
    sx += 270
    sy += 203
  }
  line(L.ESCALERA, sx, sy, sx + 1190, sy) // meseta
  sx += 1190
  for (let i = 0; i < 8; i++) {
    line(L.ESCALERA, sx, sy, sx, sy + 203)
    line(L.ESCALERA, sx, sy + 203, sx - 270, sy + 203)
    sx -= 270
    sy += 203
  }
  text(L.TEXTOS, "ESCALERA 15 X 20,3 / 27", 6300, 1700, 240)

  // cotas de altura
  dimV(H.pb, H.pbTecho, -2000, "2,75", 240)
  dimV(H.pbTecho, H.pp, -2000, "0,30", 240)
  dimV(H.pp, H.ppTecho, -2000, "2,70", 240)
  dimV(H.pb, H.cubierta, -3400, "6,05", 260)

  // niveles
  for (const [lv, label] of [
    [H.pb, "+-0,00 PLANTA BAJA"],
    [H.pp, "+3,05 PLANTA PRIMERA"],
    [H.cubierta, "+6,05 CUBIERTA"],
    [H.terreno, "-0,30 TERRENO"],
  ]) {
    line(L.EJES, D + 700, lv, D + 2600, lv)
    text(L.TEXTOS, label, D + 2750, lv - 120, 260)
  }

  text(L.TEXTOS, "JARDIN", -6000, H.terreno - 900, 320)
  text(L.TEXTOS, "PORCHE", POR.y1 + 900, 600, 280)
  text(L.TEXTOS, "SALON", 2000, 1200, 320)
  text(L.TEXTOS, "VESTIBULO", 6600, 900, 240)
  text(L.TEXTOS, "DORMITORIO 4", 1500, 4200, 300)
  text(L.TEXTOS, "DISTRIBUIDOR", 5200, 4200, 260)
  text(L.TEXTOS, "BANO FAM.", 7900, 4200, 240)
  text(
    L.TEXTOS,
    "ALERO 0,60 PROTEGE EL HUECO SUR EN VERANO",
    -6000,
    H.cubierta + 900,
    260
  )
  arrow(L.EJES, -3500, H.cubierta + 700, -700, H.pp + 2300, 250)
}

/* ---------------------------------------------------------- FACHADAS */

function facade(title, width, holes, opts = {}) {
  const { hip = true, garage = null } = opts
  const top = H.cubierta
  const rise = hip ? ((D / 2 + 600) * 25) / 100 : 0

  // terreno
  line(L.TERRENO, -1200, H.terreno, width + 1200, H.terreno)
  // volumen
  rect(L.MUROS, 0, H.terreno, width, top)
  line(L.ESTRUCTURA, 0, H.pbTecho, width, H.pbTecho)
  line(L.ESTRUCTURA, 0, H.pp, width, H.pp)

  // cubierta
  if (opts.gable) {
    pline(L.CUBIERTA, [
      [-600, top],
      [width / 2, top + rise],
      [width + 600, top],
    ])
  } else {
    const ridgeInset = D / 2 + 600
    pline(L.CUBIERTA, [
      [-600, top],
      [ridgeInset - 600, top + rise],
      [width - ridgeInset + 600, top + rise],
      [width + 600, top],
    ])
  }
  line(L.CUBIERTA, -600, top, width + 600, top)

  for (const [hx1, hy1, hx2, hy2, kind] of holes) {
    rect(L.VENTANAS, hx1, hy1, hx2, hy2)
    if (kind === "d") {
      line(L.PUERTAS, (hx1 + hx2) / 2, hy1, (hx1 + hx2) / 2, hy2)
    }
    if (kind === "s") {
      // proteccion solar: alero / lama
      line(L.ESTRUCTURA, hx1 - 300, hy2 + 350, hx2 + 300, hy2 + 350)
      line(L.ESTRUCTURA, hx1 - 300, hy2 + 350, hx1 - 300, hy2 + 150)
      line(L.ESTRUCTURA, hx2 + 300, hy2 + 350, hx2 + 300, hy2 + 150)
    }
  }

  if (garage) {
    rect(L.MUROS, garage[0], H.terreno, garage[1], H.pbTecho + 300)
    line(
      L.CUBIERTA,
      garage[0] - 400,
      H.pbTecho + 300,
      garage[1] + 400,
      H.pbTecho + 300
    )
    if (garage[2])
      rect(
        L.PUERTAS,
        garage[0] + 800,
        H.terreno,
        garage[0] + 5900,
        H.terreno + 2400
      )
  }

  text(L.TEXTOS, title, 0, -2400, 420)
}

function buildElevations() {
  sheetTitle(
    "PLANO 6 - FACHADAS",
    0,
    26000,
    "ESQUEMATICAS - HUECOS Y PROTECCION SOLAR"
  )

  const save = [OX, OY]

  // SUR
  OX = save[0]
  OY = save[1] + 16000
  facade(
    "FACHADA SUR (JARDIN)  -  PORCHE + ALEROS",
    W,
    [
      [1000, 900, 3200, 2400, "s"],
      [4600, 100, 6800, 2400, "d"],
      [7700, 100, 10100, 2400, "d"],
      [10800, 900, 11900, 2400, "s"],
      [13000, 900, 14600, 2400, "s"],
      [1300, 3950, 3200, 5450, "s"],
      [5200, 3950, 6800, 5450, "s"],
      [8700, 3950, 10300, 5450, "s"],
      [12500, 3950, 14300, 5450, "s"],
    ],
    {}
  )
  // porche delante
  line(L.ESTRUCTURA, POR.x1, H.pbTecho + 300, POR.x2, H.pbTecho + 300)
  for (const x of [POR.x1, (POR.x1 + POR.x2) / 2, POR.x2]) {
    line(L.ESTRUCTURA, x, H.pb, x, H.pbTecho + 300)
  }

  // NORTE
  OX = save[0] + 22000
  OY = save[1] + 16000
  facade("FACHADA NORTE (ACCESO)  -  HUECOS REDUCIDOS", W, [
    [900, 1000, 1900, 2400],
    [5000, 100, 5900, 2200, "d"],
    [8200, 100, 9200, 2400, "d"],
    [11200, 1200, 12000, 2400],
    [13400, 100, 14300, 2200, "d"],
    [3800, 4300, 5000, 5450],
    [10500, 4300, 11700, 5450],
    [13400, 4300, 14400, 5450],
  ])

  // ESTE
  OX = save[0]
  OY = save[1]
  facade(
    "FACHADA ESTE  -  PROTECCION SOLAR CON LAMAS VERTICALES",
    D,
    [
      [2000, 900, 4000, 2400, "s"],
      [7000, 1000, 8600, 2400, "s"],
      [1500, 3950, 3500, 5450, "s"],
    ],
    { gable: true }
  )

  // OESTE
  OX = save[0] + 22000
  OY = save[1]
  facade(
    "FACHADA OESTE  -  GARAJE ADOSADO",
    D,
    [
      [800, 900, 2300, 2400, "s"],
      [1200, 3950, 3600, 5450, "s"],
    ],
    { gable: true, garage: [2400, 9600, true] }
  )

  OX = save[0]
  OY = save[1]
}

/* ------------------------------------------------------ IMPLANTACION */

const PLOT = { w: 50000, d: 30000 }
const HOUSE = { x: 26000, y: 15000 } // origen local de la vivienda en la parcela

function buildSite() {
  sheetTitle(
    "PLANO 1 - IMPLANTACION",
    0,
    34500,
    "PARCELA 50,00 X 30,00 = 1.500 M@  -  ESCALA 1:200"
  )

  rect(L.PARCELA, 0, 0, PLOT.w, PLOT.d)
  dimH(0, PLOT.w, -2200, "50,00", 700)
  dimV(0, PLOT.d, -2200, "30,00", 700)

  // calle al oeste
  line(L.PAVIMENTOS, -3000, 0, -3000, PLOT.d)
  hatch45(L.PAVIMENTOS, -3000, 0, 0, PLOT.d, 2500)
  text(L.TEXTOS, "VIAL DE ACCESO", -1500, 15000, 700, {
    align: "center",
    angle: Math.PI / 2,
  })

  const hx = HOUSE.x
  const hy = HOUSE.y

  // vivienda + garaje (huella)
  rect(L.MUROS, hx, hy, hx + W, hy + D)
  rect(L.MUROS, hx + GAR.x1, hy + GAR.y1, hx + GAR.x2, hy + GAR.y2)
  rect(L.PAVIMENTOS, hx + POR.x1, hy + POR.y1, hx + POR.x2, hy + POR.y2)
  text(L.TEXTOS, "VIVIENDA", hx + W / 2, hy + D / 2 + 400, 900, {
    align: "center",
  })
  text(L.TEXTOS, "2 PLANTAS", hx + W / 2, hy + D / 2 - 900, 700, {
    align: "center",
  })
  text(L.TEXTOS, "GARAJE", hx + (GAR.x1 + GAR.x2) / 2, hy + 6000, 700, {
    align: "center",
  })
  text(
    L.TEXTOS,
    "PORCHE",
    hx + (POR.x1 + POR.x2) / 2,
    hy + POR.y1 + 1400,
    700,
    {
      align: "center",
    }
  )

  // acceso rodado por el norte
  rect(L.PAVIMENTOS, 0, 24800, hx + GAR.x2, PLOT.d - 800)
  hatch45(L.PAVIMENTOS, 0, 24800, hx + GAR.x1 - 400, PLOT.d - 800, 2200)
  text(L.TEXTOS, "ACCESO RODADO", 6000, 26800, 650)
  arrow(L.PAVIMENTOS, 1500, 26000, 17000, 26000, 700)
  arrow(L.PAVIMENTOS, 19000, 26200, 19000, 24600, 700)

  // explanada de maniobra frente al garaje
  rect(L.PAVIMENTOS, hx + GAR.x1, hy + GAR.y2, hx + GAR.x2, PLOT.d - 800)

  // acceso peatonal
  pline(L.PAVIMENTOS, [
    [0, 22600],
    [8000, 22600],
    [12000, 24000],
    [hx + 8200, 24000],
    [hx + 8200, hy + D],
  ])
  pline(L.PAVIMENTOS, [
    [0, 21400],
    [8000, 21400],
    [12400, 23000],
    [hx + 9200, 23000],
    [hx + 9200, hy + D],
  ])
  text(L.TEXTOS, "ACCESO PEATONAL", 1200, 20200, 650)
  text(L.TEXTOS, "ENTRADA PRINCIPAL", hx + 8700, hy + D + 1400, 550, {
    align: "center",
  })

  // cancelas
  line(L.PARCELA, 0, 24800, 0, PLOT.d - 800)
  text(L.TEXTOS, "CANCELA VEHICULOS 5,00", 700, 28600, 500)
  line(L.PARCELA, 0, 21400, 0, 22600)
  text(L.TEXTOS, "CANCELA PEATONAL", 700, 21800, 450)

  // terraza y piscina
  rect(L.PAVIMENTOS, hx - 2000, 11000, hx + 14000, hy - 100)
  text(L.TEXTOS, "TERRAZA", hx + 6000, 12000, 650, { align: "center" })
  rect(L.PISCINA, 30000, 4500, 38000, 8500)
  rect(L.PISCINA, 30300, 4800, 37700, 8200)
  rect(L.PAVIMENTOS, 28500, 3000, 39500, 10000)
  text(L.TEXTOS, "PISCINA 8,00 X 4,00", 34000, 6300, 650, { align: "center" })
  text(L.TEXTOS, "PLAYA PERIMETRAL 1,50", 34000, 3400, 450, { align: "center" })

  // jardin principal
  text(L.TEXTOS, "JARDIN PRINCIPAL", 14000, 12000, 900)
  text(L.TEXTOS, "PRADERA - USO LIBRE", 14000, 10800, 550)
  text(L.SUPERFICIES, "APROX. 780 M@ CONTINUOS", 14000, 9800, 550)

  // huerto y frutales
  rect(L.VEGETACION, 2500, 2000, 9500, 8000)
  for (let i = 0; i < 7; i++)
    line(L.VEGETACION, 2500, 2000 + i * 1000, 9500, 2000 + i * 1000)
  text(L.TEXTOS, "HUERTO", 6000, 8600, 550, { align: "center" })
  for (const [tx, ty] of [
    [12000, 3500],
    [15500, 2500],
    [19000, 3500],
    [22500, 2200],
  ])
    tree(tx, ty, 1800)
  text(L.TEXTOS, "FRUTALES", 17000, 800, 550, { align: "center" })

  // arbolado de sombra y proteccion
  for (const [tx, ty, r] of [
    [24000, 12500, 2600],
    [43000, 11500, 2600],
    [46000, 20000, 2200],
    [8000, 14000, 2400],
    [4000, 17500, 2000],
    [12000, 17500, 2200],
  ])
    tree(tx, ty, r)
  text(L.TEXTOS, "ARBOLADO CADUCIFOLIO", 20500, 15500, 500)
  text(L.TEXTOS, "(SOMBRA VERANO / SOL INVIERNO)", 20500, 14700, 400)

  // rincon tranquilo
  circle(L.PAVIMENTOS, 44500, 6000, 2200)
  text(L.TEXTOS, "RINCON", 44500, 6200, 450, { align: "center" })
  text(L.TEXTOS, "TRANQUILO", 44500, 5500, 450, { align: "center" })

  // zona juegos
  rect(L.PAVIMENTOS, 17000, 6000, 24000, 11000)
  text(L.TEXTOS, "ZONA DE JUEGOS", 20500, 8300, 500, { align: "center" })

  // patio de servicio + instalaciones + almacen exterior
  rect(L.PAVIMENTOS, hx + W, hy + 5000, PLOT.w - 1500, hy + D)
  text(L.TEXTOS, "PATIO DE SERVICIO", hx + W + 400, hy + 8600, 450)
  rect(L.INSTALACIONES, PLOT.w - 5500, hy + 5400, PLOT.w - 2500, hy + 7400)
  text(L.TEXTOS, "INSTALACIONES", PLOT.w - 5500, hy + 4800, 450)
  rect(L.MOBILIARIO, 44000, 12500, 48000, 15500)
  text(L.TEXTOS, "ALMACEN EXTERIOR", 46000, 13800, 450, { align: "center" })

  // seto perimetral
  rect(L.VEGETACION, -400, -400, PLOT.w + 400, PLOT.d + 400)
  text(L.TEXTOS, "SETO PERIMETRAL", PLOT.w / 2, PLOT.d + 900, 500, {
    align: "center",
  })

  // separaciones a linderos
  dimV(hy + D, PLOT.d, hx - 1200, null, 450)
  dimH(hx + W, PLOT.w, hy + D + 1600, null, 450)
  dimV(0, hy, hx + W + 3000, null, 450)

  northArrow(PLOT.w - 3000, PLOT.d - 3000, 2000)
  text(L.TEXTOS, "SOLEAMIENTO: FACHADA PRINCIPAL AL SUR", 0, -4200, 600)
  text(
    L.TEXTOS,
    "ACCESOS AL NORTE - ZONA DE DIA Y JARDIN AL SUR",
    0,
    -5200,
    600
  )
  text(
    L.TEXTOS,
    "HIPOTESIS: NORTE HACIA LA PARTE SUPERIOR DEL PLANO",
    0,
    -6200,
    500
  )
}

/* =================================================================== */

function run() {
  const place = (fn, x, y) => {
    OX = x
    OY = y
    fn()
    OX = 0
    OY = 0
  }

  place(buildSite, 0, 0)
  place(buildGroundFloor, 0, -26000)
  place(buildFirstFloor, 34000, -26000)
  place(buildRoof, 68000, -26000)
  place(buildSection, 4000, -52000)
  place(buildElevations, 34000, -78000)

  const doc = {
    type: "easycad-drawing",
    version: 7,
    generator: "mellowcad / scripts/chalet/generate.mjs",
    settings: { unit: "mm", precision: 2, ltScale: 8, lwDisplay: true },
    layers: [
      {
        id: "0",
        name: "0",
        color: "#e2e8f0",
        linetype: "Continuous",
        lineweight: 0.25,
        visible: true,
        locked: false,
      },
      ...LAYERS.map(([name, color, linetype, lineweight]) => ({
        id: name,
        name,
        color,
        linetype,
        lineweight,
        visible: true,
        locked: false,
      })),
    ],
    currentLayerId: "MUROS",
    entities,
  }

  mkdirSync(dirname(OUT), { recursive: true })
  writeFileSync(OUT, JSON.stringify(doc, null, 1))
  console.log(`Escrito ${OUT}`)
  console.log(`${entities.length} entidades, ${doc.layers.length} capas`)
}

run()
