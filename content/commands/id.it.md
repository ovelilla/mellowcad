---
title: "Comando ID in AutoCAD"
description: "Come funziona il comando ID di AutoCAD in italiano: seleziona o aggancia un punto e leggi X, Y e Z nell'UCS corrente nella riga di comando. Provalo gratis."
figure: "ID con uno snap Centro sul foro di una piastra: X, Y e Z del centro."
sourceHash: "3f6bc32d12e5"
---

ID scrive le coordinate di un punto. A `Specificare punto:` selezionalo, agganciati ad esso o digitalo, e ID scrive la sua X, Y e Z su una riga nella riga di comando, poi termina. I valori sono nell'UCS corrente, alla precisione del disegno. Con uno snap ad oggetto, Z è l'altezza dell'oggetto in quel punto; altrimenti è quella del piano di elevazione. Invio lo termina senza una parola, e gli oggetti selezionati prima di ID vengono deselezionati quando parte. Digitato con un apostrofo, `'ID`, viene eseguito dentro un altro comando, che prosegue dopo di esso.

## Questions

### A cosa serve il comando ID in AutoCAD?

Dice dove si trova un punto: X, Y e Z, nell'UCS corrente. Non disegna e non cambia nulla.

### Come si trovano le coordinate di un punto?

Digita `ID`, poi fai clic sul punto con uno snap ad oggetto, Punto finale o Centro, così cade esattamente su di esso. Le coordinate vengono scritte nella riga di comando.

### Come si ottiene la coordinata Z di un punto?

Agganciati ad esso con uno snap ad oggetto: ID scrive lì la Z dell'oggetto. Un semplice clic dà la Z del piano di elevazione, 0 a meno che ELEVATION o l'UCS non la alzino.

### Perché ID mostra coordinate che non mi aspettavo?

ID legge nell'UCS corrente. Se l'UCS è stato spostato o ruotato, i numeri sono misurati dalla sua origine lungo i suoi assi: <Command id="UCS" /> World per leggere le coordinate del sistema globale.
