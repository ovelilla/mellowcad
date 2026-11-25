---
title: "Bázisvonalas méretezés az AutoCAD-ben: MÉRETBVONAL (DIMBASELINE) parancs"
metaTitle: "Bázisvonalas méretezés: MÉRETBVONAL parancs"
description: "Méretezés egy bázisvonalról az AutoCAD-ben a MÉRETBVONAL (DIMBASELINE, MBA) paranccsal: a következő kezdőpontok, a távolság, a Kijelöl és a Vissza. Próbálja ki."
figure: "Egy lépcsős profil 30-as mérete a bal élétől, majd 70 és 100 ugyanattól az éltől, mindegyik egy vonallal kijjebb."
sourceHash: "619fc0d438e9"
---

A MÉRETBVONAL (DIMBASELINE) parancs olyan méreteket rajzol, amelyek mind ugyanattól a segédvonaltól, a bázistól mérnek: mindegyik az utolsó méret első segédvonalától a következő megadott pontig tart, a méretvonala egy lépéssel kijjebb. Az utolsó hossz- vagy illesztett méretből indul, amely a rajz megnyitása óta készült, így többnyire a <Command id="DIMLINEAR" /> vagy a <Command id="DIMALIGNED" /> parancsot követi; ha nincs ilyen, megkérdezi, melyikből induljon. A parancssor minden mért értéket kiír, ahogy elkészül. A kezdőpont promptjánál az Enter a <Keyword id="Select" /> opciót választja, a Kijelöl promptjánál pedig az Enter befejezi a parancsot, ahogy az Esc.

A lépés az aktuális méretstílusban beállított Méretvonalak távolsága, ISO-25-ben 3,75, szorozva a bázis teljes léptékével. Ahogy az AutoCAD-ben, minden új méret a bázisa irányában mér, és átveszi a bázis méretstílusát és fóliáját, az aktuális színnel, vonaltípussal és vonalvastagsággal.

## Options

### Select

Bekéri a bázisméretet: jelöljön ki egy hossz- vagy illesztett méretet annak a segédvonalnak a közelében, amelytől mérni kell. Egy oda beírt pont is kijelöl. A sugár- vagy átmérőméretet elutasítja: <Message id="associativeDimensionRequired" />, és újra kérdez.

### Undo

Visszavonja az utoljára készült méretet, és az előzőtől folytatja, ahányszor csak van mit. Ha már egy sem maradt, a válasza <Message id="commandCompletelyUndone" />, és a prompt marad.

## Missing

A méret nem asszociatív: a méretek nem követik a mért objektumokat. Szögméret nem lehet bázis: az AutoCAD elfogadja az utoljára készültet vagy a kijelöltet; itt az utoljára készült után a parancs méretet kér, a kijelöltet pedig elutasítja, ahogy egy sugárméretet. Koordinátaméretek még nincsenek.

## Questions

### Mi az AutoCAD MÉRETBVONAL parancs angolul, és mi a rövidítése?

Angolul DIMBASELINE, a magyar AutoCAD-ben MÉRETBVONAL: írja be az `MBA` vagy az `MBAZIS` rövidítést, majd nyomja meg az Enter vagy a Szóköz billentyűt. Az angol `DBA` a magyar AutoCAD-ben nem működik; a `_DIMBASELINE` az AutoCAD bármely nyelvén igen.

### Hogyan lehet módosítani a bázisvonalas méretek távolságát?

A méretstílus Méretvonalak távolsága beállítása adja meg: a <Command id="DIMSTYLE" /> (`D`) megnyitja a Méretstílus-kezelőt, ahol a Vonalak lapon található, ahogy az AutoCAD-ben. A már megrajzolt méretek a helyükön maradnak; a <Command id="DIMSPACE" /> parancs újra, egyenletesen elrendezi őket.

### Hogyan lehet egy másik méretből indulni?

Az első promptnál nyomja meg az Enter billentyűt, vagy válassza a <Keyword id="Select" /> opciót, és jelölje ki a méretet annak a segédvonalnak a közelében, amelytől mérni kell: minden új méret onnan indul.

### Mi a különbség a MÉRETBVONAL és a MÉRETFOLYTAT parancs között?

A MÉRETBVONAL minden méretet ugyanattól a segédvonaltól mér, mindegyiket egy kijjebb lévő vonalon. A <Command id="DIMCONTINUE" /> parancs egy vonalon, egymás után rakja őket, mindegyiket ott kezdve, ahol az előző véget ért.
