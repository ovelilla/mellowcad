---
title: "AutoCAD SPLINEDIT parancs"
description: "Így működik az AutoCAD SPLINEDIT (SPE) parancsa: bezárás, egyesítés, illesztési adatok, csomópontok, vonallánccá konvertálás és megfordítás. Próbálja ki ingyen."
figure: "Öt illesztési ponton átmenő spline, a SPLINEDIT paranccsal bezárva: sima hurok, amely mindegyiken átmegy."
sourceHash: "bedcaab2fac3"
---

A SPLINEDIT parancs spline-t szerkeszt. Jelölje ki a `Válasszon spline objektumot:` promptnál, vagy még a parancs előtt; a spline-ra duplán kattintva is a SPLINEDIT parancs indul. Minden más objektumra ez a válasz: <Message id="objectNotSpline" />, és a parancs újra kérdez; a VLEDIT parancs Spline opciójával illesztett vonalláncot szó nélkül ugyanilyen görbéjű spline-ná alakítja. Ezután újra és újra opciót kér, és mindegyiket azonnal végrehajtja, amíg a <Keyword id="eXit" /> opciót nem választja, vagy meg nem nyomja az Enter billentyűt. A spline megmutatja az illesztési pontjai fogóit, a csúcspontok szerkesztése közben pedig a vezérlő csomópontjait és a vezérlőkeretét. Az egész szerkesztés egyetlen lépés, amelyet a <Command id="U" /> parancs visszavon. Bármelyik promptjánál működik a begépelt `'ZOOM`.

## Options

### Close

Simán bezárja a spline-t: az illesztett spline-t az illesztési pontjain át, a vezérlő csomópontos spline-t a csomópontjain. Bezárt spline esetén az opció neve <Keyword id="Open" />, és az Egyesít opció nem jelenik meg.

### Join

A végeihez csatlakozó nyitott görbéket hozzáfűzi, az EGYBEFŰZ parancs spline-ra vonatkozó szabályai szerint, és kiírja, hányat fűzött hozzá.

### Fit data

Azokat a pontokat szerkeszti, amelyeken a spline átmegy. A vezérlő csomópontos spline-nak nincsenek ilyen pontjai, ezért előbb illesztési pontokat kap a görbéjén. Opciói: a <Keyword id="Add" /> kijelöl egy illesztési pontot, és utána újakat ad hozzá, újra és újra (nyitott spline első pontjánál <Keyword id="After" /> vagy <Keyword id="Before" />); a <Keyword id="Delete" /> illesztési pontokat töröl, amíg kettő nem marad, bezárt spline esetén három (<Message id="cannotDeleteBeyond" />); a <Keyword id="Move" /> a <Keyword id="Next" /> és az <Keyword id="Previous" /> opcióval vagy a <Keyword id="Select point" /> opcióval lépked az illesztési pontok között, és az aktuálisat a megadott pontba mozgatja; a <Keyword id="Purge" /> eldobja az illesztési adatokat, és vezérlő csomópontos spline marad; az <Keyword id="Tangents" /> a kezdő és a záró irányt állítja be, vagy a <Keyword id="System default" /> értéket; a <Keyword id="Close" /> és a <Keyword id="eXit" /> ugyanaz, mint az első promptnál. Ha a kijelölt pont nem illesztési pont, ez jelenik meg: <Message id="notAFitPoint" />.

### Edit vertex

A vezérlő csomópontokat szerkeszti; az illesztett spline az első szerkesztésnél elveszíti az illesztési adatait. A <Keyword id="Add" /> csomópontot tesz a spline-on kijelölt pontba; a <Keyword id="Delete" /> töröl egyet, amíg kettő nem marad, bezárt spline esetén három; a <Keyword id="Elevate order" /> növeli a rendet, legfeljebb 26-ig, csökkenteni soha nem lehet; a <Keyword id="Move" /> csomópontokat mozgat, úgy lépkedve, mint az illesztési adatok Mozgatás opciója; a <Keyword id="Weight" /> egy csomópont súlyát állítja be, ezen üzenet után: <Message id="splineMadeRational" />, így a görbe közelebb húzódik hozzá, vagy távolabb kerül tőle. Ha a kijelölt pont nem csomópont, ez jelenik meg: <Message id="notAControlVertex" />.

### convert to Polyline

0 és 99 közötti pontosságot kér, alapértelmezés szerint 10-et, és a spline-t egyenes szakaszokból álló vonallánccal helyettesíti: minél nagyobb a pontosság, annál több szakasszal. Ha a spline nem fekszik síkban, az XY síkkal párhuzamosan, 3D vonallánc lesz belőle. Ezzel a parancs befejeződik. A pontosság a munkamenet végéig megmarad, és a VLEDIT parancs konverziója is ezt használja.

### Reverse

Megfordítja a spline-t, az első pontja lesz az utolsó: <Message id="splineReversed" />.

### Undo

Visszavonja az utolsó opciót, egy teljes illesztésiadat- vagy csomópontszerkesztést egyszerre. Ha már nincs mit visszavonni: <Message id="commandCompletelyUndone" />.

### eXit

Befejezi a parancsot, ahogy az Enter is.

## Missing

A Csomó opció, amely éles sarkot tesz egy illesztési pontba vagy csomópontba; a Tűrés opció, amely tűrésen belül újra illeszti a spline-t; bezárt spline Érintők opciója. A vonallánccá konvertálás illesztett spline-ból sokkal több csúcspontot készít, mint az AutoCAD, ívet soha, és mindig lecseréli a spline-t. A Csoport opció a `Válasszon spline objektumot:` promptnál. A `+` jel, amelyet az AutoCAD az aktuális pontra rajzol, miközben a pontok között lépked.

## Questions

### Mi az AutoCAD SPLINEDIT parancs magyarul?

A magyar AutoCAD-ben is SPLINEDIT a neve, és a rövidítése is `SPE`, akárcsak az angolban: írja be valamelyiket, majd nyomja meg az Enter vagy a Szóköz billentyűt. A `_SPLINEDIT` az AutoCAD bármely nyelvi változatában működik. A spline-ra duplán kattintva is elindul.

### Hogyan lehet a spline-t vonallánccá alakítani?

Indítsa el a SPLINEDIT parancsot, jelölje ki a spline-t, és válassza a <Keyword id="convert to Polyline" /> opciót; 10-es pontossággal sima vonalláncot kap. A <Command id="PEDIT" /> parancs is felajánlja a spline átalakítását.

### Hogyan lehet pontokat hozzáadni a spline-hoz vagy mozgatni rajta?

Válassza az <Keyword id="Fit data" /> opciót, ha azokon a pontokon dolgozna, amelyeken a spline átmegy, majd a <Keyword id="Add" /> vagy a <Keyword id="Move" /> opciót. Válassza a <Keyword id="Edit vertex" /> opciót, ha a spline-t keretező vezérlő csomópontokon dolgozna.

### Hogyan lehet bezárni a spline-t?

Válassza a <Keyword id="Close" /> opciót: a spline simán, sarok nélkül záródik ott, ahol önmagához ér. A <Keyword id="Open" /> opció újra kinyitja.

### Hogyan lehet két spline-t egyesíteni?

Válassza az <Keyword id="Join" /> opciót, és jelölje ki azt a spline-t, amelynek a vége ennek a végéhez ér, vagy használja az <Command id="JOIN" /> parancsot.
