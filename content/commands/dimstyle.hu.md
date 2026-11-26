---
title: "Méretstílus az AutoCAD-ben: MÉRETSTÍLUS (DIMSTYLE) parancs"
metaTitle: "Méretstílus az AutoCAD-ben: MÉRETSTÍLUS"
description: "Méretstílus az AutoCAD MÉRETSTÍLUS (DIMSTYLE, D) parancsával: stílusok az ISO-25-ből, szövegmagasság, nyilak, lépték és mértékegységek. Próbálja ki ingyen."
figure: "Az aktuális ISO-25 stílusban rajzolt méretek: nyilak, a vonal fölötti szöveg és tizedesvessző."
sourceHash: "b7333ee9b6b4"
---

A MÉRETSTÍLUS (DIMSTYLE) parancs a rajz méretstílusait kezeli: elnevezett beállításkészleteket – nyílméret, szövegmagasság, teljes lépték, mértékegységek és a többi –, amelyeket minden méret a saját stílusától vesz át. Az új rajz az ISO-25 aktuális stílussal indul, azzal a metrikus stílussal, amellyel az AutoCAD is. A MÉRETSTÍLUS parancs a Méretstílus-kezelőt nyitja meg, ahogy az AutoCAD-ben; aposztróffal egy parancson belül begépelve (`'MÉRETSTÍLUS`) úgy nyílik meg, hogy az a parancs nem fejeződik be.

A kezelő megnevezi az aktuális stílust, és felsorolja a stílusokat: mindet, vagy csak a felhasználtakat. Az Aktuális gomb a kijelölt stílust teszi aktuálissá. Az Új... nevet kér, a kiinduló stílus nevéből képzett `Másolat - …` nevet ajánlva fel, majd megnyitja az új stílus beállításait; a stílus a kezelő bezárásakor válik aktuálissá. A Módosítás... a kijelölt stílus beállításait nyitja meg a kezelő lapjain: Vonalak (méretvonalak távolsága, túlnyúlás a méretvonalakon, eltolás a kezdőponttól), Jelek és nyilak (nyílfej mérete, középjelek), Szöveg (szöveg magassága, eltolás a méretvonaltól), Illesztés (a globális lépték, és hogy rajzoljon-e méretvonalat a segédvonalak közé) és Elsődleges mértékegységek (pontosság, tizedesjel, számvégi nullák elhagyása, szögpontosság). Az OK alkalmazza őket, és az adott stílusú összes méret azonnal újrarajzolódik. Egy stílusra a jobb gombbal kattintva átnevezhető vagy törölhető; a már használt nevet a kezelő elutasítja, és az ISO-25, az aktuális stílus és a használatban lévő stílus nem törölhető. Minden, amit a kezelőben végez, egyetlen lépés, amelyet a <Command id="U" /> parancs visszavon.

## Missing

A kezelő előnézete, Leírása, Felülírás és Összehasonlítás gombja; nincsenek egyes mérettípusokra vonatkozó alstílusok, sem Alternatív mértékegységek és Tűrés, és csak a fent felsorolt beállítások érhetők el. A parancssorban beírt méretezési változó, például a DIMSCALE, nem hoz létre felülírást az aktuális stílushoz. Az új rajzban csak az ISO-25 van meg, a Standard és az Annotative stílus nélkül, amelyek az AutoCAD új metrikus rajzában szintén megtalálhatók.

## Questions

### Mi az AutoCAD MÉRETSTÍLUS parancs angolul?

DIMSTYLE. A magyar AutoCAD-ben a rövidítése `D`, `MST` vagy `MSTIL`: írja be, majd nyomja meg az Enter vagy a Szóköz billentyűt; a `DPMÉRET` is működik. A `_DIMSTYLE` az AutoCAD bármely nyelvi változatában működik; az angol `DST`, `DIMSTY` és `DDIM` a magyar változatban nem. A parancssorban helyette a <Command id="-DIMSTYLE" /> parancs használható: új stílusként menti az aktuális beállításokat, vagy név alapján aktuálissá tesz egy stílust.

### Hogyan lehet módosítani a méretszöveg méretét az AutoCAD-ben?

Jelölje ki a stílust a kezelőben, nyomja meg a Módosítás... gombot, és módosítsa a Szöveg lapon a Szöveg magassága vagy az Illesztés lapon a Globális lépték használata értéket; ez utóbbi a stílus minden méretét megszorozza, a nyilakat és az eltolásokat a szöveggel együtt. Az adott stílusú összes méret azonnal újrarajzolódik. Ha csak néhány méretet szeretne módosítani, adjon nekik saját stílust.

### Hogyan lehet méretstílust alkalmazni meglévő méretekre?

Jelölje ki a méreteket, és válassza ki a stílust a Tulajdonságok paletta Méretstílus sorában, vagy kattintson rájuk a jobb gombbal, és válassza ki a Méretstílus menüpont alatt: mindkét esetben egyetlen visszavonási lépés. Az új méretek az aktuális stílust kapják, amelyet a kezelő Aktuális gombja módosít. A szalag Méretstílus listája (Feliratozás › Méretek, valamint a Kezdőlap › Feliratozás panel kibontott része) ugyanezt teszi: kijelölt méreteknek a stílusát cseréli, kijelölés nélkül a stílust teszi aktuálissá.

### Hogyan lehet módosítani a méretek tizedesjelét?

Az ISO-25 vesszőt ír, például `82,5`. Az Elsődleges mértékegységek lapon állítsa a Tizedesjel értékét pontra vagy szóközre; ugyanitt található a Pontosság és a Számvégi nullák elhagyása is. A parancssor továbbra is ponttal írja ki a mért értéket, ahogy az AutoCAD-é is.

### Hogyan lehet új méretstílust létrehozni?

Nyomja meg az Új... gombot, adja meg a nevét, válassza ki az Alapja mezőben a kiinduló stílust, majd nyomja meg a Folytatás gombot: megnyílnak a beállításai, és az OK létrehozza. A kezelő bezárásakor válik aktuálissá, és minden ezután rajzolt méret ezt kapja.
