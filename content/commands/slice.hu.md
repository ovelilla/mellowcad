---
title: "AutoCAD SZEL (SLICE) parancs"
description: "Így működik az AutoCAD SZEL (SLICE, SL) parancsa: szilárdtestek, sík két ponttal, 3 ponttal, objektummal vagy az FKR-rel, majd a megtartott oldal. Próbálja ki!"
figure: "Henger a tengelyén át két ponttal elszelve, a kijelölt oldali fele megtartva: délkeletről nézve."
sourceHash: "07b1512fb042"
---

A SZEL (SLICE) parancs síkkal elvágja a 3D szilárdtesteket, és megtartja a sík egyik oldalán lévő részt, vagy mindkét részt két külön szilárdtestként. Először a szelni kívánt szilárdtesteket kéri, amíg meg nem nyomja az Enter billentyűt: ahogy az AutoCAD 2027-ben, az előre kijelölt halmazt elveti, és újra rákérdez, ami pedig nem szilárdtest, azt kihagyja. Ezután jön a sík: alapértelmezés szerint két pontot kell megadni, és a sík függőlegesen áll rajtuk át, merőlegesen az FKR XY síkjára; az opciókkal másképp is megadható. Végül a megtartandó oldal egy pontja következik, vagy az Enter, amely mindkét részt megtartja.

A halmaz minden szilárdtestét ugyanaz a sík vágja el. Amelyiket a sík elkerüli, vagy csak egy lapján, egy éle mentén vagy egy csúcsában érinti, az változatlan marad, és a SZEL parancs ezt jelzi is. Az elvágott szilárdtest már nem téglatest vagy henger, és nincs története. Az egész parancs egyetlen visszavonási lépés. A MellowCAD 3D-s része egyelőre részleges: szilárdtestek vannak, felületek és hálók még nincsenek.

## Options

### Object

A kijelölt objektum síkját veszi át: kör, ellipszis, ív, 2D vonallánc vagy síkbeli spline síkját, akár egy megdöntött körét is. Egy vonalnak vagy magának a szilárdtestnek nincs saját síkja: ilyenkor a parancs ezt írja ki: <Message id="unableToExtractPlane" />, és újra kérdez. Az Enter befejezi a parancsot.

### Surface

Egy felületet kér, amely mentén a vágás történik. A MellowCAD-ben még nincsenek felületek, ezért a kijelölésre ez a válasz: <Message id="noSurfacesSelected" />, az Enter pedig befejezi a parancsot.

### Zaxis

Egy pontot kér a síkon, majd egy pontot a sík Z tengelyén, vagyis a síkra merőleges egyenesen. A kettő nem lehet ugyanaz a pont.

### View

A képernyővel párhuzamos sík, a megadott ponton át; az Enter a 0,0,0 pontot veszi.

### XY

Az FKR XY síkja a megadott ponton át: egy adott magasságban lévő pont ott vízszintes vágást ad. Az Enter az FKR origóját veszi.

### YZ

Az FKR YZ síkja a megadott ponton át; az Enter az FKR origóját veszi.

### ZX

Az FKR ZX síkja a megadott ponton át; az Enter az FKR origóját veszi.

### 3points

Három pont a síkon, amely így tetszőleges irányba dőlhet. Ez az első kérdés alapértelmezése, ezért ott az Enter ezt választja. A második pontnak különböznie kell az elsőtől, a harmadik pedig nem eshet a kettőn átmenő egyenesre.

### Both

Az oldalt kérő kérdésnél jelenik meg, és ott ez az alapértelmezés, így az Enter ezt választja: mindkét rész megmarad. Az egyiket az eredeti szilárdtest tartja meg, a másikból új szilárdtest lesz ugyanazzal a fóliával, színnel, vonaltípussal és vonalvastagsággal, nem az aktuálisakkal. Ha ehelyett egy pontot ad meg, a parancs azt az oldalt tartja meg, amelyen a pont van, a másikat eldobja; a síkra eső pontot nem fogadja el.

## Missing

A felületek, vágósíkként és szelendő objektumként is, valamint a hálók. Síkbeli 3D vonallánc a síkot meghatározó objektumként, amelyet az AutoCAD elfogad. A tengelyére se nem merőleges, se nem a tengelye mentén vezetett vágás tóruszon vagy forgatott szilárdtesten, és a további vágások, amelyekhez a MellowCAD-nek még nincs pontos alakja: ezek azzal az üzenettel végződnek, hogy egy logikai művelet nem sikerült.

## Questions

### Mi az AutoCAD SZEL parancs angolul?

SLICE. A magyar AutoCAD-ben írja be a `SZEL` nevet vagy az `SL` rövidítést, amely az angol változatban is ugyanez, és nyomja meg az Enter billentyűt vagy a szóközt. Az aláhúzásjeles angol név, a `_SLICE`, az AutoCAD bármely nyelvi változatában működik.

### Hogyan lehet 3D testet elvágni az AutoCAD-ben?

Jelölje ki a szilárdtestet, és nyomja meg az Enter billentyűt. Adjon meg két pontot, amelyen a vágás átmegy: a sík függőlegesen áll rajtuk át. Ezután adjon meg egy pontot a megtartandó oldalon, vagy nyomja meg az Enter billentyűt, hogy mindkét fél megmaradjon, és az egyiket tolja odébb a <Command id="MOVE" /> paranccsal. Ferde vágáshoz válassza a <Keyword id="3points" /> opciót, és adjon meg három pontot a síkon.

### Elvágja a SZEL parancs a vonalakat vagy a 2D objektumokat?

Nem: a SZEL parancs 3D szilárdtesteket vág, a vonalakat, lemezeket és blokkokat kihagyja; ha a halmazban csak ilyenek vannak, a parancs befejeződik. 2D objektumok vágására a <Command id="TRIM" /> vagy a <Command id="BREAK" /> parancsot használja. Az AutoCAD-ben a SZEL parancs felületeket és hálókat is vág, ezek azonban a MellowCAD-ben még nincsenek meg.

### Miért írja a SZEL parancs, hogy a szelősík nem metszi a szilárdtestet?

Mert a sík elkerüli, vagy csak egy lapján, egy éle mentén vagy egy csúcsában érinti: az ilyen szilárdtest egészben marad. Ellenőrizze, hogyan adta meg a síkot. Két ponttal megadva függőleges, így a szilárdtest felső lapján felvett két pont függőlegesen vágja el, nem vízszintesen; vízszintes vágáshoz válassza az <Keyword id="XY" /> opciót, és adjon meg egy pontot a vágás magasságában.
