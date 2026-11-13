---
title: "Befehl KAPPEN (SLICE) in AutoCAD"
description: "Wie KAPPEN (SLICE, Alias KA) in AutoCAD funktioniert: die Volumenkörper, eine Ebene durch zwei Punkte, 3 Punkte, ein Objekt oder das BKS."
figure: "Ein Zylinder, durch zwei Punkte entlang seiner Achse gekappt, die Hälfte auf der gewählten Seite bleibt: von Südosten gesehen."
sourceHash: "07b1512fb042"
---

KAPPEN (SLICE) schneidet 3D-Volumenkörper mit einer Ebene und behält den Teil auf einer Seite, oder beide Teile als zwei Volumenkörper. Der Befehl fragt bis zur Eingabetaste nach den zu kappenden Volumenkörpern: Wie in AutoCAD 2027 wird eine vorher gewählte Menge verworfen und erneut abgefragt, und was kein Volumenkörper ist, wird übergangen. Dann folgt die Ebene: Standardmäßig geben Sie zwei Punkte an, und sie steht senkrecht durch sie, rechtwinklig zur XY-Ebene des BKS; die Optionen legen sie auf andere Weise fest. Zuletzt ein Punkt auf der Seite, die bleiben soll, oder die Eingabetaste, um beide zu behalten.

Jeder Volumenkörper der Menge wird von derselben Ebene geschnitten. Einer, den die Ebene verfehlt oder nur an einer Fläche, entlang einer Kante oder an einer Ecke berührt, bleibt, wie er war, und KAPPEN meldet es. Ein gekappter Volumenkörper ist kein Quader oder Zylinder mehr und hat keinen Verlauf. Der ganze Befehl ist ein Rückgängig-Schritt. Das 3D von MellowCAD ist noch unvollständig: Volumenkörper gibt es, Flächen und Netze nicht.

## Options

### Object

Nimmt die Ebene eines Objekts, das Sie auswählen: eines Kreises, einer Ellipse, eines Bogens, einer 2D-Polylinie oder eines ebenen Splines, auch eines geneigten Kreises. Eine Linie oder der Volumenkörper selbst hat keine eigene Ebene: Es erscheint <Message id="unableToExtractPlane" />, und es wird erneut gefragt. Die Eingabetaste beendet den Befehl.

### Surface

Fragt nach einer Fläche, entlang der geschnitten wird. MellowCAD hat noch keine Flächen, eine Auswahl ergibt also <Message id="noSurfacesSelected" />, und die Eingabetaste beendet den Befehl.

### Zaxis

Fragt nach einem Punkt auf der Ebene, dann nach einem Punkt auf ihrer Z-Achse, der Linie senkrecht dazu. Beide dürfen nicht derselbe Punkt sein.

### View

Die Ebene parallel zum Bildschirm, durch einen Punkt, den Sie angeben; die Eingabetaste nimmt 0,0,0.

### XY

Die XY-Ebene des BKS, durch einen Punkt, den Sie angeben: Ein Punkt in einer Höhe ergibt dort einen waagerechten Schnitt. Die Eingabetaste nimmt den Ursprung des BKS.

### YZ

Die YZ-Ebene des BKS, durch einen Punkt, den Sie angeben; die Eingabetaste nimmt den Ursprung des BKS.

### ZX

Die ZX-Ebene des BKS, durch einen Punkt, den Sie angeben; die Eingabetaste nimmt den Ursprung des BKS.

### 3points

Drei Punkte auf der Ebene, die dann beliebig geneigt sein darf. Das ist die Vorgabe der ersten Eingabeaufforderung, die Eingabetaste wählt sie also dort. Der zweite Punkt muss sich vom ersten unterscheiden, und der dritte darf nicht auf der Linie durch beide liegen.

### Both

Bei der Eingabeaufforderung der Seite und ihre Vorgabe, die Eingabetaste wählt sie also: Beide Teile bleiben. Der Volumenkörper behält einen, und der andere wird ein neuer Volumenkörper mit demselben Layer, derselben Farbe, demselben Linientyp und derselben Linienstärke, nicht den aktuellen. Ein Punkt behält stattdessen die Seite, auf der er liegt, und verwirft die andere; ein Punkt auf der Ebene wird abgelehnt.

## Missing

Flächen, als Schnittebene und als zu kappende Objekte, und Netze. Eine ebene 3D-Polylinie als Objekt der Ebene, die AutoCAD annimmt. Ein Torus oder ein Rotationskörper, weder senkrecht zu seiner Achse noch entlang ihr geschnitten, und die anderen Schnitte, für die MellowCAD noch keine exakte Form hat; sie melden, dass eine boolesche Operation fehlgeschlagen ist.

## Questions

### Wie lautet das Kürzel für KAPPEN (SLICE) in AutoCAD?

`KA`, dann die Eingabetaste oder die Leertaste. Der vollständige Name funktioniert ebenfalls, ebenso `_SLICE` in jeder Sprache von AutoCAD.

### Wie verwende ich KAPPEN in AutoCAD 3D?

Wählen Sie den Volumenkörper und drücken Sie die Eingabetaste. Wählen Sie zwei Punkte, durch die der Schnitt verläuft: Die Ebene steht senkrecht durch sie. Wählen Sie dann einen Punkt auf der Seite, die bleiben soll, oder drücken Sie die Eingabetaste, um beide Hälften zu behalten und eine mit <Command id="MOVE" /> wegzuschieben. Für einen schrägen Schnitt wählen Sie <Keyword id="3points" /> und geben drei Punkte darauf an.

### Kann KAPPEN Linien oder 2D-Objekte schneiden?

Nein: KAPPEN schneidet 3D-Volumenkörper und übergeht Linien, Regionen und Blöcke; eine Menge nur aus ihnen beendet den Befehl. Um 2D-Objekte zu schneiden, verwenden Sie <Command id="TRIM" /> oder <Command id="BREAK" />. In AutoCAD schneidet KAPPEN auch Flächen und Netze, die MellowCAD noch nicht hat.

### Warum meldet KAPPEN, dass die Schnittebene den Volumenkörper nicht schneidet?

Weil die Ebene ihn verfehlt oder nur an einer Fläche, entlang einer Kante oder an einer Ecke berührt: Dieser Volumenkörper bleibt ganz. Prüfen Sie, wie die Ebene angegeben wurde. Mit zwei Punkten steht sie senkrecht, zwei Punkte auf der Deckfläche eines Volumenkörpers schneiden ihn also senkrecht, nicht waagerecht; für einen waagerechten Schnitt wählen Sie <Keyword id="XY" /> und geben einen Punkt in der Höhe des Schnitts an.
