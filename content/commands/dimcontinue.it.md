---
title: "Comando DIMCONTINUA (DIMCONTINUE) in AutoCAD"
description: "Come DIMCONTINUA (DIMCONTINUE, alias DCO) di AutoCAD concatena le quote una dopo l'altra dall'ultima: origini, Seleziona, Annulla. Provalo."
figure: "Un profilo a gradini quotato 30, poi proseguito 40 e 30 lungo la stessa linea: due origini, poi Invio due volte."
sourceHash: "11fa474694fd"
---

DIMCONTINUA disegna una catena di quote una dopo l'altra: ognuna parte dalla seconda linea di estensione della precedente e misura fino al punto successivo che dai, sulla stessa linea di quota. Continua l'ultima quota lineare o allineata creata da quando il disegno è stato aperto, quindi di solito segue <Command id="DIMLINEAR" /> o <Command id="DIMALIGNED" />; se non ce n'è, chiede quale continuare. La riga di comando indica ogni misura man mano che è creata. Invio alla richiesta dell'origine sceglie <Keyword id="Select" />, e Invio lì termina il comando, come fa Esc.

Come in AutoCAD, ogni nuova quota misura lungo la direzione della sua base, e prende lo stile di quota e il layer della base, con il colore, il tipo di linea e lo spessore di linea correnti.

## Options

### Select

Chiede la quota da cui continuare: seleziona una quota lineare o allineata, vicino alla linea di estensione da cui proseguire. Anche un punto digitato lì seleziona. Una quota di raggio o di diametro è rifiutata con <Message id="associativeDimensionRequired" />, e la domanda si ripete.

### Undo

Annulla l'ultima quota della catena e prosegue da quella precedente, tante volte quante ce ne sono. Quando non ne resta nessuna, la sua risposta è <Message id="commandCompletelyUndone" /> e la richiesta resta.

## Missing

Una quota non è associativa: una catena non segue gli oggetti che misura. Una quota angolare non si può continuare: AutoCAD ne continua una creata per ultima o selezionata; qui, creata per ultima, il comando chiede una quota, e selezionata è rifiutata come lo è una radiale. Le quote ordinate non esistono ancora.

## Questions

### Qual è la scorciatoia di DIMCONTINUA in AutoCAD?

`DCO`, poi Invio o barra spaziatrice. Funziona anche il nome completo, e `_DIMCONTINUE` in tutte le lingue di AutoCAD.

### Qual è la differenza tra DIMCONTINUA e DIMLBASE?

DIMCONTINUA mette le quote una dopo l'altra su una sola linea, ciascuna da dove è finita l'ultima. <Command id="DIMBASELINE" /> le misura tutte dalla stessa linea di estensione, ciascuna su una linea più all'esterno.

### Come si continua da una quota che non è l'ultima?

Premi Invio alla prima richiesta, oppure scegli <Keyword id="Select" />, e seleziona la quota vicino alla linea di estensione da cui proseguire: la catena cresce da lì.

### Perché DIMCONTINUA mi chiede di selezionare una quota?

Non ha una quota da continuare: nessuna lineare o allineata è stata creata da quando il disegno è stato aperto, come in AutoCAD dopo averne aperto uno, oppure l'ultima creata è angolare. Seleziona quella da cui continuare.
