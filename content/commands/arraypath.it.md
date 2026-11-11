---
title: "Comando SERIETRAIETT (ARRAYPATH) in AutoCAD"
description: "Come funziona SERIETRAIETT (ARRAYPATH) di AutoCAD in italiano: la curva, Misura o Dividi, gli elementi e l'allineamento. Provalo."
figure: "Un piccolo quadrato all'inizio di un arco, in serie lungo di esso: Dividi, 7 elementi, ciascuno ruotato con l'arco."
sourceHash: "d0d77418d682"
---

SERIETRAIETT copia una selezione lungo una traiettoria, una linea, un arco, un cerchio o una polilinea, come un solo oggetto serie. Chiede gli oggetti, indica il tipo e se la serie è associativa, chiede la curva della traiettoria e mostra subito la serie: gli elementi distanziati di una volta e mezza la dimensione della selezione, quanti ne entrano lungo la traiettoria, ciascuno ruotato come ruota la traiettoria. Una traiettoria aperta parte dall'estremo più vicino al punto indicato, un cerchio in senso antiorario dal suo angolo 0. Poi una richiesta modifica la serie in tempo reale finché Invio la crea, con le sue opzioni o con i grip dell'anteprima, come in AutoCAD. Gli oggetti selezionati restano dove sono, come primo elemento.

## Options

### ASsociative

<Keyword id="Yes" />, il predefinito, crea un solo oggetto serie, che i suoi grip e la tavolozza Proprietà modificano poi; <Keyword id="No" /> crea copie separate accanto agli oggetti selezionati. La risposta è conservata per la sessione, anche da ARRAYRECT e ARRAYPOLAR.

### Method

<Keyword id="Measure" />, il predefinito, colloca gli elementi a una distanza data, tanti quanti ne entrano; <Keyword id="Divide" /> distribuisce un numero di elementi in modo uniforme su tutta la traiettoria, uno a ciascun estremo di una traiettoria aperta.

### Items

Con Dividi, il numero di elementi. Con Misura, la distanza tra essi, poi quanti, fino al massimo che ne entra, indicato dal comando; <Keyword id="Fill entire path" /> li prende tutti.

### Align items

<Keyword id="Yes" />, il predefinito, ruota ogni elemento come ruota la traiettoria dal suo inizio; <Keyword id="No" /> lo sposta soltanto lungo di essa.

### eXit

Crea la serie e termina il comando, come fa Invio.

## Missing

La serie non segue la sua traiettoria: se modifichi la traiettoria dopo, la serie conserva quella su cui è stata creata. Spline, ellissi e polilinee 3D non possono ancora essere traiettorie, né una traiettoria fuori dal piano dell'UCS. Punto base, Direzione tangente, Righe, Livelli, Direzione Z ed Espressione non sono disponibili, né un gruppo alla richiesta della traiettoria, e i grip della serie non hanno menu.

## Questions

### Come si dispongono gli oggetti in serie lungo una curva?

Digita `ARRAYPATH`, seleziona gli oggetti, premi Invio e indica la traiettoria vicino all'estremo da cui partire; oppure digita `SR` per <Command id="ARRAY" /> e scegli <Keyword command="ARRAY" id="PAth" /> dopo gli oggetti. Poi imposta la spaziatura o il numero di elementi, e premi Invio per crearla.

### Perché la mia serie lungo traiettoria non segue la traiettoria?

Qui una serie conserva la traiettoria com'era quando è stata creata: sposta o stira la traiettoria dopo e la serie resta com'è, mentre la serie associativa lungo traiettoria di AutoCAD la seguirebbe. Anche cancellare la traiettoria lascia la serie. Se gli elementi non ruotano con la traiettoria, scegli <Keyword id="Align items" /> e rispondi <Keyword id="Yes" />.

### Come si cambia la direzione di una serie lungo traiettoria?

Indica la traiettoria vicino all'altro estremo: una traiettoria aperta parte dall'estremo più vicino al punto indicato. Un cerchio va sempre in senso antiorario dal suo angolo 0.

### Come si distanziano gli elementi in modo uniforme su tutta la traiettoria?

Scegli <Keyword id="Method" />, poi <Keyword id="Divide" />, poi <Keyword id="Items" /> e digita quanti: sono distribuiti in modo uniforme, il primo e l'ultimo agli estremi di una traiettoria aperta.
