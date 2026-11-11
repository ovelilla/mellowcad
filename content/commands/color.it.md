---
title: "Comando COLORE (COLOR) in AutoCAD"
description: "Come COLORE (COLOR, alias CO) di AutoCAD imposta il colore dei nuovi oggetti: DaLayer, un colore indicizzato per nome o numero, o un colore RGB. Provalo gratis."
figure: "Una piastra disegnata DaLayer, il suo foro in rosso, il suo alesaggio nel colore RGB 0,128,255, poi COLORE riportato a DaLayer."
sourceHash: "93793c2915da"
---

COLORE imposta il colore con cui sono disegnati i nuovi oggetti. AutoCAD apre la finestra Seleziona colore; MellowCAD non ne ha ancora una, quindi COLORE esegue la forma da riga di comando che ha anche AutoCAD, <Command id="-COLOR" />. Chiede il colore predefinito degli oggetti, offrendo quello corrente, `BYLAYER` in un nuovo disegno: DaLayer significa che ogni oggetto prende il colore del suo layer, e un colore scelto invece è proprio dell'oggetto. Digita il numero di un colore indicizzato o il suo nome, oppure scegli <Keyword id="Truecolor" />. Invio conserva il colore corrente, e la modifica è un passo che <Command id="U" /> annulla.

Una parola che non sa leggere dice <Message id="colorRequired" />, e 0, un numero negativo o uno oltre 255 <Message id="invalidColorNumber" />; chiede di nuovo. Digitato con un apostrofo dentro un comando, `'COLOR`, ogni oggetto disegnato dopo prende il nuovo colore: ogni segmento di una <Command id="LINE" /> prende il colore corrente quando inizia. COLORE imposta solo ciò che viene dopo; la tavolozza Proprietà o l'elenco dei colori della barra superiore cambia gli oggetti già disegnati.

## Options

### Truecolor

Chiede un colore come tre valori da 0 a 255, rosso, verde e blu, separati da virgole senza spazi: `0,128,255` è un blu medio. Un colore che è anche un colore indicizzato, `255,0,0`, è memorizzato come quel colore indicizzato.

### BYLAYER

I nuovi oggetti prendono il colore del loro layer, come all'inizio.

### RED

Colore indicizzato 1, digitabile anche come `1`.

### YELLOW

Colore indicizzato 2, digitabile anche come `2`.

### GREEN

Colore indicizzato 3, digitabile anche come `3`.

### CYAN

Colore indicizzato 4, digitabile anche come `4`.

### BLUE

Colore indicizzato 5, digitabile anche come `5`.

### MAGENTA

Colore indicizzato 6, digitabile anche come `6`.

### WHITE

Colore indicizzato 7, digitabile anche come `7`: bianco su sfondo scuro e nero su sfondo chiaro.

## Missing

La finestra Seleziona colore, i libri di colori e la forma HSL. I colori indicizzati da 8 a 255: solo da 1 a 7 sono accettati. DaBlocco. Un colore RGB che corrisponde a un colore indicizzato è memorizzato come quel colore indicizzato, dove AutoCAD conserva l'RGB. La trasparenza (CETRANSPARENCY), e i predefiniti per tipo HPCOLOR, HPLAYER, DIMLAYER e TEXTLAYER.

## Questions

### Qual è la scorciatoia di COLORE in AutoCAD?

`CO`, poi Invio o barra spaziatrice; anche `DDCOLOR`. Funziona anche il nome completo, e `_COLOR` in tutte le lingue di AutoCAD. Attenzione: in AutoCAD italiano `CO` è COLORE, mentre COPIA è `CP`.

### Come si cambia il colore di un oggetto in AutoCAD?

Selezionalo e scegli il colore nell'elenco dei colori della barra superiore o nella riga Colore della tavolozza Proprietà: cambia in un solo passo. Oppure copia il colore di un altro oggetto con <Command id="MATCHPROP" />. COLORE imposta solo il colore degli oggetti disegnati dopo.

### Che cosa significa DaLayer in AutoCAD?

Che l'oggetto prende il colore del suo layer, quindi cambiare il colore del layer in Gestore proprietà layer cambia ogni oggetto DaLayer su di esso. È il predefinito, e mantiene i colori di un disegno organizzati per layer: <Command id="LAYER" />.

### Come si usano i colori RGB in AutoCAD?

Scegli <Keyword id="Truecolor" /> e digita i tre valori separati da virgole, come `0,128,255`.
