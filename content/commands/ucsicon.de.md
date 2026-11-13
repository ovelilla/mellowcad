---
title: "Befehl BKSYMBOL (UCSICON) in AutoCAD"
description: "So zeigt oder verbirgt AutoCADs BKSYMBOL (UCSICON) das BKS-Symbol und setzt es in den Ursprung oder die Ecke: ON, OFF, Noorigin, ORigin. Gratis testen."
figure: "UCSICON Noorigin schickt das Symbol in die Ecke; UCS verschiebt den Ursprung auf die Stufe des Blocks, und ORigin zeichnet das Symbol dort, sein X rot, Y grün und Z blau."
sourceHash: "c431e70eda01"
---

BKSYMBOL (UCSICON) zeigt oder verbirgt das BKS-Symbol, die X- und Y-Arme, die zeigen, wo das aktuelle BKS liegt und wohin es weist, und legt fest, wo es sitzt: im Ursprung des BKS oder in der linken unteren Ecke der Zeichnung. Seine einzige Eingabeaufforderung bietet den aktuellen Zustand als Vorgabe an, sodass die Eingabetaste ihn behält. Die Einstellung wird in der Zeichnung gespeichert, und jedes BKSYMBOL ist ein Schritt für Rückgängig.

Das Symbol ist das 3D-Symbol von AutoCAD 2027: ein Arm für X und einer für Y, ein Buchstabe an jedem Ende und ein Quadrat im Ursprung, solange das BKS das Weltkoordinatensystem ist. Außerhalb der Draufsicht zeigt ein Z-Arm, wohin die Z-Achse des BKS weist, und ein Arm, der von vorn gesehen wird, entfällt. In 2D-Drahtmodell ist es weiß; in Hidden und Conceptual ist sein X rot, Y grün und Z blau. Mit Apostroph getippt, setzt `'BKSYMBOL` stattdessen die Variable UCSICON, auch innerhalb eines anderen Befehls: 0 bis 3, wobei 1 das Symbol zeigt und 2 es in den Ursprung setzt.

## Options

### ON

Zeigt das Symbol.

### OFF

Verbirgt das Symbol. Das BKS ist weiterhin da, und was Sie zeichnen, liegt weiterhin darin.

### Noorigin

Behält das Symbol in der linken unteren Ecke der Zeichnung, wo auch der Ursprung liegt.

### ORigin

Zeichnet das Symbol im Ursprung des BKS, die Vorgabe. Wenn der Ursprung außerhalb des Bildschirms oder so nah an dessen Rand liegt, dass das Symbol nicht passt, geht das Symbol in die linke untere Ecke, bis der Ursprung wieder im Blick ist.

## Missing

Alle, das in AutoCAD die Einstellung auf jeden Ansichtsbereich anwendet (hier gibt es nur einen); Auswählbar, die Griffe des Symbols; und Eigenschaften, das Dialogfeld BKS-Symbol, mit dem 2D-Stil, der Größe, der Linienbreite und den Farben.

## Questions

### Wie schalte ich das BKS-Symbol in AutoCAD aus?

Tippen Sie `BKSYMBOL`, drücken Sie die Eingabetaste, dann <Keyword id="OFF" />. <Keyword id="ON" /> bringt es zurück.

### Wie setze ich das BKS-Symbol in den Ursprung?

BKSYMBOL, dann <Keyword id="ORigin" />: Das Symbol sitzt im Ursprung des BKS. Bleibt es in der Ecke, liegt der Ursprung außerhalb des Bildschirms oder zu nah an dessen Rand: Verschieben Sie die Ansicht oder zoomen Sie heraus. <Keyword id="Noorigin" /> behält es in der Ecke.

### Was bedeutet das Quadrat am BKS-Symbol?

Dass das BKS das Weltkoordinatensystem ist. Verschieben oder drehen Sie das BKS mit <Command id="UCS" />, und das Quadrat verschwindet; <Command id="UCS" /> und die Eingabetaste bringen das WKS zurück, und mit ihm das Quadrat.

### Wie ändere ich Stil, Größe oder Farbe des BKS-Symbols?

In AutoCAD mit den Eigenschaften von BKSYMBOL, dem Dialogfeld BKS-Symbol. MellowCAD hat es noch nicht: Das Symbol wird so gezeichnet, wie AutoCAD 2027 es standardmäßig zeichnet, im 3D-Stil.
