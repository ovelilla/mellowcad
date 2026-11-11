---
title: "Comando DIMALLINEATA (DIMALIGNED) in AutoCAD"
description: "Come DIMALLINEATA (DIMALIGNED, alias DAL) di AutoCAD quota uno spigolo inclinato: due origini o un oggetto, poi una linea parallela. Provalo."
figure: "Il lato inclinato di un triangolo quotato lungo la sua lunghezza: i suoi due estremi, poi dove va la linea."
sourceHash: "243f7657ed7d"
---

DIMALLINEATA misura la distanza reale tra due punti: la sua linea di quota corre parallela alla linea che li unisce, con qualsiasi angolo, mentre <Command id="DIMLINEAR" /> misura solo lungo X o Y. Le sue richieste sono quelle di <Command id="DIMLINEAR" />: le origini della prima e della seconda linea di estensione, oppure Invio e una selezione su una linea, un arco o un segmento di polilinea per i suoi due estremi, poi la posizione della linea di quota, da una parte o dall'altra. Un cerchio selezionato dà il suo diametro attraverso il punto in cui lo hai selezionato. La riga di comando dice la misura, e il comando termina.

## Options

### Text

Chiede il testo da scrivere al posto della misura, che offre come predefinito: Invio conserva la misura. In ciò che digiti, `<>` sta per la misura.

### Angle

Chiede l'angolo del testo, che è poi disegnato a quell'angolo invece che lungo la linea di quota. 0 lo riporta lungo la linea.

## Missing

Testo multilinea: il testo di una quota è una sola riga, impostata con <Keyword id="Text" /> alla riga di comando, mai nell'editor di testo. Con un angolo impostato da <Keyword id="Angle" />, AutoCAD centra il testo sulla linea di quota; qui resta sopra di essa, come senza angolo. Una quota non è associativa: non segue l'oggetto che misura.

## Questions

### Qual è la scorciatoia di DIMALLINEATA in AutoCAD?

`DAL`, poi Invio o barra spaziatrice. Funziona anche il nome completo, e `_DIMALIGNED` in tutte le lingue di AutoCAD.

### Qual è la differenza tra DIMLINEARE e DIMALLINEATA?

Su uno spigolo inclinato, <Command id="DIMLINEAR" /> dà la sua larghezza o la sua altezza, a seconda che la sua linea di quota sia orizzontale o verticale; DIMALLINEATA dà la sua lunghezza, con la linea parallela allo spigolo. Su uno spigolo lungo X o Y entrambe danno lo stesso numero.

### Come si quota una linea inclinata in AutoCAD?

Con DIMALLINEATA: premi Invio alla prima richiesta, seleziona la linea e posiziona la quota dal lato che vuoi. Oppure indica i suoi due estremi, con lo snap Punto finale perché le origini siano esatte.

### Come si scrive un testo proprio su una quota?

Scegli <Keyword id="Text" /> prima di posizionarla e digita il testo: `<>` sta per la misura, quindi `<> mm` la scrive seguita dalla sua unità, e Invio senza digitare nulla conserva la misura da sola. Una volta posizionata, Sostituzione testo della tavolozza Proprietà la cambia.
