---
"@mellowcad/engine": minor
"@mellowcad/editor": minor
---

The ribbon has AutoCAD's Text Style and Dimension Style lists, in Home › Annotation's slide-out and on the Annotate tab. A pick restyles the selected objects of that kind in one undo step, or makes the style current with none selected; each list ends in Manage Text Styles... or Manage Dimension Styles..., which open the style dialogs. The engine gains `applyTextStyleControl` and `applyDimStyleControl`, the state `textStyleControl` and `dimStyleControl` (what each list shows), and the ribbon buttons `manageTextStyles` and `manageDimensionStyles`; assigning a text style now reaches attribute definitions too, and a style assignment leaves out locked objects of other kinds instead of dropping them from the selection. In the editor, Delete on a ribbon control no longer erases the selection and Enter on a ribbon button no longer repeats the last command; Home's panels fold instead of running past the window in Japanese, Traditional Chinese and Arabic; and a drop-down opened on no value keeps its keys in its list.
