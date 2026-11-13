---
title: "Comando PROPRIETA (PROPERTIES) in AutoCAD"
description: "La tavolozza PROPRIETA (PROPERTIES, Ctrl+1) di AutoCAD in italiano: righe Generale e Geometria, *VARIE*, un tipo di oggetto alla volta. Provala online."
figure: "Un cerchio selezionato alla richiesta Comando, con i grip visibili, poi PROPRIETA: la tavolozza si apre accanto al disegno sulle righe del cerchio."
sourceHash: "14d097ac5b0b"
---

PROPRIETA (PROPERTIES) apre la tavolozza Proprietà. Come in AutoCAD è una tavolozza, non una finestra di dialogo: resta aperta accanto al disegno, qui come scheda del pannello delle tavolozze, mentre selezioni e disegni, finché <Command id="PROPERTIESCLOSE" /> non la chiude. Ctrl+1 la mostra e la nasconde e, digitato con un apostrofo, `'PROPERTIES`, la apre all'interno di un comando in esecuzione. Su una finestra larga è aperta fin dall'inizio.

Con degli oggetti selezionati ne mostra le proprietà e puoi cambiarne una digitando o scegliendo un nuovo valore nella sua riga. Generale viene per prima, nell'ordine di AutoCAD: Colore, Layer, Tipo di linea, Spessore di linea e Spessore, con `*VARIE*` dove gli oggetti selezionati differiscono. Sotto ci sono le righe proprie di ciascun tipo: punto iniziale e finale, lunghezza e angolo di una linea; centro, raggio, diametro, circonferenza e area di un cerchio; quelle di un arco, di un'ellisse, i vertici e gli spessori di una polilinea, i punti di una spline, quelle di un testo, di un riferimento di blocco. Le coordinate sono nell'UCS corrente e le righe che si limitano a riportare un valore, come la Lunghezza di una linea, sono in grigio. L'elenco a discesa in alto riporta `Tutti` e ogni tipo con il suo numero: sceglilo per vedere e modificare solo quel tipo. Senza selezione, Generale mostra il layer, il colore, il tipo di linea e lo spessore di linea correnti, che imposti lì per i nuovi oggetti. Ogni modifica è un solo passaggio che <Command id="U" /> annulla.

## Missing

In Generale, Scala del tipo di linea per più oggetti insieme o, senza selezione, per i nuovi oggetti (CELTSCALE); Stile di stampa, Trasparenza e Collegamento ipertestuale, e Materiale. Le righe di geometria di più oggetti dello stesso tipo insieme, il contenuto di un testo e i valori degli attributi non si possono modificare qui. Selezione rapida, l'interruttore PICKADD, il nascondimento automatico, l'ancoraggio e lo spostamento libero della tavolozza.

## Questions

### Qual è l'alias di PROPRIETA in AutoCAD?

Ctrl+1, che nasconde di nuovo la tavolozza. Digitato: `PR`, `CH` o `PRO`, poi Invio o barra spaziatrice. Funziona anche il nome completo, e `_PROPERTIES` in qualsiasi lingua di AutoCAD.

### La tavolozza Proprietà è sparita: come la riapro?

Premi Ctrl+1 o digita `PR`: la tavolozza ricompare, come scheda del pannello delle tavolozze accanto al disegno. Ctrl+1 premuto mentre è visibile la nasconde, ed è spesso così che è sparita.

### Come cambio le proprietà di più oggetti insieme?

Selezionali tutti, poi cambia la riga: ogni oggetto selezionato assume il nuovo valore. Una riga i cui valori differiscono riporta `*VARIE*` finché non la imposti. Per cambiare solo i cerchi, per esempio, tra quelli selezionati, scegli quel tipo nell'elenco a discesa in alto.

### Qual è la differenza tra PROPRIETA e CORRISPROP?

PROPRIETA mostra e imposta i valori degli oggetti selezionati. <Command id="MATCHPROP" /> li copia da un oggetto ad altri, senza digitare alcun valore.
