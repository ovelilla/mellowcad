---
title: "PLAN in AutoCAD"
metaTitle: "PLAN in AutoCAD: plan view of the UCS or World"
description: "How AutoCAD's PLAN looks straight down on the current UCS, a saved one or the world's: Current ucs, Ucs, World, and how to get back to plan. Try it free."
figure: "The stepped block seen from the south-west with its UCS turned 30 degrees about Z: PLAN and Enter look straight down on that UCS, its X axis to the right, so the block shows turned."
related: ["UCS", "VIEW", "3DORBIT", "ZOOM", "UCSICON"]
coverage: "c316dfded5c9"
---

PLAN looks straight down on the XY plane of a UCS, with its X axis pointing right: the plan view, as you drew it. It asks which UCS — the current one, a saved one or the world's — and Enter takes the current one. Then it frames the whole drawing and says <Message id="regeneratingModel" />.

Nothing in the drawing moves, and the UCS stays as it was: PLAN only turns the view. It is one undo step, so <Command id="U" /> takes the view back, and <Command id="ZOOM" /> <Keyword command="ZOOM" id="Previous" /> steps back to the view before. It is the way back to the plan after <Command id="3DORBIT" /> or an isometric <Command id="VIEW" />. MellowCAD's 3D is solids only, and still partial.

## Options

### Current ucs

The plan of the current UCS, the default. After <Command id="UCS" /> turned the UCS 30 degrees about Z, the drawing shows turned 30 degrees clockwise, so that the UCS's X axis points right; after a UCS on a sloping face, it looks square onto that face.

### Ucs

The plan of a UCS saved with <Command id="UCS" />'s <Keyword command="UCS" id="NAmed" />, which you type by name. For a name that is not saved it says it cannot find that UCS and asks again; <Keyword id="?" /> lists the saved ones, as UCS does, and asks again too. The current UCS does not change.

### World

The plan of the world coordinate system: the drawing as it was at the start, X to the right and Y up, whatever the current UCS is, which stays as it was.

## Missing

With nothing drawn, PLAN keeps the zoom where it was, where AutoCAD frames the drawing limits.

## Questions

### How do I get back to plan view in AutoCAD?

Type `PLAN` and press Enter twice: the second Enter takes <Keyword id="Current ucs" />. If the UCS is turned and you want the world's plan, choose <Keyword id="World" /> instead.

### What is the UCS plan command?

PLAN with <Keyword id="Current ucs" />: it looks down on the current UCS, its X axis to the right. Turn the UCS first with <Command id="UCS" />, then run PLAN and press Enter twice, and you draw on the turned plan as if it were square.

### Why is my drawing rotated in plan view?

The view is the plan of a turned UCS. Run PLAN and choose <Keyword id="World" /> to see the drawing with the world's X to the right again; <Command id="UCS" /> and Enter set the UCS back to World too.

### Does PLAN change the UCS?

No. It only turns the view; the UCS stays as it was. <Command id="VIEW" />'s orthographic views are the ones that turn the UCS as well.
