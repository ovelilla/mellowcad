---
title: "Kör rajzolása az AutoCAD-ben: KÖR (CIRCLE) parancs"
metaTitle: "Kör az AutoCAD-ben: KÖR (CIRCLE) parancs, 2P, 3P"
description: "Kör rajzolása az AutoCAD-ben a KÖR (CIRCLE, K) paranccsal, promptról promptra: középpont és sugár vagy átmérő, 2P, 3P és Éés, két objektumot érintő kör."
figure: "Három kör: középpont és sugár, egy átmérő két végpontja (2P), középpont és Átmérő."
sourceHash: "ba17b79c10cc"
---

A KÖR (CIRCLE) parancs kört rajzol a középpontjából és a sugarából – beírva vagy a kör egy pontjával megadva –, vagy az első promptja által felkínált többi mód egyikével. A sugárnál adott Enter megismétli az utolsó kör méretét, amelyet a rajz megőriz. Amíg a sugarat adja meg, a középponttól a kurzorig borostyánszínű szaggatott vonal fut, átmérő megadásakor a körön túl is, ahogy az AutoCAD rajzolja. A kör az első pontja síkjában fekszik, az aktuális szinten, ha a pontnak nincs saját Z koordinátája.

## Options

### 3P

Három ponton át. Ha mindegyiknél Érintő tárgyrasztert ír be – `ÉRI` vagy `_TAN` –, ez az AutoCAD Érintő, érintő, érintő módja: a kör három objektumot érint.

### 2P

Egy átmérő két végpontjából.

### Ttr

Két objektumot érint, adott sugárral: válassza ki mindegyik vonalat, kört vagy ívet ott, ahol a körnek érintenie kell, majd adja meg a sugarat. Az illeszkedő körök közül azt rajzolja meg, amely a kijelölési pontokhoz legközelebb érint; ha egyik sem illeszkedik, az üzenet <Message id="circleDoesNotExist" />.

### Diameter

A sugár promptjánál: helyette az átmérőt adja meg, beírva vagy pontként.

## Missing

Az Éés vonalláncszakaszon, amelyet az AutoCAD elfogad, a MellowCAD pedig elutasít; a szalag Érintő, érintő, érintő eleme (a beírás, a 3P három Érintő tárgyraszterrel, működik); a Gyorstulajdonságok egy körre duplán kattintva.

## Questions

### Mi az AutoCAD KÖR parancs angolul, és mi a rövidítése?

Angolul CIRCLE, a magyar AutoCAD-ben KÖR: írja be a `K` rövidítést, majd nyomja meg az Enter vagy a Szóköz billentyűt. Az angol `C` a magyar AutoCAD-ben a CSOPORT parancsot indítja; a `_CIRCLE` az AutoCAD bármely nyelvén működik.

### Hogyan lehet két vonalat érintő kört rajzolni?

Válassza az <Keyword id="Ttr" /> opciót, jelölje ki az első, majd a második vonalat ott, ahol a körnek érintenie kell őket, és írja be a sugarat.

### Hogyan lehet három objektumot érintő kört rajzolni?

Válassza a <Keyword id="3P" /> opciót, és mindhárom pont előtt írja be az `ÉRI` vagy a `_TAN` tárgyrasztert, mindegyik objektumot ott kijelölve, ahol a körnek érintenie kell.

### Hogyan lehet átmérővel kört rajzolni?

Adja meg a középpontot, majd válassza az <Keyword id="Diameter" /> opciót, és írja be az átmérőt. Vagy válassza a <Keyword id="2P" /> opciót, és adja meg az átmérő két végpontját.
