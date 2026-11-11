---
title: "Comando RUOTA (ROTATE) in AutoCAD"
description: "Come funziona RUOTA (ROTATE, alias RU) di AutoCAD: punto base e angolo, Copia per tenere l'originale, Riferimento per ruotare a un angolo. Provalo."
figure: "Un rettangolo ruotato di 30° attorno al suo angolo con Copia, l'originale conservato."
sourceHash: "0e5ae021e108"
---

RUOTA (ROTATE) ruota gli oggetti che selezioni attorno a un punto base: selezionali, indica il punto base, poi l'angolo, digitato o indicato come un punto la cui direzione dal punto base è l'angolo. La sua prima riga dice quale verso è positivo, antiorario per impostazione predefinita (ANGDIR), e dove si trova lo 0 (ANGBASE). Invio all'angolo ripete l'ultima rotazione, 0 in un nuovo disegno. Gli oggetti ruotano attorno a un asse parallelo allo Z dell'UCS passante per il punto base, quindi in 3D mantengono la loro altezza. La rotazione è un solo passo che Annulla ripristina.

## Options

### Copy

Ruota una copia e lascia gli oggetti dove erano, dicendo <Message id="rotatingCopy" />. Il prompt chiede poi di nuovo l'angolo.

### Reference

Ruota da un angolo che hai a quello che vuoi: chiede l'angolo di riferimento (digitato, o due punti che lo misurano), poi il nuovo angolo, e ruota della differenza. Per mettere in piano uno spigolo inclinato, indica i suoi due estremi come riferimento e digita 0.

### Points

Al nuovo angolo di Riferimento: il nuovo angolo è quello di una linea tra due punti che indichi, così gli oggetti si allineano a uno spigolo già disegnato.

## Missing

Mentre indichi l'angolo, l'insieme ruotato segue il cursore nel colore di ciascun oggetto, ma non nel suo tipo di linea o spessore di linea.

## Questions

### Qual è l'alias di RUOTA in AutoCAD?

`RU`, poi Invio o barra spaziatrice. Funziona anche il nome completo, e `_ROTATE` in qualsiasi lingua di AutoCAD.

### Come si ruota un oggetto per allinearlo a un altro?

Scegli <Keyword id="Reference" />, indica due punti lungo lo spigolo dell'oggetto, poi scegli <Keyword id="Points" /> e indica due punti lungo la linea che deve seguire.

### Come si ruota un oggetto conservando l'originale?

Scegli <Keyword id="Copy" /> prima di indicare l'angolo: la copia ruota e l'originale resta.

### Perché RUOTA gira dalla parte sbagliata?

Un angolo positivo ruota in senso antiorario, come dice ANGDIR nella prima riga. Digita un angolo negativo, `-30`, per ruotare in senso orario.
