---
title: "Comando OFFSET in AutoCAD"
description: "Come funziona OFFSET (alias OF) di AutoCAD in italiano: una distanza o Punto, Cancella e Layer, un oggetto alla volta. Provalo."
figure: "Un rettangolo con offset di 6 all'interno e un cerchio con offset di 6 all'esterno, ciascuno selezionato, poi il suo lato."
sourceHash: "b495af1e1410"
---

OFFSET disegna una copia di un oggetto parallela ad esso, a una distanza che digiti o attraverso un punto che selezioni: una linea dà una linea parallela, un cerchio o un arco uno concentrico, una polilinea un contorno all'interno o all'esterno di essa, un'ellisse o una spline una spline che la segue. Come in AutoCAD, agisce su un oggetto alla volta: indichi la distanza una volta, poi selezioni un oggetto e il lato su cui mettere la sua copia, quante volte vuoi. Invio lo termina.

## Options

### Through

Al posto di una distanza, ogni copia passa per un punto che selezioni o digiti. È il valore predefinito della prima richiesta, quindi Invio lì lo sceglie finché non è stata data una distanza; da quel momento Invio ripete l'ultima distanza, in quel disegno.

### Erase

Chiede se cancellare ogni oggetto di origine una volta che ne è stato fatto l'offset, <Keyword id="Yes" /> o <Keyword id="No" /> (il valore predefinito). Con <Keyword id="Yes" />, la copia sostituisce l'oggetto. La scelta viene mantenuta per il resto della sessione, e l'OFFSET successivo la riporta nella sua prima riga.

### Layer

Chiede dove vanno le copie: sul layer <Keyword id="Current" />, oppure su quello dell'oggetto <Keyword id="Source" /> (il valore predefinito). Mantenuto anch'esso per la sessione.

### Exit

Termina il comando, come fa Invio alla richiesta dell'oggetto.

### Multiple

Alla richiesta del lato: continua a fare offset dello stesso oggetto senza selezionarlo di nuovo, ogni copia a una distanza in più dalla precedente, fino a Invio o <Keyword id="Exit" />.

### Undo

Annulla l'ultima copia, da qualunque oggetto provenga, e chiede di nuovo un oggetto. Quando non resta nessuna copia da annullare, lo segnala.

## Missing

OFFSETGAPTYPE 1 e 2: gli angoli di una polilinea con offset sono sempre chiusi come con 0, con i segmenti estesi fino a incontrarsi. L'offset di una spline o di un'ellisse rientra nella tolleranza di AutoCAD, ma i suoi nodi cadono dove li mette MellowCAD, non dove li mette AutoCAD. L'opzione Through su una spline mostra X e Y nella sua descrizione comandi, non la distanza.

## Questions

### Come si chiama il comando OFFSET in italiano?

OFFSET, come in inglese, alias `OF`, poi Invio o barra spaziatrice; l'alias inglese `O` in AutoCAD in italiano non esiste. Il nome inglese funziona anche con il trattino basso davanti: `_OFFSET`.

### Perché non riesco a fare l'offset di un oggetto?

OFFSET fa l'offset di linee, archi, cerchi, polilinee 2D, ellissi e spline. Rifiuta testi, testi multilinea, riferimenti di blocco, quote e tratteggi con <Message id="cannotOffsetObject" />, e lo fa anche quando la distanza ridurrebbe a nulla un cerchio, un arco o una polilinea. Un oggetto su un layer bloccato non si può selezionare, e una polilinea 3D viene saltata.

### Come si fa l'offset della stessa linea più volte?

Seleziona la linea, poi digita la lettera di <Keyword id="Multiple" /> alla richiesta del lato: ogni selezione su quel lato crea una copia in più, ciascuna una distanza oltre la precedente. Oppure mantieni il valore predefinito e seleziona ogni volta la copia più recente.

### Come si mettono le copie dell'offset sul layer corrente?

Scegli <Keyword id="Layer" /> alla prima richiesta, poi <Keyword id="Current" />. Da quel momento ogni copia va sul layer corrente, finché non scegli di nuovo <Keyword id="Source" />.
