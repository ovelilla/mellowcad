---
title: "AutoCAD gyakorló feladat: kerek asztal székekkel"
metaTitle: "AutoCAD gyakorló feladat: kerek asztal, hat szék"
description: "Kerek asztal hat székkel AutoCAD-ben: egy szék, majd poláris kiosztás az asztal középpontja körül, és a méretek, lépésről lépésre. Ingyen, online."
figure: "120-as kerek asztal hat székkel, alaprajzban, centiméterben méretezve."
sourceHash: "1e307bf5e17a"
---

Rajzoljon egy 120 átmérőjű kerek asztalt hat székkel, centiméterben: minden szék egy 44 × 40-es ülőlap 4 sugárral lekerekített sarkokkal és egy 8 mély háttámla, az ülőlap eleje 8-ra az asztal szélétől. Rajzoljon meg egy széket az asztal fölött, a hat széket pedig helyezze el egy poláris kiosztással. A rajz méretléptéke centiméterre van beállítva.

## Steps

### Rajzolja meg az asztalt [#table]

A Körvonal fólián a <Command id="CIRCLE" /> parancs a `0,0` pontban, az <Keyword command="CIRCLE" id="Diameter" /> opció, `120`.

### Rajzoljon meg egy széket [#chair]

Az ülőlap az asztal fölött: a <Command id="RECTANG" /> parancs a <Keyword command="RECTANG" id="Fillet" /> opcióval, `4` sugárral, a `-22,68` ponttól `44,40` értékkel tovább. Ezután a háttámla, a lekerekítést `0` értékre visszaállítva, a `-22,108` ponttól `44,8` értékkel tovább. A <Command id="RECTANG" /> parancs megjegyzi a lekerekítés sugarát, amíg meg nem változtatja.

### Ossza ki a székeket [#array]

A <Command id="ARRAYPOLAR" /> parancs: válassza ki az ülőlapot és a háttámlát, nyomja meg az Enter billentyűt, adja meg az asztal középpontját, `0,0`, majd az <Keyword command="ARRAYPOLAR" id="Items" /> opció, `6`. Minden szék elfordul, ahogy a helyére kerül, így mind a hat az asztal felé néz.

### Méretezze [#dimensions]

A Méretek fólián a <Command id="DIMDIAMETER" /> parancs az asztalon, belül elhelyezve, és a <Command id="DIMLINEAR" /> parancs a felső szék szélességére, 44, és a háttámlával együtt mért mélységére, 48.
