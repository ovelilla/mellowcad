---
title: "Comando STILE (STYLE) in AutoCAD: stili di testo"
description: "Come STILE (STYLE, alias ST) di AutoCAD gestisce gli stili di testo: nuovo, rinomina, elimina, imposta corrente, altezza fissa, e TESTO e TESTOM. Provalo."
figure: "Una targhetta: STILE, poi TESTO, il cui Stile ? elenca lo stile del disegno, Standard in Arial, e il nome della targhetta scritto con esso."
sourceHash: "5e9a49c82ada"
---

STILE (STYLE) gestisce gli stili di testo del disegno: ciò con cui si scrive un testo. Ogni testo, testo multilinea e attributo ha uno stile, e i nuovi prendono lo stile corrente, Standard in un nuovo disegno. STILE apre la finestra Stile di testo, come in AutoCAD. Una selezione fatta prima viene scartata, come la scarta la finestra, e digitato con un apostrofo all'interno di un comando, `'STILE`, si apre senza terminare quel comando, che prosegue una volta chiusa la finestra.

La finestra indica lo stile corrente ed elenca gli stili, tutti o solo quelli in uso. Nuovo... chiede un nome, proponendo `style1`, `style2`… il primo libero, e crea una copia dello stile selezionato, corrente. Imposta corrente rende corrente lo stile selezionato; F2 ne modifica il nome, e un nome già in uso, indipendentemente da maiuscole e minuscole, viene rifiutato, come lo rifiuta AutoCAD. Elimina rimuove uno stile, ma mai Standard, lo stile corrente o uno in uso. Altezza dà a uno stile un'altezza fissa, applicata con Applica: 0, il valore predefinito, la lascia libera, quindi <Command id="TEXT" /> ne chiede una ogni volta; con un'altezza impostata, TESTO non la chiede. Annulla scarta un'altezza non applicata, e diventa Chiudi appena qualcosa è cambiato. Tutto ciò che si fa nella finestra è un solo passaggio che <Command id="U" /> annulla. Con dei testi selezionati, la riga Stile della tavolozza Proprietà dà loro un altro stile, in un solo passaggio.

## Missing

L'anteprima della finestra. Font, stile del font e big font, fattore di larghezza, angolo di obliquità, e gli effetti Capovolto, All'indietro e Verticale: ogni stile è disegnato in Arial, non inclinato, con larghezza 1. Gli stili annotativi, e lo stile Annotativo che un nuovo disegno di AutoCAD contiene accanto a Standard. `-STYLE`, che chiede tutto alla riga di comando.

## Questions

### Qual è l'alias di STILE in AutoCAD?

`ST`, poi Invio o barra spaziatrice; anche `DDSTILE`. `_STYLE` funziona in qualsiasi lingua di AutoCAD.

### Come si cambia lo stile di testo in AutoCAD?

Per i nuovi testi, rendi corrente lo stile con Imposta corrente nella finestra che STILE apre, oppure con l'opzione <Keyword command="TEXT" id="Style" /> di <Command id="TEXT" />. Per il testo già scritto, selezionalo e scegli lo stile nella riga Stile della tavolozza Proprietà.

### Come si cambia il font di uno stile di testo?

In AutoCAD, in Nome font della finestra Stile di testo. Non ancora qui: ogni stile è disegnato in Arial, e uno stile differisce solo per il nome e per l'altezza.

### Perché TESTO non chiede l'altezza?

Lo stile corrente ha un'altezza propria. Imposta la sua altezza a 0 nella finestra Stile di testo, poi Applica, e <Command id="TEXT" /> chiede di nuovo l'altezza, proponendo l'ultima usata.
