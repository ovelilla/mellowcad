import { THEME } from "@mellowcad/engine"

/**
 * The chat's view of a drawing (MCP Apps, `docs/next-mcp.md` §6.2): one
 * static page the host loads in a sandboxed frame, which shows the SVG the
 * `draw` tool returns in its result's `_meta`, with pan, zoom and a button
 * that opens the drawing in the editor.
 *
 * WHY static and self-contained: a host may fetch and cache the page before
 * the call (the URI is its cache key, so a change it cannot read is a new
 * URI), and its default CSP lets in nothing but inline script, inline style
 * and `data:` images. WHY no SDK: the protocol a view needs is six messages,
 * and the ext-apps SDK is some 300 KB inline.
 */

export const VIEWER_URI = "ui://mellowcad/drawing-v1.html"
export const VIEWER_MIME_TYPE = "text/html;profile=mcp-app"
/** Where the result's `_meta` carries the view: never read by the model. */
export const VIEW_META_KEY = "com.mellowcad/view"

/**
 * The tool's link to its view. `ui/resourceUri` is the key the extension
 * deprecated, which hosts of its first release read and its own SDK still
 * writes.
 */
export const DRAW_TOOL_META = {
  ui: { resourceUri: VIEWER_URI },
  "ui/resourceUri": VIEWER_URI,
} as const

/** The view's resource, its link to the editor's `origin` allowed. */
export function viewerContents(origin: string) {
  return {
    uri: VIEWER_URI,
    mimeType: VIEWER_MIME_TYPE,
    text: VIEWER_HTML,
    _meta: {
      ui: { prefersBorder: true },
      // WHY: ChatGPT opens a link to a domain listed here without asking
      // first, as the standard's `ui/open-link` leaves to the host.
      "openai/widgetCSP": {
        connect_domains: [],
        resource_domains: [],
        redirect_domains: [origin],
      },
    },
  }
}

/** The ext-apps protocol revision the view speaks (`ui/initialize`). */
const APPS_PROTOCOL_VERSION = "2026-01-26"

