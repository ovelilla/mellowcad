---
title: "Comando CILINDRO (CYLINDER) in AutoCAD"
description: "Come CILINDRO (CYLINDER, alias CIL) di AutoCAD disegna un cilindro solido 3D: base, raggio, altezza, 3P, 2P, Ttr, Ellittico e Asse. Provalo."
figure: "Un cilindro di raggio 20 e altezza 40, dal centro della sua base, visto da sud-est nello stile visivo Nascosto."
sourceHash: "ce397d8dcb5d"
---

CILINDRO disegna un cilindro solido 3D: indica il centro della sua base, poi il raggio, poi l'altezza. La base giace sul piano XY dell'UCS, alla Z del centro, e l'altezza sale lungo la sua Z; una negativa scende, e un punto la dà con la sua distanza dalla base, come in <Command id="BOX" />. Il raggio e l'altezza sono offerti come predefiniti che Invio prende, condivisi con le altre primitive e con <Command id="EXTRUDE" />. Il cilindro sta sul layer corrente, e Annulla lo annulla in un solo passo.

Il cilindro conserva le sue dimensioni: <Command id="LIST" /> mostra la sua posizione, normale, raggio e altezza, e la tavolozza Proprietà permette di digitare il raggio e l'altezza. I suoi grip lo spostano, ne impostano l'altezza e, a ogni quarto della base, il raggio. È un solido 3D per <Command id="UNION" />, <Command id="SUBTRACT" /> e il resto del 3D di MellowCAD, che è solo solidi e ancora parziale.

## Options

### 3P

Al centro della base: chiede tre punti, e la base è il cerchio che passa per essi, nel loro piano. Tre punti sul piano XY dell'UCS fanno comunque salire il cilindro lungo Z.

### 2P

Al centro della base: chiede i due estremi del diametro della base; il secondo è letto nel piano del primo.

### Ttr

Al centro della base: indica due linee, cerchi o archi, con lo snap Tangente, e dai un raggio: la base li tocca entrambi, il più vicino possibile ai punti indicati, alla loro altezza.

### Elliptical

Al centro della base: la base è un'ellisse. Dai i due estremi del suo primo asse, poi l'estremo del secondo; oppure scegli <Keyword id="Center" /> e dai il suo centro, la mezza lunghezza del primo asse, poi l'estremo del secondo asse.

### Diameter

Al raggio: chiede invece il diametro, offrendo il doppio dell'ultimo raggio.

### 2Point

All'altezza: chiede due punti, e l'altezza è la distanza tra essi.

### Axis

All'altezza: chiede l'altro estremo dell'asse. Il cilindro va dal centro della base a quel punto in qualsiasi direzione, con la base perpendicolare all'asse.

## Missing

<Command id="EXPLODE" /> di un cilindro, che AutoCAD trasforma nelle sue due estremità e in una superficie: MellowCAD non ha superfici, quindi dice che non ha potuto esploderlo. Sposta, Ruota, Scala e Specchio da un grip attivo, e un'altezza trascinata oltre la base. Le quote tratteggiate che AutoCAD disegna mentre dai il raggio, i punti dell'ellisse e l'asse. Trasformare un cilindro circolare in uno ellittico digitando nella tavolozza Proprietà. Le silhouette che disegna `DISPSILH` di AutoCAD. In pianta, dove il cerchio superiore nasconde quello della base, lo snap Vicino trova il cerchio della base, dove AutoCAD trova quello superiore. Gli stili visivi che <Command id="VSCURRENT" /> non ha oltre a Wireframe 2D, Nascosto e Concettuale.

## Questions

### Qual è la scorciatoia di CILINDRO in AutoCAD?

`CIL`. Digitala e premi Invio o barra spaziatrice, poi indica il centro della base, il raggio e l'altezza: `0,0`, `20` e `40` disegnano il cilindro della sessione.

### Come si disegna un cilindro orizzontale?

Scegli <Keyword id="Axis" /> all'altezza e dai l'altro estremo dell'asse: da una base in `0,0,0`, il punto `60,0,0` pone il cilindro lungo X.

### Come si fa un cilindro cavo o un tubo?

Disegna due cilindri dallo stesso centro, quello interno più stretto, poi esegui <Command id="SUBTRACT" />: seleziona quello esterno, Invio, quello interno, Invio.

### Perché il mio cilindro sembra un cerchio?

Lo guardi dall'alto, in pianta. Ruota la vista: uno spigolo del ViewCube, <Command id="-VIEW" /> e <Keyword command="VIEW" id="SEiso" />, oppure <Command id="3DORBIT" />.
