---
title: "VSCURRENT in AutoCAD"
metaTitle: "VSCURRENT in AutoCAD: visual styles and alias"
description: "How AutoCAD's VSCURRENT (VS) sets the visual style: 2D Wireframe, Hidden and Conceptual, what each draws and how to go back to wireframe. Try it free online."
figure: "A block with a hole through it, seen from the south-east: VSCURRENT Conceptual shades its faces and draws its edges over them."
related: ["3DORBIT", "BOX", "VIEW", "UCS"]
coverage: "a8e002e5dc9f"
---

VSCURRENT sets the visual style: how the view draws 3D solids. It asks for a style, offering the current one as the default, and Enter keeps it. <Keyword id="2dwireframe" /> draws every edge, those behind too; <Keyword id="Hidden" /> hides what faces hide; <Keyword id="Conceptual" /> paints the faces, shaded. The style belongs to the view and is saved with the drawing, and each run is one undo step. It cannot be used inside another command.

What is not a solid — lines, circles, regions, text — draws as in 2D Wireframe whatever the style, in its own colours. In Hidden and Conceptual a click takes the solid whose face is nearest you under the cursor, never one through a face that hides it, and the object snaps still find every edge. A solid on a locked layer draws its edges fainter. MellowCAD's 3D is solids only, and still partial.

## Options

### 2dwireframe

Every edge of every solid, those behind included, with the lines that show its curved faces; the default in a new drawing. Coming back to it from another style, VSCURRENT says <Message id="regeneratingModel" />.

### Hidden

Each solid's edges, and the outlines of its curved faces, where no face of any solid hides them, in the object's colour: a solid behind another is hidden by it. The lines that show a curved face in 2D Wireframe are not drawn.

### Conceptual

The faces towards you painted in the object's colour, turning cool blue on the side away from the light, which follows your viewpoint, and Hidden's edges drawn over them in one colour, whatever the object's. Here and in Hidden, a cylinder or a cone seen in plan shows its circle alone, as in AutoCAD.

## Missing

The other styles of AutoCAD — Wireframe, Realistic, Shaded, Shaded with edges, Shades of Gray, Sketchy and X-ray — and naming a style or listing them by `?`: the prompt lists only the three styles that are built, and refuses any other answer.

## Questions

### How do I change the visual style in AutoCAD?

Run VSCURRENT (or `VS`) and choose the style: <Keyword id="Hidden" /> to hide the edges behind, <Keyword id="Conceptual" /> to shade the faces. It changes the view only, not the objects.

### How do I go back to 2D Wireframe?

Run VSCURRENT and choose <Keyword id="2dwireframe" />, its letter `2`.

### What is the difference between Hidden and Conceptual?

Both hide what faces hide. Hidden draws only edges, on the background, as a line drawing; Conceptual paints the faces too, shaded by the light, with the same edges over them.

### Why can I still see lines through my solid?

They are not part of a solid. Lines, circles and regions draw as in 2D Wireframe in every style, so a line behind a box still shows. In <Keyword id="2dwireframe" />, the solid's own edges behind show too: choose <Keyword id="Hidden" />.
