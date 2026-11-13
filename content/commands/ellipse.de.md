---
title: "Befehl ELLIPSE in AutoCAD"
description: "Wie ELLIPSE (Alias EL) in AutoCAD funktioniert: eine Achse und die andere Halbachse, über den Mittelpunkt, Drehung, ein Ellipsenbogen."
figure: "Eine Ellipse über die zwei Enden einer Achse, eine über ihren Mittelpunkt und eine halbe Ellipse als Ellipsenbogen, von 0 bis 180 Grad."
sourceHash: "2ee0d1b3a8a4"
---

ELLIPSE zeichnet eine Ellipse aus den zwei Enden einer Achse, dann dem Abstand von ihrer Mitte bis zum Ende der anderen Achse: die halbe Länge der anderen Achse. Jede Achse darf die längere sein. Es ist eine echte Ellipse, wie die von AutoCAD, keine Polylinie, sodass Mittelpunkt, Quadrant und Nächster an ihr fangen und ihre Griffe sie verschieben und jede Halbachse festlegen. Während Sie das zweite Ende angeben, verläuft eine bernsteinfarbene gestrichelte Linie vom ersten; beim Abstand folgt die Ellipse dem Cursor. Die Ellipse wird auf dem aktuellen Layer erzeugt, mit den Eigenschaften, die beim Festlegen aktuell sind.

## Options

### Arc

Zeichnet einen Ellipsenbogen: dieselben Eingabeaufforderungen wie bei einer Ellipse, dann ein Startwinkel und ein Endwinkel, gegen den Uhrzeigersinn vom Ende der ersten Achse, die Sie angegeben haben.

### Center

Beginnt beim Mittelpunkt: dann das Ende einer Achse, dann der Abstand zur anderen.

### Rotation

Anstelle des Abstands: der Winkel, um den die Ellipse um ihre erste Achse gedreht ist, wie ein unter diesem Winkel gesehener Kreis. 0 zeichnet einen Kreis; ein Winkel innerhalb von 0,6 Grad von 90 wird mit <Message id="invalid" /> abgelehnt.

### Parameter

Bei einem Bogen anstelle des Start- oder Endwinkels: der Winkel auf dem Kreis, aus dem die Ellipse gezeichnet wird, der Parameter von AutoCAD. <Keyword id="Angle" /> geht zu Winkeln zurück.

### Included angle

Bei einem Bogen anstelle des Endwinkels: wie weit er vom Start aus überstreicht. Die Eingabetaste nimmt 180, die halbe Ellipse.

## Missing

Isokreis, den AutoCAD nur beim isometrischen Fangstil anbietet, der hier nicht gebaut ist. PELLIPSE 1, eine als Polylinie gezeichnete Ellipse. Das Schraffieren oder Bemaßen einer Ellipse und die Objektfänge Schnittpunkt, Tangente und Lot an ihr. Die Pfeilgriffe an den Enden eines Ellipsenbogens, hier quadratisch gezeichnet, und das Eingeben einer Länge oder eines Winkels, während ein Griff heiß ist. Ein Punkt mit Z-Wert beim Abstand wird in der Draufsicht gemessen, wo AutoCAD ihn im Raum misst.

## Questions

### Wie lautet das Kürzel für ELLIPSE in AutoCAD?

`EL`, dann die Eingabetaste oder die Leertaste. Der vollständige Name funktioniert ebenfalls, ebenso `_ELLIPSE` in jeder Sprache von AutoCAD.

### Wie zeichne ich eine halbe Ellipse in AutoCAD?

Wählen Sie <Keyword id="Arc" />, geben Sie die Achse und den Abstand an, dann einen Startwinkel von `0` und einen Endwinkel von `180`. Oder drücken Sie die Eingabetaste bei <Keyword id="Included angle" />, der standardmäßig 180 überstreicht.

### Wie zeichne ich eine Ellipse von ihrem Mittelpunkt aus?

Wählen Sie <Keyword id="Center" />, geben Sie den Mittelpunkt an, dann das Ende einer Achse, dann den Abstand vom Mittelpunkt zum Ende der anderen: die zwei Halbachsen der Ellipse.

### Wie zeichne ich einen isometrischen Kreis in AutoCAD?

AutoCAD zeichnet ihn mit Isokreis von ELLIPSE, sobald der Fangstil isometrisch ist. Beides ist in MellowCAD noch nicht gebaut.
