---
title: "Esercizio AutoCAD: una guarnizione"
metaTitle: "Esercizio AutoCAD per principianti: guarnizione"
description: "Disegna una guarnizione in AutoCAD: piastra raccordata, foro centrale, quattro fori copiati da uno, assi e quote, risolto passo passo. Gratis online."
figure: "La guarnizione, di 120 per 80, quotata."
sourceHash: "dc5c0e2b45b8"
---

Disegna questa guarnizione, in millimetri: una piastra di 120 per 80 con gli angoli raccordati a raggio 10, un foro centrale di 40 e quattro fori di 10, con i centri a 12 dai bordi, più gli assi del foro centrale e le quote. Tutto si digita: il primo punto di un comando è dove lo digiti, e ogni punto successivo si misura dall'ultimo. Il contorno, gli assi e le quote vanno ciascuno sul proprio layer.

## Steps

### Disegna il contorno [#outline]

Imposta Contorno come layer corrente nel controllo dei layer. <Command id="RECTANG" /> disegna la piastra in un colpo solo: scegli <Keyword command="RECTANG" id="Fillet" /> e digita il raggio, `10`, poi il primo angolo, `0,0`, e l'altro angolo, `120,80`, misurato dal primo.

### Disegna il foro [#bore]

<Command id="CIRCLE" /> al centro della piastra, `60,40`: scegli <Keyword command="CIRCLE" id="Diameter" /> e digita `40`.

### Copia i fori [#holes]

Disegna un foro, un cerchio in `12,12` con un <Keyword command="CIRCLE" id="Diameter" /> di `10`, poi copialo con <Command id="COPY" />: seleziona il cerchio, premi Invio, prendi il suo centro, `12,12`, come punto base e digita dove va ogni copia a partire da lì: `96,0`, poi `96,56`, poi `0,56`. Invio termina le copie.

### Disegna gli assi [#centreLines]

Imposta Assi come layer corrente. Due linee con <Command id="LINE" /> si incrociano al centro del foro e superano di 6 il suo bordo: da `60,14`, `0,52` in verticale; da `34,40`, `52,0` in orizzontale. Invio termina ciascuna.

### Quotala [#dimensions]

Imposta Quote come layer corrente. <Command id="DIMLINEAR" /> prende due punti e poi dove va la linea di quota: la lunghezza da `0,10` a `120,0` più in là, posizionata sotto; l'altezza a destra; l'interasse dei fori, 96 e 56. Un punto digitato alle sue richieste non tocca nessun oggetto, quindi ognuna di queste quote viene creata non associativa, e la riga di comando lo dice. <Command id="DIMDIAMETER" /> seleziona un cerchio e ne posiziona il diametro: quello del foro centrale, poi quello di un foro.
