---
title: "AutoCAD gyakorló feladat: telek"
metaTitle: "AutoCAD gyakorló feladat: telek területe"
description: "Telek rajzolása AutoCAD-ben az oldalai hosszából és szögéből polárkoordinátákkal, majd a terület lemérése és a méretezés. Ingyen, lépésről lépésre, online."
figure: "Ötoldalú telek méterben, minden oldala és egy szöge méretezve."
sourceHash: "f5542a75eef7"
---

Rajzolja meg ezt a telket méterben, az oldalai hosszából és irányából: 40 m 0°-os, 30 m 80°-os, 35 m 155°-os és 25 m 230°-os irányban, majd vissza a kezdőpontig. Mérje le a területét és a kerületét, és méretezze minden oldalát, valamint a második sarkánál lévő szöget. A polárkoordináták – hossz és szög – minden oldalt az előző végétől rajzolnak meg. A rajz méretléptéke méterre van beállítva.

## Steps

### Rajzolja meg a határvonalat [#boundary]

A Körvonal fólián a <Command id="PLINE" /> parancs a `0,0` ponttól, majd minden oldal a hosszával és a szögével: `40<0`, `30<80`, `35<155` és `25<230`, mindegyik az utolsó ponttól mérve. A <Keyword command="PLINE" id="Close" /> opció megrajzolja az ötödik oldalt, és bezárja a határvonalat: egyetlen objektum, amelyet a <Command id="AREA" /> parancs le tud mérni.

### Mérje le a területét [#area]

A <Command id="AREA" /> parancs, majd az <Keyword command="AREA" id="Object" /> opció, és válassza ki a határvonalat: a parancssor kiírja a területét négyzetméterben és a kerületét.

### Méretezze [#dimensions]

A Méretek fólián a <Command id="DIMALIGNED" /> parancs, és Enter az első kérdésére: ekkor objektumot kér, és egy oldalra mutatva azt az oldalt méretezi, vele párhuzamosan. Mindegyik méretet a telken kívül helyezze el. A <Command id="DIMANGULAR" /> parancs a `40,0` pontban találkozó két oldalon megadja a köztük lévő szöget, 100°-ot.
