---
title: "Comando PLINEA (PLINE) in AutoCAD"
description: "Come funziona PLINEA (PLINE, alias PL) di AutoCAD in italiano, richiesta per richiesta: linee e archi in una polilinea, Larghezza, Lunghezza, Chiudi e Annulla."
figure: "Una linea, un arco tangente e una linea di ritorno, poi una testa larga 10 che si assottiglia fino a 0: una sola polilinea."
sourceHash: "216b83656483"
---

PLINEA (PLINE in inglese) disegna una polilinea: un solo oggetto fatto di segmenti rettilinei e archi uniti testa a testa, ciascuno con una larghezza. Dopo il punto iniziale indica la larghezza corrente; poi ogni punto aggiunge un segmento, finché non lo termini con Invio o <Keyword id="Close" />. Come in AutoCAD, parte con le linee: <Keyword id="Arc" /> passa agli archi, ciascuno tangente al segmento precedente, e <Keyword id="Line" /> torna indietro. Invio al punto iniziale prosegue dalla fine dell'ultima linea, arco o polilinea disegnata.

## Options

### Arc

Modalità arco: ogni punto finale disegna un arco tangente all'ultimo segmento o, come primo segmento, che parte nella direzione in cui termina l'ultima linea, arco o polilinea disegnata. Tieni premuto Ctrl per invertirne la direzione. Le opzioni sotto modellano l'arco successivo.

### Close

Compare nell'elenco dopo il primo segmento: chiude la polilinea sul suo punto iniziale e termina il comando; in modalità arco, con un arco tangente.

### Halfwidth

Come <Keyword id="Width" />, ma ogni larghezza è misurata dal centro del segmento al suo bordo.

### Length

Una linea della lunghezza che indichi, nella direzione in cui procede la polilinea: lungo l'ultimo segmento, o tangente all'ultimo arco. Una lunghezza negativa torna indietro.

### Undo

Annulla l'ultimo segmento e prosegue nella modalità di quello precedente. Quando non restano segmenti, segnala <Message id="allSegmentsUndone" />

### Width

La larghezza iniziale, poi quella finale, ciascuna digitata o indicata a partire dall'ultimo vertice: da 10 a 0 si assottiglia fino a un punto, come una punta di freccia. La larghezza finale prosegue nei segmenti successivi e, come PLINEWID, nella PLINEA successiva.

### Angle

Modalità arco: l'angolo incluso dell'arco, poi la sua estremità, il suo centro o il suo raggio.

### Center

Modalità arco: il centro dell'arco, poi la sua estremità, il suo angolo incluso o la lunghezza della sua corda.

### Direction

Modalità arco: la direzione in cui l'arco lascia l'ultimo vertice, al posto della tangente, poi la sua estremità.

### Line

Modalità arco: di nuovo segmenti rettilinei.

### Radius

Modalità arco: il raggio dell'arco, poi la sua estremità o il suo angolo incluso. Un raggio negativo disegna l'arco maggiore.

### Second pt

Modalità arco: un punto per cui passa l'arco, poi la sua estremità: un arco per tre punti.

## Missing

PLINEGEN: una nuova polilinea dispone il suo tipo di linea segmento per segmento, come con PLINEGEN 0 (l'opzione Tipolinea di EDITPL lo attiva per una polilinea). Un tipo di linea tratteggiato su un segmento largo viene disegnato continuo. L'anteprima di un segmento largo non è disegnata in una tonalità più tenue, e la richiesta dell'arco è scritta su una riga dove AutoCAD la spezza in due.

## Questions

### Come si chiama il comando PLINE in italiano?

PLINEA, alias `PL`, poi Invio o barra spaziatrice. Come in AutoCAD in italiano, il nome inglese funziona anche con il trattino basso davanti: `_PLINE`.

### Come si disegna una polilinea curva?

Scegli <Keyword id="Arc" />: ogni punto chiude allora un arco tangente al segmento precedente, fino a <Keyword id="Line" />. Per ammorbidire una polilinea già disegnata attraverso i suoi vertici, usa <Command id="PEDIT" /> e le sue opzioni <Keyword command="PEDIT" id="Fit" /> o <Keyword command="PEDIT" id="Spline" />.

### Perché la mia polilinea è disegnata spessa?

Una larghezza data in una PLINEA precedente viene mantenuta, e la polilinea successiva parte con essa, come indica la riga dopo il suo punto iniziale. Scegli <Keyword id="Width" /> e indica 0 due volte per disegnare di nuovo sottile. Con <Command id="FILL" /> disattivato, le polilinee larghe appaiono come contorni.

### Come si uniscono delle linee in una polilinea?

Avvia <Command id="JOIN" /> e seleziona linee, archi e polilinee che si toccano testa a testa: ogni catena diventa una sola polilinea. Oppure avvia <Command id="PEDIT" /> su una linea, rispondi <Keyword command="PEDIT" id="Yes" /> per trasformarla in una polilinea, e aggiungi il resto con <Keyword command="PEDIT" id="Join" />.

### Come si trovano l'area o la lunghezza di una polilinea?

Avvia <Command id="AREA" />, premi Invio per <Keyword command="AREA" id="Object" /> e seleziona la polilinea: una chiusa riporta la sua area e il suo perimetro, una aperta la sua lunghezza.
