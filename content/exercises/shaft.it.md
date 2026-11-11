---
title: "Esercizio AutoCAD: un albero a gradini"
metaTitle: "Esercizio AutoCAD meccanica: un albero a gradini"
description: "Disegna un albero a gradini in AutoCAD: metà contorno come polilinea, smussato, specchiato sull'asse, con le lunghezze quotate in serie. Gratis, passo passo."
figure: "Un albero a gradini in vista laterale, lungo 150, con le lunghezze quotate in serie."
sourceHash: "8c649e73bc55"
---

Disegna questo albero a gradini in vista laterale, in millimetri: lungo 150, con diametri di 30, 40 e 30 su lunghezze di 40, 60 e 50, ed entrambe le estremità smussate 2 per 2. Disegna la metà sopra l'asse come una sola polilinea, smussala e specchiala; poi gli spigoli visti attraverso l'albero, l'asse e le lunghezze. I diametri sono quelli indicati qui.

## Steps

### Disegna la metà superiore [#half]

Sul layer Contorno, una <Command id="PLINE" /> da `0,0`: su `0,15`, avanti `40,0`, su `0,5`, avanti `60,0`, giù `0,-5`, avanti `50,0` e giù `0,-15`, fino all'asse. Invio la termina.

### Smussa le estremità [#chamfers]

<Command id="CHAMFER" />, poi <Keyword command="CHAMFER" id="Distance" />: `2`, e Invio prende `2` anche per la seconda distanza. <Keyword command="CHAMFER" id="Multiple" /> smussa un angolo dopo l'altro senza ricominciare: seleziona i due segmenti all'angolo di ogni estremità.

### Specchialo [#mirror]

<Command id="MIRROR" />: seleziona la polilinea, premi Invio, poi la linea di simmetria da `0,0` a `150,0`, l'asse, e Invio per mantenere l'originale.

### Disegna gli spigoli [#edges]

Con <Command id="LINE" />, gli spigoli visti attraverso l'albero, ciascuno `0,30` in alto dal basso: da `2,-15` e `148,-15` agli smussi, e da `40,-15` e `100,-15` agli spallamenti.

### Disegna l'asse [#axis]

Sul layer Assi, l'asse: una linea da `-8,0` a `166,0` più in là.

### Quotalo [#dimensions]

Sul layer Quote, <Command id="DIMLINEAR" /> per la prima lunghezza, 40, posizionata sotto. <Command id="DIMCONTINUE" /> prosegue dalla sua seconda linea di estensione: `#100,-20`, poi `#150,-15`, digitati dall'origine con #, e Invio due volte per terminare. Una <Command id="DIMLINEAR" /> finale dà la lunghezza totale, 150, più in basso.
