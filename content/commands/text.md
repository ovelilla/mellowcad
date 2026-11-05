---
title: "TEXT in AutoCAD"
metaTitle: "TEXT in AutoCAD: single-line text and alignment"
description: "How AutoCAD's TEXT (DT) works, prompt by prompt: start point, height and rotation, Justify and Style, one object per line. Try it free in your browser."
figure: "Two lines of single-line text centred in a box, justified middle centre: each line an object of its own."
related: ["MTEXT", "TEXTEDIT", "STYLE", "MATCHPROP"]
coverage: "486b43b49955"
---

TEXT writes single-line text. You give a start point, a height and a rotation angle, then type a line and press Enter: the line becomes an object of its own, and the next one starts a line below it. An empty line ends the command. A click elsewhere before that starts the next lines at that point, and Escape keeps the lines already entered and drops the one being typed. For a paragraph that wraps to a width, as one object, use <Command id="MTEXT" />.

The first line says the current style, height and justification. The height is the one it shares with <Command id="MTEXT" /> and <Command id="ATTDEF" />, kept in the drawing, and the next TEXT offers it as its default; a style with a height of its own skips the height prompt. Enter at the start point carries on below the last line TEXT wrote, without asking the height or the angle again. U takes back the whole run.

## Options

### Justify

Asks where the text hangs from its point: <Keyword id="Left" /> (the default), <Keyword id="Center" />, <Keyword id="Right" />, <Keyword id="Middle" />, or one of nine points, top, middle and bottom by left, centre and right, as the prompt lists them. The start point prompt then asks for the point the justification names: for middle centre, the middle point. As in AutoCAD, the nine are also taken unlisted at the first prompt, so typing middle centre's letters there asks for the middle point at once. The justification is kept in the drawing for the next TEXT.

### Style

Asks for the name of the text style to make current, Enter keeping the one there is. <Keyword id="?" /> lists the drawing's styles; a name the drawing does not have is refused and asked again. Styles are made in the palette that <Command id="STYLE" /> opens.

## Missing

The Align and Fit justifications. Style's <Keyword id="?" /> lists every style at once, without asking which ones or pausing page by page. The text is typed in the dynamic input box, not with a caret on the drawing, and its wording cannot be retyped in the Properties palette, which also lacks the Annotative, Width factor, Obliquing, Upside down and Backward rows. A click inside a text's box picks it even off its letters, where AutoCAD picks nothing.

## Questions

### What is the shortcut for TEXT in AutoCAD?

`DT`, then Enter or Space; `DTEXT` and `TEXT` work too, and `_TEXT` in any language of AutoCAD. `T` is not TEXT's: it starts <Command id="MTEXT" />, multiline text.

### How do I align text in AutoCAD?

Choose <Keyword id="Justify" /> at the first prompt, or type the justification's letters there, then give the point it names: middle centre puts the middle of each line on its point, as a label goes in the middle of a box. To run the text along a line at an angle, type that angle at the rotation prompt.

### What is the difference between TEXT and MTEXT?

TEXT makes one object per line, each moved, edited and justified on its own, and never wraps. <Command id="MTEXT" /> makes one object of paragraphs that wrap to the width of a box, justified as a whole. Both share the text height and the text styles.

### How do I edit text in AutoCAD?

Double-click it: <Command id="TEXTEDIT" /> opens it to be retyped, then asks for the next text to edit until you press Escape. Its height and rotation are rows of the Properties palette, and its grips move it.
