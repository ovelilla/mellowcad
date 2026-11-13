---
title: "Befehl ATTDEF in AutoCAD"
description: "Wie ATTDEF (Alias AD) in AutoCAD ein Blockattribut definiert: Modi, Tag, Eingabeaufforderung und Vorgabewert, dann der Ort des Textes. Zum Testen im Browser."
figure: "Ein Türschild: das Attribut NUM zentriert in einem Kreis, seine Eingabeaufforderung das Tag selbst und sein Vorgabewert 1, bereit, einem Block beizutreten."
sourceHash: "f0fc3d8763e7"
---

ATTDEF definiert ein Attribut: ein Tag, eine Eingabeaufforderung und einen Vorgabewert, als Textzeile in der Zeichnung platziert. Wählen Sie es zusammen mit den anderen Objekten, wenn Sie mit <Command id="BLOCK" /> einen Block erstellen, und jeder Verweis auf diesen Block trägt dafür einen eigenen Wert: die Nummer einer Tür, den Code eines Bauteils, den Namen eines Raums. Bis dahin zeigt die Definition ihr Tag.

AutoCADs ATTDEF öffnet den Dialog „Attributdefinition“, den MellowCAD nicht hat: Hier fragt ATTDEF in der Befehlszeile das, was <Command id="-ATTDEF" /> fragt, wie die Konsole von AutoCAD. Er nennt die aktuellen Modi und fragt, welcher geändert werden soll, bis die Eingabetaste weitergeht. Dann das Tag: ohne Leerzeichen, da ein Leerzeichen es beendet, und Kleinbuchstaben werden zu Großbuchstaben; die Eingabetaste allein meldet <Message id="tagCannotBeNull" />. Dann die Eingabeaufforderung, mit der <Command id="INSERT" /> den Wert abfragt, wobei die Eingabetaste das Tag übernimmt, und der Vorgabewert. Zuletzt der Ort des Textes, mit den Fragen von <Command id="TEXT" />: ein Startpunkt, die Höhe und die Drehung. Die Höhe und die Ausrichtung sind die von TEXT, in beide Richtungen geteilt. Die Eingabetaste beim Startpunkt setzt die Definition eine Zeile unter die zuletzt definierte, mit deren Höhe, Drehung, Stil und Ausrichtung, sodass die Attribute eines Blocks untereinander stehen.

## Options

### Invisible

Der Wert wird in den Verweisen nicht angezeigt, bis <Command id="ATTDISP" /> ihn einschaltet. Jeder Modus ist ein Schalter: Seine Wahl wechselt ihn zwischen `Y` und `N`, schreibt die Modi erneut und fragt noch einmal. Die Modi bleiben für das nächste ATTDEF eingestellt.

### Constant

Jeder Verweis trägt denselben Wert, den ATTDEF anstelle einer Eingabeaufforderung und eines Vorgabewerts abfragt; INSERT fragt ihn nie ab.

### Verify

INSERT fragt den Wert ein zweites Mal ab, zur Kontrolle, nachdem es jeden Wert einmal abgefragt hat.

### Preset

INSERT fragt den Wert nicht ab: Jeder Verweis übernimmt den Vorgabewert.

### Lock position

Zunächst ein: Das Attribut bleibt dort, wo der Block es hinsetzt.

### Justify

Fragt, woran der Text an seinem Punkt hängt, wie TEXT es tut: <Keyword id="Left" />, <Keyword id="Center" />, <Keyword id="Right" />, <Keyword id="Middle" /> oder einer der neun Punkte nach oben, Mitte und unten, links, Mitte und rechts. Die Eingabeaufforderung des Startpunkts fragt dann nach dem Punkt, den sie benennt: Mitte Mitte zentriert den Wert in einem Tag.

### Style

Fragt nach dem Textstil, der verwendet werden soll und zum aktuellen wird; <Keyword id="?" /> listet die Stile der Zeichnung auf.

## Missing

Der Dialog „Attributdefinition“: ATTDEF fragt in der Befehlszeile. Die Modi Annotativ und Mehrere Zeilen, die AutoCAD 2027 nach Position sperren aufführt, und die Zeilen eines mehrzeiligen Attributs. Felder, die Ausrichtungen Ausrichten und Einpassen und die Frage von Style `?`, welche Stile aufgelistet werden sollen.

## Questions

### Wie lautet das Alias von ATTDEF in AutoCAD, und wie heißt der Befehl auf Deutsch?

Der Befehl heißt auch im deutschen AutoCAD ATTDEF. Die Aliase sind `AD` und `DDATTDEF`, dann die Eingabetaste oder die Leertaste. `-ATTDEF` ist <Command id="-ATTDEF" />, die Befehlszeilenform, die ATTDEF hier ebenfalls ausführt. `_ATTDEF` funktioniert in jeder Sprache von AutoCAD.

### Wie erstellt man in AutoCAD einen Block mit Attributen?

Zeichnen Sie das Symbol, starten Sie dann ATTDEF für jedes Attribut und setzen Sie seinen Text dorthin, wo der Wert erscheinen soll. Starten Sie <Command id="BLOCK" />, wählen Sie einen Basispunkt und wählen Sie das Symbol und die Attribute, in der Reihenfolge, in der INSERT sie abfragen soll. Jedes <Command id="INSERT" /> des Blocks fragt dann für jedes Attribut einen Wert ab und bietet dessen Vorgabewert an.

### Was ist der Unterschied zwischen Tag, Eingabeaufforderung und Vorgabewert?

Das Tag benennt das Attribut als Bezeichner: Es ist das, was die Definition zeigt, und die Beschriftung des Feldes in <Command id="EATTEDIT" />. Die Eingabeaufforderung ist die Frage, mit der INSERT seinen Wert abfragt. Der Vorgabewert ist der angebotene Wert, den die Eingabetaste übernimmt.

### Wie bearbeitet man eine Attributdefinition?

Doppelklicken Sie sie, bevor sie einem Block beitritt: <Command id="TEXTEDIT" /> öffnet ihr Tag, ihre Eingabeaufforderung und ihren Vorgabewert. Sobald sie in einem Block ist, werden die Werte jedes Verweises mit <Command id="ATTEDIT" /> oder <Command id="EATTEDIT" /> bearbeitet.
