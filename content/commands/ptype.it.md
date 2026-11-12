---
title: "Comando TIPOP (PTYPE) in AutoCAD"
description: "Come funziona TIPOP (PTYPE, alias DDPTYPE) di AutoCAD in italiano: la finestra Stile punto, le sue venti figure, la dimensione, PDMODE e PDSIZE. Provalo gratis."
figure: "TIPOP apre la finestra Stile punto; il suo OK scrive PDMODE e PDSIZE, digitati qui come 35 e 8, poi tre punti disegnati dentro una piastra."
sourceHash: "02cea384a2a9"
---

TIPOP (PTYPE) apre la finestra di dialogo Stile punto, che stabilisce come viene disegnato ogni oggetto punto del disegno: quelli che disegna <Command id="POINT" /> e quelli che lasciano <Command id="DIVIDE" /> e <Command id="MEASURE" />. `DDPTYPE` è il suo alias, come in AutoCAD. Lo stile è del disegno, non di un punto: cambialo e cambiano tutti insieme, e si salva con il disegno. Il suo pulsante, Stile punto, sta accanto a Punto ID tra gli strumenti di Utilità; digitato con un apostrofo davanti, `'TIPOP`, si apre dentro un comando in corso.

La finestra mostra venti figure in quattro righe da cinque, con quella corrente scelta: un punto minuscolo, niente, un segno più, una croce e un trattino corto, poi ciascuna dentro un cerchio, dentro un quadrato e dentro entrambi. Sotto, Dimensione punto e come va letta: Dimensioni relative allo schermo, una percentuale dell'altezza della vista, o Dimensioni in unità assolute, unità di disegno. Il valore predefinito è il 5 % relativo allo schermo. OK scrive la scelta come un passo che <Command id="U" /> annulla; Annulla o Esc non cambiano nulla. Una dimensione che non è un numero, o minore di 0, viene rifiutata (Input non valido.) e la finestra resta aperta.

Quello che la finestra scrive sono due variabili, che si possono anche digitare nella riga di comando: PDMODE, la figura (da 0 a 4, più 32 per il cerchio, 64 per il quadrato, 96 per entrambi: 35 è una croce in un cerchio), e PDSIZE, la dimensione (un numero positivo è in unità di disegno, uno negativo una percentuale dello schermo, e 0 vale il 5 %).

## Missing

Il pulsante Guida della finestra. Un punto dimensionato rispetto allo schermo mantiene quella dimensione sullo schermo quando si fa zoom, dove AutoCAD la mantiene solo fino alla successiva rigenerazione del disegno.

## Questions

### Che cos'è DDPTYPE in AutoCAD?

L'alias di TIPOP (PTYPE in inglese): entrambi aprono la finestra Stile punto, in qualsiasi lingua di AutoCAD.

### Perché i punti non si vedono in AutoCAD?

Lo stile del punto predefinito è un punto di un pixel, che una linea disegnata sopra nasconde, e PDMODE 1 non disegna nulla. Apri TIPOP e scegli una croce o una figura con il cerchio, oppure digita PDMODE e `3`. Con una dimensione relativa allo schermo restano visibili a qualsiasi zoom.

### Come si cambia la dimensione dei punti?

In TIPOP, digita la Dimensione punto: una percentuale dello schermo con Dimensioni relative allo schermo, perché il punto mantenga la sua dimensione quando fai zoom, o unità di disegno con Dimensioni in unità assolute, perché cresca e diminuisca con il disegno. Oppure digita PDSIZE: un valore negativo è la percentuale.

### Posso dare a un punto uno stile tutto suo?

No: in AutoCAD come qui, lo stile del punto è del disegno, e tutti gli oggetti punto lo seguono. Per segnare dei punti in un altro modo, inserisci lì un blocco; <Command id="DIVIDE" /> e <Command id="MEASURE" /> possono mettere un blocco al posto dei punti.
