---
title: "Befehl -OFANG (-OSNAP): Objektfang in AutoCAD"
description: "So arbeitet AutoCADs Objektfang: -OFANG (-OSNAP, -OF) legt die laufenden Modi fest, F3 schaltet ihn um, END, MID oder Umschalt + Rechtsklick erzwingen einen."
figure: "-OSNAP legt Midpoint und Center als laufende Objektfänge fest; LINE führt dann vom Mittelpunkt einer Kante zum Mittelpunkt des Kreises, und die obere Kante zeigt ihre Markierung Midpoint."
sourceHash: "627cd26c12df"
---

Objektfänge setzen einen Punkt genau auf einen Punkt eines Objekts: einen Endpunkt, einen Mittelpunkt, ein Zentrum. Ist der Objektfang eingeschaltet, zeigt der Cursor in der Nähe eines solchen Punkts seine Markierung in Grün und seinen Namen in einem Tooltip; ein Klick landet dann auf diesem Punkt, nicht dort, wo der Cursor steht. Die laufenden Objektfänge sind die Modi, die bei jeder Punkt-Eingabeaufforderung wirken: zu Beginn Endpoint, Center, Intersection und Extension, wie in AutoCAD. F3 schaltet den Objektfang ein und aus und schreibt `<Osnap on>` bzw. `<Osnap off>`, ebenso die Schaltfläche Objektfang in der Statusleiste, deren Menü für jeden Modus ein Kontrollkästchen hat. Liegen mehrere Fänge unter dem Cursor, gewinnt der nächste, und Tab schaltet durch die anderen. Ortho, Polar und Fangmodus verbiegen einen gefangenen Punkt nie.

-OFANG (-OSNAP) legt die laufenden Objektfänge in der Befehlszeile fest. Er listet die Modi auf, die gerade laufen, und fragt dann nach einer Liste von Modi: jeder mit seinen Großbuchstaben, durch Kommas getrennt, wie in `END,MID,CEN`, oder `_END,_MID` in jeder Sprache von AutoCAD. Die Liste ersetzt die laufenden Modi und schaltet den Objektfang ein; <Keyword id="NONe" />, <Keyword id="OFF" /> oder die Eingabetaste allein leert sie. Ein Modus, den er nicht kennt, ergibt <Message id="invalidOsnapModes" /> und die Frage erneut. Mit Apostroph getippt, `'-OFANG`, funktioniert er innerhalb eines anderen Befehls. Die laufenden Objektfänge gelten, bis die Seite neu geladen wird, dann sind es wieder die vier von AutoCAD: Wie AutoCAD speichert die Zeichnung sie nicht.

Für nur einen Punkt überschreiben Sie sie: Tippen Sie bei einer Punkt-Eingabeaufforderung die Großbuchstaben eines Modus, `MID` oder `_MID`, oder halten Sie die Umschalttaste gedrückt und klicken Sie mit der rechten Maustaste, um ihn aus einem Menü zu wählen. Nur dieser Fang wird gesucht, was auch immer läuft, und nur für diesen einen Punkt; findet er nichts, weist er den Punkt ab und fragt erneut. Mit seinen Großbuchstaben getippt, schaltet <Keyword id="NONe" /> den Fang für einen Punkt aus. Dasselbe Menü bietet <Command id="FROM" />: einen Basispunkt, dann einen Versatz davon, sodass `@10,0` 10 rechts davon bedeutet.

## Options

### ENDpoint

Das nächste Ende einer Linie, eines Bogens, eines Polylinien-Segments, eines elliptischen Bogens oder eines Splines: die Ecken eines Rechtecks, die Scheitelpunkte eines Polygons. Seine Markierung ist ein Quadrat.

### MIDpoint

Die Mitte einer Linie, eines Bogens, eines Polylinien-Segments, eines elliptischen Bogens oder eines Splines. Ein Dreieck.

### CENter

Der Mittelpunkt eines Kreises, eines Bogens oder des Bogens einer Polylinie. Führen Sie den Cursor über die Kurve selbst: Im Mittelpunkt gibt es nichts zu fangen. Ein Kreis.

### NODe

Ein Punktobjekt, wie <Command id="POINT" />, <Command id="DIVIDE" /> und <Command id="MEASURE" /> es erzeugen, welche Figur <Command id="PTYPE" /> ihnen auch gibt. Zu Beginn nicht unter den laufenden Objektfängen. Ein Kreis mit einem Kreuz.

### QUAdrant

Die Punkte eines Kreises oder Bogens bei 0°, 90°, 180° und 270°, entlang der X- und Y-Achse des BKS, und die Achsenenden einer Ellipse. Eine Raute.

### INTersection

Dort, wo sich zwei Objekte kreuzen, oder wo ein Spurverfolgungspfad ein Objekt kreuzt. Ein Kreuz.

### EXTension

