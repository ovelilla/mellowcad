---
title: "Esercizio AutoCAD: una squadretta a L"
metaTitle: "Esercizio AutoCAD per principianti: squadretta"
description: "Disegna una squadretta a L in AutoCAD con coordinate relative: contorno, raccordo, due fori e quote da linea di base, passo passo. Gratis online."
figure: "La squadretta a L, di 100 per 80, quotata dal suo angolo in basso a sinistra."
sourceHash: "5c7cd5d57c92"
---

Disegna questa squadretta, in millimetri: lunga 100, con una base alta 20 e un montante largo 30 e alto 80, l'angolo interno raccordato con raggio 10, un foro di 8 nella base e uno di 10 nel montante, ciascuno centrato nel suo braccio. Il contorno si disegna in un solo tratto con <Command id="LINE" />, ogni punto digitato come lo spostamento dall'ultimo, e le sue quote partono tutte dall'angolo in basso a sinistra.

## Steps

### Disegna il contorno [#outline]

Sul layer Contorno, <Command id="LINE" /> da `0,0`, poi ogni punto come uno spostamento dall'ultimo: `100,0`, `0,20`, `-70,0`, `0,60` e `-30,0`. <Keyword command="LINE" id="Close" /> disegna l'ultimo lato fino all'inizio e termina il comando.

### Raccorda l'angolo interno [#fillet]

<Command id="FILLET" />: scegli <Keyword command="FILLET" id="Radius" />, digita `10`, poi seleziona le due linee che si incontrano nell'angolo interno, il lato superiore della base e il lato del montante.

### Disegna i fori [#holes]

Due cerchi con <Command id="CIRCLE" />, ciascuno col suo <Keyword command="CIRCLE" id="Diameter" />: `8` in `80,10`, nella base, e `10` in `15,65`, nel montante.

### Quotala [#dimensions]

Sul layer Quote, <Command id="DIMLINEAR" /> da `0,0` al foro della base, `80,10`, posizionata sotto: 80. <Command id="DIMBASELINE" /> prosegue dalla stessa prima linea di estensione: digita l'estremo destro, `#100,0`, dove # misura dall'origine, poi Invio due volte per terminare. Lo stesso lungo il lato sinistro, fino al foro superiore e poi alla sommità, `#0,80`. <Command id="DIMRADIUS" /> sul raccordo e <Command id="DIMDIAMETER" /> su ogni foro completano il disegno.
