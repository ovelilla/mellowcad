---
title: "AutoCAD SUGÁR (RAY) parancs"
metaTitle: "AutoCAD SUGÁR (RAY): végtelen vonal egy pontból"
description: "Így rajzol az AutoCAD SUGÁR (RAY) parancsa egy pontból egy irányba a végtelenbe futó szerkesztővonalakat, és így lesz belőlük levágva vonal. Próbálja ki ingyen."
figure: "Sugárvonalak egyetlen kezdőpontból három ponton át: mindegyik túlfut a nézet szélén."
sourceHash: "732d6e8c23de"
---

A SUGÁR (RAY) parancs sugárvonalakat rajzol: olyan szerkesztővonalakat, amelyek egy pontból indulnak, és egy irányban a végtelenbe futnak. Adja meg a kezdőpontot, majd egy átmenő pontot: a sugárvonal az elsőből indul, és a másodikon halad át. Minden további pont újabb sugárvonalat készít ugyanabból a kezdőpontból, amíg az Enter be nem fejezi a parancsot. A kezdőpontra eső átmenő pontot a parancs a <Message id="invalid" /> üzenettel elutasítja. Minden sugárvonal az aktuális fólián, az aktuális színnel, vonaltípussal és vonalvastagsággal készül.

A sugárvonal átfut a nézeten, bárhogyan is mozgatja vagy nagyítja azt, és a rajz terjedelméből kimarad, ahogy az AutoCAD-ben. A Végpont tárgyraszter a kezdőpontját találja meg, a Legközelebbi, a Merőleges és a Metszéspont tárgyraszter pedig a hossza mentén működik. A <Command id="TRIM" /> és a <Command id="BREAK" /> parancs a kezdőpontot tartalmazó szakaszt vonallá alakítja, az <Command id="EXTEND" /> parancs pedig a kezdőpontot visszafelé, egy mögötte lévő élig hosszabbítja meg. A <Command id="XLINE" /> parancs mindkét irányba futó vonalakat rajzol.

## Missing

A sugárvonal módosítása a HOSSZABBÍT (LENGTHEN) és az EGYBEFŰZ (JOIN) paranccsal még nincs összevetve az AutoCAD-del, ahogy a fogóinak menüi sem.

## Questions

### Mi az AutoCAD SUGÁR parancs?

Kezdőponttal rendelkező szerkesztővonal: egy pontból indul, és egy irányban a végtelenségig fut. Használja segédvonalként, amelyhez igazodva rajzol, majd vágja vonallá, vagy törölje.

### Mi az AutoCAD SUGÁR parancs angolul?

RAY. Rövidítése nincs: az AutoCAD nem ad álnevet a SUGÁR parancsnak, ezért írja be teljes nevén, `SUGÁR`, vagy az AutoCAD bármely nyelvi változatában `_RAY`. A szalagon a Rajz panel kibontott részén található, itt pedig a Rajz eszközök között, a Szerkesztővonal mellett.

### Hogyan lehet egy sugárvonalat egy vonalnál megállítani?

Vágja le: indítsa el a <Command id="TRIM" /> parancsot, és jelölje ki a vonalon túli részt. Ami a kezdőponttól a vonalig megmarad, az vonalobjektum.

### Mi a különbség a sugárvonal és a vonal között?

A vonalnak két vége van; a sugárvonalnak egy, a kezdőpontja, és vég nélkül fut tovább. DXF-fájlban a sugárvonal RAY objektumként mentődik, és sugárvonalként nyílik meg.
