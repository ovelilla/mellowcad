---
title: "Comando SPOSTA (MOVE) in AutoCAD"
description: "Come funziona SPOSTA (MOVE, alias S) di AutoCAD in italiano, richiesta per richiesta: seleziona, punto base e secondo punto, o uno spostamento come X,Y,Z."
figure: "Un cerchio spostato di 50 a destra: selezionato, il suo centro come punto base, il secondo punto digitato."
sourceHash: "753ca38448bf"
---

SPOSTA (MOVE in inglese) trasferisce gli oggetti che selezioni da un punto a un altro: selezionali, indica un punto base, poi un secondo punto, e si spostano della distanza e nella direzione dal primo al secondo. Non cambia nient'altro. Come in AutoCAD, gli oggetti selezionati prima del comando sono quelli che sposta, un punto si può indicare, agganciare o digitare, e mentre scegli il secondo punto l'insieme segue il cursore, con una linea dal punto base. Lo spostamento è un solo passaggio di annullamento.

## Options

### Displacement

Scelto alla richiesta del punto base, o premendo Invio lì, il suo valore predefinito: chiede lo spostamento come vettore, `10,5` sposta di 10 lungo X e di 5 lungo Y, e il suo valore predefinito è l'ultimo usato da SPOSTA in quel disegno. Al secondo punto, Invio fa lo stesso con il punto base: le sue coordinate sono lo spostamento.

## Missing

Due modalità di selezione di AutoCAD alla richiesta degli oggetti, Gruppo e Multiplo, e la selezione di facce, spigoli o vertici di un solido con Ctrl per rimodellarlo. Mentre l'insieme segue il cursore mostra il colore di ciascun oggetto, ma non il tipo di linea né lo spessore di linea, e gli oggetti di un riferimento di blocco hanno tutti il colore del riferimento.

## Questions

### Come si chiama il comando MOVE in italiano?

SPOSTA, alias `S`, poi Invio o barra spaziatrice; in AutoCAD in italiano `S` è SPOSTA, e STIRA è `STI`. Come in AutoCAD in italiano, il nome inglese funziona anche con il trattino basso davanti: `_MOVE`.

### Come si sposta un oggetto di una distanza stabilita?

Indica il punto base, poi digita lo spostamento come secondo punto: `50,0` sposta di 50 lungo X. Con l'input dinamico attivo, com'è all'avvio, un punto dopo il primo è relativo al primo, quindi la cronologia lo scrive `@50,0`. Oppure punta il cursore nella direzione da seguire, con Orto o il puntamento polare, e digita solo la distanza.

### Come si spostano oggetti verso l'alto in 3D?

Dai allo spostamento una Z: `0,0,5` come secondo punto, o come <Keyword id="Displacement" />, solleva l'insieme di 5. Un punto digitato senza Z si trova all'elevazione corrente.

### Qual è la differenza tra SPOSTA e STIRA?

SPOSTA sposta oggetti interi. <Command id="STRETCH" /> sposta solo le estremità e i vertici dentro la sua finestra di intercetta, e stira gli oggetti a cui appartengono.
