---
title: "Comando DIVIDI (DIVIDE) in AutoCAD"
description: "Dividere una linea in parti uguali con DIVIDI (DIVIDE, alias DD) di AutoCAD in italiano: punti o blocchi su linee, cerchi, archi e polilinee. Provalo."
figure: "PDMODE 3 perché i punti si vedano come croci; poi una linea divisa in 5 e un cerchio in 6, che parte dal suo punto a 0°."
sourceHash: "6f3c52078466"
---

DIVIDI (DIVIDE) segna un oggetto in parti uguali. Seleziona una linea, un arco, un cerchio, un'ellisse, un arco ellittico, una polilinea, una polilinea 3D o una spline, facendo clic su di essa o digitando un punto che vi si trova, poi indica il numero di segmenti, da 2 a 32767: DIVIDI mette un oggetto punto a ogni divisione e termina. Non taglia l'oggetto, che resta intero. Un oggetto aperto diviso in 5 riceve 4 punti, a partire dal suo inizio; uno chiuso ne riceve 5, compreso l'inizio: un cerchio dal suo punto a 0°, in senso antiorario, una polilinea chiusa dal suo primo vertice. I punti stanno sull'oggetto, alla sua quota, sul layer corrente con il colore, il tipo di linea e lo spessore di linea correnti.

I punti si disegnano come dice lo stile del punto del disegno, e quello predefinito è un punto minuscolo che si nasconde sotto la linea: scegli prima una figura visibile con <Command id="PTYPE" /> o con PDMODE. Tutta la divisione è un passo che <Command id="U" /> annulla, e i suoi punti sono il gruppo di selezione Precedente, pronti da cancellare o spostare. Qualsiasi altro oggetto, un testo o un riferimento di blocco, riceve <Message id="cannotDivideObject" />, e il comando termina. Anche il menu a discesa Punti degli strumenti di Disegna avvia DIVIDI.

## Options

### Block

Al posto dei punti, riferimenti di un blocco già presente nel disegno: indica il suo nome, poi se allineare ciascuno con l'oggetto, <Keyword id="Yes" /> (il valore predefinito) o <Keyword id="No" />, poi il numero di segmenti. Allineato, ogni riferimento ruota con l'oggetto nel suo punto, lungo una linea o tangente a un arco; non allineato, ciascuno mantiene l'asse X dell'UCS. Un nome senza un blocco dietro viene rifiutato e richiesto di nuovo. Gli attributi variabili del blocco vengono tralasciati, come in AutoCAD.

## Missing

Un'elica, che MellowCAD non sa ancora disegnare. I blocchi lungo un oggetto che non giace nel piano dell'UCS vengono posati nel piano dell'UCS, dove la guida di AutoCAD li mette in quello dell'oggetto. I punti di un cerchio partono sempre lungo l'asse X dell'UCS, dove AutoCAD li fa partire dall'angolo di snap, SNAPANG, che MellowCAD non ha.

## Questions

### Come si chiama il comando DIVIDE in italiano?

DIVIDI, alias `DD`, poi Invio o barra spaziatrice; l'alias inglese `DIV` in AutoCAD in italiano non esiste. Il nome inglese funziona anche con il trattino basso davanti: `_DIVIDE`.

### Perché il comando DIVIDI non funziona?

Molto probabilmente funziona: i punti ci sono, disegnati come punti minuscoli sulla linea. Apri <Command id="PTYPE" /> (`DDPTYPE`) e scegli una croce o un cerchio, oppure digita PDMODE e `3`: tutti i punti del disegno cambiano insieme. Per agganciarli, usa lo snap ad oggetto Nodo, `NOD`.

### Come si divide una linea in parti uguali?

Avvia DIVIDI, seleziona la linea e digita il numero di parti, `5` per cinque. I quattro punti tra le parti sono quelli a cui agganciarsi: lo snap Nodo li trova.

### Come si divide un cerchio in parti uguali?

Allo stesso modo: seleziona il cerchio e digita il numero di parti. Un oggetto chiuso riceve tanti punti quante sono le parti, quindi 6 dà sei punti, il primo nel punto a 0° del cerchio, poi in senso antiorario.

### Come si spezza una linea in più pezzi?

DIVIDI segna soltanto i punti. Per tagliare la linea lì, usa <Command id="BREAK" />, oppure <Command id="BREAKATPOINT" /> in ogni punto, agganciandoti con Nodo.
