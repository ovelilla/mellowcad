---
title: "Comando TLINEA (LINETYPE) in AutoCAD"
description: "Come funziona TLINEA (LINETYPE, alias TL) di AutoCAD in italiano: il tipo di linea corrente, quelli caricati, DaLayer, e perché un tratteggio sembra continuo."
figure: "Una piastra il cui foro è disegnato con HIDDEN corrente e i suoi due assi con CENTER, poi TLINEA riportato a DaLayer."
sourceHash: "1cae7261efc0"
---

TLINEA (LINETYPE in inglese) imposta il tipo di linea con cui vengono disegnati i nuovi oggetti. AutoCAD apre il Gestione tipo di linea; MellowCAD non ne ha ancora uno, quindi TLINEA esegue la forma da riga di comando che ha anche AutoCAD, <Command id="-LINETYPE" />. Dice il tipo di linea corrente, `DaLayer` all'inizio, e chiede di nuovo un'opzione dopo ogni risposta, finché Invio la termina. DaLayer significa che ogni oggetto prende il tipo di linea del proprio layer; un tipo di linea indicato per nome è invece quello proprio dell'oggetto. L'intera sessione è un solo passo che <Command id="U" /> annulla, e digitato con un apostrofo dentro un comando, il suo tipo di linea si applica a ciò che quel comando disegna dopo.

Ogni disegno ha sei tipi di linea caricati: Continuous e, dal file metrico di AutoCAD acadiso.lin, DASHED, HIDDEN, CENTER, PHANTOM e DASHDOT. Un modello viene posato su ogni linea come lo posa AutoCAD, centrato lungo la sua lunghezza con tratti uguali alle due estremità.

## Options

### ?

Elenca i tipi di linea in due colonne, nome e descrizione. Al prompt delle opzioni, quelli di acadiso.lin; al prompt di Set, quelli caricati nel disegno i cui nomi corrispondono a ciò che digiti, tutti con `*`.

### Set

Chiede il nome del tipo di linea, proponendo quello corrente; digita il nome di un tipo di linea caricato, oppure <Keyword id="BYLayer" />. Un nome che non è caricato non viene trovato, come lo dice AutoCAD, e torna il prompt delle opzioni; Invio mantiene quello corrente.

## Missing

Il Gestione tipo di linea, e caricare, creare o descrivere tipi di linea: esistono solo i sei sopra, e l'elenco descrive soltanto Continuous. Una scala del tipo di linea per ogni oggetto (CELTSCALE): solo quella del disegno, <Command id="LTSCALE" />. DaBlocco. PSLTSCALE e MSLTSCALE, perché non esiste lo spazio carta. I nomi dei tipi di linea di AutoCAD in italiano: qui sono in inglese in tutte le lingue. PLINEGEN: una nuova polilinea ricomincia il suo modello a ogni vertice, a meno che l'opzione <Keyword command="PEDIT" id="Ltype gen" /> di <Command id="PEDIT" /> non lo attivi.

## Questions

### Come si chiama il comando LINETYPE in italiano?

TLINEA, alias `TL`, poi Invio o barra spaziatrice; anche `TLIN` e `DDLTYPE`, mentre l'alias inglese `LT` in AutoCAD in italiano non esiste. Come in AutoCAD in italiano, il nome inglese funziona anche con il trattino basso davanti: `_LINETYPE`.

### Perché la mia linea tratteggiata sembra continua?

Una linea più corta di una ripetizione del suo modello viene disegnata continua, come in AutoCAD: il modello di CENTER è lungo circa 51 unità alla scala predefinita. Aumenta o diminuisci <Command id="LTSCALE" /> per adattare il modello al disegno. Controlla anche che il tipo di linea dell'oggetto, o quello del suo layer quando è DaLayer, non sia Continuous.

### Come si cambia il tipo di linea di un oggetto esistente?

Selezionalo e scegli il tipo di linea nella riga Tipo di linea della tavolozza Proprietà, oppure copialo da un altro oggetto con <Command id="MATCHPROP" />. TLINEA imposta solo il tipo di linea degli oggetti disegnati dopo di esso.

### Come si cambia la scala del tipo di linea in AutoCAD?

Digita <Command id="LTSCALE" /> e il nuovo fattore: 2 rende ogni tratto lungo il doppio, in tutto il disegno.
