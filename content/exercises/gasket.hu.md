---
title: "AutoCAD gyakorló feladat: tömítés"
metaTitle: "AutoCAD gyakorló feladat kezdőknek: tömítés"
description: "Tömítés rajzolása AutoCAD-ben: lekerekített lap, központi furat, egy furatból másolt négy furat, középvonalak és méretek, lépésről lépésre. Ingyen, online."
figure: "A 120 × 80-as tömítés méretezve."
sourceHash: "dc5c0e2b45b8"
---

Rajzolja meg ezt a tömítést milliméterben: 120 × 80-as lap 10 sugárral lekerekített sarkokkal, a közepén 40-es központi furat és négy 10-es furat, amelyek középpontja 12-re van a szélektől, a központi furat középvonalaival és a méretekkel. Mindent billentyűzetről kell beírni: egy parancs első pontja oda kerül, ahová beírja, minden további pontot pedig a program az előzőtől mér. A körvonal, a középvonalak és a méretek külön-külön fóliára kerülnek.

## Steps

### Rajzolja meg a körvonalat [#outline]

Tegye a Körvonal fóliát aktuálissá a Fóliavezérlés listában. A <Command id="RECTANG" /> parancs egyetlen lépésben megrajzolja a lapot: válassza a <Keyword command="RECTANG" id="Fillet" /> opciót, és írja be a sugarat, `10`, majd az első sarkot, `0,0`, és a másik sarkot, `120,80`, az elsőtől mérve.

### Rajzolja meg a központi furatot [#bore]

A <Command id="CIRCLE" /> parancs a lap közepén, a `60,40` pontban: válassza az <Keyword command="CIRCLE" id="Diameter" /> opciót, és írja be: `40`.

### Másolja a furatokat [#holes]

Rajzoljon meg egy furatot, egy kört a `12,12` pontban az <Keyword command="CIRCLE" id="Diameter" /> opcióval, `10` átmérővel, majd másolja a <Command id="COPY" /> paranccsal: válassza ki a kört, nyomja meg az Enter billentyűt, bázispontnak adja meg a középpontját, `12,12`, és írja be, hová kerüljenek onnan a másolatok: `96,0`, majd `96,56`, majd `0,56`. Az Enter befejezi a másolást.

### Rajzolja meg a középvonalakat [#centreLines]

Tegye aktuálissá a Középvonalak fóliát. A <Command id="LINE" /> paranccsal rajzolt két vonal a központi furat középpontjában metszi egymást, és 6-tal túlnyúlik a furat szélén: a `60,14` ponttól `0,52` értékkel felfelé; a `34,40` ponttól `52,0` értékkel vízszintesen. Mindkettőt az Enter fejezi be.

### Méretezze [#dimensions]

Tegye aktuálissá a Méretek fóliát. A <Command id="DIMLINEAR" /> parancs két pontot kér, majd a méretvonal helyét: a hosszt a `0,10` ponttól `120,0` értékkel tovább, alul elhelyezve; a magasságot a jobb oldalon; a furatok távolságát, 96 és 56. A promptjaira beírt pont nem érint objektumot, ezért ezek a méretek mind nem asszociatívként jönnek létre, és ezt a parancssor jelzi is. A <Command id="DIMDIAMETER" /> parancs egy kijelölt kör átmérőjét helyezi el: először a központi furatét, aztán az egyik furatét.
