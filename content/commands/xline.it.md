---
title: "Comando XLINEA (XLINE) in AutoCAD"
metaTitle: "Comando XLINEA (XLINE): linea di costruzione"
description: "Come XLINEA (XLINE, alias XL) di AutoCAD disegna linee di costruzione infinite: per due punti, orizzontali, verticali, inclinate, bisettrici o in offset."
figure: "Xlinee per un punto, una orizzontale e la bisettrice dell'angolo tra due linee, ciascuna attraverso tutta la vista."
sourceHash: "5b81d2c75993"
---

XLINEA (XLINE) disegna linee di costruzione: linee di lunghezza infinita, che attraversano tutta la vista per quanto tu faccia pan o zoom, per impostare un disegno prima che arrivino le linee vere. Indica un punto, poi un punto di passaggio: la xlinea passa per entrambi, e ogni punto successivo ne crea un'altra per il primo, finché Invio termina il comando. Un punto di passaggio sul primo punto viene rifiutato con <Message id="invalid" />. Ogni xlinea sta sul layer corrente con il colore, il tipo di linea e lo spessore di linea correnti.

Una xlinea non ha estremi: uno zoom sull'estensione del disegno la lascia fuori, come in AutoCAD. Lo snap Punto medio trova il punto per cui è stata disegnata; Vicino, Perpendicolare e Intersezione funzionano lungo di essa, e <Command id="TRIM" /> o <Command id="BREAK" /> la trasformano in un raggio, o in due, ed è così che le linee di costruzione diventano linee del disegno. <Command id="RAY" /> disegna la metà che parte da un punto.

## Options

### Hor

Xlinee orizzontali, lungo l'asse X dell'UCS, ciascuna per un punto che indichi, fino a Invio.

### Ver

Xlinee verticali, lungo l'asse Y dell'UCS, ciascuna per un punto che indichi.

### Ang

Xlinee inclinate: digita l'angolo, oppure indica due punti, poi i punti di passaggio. Invio all'angolo prende 0. <Keyword id="Reference" /> misura l'angolo da una linea che selezioni, una linea, una xlinea o un raggio, in senso antiorario: qualsiasi altro oggetto viene rifiutato con <Message id="noUsableObjectSelected" />.

### Bisect

La xlinea che divide a metà un angolo: indica il vertice, un punto sul primo lato, poi un punto sul secondo lato, e la bisettrice passa per il vertice. Ogni punto successivo sul secondo lato crea un'altra bisettrice dello stesso primo lato.

### Offset

Xlinee parallele a un oggetto lineare, una linea, una xlinea o un raggio: indica la distanza, seleziona l'oggetto e indica il lato, ancora e ancora fino a Invio. <Keyword id="Through" /> fa invece passare ciascuna per un punto che indichi. La distanza è quella che <Command id="OFFSET" /> ricorda, e quella che propone dopo.

## Missing

ALLUNGA (LENGTHEN) e <Command id="JOIN" /> di una xlinea non sono ancora stati verificati rispetto ad AutoCAD, né i menu dei suoi grip.

## Questions

### Come si chiama il comando XLINE in italiano?

XLINEA, alias `XL` come in inglese, poi Invio o barra spaziatrice. La barra multifunzione lo chiama Linea di costruzione, nel gruppo Disegna espanso; qui è negli strumenti di Disegna, accanto a Raggio.

### Come si disegna una linea di costruzione orizzontale o verticale?

Avvia XLINEA, digita la lettera di <Keyword id="Hor" /> o quella di <Keyword id="Ver" /> e indica i punti per cui passa. Orizzontale e verticale sono quelle dell'UCS corrente.

### Come si taglia una xlinea?

Con <Command id="TRIM" />, come qualsiasi linea: tagliata da un lato, una xlinea diventa un raggio; tagliata da entrambi, una linea. Lo stesso accade con <Command id="BREAK" />.

### Perché ZOOM Estensioni ignora le mie linee di costruzione?

Una xlinea non ha estensione: va all'infinito in entrambe le direzioni. AutoCAD lascia xlinee e raggi fuori dall'estensione del disegno, e così fa MellowCAD.

### Che differenza c'è tra XLINEA e RAGGIO?

Una xlinea va all'infinito in entrambe le direzioni; un raggio, quello di <Command id="RAY" />, parte da un punto e va in una sola direzione.
