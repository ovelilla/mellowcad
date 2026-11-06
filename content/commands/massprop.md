---
title: "MASSPROP in AutoCAD"
metaTitle: "MASSPROP in AutoCAD: volume, centroid, inertia"
description: "How AutoCAD's MASSPROP reports the mass properties of 3D solids and regions: volume, area, centroid, moments of inertia, and the .mpr file. Try it free online."
figure: "A box 60 by 40 by 25 at the origin: MASSPROP writes its volume, bounding box, centroid and moments, and Enter declines the file."
related: ["AREA", "LIST", "REGION", "BOX", "UNITS"]
coverage: "74e5c06837b2"
---

MASSPROP measures 3D solids and regions. Select them and press Enter: the report is written at the command prompt, in AutoCAD's columns, then it asks whether to write it to a file. A set with neither says <Message id="massPropNoneSelected" />, and ends.

For solids, the set is measured as one body with a density of 1, so the mass is the volume: mass, volume, bounding box, centroid, moments of inertia, products of inertia and radii of gyration, all about the current UCS, then the principal moments about the centroid with their directions. Solids that overlap are counted twice. For regions in the UCS's XY plane: area, perimeter, bounding box, centroid, moments and product of inertia, radii of gyration and principal moments; a region off that plane gives its area, perimeter, bounding box and centroid alone. Regions come first, then solids; regions outside the plane of the first are left out and counted. Numbers are written at the drawing's precision, set with <Command id="UNITS" />, and they are exact, the solids' integrated face by face. MASSPROP changes nothing in the drawing; it is typed, as in AutoCAD, whose ribbon has no button for it.

## Options

### Yes

At the file question, whose default is <Keyword id="No" />: writes the report to a file, as AutoCAD writes it, line for line. In AutoCAD a dialog asks where; in a browser the download is that dialog, and the file is named after the drawing, `.mpr`.

## Missing

Units after each number with architectural or engineering units (`sq in`, `cu in`, `lb`), which AutoCAD writes: here no unit follows a number. Choosing the file's name, and the question before replacing one. Far from the origin, AutoCAD writes large numbers in exponent form and loses digits, and its last digit can differ by its own rounding: MellowCAD's are exact. For a solid with two equal principal moments, the pair of directions AutoCAD's rounding picks.

## Questions

### How do I find the volume of a 3D solid in AutoCAD?

Run MASSPROP, pick the solid and press Enter: Volume is the report's second line. The session's box of 60 by 40 by 25 gives 60000. Press Enter at the file question to end.

### How do I find the centroid of a shape?

Make it a region with <Command id="REGION" />, or a solid, then run MASSPROP and pick it: Centroid gives its X and Y, and Z for a solid, in the current UCS.

### Why does MASSPROP say no solids or regions selected?

What you picked is neither: lines, polylines, circles and hatches have no mass properties, and a block holding a solid is not a solid. Turn closed shapes into regions with <Command id="REGION" />, or into solids with <Command id="EXTRUDE" />.

### Why is the mass equal to the volume?

MASSPROP measures with a density of 1, as AutoCAD does: solids have no material here. Multiply the volume by the material's density for its real mass.
