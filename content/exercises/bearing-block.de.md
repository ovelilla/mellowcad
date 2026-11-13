---
title: "AutoCAD-Übung 3D: ein Lagerbock"
metaTitle: "AutoCAD-Übung 3D für Fortgeschrittene: Lagerbock"
description: "Einen Lagerbock in AutoCAD 3D modellieren: extrudieren, vereinigen, dann Bohrung und zwei Befestigungslöcher als Zylinder abziehen, Schritt für Schritt."
figure: "Der Lagerbock in der Draufsicht, 100 mal 60, mit Nabe, Bohrung und Löchern bemaßt."
model: "Der Lagerbock als Volumenkörper, von Südosten gesehen im visuellen Stil Konzeptuell."
sourceHash: "5579d6bd5a86"
---

Modellieren Sie diesen Lagerbock, in Millimetern: eine Grundplatte 100 mal 60 mit Eckenradius 10, 12 dick; eine Nabe mit 40 Durchmesser, 40 hoch, in der Mitte; eine Bohrung von 20 durch die Nabe und zwei Befestigungslöcher von 10 durch die Grundplatte, im Abstand von 76. Grundplatte und Nabe werden aus ihren Konturen extrudiert und zu einem Volumenkörper vereinigt; die Bohrung und die Löcher sind Zylinder, die davon abgezogen werden.

## Steps

### Die Draufsicht zeichnen [#plan]

Auf dem Layer Kontur: <Command id="RECTANG" /> mit der Option <Keyword command="RECTANG" id="Fillet" /> `10`, von `0,0` bis `100,60`, und ein Kreis in seiner Mitte, `50,30`, mit einem <Keyword command="CIRCLE" id="Diameter" /> von `40`.

### Grundplatte und Nabe extrudieren [#extrude]

<Command id="EXTRUDE" /> die Kontur `12` hoch, dann den Kreis `40` hoch: zwei Volumenkörper.

### Vereinigen [#union]

<Command id="UNION" />: Wählen Sie beide und drücken Sie die Eingabetaste. Danach ist es ein einziger Volumenkörper.

### Die Zylinder zeichnen [#holes]

Die Bohrung und ein Befestigungsloch als Zylinder, mit <Command id="CYLINDER" />: die Bohrung in `50,30`, <Keyword command="CYLINDER" id="Diameter" /> `20` und `40` hoch; ein Befestigungsloch in `12,30`, Durchmesser `10` und `12` hoch. Kopieren Sie das Loch dann mit <Command id="COPY" /> von `12,30` um `76,0` weiter.

### Abziehen [#subtract]

<Command id="SUBTRACT" />: Wählen Sie den Lagerbock und drücken Sie die Eingabetaste, dann die drei Zylinder und die Eingabetaste. Die Bohrung und die Löcher gehen durch.

### Die Ansicht drehen [#view]

<Command id="-VIEW" /> und <Keyword command="VIEW" id="SEiso" />, <Command id="VSCURRENT" /> und <Keyword command="VSCURRENT" id="Conceptual" />, dann <Command id="ZOOM" /> <Keyword command="ZOOM" id="Extents" /> und `0.8x`, damit er ins Bild passt.
