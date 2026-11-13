---
title: "Comando ELIMINA (PURGE) in AutoCAD"
description: "Come ELIMINA (PURGE, alias EN) di AutoCAD in italiano cancella i blocchi e i tipi di linea inutilizzati: per nome o tutti, con verifica o no, anche annidati."
figure: "Due blocchi, TAG inserito su una parete e BOX il cui unico riferimento è stato cancellato: ELIMINA, tutti i nomi, senza verifica, elimina solo BOX."
sourceHash: "7a22ff19d409"
---

ELIMINA (PURGE) rimuove ciò che un disegno definisce ma non usa; qui sono i blocchi e i tipi di linea. ELIMINA di AutoCAD apre la finestra Elimina; MellowCAD non ne ha una, quindi ELIMINA chiede alla riga di comando ciò che chiede <Command id="-PURGE" />, come la console di AutoCAD. Indica le impostazioni Elementi annidati e Dati orfani, entrambe disattivate, e chiede quale tipo di oggetti inutilizzati eliminare, proponendo <Keyword id="Blocks" /> e <Keyword id="LTypes" />; Invio a questa richiesta termina il comando.

Un blocco è in uso finché un riferimento nel disegno lo inserisce, o la definizione di un blocco in uso lo contiene, a qualsiasi profondità. Cancellare l'ultimo riferimento di un blocco ne lascia la definizione nel disegno, dove <Command id="INSERT" /> può inserirlo di nuovo: è ELIMINA a cancellarla. Un blocco contenuto in un blocco conservato non viene mai eliminato, e una catena di blocchi che si contengono solo a vicenda sparisce in una sola esecuzione. Se non ce n'è nessuno da eliminare, segnala <Message id="noUnreferencedBlocks" />. Ogni esecuzione è un solo passaggio che <Command id="U" /> annulla.

## Options

### Blocks

Chiede i nomi da eliminare, `*` per ogni blocco inutilizzato per impostazione predefinita, oppure nomi con caratteri jolly, separati da virgole. Poi chiede se verificare ogni nome: <Keyword id="Yes" />, il valore predefinito, chiede conferma per ogni blocco prima di eliminarlo, <Keyword id="No" /> li elimina tutti e indica ogni nome e quanti sono.

### LTypes

Chiede i nomi e se verificare ognuno, come <Keyword id="Blocks" />, ed elimina i tipi di linea che niente usa. Continuous, il tipo di linea corrente e quelli usati da un layer o da un oggetto, anche dentro un blocco, restano sempre; se non ce n'è nessuno da eliminare, segnala <Message id="noUnreferencedLinetypes" />. L'opzione <Keyword command="LINETYPE" id="Load" /> di <Command id="LINETYPE" /> ne riporta uno.

## Missing

La finestra Elimina, e ogni altro tipo: layer, stili di testo e di quota, gruppi, materiali, stili di multilinea, di tabella e visivi, applicazioni registrate, geometria di lunghezza zero, oggetti di testo vuoti, dati orfani e Tutto. Le impostazioni Elementi annidati e Dati orfani non si possono cambiare.

## Questions

### Qual è l'alias di ELIMINA in AutoCAD?

`EN`, poi Invio o barra spaziatrice. `-ELIMINA` è <Command id="-PURGE" />, la forma da riga di comando, che qui esegue anche ELIMINA. `_PURGE` funziona in qualsiasi lingua di AutoCAD.

### Come si eliminano i blocchi inutilizzati in AutoCAD?

Digita `EN`, scegli <Keyword id="Blocks" />, premi Invio per ogni nome e rispondi <Keyword id="No" /> per eliminarli tutti senza chiedere conferma per ciascuno.

### Perché non riesco a eliminare un blocco?

Perché è in uso: un riferimento nel disegno lo inserisce, o lo contiene un blocco in uso, magari annidato a più livelli. Cancella i suoi riferimenti, o esplodi i blocchi che lo contengono, e ELIMINA potrà eliminarlo.

### Come si eliminano i layer?

In AutoCAD, con il tipo Layer di ELIMINA. Non ancora qui, dove ELIMINA elimina i blocchi e i tipi di linea; cancella invece un layer vuoto in Gestore proprietà layer.
