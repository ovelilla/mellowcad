---
title: "FILLETEDGE in AutoCAD"
metaTitle: "FILLETEDGE in AutoCAD: fillet 3D solid edges"
description: "How AutoCAD's FILLETEDGE rounds the edges of a 3D solid, prompt by prompt: the edges, Chain, Loop, Radius and the arrow grip. Try it free in your browser."
figure: "A box seen from the south-east: FILLETEDGE with a radius of 8 rounds its two upright edges on the right."
related: ["CHAMFEREDGE", "FILLET", "SOLIDEDIT", "BOX"]
coverage: "46186dc70d4f"
---

FILLETEDGE rounds the edges of a 3D solid. It says the current radius, then asks for edges, until Enter: a click takes the edge under the cursor, lit as it passes over, and a point typed takes the edge drawn through it. As edges are taken, the solid is drawn as it will be, the fillets in place. Enter counts the edges and asks you to press Enter again to accept, or to change the radius; that Enter makes the fillets. Edges of one solid only: another's says <Message id="filletMultipleBodies" />, one taken twice <Message id="edgeAlreadyPicked" />.

A straight edge between two flat faces becomes a quarter of a cylinder, and the round edge of a hole or a rim a quarter of a torus; fillets that meet at a corner are joined, three of them by a piece of a sphere. The radius is saved in the drawing and offered again the next time. The solid keeps its layer and properties but loses what made it: a box is no longer a box. The whole command is one undo step. MellowCAD's 3D is solids only, and still partial.

## Options

### Chain

Takes the edge you pick and every edge tangent to it, one after another: the eight round the top of a block whose upright edges are already rounded. With none tangent it says <Message id="noTangentChainEdges" /> and takes the one picked. <Keyword id="Edge" /> goes back to single edges.

### Loop

Takes every edge round a face: pick one edge, then <Keyword id="Accept" /> the loop shown, or <Keyword id="Next" /> for the loop of the other face the edge belongs to.

### Radius

Asks for the radius, typed or as the distance between two points; 0 or less says <Message id="radiusTooSmall" />. <Keyword id="Expression" /> takes it as a formula. At the accept prompt, it changes the radius of the fillets shown. The arrow grip in the middle of the first fillet sets it by dragging: click it, move, click; <Keyword id="eXit" /> or Escape leaves it as it was.

## Missing

Fillets of two radii that meet, and a fillet that ends on a curved face. A fillet wider than a face beside it, which AutoCAD rolls over the next edge: here it fails with a modeling error. A straight edge beside a curved face, a round edge off its cylinder's axis, and any edge of a sphere, a torus, an extrusion or a revolved solid, which fail the same way. Some corners where fillets meet on edges at different slopes. The arrow grip on any edge but the first, and the line from it to the cursor. <Command id="FILLET" /> picking a solid's edge, which AutoCAD also allows. The fillet drawn as a mesh while you pick, and surfaces.

## Questions

### How do I fillet an edge of a 3D solid in AutoCAD?

Run FILLETEDGE, choose <Keyword id="Radius" /> and type it, pick the edges, then press Enter twice: once to end the picking, once to accept. The session's `8` rounds two edges of a box.

### How do I fillet all the edges of a face?

Choose <Keyword id="Loop" /> and pick an edge of the face, then <Keyword id="Accept" />, or <Keyword id="Next" /> if the loop shown is the other face's. For edges that already flow into one another, round a rounded block's top, <Keyword id="Chain" /> takes them all.

### Why does FILLET not work on a 3D solid?

AutoCAD's <Command id="FILLET" /> rounds a solid's edge too, but MellowCAD's does not yet: use FILLETEDGE, and <Command id="CHAMFEREDGE" /> for a bevel.

### How do I change the fillet radius?

Choose <Keyword id="Radius" /> before you pick or at the accept prompt, or drag the arrow grip in the middle of the first fillet. The last radius is offered next time.
