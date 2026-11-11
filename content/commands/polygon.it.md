---
title: "Comando POLIGONO (POLYGON) in AutoCAD"
description: "Come POLIGONO (POLYGON, alias PG) di AutoCAD in italiano disegna un poligono regolare: i lati, il centro, Inscritto o Circoscritto, o uno Spigolo."
figure: "Due cerchi di raggio 30, un esagono inscritto in uno e circoscritto all'altro, e un pentagono dal suo Spigolo."
sourceHash: "90e1cc9a53c4"
---

POLIGONO (POLYGON in inglese) disegna un poligono regolare, con ogni lato e ogni angolo uguali, come una sola polilinea chiusa. Chiede il numero di lati, da 3 a 1024, poi il centro e se il poligono è inscritto in un cerchio o circoscritto ad esso, poi il raggio di quel cerchio. Oppure viene costruito su uno dei suoi lati con <Keyword id="Edge" />. Il numero di lati e la scelta tra <Keyword id="Inscribed" /> e <Keyword id="Circumscribed" /> sono i valori predefiniti del POLIGONO successivo, in quel disegno. Un raggio digitato come numero disegna il lato inferiore orizzontale; uno indicato come punto, con un clic o digitato, imposta sia la dimensione sia la rotazione del poligono. Mentre indichi il raggio, il poligono segue il cursore, con una linea ambra tratteggiata dal centro.

## Options

### Edge

Al posto di un centro: indica le due estremità di un lato, e il poligono viene costruito in senso antiorario a partire da quel lato.

### Inscribed

I vertici stanno sul cerchio: il raggio va dal centro a un vertice. Il valore predefinito.

### Circumscribed

I lati toccano il cerchio nei loro punti medi: il raggio va dal centro al punto medio di un lato.

## Missing

Uno snap ruotato: un raggio digitato come numero disegna sempre il lato inferiore orizzontale rispetto all'UCS, dove AutoCAD lo ruota dell'angolo dello snap, SNAPANG.

## Questions

### Come si chiama il comando POLYGON in italiano?

POLIGONO, alias `PG`, poi Invio o barra spaziatrice; l'alias inglese `POL` in AutoCAD in italiano non esiste. Come in AutoCAD in italiano, il nome inglese funziona anche con il trattino basso davanti: `_POLYGON`.

### Come si disegna un esagono in AutoCAD?

Avvia POLIGONO, digita `6` per i lati, indica il centro, scegli <Keyword id="Inscribed" /> o <Keyword id="Circumscribed" />, e digita il raggio. Misurato tra i lati piani, un esagono circoscritto è largo il doppio del raggio che digiti.

### Qual è la differenza tra inscritto e circoscritto?

Con <Keyword id="Inscribed" />, i vertici del poligono toccano il cerchio, quindi sta al suo interno. Con <Keyword id="Circumscribed" />, i suoi lati toccano il cerchio, quindi il cerchio sta al suo interno. Con lo stesso raggio, il poligono circoscritto è il più grande.

### Come si disegna un poligono con una lunghezza del lato data?

Scegli <Keyword id="Edge" /> e indica le due estremità di un lato: `0,0`, poi la lunghezza digitata relativa al primo punto, come `40,0`. Gli altri lati seguono, in senso antiorario.
