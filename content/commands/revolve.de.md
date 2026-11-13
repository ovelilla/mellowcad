---
title: "Befehl ROTATION (REVOLVE) in AutoCAD"
description: "So dreht AutoCADs ROTATION (REVOLVE, Alias ROT) ein 2D-Profil um eine Achse zum 3D-Volumenkörper: Achse, Objekt, X, Y, Z. Gratis im Browser testen."
figure: "Ein Profil mit Flansch, eine ganze Umdrehung um die Y-Achse gedreht: eine Spule, von Südosten im visuellen Stil Verdeckt gesehen."
sourceHash: "dc0576311912"
---

ROTATION (REVOLVE) dreht geschlossene 2D-Profile um eine Achse zu 3D-Volumenkörpern: Ein Rechteck mit einer Kante auf der Achse ergibt einen Zylinder, ein Kreis daneben einen Ring. Wählen Sie die Profile aus, Kreise, Ellipsen, geschlossene Polylinien oder Splines, Regionen, und drücken Sie die Eingabetaste; geben Sie die Achse durch zwei Punkte oder eine ihrer Optionen an, dann den Winkel, wobei die Eingabetaste eine ganze Umdrehung nimmt. Jedes Profil wird zu einem Volumenkörper auf dem aktuellen Layer und gelöscht, wie DELOBJ es standardmäßig vorgibt. Der ganze Befehl ist ein Schritt, den Rückgängig zurücknimmt.

Die Achse liegt in der Ebene des Profils, mit dem ganzen Profil auf einer Seite, sonst endet der Befehl mit <Message id="revolveOneSide" />, bevor ein Winkel abgefragt wird. Der Winkel dreht nach der Rechte-Hand-Regel um die Achse, von ihrem ersten zu ihrem zweiten Punkt; ein negativer dreht in die andere Richtung. MellowCADs 3D besteht nur aus Volumenkörpern und ist noch unvollständig: Offene Profile, die AutoCAD zu Flächen dreht, werden abgelehnt.

## Options

### MOde

Fragt nach <Keyword id="SOlid" /> oder <Keyword id="SUrface" />, wie <Command id="EXTRUDE" /> es tut: Solange es noch keine Flächenobjekte gibt, wird nur <Keyword id="SOlid" />, die Vorgabe, angenommen.

### Object

Die Vorgabe der Achsen-Eingabeaufforderung, sodass die Eingabetaste sie wählt: Wählen Sie eine Linie, eine Polylinie, einen Bogen oder einen Spline, und die Achse verläuft gerade zwischen deren beiden Enden, vom Ende, das Ihrer Wahl näher liegt. Ein geschlossenes Objekt hat keine Enden: <Message id="revolveClosedAxis" />, und der Befehl endet.

### X

Die X-Achse des BKS, durch seinen Ursprung.

### Y

Die Y-Achse des BKS, durch seinen Ursprung: Ein Profil, das rechts davon gezeichnet ist, wie in der Sitzung, wird zu einem Teil, das entlang Y liegt.

### Z

Die Z-Achse des BKS, durch seinen Ursprung. Ein Profil auf der XY-Ebene des BKS steht senkrecht dazu, sodass ROTATION mit <Message id="revolvePerpendicular" /> antwortet und endet: Z ist für ein Profil, das aufrecht steht.

### STart

Bei der Winkel-Eingabeaufforderung: der Winkel, bei dem begonnen wird, seine Vorgabe ist immer 0. Das Profil wird zuerst dorthin gedreht, dann wird der Winkel erneut abgefragt.

### Reverse

Dreht die Achse um, sodass der Winkel in die andere Richtung läuft, und fragt den Winkel erneut.

### EXpression

Der Winkel als arithmetischer Ausdruck, wie bei <Command id="EXTRUDE" />.

## Missing

Eine Achse außerhalb der Ebene des Profils, um die AutoCAD das Profil zu Flächen dreht: Hier meldet ROTATION <Message id="revolveUnable" /> und endet. Ein elliptischer Bogen oder eine Kante eines Volumenkörpers als Achse bei Objekt. Der Modus Fläche und offene Profile, da es noch keine Flächenobjekte gibt. Die Vorschau, die sich mit dem Cursor dreht: Während Sie den Winkel angeben, wird die ganze Umdrehung gezeigt. <Command id="EXPLODE" /> eines gedrehten Volumenkörpers, den AutoCAD in Flächen und Regionen zerlegt. Seine Griffe und sein Winkel, bearbeitet in der Eigenschaftenpalette.

## Questions

### Wie lautet das Kürzel für ROTATION (REVOLVE) in AutoCAD?

`ROT`, danach Eingabetaste oder Leertaste. Auch der vollständige Name funktioniert, ebenso `_REVOLVE` in jeder Sprache von AutoCAD. Vorsicht: In der deutschen AutoCAD-Version dreht DREHEN (ROTATE) Objekte in der Ebene; ROTATION (REVOLVE) macht daraus 3D-Volumenkörper.

### Wie drehe ich ein Profil um eine Achse?

Zeichnen Sie den halben Schnitt als ein geschlossenes Objekt neben der Achsenlinie, eine geschlossene Polylinie oder eine Region. Starten Sie ROTATION, wählen Sie das Profil und drücken Sie die Eingabetaste; drücken Sie erneut die Eingabetaste für <Keyword id="Object" /> und wählen Sie die Achsenlinie, oder geben Sie ihre beiden Enden an; dann die Eingabetaste für eine ganze Umdrehung.

### Warum funktioniert ROTATION nicht?

Meistens kreuzt die Achse das Profil: ROTATION meldet <Message id="revolveOneSide" /> und endet. Verschieben Sie die Achse an den Rand des Profils oder darüber hinaus; eine Kante, die auf der Achse liegt, ist erlaubt. Eine Achse senkrecht zur Ebene des Profils ergibt <Message id="revolvePerpendicular" />, und ein offenes Profil wird abgelehnt, da MellowCAD noch keine Flächen hat.

### Wie drehe ich nur einen Teil einer Umdrehung?

Tippen Sie den Winkel, 90 oder 270, bei der Winkel-Eingabeaufforderung. <Keyword id="STart" /> beginnt die Drehung weiter hinten, und <Keyword id="Reverse" /> dreht sie in die andere Richtung.
