---
title: "Comando PARALLELEPIPEDO (BOX) in AutoCAD"
description: "Come AutoCAD disegna un parallelepipedo solido 3D con PARALLELEPIPEDO (BOX): due angoli e un'altezza, Centro, Cubo, Lunghezza. Provalo."
figure: "Un parallelepipedo 60 per 40 per 25, da due angoli e un'altezza, visto da sud-est nello stile visivo Nascosto."
sourceHash: "68b09d9eff63"
---

PARALLELEPIPEDO disegna un parallelepipedo solido 3D con i lati lungo gli assi dell'UCS: indica il primo angolo, l'altro angolo, poi l'altezza. L'altezza sale lungo Z dell'UCS, una negativa scende, e un punto la dà con la sua distanza dall'angolo; un angolo dato a una Z diversa dal primo imposta l'altezza senza chiederla. L'ultima altezza, e l'ultima lunghezza e larghezza di un cubo o di Lunghezza, sono offerte come predefiniti che Invio prende, condivisi con le altre primitive e con <Command id="EXTRUDE" />. Il parallelepipedo sta sul layer corrente, e Annulla lo annulla in un solo passo.

Il parallelepipedo conserva le sue dimensioni: <Command id="LIST" /> mostra la sua posizione, lunghezza, larghezza, altezza e rotazione, e la tavolozza Proprietà permette di digitare le prime quattro. I suoi grip lo spostano, lo stirano e, fuori dalla pianta, ne impostano l'altezza. È un solido 3D per <Command id="UNION" />, <Command id="SUBTRACT" /> e il resto del 3D di MellowCAD, che è solo solidi e ancora parziale.

## Options

### Center

Alla prima richiesta: chiede il centro, poi un angolo, <Keyword id="Cube" /> o <Keyword id="Length" />. Il parallelepipedo è centrato sul punto, anche in altezza.

### Cube

All'altro angolo: chiede una lunghezza, digitata o mostrata, e crea un cubo con ogni lato di quella lunghezza. Una lunghezza digitata va verso il cursore, una negativa in senso opposto.

### Length

All'altro angolo: chiede la lunghezza, poi la larghezza. La lunghezza va verso il cursore, quindi il parallelepipedo può stare inclinato; la larghezza va dal lato in cui si trova il cursore.

### 2Point

All'altezza: chiede due punti, e l'altezza è la distanza tra essi.

## Missing

Sposta, Ruota, Scala e Specchio da un grip attivo, che AutoCAD scorre con Invio. I comandi 3D propri, 3DMOVE, 3DROTATE, 3DSCALE, MIRROR3D, ROTATE3D, ALIGN, 3DALIGN, con i loro gizmo, e lo spostamento di facce, spigoli e vertici uno a uno. L'UCS dinamico. Le quote tratteggiate che AutoCAD disegna mentre dai l'angolo, la lunghezza e la larghezza. <Command id="FILLET" /> e <Command id="CHAMFER" /> dei suoi spigoli, che fanno <Command id="FILLETEDGE" /> e <Command id="CHAMFEREDGE" />. Registra cronologia e Mostra cronologia della cronologia del solido, e la riga Materiale. Gli stili visivi che <Command id="VSCURRENT" /> non ha oltre a Wireframe 2D, Nascosto e Concettuale.

## Questions

### Come si disegna un parallelepipedo 3D in AutoCAD?

Esegui PARALLELEPIPEDO, indica un angolo, poi l'angolo opposto, poi l'altezza: `0,0`, `60,40` e `25` disegnano il parallelepipedo della sessione. <Keyword id="Length" /> e una larghezza, al posto dell'angolo opposto, ruotano il parallelepipedo di un angolo qualsiasi.

### Perché il mio parallelepipedo sembra un rettangolo?

Lo guardi dall'alto, in pianta. Ruota la vista: uno spigolo del ViewCube, <Command id="-VIEW" /> e <Keyword command="VIEW" id="SEiso" />, oppure <Command id="3DORBIT" />. <Command id="VSCURRENT" /> con <Keyword command="VSCURRENT" id="Hidden" /> nasconde gli spigoli dietro di esso.

### Come si disegna un cubo?

Indica il primo angolo, poi scegli <Keyword id="Cube" /> e digita la lunghezza di un lato.

### Come si disegna un parallelepipedo dal suo centro?

Scegli <Keyword id="Center" /> e indica il punto centrale, poi un angolo, <Keyword id="Cube" /> o <Keyword id="Length" />: il parallelepipedo è centrato sul punto, anche in altezza.
