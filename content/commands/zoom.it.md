---
title: "Comando ZOOM in AutoCAD"
description: "Come funziona ZOOM (Z) di AutoCAD in italiano: Estensioni, Finestra, Precedente, Scala con nX, Oggetto e Tutto, la rotellina del mouse, lo zoom trasparente."
figure: "Una piastra con un piccolo foro vicino al suo angolo: ZOOM Estensioni, poi una finestra attorno al foro, che riempie allora la vista."
sourceHash: "cd72af4956e4"
---

ZOOM rende la vista più grande o più piccola; nulla nel disegno si muove né cambia dimensione. La sua prima richiesta accetta un angolo, che avvia una finestra, un fattore di scala o un'opzione. Digitato con un apostrofo, `'ZOOM` o `'Z`, funziona all'interno di un altro comando, che prosegue dopo lo zoom. La rotellina del mouse ingrandisce e riduce attorno al cursore, e un doppio clic sul pulsante della rotellina è ZOOM Estensioni. Ogni ZOOM è un passo di annullamento, quelli consecutivi un solo passo, quindi <Command id="U" /> ripristina anche la vista.

## Options

### All

Inquadra tutto ciò che è disegnato, come fa <Keyword id="Extents" />.

### Extents

Inquadra tutto ciò che è disegnato, grande quanto la finestra permette. Senza nulla disegnato segnala <Message id="regeneratingModel" />, e digitato all'interno di un altro comando rifiuta con <Message id="requiresRegen" />, come fa quello di AutoCAD.

### Previous

Torna alla vista precedente, fino a 20 viste indietro. Se non ne resta nessuna: <Message id="noPreviousView" />.

### Scale

Un fattore: `2X` avvicina di due volte rispetto alla vista corrente, `0.5X` la allontana della metà, e `2` senza la X il doppio della scala della vista di ZOOM Tutto. `nXP`, il fattore dello spazio carta, viene letto come `nX`: qui c'è solo lo spazio modello. Un fattore digitato alla prima richiesta fa lo stesso senza scegliere l'opzione.

### Window

Due angoli, indicati o trascinati, inquadrano quel rettangolo. Un angolo indicato alla prima richiesta fa lo stesso.

### Object

Inquadra gli oggetti che selezioni, o quelli selezionati prima di ZOOM.

## Missing

Tempo reale: Invio alla prima richiesta termina ZOOM, dove AutoCAD inizia lo zoom con il mouse; qui lo fa la rotellina. Dinamico, Centro e le opzioni nascoste Sinistra e Vmax.

## Questions

### Qual è l'alias di ZOOM in AutoCAD?

`Z`, poi Invio o barra spaziatrice. Funziona anche il nome completo, e `_ZOOM` in qualsiasi lingua di AutoCAD. `Z` poi `E` è ZOOM Estensioni.

### Come si zooma per adattare l'intero disegno?

<Keyword id="Extents" />: digita `Z`, Invio, `E`, Invio. Oppure fai doppio clic sul pulsante della rotellina del mouse.

### Che cosa significa ZOOM XP in AutoCAD?

`nXP` imposta una vista di un layout a una scala relativa allo spazio carta: `1/50XP` mostra il modello in scala 1:50 sul foglio. MellowCAD non ha layout, quindi `XP` viene letto come `X`.

### Come si zooma su un oggetto in AutoCAD?

Scegli <Keyword id="Object" /> e selezionalo, oppure selezionalo prima ed esegui poi ZOOM Oggetto: la vista lo inquadra.

### Come si torna alla vista precedente?

<Keyword id="Previous" />, ancora e ancora per le viste precedenti, fino a 20.
