---
title: "Méretezés az AutoCAD-ben: szögméret, MÉRETSZÖG (DIMANGULAR) parancs"
metaTitle: "Méretezés az AutoCAD-ben: szögméret, MÉRETSZÖG"
description: "Szög méretezése az AutoCAD-ben a MÉRETSZÖG (DIMANGULAR, MSZ) paranccsal: két vonal, egy ív, egy kör vagy három pont, majd a méretív helye. Próbálja ki ingyen."
figure: "Két vonal, amelyek 30 fokban találkoznak: mindkét vonal kijelölve, majd a méretív elhelyezve közöttük."
sourceHash: "30943abd60f6"
---

A MÉRETSZÖG (DIMANGULAR) parancs egy szöget méretez, méretvonalként egy ívvel. Ahogy az AutoCAD-ben, az első kijelölés dönti el a folytatást: egy vonal után egy második vonalat kér – egy vonallánc két szakasza is megfelel –; az ívet végponttól végpontig, a középpontja körül méri; a kört a kijelölési ponttól egy megadandó második pontig; az Enter pedig ehelyett a szög csúcspontját, majd a két szárvégpontját kéri. Ezután helyezze el az ívet: a helye dönti el, melyik szöget méri. Két vonal között a négy szögtartományuk közül azt, amelyikben elhelyezi; egyébként a szöget, vagy a szárain túl a 180°-nál nagyobb konkáv szöget. A parancssor fokban kiírja a mért értéket, és a parancs befejeződik.

## Options

### Text

Bekéri a mért érték helyett kiírandó szöveget, alapértelmezésként a mért értéket kínálva fel: az Enter megtartja. A beírt szövegben a `<>` a mért értéket jelenti.

### Angle

Bekéri a szöveg szögét, és a szöveg ezután nem a méretív mentén, hanem ebben a szögben rajzolódik. A 0 ismét az ív mentére állítja.

## Missing

A Bszöveg opció: a méret szövege egysoros, a parancssorban a <Keyword id="Text" /> opcióval állítható be. A Síknegyed opció, amely a méretet egy szögtartományhoz rögzíti, hogy a szövege azon kívülre kerülhessen. A tizedes foktól eltérő szögegységek (DIMAUNIT). Szögméretet nem lehet láncolni vagy elrendezni: a <Command id="DIMCONTINUE" />, a <Command id="DIMBASELINE" /> és a <Command id="DIMSPACE" /> parancs csak hossz- és illesztett méretet fogad el. Blokkreferencián belüli vonal vagy ív nem jelölhető ki. Két vonal között a méret azokat a pontokat őrzi meg, ahol az íve metszette őket, nem a vonalakat: ha később elmozdítja, az íve onnan húzza a segédvonalait, míg az AutoCAD újra a vonalakhoz méri. A méret nem asszociatív: nem követi a mért objektumokat.

## Questions

### Mi az AutoCAD MÉRETSZÖG parancs angolul, és mi a rövidítése?

Angolul DIMANGULAR, a magyar AutoCAD-ben MÉRETSZÖG: írja be az `MSZ` vagy az `MSZOG` rövidítést, majd nyomja meg az Enter vagy a Szóköz billentyűt. Az angol `DAN` és `DIMANG` a magyar AutoCAD-ben nem működik; a `_DIMANGULAR` az AutoCAD bármely nyelvén igen.

### Hogyan lehet 180 foknál nagyobb szöget méretezni?

Az első promptnál nyomja meg az Enter billentyűt, adja meg a csúcspontot és a két szárvégpontot, majd az ívet a közöttük lévő szögön kívül helyezze el: a konkáv szöget méri, vagyis 360°-ból levonva a másikat. Ív és kör esetén ugyanígy működik. Két vonal között a szög mindig 180°-nál kisebb.

### Hogyan lehet egy ív szögét méretezni?

Az első promptnál jelölje ki az ívet: a középpontja a csúcspont, a végpontjai a segédvonalak kezdőpontjai, így a következő kérdés már a méret helye.

### Miért írja a MÉRETSZÖG, hogy a vonalak párhuzamosak?

Két párhuzamos vonal, vagy kétszer kijelölt ugyanaz a vonal, nem zár be szöget: <Message id="dimLinesParallel" />, és a parancs befejeződik.

### Hogyan lehet módosítani egy szögméret tizedesjegyeit?

A méretstílusban: a <Command id="DIMSTYLE" /> (`D`) a Stílusok palettán nyitja meg, ahol az Elsődleges mértékegységek csoport Szögpontosság értéke állítja be, ISO-25-ben 0. Az adott stílusú összes szögméret követi.
