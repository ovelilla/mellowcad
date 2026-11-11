---
title: "Comando SEZIONE (SECTION) in AutoCAD"
description: "Come SEZIONE (SECTION, alias SEZ) di AutoCAD crea una regione dove un piano taglia solidi 3D: 3punti, Oggetto, Zasse, Vista, XY, YZ, ZX. Provalo."
figure: "Un blocco con un foro passante, tagliato dal piano ZX per il centro del foro: SEZIONE crea il profilo, spostato davanti, due rettangoli con lo spazio del foro in mezzo."
sourceHash: "f1c01b76c810"
---

SEZIONE (SECTION) crea una sezione di solidi 3D: una regione dove un piano taglia ciascuno, mentre i solidi restano com'erano. Chiede i solidi, fino a Invio: come in AutoCAD 2027, un insieme selezionato prima viene scartato e chiesto di nuovo, ciò che non è un solido viene ignorato, e un insieme senza solidi dice <Message id="noSolidsSelected" />. Poi il piano: per impostazione predefinita indichi tre punti su di esso, e le opzioni lo indicano in un altro modo, come in <Command id="SLICE" />.

Ogni solido tagliato dal piano ottiene la sua regione, che giace nel piano: un blocco con un foro passante dà il contorno con lo spazio del foro, un cilindro tagliato lungo il suo asse un rettangolo. Un piano su una faccia di un solido dà quella faccia. Un solido che il piano non incontra dice <Message id="sectionMissedOne" />. Le regioni prendono il layer e le proprietà correnti, non quelli del solido; <Command id="MOVE" /> ne porta una fuori per vederla, <Command id="AREA" /> e <Command id="MASSPROP" /> la misurano, e <Command id="EXTRUDE" /> la trasforma in un solido. L'intero comando è un solo passo di annullamento. Il 3D di MellowCAD è solo solidi, e ancora parziale.

## Options

### Object

Prende il piano di un oggetto che indichi: un cerchio, un'ellisse, un arco, una spline 2D o una polilinea 2D.

### Zaxis

Chiede un punto sul piano, poi un punto sul suo asse Z, la linea perpendicolare a esso.

### View

Il piano parallelo allo schermo, passante per un punto che indichi.

### XY

Il piano XY dell'UCS, passante per un punto che indichi: un punto a una certa altezza crea lì una sezione orizzontale. Invio prende l'origine dell'UCS.

### YZ

Il piano YZ dell'UCS, passante per un punto che indichi; Invio prende l'origine dell'UCS.

### ZX

Il piano ZX dell'UCS, passante per un punto che indichi; Invio prende l'origine dell'UCS. La sezione della sessione è questo piano per il centro del foro.

### 3points

Tre punti sul piano, che può allora inclinarsi in qualsiasi modo. È il valore predefinito del primo prompt, quindi un punto lì è il primo dei tre.

## Missing

Superfici e mesh, che MellowCAD non ha. Una polilinea 3D piana come oggetto del piano, che AutoCAD accetta. I tagli per i quali MellowCAD non ha ancora una forma esatta, come in <Command id="SLICE" />, che dicono che un'operazione booleana è fallita. SECTIONPLANE e la sezione dinamica, che la barra multifunzione di AutoCAD offre al posto di SEZIONE: qui SEZIONE si digita.

## Questions

### Come si crea una sezione di un solido 3D in AutoCAD?

Esegui SEZIONE, seleziona il solido e premi Invio, poi indica il piano: <Keyword id="ZX" /> e un punto nel mezzo lo tagliano da davanti a dietro, <Keyword id="XY" /> e un punto a una certa altezza lo tagliano in orizzontale. La regione giace dentro il solido: portala fuori con <Command id="MOVE" /> per vederla.

### Qual è la differenza tra SEZIONE e TRANCIA?

<Command id="SLICE" /> taglia il solido in due e conserva una parte o entrambe. SEZIONE lascia il solido intero e disegna una regione dove il piano lo taglia.

### Qual è l'alias di SEZIONE in AutoCAD?

`SEZ`, poi Invio o barra spaziatrice.

### Perché SEZIONE dice che il piano non interseca il solido?

Il piano lo manca: controlla come l'hai indicato. <Keyword id="XY" />, <Keyword id="YZ" /> e <Keyword id="ZX" /> sono i piani dell'UCS, quindi un punto all'altezza o dal lato sbagliato mette il piano fuori dal solido.
