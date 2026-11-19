---
title: "AutoCAD SZTESTSZERKESZT (SOLIDEDIT) parancs"
description: "Így szerkeszti az AutoCAD SZTESTSZERKESZT (SOLIDEDIT) parancsa a 3D szilárdtest lapjait: Kihúz, Mozgat, Forgat, Eltol, Szűkít, Töröl, Másol. Próbálja ki ingyen."
figure: "Téglatest felső lapja 15 egységgel felfelé kihúzva, 15 fokos szűkítéssel, a SZTESTSZERKESZT paranccsal: csonka gúla a téglatesten, délkeletről nézve."
sourceHash: "775cdc271d4f"
---

A SZTESTSZERKESZT (SOLIDEDIT) parancs a lapjain keresztül szerkeszti a 3D szilárdtestet. Először kiírja, hogy a program ellenőrzi-e az egyes szerkesztéseket, majd megkérdezi, mit szerkesszen: <Keyword id="Face" />, ezután a lapszerkesztési opciót, aztán a lapokat, végül azt, amire az opciónak szüksége van. Minden szerkesztés azonnal megtörténik, és a lapszerkesztési opciók újra megjelennek, így egy futtatással több szerkesztés is elvégezhető; a <Keyword id="eXit" /> vagy az Enter előbb a lapszerkesztési opciókból lép ki, majd a parancsból. A szomszédos lapok követik a szerkesztett lapot: ha egy téglatest felső lapját feljebb mozgatja, az oldallapjai megnyúlnak, hogy találkozzanak vele.

A szilárdtest megtartja a fóliáját és a tulajdonságait, de elveszíti azt, amiből készült: a téglatest többé nem téglatest. Az egész futtatás egyetlen visszavonási lépés, és a parancs <Keyword id="Undo" /> opciója a futtatáson belül egyenként vonja vissza a szerkesztéseket. A `Parancs:` kérdésnél megnyomott Enter az első kérdéstől kezdve újra elindítja. A szalag Szilárdtestszerkesztés panelének lapgombjai közvetlenül indítják az egyes lapszerkesztési opciókat. A MellowCAD 3D-s része csak szilárdtestekből áll, és egyelőre részleges.

## Options

### Face

A lapszerkesztési opciók. Mindegyik lapokat kér, amíg meg nem nyomja az Enter billentyűt: egy kattintás vagy egy begépelt pont az alatta lévő, Önhöz legközelebbi lapot veszi, vagy az ott lévő él két lapját, egy már kijelölt lap helyett pedig a mögötte lévőt. Ha már van kijelölt lap, az <Keyword id="ALL" /> a szilárdtest összes lapját kijelöli; az <Keyword id="Remove" /> ehelyett kivesz lapokat a halmazból, a <Keyword id="Undo" /> pedig visszavonja az utolsó kijelölést. Ha a kattintás alatt nincs semmi, ez az üzenet jelenik meg: <Message id="noSolidsDetected" />. Egyszerre csak egy szilárdtest lapjai jelölhetők ki.

### Extrude

Magasságot és szűkítési szöget kér: minden lapból hasáb nő, amely hozzáadódik a szilárdtesthez, vagy negatív magasságnál kivonódik belőle, és pozitív szögnél felfelé haladva keskenyedik. A magasságnál az Enter azt az utolsó magasságot veszi, amelyet az alaptestek vagy a <Command id="EXTRUDE" /> parancs használt.

### Move

Bázispontot és második pontot kér: a sík lap a normálisa mentén annyit mozdul, amennyit ez a távolság a normálisra vetítve kiad, és viszi magával a szomszédait. A második pontnál az Enter a bázispontot veszi elmozdulásnak.

### Rotate

Tengelyt kér, két ponttal vagy az FKR <Keyword id="Xaxis" />, <Keyword id="Yaxis" /> vagy <Keyword id="Zaxis" /> opciójával, vagy a képernyőre merőlegeset a <Keyword id="View" /> opcióval, majd egy szöget: a lap a jobbkéz-szabály szerint elfordul a tengely körül.

### Offset

