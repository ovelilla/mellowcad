---
title: "Méretezés az AutoCAD-ben: illesztett méret, MÉRETILLESZT (DIMALIGNED) parancs"
metaTitle: "Méretezés: illesztett méret, MÉRETILLESZT"
description: "Ferde él méretezése az AutoCAD-ben a MÉRETILLESZT (DIMALIGNED, MIL) paranccsal: két kezdőpont vagy egy objektum, majd egy velük párhuzamos méretvonal."
figure: "Egy háromszög ferde oldala a hossza mentén méretezve: a két végpontja, majd a méretvonal helye."
sourceHash: "243f7657ed7d"
---

A MÉRETILLESZT (DIMALIGNED) parancs két pont valódi távolságát méri: a méretvonala a rajtuk átmenő egyenessel párhuzamos, bármilyen szögben, míg a <Command id="DIMLINEAR" /> parancs csak X vagy Y irányban mér. A promptjai a <Command id="DIMLINEAR" /> parancséi: az első és a második segédvonal kezdőpontja, vagy az Enter és egy vonal, ív vagy vonalláncszakasz kijelölése a két végpontjáért, majd a méretvonal helye, bármelyik oldalon. A kijelölt kör a kijelölési ponton átmenő átmérőjét adja. A parancssor kiírja a mért értéket, és a parancs befejeződik.

## Options

### Text

Bekéri a mért érték helyett kiírandó szöveget, alapértelmezésként a mért értéket kínálva fel: az Enter megtartja. A beírt szövegben a `<>` a mért értéket jelenti.

### Angle

Bekéri a szöveg szögét, és a szöveg a méretvonal mentén helyett ebben a szögben rajzolódik. A 0 visszaállítja a vonal mentén.

## Missing

A Bszöveg: a méret szövege egysoros, a parancssorban a <Keyword id="Text" /> opcióval állítható be, sosem a szövegszerkesztőben. A <Keyword id="Angle" /> opcióval megadott szögnél az AutoCAD a méretvonalra középre teszi a szöveget; itt fölötte marad, ahogy szög nélkül. A méret nem asszociatív: nem követi a mért objektumot.

## Questions

### Mi az AutoCAD MÉRETILLESZT parancs angolul, és mi a rövidítése?

Angolul DIMALIGNED, a magyar AutoCAD-ben MÉRETILLESZT: írja be az `MIL` vagy az `MILL` rövidítést, majd nyomja meg az Enter vagy a Szóköz billentyűt. Az angol `DAL` és `DIMALI` a magyar AutoCAD-ben nem működik; a `_DIMALIGNED` az AutoCAD bármely nyelvén igen.

### Mi a különbség a MÉRETHOSSZ és a MÉRETILLESZT parancs között?

Ferde élen a <Command id="DIMLINEAR" /> parancs a szélességét vagy a magasságát adja, mert a méretvonala vízszintes vagy függőleges; a MÉRETILLESZT a hosszát, az éllel párhuzamos vonallal. X vagy Y irányú élen mindkettő ugyanazt a számot adja.

### Hogyan lehet ferde vonalat méretezni az AutoCAD-ben?

A MÉRETILLESZT paranccsal: az első promptnál nyomja meg az Enter billentyűt, válassza ki a vonalat, és helyezze el a méretet a kívánt oldalon. Vagy jelölje ki a két végpontját Végpont tárgyraszterrel, hogy a kezdőpontok pontosak legyenek.

### Hogyan lehet saját szöveget írni egy méretre?

Elhelyezés előtt válassza a <Keyword id="Text" /> opciót, és írja be a szöveget: a `<>` a mért értéket jelenti, így a `<> mm` a mért értéket és utána a mértékegységét írja ki, az üres Enter pedig csak a mért értéket tartja meg. Elhelyezés után a Tulajdonságok paletta Szöveg felülírása sora módosítja.
