// node sample.mjs file.png w h step [raw]: prints t = R/255 (percent) on a grid in drawing units;
// the rectangle is found by its black border. With `raw`, prints JSON {w,h,px,grid} sampled at step.
import sharp from "sharp"
const [file, w, h, step = "10", mode] = process.argv.slice(2)
const { data, info } = await sharp(file)
  .raw()
  .toBuffer({ resolveWithObject: true })
const px = (x, y) => {
  const i = (y * info.width + x) * info.channels
  return [data[i], data[i + 1], data[i + 2]]
}
let minX = 1e9,
  maxX = -1,
  minY = 1e9,
  maxY = -1
for (let y = 0; y < info.height; y++)
  for (let x = 0; x < info.width; x++) {
    const [r, g, b] = px(x, y)
    if (r < 40 && g < 40 && b < 40) {
      minX = Math.min(minX, x)
      maxX = Math.max(maxX, x)
      minY = Math.min(minY, y)
      maxY = Math.max(maxY, y)
    }
  }
const W = +w,
  H = +h,
  s = +step
const at = (u, v) =>
  px(
    Math.round(minX + (u / W) * (maxX - minX)),
    Math.round(maxY - (v / H) * (maxY - minY))
  )
if (mode === "raw") {
  const grid = []
  for (let v = s / 2; v < H; v += s)
    for (let u = s / 2; u < W; u += s) grid.push([u, v, ...at(u, v)])
  console.log(JSON.stringify({ file, grid }))
} else {
  console.log(
    `# ${file.split("/").pop()} rect px ${minX},${minY}-${maxX},${maxY}`
  )
  for (let v = H - s / 2; v > 0; v -= s) {
    let row = `${v.toFixed(0).padStart(4)}:`
    for (let u = s / 2; u < W; u += s) {
      const [r] = at(u, v)
      row += " " + String(Math.round((r / 255) * 100)).padStart(3)
    }
    console.log(row)
  }
}
