---
title: "Befehl ZYLINDER (CYLINDER) in AutoCAD"
description: "So zeichnet AutoCADs ZYLINDER (CYLINDER, Alias ZYL) einen 3D-Zylinder: Grundfläche, Radius, Höhe, 3P, 2P, Ttr, Elliptisch, Achsenendpunkt. Online testen."
figure: "Ein Zylinder mit Radius 20 und Höhe 40, vom Mittelpunkt seiner Grundfläche aus, von Südosten im visuellen Stil Hidden gesehen."
sourceHash: "ce397d8dcb5d"
---

ZYLINDER (CYLINDER) zeichnet einen 3D-Zylinder als Volumenkörper: Geben Sie den Mittelpunkt seiner Grundfläche an, dann den Radius, dann die Höhe. Die Grundfläche liegt auf der XY-Ebene des BKS, auf der Z-Höhe des Mittelpunkts, und die Höhe steigt entlang seiner Z-Achse; eine negative geht nach unten, und ein Punkt gibt sie durch seinen Abstand von der Grundfläche an, wie bei <Command id="BOX" />. Radius und Höhe werden als Vorgaben angeboten, die die Eingabetaste übernimmt, geteilt mit den anderen Grundkörpern und <Command id="EXTRUDE" />. Der Zylinder liegt auf dem aktuellen Layer, und Rückgängig nimmt ihn in einem Schritt zurück.

Der Zylinder behält seine Maße: <Command id="LIST" /> zeigt seine Position, Normale, Radius und Höhe, und in der Eigenschaften-Palette können Sie Radius und Höhe eintippen. Seine Griffe verschieben ihn, legen seine Höhe fest und, an jedem Viertel der Grundfläche, seinen Radius. Er ist für <Command id="UNION" />, <Command id="SUBTRACT" /> und den Rest von MellowCADs 3D ein 3D-Volumenkörper, und dieses 3D besteht nur aus Volumenkörpern und ist noch unvollständig.

## Options

### 3P

Beim Mittelpunkt der Grundfläche: fragt nach drei Punkten, und die Grundfläche ist der Kreis durch sie, in ihrer Ebene. Drei Punkte auf der XY-Ebene des BKS lassen den Zylinder dennoch entlang Z steigen.

### 2P

Beim Mittelpunkt der Grundfläche: fragt nach den beiden Enden des Durchmessers der Grundfläche; das zweite wird in der Ebene des ersten gelesen.

### Ttr

Beim Mittelpunkt der Grundfläche: Wählen Sie zwei Linien, Kreise oder Bögen unter dem Objektfang Tangent und geben Sie einen Radius an: Die Grundfläche berührt beide, nahe der gewählten Punkte, auf ihrer Höhe.

### Elliptical

Beim Mittelpunkt der Grundfläche: Die Grundfläche ist eine Ellipse. Geben Sie beide Enden ihrer ersten Achse an, dann das Ende der zweiten; oder wählen Sie <Keyword id="Center" /> und geben Sie ihren Mittelpunkt an, die halbe Länge der ersten Achse, dann das Ende der zweiten Achse.

### Diameter

Beim Radius: fragt stattdessen nach dem Durchmesser und bietet das Doppelte des letzten Radius an.

### 2Point

Bei der Höhe: fragt nach zwei Punkten, und die Höhe ist der Abstand zwischen ihnen.

### Axis

Bei der Höhe: fragt nach dem anderen Ende der Achse. Der Zylinder verläuft vom Mittelpunkt der Grundfläche zu diesem Punkt in beliebiger Richtung, seine Grundfläche senkrecht zur Achse.

## Missing

<Command id="EXPLODE" /> eines Zylinders, den AutoCAD in seine zwei Enden und eine Fläche zerlegt: MellowCAD hat keine Flächen und meldet, dass es ihn nicht zerlegen konnte. Verschieben, Drehen, Skalieren und Spiegeln über einen heißen Griff, und eine über die Grundfläche hinaus gezogene Höhe. Die gepunkteten Bemaßungen, die AutoCAD zeichnet, während Sie Radius, die Punkte der Ellipse und die Achse angeben. Das Umwandeln eines runden Zylinders in einen elliptischen in der Eigenschaften-Palette. Die Silhouetten, die AutoCADs `DISPSILH` zeichnet. In der Draufsicht, wo der obere Kreis den der Grundfläche verdeckt, findet der Objektfang Nearest den Kreis der Grundfläche, wo AutoCAD den oberen findet. Die visuellen Stile, die <Command id="VSCURRENT" /> über 2D-Drahtmodell, Hidden und Conceptual hinaus fehlen.

## Questions

### Wie lautet das Kürzel für ZYLINDER (CYLINDER) in AutoCAD?

`ZYL`. Tippen Sie es und drücken Sie die Eingabetaste oder Leertaste, geben Sie dann den Mittelpunkt der Grundfläche, den Radius und die Höhe an: `0,0`, `20` und `40` zeichnen den Zylinder der Sitzung.

### Wie zeichne ich einen liegenden Zylinder?

Wählen Sie bei der Höhe <Keyword id="Axis" /> und geben Sie das andere Ende der Achse an: Von einer Grundfläche bei `0,0,0` aus legt der Punkt `60,0,0` den Zylinder entlang X.

### Wie mache ich einen Hohlzylinder oder ein Rohr?

Zeichnen Sie zwei Zylinder vom selben Mittelpunkt aus, den inneren schmaler, und starten Sie dann <Command id="SUBTRACT" />: den äußeren wählen, Eingabetaste, den inneren wählen, Eingabetaste.

### Warum sieht mein Zylinder wie ein Kreis aus?

Sie betrachten ihn von oben, in der Draufsicht. Drehen Sie die Ansicht: eine Ecke des ViewCube, <Command id="-VIEW" /> und <Keyword command="VIEW" id="SEiso" />, oder <Command id="3DORBIT" />.
