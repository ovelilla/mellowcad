---
title: "Comando LINEA (LINE) in AutoCAD"
description: "Come funziona LINEA (LINE, alias L) di AutoCAD in italiano, richiesta per richiesta: punti selezionati o digitati, Annulla e Chiudi, Invio per proseguire."
figure: "Un triangolo: il primo punto digitato, i due successivi dall'ultimo punto, poi Chiudi."
sourceHash: "5065fc1817a1"
---

LINEA (LINE in inglese) disegna segmenti rettilinei, ciascuno un oggetto a sé: indica il primo punto, poi ogni punto successivo, fino a Invio. Un punto si seleziona, si prende con uno snap ad oggetto o si digita. Come in AutoCAD con l'input dinamico attivo, un punto digitato dopo il primo è misurato dall'ultimo, quindi `80,0` disegna 80 lungo X e la cronologia lo scrive `@80,0`; un numero da solo è una distanza lungo la direzione del cursore, e `<30` vincola il punto successivo a 30°. Invio o un clic destro al primo punto prosegue dalla fine dell'ultima linea, polilinea o arco, tangente a un arco e chiedendo solo la lunghezza. Qualunque sia il numero di segmenti disegnati, un solo U annulla l'intero comando.

## Options

### Undo

Annulla l'ultimo segmento e chiede di nuovo dal punto precedente. Senza più segmenti, dice <Message id="allLineSegmentsUndone" /> e chiede di nuovo il primo punto.

### Close

Offerta dal secondo segmento in poi: disegna l'ultimo segmento fino al primo punto e termina il comando, chiudendo la forma.

## Missing

Tangent o Perpendicular digitati al primo punto aspettano il successivo (uno snap differito), come in AutoCAD, ma solo su linee, cerchi e archi, non sul segmento di una polilinea, su un'ellisse o su una spline, e due Perpendicular differiti non vengono risolti.

## Questions

### Come si chiama il comando LINE in italiano?

LINEA, alias `L`, poi Invio o barra spaziatrice. Come in AutoCAD in italiano, il nome inglese funziona anche con il trattino basso davanti: `_LINE`.

### Come si disegna una linea con un angolo e una lunghezza?

Indica il primo punto, poi digita il successivo come lunghezza e angolo: `@100<30` disegna 100 a 30°. Oppure attiva il puntamento polare, segui la sua guida a quell'angolo e digita solo la lunghezza.

### Come si prosegue dall'ultima linea disegnata?

Avvia LINEA e premi Invio al primo punto: parte dalla fine dell'ultima linea, polilinea o arco. Da un arco, la linea prosegue tangente ad esso e LINEA chiede solo la sua lunghezza. Senza nulla da cui proseguire, dice <Message id="noLineOrArcToContinue" />.

### Perché la mia linea è fatta di pezzi separati?

Ogni segmento che LINEA disegna è una linea a sé, come in AutoCAD. Per un solo oggetto, disegna con <Command id="PLINE" />, oppure unisci le linee dopo con <Command id="JOIN" />.
