---
title: "Comando INTERSEZIONE (INTERSECT) in AutoCAD"
description: "Come funziona INTERSEZIONE (INTERSECT, alias IT) di AutoCAD in italiano: due o più solidi 3D, o regioni in un piano, ridotti a ciò che condividono. Provalo."
figure: "Un parallelepipedo e una sfera che lo sovrappone, intersecati: ciò che condividono è una palla con sei facce piane, vista da sud-est."
sourceHash: "c8ea61c0525d"
---

INTERSEZIONE (INTERSECT in inglese) mantiene solo ciò che due o più solidi 3D hanno in comune, o due o più regioni in un piano, ed elimina il resto: un parallelepipedo e una sfera che lo sovrappone lasciano una palla con facce piane. Chiede oggetti fino a Invio, come fa <Command id="UNION" />, e salta ciò che non è né un solido né una regione. Come in AutoCAD 2027, un insieme selezionato prima viene scartato e richiesto di nuovo. Solidi e regioni sono calcolati separatamente, le regioni piano per piano.

L'oggetto selezionato per primo diventa il risultato, con il suo layer e il suo colore, e gli altri vengono cancellati; con una finestra, un'intercetta o Tutti è il più recente tra essi. Il risultato è un solido composto, non più un parallelepipedo o una sfera, senza cronologia. Quando gli oggetti non hanno nulla in comune dice <Message id="nullSolid" /> o <Message id="nullRegion" /> e li cancella tutti, come fa AutoCAD. L'intero comando è un solo passo di annullamento. Il 3D di MellowCAD è ancora parziale: esistono i solidi, non le superfici e le mesh.

## Missing

Le superfici, che qui non esistono. Facce curve che si incontrano lungo una curva per la quale MellowCAD non ha ancora una forma esatta: cilindri, coni, sfere o tori i cui assi non coincidono né sono paralleli (due cilindri possono anche incrociarsi); un cono con qualunque cosa diversa da un piano o da un solido sul suo asse; un toro o un solido di rivoluzione con un piano né perpendicolare al suo asse né passante per esso, o con un solido fuori dal suo asse; un solido estruso con qualunque cosa diversa da un piano o da una faccia estrusa nella sua direzione. Questi vengono rifiutati con un messaggio che dice che un'operazione booleana è fallita, con i solidi lasciati com'erano; così pure un taglio che incontra uno spigolo in modo tangente, facce quasi ma non del tutto su una stessa superficie, e una scheggia molto sottile tra un taglio e uno spigolo. Un cilindro appoggiato lungo la faccia di un parallelepipedo si unisce nel volume giusto, ma con uno spigolo e una faccia in meno di quelli di AutoCAD. Nessuna cronologia dei solidi viene conservata (SOLIDHIST, SHOWHISTORY), e quale oggetto mantengano Fence o Previous non è verificato.

## Questions

### Come si chiama il comando INTERSECT in italiano?

INTERSEZIONE, alias `IT`, poi Invio o barra spaziatrice. Come in AutoCAD in italiano, il nome inglese funziona anche con il trattino basso davanti: `_INTERSECT`.

### Qual è la differenza tra UNIONE, SOTTRAI e INTERSEZIONE?

Tutti e tre fanno un solo oggetto di solidi 3D, o di regioni in un piano. <Command id="UNION" /> mantiene tutto ciò che uno qualunque di essi copre, <Command id="SUBTRACT" /> mantiene il primo insieme meno il secondo, e INTERSEZIONE mantiene solo ciò che tutti condividono. Ciascuno è un solo passo di annullamento, e ciascuno cancella gli oggetti che ha consumato.

### Come si intersecano delle linee in AutoCAD?

Non con INTERSEZIONE, che lavora su solidi e regioni e salta le linee. Per trovare dove due linee si incrociano, agganciati ad esso con lo snap ad oggetto Intersezione; per farle incontrare, usa <Command id="FILLET" /> con raggio 0, <Command id="TRIM" /> oppure <Command id="EXTEND" />.

### Perché INTERSEZIONE cancella i miei oggetti?

Perché non hanno nulla in comune: senza una parte condivisa dice <Message id="nullSolid" />, o <Message id="nullRegion" /> per le regioni, e li cancella, come fa AutoCAD. <Command id="U" /> li riporta indietro. Un solido e una regione, o due regioni in piani diversi, non vengono intersecati affatto: dice <Message id="booleanNeedsTwo" /> e non cambia nulla.
