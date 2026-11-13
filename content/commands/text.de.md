---
title: "Befehl TEXT (DTEXT) in AutoCAD: einzeiliger Text"
description: "Wie TEXT (Alias DT) in AutoCAD einzeiligen Text schreibt, Schritt für Schritt: Startpunkt, Höhe und Drehung, Ausrichten und Stil, ein Objekt je Zeile."
figure: "Zwei Zeilen einzeiligen Textes, zentriert in einem Kasten, mit Mitte Mitte ausgerichtet: jede Zeile ein eigenes Objekt."
sourceHash: "44d0e1a420a7"
---

TEXT schreibt einzeiligen Text. Sie geben einen Startpunkt, eine Höhe und einen Drehwinkel an, geben dann eine Zeile ein und drücken die Eingabetaste: Die Zeile wird zu einem eigenen Objekt, und die nächste beginnt eine Zeile darunter. Eine leere Zeile beendet den Befehl. Ein Klick an anderer Stelle davor beginnt die nächsten Zeilen an diesem Punkt, und Esc behält die schon eingegebenen Zeilen und verwirft die gerade getippte. Für einen Absatz, der auf eine Breite umbricht, als ein Objekt, verwenden Sie <Command id="MTEXT" />.

Die erste Zeile nennt den aktuellen Stil, die Höhe und die Ausrichtung. Die Höhe ist die, die er mit <Command id="MTEXT" /> und <Command id="ATTDEF" /> teilt, in der Zeichnung gehalten, und das nächste TEXT bietet sie als Vorgabe an; ein Stil mit eigener Höhe überspringt die Eingabeaufforderung der Höhe. Die Eingabetaste beim Startpunkt macht unter der letzten Zeile weiter, die TEXT geschrieben hat, ohne Höhe oder Winkel erneut abzufragen. `Z` nimmt den ganzen Durchlauf zurück.

## Options

### Justify

Fragt, woran der Text an seinem Punkt hängt: <Keyword id="Left" /> (die Vorgabe), <Keyword id="Center" />, <Keyword id="Right" />, <Keyword id="Middle" /> oder einer von neun Punkten, oben, Mitte und unten nach links, Mitte und rechts, wie die Eingabeaufforderung sie auflistet. Die Eingabeaufforderung des Startpunkts fragt dann nach dem Punkt, den die Ausrichtung benennt: bei Mitte Mitte der Mittelpunkt. Wie in AutoCAD werden die neun auch unaufgeführt bei der ersten Eingabeaufforderung angenommen, sodass die Eingabe der Buchstaben für Mitte Mitte dort sofort nach dem Mittelpunkt fragt. Die Ausrichtung wird in der Zeichnung für das nächste TEXT behalten.

### Style

Fragt nach dem Namen des Textstils, der aktuell werden soll, wobei die Eingabetaste den vorhandenen behält. <Keyword id="?" /> listet die Stile der Zeichnung auf; ein Name, den die Zeichnung nicht hat, wird abgelehnt und erneut abgefragt. Stile werden in der Palette angelegt, die <Command id="STYLE" /> öffnet.

## Missing

Die Ausrichtungen Ausrichten und Einpassen. <Keyword id="?" /> von Stil listet alle Stile auf einmal auf, ohne zu fragen, welche, und ohne Seite für Seite anzuhalten. Der Text wird im Feld der dynamischen Eingabe getippt, nicht mit einer Einfügemarke in der Zeichnung, und sein Wortlaut lässt sich in der Eigenschaftenpalette nicht neu eingeben, der außerdem die Zeilen Annotativ, Breitenfaktor, Schrägstellung, Kopfstehend und Rückwärts fehlen. Ein Klick in den Kasten eines Textes wählt ihn auch abseits seiner Buchstaben, wo AutoCAD nichts wählt.

## Questions

### Wie lautet das Alias von TEXT in AutoCAD?

`DT`, dann die Eingabetaste oder die Leertaste; `DTEXT` und `TEXT` funktionieren ebenfalls, und `_TEXT` in jeder Sprache von AutoCAD. `T` gehört nicht zu TEXT: Es startet <Command id="MTEXT" />, mehrzeiligen Text.

### Wie richtet man Text in AutoCAD aus?

Wählen Sie <Keyword id="Justify" /> bei der ersten Eingabeaufforderung, oder geben Sie dort die Buchstaben der Ausrichtung ein, und geben Sie dann den Punkt an, den sie benennt: Mitte Mitte setzt die Mitte jeder Zeile auf ihren Punkt, wie eine Beschriftung in die Mitte eines Kastens gehört. Um den Text entlang einer schrägen Linie laufen zu lassen, geben Sie diesen Winkel bei der Eingabeaufforderung der Drehung ein.

### Was ist der Unterschied zwischen TEXT und MTEXT?

TEXT erzeugt ein Objekt je Zeile, jedes für sich verschoben, bearbeitet und ausgerichtet, und bricht nie um. <Command id="MTEXT" /> erzeugt ein Objekt aus Absätzen, die auf die Breite eines Kastens umbrechen, als Ganzes ausgerichtet. Beide teilen die Texthöhe und die Textstile.

### Wie bearbeitet man Text in AutoCAD?

Doppelklicken Sie ihn: <Command id="TEXTEDIT" /> öffnet ihn zum Neueingeben und fragt dann nach dem nächsten zu bearbeitenden Text, bis Sie Esc drücken. Seine Höhe und Drehung sind Zeilen der Eigenschaftenpalette, und seine Griffe verschieben ihn.
