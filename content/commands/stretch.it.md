---
title: "Comando STIRA (STRETCH) in AutoCAD"
description: "Come funziona STIRA (STRETCH, alias STI) di AutoCAD: una finestra di intersezione sugli estremi da spostare, un punto base, un secondo punto. Provalo."
figure: "Un rettangolo e un cerchio stirati di 40 verso destra da una finestra di intersezione sul lato destro: gli angoli al suo interno si spostano, e il cerchio con loro."
sourceHash: "de8671fb4290"
---

STIRA (STRETCH) sposta la parte di un disegno che una finestra di intersezione include e stira ciò che la collega al resto. Seleziona con una finestra di intersezione, trascinata da destra a sinistra, o con un poligono di intersezione, sugli estremi e sui vertici da spostare; poi indica un punto base e un secondo punto, come in <Command id="MOVE" />. Ciò che la finestra include si sposta di quella distanza: gli estremi di una linea, i vertici di una polilinea, gli estremi di un arco, il contorno di un tratteggio, le origini di una quota. Ciò che sta interamente al suo interno si sposta intero; un cerchio, un testo o un riferimento di blocco si sposta quando il suo centro o il suo punto di inserimento è all'interno. Anche gli oggetti indicati uno a uno, o trovati con Finestra, si spostano interi. La stiratura è un solo passo che Annulla ripristina.

## Options

### Displacement

Scelto al prompt del punto base, o con Invio lì, il suo valore predefinito: chiede lo spostamento come vettore, `40,0` stira di 40 lungo X. Al secondo punto, Invio fa lo stesso con il punto base: le sue coordinate sono lo spostamento.

## Missing

Un arco ellittico con un estremo nella finestra, che AutoCAD rimodella: qui si sposta intero con il suo centro nella finestra, altrimenti resta. Un tratteggio non associativo incluso in parte, che AutoCAD lascia dov'è. Il testo di una quota nel suo posto predefinito resta quando è incluso solo quello.

## Questions

### Qual è l'alias di STIRA in AutoCAD?

`STI`, poi Invio o barra spaziatrice. Funziona anche il nome completo, e `_STRETCH` in qualsiasi lingua di AutoCAD. Attenzione: `S`, in italiano, è SPOSTA (MOVE).

### Perché STIRA sposta e basta gli oggetti?

Perché l'intero oggetto è dentro la finestra, o l'hai indicato: STIRA sposta questi interi. Trascina una finestra di intersezione, da destra a sinistra, solo sugli estremi che vuoi spostare.

### Come si stira di una distanza esatta?

Indica il punto base, poi digita lo spostamento: `40,0` stira di 40 lungo X, letto relativo al punto base con l'input dinamico attivo. Oppure punta il cursore nella direzione voluta, con Orto o il tracciamento polare, e digita solo la distanza.

### Si può stirare un blocco in AutoCAD?

Un riferimento di blocco si sposta intero quando il suo punto di inserimento è dentro la finestra, e resta quando non lo è: il suo interno non si stira. Prima <Command id="EXPLODE" /> per stirare i suoi pezzi.
