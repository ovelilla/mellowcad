---
title: "Befehl BRUCH (BREAK) in AutoCAD"
description: "Wie BRUCH (BREAK, Alias BR) in AutoCAD funktioniert: Die Auswahl ist der erste Punkt, dann der zweite, oder Erster Punkt; Bruch an einem Punkt."
figure: "Eine Linie, zwischen zwei mit Erster Punkt angegebenen Punkten gebrochen, und ein Kreis, von der Stelle seiner Auswahl gegen den Uhrzeigersinn bis zu einem zweiten Punkt gebrochen."
sourceHash: "f351112ef2fc"
---

BRUCH (BREAK) schneidet eine Lücke aus einem Objekt oder teilt es in zwei. Wählen Sie das Objekt: Wie in AutoCAD ist der Punkt, an dem Sie es gewählt haben, der erste Bruchpunkt, die nächste Eingabeaufforderung fragt also nur nach dem zweiten, und der Teil dazwischen wird entfernt. Eine Linie, ein Bogen, eine offene Polylinie, ein Ellipsenbogen oder ein Spline verliert den Teil zwischen den Punkten und wird zu zwei Objekten; ein Kreis oder eine Ellipse verliert den Teil, der gegen den Uhrzeigersinn vom ersten zum zweiten Punkt verläuft, und eine geschlossene Polylinie den Teil dazwischen in der Reihenfolge ihrer Scheitelpunkte: Jedes wird ein offenes Objekt. Ein Punkt abseits des Objekts wird an seinem nächsten Punkt genommen, und einer hinter einem Ende schneidet bis zu diesem Ende. Während Sie den zweiten Punkt angeben, wird der Teil, den BRUCH behalten würde, über dem Objekt gezeigt. Der Bruch ist ein Rückgängig-Schritt.

## Options

### First point

Beim zweiten Bruchpunkt: Geben Sie den ersten Bruchpunkt erneut an, dann den zweiten, wenn die Stelle, an der Sie das Objekt gewählt haben, nicht der Beginn der Lücke ist.

## Missing

Ein Bogen, ein Kreis oder eine Ellipse, die nicht eben zum BKS liegt, die AutoCAD bricht und MellowCAD nicht findet. Eine ganze Ellipse, die <Command id="MIRROR" /> umgedreht hat und die AutoCAD andersherum bricht.

## Questions

### Wie lautet das Kürzel für BRUCH (BREAK) in AutoCAD?

`BR`, dann die Eingabetaste oder die Leertaste. Der vollständige Name funktioniert ebenfalls, ebenso `_BREAK` in jeder Sprache von AutoCAD.

### Wie breche ich eine Linie an einem Punkt?

Starten Sie <Command id="BREAKATPOINT" />, wählen Sie die Linie und geben Sie den Punkt an: Sie wird zu zwei Linien, die dort zusammentreffen. In BRUCH bewirkt `@` beim zweiten Bruchpunkt dasselbe.

### Wie breche ich eine Linie zwischen zwei Punkten?

Wählen Sie die Linie, wählen Sie <Keyword id="First point" /> und geben Sie dann den ersten und den zweiten Punkt an: Der Teil dazwischen wird entfernt. Oder wählen Sie die Linie am ersten Punkt und geben Sie nur den zweiten an.

### Warum kann ich einen Block oder einen Text nicht brechen?

BRUCH bricht Linien, Bögen, Kreise, Polylinien, Ellipsen und Splines. Eine Blockreferenz ergibt <Message id="cannotBreakBlock" />, ein Text, eine Bemaßung oder eine Schraffur <Message id="objectCannotBeBroken" />; lösen Sie einen Block zuerst mit <Command id="EXPLODE" /> auf, um seine Teile zu brechen.

### In welche Richtung schneidet BRUCH einen Kreis?

Gegen den Uhrzeigersinn, vom ersten zum zweiten Punkt, wie in AutoCAD. Geben Sie die Punkte andersherum an, um den anderen Teil zu behalten.
