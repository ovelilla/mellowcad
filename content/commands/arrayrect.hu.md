---
title: "Négyszögletes kiosztás az AutoCAD-ben: KIOSZTNÉGYSZ (ARRAYRECT) parancs"
metaTitle: "Négyszögletes kiosztás: KIOSZTNÉGYSZ parancs"
description: "Négyszögletes kiosztás az AutoCAD-ben a KIOSZTNÉGYSZ (ARRAYRECT) paranccsal: oszlopok, sorok és szintek, a köztük lévő távolság, asszociatív vagy sem."
figure: "Egy négyzet és a köre 5 oszlopban és 3 sorban, 16 és 14 távolságra: előbb a darabszám, majd az osztásköz."
sourceHash: "c8c8d747d0c9"
---

A KIOSZTNÉGYSZ (ARRAYRECT) parancs oszlopokba és sorokba, ha kívánja, szintekbe is másolja a kijelölést, egyetlen kiosztásobjektumként. Bekéri az objektumokat, kiírja a típust és azt, hogy a kiosztás asszociatív-e, és azonnal megmutatja: 4 oszlop az FKR X tengelye és 3 sor az Y tengelye mentén, a kijelölés méretének másfélszeresére egymástól. Ezután egyetlen prompt élőben szerkeszti az opcióival vagy az előnézet fogóival, amíg az Enter létre nem hozza, ahogy az AutoCAD-ben: egy darabszám vagy egy távolság beállításához kattintson az egyik nyílra, majd kattintson oda, ahová kerülnie kell, vagy írjon be egy számot. Az Esc itt szintén létrehozza a kiosztást. A kijelölt objektumok lesznek az első elem.

## Options

### ASsociative

Az <Keyword id="Yes" />, az alapértelmezés, egyetlen kiosztásobjektumot hoz létre: később a fogói és a Tulajdonságok paletta módosítja, a <Command id="EXPLODE" /> parancs pedig az elemeire bontja. A <Keyword id="No" /> különálló másolatokat készít a kijelölt objektumok mellé. A válasz a munkamenet végéig megmarad, a KIOSZTPOLÁRIS és a KIOSZTÚTVONAL parancsban is.

### COUnt

Az oszlopok, majd a sorok száma, mindkettő 1 és 32 767 között.

### Spacing

Az oszlopok, majd a sorok közötti távolság; negatív értékkel balra vagy lefelé. Vagy az <Keyword id="Unit cell" />: egy téglalap két sarka, amelynek oldalai adják mindkét távolságot.

### COLumns

Az oszlopok száma és a köztük lévő távolság.

### Rows

A sorok száma, a köztük lévő távolság, és egy szintkülönbség, amennyivel minden sor magasabban van az előzőnél.

### Levels

Az FKR Z tengelye mentén egymásra rakott másolatok: a szintek száma, majd a köztük lévő távolság, vagy az <Keyword id="Total" /> opcióval az első és az utolsó szint közötti távolság.

### eXit

Létrehozza a kiosztást, és befejezi a parancsot, ahogy az Enter.

## Missing

A Bázispont; az Összesen opció az oszlopok és a sorok közötti távolságnál (a Szintek opciónál megvan); a Kifejezés, amely egy értéket a rajz paramétereihez köt. A KIOSZTSZERKESZT és a KIOSZTBEZÁR, amelyek a kiosztás forrását szerkesztik, illetve elemeit cserélik le. A kiosztás fogóinak menüi (Oszlopok száma, Teljes oszloptávolság, Tengely szöge…) és a köztük váltó Ctrl, így fogóval sem teljes távolság, sem tengelyszög nem állítható be; a fogó a parancssorba sem írja ki a sorait. A paletta Bázis X és Bázis Y értéke nem írható át.

## Questions

### Hogyan lehet négyszögletes kiosztást indítani az AutoCAD-ben?

Írja be a `KIOSZTNÉGYSZ` parancsot, amelynek nincs rövidítése, vagy a `KI` rövidítést a <Command id="ARRAY" /> parancshoz, és a kérdésénél nyomja meg az Enter billentyűt, mert a négyszögletes az alapértelmezés. Jelölje ki az objektumokat, és nyomja meg az Enter billentyűt: a kiosztás azonnal megjelenik, szerkesztésre készen.

### Hogyan lehet beállítani a sorok és az oszlopok közötti távolságot?

Válassza az <Keyword id="Spacing" /> opciót, és írja be az oszlopok, majd a sorok közötti távolságot; a negatív érték balra vagy lefelé visz. Az <Keyword id="Unit cell" /> opcióval két sarok egyszerre adja meg mindkettőt. Vagy húzza a második oszlopnál és sornál lévő nyilakat.

### Hogyan lehet a másolatokból különálló objektumokat készíteni?

Az Enter megnyomása előtt válassza az <Keyword id="ASsociative" /> opciót, és válaszoljon így: <Keyword id="No" />. Minden másolat önálló objektum lesz. Egy asszociatív kiosztás később is elemeire bontható a <Command id="EXPLODE" /> paranccsal.

### Hogyan lehet 3D kiosztást készíteni?

Válassza a <Keyword id="Levels" /> opciót: a sorok és az oszlopok az FKR Z tengelye mentén felfelé másolódnak, annyi szintben, ahányat megad, a megadott távolságra egymástól. A <Keyword id="Rows" /> opció szintkülönbséget is kér, amely minden sort megemel az előzőhöz képest.
