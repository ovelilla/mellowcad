---
title: "Comando DIMANGOLO (DIMANGULAR) in AutoCAD"
description: "Come DIMANGOLO (DIMANGULAR, alias DAN) di AutoCAD misura gli angoli: due linee, un arco, un cerchio o tre punti, poi dove va l'arco. Provalo gratis nel browser."
figure: "Due linee che si incontrano a 30 gradi: ogni linea selezionata, poi l'arco di quota posizionato tra esse."
sourceHash: "30943abd60f6"
---

DIMANGOLO quota un angolo con un arco come linea di quota. Ciò che selezioni per primo decide il resto, come in AutoCAD: una linea chiede una seconda linea, anche due segmenti di una stessa polilinea; un arco è misurato da un estremo all'altro attorno al suo centro; un cerchio, dal punto in cui lo hai selezionato a un secondo punto che dai; e Invio chiede invece il vertice dell'angolo, poi i suoi due estremi. Poi posiziona l'arco: dove lo metti sceglie l'angolo misurato. Tra due linee è quello dei loro quattro settori che lo contiene; altrimenti l'angolo o, attraverso i suoi lati, l'angolo concavo oltre 180°. La riga di comando dice la misura in gradi, e il comando termina.

## Options

### Text

Chiede il testo da scrivere al posto della misura, che offre come predefinito: Invio conserva la misura. In ciò che digiti, `<>` sta per la misura.

### Angle

Chiede l'angolo del testo, che è poi disegnato a quell'angolo invece che lungo l'arco di quota. 0 lo riporta lungo l'arco.

## Missing

Testo multilinea: il testo di una quota è una sola riga, impostata con <Keyword id="Text" /> alla riga di comando. Quadrante, che blocca la quota a un settore così che il suo testo possa andare fuori di esso. Unità angolari diverse dai gradi decimali (DIMAUNIT). Una quota angolare non si può concatenare né spaziare: <Command id="DIMCONTINUE" />, <Command id="DIMBASELINE" /> e <Command id="DIMSPACE" /> prendono solo quelle lineari e allineate. Una linea o un arco dentro un riferimento a blocco non si può selezionare. Tra due linee, la quota conserva i punti in cui il suo arco le incontrava, non le linee: spostata poi, il suo arco conserva da lì le sue linee di estensione, mentre AutoCAD misura di nuovo rispetto alle linee. Una quota non è associativa: non segue gli oggetti che misura.

## Questions

### Qual è la scorciatoia di DIMANGOLO in AutoCAD?

`DAN`, poi Invio o barra spaziatrice. Funziona anche il nome completo, e `_DIMANGULAR` in tutte le lingue di AutoCAD.

### Come si quota un angolo maggiore di 180 gradi?

Premi Invio alla prima richiesta, dai il vertice e i due estremi, poi posiziona l'arco fuori dall'angolo tra essi: misura l'angolo concavo, 360° meno l'altro. Un arco o un cerchio funzionano allo stesso modo. Tra due linee l'angolo è sempre inferiore a 180°.

### Come si quota l'angolo di un arco?

Seleziona l'arco alla prima richiesta: il suo centro è il vertice e i suoi estremi le origini delle linee di estensione, quindi la domanda successiva è già dove posizionare la quota.

### Perché DIMANGOLO dice che le linee sono parallele?

Due linee parallele, o la stessa linea selezionata due volte, non fanno alcun angolo: <Message id="dimLinesParallel" />, e il comando termina.

### Come si cambiano i decimali di una quota angolare?

Nello stile di quota: <Command id="DIMSTYLE" /> (`D`) lo apre nella tavolozza Stili, dove la precisione angolare di Unità primarie li imposta, 0 in ISO-25. Ogni quota angolare in quello stile li segue.
