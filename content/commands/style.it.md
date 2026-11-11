---
title: "Comando STILE (STYLE) in AutoCAD: stili di testo"
description: "Come STILE (STYLE, alias ST) di AutoCAD gestisce gli stili di testo: nuovo, rinomina, elimina, imposta corrente, altezza fissa, e TESTO e TESTOM. Provalo."
figure: "Una targhetta: STILE, poi TESTO, il cui Stile ? elenca lo stile del disegno, Standard in Arial, e il nome della targhetta scritto con esso."
sourceHash: "8c15a1a95e66"
---

STILE (STYLE) gestisce gli stili di testo del disegno: ciò con cui si scrive un testo. Ogni testo, testo multilinea e attributo ha uno stile, e i nuovi prendono lo stile corrente, Standard in un nuovo disegno. STILE di AutoCAD apre la finestra Stile di testo; MellowCAD non ne ha ancora una, quindi STILE apre la tabella dei testi della tavolozza Stili, dove ci sono anche gli stili di quota di <Command id="DIMSTYLE" />. Una selezione fatta prima viene scartata, come la scarta la finestra, e digitato con un apostrofo all'interno di un comando, `'STILE`, si apre senza terminare quel comando.

La tabella elenca gli stili con quello corrente evidenziato. Nuovo crea una copia dello stile selezionato, chiamata `style1`, `style2`… il primo nome libero, e la rende corrente. Imposta corrente rende corrente uno stile; il suo nome si può riscrivere, e un nome già in uso, indipendentemente da maiuscole e minuscole, viene rifiutato, come lo rifiuta AutoCAD. Elimina rimuove uno stile, ma mai Standard, lo stile corrente o uno in uso. Altezza dà a uno stile un'altezza fissa: 0, il valore predefinito, la lascia libera, quindi <Command id="TEXT" /> ne chiede una ogni volta; con un'altezza impostata, TESTO non la chiede. Ogni modifica è un passaggio che <Command id="U" /> annulla. Con dei testi selezionati, la riga Stile della tavolozza Proprietà dà loro un altro stile, in un solo passaggio.

## Missing

La finestra Stile di testo e la sua anteprima: STILE apre invece la tavolozza Stili. Font, stile del font e big font, fattore di larghezza, angolo di obliquità, e gli effetti Capovolto, All'indietro e Verticale: ogni stile è disegnato in Arial, non inclinato, con larghezza 1. Gli stili annotativi, e lo stile Annotativo che un nuovo disegno di AutoCAD contiene accanto a Standard. `-STYLE`, che chiede tutto alla riga di comando.

## Questions

### Qual è l'alias di STILE in AutoCAD?

`ST`, poi Invio o barra spaziatrice; anche `DDSTILE`. `_STYLE` funziona in qualsiasi lingua di AutoCAD.

### Come si cambia lo stile di testo in AutoCAD?

Per i nuovi testi, rendi corrente lo stile nella tavolozza Stili che STILE apre, oppure con l'opzione <Keyword command="TEXT" id="Style" /> di <Command id="TEXT" />. Per il testo già scritto, selezionalo e scegli lo stile nella riga Stile della tavolozza Proprietà.

### Come si cambia il font di uno stile di testo?

In AutoCAD, in Nome font della finestra Stile di testo. Non ancora qui: ogni stile è disegnato in Arial, e uno stile differisce solo per il nome e per l'altezza.

### Perché TESTO non chiede l'altezza?

Lo stile corrente ha un'altezza propria. Imposta la sua altezza a 0 nella tavolozza Stili e <Command id="TEXT" /> chiede di nuovo l'altezza, proponendo l'ultima usata.
