---
title: "Comando EDITATT (ATTEDIT) in AutoCAD"
description: "Come funziona EDITATT (ATTEDIT, alias EA) di AutoCAD in italiano: cambiare i valori degli attributi di un riferimento di blocco, un campo per riga. Provalo."
figure: "Tre cartellini di porta, riferimenti a un blocco con l'attributo NUM: EDITATT sceglie l'ultimo, inserito come 2, e la sua finestra lo porta a 3."
sourceHash: "4a8ee28ecc53"
---

EDITATT cambia i valori degli attributi di un riferimento di blocco. Chiede di selezionare il riferimento, poi apre una finestra con un campo per ciascuno dei suoi attributi, etichettato con la richiesta dell'attributo e riempito con il suo valore, come la finestra Modifica attributi di AutoCAD. Riscrivi i valori, con Tab che passa da un campo al successivo, e Invio, l'OK di AutoCAD, li applica in un solo passo che <Command id="U" /> annulla; Esc, il suo Annulla, non cambia nulla.

La selezione prende l'oggetto sotto il riquadro. Tutto ciò che non è un riferimento di blocco è rifiutato, e lo è anche un riferimento il cui blocco non ha attributi, e la domanda si ripete; una selezione sul vuoto chiede di nuovo in silenzio. La definizione del blocco non cambia, né i suoi altri riferimenti: ciascuno contiene valori propri. <Command id="EATTEDIT" /> modifica gli stessi valori in una finestra etichettata con l'etichetta, e un doppio clic su un riferimento con attributi lo esegue.

## Missing

`-ATTEDIT`, la forma da riga di comando che modifica gli attributi uno a uno o in modo globale, e i suoi alias `-ATE` e `ATTE`. I pulsanti Precedente e Successivo di Modifica attributi, per un blocco con più attributi di quanti ne contenga una pagina, e la sua riga Nome blocco. ATTIPEDIT, che modifica un attributo sul posto, e il suo Ctrl+doppio clic. Il grip proprio di un attributo non bloccato su un riferimento, e le righe degli attributi della tavolozza Proprietà.

## Questions

### Qual è la scorciatoia di EDITATT in AutoCAD?

`EA`, poi Invio o barra spaziatrice; anche `DDATTE`. `_ATTEDIT` funziona in tutte le lingue di AutoCAD.

### Come si modificano gli attributi di un blocco in AutoCAD?

Digita `EA` e seleziona il riferimento, oppure fai doppio clic su di esso, che esegue <Command id="EATTEDIT" />. Cambia i valori nella finestra e premi Invio. Per cambiare gli attributi stessi, la loro etichetta, richiesta o posizione, modifica le definizioni e ridefinisci il blocco con <Command id="BLOCK" />.

### Perché EDITATT dice che il blocco non ha attributi modificabili?

Perché il blocco del riferimento selezionato non contiene attributi: EDITATT modifica i valori di un riferimento a un blocco che ne ha. Una definizione che non è ancora entrata in un blocco si modifica con <Command id="TEXTEDIT" />, con un doppio clic su di essa.

### Qual è la differenza tra EDITATT ed EATTEDIT?

Entrambi modificano i valori di un riferimento. La finestra di EDITATT etichetta ogni campo con la richiesta dell'attributo, come la finestra Modifica attributi di AutoCAD; quella di <Command id="EATTEDIT" />, l'Editor attributi avanzato, con la sua etichetta. In AutoCAD, EATTEDIT ha anche schede per le opzioni di testo e le proprietà di ogni attributo.
