// node measure.mjs <png> <xmin,ymin> <xmax,ymax>: the plot of an image whose file AutoCAD did not
// find, an axis-aligned frame filling the plotted extents (given in drawing units). Finds the frame's
// pixels, then the ink inside it, and prints the text's box in drawing units, its size relative to
// the frame, and its centre's offset from the frame's.
import sharp from "sharp"

const [file, lo, hi] = process.argv.slice(2)
const [x0, y0] = lo.split(",").map(Number)
const [x1, y1] = hi.split(",").map(Number)
const { data, info } = await sharp(file).greyscale().raw().toBuffer({ resolveWithObject: true })
const dark = (x, y) => data[y * info.width + x] < 128
const cols = [],
  rows = []
for (let x = 0; x < info.width; x++) {
  let n = 0
  for (let y = 0; y < info.height; y++) if (dark(x, y)) n++
  cols.push(n)
}
for (let y = 0; y < info.height; y++) {
  let n = 0
  for (let x = 0; x < info.width; x++) if (dark(x, y)) n++
  rows.push(n)
}
// The frame: the outermost columns and rows that are mostly ink.
const longCol = cols.map((n, i) => [n, i]).filter(([n]) => n > 0.5 * Math.max(...cols))
const longRow = rows.map((n, i) => [n, i]).filter(([n]) => n > 0.5 * Math.max(...rows))
const fl = longCol[0][1],
  fr = longCol.at(-1)[1],
  ft = longRow[0][1],
  fb = longRow.at(-1)[1]
let tl = Infinity,
  tr = -1,
  tt = Infinity,
  tb = -1
for (let y = ft + 3; y < fb - 2; y++)
  for (let x = fl + 3; x < fr - 2; x++)
    if (dark(x, y)) {
      tl = Math.min(tl, x)
      tr = Math.max(tr, x)
      tt = Math.min(tt, y)
      tb = Math.max(tb, y)
    }
const sx = (x1 - x0) / (fr - fl),
  sy = (y1 - y0) / (fb - ft)
const wx = (px) => x0 + (px - fl) * sx
const wy = (py) => y1 - (py - ft) * sy
const W = x1 - x0,
  H = y1 - y0
const box = { left: wx(tl), right: wx(tr + 1), top: wy(tt), bottom: wy(tb + 1) }
const tw = box.right - box.left,
  th = box.top - box.bottom
console.log(
  JSON.stringify({
    frame_px: [fl, ft, fr, fb],
    unitsPerPx: [sx, sy],
    text: box,
    textW: tw,
    textH: th,
    wFrac: tw / W,
    hFrac: th / H,
    hOverW: th / W,
    hOverH: th / H,
    centreOff: [(box.left + box.right) / 2 - (x0 + x1) / 2, (box.top + box.bottom) / 2 - (y0 + y1) / 2],
  })
)
