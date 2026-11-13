---
title: "Befehl ABRUNDEN (FILLET) in AutoCAD"
description: "So arbeitet AutoCADs ABRUNDEN (FILLET, Alias AR): Radius, zwei Linien, die Ecken einer Polylinie, Radius 0 und Mehrfach. Gratis im Browser testen."
figure: "Vier Linien, dann Radius 15 und Mehrfach: zwei Ecken abgerundet, zwei bleiben scharf."
sourceHash: "f97d737f74a9"
---

ABRUNDEN (FILLET) rundet die Ecke zwischen zwei Objekten mit einem Bogen des angegebenen Radius ab und stutzt oder dehnt jedes Objekt bis dorthin. Seine erste Zeile meldet den Modus und den aktuellen Radius; dann wählen Sie das erste und das zweite Objekt, jedes auf der Seite, die bleiben soll, und der Befehl endet. Er nimmt Linien, Bögen, Kreise, Ellipsen, Splines und die Segmente einer 2D-Polylinie. Zwei Linien müssen sich nicht treffen: Sie werden bis zum Bogen gedehnt, wie in AutoCAD. Bei Radius 0, oder mit gedrückter Umschalttaste bei der zweiten Wahl, entsteht stattdessen eine scharfe Ecke.

## Options

### Undo

Nimmt das letzte Abrunden, <Keyword id="Polyline" /> oder die angegebenen Radien dieses ABRUNDEN zurück, eines nach dem anderen. Ist nichts mehr zurückzunehmen, meldet er <Message id="commandCompletelyUndone" />

### Polyline

Fragt nach einer 2D-Polylinie und rundet in einem Schritt jede Ecke ab, an der zwei ihrer Segmente zusammentreffen, und meldet dann, wie viele es abgerundet und wie viele es übergangen hat, parallele oder für den Radius zu kurze. Ein mit <Command id="RECTANG" /> gezeichnetes Rechteck ist eine solche Polylinie.

### Radius

Fragt nach dem Radius, auch bei der zweiten Eingabeaufforderung angeboten. Er gehört der Zeichnung (FILLETRAD): Das nächste ABRUNDEN beginnt mit ihm, und er wird mit der Zeichnung gespeichert. 0 ergibt scharfe Ecken; ein negativer Radius wird abgelehnt.

### Multiple

Fragt nach jedem Abrunden erneut nach dem ersten Objekt, sodass Sie Ecke um Ecke abrunden, ohne neu zu beginnen, bis zur Eingabetaste.

## Missing

Stutzen: Die Objekte werden immer bis zum Bogen gestutzt oder gedehnt, wie mit TRIMMODE 1, AutoCADs Vorgabe; Nicht stutzen wird nicht angeboten. Der Bogen übernimmt nicht den Linientypfaktor des zweiten Objekts, da hier kein Objekt einen eigenen hat. Vor dem Klick zeigt der Tooltip die Eingabeaufforderung statt zu nennen, warum ein Paar nicht abgerundet werden kann, und kein Vorhängeschloss markiert ein Objekt auf einem gesperrten Layer. Einige seltene Paare aus Ellipsen oder Splines enden anders: ein geschlossener Spline mit einer Linie bei Radius 0, ein Bogen, der nur den Versatz einer Ellipse berührt, und ein solches Paar in einer geneigten Ebene.

## Questions

### Wie lautet das Kürzel für ABRUNDEN (FILLET) in AutoCAD?

`AR`, danach Eingabetaste oder Leertaste. Vorsicht: In der deutschen AutoCAD-Version ist `F` nicht ABRUNDEN, sondern FANG (SNAP). Auch der vollständige Name funktioniert, ebenso `_FILLET` in jeder Sprache von AutoCAD.

### Wie runde ich zwei Linien ab?

Wählen Sie <Keyword id="Radius" />, geben Sie ihn ein und wählen Sie dann jede Linie auf der Seite, die bleiben soll. Linien, die sich nicht treffen, werden bis zum Bogen gedehnt, und Linien, die sich kreuzen, werden bis zu ihm zurückgestutzt. Zwei parallele Linien werden von einem Halbkreis verbunden, welcher Radius auch gilt. Eine Linie und das Segment einer Polylinie werden zu einer Polylinie verbunden.

### Was bewirkt ein Abrundungsradius von 0?

Er macht eine scharfe Ecke: Jede Linie wird gestutzt oder gedehnt, bis sie sich treffen, und es wird kein Bogen gezeichnet. Für eine einzelne scharfe Ecke, ohne den Radius zu ändern, halten Sie bei der Wahl des zweiten Objekts die Umschalttaste gedrückt.

### Warum funktioniert ABRUNDEN nicht?

Er nennt den Grund in der Befehlszeile. <Message id="filletRadiusTooLarge" /> bedeutet, dass der Bogen nicht zwischen die Linien passt; <Message id="segmentsNotConsecutive" />, dass zwei Segmente einer Polylinie zu weit auseinanderliegen; Text, Blöcke, Bemaßungen und Schraffuren werden abgelehnt, Objekte in unterschiedlicher Höhe gelten als nicht koplanar, und ein Objekt auf einem gesperrten Layer wird nicht berücksichtigt.

### Wie runde ich die Kanten eines 3D-Volumenkörpers ab?

Starten Sie <Command id="FILLETEDGE" />: Wählen Sie <Keyword command="FILLETEDGE" id="Radius" />, wenn der Radius nicht der genannte ist, wählen Sie die Kanten des Volumenkörpers, drücken Sie dann die Eingabetaste und noch einmal die Eingabetaste, um die Abrundung zu übernehmen. Er arbeitet mit 3D-Volumenkörpern, die hier noch unvollständig sind.
