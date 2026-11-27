---
title: "Téglatest az AutoCAD-ben: TTEST (BOX) parancs"
metaTitle: "3D téglatest az AutoCAD-ben: TTEST (BOX)"
description: "3D téglatest rajzolása az AutoCAD-ben a TTEST (BOX) paranccsal, promptról promptra: két sarok és egy magasság, Középpont, Kocka, Hossz és 2Pont. Ingyen, online."
figure: "Egy 60 × 40 × 25-ös téglatest két sarokból és egy magasságból, délkelet felől nézve, Takartvonalas látványstílusban."
sourceHash: "9a0b32afd4c2"
---

A TTEST (BOX) parancs 3D szilárdtest téglatestet rajzol, amelynek oldalai az FKR tengelyeivel párhuzamosak: adja meg az első sarkot, a másik sarkot, majd a magasságot. A magasság az FKR Z tengelye mentén emelkedik, a negatív lefelé mutat, egy pont pedig a saroktól mért távolságával adja meg; ha a másik sarkot az elsőétől eltérő Z-n adja meg, az kérdés nélkül beállítja a magasságot. Az utolsó magasságot, valamint egy kocka vagy a Hossz opció utolsó hosszát és szélességét alapértelmezésként kínálja fel, amelyet az Enter elfogad; ezeken a többi alaptesttel és a <Command id="EXTRUDE" /> paranccsal osztozik. A téglatest az aktuális fólián jön létre, és a Vissza egyetlen lépésben visszavonja.

A téglatest megőrzi a méreteit: a <Command id="LIST" /> parancs kiírja a helyzetét, hosszát, szélességét, magasságát és elforgatását, a Tulajdonságok palettán pedig az első négy beírható. A fogói mozgatják, nyújtják, és felülnézeten kívül a magasságát is állítják. 3D szilárdtest az <Command id="UNION" />, a <Command id="SUBTRACT" /> és a MellowCAD többi 3D-s parancsa számára; a MellowCAD 3D-ben csak szilárdtesteket kezel, egyelőre részben.

## Options

### Center

Az első promptnál: bekéri a középpontot, majd egy sarkot, a <Keyword id="Cube" /> vagy a <Keyword id="Length" /> opciót. A téglatest a pontra középre kerül, magasságban is.

### Cube

A másik saroknál: bekér egy hosszt, beírva vagy megmutatva, és kockát készít, amelynek minden éle ilyen hosszú. A beírt hossz a kurzor felé mutat, a negatív attól el.

### Length

A másik saroknál: bekéri a hosszt, majd a szélességet. A hossz a kurzor felé mutat, így a téglatest szögben is állhat; a szélesség arra az oldalra esik, amelyiken a kurzor van.

### 2Point

A magasságnál: két pontot kér be, és a magasság a köztük lévő távolság.

## Missing

A Mozgatás, a Forgatás, a Lépték és a Tükrözés aktív fogóból, amelyek között az AutoCAD az Enter billentyűvel vált. A saját 3D parancsai – 3DMOZGAT, 3DFORGAT, 3DLÉPTÉK, TÜKRÖZ3D, FORGAT3D, ILLESZT, 3DILLESZT – a manipulátoraikkal. A pontozott méretek, amelyeket az AutoCAD a sarok, a hossz és a szélesség megadása közben rajzol. Élei lekerekítése és letörése a <Command id="FILLET" /> és a <Command id="CHAMFER" /> paranccsal; ezt az <Command id="FILLETEDGE" /> és az <Command id="CHAMFEREDGE" /> parancs végzi el. A szilárdtest-előzmények rögzítése és megjelenítése, és az Anyag sor. Azok a látványstílusok, amelyek az <Command id="VSCURRENT" /> parancsból a 2D drótváz, a Takartvonalas és a Látványtervi mellett hiányoznak.

## Questions

### Hogyan lehet 3D téglatestet rajzolni az AutoCAD-ben?

Futtassa a TTEST parancsot, adjon meg egy sarkot, majd a szemközti sarkot, végül a magasságot: a `0,0`, a `60,40` és a `25` a munkamenet téglatestét rajzolja meg. Ha a szemközti sarok helyett a <Keyword id="Length" /> opciót és egy szélességet ad meg, a téglatest bármilyen szögbe fordítható.

### Miért látszik téglalapnak a téglatest?

Felülről, felülnézetben látja. Fordítsa el a nézetet: a ViewCube egyik sarkával, a <Command id="-VIEW" /> parancs <Keyword command="VIEW" id="SEiso" /> opciójával vagy a <Command id="3DORBIT" /> paranccsal. Az <Command id="VSCURRENT" /> parancs <Keyword command="VSCURRENT" id="Hidden" /> opciója elrejti a mögötte lévő éleket.

### Hogyan lehet kockát rajzolni?

Adja meg az első sarkot, majd válassza a <Keyword id="Cube" /> opciót, és írja be egy él hosszát.

### Hogyan lehet a középpontjából téglatestet rajzolni?

Válassza a <Keyword id="Center" /> opciót, és adja meg a középpontot, majd egy sarkot, a <Keyword id="Cube" /> vagy a <Keyword id="Length" /> opciót: a téglatest a pontra középre kerül, magasságban is.
