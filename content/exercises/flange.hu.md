---
title: "AutoCAD gyakorló feladat: karima"
metaTitle: "AutoCAD gyakorló feladat: karima reteszhoronnyal"
description: "Karima rajzolása AutoCAD-ben: furat bevágott reteszhoronnyal, nyolc furat poláris kiosztásban, középvonalak és átmérők, lépésről lépésre. Ingyen, online."
figure: "A 140 átmérőjű karima a reteszhoronnyal, a nyolc furattal és az átmérőkkel."
sourceHash: "32f94d57ae25"
---

Rajzolja meg ezt a karimát milliméterben: 140 átmérő, 60-as központi furat 16 széles reteszhoronnyal, amelynek a teteje 36-ra van a középponttól, nyolc 14-es furat egy 110-es osztókörön, és a középvonalak. A reteszhorony egy téglalap, amelyet a központi furatba vág be; a furatok egyetlen kör és egy poláris kiosztás.

## Steps

### Rajzolja meg a köröket [#circles]

A Körvonal fólián két kör a `0,0` pontban, mindkettő az <Keyword command="CIRCLE" id="Diameter" /> opcióval: `140` és `60`.

### Vágja be a reteszhornyot [#keyway]

A <Command id="RECTANG" /> paranccsal rajzoljon téglalapot a `-8,20` ponttól `16,16` értékkel tovább: ez metszi a központi furatot. A <Command id="TRIM" /> parancs ott vágja el az objektumot, ahol más objektumok metszik: válassza ki a furat ívét a téglalap oldalai között, majd a téglalap alsó oldalát a furaton belül. Ami megmarad, az a reteszhorony: a két oldala és a teteje.

### Ossza ki a furatokat [#holes]

Egy furat az osztókörön: kör az `55<22.5` pontban, az origótól 55 távolságra, 22,5°-os szögben, az <Keyword command="CIRCLE" id="Diameter" /> opcióval, `14` átmérővel. A <Command id="ARRAYPOLAR" /> parancs: válassza ki, nyomja meg az Enter billentyűt, és adja meg a középpontot, `0,0`; az <Keyword command="ARRAYPOLAR" id="ASsociative" /> és a <Keyword command="ARRAYPOLAR" id="No" /> opció nyolc különálló kört hagy, amelyeket egy méret ki tud jelölni, az <Keyword command="ARRAYPOLAR" id="Items" /> opció pedig `8` értékkel a teljes kör mentén osztja el őket. Ezután a Középvonalak fólián az osztókör a `0,0` pontban, `110` átmérővel.

### Rajzolja meg a középvonalakat [#centreLines]

Továbbra is a Középvonalak fólián két vonal a <Command id="LINE" /> paranccsal a középponton át, 156 hosszan: a `-78,0` ponttól `156,0` értékkel vízszintesen; a `0,-78` ponttól `0,156` értékkel felfelé.

### Méretezze [#dimensions]

A Méretek fólián a <Command id="DIMDIAMETER" /> paranccsal a központi furatra, egy furatra, az osztókörre és a körvonalra, mindegyiket ott kijelölve, ahol még nem keresztezi méret, majd a <Command id="DIMLINEAR" /> paranccsal a reteszhorony tetején keresztül: 16.
