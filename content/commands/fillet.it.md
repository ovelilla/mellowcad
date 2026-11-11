---
title: "Comando RACCORDO (FILLET) in AutoCAD"
description: "Come funziona RACCORDO (FILLET, alias RA) di AutoCAD in italiano: raggio, Polilinea, Multiplo, raggio 0 per lo spigolo vivo, richiesta per richiesta. Provalo."
figure: "Quattro linee, poi Raggio 15 e Multiplo: due spigoli arrotondati, due lasciati vivi."
sourceHash: "f97d737f74a9"
---

RACCORDO (FILLET in inglese) arrotonda lo spigolo tra due oggetti con un arco del raggio che indichi, tagliando o estendendo ciascun oggetto fino ad esso. La sua prima riga indica la modalità e il raggio corrente; poi selezioni il primo oggetto e il secondo, ciascuno dalla parte da mantenere, e il comando termina. Accetta linee, archi, cerchi, ellissi, spline e i segmenti di una polilinea 2D. Due linee non devono per forza incontrarsi: vengono estese fino all'arco, come in AutoCAD. Con raggio 0, o tenendo premuto Maiusc alla seconda selezione, crea invece uno spigolo vivo.

## Options

### Undo

Annulla l'ultimo raccordo, <Keyword id="Polyline" /> o raggio indicato in questo RACCORDO, uno alla volta. Quando non resta nulla da annullare mostra <Message id="commandCompletelyUndone" />

### Polyline

Chiede una polilinea 2D e arrotonda ogni spigolo in cui due dei suoi segmenti si incontrano, in un solo passo, poi indica quanti ne ha raccordati e quanti ha saltato, perché paralleli o troppo corti per il raggio. Un rettangolo disegnato con <Command id="RECTANG" /> è una polilinea di questo tipo.

### Radius

Chiede il raggio, proposto anche alla seconda richiesta. È quello del disegno (FILLETRAD): il RACCORDO successivo parte da esso e viene salvato con il disegno. 0 crea spigoli vivi; un raggio negativo viene rifiutato.

### Multiple

Chiede di nuovo il primo oggetto dopo ogni raccordo, così arrotondi spigolo dopo spigolo senza ricominciare, fino a Invio.

## Missing

Trim: gli oggetti vengono sempre tagliati o estesi fino all'arco, come con TRIMMODE 1, il valore predefinito di AutoCAD; No trim non è disponibile. L'arco non prende la scala del tipo di linea del secondo oggetto, perché qui nessun oggetto ne ha una propria. Prima del clic, la descrizione comandi mostra la richiesta invece del perché una coppia non si può raccordare, e nessun lucchetto contrassegna un oggetto su un layer bloccato. Alcune rare coppie di ellissi o spline finiscono diversamente: una spline chiusa con una linea a raggio 0, un arco che tocca soltanto l'offset di un'ellisse, e una coppia simile in un piano inclinato.

## Questions

### Come si chiama il comando FILLET in italiano?

RACCORDO, alias `RA`, poi Invio o barra spaziatrice; l'alias inglese `F` in AutoCAD in italiano non esiste. Come in AutoCAD in italiano, il nome inglese funziona anche con il trattino basso davanti: `_FILLET`.

### Come si raccordano due linee?

Scegli <Keyword id="Radius" />, digitalo, poi seleziona ogni linea dalla parte che vuoi mantenere. Le linee che non si incontrano vengono estese fino all'arco, e quelle che si incrociano vengono tagliate fino ad esso. Due linee parallele sono unite da una semicirconferenza, qualunque sia il raggio. Una linea e il segmento di una polilinea vengono uniti in una sola polilinea.

### Che cosa fa un raccordo di raggio 0?

Crea uno spigolo vivo: ogni linea viene tagliata o estesa finché si incontrano, e non viene disegnato nessun arco. Per fare un solo spigolo vivo senza cambiare il raggio, tieni premuto Maiusc mentre selezioni il secondo oggetto.

### Perché RACCORDO non funziona?

Il motivo è scritto nella riga di comando. <Message id="filletRadiusTooLarge" /> significa che l'arco non sta tra le linee; <Message id="segmentsNotConsecutive" /> che due segmenti della stessa polilinea sono troppo distanti; testi, blocchi, quote e tratteggi vengono rifiutati, gli oggetti a quote diverse risultano non complanari, e un oggetto su un layer bloccato non viene preso.

### Come si raccordano gli spigoli di un solido 3D?

Avvia <Command id="FILLETEDGE" />: scegli <Keyword command="FILLETEDGE" id="Radius" /> se il raggio non è quello che indica, seleziona gli spigoli del solido, poi premi Invio, e di nuovo Invio per accettare il raccordo. Funziona sui solidi 3D, che qui sono ancora parziali.
