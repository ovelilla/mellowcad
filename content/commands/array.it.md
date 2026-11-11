---
title: "Comando SERIE (ARRAY) in AutoCAD"
description: "Come funziona SERIE (ARRAY, alias SR) di AutoCAD in italiano: serie rettangolari, polari e lungo traiettoria. Provala gratis nel browser."
figure: "Un quadrato e il suo cerchio in serie con i valori predefiniti: Invio per una serie rettangolare, 4 colonne e 3 righe."
sourceHash: "5e0a412c9f13"
---

SERIE copia una selezione secondo uno schema: in colonne e righe, attorno a un centro, o lungo una traiettoria. Chiede gli oggetti, poi il tipo di serie, con Invio che sceglie quella rettangolare, e passa la selezione a <Command id="ARRAYRECT" />, <Command id="ARRAYPOLAR" /> o <Command id="ARRAYPATH" />, che proseguono senza richiedere di nuovo gli oggetti. Ognuna mostra subito la serie e la modifica in tempo reale, con le sue opzioni e i suoi grip, finché Invio la crea: un solo oggetto serie, oppure copie sciolte se hai detto che non deve essere associativa. L'intera esecuzione è un solo passo di annullamento, e Invio alla riga di comando ripete SERIE.

## Options

### Rectangular

Colonne e righe, e livelli impilati lungo Z se vuoi: <Command id="ARRAYRECT" />. Parte con 4 colonne e 3 righe, distanziate di una volta e mezza la dimensione della selezione.

### PAth

Lungo una linea, un arco, un cerchio o una polilinea: <Command id="ARRAYPATH" />. Chiede la curva della traiettoria, poi dispone gli elementi lungo di essa, ciascuno ruotato come ruota la traiettoria.

### POlar

Attorno a un punto centrale: <Command id="ARRAYPOLAR" />. Chiede il centro e parte con 6 elementi su un giro completo.

## Missing

Il tipo proposto è sempre Rettangolare: ARRAYTYPE, la variabile che imposta il predefinito di AutoCAD, non è letta.

## Questions

### Qual è la scorciatoia di SERIE in AutoCAD?

`SR`, poi Invio o barra spaziatrice. Funziona anche il nome completo, e `_ARRAY` in tutte le lingue di AutoCAD. <Command id="ARRAYRECT" />, <Command id="ARRAYPOLAR" /> e <Command id="ARRAYPATH" /> non hanno alias, e digitati per intero saltano la domanda sul tipo.

### Come si fa una serie circolare?

Scegli <Keyword id="POlar" />, oppure esegui <Command id="ARRAYPOLAR" />, e indica il punto centrale: la selezione è copiata attorno ad esso, 6 elementi all'inizio. Cambia il numero con <Keyword command="ARRAYPOLAR" id="Items" />, e imposta l'angolo che riempiono con <Keyword command="ARRAYPOLAR" id="Fill angle" />.

### Come si esplode una serie?

Selezionala ed esegui <Command id="EXPLODE" />: la serie diventa gli oggetti dei suoi elementi, ciascuno sul proprio layer. Per ottenere copie sciolte fin dall'inizio, rispondi <Keyword command="ARRAYRECT" id="No" /> a <Keyword command="ARRAYRECT" id="ASsociative" /> prima di premere Invio.

### Come si modifica una serie dopo averla creata?

Selezionala. I suoi grip la modificano: il quadrato nel punto base la sposta, le frecce impostano i numeri e la spaziatura, e un numero digitato mentre una freccia di conteggio è attiva è il conteggio. La tavolozza Proprietà elenca le sue colonne, righe e spaziature, o i suoi elementi e angoli, da riscrivere. ARRAYEDIT non c'è ancora.
