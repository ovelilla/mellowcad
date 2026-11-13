---
title: "Befehl BOGEN (ARC) in AutoCAD"
description: "Wie BOGEN (ARC, Alias B) in AutoCAD einen Bogen zeichnet: durch drei Punkte oder um einen Mittelpunkt, Start, Mitte, Ende, im Uhrzeigersinn mit Strg."
figure: "Drei Bögen: durch drei Punkte, von einem Start um einen Mittelpunkt zu einem Ende und von einem Mittelpunkt, seinem Start, dann seinem Ende."
sourceHash: "af9b22e35456"
---

BOGEN (ARC) zeichnet standardmäßig einen Bogen durch drei Punkte: seinen Start, einen Punkt, durch den er läuft, und sein Ende. Oder er zeichnet einen um einen Mittelpunkt, von einem Startpunkt zu einem Ende, so wie die Schaltflächen Start, Mittelpunkt, Ende und Mittelpunkt, Start, Ende des Menübands ihn ausführen. Wie in AutoCAD läuft ein durch seinen Mittelpunkt gegebener Bogen gegen den Uhrzeigersinn von seinem Start, und das Ende legt nur fest, wo er aufhört: Es muss nicht auf dem Bogen liegen. Während Sie die Punkte setzen, folgt der Bogen dem Fadenkreuz, mit einer bernsteinfarbenen gestrichelten Linie vom Start oder vom Mittelpunkt. Der Bogen liegt in der Ebene seines ersten Punkts. Ein Bogen, der sich nicht erzeugen lässt, drei Punkte auf einer Linie oder ein Ende auf dem Start, meldet <Message id="invalid" /> und zeichnet nichts.

## Options

### Center

Bei der ersten Eingabeaufforderung: Geben Sie zuerst den Mittelpunkt an, dann den Startpunkt und den Endpunkt. Bei der zweiten Eingabeaufforderung, nach dem Start: Der Mittelpunkt kommt als Nächstes, dann das Ende. Halten Sie bei beiden am Ende Strg gedrückt, um den Bogen stattdessen im Uhrzeigersinn laufen zu lassen.

## Missing

Die Optionen, die einen Bogen durch seinen Winkel, seine Sehnenlänge, eine Richtung oder einen Radius statt eines Endpunkts abschließen, und Endpunkt beim zweiten Punkt, der zu ihnen führt; auch die Schaltflächen des Menübands für diese Wege fehlen. Fortsetzen: Die Eingabetaste bei der ersten Eingabeaufforderung, die in AutoCAD einen Bogen tangential zur letzten Linie oder zum letzten Bogen zeichnet, beendet BOGEN hier. Das Feld für den eingeschlossenen Winkel, das die dynamische Eingabe am Ende eines Mittelpunktmodus zeigt.

## Questions

### Wie lautet das Alias von BOGEN (ARC) in AutoCAD?

`B`, dann die Eingabetaste oder die Leertaste. Der volle Name funktioniert ebenfalls, und `_ARC` in jeder Sprache von AutoCAD. Das `B` des englischen AutoCAD für BLOCK ist in der deutschen Version BL.

### Wie zeichnet man in AutoCAD einen Bogen durch drei Punkte?

Starten Sie BOGEN und geben Sie drei Punkte an: den Start, einen beliebigen Punkt, durch den der Bogen läuft, und das Ende. Das ist die Vorgabe, ohne eine Option zu wählen.

### Warum geht mein Bogen in die falsche Richtung?

Ein durch seinen Mittelpunkt gezeichneter Bogen läuft gegen den Uhrzeigersinn von seinem Start, wie in AutoCAD. Vertauschen Sie Start und Ende, oder halten Sie beim Angeben des Endpunkts Strg gedrückt, um ihn im Uhrzeigersinn laufen zu lassen.

### Wie zeichnet man einen Bogen tangential zu zwei Linien?

Verwenden Sie <Command id="FILLET" /> mit einem Radius: Er zeichnet den Bogen tangential zu beiden Linien und stutzt sie darauf. Für einen Bogen tangential zum Segment davor zeichnen Sie ihn in einer Polylinie, mit der Bogenoption von <Command id="PLINE" />.
