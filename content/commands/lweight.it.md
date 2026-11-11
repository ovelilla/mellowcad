---
title: "Comando SPESSLIN (LWEIGHT) in AutoCAD"
description: "Come funziona SPESSLIN (LWEIGHT, alias SLI) di AutoCAD in italiano: lo spessore di linea dei nuovi oggetti in mm, i 24 valori standard e DaLayer."
figure: "Una piastra con il contorno a 0,70 mm, poi 0.1 digitato per il suo foro, arrotondato a 0,09 mm: i due spessori come li mostra lo schermo."
sourceHash: "154784b2b402"
---

SPESSLIN (LWEIGHT in inglese) imposta lo spessore di linea con cui vengono disegnati i nuovi oggetti, in millimetri. AutoCAD apre la finestra Impostazioni spessore linea; MellowCAD non ne ha ancora una, quindi SPESSLIN esegue la forma da riga di comando che ha anche AutoCAD, <Command id="-LWEIGHT" />. Dice lo spessore di linea corrente, `DALAYER` all'inizio, e ne chiede uno nuovo: uno dei 24 valori standard di AutoCAD, da 0,00 a 2,11 mm. Qualunque altro valore viene portato al più vicino standard, dicendolo, e uno negativo viene rifiutato con <Message id="invalidLineweightNumber" />. Invio mantiene lo spessore di linea corrente. Ogni modifica è un passo che <Command id="U" /> annulla.

Gli spessori di linea qui si vedono sullo schermo fin dall'inizio: AutoCAD li mostra solo quando il pulsante Spessore di linea della barra di stato (LWDISPLAY) è attivo, ma senza layout né stampa in MellowCAD, lo schermo è l'unico posto dove potrebbero vedersi. Il pulsante li disattiva e li attiva. Una polilinea larga mostra la sua larghezza in pianta, non il suo spessore di linea.

## Options

### ?

Elenca i valori che accetta, DaLayer e i 24 spessori di linea standard, poi chiede di nuovo.

### BYLAYER

I nuovi oggetti prendono lo spessore di linea del loro layer, come all'inizio.

## Missing

DaBlocco e Default (LWDEFAULT), spessori di linea in pollici, la finestra Impostazioni spessore linea e la voce Impostazioni spessore linea… dell'elenco a discesa.

## Questions

### Come si chiama il comando LWEIGHT in italiano?

SPESSLIN, alias `SLI`, poi Invio o barra spaziatrice; anche `SPESSLINEA` e `LINEWEIGHT`, mentre l'alias inglese `LW` in AutoCAD in italiano non esiste. Come in AutoCAD in italiano, il nome inglese funziona anche con il trattino basso davanti: `_LWEIGHT`.

### Perché lo spessore di linea non si vede in AutoCAD?

In AutoCAD, gli spessori di linea si vedono sullo schermo solo con il pulsante Spessore di linea della barra di stato attivo (LWDISPLAY 1); parte disattivato. Qui parte attivo. Gli spessori sottili si disegnano tutti come la linea più sottile dello schermo, quindi la differenza si vede su quelli più spessi; e un oggetto il cui spessore di linea è DaLayer prende quello del suo layer.

### Come si cambia lo spessore di linea di un oggetto esistente?

Selezionalo e scegli lo spessore di linea nella riga Spessore di linea della tavolozza Proprietà, oppure quello proprio del layer nel Gestore proprietà layer quando l'oggetto è DaLayer. SPESSLIN imposta solo lo spessore di linea degli oggetti disegnati dopo di esso.

### Quali spessori di linea ha AutoCAD?

24 valori fissi in millimetri: 0,00, 0,05, 0,09, 0,13, 0,15, 0,18, 0,20, 0,25, 0,30, 0,35, 0,40, 0,50, 0,53, 0,60, 0,70, 0,80, 0,90, 1,00, 1,06, 1,20, 1,40, 1,58, 2,00 e 2,11. Digitane un altro, per esempio 0.45, e SPESSLIN prende il più vicino, il più sottile in caso di parità.
