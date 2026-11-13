---
title: "Befehl PYRAMIDE (PYRAMID) in AutoCAD"
description: "So zeichnet AutoCADs PYRAMIDE (PYRAMID, Alias PYR) eine 3D-Pyramide: Seiten, Grundfläche, Höhe, Kante, Umkreis und Radius oben für einen Stumpf. Online testen."
figure: "Eine Pyramide mit sechs Seiten, ihre Grundfläche 25 bis zur Mitte jeder Seite und 40 hoch, von Südosten im visuellen Stil Verdeckt gesehen."
sourceHash: "acbc5ffa71cb"
---

PYRAMIDE (PYRAMID) zeichnet eine 3D-Pyramide als Volumenkörper: Ihre erste Zeile zeigt, wie viele Seiten die Grundfläche hat und wie ihr Radius gelesen wird, dann fragt sie nach dem Mittelpunkt der Grundfläche, dem Radius und der Höhe. Die Grundfläche ist ein regelmäßiges Polygon, wie <Command id="POLYGON" /> es zeichnet, zunächst mit 4 Seiten: Ein getippter Radius dreht es zum Cursor hin, ein Punkt zu sich selbst. Die Höhe steigt entlang der Z-Achse des BKS, eine negative geht nach unten, und ein Punkt gibt sie durch seinen Abstand von der Grundfläche an. Die Seitenzahl und die Art, den Radius zu lesen, bleiben für die nächste PYRAMIDE erhalten; Radius und Höhe sind die gemeinsamen Vorgaben der Grundkörper. Die Pyramide liegt auf dem aktuellen Layer, und Rückgängig nimmt sie in einem Schritt zurück.

<Command id="LIST" /> zeigt ihre Position, beide Radien der Grundfläche und der Spitze, ihre Höhe, Drehung und Seitenzahl, und in der Eigenschaftenpalette können Sie die Radien, die Seiten und die Höhe eintippen. Ihre Griffe verschieben sie, legen ihre Höhe fest und bemessen die Grundfläche von einer Ecke oder der Mitte einer Seite aus. Sie ist für <Command id="UNION" />, <Command id="SUBTRACT" /> und den Rest von MellowCADs 3D ein 3D-Volumenkörper, und dieses 3D besteht nur aus Volumenkörpern und ist noch unvollständig; <Command id="EXPLODE" /> macht aus ihr eine Region je Fläche.

## Options

### Edge

Beim Mittelpunkt der Grundfläche: fragt nach beiden Enden einer Seite der Grundfläche, die links von dieser Seite gezeichnet wird.

### Sides

Beim Mittelpunkt der Grundfläche: fragt nach der Seitenzahl, 3 bis 32, dann erneut nach dem Mittelpunkt.

### Inscribed

Beim Radius: liest den Radius bis zu einer Ecke der Grundfläche, das Polygon im Kreis einbeschrieben, und fragt ihn erneut.

### Circumscribed

Beim Radius, sobald <Keyword id="Inscribed" /> gewählt ist: liest den Radius bis zur Mitte einer Seite, das Polygon um diesen Kreis, wie zu Beginn, und fragt ihn erneut.

### 2Point

Bei der Höhe: fragt nach zwei Punkten, und die Höhe ist der Abstand zwischen ihnen.

### Axis

Bei der Höhe: fragt nach der Spitze. Die Pyramide verläuft vom Mittelpunkt der Grundfläche zu diesem Punkt in beliebiger Richtung, ihre Grundfläche senkrecht zur Achse.

### Top

Bei der Höhe: fragt nach dem Radius oben, gelesen wie der der Grundfläche, dann erneut nach der Höhe. Die Pyramide endet in einem kleineren Polygon statt in einer Spitze, ein Stumpf; eine Oberseite so groß wie die Grundfläche ergibt ein Prisma.

## Missing

Die von <Command id="BOX" />: Verschieben, Drehen, Skalieren und Spiegeln über einen heißen Griff, die eigenen 3D-Befehle und die visuellen Stile, die <Command id="VSCURRENT" /> fehlen. Ihre Art, einbeschrieben oder umschrieben, in der Eigenschaftenpalette eingetippt. Die gepunkteten Bemaßungen, die AutoCAD zeichnet, während Sie den Radius und eine Kante angeben.

## Questions

### Wie lautet das Kürzel für PYRAMIDE (PYRAMID) in AutoCAD?

`PYR`. Tippen Sie es und drücken Sie die Eingabetaste oder Leertaste, geben Sie dann den Mittelpunkt der Grundfläche, den Radius und die Höhe an.

### Wie zeichne ich eine sechseckige Pyramide?

Wählen Sie <Keyword id="Sides" /> vor dem Mittelpunkt der Grundfläche und tippen Sie `6`, geben Sie dann den Mittelpunkt, den Radius und die Höhe an: `0,0`, `25` und `40` zeichnen die Pyramide der Sitzung. Die nächste PYRAMIDE behält sechs Seiten.

### Wie zeichne ich eine Pyramide mit gegebener Seitenlänge der Grundfläche?

Wählen Sie <Keyword id="Edge" /> und geben Sie beide Enden einer Seite an: Eine Seite von `0,0` bis `50,0` ergibt mit den vorgegebenen 4 Seiten eine quadratische Grundfläche von 50.

### Wie zeichne ich einen Pyramidenstumpf?

Wählen Sie bei der Höhe <Keyword id="Top" />, tippen Sie den Radius oben, dann die Höhe. Die Pyramide endet in einem kleineren Polygon mit ebenso vielen Seiten wie die Grundfläche.
