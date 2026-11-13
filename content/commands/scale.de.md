---
title: "Befehl VARIA (SCALE): skalieren in AutoCAD"
description: "So ändert AutoCADs VARIA (SCALE, Alias V) die Größe von Objekten um einen Basispunkt: ein Faktor, Kopieren und Referenz für eine bekannte Länge. Gratis testen."
figure: "Eine Platte und ihr Loch, mit Referenz an einer Kopie um ihre Ecke skaliert: die 40 lange Kante gewählt, dann auf 60 gebracht."
sourceHash: "005829bf17ad"
---

VARIA (SCALE) macht die gewählten Objekte um einen Basispunkt größer oder kleiner, der dort bleibt, wo er ist: Ein Faktor von 2 verdoppelt sie, 0,5 halbiert sie, in jeder Richtung gleich. Wählen Sie die Objekte, wählen Sie den Basispunkt, tippen Sie dann den Faktor, oder bewegen Sie den Cursor und klicken: Die Objekte folgen ihm. Die Eingabetaste dort, ohne etwas zu tippen, skaliert mit dem zuletzt verwendeten Faktor. Jeder Durchlauf ist ein Schritt, den Rückgängig zurücknimmt.

Es skaliert alles, was es nimmt, wie AutoCAD: Das Muster einer Schraffur wächst mit ihrer Begrenzung, eine Bemaßung misst ihre neue Länge, ein Objekt über der Ebene wird auch in Z um den Basispunkt skaliert.

## Options

### Copy

Skaliert eine Kopie und lässt die Objekte, wie sie waren: Es meldet <Message id="scalingCopy" /> und fragt erneut nach dem Faktor, <Keyword id="Copy" /> weiterhin aufgelistet.

### Reference

Fragt nach einer Referenzlänge, getippt oder als zwei Punkte gewählt, dann nach der Länge, die sie haben soll: Der Faktor ist die neue Länge geteilt durch die Referenz. Die neue Länge wird getippt, oder ein Punkt, dessen Abstand vom Basispunkt sie ist; <Keyword id="Points" /> fragt stattdessen zwei Punkte ab und misst zwischen ihnen. Beide Längen bieten die zuletzt angegebenen an, 1 in einer neuen Zeichnung.

## Missing

Die Eingabetaste beim ersten oder zweiten Punkt von <Keyword id="Points" /> beendet den Befehl ohne Skalierung, wo AutoCAD mit dem Wert des Cursors dort skaliert. Ein winziger Faktor wird stillschweigend angewendet, wo AutoCAD meldet, dass es ihn ignoriert. Die gezogenen Objekte werden so gezeichnet, wie <Command id="MOVE" /> sie zieht, nur in ihrer Farbe.

## Questions

### Wie lautet das Kürzel für VARIA (SCALE) in AutoCAD?

`V`, danach Eingabetaste oder Leertaste. Vorsicht: In der deutschen AutoCAD-Version heißt der Befehl VARIA, nicht SKALIEREN, und `SC` gibt es nicht. `_SCALE` funktioniert in jeder Sprache von AutoCAD.

### Wie skaliere ich in AutoCAD mit einer Referenz?

Wählen Sie <Keyword id="Reference" /> beim Faktor, wählen Sie die zwei Enden einer Kante, deren Länge Sie kennen, und tippen Sie dann die Länge, die sie haben soll. Alles Gewählte wird mit der neuen Länge geteilt durch die alte skaliert, sodass eine Zeichnung in falscher Größe mit einem bekannten Maß stimmt.

### Wie skaliere ich ein Objekt und behalte das Original?

Wählen Sie <Keyword id="Copy" /> beim Faktor: Die Kopie wird skaliert, das Original bleibt, wo es war.

### Wie ändere ich den Linientypfaktor?

Nicht mit VARIA, das die Objekte vergrößert oder verkleinert: <Command id="LTSCALE" /> legt fest, wie lang die Striche und Lücken jedes Linientyps gezeichnet werden.

### Wie lege ich einen Plot- oder Layoutmaßstab fest?

MellowCAD hat keine Layouts, Ansichtsfenster oder Plots: Sie zeichnen im Modellbereich in Originalgröße, und VARIA ändert die Größe der Objekte selbst, nicht, wie sie gedruckt würden.
