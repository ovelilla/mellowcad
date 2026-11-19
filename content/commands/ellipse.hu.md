---
title: "AutoCAD ELLIPSZ (ELLIPSE) parancs"
metaTitle: "Ellipszis az AutoCAD-ben: ELLIPSZ (ELLIPSE)"
description: "Ellipszis rajzolása az AutoCAD ELLIPSZ (ELLIPSE, ELL) parancsával: tengely és másik féltengely, középpontból, elforgatással, elliptikus ív. Próbálja ki ingyen."
figure: "Egy ellipszis a tengely két végpontjával, egy a középpontjából, és egy fél elliptikus ív 0-tól 180 fokig."
sourceHash: "2ee0d1b3a8a4"
---

Az ELLIPSZ (ELLIPSE) parancs az egyik tengely két végpontjából, majd a középpontjától a másik tengely végpontjáig mért távolságból rajzol ellipszist: ez a másik tengely hosszának fele. Bármelyik tengely lehet a hosszabb. Valódi ellipszis, mint az AutoCAD-é, nem vonallánc, így a Középpont, a Körnegyed és a Szomszédos tárgyraszter illeszkedik rá, a fogóival pedig mozgatható, és mindkét féltengelye beállítható. A második végpont megadása közben borostyánszínű szaggatott vonal fut az elsőtől; a távolság megadásakor az ellipszis követi a kurzort. Az ellipszis az aktuális fólián jön létre, a rögzítése pillanatában aktuális tulajdonságokkal.

## Options

### Arc

Elliptikus ívet rajzol: ugyanazok a promptok, mint az ellipszisnél, majd egy kezdő szög és egy végszög, az óramutató járásával ellentétesen, az elsőként megadott tengely végpontjától mérve.

### Center

A középpontból indul: utána az egyik tengely végpontja, majd a távolság a másikig.

### Rotation

A távolság helyett: az a szög, amellyel az ellipszis az első tengelye körül el van forgatva, mint egy ekkora szögből nézett kör. A 0 kört rajzol; a 90-től 0,6 foknál kevésbé eltérő szöget a parancs a <Message id="invalid" /> üzenettel elutasítja.

### Parameter

Ívnél a kezdő szög vagy a végszög helyett: a szög azon a körön, amelyből az ellipszis származik, vagyis az AutoCAD paramétere. A <Keyword id="Angle" /> visszavált szögekre.

### Included angle

Ívnél a végszög helyett: mekkora szöget fog át a kezdettől. Az Enter 180-at fogad el, vagyis fél ellipszist.

## Missing

Az Izometrikus kör, amelyet az AutoCAD csak izometrikus raszterstílus mellett kínál fel, és amely itt nincs meg. A PELLIPSE 1, vagyis vonalláncként rajzolt ellipszis. Az ellipszis sraffozása és méretezése, valamint a Metszéspont, az Érintő és a Merőleges tárgyraszter rajta. Az elliptikus ív végein lévő nyíl alakú fogók, amelyek itt négyzetesek, és a hossz vagy szög beírása aktív fogó mellett. A távolság megadásakor a Z koordinátát tartalmazó pontot a parancs felülnézetben méri, ahol az AutoCAD térben méri.

## Questions

### Mi az AutoCAD ELLIPSZ parancs angolul?

ELLIPSE. A magyar AutoCAD-ben a rövidítése `ELL`: írja be, majd nyomja meg az Enter vagy a Szóköz billentyűt. A teljes név is működik, az AutoCAD bármely nyelvi változatában pedig az `_ELLIPSE` is; az angol `EL` a magyar változatban az ELÉR parancsot indítja.

### Hogyan lehet fél ellipszist rajzolni az AutoCAD-ben?

Válassza az <Keyword id="Arc" /> opciót, adja meg a tengelyt és a távolságot, majd kezdő szögnek `0`-t, végszögnek `180`-at. Vagy nyomja meg az Enter billentyűt a <Keyword id="Included angle" /> opciónál, amely alapértelmezésként 180 fokot fog át.

### Hogyan lehet ellipszist rajzolni a középpontjából?

Válassza a <Keyword id="Center" /> opciót, adja meg a középpontot, majd az egyik tengely végpontját, végül a középpont és a másik tengely végpontja közötti távolságot: ez az ellipszis két féltengelye.

### Hogyan lehet izometrikus kört rajzolni az AutoCAD-ben?

Az AutoCAD az ELLIPSZ parancs Izometrikus kör opciójával rajzolja, ha a raszterstílus izometrikus. A MellowCAD-ben egyik sem érhető el még.
