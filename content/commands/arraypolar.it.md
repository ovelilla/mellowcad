---
title: "Comando SERIEPOLARE (ARRAYPOLAR) in AutoCAD"
description: "Come funziona SERIEPOLARE (ARRAYPOLAR) di AutoCAD in italiano, richiesta per richiesta: il centro, gli elementi, l'angolo tra o riempito. Provalo gratis."
figure: "Un foro su una flangia in serie attorno al centro della flangia: 8 elementi su un giro completo."
sourceHash: "efed541dea7f"
---

SERIEPOLARE copia una selezione attorno a un punto centrale, come un solo oggetto serie. Chiede gli oggetti, dice il tipo e se la serie è associativa, chiede il punto centrale e mostra subito la serie: 6 elementi su un giro completo, ciascuno ruotato mentre gira. Poi una richiesta la modifica in tempo reale finché Invio la crea, con le sue opzioni o con i grip dell'anteprima, come in AutoCAD. Gli oggetti selezionati diventano il suo primo elemento.

## Options

### ASsociative

<Keyword id="Yes" />, il predefinito, crea un solo oggetto serie, che i suoi grip e la tavolozza Proprietà modificano poi; <Keyword id="No" /> crea copie separate accanto agli oggetti selezionati. La risposta è conservata per la sessione, anche da ARRAYRECT e ARRAYPATH.

### Items

Il numero di elementi, da 1 a 32767; l'angolo che riempiono è conservato.

### Angle between

L'angolo da un elemento al successivo. L'angolo riempito diventa quel numero di passi, con la direzione conservata, e un giro completo quando raggiungono 360°.

### Fill angle

L'angolo che gli elementi riempiono, positivo in senso antiorario e negativo in senso orario; il numero di elementi è conservato. Su un giro completo gli elementi distano un giro diviso il loro numero; su meno, l'ultimo cade alla fine dell'angolo.

### ROTate items

<Keyword id="Yes" />, il predefinito, ruota ogni elemento mentre gira attorno al centro; <Keyword id="No" /> lo sposta soltanto, così ogni elemento sta come il primo.

### eXit

Crea la serie e termina il comando, come fa Invio.

## Missing

Punto base; Asse di rotazione, per una serie attorno a un asse nello spazio; RIGhe e Livelli, per anelli di elementi e copie impilate in Z; Espressione, che lega un valore ai parametri del disegno. I menu dei grip della serie (Raggio di stiramento, Numero elementi, Angolo di riempimento…) e Ctrl per scorrerli.

## Questions

### Come si fa una serie polare?

Digita `ARRAYPOLAR`, seleziona gli oggetti, premi Invio e indica il punto centrale; oppure digita `SR` per <Command id="ARRAY" /> e scegli <Keyword command="ARRAY" id="POlar" /> dopo gli oggetti. Poi scegli <Keyword id="Items" /> per impostare quanti, e premi Invio per crearla.

### Come si dispongono gli oggetti in serie attorno a una parte di cerchio?

Scegli <Keyword id="Fill angle" /> e digita l'angolo: 180 dispone gli elementi su mezzo cerchio in senso antiorario, -180 in senso orario. Il numero di elementi è conservato, il primo e l'ultimo a ciascun estremo dell'angolo.

### Come si impedisce agli elementi di ruotare?

Scegli <Keyword id="ROTate items" /> e rispondi <Keyword id="No" />: ogni elemento è spostato attorno al centro senza ruotare.

### Come si cambia il raggio di una serie polare?

Seleziona la serie e trascina il suo grip quadrato nel punto base verso il centro o lontano da esso: la distanza dal centro è il nuovo raggio. Oppure riscrivi Raggio nella tavolozza Proprietà.
