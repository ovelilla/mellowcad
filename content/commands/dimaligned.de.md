---
title: "Befehl BEMAUSG (DIMALIGNED) in AutoCAD: ausgerichtet bemaßen"
metaTitle: "Befehl BEMAUSG (DIMALIGNED) in AutoCAD"
description: "Wie BEMAUSG (DIMALIGNED, Alias BMA) in AutoCAD den wahren Abstand zweier Punkte bemaßt: schräge Kanten, Text und Winkel. Zum Testen im Browser."
figure: "Die schräge Seite eines Dreiecks, entlang ihrer Länge bemaßt: ihre beiden Enden, dann die Stelle der Maßlinie."
sourceHash: "243f7657ed7d"
---

BEMAUSG (DIMALIGNED) misst den wahren Abstand zwischen zwei Punkten: Seine Maßlinie verläuft parallel zur Linie durch sie, in jedem Winkel, wo <Command id="DIMLINEAR" /> nur entlang X oder Y misst. Seine Eingabeaufforderungen sind die von <Command id="DIMLINEAR" />: der Ursprung der ersten und der zweiten Maßhilfslinie, oder die Eingabetaste und eine Wahl auf einer Linie, einem Bogen oder einem Polyliniensegment für seine beiden Enden, dann die Lage der Maßlinie, auf einer der beiden Seiten. Ein gewählter Kreis ergibt seinen Durchmesser durch den gewählten Punkt. Die Befehlszeile nennt das Maß, und der Befehl endet.

## Options

### Text

Fragt nach dem Text, der statt des Maßes geschrieben werden soll, das er als Vorgabe anbietet: Die Eingabetaste behält das Maß. In dem, was Sie eingeben, steht `<>` für das Maß.

### Angle

Fragt nach dem Winkel des Textes, der dann in diesem Winkel statt entlang der Maßlinie gezeichnet wird. 0 setzt ihn wieder entlang der Linie.

## Missing

Mtext: Der Text einer Bemaßung ist eine Zeile, mit <Keyword id="Text" /> in der Befehlszeile festgelegt, nie im Texteditor. Bei einem mit <Keyword id="Angle" /> festgelegten Winkel zentriert AutoCAD den Text auf der Maßlinie; hier bleibt er darüber, wie ohne einen. Eine Bemaßung ist nicht assoziativ: Sie folgt dem Objekt, das sie misst, nicht.

## Questions

### Wie lautet das Alias von BEMAUSG (DIMALIGNED) in AutoCAD?

`BMA`, dann die Eingabetaste oder die Leertaste. Der volle Name funktioniert ebenfalls, und `_DIMALIGNED` in jeder Sprache von AutoCAD.

### Was ist der Unterschied zwischen BEMLINEAR und BEMAUSG?

An einer schrägen Kante gibt <Command id="DIMLINEAR" /> ihre Breite oder ihre Höhe an, je nachdem, ob seine Maßlinie waagerecht oder senkrecht ist; BEMAUSG gibt ihre Länge an, mit der Linie parallel zur Kante. An einer Kante entlang X oder Y geben beide dieselbe Zahl.

### Wie bemaßt man eine schräge Linie in AutoCAD?

Mit BEMAUSG: Drücken Sie die Eingabetaste bei der ersten Eingabeaufforderung, wählen Sie die Linie und platzieren Sie die Bemaßung auf der gewünschten Seite. Oder wählen Sie ihre beiden Enden, mit dem Objektfang Endpunkt, damit die Ursprünge exakt sind.

### Wie schreibt man einen eigenen Text auf eine Bemaßung?

Wählen Sie <Keyword id="Text" /> vor dem Platzieren und geben Sie den Text ein: `<>` steht für das Maß, `<> mm` schreibt es also gefolgt von seiner Einheit, und die Eingabetaste ohne Eingabe behält das Maß allein. Nach dem Platzieren ändert die Textüberschreibung der Eigenschaftenpalette es.
