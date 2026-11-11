---
title: "Esercizio AutoCAD 3D: un supporto per cuscinetto"
metaTitle: "Esercizio AutoCAD 3D avanzato: un supporto"
description: "Modella un supporto per cuscinetto in AutoCAD 3D: estrusione, unione, poi foro e fori di fissaggio sottratti come cilindri, passo passo. Gratis online."
figure: "Il supporto in pianta, di 100 per 60, con mozzo, foro e fori quotati."
model: "Il supporto come solido, visto da sud-est nello stile visivo Concettuale."
sourceHash: "5579d6bd5a86"
---

Modella questo supporto per cuscinetto, in millimetri: una base di 100 per 60 con gli angoli di raggio 10, spessa 12; un mozzo di 40 di diametro e alto 40 al centro; un foro di 20 attraverso il mozzo e due fori di fissaggio di 10 attraverso la base, a distanza di 76. La base e il mozzo si estrudono dai loro contorni e si uniscono in un solo solido; il foro e i fori di fissaggio sono cilindri che si sottraggono dal solido.

## Steps

### Disegna la pianta [#plan]

Sul layer Contorno, <Command id="RECTANG" /> con un <Keyword command="RECTANG" id="Fillet" /> di `10`, da `0,0` a `100,60`, e un cerchio al suo centro, `50,30`, con un <Keyword command="CIRCLE" id="Diameter" /> di `40`.

### Estrudi la base e il mozzo [#extrude]

<Command id="EXTRUDE" /> il contorno per `12` di altezza, poi il cerchio per `40`: due solidi.

### Uniscili [#union]

<Command id="UNION" />: seleziona entrambi e premi Invio. Ora sono un solo solido.

### Disegna i cilindri [#holes]

Il foro e un foro di fissaggio come cilindri, con <Command id="CYLINDER" />: il foro in `50,30`, <Keyword command="CYLINDER" id="Diameter" /> `20` e alto `40`; un foro di fissaggio in `12,30`, diametro `10` e alto `12`. Poi <Command id="COPY" /> il foro da `12,30` a `76,0` più in là.

### Sottraili [#subtract]

<Command id="SUBTRACT" />: seleziona il supporto e premi Invio, poi i tre cilindri e Invio. Il foro e i fori attraversano il pezzo.

### Ruota la vista [#view]

<Command id="-VIEW" /> e <Keyword command="VIEW" id="SEiso" />, <Command id="VSCURRENT" /> e <Keyword command="VSCURRENT" id="Conceptual" />, poi <Command id="ZOOM" /> <Keyword command="ZOOM" id="Extents" /> e 0.8x per inquadrarlo.
