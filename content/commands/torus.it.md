---
title: "Comando TORO (TORUS) in AutoCAD"
description: "Come TORO (TORUS, alias TOR) di AutoCAD disegna un anello solido 3D: centro, raggio dell'anello, raggio del tubo, Diametro, 3P, 2P e Ttr. Provalo."
figure: "Un toro di raggio 30 attorno a un tubo di raggio 8, visto da sud-est nello stile visivo Concettuale."
sourceHash: "a19600f3e357"
---

TORO (TORUS) disegna un anello solido 3D, una ciambella: indica il centro, poi il raggio dell'anello, dal centro alla metà del tubo, poi il raggio del tubo. L'anello giace sul piano XY dell'UCS, alla Z del centro. Un punto alla richiesta del tubo viene misurato dal punto dell'anello, quello a cui è stato indicato il raggio. Il raggio dell'anello è il valore predefinito condiviso delle primitive, e il raggio del tubo un valore predefinito proprio, che Invio accetta. Il toro sta sul layer corrente e si annulla in un solo passaggio.

Un raggio dell'anello negativo con un tubo più largo crea una palla come un pallone da rugby, con le estremità a punta; un anello più stretto del suo tubo, una mela. In Wireframe 2D e Nascosto viene disegnato come linee attorno al tubo e attorno all'anello, quante ne stabilisce `ISOLINES`. <Command id="LIST" /> ne mostra la posizione, la normale, il raggio del toro e il raggio del tubo, e la tavolozza Proprietà permette di digitarli entrambi. I suoi grip lo spostano, impostano il raggio dell'anello e impostano quello del tubo. È un solido 3D per <Command id="UNION" />, <Command id="SUBTRACT" /> e il resto del 3D di MellowCAD, che è fatto solo di solidi ed è ancora parziale.

## Options

### 3P

Al centro: chiede tre punti, e l'anello è il cerchio che passa per essi, nel loro piano.

### 2P

Al centro: chiede i due estremi del diametro dell'anello.

### Ttr

Al centro: indica due linee, cerchi o archi, con lo snap Tangente, e indica un raggio: l'anello li tocca entrambi, alla loro altezza.

### Diameter

Al raggio dell'anello: chiede invece il diametro del toro. A quello del tubo: chiede il diametro del tubo. Ciascuno propone il doppio del suo valore predefinito.

### 2Point

Al raggio del tubo: chiede due punti, e il raggio del tubo è la distanza tra loro.

## Missing

<Command id="EXPLODE" /> di un toro, che AutoCAD trasforma in una superficie: MellowCAD non ha superfici, quindi segnala che non ha potuto esploderlo. Sposta, Ruota, Scala e Specchio da un grip attivo, e la silhouette che disegna `DISPSILH` di AutoCAD.

## Questions

### Qual è l'alias di TORO in AutoCAD?

`TOR`. Digitalo e premi Invio o barra spaziatrice, poi indica il centro, il raggio dell'anello e quello del tubo: `0,0,0`, `30` e `8` disegnano il toro della sessione.

### Qual è la differenza tra il raggio e il raggio del tubo?

Il raggio va dal centro del toro alla metà del tubo; il raggio del tubo è quello del tubo stesso. Un toro largo 76 all'esterno con un tubo spesso 16 ha un raggio di 30 e un raggio del tubo di 8.

### Come si disegna un toro a forma di pallone da rugby?

Indica un raggio negativo, poi un raggio del tubo maggiore del suo valore: `-5` e `8` creano una forma chiusa a punta alle due estremità. Un raggio del tubo non maggiore di quello viene rifiutato e chiesto di nuovo.

### Perché il mio toro sembra due cerchi?

Lo stai guardando dall'alto, in pianta. Ruota la vista: un angolo del ViewCube, <Command id="-VIEW" /> e <Keyword command="VIEW" id="SEiso" />, oppure <Command id="3DORBIT" />. <Command id="VSCURRENT" /> con <Keyword command="VSCURRENT" id="Conceptual" /> lo ombreggia.
