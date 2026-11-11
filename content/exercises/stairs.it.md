---
title: "Esercizio AutoCAD: una scala in pianta"
metaTitle: "Esercizio AutoCAD architettura: scala in pianta"
description: "Disegna una scala dritta in pianta in AutoCAD: dieci pedate da una linea e una serie rettangolare, la freccia di salita e le quote. Gratis, passo passo."
figure: "Una scala dritta in pianta, di 280 per 100 centimetri, con la freccia verso l'alto della rampa."
sourceHash: "ff6e60262cd9"
---

Disegna una scala dritta in pianta, in centimetri: lunga 280 e larga 100, dieci pedate di 28 e la freccia che indica il senso di salita. La scala delle quote del disegno è impostata per una pianta in centimetri, quindi le sue quote si leggono a questa misura. Si disegna il bordo di una pedata; una serie rettangolare posiziona le altre.

## Steps

### Disegna il contorno [#outline]

Sul layer Contorno, <Command id="RECTANG" /> da `0,0` a `280,100`: il contorno della rampa.

### Disegna la prima pedata [#tread]

Il bordo della prima pedata, una <Command id="LINE" /> da `28,0`, `0,100` in alto, e Invio.

### Disponi le pedate in serie [#array]

<Command id="ARRAYRECT" /> la copia lungo la rampa: seleziona la linea e premi Invio, poi scegli <Keyword command="ARRAYRECT" id="COUnt" />, `9` colonne e `1` riga, e <Keyword command="ARRAYRECT" id="Spacing" />, `28` tra le colonne e `1` tra le righe, il che non fa nulla con una sola riga. <Keyword command="ARRAYRECT" id="eXit" /> la mantiene come serie associativa, che i suoi grip modificano in seguito.

### Disegna la freccia [#arrow]

<Command id="PLINE" /> da `14,50`, lungo la rampa fino a `226,0` più in là; poi <Keyword command="PLINE" id="Width" />, `10` all'inizio e `0` alla fine, e un ultimo segmento di `24,0`: la punta della freccia. Invio la termina.

### Quotala [#dimensions]

Sul layer Quote, <Command id="DIMLINEAR" /> tre volte: la lunghezza sotto, la larghezza a destra e una pedata, 28, sopra.
