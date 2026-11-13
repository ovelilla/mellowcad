---
title: "Befehl ID in AutoCAD"
description: "Wie der Befehl ID in AutoCAD funktioniert: Wählen oder fangen Sie einen Punkt und lesen Sie sein X, Y und Z im aktuellen BKS ab, auch innerhalb eines Befehls."
figure: "ID mit einem Mittelpunktfang auf dem Loch einer Platte: X, Y und Z des Mittelpunkts."
sourceHash: "3f6bc32d12e5"
---

ID schreibt die Koordinaten eines Punkts. Klicken, fangen oder geben Sie ihn bei `Punkt angeben:` ein, und ID schreibt sein X, Y und Z in einer Zeile in die Befehlszeile und endet. Die Werte stehen im aktuellen BKS, mit der Genauigkeit der Zeichnung. Mit einem Objektfang ist Z die Höhe des Objekts an diesem Punkt; sonst ist es die der Erhebungsebene. Die Eingabetaste beendet ihn ohne Meldung, und vor ID gewählte Objekte werden beim Start verworfen. Mit Apostroph eingegeben, `'ID`, läuft er innerhalb eines anderen Befehls, der danach weitermacht.

## Questions

### Was macht der Befehl ID in AutoCAD?

Er meldet, wo ein Punkt liegt: X, Y und Z, im aktuellen BKS. Er zeichnet und ändert nichts.

### Wie ermittle ich die Koordinaten eines Punkts?

Geben Sie `ID` ein und klicken Sie dann den Punkt mit einem Objektfang an, Endpunkt oder Mittelpunkt, sodass er genau darauf landet. Die Koordinaten werden in die Befehlszeile geschrieben.

### Wie erhalte ich die Z-Koordinate eines Punkts?

Fangen Sie ihn mit einem Objektfang: ID schreibt dort das Z des Objekts. Ein einfacher Klick ergibt das Z der Erhebungsebene, 0, sofern ELEVATION oder das BKS sie nicht anheben.

### Warum zeigt ID Koordinaten, die ich nicht erwartet habe?

ID liest im aktuellen BKS. Wurde das BKS verschoben oder gedreht, werden die Zahlen von seinem Ursprung entlang seiner Achsen gemessen: <Command id="UCS" /> Welt, um Weltkoordinaten zu lesen.
