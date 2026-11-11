---
title: "Comando SPAZIOQUOTE (DIMSPACE) in AutoCAD"
description: "Allineare e distanziare le quote in AutoCAD in italiano: SPAZIOQUOTE (DIMSPACE), spaziatura uguale o 0 per allinearle, e Auto. Provalo gratis nel browser."
before: "Il bordo superiore di una piastra quotato con una catena di tre quote, ciascuna posizionata a un'altezza propria, come sono state disegnate."
figure: "SPAZIOQUOTE dalla prima quota, le altre due selezionate e la spaziatura 0: la catena allineata su una sola linea."
sourceHash: "7ec7c0eb9883"
---

SPAZIOQUOTE (DIMSPACE in inglese) regola lo spazio tra quote lineari e allineate parallele. Selezioni la quota di base, che resta dov'è, poi le quote da distanziare; Invio termina la selezione e chiede la spaziatura. La linea di ogni quota viene allora spostata, allontanandosi dalla base nell'ordine in cui le quote si trovano, a quella distanza dalla precedente. Una spaziatura di 0 le allinea tutte sulla linea della base: una catena sfalsata come è stata disegnata si legge come una sola. Cambia soltanto la posizione delle linee di quota, in un solo passo che <Command id="U" /> annulla.

La base si seleziona, si digita come punto o si prende con `Ultimo`; un oggetto che non è una quota mostra <Message id="selectedObjectNotDimension" /> e la richiesta si ripete. Un insieme selezionato prima del comando è l'insieme da distanziare. Una quota inclinata rispetto alla base viene contata e lasciata dov'è, e una spaziatura negativa viene rifiutata con <Message id="negativeSpacing" />.

## Options

### Auto

Il valore predefinito, con Invio: una spaziatura pari a due volte l'altezza del testo dello stile di quota della base, moltiplicata per la sua scala generale, così la pila sta con il proprio testo.

## Missing

Le quote angolari, che SPAZIOQUOTE non distanzia ancora. AutoCAD sposta una quota solo dove serve; qui ogni quota selezionata viene distanziata di nuovo.

## Questions

### Come si allineano le quote in AutoCAD?

Avvia SPAZIOQUOTE, seleziona la quota con cui le altre devono allinearsi, selezionale, premi Invio e digita `0`: ogni linea di quota si sposta su quella della base.

### Come si rende uguale la spaziatura tra le quote?

Avvia SPAZIOQUOTE, seleziona come base la quota più vicina all'oggetto, seleziona le altre e premi Invio due volte: <Keyword id="Auto" /> le distanzia di due volte l'altezza del testo. Oppure digita la distanza che vuoi, per esempio `8`.

### Qual è la spaziatura predefinita delle quote in AutoCAD?

L'opzione <Keyword id="Auto" /> di SPAZIOQUOTE vale due volte l'altezza del testo dello stile di quota. <Command id="DIMBASELINE" /> usa invece la spaziatura della linea base dello stile, 3,75 in ISO-25, per ogni quota che aggiunge.

### Perché SPAZIOQUOTE non sposta una quota?

Distanzia soltanto le quote parallele alla base: una quota con un altro angolo viene contata e lasciata dov'è. Le quote angolari non vengono ancora distanziate.
