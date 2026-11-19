---
title: "Láncméretezés az AutoCAD-ben: MÉRETFOLYTAT (DIMCONTINUE) parancs"
metaTitle: "Láncméretezés az AutoCAD-ben: MÉRETFOLYTAT"
description: "Láncméretezés az AutoCAD MÉRETFOLYTAT (DIMCONTINUE, MFO) parancsával: az utolsó mérettől, következő kezdőpontok, Kijelöl és Vissza. Próbálja ki ingyen, online."
figure: "Lépcsős profil 30-as méretezéssel, majd ugyanazon a vonalon folytatva 40-nel és 30-cal: két kezdőpont, aztán kétszer Enter."
sourceHash: "11fa474694fd"
---

A MÉRETFOLYTAT (DIMCONTINUE) parancs egymáshoz csatlakozó méretek láncát rajzolja: mindegyik az előző második segédvonalánál kezdődik, és a következő megadott pontig mér, ugyanazon a méretvonalon. A rajz megnyitása óta utoljára létrehozott hossz- vagy illesztett méretet folytatja, ezért általában a <Command id="DIMLINEAR" /> vagy a <Command id="DIMALIGNED" /> parancs után következik; ha nincs ilyen, megkérdezi, melyik méretet folytassa. A parancssor minden mért értéket kiír, amint a méret elkészül. A kezdőpontot kérő promptnál az Enter a <Keyword id="Select" /> opciót választja, a méretet kérő promptnál pedig az Enter befejezi a parancsot, ahogy az Esc is.

Ahogy az AutoCAD-ben, minden új méret a bázisméret irányában mér, és átveszi annak méretstílusát és fóliáját, az aktuális színnel, vonaltípussal és vonalvastagsággal.

## Options

### Select

Megkérdezi, melyik méretet folytassa: válasszon ki egy hossz- vagy illesztett méretet annak a segédvonalnak a közelében, ahonnan a lánc folytatódjon. Az itt beírt pont is kiválaszt. Sugár- vagy átmérőméretet a parancs a <Message id="associativeDimensionRequired" /> üzenettel elutasít, és újra kérdez.

### Undo

Visszavonja a lánc utolsó méretét, és az előzőtől folytatja, ahányszor csak van mit visszavonni. Ha már egy sem maradt, a válasza <Message id="commandCompletelyUndone" />, és a prompt megmarad.

## Missing

A méret nem asszociatív: a lánc nem követi a mért objektumokat. Szögméretet nem lehet folytatni: az AutoCAD az utoljára létrehozottat és a kiválasztottat is folytatja; itt az utoljára létrehozott szögméret után a parancs méretet kér, a kiválasztottat pedig ugyanúgy elutasítja, mint a sugárméretet. Koordinátaméretek még nincsenek.

## Questions

### Mi az AutoCAD MÉRETFOLYTAT parancs angolul?

DIMCONTINUE. A magyar AutoCAD-ben a rövidítése `MFO` vagy `MFOLY`: írja be, majd nyomja meg az Enter vagy a Szóköz billentyűt. A teljes név is működik, az AutoCAD bármely nyelvi változatában pedig a `_DIMCONTINUE` is; az angol `DCO` a magyar változatban nem működik.

### Mi a különbség a MÉRETFOLYTAT és a MÉRETBVONAL parancs között?

A MÉRETFOLYTAT parancs egy vonalon, egymás után helyezi el a méreteket, mindegyiket onnan, ahol az előző véget ért. A <Command id="DIMBASELINE" /> parancs mindet ugyanattól a segédvonaltól méri, mindegyiket egy kijjebb eső vonalon.

### Hogyan lehet olyan méretet folytatni, amely nem az utolsó?

Nyomja meg az Enter billentyűt az első promptnál, vagy válassza a <Keyword id="Select" /> opciót, és válassza ki a méretet annak a segédvonalnak a közelében, ahonnan folytatni szeretné: a lánc onnan nő tovább.

### Miért kér a MÉRETFOLYTAT parancs méretet?

Nincs mit folytatnia: a rajz megnyitása óta nem jött létre hossz- vagy illesztett méret, ahogy az AutoCAD-ben is egy rajz megnyitása után, vagy az utoljára létrehozott méret szögméret. Válassza ki azt a méretet, amelyet folytatni szeretne.
