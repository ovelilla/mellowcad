---
title: "Tulajdonságok módosítása az AutoCAD-ben: TVÁLT (CHPROP) parancs"
metaTitle: "Tulajdonságok módosítása: TVÁLT (CHPROP)"
description: "Tulajdonságok módosítása az AutoCAD-ben a TVÁLT (CHPROP) paranccsal: szín, fólia, vonaltípus és léptéke, vonalvastagság vagy vastagság a parancssorban."
figure: "TVÁLT egy lemez furatán átmenő vonalon: 1-es szín és CENTER vonaltípus, tengelyvonal azon a fólián, amelyen volt."
sourceHash: "4ba30c3c6070"
---

A TVÁLT (CHPROP) parancs a kijelölt objektumok tulajdonságait módosítja a parancssorban: a Tulajdonságok paletta Általános sorait kérdezi promptokként. Jelölje ki az objektumokat – vagy jelölje ki őket a parancs előtt –, majd válassza ki a módosítandó tulajdonságot; mindegyik után újra kérdez, amíg az Enter be nem fejezi. Minden tulajdonság promptja a készlet értékét kínálja fel alapértelmezésként, ahol az objektumok eltérnek, ott ezt: <Message id="varies" />, és ott az Enter minden objektumnak meghagyja a sajátját. A beállítottakat a parancs a végén alkalmazza, így az Esc minden objektumot változatlanul hagy. A zárolt fólián lévő objektumokat megszámolja és kihagyja, mindegyikre kiírva: <Message id="objectOnLockedLayer" />. A teljes futás egyetlen lépés, amelyet a <Command id="U" /> parancs visszavon.

## Options

### Color

Egy színszám 1 és 255 között, egy név, például `vörös`, a `FÓLIA`, vagy a <Keyword id="Truecolor" /> és utána `vörös,zöld,kék` alakban az értékei, ahogy a <Command id="COLOR" /> parancs elfogadja őket; amit a SZÍN elutasít, azt itt is elutasítja, és újra kérdez.

### LAyer

Egy fólia neve, kis- és nagybetűtől függetlenül. Ha a név nem lehet fólianév, az üzenet <Message id="invalidLayerName" />, ha nincs a rajzban, azt írja ki, hogy nem található; mindkét esetben újra kérdez. A TVÁLT nem hoz létre fóliát.

### LType

Egy vonaltípus neve, kis- és nagybetűtől függetlenül, vagy a `FÓLIA`. A rajzba még be nem töltött vonaltípust az acad.lin fájlból, az AutoCAD hüvelykes fájljából tölti be, ahogy az AutoCAD is, még metrikus rajzban is; az ebből a fájlból is hiányzó névre kiírja, hogy nem található, és visszatér a tulajdonság promptjához.

### ltScale

Az objektumok saját vonaltípus-léptéke, amely csak rájuk szorozza meg a <Command id="LTSCALE" /> parancs léptékét: távolság, beírva vagy két ponttal megmérve; a negatív értéket abszolút értékként veszi, a 0 üzenete <Message id="valueMustBeNonzero" />, és újra kérdez.

### LWeight

Vonalvastagság milliméterben, a legközelebbi szabványos értékre kerekítve, ahogy a <Command id="LWEIGHT" /> parancs kerekíti, vagy a `FÓLIA`; a `?` felsorolja őket.

### Thickness

Távolság, beírva vagy két ponttal megmérve, negatív és nulla is. A készlet vonalaira, köreire, íveire és vonalláncaira állítja be, mindegyik saját normálisa mentén; minden más típusra a végén kiírja, hogy a vastagságát nem tudja módosítani.

## Missing

Az átlátszóság, az Anyag és a Feliratozási tulajdonság, amelyek itt az objektumoknak nincsenek, így a prompt fel sem sorolja őket. A Blokk szerint a Szín, a Vonaltípus és a Vonalvastagság opciónál, valamint a Vonalvastagság Alapértelmezés értéke. Az indexszínnel egyező True Color színt indexszínként olvassa vissza: a `255,0,0` értéket `1 (vörös)` alakban kínálja fel. A színkatalógusok. A szövegek és attribútumdefiníciók vastagsága, amelyet változatlanul hagy. A VÁLT parancs, amelynek Tulajdonságok opciója ugyanezt a promptot kérdezi, a Szint opcióval együtt.

## Questions

### Van rövidítése a TVÁLT parancsnak az AutoCAD-ben?

Nincs rövidítése: írja be a `TVÁLT` parancsot (angolul CHPROP), vagy a `_CHPROP` alakot, amely az AutoCAD bármely nyelvén működik. A Parancs: promptnál adott Enter megismétli.

### Mi a különbség a TVÁLT és a TULAJDONSÁGOK parancs között?

Ugyanazokat a tulajdonságokat módosítják. A <Command id="PROPERTIES" /> parancs egy palettán mutatja őket, az egyes objektumok geometriájával együtt; a TVÁLT a parancssorban kérdez rájuk, így a keze a billentyűzeten maradhat.

### Hogyan lehet a parancssorból módosítani az objektumok színét?

Írja be a `TVÁLT` parancsot, jelölje ki az objektumokat, nyomja meg az Enter billentyűt, válassza a <Keyword id="Color" /> opciót, és írja be a színt, például `1` a vöröshöz. A befejezéshez nyomja meg ismét az Enter billentyűt.

### Hogyan lehet több objektumot áttenni egy másik fóliára?

Futtassa a TVÁLT parancsot, jelölje ki őket, válassza a <Keyword id="LAyer" /> opciót, és írja be a fólia nevét. A fóliának léteznie kell: előbb hozza létre a <Command id="LAYER" /> paranccsal.
