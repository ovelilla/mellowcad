---
title: "Befehl BEMLINEAR (DIMLINEAR) in AutoCAD"
description: "Wie BEMLINEAR (DIMLINEAR, Alias BMLIN) in AutoCAD bemaßt: zwei Ursprünge oder ein Objekt, dann die Maßlinie, horizontal oder vertikal."
figure: "Ein Rechteck, zweimal bemaßt: seine Oberkante durch ihre zwei Ecken, seine rechte Kante durch die Eingabetaste und eine Auswahl darauf."
sourceHash: "e48a0a6f18c9"
---

BEMLINEAR (DIMLINEAR) misst den Abstand zwischen zwei Punkten entlang X oder entlang Y und zeichnet ihn als Bemaßung: zwei Maßhilfslinien, eine Maßlinie mit ihren Pfeilspitzen und das Maß darüber. Sie geben den ersten und den zweiten Ursprung der Maßhilfslinien an, dann die Lage der Maßlinie, und die Lage der Maßlinie bestimmt die Richtung, wie in AutoCAD: über oder unter den beiden Punkten wird horizontal gemessen, daneben vertikal. Drücken Sie stattdessen bei der ersten Eingabeaufforderung die Eingabetaste und wählen Sie eine Linie, einen Bogen, ein Polyliniensegment oder einen Kreis: Seine zwei Enden oder der Durchmesser des Kreises sind die Ursprünge. Die Befehlszeile meldet dann das Maß, und der Befehl endet.

Die Bemaßung wird im aktuellen Bemaßungsstil gezeichnet, in einer neuen Zeichnung ISO-25: ein Komma für Dezimalstellen und keine nachgestellten Nullen, wie AutoCAD sie in metrischen Zeichnungen schreibt. <Command id="DIMHORIZONTAL" />, <Command id="DIMVERTICAL" /> und <Command id="DIMROTATED" />, nur eingegeben, sind BEMLINEAR, auf eine Richtung festgelegt.

## Options

### Text

Fragt nach dem Text, der anstelle des Maßes geschrieben wird, das als Vorgabe angeboten wird: Die Eingabetaste behält das Maß. In dem, was Sie eingeben, steht `<>` für das Maß, `<> mm` schreibt es also gefolgt von seiner Einheit.

### Angle

Fragt nach dem Winkel des Texts, der dann in diesem Winkel statt entlang der Maßlinie gezeichnet wird. 0 legt ihn wieder entlang der Linie.

### Horizontal

Misst entlang X, egal wo Sie die Maßlinie platzieren, die horizontal bleibt; die Eingabeaufforderung bietet dann nur <Keyword id="Text" /> und <Keyword id="Angle" />.

### Vertical

Misst entlang Y, egal wo Sie die Maßlinie platzieren, die vertikal bleibt.

### Rotated

Fragt nach dem Winkel der Maßlinie, standardmäßig `0`, und misst den Abstand zwischen den Ursprüngen in dieser Richtung. An einer schrägen Kante ergibt ihr eigener Winkel ihre Länge, wie <Command id="DIMALIGNED" /> es tut.

## Missing

Mtext: Der Text einer Bemaßung ist eine Zeile, in der Befehlszeile mit <Keyword id="Text" /> festgelegt, nie im Texteditor. Bei einem mit <Keyword id="Angle" /> gesetzten Winkel zentriert AutoCAD den Text auf der Maßlinie; hier bleibt er darüber, wie ohne einen. Eine Bemaßung ist nicht assoziativ: Sie folgt dem Objekt, das sie misst, nicht.

## Questions

### Wie lautet das Kürzel für BEMLINEAR (DIMLINEAR) in AutoCAD?

`BMLIN`, dann die Eingabetaste oder die Leertaste. Der vollständige Name funktioniert ebenfalls, ebenso `_DIMLINEAR` in jeder Sprache von AutoCAD.

### Welche Bemaßungsbefehle gibt es in AutoCAD?

<Command id="DIMLINEAR" /> für horizontale und vertikale Abstände, <Command id="DIMALIGNED" /> für einen Abstand entlang einer schrägen Kante, <Command id="DIMRADIUS" /> und <Command id="DIMDIAMETER" /> für Bögen und Kreise, <Command id="DIMANGULAR" /> für Winkel, <Command id="DIMCONTINUE" /> und <Command id="DIMBASELINE" /> für Ketten, <Command id="DIMSPACE" />, um ihren Abstand anzugleichen, und <Command id="DIMSTYLE" /> für ihr Aussehen. DIM von AutoCAD, das jede Art mit einer Eingabeaufforderung erzeugt, und QDIM, das viele Objekte auf einmal bemaßt, gibt es in MellowCAD noch nicht.

### Warum folgt die Bemaßung dem Objekt nicht, wenn ich es ändere?

Die Bemaßungen von MellowCAD sind noch nicht assoziativ, wie <Message id="nonAssociativeDimension" /> meldet: Eine Bemaßung behält die Punkte, die ihr gegeben wurden. Strecken Sie sie gemeinsam: Fangen Sie das Ende, das Sie verschieben, und den Ursprung der Bemaßung dort in einem Kreuzen-Fenster von <Command id="STRETCH" />, und das Maß wird neu berechnet; oder ziehen Sie den Griff des Ursprungs an seine neue Stelle.

### Wie ändere ich die Größe von Bemaßungstext und Pfeilen?

Im Bemaßungsstil, wie in AutoCAD: <Command id="DIMSTYLE" /> (`D`) öffnet die Bemaßungsstile, hier in der Palette Stile, wo AutoCAD den Bemaßungsstil-Manager hat. Dort werden Texthöhe, Pfeilgröße, Gesamtskalierung und Dezimalstellen des aktuellen Stils festgelegt, und jede Bemaßung in diesem Stil übernimmt sie.
