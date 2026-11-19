---
title: "AutoCAD NNÉZET (PLAN) parancs: normálnézet az FKR-re"
metaTitle: "AutoCAD NNÉZET (PLAN): normálnézet, felülnézet"
description: "Vissza a normálnézetbe az AutoCAD NNÉZET (PLAN) parancsával: merőlegesen felülről az aktuális FKR-re, egy mentett FKR-re vagy a VKR-re. Próbálja ki ingyen."
figure: "A lépcsős test délnyugatról nézve, az FKR-je 30 fokkal elforgatva a Z körül: az NNÉZET és az Enter merőlegesen felülről néz erre az FKR-re, X tengelyével jobbra, így a test elforgatva látszik."
sourceHash: "50d157803309"
---

Az NNÉZET (PLAN) parancs merőlegesen felülről néz egy FKR XY síkjára, az X tengelyével jobbra mutatva: ez a normálnézet, amelyben rajzolt. Megkérdezi, melyik FKR-re – az aktuálisra, egy mentettre vagy a világéra –, és az Enter az aktuálisat választja. Ezután a teljes rajzot a nézetbe illeszti, és <Message id="regeneratingModel" /> üzenetet ír ki.

A rajzban semmi sem mozdul, és az FKR is változatlan marad: az NNÉZET csak a nézetet fordítja el. Egyetlen visszavonási lépés, így a <Command id="U" /> visszaállítja a nézetet, a <Command id="ZOOM" /> <Keyword command="ZOOM" id="Previous" /> pedig az előző nézetre lép vissza. Ezzel lehet visszatérni a normálnézetbe a <Command id="3DORBIT" /> vagy egy izometrikus <Command id="VIEW" /> után. A MellowCAD 3D-je csak szilárdtestekből áll, és egyelőre részleges.

## Options

### Current ucs

Az aktuális FKR normálnézete, ez az alapérték. Ha az <Command id="UCS" /> 30 fokkal elforgatta az FKR-t a Z körül, a rajz 30 fokkal az óramutató járásával megegyezően elforgatva látszik, hogy az FKR X tengelye jobbra mutasson; egy ferde lapra illesztett FKR után merőlegesen arra a lapra néz.

### Ucs

Egy, az <Command id="UCS" /> parancs <Keyword command="UCS" id="NAmed" /> opciójával mentett FKR normálnézete, amelynek a nevét be kell írni. Nem mentett névre kiírja, hogy nem találja az FKR-t, és újra kérdez; a <Keyword id="?" /> kilistázza a mentetteket, ahogy az FKR parancs is, és szintén újra kérdez. Az aktuális FKR nem változik.

### World

A világ koordináta-rendszer normálnézete: a rajz úgy, ahogy kezdetben volt, X jobbra és Y felfelé, bármi legyen is az aktuális FKR, amely változatlan marad.

## Missing

Ha a rajz üres, az NNÉZET nem változtat a nagyításon, míg az AutoCAD a rajzhatárokat illeszti a nézetbe.

## Questions

### Hogyan lehet visszatérni a normálnézetbe az AutoCAD-ben?

Írja be az `NNÉZET` parancsot (angolul `_PLAN`), és nyomja meg kétszer az Enter billentyűt: a második Enter az <Keyword id="Current ucs" /> opciót választja. Ha az FKR el van forgatva, és a világ normálnézetét szeretné, válassza helyette a <Keyword id="World" /> opciót.

### Melyik parancs adja az FKR normálnézetét?

Az NNÉZET az <Keyword id="Current ucs" /> opcióval: felülről néz az aktuális FKR-re, X tengelyével jobbra. Előbb forgassa el az FKR-t az <Command id="UCS" /> paranccsal, majd futtassa az NNÉZET parancsot, és nyomja meg kétszer az Enter billentyűt: az elforgatott alaprajzon úgy rajzolhat, mintha egyenes állású lenne.

### Miért van elforgatva a rajz normálnézetben?

A nézet egy elforgatott FKR normálnézete. Futtassa az NNÉZET parancsot, és válassza a <Keyword id="World" /> opciót, hogy a rajzot újra a világ X tengelyével jobbra lássa; az <Command id="UCS" /> és az Enter az FKR-t is visszaállítja a világ koordináta-rendszerre.

### Megváltoztatja-e az NNÉZET az FKR-t?

Nem. Csak a nézetet fordítja el; az FKR változatlan marad. A <Command id="VIEW" /> merőleges vetületi nézetei azok, amelyek az FKR-t is elforgatják.
