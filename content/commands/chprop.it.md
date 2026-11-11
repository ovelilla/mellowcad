---
title: "Comando CAPROP (CHPROP) in AutoCAD"
description: "Come funziona CAPROP (CHPROP) di AutoCAD in italiano: scegli gli oggetti, poi cambia colore, layer, tipo e spessore di linea dalla riga di comando. Provalo."
figure: "CAPROP su una linea attraverso il foro di una piastra: colore 1 e tipo di linea Center, un asse, sul layer in cui si trovava."
sourceHash: "da2b2e65e05e"
---

CAPROP cambia le proprietà degli oggetti che selezioni, dalla riga di comando: le righe Generale della tavolozza Proprietà, chieste come richieste. Seleziona gli oggetti, o selezionali prima del comando, poi scegli una proprietà da cambiare; ne chiede una di nuovo dopo ciascuna, finché Invio termina. La richiesta di ogni proprietà offre il valore dell'insieme come predefinito, <Message id="varies" /> dove gli oggetti differiscono, e Invio lì lascia a ogni oggetto il suo. Ciò che imposti è applicato al termine del comando, quindi Esc lascia ogni oggetto com'era. Gli oggetti su un layer bloccato sono contati e lasciati fuori, ciascuno dicendo <Message id="objectOnLockedLayer" />. L'intera esecuzione è un solo passo che <Command id="U" /> annulla.

## Options

### Color

Un numero di colore da 1 a 255, un nome come `red`, `BYLAYER`, o <Keyword id="Truecolor" /> e il suo `Red,Green,Blue`, come li prende <Command id="COLOR" />; ciò che COLORE rifiuta è rifiutato anche qui e richiesto di nuovo.

### LAyer

Il nome di un layer, in qualsiasi maiuscolo o minuscolo. Un nome che non può essere quello di un layer dice <Message id="invalidLayerName" />, uno che non è nel disegno dice che non si trova; entrambi chiedono di nuovo. CAPROP non crea layer.

### LType

Il nome di un tipo di linea, in qualsiasi maiuscolo o minuscolo, oppure `ByLayer`. Ogni tipo di linea qui è caricato; un altro nome dice che non si trova e torna alla richiesta della proprietà.

### LWeight

Uno spessore di linea in millimetri, arrotondato al più vicino standard come lo arrotonda <Command id="LWEIGHT" />, oppure `ByLayer`; `?` li elenca.

### Thickness

Una distanza, digitata o misurata con due punti, anche negativa e zero. È impostata su linee, cerchi, archi e polilinee dell'insieme, lungo la normale di ciascuno; per ogni altro tipo dice, al termine, che non può cambiarne lo spessore.

## Missing

ltScale, TRansparency, Material e Annotative, che qui gli oggetti non hanno, quindi la richiesta non li elenca. DaBlocco a Color, LType e LWeight, e Predefinito di LWeight. Un colore RGB uguale a un colore indicizzato è riletto come quello indicizzato: `255,0,0` è proposto come `1 (red)`. I libri di colori. Lo spessore di un testo e di una definizione di attributo, lasciato com'è. CHANGE, le cui Proprietà pongono la stessa richiesta con Quota.

## Questions

### C'è una scorciatoia per CAPROP in AutoCAD?

Non ha alias: digita `CAPROP`, oppure `_CHPROP` in qualsiasi lingua di AutoCAD. Invio alla richiesta Comando lo ripete.

### Qual è la differenza tra CAPROP e PROPRIETA?

Cambiano le stesse proprietà. <Command id="PROPERTIES" /> le mostra in una tavolozza, con anche la geometria di ogni oggetto; CAPROP le chiede alla riga di comando, il che tiene le mani sulla tastiera.

### Come si cambia il colore degli oggetti dalla riga di comando?

Digita `CAPROP`, seleziona gli oggetti, premi Invio, scegli <Keyword id="Color" /> e digita il colore, come `1` per il rosso. Premi di nuovo Invio per finire.

### Come si spostano più oggetti su un altro layer?

Esegui CAPROP, selezionali, scegli <Keyword id="LAyer" /> e digita il nome del layer. Il layer deve esistere: crealo prima in <Command id="LAYER" />.
