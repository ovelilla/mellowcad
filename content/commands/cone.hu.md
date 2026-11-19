---
title: "Kúp az AutoCAD-ben: KÚP (CONE) parancs"
metaTitle: "Kúp és csonkakúp az AutoCAD-ben: KÚP (CONE)"
description: "3D kúp vagy csonkakúp rajzolása az AutoCAD-ben a KÚP (CONE) paranccsal, promptról promptra: alap, sugár, magasság, Felső sugár, Elliptikus és tengely végpontja."
figure: "Egy 20-as sugarú és 40 magas kúp az alapja középpontjából, délkelet felől nézve, Takartvonalas látványstílusban."
sourceHash: "1c40f02e6b3c"
---

A KÚP (CONE) parancs 3D szilárdtest kúpot rajzol: adja meg az alapja középpontját, majd a sugarat, végül a magasságot, és a kúp egy pontba keskenyedik. Azt kérdezi, amit a <Command id="CYLINDER" /> parancs, a magasságnál a <Keyword id="Top" /> opcióval a csonkakúphoz. Az alap az FKR XY síkjában, a középpont Z magasságában fekszik, a magasság pedig a Z tengely mentén emelkedik; a negatív lefelé fordítja, egy pont pedig az alaptól mért távolságával adja meg. A sugarat és a magasságot alapértelmezésként kínálja fel, amelyet az Enter elfogad; ezeken a többi alaptesttel osztozik. A kúp az aktuális fólián jön létre, és a Vissza egyetlen lépésben visszavonja.

A <Command id="LIST" /> parancs kiírja a helyzetét, normálisát, alapsugarát, felső sugarát és magasságát, a Tulajdonságok palettán pedig beírhatók. A fogói mozgatják, beállítják a magasságát, az alap minden negyedénél az alapsugarát, és a felső sugarát. A csúcsa a Végpont tárgyraszterrel fogható meg. 3D szilárdtest az <Command id="UNION" />, a <Command id="SUBTRACT" /> és a MellowCAD többi 3D-s parancsa számára; a MellowCAD 3D-ben csak szilárdtesteket kezel, egyelőre részben.

## Options

### 3P

Az alap középpontjánál: három pontot kér be, és az alap a rajtuk átmenő kör, a síkjukban.

### 2P

Az alap középpontjánál: az alap átmérőjének két végpontját kéri be.

### Ttr

Az alap középpontjánál: válasszon ki két vonalat, kört vagy ívet Érintő tárgyraszterrel, és adjon meg egy sugarat: az alap mindkettőt érinti.

### Elliptical

Az alap középpontjánál: az alap ellipszis, amelyet az első tengelye két végpontja és a második tengely végpontja ad meg, vagy a <Keyword id="Center" /> opcióval a középpontjából. A felső sugár ugyanezt az ellipszist kicsinyíti.

### Diameter

A sugárnál: helyette az átmérőt kéri be, az utolsó sugár kétszeresét felkínálva.

### 2Point

A magasságnál: két pontot kér be, és a magasság a köztük lévő távolság.

### Axis

A magasságnál: a csúcsot kéri be. A kúp az alap középpontjától ehhez a ponthoz fut, bármilyen irányban, az alapja merőleges a tengelyre.

### Top

A magasságnál: bekéri a felső sugarat, majd ismét a magasságot. A kúp pont helyett körben végződik, csonkakúp lesz; az alappal azonos szélességű teteje egy henger palástját adja, a szélesebb felfelé szélesedő kúpot. Az utolsó kúp felső sugarát kínálja fel, kezdetben 0-t.

## Missing

A kúp <Command id="EXPLODE" /> paranccsal történő szétvetése, amelyet az AutoCAD az alapjára és egy felületre bont: a MellowCAD-ben nincsenek felületek, így kiírja, hogy nem tudta szétvetni. Kerek kúp átírása elliptikussá a Tulajdonságok palettán. Ha az `ISOLINES` értéke 0, a pont, amelyet az AutoCAD a csúcsra rajzol. Valamint a <Command id="CYLINDER" /> parancs hiányai: az aktív fogó Mozgatás, Forgatás, Lépték és Tükrözés módja, a sugár megadása közben rajzolt pontozott méretek, és azok a látványstílusok, amelyek az <Command id="VSCURRENT" /> parancsból hiányoznak.

## Questions

### Hogyan lehet kúpot rajzolni az AutoCAD-ben?

Futtassa a KÚP parancsot, adja meg az alap középpontját, a sugarat és a magasságot: a `0,0`, a `20` és a `40` a munkamenet kúpját rajzolja meg. A megtekintéséhez fordítsa el a nézetet a ViewCube egyik sarkával, vagy a <Command id="-VIEW" /> parancs <Keyword command="VIEW" id="SEiso" /> opciójával.

### Hogyan lehet csonkakúpot rajzolni?

A magasságnál válassza a <Keyword id="Top" /> opciót, írja be a felső sugarat, majd a magasságot. A kúp egy ilyen sugarú körben végződik.

### Hogyan lehet fordított kúpot rajzolni?

Írjon be negatív magasságot: a kúp az alapjától lefelé mutat. Vagy válassza a <Keyword id="Axis" /> opciót, és adja meg a csúcsot oda, ahová kerülnie kell.

### Lehet a kúp alapja ellipszis?

Igen: az alap középpontjánál válassza az <Keyword id="Elliptical" /> opciót, és adja meg a tengelyeit. A felső sugár a tetejét ugyanilyen, kisebb ellipszissé teszi.
