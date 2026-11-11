---
title: "Comando REGIONE (REGION) in AutoCAD"
description: "Come REGIONE (REGION, alias REG) di AutoCAD trasforma le forme chiuse in regioni: quali contorni trova, perché non ne crea e a cosa serve. Provalo."
figure: "Quattro linee chiuse da un capo all'altro e un cerchio al loro interno: REGIONE, con una finestra attorno a entrambi, crea due regioni e cancella gli oggetti."
sourceHash: "69a5423c3d5c"
---

REGIONE (REGION) trasforma le forme chiuse in regioni: aree piane senza spessore, ciascuna delimitata dai suoi contorni. Seleziona gli oggetti e premi Invio; ogni contorno che formano diventa una regione. Un oggetto chiuso è un contorno a sé: un cerchio, un'ellisse, una polilinea o una spline chiusa. Quelli aperti, linee, archi, archi ellittici, polilinee e spline aperte, vengono concatenati da un capo all'altro, mai dove si incrociano, e una catena che non si chiude viene scartata. La riga di comando conta poi i contorni trovati, quelli rifiutati e perché, e le regioni create; Invio senza selezionare nulla segnala <Message id="regionNoneFound" />.

Gli oggetti entrati in una regione vengono cancellati, gli altri conservati, e le regioni prendono il layer e le proprietà correnti, non quelli degli oggetti. Un contorno dentro un altro crea una regione a sé, non un foro nell'altra: <Command id="SUBTRACT" /> ne toglie una dall'altra. Una regione si disegna come i suoi spigoli e vi si aggancia; la tavolozza Proprietà ne mostra l'area e il perimetro, che misurano anche <Command id="AREA" />, <Command id="LIST" /> e <Command id="MASSPROP" />. <Command id="UNION" />, <Command id="SUBTRACT" /> e <Command id="INTERSECT" /> combinano regioni dello stesso piano, <Command id="EXTRUDE" />, <Command id="REVOLVE" /> e <Command id="PRESSPULL" /> le trasformano in solidi 3D e <Command id="EXPLODE" /> restituisce le loro linee, archi e cerchi. L'intero comando è un solo passo di annullamento.

## Missing

`DELOBJ` di AutoCAD: qui gli oggetti entrati in una regione vengono sempre cancellati. BOUNDARY, che può creare una regione dall'area attorno a un punto, e una regione dal contorno di un tratteggio. La modifica di una regione con i suoi grip: si vedono, ma trascinarne uno non cambia nulla. I suoi spigoli come spigolo di taglio o limite per <Command id="TRIM" /> ed <Command id="EXTEND" /> in modalità Rapido, e <Command id="HATCH" /> di una regione con uno spigolo ellittico o spline. Regioni combinate con superfici, che MellowCAD non ha, e la riga Materiale nella tavolozza Proprietà.

## Questions

### Come si usa il comando REGIONE in AutoCAD?

Avvia REGIONE (o `REG`), seleziona le forme chiuse o le linee che ne chiudono una da un capo all'altro e premi Invio. La finestra della sessione attorno a quattro linee e un cerchio crea due regioni, e la riga di comando conta due contorni estratti e due regioni create.

### Perché REGIONE non crea una regione?

La forma non è chiusa da un capo all'altro. Linee che si incrociano, o che si fermano prima di toccarsi, non chiudono nulla: REGIONE concatena gli oggetti aperti solo per i loro estremi, e uno scarto minimo basta a far scartare la catena. Un contorno che si incrocia, come un papillon, viene rifiutato e contato tra le autointersezioni. Unisci gli estremi con <Command id="FILLET" /> a raggio 0, o <Command id="TRIM" /> ciò che sporge, e riprova.

### Come si crea una regione con un foro?

Crea una regione dal contorno e una dal foro, poi avvia <Command id="SUBTRACT" />: scegli il contorno, Invio, il foro, Invio. Il risultato è una sola regione, e <Command id="EXTRUDE" /> la trasforma in un solido con il foro passante.

### Come si trova l'area di una regione?

Selezionala e leggi Area nella tavolozza Proprietà, oppure esegui <Command id="AREA" />, scegli <Keyword command="AREA" id="Object" /> e indicala. <Command id="MASSPROP" /> aggiunge il perimetro, il baricentro e i momenti d'inerzia.
