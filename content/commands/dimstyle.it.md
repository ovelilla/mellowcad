---
title: "Comando DIMSTILE (DIMSTYLE) in AutoCAD"
description: "Stili di quota in AutoCAD in italiano: DIMSTILE (DIMSTYLE, alias D, DST), ISO-25, Nuovo, Imposta corrente, testo, frecce, scala e unità. Provalo nel browser."
figure: "Quote disegnate in ISO-25, lo stile corrente: frecce, il testo sopra la linea e una virgola come separatore decimale."
sourceHash: "7bcae870d3ae"
---

DIMSTILE (DIMSTYLE in inglese) gestisce gli stili di quota del disegno: insiemi di impostazioni con un nome, dimensione della freccia, altezza del testo, scala generale, unità e il resto, che ogni quota prende dal proprio stile. Un nuovo disegno parte con ISO-25 come stile corrente, lo stile metrico con cui parte AutoCAD. DIMSTILE apre Gestione stili di quota, come in AutoCAD; digitato con un apostrofo all'interno di un comando, `'DIMSTILE`, si apre senza terminare quel comando.

Il gestore indica lo stile corrente ed elenca gli stili, tutti o solo quelli in uso. Imposta corrente rende corrente lo stile selezionato. Nuovo... chiede un nome, proponendo `Copia di` seguito dallo stile da cui parte, poi apre le impostazioni del nuovo stile; diventa corrente quando il gestore si chiude. Modifica... apre le impostazioni dello stile selezionato sulle schede del gestore: Linee (spaziatura linea base, estensione oltre le linee di quota, offset dall'origine), Simboli e frecce (dimensione freccia, centri), Testo (altezza testo, offset dalla linea di quota), Adatta (la scala generale e se una linea di quota viene disegnata tra le linee di estensione) e Unità primarie (precisione, separatore decimale, zeri finali, precisione angolare). OK le applica, e tutte le quote di quello stile vengono ridisegnate subito. Un clic destro su uno stile lo rinomina o lo elimina; un nome già in uso viene rifiutato, e ISO-25, lo stile corrente e uno stile in uso non si possono eliminare. Tutto ciò che si fa nel gestore è un solo passo che U annulla.

## Missing

L'anteprima, la Descrizione, Modifica locale e Confronta del gestore; niente sottostili per un tipo di quota, né Unità alternative o Tolleranze, e solo le impostazioni elencate sopra. Una variabile di quota digitata nella riga di comando, come DIMSCALE, non crea una modifica locale dello stile corrente. Un nuovo disegno ha solo ISO-25, senza gli stili Standard e Annotativo che un nuovo disegno metrico contiene anche in AutoCAD.

## Questions

### Come si chiama il comando DIMSTYLE in italiano?

DIMSTILE, alias `D`, poi Invio o barra spaziatrice; anche `DST` e `DDIM`. Come in AutoCAD in italiano, il nome inglese funziona anche con il trattino basso davanti: `_DIMSTYLE`. <Command id="-DIMSTYLE" /> funziona invece nella riga di comando: salva le impostazioni correnti come nuovo stile, oppure rende corrente uno stile per nome.

### Come si cambia la dimensione del testo delle quote in AutoCAD?

Seleziona lo stile nel gestore, premi Modifica... e cambia Altezza testo, nella scheda Testo, oppure Utilizza scala generale di, nella scheda Adatta, che moltiplica tutte le dimensioni dello stile, frecce e offset insieme al testo. Tutte le quote di quello stile vengono ridisegnate subito. Per cambiare solo alcune quote, dai loro uno stile proprio.

### Come si applica uno stile di quota a quote esistenti?

Seleziona le quote e scegli lo stile nella riga Stile quota della tavolozza Proprietà, oppure fai clic destro su di esse e sceglilo sotto Stile quota: in entrambi i casi un solo passo di annullamento. Le nuove quote prendono lo stile corrente, che Imposta corrente cambia nel gestore.

### Come si cambia il separatore decimale delle quote?

ISO-25 scrive una virgola, come `82,5`. Nella scheda Unità primarie, imposta Separatore decimale su un punto o uno spazio; Precisione e Sopprimi zeri finali sono lì. La riga di comando riporta ancora la misura con il punto, come fa quella di AutoCAD.

### Come si crea un nuovo stile di quota?

Premi Nuovo..., dagli un nome e scegli lo stile da cui inizia, poi Continua: si aprono le sue impostazioni, e OK lo crea. Diventa corrente quando il gestore si chiude, e ogni quota disegnata da quel momento lo usa.
