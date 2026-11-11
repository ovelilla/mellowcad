---
title: "Comando ICONAUCS (UCSICON) in AutoCAD"
description: "Come ICONAUCS (UCSICON) di AutoCAD mostra o nasconde l'icona UCS e la mette sull'origine o nell'angolo: ON, OFF, Noorigin, ORigin, e cosa mostra. Provalo."
figure: "ICONAUCS Noorigin manda l'icona nell'angolo; UCS sposta l'origine sul gradino del blocco, e ORigin disegna lì l'icona, con X rossa, Y verde e Z blu."
sourceHash: "c431e70eda01"
---

ICONAUCS (UCSICON) mostra o nasconde l'icona UCS, i bracci X e Y che indicano dove si trova l'UCS corrente e in che direzione punta, e dice dove sta: sull'origine dell'UCS, o nell'angolo in basso a sinistra del disegno. Il suo unico prompt propone lo stato corrente come valore predefinito, quindi Invio lo mantiene. L'impostazione viene salvata nel disegno, e ogni ICONAUCS è un passo di annullamento.

L'icona è quella 3D di AutoCAD 2027: un braccio per X e uno per Y, una lettera a ciascun capo, e un quadrato sull'origine finché l'UCS è quello globale. Fuori dalla pianta un braccio Z mostra dove punta lo Z dell'UCS, e un braccio visto di punta viene omesso. In Wireframe 2D è bianca; in Nascosto e Concettuale la sua X è rossa, Y verde e Z blu. Digitato con un apostrofo, `'UCSICON` imposta invece la variabile UCSICON, anche all'interno di un altro comando: da 0 a 3, dove 1 mostra l'icona e 2 la mette sull'origine.

## Options

### ON

Mostra l'icona.

### OFF

Nasconde l'icona. L'UCS c'è ancora, e ciò che disegni vi giace ancora.

### Noorigin

Mantiene l'icona nell'angolo in basso a sinistra del disegno, ovunque sia l'origine.

### ORigin

Disegna l'icona sull'origine dell'UCS, il valore predefinito. Quando l'origine è fuori dallo schermo, o così vicina al suo bordo che l'icona non ci starebbe, l'icona va nell'angolo in basso a sinistra finché l'origine non torna in vista.

## Missing

Tutto, che in AutoCAD applica l'impostazione a ogni vista (qui ce n'è una sola); Selezionabile, i grip dell'icona; e Proprietà, la finestra Icona UCS, con lo stile 2D, la dimensione, lo spessore di linea e i colori.

## Questions

### Come si disattiva l'icona UCS in AutoCAD?

Digita `ICONAUCS`, premi Invio, poi <Keyword id="OFF" />. <Keyword id="ON" /> la riporta.

### Come si sposta l'icona UCS sull'origine?

ICONAUCS, poi <Keyword id="ORigin" />: l'icona sta sull'origine dell'UCS. Se resta nell'angolo, l'origine è fuori dallo schermo o troppo vicina al suo bordo: esegui un pan o uno zoom indietro. <Keyword id="Noorigin" /> la mantiene nell'angolo.

### Che cosa significa il quadrato sull'icona UCS?

Che l'UCS è il sistema di coordinate globale. Sposta o ruota l'UCS con <Command id="UCS" /> e il quadrato sparisce; <Command id="UCS" /> e Invio riportano il globale, e il quadrato con esso.

### Come si cambia lo stile, la dimensione o il colore dell'icona UCS?

In AutoCAD, con Proprietà di ICONAUCS, la finestra Icona UCS. MellowCAD non ce l'ha ancora: l'icona è disegnata come la disegna AutoCAD 2027 per impostazione predefinita, lo stile 3D.
