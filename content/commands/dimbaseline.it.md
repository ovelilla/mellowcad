---
title: "Comando DIMLBASE (DIMBASELINE) in AutoCAD"
description: "Come DIMLBASE (DIMBASELINE, alias DBA) di AutoCAD impila le quote da una linea base: origini, spaziatura, Seleziona e Annulla. Provalo."
figure: "Un profilo a gradini quotato 30 dal suo bordo sinistro, poi 70 e 100 dallo stesso bordo, ciascuna una linea più in fuori."
sourceHash: "cd7902f90b59"
---

DIMLBASE disegna quote che misurano tutte da una stessa linea di estensione, la base: ognuna va dalla prima linea di estensione dell'ultima quota al punto successivo che dai, con la sua linea di quota un passo più all'esterno. Parte dall'ultima quota lineare o allineata creata da quando il disegno è stato aperto, quindi di solito segue <Command id="DIMLINEAR" /> o <Command id="DIMALIGNED" />; se non ce n'è, chiede da quale partire. La riga di comando indica ogni misura man mano che è creata. Invio alla richiesta dell'origine sceglie <Keyword id="Select" />, e Invio lì termina il comando, come fa Esc.

Il passo è la spaziatura base dello stile di quota corrente, 3,75 in ISO-25, per la scala globale della base. Come in AutoCAD, ogni nuova quota misura lungo la direzione della sua base, e prende lo stile di quota e il layer della base, con il colore, il tipo di linea e lo spessore di linea correnti.

## Options

### Select

Chiede la quota base: seleziona una quota lineare o allineata, vicino alla linea di estensione da cui misurare. Anche un punto digitato lì seleziona. Una quota di raggio o di diametro è rifiutata con <Message id="associativeDimensionRequired" />, e la domanda si ripete.

### Undo

Annulla l'ultima quota creata e prosegue da quella precedente, tante volte quante ce ne sono. Quando non ne resta nessuna, la sua risposta è <Message id="commandCompletelyUndone" /> e la richiesta resta.

## Missing

Una quota non è associativa: le quote non seguono gli oggetti che misurano. Una quota angolare non può essere una base: AutoCAD ne accetta una creata per ultima o selezionata; qui, creata per ultima, il comando chiede una quota, e selezionata è rifiutata come lo è una radiale. Le quote ordinate non esistono ancora.

## Questions

### Qual è la scorciatoia di DIMLBASE in AutoCAD?

`DBA`, poi Invio o barra spaziatrice. Funziona anche il nome completo, e `_DIMBASELINE` in tutte le lingue di AutoCAD.

### Come si cambia la spaziatura delle quote da linea base?

È la spaziatura base dello stile di quota: <Command id="DIMSTYLE" /> (`D`) apre gli stili nella tavolozza Stili, dove si trova sotto Linee, come in AutoCAD. Le quote già disegnate conservano il loro posto; <Command id="DIMSPACE" /> le spazia di nuovo, in modo uniforme.

### Come si parte da un'altra quota?

Premi Invio alla prima richiesta, oppure scegli <Keyword id="Select" />, e seleziona la quota vicino alla linea di estensione da cui misurare: ogni nuova quota parte da lì.

### Qual è la differenza tra DIMLBASE e DIMCONTINUA?

DIMLBASE misura ogni quota dalla stessa linea di estensione, ciascuna su una linea più all'esterno. <Command id="DIMCONTINUE" /> le mette una dopo l'altra su una sola linea, ciascuna da dove è finita l'ultima.
