---
title: "Comando LISTA (LIST) in AutoCAD"
description: "Come funziona LISTA (LIST, alias LI, LS) di AutoCAD in italiano: seleziona oggetti e leggi tipo, layer, colore, punti, lunghezza e area nella riga di comando."
figure: "LISTA del foro di una piastra: il layer, il centro, il raggio, la circonferenza e l'area del cerchio."
sourceHash: "d0ebcf466ff5"
---

LISTA (LIST in inglese) scrive nella riga di comando un rapporto su ogni oggetto che selezioni, nelle colonne e con le parole di AutoCAD 2027. Ogni rapporto inizia con il tipo, il layer e lo spazio, poi il colore, il tipo di linea, lo spessore di linea e l'altezza quando non sono DaLayer o zero, poi i dati propri del tipo: di una linea, le estremità, la lunghezza, l'angolo e i delta; di un cerchio, il centro, il raggio, la circonferenza e l'area; di un arco, gli angoli e la lunghezza; di una polilinea, i vertici, le larghezze, l'area e la lunghezza; di una spline, i punti di controllo e di adattamento; di un testo, lo stile, l'altezza e la giustificazione; di una quota, il tipo, i punti e lo stile; di un tratteggio, il modello, la scala e l'area; di un riferimento di blocco, il nome, il punto di inserimento, le scale e gli attributi; di una serie, le righe e gli elementi; di una regione, l'area, il perimetro e il riquadro di contorno.

I punti sono nell'UCS corrente, le lunghezze alla precisione del disegno e gli angoli alla precisione di AUPREC. Gli oggetti selezionati prima di LISTA vengono elencati subito, senza la richiesta, e Invio senza altro la termina in silenzio. Ogni riga arriva subito: la finestra di testo di AutoCAD si ferma a `Premere INVIO per continuare:` a ogni schermata, mentre la cronologia qui scorre. Non c'è nessuna riga `Handle`: qui gli oggetti non hanno handle.

## Missing

L'area di una polilinea aperta con adattamento a curva: qui è l'area della curva chiusa dalla sua corda, e quella di AutoCAD è maggiore. La lunghezza di una spline qui è esatta, dove quella di AutoCAD è un'approssimazione ravvicinata. Una DIMANGULAR creata da due linee viene elencata dai suoi tre punti, e nessuna quota è mai `associative: yes`. La pausa e la finestra di testo di AutoCAD. Ciò che qui gli oggetti non hanno: DaBlocco, uno spessore di linea Default, una scala del tipo di linea propria, la trasparenza e i gruppi.

## Questions

### Come si chiama il comando LIST in italiano?

LISTA, alias `LI` o `LS`, poi Invio o barra spaziatrice. Come in AutoCAD in italiano, il nome inglese funziona anche con il trattino basso davanti: `_LIST`.

### Che cosa mostra il comando LISTA?

Tutto ciò che LISTA di AutoCAD riporta sull'oggetto: il suo tipo, il layer, lo spazio e le proprietà che non sono DaLayer, poi la sua geometria, ogni punto e ogni lunghezza come numeri. Seleziona più oggetti e ciascuno riceve il suo rapporto.

### Come si trovano la lunghezza o l'area di un oggetto?

Elencalo con LISTA: la lunghezza di una linea, la circonferenza e l'area di un cerchio, la lunghezza o il perimetro e l'area di una polilinea. Per sommare più aree, usa <Command id="AREA" />.

### Come si vedono le coordinate degli estremi di una linea?

Elenca la linea con LISTA: il punto iniziale e quello finale, nell'UCS corrente. Per un singolo punto, <Command id="ID" /> con uno snap ad oggetto.

### Qual è la differenza tra LISTA e PROPRIETA?

LISTA scrive un rapporto che leggi e copi dalla cronologia. <Command id="PROPERTIES" /> mostra gli stessi valori in una tavolozza, dove puoi cambiarli.
