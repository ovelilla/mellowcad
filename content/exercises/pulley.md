---
title: "AutoCAD 3D exercise: a pulley"
metaTitle: "AutoCAD 3D exercise: revolve a pulley"
description: "Model a pulley in AutoCAD 3D: its half section as a closed polyline, revolved round the Y axis into a solid, solved step by step. Practise 3D free online."
figure: "The pulley's half section beside its axis, its distances from the axis dimensioned."
model: "The pulley as a solid, seen from the south-east in the Conceptual visual style."
---

Model this pulley by revolving its half section round its axis, in millimetres: a bore of 20, a hub 30 long and 40 across, a web 10 thick and a rim 24 wide from 90 to 110 across, centred on the hub. The section is drawn as distances from the axis, which runs up the Y axis, so each diameter is drawn as its half.

## Steps

### Draw the half section [#profile]

On the Outline layer, one closed <Command id="PLINE" /> from `10,0`, each point after it a step from the last: `10,0`, `0,10`, `25,0`, `0,-7`, `10,0`, `0,24`, `-10,0`, `0,-7`, `-25,0`, `0,10` and `-10,0`, then <Keyword command="PLINE" id="Close" />.

### Turn the view [#view]

<Command id="-VIEW" /> and <Keyword command="VIEW" id="SEiso" /> look at it from the south-east and above; <Command id="VSCURRENT" /> and <Keyword command="VSCURRENT" id="Conceptual" /> shade the faces, which shows a turned part best.

### Revolve it [#revolve]

<Command id="REVOLVE" />: pick the section and press Enter, then <Keyword command="REVOLVE" id="Y" />: the Y axis is the pulley's. Enter takes the default angle, a whole turn. <Command id="ZOOM" /> <Keyword command="ZOOM" id="Extents" /> frames it, and a scale of 0.8x leaves room round it.
