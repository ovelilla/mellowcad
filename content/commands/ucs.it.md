---
title: "Comando UCS in AutoCAD"
description: "Come UCS di AutoCAD sposta e ruota il sistema di coordinate utente: origine e 3 punti, Oggetto, Vista, X, Y, Z, ZAsse, Nome, Globale. Provalo."
figure: "Un parallelepipedo visto da sud-est: UCS sposta l'origine sulla sua sommità, e un cerchio disegnato in 30,20 dopo di esso giace sulla faccia superiore, non sul terreno."
sourceHash: "8ac3b844fe16"
---

UCS imposta il sistema di coordinate utente: un'origine e gli assi X e Y ovunque nello spazio, così il suo piano XY può inclinarsi. Le coordinate che digiti vengono lette in esso, e ciò che disegni giace nel suo piano XY: con l'origine spostata sulla sommità di un parallelepipedo, un cerchio centrato in `30,20` giace sulla sommità. Dice prima il nome dell'UCS corrente, `*WORLD*`, `*NO NAME*` o il nome con cui è stato salvato, poi chiede la nuova origine o un'opzione; Invio lì torna a Globale. Un punto è l'origine, con il suo Z, e un punto senza Z giace alla quota corrente. Poi un punto sull'asse X positivo e un punto sul piano XY, letti nell'UCS corrente: Invio all'uno o all'altro mantiene gli assi com'erano. Un punto sposta l'UCS; tre lo ruotano in qualsiasi modo.

I comandi lavorano poi nel piano XY dell'UCS: <Command id="LINE" /> e <Command id="CIRCLE" /> disegnano su di esso, e <Command id="BOX" /> ed <Command id="EXTRUDE" /> salgono da esso lungo il suo Z. Ogni oggetto conserva il proprio piano quando l'UCS cambia, e <Command id="PLAN" /> guarda dritto dall'alto l'UCS corrente. L'UCS viene salvato nel disegno, e ogni esecuzione è un solo passo di annullamento. Il 3D di MellowCAD è solo solidi, e ancora parziale.

## Options

### Face

Elencata come la elenca AutoCAD 2027, per allineare l'UCS a una faccia di un solido. MellowCAD chiede la faccia, ma non allinea ancora a una: ogni selezione non ne trova nessuna.

### NAmed

UCS salvati, per nome. <Keyword id="Save" /> memorizza quello corrente, chiedendo <Keyword id="Yes" /> o <Keyword id="No" /> prima di sostituire un nome già salvato; <Keyword id="Restore" /> rende corrente uno salvato, con il suo nome digitato in qualsiasi maiuscolo o minuscolo; <Keyword id="Delete" /> prende nomi, con virgole e caratteri jolly; <Keyword id="?" /> li elenca, ciascuno con la sua origine e i suoi assi. Un nome può contenere spazi, ma non `<>/\":;|,=*?` né un apice inverso: <Message id="invalidUcsName" />.

### OBject

Allinea l'UCS a un oggetto che indichi: una linea, un cerchio, un arco, un'ellisse, una polilinea, una spline, un testo, un testo multilinea, una definizione di attributo o un riferimento di blocco. L'origine e l'asse X vanno dove AutoCAD li mette per ogni genere, e lo Z è la normale dell'oggetto stesso, quindi l'UCS giace nel piano dell'oggetto. Si può indicare un oggetto su un layer bloccato. Un tratteggio dice <Message id="ucsNoCoordinateSystem" />, e UCS termina con l'UCS com'era.

### Previous

Torna all'UCS precedente, fino a dieci indietro in una sessione, compresi quelli con nome e quelli ortogonali. Se non ne resta nessuno: <Message id="noPreviousUcs" />.

### View

Ruota il piano XY perpendicolare alla tua linea di vista, con X lungo l'orizzontale dello schermo, mantenendo l'origine: il testo disegnato dopo si legge piatto sullo schermo di una vista 3D.

### World

Torna al sistema di coordinate globale, che non si muove mai. È il valore predefinito del primo prompt, quindi Invio lì lo sceglie, e riporta a 0 anche la quota.

### X

Ruota l'UCS attorno al suo asse X: 90 gradi per impostazione predefinita, un angolo digitato, o un punto che lo indica. Un angolo positivo lo ruota secondo la regola della mano destra, quindi 90 mette in piedi il piano XY sul vecchio asse X.

### Y

Ruota l'UCS attorno al suo asse Y, come <Keyword id="X" /> attorno a X.

### Z

Ruota l'UCS attorno al suo asse Z, come <Keyword id="X" /> attorno a X: 30 ruota X e Y di 30 gradi in senso antiorario, visti dall'alto.

### ZAxis

Una nuova origine, con Invio che mantiene quella corrente, poi un punto sull'asse Z positivo: il piano XY sta perpendicolare a esso, con il suo X tenuto in piano con il piano XY globale. Due punti che coincidono dicono <Message id="pointsAreCoincident" />. Il suo <Keyword id="Object" /> prende una linea, un arco, una polilinea aperta o una spline: l'origine all'estremo più vicino al punto indicato, con Z lungo di essa che punta lontano.

## Missing

<Keyword id="Face" />, che allinea l'UCS a una faccia di un solido: ne chiede una ma non ne trova ancora nessuna. Applica e SEzione, elencati al primo prompt e rifiutati qui, dato che c'è una sola vista e non ci sono oggetti sezione. La finestra UCS (UCSMAN), i grip dell'icona e il suo menu del tasto destro, e l'icona che mostra il nuovo UCS mentre lo posizioni. Il reticolo che ruota con l'UCS: resta dritto sullo schermo finché <Command id="PLAN" /> non allinea la vista a esso. UCSFOLLOW, UCSVP e l'UCS dinamico. <Keyword id="OBject" /> su una quota, e Gruppo alla sua selezione. La profondità che un UCS ortogonale conserva. La pausa, Premere INVIO per continuare, in un lungo elenco.

## Questions

### Come si riporta l'UCS a Globale in AutoCAD?

Esegui UCS e premi Invio: <Keyword id="World" /> è il valore predefinito. Per guardare di nuovo dritto dall'alto il disegno, esegui <Command id="PLAN" /> e scegli <Keyword command="PLAN" id="World" />.

### Come si ruota l'UCS?

Esegui UCS, scegli <Keyword id="Z" /> e digita l'angolo: `30` ruota X e Y di 30 gradi in senso antiorario. <Keyword id="X" /> e <Keyword id="Y" /> inclinano il piano XY verso l'alto, di 90 gradi per impostazione predefinita.

### Qual è la differenza tra l'UCS e il WCS?

Il sistema di coordinate globale (WCS) non si muove mai; il sistema di coordinate utente (UCS) è quello che sposti e ruoti. All'inizio sono lo stesso, e UCS dice che quello corrente è `*WORLD*`. Le coordinate che digiti vengono lette nell'UCS, e ciò che disegni giace nel suo piano XY.

### Come si disegna su una faccia di un solido 3D?

Sposta l'UCS su di essa. Sulla sommità di un parallelepipedo basta la sua origine: UCS, poi un angolo della sommità, poi Invio, come fa la sessione. Per un lato, indica tre punti: l'origine in un angolo, un punto lungo uno spigolo per X, e uno ancora sulla faccia per Y. Poi disegna: ciò che disegni giace sulla faccia.
