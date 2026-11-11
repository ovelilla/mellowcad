---
title: "Comando TESTO (TEXT) in AutoCAD"
description: "Come funziona TESTO (TEXT, alias TD) di AutoCAD: punto iniziale, altezza e rotazione, Giustifica e Stile, un oggetto per riga. Provalo."
figure: "Due righe di testo su riga singola centrate in un riquadro, giustificate al centro: ogni riga è un oggetto a sé."
sourceHash: "44d0e1a420a7"
---

TESTO (TEXT) scrive testo su riga singola. Indichi un punto iniziale, un'altezza e un angolo di rotazione, poi digiti una riga e premi Invio: la riga diventa un oggetto a sé, e la successiva inizia una riga sotto. Una riga vuota termina il comando. Un clic altrove prima di quel momento fa iniziare le righe successive in quel punto, ed Esc conserva le righe già inserite e scarta quella che stai digitando. Per un paragrafo che va a capo a una larghezza, come un solo oggetto, usa <Command id="MTEXT" />.

La prima riga indica lo stile, l'altezza e la giustificazione correnti. L'altezza è quella che condivide con <Command id="MTEXT" /> e <Command id="ATTDEF" />, conservata nel disegno, e il TESTO successivo la propone come valore predefinito; uno stile con un'altezza propria salta la richiesta dell'altezza. Invio al punto iniziale prosegue sotto l'ultima riga che TESTO ha scritto, senza chiedere di nuovo l'altezza o l'angolo. U annulla l'intera esecuzione.

## Options

### Justify

Chiede a quale punto è ancorato il testo rispetto al suo punto di inserimento: <Keyword id="Left" /> (il valore predefinito), <Keyword id="Center" />, <Keyword id="Right" />, <Keyword id="Middle" />, o uno dei nove punti, alto, medio e basso per sinistra, centro e destra, come li elenca la richiesta. La richiesta del punto iniziale chiede poi il punto indicato dalla giustificazione: per il centro medio, il punto medio. Come in AutoCAD, i nove vengono accettati anche senza essere elencati alla prima richiesta, quindi digitare lì le lettere del centro medio chiede subito il punto medio. La giustificazione si conserva nel disegno per il TESTO successivo.

### Style

Chiede il nome dello stile di testo da rendere corrente, con Invio che mantiene quello corrente. <Keyword id="?" /> elenca gli stili del disegno; un nome che il disegno non ha viene rifiutato e chiesto di nuovo. Gli stili si creano nella tavolozza che apre <Command id="STYLE" />.

## Missing

Le giustificazioni Allinea e Adatta. Il <Keyword id="?" /> di Stile elenca tutti gli stili insieme, senza chiedere quali e senza pause a ogni pagina. Il testo si digita nella casella dell'input dinamico, non con un cursore sul disegno, e il suo contenuto non si può riscrivere nella tavolozza Proprietà, che non ha nemmeno le righe Annotativo, Fattore di larghezza, Obliquità, Capovolto e All'indietro. Un clic dentro il riquadro di un testo lo seleziona anche fuori dalle sue lettere, dove AutoCAD non seleziona nulla.

## Questions

### Qual è l'alias di TESTO in AutoCAD?

`TD`, poi Invio o barra spaziatrice; funzionano anche `T` e `TESTODIN`, e `_TEXT` in qualsiasi lingua di AutoCAD. Il testo multilinea è un altro comando: <Command id="MTEXT" /> ha `TSM`.

### Come si allinea il testo in AutoCAD?

Scegli <Keyword id="Justify" /> alla prima richiesta, o digita lì le lettere della giustificazione, poi indica il punto che essa richiede: il centro medio mette il centro di ogni riga sul suo punto, come un'etichetta va al centro di un riquadro. Per far correre il testo lungo una linea inclinata, digita quell'angolo alla richiesta della rotazione.

### Qual è la differenza tra TESTO e TESTOM?

TESTO crea un oggetto per riga, ciascuno spostato, modificato e giustificato separatamente, e non va mai a capo. <Command id="MTEXT" /> crea un oggetto di paragrafi che vanno a capo alla larghezza di un riquadro, giustificati nel loro insieme. Entrambi condividono l'altezza del testo e gli stili di testo.

### Come si modifica il testo in AutoCAD?

Fai doppio clic: <Command id="TEXTEDIT" /> lo apre per riscriverlo, poi chiede il testo successivo da modificare finché non premi Esc. L'altezza e la rotazione sono righe della tavolozza Proprietà, e i suoi grip lo spostano.
