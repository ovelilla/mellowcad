---
title: "Comando 3DORBITA (3DORBIT) in AutoCAD"
description: "Come funziona l'orbita 3D di AutoCAD in italiano (3DORBITA, 3DO, ORBIT): ruotare la vista, uscire, Maiusc e rotellina, tornare alla vista piana. Provala gratis."
figure: "Una scatola vista prima in pianta: 3DORBITA, un trascinamento in orizzontale e poi in basso, quindi Invio, e la scatola è vista dall'alto del suo spigolo anteriore."
sourceHash: "66fc1859c8fd"
---

3DORBITA ruota la vista attorno al disegno mentre trascini; nulla nel disegno si muove né cambia. Trascinare in orizzontale ruota la camera attorno all'asse Z del mondo, trascinare in alto e in basso la alza o la abbassa, attorno al centro del disegno sotto il centro dello schermo, in proiezione parallela. Parte dicendo come uscirne: finché è attivo puoi solo orbitare, e Invio o Esc lo termina, dopo il trascinamento o no.

Tenendo premuti Maiusc e la rotellina si orbita da qualsiasi punto, anche dentro un altro comando, e anche il pulsante Orbita della barra di navigazione lo avvia. Digitato con un apostrofo, `'3DORBIT`, funziona dentro un altro comando, che prosegue dopo. Ogni trascinamento è un passo per <Keyword command="ZOOM" id="Previous" /> di <Command id="ZOOM" />, e l'intera esecuzione è un solo passo di annullamento, quindi <Command id="U" /> rimette a posto la vista. Per vedere i solidi come solidi, non come fili, usa <Command id="VSCURRENT" />; il 3D di MellowCAD è solo solidi, e ancora parziale.

## Missing

Il menu del clic destro, con le sue proiezioni, i suoi stili di visualizzazione e le altre modalità di navigazione. L'orbita attorno ai soli oggetti selezionati. La prospettiva. 3DFORBIT, 3DCORBIT e il resto della navigazione 3D di AutoCAD.

## Questions

### Qual è la scorciatoia dell'orbita 3D in AutoCAD?

`3DO` oppure `ORBIT`, poi Invio o barra spaziatrice. Senza digitare nulla, tieni premuti Maiusc e la rotellina e trascina.

### Come si orbita con il mouse?

Tieni premuto Maiusc, premi la rotellina e trascina: in orizzontale per ruotare il modello, in alto e in basso per guardarlo da più in alto o più in basso. Rilascia e torni nel comando in cui eri.

### Come si esce dall'orbita 3D?

Premi Invio o Esc. La vista resta dove l'hai lasciata.

### Come si torna alla vista piana dopo aver orbitato?

Esegui <Command id="PLAN" /> e premi Invio, oppure <Command id="-VIEW" /> e <Keyword command="VIEW" id="Top" />, oppure fai clic sulla faccia superiore del ViewCube. <Command id="ZOOM" /> <Keyword command="ZOOM" id="Previous" /> torna indietro un trascinamento alla volta.
