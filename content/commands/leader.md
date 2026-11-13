---
title: "LEADER in AutoCAD"
metaTitle: "LEADER in AutoCAD: a leader line with text"
description: "How AutoCAD's LEADER (LEAD) works: a leader line from an arrowhead to its text, the hook, the format options, and how it differs from MLEADER. Try it free."
figure: "A hole and its note: LEADER from the circle's rim, two points, then two lines of text; the last segment rises, so a hook joins it to the text."
related: ["MTEXT", "DIMSTYLE", "DIMRADIUS", "TEXT"]
coverage: "837b7e68ba6b"
---

LEADER draws a line from an arrowhead to a note. Pick the start point, where the arrowhead goes, then as many points as you want; from the second on the prompt offers <Keyword id="Annotation" />, which Enter also takes, <Keyword id="Format" /> and <Keyword id="Undo" />. Enter at the first two points ends the command and draws nothing. Then type the note a line at a time, Enter after each, and Enter on an empty line to finish: the leader and its text, a multiline text, are made together as one step, on the current layer with the current colour, linetype and lineweight.

The text takes its height, its gap from the line and its place from the current dimension style: after the leader's end, or before it when the leader comes in from the right, and above the last line, which runs on under the text. When the last segment rises more than 15° from the horizontal, LEADER adds a hook, a short horizontal line as long as the arrowhead, ending at the point you picked. The arrowhead is the closed filled one, drawn only when the first segment is at least twice its length.

The leader follows its text: move, rotate or scale the text and the leader's end goes with it, the hook worked out again; erase the text and the leader stays, with no hook. A leader and its text copied together stay a pair. The leader's grips are at its points; the Properties palette shows its type, arrow size, text offset and position, and its scale.

## Options

### Annotation

Asks for the text, a line at a time. Enter at the first line asks for another kind of annotation instead: <Keyword id="Mtext" /> (the default) opens the text editor at the leader's end, where Enter breaks a line and Ctrl+Enter or a click outside finishes; <Keyword id="Copy" /> puts a copy of a multiline text, a single-line text or a block reference you select at the end, refusing anything else with <Message id="leaderCopyRefused" />; <Keyword id="None" /> draws the leader alone.

### Format

Sets how the leader is drawn, then goes back to the points: <Keyword id="Spline" /> makes it a smooth curve through the points, <Keyword id="STraight" /> straight segments again, <Keyword id="Arrow" /> puts the arrowhead back and <Keyword id="None" /> leaves it out. Enter keeps the format as it is.

### Undo

Takes back the last point and asks for it again. At the second point there is nothing to take back, and <Message id="invalidInputCapital" /> says so.

## Missing

The Tolerance and Block annotations: MellowCAD has no geometric tolerance object, and a block is not inserted from inside LEADER, so the option prompt lists Copy, None and Mtext. The arrowheads other than the closed filled one, and the leader's own line colour and lineweight from the dimension style. QLEADER and MLEADER, the quick leader and the multileader, are not there yet: a DXF's multileaders are left out when it opens.

## Questions

### What is the shortcut for LEADER in AutoCAD?

`LEAD`, then Enter or Space. The full name works too, and `_LEADER` in any language of AutoCAD.

### What is the difference between LEADER and MLEADER?

LEADER is the older command: a leader line and a separate text the line follows. MLEADER, which AutoCAD now recommends, makes one multileader object, with its own styles and several leader lines to one note. MellowCAD has LEADER; it opens and saves the leaders of a DXF file, and leaves its multileaders out.

### How do I make a leader with text?

Run LEADER, pick the point to point at, then where the text should be, press Enter and type the text, a line at a time. Enter on an empty line finishes. Enter at the first line instead gives the other annotations, the text editor among them.

### How do I change the size of the leader's arrow?

Select the leader and change Arrow size in the Properties palette, which keeps it on that leader alone; or change the dimension style's arrow size, which every leader on that style follows. The hook's length follows the arrow size too.

### Why does the leader have no arrow?

Either Format's None left it out, or the first segment is shorter than twice the arrow size, where AutoCAD draws no arrowhead either. Pick the second point farther from the first, or set a smaller arrow size.
