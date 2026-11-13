---
title: "Befehl KREIS (CIRCLE) in AutoCAD"
description: "Wie KREIS (CIRCLE, Alias K) in AutoCAD funktioniert: Mittelpunkt und Radius oder Durchmesser, 2P, 3P und TTR, ein Kreis tangential an zwei Objekten."
figure: "Drei Kreise: Mittelpunkt und Radius, die zwei Enden eines Durchmessers (2P), Mittelpunkt und Durchmesser."
sourceHash: "62e25bc029f9"
---

KREIS (CIRCLE) zeichnet einen Kreis aus seinem Mittelpunkt und seinem Radius, eingegeben oder durch einen Punkt auf dem Kreis angegeben, oder auf eine der anderen Arten, die seine erste Eingabeaufforderung anbietet. Die Eingabetaste beim Radius wiederholt die Größe des letzten Kreises, für die Zeichnung beibehalten. Während Sie den Radius angeben, verläuft eine bernsteinfarbene gestrichelte Linie vom Mittelpunkt zum Cursor, beim Durchmesser über den Rand hinaus, wie AutoCAD sie zeichnet. Der Kreis liegt in der Ebene seines ersten Punkts, auf der aktuellen Erhebung, wenn der Punkt kein eigenes Z hat.

## Options

### 3P

Durch drei Punkte. Mit Objektfang Tangente eingegeben, `_TAN` bei jedem, ist es Tan, Tan, Tan von AutoCAD: der Kreis, der drei Objekte berührt.

### 2P

Aus den zwei Enden eines Durchmessers.

### Ttr

Tangential an zwei Objekten, mit einem Radius: Wählen Sie jede Linie, jeden Kreis oder Bogen nahe der Stelle, an der der Kreis sie berühren soll, und geben Sie dann den Radius an. Von den passenden Kreisen zeichnet er den, der Ihre Auswahlen am nächsten berührt; passt keiner, meldet der Befehl <Message id="circleDoesNotExist" />.

### Diameter

Bei der Eingabeaufforderung des Radius: Geben Sie stattdessen den Durchmesser an, eingegeben oder als Punkt.

## Missing

Ttr an einem Polyliniensegment, das AutoCAD nimmt und MellowCAD ablehnt; der Eintrag Tan, Tan, Tan der Werkzeugpalette (die Eingabe, 3P mit drei Objektfängen Tangente, funktioniert); Schnelleigenschaften bei einem Doppelklick auf einen Kreis.

## Questions

### Wie lautet das Kürzel für KREIS (CIRCLE) in AutoCAD?

`K`, dann die Eingabetaste oder die Leertaste. Der vollständige Name funktioniert ebenfalls, ebenso `_CIRCLE` in jeder Sprache von AutoCAD.

### Wie zeichne ich einen Kreis tangential an zwei Linien?

Wählen Sie <Keyword id="Ttr" />, wählen Sie die erste Linie, dann die zweite, nahe der Stelle, an der der Kreis sie berühren soll, und geben Sie den Radius ein.

### Wie zeichne ich einen Kreis tangential an drei Objekten?

Wählen Sie <Keyword id="3P" /> und geben Sie vor jedem der drei Punkte `_TAN` ein, wobei Sie jedes Objekt nahe der Stelle wählen, an der der Kreis es berühren soll.

### Wie zeichne ich einen Kreis über seinen Durchmesser?

Geben Sie den Mittelpunkt an, wählen Sie dann <Keyword id="Diameter" /> und geben Sie ihn ein. Oder wählen Sie <Keyword id="2P" /> und geben Sie die zwei Enden des Durchmessers an.
