---
title: "Comando CIMA (CHAMFER) in AutoCAD"
description: "Come funziona CIMA (CHAMFER, alias CM) di AutoCAD in italiano: due distanze, due linee o gli angoli di una polilinea, Multiplo. Provalo."
figure: "Quattro linee, poi Distanza 10 per entrambe e Multiplo: due angoli smussati, due lasciati vivi."
sourceHash: "e43c5b72ffc8"
---

CIMA smussa l'angolo tra due linee con uno smusso rettilineo. Seleziona la prima linea, poi la seconda: ognuna è tagliata o estesa fino allo smusso, la prima della prima distanza e la seconda della seconda, e lo smusso le unisce. Funziona su due linee, su due segmenti retti di una polilinea, o su una linea e una polilinea, che unisce in una sola polilinea. Come in AutoCAD, la sua prima richiesta dice le distanze correnti, che sono conservate nel disegno; entrambe 0, il predefinito, crea un angolo vivo, con le linee che si incontrano. Mentre selezioni la seconda linea, l'angolo che creerebbe è mostrato sopra le linee.

## Options

### Undo

Annulla l'ultimo smusso di questa esecuzione, e con esso un cambio delle distanze.

### Polyline

Chiede una polilinea 2D e smussa ogni suo angolo, poi dice quante linee sono state smussate e perché alcune no.

### Distance

Chiede la prima e la seconda distanza di smusso. La seconda propone la prima, quindi Invio lì rende lo smusso uniforme, a 45 gradi su un angolo retto.

### Multiple

Continua a chiedere una prima linea dopo ogni smusso, finché Invio o Esc.

## Missing

Angolo, che imposta lo smusso con una distanza e un angolo, Metodo e Taglia: CIMA lavora sempre con due distanze e taglia sempre le linee. In AutoCAD lo smusso prende la scala del tipo di linea della seconda linea, qui no.

## Questions

### Qual è la scorciatoia di CIMA in AutoCAD?

`CM`, poi Invio o barra spaziatrice. Funziona anche il nome completo, e `_CHAMFER` in tutte le lingue di AutoCAD.

### Come si fa uno smusso a 45 gradi in AutoCAD?

Scegli <Keyword id="Distance" />, digita la distanza e premi Invio alla seconda: su un angolo retto, due distanze uguali creano uno smusso a 45 gradi.

### Qual è la differenza tra CIMA e RACCORDO?

CIMA unisce due linee con uno smusso rettilineo; <Command id="FILLET" /> con un arco tangente a entrambe. Entrambi tagliano o estendono le linee fino ad esso, ed entrambi creano un angolo vivo con 0 o con Maiusc premuto sulla seconda linea.

### Perché CIMA non funziona?

Dice perché: <Message id="chamferDistanceTooLarge" /> quando una distanza supera l'estremo della sua linea, <Message id="linesParallel" /> per linee parallele, e <Message id="chamferRequiresLines" /> per un arco o un cerchio. Con entrambe le distanze 0 crea un angolo, non uno smusso.

### Come si smussano tutti gli angoli di un rettangolo?

Un rettangolo è una polilinea: scegli <Keyword id="Polyline" /> e selezionalo, e ogni angolo è smussato alle distanze correnti.
