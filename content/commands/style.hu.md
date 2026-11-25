---
title: "Szövegstílus az AutoCAD-ben: STÍLUS (STYLE) parancs"
metaTitle: "Szövegstílus az AutoCAD-ben: STÍLUS (STYLE)"
description: "Így kezeli az AutoCAD STÍLUS (STYLE, ST) parancsa a szövegstílusokat: új, átnevezés, törlés, aktuálissá tétel, rögzített magasság. Próbálja ki ingyen."
figure: "Névtábla: STÍLUS, majd SZÖVEG, amelynek Stílus ? opciója kilistázza a rajz stílusát, az Arial betűtípusú Standard stílust, és vele megírva a tábla felirata."
sourceHash: "5e9a49c82ada"
---

A STÍLUS (STYLE) parancs a rajz szövegstílusait kezeli: azt, amivel a szöveg íródik. Minden szövegnek, bekezdéses szövegnek és attribútumnak van stílusa, az újak pedig az aktuális stílust kapják, amely új rajzban a Standard. A STÍLUS parancs a Szövegstílus párbeszédpanelt nyitja meg, ahogy az AutoCAD-ben. Az előtte kijelölt halmazt elveti, ahogy a párbeszédpanel is, és aposztróffal egy parancson belül begépelve (`'STÍLUS`) úgy nyílik meg, hogy az a parancs nem fejeződik be, hanem a párbeszédpanel bezárása után folytatódik.

A párbeszédpanel megnevezi az aktuális stílust, és felsorolja a stílusokat: mindet, vagy csak a használatban lévőket. Az Új... nevet kér, az első szabad nevet ajánlva fel (`style1`, `style2`…), és a kijelölt stílus másolatát készíti el, aktuálisként. Az Aktuálissá tétel a kijelölt stílust teszi aktuálissá; az F2 a nevét szerkeszti, a már használt nevet pedig, kis- és nagybetűtől függetlenül, elutasítja, ahogy az AutoCAD is. A Törlés eltávolít egy stílust, de a Standard stílust, az aktuális stílust és a használatban lévőt soha. A Magasság rögzített magasságot ad a stílusnak, amelyet az Alkalmaz gomb érvényesít: a 0, az alapérték, szabadon hagyja, így a <Command id="TEXT" /> parancs minden alkalommal rákérdez; beállított magasság esetén a SZÖVEG parancs nem kérdez. A Mégse elveti a nem alkalmazott magasságot, és Bezárás feliratúra vált, amint valami megváltozott. Minden, amit a párbeszédpanelen végez, egyetlen lépés, amelyet a <Command id="U" /> parancs visszavon. Kijelölt szövegek esetén a Tulajdonságok paletta Stílus sora egy lépésben más stílust ad nekik.

## Missing

A párbeszédpanel előnézete. A betűtípus neve, a betűstílus és a Big Font, a szélességi tényező, a dőlésszög, valamint a Fejjel lefelé, a Hátrafelé és a Függőleges effektus: minden stílus Arial betűtípussal, döntés nélkül, 1-es szélességi tényezővel jelenik meg. A feliratozási stílusok és az Annotative stílus, amely egy új AutoCAD-rajzban a Standard mellett megtalálható. A `-STÍLUS` parancs, amely mindezt a parancssorban kérdezi.

## Questions

### Mi az AutoCAD STÍLUS parancs angolul?

STYLE. A magyar AutoCAD-ben a rövidítése `ST`, akárcsak az angolban, és a `DPSTÍLUS` is működik: írja be valamelyiket, majd nyomja meg az Enter vagy a Szóköz billentyűt. A teljes `STÍLUS` név is működik, a `_STYLE` pedig az AutoCAD bármely nyelvi változatában.

### Hogyan lehet szövegstílust váltani az AutoCAD-ben?

Új szöveghez tegye aktuálissá a stílust az Aktuálissá tétel gombbal a STÍLUS parancs által megnyitott párbeszédpanelen, vagy a <Command id="TEXT" /> parancs <Keyword command="TEXT" id="Style" /> opciójával. Már megírt szövegnél jelölje ki a szöveget, és válassza ki a stílust a Tulajdonságok paletta Stílus sorában.

### Hogyan lehet megváltoztatni egy szövegstílus betűtípusát?

Az AutoCAD-ben a Szövegstílus párbeszédpanel Betűtípus neve mezőjében. Itt még nem lehet: minden stílus Arial betűtípussal jelenik meg, és a stílusok csak a nevükben és a magasságukban különböznek.

### Miért nem kéri a SZÖVEG parancs a magasságot?

Az aktuális stílusnak saját magassága van. Állítsa a magasságát 0-ra a Szövegstílus párbeszédpanelen, kattintson az Alkalmaz gombra, és a <Command id="TEXT" /> parancs újra kéri a magasságot, az utoljára használtat ajánlva fel.
