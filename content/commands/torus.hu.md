---
title: "AutoCAD TÓRUSZ (TORUS) parancs"
description: "Így rajzol 3D gyűrű szilárdtestet az AutoCAD TÓRUSZ (TORUS, TOR) parancsa: középpont, a gyűrű sugara, a cső sugara, Átmérő, 3P, 2P és Éés. Próbálja ki ingyen."
figure: "30 sugarú tórusz 8 sugarú cső körül, délkeletről nézve, Látványtervi látványstílusban."
sourceHash: "a19600f3e357"
---

A TÓRUSZ (TORUS) parancs 3D gyűrű szilárdtestet, fánkot rajzol: adja meg a középpontot, majd a gyűrű sugarát a középponttól a cső közepéig, végül a cső sugarát. A gyűrű az FKR XY síkjában fekszik, a középpont Z magasságában. A csőnél megadott pontot a gyűrű azon pontjától méri, amelynél a sugarat megadta. A gyűrű sugara az alaptestek közös alapértéke, a cső sugarának saját alapértéke van, amelyet az Enter elfogad. A tórusz az aktuális fóliára kerül, és a visszavonás egy lépésben eltávolítja.

A negatív gyűrűsugár szélesebb csővel rögbilabdához hasonló, csúcsos végű testet ad; a csőnél keskenyebb gyűrű almát. 2D drótváz és Takartvonalas látványstílusban vonalakként jelenik meg a cső és a gyűrű körül, annyival, amennyit az `ISOLINES` előír. A <Command id="LIST" /> parancs megmutatja a helyzetét, a normálisát, a tórusz sugarát és a cső sugarát, a Tulajdonságok palettán pedig mindkettő begépelhető. A fogói mozgatják, illetve a gyűrű és a cső sugarát állítják. Az <Command id="UNION" />, a <Command id="SUBTRACT" /> és a MellowCAD többi 3D-s parancsa számára 3D szilárdtest; a MellowCAD 3D-je csak szilárdtestekből áll, és egyelőre részleges.

## Options

### 3P

A középpontnál: három pontot kér, és a gyűrű az ezeken átmenő kör lesz, a pontok síkjában.

### 2P

A középpontnál: a gyűrű egy átmérőjének két végpontját kéri.

### Ttr

A középpontnál: Érintő tárgyraszterrel jelöljön ki két vonalat, kört vagy ívet, és adjon meg egy sugarat: a gyűrű mindkettőt érinti, a magasságukban.

### Diameter

A gyűrű sugaránál: helyette a tórusz átmérőjét kéri. A csőnél: a cső átmérőjét kéri. Mindkettő a saját alapértékének kétszeresét ajánlja fel.

### 2Point

A cső sugaránál: két pontot kér, és a cső sugara a köztük lévő távolság lesz.

## Missing

A tórusz <Command id="EXPLODE" /> paranccsal történő szétvetése, amelyből az AutoCAD felületet készít: a MellowCAD-ben nincsenek felületek, ezért azt írja ki, hogy nem tudta szétvetni. Mozgatás, Forgatás, Lépték és Tükrözés aktív fogóról, valamint a körvonal, amelyet az AutoCAD `DISPSILH` változója rajzol.

## Questions

### Mi az AutoCAD TÓRUSZ parancs angolul?

TORUS. A magyar AutoCAD-ben a rövidítése `TOR`, akárcsak az angolban: írja be, nyomja meg az Enter vagy a Szóköz billentyűt, majd adja meg a középpontot, a gyűrű és a cső sugarát: a `0,0,0`, a `30` és a `8` megrajzolja a mintában látható tóruszt. A teljes `TÓRUSZ` név is működik, a `_TORUS` pedig az AutoCAD bármely nyelvi változatában.

### Mi a különbség a sugár és a cső sugara között?

A sugár a tórusz középpontjától a cső közepéig tart; a cső sugara magáé a csőé. Az a tórusz, amelynek a külső átmérője 76, a csöve pedig 16 vastag, 30 sugarú, a cső sugara pedig 8.

### Hogyan lehet rögbilabda alakú tóruszt rajzolni?

Adjon meg negatív sugarat, majd ennek nagyságánál nagyobb csősugarat: a `-5` és a `8` mindkét végén csúcsos, zárt alakzatot ad. Ha a cső sugara nem nagyobb ennél, a parancs elutasítja, és újra kérdez.

### Miért néz ki a tórusz két körnek?

Felülről, felülnézetben látja. Fordítsa el a nézetet: a ViewCube egyik sarkával, a <Command id="-VIEW" /> paranccsal és a <Keyword command="VIEW" id="SEiso" /> opcióval, vagy a <Command id="3DORBIT" /> paranccsal. Az <Command id="VSCURRENT" /> parancs <Keyword command="VSCURRENT" id="Conceptual" /> opciója árnyalja.
