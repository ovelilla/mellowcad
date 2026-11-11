---
title: "Esercizio AutoCAD 3D: una puleggia"
metaTitle: "Esercizio AutoCAD 3D: puleggia per rivoluzione"
description: "Modella una puleggia in AutoCAD 3D: la sua mezza sezione come polilinea chiusa, ruotata attorno all'asse Y in un solido, passo passo. 3D gratis online."
figure: "La mezza sezione della puleggia accanto al suo asse, con le distanze dall'asse quotate."
model: "La puleggia come solido, vista da sud-est nello stile visivo Concettuale."
sourceHash: "f9c2a81b39fe"
---

Modella questa puleggia ruotando la sua mezza sezione attorno al suo asse, in millimetri: un foro di 20, un mozzo lungo 30 e di 40 di diametro, un'anima spessa 10 e una corona larga 24 da 90 a 110 di diametro, centrata sul mozzo. La sezione si disegna come distanze dall'asse, che corre lungo l'asse Y, quindi ogni diametro si disegna come la sua metà.

## Steps

### Disegna la mezza sezione [#profile]

Sul layer Contorno, una <Command id="PLINE" /> chiusa da `10,0`, ogni punto successivo uno spostamento dall'ultimo: `10,0`, `0,10`, `25,0`, `0,-7`, `10,0`, `0,24`, `-10,0`, `0,-7`, `-25,0`, `0,10` e `-10,0`, poi <Keyword command="PLINE" id="Close" />.

### Ruota la vista [#view]

<Command id="-VIEW" /> e <Keyword command="VIEW" id="SEiso" /> la guardano da sud-est e dall'alto; <Command id="VSCURRENT" /> e <Keyword command="VSCURRENT" id="Conceptual" /> ombreggiano le facce, il che mostra al meglio un pezzo tornito.

### Ruotala [#revolve]

<Command id="REVOLVE" />: seleziona la sezione e premi Invio, poi <Keyword command="REVOLVE" id="Y" />: l'asse Y è quello della puleggia. Invio accetta l'angolo predefinito, un giro intero. <Command id="ZOOM" /> <Keyword command="ZOOM" id="Extents" /> la inquadra, e una scala di 0.8x lascia spazio intorno.
