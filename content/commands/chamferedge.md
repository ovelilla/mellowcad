---
title: "CHAMFEREDGE in AutoCAD"
metaTitle: "CHAMFEREDGE in AutoCAD: chamfer 3D solid edges"
description: "How AutoCAD's CHAMFEREDGE bevels the edges of a 3D solid, prompt by prompt: the edges of one face, Loop, Distance1 and Distance2. Try it free in your browser."
figure: "A box seen from the south-east: CHAMFEREDGE with both distances 6 bevels the two top edges at its front corner, which meet in a line."
related: ["FILLETEDGE", "CHAMFER", "SOLIDEDIT", "BOX"]
coverage: "46186dc70d4f"
---

CHAMFEREDGE bevels the edges of a 3D solid. It says the two current distances, then asks for an edge and, after the first, for others on the same face, until Enter: a click takes the edge under the cursor, a point typed the edge drawn through it. An edge the first ones share no face with says <Message id="edgesOneFace" />, one of another solid <Message id="chamferMultipleBodies" />. As edges are taken, the solid is drawn as it will be. Enter then asks you to press Enter again to accept, or to change the distances for this chamfer; that Enter makes it.

The first distance runs along the face the edges share; for a lone edge, along the face AutoCAD takes: the front, for a box's top front edge, and the top, for a cylinder's rim. A straight edge between two flat faces becomes a flat strip, the round edge of a hole or a rim a strip of a cone, and chamfers that meet at a corner are joined in a line. The distances are offered again the next time. The solid keeps its layer and properties but loses what made it: a box is no longer a box. The whole command is one undo step. MellowCAD's 3D is solids only, and still partial.

## Options

### Loop

Takes every edge round a face: pick one edge, then <Keyword id="Accept" /> the loop shown, or <Keyword id="Next" /> for the loop of the other face the edge belongs to. <Keyword id="Edge" /> goes back to single edges.

### Distance

Asks for the first distance, then the second, each typed or as the distance between two points; 0 or less says <Message id="distanceTooSmall" />. <Keyword id="Expression" /> takes one as a formula. At the accept prompt it asks for the base surface's distance and the other surface's, for this chamfer only.

## Missing

A corner where three chamfered edges meet. A straight edge beside a curved face, a round edge off its cylinder's axis, and any edge of a sphere, a torus, an extrusion or a revolved solid: here they fail with a modeling error. The two arrow grips AutoCAD shows at the accept prompt, one per distance. <Command id="CHAMFER" /> picking a solid's edge, which AutoCAD also allows. The chamfer drawn as a mesh while you pick, and surfaces.

## Questions

### How do I chamfer an edge of a 3D solid in AutoCAD?

Run CHAMFEREDGE, choose <Keyword id="Distance" /> and give both distances, pick the edges of one face, then press Enter twice: once to end the picking, once to accept. The session's `6` and `6` bevel two top edges of a box.

### Why does CHAMFEREDGE say the edges must belong to one face?

The edges of one chamfer share a face: the first distance runs along it. Chamfer the edges of another face in a second run.

### Why does CHAMFER not work on a 3D solid?

AutoCAD's <Command id="CHAMFER" /> bevels a solid's edge too, but MellowCAD's does not yet: use CHAMFEREDGE, and <Command id="FILLETEDGE" /> to round an edge.

### How do I chamfer a hole's edge?

Pick its round edge where it meets the flat face: the chamfer is a strip of a cone round the hole.
