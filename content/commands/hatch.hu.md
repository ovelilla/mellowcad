---
title: "Sraffozás az AutoCAD-ben: SRAFFOZ (HATCH) parancs"
metaTitle: "Sraffozás az AutoCAD-ben: SRAFFOZ (HATCH)"
description: "Sraffozás az AutoCAD SRAFFOZ (HATCH, SF) parancsával: belső pont vagy határoló objektumok, minta, lépték, szög, szigetek. Próbálja ki ingyen, online."
figure: "Egy téglalap benne egy körrel, egyetlen belső pontból ANSI31 mintával sraffozva: a kör üresen marad, sziget lesz."
sourceHash: "c7c3effeb1c0"
---

A SRAFFOZ (HATCH) parancs zárt területet tölt ki vonalakból álló mintával vagy tömören. Válasszon egy pontot a területen belül, és a parancs megkeresi a határvonalat a körülötte lévő objektumokban, szigetként üresen hagyva, ami benne van – egy kört a téglalapban, egy szöveget –; vagy jelölje ki a területet határoló objektumokat. Tetszőleges számú területet választhat: az Enter vagy az Esc mindegyikből egyetlen sraffozást készít, az aktuális fólián, a határvonala mögött. A teljes parancs egyetlen lépés, amely a Vissza paranccsal visszavonható.

Futás közben a szalag a Sraffozás létrehozása szalaglapot mutatja, ahogy az AutoCAD-é: Pontok kijelölése és Kijelöl, a mintagaléria, Sraffozás típusa (Szilárdtest vagy Mintázat), Szög, Sraffozási minta léptéke és Sraffozás-létrehozás bezárása. Bezárt szalag mellett az AutoCAD a Sraffozás és átmenet párbeszédpanelt nyitja meg, amely a MellowCAD-ben nincs meg: ilyenkor a SRAFFOZ a parancssorban azt kérdezi, amit a <Command id="-HATCH" /> parancs, a mintát a <Keyword id="Properties" /> opció alatt. Az Esc megtartja a sraffozást, a <Command id="-HATCH" /> parancsban viszont elveti a területeket. Minden sraffozás azzal a mintával, léptékkel és szöggel indul, amelyet az előző kapott: új rajzban ez az ANGLE, 1-es léptékkel és 0 szöggel.

## Options

### Properties

Bezárt szalag mellett a parancssorban kérdez rá, vagy a <Command id="-HATCH" /> parancsban; nyitott szalag mellett ugyanezt a hármat a szalaglap állítja be. A minta nevét kéri, kis- és nagybetűtől függetlenül, és az aktuálisat kínálja fel: a <Keyword id="Solid" /> kitölti a területet, a <Keyword id="?" /> pedig felsorolja a mintákat a leírásukkal, majd visszatér a ponthoz. Minta esetén ezután a léptéket kéri – 0-nál nagyobb számot, vagy két pont távolságát –, majd a szöget, beírva vagy két ponttal. A következő sraffozás mindhármat megtartja.

<Session name="hatchPatterns" caption="A SOLID és az acadiso.pat tizenegy mintája, mindegyik egy 30 oldalhosszúságú négyzetben sraffozva 1-es léptékkel, az AR-CONC és az AR-SAND 0,08-as és 0,1-es léptékkel." />

### Select objects

Belső pont helyett jelölje ki a területet határoló objektumokat; nyitott szalag mellett minden kijelölés után újra kérdez, a <Keyword id="Pick internal point" /> visszatér a ponthoz, az Enter pedig befejezi a parancsot, bezárt szalag mellett az Enter visszatér a ponthoz. Az az objektum, amely nem zár körül területet, kimarad; ha egyik sem határol területet, az Enter a <Message id="unableToHatchBoundary" /> üzenetet adja, és nem készít semmit. A lemez a körvonalát adja, a lyukait szigetként.

### Undo

A szalag promptja felsorolja, a <Command id="-HATCH" /> promptja nem sorolja fel, de elfogadja: visszavonja az utoljára kiválasztott pont területeit, és újra kérdez, a kijelölt objektumokat meghagyva; objektumok kijelölése közben az utolsó kijelölést vonja vissza. Ha már nincs visszavonható pont, a válasza <Message id="noBoundaryToUndo" />.

