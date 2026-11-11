---
title: "Comando INSER (INSERT) in AutoCAD"
description: "Come funziona INSER (INSERT, alias IN) di AutoCAD in italiano: la tavolozza Blocchi, o -INSER nella riga di comando con scala, rotazione e attributi. Provalo."
figure: "Una sedia resa blocco, poi inserita due volte a un tavolo: ruotata di 180 dopo il suo punto, poi di 90 con Rotate prima."
sourceHash: "e9859c7871f3"
---

INSER (INSERT in inglese) colloca un blocco definito nel disegno come riferimento: una copia in più, con un punto, una scala e una rotazione propri, disegnata dall'unica definizione che <Command id="BLOCK" /> ha creato. Come fa INSER di AutoCAD 2027, apre la tavolozza Blocchi, che mostra i blocchi del disegno; fai clic su uno e la riga di comando chiede il suo punto di inserimento, con il blocco trascinato sotto il cursore, poi la sua scala e la rotazione. La tavolozza resta aperta, quindi un blocco dopo l'altro è un clic su ciascuno.

<Command id="-INSERT" /> chiede tutto nella riga di comando: il nome del blocco (Invio accetta quello proposto: l'ultimo blocco inserito, o altrimenti l'ultimo definito), il punto di inserimento, poi il fattore di scala X, il fattore di scala Y (Invio usa quello di X) e l'angolo di rotazione. Un fattore negativo riflette il blocco, e fattori diversi lo stirano: un cerchio al suo interno viene disegnato come un'ellisse. Un blocco con attributi chiede poi ogni valore con il suo messaggio, proponendo il valore predefinito. Gli oggetti del blocco sul layer 0 prendono il layer del riferimento, gli altri mantengono il proprio. Ogni inserimento è un passo che Annulla ripristina.

## Options

### ?

Al nome del blocco: elenca i blocchi del disegno, come fa <Command id="BLOCK" />, e termina.

### Scale

Al punto di inserimento: chiede un solo fattore per entrambi gli assi, poi chiede di nuovo il punto, con il blocco trascinato a quella dimensione. Dopo il punto, i fattori X e Y non vengono chiesti.

### Rotate

Al punto di inserimento: chiede l'angolo, digitato o tra due punti, poi chiede di nuovo il punto, con il blocco trascinato ruotato. Dopo il punto, la rotazione non viene chiesta.

## Missing

Inserire un altro file di disegno: si possono inserire solo blocchi definiti nel disegno, e un nome che non contiene viene rifiutato. Al punto di inserimento, Basepoint, X, Y, Z, Explode e Repeat; al fattore di scala X, Corner e XYZ, e un punto selezionato per l'angolo opposto. Con fattori X e Y diversi, un testo o un attributo viene disegnato alla dimensione di X invece di essere stirato, e l'arco di una polilinea resta un arco; una X negativa non scrive un testo al contrario. ATTDIA 1, la finestra Modifica attributi all'inserimento, e ATTREQ 0. Annotativo, Unità del blocco e Fattore unità della tavolozza Proprietà. DaBlocco: un oggetto dentro un blocco non può prendere il colore, il tipo di linea o lo spessore di linea propri del riferimento, come fa un oggetto disegnato DaBlocco in AutoCAD.

## Questions

### Come si chiama il comando INSERT in italiano?

INSER, alias `IN`, poi Invio o barra spaziatrice: apre la tavolozza Blocchi, come fa quella di AutoCAD 2027. `-IN` è <Command id="-INSERT" />, che chiede nella riga di comando. Come in AutoCAD in italiano, il nome inglese funziona anche con il trattino basso davanti: `_INSERT`.

### Come si inserisce un blocco dalla riga di comando?

Digita `-IN` e il nome del blocco, poi seleziona il punto di inserimento e rispondi alla scala e alla rotazione, con Invio che mantiene ogni valore predefinito. <Keyword id="?" /> al nome elenca i blocchi che ci sono.

### Come si inserisce un blocco a una scala diversa?

Digita il fattore di scala X dopo il punto di inserimento, e Invio al fattore Y per mantenerli uguali; oppure scegli <Keyword id="Scale" /> prima del punto e digita un solo fattore per entrambi. Un fattore negativo specchia il blocco.

### Come si inserisce un blocco da un altro disegno?

Non dal suo file: INSER colloca solo blocchi definiti nel disegno. Copia invece un suo riferimento (Ctrl+C), apri il disegno in cui lo vuoi e incollalo (Ctrl+V): il suo blocco arriva con esso, a meno che quel disegno non abbia già un blocco con quel nome, la cui definizione viene mantenuta.
