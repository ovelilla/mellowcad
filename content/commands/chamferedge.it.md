---
title: "Comando CIMASPIGOLO (CHAMFEREDGE) in AutoCAD"
description: "Come CIMASPIGOLO (CHAMFEREDGE) di AutoCAD smussa gli spigoli di un solido 3D: spigoli di una faccia, Anello, Distanza1 e Distanza2. Provalo."
figure: "Un parallelepipedo visto da sud-est: CIMASPIGOLO con entrambe le distanze 6 smussa i due spigoli superiori al suo angolo anteriore, che si incontrano in una linea."
sourceHash: "43b1908ad4b3"
---

CIMASPIGOLO smussa gli spigoli di un solido 3D. Mostra le due distanze correnti, poi chiede uno spigolo e, dopo il primo, altri sulla stessa faccia, fino a Invio: un clic prende lo spigolo sotto il cursore, un punto digitato lo spigolo che passa per esso. Uno spigolo che con i primi non condivide alcuna faccia mostra <Message id="edgesOneFace" />, uno di un altro solido <Message id="chamferMultipleBodies" />. Man mano che gli spigoli sono presi, il solido è disegnato come sarà. Invio chiede poi di premere di nuovo Invio per accettare, o di cambiare le distanze per questo smusso; quell'Invio lo crea.

La prima distanza corre lungo la faccia che gli spigoli condividono; per uno spigolo isolato, lungo la faccia che AutoCAD sceglie: la frontale, per lo spigolo anteriore superiore di un parallelepipedo, e la superiore, per il bordo di un cilindro. Uno spigolo retto tra due facce piane diventa una striscia piana, lo spigolo tondo di un foro o di un bordo una striscia di cono, e gli smussi che si incontrano in un angolo sono uniti in una linea. Le distanze sono riproposte la volta successiva. Il solido conserva il suo layer e le sue proprietà ma perde ciò che lo ha creato: un parallelepipedo non è più un parallelepipedo. L'intero comando è un solo passo di annullamento. Il 3D di MellowCAD è solo solidi, e ancora parziale.

## Options

### Loop

Seleziona ogni spigolo attorno a una faccia: indica uno spigolo, poi <Keyword id="Accept" /> l'anello mostrato, o <Keyword id="Next" /> per l'anello dell'altra faccia a cui appartiene lo spigolo. <Keyword id="Edge" /> torna ai singoli spigoli.

### Distance

Chiede la prima distanza, poi la seconda, ciascuna digitata o come distanza tra due punti; 0 o meno mostra <Message id="distanceTooSmall" />. <Keyword id="Expression" /> ne prende una come formula. Alla richiesta di accettazione chiede la distanza della superficie di base e quella dell'altra superficie, solo per questo smusso.

## Missing

Un angolo in cui si incontrano tre spigoli smussati. Uno spigolo retto accanto a una faccia curva, uno spigolo tondo fuori dall'asse del suo cilindro, e qualsiasi spigolo di una sfera, un toro, un'estrusione o un solido di rivoluzione: qui falliscono con un errore di modellazione. Le due frecce grip che AutoCAD mostra alla richiesta di accettazione, una per distanza. <Command id="CHAMFER" /> che seleziona lo spigolo di un solido, cosa che AutoCAD permette. Lo smusso disegnato come mesh mentre selezioni, e le superfici.

## Questions

### Come si smussa uno spigolo di un solido 3D in AutoCAD?

Esegui CIMASPIGOLO, scegli <Keyword id="Distance" /> e dai entrambe le distanze, indica gli spigoli di una faccia, poi premi Invio due volte: una per terminare la selezione, una per accettare. I `6` e `6` della sessione smussano due spigoli superiori di un parallelepipedo.

### Perché CIMASPIGOLO dice che gli spigoli devono appartenere a una faccia?

Gli spigoli di uno smusso condividono una faccia: la prima distanza corre lungo di essa. Smussa gli spigoli di un'altra faccia in una seconda esecuzione.

### Perché CIMA non funziona su un solido 3D?

<Command id="CHAMFER" /> di AutoCAD smussa anche lo spigolo di un solido, ma quello di MellowCAD non ancora: usa CIMASPIGOLO, e <Command id="FILLETEDGE" /> per raccordare uno spigolo.

### Come si smussa il bordo di un foro?

Indica il suo spigolo tondo dove incontra la faccia piana: lo smusso è una striscia di cono attorno al foro.
