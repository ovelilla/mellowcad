---
title: "Befehl MESSEN (MEASURE) in AutoCAD"
description: "Wie MESSEN (MEASURE, Alias ME) in AutoCAD Punkte in festem Abstand auf einem Objekt setzt: Länge, Block, Anfangsende. Zum Testen im Browser."
figure: "Eine Polylinie von 190 Länge, alle 15 vom nahe gewählten Ende aus gemessen: zwölf Punkte, der letzte 10 vor dem fernen Ende."
sourceHash: "3975c3873eff"
---

MESSEN (MEASURE) markiert ein Objekt in einer festen Länge. Wählen Sie eine Linie, einen Bogen, einen Kreis, eine Ellipse, einen elliptischen Bogen, eine Polylinie, eine 3D-Polylinie oder einen Spline, und geben Sie dann die Länge an, eingegeben oder als zwei Punkte: MESSEN setzt alle so viele Einheiten entlang des Objekts ein Punktobjekt, so weit eines passt, und endet. Er misst keinen Abstand für Sie und teilt das Objekt nicht. Er beginnt an dem Ende, das näher an der Stelle liegt, an der Sie gewählt haben, wählen Sie also nahe dem Ende, von dem aus gemessen werden soll; der Rest bleibt am anderen Ende, und geht die Länge ganzzahlig oft in das Objekt, erhält auch das ferne Ende einen Punkt. Ein Kreis beginnt an seinem 0°-Punkt und läuft gegen den Uhrzeigersinn, wo auch immer er gewählt wird; eine geschlossene Polylinie beginnt an ihrem ersten Scheitelpunkt.

Die Punkte werden so gezeichnet, wie der Punktstil der Zeichnung es festlegt, vorgegeben ein Punkt: Stellen Sie zuvor mit <Command id="PTYPE" /> oder PDMODE eine sichtbare Figur ein. Die Punkte liegen auf dem Objekt, auf dem aktuellen Layer mit der aktuellen Farbe, dem aktuellen Linientyp und der aktuellen Linienstärke; der ganze Durchlauf ist ein Schritt, den <Command id="U" /> zurücknimmt, und die Punkte sind die Auswahl Vorher. Eine Länge, die länger als das Objekt ist, ergibt <Message id="objectNotThatLong" />, und eine so kurze, dass mehr als 32767 Punkte entstünden, <Message id="objectTooLong" />, beide erzeugen nichts. Jedes andere Objekt ergibt <Message id="cannotMeasureObject" />. Auch die Auswahlliste Punkte der Zeichenwerkzeuge startet MESSEN.

## Options

### Block

Statt Punkten Verweise auf einen Block, der schon in der Zeichnung ist: Geben Sie seinen Namen an, dann ob jeder am Objekt ausgerichtet werden soll, <Keyword id="Yes" /> (die Vorgabe) oder <Keyword id="No" />, dann die Länge. Ausgerichtet dreht sich jeder Verweis mit dem Objekt an seiner Stelle, entlang einer Linie oder tangential zu einem Bogen, von welchem Ende das Messen auch beginnt; nicht ausgerichtet behält jeder das X des BKS. Ein Name ohne dahinterstehenden Block wird abgelehnt und der Name erneut abgefragt.

## Missing

In welche Richtung eine geschlossene Polylinie läuft, die hinter ihrer Mitte gewählt wurde: Hier wird sie von ihrem ersten Scheitelpunkt aus rückwärts gemessen, wie AutoCAD eine geschlossene Ellipse oder einen geschlossenen Spline misst, doch die Polylinie von AutoCAD selbst wurde nicht geprüft. Die Punkte eines Kreises beginnen immer entlang des X des BKS, wo AutoCAD sie im Fangwinkel SNAPANG beginnen lässt, den MellowCAD nicht hat.

## Questions

### Wie lautet das Alias von MESSEN (MEASURE) in AutoCAD?

`ME`, dann die Eingabetaste oder die Leertaste. Der volle Name funktioniert ebenfalls, und `_MEASURE` in jeder Sprache von AutoCAD.

### Misst MESSEN Abstände?

Nein: Er setzt Punkte in einer Länge, die Sie angeben. Um den Abstand zwischen zwei Punkten abzulesen, verwenden Sie <Command id="DIST" />; für die Länge eines Objekts <Command id="LIST" /> oder <Command id="AREA" />.

### Von welchem Ende aus beginnt MESSEN?

Von dem Ende, das näher an dem Punkt liegt, an dem Sie das Objekt gewählt haben. Wählen Sie es nahe dem Ende, von dem aus die erste Länge gemessen werden soll.

### Warum sehe ich die Punkte nicht, die MESSEN erzeugt hat?

Sie werden als Punkte gezeichnet, im vorgegebenen Punktstil. Öffnen Sie <Command id="PTYPE" /> und wählen Sie ein Kreuz oder einen Kreis, oder setzen Sie PDMODE auf `3`: Alle Punkte ändern sich auf einmal.

### Was ist der Unterschied zwischen MESSEN und TEILEN?

<Command id="DIVIDE" /> teilt ein Objekt in eine Anzahl gleicher Teile; MESSEN geht in einer Länge daran entlang und lässt einen Rest am fernen Ende.
