---
title: "Comando 3DPOLI (3DPOLY) in AutoCAD"
description: "Come funziona 3DPOLI (3DPOLY, alias 3P) di AutoCAD in italiano: una polilinea 3D di segmenti retti, ognuno con la sua Z, e la differenza con POLILINEA. Provala."
figure: "Una polilinea 3D che sale di 15 a ogni angolo di un rettangolo 60 per 40 a terra, vista da sud-est."
sourceHash: "b74d0c411c73"
---

3DPOLI disegna una polilinea 3D: segmenti retti attraverso punti che hanno ciascuno una Z propria, come un solo oggetto. Indica il punto iniziale, poi un punto finale per ogni segmento, finché Invio non termina; anche un solo punto iniziale viene conservato, come polilinea di un vertice. Invio al punto iniziale è rifiutato con <Message id="invalidPoint" />: non c'è l'opzione Continua, che invece ha LINEA. Un punto digitato con una Z la conserva, `30,0,15`; uno digitato senza, o cliccato, sta alla quota del piano di lavoro, e un punto agganciato a un oggetto prende la Z dell'oggetto in quel punto. I punti sono letti nell'UCS corrente.

A differenza di una <Command id="PLINE" /> non ha piano, archi, larghezze né spessore, ed è disegnata continua qualunque sia il suo tipo di linea, che conserva. L'intera polilinea è un solo passo che <Command id="U" /> annulla; Esc conserva quanto disegnato. PEDIT la modifica con un elenco di opzioni più corto, e la sua opzione Spline adatta una curva liscia ad essa.

## Options

### Close

Dal secondo segmento in poi: disegna un segmento fino al punto iniziale e termina.

### Undo

Annulla l'ultimo vertice e prosegue da quello precedente. Se non resta alcun segmento: <Message id="all3dSegmentsUndone" />.

## Missing

Una polilinea 3D adattata a una curva mostra Nessuno in Adatta/Leviga della tavolozza Proprietà, che AutoCAD chiama Quadratica o Cubica, e non si può cambiare lì. Non può essere il contorno di un tratteggio né la traiettoria di ARRAYPATH, e la tavolozza non ha la riga Materiale. L'input dinamico chiede il punto iniziale in una sola casella, con la Z digitata dopo una seconda virgola, dove AutoCAD mostra i campi X, Y e Z. I menu al passaggio dei grip, Stira, Aggiungi vertice, Rimuovi vertice e il resto.

## Questions

### Qual è la scorciatoia di 3DPOLY in AutoCAD?

`3P`, poi Invio o barra spaziatrice. Funziona anche il nome completo, e `_3DPOLY` in tutte le lingue di AutoCAD.

### Qual è la differenza tra POLILINEA e 3DPOLI?

Una <Command id="PLINE" /> sta in un solo piano e può avere archi e larghezze. Una polilinea 3D ha solo segmenti retti, ma ogni vertice può stare a un'altezza diversa: una condotta, l'asse di una strada, un cavo.

### Come si disegna una polilinea 3D ad altezze diverse?

Digita ogni punto con la sua Z, `x,y,z`, oppure aggancia gli oggetti alle altezze che vuoi. Con l'input dinamico un punto dopo il primo è relativo: `60,0,15` va di 60 lungo X e di 15 in alto rispetto all'ultimo.

### Come si rende liscia una polilinea 3D?

Usa <Command id="PEDIT" /> e scegli la sua opzione Spline: una curva liscia inquadrata dai vertici. Decurva la raddrizza di nuovo.