// The script is plain ES2020 in a string: it runs in the host's frame, not
// through Next's compiler. `test/mcp-viewer.test.ts` parses it, and a real
// browser drives it against a host of its own (skill `browser-verify`).
export const VIEWER_SCRIPT = `
(function () {
  "use strict";
  var KEY = ${JSON.stringify(VIEW_META_KEY)};
  var root = document.documentElement;
  var stage = document.getElementById("stage");
  var note = document.getElementById("note");
  var bar = document.getElementById("bar");
  var hint = document.getElementById("hint");
  var fitButton = document.getElementById("fit");
  var fullButton = document.getElementById("full");
  var openButton = document.getElementById("open");
  var fallback = document.getElementById("fallback");
  var fallbackUrl = document.getElementById("url");
  var coarse = window.matchMedia("(pointer: coarse)").matches;

  var nextId = 1;
  var pending = {};
  var svg = null;
  var home = null;
  var box = null;
  var link = null;
  var mode = "inline";
  var maxHeight = null;
  var bottomInset = 0;
  var reported = 0;
  // Nothing goes to the host before the handshake ends.
  var ready = false;
  var pointers = new Map();

  function send(message) {
    window.parent.postMessage(message, "*");
  }
  function request(method, params) {
    var id = nextId++;
    send({ jsonrpc: "2.0", id: id, method: method, params: params });
    return new Promise(function (resolve, reject) {
      pending[id] = { resolve: resolve, reject: reject };
    });
  }
  function notify(method, params) {
    send({ jsonrpc: "2.0", method: method, params: params });
  }

  function showNote(text) {
    stage.replaceChildren(note);
    note.textContent = text;
    svg = null;
    fitButton.hidden = true;
    hint.hidden = true;
    layout();
  }

  function show(result) {
    var view = result && result._meta && result._meta[KEY];
    if (!view) {
      showNote("This answer has no drawing to show.");
      return;
    }
    link = view.link;
    openButton.hidden = !link;
    if (!view.svg) {
      showNote(
        view.objects === 0
          ? "Nothing is drawn."
          : "This drawing is too large to show here" +
              (link ? ": open it in MellowCAD." : ".")
      );
      return;
    }
    stage.innerHTML = view.svg;
    svg = stage.querySelector("svg");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    var v = svg.viewBox.baseVal;
    home = { x: v.x, y: v.y, w: v.width, h: v.height };
    fitButton.hidden = false;
    hint.hidden = false;
    fit();
    layout();
  }

  function apply() {
    svg.setAttribute("viewBox", [box.x, box.y, box.w, box.h].join(" "));
  }
  function fit() {
    if (!svg) return;
    box = { x: home.x, y: home.y, w: home.w, h: home.h };
    apply();
  }
  function toDrawing(x, y) {
    return new DOMPoint(x, y).matrixTransform(svg.getScreenCTM().inverse());
  }
  function zoomAt(x, y, factor) {
    var w = box.w * factor;
    if (w < home.w / 5000 || w > home.w * 20) return;
    var p = toDrawing(x, y);
    box = {
      x: p.x - (p.x - box.x) * factor,
      y: p.y - (p.y - box.y) * factor,
      w: w,
      h: box.h * factor,
    };
    apply();
  }
  function pan(dx, dy) {
    var scale = svg.getScreenCTM().a;
    box.x -= dx / scale;
    box.y -= dy / scale;
    apply();
  }

  stage.addEventListener(
    "wheel",
    function (event) {
      if (!svg) return;
      // WHY Ctrl inline: a plain wheel scrolls the conversation the view
      // sits in; a pinch on a trackpad arrives as a wheel with Ctrl.
      if (mode !== "fullscreen" && !event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      var lines = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 400 : 1;
      zoomAt(event.clientX, event.clientY, Math.exp(event.deltaY * lines * 0.002));
    },
    { passive: false }
  );
  stage.addEventListener("pointerdown", function (event) {
    if (!svg || (event.button !== 0 && event.button !== 1)) return;
    // The middle button pans, as in the editor; it would autoscroll.
    event.preventDefault();
    stage.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    stage.classList.add("panning");
  });
  stage.addEventListener("pointermove", function (event) {
    var last = pointers.get(event.pointerId);
    if (!last || !svg) return;
    var now = { x: event.clientX, y: event.clientY };
    if (pointers.size === 1) {
      pan(now.x - last.x, now.y - last.y);
    } else if (pointers.size === 2) {
      var other = null;
      pointers.forEach(function (p, id) {
        if (id !== event.pointerId) other = p;
      });
      var before = Math.hypot(last.x - other.x, last.y - other.y);
      var after = Math.hypot(now.x - other.x, now.y - other.y);
      if (before > 0 && after > 0) {
        zoomAt((now.x + other.x) / 2, (now.y + other.y) / 2, before / after);
      }
      pan((now.x - last.x) / 2, (now.y - last.y) / 2);
    }
    pointers.set(event.pointerId, now);
  });
  function release(event) {
    pointers.delete(event.pointerId);
    if (pointers.size === 0) stage.classList.remove("panning");
  }
  stage.addEventListener("pointerup", release);
  stage.addEventListener("pointercancel", release);
  // A double click of the wheel is Zoom Extents in AutoCAD.
  stage.addEventListener("dblclick", fit);
  fitButton.addEventListener("click", fit);

  fullButton.addEventListener("click", function () {
    request("ui/request-display-mode", {
      mode: mode === "fullscreen" ? "inline" : "fullscreen",
    }).then(function (result) {
      if (result && result.mode) setMode(result.mode);
    }, function () {});
  });

  openButton.addEventListener("click", function () {
    if (!link) return;
    if (window.openai && typeof window.openai.openExternal === "function") {
      window.openai.openExternal({ href: link });
      return;
    }
    request("ui/open-link", { url: link }).catch(function () {
      // The host would not open it: the link stays to be copied.
      fallbackUrl.value = link;
      fallback.hidden = false;
      layout();
      fallbackUrl.select();
    });
  });

  function setMode(next) {
    // Back inline, the host is told the height again, the same or not.
    if (next !== mode) reported = 0;
    mode = next;
    root.dataset.mode = mode;
    fullButton.textContent = mode === "fullscreen" ? "Exit full screen" : "Full screen";
    hint.textContent =
      "Drag to pan · " +
      (coarse ? "pinch" : mode === "fullscreen" ? "wheel" : "Ctrl + wheel") +
      " to zoom";
    layout();
  }

  function context(c) {
    if (!c) return;
    if (c.theme) root.dataset.theme = c.theme;
    var variables = c.styles && c.styles.variables;
    if (variables) {
      Object.keys(variables).forEach(function (name) {
        if (variables[name]) root.style.setProperty(name, variables[name]);
      });
    }
    if (c.availableDisplayModes) {
      fullButton.hidden = c.availableDisplayModes.indexOf("fullscreen") < 0;
    }
    var dims = c.containerDimensions;
    if (dims) maxHeight = dims.maxHeight || dims.height || null;
    if (c.safeAreaInsets) bottomInset = c.safeAreaInsets.bottom || 0;
    if (c.displayMode) setMode(c.displayMode);
    else layout();
  }

  function layout() {
    var chrome = bar.offsetHeight + (fallback.hidden ? 0 : fallback.offsetHeight);
    var height;
    if (mode === "fullscreen") {
      height = window.innerHeight - chrome - bottomInset;
    } else if (svg) {
      height = Math.min(480, Math.max(200, root.clientWidth * (home.h / home.w)));
      if (maxHeight) height = Math.min(height, maxHeight - chrome);
    } else {
      height = 96;
    }
    stage.style.height = Math.max(96, Math.round(height)) + "px";
    // WHY inline only: full screen is the host's size, and the view's, made
    // from the frame's, would grow it a pixel a round with a host that
    // follows what it is told.
    if (mode === "fullscreen") return;
    var total = Math.ceil(document.body.getBoundingClientRect().height);
    if (ready && total !== reported) {
      reported = total;
      notify("ui/notifications/size-changed", { width: root.clientWidth, height: total });
    }
  }
  window.addEventListener("resize", layout);

  window.addEventListener("message", function (event) {
    if (event.source !== window.parent) return;
    var m = event.data;
    if (!m || m.jsonrpc !== "2.0") return;
    if (m.method === undefined) {
      var waiting = pending[m.id];
      if (!waiting) return;
      delete pending[m.id];
      if (m.error) waiting.reject(m.error);
      else waiting.resolve(m.result);
      return;
    }
    switch (m.method) {
      case "ui/notifications/tool-input":
        showNote("Drawing…");
        break;
      case "ui/notifications/tool-result":
        show(m.params);
        break;
      case "ui/notifications/tool-cancelled":
        showNote("The drawing was cancelled.");
        break;
      case "ui/notifications/host-context-changed":
        context(m.params);
        break;
      case "ui/resource-teardown":
      case "ping":
        send({ jsonrpc: "2.0", id: m.id, result: {} });
        break;
      default:
        if (m.id !== undefined) {
          send({
            jsonrpc: "2.0",
            id: m.id,
            error: { code: -32601, message: "Method not found" },
          });
        }
    }
  });

  setMode("inline");
  request("ui/initialize", {
    protocolVersion: ${JSON.stringify(APPS_PROTOCOL_VERSION)},
    appInfo: { name: "MellowCAD drawing", version: "1.0.0" },
    appCapabilities: { availableDisplayModes: ["inline", "fullscreen"] },
  }).then(function (result) {
    notify("ui/notifications/initialized", {});
    ready = true;
    context(result && result.hostContext);
    layout();
  });
})();
`

