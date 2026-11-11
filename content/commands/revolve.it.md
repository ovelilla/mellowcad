---
title: "Comando RIVOLUZIONE (REVOLVE) in AutoCAD"
description: "Come RIVOLUZIONE (REVOLVE, alias RIV) di AutoCAD ruota un profilo 2D attorno a un asse in un solido 3D: l'asse, Oggetto, X, Y, Z. Provalo."
figure: "Un profilo con flangia ruotato di un giro intero attorno all'asse Y: un rocchetto, visto da sud-est nello stile visivo Nascosto."
sourceHash: "dc0576311912"
---

RIVOLUZIONE (REVOLVE) ruota profili 2D chiusi attorno a un asse in solidi 3D: un rettangolo con un lato sull'asse crea un cilindro, un cerchio accanto all'asse un anello. Seleziona i profili, cerchi, ellissi, polilinee o spline chiuse, regioni, e premi Invio; indica l'asse con due punti o con una delle sue opzioni, poi l'angolo, con Invio per un giro intero. Ogni profilo diventa un solido sul layer corrente e viene cancellato, come DELOBJ stabilisce per impostazione predefinita. L'intero comando è un solo passo che Annulla ripristina.

L'asse giace nel piano del profilo, con tutto il profilo da un lato, oppure il comando termina con <Message id="revolveOneSide" /> prima che venga chiesto un angolo. L'angolo ruota secondo la regola della mano destra attorno all'asse, dal suo primo punto al secondo; uno negativo ruota nell'altro senso. Il 3D di MellowCAD è solo solidi, e ancora parziale: i profili aperti, che AutoCAD trasforma in superfici, vengono rifiutati.

## Options

### MOde

Chiede <Keyword id="SOlid" /> o <Keyword id="SUrface" />, come fa <Command id="EXTRUDE" />: non essendoci ancora oggetti superficie, viene accettato solo <Keyword id="SOlid" />, il valore predefinito.

### Object

Il valore predefinito del prompt dell'asse, quindi Invio lo sceglie: indica una linea, una polilinea, un arco o una spline, e l'asse corre dritto tra i suoi due estremi, dall'estremo più vicino al tuo punto. Un oggetto chiuso non ha estremi: <Message id="revolveClosedAxis" />, e il comando termina.

### X

L'asse X dell'UCS, passante per la sua origine.

### Y

L'asse Y dell'UCS, passante per la sua origine: un profilo disegnato alla sua destra, come nella sessione, diventa un pezzo disteso lungo Y.

### Z

L'asse Z dell'UCS, passante per la sua origine. Un profilo sul piano XY dell'UCS è perpendicolare a esso, quindi RIVOLUZIONE risponde <Message id="revolvePerpendicular" /> e termina: Z serve per un profilo in piedi.

### STart

Al prompt dell'angolo: l'angolo da cui partire, il cui valore predefinito è sempre 0. Il profilo viene prima ruotato fin lì, poi l'angolo viene chiesto di nuovo.

### Reverse

Gira l'asse, così l'angolo corre nell'altro senso, e chiede di nuovo l'angolo.

### EXpression

L'angolo come espressione aritmetica, come in <Command id="EXTRUDE" />.

## Missing

Un asse fuori dal piano del profilo, attorno al quale AutoCAD ruota il profilo in superfici: qui RIVOLUZIONE dice <Message id="revolveUnable" /> e termina. Un arco ellittico o uno spigolo di un solido come asse Oggetto. La modalità SUperficie e i profili aperti, non essendoci ancora oggetti superficie. L'anteprima che ruota con il cursore: mentre indichi l'angolo viene mostrato l'intero giro. <Command id="EXPLODE" /> di un solido di rivoluzione, che AutoCAD trasforma in superfici e regioni. I suoi grip, e il suo angolo modificato nella tavolozza Proprietà.

## Questions

### Qual è l'alias di RIVOLUZIONE in AutoCAD?

`RIV`, poi Invio o barra spaziatrice. Funziona anche il nome completo, e `_REVOLVE` in qualsiasi lingua di AutoCAD.

### Come si ruota un profilo attorno a un asse?

Disegna metà della sezione come un unico oggetto chiuso accanto alla linea dell'asse, una polilinea chiusa o una regione. Esegui RIVOLUZIONE, seleziona il profilo e premi Invio; premi di nuovo Invio per <Keyword id="Object" /> e indica la linea dell'asse, oppure indica i suoi due estremi; poi Invio per un giro intero.

### Perché RIVOLUZIONE non funziona?

Il più delle volte l'asse attraversa il profilo: RIVOLUZIONE dice <Message id="revolveOneSide" /> e termina. Sposta l'asse sullo spigolo del profilo o oltre; uno spigolo sull'asse è ammesso. Un asse perpendicolare al piano del profilo riceve <Message id="revolvePerpendicular" />, e un profilo aperto viene rifiutato, perché MellowCAD non ha ancora superfici.

### Come si ruota solo una parte di giro?

Digita l'angolo, 90 o 270, al prompt dell'angolo. <Keyword id="STart" /> fa iniziare la rotazione più avanti, e <Keyword id="Reverse" /> la fa girare nell'altro senso.
