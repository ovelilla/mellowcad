---
title: "Befehl REIHE (ARRAY) in AutoCAD"
description: "Wie REIHE (ARRAY, Alias RH) in AutoCAD funktioniert, Schritt für Schritt: rechteckige, polare und Pfadreihen, vor dem Erzeugen live bearbeitet."
figure: "Ein Quadrat und sein Kreis mit den Vorgaben als Reihe: die Eingabetaste für eine rechteckige Reihe, 4 Spalten und 3 Zeilen."
sourceHash: "5e0a412c9f13"
---

REIHE (ARRAY) kopiert eine Auswahl in einem Muster: in Spalten und Zeilen, um einen Mittelpunkt oder entlang eines Pfads. Der Befehl fragt nach den Objekten, dann nach dem Anordnungstyp, wobei die Eingabetaste die rechteckige wählt, und übergibt die Auswahl an <Command id="ARRAYRECT" />, <Command id="ARRAYPOLAR" /> oder <Command id="ARRAYPATH" />, die weitermachen, ohne erneut nach den Objekten zu fragen. Jeder dieser Befehle zeigt die Anordnung sofort und bearbeitet sie live, über seine Optionen und seine Griffe, bis die Eingabetaste sie erzeugt: ein Anordnungsobjekt oder lose Kopien, wenn Sie angegeben haben, dass sie nicht assoziativ sein soll. Der ganze Durchlauf ist ein Rückgängig-Schritt, und die Eingabetaste in der Befehlszeile wiederholt REIHE.

## Options

### Rectangular

Spalten und Zeilen, und auf Wunsch entlang Z gestapelte Ebenen: <Command id="ARRAYRECT" />. Er beginnt mit 4 Spalten und 3 Zeilen, im Abstand der anderthalbfachen Größe der Auswahl.

### PAth

Entlang einer Linie, eines Bogens, eines Kreises oder einer Polylinie: <Command id="ARRAYPATH" />. Er fragt nach der Pfadkurve und legt dann die Elemente entlang von ihr, jedes so gedreht, wie der Pfad verläuft.

### POlar

Um einen Mittelpunkt: <Command id="ARRAYPOLAR" />. Er fragt nach dem Mittelpunkt und beginnt mit 6 Elementen über eine volle Drehung.

## Missing

Der angebotene Typ ist immer Rectangular: ARRAYTYPE, die Variable, die die Vorgabe von AutoCAD festlegt, wird nicht gelesen.

## Questions

### Wie lautet das Kürzel für REIHE (ARRAY) in AutoCAD?

`RH`, dann die Eingabetaste oder die Leertaste. Der vollständige Name funktioniert ebenfalls, ebenso `_ARRAY` in jeder Sprache von AutoCAD. <Command id="ARRAYRECT" />, <Command id="ARRAYPOLAR" /> und <Command id="ARRAYPATH" /> haben keinen Alias und überspringen, vollständig eingegeben, die Frage nach dem Typ.

### Wie erstelle ich eine kreisförmige Anordnung?

Wählen Sie <Keyword id="POlar" /> oder starten Sie <Command id="ARRAYPOLAR" /> und wählen Sie den Mittelpunkt: Die Auswahl wird um ihn herum kopiert, zunächst 6 Elemente. Ändern Sie die Anzahl mit <Keyword command="ARRAYPOLAR" id="Items" /> und legen Sie den Winkel, den sie füllen, mit <Keyword command="ARRAYPOLAR" id="Fill angle" /> fest.

### Wie löse ich eine Anordnung auf?

Wählen Sie sie und starten Sie <Command id="EXPLODE" />: Die Anordnung wird zu den Objekten ihrer Elemente, jedes Objekt auf seinem eigenen Layer. Um von Anfang an lose Kopien zu erhalten, antworten Sie auf <Keyword command="ARRAYRECT" id="ASsociative" /> mit <Keyword command="ARRAYRECT" id="No" />, bevor Sie die Eingabetaste drücken.

### Wie ändere ich eine Anordnung, nachdem sie erzeugt wurde?

Wählen Sie sie. Ihre Griffe ändern sie: Das Quadrat am Basispunkt verschiebt sie, die Pfeile legen die Anzahlen und den Abstand fest, und eine Zahl, die eingegeben wird, während ein Anzahlpfeil heiß ist, ist die Anzahl. Die Eigenschaftenpalette listet ihre Spalten, Zeilen und Abstände oder ihre Elemente und Winkel zur Neueingabe auf. ARRAYEDIT gibt es noch nicht.
