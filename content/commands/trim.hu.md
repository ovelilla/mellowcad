---
title: "AutoCAD METSZ (TRIM) parancs"
description: "Így vág le vonalat az AutoCAD METSZ (TRIM, ME) parancsa: Gyors és Szabványos mód, vágóélek, Felfűz és Metsző, Shift a meghosszabbításhoz. Próbálja ki ingyen."
figure: "Vonal visszavágva az őt keresztező két vonalig: mindkét vége egyszer kijelölve, Gyors módban."
sourceHash: "fcbf44618cf3"
---

A METSZ (TRIM) parancs visszavágja az objektumot odáig, ahol más objektumok keresztezik: jelölje ki az eltávolítandó darabot, és az mindkét oldalon a legközelebbi metszéspontig eltűnik. <Keyword id="Quick" /> módban indul, ahogy az AutoCAD-ben: minden objektum vágóél, a semmi által nem keresztezett objektumot pedig egészben törli. Ha a kijelöléskor lenyomva tartja a Shift billentyűt, az objektumot ehelyett a legközelebbi élig meghosszabbítja, ahogy az <Command id="EXTEND" /> parancs. Minden kijelölés egy lépés, amelyet a <Keyword id="Undo" /> visszavon; az Enter befejezi a parancsot.

## Options

### cuTting

Kiválasztja, mely objektumok vágjanak: jelölje ki őket, vagy nyomja meg az Enter billentyűt, és minden objektum vágóél lesz. Ettől kezdve csak ezek vágnak, bármelyik módban, a parancs végéig.

### Fence

Egy vonal pontjait kéri, annyit, amennyit akar, az Enter billentyűig: minden objektumot, amelyet a vonal keresztez, a keresztezés helyén vág el, egyetlen lépésben. A <Keyword id="Standard" /> mód felsorolja; a <Keyword id="Quick" /> mód is elfogadja, és ott az üres helyre kattintás magától kétpontos felfűző vonalat kezd.

### Crossing

Egy ablak két sarkát kéri: mindent, amit az ablak körvonala keresztez, elvág, egyetlen lépésben. A teljesen az ablakon belül lévő objektumot nem keresztezi.

### mOde

Vált a <Keyword id="Quick" /> és a <Keyword id="Standard" /> mód között. <Keyword id="Standard" /> módban a METSZ parancs először a vágóéleket kéri (az Enter mindet kijelöli), az olyan objektumot, amelyet egyik él sem keresztez, ezzel az üzenettel hagyja meg: <Message id="doesNotIntersectCuttingEdge" />, felsorolja a <Keyword id="Fence" /> és az <Keyword id="Edge" /> opciót, és az üres helyre kattintás metszőablakot kezd. A mód a METSZ és az <Command id="EXTEND" /> parancs közös beállítása, és a munkamenet végéig megmarad.

### Edge

Csak <Keyword id="Standard" /> módban. A <Keyword id="Extend" /> beállítással az él ott is vág, ahol meghosszabbítva keresztezné az objektumot – a vonal mindkét irányban, az ív a köre mentén; a <Keyword id="No extend" /> az alapértelmezés.

### eRase

Objektumokat töröl a parancsból való kilépés nélkül: jelölje ki őket, és az Enter törli őket, a METSZ parancs egy visszavonható lépéseként.

### Undo

Akkor jelenik meg, amikor a kérdés már kapott választ – egy kijelölést, egy felfűző vonalat, egy ablakot: visszavonja az utolsó vágást, és ha már nincs mit visszavonni, ezt jelzi.

## Missing

Vetítés: az AutoCAD vetítési opciója (Nincs, Fkr, Nézet) nem érhető el, és minden számítás az FKR XY síkjára vetítve történik, ami az AutoCAD alapértelmezésének, az Fkr-nek felel meg. A felfűző vonal még nem húzható a kurzorral, csak pontonként adható meg. A metszési mód és az <Keyword id="Edge" /> beállítása a munkamenet végéig marad meg, míg az AutoCAD az egyik munkamenetből a másikba is megőrzi őket. Az FKR-hez képest ferde objektum a spline-t kivéve nem vág, és nem is vágható.

## Questions

### Mi az AutoCAD METSZ parancs angolul?

TRIM. A magyar AutoCAD-ben írja be a `METSZ` nevet vagy az `ME` rövidítést, és nyomja meg az Enter billentyűt vagy a szóközt; az angol változat `TR` rövidítése a magyarban a -TRASZTER parancsot indítja. A `_TRIM` az AutoCAD bármely nyelvi változatában működik.

### Miért törli a METSZ parancs az egész vonalat?

Mert Gyors módban van, amely az AutoCAD 2021-es verziója óta az alapértelmezés: az olyan objektum kijelölése, amelyet egyik él sem keresztez, törli az objektumot. Válassza a <Keyword id="mOde" />, majd a <Keyword id="Standard" /> opciót, hogy a METSZ parancs az ilyen objektumot meghagyja, és jelezze ezt.

### Hogyan lehet egyszerre sok vonalat levágni?

Kattintson egy üres helyre, és adjon meg egy második pontot: minden objektum, amelyet ez a felfűző vonal keresztez, egyetlen lépésben elvágódik. Vagy válassza a <Keyword id="Crossing" /> opciót, és húzzon ablakot az eltávolítandó darabok fölé.

### Hogyan lehet vonalat meghosszabbítani a METSZ paranccsal?

Tartsa lenyomva a Shift billentyűt, és jelölje ki a vonalat a meghosszabbítandó vége közelében: a legközelebbi élig nyúlik meg, ahogy az <Command id="EXTEND" /> paranccsal, a következő, Shift nélküli kijelölés pedig ismét vág.
