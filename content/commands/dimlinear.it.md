---
title: "Comando DIMLINEARE (DIMLINEAR) in AutoCAD"
description: "Come quotare in AutoCAD con DIMLINEARE (DIMLINEAR, alias DLI): due origini o un oggetto, poi la linea, orizzontale o verticale. Provalo."
figure: "Un rettangolo quotato due volte: il lato superiore dai suoi due angoli, il lato destro con Invio e una selezione su di esso."
sourceHash: "e48a0a6f18c9"
---

DIMLINEARE misura la distanza tra due punti lungo X o lungo Y e la disegna come quota: due linee di estensione, una linea di quota con le sue punte di freccia, e la misura sopra di essa. Indica le origini della prima e della seconda linea di estensione, poi la posizione della linea di quota: dove la posizioni sceglie la direzione, come in AutoCAD: sopra o sotto i due punti misura in orizzontale, di lato in verticale. Premi invece Invio alla prima richiesta e seleziona una linea, un arco, un segmento di polilinea o un cerchio: i suoi due estremi, o il diametro del cerchio, sono le origini. La riga di comando dice poi la misura, e il comando termina.

La quota è disegnata nello stile di quota corrente, ISO-25 in un nuovo disegno: una virgola per i decimali e nessuno zero finale, come scrivono i disegni metrici di AutoCAD. <Command id="DIMHORIZONTAL" />, <Command id="DIMVERTICAL" /> e <Command id="DIMROTATED" />, digitati da soli, sono DIMLINEARE vincolato a una direzione.

## Options

### Text

Chiede il testo da scrivere al posto della misura, che propone come predefinito: Invio conserva la misura. In ciò che digiti, `<>` sta per la misura, quindi `<> mm` la scrive seguita dalla sua unità.

### Angle

Chiede l'angolo del testo, che è poi disegnato a quell'angolo invece che lungo la linea di quota. 0 lo riporta lungo la linea.

### Horizontal

Misura lungo X ovunque posizioni la linea di quota, che resta orizzontale; la richiesta propone poi solo <Keyword id="Text" /> e <Keyword id="Angle" />.

### Vertical

Misura lungo Y ovunque posizioni la linea di quota, che resta verticale.

### Rotated

Chiede l'angolo della linea di quota, `0` per impostazione predefinita, e misura la distanza tra le origini lungo di esso. Su uno spigolo inclinato, il suo stesso angolo ne dà la lunghezza, come fa <Command id="DIMALIGNED" />.

## Missing

Testo multilinea: il testo di una quota è una sola riga, impostata con <Keyword id="Text" /> alla riga di comando, mai nell'editor di testo. Con un angolo impostato da <Keyword id="Angle" />, AutoCAD centra il testo sulla linea di quota; qui resta sopra di essa, come senza angolo. Una quota non è associativa: non segue l'oggetto che misura.

## Questions

### Qual è la scorciatoia di DIMLINEARE in AutoCAD?

`DLI`, poi Invio o barra spaziatrice. Funziona anche il nome completo, e `_DIMLINEAR` in tutte le lingue di AutoCAD.

### Quali sono i comandi di quotatura in AutoCAD?

<Command id="DIMLINEAR" /> per le distanze orizzontali e verticali, <Command id="DIMALIGNED" /> per una distanza lungo uno spigolo inclinato, <Command id="DIMRADIUS" /> e <Command id="DIMDIAMETER" /> per archi e cerchi, <Command id="DIMANGULAR" /> per gli angoli, <Command id="DIMCONTINUE" /> e <Command id="DIMBASELINE" /> per le catene, <Command id="DIMSPACE" /> per uniformare la loro spaziatura e <Command id="DIMSTYLE" /> per il loro aspetto. DIM di AutoCAD, che crea ogni tipo da una sola richiesta, e QDIM, che quota molti oggetti in una volta, non sono ancora in MellowCAD.

### Perché la quota non segue l'oggetto quando lo modifico?

Le quote di MellowCAD non sono ancora associative, come mostra <Message id="nonAssociativeDimension" />: una quota conserva i punti che le sono stati dati. Stirale insieme: includi l'estremo che sposti e l'origine della quota in una sola finestra di selezione di <Command id="STRETCH" />, e la misura è ricalcolata; oppure trascina il grip dell'origine nella sua nuova posizione.

### Come si cambia la dimensione del testo e delle frecce di una quota?

Nello stile di quota, come in AutoCAD: <Command id="DIMSTYLE" /> (`D`) apre gli stili di quota, nella tavolozza Stili qui dove AutoCAD ha Gestione stili di quota. L'altezza del testo, la dimensione delle frecce, la scala globale e i decimali dello stile corrente si impostano lì, e ogni quota in quello stile li segue.
