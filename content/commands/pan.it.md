---
title: "Comando PAN in AutoCAD"
description: "Come funziona PAN (alias P) di AutoCAD in italiano: trascina la vista con il cursore a mano o con la rotellina, -PAN con due punti, e PAN dentro un comando."
figure: "PAN trascinato a destra e in basso, poi Invio: la piastra scorre nella vista, con le coordinate invariate."
sourceHash: "0ca3050831f3"
---

PAN fa scorrere la vista; nulla nel disegno si muove. Parte con <Message id="panExit" /> e non chiede altro: il cursore diventa una mano, e trascinando con il pulsante sinistro la vista si muove con esso, quante volte vuoi, finché Invio o Esc lo termina. Senza PAN, trascinare con il pulsante della rotellina fa il pan in qualunque momento, anche nel mezzo di un comando. Ogni PAN è un passaggio di annullamento, raggruppato con gli ZOOM e i PAN vicini, quindi <Command id="U" /> riporta indietro la vista. Digitato con un apostrofo, `'PAN` o `'P`, funziona dentro un altro comando, che prosegue dopo il pan.

<Command id="-PAN" /> fa invece il pan con due punti: un punto base e un secondo punto, con la vista che si muove della distanza tra essi; oppure uno spostamento digitato alla prima richiesta, come `50,0`, e Invio alla seconda. È trasparente anch'esso, e un passaggio di annullamento a sé.

## Missing

Il menu di scelta rapida che AutoCAD mostra con un clic destro durante il pan, con Esci, Pan, Zoom, Orbita 3D, Zoom finestra, Zoom originale e Zoom estensioni.

## Questions

### Come si chiama il comando PAN in italiano?

PAN, come in inglese, alias `P`, poi Invio o barra spaziatrice. Oppure nessun comando: tieni premuta la rotellina del mouse e trascina. Il nome completo funziona anch'esso, e `_PAN` in tutte le lingue di AutoCAD.

### Come si fa il pan con il mouse in AutoCAD?

Tieni premuto il pulsante della rotellina e trascina: la vista segue il cursore. Ruota la rotellina per ingrandire e ridurre intorno al cursore. Su un trackpad, avvia PAN e trascina con il pulsante sinistro.

### Come si fa il pan mentre si disegna?

Trascina con il pulsante della rotellina, oppure digita `'P` alla richiesta del comando: il comando aspetta mentre fai il pan, poi chiede di nuovo il dato che stava aspettando.

### Come si fa il pan di una distanza esatta?

Usa <Command id="-PAN" />: digita lo spostamento, come `100,0`, e premi Invio al secondo punto. La vista si muove di 100 unità lungo X.
