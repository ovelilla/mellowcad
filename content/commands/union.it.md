---
title: "Comando UNIONE (UNION) in AutoCAD"
description: "Come funziona UNIONE (UNION, alias UNI) di AutoCAD: solidi 3D, o regioni in un piano, uniti in un solo oggetto, cosa ignora e perché ne chiede due. Provalo."
figure: "Due parallelepipedi che si sovrappongono, uniti in un solo solido da UNIONE: visti da sud-est, con le linee nascoste rimosse."
sourceHash: "be43813a7dee"
---

UNIONE (UNION) unisce due o più solidi 3D in un solo solido, o due o più regioni che giacciono in un piano in una sola regione: dove si sovrappongono conta una volta sola, e gli spigoli interni spariscono. Chiede oggetti, quanti ne vuoi, e Invio li combina. Come in AutoCAD 2027, un insieme selezionato prima viene scartato e chiesto di nuovo, e ciò che non è né un solido né una regione viene ignorato. Solidi e regioni vengono combinati separatamente: tutti i solidi in uno, le regioni piano per piano.

L'oggetto indicato per primo diventa il risultato, con il suo layer e colore, e gli altri vengono cancellati; con una finestra, un'intersezione o ALL è il più recente tra essi. Il risultato è un solido composto: non più un parallelepipedo o un cilindro, senza cronologia (<Command id="LIST" /> mostra History = None), e selezionato mostra un grip, che lo sposta per intero. Solidi che non si toccano diventano un solo oggetto di due pezzi. L'intero comando è un solo passaggio di annullamento. Il 3D di MellowCAD è ancora parziale: i solidi ci sono, le superfici e le mesh no.

## Missing

Superfici, che qui non esistono. Facce curve che si incontrano lungo una curva per cui MellowCAD non ha ancora una forma esatta: cilindri, coni, sfere o tori i cui assi non coincidono né corrono paralleli (due cilindri possono anche incrociarsi); un cono con qualsiasi cosa che non sia un piano o un solido sul suo asse; un toro o un solido di rivoluzione con un piano né perpendicolare al suo asse né passante per esso, o con un solido fuori dal suo asse; un solido estruso con qualsiasi cosa che non sia un piano o una faccia estrusa nella sua direzione. Questi vengono rifiutati, e i solidi lasciati com'erano; così pure un taglio che incontra uno spigolo in modo tangente, facce quasi ma non del tutto su una stessa superficie, e una scheggia molto sottile tra un taglio e uno spigolo. Un cilindro appoggiato alla faccia di un parallelepipedo si unisce nel volume giusto, ma con uno spigolo e una faccia in meno di quelli di AutoCAD. Non viene conservata alcuna cronologia dei solidi (SOLIDHIST, SHOWHISTORY).

## Questions

### Qual è l'alias di UNIONE in AutoCAD?

`UNI`, poi Invio o barra spaziatrice. Funziona anche il nome completo, e `_UNION` in qualsiasi lingua di AutoCAD.

### Perché UNIONE non funziona?

Servono due solidi, o due regioni nello stesso piano: con meno segnala <Message id="booleanNeedsTwo" /> e non cambia nulla. Linee, archi e polilinee non sono regioni, nemmeno se chiuse: rendile prima regioni con <Command id="REGION" />. Gli oggetti selezionati prima di UNIONE vengono scartati, come in AutoCAD 2027: selezionali alla sua richiesta. Quando segnala il fallimento di un'operazione booleana, i solidi si incontrano in un modo che MellowCAD non sa ancora calcolare, e vengono lasciati com'erano.

### Come si annulla una UNIONE?

<Command id="U" />, o Ctrl+Z, subito dopo: l'intero comando torna indietro in un solo passaggio, con gli oggetti com'erano. Più tardi non c'è nulla da separare, poiché il solido combinato non conserva traccia delle sue parti. L'operazione opposta è <Command id="SUBTRACT" />, che toglie solidi invece di aggiungerli.

### Come si uniscono regioni con UNIONE?

Rendi ogni forma chiusa una regione con <Command id="REGION" />, poi UNIONE: le regioni di ogni piano diventano una sola regione, con i lati condivisi uniti. Forme che si chiudono attorno a un vuoto lasciano un foro, e regioni separate diventano una sola regione di pezzi separati. Una regione sola nel suo piano resta com'è.
