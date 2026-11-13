---
title: "Comando DIRETTRICE (LEADER) in AutoCAD"
metaTitle: "Direttrice in AutoCAD: DIRETTRICE (LEADER)"
description: "Come funziona DIRETTRICE (LEADER) di AutoCAD in italiano: una linea dalla freccia al testo, la linea di aggancio e la differenza con MLEADER. Provalo."
figure: "Un foro e la sua nota: DIRETTRICE dal bordo del cerchio, due punti, poi due righe di testo; l'ultimo tratto sale, quindi una linea di aggancio lo unisce al testo."
sourceHash: "1bf39ac320fd"
---

DIRETTRICE (LEADER) traccia una linea da una freccia a una nota. Specifica il punto iniziale, dove va la freccia, poi tutti i punti che vuoi; dal secondo in poi la richiesta offre <Keyword id="Annotation" />, che anche Invio sceglie, <Keyword id="Format" /> e <Keyword id="Undo" />. Invio ai primi due punti termina il comando senza tracciare niente. Poi digita la nota riga per riga, Invio dopo ognuna, e Invio su una riga vuota per finire: la direttrice e il suo testo, un testo multilinea, si creano insieme in un solo passo, sul layer corrente con il colore, il tipo di linea e lo spessore di linea correnti.

Il testo prende l'altezza, la distanza dalla linea e la posizione dallo stile di quota corrente: dopo la fine della direttrice, o prima quando la direttrice arriva da destra, e sopra l'ultimo tratto, che prosegue sotto il testo. Quando l'ultimo tratto sale di più di 15° dall'orizzontale, DIRETTRICE aggiunge una linea di aggancio, un tratto orizzontale lungo quanto la freccia che finisce nel punto specificato. La freccia è quella chiusa piena, disegnata solo quando il primo tratto misura almeno il doppio della freccia.

La direttrice segue il suo testo: sposta, ruota o scala il testo e la fine della direttrice lo segue, con la linea di aggancio ricalcolata; cancella il testo e la direttrice resta, senza aggancio. Una direttrice e il suo testo copiati insieme restano una coppia. I grip della direttrice sono nei suoi punti; la tavolozza Proprietà mostra il tipo, la dimensione della freccia, l'offset e la posizione del testo, e la scala.

## Options

### Annotation

Chiede il testo, riga per riga. Invio alla prima riga chiede invece un altro tipo di annotazione: <Keyword id="Mtext" /> (predefinita) apre l'editor di testo alla fine della direttrice, dove Invio va a capo e Ctrl+Invio o un clic fuori termina; <Keyword id="Copy" /> mette alla fine una copia del testo multilinea, del testo su una riga o del riferimento di blocco che selezioni, e rifiuta qualsiasi altro oggetto con <Message id="leaderCopyRefused" />; <Keyword id="None" /> traccia la sola direttrice.

### Format

Stabilisce come si traccia la direttrice e torna ai punti: <Keyword id="Spline" /> la rende una curva morbida per i punti, <Keyword id="STraight" /> torna ai tratti diritti, <Keyword id="Arrow" /> rimette la freccia e <Keyword id="None" /> la toglie. Invio lascia il formato com'è.

### Undo

Annulla l'ultimo punto e lo chiede di nuovo. Al secondo punto non c'è niente da annullare, e <Message id="invalidInputCapital" /> lo dice.

## Missing

Le annotazioni Tolleranza e Blocco: MellowCAD non ha un oggetto tolleranza geometrica, e un blocco non si inserisce da DIRETTRICE, quindi la richiesta delle opzioni offre Copia, Nessuna e testoM. Le frecce diverse da quella chiusa piena, e il colore e lo spessore di linea propri della direttrice dati dallo stile di quota. DIRRAPID (QLEADER) e MLEADER, la direttrice rapida e quella multipla, non ci sono ancora: le direttrici multiple di un DXF restano fuori all'apertura.

## Questions

### Come si chiama il comando direttrice in inglese?

LEADER. In AutoCAD in italiano è DIRETTRICE, senza alias: digita DIRETTRICE e premi Invio o la barra spaziatrice. `DRAP` avvia DIRRAPID, la direttrice rapida, e `_LEADER` funziona in ogni lingua di AutoCAD.

### Che differenza c'è tra DIRETTRICE e MLEADER?

DIRETTRICE è il comando di prima: una linea di direttrice e un testo a parte che la linea segue. MLEADER, che oggi AutoCAD consiglia, crea un unico oggetto direttrice multipla, con stili propri e più linee verso la stessa nota. MellowCAD ha DIRETTRICE; apre e salva le direttrici di un file DXF, e lascia fuori le sue direttrici multiple.

### Come faccio una direttrice con il testo?

Avvia DIRETTRICE, specifica il punto da indicare, poi dove andrà il testo, premi Invio e digita il testo, riga per riga. Invio su una riga vuota termina. Invio alla prima riga mostra le altre annotazioni, tra cui l'editor di testo.

### Come cambio la dimensione della freccia della direttrice?

Seleziona la direttrice e cambia Dimensione freccia nella tavolozza Proprietà, che vale solo per lei; oppure cambia la dimensione della freccia dello stile di quota, che tutte le direttrici di quello stile seguono. Anche la lunghezza della linea di aggancio segue la dimensione della freccia.

### Perché la direttrice non ha la freccia?

O l'ha tolta Nessuna in Formato, o il primo tratto misura meno del doppio della dimensione della freccia, e lì nemmeno AutoCAD la disegna. Specifica il secondo punto più lontano dal primo, o usa una freccia più piccola.
