---
title: "Befehl SCHIEBEN (MOVE) in AutoCAD"
description: "Wie SCHIEBEN (MOVE, Alias S) in AutoCAD Objekte verschiebt: Basispunkt und zweiter Punkt, Verschiebung als Vektor, ein Schritt für Rückgängig. Zum Testen."
figure: "Ein Kreis um 50 nach rechts verschoben: gewählt, sein Mittelpunkt als Basispunkt, der zweite Punkt eingegeben."
sourceHash: "753ca38448bf"
---

SCHIEBEN (MOVE) bringt die gewählten Objekte von einem Ort an einen anderen: Wählen Sie sie, geben Sie einen Basispunkt an, dann einen zweiten Punkt, und sie bewegen sich um den Abstand und die Richtung vom ersten zum zweiten. Sonst ändert sich nichts an ihnen. Wie in AutoCAD sind die vor dem Befehl gewählten Objekte die, die er verschiebt, ein Punkt kann gewählt, gefangen oder eingegeben werden, und während Sie den zweiten Punkt wählen, folgt die Auswahl dem Fadenkreuz, mit einer Linie vom Basispunkt. Das Verschieben ist ein Schritt, den Rückgängig zurücknimmt.

## Options

### Displacement

Bei der Eingabeaufforderung des Basispunkts gewählt, oder dort mit der Eingabetaste, seiner Vorgabe: Er fragt nach der Verschiebung als Vektor, `10,5` verschiebt um 10 entlang X und 5 entlang Y, vorgegeben die letzte, die SCHIEBEN in dieser Zeichnung verwendet hat. Beim zweiten Punkt tut die Eingabetaste dasselbe mit dem Basispunkt: Seine Koordinaten sind die Verschiebung.

## Missing

Zwei der Auswahlmodi von AutoCAD bei der Objekt-Eingabeaufforderung, Gruppe und Mehrfach, und das Wählen von Flächen, Kanten oder Scheitelpunkten eines Volumenkörpers mit Strg, um ihn umzuformen. Solange die Auswahl dem Fadenkreuz folgt, trägt sie die Farbe jedes Objekts, aber nicht seinen Linientyp oder seine Linienstärke, und alle Objekte eines Blockreferenz tragen die Farbe des Verweises.

## Questions

### Wie lautet das Alias von SCHIEBEN (MOVE) in AutoCAD?

`S`, dann die Eingabetaste oder die Leertaste. Das `M` des englischen AutoCAD gibt es in der deutschen Version nicht. Der volle Name funktioniert ebenfalls, und `_MOVE` in jeder Sprache von AutoCAD.

### Wie verschiebt man ein Objekt um einen festen Abstand?

Geben Sie den Basispunkt an, dann geben Sie die Verschiebung als zweiten Punkt ein: `50,0` verschiebt um 50 entlang X. Bei eingeschalteter dynamischer Eingabe, wie sie beginnt, ist ein Punkt nach dem ersten relativ zu ihm, sodass der Verlauf ihn als `@50,0` schreibt. Oder richten Sie das Fadenkreuz in die Richtung, mit Ortho oder Spurverfolgung, und geben Sie nur den Abstand ein.

### Wie verschiebt man Objekte in 3D nach oben?

Geben Sie der Verschiebung ein Z: `0,0,5` als zweiter Punkt oder als <Keyword id="Displacement" /> hebt die Auswahl um 5. Ein ohne Z eingegebener Punkt liegt auf der aktuellen Erhebung.

### Was ist der Unterschied zwischen SCHIEBEN und STRECKEN?

SCHIEBEN verschiebt ganze Objekte. <Command id="STRETCH" /> verschiebt nur die Enden und Scheitelpunkte innerhalb seines Kreuzen-Fensters und streckt die Objekte, zu denen sie gehören.
