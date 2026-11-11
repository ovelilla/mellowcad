---
title: "Comando SOTTRAI (SUBTRACT) in AutoCAD"
description: "Come funziona SOTTRAI (SUBTRACT, alias SOT) di AutoCAD: i solidi o le regioni da conservare, Invio, poi quelli da togliere, fori e aree compresi. Provalo."
figure: "Un cilindro tolto da un parallelepipedo da SOTTRAI, un foro passante: prima il parallelepipedo indicato, poi il cilindro."
sourceHash: "416991f5f4d1"
---

SOTTRAI (SUBTRACT) toglie solidi 3D da altri solidi, o regioni da regioni nello stesso piano: un cilindro tolto da un parallelepipedo lascia un foro passante, un cerchio tolto da un quadrato un quadrato con un foro. Chiede due volte. Prima dice <Message id="subtractFrom" /> e chiede gli oggetti da conservare, fino a Invio; poi <Message id="subtractWhat" /> e chiede gli oggetti da togliere, fino a Invio di nuovo. Come in AutoCAD 2027, un insieme selezionato prima viene scartato e chiesto di nuovo.

I solidi del primo insieme diventano un solo solido, e ogni solido del secondo insieme viene tolto da esso e cancellato, che si sovrapponesse o no. Le regioni procedono piano per piano: le regioni del primo insieme in un piano vengono unite, quelle del secondo insieme in quel piano vengono tolte da esse e cancellate, e una regione in un piano dove il primo insieme non ne ha resta com'era. Un risultato solido è un solido composto, non più un parallelepipedo o un cilindro, senza cronologia. Quando non resta nulla dice <Message id="nullSolid" /> o <Message id="nullRegion" /> e li cancella. L'intero comando è un solo passo di annullamento. Il 3D di MellowCAD è ancora parziale: i solidi ci sono, le superfici e le mesh no.

## Missing

Superfici, che qui non esistono. Facce curve che si incontrano lungo una curva per cui MellowCAD non ha ancora una forma esatta: cilindri, coni, sfere o tori i cui assi non coincidono né corrono paralleli (due cilindri possono anche incrociarsi); un cono con qualsiasi cosa che non sia un piano o un solido sul suo asse; un toro o un solido di rivoluzione con un piano né perpendicolare al suo asse né passante per esso, o con un solido fuori dal suo asse; un solido estruso con qualsiasi cosa che non sia un piano o una faccia estrusa nella sua direzione. Questi vengono rifiutati, e i solidi lasciati com'erano; così pure un taglio che incontra uno spigolo in modo tangente, facce quasi ma non del tutto su una stessa superficie, e una scheggia molto sottile tra un taglio e uno spigolo. Precedente dopo SOTTRAI dice che non c'è un insieme di selezione precedente, dove AutoCAD non trova nessuno degli oggetti cancellati. Non viene conservata alcuna cronologia dei solidi (SOLIDHIST, SHOWHISTORY).

## Questions

### Qual è l'alias di SOTTRAI in AutoCAD?

`SOT`, poi Invio o barra spaziatrice. Funziona anche il nome completo, e `_SUBTRACT` in qualsiasi lingua di AutoCAD.

### Come si sottrae un solido da un altro?

Disegna il solido da togliere dove si sovrappone all'altro: un cilindro attraverso un parallelepipedo, per un foro. Esegui SOTTRAI, indica il parallelepipedo e premi Invio, poi indica il cilindro e premi Invio: il parallelepipedo resta con un foro e il cilindro sparisce. L'ordine conta, perché ciò che indichi per primo è ciò che rimane.

### Perché SOTTRAI non funziona?

Spesso è l'ordine: ciò da conservare va nel primo insieme, ciò da togliere nel secondo. Quando il primo insieme non contiene alcun solido o regione, o il secondo non ne contiene nessuno che non sia già nel primo, dice <Message id="noSolidsOrRegionsSelected" /> e termina; quando nulla del secondo può essere tolto dal primo, come un solido da una regione o una regione in un altro piano, dice <Message id="subtractNeedsTwo" /> e non cambia nulla. Linee e polilinee devono prima diventare regioni. Quando dice che un'operazione booleana è fallita, i solidi si incontrano in un modo che MellowCAD non sa ancora calcolare, e vengono lasciati com'erano.

### Come si sottrae un'area in AutoCAD?

Per ritagliare una forma 2D da un'altra, crea entrambe come regioni con <Command id="REGION" /> e SOTTRAI quella interna da quella esterna: un quadrato da cui è tolto un cerchio diventa una regione con un foro. Per misurare un'area senza cambiare il disegno, <Command id="AREA" /> toglie spazi dal suo totale corrente con <Keyword command="AREA" id="Subtract" />.

### Si può sottrarre senza cancellare l'oggetto?

SOTTRAI cancella ciò che toglie, come fa quello di AutoCAD. Per conservarlo, copialo prima sul posto: <Command id="COPY" />, l'oggetto e Invio, un punto base di 0,0, poi di nuovo Invio per copiarlo di 0,0, su se stesso. SOTTRAI ne consuma poi uno dei due.
