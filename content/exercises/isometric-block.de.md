---
title: "AutoCAD-Übung Isometrie: ein Stufenblock"
metaTitle: "AutoCAD-Übung isometrisch zeichnen: ein Block"
description: "Einen Stufenblock in AutoCAD isometrisch zeichnen, mit LINIE (LINE) und Polarkoordinaten auf den Achsen 30°, 90° und 150°, und bemaßen. Schritt für Schritt."
figure: "Ein Stufenblock in Isometrie, 60 lang, 40 tief und 40 hoch, mit den an seinen Kanten bemaßten Größen."
sourceHash: "c1039d3b5e97"
---

Zeichnen Sie diesen Stufenblock in Isometrie, in Millimetern: 60 lang, 40 tief und 40 hoch, mit einer Stufe, 20 tief und 20 hoch, an seiner Vorderseite. Jede Kante folgt einer der isometrischen Achsen: 30° und 210° für die Länge, 150° und 330° für die Tiefe, 90° und 270° für die Höhe. MellowCAD hat das isometrische Zeichnen von AutoCAD noch nicht, seinen isometrischen Fang und die Isokreise, daher sind die Kanten mit Polarkoordinaten eingegebene Linien, eine Länge und ein Winkel.

## Steps

### Die Vorderseite der Stufe zeichnen [#front]

Auf dem Layer Kontur: <Command id="LINE" /> von `0,0`, der unteren vorderen Ecke: `60<30`, `20<90`, `60<210`, dann <Keyword command="LINE" id="Close" />.

### Die Seite zeichnen [#side]

Wieder von `0,0`, die linke Seite: `40<150`, `40<90`, `20<330`, `20<270` und `20<330`. Die Eingabetaste beendet die Linie auf der Vorderkante der Stufe.

### Die Oberseite zeichnen [#top]

Der Rest beginnt an schon gezeichneten Ecken: Geben Sie `_END` ein, den Objektfang Endpunkt für einen einzelnen Punkt, und wählen Sie die Ecke. Von der oberen rechten Ecke der Vorderseite: `20<150`, `20<90`, `20<150` und `60<210`. Dann zwei Linien von `60<210`, vom Fuß der Stufenhöhe und von ihrer Oberkante.

### Bemaßen [#dimensions]

Auf dem Layer Bemaßung: <Command id="DIMALIGNED" /> entlang der Kanten, jede neben ihrer eigenen platziert: 60 und 40 unten, 40 links hoch, 20 rechts hoch.
