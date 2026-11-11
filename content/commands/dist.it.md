---
title: "Comando DIST in AutoCAD"
description: "Misurare una distanza con DIST (DI) di AutoCAD in italiano: due punti, angoli e delta X, Y, Z, oppure una serie di punti. Provalo gratis online."
figure: "DIST lungo la diagonale di una piastra di 100 per 60: la distanza, l'angolo nel piano XY e i delta."
sourceHash: "31fbe420bc43"
---

DIST misura la distanza tra due punti. Seleziona, aggancia o digita il primo punto e il secondo, e scrive nella riga di comando la distanza, l'angolo nel piano XY e l'angolo da esso, e i delta in X, Y e Z, poi termina. Ogni punto è misurato dov'è, con la sua Z, quindi la distanza è quella vera nello spazio. Invio al primo punto parte dall'ultimo punto indicato, e al secondo misura di nuovo fino al primo. I numeri seguono la precisione del disegno, e gli angoli AUPREC.

## Options

### Multiple

<Keyword id="Multiple" /> punti, al secondo punto: una serie di punti invece di una sola misura, con la distanza finora scritta prima di ogni punto successivo e mostrata sopra il cursore, fino a Invio o <Keyword id="Total" />.

### Arc

Misura invece lungo archi, con le opzioni ad arco di PLINEA: <Keyword id="Angle" />, <Keyword id="Center" />, <Keyword id="Close" />, <Keyword id="Direction" />, <Keyword id="Line" />, <Keyword id="Radius" />, <Keyword id="Second pt" />, <Keyword id="Undo" />. La lunghezza di ogni arco si somma alla serie.

### Close

Torna al primo punto, aggiunge quell'ultimo tratto, scrive il totale e termina.

### Length

Aggiunge un tratto della lunghezza che digiti lungo l'ultimo.

### Undo

Annulla l'ultimo punto della serie.

### Total

Scrive il totale della serie e termina; Invio fa lo stesso.

## Missing

MEASUREGEOM, gli strumenti Misura della barra multifunzione, che racchiudono le richieste di DIST in un ciclo con Radius, Angle, Area, Volume e Quick: qui il pulsante Distanza della barra multifunzione esegue DIST. All'opzione <Keyword id="Center" /> di Arc, l'angolo incluso si legge in gradi, mentre AutoCAD 2027 vi legge un numero come distanza lungo il cursore.

## Questions

### Qual è il comando per misurare una distanza in AutoCAD?

DIST, alias `DI`, poi Invio o barra spaziatrice. Ha lo stesso nome in AutoCAD in italiano e in inglese, e `_DIST` funziona in tutte le lingue di AutoCAD.

### Come si misura una distanza in AutoCAD?

Digita `DI`, poi seleziona i due punti, con gli snap ad oggetto per cadere sui punti finali o sui centri degli oggetti. La distanza viene scritta nella riga di comando con l'angolo e i delta.

### Come si misura la lunghezza totale di più segmenti?

Al secondo punto scegli <Keyword id="Multiple" /> punti e continua a selezionare: la distanza finora viene mostrata a ogni punto e Invio scrive il totale.

### Come si misura una distanza in 3D?

Indica i punti con la loro Z, oppure aggancia oggetti alla loro altezza: DIST misura la vera distanza nello spazio e scrive l'angolo dal piano XY e il delta in Z.

### Perché DIST mostra meno decimali di quelli che servono?

Scrive le lunghezze alla precisione del disegno, qui due cifre decimali in un nuovo disegno. Impostane di più in <Command id="UNITS" />, fino a otto.
