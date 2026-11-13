---
title: "Befehl REIHEKREIS (ARRAYPOLAR) in AutoCAD"
description: "Wie REIHEKREIS (ARRAYPOLAR) in AutoCAD Objekte kreisförmig um einen Mittelpunkt anordnet: Anzahl, Winkel, Drehen, assoziativ. Zum Testen im Browser."
figure: "Eine Bohrung an einem Flansch, um die Mitte des Flansches angeordnet: 8 Elemente über eine volle Drehung."
sourceHash: "efed541dea7f"
---

REIHEKREIS (ARRAYPOLAR) kopiert eine Auswahl um einen Mittelpunkt, als ein Anordnungsobjekt. Er fragt nach den Objekten, nennt den Typ und ob die Anordnung assoziativ ist, fragt nach dem Mittelpunkt und zeigt die Anordnung sofort: 6 Elemente über eine volle Drehung, jedes so gedreht, wie es herumgeht. Dann bearbeitet eine Eingabeaufforderung sie live, bis die Eingabetaste sie erzeugt, über ihre Optionen oder die Griffe der Vorschau, wie in AutoCAD. Die gewählten Objekte werden zu ihrem ersten Element.

## Options

### ASsociative

<Keyword id="Yes" />, die Vorgabe, erzeugt ein Anordnungsobjekt, das seine Griffe und die Eigenschaftenpalette später ändern; <Keyword id="No" /> erzeugt einzelne Kopien neben den gewählten Objekten. Die Antwort gilt für die Sitzung, auch für REIHERECHTECK und REIHEPFAD.

### Items

Die Anzahl der Elemente, von 1 bis 32767; der Winkel, den sie füllen, bleibt erhalten.

### Angle between

Der Winkel von einem Element zum nächsten. Der gefüllte Winkel wird zu so vielen Schritten, die Richtung bleibt erhalten, und zu einer vollen Drehung, sobald sie 360° erreichen.

### Fill angle

Der Winkel, den die Elemente füllen, positiv gegen den Uhrzeigersinn und negativ im Uhrzeigersinn; die Anzahl der Elemente bleibt erhalten. Über eine volle Drehung liegen die Elemente eine Drehung geteilt durch ihre Anzahl auseinander; über weniger landet das letzte am Ende des Winkels.

### ROTate items

<Keyword id="Yes" />, die Vorgabe, dreht jedes Element, wie es um den Mittelpunkt herumgeht; <Keyword id="No" /> verschiebt es nur, sodass jedes Element so steht wie das erste.

### eXit

Erzeugt die Anordnung und beendet den Befehl, wie es die Eingabetaste tut.

## Missing

Basispunkt; Drehachse, für eine Anordnung um eine Achse im Raum; Zeilen und Ebenen, für Ringe von Elementen und in Z gestapelte Kopien; Ausdruck, der einen Wert an die Parameter der Zeichnung bindet. Die Menüs der Griffe der Anordnung (Radius strecken, Elementanzahl, Füllwinkel …) und Strg zum Durchschalten.

## Questions

### Wie erstellt man eine Polaranordnung?

Geben Sie `REIHEKREIS` ein, wählen Sie die Objekte, drücken Sie die Eingabetaste und wählen Sie den Mittelpunkt; oder geben Sie `RH` für <Command id="ARRAY" /> ein und wählen Sie nach den Objekten <Keyword command="ARRAY" id="POlar" />. Wählen Sie dann <Keyword id="Items" />, um die Anzahl einzustellen, und drücken Sie die Eingabetaste, um sie zu erzeugen.

### Wie ordnet man Objekte um einen Teil eines Kreises an?

Wählen Sie <Keyword id="Fill angle" /> und geben Sie den Winkel ein: 180 legt die Elemente über einen halben Kreis gegen den Uhrzeigersinn, -180 im Uhrzeigersinn. Die Anzahl der Elemente bleibt erhalten, das erste und das letzte an jedem Ende des Winkels.

### Wie verhindert man, dass sich die Elemente drehen?

Wählen Sie <Keyword id="ROTate items" /> und antworten Sie <Keyword id="No" />: Jedes Element wird um den Mittelpunkt bewegt, ohne sich zu drehen.

### Wie ändert man den Radius einer Polaranordnung?

Wählen Sie die Anordnung und ziehen Sie ihren quadratischen Griff am Basispunkt zum Mittelpunkt hin oder von ihm weg: Der Abstand zum Mittelpunkt ist der neue Radius. Oder geben Sie den Radius in der Eigenschaftenpalette neu ein.
