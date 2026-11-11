---
title: "Comando DIMRAGGIO (DIMRADIUS) in AutoCAD"
description: "Come funziona DIMRAGGIO (DIMRADIUS, alias DRA) di AutoCAD in italiano: quota il raggio di un cerchio, un arco o un raccordo. Provalo gratis nel browser."
figure: "Lo spigolo arrotondato di una piastra quotato all'esterno e il suo foro all'interno: ogni curva selezionata, poi il testo posizionato."
sourceHash: "6b1cdea584be"
---

DIMRAGGIO (DIMRADIUS in inglese) quota il raggio di un cerchio, di un arco o del segmento ad arco di una polilinea. Seleziona la curva e la riga di comando scrive subito la misura; poi posiziona la quota e il comando termina. Come in AutoCAD, il suo testo è il raggio preceduto da una R, su una linea che segue un raggio e finisce con una freccia sulla curva, all'interno o all'esterno della curva a seconda di dove la posizioni. All'esterno la linea prosegue attraverso la curva fino al centro, come la disegna ISO-25.

## Options

### Text

Chiede il testo da scrivere al posto della misura, che propone come predefinita: Invio mantiene la misura. In quello che digiti, `<>` sta per la misura con la sua R, quindi `<> TYP` scrive `R10 TYP` per un raggio di 10.

### Angle

Chiede l'angolo del testo, che viene disegnato con quell'angolo, con il centro sulla linea, e la linea si ferma al testo. 0 lo rimette lungo la linea.

## Missing

TESTOM: il testo di una quota è su una sola riga, impostato con <Keyword id="Text" /> nella riga di comando, mai nell'editor di testo. Su un arco la freccia resta tra le sue estremità, dove AutoCAD disegna una linea di estensione ad arco per una quota posizionata oltre. Una curva dentro un riferimento di blocco non si può selezionare. Gli assi del centro dello stile (una dimensione del centro negativa) non vengono disegnati e le sue impostazioni per il testo fuori dalla curva non sono disponibili: il testo segue sempre la linea, senza tratto di raccordo, come lo disegna ISO-25. Una quota non è associativa: non segue la curva che misura.

## Questions

### Come si chiama il comando DIMRADIUS in italiano?

DIMRAGGIO, alias `DRA`, poi Invio o barra spaziatrice. Come in AutoCAD in italiano, il nome inglese funziona anche con il trattino basso davanti: `_DIMRADIUS`.

### Come si quota un raccordo o uno spigolo arrotondato?

Seleziona l'arrotondamento: un raccordo è un arco, o il segmento ad arco di una polilinea, come gli spigoli che <Command id="RECTANG" /> arrotonda con la sua opzione <Keyword command="RECTANG" id="Fillet" />, e DIMRAGGIO accetta l'uno e l'altro.

### Perché non riesco a selezionare l'oggetto da quotare?

DIMRAGGIO accetta un cerchio, un arco o il segmento ad arco di una polilinea, anche su un layer bloccato. Qualunque altro oggetto, un'ellisse compresa, mostra <Message id="notCircleOrArc" /> e la richiesta si ripete; una curva dentro un riferimento di blocco non si può ancora selezionare.

### Come aggiungo del testo a una quota di raggio?

Scegli <Keyword id="Text" /> prima di posizionarla e digita `<> TYP`: `<>` è la misura con la sua R, quindi la quota mostra `R10 TYP`. Una volta posizionata, la riga Modifica locale al testo della tavolozza Proprietà la cambia.
