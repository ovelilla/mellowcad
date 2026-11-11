---
title: "Comando PROPMASS (MASSPROP) in AutoCAD"
description: "Come PROPMASS (MASSPROP) di AutoCAD in italiano calcola le proprietà di massa di solidi 3D e regioni: volume, area, baricentro, momenti d'inerzia, file .mpr."
figure: "Un parallelepipedo di 60 per 40 per 25 all'origine: PROPMASS scrive il suo volume, il riquadro di contorno, il baricentro e i momenti, e Invio rifiuta il file."
sourceHash: "a0286a5d599e"
---

PROPMASS (MASSPROP in inglese) misura solidi 3D e regioni. Selezionali e premi Invio: il rapporto viene scritto nella riga di comando, nelle colonne di AutoCAD, poi chiede se scriverlo in un file. Se la selezione non contiene né solidi né regioni, segnala <Message id="massPropNoneSelected" /> e termina.

Per i solidi, l'insieme è misurato come un solo corpo con una densità di 1, quindi la massa è il volume: massa, volume, riquadro di contorno, baricentro, momenti d'inerzia, prodotti d'inerzia e raggi di rotazione, tutti rispetto all'UCS corrente, poi i momenti principali rispetto al baricentro con le loro direzioni. I solidi che si sovrappongono sono contati due volte. Per le regioni nel piano XY dell'UCS: area, perimetro, riquadro di contorno, baricentro, momenti e prodotto d'inerzia, raggi di rotazione e momenti principali; una regione fuori da quel piano dà solo area, perimetro, il riquadro di contorno e il baricentro. Prima le regioni, poi i solidi; le regioni fuori dal piano della prima vengono lasciate fuori e contate. I numeri sono scritti alla precisione del disegno, impostata con <Command id="UNITS" />, e sono esatti, anche quelli dei solidi, integrati faccia per faccia. PROPMASS non cambia nulla nel disegno; si digita, come in AutoCAD, la cui barra multifunzione non ha un pulsante per questo comando.

## Options

### Yes

Alla domanda sul file, il cui valore predefinito è <Keyword id="No" />: scrive il rapporto in un file, come lo scrive AutoCAD, riga per riga. In AutoCAD una finestra chiede dove salvarlo; in un browser il download è quella finestra, e il file prende il nome del disegno, `.mpr`.

## Missing

Le unità dopo ogni numero con unità architettoniche o ingegneristiche (`sq in`, `cu in`, `lb`), che AutoCAD scrive: qui nessuna unità segue un numero. Scegliere il nome del file, e la domanda prima di sostituirne uno. Lontano dall'origine, AutoCAD scrive i numeri grandi in forma esponenziale e perde cifre, e la sua ultima cifra può differire per il suo arrotondamento: quelli di MellowCAD sono esatti. Per un solido con due momenti principali uguali, la coppia di direzioni scelta dall'arrotondamento di AutoCAD.

## Questions

### Come si trova il volume di un solido 3D in AutoCAD?

Avvia PROPMASS, seleziona il solido e premi Invio: Volume è la seconda riga del rapporto. Il parallelepipedo di 60 per 40 per 25 della sessione dà 60000. Premi Invio alla domanda sul file per terminare.

### Come si trova il baricentro di una forma?

Ricavane una regione con <Command id="REGION" />, o un solido, poi avvia PROPMASS e selezionala: Baricentro dà la sua X e Y, e Z per un solido, nell'UCS corrente.

### Perché PROPMASS segnala che non sono stati selezionati solidi o regioni?

Quello che hai selezionato non è né l'uno né l'altro: linee, polilinee, cerchi e tratteggi non hanno proprietà di massa, e un blocco che contiene un solido non è un solido. Trasforma le forme chiuse in regioni con <Command id="REGION" />, o in solidi con <Command id="EXTRUDE" />.

### Perché la massa è uguale al volume?

PROPMASS misura con una densità di 1, come fa AutoCAD: qui i solidi non hanno un materiale. Moltiplica il volume per la densità del materiale per ottenere la massa reale.
