---
title: "Pont koordinátái az AutoCAD-ben: KOORD (ID) parancs"
metaTitle: "Pont koordinátái az AutoCAD-ben: KOORD (ID)"
description: "Pont koordinátáinak lekérdezése az AutoCAD KOORD (ID) parancsával: adja meg a pontot, és olvassa le az X, Y, Z értékét az aktuális FKR-ben, parancs közben is."
figure: "KOORD Középpont tárgyraszterrel egy lemez furatán: a középpont X, Y és Z koordinátája."
sourceHash: "3f6bc32d12e5"
---

A KOORD (ID) parancs egy pont koordinátáit írja ki. Az `Adja meg a pontot:` promptnál kattintson rá, akár tárgyraszterrel, vagy írja be, és a KOORD egy sorban kiírja a parancssorba az X, Y és Z koordinátáját, majd véget ér. Az értékek az aktuális FKR-ben, a rajz pontosságával jelennek meg. Tárgyraszterrel a Z az objektum magassága az adott pontban; egyébként a szintsíké. Az Enter szó nélkül befejezi, a KOORD előtt kijelölt objektumok pedig az indulásakor kikerülnek a kijelölésből. Aposztróffal beírva (`'KOORD`) egy másik parancson belül fut, amely utána folytatódik.

## Questions

### Mire szolgál az AutoCAD KOORD (ID) parancs?

Megmondja, hol van egy pont: az X, Y és Z koordinátáját az aktuális FKR-ben. Semmit sem rajzol és semmit sem módosít. Angolul ID, és az `_ID` az AutoCAD bármely nyelvi változatában működik.

### Hogyan lehet megtudni egy pont koordinátáit?

Írja be: `KOORD`, majd kattintson a pontra egy tárgyraszterrel, például Végponttal vagy Középponttal, hogy pontosan arra a pontra essen. A koordináták a parancssorba íródnak ki.

### Hogyan lehet megtudni egy pont Z koordinátáját?

Válassza ki tárgyraszterrel: a KOORD ekkor az objektum ottani Z értékét írja ki. Az egyszerű kattintás a szintsík Z értékét adja, ami 0, hacsak az ELEVATION vagy az FKR meg nem emeli.

### Miért mutat a KOORD parancs váratlan koordinátákat?

A KOORD az aktuális FKR-ben olvas. Ha az FKR-t elmozdították vagy elforgatták, a számokat az origójától, a tengelyei mentén méri: a világkoordináták leolvasásához állítsa vissza a Világ FKR-t az <Command id="UCS" /> paranccsal.
