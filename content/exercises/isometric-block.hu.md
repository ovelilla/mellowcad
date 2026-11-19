---
title: "AutoCAD izometrikus gyakorló feladat: lépcsős hasáb"
metaTitle: "AutoCAD izometrikus rajz: gyakorló feladat"
description: "Lépcsős hasáb izometrikusan AutoCAD-ben a VONAL (LINE) paranccsal és polárkoordinátákkal a 30°-os, 90°-os és 150°-os tengely mentén, méretezve. Ingyen, online."
figure: "Lépcsős hasáb izometrikusan: 60 hosszú, 40 mély és 40 magas, a méretei az élei mentén."
sourceHash: "c1039d3b5e97"
---

Rajzolja meg ezt a lépcsős hasábot izometrikus ábrázolásban, milliméterben: 60 hosszú, 40 mély és 40 magas, az elején egy 20 mély és 20 magas lépcsővel. Minden él valamelyik izometrikus tengely mentén fut: a hosszúság 30° és 210°, a mélység 150° és 330°, a magasság 90° és 270° irányában. A MellowCAD még nem ismeri az AutoCAD izometrikus rajzolását, sem az izometrikus rasztert, sem az izometrikus köröket, ezért az élek polárkoordinátákkal, hosszal és szöggel beírt vonalak.

## Steps

### Rajzolja meg a lépcső elejét [#front]

A Körvonal fólián a <Command id="LINE" /> parancs a `0,0` ponttól, az alsó elülső saroktól: `60<30`, `20<90`, `60<210`, majd a <Keyword command="LINE" id="Close" /> opció.

### Rajzolja meg az oldalát [#side]

Ismét a `0,0` ponttól a bal oldal: `40<150`, `40<90`, `20<330`, `20<270` és `20<330`. Az Enter a lépcső elülső élén fejezi be a vonalat.

### Rajzolja meg a tetejét [#top]

A többi vonal már megrajzolt sarkokból indul: írja be a `_END` értéket – ez a Végpont tárgyraszter egyetlen pontra –, és kattintson a sarokra. Az elülső lap jobb felső sarkától: `20<150`, `20<90`, `20<150` és `60<210`. Ezután két `60<210` vonal, a lépcső homloklapjának aljától és tetejétől.

### Méretezze [#dimensions]

A Méretek fólián a <Command id="DIMALIGNED" /> paranccsal az élek mentén, mindegyik méretet a saját éle mellé helyezve: alul 60 és 40, a bal oldalon felfelé 40, a jobb oldalon felfelé 20.
