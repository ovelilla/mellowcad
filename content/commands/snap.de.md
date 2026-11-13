---
title: "Befehl FANG (SNAP) in AutoCAD: Fangmodus und Raster"
metaTitle: "Befehl FANG (SNAP) in AutoCAD"
description: "Wie FANG (SNAP) in AutoCAD das Fadenkreuz an ein Raster bindet: F9, Fangabstand, Seitenverhältnis und der Unterschied zum Objektfang. Zum Testen im Browser."
figure: "FANG 10 bei eingeschaltetem Raster, dann LINIE abseits des Gitters gewählt: Jeder Punkt landet darauf, und das Fadenkreuz auch."
sourceHash: "a1089484f2f1"
---

Der Fangmodus bindet das Fadenkreuz an ein Gitter: Jede Wahl landet auf dem nächsten seiner Punkte, sodass bei einem Abstand von 10 ein Klick bei 13,7 zu 10,10 wird. Das Gitter ist das des aktuellen BKS, von dessen Ursprung entlang seiner Achsen. F9 schaltet den Fangmodus ein und aus und schreibt `<Fang ein>` oder `<Fang aus>`, ebenso seine Schaltfläche in der Statusleiste. Nur Wahlen werden gerundet: Eine eingegebene Koordinate gilt, wie eingegeben, und ein Objektfang geht dem Gitter vor. Das Raster (F7) zeichnet ein eigenes Gitter und zeigt es, ob der Fang ein- oder ausgeschaltet ist.

Der Befehl FANG stellt den Abstand ein: Geben Sie ihn ein, oder geben Sie zwei Punkte in diesem Abstand an, und der Fangmodus schaltet sich damit in X und Y ein. Die Eingabetaste schaltet ihn ein, wie er ist. Ein Abstand von 0 oder darunter wird mit <Message id="positiveNonzero" /> abgelehnt. Mit einem Apostroph eingegeben, `'FANG`, funktioniert er innerhalb eines anderen Befehls. Der Fangmodus und sein Abstand werden mit der Zeichnung gespeichert, und `Z` nimmt ein FANG zurück.

Das Menü „Fang“ der Statusleiste wählt stattdessen den Polarfang: Entlang eines Spurverfolgungspfads geht das Fadenkreuz in Schritten von POLARDIST oder, solange POLARDIST 0 ist, vom X-Abstand des Fangs.

## Options

### ON

Schaltet den Fangmodus mit dem aktuellen Abstand ein, wie es die Eingabetaste tut.

### OFF

Schaltet den Fangmodus aus; der Abstand bleibt erhalten.

### Aspect

Fragt nach einem horizontalen Abstand, dann nach einem vertikalen, und schaltet den Fangmodus ein: ein Gitter, das höher oder breiter als quadratisch ist. Die Vorgabe der Eingabeaufforderung ist dann Aspect, sodass die Eingabetaste sie erneut abfragt.

## Missing

Style, der isometrische Fang, und Type, Raster oder Polar, bei der Eingabeaufforderung: Das Menü der Statusleiste wählt den Typ. Legacy, das verborgene Rotate (SNAPANG) und SNAPBASE. Ein negatives POLARDIST, das der Polarfang von AutoCAD als seine Größe nimmt: −10 geht in Schritten von 10.

## Questions

### Wie lautet das Alias von FANG (SNAP) in AutoCAD?

F9 schaltet den Fangmodus ein und aus. Der Befehl ist `F`, dann die Eingabetaste oder die Leertaste, um den Abstand einzustellen; der volle Name funktioniert ebenfalls, und `_SNAP` in jeder Sprache von AutoCAD.

### Was ist der Unterschied zwischen FANG und OFANG?

Der Fangmodus rundet das Fadenkreuz auf ein Gitter von Punkten im Raum. Objektfänge (F3) binden es an Punkte auf Objekten, Endpunkte, Mittelpunkte, Mittelpunkte von Kreisen. Sie arbeiten zusammen, und ein Objektfang geht vor, wo beide einen Punkt finden.

### Warum springt mein Fadenkreuz in Schritten?

Der Fangmodus ist eingeschaltet: Drücken Sie F9 oder die Fang-Schaltfläche der Statusleiste, um ihn auszuschalten. Stellen Sie mit FANG einen kleineren Abstand ein, wenn Sie feinere Schritte wollen.

### Wie stellt man unterschiedliche Fangabstände für X und Y ein?

Starten Sie FANG, wählen Sie <Keyword id="Aspect" /> und geben Sie den horizontalen Abstand an, dann den vertikalen.

### Gibt es einen isometrischen Fang?

Noch nicht: Die Option Style von FANG, die das Gitter für isometrisches Zeichnen dreht, wird nicht angeboten.
