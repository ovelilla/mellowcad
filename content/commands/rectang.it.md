---
title: "Comando RETTANGOLO (RECTANG) in AutoCAD"
description: "Come RETTANGOLO (RECTANG, alias RT) disegna un rettangolo in AutoCAD: due angoli, Quote, Area e Rotazione, con raccordo o smusso. Provalo online."
figure: "Due rettangoli da due angoli, il secondo digitato relativo al primo: uno con Raccordo 8, il successivo con Smusso 8."
sourceHash: "a5d4e90c06aa"
---

RETTANGOLO (RECTANG) disegna un rettangolo da due angoli opposti, indicati o digitati: `0,0` poi `100,50`, relativo al primo con l'input dinamico, ne crea uno di 100 per 50. È una sola polilinea chiusa di quattro vertici, creata sul layer corrente. Le opzioni della prima richiesta stabiliscono come vengono disegnati i rettangoli successivi e ciascuna conserva il suo valore per il resto della sessione: il RETTANGOLO successivo indica quelle in vigore nella sua prima riga. L'opzione Larghezza dà a ogni lato una larghezza di polilinea. Mentre posizioni l'altro angolo, il rettangolo segue il cursore; con l'input dinamico attivo puoi digitarne la lunghezza, Tab, e la larghezza.

## Options

### Chamfer

Chiede una prima e una seconda distanza di smusso e taglia ogni angolo di quelle misure: otto vertici. Una distanza di 0 lo disattiva. Sostituisce Raccordo.

### Elevation

Chiede l'altezza a cui è disegnato il rettangolo, la sua Z.

### Fillet

Chiede un raggio e arrotonda ogni angolo con esso. Un raggio di 0 lo disattiva. Sostituisce Smusso.

### Thickness

Chiede uno spessore: il rettangolo si alza di quell'altezza, come farebbe una parete, in una vista 3D.

### Area

All'altro angolo: chiede l'area, poi se indicare la <Keyword id="Length" /> o la <Keyword id="Width" />, poi quel lato. L'altro lato viene calcolato, gli angoli inclusi, e il rettangolo viene creato subito.

### Dimensions

All'altro angolo: chiede la lunghezza e la larghezza, poi un punto che stabilisce in quale direzione dal primo angolo si trova il rettangolo.

### Rotation

All'altro angolo: chiede l'angolo di rotazione del rettangolo, digitato o come punto dal primo angolo, oppure due punti con <Keyword id="Pick" />. L'angolo si conserva per la sessione.

## Missing

Una lunghezza o larghezza di 0 con <Keyword id="Area" />, che qui non disegna nulla e in AutoCAD disegna una polilinea spezzata. Dopo una risposta rifiutata alla richiesta di Rotazione, MellowCAD ripropone la richiesta per intero, dove AutoCAD non scrive altro.

## Questions

### Qual è l'alias di RETTANGOLO in AutoCAD?

`RT`, poi Invio o barra spaziatrice; funziona anche `RETTANG`. Funziona anche il nome completo, e `_RECTANG` in qualsiasi lingua di AutoCAD.

### Come si disegna un rettangolo con dimensioni esatte?

Indica il primo angolo, poi digita l'altro relativo al primo: `100,50` con l'input dinamico attivo, come all'avvio, o `@100,50` senza, lo rende lungo 100 e largo 50. Oppure scegli <Keyword id="Dimensions" /> e digita i due lati.

### Come si disegna un rettangolo con gli angoli arrotondati?

Scegli <Keyword id="Fillet" /> alla prima richiesta e digita il raggio, poi indica i due angoli.

### Perché il mio rettangolo ha gli angoli arrotondati o smussati?

RETTANGOLO conserva Raccordo e Smusso per la sessione, quindi anche un rettangolo disegnato dopo uno di essi li porta: la sua prima riga lo indica. Scegli <Keyword id="Fillet" /> e digita `0` per disegnare di nuovo angoli netti.

### Un rettangolo è una polilinea in AutoCAD?

Sì: una sola polilinea chiusa. <Command id="EXPLODE" /> la scompone in quattro linee e <Command id="OFFSET" /> ne esegue l'offset per intero.
