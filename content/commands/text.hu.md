---
title: "AutoCAD SZÖVEG (TEXT) parancs: egysoros szöveg"
description: "Így működik az AutoCAD SZÖVEG (TEXT) parancsa: kezdőpont, magasság és elforgatás, Igazít és Stílus, soronként egy objektum. Próbálja ki ingyen, online."
figure: "Két sor egysoros szöveg egy téglalap közepén, közép felező (KF) igazítással: minden sor önálló objektum."
sourceHash: "44d0e1a420a7"
---

A SZÖVEG (TEXT) parancs egysoros szöveget ír. Adjon meg egy kezdőpontot, egy magasságot és egy elforgatási szöget, majd gépeljen be egy sort, és nyomja meg az Enter billentyűt: a sor önálló objektum lesz, a következő pedig alatta kezdődik. Az üres sor befejezi a parancsot. Ha előtte máshová kattint, a következő sorok ott kezdődnek, az Esc pedig megtartja a már bevitt sorokat, és csak az éppen gépeltet dobja el. Ha egy adott szélességre tördelt bekezdést szeretne egyetlen objektumként, használja a <Command id="MTEXT" /> parancsot.

Az első sor kiírja az aktuális stílust, magasságot és igazítást. A magasság ugyanaz, amelyet a <Command id="MTEXT" /> és az <Command id="ATTDEF" /> parancs is használ, a rajzban tárolódik, és a következő SZÖVEG parancs alapértelmezésként ajánlja fel; ha a stílusnak saját magassága van, a magasságot nem kérdezi. A kezdőpontnál megnyomott Enter a SZÖVEG parancs által utoljára írt sor alatt folytatja, és nem kérdezi újra a magasságot és a szöget. A <Command id="U" /> parancs az egész futtatást visszavonja.

## Options

### Justify

Azt kérdezi, hogyan álljon a szöveg a pontjához képest: <Keyword id="Left" /> (az alapérték), <Keyword id="Center" />, <Keyword id="Right" />, <Keyword id="Middle" />, vagy a kilenc pont egyike – fent, középen és lent, balra, felezve és jobbra –, ahogy a prompt felsorolja őket. A kezdőpont promptja ezután az igazítás által megnevezett pontot kéri: közép felező igazításnál a felezőpontot. Ahogy az AutoCAD-ben, a kilenc pont az első promptnál is elfogadható, bár ott nincs felsorolva, így ha ott a közép felező betűit gépeli be, a parancs rögtön a felezőpontot kéri. Az igazítás a rajzban tárolódik a következő SZÖVEG parancs számára.

### Style

Az aktuálissá teendő szövegstílus nevét kéri; az Enter megtartja a meglévőt. A <Keyword id="?" /> kilistázza a rajz stílusait; a rajzban nem szereplő nevet a parancs elutasítja, és újra kérdez. A stílusok a <Command id="STYLE" /> parancs által megnyitott palettán készülnek.

## Missing

Az Illeszt és a Beilleszt igazítás. A Stílus opciónál a <Keyword id="?" /> egyszerre listázza ki az összes stílust, anélkül hogy megkérdezné, melyeket, vagy oldalanként megállna. A szöveg a dinamikus bevitel mezőjébe gépelhető, nem kurzorral a rajzon, és a szövege nem írható át a Tulajdonságok palettán, amelyből a Feliratozási, a Szélességi tényező, a Dőlésszög, a Fejjel lefelé és a Hátrafelé sor is hiányzik. A szöveg befoglaló keretén belüli kattintás akkor is kijelöli a szöveget, ha nem a betűire esik, míg az AutoCAD ilyenkor semmit sem jelöl ki.

## Questions

### Mi az AutoCAD SZÖVEG parancs angolul?

TEXT. A magyar AutoCAD-ben a rövidítése `DS`, amely a `DSZÖVEG` parancsot indítja, ez pedig ugyanez a parancs: írja be valamelyiket vagy a teljes `SZÖVEG` nevet, majd nyomja meg az Enter vagy a Szóköz billentyűt. Az angol `DT` a magyar változatban nem működik. A `_TEXT` az AutoCAD bármely nyelvi változatában működik. Az `SZ` nem a SZÖVEG parancsé: a <Command id="MTEXT" /> parancsot indítja, vagyis a bekezdéses szöveget.

### Hogyan lehet szöveget igazítani az AutoCAD-ben?

Az első promptnál válassza az <Keyword id="Justify" /> opciót, vagy gépelje be ott az igazítás betűit, majd adja meg az általa megnevezett pontot: a közép felező igazítás minden sor közepét a pontjára teszi, ahogy egy felirat egy keret közepébe kerül. Ha a szöveget egy ferde vonal mentén futtatná, gépelje be a vonal szögét az elforgatás promptjánál.

### Mi a különbség a SZÖVEG és a BSZÖVEG parancs között?

A SZÖVEG parancs soronként egy objektumot készít, amelyek külön-külön mozgathatók, szerkeszthetők és igazíthatók, és soha nem tördelődnek. A <Command id="MTEXT" /> parancs egyetlen objektumot készít olyan bekezdésekből, amelyek egy keret szélességére tördelődnek, és egészként igazodnak. A kettő közös szövegmagasságot és szövegstílusokat használ.

### Hogyan lehet szöveget szerkeszteni az AutoCAD-ben?

Kattintson rá duplán: a <Command id="TEXTEDIT" /> parancs megnyitja átírásra, majd a következő szerkesztendő szöveget kéri, amíg meg nem nyomja az Esc billentyűt. A magassága és az elforgatása a Tulajdonságok paletta sorai között található, a fogói pedig mozgatják.