Über das Ende einer Linie, eines Bogens oder des geraden Segments einer Polylinie hinaus: Führen Sie den Cursor über das Ende und bewegen Sie ihn dann in Richtung der Linie des Objekts weg. Ein gestrichelter Pfad geht vom Ende aus, und ein getippter Abstand läuft entlang davon. Ein Pluszeichen.

### INSertion

Der Punkt, an dem ein Text, eine Attributdefinition oder eine Blockreferenz hängt.

### PERpendicular

Der Fußpunkt des Lots vom letzten Punkt auf eine Linie, auch über ihre Enden hinaus, einen Kreis, einen Bogen oder ein Polylinien-Segment. Beim ersten Punkt von <Command id="LINE" /> wartet er auf den nächsten Punkt: Die Linie verlässt das Objekt im rechten Winkel dazu. Ein rechter Winkel.

### TANgent

Der Punkt eines Kreises oder Bogens, den eine Linie vom letzten Punkt aus berührt. Beim ersten Punkt von <Command id="LINE" /> wartet er auf den nächsten Punkt: Die Linie verlässt die Kurve tangential. Ein Kreis mit einem Strich.

### NEArest

Der dem Cursor nächste Punkt eines Objekts. Eine Sanduhr.

### APParent

Scheinbarer Schnittpunkt: dort, wo sich zwei Objekte in der Ansicht kreuzen, obwohl sie in unterschiedlicher Höhe liegen; wo sie sich wirklich treffen, ist es ihr Schnittpunkt.

### PARallel

Halten Sie den Cursor einen Moment über eine Linie und bewegen Sie ihn dann vom letzten Punkt aus in ihre Richtung: Ein zur Linie paralleler Pfad hält den nächsten Punkt.

### NONe

Keine laufenden Objektfänge: Der Objektfang findet nichts, bis wieder ein Modus gesetzt wird.

### OFF

Dasselbe wie <Keyword id="NONe" />: Die laufenden Modi werden geleert.

## Missing

Das Dialogfeld Zeichnungseinstellungen, das OFANG und OF in AutoCAD öffnen: Hier sind sie unbekannte Befehle, und das Menü der Statusleiste legt die Modi fest. Geometrisches Zentrum, als Modus und in den Menüs. Node auf den Definitionspunkten einer Bemaßung und dem Ursprung ihres Textes: Hier findet er nur Punktobjekte. Mitte zwischen 2 Punkten, der temporäre Spurpunkt und die gedrückt gehaltenen Tasten für einen Fang nur für einen Punkt (Umschalt + A, Umschalt + Q…). Intersection, Perpendicular und Tangent bei Ellipsen, Perpendicular und Tangent bei Splines, und Extension vom Bogenende einer Polylinie aus oder mit Abstand und Winkel im Tooltip. Ein Perpendicular oder Tangent, das am Anfang eines anderen Befehls als <Command id="LINE" /> und <Command id="CIRCLE" /> auf den anderen Punkt wartet. Die Einstellungen für Fangbereich und Markierung, APERTURE und AUTOSNAP.

## Questions

### Was ist der Befehl OFANG (OSNAP) in AutoCAD?

In AutoCAD öffnet OFANG (`OF`; englisch OSNAP, `OS`) das Dialogfeld Zeichnungseinstellungen auf der Registerkarte Objektfang, um die laufenden Fänge zu wählen. MellowCAD hat dieses Dialogfeld nicht: Tippen Sie `-OFANG` oder `-OF` und eine Liste von Modi, oder haken Sie sie im Menü der Schaltfläche Objektfang in der Statusleiste an.

### Welche Taste schaltet den Objektfang ein?

F3 schaltet den Objektfang ein und aus, wie in AutoCAD; die Schaltfläche Objektfang in der Statusleiste tut dasselbe. Umschalt + Rechtsklick bei einer Punkt-Eingabeaufforderung öffnet das Menü der Fänge für einen Punkt.

### Warum funktioniert der Objektfang nicht?

Vielleicht hat F3 ihn ausgeschaltet: Die Schaltfläche in der Statusleiste zeigt es. Oder der Modus läuft nicht: Legen Sie ihn mit `-OFANG` oder dem Menü der Schaltfläche fest. Der Cursor muss auf etwa 10 Pixel an den Punkt herankommen, und bei einem Mittelpunkt über den Kreis oder Bogen selbst. Fänge wirken nur, solange ein Befehl nach einem Punkt fragt.

### Wie fange ich einen Punkt nur ein einziges Mal?

Tippen Sie bei der Punkt-Eingabeaufforderung die Großbuchstaben des Modus, etwa `END` oder `TAN`, oder wählen Sie ihn im Menü von Umschalt + Rechtsklick. Er gilt nur für diesen einen Punkt, ob dieser Modus läuft oder nicht.

### Bleiben die Objektfang-Einstellungen erhalten?

Bis die Seite neu geladen wird; dann sind es wieder Endpoint, Center, Intersection und Extension. Auch AutoCAD speichert sie nicht in der Zeichnung.
