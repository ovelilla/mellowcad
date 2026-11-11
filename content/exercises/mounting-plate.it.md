---
title: "Esercizio AutoCAD 3D: una piastra di fissaggio"
metaTitle: "Esercizio AutoCAD 3D per principianti: piastra"
description: "Modella una piastra di fissaggio in AutoCAD 3D: regioni, una sottrazione per i fori e una sola estrusione, passo passo. Esercitati con il 3D gratis online."
figure: "Il contorno della piastra, di 100 per 60 con quattro fori, quotato."
model: "La piastra come solido, spessa 10, vista da sud-est con le linee nascoste rimosse."
sourceHash: "87b8f906b0fd"
---

Modella una piastra di fissaggio spessa 10, in millimetri: il suo contorno di 100 per 60 con gli angoli di raggio 8, e quattro fori di 10 con i centri a 15 dai bordi. Si parte in piano. Il contorno e i cerchi diventano regioni, i fori si sottraggono quando la piastra è ancora piana, e una sola estrusione la trasforma in un solido con i suoi fori.

## Steps

### Disegna il profilo [#profile]

Sul layer Contorno, <Command id="RECTANG" /> con un <Keyword command="RECTANG" id="Fillet" /> di `8`, da `0,0` a `100,60`. Poi un cerchio in `15,15` con un <Keyword command="CIRCLE" id="Diameter" /> di `10`, e <Command id="COPY" /> dal suo centro a `70,0`, `70,30` e `0,30`.

### Crea le regioni [#region]

<Command id="REGION" /> trasforma gli oggetti chiusi in regioni: seleziona il contorno e i quattro cerchi, poi Invio. Cinque contorni chiusi, cinque regioni.

### Sottrai i fori [#subtract]

<Command id="SUBTRACT" />: seleziona la regione della piastra e premi Invio, poi le regioni dei quattro cerchi e Invio. Resta una regione, con quattro fori.

### Ruota la vista [#view]

<Command id="-VIEW" /> e <Keyword command="VIEW" id="SEiso" /> portano la vista a sud-est e dall'alto; <Command id="VSCURRENT" /> e <Keyword command="VSCURRENT" id="Hidden" /> nascondono ciò che le facce coprono. Anche il ViewCube ruota la vista con un clic.

### Estrudila [#extrude]

<Command id="EXTRUDE" />: seleziona la regione, premi Invio e digita l'altezza, `10`. La piastra è un solido, con i suoi fori. <Command id="ZOOM" /> <Keyword command="ZOOM" id="Extents" /> la inquadra, e una scala di 0.8x lascia spazio intorno.
