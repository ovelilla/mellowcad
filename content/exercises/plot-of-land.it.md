---
title: "Esercizio AutoCAD: un lotto di terreno"
metaTitle: "Esercizio AutoCAD topografia: area di un terreno"
description: "Disegna un lotto di terreno in AutoCAD dalla lunghezza e dall'angolo dei lati con coordinate polari, poi misura la sua area e quotalo. Gratis, online."
figure: "Un lotto di cinque lati, in metri, con la quota di ogni lato e di un angolo."
sourceHash: "f5542a75eef7"
---

Disegna questo lotto di terreno, in metri, dalla lunghezza e dalla direzione dei suoi lati: 40 a 0°, 30 a 80°, 35 a 155° e 25 a 230°, poi di nuovo all'inizio. Misura la sua area e il suo perimetro, e quota ogni lato e l'angolo al secondo vertice. Le coordinate polari, una lunghezza e un angolo, disegnano ogni lato dalla fine del precedente. La scala delle quote del disegno è impostata per i metri.

## Steps

### Disegna il confine [#boundary]

Sul layer Contorno, <Command id="PLINE" /> da `0,0`, poi ogni lato come la sua lunghezza e il suo angolo: `40<0`, `30<80`, `35<155` e `25<230`, ciascuno misurato dall'ultimo punto. <Keyword command="PLINE" id="Close" /> disegna il quinto lato e chiude il confine: un solo oggetto, che <Command id="AREA" /> può misurare.

### Misura la sua area [#area]

<Command id="AREA" />, poi <Keyword command="AREA" id="Object" />, e seleziona il confine: la riga di comando ne dà l'area, in metri quadrati, e il perimetro.

### Quotalo [#dimensions]

Sul layer Quote, <Command id="DIMALIGNED" /> e Invio alla prima richiesta: a quel punto chiede un oggetto, e un clic su un lato quota quel lato, in parallelo. Posiziona ogni quota fuori dal lotto. <Command id="DIMANGULAR" /> sui due lati che si incontrano in `40,0` dà l'angolo tra loro, 100°.
