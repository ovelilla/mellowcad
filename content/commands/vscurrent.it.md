---
title: "Comando STILEVISCORRENTE (VSCURRENT) in AutoCAD"
description: "Come STILEVISCORRENTE (VSCURRENT, alias SVC) di AutoCAD imposta lo stile visivo: Wireframe 2D, Nascosto e Concettuale, e come tornare al wireframe."
figure: "Un blocco con un foro passante, visto da sud-est: STILEVISCORRENTE Concettuale ombreggia le sue facce e vi disegna sopra i suoi spigoli."
sourceHash: "ddb8f2338e68"
---

STILEVISCORRENTE (VSCURRENT) imposta lo stile visivo: come la vista disegna i solidi 3D. Chiede uno stile, proponendo quello corrente come valore predefinito, e Invio lo mantiene. <Keyword id="2dwireframe" /> disegna ogni spigolo, anche quelli dietro; <Keyword id="Hidden" /> nasconde ciò che le facce nascondono; <Keyword id="Conceptual" /> dipinge le facce, ombreggiate. Lo stile appartiene alla vista e viene salvato con il disegno, e ogni esecuzione è un solo passo di annullamento. Non si può usare all'interno di un altro comando.

Ciò che non è un solido, linee, cerchi, regioni, testo, viene disegnato come in Wireframe 2D qualunque sia lo stile, nei propri colori. In Nascosto e Concettuale un clic prende il solido la cui faccia è più vicina a te sotto il cursore, mai uno attraverso una faccia che lo nasconde, e gli snap a oggetto trovano ancora ogni spigolo. Un solido su un layer bloccato disegna i suoi spigoli più tenui. Il 3D di MellowCAD è solo solidi, e ancora parziale.

## Options

### 2dwireframe

Ogni spigolo di ogni solido, anche quelli dietro, con le linee che mostrano le sue facce curve; il valore predefinito in un nuovo disegno. Tornando a esso da un altro stile, STILEVISCORRENTE dice <Message id="regeneratingModel" />.

### Hidden

Gli spigoli di ogni solido, e i contorni delle sue facce curve, dove nessuna faccia di alcun solido li nasconde, nel colore dell'oggetto: un solido dietro un altro viene nascosto da esso. Le linee che mostrano una faccia curva in Wireframe 2D non vengono disegnate.

### Conceptual

Le facce verso di te dipinte nel colore dell'oggetto, che diventa blu freddo sul lato opposto alla luce, che segue il tuo punto di vista, e gli spigoli di Nascosto disegnati sopra in un solo colore, qualunque sia quello dell'oggetto. Qui e in Nascosto, un cilindro o un cono visto in pianta mostra solo il suo cerchio, come in AutoCAD.

## Missing

Gli altri stili di AutoCAD, Wireframe, Realistico, Ombreggiato, Ombreggiato con spigoli, Scala di grigi, A mano libera e Raggi X, e dare il nome a uno stile o elencarli con `?`: il prompt elenca solo i tre stili realizzati, e rifiuta qualsiasi altra risposta.

## Questions

### Come si cambia lo stile visivo in AutoCAD?

Esegui STILEVISCORRENTE (o `SVC`) e scegli lo stile: <Keyword id="Hidden" /> per nascondere gli spigoli dietro, <Keyword id="Conceptual" /> per ombreggiare le facce. Cambia solo la vista, non gli oggetti.

### Come si torna a Wireframe 2D?

Esegui STILEVISCORRENTE e scegli <Keyword id="2dwireframe" />, la sua lettera `2`.

### Qual è la differenza tra Nascosto e Concettuale?

Entrambi nascondono ciò che le facce nascondono. Nascosto disegna solo gli spigoli, sullo sfondo, come un disegno al tratto; Concettuale dipinge anche le facce, ombreggiate dalla luce, con gli stessi spigoli sopra.

### Perché vedo ancora linee attraverso il mio solido?

Non fanno parte di un solido. Linee, cerchi e regioni sono disegnati come in Wireframe 2D in ogni stile, quindi una linea dietro un parallelepipedo si vede ancora. In <Keyword id="2dwireframe" /> si vedono anche gli spigoli del solido stesso dietro: scegli <Keyword id="Hidden" />.
