# AutoCAD coverage

What each implemented command actually does, and which documented AutoCAD options it still lacks.
Read the entry for a command **before extending it** — the gaps are deliberate and already
researched. Each command or feature is a `###` heading in the file of its area, with
**Implemented:** and **Missing:**; find one with `grep -n '^### .*TRIM' docs/coverage/*.md`.

Update the affected entry when you finish a feature; do not append a narrative of the work. A
parenthetical in **Missing:** gives the reason when the gap is blocked on something else rather
than merely unbuilt.

| File                     | Area                                                           |
| ------------------------ | -------------------------------------------------------------- |
| `draw.md`                | Drawing commands                                               |
| `modify.md`              | Editing commands                                               |
| `dimensions.md`          | Dimensions                                                     |
| `view.md`                | Zoom, pan, views and orbit                                     |
| `coordinate-systems.md`  | UCS, Z, the elevation plane and how a point is read            |
| `inquiry.md`             | Measurement and inquiry                                        |
| `properties.md`          | Properties, layers and style tables                            |
| `workspace.md`           | The editor's panels and bars                                   |
| `command-line.md`        | Command window, names, keywords, selection, undo               |
| `spanish.md`             | The Spanish command language (`es`) and its sources            |
| `arabic.md`              | The Arabic interface (`ar`)                                    |
| `drafting-aids.md`       | Snaps, tracking, grips, Ortho, Polar and dynamic input         |
| `clipboard-and-files.md` | Clipboard, save and open                                       |
| `blocks-palette.md`      | The Blocks palette                                             |
| `roadmap.md`             | The agreed order of what comes next, and what is off the table |
