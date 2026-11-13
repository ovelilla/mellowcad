---
title: "Befehl KOPIEREN (COPY) in AutoCAD"
description: "So arbeitet AutoCADs KOPIEREN (COPY, Alias KO und CP): ein Basispunkt, dann so viele Kopien, wie Sie platzieren, mit Zurück und Beenden, oder per Verschiebung."
figure: "Ein Kreis, dreimal entlang X von einem Basispunkt aus kopiert, dann die Eingabetaste."
sourceHash: "e74bbdabf97c"
---

KOPIEREN (COPY) platziert Kopien der gewählten Objekte: Wählen Sie sie, geben Sie einen Basispunkt an, dann für jede Kopie einen zweiten Punkt. Wie in AutoCAD, dessen Kopiermodus standardmäßig Mehrfach ist, fragt er immer weiter nach einer weiteren, bis Sie die Eingabetaste drücken oder Beenden wählen, jede Kopie vom selben Basispunkt aus gemessen. Die Kopien behalten Layer, Farbe und jede andere Eigenschaft der Objekte. Vor dem Befehl gewählte Objekte sind die, die er kopiert, und während Sie eine Kopie platzieren, folgt die Auswahl dem Cursor.

## Options

### Displacement

Bei der Eingabeaufforderung für den Basispunkt gewählt, oder durch die Eingabetaste dort: fragt nach einer Verschiebung als Vektor, `30,0` platziert eine Kopie 30 entlang X, und endet. Seine Vorgabe ist die zuletzt von KOPIEREN in dieser Zeichnung verwendete.

### Exit

Beendet den Befehl, wie es die Eingabetaste tut, sobald eine Kopie platziert ist.

### Undo

Nimmt die zuletzt platzierte Kopie zurück. Die erste zurückzunehmen meldet <Message id="commandCompletelyUndone" /> und fragt erneut nach dem zweiten Punkt.

## Missing

Einzeln von COPYMODE (einmal kopieren und beenden) wird nicht angeboten: KOPIEREN ist immer Mehrfach, sodass die Eingabeaufforderung für den Basispunkt nur <Keyword id="Displacement" /> auflistet. Auch Anordnung beim zweiten Punkt, AutoCADs Reihe gleichmäßig verteilter Kopien, wird nicht angeboten.

## Questions

### Wie lautet das Kürzel für KOPIEREN (COPY) in AutoCAD?

`KO` oder `CP`, danach Eingabetaste oder Leertaste. Auch der vollständige Name funktioniert, ebenso `_COPY` in jeder Sprache von AutoCAD.

### Wie mache ich mehrere Kopien auf einmal?

Platzieren Sie weiter: Jeder Punkt, den Sie angeben, ist eine weitere Kopie vom selben Basispunkt aus, bis zur Eingabetaste. Für Kopien in Zeilen, Spalten oder um einen Mittelpunkt macht <Command id="ARRAY" /> sie in einem Zug.

### Wie kopiere ich ein Objekt um einen festen Abstand?

Geben Sie den Basispunkt an und tippen Sie dann den zweiten Punkt als Abstand: `30,0` kopiert es 30 entlang X, da die dynamische Eingabe einen Punkt nach dem ersten daraus liest. Oder richten Sie den Cursor in die gewünschte Richtung, mit Ortho oder Spurverfolgung, und tippen Sie nur den Abstand.

### Warum gibt es in KOPIEREN keine Option Anordnung?

MellowCAD bietet sie noch nicht an. Für eine Reihe gleichmäßig verteilter Kopien macht <Command id="ARRAYRECT" /> mit einer Zeile dasselbe und behält sie als eine Anordnung, die Sie bearbeiten können.
