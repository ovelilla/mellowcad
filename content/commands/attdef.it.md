---
title: "Comando DEFATT (ATTDEF) in AutoCAD"
description: "Come funziona DEFATT (ATTDEF, alias DE) di AutoCAD in italiano: definire un attributo di blocco, le sue modalità, etichetta, richiesta e valore. Provalo gratis."
figure: "Un cartellino di porta: l'attributo NUM centrato in un cerchio, la sua richiesta l'etichetta stessa e il suo valore predefinito 1, pronto per entrare in un blocco."
sourceHash: "f0fc3d8763e7"
---

DEFATT definisce un attributo: un'etichetta, una richiesta e un valore predefinito, posti nel disegno come una riga di testo. Selezionalo con gli altri oggetti quando crei un blocco con <Command id="BLOCK" />, e ogni riferimento a quel blocco contiene un valore proprio per esso: il numero di una porta, il codice di un pezzo, il nome di un locale. Fino ad allora la definizione mostra la sua etichetta.

DEFATT di AutoCAD apre la finestra Definizione attributo, che MellowCAD non ha: qui DEFATT chiede alla riga di comando ciò che chiede <Command id="-ATTDEF" />, come fa la console di AutoCAD. Mostra le modalità correnti e chiede quale cambiare, finché Invio prosegue. Poi l'etichetta: senza spazi, perché uno spazio la termina, e le minuscole diventano maiuscole; Invio da solo mostra <Message id="tagCannotBeNull" />. Poi la richiesta con cui <Command id="INSERT" /> chiederà il valore, con Invio che usa l'etichetta, e il valore predefinito. Infine, dove va il testo, con le domande di <Command id="TEXT" />: un punto iniziale, l'altezza e la rotazione. L'altezza e la giustificazione sono quelle di TESTO, condivise nei due sensi. Invio al punto iniziale colloca la definizione una riga sotto l'ultima definita, con la sua altezza, rotazione, stile e giustificazione, così gli attributi di un blocco si impilano uno sotto l'altro.

## Options

### Invisible

Il valore non si vede sui riferimenti, finché <Command id="ATTDISP" /> non lo attiva. Ogni modalità è un interruttore: sceglierla la commuta tra `Y` e `N`, scrive di nuovo le modalità e chiede ancora una volta. Le modalità restano impostate per il prossimo DEFATT.

### Constant

Ogni riferimento contiene lo stesso valore, che DEFATT chiede al posto di una richiesta e di un predefinito; INSER non lo chiede mai.

### Verify

INSER chiede il valore una seconda volta, per verificarlo, dopo aver chiesto ogni valore una volta.

### Preset

INSER non chiede il valore: ogni riferimento usa il predefinito.

### Lock position

Attiva all'inizio: l'attributo resta dove lo colloca il blocco.

### Justify

Chiede come è giustificato il testo rispetto al suo punto, come fa TESTO: <Keyword id="Left" />, <Keyword id="Center" />, <Keyword id="Right" />, <Keyword id="Middle" />, o uno dei nove punti per alto, medio e basso, sinistra, centro e destra. La richiesta del punto iniziale chiede poi il punto che nomina: centro medio centra il valore in un'etichetta.

### Style

Chiede lo stile di testo da usare, che diventa quello corrente; <Keyword id="?" /> elenca gli stili del disegno.

## Missing

La finestra Definizione attributo: DEFATT chiede alla riga di comando. Le modalità Annotativo e Righe multiple, che AutoCAD 2027 elenca dopo Blocca posizione, e le righe di un attributo multilinea. I campi, le giustificazioni Allinea e Adatta, e la `?` di Stile che chiede quali stili elencare.

## Questions

### Qual è la scorciatoia di DEFATT in AutoCAD?

`DE`, poi Invio o barra spaziatrice; anche `DDATTDEF`. `-DE` è <Command id="-ATTDEF" />, la forma da riga di comando, che qui esegue anche DEFATT. `_ATTDEF` funziona in tutte le lingue di AutoCAD.

### Come si crea un blocco con attributi in AutoCAD?

Disegna il simbolo, poi esegui DEFATT per ogni attributo e posiziona il suo testo dove deve comparire il valore. Esegui <Command id="BLOCK" />, indica un punto base e seleziona il simbolo e gli attributi, nell'ordine in cui INSER deve chiederli. Ogni <Command id="INSERT" /> del blocco chiede poi un valore per ogni attributo, proponendo il suo predefinito.

### Qual è la differenza tra etichetta, richiesta e valore predefinito?

L'etichetta dà il nome all'attributo, come identificatore: è ciò che la definizione mostra, e l'etichetta del campo in <Command id="EATTEDIT" />. La richiesta è la domanda con cui INSER chiede il suo valore. Il predefinito è il valore proposto, che Invio accetta.

### Come si modifica una definizione di attributo?

Fai doppio clic su di essa prima che entri in un blocco: <Command id="TEXTEDIT" /> ne apre l'etichetta, la richiesta e il valore predefinito. Una volta in un blocco, i valori di ogni riferimento si modificano con <Command id="ATTEDIT" /> o <Command id="EATTEDIT" />.
