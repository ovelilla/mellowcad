---
title: "Comando SFERA (SPHERE) in AutoCAD"
description: "Come SFERA (SPHERE) di AutoCAD disegna una sfera solida 3D: centro e raggio, Diametro, 3P, 2P e Ttr, e perché appare come linee. Provalo."
figure: "Una sfera di raggio 25 dal suo centro, vista da sud-est nello stile visivo Concettuale."
sourceHash: "a35a57352d16"
---

SFERA (SPHERE) disegna una sfera solida 3D: indica il centro, poi il raggio. Un raggio indicato con il mouse viene letto sul piano passante per il centro, e l'ultimo raggio viene proposto come valore predefinito che Invio prende, condiviso con <Command id="CYLINDER" />, <Command id="CONE" /> e le altre primitive. La sfera sta sul layer corrente e Annulla la ripristina in un solo passo.

In Wireframe 2D e Nascosto viene disegnata come linee: meridiani e paralleli, quanti ne dice `ISOLINES`, e nient'altro vi si aggancia oltre al suo centro. <Command id="LIST" /> ne mostra la posizione e il raggio, e la tavolozza Proprietà permette di digitare il raggio o il diametro. I suoi grip la spostano e, a ogni quarto del suo equatore, ne impostano il raggio. È un solido 3D per <Command id="UNION" />, <Command id="SUBTRACT" /> e il resto del 3D di MellowCAD, che è solo solidi e ancora parziale.

## Options

### 3P

Al centro: chiede tre punti, e la sfera è centrata sul cerchio che passa per essi, con il suo raggio.

### 2P

Al centro: chiede i due estremi di un diametro, ovunque nello spazio.

### Ttr

Al centro: indica due linee, cerchi o archi, con lo snap Tangente, e indica un raggio: il centro sta sul cerchio di quel raggio che li tocca entrambi, alla loro altezza.

### Diameter

Al raggio: chiede invece il diametro, proponendo il doppio dell'ultimo raggio.

## Missing

<Command id="EXPLODE" /> di una sfera, che AutoCAD trasforma in una superficie: MellowCAD non ha superfici, quindi dice che non ha potuto esploderla. Sposta, Ruota, Scala e Specchio da un grip attivo, e i comandi 3D propri (3DMOVE, 3DROTATE, 3DSCALE). La silhouette che disegna `DISPSILH` di AutoCAD. Gli stili visivi che mancano a <Command id="VSCURRENT" /> oltre a Wireframe 2D, Nascosto e Concettuale.

## Questions

### Come si crea una sfera in AutoCAD?

Esegui SFERA, indica il centro, poi il raggio: `0,0,0` e `25` disegnano la sfera della sessione. Ruota la vista per vederla tonda, con un angolo del ViewCube o con <Command id="-VIEW" /> e <Keyword command="VIEW" id="SEiso" />.

### Perché la mia sfera sembra un cerchio con delle linee?

Wireframe 2D e Nascosto disegnano una sfera come i suoi meridiani e paralleli; in pianta sono un cerchio e linee che lo attraversano. <Command id="VSCURRENT" /> con <Keyword command="VSCURRENT" id="Conceptual" /> la ombreggia, e `ISOLINES` stabilisce quante linee mostra.

### Come si crea un'emisfera?

Disegna la sfera, poi tagliala per il suo centro con <Command id="SLICE" />: tre punti sul piano, oppure <Keyword command="SLICE" id="XY" /> e il centro, e il lato da conservare.

### Come si disegna una sfera dal suo diametro?

Al raggio, scegli <Keyword id="Diameter" /> e digita il diametro. Con <Keyword id="2P" />, anche i due estremi di un diametro la posizionano.
