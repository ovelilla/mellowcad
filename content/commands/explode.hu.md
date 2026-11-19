---
title: "Szétvetés az AutoCAD-ben: SZÉTVET (EXPLODE) parancs"
metaTitle: "Szétvetés az AutoCAD-ben: SZÉTVET (EXPLODE)"
description: "Az AutoCAD SZÉTVET (EXPLODE, SZV) parancsa: vonallánc vonalakra és ívekre, blokk az objektumaira, szöveg sorokra, sraffozás vonalakra. Próbálja ki ingyen."
figure: "Egy téglalap, egyetlen vonallánc, négy vonalra vetve szét, majd az egyik vonal külön törölve."
sourceHash: "479cf1cd58d9"
---

A SZÉTVET (EXPLODE) parancs egy összetett objektumot az őt alkotó objektumokra bont. Jelölje ki az objektumokat, és nyomja meg az Enter billentyűt: a vonalláncból a középvonala mentén vonalak és ívek lesznek, a blokkreferenciából a blokkja objektumai, egy szinttel lejjebb, a bekezdéses szövegből minden megjelenített sorából egy-egy egysoros szöveg, a mintázatos sraffozásból pedig a mintázat vonalai. Minden darab megtartja az objektum fóliáját és tulajdonságait; a blokk darabjai a sajátjaikat tartják meg. A széles vonallánc elveszíti a szélességét, és a SZÉTVET ezt jelzi is. A vonalak, körök, ívek, egysoros szövegek és méretek nem vethetők szét: a parancs a kijelölésükkor elutasítja őket, a spline-t, az ellipszist és a tömör kitöltésű sraffozást pedig a kijelölés lezárásakor. A szétvetés egyetlen lépés, amely a Vissza paranccsal visszavonható.

## Missing

A méretek, amelyeket az AutoCAD vonalakra, nyílfejekre és szövegre vet szét, a MellowCAD viszont elutasít. Az olyan sraffozást, amelynek mintázata itt nem érhető el, a parancs a tömör kitöltésűhöz hasonlóan elutasítja, a szétvetett bekezdéses szöveg pedig ott áll, ahová a betűtípus rajzolja, egy hajszálnyira az AutoCAD helyétől.

## Questions

### Mi az AutoCAD SZÉTVET parancs angolul?

EXPLODE. A magyar AutoCAD-ben a rövidítése `SZV`: írja be, majd nyomja meg az Enter vagy a Szóköz billentyűt. A teljes név is működik, az AutoCAD bármely nyelvi változatában pedig az `_EXPLODE` is; az angol `X` a magyar változatban nem működik.

### Hogyan lehet visszavonni a szétvetést az AutoCAD-ben?

Írja be a <Command id="U" /> parancsot, vagy nyomja meg azonnal a Ctrl+Z billentyűkombinációt: a szétvetés egyetlen visszavonási lépés. Később az <Command id="JOIN" /> parancs a végükkel egymáshoz csatlakozó vonalakat és íveket ismét egyetlen vonallánccá fűzi, a <Command id="BLOCK" /> parancs pedig az objektumokból ismét blokkot készít.

### Szétvethető-e a szöveg az AutoCAD-ben?

A bekezdéses szöveg igen: minden sora egysoros szöveg lesz. Az egysoros szöveg már a legkisebb egység, ezt a SZÉTVET parancs elutasítja.

### Hogyan lehet szétvetni egy blokkot az AutoCAD-ben?

Jelölje ki a blokkreferenciát, és nyomja meg az Enter billentyűt: a blokkja objektumaira esik szét, ott, ahol a referencia megrajzolta őket. A benne lévő blokk blokk marad: azt újra szét kell vetni. Az attribútumok definícióként jelennek meg újra, az értékeik nélkül.
