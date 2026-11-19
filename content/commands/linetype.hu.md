---
title: "Vonaltípus az AutoCAD-ben: VTÍPUS (LINETYPE) parancs"
metaTitle: "Vonaltípus az AutoCAD-ben: VTÍPUS (LINETYPE)"
description: "Vonaltípus betöltése az AutoCAD VTÍPUS (LINETYPE, VT) parancsával: acadiso.lin, aktuális típus az új objektumokhoz, FÓLIA, és miért folytonos a szaggatott."
figure: "Egy lemez, amelynek furata aktuális HIDDEN, két tengelye CENTER vonaltípussal készült, majd a VTÍPUS visszaállítva FÓLIA értékre."
sourceHash: "d15530a865c1"
---

A VTÍPUS (LINETYPE) parancs azt a vonaltípust állítja be, amellyel az új objektumok rajzolódnak. Az AutoCAD megnyitja a Vonaltípus-kezelőt; a MellowCAD-ben ez még nincs meg, ezért a VTÍPUS az AutoCAD-ben is meglévő parancssori változatot, a <Command id="-LINETYPE" /> parancsot futtatja. Kiírja az aktuális vonaltípust, kezdetben `FÓLIA`, és minden válasz után újra opciót kér, amíg az Enter be nem fejezi. A FÓLIA (Fólia szerint) azt jelenti, hogy minden objektum a fóliája vonaltípusát kapja; a név szerint megadott vonaltípus az objektum sajátja. A teljes futtatás egyetlen lépés, amelyet a <Command id="U" /> parancs visszavon, és ha aposztróffal, egy parancson belül írják be, a vonaltípusa arra vonatkozik, amit az a parancs ezután rajzol.

A rajz saját vonaltípusokat tartalmaz, amelyek vele és a DXF-fájljában együtt mentődnek. Az új rajzban hat van: a Continuous, valamint az AutoCAD acadiso.lin metrikus fájljából a DASHED, a HIDDEN, a CENTER, a PHANTOM és a DASHDOT; a többi az acadiso.lin fájlból tölthető be, a DXF pedig a sajátjait hozza magával, az ISO és az összetett vonaltípusokat is, amelyek szövege – például a GAS_LINE `GAS` felirata – a vonal mentén rajzolódik ki. A minta minden vonalra úgy kerül, ahogy az AutoCAD helyezi el: a hossza mentén középre igazítva, mindkét végén egyforma szakaszokkal, a <Command id="LTSCALE" /> értékével és az objektum saját vonaltípus-léptékével méretezve, amelyet a <Command id="CHPROP" /> parancs és a Tulajdonságok paletta állít be, az új objektumoknak pedig a CELTSCALE ad.

## Options

### ?

Két oszlopban, névvel és leírással felsorolja a vonaltípusokat. Az opciók promptjánál megkérdezi, melyik fájlt listázza – alapértelmezés szerint az acadiso.lin, vagy az acad.lin, az AutoCAD hüvelykben megadott fájlja –, és a fájl sorrendjében felsorolja a vonaltípusait; a <Keyword id="Set" /> opció promptjánál a rajzba betöltöttek közül azokat, amelyek neve illeszkedik a beírtakhoz, `*` esetén mindet, név szerint rendezve.

### Load

Megkérdezi, mely vonaltípusokat töltse be – egy nevet vagy többet vesszővel elválasztva, helyettesítő karakterekkel is (`DASH*`) –, majd hogy melyik fájlban keresse őket: először az acadiso.lin fájlban, később abban, amelyben legutóbb keresett. Minden megtalált vonaltípust betölt és kiír, a fájl sorrendjében; a már betöltöttre előbb rákérdez, és az <Keyword id="Yes" /> válasz, az alapértelmezés, újra betölti. Ha a név nincs a fájlban, vagy a fájl nem az acadiso.lin és nem az acad.lin, ezt kiírja.

### Set

A vonaltípus nevét kéri, az aktuálisat felkínálva; írja be egy betöltött vonaltípus nevét, vagy a <Keyword id="BYLayer" /> értéket. Az acadiso.lin fájlban szereplőt előbb betölti, ahogy az AutoCAD; bármely mást nem talál meg, ahogy az AutoCAD is kiírja, és visszatér az opciók promptja. Az Enter megtartja az aktuálisat.

## Missing

A Vonaltípus-kezelő, valamint vonaltípusok létrehozása vagy betöltése saját fájlból. Az összetett vonaltípusok, például a BATTING vagy a ZIGZAG alakzatai, amelyek helyén üres rés jelenik meg. A Blokk szerint (BLOKK) beállítás. A PSLTSCALE és az MSLTSCALE, mivel nincs papírtér. Az egyes nyelvi változatok saját acadiso.lin fájlja, amelynek neveit például a spanyol vagy a német AutoCAD tölti be (TRAZOS, STRICHLINIE): a <Keyword id="Load" /> opció minden nyelven az angolt olvassa, bár az ezekkel készült rajz a saját vonaltípusaival nyílik meg. A PLINEGEN: az új vonallánc minden csúcspontnál újrakezdi a mintáját, hacsak a <Command id="PEDIT" /> parancs VTípus gen opciója be nem kapcsolja.

## Questions

### Mi az AutoCAD VTÍPUS parancs angolul?

LINETYPE. A magyar AutoCAD-ben a rövidítése `VT`, és a `DPVTÍPUS` is az: írja be valamelyiket, majd nyomja meg az Enter billentyűt vagy a szóközt. A teljes név is működik, az AutoCAD bármely nyelvi változatában pedig a `_LINETYPE` is; az angol `LT` a magyar változatban a LETÖR parancsot indítja.

### Miért látszik folytonosnak a szaggatott vonalam?

A mintája egy ismétlődésénél rövidebb vonal folytonosnak rajzolódik, ahogy az AutoCAD-ben: a CENTER mintája alapértelmezett léptéknél körülbelül 51 egység hosszú. Növelje vagy csökkentse a <Command id="LTSCALE" /> értékét, hogy a minta illeszkedjen a rajzhoz. Ellenőrizze azt is, hogy az objektum vonaltípusa – vagy FÓLIA beállításnál a fóliájáé – ne Continuous legyen.

### Hogyan lehet módosítani egy meglévő objektum vonaltípusát?

Jelölje ki, és válassza ki a vonaltípust a Tulajdonságok paletta Vonaltípus sorában, vagy másolja át egy másik objektumról a <Command id="MATCHPROP" /> paranccsal. A VTÍPUS parancs csak az utána rajzolt objektumok vonaltípusát állítja be.

### Hogyan lehet módosítani a vonaltípus léptékét az AutoCAD-ben?

Írja be a <Command id="LTSCALE" /> parancsot és az új tényezőt: a 2 minden szakaszt kétszer olyan hosszúvá tesz, az egész rajzban.

### Hogyan lehet vonaltípust betölteni az AutoCAD-ben?

Az AutoCAD-ben a Vonaltípus-kezelőben. Itt írja be: `-VTÍPUS`, válassza a <Keyword id="Load" /> opciót, írja be a vonaltípus nevét, például `HIDDEN2` vagy `ACAD_ISO02W100`, majd az Enter billentyűvel keressen az acadiso.lin fájlban. A <Keyword id="Set" /> opció az acadiso.lin fájlban szereplőt az aktuálissá tételkor be is tölti.
