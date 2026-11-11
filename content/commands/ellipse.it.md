---
title: "Comando ELLISSE (ELLIPSE) in AutoCAD"
description: "Come funziona ELLISSE (ELLIPSE, alias EL) di AutoCAD in italiano: un asse e l'altro semiasse, dal Centro, Rotazione o un Arco ellittico."
figure: "Un'ellisse dalle due estremità di un asse, una dal suo Centro e metà di un Arco ellittico, da 0 a 180 gradi."
sourceHash: "2ee0d1b3a8a4"
---

ELLISSE (ELLIPSE in inglese) disegna un'ellisse a partire dalle due estremità di un asse, poi dalla distanza dal suo punto medio all'estremità dell'altro asse: metà della lunghezza dell'altro asse. Uno dei due assi può essere il più lungo. È una vera ellisse, come quella di AutoCAD, non una polilinea, quindi gli snap Centro, Quadrante e Vicino si agganciano ad essa, e i suoi grip la spostano e impostano ogni semiasse. Mentre indichi la seconda estremità, una linea ambra tratteggiata parte dalla prima; alla distanza, l'ellisse segue il cursore. L'ellisse viene creata sul layer corrente, con le proprietà correnti nel momento in cui viene fissata.

## Options

### Arc

Disegna un arco ellittico: le stesse richieste di un'ellisse, poi un angolo iniziale e un angolo finale, in senso antiorario dall'estremità del primo asse indicato.

### Center

Parte dal centro: poi l'estremità di un asse, poi la distanza dall'altro.

### Rotation

Al posto della distanza: l'angolo di cui l'ellisse è ruotata attorno al suo primo asse, come un cerchio visto con quell'angolo. 0 disegna un cerchio; un angolo entro 0,6 gradi da 90 viene rifiutato con <Message id="invalid" />.

### Parameter

In un arco, al posto dell'angolo iniziale o finale: l'angolo sul cerchio da cui l'ellisse è disegnata, il parametro di AutoCAD. <Keyword id="Angle" /> torna agli angoli.

### Included angle

In un arco, al posto dell'angolo finale: quanto si estende dall'inizio. Invio prende 180, metà ellisse.

## Missing

Isocerchio, offerto da AutoCAD solo con lo stile di snap isometrico, che qui non esiste. PELLIPSE 1, un'ellisse disegnata come polilinea. Tratteggiare o quotare un'ellisse, e gli snap Intersezione, Tangente e Perpendicolare su di essa. I grip a freccia alle estremità di un arco ellittico, qui disegnati quadrati, e digitare una lunghezza o un angolo mentre un grip è attivo. Un punto con una Z alla distanza viene misurato in pianta, dove AutoCAD lo misura nello spazio.

## Questions

### Qual è l'alias del comando ELLIPSE in AutoCAD?

`EL`, poi Invio o barra spaziatrice. Funziona anche il nome completo, ELLISSE in AutoCAD in italiano, e `_ELLIPSE` in tutte le lingue di AutoCAD.

### Come si disegna una semiellisse in AutoCAD?

Scegli <Keyword id="Arc" />, indica l'asse e la distanza, poi un angolo iniziale di `0` e un angolo finale di `180`. Oppure premi Invio a <Keyword id="Included angle" />, che copre 180 per impostazione predefinita.

### Come si disegna un'ellisse dal suo centro?

Scegli <Keyword id="Center" />, indica il centro, poi l'estremità di un asse, poi la distanza dal centro all'estremità dell'altro: i due semiassi dell'ellisse.

### Come si disegna un cerchio isometrico in AutoCAD?

AutoCAD lo disegna con l'opzione Isocerchio di ELLISSE, una volta che lo stile di snap è isometrico. Nessuno dei due esiste ancora in MellowCAD.
