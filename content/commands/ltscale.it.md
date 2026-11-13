---
title: "Comando SCALATL (LTSCALE) in AutoCAD"
description: "Come funziona SCALATL (LTSCALE, alias CT) di AutoCAD in italiano: la scala del tipo di linea per tutto il disegno, così i tratti si vedono a ogni dimensione."
before: "Una piastra lunga 4 metri, il suo foro disegnato con HIDDEN e i suoi assi con CENTER, alla scala predefinita del tipo di linea di 1: i tratti troppo fini per vedersi."
figure: "La stessa piastra dopo SCALATL 20: i tratti del foro e degli assi disegnati 20 volte più lunghi."
sourceHash: "33b956c956fa"
---

SCALATL (LTSCALE in inglese) imposta il fattore di scala globale dei tipi di linea: quanto sono lunghi i tratti e gli spazi di ogni tipo di linea tratteggiato nel disegno. Chiede il nuovo fattore, proponendo quello corrente, 1,0000 in un nuovo disegno: 2 rende ogni tratto lungo il doppio, 0,5 la metà. Il fattore deve essere maggiore di 0, altrimenti segnala <Message id="positiveNonzero" /> e chiede di nuovo, e `1/2` e `1e3` vengono letti come numeri. Una modifica rigenera tutto il disegno, `Rigenerazione modello in corso.` come la scrive AutoCAD 2027, e viene salvata con il disegno; è un passaggio che <Command id="U" /> annulla. Digitato con un apostrofo dentro un comando, `'SCALATL`, il disegno viene rigenerato quando quel comando termina.

I tipi di linea sono modelli pensati per un disegno della dimensione del foglio: in un disegno largo 4 metri, in millimetri, il modello di CENTER, lungo circa 51 unità, si ripete un'ottantina di volte, troppo fitto per vedersi, e una linea più corta di un modello viene disegnata continua. La scala da usare è di solito quella del disegno stesso: 20 per un disegno da leggere in 1:20, 50 in 1:50.

## Missing

La finestra Gestione tipo di linea, il cui Fattore di scala globale è SCALATL e la Scala oggetto corrente CELTSCALE. PSLTSCALE e MSLTSCALE, perché non esiste lo spazio carta. Le forme dei tipi di linea complessi come BATTING, disegnate come i loro spazi.

## Questions

### Come si chiama il comando LTSCALE in italiano?

SCALATL, alias `CT`, poi Invio o barra spaziatrice; l'alias inglese `LTS` in AutoCAD in italiano non esiste. Come in AutoCAD in italiano, il nome inglese funziona anche con il trattino basso davanti: `_LTSCALE`.

### Perché la mia linea tratteggiata sembra continua?

Il suo modello non si adatta al disegno alla scala corrente. Una linea più corta di una ripetizione del suo modello viene disegnata continua; una lunga a una scala piccola stringe tanto i suoi tratti da sembrare continua. Aumenta SCALATL per un disegno grande, diminuiscila per uno piccolo, finché i tratti si vedono.

### Quale SCALATL devo usare?

La scala del disegno: in un disegno in millimetri da leggere in 1:50, `50`. Per un disegno della dimensione del foglio, 1.

### Qual è la differenza tra SCALATL e il tipo di linea stesso?

Il tipo di linea, impostato con <Command id="LINETYPE" /> o con il layer, è il modello: tratti, punti e spazi. SCALATL è quanto viene disegnato lungo quel modello, lo stesso fattore per ogni oggetto del disegno.
