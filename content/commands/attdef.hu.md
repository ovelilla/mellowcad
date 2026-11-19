---
title: "Blokkattribútumok az AutoCAD-ben: ATTDEF parancs"
metaTitle: "Blokkattribútumok az AutoCAD-ben: ATTDEF"
description: "Blokkattribútum definiálása az AutoCAD-ben az ATTDEF (ATT) paranccsal: a módok, a címke, a prompt és az alapértelmezett érték, majd a szöveg helye. Próbálja ki."
figure: "Egy ajtójelölő: a NUM attribútum egy kör közepén, a promptja maga a címke, az alapértelmezett értéke 1, készen arra, hogy blokkba kerüljön."
sourceHash: "f0fc3d8763e7"
---

Az ATTDEF parancs attribútumot definiál: egy címkét, egy promptot és egy alapértelmezett értéket, egysoros szövegként a rajzba helyezve. Amikor a <Command id="BLOCK" /> paranccsal blokkot készít, jelölje ki a többi objektummal együtt, és a blokk minden referenciája saját értéket tárol hozzá: egy ajtó számát, egy alkatrész kódját, egy helyiség nevét. Addig a definíció a címkéjét mutatja.

Az AutoCAD ATTDEF parancsa az Attribútum definiálása párbeszédpanelt nyitja meg, amely a MellowCAD-ben nincs: itt az ATTDEF a parancssorban azt kérdezi, amit a <Command id="-ATTDEF" />, ahogy az AutoCAD konzolja. Kiírja az aktuális módokat, és bekéri, melyiket módosítsa, amíg az Enter tovább nem lép. Ezután a címke következik: szóköz nélkül, mert a szóköz lezárja, a kisbetűkből pedig nagybetűk lesznek; a magában álló Enter üzenete <Message id="tagCannotBeNull" />. Utána a prompt, amellyel a <Command id="INSERT" /> parancs az értéket kérni fogja – az Enter a címkét veszi át –, majd az alapértelmezett érték. Végül a szöveg helye, a <Command id="TEXT" /> parancs kérdéseivel: kezdőpont, magasság és elforgatás. A magasság és az igazítás a SZÖVEG paranccsal közös, mindkét irányban. A kezdőpontnál adott Enter a definíciót az utoljára definiált alá teszi egy sorral, annak magasságával, elforgatásával, stílusával és igazításával, így egy blokk attribútumai egymás alá sorakoznak.

## Options

### Invisible

Az érték nem látszik a referenciákon, amíg az <Command id="ATTDISP" /> parancs be nem kapcsolja. Mindegyik mód kapcsoló: kiválasztása átváltja `I` és `N` között, újra kiírja a módokat, és ismét kérdez. A módok a következő ATTDEF parancsra is beállítva maradnak.

### Constant

Minden referencia ugyanazt az értéket tárolja, amelyet az ATTDEF a prompt és az alapértelmezés helyett kér be; a BEILL parancs sosem kérdez rá.

### Verify

A BEILL parancs másodszor is bekéri az értéket, ellenőrzésképpen, miután minden értéket egyszer már bekért.

### Preset

A BEILL parancs nem kéri be az értéket: minden referencia az alapértelmezést kapja.

### Lock position

Kezdetben be van kapcsolva: az attribútum ott marad, ahová a blokk teszi.

### Justify

Bekéri, a szöveg melyik pontjához igazodjon, ahogy a SZÖVEG parancs: <Keyword id="Left" />, <Keyword id="Center" />, <Keyword id="Right" />, <Keyword id="Middle" />, vagy a kilenc pont egyike felül, középen és alul, balra, középre és jobbra. A kezdőpont promptja ezután az általa megnevezett pontot kéri: a középső közép egy jelölő közepére igazítja az értéket.

### Style

Bekéri a használandó szövegstílust, amely aktuálissá válik; a <Keyword id="?" /> felsorolja a rajz stílusait.

## Missing

Az Attribútum definiálása párbeszédpanel: az ATTDEF a parancssorban kérdez. A Feliratozási és a Többsoros mód, amelyet az AutoCAD 2027 a Hely rögzítése után sorol fel, és a többsoros attribútum sorai. A mezők, az Illeszt és a Beilleszt igazítás, valamint az, hogy a Stílus opció `?` válasza rákérdezzen, mely stílusokat listázza.

## Questions

### Mi az ATTDEF parancs rövidítése az AutoCAD-ben?

`ATT`, majd Enter vagy Szóköz; a `DPATTDEF` is működik. A `-ATT` a <Command id="-ATTDEF" /> parancs, a parancssori változat, amelyet itt az ATTDEF is futtat. A parancs neve a magyar AutoCAD-ben is ATTDEF, az `_ATTDEF` pedig az AutoCAD bármely nyelvén működik.

### Hogyan lehet attribútumos blokkot létrehozni az AutoCAD-ben?

Rajzolja meg a szimbólumot, majd minden attribútumhoz futtassa az ATTDEF parancsot, és helyezze a szövegét oda, ahol az értéknek látszania kell. Futtassa a <Command id="BLOCK" /> parancsot, adjon meg egy bázispontot, és jelölje ki a szimbólumot és az attribútumokat abban a sorrendben, ahogy a BEILL parancsnak kérdeznie kell őket. Ezután a <Command id="INSERT" /> parancs a blokk minden beillesztésekor minden attribútumhoz bekér egy értéket, az alapértelmezést felkínálva.

### Mi a különbség a címke, a prompt és az alapértelmezett érték között?

A címke az attribútum neve, azonosítóként: ezt mutatja a definíció, és ez a felirata a mezőnek a <Command id="EATTEDIT" /> parancsban. A prompt az a kérdés, amellyel a BEILL parancs az értékét kéri. Az alapértelmezés a felkínált érték, amelyet az Enter elfogad.

### Hogyan lehet szerkeszteni egy attribútumdefiníciót?

Kattintson rá duplán, mielőtt blokkba kerül: a <Command id="TEXTEDIT" /> parancs megnyitja a címkéjét, a promptját és az alapértelmezett értékét. Blokkba kerülése után az egyes referenciák értékeit az <Command id="ATTEDIT" /> vagy a <Command id="EATTEDIT" /> paranccsal lehet szerkeszteni.
