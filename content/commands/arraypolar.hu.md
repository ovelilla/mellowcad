---
title: "Poláris kiosztás az AutoCAD-ben: KIOSZTPOLÁRIS (ARRAYPOLAR) parancs"
metaTitle: "Poláris kiosztás az AutoCAD-ben: KIOSZTPOLÁRIS"
description: "Poláris (körkörös) kiosztás az AutoCAD-ben a KIOSZTPOLÁRIS (ARRAYPOLAR) paranccsal: a középpont, az elemek, a bezárt vagy a kitöltött szög, az elemek forgatása."
figure: "Egy karima furata a karima középpontja körül kiosztva: 8 elem egy teljes körön."
sourceHash: "efed541dea7f"
---

A KIOSZTPOLÁRIS (ARRAYPOLAR) parancs egy középpont körül másolja a kijelölést, egyetlen kiosztásobjektumként. Bekéri az objektumokat, kiírja a típust és azt, hogy a kiosztás asszociatív-e, bekéri a középpontot, és azonnal megmutatja a kiosztást: 6 elem egy teljes körön, mindegyik elfordulva, ahogy körbehalad. Ezután egyetlen prompt élőben szerkeszti az opcióival vagy az előnézet fogóival, amíg az Enter létre nem hozza, ahogy az AutoCAD-ben. A kijelölt objektumok lesznek az első elem.

## Options

### ASsociative

Az <Keyword id="Yes" />, az alapértelmezés, egyetlen kiosztásobjektumot hoz létre, amelyet később a fogói és a Tulajdonságok paletta módosít; a <Keyword id="No" /> különálló másolatokat készít a kijelölt objektumok mellé. A válasz a munkamenet végéig megmarad, a KIOSZTNÉGYSZ és a KIOSZTÚTVONAL parancsban is.

### Items

Az elemek száma, 1 és 32 767 között; a kitöltött szög nem változik.

### Angle between

Az egyik elemtől a következőig mért szög. A kitöltött szög az elemszámnak megfelelő számú ilyen lépésből áll össze, az irány megmarad, és teljes körré válik, amint eléri a 360°-ot.

### Fill angle

Az elemek által kitöltött szög, pozitív értékkel az óramutató járásával ellentétesen, negatívval megegyezően; az elemek száma nem változik. Teljes körön két elem között a teljes kör darabszámmal osztott része van; kisebb szögnél az utolsó elem a szög végére kerül.

### ROTate items

Az <Keyword id="Yes" />, az alapértelmezés, minden elemet elforgat, ahogy a középpont körül halad; a <Keyword id="No" /> csak eltolja, így minden elem úgy áll, mint az első.

### eXit

Létrehozza a kiosztást, és befejezi a parancsot, ahogy az Enter.

## Missing

A Bázispont; a Forgástengely, egy térbeli tengely körüli kiosztáshoz; a Sorok és a Szintek, az elemek gyűrűihez és a Z mentén egymásra rakott másolatokhoz; a Kifejezés, amely egy értéket a rajz paramétereihez köt. A kiosztás fogóinak menüi (Sugár nyújtása, Elemszám, Kitöltött szög…) és a köztük váltó Ctrl.

## Questions

### Hogyan lehet poláris kiosztást készíteni az AutoCAD-ben?

Írja be a `KIOSZTPOLÁRIS` parancsot, jelölje ki az objektumokat, nyomja meg az Enter billentyűt, és adja meg a középpontot; vagy írja be a `KI` rövidítést a <Command id="ARRAY" /> parancshoz, és az objektumok után válassza a <Keyword command="ARRAY" id="POlar" /> opciót. Ezután az <Keyword id="Items" /> opcióval állítsa be a darabszámot, és az Enter megnyomásával hozza létre.

### Hogyan lehet objektumokat egy körív mentén kiosztani?

Válassza a <Keyword id="Fill angle" /> opciót, és írja be a szöget: a 180 fél körön rakja ki az elemeket az óramutató járásával ellentétesen, a -180 azzal megegyezően. Az elemek száma nem változik, az első és az utolsó a szög két végére kerül.

### Hogyan lehet megakadályozni, hogy az elemek elforduljanak?

Válassza a <Keyword id="ROTate items" /> opciót, és válaszoljon így: <Keyword id="No" />. Minden elem elfordulás nélkül mozdul el a középpont körül.

### Hogyan lehet módosítani egy poláris kiosztás sugarát?

Jelölje ki a kiosztást, és húzza a bázispontban lévő négyzet alakú fogóját a középpont felé vagy attól távolabb: a középponttól mért távolság lesz az új sugár. Vagy írja át a Sugár értékét a Tulajdonságok palettán.
