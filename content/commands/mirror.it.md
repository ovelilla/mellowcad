---
title: "Comando SPECCHIO (MIRROR) in AutoCAD"
description: "Come funziona SPECCHIO (MIRROR, alias SP) di AutoCAD in italiano, richiesta per richiesta: seleziona, due punti dell'asse, poi mantieni o cancella l'origine."
figure: "Un contorno chiuso riflesso rispetto a un asse di simmetria verticale, con l'origine mantenuta."
sourceHash: "fd4b7540311a"
---

SPECCHIO (MIRROR in inglese) riflette gli oggetti che selezioni rispetto a una linea: selezionali, indica il primo e il secondo punto dell'asse di simmetria, poi indica se cancellare gli oggetti di origine. Il riflesso è una copia, e con il valore predefinito, No, gli originali restano, ed è così che si disegna a metà un pezzo simmetrico. I due punti sono presi nella pianta dell'UCS, quindi un asse disegnato con Orto attivo riflette esattamente in orizzontale o in verticale. Come in AutoCAD con MIRRTEXT a 0, il suo valore predefinito, un testo continua a leggersi da sinistra a destra nel riflesso, e un tratteggio mantiene l'angolo del suo modello. L'operazione è un solo passaggio di annullamento.

## Options

### Yes

Cancella gli oggetti di origine, così resta solo il riflesso: un ribaltamento sul posto.

### No

Il valore predefinito: mantiene gli oggetti di origine accanto al loro riflesso.

## Missing

MIRRTEXT e MIRRHATCH restano a 0: un testo non viene mai specchiato in modo da leggersi al contrario, e il modello di un tratteggio non viene mai riflesso. Un testo dentro un riferimento di blocco specchiato torna a leggersi come un testo sciolto, dove AutoCAD lo specchia con il blocco. Un'ellisse specchiata mantiene la sua normale, quindi Angolo iniziale e Angolo finale risultano diversi da quelli di AutoCAD per la stessa curva. Mentre il riflesso segue il cursore, mostra il colore di ciascun oggetto, ma non il suo tipo di linea né il suo spessore di linea.

## Questions

### Come si chiama il comando MIRROR in italiano?

SPECCHIO, alias `SP`, poi Invio o barra spaziatrice; l'alias inglese `MI` in AutoCAD in italiano non esiste. Come in AutoCAD in italiano, il nome inglese funziona anche con il trattino basso davanti: `_MIRROR`.

### Come si specchia senza che il testo si legga al contrario?

Non devi fare nulla: come in AutoCAD con MIRRTEXT a 0, un testo specchiato continua a leggersi normalmente, collocato dove cade il riflesso del suo riquadro.

### Come si specchia e si cancella l'originale?

Rispondi <Keyword id="Yes" /> quando SPECCHIO chiede se cancellare gli oggetti di origine.

### Come si specchia in orizzontale o in verticale?

Attiva Orto (F8) e indica i due punti dell'asse di simmetria lungo l'asse rispetto al quale riflettere: una linea verticale scambia destra e sinistra, una orizzontale alto e basso.
