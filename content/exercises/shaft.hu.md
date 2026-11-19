---
title: "AutoCAD gyakorló feladat: lépcsős tengely"
metaTitle: "AutoCAD gépész gyakorló feladat: lépcsős tengely"
description: "Lépcsős tengely AutoCAD-ben: a fele vonalláncként, letörve, a középvonalra tükrözve, a hosszak láncméretezéssel. Ingyen, lépésről lépésre."
figure: "Lépcsős tengely oldalnézetben, 150 hosszú, a hosszai láncméretezéssel."
sourceHash: "8c649e73bc55"
---

Rajzolja meg ezt a lépcsős tengelyt oldalnézetben, milliméterben: 150 hosszú, 30, 40 és 30 átmérővel 40, 60 és 50 hosszon, mindkét végén 2 × 2-es letöréssel. A középvonal fölötti felét egyetlen vonalláncként rajzolja meg, törje le és tükrözze; ezután a tengelyen keresztben látható éleket, a középvonalat és a hosszakat. Az átmérők az itt megadottak.

## Steps

### Rajzolja meg a felső felét [#half]

A Körvonal fólián egyetlen vonallánc a <Command id="PLINE" /> paranccsal a `0,0` ponttól: fel `0,15`, vízszintesen `40,0`, fel `0,5`, vízszintesen `60,0`, le `0,-5`, vízszintesen `50,0` és le `0,-15`, vissza a középvonalig. Az Enter befejezi.

### Törje le a végeket [#chamfers]

A <Command id="CHAMFER" /> parancs, majd a <Keyword command="CHAMFER" id="Distance" /> opció: `2`, és az Enter a második távolságra is elfogadja a `2` értéket. A <Keyword command="CHAMFER" id="Multiple" /> opcióval egymás után több sarkot letörhet újraindítás nélkül: válassza ki a két szakaszt mindkét vég sarkánál.

### Tükrözze [#mirror]

A <Command id="MIRROR" /> parancs: válassza ki a vonalláncot, nyomja meg az Enter billentyűt, majd adja meg a tükrözés tengelyét a `0,0` ponttól a `150,0` pontig – ez a középvonal –, és az Enter megtartja az eredetit.

### Rajzolja meg az éleket [#edges]

A <Command id="LINE" /> paranccsal a tengelyen keresztben látható élek, mindegyik `0,30` értékkel felfelé az aljától: a `2,-15` és a `148,-15` ponttól a letöréseknél, a `40,-15` és a `100,-15` ponttól a vállaknál.

### Rajzolja meg a középvonalat [#axis]

A Középvonalak fólián a középvonal: egy vonal a `-8,0` ponttól `166,0` értékkel tovább.

### Méretezze [#dimensions]

A Méretek fólián a <Command id="DIMLINEAR" /> parancs az első hosszra, 40, alul elhelyezve. A <Command id="DIMCONTINUE" /> parancs a második segédvonalától folytatja: `#100,-20`, majd `#150,-15`, az origótól mérve, # jellel beírva, és kétszer Enter a befejezéshez. Egy utolsó <Command id="DIMLINEAR" /> parancs a teljes hosszt adja meg, 150, még lejjebb.
