---
title: "AutoCAD ÉK (WEDGE) parancs"
description: "Így rajzol 3D ék szilárdtestet az AutoCAD ÉK (WEDGE, EK) parancsa: két sarokpont és magasság, Középpont, Kocka, Hossz és 2Pont. Próbálja ki ingyen, online."
figure: "60 × 40 × 25-ös ék két sarokpontból és magasságból, a teteje az első sarokpont felőli végtől lejt, délkeletről nézve, Takartvonalas látványstílusban."
sourceHash: "06fba2eeb7be"
---

Az ÉK (WEDGE) parancs 3D ék szilárdtestet rajzol: olyan téglatestet, amelynek a teteje az egyik végétől a másikig lejt. Ugyanazt kérdezi, mint a <Command id="BOX" /> parancs: az első sarokpontot, a másik sarokpontot, majd a magasságot. A magas vég az első sarokpontnál van, és a lejtő az FKR X tengelye mentén a másik sarokpont oldala felé esik; a kisebb X koordinátájú sarokpont megfordítja. A magasság az FKR Z tengelye mentén emelkedik, a negatív lefelé mutat. A hossz, a szélesség és a magasság a <Command id="BOX" /> parancs alapértelmezései, amelyeket az Enter elfogad. Az ék az aktuális fóliára kerül, és a visszavonás egy lépésben eltávolítja.

A <Command id="LIST" /> parancs megmutatja a helyzetét, hosszát, szélességét, magasságát és elforgatását, a Tulajdonságok palettán pedig ezek begépelhetők. A fogói ugyanazok, mint a <Command id="BOX" /> parancsé. Az <Command id="UNION" />, a <Command id="SUBTRACT" /> és a MellowCAD többi 3D-s parancsa számára 3D szilárdtest; a MellowCAD 3D-s része csak szilárdtestekből áll, és egyelőre részleges. A <Command id="EXPLODE" /> parancs lapjaiból egy-egy lemezt készít.

## Options

### Center

Az első kérdésnél: a középpontot kéri, majd egy sarokpontot, vagy a <Keyword id="Cube" />, illetve a <Keyword id="Length" /> opciót. Az ék középpontja a megadott pontba kerül, magasságban is, a magas vége pedig a megadott sarokponttal szemben lesz.

### Cube

A másik sarokpontnál: egy hosszt kér, és olyan éket készít, amelynek minden oldala ilyen hosszú. A <Command id="BOX" /> parancsétól eltérően az FKR X tengelye mentén fut, negatív értéknél visszafelé.

### Length

A másik sarokpontnál: a hosszt kéri az FKR X tengelye mentén, majd a szélességet az Y tengelye mentén; a negatív érték visszafelé fut. A megadott pontból csak a távolságát veszi, az irányát soha.

### 2Point

A magasságnál: két pontot kér, és a magasság a köztük lévő távolság lesz.

## Missing

Ugyanaz, ami a <Command id="BOX" /> parancsból hiányzik: Mozgatás, Forgatás, Lépték és Tükrözés aktív fogóról, a saját 3D parancsaik, a pontozott méretek a sarokpont megadása közben, és azok a látványstílusok, amelyek az <Command id="VSCURRENT" /> parancsból hiányoznak. Felülnézetben a magas vég alatti Vég tárgyraszter a tető sarkát találja meg, míg az AutoCAD az alapét.

## Questions

### Mi az AutoCAD ÉK parancs angolul?

WEDGE. A magyar AutoCAD-ben írja be az `ÉK` nevet vagy az `EK` rövidítést, és nyomja meg az Enter billentyűt vagy a szóközt, majd adja meg az első sarokpontot, a másik sarokpontot és a magasságot: a `0,0`, a `60,40` és a `25` megrajzolja a munkamenet ékét. Az angol változat `WE` rövidítése a magyarban nem működik, a `_WEDGE` viszont az AutoCAD bármely nyelvi változatában igen.

### Merre lejt az ék?

Az első sarokpont felőli végtől lefelé, az FKR X tengelye mentén. A megfordításához adja meg a másik sarokpontot kisebb X koordinátával, ez 180°-kal fordítja el, vagy utólag forgassa el a <Command id="ROTATE" /> paranccsal.

### Hogyan lehet háromszög alapú hasábot rajzolni?

Az ék maga is az: mindkét végén egy derékszögű háromszög, amely a szélesség mentén húzódik végig. Bármilyen más háromszöghöz rajzolja meg zártan a <Command id="PLINE" /> paranccsal, és húzza ki a <Command id="EXTRUDE" /> paranccsal.

### Hogyan lehet éket rajzolni a középpontjából?

Válassza a <Keyword id="Center" /> opciót, és adja meg a középpontot, majd egy sarokpontot, vagy a <Keyword id="Cube" />, illetve a <Keyword id="Length" /> opciót: az ék középpontja a megadott pontba kerül, magasságban is.
