---
title: "Comando TAGLIA (TRIM) in AutoCAD"
description: "Come funziona TAGLIA (TRIM, alias TA) di AutoCAD in italiano: modalità Rapido e Standard, spigoli di taglio, Intercetta e Interseca. Provalo."
figure: "Una linea tagliata fino alle due linee che la incrociano: ogni estremo indicato una volta, in modalità Rapido."
sourceHash: "fcbf44618cf3"
---

TAGLIA (TRIM) taglia un oggetto fino al punto in cui altri oggetti lo incrociano: indichi il pezzo da togliere, ed esso scompare fino all'incrocio più vicino da ciascun lato. Parte in modalità Rapido, come quello di AutoCAD: ogni oggetto è uno spigolo di taglio, e un oggetto che nulla incrocia viene cancellato per intero. Tenere premuto Maiusc mentre indichi prolunga invece l'oggetto fino allo spigolo più vicino, come fa <Command id="EXTEND" />. Ogni selezione è un passaggio di annullamento; Invio termina il comando.

## Options

### cuTting

Sceglie quali oggetti tagliano: selezionali, oppure premi Invio per prenderli tutti. Da allora tagliano solo quelli, qualunque sia la modalità, finché il comando non termina.

### Fence

Chiede i punti di una linea, quanti ne vuoi fino a Invio: ogni oggetto che incrocia viene tagliato dove lo incrocia, in un solo passaggio. La modalità Standard la elenca; la modalità Rapido la accetta anch'essa, e un clic sul vuoto vi avvia automaticamente un'intercettazione a due punti.

### Crossing

Chiede i due angoli di una finestra: tutto ciò che il suo contorno incrocia viene tagliato, in un solo passaggio. Un oggetto interamente dentro la finestra non è uno che essa incrocia.

### mOde

Passa da <Keyword id="Quick" /> a <Keyword id="Standard" />. In modalità Standard TAGLIA chiede prima gli spigoli di taglio (Invio li prende tutti), lascia un oggetto che nessuno spigolo incrocia con <Message id="doesNotIntersectCuttingEdge" />, elenca Intercetta e Spigolo, e un clic sul vuoto avvia una finestra di intersezione. La modalità è di TAGLIA ed ESTENDI insieme, e dura per la sessione.

### Edge

Solo modalità Standard. Con <Keyword id="Extend" />, uno spigolo taglia anche dove incrocerebbe se fosse prolungato: una linea in entrambe le direzioni, un arco lungo tutto il suo cerchio; <Keyword id="No extend" /> è il valore predefinito.

### eRase

Cancella oggetti senza lasciare il comando: selezionali, poi Invio li cancella, come un passaggio di annullamento di TAGLIA.

### Undo

Elencata una volta che la richiesta ha ricevuto una risposta, una selezione, una linea Intercetta, una finestra: annulla l'ultimo taglio, e quando non resta nulla da annullare lo segnala.

## Missing

Proiezione: l'opzione di proiezione di AutoCAD (Nessuna, Ucs, Vista) non è offerta, e tutto viene calcolato proiettato sul piano XY dell'UCS, che è il valore predefinito di AutoCAD, Ucs. Una linea di intercettazione non può ancora essere trascinata con il cursore, solo indicato punto per punto. La modalità di taglio e la scelta di Spigolo durano per la sessione, dove AutoCAD le conserva da una sessione all'altra. Un oggetto inclinato rispetto all'UCS, a parte una spline, né taglia né viene tagliato.

## Questions

### Come si chiama il comando TRIM in italiano?

TAGLIA, con l'alias `TA`: digitalo, poi Invio o barra spaziatrice. Come in AutoCAD in italiano, funziona anche il nome inglese, preceduto da un trattino basso: `_TRIM`.

### Perché TAGLIA cancella tutta la linea?

Perché TAGLIA è in modalità Rapido, il valore predefinito di AutoCAD dalla versione 2021: indicare un oggetto che nessuno spigolo incrocia lo cancella. Scegli <Keyword id="mOde" /> e poi <Keyword id="Standard" /> perché TAGLIA lo lasci e lo segnali invece.

### Come si tagliano più linee insieme?

Clicca in un punto vuoto e indica un secondo punto: ogni oggetto che quella linea incrocia viene tagliato in un solo passaggio. Oppure scegli <Keyword id="Crossing" /> e traccia una finestra sui pezzi da togliere.

### Come si prolunga una linea con TAGLIA?

Tieni premuto Maiusc mentre indichi la linea vicino all'estremo da prolungare: si allunga fino allo spigolo più vicino, come con <Command id="EXTEND" />, e la selezione successiva senza Maiusc taglia di nuovo.
