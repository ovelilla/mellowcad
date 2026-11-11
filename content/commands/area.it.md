---
title: "Comando AREA in AutoCAD"
description: "Come funziona AREA (alias AA) di AutoCAD in italiano: area e perimetro di punti indicati o di un oggetto, e un totale con Aggiungi e Sottrai. Provalo gratis."
figure: "Una piastra 100 per 60 con un foro di raggio 18: AREA aggiunge l'area della piastra, sottrae quella del foro e scrive il totale rimasto."
sourceHash: "a8ad70c08b3a"
---

AREA misura l'area e il perimetro di una forma chiusa, che tu la delinei con i suoi angoli o la selezioni come oggetto. Indica il primo angolo, poi i successivi: dal secondo, la forma chiusa fino al cursore si riempie di verde traslucido, come in AutoCAD. Invio o <Keyword id="Total" /> scrive `Area = …, Perimetro = …` alla riga di comando e termina; Invio prima del terzo angolo è rifiutato. Con Aggiungi area e Sottrai area tiene un totale corrente su più forme. I numeri sono scritti alla precisione del disegno, e l'ultima area misurata si può rileggere digitando `'AREA`.

## Options

### Object

Il predefinito della prima richiesta, quindi Invio lo sceglie: seleziona un cerchio, un'ellisse, una polilinea o spline chiusa, un tratteggio o una regione, e AREA ne scrive l'area con il perimetro, o la circonferenza di un cerchio. Una polilinea, spline o arco ellittico aperti sono chiusi da una linea retta da un estremo all'altro, e AREA ne scrive la lunghezza. Una linea o un testo non hanno area: <Message id="objectHasNoArea" />, e chiede di nuovo l'oggetto.

### Add

Avvia un totale corrente: ogni area misurata dopo, per angoli o con <Keyword id="Object" />, è aggiunta, e AREA scrive l'area e il totale. Invio termina gli oggetti o gli angoli e chiede di nuovo, finché Invio alla prima richiesta termina.

### Subtract

Lo stesso, togliendo ogni area dal totale: la piastra, poi i suoi fori.

### Undo

Annulla l'ultimo angolo indicato.

### Total

Scrive l'area e il perimetro degli angoli indicati, e termina.

## Missing

MEASUREGEOM, gli strumenti Misura della barra multifunzione, con le loro opzioni Raggio, Angolo, Volume e Rapida: qui i pulsanti Distanza e Area della barra multifunzione eseguono DIST e AREA. Le opzioni Arco e Lunghezza al punto successivo di AREA. Gli angoli fuori dal piano dell'UCS corrente sono misurati in pianta, dove AutoCAD li misura in 3D, e il messaggio di AutoCAD `Oggetto non parallelo all'UCS.` per un oggetto inclinato rispetto all'UCS non è dato.

## Questions

### Qual è la scorciatoia di AREA in AutoCAD?

`AA`, poi Invio o barra spaziatrice. Funziona anche il nome completo, e `_AREA` in tutte le lingue di AutoCAD.

### Come si trova l'area di una polilinea o di un tratteggio?

Esegui AREA, premi Invio per scegliere <Keyword id="Object" />, e seleziona la polilinea chiusa o il tratteggio: la sua area e il suo perimetro sono scritti alla riga di comando. L'area di un tratteggio esclude le sue isole.

### Come si sottrae un'area in AutoCAD?

Scegli <Keyword id="Add" /> e poi <Keyword id="Object" />, seleziona la forma esterna e premi Invio; poi scegli <Keyword id="Subtract" />, <Keyword id="Object" />, e seleziona ogni foro. AREA scrive il totale rimasto dopo ciascuno; due Invio terminano.

### Come si ottiene l'area in metri quadrati?

AREA scrive in unità di disegno quadrate. Se disegni in millimetri, dividi per 1.000.000: 6.000.000 sono 6 m². In centimetri, per 10.000.

### Perché AREA dice che l'oggetto non ha area?

Solo le forme e le curve chiuse ne hanno una: linee, archi da soli, testi e quote no. Seleziona una polilinea chiusa, un cerchio o un tratteggio, oppure unisci prima le linee in una polilinea con <Command id="JOIN" />; o delinea la forma con i suoi angoli.
