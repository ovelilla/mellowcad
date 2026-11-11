---
title: "Comando SERIERETTANG (ARRAYRECT) in AutoCAD"
description: "Come funziona SERIERETTANG (ARRAYRECT) di AutoCAD in italiano: colonne, righe e livelli, la spaziatura, associativa o no. Provalo."
figure: "Un quadrato e il suo cerchio in 5 colonne e 3 righe, a 16 e 14 di distanza: il numero dato, poi la spaziatura."
sourceHash: "c8c8d747d0c9"
---

SERIERETTANG copia una selezione in colonne e righe, e in livelli se vuoi, come un solo oggetto serie. Chiede gli oggetti, indica il tipo e se la serie è associativa, e la mostra subito: 4 colonne lungo X dell'UCS e 3 righe lungo la sua Y, distanziate di una volta e mezza la dimensione della selezione. Poi una richiesta la modifica in tempo reale finché Invio la crea, con le sue opzioni o con i grip dell'anteprima, come in AutoCAD: fai clic su una delle sue frecce, poi fai clic dove deve andare o digita un numero, per impostare un numero o una spaziatura. Anche Esc lì crea la serie. Gli oggetti selezionati diventano il suo primo elemento.

## Options

### ASsociative

<Keyword id="Yes" />, il predefinito, crea un solo oggetto serie: i suoi grip e la tavolozza Proprietà lo modificano poi, e <Command id="EXPLODE" /> lo scompone nei suoi elementi. <Keyword id="No" /> crea copie separate accanto agli oggetti selezionati. La risposta è conservata per la sessione, anche da ARRAYPOLAR e ARRAYPATH.

### COUnt

Il numero di colonne, poi di righe, da 1 a 32767 ciascuno.

### Spacing

La distanza tra le colonne, poi tra le righe, negativa verso sinistra o in basso. Oppure <Keyword id="Unit cell" />: i due angoli di un rettangolo i cui lati sono entrambi distanze.

### COLumns

Il numero di colonne e la distanza tra esse.

### Rows

Il numero di righe, la distanza tra esse e un incremento di quota per cui ogni riga sale rispetto alla precedente.

### Levels

Copie impilate lungo Z dell'UCS: il numero di livelli, poi la distanza tra essi, o con <Keyword id="Total" /> la distanza dal primo livello all'ultimo.

### eXit

Crea la serie e termina il comando, come fa Invio.

## Missing

Punto base; Totale alle distanze tra colonne e tra righe (Livelli lo ha); Espressione, che lega un valore ai parametri del disegno. ARRAYEDIT e ARRAYCLOSE, che modificano l'origine di una serie o ne sostituiscono gli elementi. I menu dei grip della serie (Numero colonne, Spaziatura totale colonne, Angolo asse…) e Ctrl per scorrerli, quindi una spaziatura totale o un angolo dell'asse non si possono impostare da un grip; né un grip scrive le sue righe alla riga di comando. Base X e Base Y della tavolozza non si possono riscrivere.

## Questions

### Come si avvia una serie rettangolare?

Digita `ARRAYRECT`, che non ha alias, oppure `SR` per <Command id="ARRAY" /> e Invio alla sua domanda, poiché la rettangolare è il suo predefinito. Seleziona gli oggetti e premi Invio: la serie è disegnata subito, pronta da modificare.

### Come si imposta la distanza tra righe e colonne?

Scegli <Keyword id="Spacing" /> e digita la distanza tra le colonne, poi tra le righe; una negativa va a sinistra o in basso. Con <Keyword id="Unit cell" />, due angoli danno entrambe in una volta. Oppure trascina le frecce alla seconda colonna e alla seconda riga.

### Come si rendono le copie oggetti separati?

Scegli <Keyword id="ASsociative" /> e rispondi <Keyword id="No" /> prima di premere Invio: ogni copia è un oggetto a sé. Una serie associativa si può scomporre poi nei suoi elementi con <Command id="EXPLODE" />.

### Come si fa una serie 3D?

Scegli <Keyword id="Levels" />: le righe e le colonne sono copiate in alto lungo Z dell'UCS, tanti livelli quanti dici, alla distanza che dai. <Keyword id="Rows" /> chiede anche un incremento di quota, che solleva ogni riga rispetto alla precedente.
