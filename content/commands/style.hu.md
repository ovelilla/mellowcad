---
title: "Szövegstílus az AutoCAD-ben: STÍLUS (STYLE) parancs"
metaTitle: "Szövegstílus az AutoCAD-ben: STÍLUS (STYLE)"
description: "Így kezeli az AutoCAD STÍLUS (STYLE, ST) parancsa a szövegstílusokat: új, átnevezés, törlés, aktuálissá tétel, rögzített magasság. Próbálja ki ingyen."
figure: "Névtábla: STÍLUS, majd SZÖVEG, amelynek Stílus ? opciója kilistázza a rajz stílusát, az Arial betűtípusú Standard stílust, és vele megírva a tábla felirata."
sourceHash: "8c15a1a95e66"
---

A STÍLUS (STYLE) parancs a rajz szövegstílusait kezeli: azt, amivel a szöveg íródik. Minden szövegnek, bekezdéses szövegnek és attribútumnak van stílusa, az újak pedig az aktuális stílust kapják, amely új rajzban a Standard. Az AutoCAD STÍLUS parancsa a Szövegstílus párbeszédpanelt nyitja meg; a MellowCAD-ben ilyen még nincs, ezért a STÍLUS parancs a Stílusok paletta szövegtáblázatát nyitja meg, ahol a <Command id="DIMSTYLE" /> parancs méretstílusai is vannak. Az előtte kijelölt halmazt elveti, ahogy a párbeszédpanel is, és aposztróffal egy parancson belül begépelve (`'STÍLUS`) úgy nyílik meg, hogy az a parancs nem fejeződik be.

A táblázat felsorolja a stílusokat, és megjelöli az aktuálisat. Az Új a kijelölt stílus másolatát készíti el `style1`, `style2`… néven, az első szabad néven, és aktuálissá teszi. Az Aktuálissá tétel egy stílust tesz aktuálissá; a stílus neve átírható, a már használt nevet pedig, kis- és nagybetűtől függetlenül, elutasítja, ahogy az AutoCAD is. A Töröl eltávolít egy stílust, de a Standard stílust, az aktuális stílust és a használatban lévőt soha. A Magasság rögzített magasságot ad a stílusnak: a 0, az alapérték, szabadon hagyja, így a <Command id="TEXT" /> parancs minden alkalommal rákérdez; beállított magasság esetén a SZÖVEG parancs nem kérdez. Minden változtatás egy lépés, amelyet a <Command id="U" /> parancs visszavon. Kijelölt szövegek esetén a Tulajdonságok paletta Stílus sora egy lépésben más stílust ad nekik.

## Missing

A Szövegstílus párbeszédpanel és az előnézete: a STÍLUS parancs helyette a Stílusok palettát nyitja meg. A betűtípus neve, a betűstílus és a Big Font, a szélességi tényező, a dőlésszög, valamint a Fejjel lefelé, a Hátrafelé és a Függőleges effektus: minden stílus Arial betűtípussal, döntés nélkül, 1-es szélességi tényezővel jelenik meg. A feliratozási stílusok és az Annotative stílus, amely egy új AutoCAD-rajzban a Standard mellett megtalálható. A `-STÍLUS` parancs, amely mindezt a parancssorban kérdezi.

## Questions

### Mi az AutoCAD STÍLUS parancs angolul?

STYLE. A magyar AutoCAD-ben a rövidítése `ST`, akárcsak az angolban, és a `DPSTÍLUS` is működik: írja be valamelyiket, majd nyomja meg az Enter vagy a Szóköz billentyűt. A teljes `STÍLUS` név is működik, a `_STYLE` pedig az AutoCAD bármely nyelvi változatában.

### Hogyan lehet szövegstílust váltani az AutoCAD-ben?

Új szöveghez tegye aktuálissá a stílust a STÍLUS parancs által megnyitott Stílusok palettán, vagy a <Command id="TEXT" /> parancs <Keyword command="TEXT" id="Style" /> opciójával. Már megírt szövegnél jelölje ki a szöveget, és válassza ki a stílust a Tulajdonságok paletta Stílus sorában.

### Hogyan lehet megváltoztatni egy szövegstílus betűtípusát?

Az AutoCAD-ben a Szövegstílus párbeszédpanel Betűtípus neve mezőjében. Itt még nem lehet: minden stílus Arial betűtípussal jelenik meg, és a stílusok csak a nevükben és a magasságukban különböznek.

### Miért nem kéri a SZÖVEG parancs a magasságot?

Az aktuális stílusnak saját magassága van. Állítsa a magasságát 0-ra a Stílusok palettán, és a <Command id="TEXT" /> parancs újra kéri a magasságot, az utoljára használtat ajánlva fel.
