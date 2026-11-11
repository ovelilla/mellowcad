---
title: "Comando DIMSTILE (DIMSTYLE) in AutoCAD"
description: "Stili di quota in AutoCAD in italiano: DIMSTILE (DIMSTYLE, alias D, DST), ISO-25, Nuovo, Imposta corrente, testo, frecce, scala e unità. Provalo nel browser."
figure: "Quote disegnate in ISO-25, lo stile corrente: frecce, il testo sopra la linea e una virgola come separatore decimale."
sourceHash: "a363c0740c11"
---

DIMSTILE (DIMSTYLE in inglese) gestisce gli stili di quota del disegno: insiemi di impostazioni con un nome, dimensione della freccia, altezza del testo, scala generale, unità e il resto, che ogni quota prende dal proprio stile. Un nuovo disegno parte con ISO-25 come stile corrente, lo stile metrico con cui parte AutoCAD. Dove AutoCAD apre la finestra di dialogo Gestione stili di quota, DIMSTILE qui apre la tabella delle quote della tavolozza Stili, una scheda del pannello delle tavolozze che resta aperta mentre disegni; <Command id="STYLE" /> apre la stessa tavolozza sui suoi stili di testo.

La tavolozza elenca gli stili, con quello corrente contrassegnato. Nuovo crea una copia dello stile selezionato, con il suo nome, e la rende corrente; uno stile si rinomina nell'elenco e un nome già in uso viene rifiutato. ISO-25, lo stile corrente e uno stile in uso non si possono eliminare. Sotto l'elenco, le impostazioni dello stile selezionato sono raggruppate sotto i nomi delle schede del gestore: Linee (spaziatura linea base, estensione oltre le linee di quota, offset dall'origine), Simboli e frecce (dimensione freccia, dimensione centro), Testo (altezza testo, offset dalla linea di quota), Adatta (la scala generale e se una linea di quota viene disegnata tra le linee di estensione) e Unità primarie (precisione, separatore decimale, zeri finali, precisione angolare). Una modifica ridisegna subito tutte le quote di quello stile. Ogni modifica, e ogni nuovo stile, rinomina, eliminazione e cambio di stile corrente, è un passo che U annulla.

## Missing

La finestra di dialogo Gestione stili di quota in sé: la tavolozza non ha anteprima, filtro dell'elenco, Modifica locale, Confronta o Descrizione, né sottostili per un tipo di quota, né Unità alternative o Tolleranze, e solo le impostazioni elencate sopra. Una variabile di quota digitata nella riga di comando, come DIMSCALE, non crea una modifica locale dello stile corrente. Un nuovo disegno ha solo ISO-25, senza gli stili Standard e Annotativo che un nuovo disegno metrico contiene anche in AutoCAD.

## Questions

### Come si chiama il comando DIMSTYLE in italiano?

DIMSTILE, alias `D`, poi Invio o barra spaziatrice; anche `DST` e `DDIM`. Come in AutoCAD in italiano, il nome inglese funziona anche con il trattino basso davanti: `_DIMSTYLE`. <Command id="-DIMSTYLE" /> funziona invece nella riga di comando: salva le impostazioni correnti come nuovo stile, oppure rende corrente uno stile per nome.

### Come si cambia la dimensione del testo delle quote in AutoCAD?

Seleziona lo stile nella tavolozza e cambia Altezza testo, sotto Testo, oppure Utilizza scala generale di, sotto Adatta, che moltiplica tutte le dimensioni dello stile, frecce e offset insieme al testo. Tutte le quote di quello stile vengono ridisegnate subito. Per cambiare solo alcune quote, dai loro uno stile proprio.

### Come si applica uno stile di quota a quote esistenti?

Seleziona le quote e scegli lo stile nella riga Stile quota della tavolozza Proprietà, oppure fai clic destro su di esse e sceglilo sotto Stile quota: in entrambi i casi un solo passo di annullamento. Le nuove quote prendono lo stile corrente, che Imposta corrente cambia nella tavolozza.

### Come si cambia il separatore decimale delle quote?

ISO-25 scrive una virgola, come `82,5`. Sotto Unità primarie, imposta Separatore decimale su un punto o uno spazio; Precisione e Sopprimi zeri finali sono lì. La riga di comando riporta ancora la misura con il punto, come fa quella di AutoCAD.

### Come si crea un nuovo stile di quota?

Seleziona lo stile da cui partire e premi Nuovo: la copia prende il suo nome, diventa corrente ed è pronta per essere rinominata e modificata. Ogni quota disegnata da quel momento la usa.
