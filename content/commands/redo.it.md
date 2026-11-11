---
title: "Comando RIPETI (REDO) in AutoCAD"
description: "Come funziona RIPETI (REDO) di AutoCAD in italiano: ripristina ciò che l'ultimo U o ANNULLA ha annullato; MREDO e Ctrl+Y vanno passo per passo."
figure: "Un foro disegnato in una piastra, annullato con U e ripristinato con RIPETI."
sourceHash: "be2e44b98ac0"
---

RIPETI (REDO) inverte l'ultimo <Command id="U" /> o <Command id="UNDO" />: ciò che aveva annullato viene disegnato di nuovo, per intero, così dopo un ANNULLA di cinque comandi RIPETI ripristina tutti e cinque. Scrive i nomi dei comandi mentre lo fa, poi <Message id="everythingRedone" /> quando non resta più nulla da ripristinare. Non chiede nulla e non ha opzioni.

Funziona solo subito dopo l'annullamento. In qualsiasi altro momento segnala <Message id="redoMustFollowUndo" /> e, dopo che un altro comando è stato eseguito, anche uno che non cambia nulla come LIST o ZOOM, <Message id="nothingToRedo" />. Con l'annullamento disattivato dall'opzione Controllo Nessuno di ANNULLA, RIPETI segnala che è disabilitato.

<Command id="MREDO" /> ripristina passo per passo: chiede un numero di azioni, oppure <Keyword command="MREDO" id="All" /> o <Keyword command="MREDO" id="Last" />, e ripristina altrettanti dei passi che gli annullamenti hanno annullato, qualunque cosa abbiano eseguito nel frattempo U, ANNULLA e RIPETI; Last è l'intero ultimo annullamento, una sola volta (<Message id="alreadyRedone" />). Ctrl+Y e Ripeti nel menu contestuale eseguono MREDO con 1, annullando il comando in corso.

## Missing

Anche Ctrl+Maiusc+Z ripristina, in silenzio, anche se AutoCAD non vi associa nulla. I pulsanti Annulla e Ripeti della barra superiore non scrivono nulla nella cronologia, dove la barra di accesso rapido di AutoCAD scrive la propria.

## Questions

### Qual è l'alias di RIPETI in AutoCAD?

Ctrl+Y, che ripristina un passo (MREDO 1). RIPETI non ha alias: digita `RIPETI`, oppure `_REDO` in qualsiasi lingua di AutoCAD.

### Perché RIPETI non funziona?

RIPETI inverte solo l'U o l'ANNULLA che lo precede immediatamente. Dopo qualsiasi altro comando non c'è nulla da ripristinare, anche se non ha cambiato nulla: annulla, poi ripristina subito.

### Qual è la differenza tra RIPETI e MREDO?

RIPETI ripristina l'intero ultimo annullamento, e solo subito dopo. <Command id="MREDO" /> ripristina un numero dei passi annullati, uno alla volta, o tutti, e funziona ancora dopo un RIPETI.

### Come si ripete l'ultimo comando in AutoCAD?

Premi Invio o la barra spaziatrice alla richiesta Comando: l'ultimo comando riparte. RIPETI non ripete un comando; inverte un annullamento.
