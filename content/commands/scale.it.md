---
title: "Comando SCALA (SCALE) in AutoCAD"
description: "Come funziona SCALA (SCALE, alias SS) di AutoCAD, richiesta per richiesta: un fattore, Copia e Riferimento per una lunghezza nota. Provalo online nel browser."
figure: "Una piastra e il suo foro scalati su una copia con Riferimento, attorno al suo angolo: lo spigolo lungo 40 indicato, poi portato a 60."
sourceHash: "005829bf17ad"
---

SCALA (SCALE) ingrandisce o riduce gli oggetti che selezioni attorno a un punto base, che resta dov'è: un fattore di 2 li raddoppia, 0,5 li dimezza, allo stesso modo in ogni direzione. Seleziona gli oggetti, indica il punto base, poi digita il fattore, oppure muovi il cursore e indica un punto: gli oggetti lo seguono. Invio a quel punto, senza digitare nulla, scala con l'ultimo fattore usato. Ogni esecuzione è un solo passaggio di annullamento.

Scala tutto ciò che seleziona, come fa AutoCAD: il modello di un tratteggio cresce con il suo contorno, una quota misura la sua nuova lunghezza, un oggetto sopra il piano scala anche in Z attorno al punto base.

## Options

### Copy

Scala una copia e lascia gli oggetti com'erano: segnala <Message id="scalingCopy" /> e chiede di nuovo il fattore, con <Keyword id="Copy" /> ancora in elenco.

### Reference

Chiede una lunghezza di riferimento, digitata o indicata con due punti, poi la lunghezza che deve avere: il fattore è il rapporto tra la nuova lunghezza e il riferimento. La nuova lunghezza si digita, oppure è un punto la cui distanza dal punto base la stabilisce; <Keyword id="Points" /> chiede invece due punti e misura tra loro. Entrambe le lunghezze propongono le ultime indicate, 1 in un nuovo disegno.

## Missing

Invio al primo o al secondo punto di <Keyword id="Points" /> termina il comando senza scalare, dove AutoCAD scala con la lettura del cursore in quel punto. Un fattore minuscolo viene applicato in silenzio, dove AutoCAD segnala che lo ignora. Gli oggetti trascinati sono disegnati come li trascina <Command id="MOVE" />, solo nel loro colore.

## Questions

### Qual è l'alias di SCALA in AutoCAD?

`SS`, poi Invio o barra spaziatrice. `_SCALE` funziona in qualsiasi lingua di AutoCAD.

### Come si scala con un riferimento in AutoCAD?

Scegli <Keyword id="Reference" /> al fattore, indica i due estremi di uno spigolo di cui conosci la lunghezza, poi digita la lunghezza che deve avere. Tutto ciò che è selezionato viene scalato in base al rapporto tra la nuova lunghezza e la vecchia, quindi un disegno di dimensione errata si corregge partendo da una sola quota nota.

### Come si scala un oggetto conservando l'originale?

Scegli <Keyword id="Copy" /> al fattore: la copia viene scalata, l'originale resta dov'era.

### Come si cambia la scala del tipo di linea?

Non con SCALA, che ridimensiona gli oggetti: <Command id="LTSCALE" /> stabilisce quanto sono lunghi i tratti e gli spazi di ogni tipo di linea.

### Come si imposta una scala di stampa o di layout?

MellowCAD non ha layout, viewport né stampa: disegni in scala 1:1 nello spazio modello, e SCALA cambia la dimensione degli oggetti stessi, non come verrebbero stampati.
