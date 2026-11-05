---
title: "ARRAYPOLAR in AutoCAD"
metaTitle: "Polar array in AutoCAD: ARRAYPOLAR command"
description: "How AutoCAD's ARRAYPOLAR works, prompt by prompt: the centre, the items, the angle between or filled, rotated items. Try it free in your browser."
figure: "A hole on a flange arrayed round the flange's centre: 8 items over a full turn."
related: ["ARRAY", "ARRAYRECT", "ARRAYPATH", "ROTATE"]
coverage: "7fb059d47898"
---

ARRAYPOLAR copies a selection round a centre point, as one array object. It asks for the objects, says the type and whether the array is associative, asks for the centre point and shows the array at once: 6 items over a full turn, each turned as it goes round. Then one prompt edits it live until Enter makes it, through its options or the preview's grips, as in AutoCAD. The objects selected become its first item.

## Options

### ASsociative

<Keyword id="Yes" />, the default, makes one array object, which its grips and the Properties palette change later; <Keyword id="No" /> makes separate copies beside the objects selected. The answer is kept for the session, by ARRAYRECT and ARRAYPATH too.

### Items

The number of items, from 1 to 32767; the angle they fill is kept.

### Angle between

The angle from one item to the next. The angle filled becomes that many steps, the direction kept, and a full turn once they reach 360°.

### Fill angle

The angle the items fill, positive counter-clockwise and negative clockwise; the number of items is kept. Over a full turn the items are a turn divided by their number apart; over less, the last one lands at the end of the angle.

### ROTate items

<Keyword id="Yes" />, the default, turns each item as it goes round the centre; <Keyword id="No" /> only moves it, so every item stands as the first does.

### eXit

Makes the array and ends the command, as Enter does.

## Missing

Base point; Axis of rotation, for an array round an axis in space; ROWs and Levels, for rings of items and copies stacked in Z; Expression, which ties a value to the drawing's parameters. The menus of the array's grips (Stretch Radius, Item Count, Fill Angle…) and Ctrl to cycle them.

## Questions

### How do I make a polar array?

Type `ARRAYPOLAR`, select the objects, press Enter and pick the centre point; or type `AR` for <Command id="ARRAY" /> and choose <Keyword command="ARRAY" id="POlar" /> after the objects. Then choose <Keyword id="Items" /> to set how many, and press Enter to make it.

### How do I array objects round part of a circle?

Choose <Keyword id="Fill angle" /> and type the angle: 180 lays the items over half a circle counter-clockwise, -180 clockwise. The number of items is kept, the first and the last at each end of the angle.

### How do I keep the items from rotating?

Choose <Keyword id="ROTate items" /> and answer <Keyword id="No" />: each item is moved round the centre without turning.

### How do I change the radius of a polar array?

Select the array and drag its square grip at the base point towards or away from the centre: the distance to the centre is the new radius. Or retype Radius in the Properties palette.
