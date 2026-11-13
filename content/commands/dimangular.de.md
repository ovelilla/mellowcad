---
title: "Befehl BEMWINKEL (DIMANGULAR) in AutoCAD"
description: "So bemaßt AutoCADs BEMWINKEL (DIMANGULAR, Alias BMWIN) Winkel: zwei Linien, ein Bogen, ein Kreis oder drei Punkte, dann die Lage des Bogens."
figure: "Zwei Linien, die sich unter 30 Grad treffen: jede Linie gewählt, dann der Bemaßungsbogen dazwischen platziert."
sourceHash: "30943abd60f6"
---

BEMWINKEL (DIMANGULAR) bemaßt einen Winkel mit einem Bogen als Maßlinie. Was Sie zuerst wählen, entscheidet über den Rest, wie in AutoCAD: Eine Linie verlangt eine zweite Linie, auch zwei Segmente einer Polylinie; ein Bogen wird von Ende zu Ende um seinen Mittelpunkt gemessen; ein Kreis vom gewählten Punkt darauf bis zu einem zweiten Punkt, den Sie angeben; und die Eingabetaste verlangt stattdessen den Scheitelpunkt des Winkels, dann seine beiden Endpunkte. Platzieren Sie dann den Bogen: Die Lage des Bogens bestimmt den gemessenen Winkel. Zwischen zwei Linien ist es der ihrer vier Sektoren, der ihn enthält; sonst der Winkel oder, über seine Schenkel hinweg, der überstumpfe Winkel über 180°. Die Befehlszeile meldet das Maß in Grad, und der Befehl endet.

## Options

### Text

Fragt nach dem Text, der statt des Maßes geschrieben werden soll, das als Vorgabe angeboten wird: Die Eingabetaste behält das Maß. In dem, was Sie eingeben, steht `<>` für das Maß.

### Angle

Fragt nach dem Winkel des Textes, der dann in diesem Winkel gezeichnet wird statt entlang des Bemaßungsbogens. 0 setzt ihn wieder entlang des Bogens.

## Missing

Mtext: Der Text einer Bemaßung ist eine Zeile, festgelegt mit <Keyword id="Text" /> in der Befehlszeile. Quadrant, der die Bemaßung auf einen Sektor festlegt, sodass ihr Text außerhalb stehen kann. Winkeleinheiten außer Dezimalgrad (DIMAUNIT). Eine Winkelbemaßung lässt sich nicht verketten oder verteilen: <Command id="DIMCONTINUE" />, <Command id="DIMBASELINE" /> und <Command id="DIMSPACE" /> nehmen nur lineare und ausgerichtete. Eine Linie oder ein Bogen in einer Blockreferenz lässt sich nicht wählen. Zwischen zwei Linien behält die Bemaßung die Punkte, an denen ihr Bogen sie getroffen hat, nicht die Linien: Später verschoben, behält ihr Bogen von dort aus seine Maßhilfslinien, wo AutoCAD wieder gegen die Linien misst. Eine Bemaßung ist nicht assoziativ: Sie folgt den Objekten, die sie misst, nicht.

## Questions

### Wie lautet das Kürzel für BEMWINKEL (DIMANGULAR) in AutoCAD?

`BMWIN`, danach Eingabetaste oder Leertaste. Auch der vollständige Name funktioniert, ebenso `_DIMANGULAR` in jeder Sprache von AutoCAD.

### Wie bemaße ich einen Winkel größer als 180 Grad?

Drücken Sie bei der ersten Eingabeaufforderung die Eingabetaste, geben Sie den Scheitelpunkt und die beiden Endpunkte an und platzieren Sie dann den Bogen außerhalb des Winkels zwischen ihnen: Er misst den überstumpfen Winkel, 360° minus den anderen. Ein Bogen oder ein Kreis funktioniert genauso. Zwischen zwei Linien ist der Winkel immer unter 180°.

### Wie bemaße ich den Winkel eines Bogens?

Wählen Sie den Bogen bei der ersten Eingabeaufforderung: Sein Mittelpunkt ist der Scheitelpunkt und seine Enden die Ursprünge der Maßhilfslinien, sodass die nächste Frage schon lautet, wo die Bemaßung platziert werden soll.

### Warum meldet BEMWINKEL, die Linien seien parallel?

Zwei parallele Linien, oder dieselbe Linie zweimal gewählt, ergeben keinen Winkel: <Message id="dimLinesParallel" />, und der Befehl endet.

### Wie ändere ich die Dezimalstellen einer Winkelbemaßung?

Im Bemaßungsstil: <Command id="DIMSTYLE" /> (`D`) öffnet ihn in der Palette Stile, wo die Winkelgenauigkeit der Primäreinheiten sie festlegt, 0 in ISO-25. Jede Winkelbemaßung in diesem Stil folgt ihr.
