---
title: "Comando EDITPL (PEDIT) in AutoCAD"
description: "Come funziona EDITPL (PEDIT, alias EP) di AutoCAD in italiano: linee in una polilinea, Unisci, Larghezza, Adatta e Spline, Edita vertice, Multiplo. Provalo."
figure: "Tre linee che si toccano di testa: EDITPL trasforma la prima in una polilinea, le unisce le altre due e le dà una larghezza di 2."
sourceHash: "bdc0bf10ac09"
---

EDITPL (PEDIT in inglese) modifica una polilinea. Selezionane una a `Selezionare polilinea o [Multiplo]:`, oppure selezionala prima del comando; anche un doppio clic su una polilinea esegue EDITPL su di essa. Se selezioni invece una linea, un arco o una spline, segnala <Message id="objectNotPolyline" /> e chiede se trasformare l'oggetto in polilinea, Sì per impostazione predefinita: la nuova polilinea prende il suo posto e le sue proprietà. Poi chiede un'opzione dopo l'altra, ciascuna applicata subito, finché Invio termina. Una polilinea 3D ha un elenco più corto, senza larghezza, adattamento a curva né generazione del tipo di linea, e la sua opzione spline è <Keyword id="Spline curve" />. Esc mantiene ciò che è stato fatto; l'intera modifica è un solo passaggio che <Command id="U" /> annulla.

## Options

### Multiple

Modifica più polilinee insieme: selezionale, indica se convertire le linee, gli archi e le spline tra esse, poi ogni opzione viene applicata a tutte. La sua opzione Unisci chiede una distanza di tolleranza e un <Keyword id="Jointype" />: <Keyword id="Extend" /> taglia o estende i segmenti finali fino a incontrarsi, <Keyword id="Add" /> colma lo spazio vuoto con un nuovo segmento, <Keyword id="Both" /> estende dove può e aggiunge dove non può.

### Close

Chiude la polilinea con un segmento dal suo ultimo vertice al primo, un arco dove l'ultimo segmento è un arco. Su una polilinea chiusa l'opzione è <Keyword id="Open" />, che toglie quel segmento.

### Join

Aggiunge linee, archi e polilinee aperte che incontrano le estremità della polilinea, testa a testa, e riporta quanti segmenti ha aggiunto. A una polilinea chiusa non si può unire nulla: <Message id="cannotJoinClosedPolyline" />.

### Width

Una larghezza per ogni segmento, digitata o misurata con due punti; 0 toglie la larghezza.

### Edit vertex

Mette una X sul primo vertice e chiede che cosa fare lì: <Keyword id="Next" /> e <Keyword id="Previous" /> spostano la X, <Keyword id="Move" /> sposta il vertice, <Keyword id="Insert" /> ne aggiunge uno dopo quello corrente, <Keyword id="Break" /> e <Keyword id="Straighten" /> ricordano il vertice, poi sposti la X su un altro, e <Keyword id="Go" /> interrompe la polilinea tra i due oppure fa un solo segmento rettilineo di ciò che sta in mezzo, <Keyword id="Width" /> imposta le larghezze iniziale e finale del segmento successivo, <Keyword id="Tangent" /> dà al vertice una direzione per un successivo Adatta, e <Keyword id="eXit" /> torna indietro.

### Fit

Disegna una curva morbida di archi attraverso ogni vertice, tangenti dove si incontrano, come li dispone l'adattamento a curva di AutoCAD. I vertici restano, e modificarli rimodella la curva.

### Spline

Adatta una B-spline alla polilinea, guidata dai suoi vertici anziché passare per essi: quadratica o cubica, con SPLINETYPE, e con la finezza data da SPLINESEGS. Quella di una polilinea 3D è <Keyword id="Spline curve" />. L'opzione Oggetto di SPLINE trasforma una polilinea di questo tipo in una vera spline.

### Decurve

Toglie la curva di Adatta o di Spline: di nuovo segmenti rettilinei tra i vertici.

### Ltype gen

<Keyword id="ON" /> dispone il tipo di linea in un solo modello lungo tutta la polilinea, così una polilinea tratteggiata con segmenti corti mostra comunque i tratti; <Keyword id="OFF" />, il valore predefinito, ricomincia il modello a ogni vertice.

### Reverse

Inverte la polilinea: i suoi vertici nell'altro verso, con gli archi e le larghezze.

### Undo

Annulla l'ultima opzione di questa esecuzione, e continua a chiedere.

## Missing

PEDITACCEPT: selezionare una linea, un arco o una spline chiede sempre prima di convertirla. PLINECONVERTMODE: una spline diventa una polilinea di segmenti rettilinei, molti di più di quelli che crea AutoCAD, mai archi. Una polilinea adattata compare nella tavolozza Proprietà come una semplice polilinea, senza il titolo Polilinea 2D di AutoCAD e la sua riga Adatta/Leviga. Multiplo con solo polilinee 3D nell'insieme mostra la richiesta 3D, dove AutoCAD mostra quella 2D. Non ci sono mesh da modificare.

## Questions

### Come si chiama il comando PEDIT in italiano?

EDITPL, alias `EP`, poi Invio o barra spaziatrice. Come in AutoCAD in italiano, il nome inglese funziona anche con il trattino basso davanti: `_PEDIT`. Lo esegue anche il doppio clic su una polilinea.

### Come si uniscono delle linee in una polilinea?

Avvia EDITPL, seleziona una delle linee e premi Invio per trasformarla in una polilinea, poi scegli <Keyword id="Join" /> e seleziona le altre: quelle che si toccano testa a testa diventano una sola polilinea. <Command id="JOIN" /> fa lo stesso in un solo passaggio.

### Perché EDITPL non funziona sul mio oggetto?

EDITPL modifica polilinee, e offre di convertire linee, archi e spline; qualunque altra cosa, testo, un cerchio, un blocco, viene rifiutata e richiesta di nuovo. Un oggetto su un layer bloccato segnala <Message id="objectOnLockedLayer" />. Unisci aggiunge solo oggetti le cui estremità incontrano esattamente quelle della polilinea: per gli spazi vuoti, usa <Keyword id="Multiple" /> e una distanza di tolleranza.

### Come si cambia la larghezza di una polilinea?

Scegli <Keyword id="Width" /> e digita la larghezza: ogni segmento la prende. Per un solo segmento, usa <Keyword id="Edit vertex" />, sposta la X sul vertice da cui parte e scegli il suo <Keyword id="Width" />.

### Come si rende curva una polilinea?

<Keyword id="Fit" /> fa passare archi per ogni vertice; <Keyword id="Spline" /> crea una curva più morbida, guidata dai suoi vertici. <Keyword id="Decurve" /> la raddrizza di nuovo.
