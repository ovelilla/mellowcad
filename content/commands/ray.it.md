---
title: "Comando RAGGIO (RAY) in AutoCAD"
metaTitle: "Comando RAGGIO (RAY): una linea all'infinito"
description: "Come RAGGIO (RAY) di AutoCAD disegna linee di costruzione che partono da un punto e vanno all'infinito in una direzione, e come tagliarle in linee. Provalo."
figure: "Raggi da un unico punto iniziale attraverso tre punti, ciascuno prosegue oltre il bordo della vista."
sourceHash: "732d6e8c23de"
---

RAGGIO (RAY) disegna raggi: linee di costruzione che partono da un punto e vanno all'infinito in una direzione. Indica il punto iniziale, poi un punto di passaggio: il raggio parte dal primo e passa per il secondo. Ogni punto successivo crea un altro raggio dallo stesso inizio, finché Invio termina il comando. Un punto di passaggio sull'inizio viene rifiutato con <Message id="invalid" />. Ogni raggio sta sul layer corrente con il colore, il tipo di linea e lo spessore di linea correnti.

Un raggio attraversa la vista per quanto tu faccia pan o zoom, e l'estensione del disegno lo lascia fuori, come in AutoCAD. Lo snap Punto finale trova il suo inizio; Vicino, Perpendicolare e Intersezione funzionano lungo di esso. <Command id="TRIM" /> e <Command id="BREAK" /> trasformano in una linea il tratto che contiene l'inizio, e <Command id="EXTEND" /> porta l'inizio indietro fino a uno spigolo alle sue spalle. <Command id="XLINE" /> disegna linee che vanno in entrambe le direzioni.

## Missing

ALLUNGA (LENGTHEN) e <Command id="JOIN" /> di un raggio non sono ancora stati verificati rispetto ad AutoCAD, né i menu dei suoi grip.

## Questions

### Cos'è il comando RAGGIO in AutoCAD?

Una linea di costruzione con un inizio: parte da un punto e prosegue all'infinito in una direzione. Usala come riferimento su cui disegnare, poi tagliala in una linea o cancellala.

### Il comando RAGGIO ha un alias?

No: AutoCAD non dà alcun alias a RAGGIO, quindi digita `RAGGIO` per intero. Si trova nel gruppo Disegna espanso della barra multifunzione, e qui negli strumenti di Disegna, accanto a Linea di costruzione.

### Come si ferma un raggio su una linea?

Taglialo: avvia <Command id="TRIM" /> e seleziona la parte oltre la linea. Ciò che resta dall'inizio fino alla linea è un oggetto linea.

### Che differenza c'è tra un raggio e una linea?

Una linea ha due estremi; un raggio ne ha uno, il suo inizio, e prosegue senza fine. In un file DXF un raggio viene salvato come RAY, e si apre come tale.
