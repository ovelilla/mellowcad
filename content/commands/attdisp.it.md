---
title: "Comando VISATT (ATTDISP) in AutoCAD"
description: "Come funziona VISATT (ATTDISP) di AutoCAD in italiano: Normale, ON per mostrare anche gli attributi invisibili, OFF per nasconderli. Provalo."
figure: "Due scrivanie i cui codici pezzo sono attributi invisibili: VISATT ON li mostra sotto ogni scrivania, accanto ai numeri visibili."
sourceHash: "8821fdeb2077"
---

VISATT imposta quali attributi mostrano i riferimenti di blocco nel disegno. Chiede l'impostazione, proponendo quella corrente, Normale in un nuovo disegno; ogni altra parola segnala che la parola chiave non è valida e chiede di nuovo, e Invio la conserva. Una modifica rigenera tutto il disegno, `Rigenerazione modello in corso.` come la scrive AutoCAD 2027, ed è salvata nel disegno come ATTMODE, un passo che <Command id="U" /> annulla. Digitato con un apostrofo dentro un comando, funziona anche lì.

Cambia solo ciò che si vede: un attributo invisibile conserva il suo valore, e uno nascosto si può ancora modificare con <Command id="ATTEDIT" /> o <Command id="EATTEDIT" />.

## Options

### Normal

Mostra ogni attributo come è stato definito: quelli visibili, non quelli definiti con <Keyword command="ATTDEF" id="Invisible" /> di <Command id="ATTDEF" />.

### ON

Mostra ogni attributo, anche quelli invisibili.

### OFF

Nasconde ogni attributo, anche quelli visibili.

## Questions

### Come si mostrano gli attributi invisibili in AutoCAD?

Digita `VISATT` e scegli <Keyword id="ON" />: ogni attributo si vede, anche quelli invisibili. <Keyword id="Normal" /> li nasconde di nuovo.

### Perché gli attributi dei miei blocchi non si vedono?

<Command id="ATTDISP" /> può essere <Keyword id="OFF" />, che nasconde ogni attributo, oppure <Keyword id="Normal" /> con gli attributi definiti come invisibili. Scegli <Keyword id="ON" /> per vederli tutti. Un riferimento il cui blocco non ha attributi non ne mostra, qualunque sia l'impostazione.

### Come si nascondono i valori degli attributi in AutoCAD?

Definiscili invisibili: la modalità <Keyword command="ATTDEF" id="Invisible" /> di <Command id="ATTDEF" />, prima di creare il blocco. VISATT <Keyword id="OFF" /> nasconde ogni attributo in una volta, in tutto il disegno.
