---
title: "TBEILL (MINSERT) parancs az AutoCAD-ben"
metaTitle: "TBEILL (MINSERT) parancs az AutoCAD-ben"
description: "Hogyan illeszt be az AutoCAD TBEILL (MINSERT) parancsa egy blokkot sorokban és oszlopokban egyetlen objektumként, mit kérdez, és miért utasítja el a SZÉTVET."
figure: "Blokká alakított ülés, majd a TBEILL paranccsal három, ötös sorba rakva: egyetlen objektum."
sourceHash: "d43a50bbc8fe"
---

A TBEILL (angolul MINSERT) a rajzban definiált blokkot sokszor illeszti be, sorokban és oszlopokban, egyetlen objektumként. Ugyanazt kérdezi, mint a <Command id="-INSERT" /> — a blokk nevét (az Enter a felkínáltat veszi, a legutóbb beillesztett blokkot), a beszúrási pontot, az X és az Y léptéktényezőt és az elforgatási szöget —, majd a sorok és az oszlopok számát (az Enter 1), aztán a sorok közötti és az oszlopok közötti távolságot. Csak azokat a távolságokat kérdezi, amelyekre a számok miatt szükség van, és egy sor egy oszloppal közönséges blokkreferencia. Az attribútumos blokk az értékeiket a végén kérdezi, egyszer, és minden másolat megmutatja őket.

A sorok a blokk Y tengelye, az oszlopok az X tengelye mentén haladnak, mindkettő az elforgatással elforgatva; a távolságok rajzi egységben értendők, bármi a lépték, a negatív pedig lefelé vagy balra rakja a másolatokat. A sorok közötti távolságnál két pont egy egységcellát ad meg helyette: szélessége az oszlopok közötti, magassága a sorok közötti távolság. Az eredmény az AutoCAD TBeill blokkja: egyben mozog, másolódik, fordul, léptékeződik és tükröződik, a <Command id="LIST" /> hozzáírja a sorait és oszlopait, a Tulajdonságok paletta pedig Oszlopok, Oszlopok közötti távolság, Sorok és Sorok közötti távolság néven mutatja őket, beírhatóan. A <Command id="EXPLODE" /> tbeill paranccsal beszúrtként számolja, és egészben hagyja, mint az AutoCAD. A DXF-fájl úgy nyitja meg és menti, mint maga az AutoCAD.

## Options

### ?

A blokk nevénél: kilistázza a rajz blokkjait, mint a <Command id="BLOCK" />, és befejeződik.

### Scale

A beszúrási pontnál: egyetlen tényezőt kér mindkét tengelyre, majd újra a pontot. A pont után az X és Y tényezőt nem kérdezi.

### Rotate

A beszúrási pontnál: a szöget kéri, amely minden másolatot és az egész kiosztást elforgatja, majd újra a pontot. A pont után az elforgatást nem kérdezi.

## Missing

A beszúrási pontnál a Bázispont, X, Y és Z, az X léptéknél a Sarok és az XYZ, ahogy a -BEILL-nél is hiányoznak; a rajzfájlt megnyitó `~`; a feliratozási blokkok, amelyek itt nincsenek. A lineáris méret az egész TBEILL objektumot választja ki, nem egy objektumot valamelyik másolatából. A Tulajdonságok paletta Feliratozási, Blokk-egység és Egységtényező sorai.

## Questions

### Mi a TBEILL parancs az AutoCAD-ben?

Többszörös beillesztés: egy blokkot sorokból és oszlopokból álló téglalap alakú kiosztásba rak, egyetlen objektumként. A számokat és a távolságokat később a Tulajdonságok palettán módosíthatja.

### Hogyan lehet szétvetni egy TBEILL paranccsal beillesztett blokkot?

Sehogy: a <Command id="EXPLODE" /> azt feleli, hogy a tbeill paranccsal volt beszúrva, és meghagyja, az AutoCAD-ben ugyanúgy, mint itt, akkor is, ha a sorok és oszlopok száma 1. Illessze be a blokkot újra a <Command id="-INSERT" /> paranccsal, vagy rakja ki a másolatokat a <Command id="ARRAYRECT" /> paranccsal, amelynek kiosztása elemeire vethető szét.

### Hogy hívják a MINSERT parancsot a magyar AutoCAD-ben?

TBEILL. Nincs rövidítése és gombja a szalagon, ezért teljes egészében kell beírni; a `_MINSERT` az AutoCAD bármely nyelvén működik.

### Mi a különbség a TBEILL és a KIOSZT között?

A TBEILL egy blokkot ismétel egyetlen, szét nem vethető referenciaként. A <Command id="ARRAYRECT" /> bármilyen objektumot ismétel asszociatív kiosztásként, a számok és távolságok fogóival, és a <Command id="EXPLODE" /> szétveti.
