---
"@mellowcad/engine": minor
"@mellowcad/editor": minor
---

MTEXT's in-place editor, and TEXTEDIT's on a multiline text, show AutoCAD's Text Editor contextual tab: its style gallery and height set the edited text's own style and height (never TEXTSTYLE or TEXTSIZE), its Justification the text's attachment, and Close Text Editor keeps the text. A style picked while the editor holds text is asked about first, as AutoCAD's `Multiline Text - Text Style Change` task dialog does (`state.textStyleChangeDialog`, answered with `answerTextStyleChange`). `ContextualTabId` gains `textEditor`, `ContextualFieldId` gains `textHeight`, `ContextualTab` gains `textStyle` and `attachment`, and `ContextualEdit` gains `textStyle` and `attachment`. A key typed on the drawing while MTEXT's editor has lost the focus now goes into it, where it went to the command line. The editor's catalogs gain the tab's and the dialog's words, and its Quick Access Toolbar is greyed while the tab shows.
