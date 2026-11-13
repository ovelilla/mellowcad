---
title: "Befehl PLINIE (PLINE) in AutoCAD"
description: "Wie PLINIE (PLINE, Alias PL) in AutoCAD funktioniert: Linien und Bögen in einer Polylinie, Breite, Halbbreite, Länge, Schließen."
figure: "Eine Linie, ein tangentialer Bogen und eine Linie zurück, dann ein Kopf von 10 Breite, der auf 0 ausläuft: eine Polylinie."
sourceHash: "216b83656483"
---

PLINIE (PLINE) zeichnet eine Polylinie: ein Objekt aus geraden Segmenten und Bögen, die aneinander anschließen, jedes mit einer Breite. Nach dem Startpunkt meldet der Befehl die aktuelle Breite; dann fügt jeder Punkt ein Segment hinzu, bis die Eingabetaste oder <Keyword id="Close" /> ihn beendet. Wie in AutoCAD beginnt er mit Linien: <Keyword id="Arc" /> wechselt zu Bögen, jeder tangential zum vorherigen Segment, und <Keyword id="Line" /> wechselt zurück. Die Eingabetaste beim Startpunkt setzt am Ende der zuletzt gezeichneten Linie, des Bogens oder der Polylinie fort.

## Options

### Arc

Bogenmodus: Jeder Endpunkt zeichnet einen Bogen tangential zum letzten Segment oder, als erstes Segment, in der Richtung, in der die zuletzt gezeichnete Linie, der Bogen oder die Polylinie endet. Halten Sie Strg gedrückt, um seine Richtung umzukehren. Die folgenden Optionen formen den nächsten Bogen.

### Close

Wird aufgeführt, sobald es ein Segment gibt: schließt die Polylinie zurück zu ihrem Start und beendet den Befehl; im Bogenmodus mit einem tangentialen Bogen.

### Halfwidth

Wie <Keyword id="Width" />, aber jede Breite wird von der Mitte des Segments bis zu seinem Rand gemessen.

### Length

Eine Linie der angegebenen Länge in der Richtung, in der die Polylinie verläuft: entlang des letzten Segments oder tangential zum letzten Bogen. Eine negative Länge geht zurück.

### Undo

Nimmt das letzte Segment zurück und macht im Modus des vorherigen weiter. Ist keines mehr übrig, meldet der Befehl <Message id="allSegmentsUndone" />

### Width

Die Anfangsbreite, dann die Endbreite, jeweils eingegeben oder vom letzten Scheitelpunkt aus gewählt: 10 auf 0 läuft zu einer Spitze zusammen, wie eine Pfeilspitze. Die Endbreite gilt für die nächsten Segmente und, als PLINEWID, für die nächste PLINIE.

### Angle

Bogenmodus: der eingeschlossene Winkel des Bogens, dann sein Endpunkt, sein Mittelpunkt oder sein Radius.

### Center

Bogenmodus: der Mittelpunkt des Bogens, dann sein Endpunkt, sein eingeschlossener Winkel oder die Länge seiner Sehne.

### Direction

Bogenmodus: die Richtung, in der der Bogen den letzten Scheitelpunkt verlässt, anstelle der Tangente, dann sein Endpunkt.

### Line

Bogenmodus: zurück zu geraden Segmenten.

### Radius

Bogenmodus: der Radius des Bogens, dann sein Endpunkt oder sein eingeschlossener Winkel. Ein negativer Radius zeichnet den größeren Bogen.

### Second pt

Bogenmodus: ein Punkt, durch den der Bogen verläuft, dann sein Endpunkt: ein Bogen durch drei Punkte.

## Missing

PLINEGEN: Eine neue Polylinie legt ihren Linientyp Segment für Segment an, wie bei PLINEGEN 0 (Ltype gen von PEDIT schaltet es für eine Polylinie ein). Ein gestrichelter Linientyp auf einem breiten Segment wird durchgezogen gezeichnet. Die Vorschau eines breiten Segments wird nicht in einem dunkleren Ton gezeichnet, und die Eingabeaufforderung für Bögen steht in einer Zeile, wo AutoCAD sie auf zwei umbricht.

## Questions

### Wie lautet das Kürzel für PLINIE (PLINE) in AutoCAD?

`PL`, dann die Eingabetaste oder die Leertaste. Der vollständige Name funktioniert ebenfalls, ebenso `_PLINE` in jeder Sprache von AutoCAD.

### Wie zeichne ich eine gekrümmte Polylinie?

Wählen Sie <Keyword id="Arc" />: Jeder Punkt beendet dann einen Bogen tangential zum vorherigen Segment, bis <Keyword id="Line" />. Um eine bereits gezeichnete Polylinie durch ihre Scheitelpunkte zu glätten, verwenden Sie <Command id="PEDIT" /> mit <Keyword command="PEDIT" id="Fit" /> oder <Keyword command="PEDIT" id="Spline" />.

### Warum wird meine Polylinie dick gezeichnet?

Eine in einer früheren PLINIE angegebene Breite bleibt erhalten, und die nächste Polylinie beginnt damit, wie die Zeile nach ihrem Startpunkt zeigt. Wählen Sie <Keyword id="Width" /> und geben Sie zweimal 0 an, um wieder dünn zu zeichnen. Bei ausgeschaltetem <Command id="FILL" /> erscheinen breite Polylinien als Umrisse.

### Wie verbinde ich Linien zu einer Polylinie?

Starten Sie <Command id="JOIN" /> und wählen Sie Linien, Bögen und Polylinien, die Ende an Ende liegen: Jede Kette wird eine Polylinie. Oder starten Sie <Command id="PEDIT" /> auf einer Linie, antworten Sie mit <Keyword command="PEDIT" id="Yes" />, um sie in eine Polylinie umzuwandeln, und fügen Sie den Rest mit <Keyword command="PEDIT" id="Join" /> hinzu.

### Wie ermittle ich die Fläche oder Länge einer Polylinie?

Starten Sie <Command id="AREA" />, drücken Sie die Eingabetaste für <Keyword command="AREA" id="Object" /> und wählen Sie die Polylinie: Eine geschlossene meldet ihre Fläche und ihren Umfang, eine offene ihre Länge.
