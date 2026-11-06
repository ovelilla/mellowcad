---
title: "CHPROP in AutoCAD"
metaTitle: "CHPROP in AutoCAD: change properties by prompt"
description: "How AutoCAD's CHPROP works: select objects, then change their colour, layer, linetype, lineweight or thickness at the command line. Try it free online."
figure: "CHPROP on a line across a plate's hole: colour 1 and linetype Center, an axis, on the layer it was on."
related: ["PROPERTIES", "MATCHPROP", "COLOR", "LAYER"]
coverage: "4e5f15ab3942"
---

CHPROP changes the properties of the objects you select, at the command line: the Properties palette's General rows, asked as prompts. Select the objects, or select them before the command, then choose a property to change; it asks for one again after each, until Enter ends it. Each property's prompt offers the set's value as its default, <Message id="varies" /> where the objects differ, and Enter there leaves each object its own. What you set is applied as the command ends, so Escape leaves every object as it was. Objects on a locked layer are counted and left out, each saying <Message id="objectOnLockedLayer" />. The whole run is one step that <Command id="U" /> takes back.

## Options

### Color

A colour number from 1 to 255, a name such as `red`, `BYLAYER`, or <Keyword id="Truecolor" /> and its `Red,Green,Blue`, as <Command id="COLOR" /> takes them; what COLOR refuses is refused here and asked again.

### LAyer

A layer's name, in any case. A name that cannot be a layer's says <Message id="invalidLayerName" />, one that is not in the drawing says it cannot be found; both ask again. CHPROP does not create layers.

### LType

A linetype's name, in any case, or `ByLayer`. Every linetype here is loaded; another name says it is not found and goes back to the property prompt.

### LWeight

A lineweight in millimetres, rounded to the nearest standard one as <Command id="LWEIGHT" /> rounds it, or `ByLayer`; `?` lists them.

### Thickness

A distance, typed or measured by two points, negative and zero too. It is set on the lines, circles, arcs and polylines in the set, along each one's own normal; for each other type it says, as it ends, that it cannot change its thickness.

## Missing

ltScale, TRansparency, Material and Annotative, which objects here do not have, so the prompt does not list them. ByBlock at Color, LType and LWeight, and LWeight's Default. A true colour equal to an index colour reads back as the index one: `255,0,0` is offered as `1 (red)`. Color books. A text's and an attribute definition's thickness, left as they are. CHANGE, whose Properties asks the same prompt with Elev.

## Questions

### Is there a shortcut for CHPROP in AutoCAD?

It has no alias: type `CHPROP`, or `_CHPROP` in any language of AutoCAD. Enter at the Command prompt repeats it.

### What is the difference between CHPROP and PROPERTIES?

They change the same properties. <Command id="PROPERTIES" /> shows them in a palette, with each object's geometry too; CHPROP asks for them at the command line, which keeps your hands on the keyboard.

### How do I change the colour of objects from the command line?

Type `CHPROP`, select the objects, press Enter, choose <Keyword id="Color" /> and type the colour, such as `1` for red. Press Enter again to finish.

### How do I move several objects to another layer?

Run CHPROP, select them, choose <Keyword id="LAyer" /> and type the layer's name. The layer must exist: create it in <Command id="LAYER" /> first.
