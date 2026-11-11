---
title: "Esercizio AutoCAD isometrico: un blocco a gradino"
metaTitle: "Disegno isometrico AutoCAD: un blocco a gradino"
description: "Disegna un blocco a gradino in isometrico in AutoCAD con LINEA (LINE) e coordinate polari sugli assi a 30°, 90° e 150°, e quotalo. Gratis, passo passo."
figure: "Un blocco a gradino in isometrico, lungo 60, profondo 40 e alto 40, con le misure quotate lungo gli spigoli."
sourceHash: "c1039d3b5e97"
---

Disegna questo blocco a gradino in isometrico, in millimetri: lungo 60, profondo 40 e alto 40, con un gradino profondo 20 e alto 20 lungo il suo fronte. Ogni spigolo segue uno degli assi isometrici: 30° e 210° per la lunghezza, 150° e 330° per la profondità, 90° e 270° per l'altezza. MellowCAD non ha ancora il disegno isometrico di AutoCAD, il suo snap isometrico e i cerchi isometrici, quindi gli spigoli sono linee digitate in coordinate polari, una lunghezza e un angolo.

## Steps

### Disegna il fronte del gradino [#front]

Sul layer Contorno, <Command id="LINE" /> da `0,0`, l'angolo anteriore in basso: `60<30`, `20<90`, `60<210`, poi <Keyword command="LINE" id="Close" />.

### Disegna il lato [#side]

Ancora da `0,0`, il lato sinistro: `40<150`, `40<90`, `20<330`, `20<270` e `20<330`. Invio termina la linea sullo spigolo anteriore del gradino.

### Disegna la faccia superiore [#top]

Il resto parte da angoli già disegnati: digita `_END`, lo snap a oggetto Punto finale per un punto, e seleziona l'angolo. Dall'angolo in alto a destra del fronte: `20<150`, `20<90`, `20<150` e `60<210`. Poi due linee di `60<210`, dalla base dell'alzata e dalla sua sommità.

### Quotalo [#dimensions]

Sul layer Quote, <Command id="DIMALIGNED" /> lungo gli spigoli, ciascuna posizionata accanto al proprio: 60 e 40 in basso, 40 in alto a sinistra, 20 in alto a destra.
