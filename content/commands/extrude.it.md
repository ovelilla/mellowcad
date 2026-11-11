---
title: "Comando ESTRUDI (EXTRUDE) in AutoCAD"
description: "Come funziona ESTRUDI (EXTRUDE, alias EU) di AutoCAD in italiano: da un profilo 2D chiuso a un solido 3D, con altezza, Direzione e Rastremazione. Provalo."
figure: "Una polilinea chiusa a L estrusa di 20 in un solido, poi vista da sud-est nello stile di visualizzazione Nascosto."
sourceHash: "53bfe3dd1e9c"
---

ESTRUDI (EXTRUDE in inglese) trasforma profili 2D chiusi in solidi 3D, ciascuno tirato dritto fuori dal suo piano dell'altezza che indichi. Seleziona i profili, cerchi, ellissi, polilinee o spline chiuse, regioni, e premi Invio, poi digita l'altezza o mostrala con un punto; l'ultima altezza è il valore predefinito della volta successiva. Ogni profilo diventa un solido a sé, sul layer corrente, e viene cancellato, come dice DELOBJ per impostazione predefinita. L'intero comando è un solo passo che Annulla ripristina.

Il 3D di MellowCAD è fatto solo di solidi, ed è ancora parziale: un profilo aperto, che AutoCAD trasforma in una superficie, riceve <Message id="sweepRefusedType" /> e viene tolto dalla selezione.

## Options

### MOde

Chiede <Keyword id="SOlid" /> o <Keyword id="SUrface" />. <Keyword id="SOlid" /> è il valore predefinito e l'unico che esiste: senza ancora oggetti superficie, <Keyword id="SUrface" /> viene rifiutato.

### Direction

Al posto di un'altezza, due punti danno la direzione e la lunghezza: i profili vengono estrusi lungo quella linea, inclinati se lo è. Una direzione che giace nel piano del profilo riceve <Message id="directionParallel" /> e il comando termina.

### Path

Elencata, come in AutoCAD, ma non realizzata: sceglierla viene rifiutato e l'altezza viene chiesta di nuovo.

### Taper

Chiede un angolo tra −90 e 90 gradi, poi di nuovo l'altezza: un angolo positivo restringe il solido man mano che sale, uno negativo lo allarga. Un cerchio che si chiude prima dell'altezza finisce in un punto, un cono; un profilo che la rastremazione non può gestire non crea nulla.

### Expression

L'altezza come espressione: `2*3` fa 6. Per ora solo aritmetica.

## Missing

Path, lo sweep lungo una traiettoria. La modalità SUrface e i profili aperti, di cui AutoCAD fa superfici: non esistono ancora oggetti superficie. Le facce dei solidi e le aree che un clic trova dentro gli oggetti, che prende <Command id="PRESSPULL" />. Una rastremazione su un'ellisse, una spline o un arco che incontra il segmento successivo in uno spigolo. I parametri e le funzioni di Expression. <Command id="EXPLODE" /> di un solido estruso con lati curvi, che AutoCAD trasforma in superfici e regioni. I suoi grip, e la sua altezza e il suo angolo di rastremazione modificati nella tavolozza Proprietà.

## Questions

### Come si chiama il comando EXTRUDE in italiano?

ESTRUDI, alias `EU`, poi Invio o barra spaziatrice; l'alias inglese `EXT` in AutoCAD in italiano non esiste. Come in AutoCAD in italiano, il nome inglese funziona anche con il trattino basso davanti: `_EXTRUDE`.

### Come si estrude un disegno 2D in 3D?

Disegna il contorno come un solo oggetto chiuso, una polilinea chiusa, un cerchio o una regione, avvia ESTRUDI, selezionalo, premi Invio e digita l'altezza. Dall'alto un solido assomiglia al suo contorno: ruota la vista con il ViewCube, oppure con <Command id="-VIEW" /> e <Keyword command="VIEW" id="SEiso" />, per vederlo in 3D.

### Perché ESTRUDI non crea un solido?

Il profilo è aperto, o si interseca. Una linea, un arco o una polilinea aperta in AutoCAD crea una superficie, e MellowCAD non ne ha ancora: ESTRUDI dice <Message id="sweepRefusedType" /> e li toglie dalla selezione; un profilo che si interseca riceve <Message id="sweepSelfIntersecting" /> e viene tolto anch'esso. Unisci i pezzi con <Command id="JOIN" />, ricavane una regione con <Command id="REGION" />, oppure fai clic al loro interno con <Command id="PRESSPULL" />.

### Come si estrude una forma con un foro?

Ricavane una sola regione: <Command id="REGION" /> sul contorno e sul foro, poi <Command id="SUBTRACT" /> la regione del foro da quella del contorno. Estrudi quella regione e il foro attraversa il solido. Oppure avvia <Command id="PRESSPULL" /> e fai clic tra il contorno e il foro.

### Come si estrude lungo una traiettoria?

Non ancora: <Keyword id="Path" /> è elencata ma rifiutata, e SWEEP non esiste. <Keyword id="Direction" /> estrude lungo la retta tra due punti.
