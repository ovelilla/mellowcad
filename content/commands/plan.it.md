---
title: "Comando PIANA (PLAN) in AutoCAD"
description: "Come PIANA (PLAN) di AutoCAD in italiano guarda dall'alto l'UCS corrente, uno salvato o quello globale, e come tornare alla vista in pianta."
figure: "Il blocco a gradini visto da sud-ovest con il suo UCS ruotato di 30 gradi attorno a Z: PIANA e Invio guardano dall'alto quell'UCS, con il suo asse X a destra, quindi il blocco appare ruotato."
sourceHash: "50d157803309"
---

PIANA (PLAN in inglese) guarda dall'alto il piano XY di un UCS, con il suo asse X rivolto a destra: la vista in pianta, come l'hai disegnata. Chiede quale UCS, quello corrente, uno salvato o quello globale, e Invio accetta quello corrente. Poi inquadra tutto il disegno e mostra <Message id="regeneratingModel" />.

Nulla nel disegno si muove, e l'UCS resta com'era: PIANA ruota solo la vista. È un solo passaggio di annullamento, quindi <Command id="U" /> riporta indietro la vista, e <Command id="ZOOM" /> <Keyword command="ZOOM" id="Previous" /> torna alla vista precedente. È il modo per tornare alla pianta dopo <Command id="3DORBIT" /> o una <Command id="VIEW" /> assonometrica. Il 3D di MellowCAD è fatto solo di solidi, ed è ancora parziale.

## Options

### Current ucs

La pianta dell'UCS corrente, il valore predefinito. Dopo che <Command id="UCS" /> ha ruotato l'UCS di 30 gradi attorno a Z, il disegno appare ruotato di 30 gradi in senso orario, così che l'asse X dell'UCS punti a destra; dopo un UCS su una faccia inclinata, guarda quella faccia perpendicolarmente.

### Ucs

La pianta di un UCS salvato con <Keyword command="UCS" id="NAmed" /> di <Command id="UCS" />, che digiti per nome. Per un nome che non è salvato segnala che non trova quell'UCS e chiede di nuovo; <Keyword id="?" /> elenca quelli salvati, come fa UCS, e chiede di nuovo anch'esso. L'UCS corrente non cambia.

### World

La pianta del sistema di coordinate globale: il disegno com'era all'inizio, X a destra e Y in alto, qualunque sia l'UCS corrente, che resta com'era.

## Missing

Senza nulla disegnato, PIANA mantiene lo zoom dov'era, dove AutoCAD inquadra i limiti del disegno.

## Questions

### Come si torna alla vista in pianta in AutoCAD?

Digita `PIANA` e premi Invio due volte: il secondo Invio prende <Keyword id="Current ucs" />. Se l'UCS è ruotato e vuoi la pianta del sistema globale, scegli invece <Keyword id="World" />.

### Che cos'è il comando PIANA UCS?

PIANA con <Keyword id="Current ucs" />: guarda dall'alto l'UCS corrente, con il suo asse X a destra. Ruota prima l'UCS con <Command id="UCS" />, poi avvia PIANA e premi Invio due volte, e disegni sulla pianta ruotata come se fosse dritta.

### Perché il mio disegno è ruotato nella vista in pianta?

La vista è la pianta di un UCS ruotato. Avvia PIANA e scegli <Keyword id="World" /> per vedere il disegno con la X globale di nuovo a destra; anche <Command id="UCS" /> e Invio riportano l'UCS a Globale.

### PIANA cambia l'UCS?

No. Ruota solo la vista; l'UCS resta com'era. Sono le viste ortogonali di <Command id="VIEW" /> quelle che ruotano anche l'UCS.
