---
title: "Kiosztás az AutoCAD-ben: KIOSZT (ARRAY) parancs"
metaTitle: "Kiosztás az AutoCAD-ben: KIOSZT (ARRAY) parancs"
description: "Kiosztás az AutoCAD-ben a KIOSZT (ARRAY, KI) paranccsal: négyszögletes, poláris és útvonal menti kiosztás, élőben szerkesztve létrehozás előtt. Próbálja ki."
figure: "Egy négyzet és a köre kiosztva az alapértékekkel: Enter a négyszögletes kiosztáshoz, 4 oszlop és 3 sor."
sourceHash: "5e0a412c9f13"
---

A KIOSZT (ARRAY) parancs mintázatba másolja a kijelölést: oszlopokba és sorokba, egy középpont köré vagy egy útvonal mentén. Bekéri az objektumokat, majd a kiosztás típusát – az Enter négyszögletest választ –, és a kijelölést átadja a <Command id="ARRAYRECT" />, a <Command id="ARRAYPOLAR" /> vagy a <Command id="ARRAYPATH" /> parancsnak, amelyek az objektumok újbóli bekérése nélkül folytatják. Mindegyik azonnal megmutatja a kiosztást, és élőben szerkeszti az opcióival és a fogóival, amíg az Enter létre nem hozza: egyetlen kiosztásobjektumot, vagy különálló másolatokat, ha azt adta meg, hogy ne legyen asszociatív. A teljes futás egyetlen visszavonási lépés, és a Parancs: promptnál adott Enter megismétli a KIOSZT parancsot.

## Options

### Rectangular

Oszlopok és sorok, és ha kívánja, Z mentén egymásra rakott szintek: <Command id="ARRAYRECT" />. 4 oszloppal és 3 sorral indul, a kijelölés méretének másfélszeresére egymástól.

### PAth

Egy vonal, ív, kör vagy vonallánc mentén: <Command id="ARRAYPATH" />. Bekéri az útvonalgörbét, majd végigrakja rajta az elemeket, mindegyiket úgy elforgatva, ahogy az útvonal fordul.

### POlar

Egy középpont körül: <Command id="ARRAYPOLAR" />. Bekéri a középpontot, és 6 elemmel indul egy teljes körön.

## Missing

A felkínált típus mindig a Négyszögletes: az ARRAYTYPE változót, amely az AutoCAD-ben az alapértelmezést állítja be, nem olvassa.

## Questions

### Mi az AutoCAD KIOSZT parancs angolul, és mi a rövidítése?

Angolul ARRAY, a magyar AutoCAD-ben KIOSZT: írja be a `KI` rövidítést, majd nyomja meg az Enter vagy a Szóköz billentyűt. Az angol `AR` a magyar AutoCAD-ben az ÁRNYAL parancsot indítja; az `_ARRAY` az AutoCAD bármely nyelvén működik. A <Command id="ARRAYRECT" />, a <Command id="ARRAYPOLAR" /> és a <Command id="ARRAYPATH" /> parancsnak nincs rövidítése, és teljes nevükkel beírva kihagyják a típusra vonatkozó kérdést.

### Hogyan lehet körkörös kiosztást készíteni?

Válassza a <Keyword id="POlar" /> opciót, vagy indítsa el a <Command id="ARRAYPOLAR" /> parancsot, és adja meg a középpontot: a kijelölés körbe másolódik, kezdetben 6 elemben. A darabszámot az <Keyword command="ARRAYPOLAR" id="Items" /> opcióval módosíthatja, a kitöltött szöget pedig a <Keyword command="ARRAYPOLAR" id="Fill angle" /> opcióval állíthatja be.

### Hogyan lehet szétvetni egy kiosztást?

Jelölje ki, és futtassa a <Command id="EXPLODE" /> parancsot: a kiosztásból az elemei objektumai lesznek, mindegyik a saját fóliáján. Ha eleve különálló másolatokat szeretne, az Enter megnyomása előtt az <Keyword command="ARRAYRECT" id="ASsociative" /> kérdésre válaszoljon így: <Keyword command="ARRAYRECT" id="No" />.

### Hogyan lehet módosítani egy kiosztást a létrehozása után?

Jelölje ki. A fogói módosítják: a bázispontban lévő négyzet mozgatja, a nyilak a darabszámot és a távolságot állítják, és ha egy darabszám-nyíl aktív, a beírt szám lesz a darabszám. A Tulajdonságok paletta felsorolja az oszlopait, sorait és távolságait, vagy az elemeit és szögeit, hogy átírhassa őket. A KIOSZTSZERKESZT parancs még nincs meg.
