---
title: "Comando TLINEA (LINETYPE) in AutoCAD"
description: "TLINEA (LINETYPE, alias TL) di AutoCAD in italiano: caricare tipi di linea da acadiso.lin, quello corrente, DaLayer, e perché un tratteggio sembra continuo."
figure: "Una piastra il cui foro è disegnato con HIDDEN corrente e i suoi due assi con CENTER, poi TLINEA riportato a DaLayer."
sourceHash: "d15530a865c1"
---

TLINEA (LINETYPE in inglese) imposta il tipo di linea con cui vengono disegnati i nuovi oggetti. AutoCAD apre la finestra Gestione tipo di linea; MellowCAD non ne ha ancora uno, quindi TLINEA esegue la forma da riga di comando che ha anche AutoCAD, <Command id="-LINETYPE" />. Indica il tipo di linea corrente, `DaLayer` all'inizio, e chiede di nuovo un'opzione dopo ogni risposta, finché Invio la termina. DaLayer significa che ogni oggetto prende il tipo di linea del proprio layer; un tipo di linea indicato per nome è invece quello proprio dell'oggetto. L'intera sessione è un solo passo che <Command id="U" /> annulla, e digitato con un apostrofo dentro un comando, il suo tipo di linea si applica a ciò che quel comando disegna dopo.

Un disegno contiene i propri tipi di linea, salvati con esso e nel suo DXF. Uno nuovo ne ha sei: Continuous e, dal file metrico di AutoCAD acadiso.lin, DASHED, HIDDEN, CENTER, PHANTOM e DASHDOT; gli altri si caricano da acadiso.lin, e un DXF porta i propri, anche ISO e complessi, il cui testo, come il `GAS` di GAS_LINE, viene disegnato lungo la linea. Un modello viene applicato a ogni linea come lo applica AutoCAD, centrato lungo la sua lunghezza con tratti uguali alle due estremità, in scala secondo <Command id="LTSCALE" /> e la scala del tipo di linea propria dell'oggetto, che impostano <Command id="CHPROP" /> e la tavolozza Proprietà e che CELTSCALE assegna ai nuovi oggetti.

## Options

### ?

Elenca i tipi di linea in due colonne, nome e descrizione. Alla richiesta delle opzioni chiede quale file elencare, acadiso.lin per impostazione predefinita o acad.lin, il file di AutoCAD in pollici, ed elenca i suoi tipi di linea nell'ordine del file; alla richiesta di Set, quelli caricati nel disegno i cui nomi corrispondono a ciò che digiti, tutti con `*`, in ordine di nome.

### Load

Chiede quali tipi di linea caricare, un nome o più separati da virgole, anche con caratteri jolly (`DASH*`), poi in quale file cercarli, acadiso.lin all'inizio e poi l'ultimo in cui hai cercato. Ognuno trovato viene caricato e indicato, nell'ordine del file; per uno già caricato chiede prima conferma, e <Keyword id="Yes" />, il valore predefinito, lo carica di nuovo. Un nome che il file non ha, o un file diverso da acadiso.lin e acad.lin, viene segnalato.

### Set

Chiede il nome del tipo di linea, proponendo quello corrente; digita il nome di un tipo di linea caricato, oppure <Keyword id="BYLayer" />. Uno che acadiso.lin contiene viene prima caricato, come fa AutoCAD; qualsiasi altro non viene trovato, come lo scrive AutoCAD, e torna la richiesta delle opzioni. Invio mantiene quello corrente.

## Missing

La finestra Gestione tipo di linea, e creare tipi di linea o caricarli da un file tuo. Le forme dei tipi di linea complessi come BATTING o ZIGZAG, disegnate come gli spazi che occupano. DaBlocco. PSLTSCALE e MSLTSCALE, perché non esiste lo spazio carta. L'acadiso.lin dell'AutoCAD di ogni lingua, i cui nomi carica AutoCAD in italiano (TRATTEGGIATA): <Keyword id="Load" /> legge quello inglese in tutte le lingue, anche se un disegno fatto con essi si apre con i propri. PLINEGEN: una nuova polilinea ricomincia il suo modello a ogni vertice, a meno che l'opzione <Keyword command="PEDIT" id="Ltype gen" /> di <Command id="PEDIT" /> non lo attivi.

## Questions

### Come si chiama il comando LINETYPE in italiano?

TLINEA, alias `TL`, poi Invio o barra spaziatrice; anche `TLIN` e `DDLTYPE`, mentre l'alias inglese `LT` in AutoCAD in italiano non esiste. Come in AutoCAD in italiano, il nome inglese funziona anche con il trattino basso davanti: `_LINETYPE`.

### Perché la mia linea tratteggiata sembra continua?

Una linea più corta di una ripetizione del suo modello viene disegnata continua, come in AutoCAD: il modello di CENTER è lungo circa 51 unità alla scala predefinita. Aumenta o diminuisci <Command id="LTSCALE" /> per adattare il modello al disegno. Controlla anche che il tipo di linea dell'oggetto, o quello del suo layer quando è DaLayer, non sia Continuous.

### Come si cambia il tipo di linea di un oggetto esistente?

Selezionalo e scegli il tipo di linea nella riga Tipo di linea della tavolozza Proprietà, oppure copialo da un altro oggetto con <Command id="MATCHPROP" />. TLINEA imposta solo il tipo di linea degli oggetti disegnati dopo di esso.

### Come si cambia la scala del tipo di linea in AutoCAD?

Digita <Command id="LTSCALE" /> e il nuovo fattore: 2 rende ogni tratto lungo il doppio, in tutto il disegno.

### Come si carica un tipo di linea in AutoCAD?

AutoCAD ne carica uno nella finestra Gestione tipo di linea. Qui digita `-TLINEA`, scegli <Keyword id="Load" />, digita il nome del tipo di linea, come `HIDDEN2` o `ACAD_ISO02W100`, e premi Invio per cercarlo in acadiso.lin. <Keyword id="Set" /> carica uno che acadiso.lin contiene mentre lo rende corrente.
