---
title: "Befehl TORUS in AutoCAD"
description: "So zeichnet AutoCADs TORUS (Alias TOR) einen 3D-Ring als Volumenkörper: Mittelpunkt, Radius des Rings, Radius des Rohrs, Durchmesser, 3P, 2P und Ttr. Testen."
figure: "Ein Torus mit Radius 30 um ein Rohr mit Radius 8, von Südosten im visuellen Stil Konzeptuell gesehen."
sourceHash: "a19600f3e357"
---

TORUS zeichnet einen 3D-Ring als Volumenkörper, einen Donut: Geben Sie den Mittelpunkt an, dann den Radius des Rings, vom Mittelpunkt bis zur Mitte des Rohrs, dann den Radius des Rohrs. Der Ring liegt auf der XY-Ebene des BKS, auf der Z-Höhe des Mittelpunkts. Ein Punkt bei der Eingabeaufforderung für das Rohr wird vom Punkt des Rings aus gemessen, bei dem der Radius angegeben wurde. Der Radius des Rings ist die gemeinsame Vorgabe der Grundkörper, der Radius des Rohrs eine eigene Vorgabe, die die Eingabetaste übernimmt. Der Torus liegt auf dem aktuellen Layer, und Rückgängig nimmt ihn in einem Schritt zurück.

Ein negativer Radius des Rings mit einem weiteren Rohr ergibt einen Ball wie einen Rugbyball, mit spitzen Enden; ein Ring, der schmaler ist als sein Rohr, einen Apfel. In 2D-Drahtkörper und Hidden wird er als Linien um das Rohr und um den Ring gezeichnet, so viele, wie `ISOLINES` angibt. <Command id="LIST" /> zeigt seine Position, Normale, Torusradius und Rohrradius, und in der Eigenschaftenpalette können Sie beide eintippen. Seine Griffe verschieben ihn, legen den Radius des Rings fest und den des Rohrs. Er ist für <Command id="UNION" />, <Command id="SUBTRACT" /> und den Rest von MellowCADs 3D ein 3D-Volumenkörper, und dieses 3D besteht nur aus Volumenkörpern und ist noch unvollständig.

## Options

### 3P

Beim Mittelpunkt: fragt nach drei Punkten, und der Ring ist der Kreis durch sie, in ihrer Ebene.

### 2P

Beim Mittelpunkt: fragt nach den zwei Enden des Durchmessers des Rings.

### Ttr

Beim Mittelpunkt: Wählen Sie zwei Linien, Kreise oder Bögen unter dem Objektfang Tangent und geben Sie einen Radius an: Der Ring berührt beide, auf ihrer Höhe.

### Diameter

Beim Radius des Rings: fragt stattdessen nach dem Durchmesser des Torus. Beim Radius des Rohrs: fragt nach dem Durchmesser des Rohrs. Jede bietet das Doppelte ihrer Vorgabe an.

### 2Point

Beim Radius des Rohrs: fragt nach zwei Punkten, und der Radius des Rohrs ist der Abstand zwischen ihnen.

## Missing

<Command id="EXPLODE" /> eines Torus, den AutoCAD in eine Fläche zerlegt: MellowCAD hat keine Flächen und meldet, dass es ihn nicht zerlegen konnte. Verschieben, Drehen, Skalieren und Spiegeln über einen heißen Griff, und die Silhouette, die AutoCADs `DISPSILH` zeichnet.

## Questions

### Wie lautet das Kürzel für TORUS in AutoCAD?

`TOR`. Tippen Sie es und drücken Sie die Eingabetaste oder Leertaste, geben Sie dann den Mittelpunkt, den Radius des Rings und den des Rohrs an: `0,0,0`, `30` und `8` zeichnen den Torus der Sitzung.

### Was ist der Unterschied zwischen dem Radius und dem Rohrradius?

Der Radius reicht vom Mittelpunkt des Torus bis zur Mitte des Rohrs; der Rohrradius ist der eigene des Rohrs. Ein Torus, außen 76 breit, mit einem Rohr von 16 Dicke hat einen Radius von 30 und einen Rohrradius von 8.

### Wie zeichne ich einen Torus in Form eines Rugbyballs?

Geben Sie einen negativen Radius an, dann einen Rohrradius, der größer als sein Betrag ist: `-5` und `8` ergeben eine geschlossene Form mit spitzen Enden. Ein Rohrradius, der nicht größer ist, wird abgelehnt und erneut gefragt.

### Warum sieht mein Torus wie zwei Kreise aus?

Sie betrachten ihn von oben, in der Draufsicht. Drehen Sie die Ansicht: eine Ecke des ViewCube, <Command id="-VIEW" /> und <Keyword command="VIEW" id="SEiso" />, oder <Command id="3DORBIT" />. <Command id="VSCURRENT" /> mit <Keyword command="VSCURRENT" id="Conceptual" /> schattiert ihn.
