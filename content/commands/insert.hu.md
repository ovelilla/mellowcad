---
title: "Blokk beillesztése az AutoCAD-ben: BEILL (INSERT) parancs"
metaTitle: "Blokk beillesztése az AutoCAD-ben: BEILL parancs"
description: "Blokk beillesztése az AutoCAD BEILL (INSERT, BE) parancsával: a Blokkok paletta, vagy a -BEILL a parancssorban léptékkel, forgatással és attribútumokkal."
figure: "Blokká alakított szék, majd kétszer beillesztve egy asztalhoz: a pont után 180 fokkal elforgatva, majd előtte a Forgat opcióval 90 fokkal."
sourceHash: "ea41fdd8000f"
---

A BEILL (INSERT) parancs a rajzban definiált blokkot referenciaként helyezi el: egy újabb példányként, saját beszúrási ponttal, léptékkel és elforgatással, amelyet az egyetlen, a <Command id="BLOCK" /> paranccsal készült definíció alapján rajzol meg. Ahogy az AutoCAD 2027 BEILL parancsa, megnyitja a Blokkok palettát, amely a rajz blokkjait mutatja; kattintson az egyikre, és a parancssor kéri a beszúrási pontját – a blokk közben a kurzor alatt mozog –; a léptéket és az elforgatást a paletta Beállításai adják, ahol az is beállítható, hogy a parancs rákérdezzen. A paletta nyitva marad, így egyik blokk a másik után egy-egy kattintás.

A <Command id="-INSERT" /> parancs mindent a parancssorban kérdez: a blokk nevét (az Enter a felkínáltat választja: az utoljára beillesztett blokkot, vagy ha ilyen nincs, az utoljára definiáltat), a beszúrási pontot, majd az X léptéktényezőt, az Y léptéktényezőt (az Enter az X-ét veszi át) és az elforgatási szöget. A negatív tényező tükrözi a blokkot, az eltérő tényezők pedig megnyújtják: a benne lévő kör ellipszisként jelenik meg. Az attribútumokat tartalmazó blokk ezután minden értéket a promptja szerint kér, az alapértékét felkínálva. A blokk 0 fólián lévő objektumai a referencia fóliáját veszik át, a többiek megtartják a sajátjukat. Minden beillesztés egyetlen lépés, amely a Vissza paranccsal visszavonható.

## Options

### ?

A blokk nevénél: felsorolja a rajz blokkjait, ahogy a <Command id="BLOCK" /> parancs, és véget ér.

### Scale

A beszúrási pontnál: egyetlen tényezőt kér mindkét tengelyre, majd újra a pontot kéri, a blokkot ebben a méretben mozgatva. A pont után az X és az Y tényezőt már nem kérdezi.

### Rotate

A beszúrási pontnál: a szöget kéri, beírva vagy két pont között, majd újra a pontot kéri, a blokkot elforgatva mozgatva. A pont után az elforgatást már nem kérdezi.

## Missing

Másik rajzfájl beillesztése: csak a rajzban definiált blokkok illeszthetők be, és az olyan nevet, amely nincs a rajzban, a parancs elutasítja. A beszúrási pontnál a Bázispont, az X, az Y, a Z, a Szétvet és az Ismét opció; az X léptéknél a Sarok és az XYZ, valamint az ellenkező sarokpont kijelölése. Eltérő X és Y tényező mellett a szöveg vagy az attribútum az X méretében jelenik meg, nem megnyújtva, a vonallánc íve pedig ív marad; a negatív X nem fordítja meg a szöveget. Az ATTDIA 1, vagyis az Attribútumok módosítása párbeszédpanel beillesztéskor, és az ATTREQ 0. A Tulajdonságok paletta Feliratozási, Blokk mértékegysége és Mértékegység-tényező sora. A Blokk szerint: a blokkon belüli objektum nem veheti át a referencia saját színét, vonaltípusát vagy vonalvastagságát, ahogy az AutoCAD-ben a Blokk szerint rajzolt objektum.

## Questions

### Mi az AutoCAD BEILL parancs angolul?

INSERT. A magyar AutoCAD-ben a rövidítése `BE`: írja be, majd nyomja meg az Enter vagy a Szóköz billentyűt, és megnyílik a Blokkok paletta, ahogy az AutoCAD 2027-ben. A `-BE` a <Command id="-INSERT" /> parancs, amely a parancssorban kérdez. Az angol `I` a magyar változatban az ÍV parancsot indítja; az `_INSERT` az AutoCAD bármely nyelvi változatában működik.

### Hogyan lehet blokkot beilleszteni a parancssorból?

Írja be a `-BE` parancsot és a blokk nevét, majd adja meg a beszúrási pontot, és válaszoljon a léptékre és az elforgatásra; az Enter mindegyiknél megtartja az alapértelmezést. A névnél a <Keyword id="?" /> felsorolja a meglévő blokkokat.

### Hogyan lehet blokkot más léptékben beilleszteni?

A beszúrási pont után írja be az X léptéktényezőt, és az Y tényezőnél nyomja meg az Enter billentyűt, hogy egyenlők maradjanak; vagy a pont előtt válassza a <Keyword id="Scale" /> opciót, és írjon be egy tényezőt mindkettőre. A negatív tényező tükrözi a blokkot. A Blokkok palettán írja be a Beállítások X és Y mezőjébe, vagy jelölje be a Léptéket, hogy a pont után rákérdezzen.

### Hogyan lehet blokkot beilleszteni egy másik rajzból?

A fájljából nem: a BEILL parancs csak a rajzban definiált blokkokat helyezi el. Ehelyett másolja ki egy referenciáját (Ctrl+C), nyissa meg azt a rajzot, ahová szánja, és illessze be (Ctrl+V): a blokkja vele együtt érkezik, hacsak abban a rajzban nincs már ilyen nevű blokk, amelynek a definíciója megmarad.
