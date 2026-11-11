---
title: "Comando ESTENDI (EXTEND) in AutoCAD"
description: "Come funziona ESTENDI (EXTEND, alias ES) di AutoCAD in italiano, richiesta per richiesta: modalità Rapida e Standard, bordi di contorno, Maiusc per tagliare."
figure: "Due linee estese fino alla linea che sbarra il loro percorso: ciascuna selezionata una volta vicino all'estremità che si allunga, in modalità Rapida."
sourceHash: "b2c0044f8e87"
---

ESTENDI (EXTEND in inglese) allunga un oggetto finché incontra un altro: lo selezioni vicino all'estremità che deve crescere, e quell'estremità prosegue fino al bordo più vicino sul suo cammino. Estende linee, archi, archi ellittici, polilinee aperte (lungo il loro segmento finale, rettilineo o ad arco), polilinee 3D e spline aperte. Parte in modalità Rapida, come quella di AutoCAD: ogni oggetto è un contorno. Tenendo premuto Maiusc mentre selezioni, taglia invece, come fa <Command id="TRIM" />. Ogni selezione è un passo che Annulla ripristina; Invio termina il comando.

## Options

### Boundary

Sceglie quali oggetti fanno da contorno: selezionali, oppure premi Invio per sceglierli tutti. Da quel momento fanno da contorno solo quelli, qualunque sia la modalità, fino alla fine del comando.

### Fence

Chiede i punti di una linea, quanti ne vuoi fino a Invio: ogni oggetto che attraversa viene esteso dall'estremità più vicina al punto in cui la linea lo attraversa, in un solo passo. La modalità Standard la elenca; la modalità Rapida la accetta comunque.

### Crossing

Chiede i due angoli di una finestra: ogni oggetto che il suo contorno attraversa viene esteso, in un solo passo.

### mOde

Passa da <Keyword id="Quick" /> a <Keyword id="Standard" />. In modalità Standard ESTENDI chiede prima i bordi di contorno (Invio li sceglie tutti) ed elenca Fence ed Edge. La modalità è sia di ESTENDI sia di TAGLIA e dura per la sessione.

### Edge

Solo in modalità Standard. Con <Keyword id="Extend" />, un oggetto si ferma anche dove un contorno sarebbe se proseguisse, una linea in entrambe le direzioni, un arco lungo il suo cerchio, così una linea può crescere fino a una che non arriva sul suo cammino; <Keyword id="No extend" /> è il valore predefinito.

### Undo

Elencata una volta che la richiesta ha avuto una risposta, una selezione, una linea di selezione, una finestra: annulla l'ultima estensione e, quando non resta nulla da annullare, lo dice.

## Missing

Project: l'opzione di proiezione di AutoCAD (None, Ucs, View) non è disponibile e tutto è calcolato proiettato sul piano XY dell'UCS, che è il valore predefinito di AutoCAD, Ucs. Una linea di selezione non si può ancora trascinare con il cursore, solo indicare punto per punto. La modalità e la scelta di Edge durano per la sessione, mentre AutoCAD le conserva da una sessione all'altra. Un oggetto inclinato rispetto all'UCS, a parte una spline, non fa da contorno e non viene esteso, e una polilinea levigata da <Keyword command="PEDIT" id="Fit" /> di <Command id="PEDIT" /> viene rifiutata, dove AutoCAD fa crescere il suo ultimo arco.

## Questions

### Come si chiama il comando EXTEND in italiano?

ESTENDI, alias `ES`, poi Invio o barra spaziatrice; l'alias inglese `EX` in AutoCAD in italiano non esiste. Come in AutoCAD in italiano, il nome inglese funziona anche con il trattino basso davanti: `_EXTEND`.

### Perché ESTENDI dice che non c'è nessun bordo?

Perché nulla si trova lungo il cammino che quell'estremità seguirebbe. Una linea mostra <Message id="noEdgeInThatDirection" /> quando la sua altra estremità raggiungerebbe un bordo, e una linea o un arco <Message id="pathDoesNotIntersectBoundingEdge" /> altrimenti; una polilinea o una spline mostra <Message id="objectDoesNotIntersectEdge" />. Seleziona più vicino all'altra estremità, oppure in modalità Standard scegli <Keyword id="Edge" /> ed <Keyword id="Extend" /> perché un contorno che non arriva conti come se proseguisse. Un cerchio, una polilinea chiusa, un'ellisse intera, un testo o un tratteggio non si possono estendere affatto: <Message id="cannotExtendObject" />

### Come si estendono più linee insieme?

Seleziona in un punto vuoto e indica un secondo punto: ogni oggetto che quella linea attraversa cresce dalla sua estremità più vicina, in un solo passo. Oppure scegli <Keyword id="Crossing" /> e traccia una finestra sulle estremità da estendere.

### Come si taglia con ESTENDI?

Tieni premuto Maiusc mentre selezioni: il pezzo viene tagliato fino agli incroci più vicini, come farebbe <Command id="TRIM" />, e un oggetto che nulla attraversa viene eliminato. La selezione successiva senza Maiusc estende di nuovo.
