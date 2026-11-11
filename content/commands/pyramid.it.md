---
title: "Comando PIRAMIDE (PYRAMID) in AutoCAD"
description: "Come PIRAMIDE (PYRAMID, alias PIR) di AutoCAD disegna una piramide 3D: lati, base, altezza, Spigolo, Inscritto e raggio superiore. Provalo."
figure: "Una piramide di sei lati, con base di 25 fino al centro di ogni lato e alta 40, vista da sud-est nello stile visivo Nascosto."
sourceHash: "acbc5ffa71cb"
---

PIRAMIDE (PYRAMID) disegna un solido 3D a forma di piramide: la prima riga dice quanti lati ha la base e come si legge il raggio, poi chiede il centro della base, il raggio e l'altezza. La base è un poligono regolare, come lo disegna <Command id="POLYGON" />, di 4 lati all'inizio: un raggio digitato lo orienta verso il cursore, un punto verso se stesso. L'altezza sale lungo lo Z dell'UCS, una negativa scende, e un punto la indica con la sua distanza dalla base. I lati e il modo in cui si legge il raggio si conservano per la PIRAMIDE successiva; il raggio e l'altezza sono i valori predefiniti condivisi delle primitive. La piramide sta sul layer corrente e Annulla la ripristina in un solo passo.

<Command id="LIST" /> ne mostra la posizione, i due raggi della base e della sommità, l'altezza, la rotazione e il numero di lati, e la tavolozza Proprietà permette di digitare i raggi, i lati e l'altezza. I suoi grip la spostano, ne impostano l'altezza e ne ridimensionano la base da uno spigolo o dal centro di un lato. È un solido 3D per <Command id="UNION" />, <Command id="SUBTRACT" /> e il resto del 3D di MellowCAD, che è solo solidi e ancora parziale; <Command id="EXPLODE" /> la trasforma in una regione per faccia.

## Options

### Edge

Al centro della base: chiede i due estremi di un lato della base, che viene disegnata alla sinistra di quel lato.

### Sides

Al centro della base: chiede il numero di lati, da 3 a 32, poi di nuovo il centro.

### Inscribed

Al raggio: legge il raggio fino a uno spigolo della base, con il poligono inscritto in quel cerchio, e lo chiede di nuovo.

### Circumscribed

Al raggio, dopo aver scelto <Keyword id="Inscribed" />: legge il raggio fino al centro di un lato, con il poligono circoscritto a quel cerchio, come all'inizio, e lo chiede di nuovo.

### 2Point

All'altezza: chiede due punti e l'altezza è la distanza tra loro.

### Axis

All'altezza: chiede il vertice. La piramide va dal centro della base a quel punto in qualsiasi direzione, con la base perpendicolare all'asse.

### Top

All'altezza: chiede il raggio superiore, letto come quello della base, poi di nuovo l'altezza. La piramide termina in un poligono più piccolo invece che in un punto, un tronco; una sommità grande quanto la base crea un prisma.

## Missing

Quelli di <Command id="BOX" />: Sposta, Ruota, Scala e Specchio da un grip attivo, i comandi 3D propri, e gli stili visivi che mancano a <Command id="VSCURRENT" />. Il suo tipo, inscritto o circoscritto, digitato nella tavolozza Proprietà. Le quote tratteggiate che AutoCAD disegna mentre indichi il raggio e uno spigolo.

## Questions

### Qual è l'alias di PIRAMIDE in AutoCAD?

`PIR`. Digitalo e premi Invio o barra spaziatrice, poi indica il centro della base, il raggio e l'altezza.

### Come si disegna una piramide esagonale?

Scegli <Keyword id="Sides" /> prima del centro della base e digita `6`, poi indica il centro, il raggio e l'altezza: `0,0`, `25` e `40` disegnano la piramide della sessione. La PIRAMIDE successiva mantiene sei lati.

### Come si disegna una piramide con un lato di base dato?

Scegli <Keyword id="Edge" /> e indica i due estremi di un lato: un lato da `0,0` a `50,0` crea una base quadrata di 50, con i 4 lati predefiniti.

### Come si disegna una piramide tronca?

All'altezza, scegli <Keyword id="Top" />, digita il raggio superiore, poi l'altezza. La piramide termina in un poligono più piccolo, con tanti lati quanti ne ha la base.
