---
title: "Befehl KUGEL (SPHERE) in AutoCAD"
description: "So zeichnet AutoCADs KUGEL (SPHERE) eine 3D-Kugel als Volumenkörper: Mittelpunkt und Radius, Durchmesser, 3P, 2P und Ttr, und warum sie als Linien erscheint."
figure: "Eine Kugel mit Radius 25 von ihrem Mittelpunkt aus, von Südosten im visuellen Stil Conceptual gesehen."
sourceHash: "a35a57352d16"
---

KUGEL (SPHERE) zeichnet eine 3D-Kugel als Volumenkörper: Geben Sie den Mittelpunkt an, dann den Radius. Ein mit der Maus gewählter Radius wird auf der Ebene durch den Mittelpunkt gelesen, und der letzte Radius wird als Vorgabe angeboten, die die Eingabetaste übernimmt, geteilt mit <Command id="CYLINDER" />, <Command id="CONE" /> und den anderen Grundkörpern. Die Kugel liegt auf dem aktuellen Layer, und Rückgängig nimmt sie in einem Schritt zurück.

In 2D-Drahtmodell und Hidden wird sie als Linien gezeichnet: Meridiane und Breitenkreise, so viele, wie `ISOLINES` angibt, und nichts anderes als ihr Mittelpunkt lässt sich darauf fangen. <Command id="LIST" /> zeigt ihre Position und ihren Radius, und in der Eigenschaftenpalette können Sie den Radius oder den Durchmesser eintippen. Ihre Griffe verschieben sie und legen, an jedem Viertel ihres Äquators, ihren Radius fest. Sie ist für <Command id="UNION" />, <Command id="SUBTRACT" /> und den Rest von MellowCADs 3D ein 3D-Volumenkörper, und dieses 3D besteht nur aus Volumenkörpern und ist noch unvollständig.

## Options

### 3P

Beim Mittelpunkt: fragt nach drei Punkten, und die Kugel wird auf den Kreis durch sie zentriert, mit seinem Radius.

### 2P

Beim Mittelpunkt: fragt nach den zwei Enden eines Durchmessers, irgendwo im Raum.

### Ttr

Beim Mittelpunkt: Wählen Sie zwei Linien, Kreise oder Bögen unter dem Objektfang Tangent und geben Sie einen Radius an: Der Mittelpunkt liegt auf dem Kreis dieses Radius, der beide berührt, auf ihrer Höhe.

### Diameter

Beim Radius: fragt stattdessen nach dem Durchmesser und bietet das Doppelte des letzten Radius an.

## Missing

<Command id="EXPLODE" /> einer Kugel, die AutoCAD in eine Fläche zerlegt: MellowCAD hat keine Flächen und meldet, dass es sie nicht zerlegen konnte. Verschieben, Drehen, Skalieren und Spiegeln über einen heißen Griff, und die eigenen 3D-Befehle (3DMOVE, 3DROTATE, 3DSCALE). Die Silhouette, die AutoCADs `DISPSILH` zeichnet. Die visuellen Stile, die <Command id="VSCURRENT" /> über 2D-Drahtmodell, Hidden und Conceptual hinaus fehlen.

## Questions

### Wie erstelle ich in AutoCAD eine Kugel?

Starten Sie KUGEL, geben Sie den Mittelpunkt an, dann den Radius: `0,0,0` und `25` zeichnen die Kugel der Sitzung. Drehen Sie die Ansicht, um sie rund zu sehen, mit einer Ecke des ViewCube oder <Command id="-VIEW" /> und <Keyword command="VIEW" id="SEiso" />.

### Warum sieht meine Kugel wie ein Kreis mit Linien aus?

2D-Drahtmodell und Hidden zeichnen eine Kugel als ihre Meridiane und Breitenkreise; in der Draufsicht sind sie ein Kreis und Linien durch ihn. <Command id="VSCURRENT" /> mit <Keyword command="VSCURRENT" id="Conceptual" /> schattiert sie, und `ISOLINES` legt fest, wie viele Linien sie zeigt.

### Wie mache ich eine Halbkugel?

Zeichnen Sie die Kugel und schneiden Sie sie dann mit <Command id="SLICE" /> durch ihren Mittelpunkt: drei Punkte auf der Ebene, oder <Keyword command="SLICE" id="XY" /> und den Mittelpunkt, und die Seite, die bleiben soll.

### Wie zeichne ich eine Kugel über ihren Durchmesser?

Wählen Sie beim Radius <Keyword id="Diameter" /> und tippen Sie den Durchmesser. Mit <Keyword id="2P" /> platzieren auch die zwei Enden eines Durchmessers sie.
