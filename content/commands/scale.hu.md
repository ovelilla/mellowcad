---
title: "Lépték az AutoCAD-ben: LÉPTÉK (SCALE) parancs"
metaTitle: "Lépték az AutoCAD-ben: LÉPTÉK (SCALE) parancs"
description: "Léptékezés az AutoCAD LÉPTÉK (SCALE, rövidítése LE) parancsával promptról promptra: bázispont, léptéktényező, Másol és Referencia egy ismert hosszhoz."
figure: "Egy alaplap és a furata egy másolaton léptékezve a Referencia opcióval, a sarka körül: a 40 hosszú él kijelölve, majd 60-ra állítva."
sourceHash: "005829bf17ad"
---

A LÉPTÉK (SCALE) parancs egy helyben maradó bázispont körül nagyítja vagy kicsinyíti a kiválasztott objektumokat: a 2-es tényező megkétszerezi, a 0,5-ös a felére csökkenti őket, minden irányban egyformán. Válassza ki az objektumokat, jelölje ki a bázispontot, majd írja be a tényezőt, vagy mozgassa a kurzort, és kattintson: az objektumok követik. Ha ott semmit sem ír be, az Enter a legutóbb használt tényezővel léptékez. Minden futás egyetlen lépésként vonható vissza.

Mindent úgy léptékez, ahogy az AutoCAD: a sraffozás mintája a határvonalával együtt nő, a méret az új hosszát méri, a sík fölötti objektum pedig Z irányban is léptékeződik a bázispont körül.

## Options

### Copy

Egy másolatot léptékez, az objektumokat pedig változatlanul hagyja; kiírja: <Message id="scalingCopy" />, és újra bekéri a tényezőt, a <Keyword id="Copy" /> opciót továbbra is felkínálva.

### Reference

Bekér egy referenciahosszt, beírva vagy két kijelölt ponttal, majd azt a hosszt, amelyre változnia kell: a tényező az új hossz osztva a referenciával. Az új hosszt be lehet írni, vagy egy ponttal lehet megadni, amelynek a bázisponttól mért távolsága adja; a <Keyword id="Points" /> ehelyett két pontot kér, és a köztük lévő távolságot méri. Mindkét hossz a legutóbb megadottat kínálja fel, új rajzban 1-et.

## Missing

A <Keyword id="Points" /> első vagy második pontjánál az Enter léptékezés nélkül befejezi a parancsot, míg az AutoCAD a kurzor ottani értékével léptékez. A nagyon kicsi tényezőt szó nélkül alkalmazza, míg az AutoCAD jelzi, hogy figyelmen kívül hagyja. A húzott objektumok úgy rajzolódnak, ahogy a <Command id="MOVE" /> húzza őket, csak a színükkel.

## Questions

### Mi az AutoCAD LÉPTÉK parancs angolul?

SCALE. A magyar AutoCAD-ben a rövidítése `LE`: írja be, majd nyomja meg az Enter vagy a Szóköz billentyűt. Az angol `SC` a magyar változatban nem működik; a `_SCALE` az AutoCAD bármely nyelvi változatában igen.

### Hogyan lehet referenciával léptékezni az AutoCAD-ben?

A tényezőnél válassza a <Keyword id="Reference" /> opciót, jelölje ki egy ismert hosszúságú él két végpontját, majd írja be, milyen hosszú legyen. Minden kiválasztott objektum az új és a régi hossz arányával léptékeződik, így egy rossz méretű rajz egyetlen ismert méret alapján helyreállítható.

### Hogyan lehet egy objektumot úgy léptékezni, hogy az eredeti megmaradjon?

A tényezőnél válassza a <Keyword id="Copy" /> opciót: a másolat léptékeződik, az eredeti a helyén marad.

### Hogyan lehet módosítani a vonaltípus léptékét?

Nem a LÉPTÉK paranccsal, amely magukat az objektumokat méretezi át: a <Command id="LTSCALE" /> adja meg, milyen hosszúra rajzolódnak a vonaltípusok vonalkái és hézagai.

### Hogyan lehet nyomtatási vagy elrendezési léptéket beállítani?

A MellowCAD-ben nincsenek elrendezések, nézetablakok és nyomtatás: a modelltérben valós méretben rajzol, a LÉPTÉK pedig maguknak az objektumoknak a méretét változtatja meg, nem azt, hogyan nyomtatódnának.
