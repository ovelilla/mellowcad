---
title: "Comando CUNEO (WEDGE) in AutoCAD"
description: "Come CUNEO (WEDGE, alias CN) di AutoCAD disegna un cuneo solido 3D: due angoli e un'altezza, Centro, Cubo, Lunghezza e 2Punti. Provalo."
figure: "Un cuneo di 60 per 40 per 25, da due angoli e un'altezza, con la pendenza che scende dall'estremo del primo angolo, visto da sud-est nello stile visivo Nascosto."
sourceHash: "06fba2eeb7be"
---

CUNEO (WEDGE) disegna un solido 3D a forma di cuneo: un parallelepipedo la cui sommità scende in pendenza da un estremo all'altro. Chiede ciò che chiede <Command id="BOX" />: il primo angolo, l'altro angolo, poi l'altezza. L'estremo alto sta al primo angolo, e la pendenza scende lungo la X dell'UCS verso il lato dell'altro angolo; un angolo con una X minore lo rovescia. L'altezza sale lungo lo Z dell'UCS, una negativa scende. La lunghezza, la larghezza e l'altezza sono i valori predefiniti di <Command id="BOX" />, che Invio prende. Il cuneo sta sul layer corrente e Annulla lo ripristina in un solo passo.

<Command id="LIST" /> ne mostra la posizione, la lunghezza, la larghezza, l'altezza e la rotazione, e la tavolozza Proprietà permette di digitarle. I suoi grip sono quelli di <Command id="BOX" />. È un solido 3D per <Command id="UNION" />, <Command id="SUBTRACT" /> e il resto del 3D di MellowCAD, che è solo solidi e ancora parziale; <Command id="EXPLODE" /> lo trasforma in una regione per faccia.

## Options

### Center

Al primo prompt: chiede il centro, poi un angolo, <Keyword id="Cube" /> o <Keyword id="Length" />. Il cuneo è centrato sul punto, anche in altezza, con il suo estremo alto opposto all'angolo indicato.

### Cube

All'altro angolo: chiede una lunghezza e crea un cuneo con ogni lato di quella lunghezza. A differenza di quello di <Command id="BOX" />, corre lungo la X dell'UCS, all'indietro quando è negativa.

### Length

All'altro angolo: chiede la lunghezza, lungo la X dell'UCS, poi la larghezza, lungo la sua Y; una negativa corre all'indietro. Un punto ne dà solo la distanza, mai la direzione.

### 2Point

All'altezza: chiede due punti, e l'altezza è la distanza tra loro.

## Missing

Quelli di <Command id="BOX" />: Sposta, Ruota, Scala e Specchio da un grip attivo, i comandi 3D propri, le quote tratteggiate mentre indichi l'angolo, e gli stili visivi che mancano a <Command id="VSCURRENT" />. In pianta, lo snap Fine sotto l'estremo alto trova l'angolo della sommità, dove AutoCAD trova quello della base.

## Questions

### Qual è l'alias di CUNEO in AutoCAD?

`CN`. Digitalo e premi Invio o barra spaziatrice, poi indica il primo angolo, l'altro angolo e l'altezza: `0,0`, `60,40` e `25` disegnano il cuneo della sessione.

### Da che parte scende il cuneo?

Giù dall'estremo del primo angolo, lungo la X dell'UCS. Per girarlo, indica l'altro angolo con una X minore, il che lo ruota di 180°, oppure ruotalo dopo con <Command id="ROTATE" />.

### Come si disegna un prisma triangolare?

Un cuneo lo è: un triangolo rettangolo a ciascuna estremità, esteso lungo la larghezza. Per qualsiasi altro triangolo, disegnalo chiuso con <Command id="PLINE" /> ed <Command id="EXTRUDE" /> lo.

### Come si disegna un cuneo dal suo centro?

Scegli <Keyword id="Center" /> e indica il punto centrale, poi un angolo, <Keyword id="Cube" /> o <Keyword id="Length" />: il cuneo è centrato sul punto, anche in altezza.
