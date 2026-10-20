---
paths:
  - "cad/scene/**"
  - "cad/application/SceneBuilder.ts"
  - "cad/adapters/*Presenter*"
---

# The scene and its presenters

`SceneBuilder` turns the model into a display list of **screen-space** `ScenePrimitive`s; only the
two presenters touch a rendering API: `CanvasScenePresenter`, which the editor paints with, and
`SvgScenePresenter`, which draws the landing's figures at build time. What a tool draws through it:
`cad-tools.md`.

## The display list

- **One flat list.** `entityScenePrimitive` returns `ScenePrimitive[]`: most entities are one
  primitive, a dimension is an assembly of lines, filled arrowheads and text. Never add a nesting
  "group" primitive: tests, selection cycling and pixel checks filter the scene by `kind`, and a
  wrapper would hide a dimension's parts from all of them.
- **No clipping and no patterned fill** in the list: work out _what_ is drawn in world coordinates
  in `domain/` (a hatch's pattern arrives as segments already clipped to its boundary) and let the
  scene carry only styled shapes. The one concession is `path.subpaths`, filled even-odd, because a
  solid fill and a line pattern must agree about which side of a nested loop is inside.
- **Derived geometry is computed in world coordinates, never at paint time in screen ones.** That
  is what lets `SceneBuilder` cache a hatch's clipped pattern in a `WeakMap` keyed on the immutable
  entity: the result cannot depend on the camera, so panning and zooming stay free and the builder
  stays a pure function of its input. Anything expensive and camera-independent goes on that side.
- The `label` primitive is chrome: screen-space, fixed size, never rotated. Anything that belongs
  to the **drawing** uses `text`, which carries a world-derived size and angle. A world angle
  becomes a screen rotation through `screenRotation(camera, radians)` (the Y flip and the view's
  `twist`); positions, arcs and ellipses are resolved from projected points.
- **Each planar object is drawn through its plane's affinity** (`planeCamera(camera, elevation,
axes)`): a circle becomes an ellipse (`affineEllipse`), text gets a matrix; when the affinity is
  a similarity (the plan) the 2D path runs. Thickness draws the object at both heights along its
  normal and the edges joining them.
- The grid lies on the UCS (`SceneInput.ucs`, the frame's) and the scene draws the UCS icon
  (`SceneInput.ucsIcon`; `world`, the WCS square, is decided on the drawing's UCS, since a tilted
  one reads level in its frame). The grid, the icon, tracking, the snap marker and the guides use
  `SceneInput.aidCamera` (the frame's viewport), the objects `camera`. A host with its own chrome
  hides the icon with `setUcsIconShown(false)`, leaving UCSICON alone; `CadDriver` hides it unless
  given `ucsIcon: true`, so a recorded frame holds only what was drawn.

## New shapes

- A shape the scene cannot draw yet adds a **primitive** (`scene/types.ts` plus a branch in
  **both presenters**), not a tessellation. Everything it carries is **screen** space, and the
  camera's Y flip both reverses an angle and runs a parametrisation backwards: resolve that once
  in the builder (`arcScenePrimitive`, `ellipseScenePrimitive`) and pin it with a test that
  rebuilds the renderer's own parametric formula against the projected world endpoints
  (`SvgScenePresenter.test.ts` does it for the SVG arc flags).
- **A spline is the exception**: no renderer has NURBS and a degree above 3 fits no Bézier, so
  `SceneBuilder` draws it as a `path` tessellated in world coordinates to a quarter of a pixel at
  the current zoom (`splinePolyline(spline, 0.25 / scale)`) — never a cached world tessellation,
  which facets on zooming in. The math is `geometry/nurbs.ts`; queries with no closed form read
  `splinePolyline` at its default tolerance. A future curve of that kind (a helix, an offset
  spline) follows the same split.
- **A wide polyline is filled only seen in plan**, and only with FILLMODE on
  (`SceneInput.fillMode`, `EntityDrawOptions.fill`, on when absent so a ghost fills too); off the
  plan, or with FILL off, its bands are outlined. In plan its lineweight is not drawn ("wide
  polylines display lineweights only when displayed outside of plan view"), so `pushEntities` gives
  it the hairline.

## The presenters

- **Both clip segments to the frame** (`adapters/clipSegment.ts`): a scene draws alignment paths
  millions of pixels long, which SVG and Chrome's canvas dash end to end unless the line is exactly
  horizontal or vertical. The canvas keeps the dash phase across the clip (`lineDashOffset`) so the
  dashes do not crawl as the guide's far end moves.
- **Both draw left to right** whatever the page (`ctx.direction`, `direction="ltr"` on every SVG
  text, anchors spelled out): the drawing never mirrors. And in the command language: `Scene.lang`
  (`EngineText.commandTag`) becomes `ctx.lang` and every SVG text's `lang`, because the page's
  language picks the font a generic family resolves to.
- **Glyph metrics are the presenter's job**: the scene says _what_ to align to, not where the pixels
  land. The engine measures text with Arial's widths (`cad-engine.md`), so the presenters keep
  `DRAWING_FONT` (Arial or a face with its widths), **Arial's cap ratio rather than a measured
  one** (Liberation Sans has Arial's widths but shorter capitals) and **no kerning**. Change any
  of the three alone and the box stops fitting the text. A glyph outside the table (CJK, Arabic)
  is drawn by a fallback face and measured as an average one.
- A CAD text height is the **capitals'** height, so canvas text needs two corrections: the font
  size divided by the cap-height ratio, **and the alphabetic baseline as the anchor** — canvas's
  `"bottom"` is the em box, whose descender space makes text taller than the drawing says (DIMTXT +
  DIMGAP is just under DIMDLI, so it pushes a chain's number across its neighbour's line).
  Dimension text sits _above_ the line (ISO's DIMTAD 1).
- The SVG presenter differs from the canvas one only where SVG must: a **fixed** cap-height ratio,
  since it cannot measure a font, and the canvas's em-box baselines placed arithmetically rather
  than with `dominant-baseline`, which rasterisers disagree about.
