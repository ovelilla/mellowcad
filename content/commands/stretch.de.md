---
title: "Befehl STRECKEN (STRETCH) in AutoCAD"
description: "Wie STRECKEN (STRETCH, Alias STR) in AutoCAD funktioniert: ein Kreuzen-Fenster über den Enden, Basispunkt, zweiter Punkt, und warum es manchmal nur verschiebt."
figure: "Ein Rechteck und ein Kreis, um 40 nach rechts gestreckt durch ein Kreuzen-Fenster über der rechten Seite: Die Ecken darin wandern, und der Kreis mit ihnen."
sourceHash: "de8671fb4290"
---

STRECKEN (STRETCH) verschiebt den Teil einer Zeichnung, den ein Kreuzen-Fenster erfasst, und streckt, was ihn mit dem Rest verbindet. Wählen Sie mit einem Kreuzen-Fenster, von rechts nach links aufgezogen, oder einem Kreuzen-Polygon über den Enden und Scheitelpunkten, die verschoben werden; geben Sie dann einen Basispunkt und einen zweiten Punkt an, wie bei <Command id="MOVE" />. Was das Fenster erfasst, wandert um diesen Abstand: die Enden einer Linie, die Scheitelpunkte einer Polylinie, die Enden eines Bogens, die Kontur einer Schraffur, die Ursprünge einer Bemaßung. Was ganz darin liegt, wandert als Ganzes; ein Kreis, ein Text oder ein Blockreferenz wandert, wenn sein Mittelpunkt oder Einfügepunkt darin liegt. Einzeln gewählte oder mit Fenster gefundene Objekte wandern ebenfalls als Ganzes. Das Strecken ist ein Schritt, den Rückgängig zurücknimmt.

## Options

### Displacement

Bei der Eingabeaufforderung des Basispunkts gewählt oder dort mit der Eingabetaste, seiner Vorgabe: fragt nach der Verschiebung als Vektor, `40,0` streckt um 40 entlang X. Beim zweiten Punkt tut die Eingabetaste dasselbe mit dem Basispunkt: Seine Koordinaten sind die Verschiebung.

## Missing

Ein Ellipsenbogen mit einem Ende im Fenster, den AutoCAD umformt: Hier wandert er als Ganzes, wenn sein Mittelpunkt im Fenster liegt, sonst bleibt er. Eine nicht assoziative Schraffur, die teilweise erfasst wird und die AutoCAD, wo sie ist, lässt. Der Text einer Bemaßung an seinem Standardplatz bleibt, wenn nur er erfasst wird.

## Questions

### Wie lautet das Kürzel für STRECKEN (STRETCH) in AutoCAD?

`STR`, dann die Eingabetaste oder die Leertaste. Der vollständige Name funktioniert ebenfalls, ebenso `_STRETCH` in jeder Sprache von AutoCAD.

### Warum verschiebt STRECKEN die Objekte nur?

Weil das ganze Objekt im Fenster liegt oder Sie es einzeln gewählt haben: STRECKEN verschiebt diese als Ganzes. Ziehen Sie ein Kreuzen-Fenster, von rechts nach links, nur über die Enden, die Sie verschieben möchten.

### Wie strecke ich um einen exakten Abstand?

Geben Sie den Basispunkt an, geben Sie dann die Verschiebung ein: `40,0` streckt um 40 entlang X, bei eingeschalteter dynamischer Eingabe relativ zum Basispunkt gelesen. Oder richten Sie den Cursor in die gewünschte Richtung, mit Ortho oder Spurverfolgung, und geben Sie nur den Abstand ein.

### Kann ich in AutoCAD einen Block strecken?

Ein Blockreferenz wandert als Ganzes, wenn sein Einfügepunkt im Fenster liegt, und bleibt, wenn nicht: Sein Inneres wird nicht gestreckt. Lösen Sie ihn zuerst mit <Command id="EXPLODE" /> auf, um seine Teile zu strecken.
