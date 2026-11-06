---
title: "VIEW in AutoCAD"
metaTitle: "VIEW in AutoCAD: isometric and top views"
description: "How AutoCAD's VIEW (V, -VIEW) turns to the six orthographic views and the four isometric ones, and the UCS each orthographic view sets. Try it free online."
figure: "A stepped block drawn in plan: -VIEW and SW Isometric, and it is seen from the south-west and above, in the Hidden visual style."
related: ["PLAN", "3DORBIT", "UCS", "VSCURRENT", "ZOOM"]
coverage: "c5334732be49"
---

VIEW turns the view to one of AutoCAD's ten preset views: six orthographic ones, looking straight at a side of the model, and four isometric ones, looking down from a corner. Nothing in the drawing moves. VIEW runs <Command id="-VIEW" />, the command-line form: its first prompt lists <Keyword id="Orthographic" />, which then asks for the side, and it also takes a view's name straight away, as AutoCAD's menus answer it: <Command id="-VIEW" />, then <Keyword id="SWiso" />. Each view frames the whole drawing and says <Message id="regeneratingModel" />.

The view control at the top left of the drawing lists the same ten views and runs <Command id="-VIEW" />, and the ViewCube's faces and corners turn to them too, leaving the UCS as it is. Each VIEW is one undo step, so <Command id="U" /> takes the view back, with the UCS it set. Typed with an apostrophe inside another command, it refuses with <Message id="requiresRegen" />. MellowCAD's 3D is solids only, and still partial.

## Options

### Orthographic

Asks for the side to look at, <Keyword id="Top" /> by default, so Enter there gives the plan: <Keyword id="Top" />, <Keyword id="Bottom" />, <Keyword id="Front" />, <Keyword id="BAck" />, <Keyword id="Left" /> or <Keyword id="Right" />. Each is upright: Top shows X to the right and Y up, Front X to the right and Z up, and Bottom, seen from below, X to the left. Typed at the first prompt, each side works without the option.

Each also turns the UCS to face you, from the world's axes whatever the UCS was, with its origin at `0,0,0`, as <Command id="UCS" />'s orthographic option does: after Front its XY plane is the front, so what you draw lies flat on the screen, and the UCS is named `*FRONT*`. After Top it has the world's axes, named `*TOP*`.

### SWiso

South-west isometric: looks down from the corner in front and to the left, seeing the front, the left side and the top. The UCS stays as it is. It is the session's view.

### SEiso

South-east isometric: looks down from the corner in front and to the right, seeing the front, the right side and the top. The UCS stays as it is.

### NEiso

North-east isometric: looks down from the corner behind and to the right, seeing the back, the right side and the top. The UCS stays as it is.

### NWiso

North-west isometric: looks down from the corner behind and to the left, seeing the back, the left side and the top. The UCS stays as it is.

## Missing

Named views: <Keyword id="Orthographic" /> is the only option the first prompt lists, where AutoCAD's lists `?`, Delete, Restore, Save, sEttings and Window too, and a name typed there is refused. The View Manager, which VIEW opens in AutoCAD. With nothing drawn, a view keeps the zoom where AutoCAD frames the drawing limits. UCSORTHO and UCSBASE as variables: an orthographic view always aligns the UCS, from the world's axes. The aligned UCS in <Command id="UCS" />'s <Keyword command="UCS" id="Previous" /> list.

## Questions

### How do I get an isometric view in AutoCAD?

Type <Command id="-VIEW" />, then <Keyword id="SWiso" /> for south-west isometric; <Keyword id="SEiso" />, <Keyword id="NEiso" /> and <Keyword id="NWiso" /> give the other three corners. Or choose SW Isometric in the view control at the top left, or click a top corner of the ViewCube. <Command id="VSCURRENT" /> with <Keyword command="VSCURRENT" id="Hidden" /> hides the edges behind.

### What is the command for the top view?

<Command id="-VIEW" />, then <Keyword id="Top" />, which also sets the UCS to the world's axes. <Command id="PLAN" /> looks down on the current UCS instead, and leaves it as it is.

### Why did my UCS change after a front view?

An orthographic view turns the UCS to face you, so that what you draw lies on the screen. <Command id="UCS" /> and Enter go back to World; <Command id="U" /> takes back the view and its UCS together.

### Is an isometric view the same as an isometric drawing?

No. An isometric view looks at a 3D model from a corner. An isometric drawing is 2D, drawn on the isometric planes with SNAP's isometric style, which MellowCAD does not have yet.

### Where is the View Manager?

VIEW runs <Command id="-VIEW" /> at the command line: there is no View Manager, and named views (Save, Restore) are not here yet.
