---
title: "Comando -OSNAP (snap ad oggetto) in AutoCAD"
description: "Lo snap ad oggetto di AutoCAD in italiano: -OSNAP (-OS) imposta le modalità, F3 le attiva, FIN, MED o Maiusc + clic destro ne forzano una. Provalo gratis."
figure: "-OSNAP imposta Medio e Centro come snap correnti; LINEA va poi dal punto medio di un lato al centro del cerchio, e il lato in alto mostra il suo marcatore Medio."
sourceHash: "acf7c6b99589"
---

Gli snap ad oggetto agganciano un punto indicato esattamente a un punto di un oggetto: un estremo, un punto medio, un centro. Con lo snap ad oggetto attivo, il cursore vicino a uno di questi punti mostra il suo marcatore, in verde, e il suo nome in un suggerimento; un clic cade allora su quel punto, non dove si trova il cursore. Gli snap correnti sono le modalità attive a ogni richiesta di punto: all'inizio Punto finale, Centro, Intersezione ed Estensione, come in AutoCAD. F3 attiva e disattiva lo snap ad oggetto, scrivendo `<Osnap on>` o `<Osnap off>`, e così fa il pulsante Snap ad oggetto della barra di stato, il cui menu ha una casella per ogni modalità. Con più snap sotto il cursore vince il più vicino, e Tab scorre gli altri. Orto, Polare e lo snap non spostano mai un punto agganciato.

