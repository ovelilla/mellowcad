---
title: "Comando UNITA (UNITS) in AutoCAD"
description: "Come funziona UNITA (UNITS, alias UT) di AutoCAD: la finestra Unità disegno, la precisione da 0 a 8 decimali, la scala di inserimento in mm, cm o m."
figure: "UNITA aperto su una piastra di 100 per 60, poi ID sul suo angolo opposto: le coordinate alla precisione del disegno, due decimali."
sourceHash: "1fd1973c3ebf"
---

UNITA (UNITS) apre la finestra Unità disegno, che imposta come il disegno scrive le lunghezze e cosa rappresenta un'unità di disegno. Come in AutoCAD la finestra è modale: il comando dura finché OK o Annulla non la chiude, la modifica di OK è un solo passaggio che <Command id="U" /> annulla, e Annulla o Esc non cambiano nulla. Digitato con un apostrofo, `'UNITS`, si apre all'interno di un comando in esecuzione, che prosegue una volta chiusa la finestra. Lo aprono anche le unità della barra di stato e Unità disegno del menu dell'applicazione.

Il Tipo di lunghezza è Decimale, e la sua Precisione, da 0 a 8 cifre decimali, è quella con cui si scrive ogni lunghezza: coordinate, distanze, aree, i valori predefiniti proposti nelle richieste. Un nuovo disegno parte qui con due decimali, dove il modello metrico di AutoCAD parte con quattro. La Scala di inserimento indica cos'è un'unità di disegno, millimetri, centimetri o metri; la barra di stato e l'input dinamico la mostrano. Esempio di output mostra un punto alla precisione scelta.

## Missing

Gli altri tipi di lunghezza, Architettonico, Ingegneristico, Frazionario e Scientifico, e la notazione scientifica per una lunghezza enorme. Il gruppo Angolo: gli angoli sono gradi decimali, in senso antiorario da est, alla precisione che AUPREC imposta, digitati. Le altre unità di inserimento, tra cui pollici e piedi; Illuminazione; Direzione; e -UNITS, la forma da riga di comando.

## Questions

### Qual è l'alias di UNITA in AutoCAD?

`UT`, poi Invio o barra spaziatrice; anche `DDUNITS`. Funziona anche il nome completo, e `_UNITS` in qualsiasi lingua di AutoCAD.

### Come si impostano le unità del disegno in millimetri o metri?

Apri UNITA e scegli Millimetri, Centimetri o Metri in Scala di inserimento. Un'unità di disegno è sempre un'unità: disegna una parete di 5 m come 5 in metri o 5000 in millimetri. La scelta stabilisce quale, e la barra di stato e l'input dinamico la mostrano.

### Come si cambia il numero di decimali?

Scegli la Precisione in UNITA, da `0` a `0.00000000`. Cambia come si scrivono le lunghezze, mai la geometria: una linea disegnata lunga 10,125 resta lunga 10,125 a qualsiasi precisione.

### Perché le mie quote non seguono la precisione impostata in UNITA?

Una quota scrive il suo valore con la precisione del proprio stile di quota, non con quella del disegno. Cambiala in <Command id="DIMSTYLE" />, in Unità primarie.

### Si può disegnare in piedi e pollici?

Non ancora: le lunghezze sono decimali, e la scala di inserimento offre millimetri, centimetri e metri. Le unità architettoniche e ingegneristiche mancano.
