---
title: "Comando COPIACLIP (COPYCLIP) in AutoCAD"
description: "Come funziona COPIACLIP (COPYCLIP, Ctrl+C) di AutoCAD con CUTCLIP, COPIAPUNTOB e INCOLLACLIP: copiare oggetti negli Appunti e incollarli in un punto. Provalo."
figure: "COPIACLIP del foro di una piastra, poi INCOLLACLIP in 65,20: la copia posata lì dal suo angolo inferiore sinistro, un secondo foro."
sourceHash: "f84c995e7c2b"
---

COPIACLIP copia gli oggetti che selezioni negli Appunti, con i layer, gli stili e i blocchi che usano; il disegno non cambia, e gli oggetti selezionati prima restano selezionati. Ctrl+C lo esegue, annullando un comando in corso. <Command id="PASTECLIP" />, Ctrl+V, chiede poi un punto di inserimento: gli oggetti seguono il cursore e arrivano con l'angolo inferiore sinistro della loro estensione nel punto, nell'UCS corrente, tutto in un solo passo che <Command id="U" /> annulla. Incolla nello stesso disegno o in un altro: gli Appunti sono quelli del sistema, quindi un disegno in un'altra scheda può leggerli, se il browser lascia leggere gli Appunti alla pagina. Dove un layer, stile o blocco incollato ha il nome di uno che il disegno ha già, si usa quello del disegno.

<Command id="CUTCLIP" />, Ctrl+X, copia gli oggetti e li cancella, come fa CANCELLA. <Command id="COPYBASE" />, Ctrl+Maiusc+C, chiede prima un punto base, e INCOLLACLIP poi posiziona gli oggetti da quel punto invece che dal loro angolo, così arrivano esattamente dove vuoi. Ctrl+A seleziona ogni oggetto del disegno.

## Missing

PASTEBLOCK e CUTBASE, e quindi Ctrl+Maiusc+V e Ctrl+Maiusc+X, che sono lasciati al browser, come Ctrl+Maiusc+A. PASTEORIG, PASTESPEC, il trascinamento di oggetti tra finestre, e il testo di un altro programma incollato come testo multilinea. Le opzioni nascoste di INSER di INCOLLACLIP al suo punto, quindi un incolla non si può scalare, ruotare o esplodere mentre arriva.

## Questions

### Qual è la differenza tra COPIA e COPIACLIP?

<Command id="COPY" /> posiziona copie nello stesso disegno, da un punto base a un secondo punto. COPIACLIP mette gli oggetti negli Appunti, da incollare con INCOLLACLIP in questo disegno o in un altro.

### Come si copia con un punto base?

Premi Ctrl+Maiusc+C, oppure digita `COPIAPUNTOB`, indica il punto base e seleziona gli oggetti. Ctrl+V li posiziona poi da quel punto.

### Come si copiano oggetti da un disegno a un altro?

Selezionali e premi Ctrl+C, apri l'altro disegno e premi Ctrl+V, poi indica il punto di inserimento. I loro layer, stili e blocchi vengono con essi.

### Perché incolla non funziona?

Il browser può chiedere se la pagina può leggere gli Appunti: consentilo. Se rifiuta, INCOLLACLIP incolla ciò che è stato copiato per ultimo nella stessa pagina. Senza nulla di copiato, non incolla nulla.
