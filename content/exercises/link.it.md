---
title: "Esercizio AutoCAD: una biella con linee tangenti"
metaTitle: "Esercizio AutoCAD avanzato: una biella, tangenti"
description: "Disegna una biella in AutoCAD: due mozzi uniti da linee tangenti con lo snap Tangente, gli archi tra di esse tagliati, e le quote. Gratis online."
figure: "Una biella di due mozzi a distanza di 90, uniti da linee tangenti, quotata."
sourceHash: "383984af61b7"
---

Disegna questa biella, in millimetri: due mozzi a distanza di 90, di raggio 20 e 12, forati con raggio 10 e 6, uniti da linee tangenti a entrambi, con gli archi tra le linee tagliati. Le linee tangenti usano lo snap ad oggetto Tangente a entrambe le estremità; <Command id="TRIM" /> trasforma poi il cerchio di ogni mozzo in un arco.

## Steps

### Disegna i mozzi [#bosses]

Sul layer Contorno, quattro cerchi con <Command id="CIRCLE" />, ciascuno col suo raggio: `20` e `10` in `0,0`, `12` e `6` in `90,0`.

### Disegna le linee tangenti [#tangents]

<Command id="LINE" />, poi digita `_TAN`, lo snap ad oggetto Tangente per un punto, e seleziona il cerchio grande vicino alla sommità; `_TAN` di nuovo e seleziona quello piccolo vicino alla sommità. La linea tocca entrambi. Lo stesso lungo il lato inferiore.

### Taglia gli archi [#trim]

<Command id="TRIM" />: seleziona ogni mozzo tra le due linee, sul lato rivolto verso l'altro. Gli archi interni spariscono e ogni cerchio diventa un arco.

### Disegna gli assi [#centreLines]

Sul layer Assi, l'asse che passa per i due centri e una linea attraverso ogni mozzo.

### Quotala [#dimensions]

Sul layer Quote, la distanza tra i centri con <Command id="DIMLINEAR" />, i raggi dei mozzi con <Command id="DIMRADIUS" /> e i loro fori con <Command id="DIMDIAMETER" />.
