---
title: "Comando INSERM (MINSERT) in AutoCAD"
metaTitle: "Comando INSERM (MINSERT) in AutoCAD"
description: "Come INSERM (MINSERT) di AutoCAD inserisce un blocco in righe e colonne come un unico oggetto, cosa chiede e perché ESPLODI lo rifiuta. Provalo gratis."
figure: "Un sedile reso blocco, poi disposto da INSERM in tre righe di cinque: un unico oggetto."
sourceHash: "d43a50bbc8fe"
---

INSERM (MINSERT in inglese) inserisce più volte un blocco definito nel disegno, in righe e colonne, come un unico oggetto. Chiede ciò che chiede <Command id="-INSERT" /> — il nome del blocco (Invio accetta quello proposto, l'ultimo blocco inserito), il punto di inserimento, i fattori di scala X e Y e l'angolo di rotazione —, poi il numero di righe e il numero di colonne (Invio vale 1), poi la distanza tra le righe e la distanza tra le colonne. Si chiedono solo le distanze che i numeri richiedono, e una riga di una colonna è un normale riferimento di blocco. Un blocco con attributi ne chiede i valori per ultimi, una volta, e ogni copia li mostra.

Le righe seguono l'asse Y del blocco e le colonne il suo asse X, entrambi ruotati dalla rotazione; le distanze sono in unità di disegno, qualunque sia la scala, e una negativa dispone le copie verso il basso o verso sinistra. Alla distanza tra le righe, due punti specificano invece una cella unitaria: la sua larghezza è la distanza tra le colonne e la sua altezza la distanza tra le righe. Il risultato è il blocco inserito in una serie rettangolare di AutoCAD: si sposta, si copia, ruota, si scala e si specchia come uno solo, <Command id="LIST" /> aggiunge le sue righe e colonne, e la tavolozza Proprietà le mostra come Colonne, Distanza fra colonne, Righe e Intervallo righe, che si possono digitare. <Command id="EXPLODE" /> lo conta come inserito in una serie rettangolare e lo lascia intero, come AutoCAD. Un DXF lo apre e lo salva come AutoCAD stesso.

## Options

### ?

Al nome del blocco: elenca i blocchi del disegno, come fa <Command id="BLOCK" />, e termina.

### Scale

Al punto di inserimento: chiede un solo fattore per i due assi, poi chiede di nuovo il punto. Dopo il punto, i fattori X e Y non vengono chiesti.

### Rotate

Al punto di inserimento: chiede l'angolo, che ruota ogni copia e l'intera serie, poi chiede di nuovo il punto. Dopo il punto, la rotazione non viene chiesta.

## Missing

Al punto di inserimento, puntoBase, X, Y e Z, e alla scala X, Angolo e XYZ, come mancano a -INSER; il `~` che apre un file di disegno; i blocchi annotativi, che qui non esistono. Una quota lineare seleziona l'INSERM intero, non un oggetto di una delle sue copie. Le righe Annotativo, Unità blocco e Fattore unità della tavolozza Proprietà.

## Questions

### Cos'è il comando INSERM in AutoCAD?

L'inserimento multiplo: dispone un blocco in una serie rettangolare di righe e colonne, come un unico oggetto. Cambia poi i numeri o la distanza nella tavolozza Proprietà.

### Come si esplode un blocco inserito con INSERM?

Non si può: <Command id="EXPLODE" /> risponde che è stato inserito in una serie rettangolare e lo lascia, in AutoCAD come qui, anche con righe e colonne a 1. Inserisci di nuovo il blocco con <Command id="-INSERT" />, oppure disponi le copie con <Command id="ARRAYRECT" />, la cui serie si esplode nei suoi elementi.

### Come si chiama MINSERT in AutoCAD in italiano?

INSERM. Non ha alias né pulsante sulla barra multifunzione, quindi si digita per intero; `_MINSERT` funziona in qualsiasi lingua di AutoCAD.

### Che differenza c'è tra INSERM e SERIE?

INSERM ripete un blocco come un unico riferimento che non si può esplodere. <Command id="ARRAYRECT" /> ripete oggetti qualsiasi come una serie associativa, con grip per cambiarne numeri e distanze, che <Command id="EXPLODE" /> esplode.
