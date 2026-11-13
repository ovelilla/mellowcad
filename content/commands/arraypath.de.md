---
title: "Befehl REIHEPFAD (ARRAYPATH) in AutoCAD"
description: "Wie REIHEPFAD (ARRAYPATH) in AutoCAD Objekte entlang eines Pfads anordnet: Messen oder Teilen, Anzahl, Ausrichten, assoziativ. Zum Testen im Browser."
figure: "Ein kleines Quadrat am Anfang eines Bogens, entlang von ihm angeordnet: Divide, 7 Elemente, jedes mit dem Bogen gedreht."
sourceHash: "d0d77418d682"
---

REIHEPFAD (ARRAYPATH) kopiert eine Auswahl entlang eines Pfads, einer Linie, eines Bogens, eines Kreises oder einer Polylinie, als ein Anordnungsobjekt. Er fragt nach den Objekten, nennt den Typ und ob die Anordnung assoziativ ist, fragt nach der Pfadkurve und zeigt die Anordnung sofort: die Elemente im Abstand des Eineinhalbfachen der Größe der Auswahl, so viele, wie entlang des Pfads passen, jedes so gedreht, wie der Pfad sich dreht. Ein offener Pfad läuft von dem Ende, das näher an Ihrer Wahl liegt, ein Kreis gegen den Uhrzeigersinn ab seinem Winkel 0. Dann bearbeitet eine Eingabeaufforderung die Anordnung live, bis die Eingabetaste sie erzeugt, über ihre Optionen oder die Griffe der Vorschau, wie in AutoCAD. Die gewählten Objekte bleiben, wo sie sind, als ihr erstes Element.

## Options

### ASsociative

<Keyword id="Yes" />, die Vorgabe, erzeugt ein Anordnungsobjekt, das seine Griffe und die Eigenschaftenpalette später ändern; <Keyword id="No" /> erzeugt einzelne Kopien neben den gewählten Objekten. Die Antwort gilt für die Sitzung, auch für REIHERECHTECK und REIHEKREIS.

### Method

<Keyword id="Measure" />, die Vorgabe, setzt die Elemente in einem Abstand, so viele, wie passen; <Keyword id="Divide" /> verteilt eine Anzahl Elemente gleichmäßig über den ganzen Pfad, eines an jedem Ende eines offenen Pfads.

### Items

Bei Divide die Anzahl der Elemente. Bei Measure der Abstand zwischen ihnen, dann wie viele, bis zur größten Zahl, die passt und die er nennt; <Keyword id="Fill entire path" /> nimmt alle.

### Align items

<Keyword id="Yes" />, die Vorgabe, dreht jedes Element, wie der Pfad sich von seinem Anfang an dreht; <Keyword id="No" /> verschiebt es nur entlang.

### eXit

Erzeugt die Anordnung und beendet den Befehl, wie es die Eingabetaste tut.

## Missing

Die Anordnung folgt ihrem Pfad nicht: Bearbeiten Sie den Pfad später, behält die Anordnung den, auf dem sie erzeugt wurde. Splines, Ellipsen und 3D-Polylinien können noch keine Pfade sein, ebenso kein Pfad außerhalb der Ebene des BKS. Basispunkt, Tangentenrichtung, Zeilen, Ebenen, Z-Richtung und Ausdruck werden nicht angeboten, ebenso keine Gruppe bei der Pfad-Eingabeaufforderung, und die Griffe der Anordnung haben keine Menüs.

## Questions

### Wie ordnet man Objekte entlang einer Kurve an?

Geben Sie `REIHEPFAD` ein, wählen Sie die Objekte, drücken Sie die Eingabetaste und wählen Sie den Pfad nahe dem Ende, von dem aus begonnen werden soll; oder geben Sie `RH` für <Command id="ARRAY" /> ein und wählen Sie nach den Objekten <Keyword command="ARRAY" id="PAth" />. Stellen Sie dann den Abstand oder die Anzahl der Elemente ein und drücken Sie die Eingabetaste, um sie zu erzeugen.

### Warum folgt meine Pfadanordnung dem Pfad nicht?

Hier behält eine Anordnung den Pfad, wie er war, als die Anordnung erzeugt wurde: Verschieben oder strecken Sie den Pfad später, bleibt die Anordnung, wie sie ist, wo eine assoziative Pfadanordnung in AutoCAD ihm folgen würde. Auch das Löschen des Pfads lässt die Anordnung stehen. Drehen sich die Elemente nicht mit dem Pfad, wählen Sie <Keyword id="Align items" /> und antworten Sie <Keyword id="Yes" />.

### Wie ändert man die Richtung einer Pfadanordnung?

Wählen Sie den Pfad nahe seinem anderen Ende: Ein offener Pfad läuft von dem Ende, das näher an der Wahl liegt. Ein Kreis läuft immer gegen den Uhrzeigersinn ab seinem Winkel 0.

### Wie verteilt man Elemente gleichmäßig über den ganzen Pfad?

Wählen Sie <Keyword id="Method" />, dann <Keyword id="Divide" />, dann <Keyword id="Items" /> und geben Sie die Anzahl ein: Sie werden gleichmäßig verteilt, das erste und das letzte an den Enden eines offenen Pfads.
