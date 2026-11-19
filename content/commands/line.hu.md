---
title: "AutoCAD VONAL (LINE) parancs"
metaTitle: "Vonal rajzolása az AutoCAD-ben: VONAL (LINE)"
description: "Az AutoCAD VONAL (LINE, VO) parancsa promptról promptra: kattintott vagy beírt pontok, Vissza és Bezárás, Enter az utolsó vonal folytatásához. Próbálja ki."
figure: "Egy háromszög: az első pontja beírva, a következő kettő az előző ponttól, majd Bezárás."
sourceHash: "5065fc1817a1"
---

A VONAL (LINE) parancs egyenes szakaszokat rajzol, mindegyiket önálló objektumként: adja meg az első pontot, majd minden következő pontot, az Enter billentyűig. A pontot kattintással, tárgyraszterrel vagy beírással lehet megadni. Ahogy az AutoCAD-ben bekapcsolt dinamikus bevitel mellett, az első után beírt pontot a parancs az előzőtől méri, így a `80,0` 80 egységet rajzol X irányban, az előzmények pedig `@80,0` alakban írják ki; egy önálló szám a kurzor irányában mért távolság, a `<30` pedig 30°-ra rögzíti a következő pontot. Az első pontnál az Enter vagy a jobb kattintás az utolsó vonal, vonallánc vagy ív végétől folytatja, ív esetén érintőlegesen, és csak a hosszt kéri. Akárhány szakaszt rajzol is, egyetlen <Command id="U" /> az egész parancsot visszavonja.

## Options

### Undo

Visszavonja az utolsó szakaszt, és az előző ponttól kérdez újra. Ha már nem maradt szakasz, a válasza <Message id="allLineSegmentsUndone" />, és újra az első pontot kéri.

### Close

A második szakasztól kezdve érhető el: megrajzolja az utolsó szakaszt vissza az első pontig, és befejezi a parancsot, bezárva az alakzatot.

## Missing

Az első pontnál beírt Érintő vagy Merőleges a következő pontra vár (halasztott tárgyraszter), ahogy az AutoCAD-ben, de csak vonalak, körök és ívek fölött, vonallánc-szakasz, ellipszis vagy spline fölött nem, és két halasztott Merőlegest nem old meg.

## Questions

### Mi az AutoCAD VONAL parancs angolul?

LINE. A magyar AutoCAD-ben a rövidítése `VO`: írja be, majd nyomja meg az Enter vagy a Szóköz billentyűt. A teljes név is működik, az AutoCAD bármely nyelvi változatában pedig a `_LINE` is; az angol `L` a magyar változatban a LÁTVÁNYSTÍLUSOK parancsot indítja.

### Hogyan lehet adott szögű és hosszúságú vonalat rajzolni?

Adja meg az első pontot, majd a következőt hosszal és szöggel írja be: a `@100<30` 100 egység hosszú, 30°-os vonalat rajzol. Vagy kapcsolja be a poláris követést, kövesse a segédvonalát az adott szögben, és csak a hosszt írja be.

### Hogyan lehet az utoljára rajzolt vonalat folytatni?

Indítsa el a VONAL parancsot, és az első pontnál nyomja meg az Enter billentyűt: az utolsó vonal, vonallánc vagy ív végétől indul. Ívből a vonal érintőlegesen folytatódik, és a VONAL csak a hosszát kéri. Ha nincs mit folytatni, a válasz <Message id="noLineOrArcToContinue" />.

### Miért különálló darabokból áll a vonalam?

A VONAL parancs minden szakasza önálló vonal, ahogy az AutoCAD-ben. Egyetlen objektumhoz rajzoljon a <Command id="PLINE" /> paranccsal, vagy fűzze össze utólag a vonalakat az <Command id="JOIN" /> paranccsal.
