---
title: "Esercizio AutoCAD: un tavolo rotondo e le sedie"
metaTitle: "Esercizio AutoCAD: tavolo rotondo e sei sedie"
description: "Disegna un tavolo rotondo con sei sedie in AutoCAD: una sedia, poi una serie polare attorno al centro del tavolo, e le quote, passo passo. Gratis online."
figure: "Un tavolo rotondo di 120 con sei sedie, in pianta, quotato in centimetri."
sourceHash: "1e307bf5e17a"
---

Disegna un tavolo rotondo di 120 con sei sedie, in centimetri: ogni sedia un sedile di 44 per 40 con gli angoli arrotondati a 4 e uno schienale profondo 8, con il fronte a 8 dal bordo del tavolo. Disegna una sedia sopra il tavolo e lascia che una serie polare le posizioni tutte e sei. La scala delle quote del disegno è impostata per i centimetri.

## Steps

### Disegna il tavolo [#table]

Sul layer Contorno, <Command id="CIRCLE" /> in `0,0`, <Keyword command="CIRCLE" id="Diameter" /> `120`.

### Disegna una sedia [#chair]

Il sedile, sopra il tavolo: <Command id="RECTANG" /> con un <Keyword command="RECTANG" id="Fillet" /> di `4`, da `-22,68` a `44,40` più in là. Poi lo schienale, con il raccordo riportato a `0`, da `-22,108` a `44,8` più in là. <Command id="RECTANG" /> mantiene il suo raggio di raccordo finché non lo cambi.

### Disponi le sedie in serie [#array]

<Command id="ARRAYPOLAR" />: seleziona il sedile e lo schienale, premi Invio, indica il centro del tavolo, `0,0`, poi <Keyword command="ARRAYPOLAR" id="Items" />, `6`. Ogni sedia ruota mentre viene posizionata, quindi tutte e sei sono rivolte verso il tavolo.

### Quotala [#dimensions]

Sul layer Quote, <Command id="DIMDIAMETER" /> sul tavolo, posizionata all'interno, e <Command id="DIMLINEAR" /> per la larghezza della sedia in alto, 44, e la sua profondità con lo schienale, 48.