const VIEWER_STYLE = `
:root {
  color-scheme: light dark;
  --bar: var(--color-background-primary, #ffffff);
  --ink: var(--color-text-primary, #1f2328);
  --muted: var(--color-text-secondary, #59636e);
  --line: var(--color-border-primary, #d0d7de);
  --accent: #0969da;
  --on-accent: #ffffff;
  font: 13px/1.4 var(--font-sans, system-ui, -apple-system, "Segoe UI", sans-serif);
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bar: var(--color-background-primary, #1f2328);
    --ink: var(--color-text-primary, #e6edf3);
    --muted: var(--color-text-secondary, #9198a1);
    --line: var(--color-border-primary, #3d444d);
    --accent: #4493f8;
  }
}
:root[data-theme="dark"] {
  --bar: var(--color-background-primary, #1f2328);
  --ink: var(--color-text-primary, #e6edf3);
  --muted: var(--color-text-secondary, #9198a1);
  --line: var(--color-border-primary, #3d444d);
  --accent: #4493f8;
}
html, body { margin: 0; background: var(--bar); color: var(--ink); }
.stage {
  position: relative;
  overflow: hidden;
  background: ${THEME.background};
  cursor: grab;
  touch-action: pan-y;
  user-select: none;
}
:root[data-mode="fullscreen"] .stage { touch-action: none; }
.stage.panning { cursor: grabbing; }
.stage svg { display: block; width: 100%; height: 100%; }
.stage svg * { vector-effect: non-scaling-stroke; }
.note {
  margin: 0;
  padding: 36px 16px;
  text-align: center;
  color: #94a3b8;
  cursor: default;
}
.bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-top: 1px solid var(--line);
}
.hint { flex: 1 1 0; min-width: 0; color: var(--muted); font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
button {
  font: inherit;
  color: var(--ink);
  background: transparent;
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 4px 10px;
  white-space: nowrap;
  cursor: pointer;
}
button.primary { margin-left: auto; color: var(--on-accent); background: var(--accent); border-color: var(--accent); }
button[hidden], .hint[hidden], .fallback[hidden] { display: none; }
.fallback { margin: 0; padding: 0 8px 8px; color: var(--muted); }
.fallback input { width: 100%; box-sizing: border-box; font: inherit; color: var(--ink); background: transparent; border: 1px solid var(--line); border-radius: 6px; padding: 4px 6px; }
`

/** The page itself: everything inline, nothing fetched. */
export const VIEWER_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>MellowCAD drawing</title>
<style>${VIEWER_STYLE}</style>
</head>
<body>
<div id="stage" class="stage" role="img" aria-label="The drawing"><p id="note" class="note">Drawing…</p></div>
<div id="bar" class="bar">
<button id="fit" type="button" title="Zoom Extents (double-click)" hidden>Extents</button>
<button id="full" type="button" hidden>Full screen</button>
<span id="hint" class="hint" hidden></span>
<button id="open" class="primary" type="button" hidden>Open in MellowCAD</button>
</div>
<p id="fallback" class="fallback" hidden>The link did not open. Copy it: <input id="url" readonly aria-label="The editor's link"></p>
<script>${VIEWER_SCRIPT}</script>
</body>
</html>
`
