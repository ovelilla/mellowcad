---
title: "Comando TRATTEGGIO (HATCH) in AutoCAD"
description: "Il tratteggio in AutoCAD in italiano con TRATTEGGIO (HATCH, alias PTR, RE), richiesta per richiesta: punto interno o oggetti, modello, scala, angolo, isole."
figure: "Un rettangolo con un cerchio dentro, tratteggiato con ANSI31 da un punto interno: il cerchio resta libero, un'isola."
sourceHash: "d3ed16b85a19"
---

TRATTEGGIO (HATCH in inglese) riempie un'area chiusa con un modello di linee, oppure pieno. Seleziona un punto all'interno dell'area e trova il contorno negli oggetti attorno, lasciando libero ciò che sta all'interno come un'isola, un cerchio in un rettangolo, un testo; oppure seleziona gli oggetti che la delimitano. Seleziona quante aree vuoi: Invio, o Esc, ne fa un solo tratteggio, sul layer corrente, dietro il suo contorno. L'intero comando è un solo passo che Annulla ripristina.

Il TRATTEGGIO di AutoCAD imposta il suo modello nella scheda Creazione tratteggio o in una finestra di dialogo, che MellowCAD non ha: qui chiede nella riga di comando ciò che chiede <Command id="-HATCH" />, il modello sotto <Keyword id="Properties" />. I due differiscono solo per Esc, che sotto <Command id="-HATCH" /> scarta le aree. Ogni tratteggio parte con il modello, la scala e l'angolo dati all'ultimo: ANGLE, con scala 1 e angolo 0, in un nuovo disegno.

## Options

### Properties

Chiede il nome del modello, in maiuscole o minuscole, proponendo quello corrente: <Keyword id="Solid" /> riempie l'area, e <Keyword id="?" /> elenca i modelli con le loro descrizioni, poi torna al punto. Per un modello chiede poi la scala, un numero maggiore di 0 o due punti misurati, e l'angolo, digitato o con due punti. Il tratteggio successivo mantiene tutti e tre.

<Session name="hatchPatterns" caption="SOLID e undici modelli di acadiso.pat, ciascuno tratteggiato in un quadrato di 30 di lato a scala 1, AR-CONC e AR-SAND a 0,08 e 0,1." />

### Select objects

Al posto di un punto interno, seleziona gli oggetti che delimitano l'area; Invio torna al punto. Un oggetto che non chiude nessuna area viene lasciato fuori; quando nessuno ne delimita una, Invio mostra <Message id="unableToHatchBoundary" /> e non crea nulla. Una regione dà il suo contorno, e i suoi fori come isole.

### Undo

Non elencata alla richiesta, ma accettata lì: annulla le aree dell'ultimo punto selezionato e chiede di nuovo, lasciando selezionati gli oggetti. Mostra <Message id="noBoundaryToUndo" /> quando non resta nessun punto da annullare.

## Missing

Ellissi e spline come contorni: un'area che chiudono non viene trovata, e una regione con un bordo di quel tipo viene lasciata fuori. Tolleranza di spazio (HPGAPTOL): un'area deve essere chiusa con esattezza. Tratteggi associativi, gli stili di isole Normale e Ignora, sfumature, modelli definiti dall'utente e il resto dei modelli di acadiso.pat. Le altre opzioni di -TRATTEGGIO: disegnare un contorno, rimuovere contorni, Avanzate, ordine di visualizzazione, origine, annotativo, colore, layer e trasparenza. MODIFICATRATT e l'editor dei tratteggi, che in AutoCAD si apre con un doppio clic. MIRRHATCH 1: un tratteggio riflesso mantiene sempre l'angolo del suo modello. I menu dei grip di un tratteggio.

## Questions

### Come si chiama il comando HATCH in italiano?

TRATTEGGIO, alias `PTR`, `RE` o `RETINO`, poi Invio o barra spaziatrice; l'alias inglese `H` in AutoCAD in italiano non esiste. Senza scheda Creazione tratteggio, pone le sue domande nella riga di comando, come `-RE` (<Command id="-HATCH" />). Come in AutoCAD in italiano, il nome inglese funziona anche con il trattino basso davanti: `_HATCH`.

### Perché il tratteggio non funziona in AutoCAD?

Per lo più perché l'area non è chiusa: mostra <Message id="hatchNoBoundary" />, e basta la più piccola fessura, perché nulla ne colma una. Chiudi il contorno e seleziona di nuovo. Un'area chiusa da un'ellisse o da una spline non viene ancora trovata, e gli oggetti su un layer disattivato non si vedono.

### Quali modelli di tratteggio esistono, e se ne possono scaricare altri?

Una selezione di acadiso.pat, il file dei modelli metrici di AutoCAD: SOLID, ANGLE, da ANSI31 a ANSI38, AR-CONC, AR-SAND, BRICK, CROSS, DASH, DOTS, EARTH, HONEY, LINE, NET, NET3, SQUARE, STEEL e ZIGZAG. <Keyword id="?" /> sotto <Keyword id="Properties" /> li elenca. Un file di modelli tuo o scaricato non si può ancora caricare.

### Come si cambia la scala di un tratteggio?

Prima di selezionare, sotto <Keyword id="Properties" />: la scala viene dopo il nome del modello. Una volta creato, seleziona il tratteggio e riscrivi Scala nella tavolozza Proprietà, oppure dagli il modello, la scala e l'angolo di un altro tratteggio con <Command id="MATCHPROP" />. Una scala così piccola che il modello richiederebbe troppe linee mostra <Message id="hatchTooDense" /> e non crea nessun tratteggio.

### Come si trova l'area di un tratteggio?

Selezionalo e leggi Area sotto Geometria nella tavolozza Proprietà, con le sue isole escluse; con più tratteggi selezionati, Area cumulativa li somma. Oppure avvia <Command id="AREA" />, scegli <Keyword command="AREA" id="Object" /> e seleziona il tratteggio.
