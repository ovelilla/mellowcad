---
title: "Befehl KLINIE (XLINE) in AutoCAD"
metaTitle: "Konstruktionslinie in AutoCAD: KLINIE (XLINE)"
description: "Wie KLINIE (XLINE, Alias KL) in AutoCAD unendliche Konstruktionslinien zeichnet: durch zwei Punkte, horizontal, vertikal, im Winkel, halbierend, versetzt."
figure: "Konstruktionslinien durch einen Punkt, eine horizontale und die Winkelhalbierende zwischen zwei Linien, jede quer durch die ganze Ansicht."
sourceHash: "5b81d2c75993"
---

KLINIE (XLINE) zeichnet Konstruktionslinien: Linien unendlicher Länge, die quer durch die ganze Ansicht laufen, wie weit Sie auch pannen oder zoomen, um eine Zeichnung anzulegen, bevor die eigentlichen Linien kommen. Wählen Sie einen Punkt, dann einen Durchgangspunkt: Eine Konstruktionslinie verläuft durch beide, und jeder weitere Punkt erzeugt eine weitere durch den ersten, bis die Eingabetaste den Befehl beendet. Ein Durchgangspunkt auf dem ersten Punkt wird mit <Message id="invalid" /> abgewiesen. Jede Konstruktionslinie liegt auf dem aktuellen Layer mit der aktuellen Farbe, dem aktuellen Linientyp und der aktuellen Linienstärke.

Eine Konstruktionslinie hat keine Enden: Zoomen Sie auf die Ausdehnung der Zeichnung, bleibt sie außen vor, wie in AutoCAD. Der Objektfang Mittelpunkt findet den Punkt, durch den sie gezeichnet wurde, Nächster, Lot und Schnittpunkt wirken entlang der Linie, und <Command id="TRIM" /> oder <Command id="BREAK" /> machen aus ihr einen Strahl oder zwei: So werden aus Konstruktionslinien Linien der Zeichnung. <Command id="RAY" /> zeichnet die Hälfte davon, die an einem Punkt beginnt.

## Options

### Hor

Horizontale Konstruktionslinien, entlang der X-Achse des BKS, jede durch einen Punkt, den Sie angeben, bis zur Eingabetaste.

### Ver

Vertikale Konstruktionslinien, entlang der Y-Achse des BKS, jede durch einen Punkt, den Sie angeben.

### Ang

Konstruktionslinien in einem Winkel: Geben Sie ihn ein oder geben Sie zwei Punkte an, dann die Durchgangspunkte. Die Eingabetaste beim Winkel übernimmt 0. <Keyword id="Reference" /> misst den Winkel von einem linienförmigen Objekt aus, das Sie wählen, einer Linie, einer Konstruktionslinie oder einem Strahl, gegen den Uhrzeigersinn: Alles andere wird mit <Message id="noUsableObjectSelected" /> abgewiesen.

### Bisect

Die Konstruktionslinie, die einen Winkel halbiert: Geben Sie seinen Scheitelpunkt an, einen Punkt auf seinem ersten Schenkel, dann einen Punkt auf seinem zweiten, und die Winkelhalbierende verläuft durch den Scheitelpunkt. Jeder weitere Punkt auf dem zweiten Schenkel erzeugt eine weitere Winkelhalbierende zum selben ersten Schenkel.

### Offset

Konstruktionslinien parallel zu einem linienförmigen Objekt, einer Linie, einer Konstruktionslinie oder einem Strahl: Geben Sie den Abstand an, wählen Sie das Objekt und die Seite, immer wieder, bis zur Eingabetaste. <Keyword id="Through" /> führt jede stattdessen durch einen Punkt, den Sie angeben. Der Abstand ist der, den sich <Command id="OFFSET" /> merkt, und der, den es als Nächstes anbietet.

## Missing

LENGTHEN und JOIN an einer Konstruktionslinie sind noch nicht mit AutoCAD abgeglichen, ebenso wenig die Menüs ihrer Griffe.

## Questions

### Wie lautet das Kürzel für KLINIE (XLINE) in AutoCAD?

`KL`, danach Eingabetaste oder Leertaste; `_XLINE` funktioniert in jeder Sprache von AutoCAD. Die Multifunktionsleiste nennt ihn Konstruktionslinie, in der erweiterten Gruppe Zeichnen; hier steht er in den Zeichenwerkzeugen neben Strahl.

### Wie zeichne ich eine horizontale oder vertikale Konstruktionslinie?

Starten Sie KLINIE, geben Sie `HO` für <Keyword id="Hor" /> oder `V` für <Keyword id="Ver" /> ein und wählen Sie die Punkte, durch die die Linien verlaufen. Horizontal und vertikal beziehen sich auf das aktuelle BKS.

### Wie stutze ich eine Konstruktionslinie?

Mit <Command id="TRIM" />, wie jede Linie: Auf einer Seite geschnitten, wird eine Konstruktionslinie zum Strahl; auf beiden, zur Linie. Dasselbe geschieht mit <Command id="BREAK" />.

### Warum ignoriert ZOOM Grenzen meine Konstruktionslinien?

Eine Konstruktionslinie hat keine Ausdehnung: Sie läuft in beide Richtungen ins Unendliche. AutoCAD lässt Konstruktionslinien und Strahlen aus der Ausdehnung der Zeichnung heraus, und MellowCAD ebenso.

### Was ist der Unterschied zwischen KLINIE und STRAHL?

Eine Konstruktionslinie läuft in beide Richtungen ins Unendliche; ein Strahl, gezeichnet mit <Command id="RAY" />, beginnt an einem Punkt und läuft nur in eine Richtung.
