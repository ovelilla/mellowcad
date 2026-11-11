---
title: "Comando SNAP in AutoCAD"
description: "Come funziona SNAP (SN, F9) di AutoCAD: il cursore vincolato a un reticolo con il passo che imposti, Aspetto per X e Y distinti, e lo snap polare. Provalo."
figure: "SNAP 10 con la griglia attiva, poi LINEA indicata fuori dal reticolo: ogni punto cade su di esso, e così il cursore."
sourceHash: "a1089484f2f1"
---

La modalità Snap vincola il cursore a un reticolo: ogni punto indicato cade sul più vicino dei suoi punti, quindi con un passo di 10 un clic in 13,7 diventa 10,10. Il reticolo è quello dell'UCS corrente, dalla sua origine lungo i suoi assi. F9 attiva e disattiva la modalità Snap, scrivendo `<Snap on>` o `<Snap off>`, e lo stesso fa il suo pulsante nella barra di stato. Vengono arrotondati solo i punti indicati: una coordinata digitata viene presa come digitata, e uno snap a oggetto ha la precedenza sul reticolo. La griglia (F7) disegna un reticolo proprio, e lo mostra con lo snap attivo o no.

Il comando SNAP imposta il passo: digitalo, oppure indica due punti a quella distanza, e la modalità Snap si attiva con quel passo in X e Y. Invio la attiva così com'è. Un passo di 0 o inferiore viene rifiutato con <Message id="positiveNonzero" />. Digitato con un apostrofo, `'SNAP`, funziona all'interno di un altro comando. La modalità Snap e il suo passo vengono salvati con il disegno, e U annulla uno SNAP.

Il menu Snap della barra di stato sceglie invece lo Snap polare: lungo un percorso di tracciamento polare il cursore avanza di POLARDIST o, finché POLARDIST è 0, del passo X dello snap.

## Options

### ON

Attiva la modalità Snap con il passo corrente, come fa Invio.

### OFF

Disattiva la modalità Snap; il passo viene conservato.

### Aspect

Chiede un passo orizzontale, poi uno verticale, e attiva la modalità Snap: un reticolo più alto o più largo che quadrato. Il valore predefinito del prompt è allora Aspetto, quindi Invio li chiede di nuovo.

## Missing

Stile, snap isometrico, e Tipo, griglia o polare, al prompt: il menu della barra di stato sceglie il tipo. Legacy, l'opzione nascosta Ruota (SNAPANG) e SNAPBASE. Un POLARDIST negativo, che lo snap polare di AutoCAD prende come sua dimensione: −10 avanza di 10.

## Questions

### Qual è l'alias di SNAP in AutoCAD?

F9 attiva e disattiva la modalità Snap. Il comando è `SN`, poi Invio o barra spaziatrice, per impostare il passo; funziona anche il nome completo, e `_SNAP` in qualsiasi lingua di AutoCAD.

### Qual è la differenza tra SNAP e OSNAP?

La modalità Snap arrotonda il cursore a un reticolo di punti nello spazio. Gli snap a oggetto (F3) lo bloccano su punti degli oggetti, punti finali, punti medi, centri. Lavorano insieme, e uno snap a oggetto ha la precedenza dove entrambi trovano un punto.

### Perché il mio cursore salta a scatti?

La modalità Snap è attiva: premi F9, o il pulsante snap della barra di stato, per disattivarla. Imposta un passo più piccolo con SNAP se vuoi gli scatti più fini.

### Come si impostano passi snap X e Y diversi?

Esegui SNAP, scegli <Keyword id="Aspect" /> e indica il passo orizzontale, poi quello verticale.

### Esiste uno snap isometrico?

Non ancora: l'opzione Stile di SNAP, che ruota il reticolo per il disegno isometrico, non è offerta.
