---
title: "Befehl REIHERECHTECK (ARRAYRECT) in AutoCAD"
description: "So arbeitet AutoCADs REIHERECHTECK (ARRAYRECT): Spalten, Zeilen und Ebenen, ihre Abstände, assoziativ oder nicht. Gratis im Browser testen."
figure: "Ein Quadrat und sein Kreis in 5 Spalten und 3 Zeilen, 16 und 14 auseinander: zuerst die Anzahl, dann der Abstand."
sourceHash: "c8c8d747d0c9"
---

REIHERECHTECK (ARRAYRECT) kopiert eine Auswahl in Spalten und Zeilen, auf Wunsch auch in Ebenen, als ein Anordnungsobjekt. Er fragt nach den Objekten, nennt den Typ und ob die Anordnung assoziativ ist, und zeigt sie sofort: 4 Spalten entlang der X-Achse des BKS und 3 Zeilen entlang seiner Y-Achse, anderthalbmal so weit auseinander, wie die Auswahl groß ist. Dann bearbeitet eine Eingabeaufforderung sie live, bis die Eingabetaste sie erzeugt, über ihre Optionen oder die Griffe der Vorschau, wie in AutoCAD: Klicken Sie einen ihrer Pfeile an, dann klicken Sie dorthin, wo er hin soll, oder tippen Sie eine Zahl, um eine Anzahl oder einen Abstand festzulegen. Auch Esc erzeugt dort die Anordnung. Die gewählten Objekte werden ihr erstes Element.

## Options

### ASsociative

<Keyword id="Yes" />, die Vorgabe, erzeugt ein Anordnungsobjekt: Seine Griffe und die Eigenschaften-Palette ändern es später, und <Command id="EXPLODE" /> zerlegt es in seine Elemente. <Keyword id="No" /> erzeugt einzelne Kopien neben den gewählten Objekten. Die Antwort bleibt für die Sitzung erhalten, auch für ARRAYPOLAR und ARRAYPATH.

### COUnt

Die Anzahl der Spalten, dann der Zeilen, von 1 bis je 32767.

### Spacing

Der Abstand zwischen den Spalten, dann zwischen den Zeilen, negativ nach links oder unten. Oder <Keyword id="Unit cell" />: die zwei Ecken eines Rechtecks, dessen Seiten beide Abstände sind.

### COLumns

Die Anzahl der Spalten und der Abstand zwischen ihnen.

### Rows

Die Anzahl der Zeilen, der Abstand zwischen ihnen und eine Höhe, um die sich jede Zeile über die vorige hebt.

### Levels

Kopien, die entlang der Z-Achse des BKS gestapelt werden: die Anzahl der Ebenen, dann der Abstand zwischen ihnen, oder mit <Keyword id="Total" /> der Abstand von der ersten bis zur letzten Ebene.

### eXit

Erzeugt die Anordnung und beendet den Befehl, wie es die Eingabetaste tut.

## Missing

Basispunkt; Gesamt bei den Abständen zwischen Spalten und zwischen Zeilen (Ebenen hat es); Ausdruck, der einen Wert an die Parameter der Zeichnung bindet. ARRAYEDIT und ARRAYCLOSE, die die Quelle einer Anordnung bearbeiten oder ihre Elemente ersetzen. Die Menüs der Griffe der Anordnung (Spaltenanzahl, Gesamter Spaltenabstand, Achsenwinkel…) und Strg, um sie durchzuschalten, sodass sich ein Gesamtabstand oder ein Achsenwinkel nicht über einen Griff festlegen lässt; ein Griff schreibt auch keine Zeilen in die Befehlszeile. Die Werte Basis X und Basis Y der Palette lassen sich nicht neu eintippen.

## Questions

### Wie starte ich eine rechteckige Anordnung?

Tippen Sie `REIHERECHTECK`, das keinen Alias hat, oder `RH` für <Command id="ARRAY" /> und die Eingabetaste bei seiner Frage, da Rechteckig die Vorgabe ist. Wählen Sie die Objekte und drücken Sie die Eingabetaste: Die Anordnung wird sofort gezeichnet, bereit zum Bearbeiten.

### Wie lege ich den Abstand zwischen Zeilen und Spalten fest?

Wählen Sie <Keyword id="Spacing" /> und tippen Sie den Abstand zwischen den Spalten, dann zwischen den Zeilen; ein negativer geht nach links oder unten. Mit <Keyword id="Unit cell" /> geben zwei Ecken beide auf einmal an. Oder ziehen Sie die Pfeile an der zweiten Spalte und Zeile.

### Wie mache ich die Kopien zu einzelnen Objekten?

Wählen Sie <Keyword id="ASsociative" /> und antworten Sie <Keyword id="No" />, bevor Sie die Eingabetaste drücken: Jede Kopie ist ein eigenes Objekt. Eine assoziative Anordnung lässt sich später mit <Command id="EXPLODE" /> in ihre Elemente zerlegen.

### Wie mache ich eine 3D-Anordnung?

Wählen Sie <Keyword id="Levels" />: Die Zeilen und Spalten werden entlang der Z-Achse des BKS nach oben kopiert, so viele Ebenen, wie Sie angeben, im angegebenen Abstand. <Keyword id="Rows" /> fragt auch nach einer Höhe, die jede Zeile über die vorige hebt.
