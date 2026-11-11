---
title: "Comando SPLINE in AutoCAD"
description: "Come funziona SPLINE (SPL) di AutoCAD: una curva per punti di adattamento o tirata da vertici di controllo, Nodi, Grado, tangenti e Chiudi. Provalo."
figure: "Una spline di adattamento per cinque punti, e sotto una spline CV su cinque vertici posizionati allo stesso modo: la prima li attraversa, la seconda è tirata verso di essi."
sourceHash: "1056b5067125"
---

SPLINE disegna una curva morbida, in due modi: attraverso punti che indichi (Adatta, il valore predefinito), oppure tirata verso vertici di controllo che posizioni (VC). Si avvia indicando le impostazioni correnti, `Metodo=Adatta   Nodi=Corda`, poi chiede il primo punto; Invio lì viene rifiutato, come in AutoCAD. Ogni punto successivo piega la curva, con l'anteprima che segue il cursore, e Invio la termina. I punti si possono indicare, agganciare o digitare, una lunghezza digitata viene misurata nella direzione del cursore, e un punto conserva la sua Z, quindi una spline può salire nello spazio. Esc scarta la curva; l'intera spline è un solo passaggio che <Command id="U" /> annulla. I pulsanti Adattamento spline e VC spline della barra multifunzione eseguono SPLINE con il metodo già indicato.

## Options

### Method

<Keyword id="Fit" /> o <Keyword id="CV" />. Una spline di adattamento passa per ogni punto che indichi; una spline VC passa solo per il suo primo e ultimo vertice, e gli altri la attirano verso di sé, quindi risulta più morbida e più lontana da essi. Il metodo, come i nodi e il grado, si conserva per il resto della sessione.

### Knots

Come una spline di adattamento distanzia i suoi punti lungo la curva: <Keyword id="Chord" /> (il valore predefinito, in base alla distanza tra loro), <Keyword id="Square root" /> di quella distanza, oppure <Keyword id="Uniform" />, tutti uguali. Attraverso gli stessi punti ciascuno crea una curva leggermente diversa.

### Degree

Il grado di una spline VC, da 1 (linee rette tra i vertici) a 10; 3, il valore predefinito, è una cubica. Con meno vertici di quelli che il grado richiede, la curva prende il grado più alto possibile.

### Object

Trasforma una polilinea adattata dall'opzione Spline di PEDIT, 2D o 3D, in una spline VC della stessa curva, e cancella la polilinea, in un solo passaggio. Qualsiasi altra cosa viene rifiutata con <Message id="onlySplineFittedPolylines" />.

### start Tangency

Offerta dopo il primo punto: la direzione in cui la curva lo lascia, indicata o digitata da quel punto.

### end Tangency

La direzione in cui la curva arriva al suo ultimo punto, poi la spline termina.

### Undo

Annulla l'ultimo punto, fino al primo.

### Close

Dal terzo punto: riunisce la fine all'inizio in un unico anello morbido, senza angolo vivo, e termina il comando.

## Missing

Tolleranza di adattamento: una spline di adattamento passa sempre esattamente per i suoi punti, e l'opzione Tolleranza non è offerta. Mentre viene disegnata, la spline non è ancora un oggetto a cui agganciarsi o su cui tracciare, come lo è quella di AutoCAD. Oggetto cancella sempre la polilinea (DELOBJ). Su una spline finita non ci sono CVSHOW né CVHIDE né menu dei grip per aggiungere o togliere un punto, la tavolozza Proprietà ne modifica i punti ma non il metodo, il grado, i nodi, i pesi o la chiusura, e Centro geometrico, Perpendicolare e Tangente non vi si agganciano. HATCH non trova una spline come contorno, e BLEND non esiste ancora.

## Questions

### Qual è l'alias di SPLINE in AutoCAD?

`SPL`, poi Invio o barra spaziatrice. Funziona anche il nome completo, e `_SPLINE` in qualsiasi lingua di AutoCAD.

### Qual è la differenza tra Adatta e VC?

Una spline di adattamento passa per i punti che clicchi, il che va bene per una curva che deve toccarli. Una spline VC è modellata dai suoi vertici di controllo, a cui si avvicina soltanto, il che va bene per una forma morbida e regolare. Scegli con <Keyword id="Method" /> alla prima richiesta.

### Come si converte una spline in una polilinea?

Avvia <Command id="PEDIT" /> e indica la spline: segnala <Message id="objectNotPolyline" /> e propone di trasformarla in una, poi chiede una precisione da 0 a 99, 10 per impostazione predefinita. La polilinea segue la spline con brevi segmenti rettilinei, più di quanti ne crei AutoCAD.

### Come si converte una polilinea in una spline?

Adatta la polilinea con l'opzione Spline di <Command id="PEDIT" />, poi avvia SPLINE e scegli <Keyword id="Object" />: la polilinea diventa una spline della stessa curva.

### Si può esplodere una spline in AutoCAD?

No: <Command id="EXPLODE" /> rifiuta una spline, come fa AutoCAD. Per spezzarla in parti, convertila prima in una polilinea con <Command id="PEDIT" />, poi esplodi questa in linee.
