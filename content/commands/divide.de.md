---
title: "Befehl TEILEN (DIVIDE) in AutoCAD"
description: "So arbeitet AutoCADs TEILEN (DIVIDE, Alias TL): Punkte oder Blöcke in gleichen Abständen auf Linie, Kreis, Bogen oder Polylinie, und warum Punkte fehlen."
figure: "PDMODE 3, damit die Punkte als Kreuze erscheinen, dann eine Linie in 5 geteilt und ein Kreis in 6, der an seinem 0°-Punkt beginnt."
sourceHash: "6f3c52078466"
---

TEILEN (DIVIDE) teilt ein Objekt in gleiche Teile ein. Wählen Sie eine Linie, einen Bogen, einen Kreis, eine Ellipse, einen elliptischen Bogen, eine Polylinie, eine 3D-Polylinie oder einen Spline, durch Anklicken oder durch Eingabe eines Punkts darauf, und geben Sie dann die Anzahl der Segmente an, von 2 bis 32767: TEILEN setzt an jede Teilung ein Punktobjekt und endet. Das Objekt wird nicht geschnitten, es bleibt ganz. Ein offenes Objekt, in 5 geteilt, bekommt 4 Punkte, von seinem Anfang an; ein geschlossenes bekommt 5, sein Anfang eingeschlossen: ein Kreis von seinem 0°-Punkt aus, gegen den Uhrzeigersinn, eine geschlossene Polylinie von ihrem ersten Scheitelpunkt aus. Die Punkte liegen auf dem Objekt, in seiner Höhe, auf dem aktuellen Layer mit der aktuellen Farbe, dem aktuellen Linientyp und der aktuellen Linienstärke.

Die Punkte werden so gezeichnet, wie es der Punktstil der Zeichnung vorgibt, und die Vorgabe ist ein Punkt, der sich unter der Linie versteckt: Legen Sie zuerst mit <Command id="PTYPE" /> oder PDMODE eine sichtbare Figur fest. Die ganze Teilung ist ein Schritt, den <Command id="U" /> zurücknimmt, und ihre Punkte sind die Auswahl Vorheriges, bereit zum Löschen oder Verschieben. Jedes andere Objekt, ein Text oder eine Blockreferenz, ergibt <Message id="cannotDivideObject" />, und der Befehl endet. Auch die Dropdown-Liste Punkte der Zeichenwerkzeuge startet TEILEN.

## Options

### Block

Statt Punkten Blockreferenzen eines Blocks, der schon in der Zeichnung ist: Geben Sie seinen Namen an, dann ob jede am Objekt ausgerichtet werden soll, <Keyword id="Yes" /> (die Vorgabe) oder <Keyword id="No" />, dann die Anzahl der Segmente. Ausgerichtet dreht sich jede Blockreferenz an ihrer Stelle mit dem Objekt, entlang einer Linie oder tangential an einen Bogen; nicht ausgerichtet behält jede die X-Richtung des BKS. Ein Name ohne Block dahinter wird abgelehnt und der Name erneut gefragt. Die variablen Attribute des Blocks entfallen, wie in AutoCAD.

## Missing

Eine Helix, die MellowCAD noch nicht zeichnen kann. Blöcke entlang eines Objekts, das nicht in der Ebene des BKS liegt, werden in die Ebene des BKS gelegt, wo AutoCADs Hilfe sie in die eigene Ebene des Objekts legt. Die Punkte eines Kreises beginnen immer entlang der X-Achse des BKS, wo AutoCAD sie beim Fangwinkel SNAPANG beginnt, den MellowCAD nicht hat.

## Questions

### Wie lautet das Kürzel für TEILEN (DIVIDE) in AutoCAD?

`TL`, danach Eingabetaste oder Leertaste. Auch der vollständige Name funktioniert, ebenso `_DIVIDE` in jeder Sprache von AutoCAD.

### Warum funktioniert der Befehl TEILEN nicht?

Höchstwahrscheinlich funktioniert er: Die Punkte sind da, als Punkte auf der Linie gezeichnet. Öffnen Sie <Command id="PTYPE" /> (`DDPTYPE`) und wählen Sie ein Kreuz oder einen Kreis, oder geben Sie PDMODE und `3` ein: Jeder Punkt der Zeichnung ändert sich auf einmal. Um sie zu wählen, verwenden Sie den Objektfang Punkt, `NOD`.

### Wie teile ich eine Linie in gleiche Teile?

Starten Sie TEILEN, wählen Sie die Linie und geben Sie die Anzahl der Teile ein, `5` für fünf. Die vier Punkte zwischen den Teilen sind die Stellen zum Fangen: Der Objektfang Punkt findet sie.

### Wie teile ich einen Kreis in gleiche Teile?

Genauso: Wählen Sie den Kreis und geben Sie die Anzahl der Teile ein. Ein geschlossenes Objekt bekommt so viele Punkte wie Teile, also ergibt 6 sechs Punkte, den ersten am 0°-Punkt des Kreises, dann gegen den Uhrzeigersinn.

### Wie trenne ich eine Linie in einzelne Stücke?

TEILEN markiert nur die Stellen. Um die Linie dort zu schneiden, verwenden Sie <Command id="BREAK" />, oder <Command id="BREAKATPOINT" /> an jedem Punkt, auf den Sie mit dem Objektfang Punkt fangen.