## Missing

Ellipszisek és spline-ok mint határvonalak: az általuk közrezárt terület nem található meg, és az ilyen élű lemez kimarad. Hézagtűrés (HPGAPTOL): a területnek pontosan zártnak kell lennie. Asszociatív sraffozások, a Normál és a Belső (Ignore) szigetstílus. Színátmenetek, felhasználói minták és az acadiso.pat többi mintája itt nem hozható létre: csak egy DXF sraffozásai hozzák magukkal őket, a színátmeneteket a színeikkel, a mintákat a vonalaikkal. A -SRAFFOZ többi opciója: határvonal rajzolása, határvonalak eltávolítása, További beállítások, megjelenítési sorrend, kezdőpont, feliratozási, szín, fólia és átlátszóság; a szalag promptjának Rajzolás és Beállítások opciója. A Sraffozás létrehozása szalaglapról a Kivon és a Létrehozás újra, az Átmenet és a Felhasználói típus, a színek, az átlátszóság, a kezdőpont és a beállítások. A SRAFFEDIT (HATCHEDIT) parancs és a Sraffozásszerkesztő, amelyet az AutoCAD-ben dupla kattintás nyit meg. A MIRRHATCH 1: a tükrözött sraffozás mindig megtartja a minta szögét. A sraffozás fogóinak menüi.

## Questions

### Mi az AutoCAD SRAFFOZ parancs angolul?

HATCH. A magyar AutoCAD-ben a rövidítése `SF` vagy `SR`: írja be, majd nyomja meg az Enter vagy a Szóköz billentyűt. Megnyitja a Sraffozás létrehozása szalaglapot; a `-SF` (<Command id="-HATCH" />) mindent a parancssorban kérdez. Az angol `H` a magyar változatban a HÁLÓÉL parancsot indítja; a `_HATCH` az AutoCAD bármely nyelvi változatában működik.

### Miért nem működik a sraffozás?

Többnyire azért, mert a terület nem zárt: a válasz <Message id="hatchNoBoundary" />, és ehhez a legkisebb rés is elég, mert semmi sem hidalja át. Zárja le a körvonalat, és válasszon újra. Az ellipszis vagy spline által lezárt területet a parancs még nem találja meg, a kikapcsolt fólián lévő objektumokat pedig nem látja.

### Milyen sraffozási minták vannak, és lehet-e továbbiakat letölteni?

Az acadiso.pat, az AutoCAD metrikus mintafájljának egy válogatása: SOLID, ANGLE, ANSI31–ANSI38, AR-CONC, AR-SAND, BRICK, CROSS, DASH, DOTS, EARTH, HONEY, LINE, NET, NET3, SQUARE, STEEL és ZIGZAG. A Sraffozás létrehozása szalaglap megmutatja őket; a <Keyword id="Properties" /> opció alatti <Keyword id="?" /> felsorolja őket. Saját vagy letöltött mintafájl még nem tölthető be, de a DXF-ek sraffozásai azzal a mintával nyílnak meg, amelyet tartalmaznak, bármi legyen is az, ahogy az AutoCAD rajzolja őket.

### Hogyan lehet módosítani a sraffozás léptékét?

Kiválasztás közben a Sraffozás létrehozása szalaglap Sraffozási minta léptéke mezőjében, vagy a <Command id="-HATCH" /> parancsban a <Keyword id="Properties" /> opció alatt, a minta neve után. Elkészülte után jelölje ki a sraffozást, és írja át a Lépték értékét a Tulajdonságok palettán, vagy adja át neki egy másik sraffozás mintáját, léptékét és szögét a <Command id="MATCHPROP" /> paranccsal. Ha a lépték olyan kicsi, hogy a mintához túl sok vonal kellene, a válasz <Message id="hatchTooDense" />, és nem készül sraffozás.

### Hogyan lehet megtudni egy sraffozás területét?

Jelölje ki, és olvassa le a Tulajdonságok paletta Geometria csoportjában a Terület értékét, a szigetek nélkül; több kijelölt sraffozásnál a Halmozott terület adja össze őket. Vagy indítsa el a <Command id="AREA" /> parancsot, válassza az <Keyword command="AREA" id="Object" /> opciót, és válassza ki a sraffozást.
