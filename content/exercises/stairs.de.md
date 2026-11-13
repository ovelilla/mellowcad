---
title: "AutoCAD-Übung: eine Treppe im Grundriss"
metaTitle: "AutoCAD-Übung Architektur: Treppe im Grundriss"
description: "Eine gerade Treppe im Grundriss in AutoCAD zeichnen: zehn Trittstufen aus einer Linie und einem rechteckigen Muster, der Laufpfeil und die Bemaßung. Kostenlos."
figure: "Eine gerade Treppe im Grundriss, 280 mal 100 Zentimeter, ihr Pfeil weist den Lauf hinauf."
sourceHash: "ff6e60262cd9"
---

Zeichnen Sie eine gerade Treppe im Grundriss, in Zentimetern: 280 lang und 100 breit, zehn Trittstufen von 28 und den Pfeil, der die Gehrichtung nach oben zeigt. Der Bemaßungsmaßstab der Zeichnung ist für einen Grundriss in Zentimetern eingestellt, daher lassen sich ihre Bemaßungen in dieser Größe lesen. Gezeichnet wird die Kante einer Trittstufe; ein rechteckiges Muster platziert die übrigen.

## Steps

### Die Kontur zeichnen [#outline]

Auf dem Layer Kontur: <Command id="RECTANG" /> von `0,0` bis `280,100`: die Kontur des Laufs.

### Die erste Trittstufe zeichnen [#tread]

Die Kante der ersten Trittstufe, eine <Command id="LINE" /> von `28,0`, `0,100` hoch, und die Eingabetaste.

### Die Trittstufen anordnen [#array]

<Command id="ARRAYRECT" /> kopiert sie entlang des Laufs: Wählen Sie die Linie und drücken Sie die Eingabetaste, wählen Sie dann <Keyword command="ARRAYRECT" id="COUnt" />, `9` Spalten und `1` Zeile, und <Keyword command="ARRAYRECT" id="Spacing" />, `28` zwischen den Spalten und `1` zwischen den Zeilen, was bei einer einzigen Zeile nichts bewirkt. <Keyword command="ARRAYRECT" id="eXit" /> behält es als assoziatives Muster, das sich später über seine Griffe bearbeiten lässt.

### Den Pfeil zeichnen [#arrow]

<Command id="PLINE" /> von `14,50`, entlang des Laufs bis `226,0` weiter; dann <Keyword command="PLINE" id="Width" />, `10` am Anfang und `0` am Ende, und ein letztes Segment von `24,0`: die Pfeilspitze. Die Eingabetaste beendet sie.

### Bemaßen [#dimensions]

Auf dem Layer Bemaßung: <Command id="DIMLINEAR" /> dreimal: die Länge unten, die Breite rechts und eine Trittstufe, 28, oben.
