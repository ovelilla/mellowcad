---
title: "Gúla az AutoCAD-ben: GÚLA (PYRAMID) parancs"
metaTitle: "Gúla az AutoCAD-ben: GÚLA (PYRAMID) parancs"
description: "3D gúla az AutoCAD GÚLA (PYRAMID, rövidítése GÚ) parancsával promptról promptra: oldalak, alap, magasság, él, beleírt alap és csonka gúla felső sugara."
figure: "Hatoldalú gúla, az alapja 25 az egyes oldalak közepéig, 40 magas, délkeletről nézve, Takartvonalas vizuális stílusban."
sourceHash: "acbc5ffa71cb"
---

A GÚLA (PYRAMID) parancs 3D szilárdtest gúlát rajzol: az első sora kiírja, hány oldala van az alapnak, és hogyan érti a sugarát, majd bekéri az alap középpontját, a sugarat és a magasságot. Az alap szabályos sokszög, ahogy a <Command id="POLYGON" /> rajzolja, kezdetben 4 oldalú: a beírt sugár a kurzor felé, a pontként megadott a pont felé fordítja. A magasság az FKR Z tengelye mentén emelkedik, a negatív lefelé halad, a pontként megadott pedig az alaptól mért távolságával adja meg. Az oldalak számát és a sugár értelmezését a következő GÚLA parancsra is megőrzi; a sugár és a magasság a testprimitívek közös alapértéke. A gúla az aktuális fóliára kerül, és a Vissza egy lépésben visszavonja.

A <Command id="LIST" /> kiírja a helyzetét, az alap és a tető sugarát, a magasságát, az elforgatását és az oldalak számát, a Tulajdonságok palettán pedig beírható a két sugár, az oldalak száma és a magasság. A fogóival mozgatható, állítható a magassága, és az alap mérete egy sarokból vagy egy oldal közepéről változtatható. 3D szilárdtest az <Command id="UNION" />, a <Command id="SUBTRACT" /> és a MellowCAD többi 3D eszköze számára, amely csak szilárdtestekből áll, és egyelőre részleges; a <Command id="EXPLODE" /> laponként egy-egy lemezzé bontja.

## Options

### Edge

Az alap középpontjánál: bekéri az alap egyik oldalának két végpontját, és az alap ennek az oldalnak a bal oldalára rajzolódik.

### Sides

Az alap középpontjánál: bekéri az oldalak számát 3 és 32 között, majd újra a középpontot.

### Inscribed

A sugárnál: a sugarat az alap egyik csúcsáig méri, a sokszög abba a körbe írt, és újra bekéri a sugarat.

### Circumscribed

A sugárnál, miután a <Keyword id="Inscribed" /> ki van választva: a sugarat egy oldal közepéig méri, a sokszög e kör köré írt, mint kezdetben, és újra bekéri a sugarat.

### 2Point

A magasságnál: két pontot kér, a magasság a köztük lévő távolság.

### Axis

A magasságnál: bekéri a csúcsot. A gúla az alap középpontjától ehhez a ponthoz fut, bármilyen irányban, az alapja merőleges a tengelyre.

### Top

A magasságnál: bekéri a felső sugarat, amelyet az alapéhoz hasonlóan értelmez, majd újra a magasságot. A gúla csúcs helyett egy kisebb sokszögben végződik, csonka gúla lesz; az alappal egyező méretű tető hasábot ad.

## Missing

Ami a <Command id="BOX" /> parancsból is hiányzik: a Mozgatás, Forgatás, Lépték és Tükrözés aktív fogóról, a saját 3D parancsai, és azok a vizuális stílusok, amelyek az <Command id="VSCURRENT" /> parancsból hiányoznak. A típusa, beleírt vagy kör köré írt, beírva a Tulajdonságok palettán. A pontozott méretek, amelyeket az AutoCAD a sugár és az él megadása közben rajzol.

## Questions

### Mi az AutoCAD GÚLA parancs angolul?

PYRAMID. A magyar AutoCAD-ben a rövidítése `GÚ`: írja be, nyomja meg az Enter vagy a Szóköz billentyűt, majd adja meg az alap középpontját, a sugarat és a magasságot. Az angol `PYR` a magyar változatban nem működik; a `_PYRAMID` az AutoCAD bármely nyelvi változatában igen.

### Hogyan lehet hatoldalú gúlát rajzolni?

Az alap középpontja előtt válassza az <Keyword id="Sides" /> opciót, és írja be: `6`, majd adja meg a középpontot, a sugarat és a magasságot: a `0,0`, a `25` és a `40` a mintában látható gúlát rajzolja meg. A következő GÚLA parancs megtartja a hat oldalt.

### Hogyan lehet adott alapélű gúlát rajzolni?

Válassza az <Keyword id="Edge" /> opciót, és adja meg az egyik oldal két végpontját: a `0,0`-tól `50,0`-ig tartó oldal 50-es négyzet alapot ad, az alapértelmezett 4 oldallal.

### Hogyan lehet csonka gúlát rajzolni?

A magasságnál válassza a <Keyword id="Top" /> opciót, írja be a felső sugarat, majd a magasságot. A gúla egy kisebb sokszögben végződik, amelynek ugyanannyi oldala van, mint az alapnak.
