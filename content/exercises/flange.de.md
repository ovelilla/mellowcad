---
title: "AutoCAD-Übung: ein Flansch"
metaTitle: "AutoCAD-Übung Maschinenbau 2D: ein Flansch"
description: "Einen Flansch in AutoCAD zeichnen: Bohrung mit gestutzter Passfedernut, acht Löcher als polares Muster, Mittellinien und Durchmesser, Schritt für Schritt."
figure: "Der Flansch, 140 Durchmesser, mit Passfedernut, acht Löchern und den Durchmessern."
sourceHash: "32f94d57ae25"
---

Zeichnen Sie diesen Flansch, in Millimetern: 140 Durchmesser, eine Bohrung von 60 mit einer 16 breiten Passfedernut, deren Oberkante 36 vom Mittelpunkt entfernt ist, acht Löcher von 14 auf einem Teilkreis von 110 und seine Mittellinien. Die Passfedernut ist ein Rechteck, das in die Bohrung gestutzt wird; die Löcher sind ein Kreis und ein polares Muster.

## Steps

### Die Kreise zeichnen [#circles]

Auf dem Layer Kontur zwei Kreise in `0,0`, jeder mit seinem <Keyword command="CIRCLE" id="Diameter" />: `140` und `60`.

### Die Passfedernut ausschneiden [#keyway]

<Command id="RECTANG" /> von `-8,20` bis `16,16` weiter: Es durchquert die Bohrung. <Command id="TRIM" /> schneidet ein Objekt dort, wo die anderen es kreuzen: Wählen Sie den Bogen der Bohrung zwischen den Seiten des Rechtecks, dann die Unterkante des Rechtecks, innerhalb der Bohrung. Übrig bleibt die Passfedernut, mit ihren zwei Seiten und ihrer Oberkante.

### Die Löcher anordnen [#holes]

Ein Loch auf dem Teilkreis: ein Kreis in `55<22.5`, 55 vom Ursprung unter 22,5°, mit einem <Keyword command="CIRCLE" id="Diameter" /> von `14`. <Command id="ARRAYPOLAR" />: Wählen Sie ihn, drücken Sie die Eingabetaste und geben Sie den Mittelpunkt an, `0,0`; <Keyword command="ARRAYPOLAR" id="ASsociative" /> und <Keyword command="ARRAYPOLAR" id="No" /> lassen acht getrennte Kreise, die eine Bemaßung wählen kann, und <Keyword command="ARRAYPOLAR" id="Items" />, `8`, verteilt sie auf den ganzen Kreis. Dann, auf dem Layer Mittellinien, der Teilkreis in `0,0`, sein Durchmesser `110`.

### Die Mittellinien zeichnen [#centreLines]

Weiter auf Mittellinien zwei Linien mit <Command id="LINE" /> durch den Mittelpunkt, 156 lang: von `-78,0`, `156,0` waagerecht; von `0,-78`, `0,156` senkrecht.

### Bemaßen [#dimensions]

Auf dem Layer Bemaßung: <Command id="DIMDIAMETER" /> auf die Bohrung, ein Loch, den Teilkreis und die Kontur, jeweils dort gewählt, wo noch keine Bemaßung sie kreuzt, dann <Command id="DIMLINEAR" /> über die Oberkante der Passfedernut: 16.
