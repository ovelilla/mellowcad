---
title: "Lekerekítés az AutoCAD-ben: LEKEREKÍT (FILLET) parancs"
metaTitle: "Lekerekítés az AutoCAD-ben: LEKEREKÍT (FILLET)"
description: "Az AutoCAD LEKEREKÍT (FILLET, LK) parancsa promptról promptra: a sugár, két vonal, a vonallánc sarkai, a 0 sugár és a Többszörös. Próbálja ki ingyen, online."
figure: "Négy vonal, majd 15-ös Sugár és Többszörös: két sarok lekerekítve, kettő élesen hagyva."
sourceHash: "f97d737f74a9"
---

A LEKEREKÍT (FILLET) parancs két objektum közötti sarkot kerekít le a megadott sugarú ívvel, és mindkét objektumot levágja vagy meghosszabbítja az ívig. Első sora kiírja az üzemmódot és az aktuális sugarat; ezután ki kell választani az első, majd a második objektumot, mindegyiket a megtartandó oldalán, és a parancs véget ér. Vonalakkal, ívekkel, körökkel, ellipszisekkel, spline-okkal és 2D vonalláncok szakaszaival dolgozik. A két vonalnak nem kell találkoznia: ahogy az AutoCAD-ben, a parancs meghosszabbítja őket az ívig. 0 sugárnál, vagy ha a második kiválasztáskor lenyomva tartja a Shift billentyűt, ív helyett éles sarkot készít.

## Options

### Undo

Egyenként visszavonja az ebben a LEKEREKÍT parancsban végzett utolsó lekerekítést, <Keyword id="Polyline" /> műveletet vagy sugármegadást. Ha már nincs mit visszavonni, a válasza <Message id="commandCompletelyUndone" />

### Polyline

Egy 2D vonalláncot kér, és egyetlen lépésben lekerekíti minden sarkát, ahol két szakasza találkozik, majd kiírja, hányat kerekített le, és hányat hagyott ki, mert párhuzamos vagy túl rövid a sugárhoz. A <Command id="RECTANG" /> paranccsal rajzolt téglalap is ilyen vonallánc.

### Radius

A sugarat kéri; a második promptnál is felkínálja. A sugár a rajzé (FILLETRAD): a következő LEKEREKÍT parancs ezzel indul, és a rajzzal együtt mentődik. A 0 éles sarkokat készít; a negatív sugarat a parancs elutasítja.

### Multiple

Minden lekerekítés után újra az első objektumot kéri, így sarkot sarok után kerekíthet le újraindítás nélkül, az Enter billentyűig.

## Missing

Metszés: az objektumok mindig az ívig vágódnak le vagy hosszabbodnak meg, ahogy a TRIMMODE 1 beállításnál, ami az AutoCAD alapértelmezése; a Nemmetsz beállítás nem érhető el. Az ív nem veszi át a második objektum vonaltípus-léptékét, mivel itt egyetlen objektumnak sincs sajátja. Kattintás előtt az elemleírás a promptot mutatja, nem azt, hogy egy pár miért nem kerekíthető le, és lakat sem jelöli a zárolt fólián lévő objektumot. Néhány ritka ellipszis- vagy spline-pár másképp végződik: zárt spline vonallal 0 sugárnál, az ellipszis párhuzamosát csak érintő ív, és egy ilyen pár ferde síkban.

## Questions

### Mi az AutoCAD LEKEREKÍT parancs angolul?

FILLET. A magyar AutoCAD-ben a rövidítése `LK`: írja be, majd nyomja meg az Enter billentyűt vagy a szóközt. A teljes név is működik, az AutoCAD bármely nyelvi változatában pedig a `_FILLET` is; az angol `F` a magyar változatban a FRISSÍT parancsot indítja.

### Hogyan lehet két vonalat lekerekíteni?

Válassza a <Keyword id="Radius" /> opciót, írja be a sugarat, majd válassza ki mindkét vonalat azon az oldalon, amelyet meg szeretne tartani. A nem találkozó vonalakat a parancs meghosszabbítja az ívig, a keresztezőket pedig visszavágja hozzá. Két párhuzamos vonalat a sugártól függetlenül egy félkör köt össze. Egy vonal és egy vonallánc szakasza egyetlen vonalláncba egyesül.

### Mit csinál a 0 lekerekítési sugár?

Éles sarkot készít: mindkét vonalat levágja vagy meghosszabbítja, amíg nem találkoznak, és nem rajzol ívet. Ha a sugár módosítása nélkül szeretne egyetlen éles sarkot, tartsa lenyomva a Shift billentyűt a második objektum kiválasztásakor.

### Miért nem működik a lekerekítés?

A parancssor kiírja az okát. A <Message id="filletRadiusTooLarge" /> azt jelenti, hogy az ív nem fér el a vonalak között; a <Message id="segmentsNotConsecutive" /> azt, hogy ugyanannak a vonalláncnak két szakasza túl messze van egymástól; a szöveget, a blokkokat, a méreteket és a sraffozásokat a parancs elutasítja, a különböző magasságban lévő objektumokról azt írja ki, hogy nem esnek egy síkba, a zárolt fólián lévő objektumot pedig nem fogadja el.

### Hogyan lehet egy 3D szilárdtest éleit lekerekíteni?

Indítsa el az <Command id="FILLETEDGE" /> parancsot: ha a sugár nem az, amelyet kiír, válassza a <Keyword command="FILLETEDGE" id="Radius" /> opciót, válassza ki a szilárdtest éleit, majd nyomja meg az Enter billentyűt, és a lekerekítés elfogadásához még egyszer. 3D szilárdtesteken működik, amelyek itt egyelőre részben érhetők el.
