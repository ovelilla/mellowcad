---
title: "Tükrözés az AutoCAD-ben: TÜKRÖZ (MIRROR) parancs"
metaTitle: "Tükrözés az AutoCAD-ben: TÜKRÖZ (MIRROR)"
description: "Tükrözés az AutoCAD TÜKRÖZ (MIRROR, rövidítése TU) parancsával: a tükrözési vonal két pontja, a forrás megtartása vagy törlése, olvasható szöveg. Próbálja ki."
figure: "Egy zárt körvonal függőleges tükrözési vonalra tükrözve, a forrás megtartva."
sourceHash: "fd4b7540311a"
---

A TÜKRÖZ (MIRROR) parancs egy egyenesre tükrözi a kiválasztott objektumokat: válassza ki őket, adja meg a tükrözési vonal első és második pontját, majd döntse el, hogy törli-e a forrásobjektumokat. A tükörkép másolat, és az alapértelmezett Nem válasszal az eredetiek megmaradnak: így rajzolható meg egy szimmetrikus alkatrész a feléből. A két pontot az FKR síkjában veszi, így a bekapcsolt Orto móddal rajzolt tükrözési vonal egyenesen, vízszintesen vagy függőlegesen tükröz. Ahogy az AutoCAD-ben a MIRRTEXT alapértelmezett 0 értékénél, a szöveg a tükörképben is balról jobbra olvasható marad, a sraffozás pedig megtartja a mintája szögét. A futás egyetlen lépés, amelyet a Vissza visszavon.

## Options

### Yes

Törli a forrásobjektumokat, így csak a tükörkép marad meg: helyben történő átfordítás.

### No

Az alapérték: a forrásobjektumok megmaradnak a tükörképük mellett.

## Missing

A MIRRTEXT és a MIRRHATCH 0 értéken marad: a szöveg soha nem tükröződik visszafelé olvashatóra, és a sraffozás mintája soha nem tükröződik. A tükrözött blokkreferenciában lévő szöveg visszafordul, hogy olvasható legyen, ahogy az önálló szöveg, míg az AutoCAD a blokkal együtt tükrözi. A tükrözött ellipszis megtartja a normálisát, így a Kezdőszöge és a Végszöge másként alakul, mint az AutoCAD-ben ugyanannál a görbénél. Amíg a tükörkép a kurzort követi, minden objektum a saját színével látszik, a vonaltípusával és a vonalvastagságával nem.

## Questions

### Mi az AutoCAD TÜKRÖZ parancs angolul?

MIRROR. A magyar AutoCAD-ben a rövidítése `TU`: írja be, majd nyomja meg az Enter vagy a Szóköz billentyűt. Az angol `MI` a magyar változatban nem működik; a teljes `TÜKRÖZ` név igen, a `_MIRROR` pedig az AutoCAD bármely nyelvi változatában.

### Hogyan lehet úgy tükrözni, hogy a szöveg ne legyen fordított?

Semmit sem kell tennie: ahogy az AutoCAD-ben a MIRRTEXT 0 értékénél, a tükrözött szöveg normálisan olvasható marad, és oda kerül, ahová a kerete tükörképe esik.

### Hogyan lehet tükrözni és közben törölni az eredetit?

Válaszoljon <Keyword id="Yes" /> értékkel, amikor a TÜKRÖZ parancs megkérdezi, hogy törölje-e a forrásobjektumokat.

### Hogyan lehet vízszintesen vagy függőlegesen tükrözni?

Kapcsolja be az Orto módot (F8), és a tükrözési vonal két pontját abban az irányban adja meg, amelyre tükrözni akar: a függőleges vonal jobbra-balra, a vízszintes fel-le fordít.
