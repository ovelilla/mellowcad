---
title: "Befehl VERBINDEN (JOIN) in AutoCAD"
description: "So arbeitet AutoCADs VERBINDEN (JOIN, Alias VB): Linien und Bögen, die sich treffen, zur Polylinie, fluchtende Linien zu einer, Bögen zum Kreis. Gratis testen."
figure: "Drei Linien zu einer Polylinie verbunden, der ein einziger Klick von VERSETZ dann als Ganzes folgt."
sourceHash: "c4f26ede4174"
---

VERBINDEN (JOIN) macht aus mehreren Objekten eines. Wählen Sie sie, so viele Sie wollen, und drücken Sie die Eingabetaste: Linien und Bögen, die Ende an Ende aufeinandertreffen, werden zu einer Polylinie, verbunden mit einer Polylinie darunter, wenn es eine gibt; Linien auf einer Geraden werden zu einer Linie, über jede Lücke hinweg; Bögen eines Kreises werden zu einem Bogen, und wenn sie sich schließen, fragt VERBINDEN, ob ein Kreis daraus gemacht werden soll, standardmäßig <Keyword id="Yes" />, oder ob er mit <Keyword id="No" /> ein Bogen bleibt. Elliptische Bögen einer Ellipse werden zu einem Bogen, und ein Spline oder ein elliptischer Bogen unter Kurven, die sich treffen, ergibt einen Spline. Dann meldet er, was er erzeugt hat und wie viele Objekte er ausgelassen hat. Eine Polylinie verbindet sich nur über ihre Enden, und eine geschlossene verbindet nichts. Das Verbinden ist ein Rückgängig-Schritt.

## Options

### cLose

Wenn ein elliptischer Bogen die Quelle ist, allein gewählt: macht seine Ellipse ganz.

## Missing

Der eigene Schritt von AutoCAD, wenn eine einzelne Linie, ein Bogen oder eine Polylinie die Quelle ist, allein gewählt (`Linien zum Verbinden mit Quelle auswählen:`): Hier verbindet er nichts. Ein geschlossenes Objekt, allein gewählt, wonach AutoCAD erneut fragt. Helices, Objekte in einer geneigten oder auf dem Kopf stehenden Ebene, und Linien, die nicht in einer Ebene liegen, die AutoCAD zu einer 3D-Polylinie verbindet oder zu einer Polylinie abflacht.

## Questions

### Wie lautet das Kürzel für VERBINDEN (JOIN) in AutoCAD?

`VB`, danach Eingabetaste oder Leertaste. Auch der vollständige Name funktioniert, ebenso `_JOIN` in jeder Sprache von AutoCAD.

### Wie verbinde ich Linien in AutoCAD zu einer Polylinie?

Starten Sie VERBINDEN, wählen Sie die Linien, wenn Sie wollen mit einem Fenster, und drücken Sie die Eingabetaste: Die, die Ende an Ende aufeinandertreffen, werden zu einer Polylinie.

### Warum funktioniert VERBINDEN nicht?

Die Objekte müssen sich genau treffen, Ende an Ende und in einer Ebene: Eine Lücke oder eine Kreuzung lässt sie aus, und VERBINDEN meldet, wie viele es verworfen hat. Nur fluchtende Linien, Bögen eines Kreises und Bögen einer Ellipse werden über eine Lücke hinweg verbunden. Eine geschlossene Polylinie verbindet nichts.

### Wie verbinde ich Bögen zu einem Kreis?

Wählen Sie Bögen eines Kreises, die ihn ganz abdecken, und drücken Sie die Eingabetaste: VERBINDEN fragt, ob sie in einen Kreis umgewandelt werden sollen, und <Keyword id="Yes" />, die Vorgabe, tut es.
