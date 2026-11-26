/**
 * Prints the ribbon of an AutoCAD workspace as acad.cuix defines it: the workspace's tabs in
 * order, each tab's panels, each panel's rows before and after its break (the part that slides
 * out), and every control with its size, its drop-down's behaviour and members, and its macro.
 * It reads the installed file; nothing runs.
 *
 *   node scripts/research/ribbon.mjs                       every shown tab of Drafting & Annotation
 *   node scripts/research/ribbon.mjs --tab Home            one tab, by its text
 *   node scripts/research/ribbon.mjs --panel ID_PanelDraw  one panel, by its UID
 *   node scripts/research/ribbon.mjs --tabs                the tabs and their panels only
 *   node scripts/research/ribbon.mjs --lang es …           the Spanish file's words
 *   node scripts/research/ribbon.mjs --workspace WS_3DModeling
 *   node scripts/research/ribbon.mjs --qat                 the Quick Access Toolbar
 *   node scripts/research/ribbon.mjs --contextual          each contextual tab and its rule
 *   node scripts/research/ribbon.mjs --source RBN_01738148 any tab by its UID, in no workspace
 *   node scripts/research/ribbon.mjs --cuix <file> …       a culture's acad.CUIX that is not
 *                                                          installed, taken out of its language
 *                                                          pack (open-pack.sh's 7zz)
 *   node scripts/research/ribbon.mjs --built …             marks what the engine has: `+` a
 *                                                          command of `cad/locales/en.json`, `-`
 *                                                          one it lacks; with --tabs, the count
 *
 * A control's line: its size (`L` large with text, `S` small with text, `s` small, icon only),
 * its kind when it is not a plain button, its text, the macro and the macro's id. A split
 * button's behaviour is AutoCAD's own word: `SplitFollow` shows the member used last and runs it,
 * `SplitFollowStaticText` the same under a fixed text, `DropDownFollow` only opens the list.
 * `[hidden]` is a tab or panel the workspace has and does not show.
 *
 * See .claude/skills/autocad-research/SKILL.md.
 */
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { inflateRawSync } from "node:zlib"

import { cultureOf, language, root } from "./tables.mjs"

const INSTALL = "/mnt/c/Program Files/Autodesk/AutoCAD 2027"

const { lang, rest } = language(process.argv.slice(2))
const option = (name) => {
  const at = rest.indexOf(name)
  return at >= 0 ? rest[at + 1] : null
}
// English unless asked: the ribbon's structure is the same in every language's file.
const culture = process.argv.includes("--lang") ? cultureOf(lang) : "en-US"
const file = option("--cuix") ?? join(
  INSTALL,
  "UserDataCache",
  culture.toLowerCase(),
  "Support/acad.CUIX"
)

function parts(path) {
  const zip = readFileSync(path)
  const end = zip.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]))
  let p = zip.readUInt32LE(end + 16)
  const out = new Map()
  for (let i = zip.readUInt16LE(end + 10); i > 0; i--) {
    const method = zip.readUInt16LE(p + 10)
    const size = zip.readUInt32LE(p + 20)
    const nameLength = zip.readUInt16LE(p + 28)
    const header = zip.readUInt32LE(p + 42)
    const name = zip.toString("utf8", p + 46, p + 46 + nameLength)
    p += 46 + nameLength + zip.readUInt16LE(p + 30) + zip.readUInt16LE(p + 32)
    if (!/\.cui$/i.test(name)) continue
    const start =
      header +
      30 +
      zip.readUInt16LE(header + 26) +
      zip.readUInt16LE(header + 28)
    const raw = zip.subarray(start, start + size)
    out.set(name, (method === 8 ? inflateRawSync(raw) : raw).toString("utf8"))
  }
  return out
}

const decode = (text) =>
  text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, n) =>
      String.fromCodePoint(parseInt(n, 16))
    )
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, "&")

