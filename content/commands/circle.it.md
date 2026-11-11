---
title: "Comando CERCHIO (CIRCLE) in AutoCAD"
description: "Come funziona CERCHIO (CIRCLE, alias C) di AutoCAD in italiano: centro e raggio o Diametro, 2P, 3P e Ttr, un cerchio tangente a due oggetti. Provalo."
figure: "Tre cerchi: centro e raggio, i due estremi di un diametro (2P), centro e Diametro."
sourceHash: "62e25bc029f9"
---

CERCHIO disegna un cerchio dal suo centro e dal suo raggio, digitato o dato con un punto sul cerchio, oppure in uno degli altri modi che la sua prima richiesta propone. Invio al raggio ripete la dimensione dell'ultimo cerchio, conservata per il disegno. Mentre dai il raggio, una linea tratteggiata ambra va dal centro al cursore, oltre il bordo quando dai il diametro, come la disegna AutoCAD. Il cerchio giace nel piano del suo primo punto, alla quota corrente se il punto non ha una Z propria.

## Options

### 3P

Per tre punti. Digitato con gli snap Tangente, `_TAN` a ciascuno, è il Tan, Tan, Tan di AutoCAD: il cerchio che tocca tre oggetti.

### 2P

Dai due estremi di un diametro.

### Ttr

Tangente a due oggetti, con un raggio: indica ogni linea, cerchio o arco vicino a dove il cerchio deve toccarlo, poi dai il raggio. Tra i cerchi possibili, disegna quello che tocca più vicino alle tue selezioni; quando nessuno lo fa, mostra <Message id="circleDoesNotExist" />.

### Diameter

Alla richiesta del raggio: dai invece il diametro, digitato o come punto.

## Missing

Ttr su un segmento di polilinea, che AutoCAD accetta e MellowCAD rifiuta; la voce Tan, Tan, Tan della tavolozza degli strumenti (digitarla, 3P con tre snap Tangente, funziona); Proprietà rapide con un doppio clic su un cerchio.

## Questions

### Qual è la scorciatoia di CERCHIO in AutoCAD?

`C`, poi Invio o barra spaziatrice. Funziona anche il nome completo, e `_CIRCLE` in tutte le lingue di AutoCAD.

### Come si disegna un cerchio tangente a due linee?

Scegli <Keyword id="Ttr" />, indica la prima linea, poi la seconda, vicino a dove il cerchio deve toccarle, e digita il raggio.

### Come si disegna un cerchio tangente a tre oggetti?

Scegli <Keyword id="3P" /> e digita `_TAN` prima di ciascuno dei tre punti, indicando ogni oggetto vicino a dove il cerchio deve toccarlo.

### Come si disegna un cerchio dal suo diametro?

Dai il centro, poi scegli <Keyword id="Diameter" /> e digitalo. Oppure scegli <Keyword id="2P" /> e dai i due estremi del diametro.
