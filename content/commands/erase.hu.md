---
title: "AutoCAD RADÍR (ERASE) parancs"
metaTitle: "Törlés az AutoCAD-ben: RADÍR (ERASE) parancs"
description: "Objektumok törlése az AutoCAD RADÍR (ERASE, R) parancsával: kijelölés, Enter, és eltűnnek; a Delete billentyű, a MIND, és hogyan lehet visszahozni őket."
figure: "Egy téglalap és két átlója: az egyik átló kiválasztva, majd Enter, és törlődik."
sourceHash: "2de33971060a"
---

A RADÍR (ERASE) parancs eltávolítja a rajzból a kijelölt objektumokat. Jelölje ki őket a `Válasszon objektumokat:` promptnál, rájuk kattintva vagy az AutoCAD bármely kijelölési módjával, köztük ablakkal vagy metsző ablakkal, majd nyomja meg az Enter billentyűt vagy a szóközt: az objektumok eltűnnek, és a parancs többet nem ír ki. Az Esc semmit sem töröl, csak befejezi a parancsot. Ahogy az AutoCAD-ben, a parancs előtt kijelölt objektumok azonnal törlődnek, és a Delete billentyű kijelölt objektumok esetén a RADÍR parancsot futtatja rajtuk. Kijelölés közben a kurzor alatti és a már kiválasztott objektumok halványan jelennek meg, ahogy az AutoCAD is előre mutatja, mit fog törölni. A teljes törlés egyetlen lépés, amely a Vissza paranccsal visszavonható.

## Missing

A HOPP (OOPS) parancs, amely az AutoCAD-ben visszahozza a RADÍR paranccsal utoljára törölt készletet, más parancsok után is. Itt a <Command id="U" /> parancs vagy a Ctrl+Z vonja vissza a törlést, az utána következő lépésekkel együtt.

## Questions

### Mi az AutoCAD RADÍR parancs angolul?

ERASE. A magyar AutoCAD-ben a rövidítése `R`, és a `DELETE` is az: írja be valamelyiket, majd nyomja meg az Enter billentyűt vagy a szóközt. Az angol `E` a magyar változatban nem működik; az `_ERASE` az AutoCAD bármely nyelvi változatában működik. Az objektumokat a `Parancs:` promptnál is kijelölheti, majd megnyomhatja a Delete billentyűt.

### Hogyan lehet mindent törölni a rajzban?

Indítsa el a RADÍR parancsot, írja be a `MIND` szót a `Válasszon objektumokat:` promptnál, majd nyomja meg az Enter billentyűt. A zárolt fólián lévő objektumok kimaradnak, és a kijelölés kiírja, hány ilyen volt.

### Hogyan lehet visszahozni, amit töröltem?

Írja be a <Command id="U" /> parancsot, vagy nyomja meg azonnal a Ctrl+Z billentyűkombinációt: a törlés egyetlen visszavonási lépés. A HOPP (OOPS) parancs, amely más parancsok után is visszahozza az utoljára törölt készletet, még nincs meg.

### Mi a különbség a RADÍR és a METSZ parancs között?

A RADÍR parancs teljes objektumokat távolít el. A <Command id="TRIM" /> parancs csak az objektumnak azt a részét távolítja el, amely túlnyúlik azokon az éleken, amelyekkel találkozik, a többit megtartja.
