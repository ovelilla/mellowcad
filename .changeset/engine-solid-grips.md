---
"@mellowcad/engine": minor
---

The primitive solids' grips, as AutoCAD 2027 lays them: a square at the base's centre that moves the solid; a box's and a wedge's base corners and edge arrows, a pyramid's corners and sides, a cylinder's and a cone's base quadrants, a sphere's equator, a torus' ring and tube; off the plan, the height's arrows and a pyramid's or cone's top radius. A drag sizes the solid along its arrow (in the base's plane, or along the line of sight), the box typing how far or, Tab's, the size; a drag AutoCAD leaves the solid by is refused; one undo step. Their Geometry rows in the Properties palette are typed — Position, Length, Width, Height, the radii, Sides, Diameter, Torus and Tube radius —, with AutoCAD's refusals, a negative height turning the solid over. `EntityProperty` gains `SolidProperty`'s rows (`solidLength`, `solidWidth`, `solidHeight`, `baseRadius`, `topRadius`, `sides`, the elliptical radii, `torusRadius`, `tubeRadius`).
