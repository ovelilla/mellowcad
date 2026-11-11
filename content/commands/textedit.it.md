---
title: "Comando MODTESTO (TEXTEDIT) in AutoCAD"
description: "Come MODTESTO (TEXTEDIT, alias MOD, DDEDIT) di AutoCAD modifica testo, testo multilinea e definizioni di attributo, uno dopo l'altro. Provalo."
figure: "Un PALTE scritto male su una targhetta, indicato con MODTESTO e riscritto PLATE, poi Esc per terminare il comando."
sourceHash: "2d0ed6fe5acc"
---

MODTESTO (TEXTEDIT) modifica gli oggetti di annotazione: dice la modalità di modifica corrente, Multiplo all'inizio, e ti chiede di selezionarne uno. Un testo su riga singola si apre per essere riscritto dov'è, un testo multilinea nell'editor di <Command id="MTEXT" />, una definizione di attributo come la sua etichetta, il suo prompt e il suo valore predefinito. In modalità Multiplo chiede poi l'oggetto successivo, finché Esc o Invio non termina il comando, e l'intera esecuzione è un solo passo che <Command id="U" /> annulla. Un doppio clic su un testo o su una definizione di attributo esegue MODTESTO, e su un testo multilinea apre l'editor per quel solo oggetto.

Esc nell'editor di un testo su riga singola scarta quella modifica e chiede l'oggetto successivo; un secondo Esc termina il comando. Un oggetto su un layer bloccato dice <Message id="objectOnLockedLayer" /> e chiede di nuovo, e una selezione su qualsiasi altra cosa chiede di nuovo in silenzio. Un testo selezionato prima del comando si apre subito.

## Options

### Undo

Annulla l'ultima modifica di questa esecuzione e chiede di nuovo; se non ne resta nessuna, dice che il comando è stato completamente annullato.

### Mode

Chiede la modalità di modifica: <Keyword id="Single" /> termina il comando dopo un oggetto, <Keyword id="Multiple" /> ne chiede un altro. La modalità si conserva per il MODTESTO successivo, in ogni disegno.

## Missing

Testo di quota: MODTESTO non modifica il testo di una quota, che l'opzione Testo di <Command id="DIMLINEAR" /> imposta mentre la quota viene posizionata. La modifica del contenuto di un testo nella tavolozza Proprietà. MTEDIT, digitato, e -MTEDIT. Mentre l'editor è aperto la riga di comando legge `TEXTEDIT:`, poiché AutoCAD modifica sul posto e non chiede nulla.

## Questions

### Qual è l'alias di MODTESTO in AutoCAD?

`MOD`, poi Invio o barra spaziatrice; anche `DDEDIT` e `MT`. `_TEXTEDIT` funziona in qualsiasi lingua di AutoCAD.

### Come si modifica il testo in AutoCAD?

Fai doppio clic su di esso, oppure digita `MOD` e indicalo; riscrivilo e premi Invio. MODTESTO chiede poi il testo successivo da modificare, finché non premi Esc. La sua altezza e rotazione sono righe della tavolozza Proprietà, e il suo stile la riga Stile.

### Come si modificano più testi uno dopo l'altro?

Lascia MODTESTO in modalità <Keyword id="Multiple" />, il suo valore predefinito: dopo ogni testo chiede il successivo. <Keyword id="Mode" /> e <Keyword id="Single" /> lo fanno terminare dopo uno, come fa un doppio clic.

### Perché il doppio clic non modifica il mio testo?

Il testo potrebbe essere su un layer bloccato: sblocca il layer in Gestore proprietà layer. Il testo di una quota non viene ancora modificato da MODTESTO, e i valori degli attributi di un blocco aprono <Command id="EATTEDIT" />.
