---
title: "AutoCAD-Übung: eine Dichtung"
metaTitle: "AutoCAD-Übung für Anfänger: eine Dichtung"
description: "Eine Dichtung in AutoCAD zeichnen: abgerundete Platte, Bohrung, vier von einem kopierte Löcher, Mittellinien und Bemaßung, Schritt für Schritt."
figure: "Die Dichtung, 120 mal 80, bemaßt."
sourceHash: "dc5c0e2b45b8"
---

Zeichnen Sie diese Dichtung, in Millimetern: eine Platte 120 mal 80 mit auf den Radius 10 gerundeten Ecken, eine Bohrung von 40 in der Mitte und vier Löcher von 10, deren Mittelpunkte 12 von den Kanten entfernt sind, mit den Mittellinien der Bohrung und der Bemaßung. Alles wird eingegeben: Der erste Punkt eines Befehls steht dort, wo Sie ihn eingeben, und jeder weitere Punkt wird vom letzten aus gemessen. Kontur, Mittellinien und Bemaßung kommen jeweils auf ihren eigenen Layer.

## Steps

### Die Kontur zeichnen [#outline]

Machen Sie Kontur im Layer-Steuerelement zum aktuellen Layer. <Command id="RECTANG" /> zeichnet die Platte in einem Zug: Wählen Sie <Keyword command="RECTANG" id="Fillet" /> und geben Sie den Radius ein, `10`, dann die erste Ecke, `0,0`, und die andere Ecke, `120,80`, vom ersten Punkt aus gemessen.

### Die Bohrung zeichnen [#bore]

<Command id="CIRCLE" /> in der Mitte der Platte, `60,40`: Wählen Sie <Keyword command="CIRCLE" id="Diameter" /> und geben Sie `40` ein.

### Die Löcher kopieren [#holes]

Zeichnen Sie ein Loch, einen Kreis in `12,12` mit einem <Keyword command="CIRCLE" id="Diameter" /> von `10`, und kopieren Sie es dann mit <Command id="COPY" />: Wählen Sie den Kreis, drücken Sie die Eingabetaste, nehmen Sie seinen Mittelpunkt, `12,12`, als Basispunkt und geben Sie ein, wohin jede Kopie von dort aus kommt: `96,0`, dann `96,56`, dann `0,56`. Die Eingabetaste beendet die Kopien.

### Die Mittellinien zeichnen [#centreLines]

Machen Sie Mittellinien aktuell. Zwei Linien mit <Command id="LINE" /> kreuzen sich im Mittelpunkt der Bohrung und stehen 6 über ihren Rand hinaus: von `60,14`, `0,52` senkrecht; von `34,40`, `52,0` waagerecht. Die Eingabetaste beendet jede.

### Bemaßen [#dimensions]

Machen Sie Bemaßung aktuell. <Command id="DIMLINEAR" /> nimmt zwei Punkte und dann, wohin die Maßlinie kommt: die Länge von `0,10` bis `120,0` weiter, unten platziert; die Höhe rechts; den Lochabstand, 96 und 56. Ein bei den Eingabeaufforderungen eingegebener Punkt berührt kein Objekt, daher wird jede dieser Bemaßungen nicht assoziativ erstellt, und die Befehlszeile sagt es. <Command id="DIMDIAMETER" /> wählt einen Kreis und platziert seinen Durchmesser: den der Bohrung, dann den eines Lochs.
