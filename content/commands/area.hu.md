---
title: "Terület számítása az AutoCAD-ben: TERÜLET (AREA) parancs"
metaTitle: "Terület az AutoCAD-ben: TERÜLET (AREA) parancs"
description: "Terület számítása az AutoCAD-ben a TERÜLET (AREA, TER) paranccsal: pontokból vagy objektumból terület és kerület, összegzés hozzáadott és kivont területekkel."
figure: "Egy 100 × 60-as lemez 18-as sugarú furattal: a TERÜLET hozzáadja a lemez területét, kivonja a furatét, és kiírja a maradék összeget."
sourceHash: "a8ad70c08b3a"
---

A TERÜLET (AREA) parancs egy zárt alakzat területét és kerületét méri: vagy olyanét, amelyet a sarkaival rajzol körül, vagy egy kiválasztott objektumét. Adja meg az első sarkot, majd a többit: a másodiktól kezdve a kurzoron át lezárt alakzat áttetsző zöld kitöltést kap, ahogy az AutoCAD árnyalja. Az Enter vagy a <Keyword id="Total" /> kiírja a parancssorba a `Terület = …, Kerület = …` sort, és befejezi a parancsot; a harmadik sarok előtt az Enter billentyűt elutasítja. A „területet Hozzáad” és a „területet kiVon” opcióval több alakzaton át vezet futó összeget. A számokat a rajz pontosságával írja ki, és az utoljára mért terület a `'TERÜLET` beírásával újra kiolvasható.

## Options

### Object

Az első prompt alapértelmezése, így az Enter ezt választja: válasszon ki egy kört, ellipszist, zárt vonalláncot vagy spline-t, sraffozást vagy lemezt, és a TERÜLET kiírja a területét a kerületével. A nyitott vonalláncot, spline-t vagy elliptikus ívet egy végponttól végpontig húzott egyenes zárja le, és a TERÜLET a hosszát írja ki. Egy vonalnak vagy szövegnek nincs területe: <Message id="objectHasNoArea" />, és újra kérdez.

### Add

Futó összeget indít: minden utána mért területet – sarkokkal vagy az <Keyword id="Object" /> opcióval – hozzáad, és a TERÜLET kiírja azt és az összeget. Az Enter lezárja az objektumokat vagy a sarkokat, és ismét kérdez, amíg az első promptnál adott Enter be nem fejezi a parancsot.

### Subtract

Ugyanez, de minden területet levon az összegből: a lemezt, majd a furatait.

### Undo

Visszavonja az utoljára megadott sarkot.

### Total

Kiírja a megadott sarkok területét és kerületét, és befejezi a parancsot.

## Missing

A GEOMMÉR, a szalag Mérés eszközei, a Sugár, Szög, Térfogat és Gyors opcióval: itt a szalag Távolság és Terület gombja a TÁVS és a TERÜLET parancsot futtatja. Az Ív és a Hossz opció a TERÜLET következő pontjánál. Az aktuális FKR síkján kívüli sarkokat felülnézetben méri, ahol az AutoCAD 3D-ben méri, és az FKR-rel szöget bezáró objektumra nem írja ki az AutoCAD `Az objektum nem párhuzamos az FKR-rel.` üzenetét.

## Questions

### Mi az AutoCAD TERÜLET parancs angolul, és mi a rövidítése?

Angolul AREA, a magyar AutoCAD-ben TERÜLET: írja be a `TER` rövidítést, majd nyomja meg az Enter vagy a Szóköz billentyűt. Az angol `AA` a magyar AutoCAD-ben nem működik; az `_AREA` az AutoCAD bármely nyelvén igen.

### Hogyan lehet megtudni egy vonallánc vagy egy sraffozás területét?

Indítsa el a TERÜLET parancsot, nyomja meg az Enter billentyűt az <Keyword id="Object" /> opció kiválasztásához, és válassza ki a zárt vonalláncot vagy a sraffozást: a területe és a kerülete megjelenik a parancssorban. A sraffozás területébe a szigetei nem számítanak bele.

### Hogyan lehet területet kivonni az AutoCAD-ben?

Válassza a <Keyword id="Add" />, majd az <Keyword id="Object" /> opciót, válassza ki a külső alakzatot, és nyomja meg az Enter billentyűt; ezután válassza a <Keyword id="Subtract" />, majd az <Keyword id="Object" /> opciót, és válassza ki egyenként a furatokat. A TERÜLET mindegyik után kiírja a megmaradt összeget; két Enter befejezi a parancsot.

### Hogyan lehet a területet négyzetméterben megkapni?

A TERÜLET négyzetes rajzi egységben írja ki. Ha milliméterben rajzol, ossza el 1 000 000-val: a 6 000 000 éppen 6 m². Centiméternél 10 000-rel.

### Miért írja a TERÜLET, hogy az objektumnak nincs területe?

Csak a zárt alakzatoknak és görbéknek van területük: a vonalaknak, a magukban álló íveknek, a szövegeknek és a méreteknek nincs. Válasszon zárt vonalláncot, kört vagy sraffozást, vagy előbb fűzze a vonalakat vonallánccá az <Command id="JOIN" /> paranccsal; vagy rajzolja körül az alakzatot a sarkaival.
