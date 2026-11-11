---
title: "Comando ANNULLA (UNDO) in AutoCAD"
description: "Come funziona ANNULLA (UNDO) di AutoCAD in italiano: un numero di passi, Segno e Indietro, Inizio e Fine, e la differenza da U e Ctrl+Z. Provalo."
before: "Una piastra con due fori e una linea che l'attraversa, disegnate da quattro comandi: RETTANGOLO, CERCHIO due volte e LINEA."
figure: "ANNULLA 2: gli ultimi due comandi vengono annullati, la linea e il secondo foro, e la piastra conserva il suo primo foro."
sourceHash: "b4fed2178b6a"
---

ANNULLA (UNDO) annulla comandi. Un passo è un intero comando: tutto ciò che ha disegnato una LINEA se ne va insieme, quanti che fossero i segmenti, e così ciò che un comando ha impostato, come LTSCALE. ANNULLA scrive le sue impostazioni correnti, poi chiede il numero di operazioni da annullare o un'opzione; Invio ne annulla una. Scrive i nomi dei comandi annullati su una riga, `CIRCLE LINE`, e <Message id="everythingUndone" /> quando finiscono; dopo, <Message id="nothingToUndo" />. Anche un comando che non ha cambiato nulla, come ID o LIST, è un passo, e lo è ciò che ZOOM e PAN hanno fatto alla vista.

<Command id="U" /> è la forma breve: un passo indietro, nessuna domanda. Ctrl+Z al prompt Comando esegue U; all'interno di un comando è l'Annulla proprio di quel comando, come lo digita la macro di AutoCAD: LINEA annulla il suo ultimo segmento e prosegue. <Command id="REDO" />, subito dopo, ripristina ciò che l'ultimo U o ANNULLA aveva annullato.

## Options

### Auto

Chiede <Keyword id="ON" /> o <Keyword id="OFF" />, proponendo l'impostazione corrente, che la riga delle impostazioni mostra poi. In AutoCAD ne fa un solo passo dei comandi che una voce di menu esegue; qui nessun menu ne esegue più di uno, quindi non unisce nulla.

### Control

Chiede quanto annullamento conservare, <Keyword id="All" /> per impostazione predefinita. <Keyword id="None" /> elimina ogni passo conservato e disattiva l'annullamento: U dice allora <Message id="uDisabled" />, e ANNULLA chiede subito Controllo. <Keyword id="One" /> conserva solo l'ultimo passo, e ANNULLA chiede poi 1 o Controllo. All riattiva l'annullamento completo. <Keyword id="Combine" /> dice se ZOOM e PAN consecutivi sono un solo passo, e <Keyword id="Layer" /> se lo sono le modifiche consecutive in Gestore proprietà layer, Sì per impostazione predefinita per entrambi. Le impostazioni sono del disegno, e non vengono salvate con esso: un disegno nuovo o aperto parte da All, Combine Sì e Layer Sì.

### BEgin

Avvia un gruppo: i comandi eseguiti fino a <Keyword id="End" /> formano un solo passo, che U annulla per intero e chiama `GROUP` insieme a essi. Mentre un gruppo è aperto, U, un numero e Back si fermano al suo inizio. BEgin con un gruppo aperto lo chiude prima.

### End

Chiude il gruppo che BEgin ha aperto.

### Mark

Lascia un segno nei passi. Back, U e un numero si fermano a esso, con <Message id="markEncountered" />.

### Back

Annulla ogni passo fino all'ultimo segno, e il segno con essi. Senza segno, chiede se annullare tutto, Sì per impostazione predefinita.

## Missing

Auto non unisce nulla, dato che nessun menu qui esegue più di un comando. Combine e Layer durano per la sessione del browser, dove AutoCAD le conserva da una sessione all'altra. I pulsanti Annulla e Ripeti della barra superiore non scrivono nulla nella cronologia, dove la barra di accesso rapido di AutoCAD scrive la propria. Anche Ctrl+Maiusc+Z ripristina, in silenzio, anche se AutoCAD non vi associa nulla.

## Questions

### Qual è l'alias di ANNULLA in AutoCAD?

Ctrl+Z, oppure il comando U e Invio: un passo indietro. ANNULLA non ha alias; digitalo per intero per un numero di passi o per le sue opzioni, oppure `_UNDO` in qualsiasi lingua di AutoCAD.

### Qual è la differenza tra U e ANNULLA?

<Command id="U" /> annulla l'ultimo comando e non chiede nulla. ANNULLA chiede quanti annullarne, e ha Segno e Indietro per tornare a un punto che hai segnato, Inizio e Fine per fare di più comandi un solo passo, e Controllo per limitare l'annullamento o disattivarlo.

### Come si annullano più comandi insieme?

Digita `ANNULLA` e il numero di comandi, come `5`. Oppure scegli <Keyword id="Mark" /> prima di una serie che potresti voler scartare, e <Keyword id="Back" /> per tornare a essa.

### Perché il comando ANNULLA non funziona?

L'annullamento è stato disattivato con Controllo <Keyword id="None" />: U lo dice, e ANNULLA chiede Controllo. Rispondi <Keyword id="All" /> per riattivarlo. I passi precedenti sono persi.

### Come si ripristina ciò che si è annullato?

<Command id="REDO" /> subito dopo U o ANNULLA lo ripristina per intero. Ctrl+Y ripristina un passo alla volta.