// The files are machine-written XML without CDATA: tags, attributes and text are enough.
function parse(xml) {
  const top = { tag: "#root", attrs: {}, children: [], text: "" }
  const stack = [top]
  for (const m of xml.matchAll(
    /<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<(\/?)([\w:]+)((?:\s+[\w:]+="[^"]*")*)\s*(\/?)>|([^<]+)/g
  )) {
    const [, closing, tag, attributes, selfClosing, text] = m
    const parent = stack[stack.length - 1]
    if (text !== undefined) parent.text += decode(text).trim()
    else if (!tag) continue
    else if (closing) stack.pop()
    else {
      const attrs = {}
      for (const a of attributes.matchAll(/([\w:]+)="([^"]*)"/g))
        attrs[a[1]] = decode(a[2])
      const node = { tag, attrs, children: [], text: "" }
      parent.children.push(node)
      if (!selfClosing) stack.push(node)
    }
  }
  return top
}

const child = (node, tag) => node.children.find((c) => c.tag === tag)
const all = (node, tag, out = []) => {
  for (const c of node.children) {
    if (c.tag === tag) out.push(c)
    all(c, tag, out)
  }
  return out
}
const oneLine = (text) => text.replace(/[\r\n]+/g, " ").trim()

const cuix = parts(file)
const ribbon = parse(cuix.get("RibbonRoot.cui"))
const workspaces = parse(cuix.get("WorkspaceRoot.cui"))

const macros = new Map()
for (const macro of all(parse(cuix.get("MenuGroup.cui")), "MenuMacro")) {
  const body = child(macro, "Macro")
  macros.set(macro.attrs.UID, {
    name: child(body, "Name")?.text ?? "",
    command: child(body, "Command")?.text ?? "",
  })
}
const panels = new Map(
  all(ribbon, "RibbonPanelSource").map((panel) => [panel.attrs.UID, panel])
)
const tabs = new Map(
  all(ribbon, "RibbonTabSource").map((tab) => [tab.attrs.UID, tab])
)

const built = rest.includes("--built")
  ? new Set(
      Object.keys(
        JSON.parse(
          readFileSync(
            fileURLToPath(new URL("cad/locales/en.json", root)),
            "utf8"
          )
        ).commands.names
      )
    )
  : null
// The command a macro runs: the last one it names (Move's is `$M=$(if,…,_move,^C^C_move)`),
// without its cancels, its echo switches and its prefixes.
function commandOf(macro) {
  const last = macro.split(/\^C\^C|,/i).pop() ?? ""
  return (
    /^[\s*'_.]*(?:\^[A-Z])*[\s'_.]*([-\w]+)/.exec(last)?.[1].toUpperCase() ?? ""
  )
}
const counts = { have: 0, lack: 0 }
function mark(node) {
  if (!built) return ""
  const macro = macros.get(node.attrs.MenuMacroID ?? node.attrs.CommandID)
  if (!macro) return "  "
  const has = built.has(commandOf(macro.command))
  counts[has ? "have" : "lack"]++
  return has ? "+ " : "- "
}

const SIZE = { LargeWithText: "L", SmallWithText: "S", SmallWithoutText: "s" }

function macroOf(node) {
  const id = node.attrs.MenuMacroID ?? node.attrs.CommandID
  if (!id) return ""
  const macro = macros.get(id)
  return macro ? `${macro.command}  (${id})` : `(${id})`
}

function control(node, depth, lines) {
  const pad = "  ".repeat(depth)
  const size = SIZE[node.attrs.ButtonStyle] ?? " "
  const text = oneLine(node.attrs.Text ?? "")
  switch (node.tag) {
    case "RibbonRow":
      lines.push(`${pad}row`)
      for (const c of node.children) control(c, depth + 1, lines)
      break
    case "RibbonRowPanel":
      lines.push(`${pad}sub-panel`)
      for (const c of node.children) control(c, depth + 1, lines)
      break
    case "RibbonPanelBreak":
      lines.push(`${pad}—— slides out ——`)
      break
    case "RibbonSeparator":
      lines.push(`${pad}| ${node.attrs.SeparatorStyle}`)
      break
    case "RibbonSplitButton":
    case "RibbonDataBoundDropDown":
      lines.push(
        `${pad}${size} ▾ ${text || "(no text)"}  ${node.attrs.Behavior ?? node.attrs.Id}${node.attrs.ListStyle ? `, list ${node.attrs.ListStyle}` : ""}`
      )
      for (const c of node.children) control(c, depth + 1, lines)
      break
    case "RibbonCommandButton":
      lines.push(
        `${pad}${mark(node)}${size} ${text || macros.get(node.attrs.MenuMacroID)?.name || "(no text)"}  ${macroOf(node)}`
      )
      break
    case "RibbonToggleButton":
    case "RibbonButton":
      lines.push(`${pad}${size} ${text}  [${node.attrs.Id}]`)
      break
    case "RibbonGalleryControl":
    case "RibbonControl":
      lines.push(
        `${pad}  control ${text}  [${node.attrs.Id}${node.attrs.DisplayMode ? `, ${node.attrs.DisplayMode}` : ""}]`
      )
      break
    default:
  }
}

function panel(id, shown, lines) {
  const source = panels.get(id)
  if (!source) return lines.push(`  PANEL ${id} (not in this file)`)
  const launcher = child(source, "DialogBoxLauncher")
  lines.push(
    `  PANEL ${source.attrs.Text} (${id})${shown ? "" : " [hidden]"}${launcher ? `  ↘ ${macroOf(launcher)}` : ""}`
  )
  for (const c of source.children) control(c, 2, lines)
}

const lines = []
if (rest.includes("--qat")) {
  const qat = parse(cuix.get("QuickAccessToolbarRoot.cui"))
  for (const item of all(qat, "QuickAccessToolbar")[0].children)
    if (item.attrs.Id ?? item.attrs.MenuMacroID)
      lines.push(`${item.tag}  ${item.attrs.Id ?? macroOf(item)}`)
} else if (option("--panel")) panel(option("--panel"), true, lines)
else if (rest.includes("--contextual"))
  // A contextual tab is in no workspace: a selector shows it while its rule holds, the rules
  // being AcContextualTabSelectorRules.xaml's beside acad.exe (a variable or the selection).
  for (const selector of all(ribbon, "RibbonTabSelector"))
    lines.push(
      `${selector.attrs.Rule}  →  ${selector.attrs.Tabs.split(";")
        .map((id) => `${tabs.get(id)?.attrs.Text ?? "?"} (${id})`)
        .join(", ")}`
    )
else if (option("--source")) {
  const tab = tabs.get(option("--source"))
  if (!tab) {
    console.error(`No tab ${option("--source")}`)
    process.exit(1)
  }
  lines.push(`TAB ${tab.attrs.Text} (${tab.attrs.UID})`)
  for (const ref of all(tab, "RibbonPanelSourceReference"))
    panel(ref.attrs.PanelId, true, lines)
} else {
  const id = option("--workspace") ?? "WS_Anno2DDraft"
  const workspace = all(workspaces, "Workspace").find((w) => w.attrs.UID === id)
  if (!workspace) {
    console.error(`No workspace ${id}`)
    process.exit(1)
  }
  lines.push(`WORKSPACE ${child(workspace, "Name").text} (${id})`)
  const only = option("--tab")
  for (const ref of all(workspace, "WSRibbonTabSourceReference")) {
    const tab = tabs.get(ref.attrs.TabId)
    if (!tab) continue
    if (only ? tab.attrs.Text !== only : false) continue
    const tabShown = ref.attrs.Show === "true"
    if (!tabShown && !only && !rest.includes("--tabs")) continue
    lines.push(
      `TAB ${tab.attrs.Text} (${ref.attrs.TabId})${tabShown ? "" : " [hidden]"}`
    )
    // The workspace's own list orders and hides the panels; a tab it lists none for keeps the
    // tab's own.
    const inWorkspace = ref.children.filter(
      (c) => c.tag === "WSRibbonPanelSourceReference"
    )
    const list = inWorkspace.length
      ? inWorkspace.map((p) => [p.attrs.PanelId, p.attrs.Show === "true"])
      : all(tab, "RibbonPanelSourceReference").map((p) => [
          p.attrs.PanelId,
          true,
        ])
    for (const [panelId, shown] of list)
      if (rest.includes("--tabs")) {
        let tally = ""
        if (built && panels.has(panelId)) {
          counts.have = counts.lack = 0
          panel(panelId, shown, [])
          tally = `  ${counts.have} of ${counts.have + counts.lack} commands`
        }
        lines.push(
          `  ${panels.get(panelId)?.attrs.Text ?? "?"} (${panelId})${shown ? "" : " [hidden]"}${tally}`
        )
      } else if (shown || only) panel(panelId, shown, lines)
  }
}
console.log(lines.join("\n"))
