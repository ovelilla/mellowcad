---
title: "Befehl KEGEL (CONE) in AutoCAD"
description: "Wie KEGEL (CONE) in AutoCAD einen 3D-Kegel oder Kegelstumpf zeichnet, Schritt für Schritt: Basis, Radius, Höhe, Oberer Radius, Elliptisch und Achsenendpunkt."
figure: "Ein Kegel mit Radius 20 und Höhe 40, vom Mittelpunkt seiner Basis aus, von Südosten gesehen im Visuellen Stil Verdeckt."
sourceHash: "1c40f02e6b3c"
---

KEGEL (CONE) zeichnet einen 3D-Volumenkörper-Kegel: Geben Sie den Mittelpunkt seiner Basis an, dann den Radius, dann die Höhe, und er läuft spitz zu. Er stellt dieselben Fragen wie <Command id="CYLINDER" />, mit <Keyword id="Top" /> bei der Höhe für einen abgeschnittenen Kegel. Die Basis liegt auf der XY-Ebene des BKS, auf der Z-Höhe des Mittelpunkts, und die Höhe steigt entlang seiner Z-Achse; eine negative zeigt nach unten, und ein angegebener Punkt legt sie durch seinen Abstand von der Basis fest. Der Radius und die Höhe werden als Vorgaben angeboten, die die Eingabetaste übernimmt und die sich die anderen Grundkörper teilen. Der Kegel liegt auf dem aktuellen Layer, und <Command id="U" /> nimmt ihn in einem Schritt zurück.

<Command id="LIST" /> zeigt seine Position, Normale, seinen Basisradius, Oberradius und seine Höhe, und die Eigenschaftenpalette lässt Sie diese eingeben. Seine Griffe verschieben ihn und stellen seine Höhe, seinen Basisradius (an jedem Viertel der Basis) und seinen Oberradius ein. Die Spitze lässt sich als Endpunkt fangen. Er ist ein 3D-Volumenkörper für <Command id="UNION" />, <Command id="SUBTRACT" /> und das übrige 3D von MellowCAD, das nur aus Volumenkörpern besteht und noch unvollständig ist.

## Options

### 3P

Beim Mittelpunkt der Basis: fragt nach drei Punkten, und die Basis ist der Kreis durch sie, in ihrer Ebene.

### 2P

Beim Mittelpunkt der Basis: fragt nach den beiden Enden des Durchmessers der Basis.

### Ttr

Beim Mittelpunkt der Basis: Wählen Sie zwei Linien, Kreise oder Bögen unter dem Objektfang Tangente und geben Sie einen Radius an: Die Basis berührt beide.

### Elliptical

Beim Mittelpunkt der Basis: Die Basis ist eine Ellipse, angegeben durch beide Enden ihrer ersten Achse und das Ende der zweiten, oder mit <Keyword id="Center" /> von ihrem Mittelpunkt aus. Ein oberer Radius verkleinert dieselbe Ellipse.

### Diameter

Beim Radius: fragt stattdessen nach dem Durchmesser und bietet das Doppelte des letzten Radius an.

### 2Point

Bei der Höhe: fragt nach zwei Punkten, und die Höhe ist der Abstand zwischen ihnen.

### Axis

Bei der Höhe: fragt nach der Spitze. Der Kegel verläuft vom Mittelpunkt der Basis zu diesem Punkt in beliebiger Richtung, seine Basis senkrecht zur Achse.

### Top

Bei der Höhe: fragt nach dem oberen Radius, dann erneut nach der Höhe. Der Kegel endet in einem Kreis statt in einer Spitze, ein Kegelstumpf; ein oberer Radius so groß wie die Basis ergibt die Seiten eines Zylinders, ein größerer einen nach oben breiter werdenden Kegel. Er bietet den oberen Radius des letzten Kegels an, zunächst 0.

## Missing

<Command id="EXPLODE" /> eines Kegels, den AutoCAD in seine Basis und eine Fläche zerlegt: MellowCAD hat keine Flächen, daher meldet es, dass es ihn nicht auflösen konnte. Das Umschreiben eines runden Kegels in einen elliptischen in der Eigenschaftenpalette. Bei `ISOLINES` 0 der Punkt, den AutoCAD an der Spitze zeichnet. Und was auch <Command id="CYLINDER" /> fehlt: Verschieben, Drehen, Skalieren und Spiegeln des heißen Griffs, die gepunkteten Bemaßungen, während Sie den Radius angeben, und die Visuellen Stile, die <Command id="VSCURRENT" /> nicht hat.

## Questions

### Wie zeichnet man einen Kegel in AutoCAD?

Starten Sie KEGEL, geben Sie den Mittelpunkt der Basis, den Radius und die Höhe an: `0,0`, `20` und `40` zeichnen den Kegel der Sitzung. Drehen Sie die Ansicht, um ihn zu sehen, mit einer Ecke des ViewCube oder mit <Command id="-VIEW" /> und <Keyword command="VIEW" id="SEiso" />.

### Wie zeichnet man einen Kegelstumpf?

Wählen Sie bei der Höhe <Keyword id="Top" />, geben Sie den oberen Radius ein, dann die Höhe. Der Kegel endet in einem Kreis mit diesem Radius.

### Wie zeichnet man einen Kegel kopfüber?

Geben Sie eine negative Höhe ein: Der Kegel zeigt von seiner Basis nach unten. Oder wählen Sie <Keyword id="Axis" /> und geben Sie die Spitze an, wohin sie gehört.

### Kann die Basis eines Kegels eine Ellipse sein?

Ja: Wählen Sie <Keyword id="Elliptical" /> beim Mittelpunkt der Basis und geben Sie ihre Achsen an. Ein oberer Radius macht die Oberseite zur gleichen, kleineren Ellipse.
