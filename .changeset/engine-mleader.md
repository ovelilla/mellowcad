---
"@mellowcad/engine": minor
---

Multileaders (`MLeaderEntity`, with `MLeaderBranch`, `MLeaderContent`, `MLeaderText`, `MLeaderBlockContent`, `MLeaderStyleData`, `MLeaderColor`, `MLeaderKept` and `MLeaderPath`, among `Entity`'s types), as AutoCAD 2027 opens one: drawn from its context data (its text or block, each branch's dogleg, each leader line, straight or a spline, with its closed filled arrowhead), picked through what it draws and snapped at its vertices, landings, doglegs' ends and text, with a grip at each of those points; MOVE, COPY, ROTATE, SCALE (its sizes, as AutoCAD writes them), MIRROR (its text laid back by its landing, reading as before) and STRETCH (its vertices, landings and doglegs), EXPLODE and LIST in every language; OFFSET, AREA, BREAK, DIVIDE, EXTEND, FILLET and CHAMFER refuse it as AutoCAD does. A DXF opens and saves its MULTILEADER objects and their MLEADERSTYLE. Drawing file version 61.
