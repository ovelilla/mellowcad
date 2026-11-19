---
title: "Attribútumok megjelenítése az AutoCAD-ben: ATTLÁTH (ATTDISP) parancs"
metaTitle: "Attribútumok láthatósága: ATTLÁTH (ATTDISP)"
description: "Attribútumok láthatósága az AutoCAD-ben az ATTLÁTH (ATTDISP) paranccsal: Normál, Be a láthatatlanokkal is, Ki mindet elrejti. A rajzba mentődik. Próbálja ki."
figure: "Két íróasztal, amelyek cikkszáma láthatatlan attribútum: az ATTLÁTH Be mindegyik asztal alatt megjeleníti őket, a látható számok mellett."
sourceHash: "8821fdeb2077"
---

Az ATTLÁTH (ATTDISP) parancs azt állítja be, mely attribútumokat mutatják a rajz blokkreferenciái. Bekéri a beállítást, az aktuálisat felkínálva, új rajzban a Normál beállítást; minden más szóra kiírja, hogy a kulcsszó érvénytelen, és újra kérdez, az Enter pedig megtartja az aktuálisat. A módosítás az egész rajzot újrarajzolja – `Modell regenerálása.`, ahogy az AutoCAD 2027 írja –, ATTMODE néven a rajzba mentődik, és egy lépés, amelyet a <Command id="U" /> parancs visszavon. Egy parancson belül aposztróffal beírva ott is lefut.

Csak azt változtatja meg, mi látszik: a láthatatlan attribútum megtartja az értékét, a rejtett pedig továbbra is szerkeszthető az <Command id="ATTEDIT" /> vagy a <Command id="EATTEDIT" /> paranccsal.

## Options

### Normal

Minden attribútumot úgy mutat, ahogy definiálták: a láthatókat, de nem azokat, amelyeket az <Command id="ATTDEF" /> parancs <Keyword command="ATTDEF" id="Invisible" /> módjával definiáltak.

### ON

Minden attribútumot megjelenít, a láthatatlanokat is.

### OFF

Minden attribútumot elrejt, a láthatókat is.

## Questions

### Hogyan lehet megjeleníteni a láthatatlan attribútumokat az AutoCAD-ben?

Írja be az `ATTLÁTH` parancsot, és válassza a <Keyword id="ON" /> opciót: minden attribútum megjelenik, a láthatatlanok is. A <Keyword id="Normal" /> opció ismét elrejti őket.

### Miért nem látszanak a blokk attribútumai?

Lehet, hogy az <Command id="ATTDISP" /> beállítása <Keyword id="OFF" />, ami minden attribútumot elrejt, vagy <Keyword id="Normal" />, és az attribútumokat láthatatlannak definiálták. Válassza a <Keyword id="ON" /> opciót, hogy mindet lássa. Az a referencia, amelynek a blokkjában nincs attribútum, semmit sem mutat, bármi a beállítás.

### Hogyan lehet elrejteni az attribútumértékeket az AutoCAD-ben?

Definiálja őket láthatatlannak: az <Command id="ATTDEF" /> parancs <Keyword command="ATTDEF" id="Invisible" /> módjával, mielőtt a blokkot létrehozza. Az ATTLÁTH parancs <Keyword id="OFF" /> opciója egyszerre minden attribútumot elrejt, az egész rajzban.
