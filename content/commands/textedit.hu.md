---
title: "AutoCAD SZÖVSZERK (TEXTEDIT) parancs"
description: "Így szerkeszt az AutoCAD SZÖVSZERK (TEXTEDIT) parancsa szöveget, bekezdéses szöveget és attribútumdefiníciót egymás után, Vissza és Mód opcióval. Próbálja ki!"
figure: "Egy névtábla elgépelt PALTE felirata a SZÖVSZERK paranccsal kijelölve és PLATE-re átírva, majd az Esc befejezi a parancsot."
sourceHash: "2d0ed6fe5acc"
---

A SZÖVSZERK (TEXTEDIT) parancs feliratobjektumokat szerkeszt: kiírja az aktuális szerkesztési módot, kezdetben a Többszöröst, és kéri, hogy jelöljön ki egy objektumot. Az egysoros szöveg a helyén nyílik meg átírásra, a bekezdéses szöveg a <Command id="MTEXT" /> parancs szerkesztőjében, az attribútumdefiníció pedig a címkéjével, a kérdésével és az alapértelmezett értékével. Többszörös módban ezután a következő objektumot kéri, amíg az Esc vagy az Enter be nem fejezi a parancsot, és az egész futtatás egyetlen lépés, amelyet a <Command id="U" /> parancs visszavon. A szövegre vagy attribútumdefinícióra duplán kattintva a SZÖVSZERK parancs indul, bekezdéses szövegre duplán kattintva pedig a szerkesztő nyílik meg erre az egy objektumra.

Az egysoros szöveg szerkesztőjében megnyomott Esc elveti az adott szerkesztést, és a következő objektumot kéri; a második Esc befejezi a parancsot. A zárt fólián lévő objektumra ez a válasz: <Message id="objectOnLockedLayer" />, és a parancs újra kérdez; bármi másra kattintva szó nélkül újra kérdez. A parancs előtt kijelölt egyetlen szöveg azonnal megnyílik.

## Options

### Undo

Visszavonja a futtatás utolsó szerkesztését, és újra kérdez; ha már nincs mit visszavonni, kiírja, hogy a parancs teljesen visszavonásra került.

### Mode

A szerkesztési módot kéri: az <Keyword id="Single" /> egy objektum után befejezi a parancsot, a <Keyword id="Multiple" /> újabbat kér. A mód a következő SZÖVSZERK parancsra is megmarad, minden rajzban.

## Missing

A méretszöveg: a SZÖVSZERK parancs nem szerkeszti a méret szövegét, amelyet a <Command id="DIMLINEAR" /> parancs Szöveg opciója az elhelyezéskor állít be. A szöveg tartalmának szerkesztése a Tulajdonságok palettán. A begépelt BSZEDIT és a -BSZEDIT parancs. Amíg a szerkesztő nyitva van, a parancssoron `SZÖVSZERK:` áll, mert az AutoCAD helyben szerkeszt, és nem kérdez semmit.

## Questions

### Mi az AutoCAD SZÖVSZERK parancs angolul?

TEXTEDIT. A magyar AutoCAD-ben írja be a `SZÖVSZERK` nevet vagy a `SZO` rövidítést, és nyomja meg az Enter billentyűt vagy a szóközt; a `SZERK` és a `DPEDIT` is működik. Az angol változat `ED` rövidítése a magyarban nem működik. A `_TEXTEDIT` az AutoCAD bármely nyelvi változatában működik.

### Hogyan lehet szöveget szerkeszteni az AutoCAD-ben?

Kattintson rá duplán, vagy írja be a `SZO` rövidítést, és jelölje ki; írja át, és nyomja meg az Enter billentyűt. A SZÖVSZERK parancs ezután a következő szerkesztendő szöveget kéri, amíg meg nem nyomja az Esc billentyűt. A magassága és az elforgatása a Tulajdonságok paletta sorai között található, a stílusa a Stílus sorban.

### Hogyan lehet több szöveget egymás után szerkeszteni?

Hagyja a SZÖVSZERK parancsot <Keyword id="Multiple" /> módban, ez az alapértelmezés: minden szöveg után a következőt kéri. A <Keyword id="Mode" /> és az <Keyword id="Single" /> opcióval egy szöveg után befejeződik, ahogy dupla kattintáskor is.

### Miért nem szerkeszthető a szöveg dupla kattintással?

Lehet, hogy a szöveg zárt fólián van: oldja fel a fóliát a Fóliatulajdonság-kezelőben. A méret szövegét a SZÖVSZERK parancs még nem szerkeszti, a blokk attribútumértékeire duplán kattintva pedig a <Command id="EATTEDIT" /> parancs nyílik meg.
