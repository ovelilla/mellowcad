---
title: "Comando CORRISPROP (MATCHPROP) in AutoCAD"
description: "Come funziona CORRISPROP (MATCHPROP, alias CRP) di AutoCAD in italiano: scegli un oggetto sorgente, poi quelli che ne prendono layer, colore e tipo di linea."
figure: "Una piastra e il suo foro, un asse verticale rosso e Center sul suo layer, e una linea orizzontale sul layer 0 che CORRISPROP trasforma nello stesso asse."
sourceHash: "603d5ab849b1"
---

CORRISPROP (MATCHPROP in inglese) copia le proprietà di un oggetto su altri, il pennello Corrispondenza proprietà di AutoCAD. Seleziona l'oggetto sorgente, o selezionane uno prima del comando; ne accetta uno anche su un layer bloccato. Poi indica quali proprietà copia, `Impostazioni correnti attive:` e l'elenco, e chiede gli oggetti di destinazione: ogni selezione o finestra li dipinge subito, finché Invio termina. Una destinazione su un layer bloccato viene lasciata com'è, con <Message id="matchpropLockedDestination" />. Il cursore diventa il pennello di AutoCAD, e l'intera operazione è un solo passaggio di annullamento per <Command id="U" />. Digitato con un apostrofo, `'CORRISPROP`, viene eseguito dentro un altro comando.

Copia ciò che le Impostazioni proprietà prevedono per impostazione predefinita: il layer, il colore e lo spessore di linea; il tipo di linea, tranne che sui tratteggi, sui testi multilinea e sulle definizioni di attributo; l'altezza; tra testi lo stile, l'altezza e la rotazione, e da un testo di una riga a un altro anche la giustificazione; tra quote lo stile di quota; tra tratteggi il modello, la scala e l'angolo, ma non l'origine.

## Missing

L'opzione Impostazioni e la sua finestra Impostazioni proprietà: ogni proprietà che conosce viene sempre copiata, e la prima richiesta non elenca `[Impostazioni]`. Scala del tipo di linea, trasparenza e stile di stampa, che qui gli oggetti non hanno; le larghezze di una polilinea, il fattore di larghezza e l'angolo di inclinazione di un testo, e le proprietà annotative. L'anteprima della modifica sotto il cursore, come in AutoCAD.

## Questions

### Come si chiama il comando MATCHPROP in italiano?

CORRISPROP, alias `CRP`, poi Invio o barra spaziatrice; anche `COPIAPROP`, mentre l'alias inglese `MA` in AutoCAD in italiano non esiste. Come in AutoCAD in italiano, il nome inglese funziona anche con il trattino basso davanti: `_MATCHPROP`.

### Come si copiano le proprietà di una linea su un'altra?

Avvia CORRISPROP, seleziona la linea di cui vuoi le proprietà, poi seleziona le linee che devono prenderle e premi Invio. Prendono il suo layer, il suo colore, il suo tipo di linea e il suo spessore di linea.

### Perché Corrispondenza proprietà non funziona?

Una destinazione su un layer bloccato non viene cambiata: sblocca prima il layer. Una proprietà viene copiata solo tra oggetti che la possiedono: uno stile di quota va solo alle quote, uno stile di testo solo ai testi, un modello solo ai tratteggi. E un tipo di linea non viene copiato su un tratteggio o su un testo multilinea, come in AutoCAD.

### Come si fanno corrispondere le proprietà di una quota o di un tratteggio?

Seleziona una quota come sorgente e altre quote come destinazioni: prendono il suo stile di quota, con il suo layer e il suo colore. Un tratteggio passa il suo modello, la sua scala e il suo angolo ad altri tratteggi, e ciascuno mantiene la propria origine.
