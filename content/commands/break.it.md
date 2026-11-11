---
title: "Comando SPEZZA (BREAK) in AutoCAD"
description: "Come funziona SPEZZA (BREAK, alias SZ) di AutoCAD in italiano: il punto indicato è il primo, poi il secondo, o Primo punto. Provalo."
figure: "Una linea spezzata tra due punti dati con Primo punto, e un cerchio spezzato da dove è stato indicato in senso antiorario fino a un secondo punto."
sourceHash: "f351112ef2fc"
---

SPEZZA taglia un vuoto in un oggetto, o lo divide in due. Seleziona l'oggetto: come in AutoCAD, il punto in cui lo hai indicato è il primo punto di interruzione, quindi la richiesta successiva chiede solo il secondo, e la parte tra i due è rimossa. Una linea, un arco, una polilinea aperta, un arco ellittico o una spline perde la parte tra i punti e diventa due oggetti; un cerchio o un'ellisse perde la parte che va in senso antiorario dal primo punto al secondo, e una polilinea chiusa la parte tra essi nell'ordine dei suoi vertici: ognuno diventa un solo oggetto aperto. Un punto fuori dall'oggetto è preso nel suo punto più vicino, e uno oltre un estremo taglia fino a quell'estremo. Mentre dai il secondo punto, la parte che SPEZZA conserverebbe è mostrata sopra l'oggetto. L'interruzione è un solo passo che Annulla annulla.

## Options

### First point

Al secondo punto di interruzione: indica di nuovo il primo punto di interruzione, poi il secondo, quando il punto in cui hai indicato l'oggetto non è dove inizia il vuoto.

## Missing

Un arco, un cerchio o un'ellisse che non giace parallelo all'UCS, che AutoCAD spezza e MellowCAD non trova. Un'ellisse intera che <Command id="MIRROR" /> ha capovolto, che AutoCAD spezza al contrario.

## Questions

### Qual è la scorciatoia di SPEZZA in AutoCAD?

`SZ`, poi Invio o barra spaziatrice. Funziona anche il nome completo, e `_BREAK` in tutte le lingue di AutoCAD.

### Come si spezza una linea in un punto?

Esegui <Command id="BREAKATPOINT" />, seleziona la linea e indica il punto: diventa due linee che si incontrano lì. In SPEZZA, digita `@` al secondo punto di interruzione per lo stesso risultato.

### Come si spezza una linea tra due punti?

Seleziona la linea, scegli <Keyword id="First point" />, poi indica il primo e il secondo punto: la parte tra essi è rimossa. Oppure indica la linea nel primo punto, e dai solo il secondo.

### Perché non posso spezzare un blocco o un testo?

SPEZZA spezza linee, archi, cerchi, polilinee, ellissi e spline. Un riferimento a blocco dice <Message id="cannotBreakBlock" />, e un testo, una quota o un tratteggio <Message id="objectCannotBeBroken" />; usa prima <Command id="EXPLODE" /> su un blocco per spezzarne i pezzi.

### In che verso SPEZZA taglia un cerchio?

In senso antiorario, dal primo punto al secondo, come in AutoCAD. Dai i punti al contrario per conservare l'altra parte.
