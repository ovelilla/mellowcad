---
title: "Comando VISTA (VIEW) in AutoCAD"
description: "Come VISTA (VIEW, V, -VIEW) di AutoCAD passa alle sei viste ortogonali e alle quattro assonometriche, e quale UCS imposta ogni vista ortogonale. Provalo online."
figure: "Un blocco a gradini disegnato in pianta: -VIEW e SW assonometrica, e lo si vede da sud-ovest e dall'alto, nello stile visivo Nascosto."
sourceHash: "261c8657f5f7"
---

VISTA (VIEW) porta la vista su una delle dieci viste predefinite di AutoCAD: sei ortogonali, che guardano dritto un lato del modello, e quattro assonometriche, che guardano dall'alto da uno spigolo. Nulla nel disegno si muove. VISTA esegue <Command id="-VIEW" />, la forma da riga di comando: il suo primo prompt elenca <Keyword id="Orthographic" />, che poi chiede il lato, e prende anche subito il nome di una vista, come lo risponde il menu di AutoCAD: <Command id="-VIEW" />, poi <Keyword id="SWiso" />. Ogni vista inquadra l'intero disegno e dice <Message id="regeneratingModel" />.

Il controllo vista in alto a sinistra del disegno elenca le stesse dieci viste ed esegue <Command id="-VIEW" />, e anche le facce e gli angoli del ViewCube passano a esse, lasciando l'UCS com'è. Ogni VISTA è un passo di annullamento, quindi <Command id="U" /> ripristina la vista, con l'UCS che aveva impostato. Digitato con un apostrofo all'interno di un altro comando, rifiuta con <Message id="requiresRegen" />. Il 3D di MellowCAD è solo solidi, e ancora parziale.

## Options

### Orthographic

Chiede il lato da guardare, <Keyword id="Top" /> per impostazione predefinita, quindi Invio lì dà la pianta: <Keyword id="Top" />, <Keyword id="Bottom" />, <Keyword id="Front" />, <Keyword id="BAck" />, <Keyword id="Left" /> o <Keyword id="Right" />. Ognuna è dritta: Alto mostra X a destra e Y in alto, Fronte X a destra e Z in alto, e Basso, visto da sotto, X a sinistra. Digitato al primo prompt, ogni lato funziona senza l'opzione.

Ognuna ruota anche l'UCS perché ti guardi in faccia, dagli assi globali qualunque fosse l'UCS, con la sua origine in `0,0,0`, come fa l'opzione ortogonale di <Command id="UCS" />: dopo Fronte il suo piano XY è il fronte, quindi ciò che disegni giace piatto sullo schermo, e l'UCS si chiama `*FRONT*`. Dopo Alto ha gli assi globali, e si chiama `*TOP*`.

### SWiso

Assonometrica sud-ovest: guarda dall'alto dallo spigolo davanti e a sinistra, vedendo il fronte, il lato sinistro e la sommità. L'UCS resta com'è. È la vista della sessione.

### SEiso

Assonometrica sud-est: guarda dall'alto dallo spigolo davanti e a destra, vedendo il fronte, il lato destro e la sommità. L'UCS resta com'è.

### NEiso

Assonometrica nord-est: guarda dall'alto dallo spigolo dietro e a destra, vedendo il retro, il lato destro e la sommità. L'UCS resta com'è.

### NWiso

Assonometrica nord-ovest: guarda dall'alto dallo spigolo dietro e a sinistra, vedendo il retro, il lato sinistro e la sommità. L'UCS resta com'è.

## Missing

Viste con nome: <Keyword id="Orthographic" /> è l'unica opzione che il primo prompt elenca, dove quello di AutoCAD elenca anche `?`, Elimina, Ripristina, Salva, Impostazioni e Finestra, e un nome digitato lì viene rifiutato. Gestione viste, che VISTA apre in AutoCAD. Senza nulla disegnato, una vista mantiene lo zoom dove AutoCAD inquadra i limiti del disegno. UCSORTHO e UCSBASE come variabili: una vista ortogonale allinea sempre l'UCS, dagli assi globali. L'UCS allineato nell'elenco <Keyword command="UCS" id="Previous" /> di <Command id="UCS" />.

## Questions

### Come si ottiene una vista assonometrica in AutoCAD?

Digita <Command id="-VIEW" />, poi <Keyword id="SWiso" /> per l'assonometrica sud-ovest; <Keyword id="SEiso" />, <Keyword id="NEiso" /> e <Keyword id="NWiso" /> danno gli altri tre spigoli. Oppure scegli SO assonometrica nel controllo vista in alto a sinistra, o clicca un angolo superiore del ViewCube. <Command id="VSCURRENT" /> con <Keyword command="VSCURRENT" id="Hidden" /> nasconde gli spigoli dietro.

### Qual è il comando per la vista dall'alto?

<Command id="-VIEW" />, poi <Keyword id="Top" />, che imposta anche l'UCS sugli assi globali. <Command id="PLAN" /> guarda invece dall'alto l'UCS corrente, e lo lascia com'è.

### Perché il mio UCS è cambiato dopo una vista frontale?

Una vista ortogonale ruota l'UCS perché ti guardi in faccia, così ciò che disegni giace sullo schermo. <Command id="UCS" /> e Invio tornano a Globale; <Command id="U" /> annulla la vista e il suo UCS insieme.

### Una vista assonometrica è lo stesso di un disegno assonometrico?

No. Una vista assonometrica guarda un modello 3D da uno spigolo. Un disegno assonometrico è 2D, disegnato sui piani isometrici con lo stile isometrico di SNAP, che MellowCAD non ha ancora.

### Dov'è Gestione viste?

VISTA esegue <Command id="-VIEW" /> alla riga di comando: non c'è Gestione viste, e le viste con nome (Salva, Ripristina) non ci sono ancora.
