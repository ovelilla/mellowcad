---
title: "Befehl POLYGON in AutoCAD"
description: "Wie POLYGON (Alias PG) in AutoCAD ein regelmäßiges Vieleck zeichnet: die Seiten, ein Mittelpunkt, Umkreis oder Inkreis, oder eine Kante."
figure: "Zwei Kreise mit Radius 30, ein Sechseck in den einen eingeschrieben und um den anderen umschrieben, und ein Fünfeck über seine Kante."
sourceHash: "90e1cc9a53c4"
---

POLYGON zeichnet ein regelmäßiges Vieleck, jede Seite und jeder Winkel gleich, als eine geschlossene Polylinie. Der Befehl fragt nach der Anzahl der Seiten, von 3 bis 1024, dann nach dem Mittelpunkt und danach, ob das Vieleck in einen Kreis eingeschrieben oder um ihn umschrieben ist, dann nach dem Radius dieses Kreises. Oder es wird mit Edge auf einer seiner Seiten aufgebaut. Die Anzahl der Seiten und die Wahl von Inscribed oder Circumscribed sind die Vorgaben des nächsten POLYGON, in dieser Zeichnung. Ein als Zahl eingegebener Radius zeichnet die untere Kante waagerecht; einer, der als Punkt angegeben wird, gewählt oder eingegeben, legt sowohl die Größe als auch die Drehung des Vielecks fest. Während Sie den Radius angeben, folgt das Vieleck dem Cursor, mit einer bernsteinfarbenen gestrichelten Linie vom Mittelpunkt.

## Options

### Edge

Anstelle eines Mittelpunkts: Geben Sie die zwei Enden einer Seite an, und das Vieleck wird gegen den Uhrzeigersinn darauf aufgebaut.

### Inscribed

Die Scheitelpunkte liegen auf dem Kreis: Der Radius verläuft vom Mittelpunkt zu einem Scheitelpunkt. Die Vorgabe.

### Circumscribed

Die Seiten berühren den Kreis in ihren Mittelpunkten: Der Radius verläuft vom Mittelpunkt zur Mitte einer Seite.

## Missing

Ein gedrehter Fang: Ein als Zahl eingegebener Radius zeichnet die untere Kante immer waagerecht zum BKS, wo AutoCAD sie um den Fangwinkel SNAPANG dreht.

## Questions

### Wie lautet das Kürzel für POLYGON in AutoCAD?

`PG`, dann die Eingabetaste oder die Leertaste. Der vollständige Name funktioniert ebenfalls, ebenso `_POLYGON` in jeder Sprache von AutoCAD.

### Wie zeichne ich ein Sechseck in AutoCAD?

Starten Sie POLYGON, geben Sie `6` für die Seiten ein, geben Sie den Mittelpunkt an, wählen Sie <Keyword id="Inscribed" /> oder <Keyword id="Circumscribed" /> und geben Sie den Radius ein. Über die Flächen gemessen ist ein umschriebenes Sechseck doppelt so breit wie der Radius, den Sie eingeben.

### Was ist der Unterschied zwischen eingeschrieben und umschrieben?

Bei <Keyword id="Inscribed" /> berühren die Ecken des Vielecks den Kreis, es passt also hinein. Bei <Keyword id="Circumscribed" /> berühren seine Seiten den Kreis, der Kreis passt also hinein. Bei gleichem Radius ist das umschriebene Vieleck das größere.

### Wie zeichne ich ein Vieleck mit gegebener Seitenlänge?

Wählen Sie <Keyword id="Edge" /> und geben Sie die zwei Enden einer Seite an: `0,0`, dann die Länge relativ dazu eingegeben, etwa `40,0`. Die anderen Seiten folgen, gegen den Uhrzeigersinn.
