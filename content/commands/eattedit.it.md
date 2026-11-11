---
title: "Comando EATTEDIT in AutoCAD"
description: "Come EATTEDIT di AutoCAD in italiano modifica i valori degli attributi di un blocco nell'Editor attributi avanzato, con un doppio clic. Provalo online."
figure: "Due scrivanie, riferimenti a un blocco con gli attributi NUM e PART: EATTEDIT seleziona la seconda e il suo campo PART diventa B-200."
sourceHash: "3517c89fd5da"
---

EATTEDIT apre l'Editor attributi avanzato di AutoCAD per un riferimento di blocco: ti chiede di selezionare un blocco, poi mostra un campo per ciascuno dei suoi attributi, con l'etichetta del tag e riempito con il suo valore, come li elenca la scheda Attributo dell'editor. Riscrivi i valori, con Tab per passare da un campo all'altro, e Invio li applica in un solo passo che <Command id="U" /> annulla; Esc non cambia nulla.

Un doppio clic su un riferimento con attributi esegue EATTEDIT, come in AutoCAD: la riga di comando lo scrive con il punto del doppio clic come risposta e la finestra si apre subito. La selezione prende l'oggetto sotto il riquadro: tutto ciò che non è un riferimento di blocco viene rifiutato, come un blocco senza attributi, e la richiesta si ripete. Cambia solo il riferimento selezionato; la definizione del blocco e gli altri suoi riferimenti mantengono i loro valori.

## Missing

La scheda Opzioni testo dell'editor (stile, giustificazione, altezza, rotazione, fattore di larghezza e il resto del testo di ogni attributo) e la sua scheda Proprietà (layer, tipo di linea, colore, spessore di linea), e il suo pulsante Seleziona blocco. ATTIPEDIT, che modifica un attributo sul posto, e il suo Ctrl+doppio clic. Il grip di un attributo sbloccato su un riferimento e le righe degli attributi della tavolozza Proprietà. `-ATTEDIT`.

## Questions

### Come si apre l'Editor attributi avanzato in AutoCAD?

Fai doppio clic su un riferimento di blocco che ha attributi, oppure digita `EATTEDIT` e selezionalo. Il comando ha lo stesso nome in AutoCAD in italiano, e `_EATTEDIT` funziona in tutte le lingue di AutoCAD.

### Come si cambia il valore di un attributo in AutoCAD?

Fai doppio clic sul blocco, digita il nuovo valore nel campo dell'attributo e premi Invio. Ogni riferimento mantiene i propri valori: cambiarne uno lascia gli altri come sono.

### Perché il doppio clic non modifica gli attributi del blocco?

EATTEDIT si apre per un riferimento il cui blocco contiene attributi, e un blocco creato senza di essi non ne ha: definiscili con <Command id="ATTDEF" /> e selezionali insieme agli altri oggetti quando crei il blocco. Se il valore di un attributo non compare, controlla <Command id="ATTDISP" />, che può nascondere gli attributi invisibili o tutti.

### Qual è la differenza tra EATTEDIT e ATTEDIT?

Modificano gli stessi valori. EATTEDIT etichetta ogni campo con il suo tag, come fa la scheda Attributo dell'Editor attributi avanzato; <Command id="ATTEDIT" /> con la sua richiesta, come fa la finestra Modifica attributi. In AutoCAD, EATTEDIT modifica anche le opzioni di testo e le proprietà di ogni attributo.
