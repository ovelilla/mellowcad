---
title: "Comando CANCELLA (ERASE) in AutoCAD"
description: "Come funziona CANCELLA (ERASE, alias CA) di AutoCAD in italiano: seleziona, Invio, cancellato; il tasto Canc, cancellare tutto, recuperare. Provalo nel browser."
figure: "Un rettangolo e le sue due diagonali: una diagonale selezionata, poi Invio, ed è cancellata."
sourceHash: "2de33971060a"
---

CANCELLA (ERASE in inglese) elimina dal disegno gli oggetti che selezioni. Selezionali a `Selezionare oggetti:`, con un clic o con una qualunque delle modalità di selezione di AutoCAD, tra cui una finestra o un'intercetta, poi premi Invio o la barra spaziatrice: sono spariti e il comando non dice altro. Esc lo termina senza cancellare nulla. Come in AutoCAD, gli oggetti selezionati prima del comando vengono cancellati subito, e il tasto Canc con degli oggetti selezionati esegue CANCELLA su di essi. Mentre selezioni, l'oggetto sotto il cursore e quelli già scelti sono disegnati sbiaditi, come AutoCAD mostra in anteprima ciò che cancellerà. Tutta la cancellazione è un solo passo che Annulla ripristina.

## Missing

OOPS, che in AutoCAD riporta l'ultimo insieme cancellato da CANCELLA, anche dopo altri comandi. Qui <Command id="U" /> o Ctrl+Z annulla la cancellazione, insieme a tutto ciò che è venuto dopo.

## Questions

### Come si chiama il comando ERASE in italiano?

CANCELLA, alias `CA`, poi Invio o barra spaziatrice; `DELETE` resta anch'esso un alias, e `E` in AutoCAD in italiano è ESPLODI. Oppure seleziona gli oggetti a `Comando:` e premi il tasto Canc. Come in AutoCAD in italiano, il nome inglese funziona anche con il trattino basso davanti: `_ERASE`.

### Come si cancella tutto in un disegno AutoCAD?

Avvia CANCELLA e digita `Tutti` a `Selezionare oggetti:`, poi Invio. Gli oggetti su un layer bloccato restano fuori, e la selezione dice quanti sono.

### Come si recupera un oggetto cancellato in AutoCAD?

Digita <Command id="U" /> o premi subito Ctrl+Z: la cancellazione è un solo passo di annullamento. OOPS, che riporta l'ultimo insieme cancellato anche dopo altri comandi, non esiste ancora.

### Qual è la differenza tra CANCELLA e TAGLIA?

CANCELLA elimina oggetti interi. <Command id="TRIM" /> elimina solo la parte di un oggetto che supera i bordi che incontra, e tiene il resto.
