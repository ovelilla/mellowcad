---
title: "Comando DIMDIAMETRO (DIMDIAMETER) in AutoCAD"
description: "Come DIMDIAMETRO (DIMDIAMETER, alias DDI) di AutoCAD quota un cerchio o un arco: selezionalo, poi posiziona il diametro dentro o fuori. Provalo."
figure: "Un cerchio grande quotato all'interno e uno piccolo all'esterno: ogni cerchio selezionato, poi il testo posizionato."
sourceHash: "76537f5f9854"
---

DIMDIAMETRO quota il diametro di un cerchio, di un arco o del segmento ad arco di una polilinea, con le richieste di <Command id="DIMRADIUS" />: seleziona la curva, e la riga di comando dice subito la misura; poi posiziona la quota, e il comando termina. Il suo testo è il diametro preceduto dal segno di diametro. Posizionata dentro il cerchio, una linea va dal testo a una punta di freccia sul bordo; posizionata fuori, la linea attraversa il cerchio da bordo a bordo, con la punta di freccia lontana che punta all'interno da un breve tratto, come la disegna ISO-25.

## Options

### Text

Chiede il testo da scrivere al posto della misura, che offre come predefinito: Invio conserva la misura. In ciò che digiti, `<>` sta per la misura con il suo segno, quindi `<> THRU` scrive il diametro seguito da THRU.

### Angle

Chiede l'angolo del testo, che è poi disegnato a quell'angolo, con il suo centro sulla linea, e la linea si ferma ad esso. 0 lo riporta lungo la linea.

## Missing

Testo multilinea: il testo di una quota è una sola riga, impostata con <Keyword id="Text" /> alla riga di comando, mai nell'editor di testo. Il segno è disegnato Ø, dove AutoCAD scrive ∅: il carattere del disegno non ha ∅. Su un arco, le punte di freccia restano tra i suoi estremi, dove AutoCAD disegna una linea di estensione dell'arco. Come con <Command id="DIMRADIUS" />, una curva dentro un riferimento a blocco non si può selezionare, le linee d'asse dello stile non sono disegnate e le sue impostazioni per il testo fuori dalla curva non sono offerte. Una quota non è associativa: non segue la curva che misura.

## Questions

### Qual è la scorciatoia di DIMDIAMETRO in AutoCAD?

`DDI`, poi Invio o barra spaziatrice. Funziona anche il nome completo, e `_DIMDIAMETER` in tutte le lingue di AutoCAD.

### Come si quota un foro piccolo?

Posiziona il testo fuori dal cerchio: la linea di quota attraversa allora il foro con una punta di freccia per lato, e il testo sta lontano da essa. All'interno, il testo ha bisogno di spazio dentro il cerchio.

### DIMDIAMETRO può quotare un arco?

Sì: un arco o il segmento ad arco di una polilinea, come un cerchio, e riporta il diametro del cerchio dell'arco. Qualsiasi altra cosa dice <Message id="notCircleOrArc" /> e chiede di nuovo.

### Come si aggiunge THRU o una nota a una quota di diametro?

Scegli <Keyword id="Text" /> prima di posizionarla e digita `<> THRU`: `<>` è la misura con il suo segno. Una volta posizionata, Sostituzione testo della tavolozza Proprietà la cambia.
