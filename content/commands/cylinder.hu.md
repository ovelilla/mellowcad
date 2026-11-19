---
title: "Henger az AutoCAD-ben: HENGER (CYLINDER) parancs"
metaTitle: "3D henger az AutoCAD-ben: HENGER (CYLINDER)"
description: "3D henger rajzolása az AutoCAD-ben a HENGER (CYLINDER, HEN) paranccsal, promptról promptra: alap, sugár, magasság, 3P, 2P, Éés, Elliptikus és tengely végpontja."
figure: "Egy 20-as sugarú és 40 magas henger az alapja középpontjából, délkelet felől nézve, Takartvonalas látványstílusban."
sourceHash: "ce397d8dcb5d"
---

A HENGER (CYLINDER) parancs 3D szilárdtest hengert rajzol: adja meg az alapja középpontját, majd a sugarat, végül a magasságot. Az alap az FKR XY síkjában, a középpont Z magasságában fekszik, a magasság pedig a Z tengely mentén emelkedik; a negatív lefelé mutat, egy pont pedig az alaptól mért távolságával adja meg, ahogy a <Command id="BOX" /> parancsnál. A sugarat és a magasságot alapértelmezésként kínálja fel, amelyet az Enter elfogad; ezeken a többi alaptesttel és a <Command id="EXTRUDE" /> paranccsal osztozik. A henger az aktuális fólián jön létre, és a Vissza egyetlen lépésben visszavonja.

A henger megőrzi a méreteit: a <Command id="LIST" /> parancs kiírja a helyzetét, normálisát, sugarát és magasságát, a Tulajdonságok palettán pedig a sugár és a magasság beírható. A fogói mozgatják, beállítják a magasságát, és az alap minden negyedénél a sugarát. 3D szilárdtest az <Command id="UNION" />, a <Command id="SUBTRACT" /> és a MellowCAD többi 3D-s parancsa számára; a MellowCAD 3D-ben csak szilárdtesteket kezel, egyelőre részben.

## Options

### 3P

Az alap középpontjánál: három pontot kér be, és az alap a rajtuk átmenő kör, a síkjukban. Az FKR XY síkjára eső három pontnál a henger továbbra is a Z mentén emelkedik.

### 2P

Az alap középpontjánál: az alap átmérőjének két végpontját kéri be; a másodikat az első síkjában olvassa.

### Ttr

Az alap középpontjánál: válasszon ki két vonalat, kört vagy ívet Érintő tárgyraszterrel, és adjon meg egy sugarat: az alap mindkettőt érinti, a kijelölési pontokhoz legközelebb, azok magasságában.

### Elliptical

Az alap középpontjánál: az alap ellipszis. Adja meg az első tengelye két végpontját, majd a második tengely végpontját; vagy válassza a <Keyword id="Center" /> opciót, és adja meg a középpontját, az első tengely felét, majd a második tengely végpontját.

### Diameter

A sugárnál: helyette az átmérőt kéri be, az utolsó sugár kétszeresét felkínálva.

### 2Point

A magasságnál: két pontot kér be, és a magasság a köztük lévő távolság.

### Axis

A magasságnál: a tengely másik végpontját kéri be. A henger az alap középpontjától ehhez a ponthoz fut, bármilyen irányban, az alapja merőleges a tengelyre.

## Missing

A henger <Command id="EXPLODE" /> paranccsal történő szétvetése, amelyet az AutoCAD a két véglapjára és egy felületre bont: a MellowCAD-ben nincsenek felületek, így kiírja, hogy nem tudta szétvetni. Az aktív fogó Mozgatás, Forgatás, Lépték és Tükrözés módja, valamint az alapon túlra húzott magasság. A pontozott méretek, amelyeket az AutoCAD a sugár, az ellipszis pontjai és a tengely megadása közben rajzol. Kerek henger átírása elliptikussá a Tulajdonságok palettán. A kontúrvonalak, amelyeket az AutoCAD `DISPSILH` változója rajzol. Felülnézetben, ahol a felső kör eltakarja az alapét, a Szomszédos tárgyraszter az alap körét találja meg, ahol az AutoCAD a felsőét. Azok a látványstílusok, amelyek az <Command id="VSCURRENT" /> parancsból a 2D drótváz, a Takartvonalas és a Látványtervi mellett hiányoznak.

## Questions

### Mi az AutoCAD HENGER parancs angolul, és mi a rövidítése?

Angolul CYLINDER, a magyar AutoCAD-ben HENGER: írja be a `HEN` rövidítést, és nyomja meg az Enter vagy a Szóköz billentyűt, majd adja meg az alap középpontját, a sugarat és a magasságot: a `0,0`, a `20` és a `40` a munkamenet hengerét rajzolja meg. Az angol `CYL` a magyar AutoCAD-ben nem működik; a `_CYLINDER` az AutoCAD bármely nyelvén igen.

### Hogyan lehet vízszintes hengert rajzolni?

A magasságnál válassza a <Keyword id="Axis" /> opciót, és adja meg a tengely másik végpontját: a `0,0,0` pontban lévő alapból a `60,0,0` pont az X tengely mentén fekteti le a hengert.

### Hogyan lehet üreges hengert vagy csövet készíteni?

Rajzoljon két hengert ugyanabból a középpontból, a belsőt keskenyebbre, majd futtassa a <Command id="SUBTRACT" /> parancsot: válassza ki a külsőt, Enter, a belsőt, Enter.

### Miért látszik körnek a henger?

Felülről, felülnézetben látja. Fordítsa el a nézetet: a ViewCube egyik sarkával, a <Command id="-VIEW" /> parancs <Keyword command="VIEW" id="SEiso" /> opciójával vagy a <Command id="3DORBIT" /> paranccsal.
