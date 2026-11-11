---
title: "Esercizio AutoCAD: una flangia"
metaTitle: "Esercizio AutoCAD 2D meccanica: una flangia"
description: "Disegna una flangia in AutoCAD: foro con cava per chiavetta tagliata, otto fori in serie polare, assi e diametri, risolto passo passo. Gratis online."
figure: "La flangia, di 140 di diametro, con la cava per chiavetta, otto fori e i diametri."
sourceHash: "32f94d57ae25"
---

Disegna questa flangia, in millimetri: 140 di diametro, un foro di 60 con una cava per chiavetta larga 16 il cui lato superiore è a 36 dal centro, otto fori di 14 su una circonferenza di foratura di 110, e i suoi assi. La cava è un rettangolo tagliato nel foro; i fori sono un cerchio e una serie polare.

## Steps

### Disegna i cerchi [#circles]

Sul layer Contorno, due cerchi in `0,0`, ciascuno col suo <Keyword command="CIRCLE" id="Diameter" />: `140` e `60`.

### Taglia la cava [#keyway]

<Command id="RECTANG" /> da `-8,20` a `16,16` più in là: attraversa il foro. <Command id="TRIM" /> taglia un oggetto dove gli altri lo incrociano: seleziona l'arco del foro tra i lati del rettangolo, poi il lato inferiore del rettangolo, dentro il foro. Resta la cava, con i suoi due lati e il lato superiore.

### Disponi i fori in serie [#holes]

Un foro sulla circonferenza di foratura: un cerchio in `55<22.5`, a 55 dall'origine a 22,5°, con un <Keyword command="CIRCLE" id="Diameter" /> di `14`. <Command id="ARRAYPOLAR" />: selezionalo, premi Invio e indica il centro, `0,0`; <Keyword command="ARRAYPOLAR" id="ASsociative" /> e <Keyword command="ARRAYPOLAR" id="No" /> lasciano otto cerchi separati, che una quota può selezionare, e <Keyword command="ARRAYPOLAR" id="Items" />, `8`, li distribuisce su tutta la circonferenza. Poi, sul layer Assi, la circonferenza di foratura in `0,0`, di diametro `110`.

### Disegna gli assi [#centreLines]

Sempre su Assi, due linee con <Command id="LINE" /> attraverso il centro, lunghe 156: da `-78,0`, `156,0` in orizzontale; da `0,-78`, `0,156` in verticale.

### Quotala [#dimensions]

Sul layer Quote, <Command id="DIMDIAMETER" /> sul foro, su un foro di fissaggio, sulla circonferenza di foratura e sul contorno, ciascuno selezionato dove nessuna quota lo attraversa ancora, poi <Command id="DIMLINEAR" /> sul lato superiore della cava: 16.
