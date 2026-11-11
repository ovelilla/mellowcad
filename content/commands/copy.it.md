---
title: "Comando COPIA (COPY) in AutoCAD"
description: "Come funziona COPIA (COPY, alias CP) di AutoCAD in italiano: un punto base, poi tutte le copie che posizioni, con Annulla ed Esci. Provalo."
figure: "Un cerchio copiato tre volte lungo X da un punto base, poi Invio."
sourceHash: "e74bbdabf97c"
---

COPIA posiziona copie degli oggetti che selezioni: selezionali, indica un punto base, poi un secondo punto per ogni copia. Come in AutoCAD, la cui modalità di copia è Multipla per impostazione predefinita, continua a chiederne una in più finché non premi Invio o scegli Esci, ogni copia misurata dallo stesso punto base. Le copie conservano il layer, il colore e ogni altra proprietà degli oggetti. Gli oggetti selezionati prima del comando sono quelli che copia, e mentre posizioni una copia l'insieme segue il cursore.

## Options

### Displacement

Scelto alla richiesta del punto base, o con Invio lì: chiede uno spostamento come vettore, `30,0` posiziona una copia a 30 lungo X, e termina. Il suo predefinito è l'ultimo usato da COPIA in quel disegno.

### Exit

Termina il comando, come fa Invio una volta posizionata una copia.

### Undo

Annulla l'ultima copia posizionata. Annullare la prima dice <Message id="commandCompletelyUndone" /> e chiede di nuovo il secondo punto.

## Missing

Singola di COPYMODE (copiare una volta e terminare) non è offerta: COPIA è sempre Multipla, quindi la richiesta del punto base elenca solo <Keyword id="Displacement" />. Nemmeno Serie del secondo punto, la fila di copie equidistanti di AutoCAD, è offerta.

## Questions

### Qual è la scorciatoia di COPIA in AutoCAD?

`CP`, poi Invio o barra spaziatrice. Funziona anche il nome completo, e `_COPY` in tutte le lingue di AutoCAD. Attenzione: in AutoCAD italiano `CO` è COLORE, non COPIA.

### Come si fanno più copie in una volta?

Continua a posizionare: ogni punto che dai è una copia in più dallo stesso punto base, fino a Invio. Per copie in righe, colonne o attorno a un centro, <Command id="ARRAY" /> le fa in un colpo solo.

### Come si copia un oggetto a una distanza data?

Indica il punto base, poi digita il secondo punto come distanza: `30,0` lo copia a 30 lungo X, come l'input dinamico legge un punto dopo il primo. Oppure punta il cursore nella direzione, con Ortho o il tracciamento polare, e digita solo la distanza.

### Perché in COPIA non c'è l'opzione Serie?

MellowCAD non la offre ancora. Per una fila di copie equidistanti, <Command id="ARRAYRECT" /> con una riga fa lo stesso, e le conserva come un'unica serie modificabile.
