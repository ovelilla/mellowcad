---
title: "Comando BLOCCO (BLOCK) in AutoCAD"
description: "Come funziona BLOCCO (BLOCK, alias B) di AutoCAD in italiano: un nome, un punto base e gli oggetti; ridefinire un blocco, attributi. Provalo."
figure: "Una sedia, un rettangolo e una linea, resi il blocco B1: il suo nome, un punto base a metà del bordo anteriore, entrambi gli oggetti selezionati."
sourceHash: "ca24f209008c"
---

BLOCCO memorizza un insieme di oggetti nel disegno con un nome, così che <Command id="INSERT" /> possa posizionarlo di nuovo quante volte vuoi, ogni copia un riferimento a quell'unica definizione. Chiede un nome, poi il punto base di inserimento, il punto con cui si posiziona ogni riferimento, poi gli oggetti. Invio termina la selezione e definisce il blocco, e gli oggetti selezionati diventano un riferimento ad esso, dove erano. L'intero comando è un solo passo che Annulla annulla.

BLOCCO di AutoCAD apre la finestra Definizione blocco, che MellowCAD non ha: qui BLOCCO chiede alla riga di comando ciò che chiede <Command id="-BLOCK" />, come fa la console di AutoCAD. Un nome può contenere spazi e fino a 255 caratteri, ma nessuno tra `< > / \ " : ; ? * | , =` né un apice inverso: Invio da solo o un nome simile mostra <Message id="invalidNewBlockName" /> e chiede di nuovo. Un nome che il disegno ha già, senza distinzione tra maiuscole e minuscole, chiede se ridefinire quel blocco, <Keyword id="Yes" /> o <Keyword id="No" /> (il predefinito, che termina il comando).

## Options

### ?

Elenca i blocchi del disegno: chiede quali elencare, `*` per tutti come predefinito o un nome con caratteri jolly, scrive i nomi che corrispondono e un conteggio per ogni tipo, poi termina. I blocchi anonimi, come quelli di una serie, sono contati, mai nominati.

## Missing

La finestra Definizione blocco di AutoCAD: BLOCCO chiede alla riga di comando. Al punto base, le opzioni Annotativo e Modalità (Mantieni, Elimina): gli oggetti sono sempre convertiti in un riferimento. ATTREQ 0, che salta la finestra dei valori degli attributi, e ATTSYNC, ATTREDEF, BATTMAN e BATTORDER: un blocco ridefinito lascia gli attributi dei suoi riferimenti com'erano, come fa AutoCAD. DaBlocco: un oggetto dentro un blocco non può prendere il colore, il tipo di linea o lo spessore di linea propri del riferimento, come fa uno disegnato DaBlocco in AutoCAD. In un UCS ruotato, AutoCAD 2027 sposta gli oggetti che converte; qui restano dove erano, di proposito.

## Questions

### Qual è la scorciatoia di BLOCCO in AutoCAD?

`B`, poi Invio o barra spaziatrice. In AutoCAD apre la finestra Definizione blocco; qui chiede alla riga di comando, come fa `-B` (<Command id="-BLOCK" />). `_BLOCK` funziona in tutte le lingue di AutoCAD.

### Come si crea un blocco in AutoCAD?

Digita `B`, un nome, poi indica il punto base, un angolo o il centro del bordo su cui poggerà il blocco, e seleziona gli oggetti. Invio definisce il blocco e trasforma gli oggetti in un riferimento ad esso. Anche una selezione fatta prima del comando è presa, dopo il punto base.

### Come si ridefinisce un blocco?

Esegui BLOCCO con il nome del blocco e rispondi <Keyword id="Yes" />, poi indica un punto base e seleziona i nuovi oggetti: ogni riferimento al blocco mostra la nuova definizione. Gli oggetti non possono includere un riferimento al blocco stesso; un insieme simile è rifiutato e il comando termina.

### Come si crea un blocco con attributi?

Definisci prima gli attributi con <Command id="ATTDEF" />, poi selezionali con gli altri oggetti: entrano nel blocco nell'ordine in cui li selezioni. Il riferimento che li sostituisce apre una finestra con un campo per ogni attributo, etichettato con la sua richiesta e riempito con il suo predefinito: Invio applica i valori, Esc conserva i predefiniti.

### Come si esplode un blocco?

<Command id="EXPLODE" /> trasforma di nuovo un riferimento negli oggetti che mostra, un livello di annidamento alla volta, ciascuno sul proprio layer e con il proprio colore. Gli attributi tornano come definizioni; i valori sono scartati.
