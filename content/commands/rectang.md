---
title: "RECTANG in AutoCAD"
metaTitle: "RECTANG in AutoCAD: rectangle command and alias"
description: "How AutoCAD's RECTANG (REC) draws a rectangle: two corners, Dimensions, Area and Rotation, rounded with Fillet or cut with Chamfer. Try it free in your browser."
figure: "Two rectangles from two corners, the second typed relative to the first: one with Fillet 8, the next with Chamfer 8."
related: ["POLYGON", "PLINE", "EXPLODE", "FILLET"]
coverage: "4a480f6184c0"
---

RECTANG draws a rectangle from two opposite corners, picked or typed: `0,0` then `100,50`, relative to the first under dynamic input, makes one 100 by 50. It is one closed polyline of four vertices, made on the current layer. The first prompt's options set how the next rectangles are drawn, and each keeps its value for the rest of the session: the next RECTANG says the ones in force in its first line. Its width option gives every side a polyline width. While you place the other corner, the rectangle follows the cursor; with dynamic input on, you can type its length, Tab, and its width.

## Options

### Chamfer

Asks a first and a second chamfer distance, and cuts each corner by them: eight vertices. A distance of 0 turns it off. It replaces Fillet.

### Elevation

Asks the height the rectangle is drawn at, its Z.

### Fillet

Asks a radius and rounds each corner by it. A radius of 0 turns it off. It replaces Chamfer.

### Thickness

Asks a thickness: the rectangle stands that high, as a wall would, in a 3D view.

### Area

At the other corner: asks the area, then whether to give the <Keyword id="Length" /> or the <Keyword id="Width" />, then that side. The other side is worked out, the corners counted in, and the rectangle is made at once.

### Dimensions

At the other corner: asks the length and the width, then a point that sets in which direction from the first corner the rectangle lies.

### Rotation

At the other corner: asks the angle the rectangle is turned to, typed or as a point from the first corner, or two points with <Keyword id="Pick" />. The angle is kept for the session.

## Missing

A length or width of 0 under <Keyword id="Area" />, which here draws nothing and in AutoCAD draws a broken polyline. After a refused answer at Rotation's prompt, MellowCAD asks the prompt again in full, where AutoCAD writes nothing more.

## Questions

### What is the shortcut for RECTANG in AutoCAD?

`REC`, then Enter or Space; `RECTANGLE` works too. The full name works as well, and `_RECTANG` in any language of AutoCAD.

### How do I draw a rectangle with exact dimensions?

Give the first corner, then type the other one relative to it: `100,50` with dynamic input on, as it starts, or `@100,50` without, makes it 100 long and 50 wide. Or choose <Keyword id="Dimensions" /> and type the two sides.

### How do I draw a rectangle with rounded corners?

Choose <Keyword id="Fillet" /> at the first prompt and type the radius, then give the two corners.

### Why does my rectangle come out with rounded or cut corners?

RECTANG keeps Fillet and Chamfer for the session, so a rectangle drawn after one carries it too: its first line says so. Choose <Keyword id="Fillet" /> and type `0` to draw plain corners again.

### Is a rectangle a polyline in AutoCAD?

Yes: one closed polyline. <Command id="EXPLODE" /> breaks it into four lines, and <Command id="OFFSET" /> offsets it whole.