Távolságot kér: a lap a normálisa mentén kifelé mozdul, negatív értéknél befelé, és viszi magával a szomszédait; a hengeres és más ívelt lapok a tengelyük körül tolódnak el. Ha a befelé tolás eléri a szilárdtestet befoglaló téglatest legnagyobb oldalának felét, a parancs elutasítja, és megadja, meddig lehet menni.

### Taper

Bázispontot, a szűkítés tengelyének egy pontját és egy szöget kér: a lap ott dől meg, ahol a bázisponton átmenő sík metszi, pozitív szögnél a tengely mentén befelé.

### Delete

Eltávolítja egy furat falát, és ezzel bezárja a furatot, vagy egy lekerekítés vagy letörés sávját, és visszaadja az élt, amelynek a helyére került.

### Copy

Minden sík lapból lemezt készít, a helyén vagy két ponttal elmozdítva, az aktuális fólián és az aktuális tulajdonságokkal.

### Undo

A lapszerkesztési opcióknál visszavonja a futtatás utolsó szerkesztését; ha már nincs mit visszavonni, ez jelenik meg: <Message id="commandCompletelyUndone" />.

### eXit

A lapszerkesztési opciókból visszalép az első kérdéshez, ott pedig kilép a parancsból; az Enter ugyanezt teszi.

## Missing

Az <Keyword id="Edge" /> és a <Keyword id="Body" />, valamint a lapok <Keyword id="coLor" /> és <Keyword id="mAterial" /> opciója: ezek megjelennek, de a parancs elutasítja őket, ahogy a kihúzás <Keyword id="Path" /> opcióját, a forgatás objektummal megadott tengelyét és a <Keyword id="Reference" /> szögét is. A Metsző, a Felfűz és az MPoligon kijelölés a lapokhoz. Ívelt lap mozgatása, forgatása, szűkítése vagy másolása, ívelt lap eltolása más szomszédok között, olyan lap törlése, amely nem furat fala és nem sáv, valamint az olyan szerkesztés, amely annyira megváltoztatja a szilárdtest alakját, hogy egy lap felemészt egy másikat. Szerkesztés szűkítéssel kihúzott lap mellett. A túl messzire kifelé mutató eltolás, amelyet az AutoCAD szó nélkül elvet, a MellowCAD viszont elvégez. Előnézet a távolság vagy a szög megadása közben.

## Questions

### Hogyan lehet 3D testet szerkeszteni az AutoCAD-ben?

Indítsa el a SZTESTSZERKESZT parancsot, válassza a <Keyword id="Face" /> opciót, majd azt, amit tenni szeretne: a <Keyword id="Extrude" /> vagy a <Keyword id="Move" /> opcióval magasabbá teheti a testet, a <Keyword id="Delete" /> opcióval betömhet egy furatot, a <Keyword id="Taper" /> opcióval megdöntheti az egyik oldalát. Jelölje ki a lapokat, nyomja meg az Enter billentyűt, és válaszoljon az opció kérdéseire. Gyors toláshoz vagy húzáshoz a <Command id="PRESSPULL" /> parancs is mozgat lapot.

### Hogyan lehet kihúzni egy 3D szilárdtest lapját?

SZTESTSZERKESZT, <Keyword id="Face" />, <Keyword id="Extrude" />, jelölje ki a lapot, és nyomja meg az Enter billentyűt, majd adja meg a magasságot és a szűkítési szöget: a munkamenet `15` és `15` értéke csonka gúlát emel a téglatest tetejére.

### Hogyan lehet eltüntetni egy furatot a szilárdtestből?

SZTESTSZERKESZT, <Keyword id="Face" />, <Keyword id="Delete" />, jelölje ki a furat falát, és nyomja meg az Enter billentyűt: a furat betömődik. Ugyanígy tüntethető el egy lekerekítés vagy letörés is.

### Mi a különbség a SZTESTSZERKESZT és a TOLHÚZ parancs között?

A <Command id="PRESSPULL" /> parancs egyetlen lapot mozgat önmagára merőlegesen, húzással vagy megadott távolsággal. A SZTESTSZERKESZT parancs ezt és még többet tud: lapokat szűkít, forgat, eltol, töröl és másol, akár többet egyszerre.
