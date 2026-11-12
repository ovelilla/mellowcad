---
title: "Comando MISURA (MEASURE) in AutoCAD"
description: "Come funziona MISURA (MEASURE, alias MIS) di AutoCAD in italiano: punti o blocchi a una lunghezza data lungo un oggetto, dall'estremo selezionato."
figure: "Una polilinea lunga 190 misurata ogni 15 dall'estremo selezionato: dodici punti, l'ultimo a 10 dall'altro estremo."
sourceHash: "3975c3873eff"
---

MISURA (MEASURE) segna un oggetto a una lunghezza data. Seleziona una linea, un arco, un cerchio, un'ellisse, un arco ellittico, una polilinea, una polilinea 3D o una spline, poi indica la lunghezza, digitata o con due punti: MISURA mette un oggetto punto a ogni lunghezza lungo l'oggetto, finché ne entra uno, e termina. Non misura una distanza per te e non taglia l'oggetto. Parte dall'estremo più vicino al punto in cui hai selezionato, quindi seleziona vicino all'estremo da cui misurare; ciò che avanza resta all'altro estremo, e quando la lunghezza ci sta un numero intero di volte, anche l'altro estremo riceve un punto. Un cerchio parte dal suo punto a 0° e prosegue in senso antiorario, ovunque lo si selezioni; una polilinea chiusa parte dal suo primo vertice.

I punti si disegnano come dice lo stile del punto del disegno, un punto minuscolo per impostazione predefinita: scegli prima una figura visibile con <Command id="PTYPE" /> o con PDMODE. I punti stanno sull'oggetto, sul layer corrente con il colore, il tipo di linea e lo spessore di linea correnti; il tutto è un passo che <Command id="U" /> annulla, e i punti sono il gruppo di selezione Precedente. Una lunghezza maggiore dell'oggetto riceve <Message id="objectNotThatLong" />, e una così corta da creare più di 32767 punti <Message id="objectTooLong" />; nessuna delle due crea nulla. Qualsiasi altro oggetto riceve <Message id="cannotMeasureObject" />. Anche il menu a discesa Punti degli strumenti di Disegna avvia MISURA.

## Options

### Block

Al posto dei punti, riferimenti di un blocco già presente nel disegno: indica il suo nome, poi se allineare ciascuno con l'oggetto, <Keyword id="Yes" /> (il valore predefinito) o <Keyword id="No" />, poi la lunghezza. Allineato, ogni riferimento ruota con l'oggetto nel suo punto, lungo una linea o tangente a un arco, da qualunque estremo parta la misura; non allineato, ciascuno mantiene l'asse X dell'UCS. Un nome senza un blocco dietro viene rifiutato e richiesto di nuovo.

## Missing

Il verso di una polilinea chiusa selezionata oltre la sua metà: qui viene misurata all'indietro dal suo primo vertice, come AutoCAD misura un'ellisse o una spline chiuse, ma cosa fa AutoCAD con una polilinea non è stato verificato. I punti di un cerchio partono sempre lungo l'asse X dell'UCS, dove AutoCAD li fa partire dall'angolo di snap, SNAPANG, che MellowCAD non ha.

## Questions

### Come si chiama il comando MEASURE in italiano?

MISURA, alias `MIS`, poi Invio o barra spaziatrice; l'alias inglese `ME` in AutoCAD in italiano non esiste. Il nome inglese funziona anche con il trattino basso davanti: `_MEASURE`.

### MISURA serve a misurare una distanza?

No: mette punti a una lunghezza che indichi tu. Per misurare la distanza tra due punti, usa <Command id="DIST" />; per la lunghezza di un oggetto, <Command id="LIST" /> o <Command id="AREA" />.

### Da quale estremo parte MISURA?

Dall'estremo più vicino al punto in cui hai selezionato l'oggetto. Selezionalo vicino all'estremo da cui misurare la prima lunghezza.

### Perché non vedo i punti creati da MISURA?

Sono disegnati come punti minuscoli, lo stile del punto predefinito. Apri <Command id="PTYPE" /> e scegli una croce o un cerchio, oppure imposta PDMODE a `3`: tutti i punti cambiano insieme.

### Che differenza c'è tra MISURA e DIVIDI?

<Command id="DIVIDE" /> divide un oggetto in un numero di parti uguali; MISURA avanza lungo l'oggetto di una lunghezza data e lascia ciò che avanza all'altro estremo.
