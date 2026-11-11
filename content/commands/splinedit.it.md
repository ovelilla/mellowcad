---
title: "Comando EDITSPLINE (SPLINEDIT) in AutoCAD"
description: "Come funziona EDITSPLINE (SPLINEDIT, alias ESI) di AutoCAD: Chiudi, Unisci, Dati di adattamento, Edita vertice, converti in Polilinea e Inverti. Provalo."
figure: "Una spline per cinque punti di adattamento, chiusa da EDITSPLINE: un anello morbido che li attraversa tutti."
sourceHash: "bedcaab2fac3"
---

EDITSPLINE (SPLINEDIT) modifica una spline. Indicane una a `Selezionare spline:`, oppure selezionala prima del comando; anche un doppio clic su una spline esegue EDITSPLINE su di essa. Qualsiasi altra cosa segnala <Message id="objectNotSpline" /> e chiede di nuovo; una polilinea adattata dall'opzione Spline di PEDIT viene trasformata in una spline della stessa curva, senza segnalarlo. Poi chiede un'opzione dopo l'altra, ciascuna applicata subito, fino a <Keyword id="eXit" /> o Invio. La spline mostra i grip dei suoi punti di adattamento e, mentre ne modifichi i vertici, i suoi vertici di controllo e la poligonale di controllo. L'intera modifica è un solo passaggio che <Command id="U" /> annulla. `'ZOOM` digitato funziona a ogni sua richiesta.

## Options

### Close

Chiude la spline in modo morbido: una spline di adattamento per i suoi punti di adattamento, una spline VC sui suoi vertici. Su una spline chiusa l'opzione è <Keyword id="Open" />, e Unisci non viene offerta.

### Join

Unisce curve aperte che incontrano i suoi estremi, secondo le regole di JOIN per una spline, e riporta quante ne ha unite.

### Fit data

Modifica i punti per cui passa la spline. Una spline VC, che non ne ha, riceve prima dei punti di adattamento sulla sua curva. Le sue opzioni: <Keyword id="Add" /> indica un punto di adattamento e ne aggiunge di nuovi dopo di esso, ripetutamente (al primo punto di una spline aperta, <Keyword id="After" /> o <Keyword id="Before" />); <Keyword id="Delete" /> toglie punti di adattamento, fino a due, tre su una spline chiusa (<Message id="cannotDeleteBeyond" />); <Keyword id="Move" /> scorre i punti di adattamento con <Keyword id="Next" /> e <Keyword id="Previous" />, o <Keyword id="Select point" />, e sposta quello corrente nel punto che indichi; <Keyword id="Purge" /> elimina i dati di adattamento, lasciando una spline VC; <Keyword id="Tangents" /> imposta le direzioni iniziale e finale, o <Keyword id="System default" />; <Keyword id="Close" /> ed <Keyword id="eXit" /> come alla prima richiesta. Una selezione che non è un punto di adattamento segnala <Message id="notAFitPoint" />.

### Edit vertex

Modifica i vertici di controllo; una spline di adattamento perde i suoi dati di adattamento alla prima modifica. <Keyword id="Add" /> mette un vertice nel punto che indichi sulla spline; <Keyword id="Delete" /> ne toglie uno, fino a due, tre su una spline chiusa; <Keyword id="Elevate order" /> alza l'ordine, fino a 26, mai per abbassarlo; <Keyword id="Move" /> sposta vertici, scorrendo come fa Sposta di Dati di adattamento; <Keyword id="Weight" /> imposta il peso di un vertice, dopo <Message id="splineMadeRational" />, così la curva viene attirata più vicino al vertice o più lontano. Una selezione che non è un vertice segnala <Message id="notAControlVertex" />.

### convert to Polyline

Chiede una precisione da 0 a 99, 10 per impostazione predefinita, e sostituisce la spline con una polilinea di segmenti rettilinei, tanti di più quanto più alta è la precisione; una polilinea 3D dove la spline non è piana e parallela al piano XY. Termina il comando. La precisione si conserva per la sessione, e la usa anche la conversione di PEDIT.

### Reverse

Inverte la spline, con il suo primo punto per ultimo: <Message id="splineReversed" />.

### Undo

Annulla l'ultima opzione, un intero Dati di adattamento o Edita vertice in una volta. Se non ne resta nessuna: <Message id="commandCompletelyUndone" />.

### eXit

Termina il comando, come fa Invio.

## Missing

Deviazione, che mette uno spigolo vivo in un punto di adattamento o vertice; Tolleranza, che rifà l'adattamento della spline entro una tolleranza; le Tangenti di una spline chiusa. La conversione in polilinea crea molti più vertici di una spline di adattamento di quanti ne crei AutoCAD, mai archi, e sostituisce sempre la spline. Gruppo a `Selezionare spline:`. Il `+` che AutoCAD disegna sul punto corrente mentre scorri i punti.

## Questions

### Qual è l'alias di EDITSPLINE in AutoCAD?

`ESI`, poi Invio o barra spaziatrice. Funziona anche il nome completo, e `_SPLINEDIT` in qualsiasi lingua di AutoCAD. Anche un doppio clic su una spline lo esegue.

### Come si converte una spline in una polilinea?

Avvia EDITSPLINE, indica la spline e scegli <Keyword id="convert to Polyline" />; una precisione di 10 dà una polilinea morbida. Anche <Command id="PEDIT" /> su una spline propone di convertirla.

### Come si aggiungono o si spostano punti su una spline?

Scegli <Keyword id="Fit data" /> per lavorare sui punti per cui passa, poi <Keyword id="Add" /> o <Keyword id="Move" />. Scegli <Keyword id="Edit vertex" /> per lavorare sui vertici di controllo che la inquadrano.

### Come si chiude una spline?

Scegli <Keyword id="Close" />: si chiude in modo morbido, senza spigolo dove incontra se stessa. <Keyword id="Open" /> la riapre.

### Come si uniscono due spline?

Scegli <Keyword id="Join" /> e seleziona la spline il cui estremo incontra quello di questa, oppure usa <Command id="JOIN" />.
