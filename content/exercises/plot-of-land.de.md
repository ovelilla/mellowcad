---
title: "AutoCAD-Übung: ein Grundstück"
metaTitle: "AutoCAD-Übung Vermessung: Grundstücksfläche"
description: "Ein Grundstück in AutoCAD aus Länge und Winkel seiner Seiten mit Polarkoordinaten zeichnen, dann seine Fläche messen und es bemaßen. Schritt für Schritt."
figure: "Ein Grundstück mit fünf Seiten, in Metern, mit der Bemaßung jeder Seite und eines Winkels."
sourceHash: "f5542a75eef7"
---

Zeichnen Sie dieses Grundstück, in Metern, aus Länge und Richtung seiner Seiten: 40 unter 0°, 30 unter 80°, 35 unter 155° und 25 unter 230°, dann zurück zum Anfang. Messen Sie seine Fläche und seinen Umfang und bemaßen Sie jede Seite und den Winkel an der zweiten Ecke. Mit Polarkoordinaten, also Länge und Winkel, wird jede Seite vom Ende der vorigen aus gezeichnet. Der Bemaßungsmaßstab der Zeichnung ist für Meter eingestellt.

## Steps

### Die Grenze zeichnen [#boundary]

Auf dem Layer Kontur: <Command id="PLINE" /> von `0,0`, dann jede Seite als ihre Länge und ihr Winkel: `40<0`, `30<80`, `35<155` und `25<230`, jeweils vom letzten Punkt aus gemessen. <Keyword command="PLINE" id="Close" /> zeichnet die fünfte Seite und schließt die Grenze: ein einziges Objekt, das <Command id="AREA" /> messen kann.

### Die Fläche messen [#area]

<Command id="AREA" />, dann <Keyword command="AREA" id="Object" />, und wählen Sie die Grenze: Die Befehlszeile nennt ihre Fläche, in Quadratmetern, und ihren Umfang.

### Bemaßen [#dimensions]

Auf dem Layer Bemaßung: <Command id="DIMALIGNED" /> und die Eingabetaste bei der ersten Eingabeaufforderung: Danach fragt der Befehl nach einem Objekt, und ein Klick auf eine Seite bemaßt diese Seite, parallel zu ihr. Platzieren Sie jede außerhalb des Grundstücks. <Command id="DIMANGULAR" /> auf die beiden Seiten, die sich in `40,0` treffen, liefert den Winkel zwischen ihnen, 100°.
