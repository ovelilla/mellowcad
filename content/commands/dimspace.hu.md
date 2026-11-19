---
title: "AutoCAD MÉRETKÖZ (DIMSPACE) parancs"
description: "Méretek igazítása az AutoCAD MÉRETKÖZ (DIMSPACE) parancsával: egyenlő távolság a méretek között, 0 az egy vonalba rendezéshez, és Auto a szövegmagasság alapján."
before: "Egy lemez felső éle háromtagú lánccal méretezve, mindegyik méret a saját magasságában, ahogy megrajzolták őket."
figure: "MÉRETKÖZ az első mérettől, a másik kettő kijelölve, a térköz 0: a lánc egy vonalba rendezve."
sourceHash: "7ec7c0eb9883"
---

A MÉRETKÖZ (DIMSPACE) parancs a párhuzamos hossz- és illesztett méretek közötti távolságot állítja be. Válassza ki a bázisméretet, amely a helyén marad, majd az elhelyezendő méreteket; az Enter lezárja a kijelölést, és a parancs a térközt kéri. Ezután minden méret méretvonala elmozdul a bázistól elfelé, abban a sorrendben, ahogy a méretek fekszenek, mindegyik ekkora távolságra az előzőtől. A 0 térköz mindet a bázis vonalára rendezi: így a rajzoláskor lépcsőzetesen elhelyezett lánc egyetlen sorként olvasható. Csak a méretvonalak helyét változtatja meg, egyetlen lépésben, amelyet a <Command id="U" /> parancs visszavon.

A bázist ki lehet választani kattintással, pont beírásával vagy az `Utolsó` beírásával; ha nem méret, a válasz <Message id="selectedObjectNotDimension" />, és a parancs újra kérdez. A parancs előtt kijelölt objektumok lesznek az elhelyezendő méretek. A bázissal szöget bezáró méretet a parancs beszámítja, de a helyén hagyja, a negatív térközt pedig a <Message id="negativeSpacing" /> üzenettel elutasítja.

## Options

### Auto

Az alapértelmezés, Enter: a térköz a bázisméret méretstílusában megadott szövegmagasság kétszerese, a stílus teljes léptékével szorozva, így a méretek sora elfér a saját szövegével.

## Missing

A szögméretek, amelyeket a MÉRETKÖZ parancs még nem rendez el. Az AutoCAD csak ott mozgat el egy méretet, ahol szükséges; itt minden kijelölt méret új helyet kap.

## Questions

### Hogyan lehet méreteket egy vonalba igazítani az AutoCAD-ben?

Indítsa el a MÉRETKÖZ parancsot, válassza ki azt a méretet, amelyhez a többinek igazodnia kell, jelölje ki őket, nyomja meg az Enter billentyűt, és írja be: `0`. Minden méretvonal a bázisméret vonalára kerül.

### Hogyan lehet egyenlővé tenni a méretek közötti távolságot?

Indítsa el a MÉRETKÖZ parancsot, bázisként válassza ki az objektumhoz legközelebbi méretet, jelölje ki a többit, és nyomja meg kétszer az Enter billentyűt: az <Keyword id="Auto" /> opció a szövegmagasság kétszeresére helyezi el őket. Vagy írja be a kívánt távolságot, például `8`.

### Mekkora az alapértelmezett méretköz az AutoCAD-ben?

A MÉRETKÖZ parancs <Keyword id="Auto" /> opciója a méretstílus szövegmagasságának kétszerese. A <Command id="DIMBASELINE" /> parancs ehelyett a stílus Méretvonalak távolsága beállítását használja minden hozzáadott méretnél, ami az ISO-25 stílusban 3,75.

### Miért nem mozgat el egy méretet a MÉRETKÖZ parancs?

Csak a bázissal párhuzamos méreteket rendezi el: a más szögben állót beszámítja, de a helyén hagyja. A szögméreteket még nem rendezi el.