-OSNAP imposta gli snap correnti dalla riga di comando. Elenca le modalità attive, poi chiede un elenco di modalità: ciascuna con le sue maiuscole, separate da virgole, come `FIN,MED,CEN`, o `_END,_MID` in tutte le lingue di AutoCAD. L'elenco sostituisce gli snap correnti e attiva lo snap ad oggetto; <Keyword id="NONe" />, <Keyword id="OFF" /> o Invio da solo li cancella. Una modalità che non conosce mostra <Message id="invalidOsnapModes" />, e la domanda si ripete. Digitato con un apostrofo, `'-OSNAP`, funziona dentro un altro comando. Gli snap correnti durano fino al ricaricamento della pagina, poi tornano i quattro di AutoCAD: come AutoCAD, il disegno non li conserva.

Per un solo punto, usa uno snap temporaneo: digita le maiuscole di una modalità a una richiesta di punto, `MED` o `_MID`, oppure tieni premuto Maiusc e fai clic destro per sceglierla da un menu. Si cerca solo quello snap, qualunque comando sia in corso, e solo per quel punto; se non trova nulla, il punto è rifiutato e richiesto di nuovo. Digitato con le sue maiuscole, <Keyword id="NONe" /> disattiva lo snap per un solo punto. Lo stesso menu offre <Command id="FROM" />: un punto base, poi uno scostamento da esso, quindi `@10,0` è 10 a destra.

## Options

### ENDpoint

L'estremo più vicino di una linea, un arco, un segmento di polilinea, un arco ellittico o una spline: gli angoli di un rettangolo, i vertici di un poligono. Il suo marcatore è un quadrato.

### MIDpoint

A metà di una linea, un arco, un segmento di polilinea, un arco ellittico o una spline. Un triangolo.

### CENter

Il centro di un cerchio, di un arco o dell'arco di una polilinea. Passa il cursore sulla curva stessa: al centro non c'è nulla da agganciare. Un cerchio.

### QUAdrant

I punti di un cerchio o di un arco a 0°, 90°, 180° e 270°, lungo X e Y dell'UCS, e gli estremi degli assi di un'ellisse. Un rombo.

### INTersection

Dove due oggetti si incrociano, o dove un percorso di tracciamento polare incrocia un oggetto. Una croce.

### EXTension

Oltre l'estremo di una linea, di un arco o di un segmento rettilineo di polilinea: passa il cursore sull'estremo, poi allontanati lungo la linea dell'oggetto. Dall'estremo compare un percorso tratteggiato, e una distanza digitata corre lungo di esso. Un più.

### INSertion

Il punto di inserimento di un testo, di una definizione di attributo o di un riferimento di blocco.

### PERpendicular

Il piede della perpendicolare dall'ultimo punto su una linea, anche oltre i suoi estremi, su un cerchio, un arco o un segmento di polilinea. Al primo punto di <Command id="LINE" /> attende il punto successivo: la linea parte dall'oggetto ad angolo retto. Un angolo retto.

### TANgent

Il punto di un cerchio o di un arco in cui lo tocca una linea dall'ultimo punto. Al primo punto di <Command id="LINE" /> attende il punto successivo: la linea parte dalla curva tangente ad essa. Un cerchio con una barra.

### NEArest

Il punto di un oggetto più vicino al cursore. Una clessidra.

### APParent

Intersezione apparente: dove due oggetti si incrociano nella vista, anche se sono ad altezze diverse; dove si incontrano davvero, è la loro intersezione.

### PARallel

Tieni il cursore su una linea per un momento, poi spostati lungo la sua direzione a partire dall'ultimo punto: un percorso parallelo alla linea vincola il punto successivo.

### NONe

Nessuno snap corrente: lo snap ad oggetto non trova nulla finché non si imposta di nuovo una modalità.

### OFF

Come <Keyword id="NONe" />: l'insieme degli snap correnti è cancellato.

## Missing

La finestra di dialogo Impostazioni disegno che OSNAP e OS aprono in AutoCAD: qui sono comandi sconosciuti, e il menu della barra di stato imposta le modalità. Nodo e Centro geometrico, come modalità e nei menu. Punto medio tra 2 punti, il punto di tracciamento temporaneo e i tasti tenuti premuti per uno snap su un punto (Maiusc + A, Maiusc + Q…). Intersezione, Perpendicolare e Tangente sulle ellissi, Perpendicolare e Tangente sulle spline, ed Estensione dall'estremo ad arco di una polilinea, o con la distanza e l'angolo nel suggerimento. Una Perpendicolare o una Tangente che attende l'altro punto all'inizio di un comando diverso da <Command id="LINE" /> e <Command id="CIRCLE" />. Le impostazioni di apertura e di marcatore, APERTURE e AUTOSNAP.

## Questions

### Che cos'è il comando OSNAP in AutoCAD?

In AutoCAD, OSNAP (`OS`) apre la finestra Impostazioni disegno nella scheda Snap ad oggetto, per scegliere gli snap correnti. MellowCAD non ha questa finestra: digita `-OSNAP` o `-OS` e un elenco di modalità, oppure spuntale nel menu del pulsante Snap ad oggetto della barra di stato.

### Qual è il tasto di scelta rapida dello snap ad oggetto?

F3 attiva e disattiva lo snap ad oggetto, come in AutoCAD; il pulsante Snap ad oggetto della barra di stato fa lo stesso. Maiusc + clic destro a una richiesta di punto apre il menu degli snap per un solo punto.

### Perché lo snap ad oggetto non funziona?

Forse F3 lo ha disattivato: lo mostra il suo pulsante nella barra di stato. Oppure la modalità non è attiva: impostala con `-OSNAP` o con il menu del pulsante. Il cursore deve arrivare entro circa 10 pixel dal punto, e per un centro, sopra il cerchio o l'arco stesso. Gli snap funzionano solo mentre un comando chiede un punto.

### Come si aggancia un punto una sola volta?

Alla richiesta di punto, digita le maiuscole della modalità, come `FIN` o `TAN`, oppure scegli dal menu di Maiusc + clic destro. Vale solo per quel punto, che la modalità sia attiva o no.

### Le impostazioni dello snap ad oggetto restano?

Fino al ricaricamento della pagina; poi tornano Punto finale, Centro, Intersezione ed Estensione. Neanche AutoCAD le conserva nel disegno.
