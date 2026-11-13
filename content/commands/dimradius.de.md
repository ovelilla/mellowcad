---
title: "Befehl BEMRADIUS (DIMRADIUS) in AutoCAD"
description: "So bemaßt AutoCADs BEMRADIUS (DIMRADIUS, Alias BMRAD) einen Kreis, Bogen oder eine Rundung: die Kurve wählen, dann den Text R innen oder außen platzieren."
figure: "Die gerundete Ecke einer Platte außen bemaßt und ihr Loch innen: jede Kurve gewählt, dann der Text platziert."
sourceHash: "6b1cdea584be"
---

BEMRADIUS (DIMRADIUS) bemaßt den Radius eines Kreises, eines Bogens oder des Bogensegments einer Polylinie. Wählen Sie die Kurve, und die Befehlszeile meldet sofort das Maß; platzieren Sie dann die Bemaßung, und der Befehl endet. Wie in AutoCAD ist ihr Text der Radius nach einem R, auf einer Linie entlang eines Radius, die in einer Pfeilspitze auf der Kurve endet, innerhalb oder außerhalb der Kurve, je nachdem, wo Sie sie platzieren. Außen läuft die Linie über die Kurve hinweg zum Mittelpunkt weiter, wie ISO-25 sie zeichnet.

## Options

### Text

Fragt nach dem Text, der statt des Maßes geschrieben werden soll, das als Vorgabe angeboten wird: Die Eingabetaste behält das Maß. In dem, was Sie eingeben, steht `<>` für das Maß mit seinem R, sodass `<> TYP` bei einem Radius von 10 `R10 TYP` schreibt.

### Angle

Fragt nach dem Winkel des Textes, der dann in diesem Winkel gezeichnet wird, seine Mitte auf der Linie, und die Linie hört bei ihm auf. 0 setzt ihn wieder entlang der Linie.

## Missing

Mtext: Der Text einer Bemaßung ist eine Zeile, festgelegt mit <Keyword id="Text" /> in der Befehlszeile, nie im Texteditor. Bei einem Bogen bleibt die Pfeilspitze zwischen seinen Enden, wo AutoCAD für eine Bemaßung jenseits davon eine Bogen-Maßhilfslinie zeichnet. Eine Kurve in einer Blockreferenz lässt sich nicht wählen. Die Mittellinien des Stils (eine negative Größe der Mittelmarke) werden nicht gezeichnet, und seine Einstellungen für Text außerhalb der Kurve werden nicht angeboten: Der Text läuft immer entlang der Linie, ohne Landelinie, wie ISO-25 es zeichnet. Eine Bemaßung ist nicht assoziativ: Sie folgt der Kurve, die sie misst, nicht.

## Questions

### Wie lautet das Kürzel für BEMRADIUS (DIMRADIUS) in AutoCAD?

`BMRAD`, danach Eingabetaste oder Leertaste. Auch der vollständige Name funktioniert, ebenso `_DIMRADIUS` in jeder Sprache von AutoCAD.

### Wie bemaße ich eine Abrundung oder eine gerundete Ecke?

Wählen Sie die Rundung: Eine Abrundung ist ein Bogen oder das Bogensegment einer Polylinie, wie die Ecken, die <Command id="RECTANG" /> mit seiner Option <Keyword command="RECTANG" id="Fillet" /> rundet, und BEMRADIUS nimmt beides.

### Warum kann ich das zu bemaßende Objekt nicht wählen?

BEMRADIUS nimmt einen Kreis, einen Bogen oder das Bogensegment einer Polylinie, auch auf einem gesperrten Layer. Alles andere, auch eine Ellipse, ergibt <Message id="notCircleOrArc" /> und es wird erneut gefragt; eine Kurve in einer Blockreferenz lässt sich noch nicht wählen.

### Wie füge ich TYP zu einer Radiusbemaßung hinzu?

Wählen Sie <Keyword id="Text" /> vor dem Platzieren und geben Sie `<> TYP` ein: `<>` ist das Maß mit seinem R, sodass die Bemaßung `R10 TYP` liest. Ist sie platziert, ändert die Textüberschreibung der Eigenschaften-Palette sie.
