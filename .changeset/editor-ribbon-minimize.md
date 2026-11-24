---
"@mellowcad/editor": minor
---

The ribbon minimizes and folds as AutoCAD 2027's does. After the last tab, the minimize button steps through the full ribbon, panel buttons, panel titles and the tabs alone (Cycle through All), or toggles with the state its arrow's menu chooses; the state is kept under `layoutStorage.ribbon`, laid out before the first paint by the new `ribbonLayoutScript`, and a `Ribbon` of your own reads and sets it with `useRibbonLayout()`. As the window narrows the panels shed their text and fold from the right into buttons that open them whole, where the row scrolled sideways. A drag in the colour picker of the ribbon's Object Color and of the Properties palette now applies one colour, once, when the picker commits it. The catalog's `Ribbon.minimize` words are new.
