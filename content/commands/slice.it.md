---
title: "Comando TRANCIA (SLICE) in AutoCAD"
description: "Come funziona TRANCIA (SLICE, alias TC) di AutoCAD: i solidi, un piano da due punti, 3punti, un oggetto o l'UCS, poi il lato da conservare. Provalo."
figure: "Un cilindro tagliato lungo il suo asse da due punti, con la metà dal lato indicato conservata: visto da sud-est."
sourceHash: "07b1512fb042"
---

TRANCIA (SLICE) taglia solidi 3D con un piano e conserva la parte da un lato, o entrambe le parti come due solidi. Chiede i solidi da tagliare, fino a Invio: come in AutoCAD 2027, un insieme selezionato prima viene scartato e chiesto di nuovo, e ciò che non è un solido viene ignorato. Poi il piano: per impostazione predefinita indichi due punti, e il piano sta in verticale per essi, perpendicolare al piano XY dell'UCS; le opzioni lo indicano in un altro modo. Infine un punto dal lato da conservare, oppure Invio per conservarli entrambi.

Ogni solido dell'insieme viene tagliato dallo stesso piano. Uno che il piano non incontra, o tocca solo in una faccia, lungo uno spigolo o in un vertice, resta com'era, e TRANCIA lo dice. Un solido tagliato non è più un parallelepipedo o un cilindro e non ha cronologia. L'intero comando è un solo passo di annullamento. Il 3D di MellowCAD è ancora parziale: i solidi ci sono, le superfici e le mesh no.

## Options

### Object

Prende il piano di un oggetto che indichi: un cerchio, un'ellisse, un arco, una polilinea 2D o una spline piana, anche un cerchio inclinato. Una linea, o il solido stesso, non ha un piano proprio: dice <Message id="unableToExtractPlane" /> e chiede di nuovo. Invio termina il comando.

### Surface

Chiede una superficie lungo cui tagliare. MellowCAD non ha ancora superfici, quindi una selezione dice <Message id="noSurfacesSelected" />, e Invio termina il comando.

### Zaxis

Chiede un punto sul piano, poi un punto sul suo asse Z, la linea perpendicolare a esso. I due non possono essere lo stesso punto.

### View

Il piano parallelo allo schermo, passante per un punto che indichi; Invio prende 0,0,0.

### XY

Il piano XY dell'UCS, passante per un punto che indichi: un punto a una certa altezza crea lì un taglio orizzontale. Invio prende l'origine dell'UCS.

### YZ

Il piano YZ dell'UCS, passante per un punto che indichi; Invio prende l'origine dell'UCS.

### ZX

Il piano ZX dell'UCS, passante per un punto che indichi; Invio prende l'origine dell'UCS.

### 3points

Tre punti sul piano, che può allora inclinarsi in qualsiasi modo. È il valore predefinito del primo prompt, quindi Invio lo sceglie. Il secondo punto deve essere diverso dal primo, e il terzo non deve stare sulla linea che li unisce.

### Both

Al prompt del lato, e il suo valore predefinito, quindi Invio lo sceglie: entrambe le parti vengono conservate. Il solido ne conserva una e l'altra diventa un nuovo solido con lo stesso layer, colore, tipo di linea e spessore di linea, non quelli correnti. Un punto invece conserva il lato su cui si trova e scarta l'altro; un punto sul piano viene rifiutato.

## Missing

Superfici, come piano di taglio e come oggetti da tagliare, e mesh. Una polilinea 3D piana come oggetto del piano, che AutoCAD accetta. Un toro o un solido di rivoluzione tagliato né perpendicolarmente al suo asse né lungo di esso, e gli altri tagli per i quali MellowCAD non ha ancora una forma esatta, che dicono che un'operazione booleana è fallita.

## Questions

### Qual è l'alias di TRANCIA in AutoCAD?

`TC`, poi Invio o barra spaziatrice. Funziona anche il nome completo, e `_SLICE` in qualsiasi lingua di AutoCAD.

### Come si usa TRANCIA nel 3D di AutoCAD?

Seleziona il solido e premi Invio. Indica due punti per cui passa il taglio: il piano sta in verticale per essi. Poi indica un punto dal lato da conservare, oppure premi Invio per conservare entrambe le metà e spostarne una con <Command id="MOVE" />. Per un taglio inclinato, scegli <Keyword id="3points" /> e indica tre punti su di esso.

### TRANCIA può tagliare linee o oggetti 2D?

No: TRANCIA taglia solidi 3D e ignora linee, regioni e blocchi; un insieme composto solo da essi termina il comando. Per tagliare oggetti 2D usa <Command id="TRIM" /> o <Command id="BREAK" />. In AutoCAD TRANCIA taglia anche superfici e mesh, che MellowCAD non ha ancora.

### Perché TRANCIA dice che il piano di taglio non interseca il solido?

Perché il piano lo manca, o lo tocca solo in una faccia, lungo uno spigolo o in un vertice: quel solido resta intero. Controlla come è stato indicato il piano. Con due punti sta in verticale, quindi due punti sulla faccia superiore di un solido lo tagliano in verticale, non in orizzontale; per un taglio orizzontale scegli <Keyword id="XY" /> e indica un punto all'altezza del taglio.
