---
title: "Méretstílus az AutoCAD-ben: MÉRETSTÍLUS (DIMSTYLE) parancs"
metaTitle: "Méretstílus az AutoCAD-ben: MÉRETSTÍLUS"
description: "Méretstílus az AutoCAD MÉRETSTÍLUS (DIMSTYLE, D) parancsával: stílusok az ISO-25-ből, szövegmagasság, nyilak, lépték és mértékegységek. Próbálja ki ingyen."
figure: "Az aktuális ISO-25 stílusban rajzolt méretek: nyilak, a vonal fölötti szöveg és tizedesvessző."
sourceHash: "a363c0740c11"
---

A MÉRETSTÍLUS (DIMSTYLE) parancs a rajz méretstílusait kezeli: elnevezett beállításkészleteket – nyílméret, szövegmagasság, teljes lépték, mértékegységek és a többi –, amelyeket minden méret a saját stílusától vesz át. Az új rajz az ISO-25 aktuális stílussal indul, azzal a metrikus stílussal, amellyel az AutoCAD is. Ahol az AutoCAD a Méretstílus-kezelő párbeszédpanelt nyitja meg, itt a MÉRETSTÍLUS parancs a Stílusok paletta méretstílus-táblázatát nyitja meg, amely a palettapanel egyik lapja, és rajzolás közben is nyitva marad; a <Command id="STYLE" /> parancs ugyanezt a palettát a szövegstílusoknál nyitja meg.

A paletta felsorolja a stílusokat, az aktuálisat megjelölve. Az Új gomb másolatot készít a kijelölt stílusról, a stílus nevéből képzett névvel, és aktuálissá teszi; a stílus a listában nevezhető át, és a már használt nevet a paletta elutasítja. Az ISO-25, az aktuális stílus és a használatban lévő stílus nem törölhető. A lista alatt a kijelölt stílus beállításai a kezelő lapjainak nevei alatt csoportosítva jelennek meg: Vonal (méretvonalak távolsága, túlnyúlás a méretvonalakon, eltolás a kezdőponttól), Jelek és nyilak (nyílfej mérete, középjel mérete), Szöveg (szöveg magassága, eltolás a méretvonaltól), Illesztés (a globális lépték, és hogy rajzoljon-e méretvonalat a segédvonalak közé) és Elsődleges mértékegységek (pontosság, tizedesjel, záró nullák, a szögméretek pontossága). Egy módosítás azonnal újrarajzolja az adott stílusú összes méretet. Minden módosítás, valamint minden új stílus, átnevezés, törlés és az aktuális stílus cseréje egy-egy lépés, amelyet a <Command id="U" /> parancs visszavon.

## Missing

Maga a Méretstílus-kezelő párbeszédpanel: a palettán nincs előnézet, listaszűrő, Felülírás, Összehasonlítás és Leírás, nincsenek egyes mérettípusokra vonatkozó alstílusok, sem Alternatív mértékegységek és Tűrés, és csak a fent felsorolt beállítások érhetők el. A parancssorban beírt méretezési változó, például a DIMSCALE, nem hoz létre felülírást az aktuális stílushoz. Az új rajzban csak az ISO-25 van meg, a Standard és az Annotative stílus nélkül, amelyek az AutoCAD új metrikus rajzában szintén megtalálhatók.

## Questions

### Mi az AutoCAD MÉRETSTÍLUS parancs angolul?

DIMSTYLE. A magyar AutoCAD-ben a rövidítése `D` vagy `MST`: írja be, majd nyomja meg az Enter billentyűt vagy a szóközt. A `_DIMSTYLE` az AutoCAD bármely nyelvi változatában működik; az angol `DST`, `DIMSTY` és `DDIM` a magyar változatban nem. A parancssorban helyette a <Command id="-DIMSTYLE" /> parancs használható: új stílusként menti az aktuális beállításokat, vagy név alapján aktuálissá tesz egy stílust.

### Hogyan lehet módosítani a méretszöveg méretét az AutoCAD-ben?

Jelölje ki a stílust a palettán, és módosítsa a Szöveg alatti Szöveg magassága vagy az Illesztés alatti Globális lépték használata értéket; ez utóbbi a stílus minden méretét megszorozza, a nyilakat és az eltolásokat a szöveggel együtt. Az adott stílusú összes méret azonnal újrarajzolódik. Ha csak néhány méretet szeretne módosítani, adjon nekik saját stílust.

### Hogyan lehet méretstílust alkalmazni meglévő méretekre?

Jelölje ki a méreteket, és válassza ki a stílust a Tulajdonságok paletta Méretstílus sorában, vagy kattintson rájuk a jobb gombbal, és válassza ki a Méretstílus menüpont alatt: mindkét esetben egyetlen visszavonási lépés. Az új méretek az aktuális stílust kapják, amelyet a paletta Aktuálissá tétel gombja módosít.

### Hogyan lehet módosítani a méretek tizedesjelét?

Az ISO-25 vesszőt ír, például `82,5`. Az Elsődleges mértékegységek alatt állítsa a Tizedesjel értékét pontra vagy szóközre; ugyanitt található a Pontosság és a záró nullák elnyomása is. A parancssor továbbra is ponttal írja ki a mért értéket, ahogy az AutoCAD-é is.

### Hogyan lehet új méretstílust létrehozni?

Jelölje ki a kiinduló stílust, és nyomja meg az Új gombot: a másolat a forrásstílus nevéből kap nevet, aktuálissá válik, és átnevezhető, módosítható. Minden ezután rajzolt méret ezt kapja.
