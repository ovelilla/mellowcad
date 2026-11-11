---
title: "Comando RACCORDASPIGOLO (FILLETEDGE) in AutoCAD"
description: "Come funziona RACCORDASPIGOLO (FILLETEDGE) di AutoCAD in italiano: raccordare gli spigoli di un solido 3D con Raggio, Catena e Anello. Provalo nel browser."
figure: "Un parallelepipedo visto da sud-est: RACCORDASPIGOLO con raggio 8 arrotonda i suoi due spigoli verticali a destra."
sourceHash: "403a055efb24"
---

RACCORDASPIGOLO (FILLETEDGE in inglese) arrotonda gli spigoli di un solido 3D. Mostra il raggio corrente, poi chiede gli spigoli, fino a Invio: un clic sceglie lo spigolo sotto il cursore, illuminato al suo passaggio, e un punto digitato sceglie lo spigolo che passa per esso. Man mano che gli spigoli vengono scelti, il solido è disegnato come sarà, con i raccordi al loro posto. Invio conta gli spigoli e ti chiede di premere di nuovo Invio per accettare, oppure di cambiare il raggio; quel secondo Invio crea i raccordi. Spigoli di un solo solido: quello di un altro mostra <Message id="filletMultipleBodies" />, uno scelto due volte <Message id="edgeAlreadyPicked" />.

Uno spigolo rettilineo tra due facce piane diventa un quarto di cilindro, e lo spigolo tondo di un foro o di un bordo un quarto di toro; i raccordi che si incontrano in uno spigolo sono uniti, tre di essi da un pezzo di sfera. Il raggio viene salvato nel disegno e riproposto la volta successiva. Il solido mantiene il suo layer e le sue proprietà ma perde ciò che l'ha creato: un parallelepipedo non è più un parallelepipedo. L'intero comando è un solo passo di annullamento. Il 3D di MellowCAD è fatto solo di solidi, ed è ancora parziale.

## Options

### Chain

Sceglie lo spigolo che selezioni e ogni spigolo tangente ad esso, uno dopo l'altro: gli otto attorno alla parte superiore di un blocco i cui spigoli verticali sono già arrotondati. Se nessuno è tangente mostra <Message id="noTangentChainEdges" /> e sceglie solo quello selezionato. <Keyword id="Edge" /> torna ai singoli spigoli.

### Loop

Sceglie ogni spigolo attorno a una faccia: seleziona uno spigolo, poi <Keyword id="Accept" /> l'anello mostrato, oppure <Keyword id="Next" /> per l'anello dell'altra faccia a cui lo spigolo appartiene.

### Radius

Chiede il raggio, digitato o come distanza tra due punti; 0 o meno mostra <Message id="radiusTooSmall" />. <Keyword id="Expression" /> lo accetta come una formula. Alla richiesta di accettazione cambia il raggio dei raccordi mostrati. Il grip a freccia al centro del primo raccordo lo imposta trascinando: fai clic su di esso, muovi, fai clic; <Keyword id="eXit" /> o Esc lo lasciano com'era.

## Missing

I raccordi di due raggi che si incontrano, e un raccordo che termina su una faccia curva. Un raccordo più largo di una faccia accanto, che AutoCAD fa scorrere sullo spigolo successivo: qui fallisce con un errore di modellazione. Uno spigolo rettilineo accanto a una faccia curva, uno spigolo tondo fuori dall'asse del suo cilindro, e qualunque spigolo di una sfera, di un toro, di un'estrusione o di un solido di rivoluzione, che falliscono allo stesso modo. Alcuni spigoli in cui i raccordi si incontrano su spigoli con pendenze diverse. Il grip a freccia su qualunque spigolo tranne il primo, e la linea da esso al cursore. <Command id="FILLET" /> che seleziona lo spigolo di un solido, cosa che AutoCAD consente. Il raccordo disegnato come mesh mentre selezioni, e le superfici.

## Questions

### Come si raccorda uno spigolo di un solido 3D in AutoCAD?

Avvia RACCORDASPIGOLO, scegli <Keyword id="Radius" /> e digitalo, seleziona gli spigoli, poi premi Invio due volte: una per terminare la selezione, una per accettare. L'`8` della sessione arrotonda due spigoli di un parallelepipedo.

### Come si raccordano tutti gli spigoli di una faccia?

Scegli <Keyword id="Loop" /> e seleziona uno spigolo della faccia, poi <Keyword id="Accept" />, oppure <Keyword id="Next" /> se l'anello mostrato è quello dell'altra faccia. Per spigoli che confluiscono già l'uno nell'altro, come arrotondare la parte superiore di un blocco arrotondato, <Keyword id="Chain" /> li sceglie tutti.

### Perché RACCORDO non funziona su un solido 3D?

<Command id="FILLET" /> di AutoCAD arrotonda anche lo spigolo di un solido, ma quello di MellowCAD non ancora: usa RACCORDASPIGOLO, e <Command id="CHAMFEREDGE" /> per uno smusso.

### Come si cambia il raggio del raccordo?

Scegli <Keyword id="Radius" /> prima di selezionare o alla richiesta di accettazione, oppure trascina il grip a freccia al centro del primo raccordo. L'ultimo raggio viene riproposto la volta successiva.
