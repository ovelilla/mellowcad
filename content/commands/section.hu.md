---
title: "Metszet az AutoCAD-ben: KMETSZET (SECTION) parancs"
metaTitle: "Metszet az AutoCAD-ben: KMETSZET (SECTION)"
description: "Az AutoCAD KMETSZET (SECTION, rövidítése KM) parancsa lemezt készít, ahol egy sík a 3D szilárdtesteket metszi: 3pont, Objektum, ZTeng, Nézet, XY, YZ, ZX."
figure: "Egy átmenő furatos hasáb, amelyet a ZX sík a furat középpontján át metsz: a KMETSZET elkészíti a profilt, előre kihúzva, két téglalap a furat helyén lévő réssel."
sourceHash: "f1c01b76c810"
---

A KMETSZET (SECTION) parancs 3D szilárdtestek keresztmetszetét készíti el: egy lemezt ott, ahol egy sík az egyes testeket metszi, a szilárdtestek pedig változatlanok maradnak. Az Enterig bekéri a szilárdtesteket: ahogy az AutoCAD 2027-ben, a parancs előtt kiválasztott halmazt elveti, és újra kéri, ami nem szilárdtest, azt átugorja, a szilárdtest nélküli halmazra pedig <Message id="noSolidsSelected" /> a válasz. Ezután következik a sík: alapértelmezés szerint három pontját adja meg, az opciók pedig más módon határozzák meg, ahogy a <Command id="SLICE" /> parancsnál.

Minden szilárdtest, amelyet a sík metsz, megkapja a saját lemezét, amely a síkban fekszik: az átmenő furatos hasáb a körvonalát adja a furat helyén lévő réssel, a tengelye mentén elmetszett henger egy téglalapot. A szilárdtest egyik lapjára eső sík azt a lapot adja. Arra a testre, amelyet a sík elkerül, <Message id="sectionMissedOne" /> a válasz. A lemezek az aktuális fóliát és tulajdonságokat kapják, nem a szilárdtestét; a <Command id="MOVE" /> kiviszi, hogy látszódjon, a <Command id="AREA" /> és a <Command id="MASSPROP" /> megméri, a <Command id="EXTRUDE" /> pedig szilárdtestté alakítja. A teljes parancs egyetlen visszavonási lépés. A MellowCAD 3D-je csak szilárdtestekből áll, és egyelőre részleges.

## Options

### Object

Egy kijelölt objektum síkját veszi: kört, ellipszist, ívet, 2D spline-t vagy 2D vonalláncot.

### Zaxis

Bekér egy pontot a síkon, majd egy pontot a Z tengelyén, a rá merőleges egyenesen.

### View

A képernyővel párhuzamos sík, egy megadott ponton át.

### XY

Az FKR XY síkja, egy megadott ponton át: egy adott magasságban lévő pont ott ad vízszintes metszetet. Az Enter az FKR origóját veszi.

### YZ

Az FKR YZ síkja, egy megadott ponton át; az Enter az FKR origóját veszi.

### ZX

Az FKR ZX síkja, egy megadott ponton át; az Enter az FKR origóját veszi. A minta metszete ez a sík a furat középpontján át.

### 3points

Három pont a síkon, amely így bármilyen irányban megdőlhet. Ez az első prompt alapértéke, így az ott megadott pont a három közül az első.

## Missing

A felületek és a hálók, amelyek a MellowCAD-ben nincsenek. A síkbeli 3D vonallánc mint a sík objektuma, amelyet az AutoCAD elfogad. Azok a metszések, amelyeknek pontos alakja a MellowCAD-ben még nincs, ahogy a <Command id="SLICE" /> parancsnál, és amelyekre azt írja, hogy egy logikai művelet nem sikerült. A SECTIONPLANE és az élő metszés, amelyet az AutoCAD szalagja a KMETSZET helyett kínál: itt a KMETSZET parancsot be kell gépelni.

## Questions

### Hogyan lehet metszetet készíteni egy 3D szilárdtestből az AutoCAD-ben?

Futtassa a KMETSZET parancsot, válassza ki a szilárdtestet, nyomja meg az Enter billentyűt, majd adja meg a síkot: a <Keyword id="ZX" /> és egy középen lévő pont elölről hátrafelé metszi el, az <Keyword id="XY" /> és egy adott magasságú pont vízszintesen. A lemez a szilárdtesten belül fekszik: vigye ki a <Command id="MOVE" /> paranccsal, hogy lássa.

### Mi a különbség a KMETSZET és a SZEL (SLICE) parancs között?

A <Command id="SLICE" /> kettévágja a szilárdtestet, és az egyik részét vagy mindkettőt megtartja. A KMETSZET épen hagyja a szilárdtestet, és lemezt rajzol oda, ahol a sík metszi.

### Mi az AutoCAD KMETSZET parancs angolul?

SECTION. A magyar AutoCAD-ben a rövidítése `KM`: írja be, majd nyomja meg az Enter vagy a Szóköz billentyűt. Az angol `SEC` a magyar változatban nem működik; a `_SECTION` az AutoCAD bármely nyelvi változatában igen.

### Miért írja a KMETSZET, hogy a sík nem metszi a szilárdtestet?

A sík elkerüli: ellenőrizze, hogyan adta meg. Az <Keyword id="XY" />, az <Keyword id="YZ" /> és a <Keyword id="ZX" /> az FKR síkjai, így egy rossz magasságban vagy rossz oldalon lévő pont a szilárdtesten kívülre teszi a síkot.
