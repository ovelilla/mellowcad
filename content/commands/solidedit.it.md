---
title: "Comando MODIFSOLIDI (SOLIDEDIT) in AutoCAD"
description: "Come MODIFSOLIDI (SOLIDEDIT) di AutoCAD modifica le facce di un solido 3D: Estrudi, Sposta, Ruota, Offset, Rastrema, Cancella e Copia. Provalo."
figure: "La faccia superiore di un parallelepipedo estrusa di 15 verso l'alto con una rastremazione di 15 gradi da MODIFSOLIDI: un tronco sul parallelepipedo, visto da sud-est."
sourceHash: "775cdc271d4f"
---

MODIFSOLIDI (SOLIDEDIT) modifica un solido 3D per le sue facce. Indica se ogni modifica viene controllata, poi chiede che cosa modificare: <Keyword id="Face" />, poi l'opzione della faccia, poi le facce, poi ciò che l'opzione richiede. Ogni modifica viene eseguita subito, e le opzioni della faccia vengono chieste di nuovo, quindi una sola esecuzione può fare più modifiche; <Keyword id="eXit" /> o Invio lasciano le opzioni della faccia, poi il comando. Le facce adiacenti la seguono: sposta in alto la faccia superiore di un parallelepipedo e i suoi lati crescono per raggiungerla.

Il solido conserva il suo layer e le sue proprietà ma perde ciò che lo aveva creato: un parallelepipedo non è più un parallelepipedo. L'intera esecuzione è un solo passaggio di annullamento, e il suo <Keyword id="Undo" /> annulla le modifiche una alla volta al suo interno. Invio alla richiesta `Comando:` lo esegue di nuovo dalla prima domanda. Il pulsante delle facce del pannello Modifica solidi esegue direttamente ogni opzione della faccia. Il 3D di MellowCAD è fatto solo di solidi, ed è ancora parziale.

## Options

### Face

Le opzioni della faccia. Ciascuna chiede delle facce, fino a Invio: un clic o un punto digitato prende la faccia più vicina a te sotto il cursore, o le due facce di uno spigolo lì, e un nuovo clic su una faccia già presa seleziona quella dietro. Una volta presa una faccia, <Keyword id="ALL" /> prende ogni faccia del suo solido; <Keyword id="Remove" /> toglie invece facce dall'insieme, e <Keyword id="Undo" /> annulla l'ultima selezione. Una selezione su nulla segnala <Message id="noSolidsDetected" />. Solo facce di un unico solido.

### Extrude

Chiede un'altezza e un angolo di rastremazione: ogni faccia cresce in un prisma, aggiunto al solido oppure, con un'altezza negativa, tolto da esso; con un angolo positivo si restringe salendo. Invio all'altezza accetta l'ultima altezza usata dalle primitive o da <Command id="EXTRUDE" />.

### Move

Chiede un punto base e un secondo punto: una faccia piana si sposta della componente di quello spostamento lungo la sua normale, con le facce adiacenti trascinate. Invio al secondo punto usa il punto base come spostamento.

### Rotate

Chiede un asse, con due punti o lungo l'<Keyword id="Xaxis" />, l'<Keyword id="Yaxis" /> o lo <Keyword id="Zaxis" /> dell'UCS, o perpendicolare allo schermo con <Keyword id="View" />, poi un angolo: la faccia ruota attorno ad esso secondo la regola della mano destra.

### Offset

Chiede una distanza: la faccia si sposta verso l'esterno lungo la sua normale, o verso l'interno con una negativa, con le facce adiacenti trascinate, anche le facce tonde attorno al loro asse. Un offset verso l'interno fino a metà del lato maggiore del riquadro attorno al solido viene rifiutato, e viene indicato fin dove può arrivare.

### Taper

Chiede un punto base, un punto lungo l'asse di rastremazione e un angolo: la faccia si inclina attorno al punto in cui incontra il piano passante per il punto base, e un angolo positivo la inclina verso l'interno lungo l'asse.

### Delete

Toglie la parete di un foro, chiudendolo, o la striscia di un raccordo o di uno smusso, restituendo lo spigolo che aveva sostituito.

### Copy

Crea una regione da ogni faccia piana, dove si trova o spostata con due punti, sul layer corrente e con le proprietà correnti.

### Undo

Alle opzioni della faccia, annulla l'ultima modifica di questa esecuzione; quando non ne resta nessuna, <Message id="commandCompletelyUndone" />.

### eXit

Lascia le opzioni della faccia per la prima domanda, e da quella si esce dal comando; Invio fa lo stesso.

## Missing

<Keyword id="Edge" /> e <Keyword id="Body" />, e il <Keyword id="coLor" /> e il <Keyword id="mAterial" /> delle facce, che vengono offerti e rifiutati, come il <Keyword id="Path" /> di Estrudi, l'asse per oggetto di Ruota e il suo angolo <Keyword id="Reference" />. Interseca, Intercetta e IPoligono per selezionare facce. Spostare, ruotare, rastremare o copiare una faccia curva, farne l'offset tra altre facce adiacenti, cancellarne una che non sia la parete di un foro o una striscia, e una modifica che cambia tanto la forma del solido che una faccia ne consuma un'altra. Modifiche accanto a una faccia estrusa con rastremazione. Un offset troppo verso l'esterno per essere eseguito, che AutoCAD scarta in silenzio e MellowCAD esegue. Un'anteprima mentre indichi una distanza o un angolo.

## Questions

### Come si modifica un solido 3D in AutoCAD?

Avvia MODIFSOLIDI, scegli <Keyword id="Face" /> e poi che cosa fare: <Keyword id="Extrude" /> o <Keyword id="Move" /> una faccia per rendere il solido più alto, <Keyword id="Delete" /> per riempire un foro, <Keyword id="Taper" /> per inclinare un lato. Indica le facce, premi Invio e rispondi alle richieste dell'opzione. Per premere o trascinare rapidamente, anche <Command id="PRESSPULL" /> sposta una faccia.

### Come si estrude la faccia di un solido 3D?

MODIFSOLIDI, <Keyword id="Face" />, <Keyword id="Extrude" />, indica la faccia e premi Invio, poi l'altezza e l'angolo di rastremazione: `15` e `15` della sessione alzano un tronco sulla faccia superiore di un parallelepipedo.

### Come si toglie un foro da un solido?

MODIFSOLIDI, <Keyword id="Face" />, <Keyword id="Delete" />, indica la parete del foro e premi Invio: il foro viene riempito. Lo stesso toglie un raccordo o uno smusso.

### Qual è la differenza tra MODIFSOLIDI e PREMTRASC?

<Command id="PRESSPULL" /> sposta una faccia con un trascinamento o una distanza, perpendicolarmente a se stessa. MODIFSOLIDI fa questo e altro: rastrema, ruota, fa l'offset, cancella e copia facce, anche più di una alla volta.
