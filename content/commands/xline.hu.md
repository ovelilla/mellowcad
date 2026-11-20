---
title: "AutoCAD SZVONAL (XLINE) parancs"
metaTitle: "Szerkesztővonal az AutoCAD-ben: SZVONAL (XLINE)"
description: "Végtelen szerkesztővonal az AutoCAD SZVONAL (XLINE, SV) parancsával: két ponton át, vízszintes, függőleges, szögben, felező vagy párhuzamos. Próbálja ki ingyen."
figure: "Szerkesztővonalak egy ponton át, egy vízszintes, és két vonal szögének felezője: mindegyik a teljes nézeten átfut."
sourceHash: "5b81d2c75993"
---

A SZVONAL (XLINE) parancs szerkesztővonalakat rajzol: végtelen hosszú vonalakat, amelyek a teljes nézeten átfutnak, bárhogyan is mozgatja vagy nagyítja a nézetet, hogy a rajz kiosztását a valódi vonalak előtt kijelölje. Adjon meg egy pontot, majd egy átmenő pontot: a szerkesztővonal mindkettőn áthalad, és minden további pont egy újabbat készít az első ponton át, amíg az Enter be nem fejezi a parancsot. Az első pontra eső átmenő pontot a parancs a <Message id="invalid" /> üzenettel elutasítja. Minden szerkesztővonal az aktuális fólián, az aktuális színnel, vonaltípussal és vonalvastagsággal készül.

A szerkesztővonalnak nincsenek végei: a rajz terjedelmére nagyítva kimarad, ahogy az AutoCAD-ben. A Felezőpont tárgyraszter azt a pontot találja meg, amelyen át megrajzolták, a Legközelebbi, a Merőleges és a Metszéspont tárgyraszter pedig a hossza mentén működik. A <Command id="TRIM" /> vagy a <Command id="BREAK" /> parancs egy vagy két sugárvonallá alakítja: így lesznek a szerkesztővonalakból rajzvonalak. A <Command id="RAY" /> parancs a szerkesztővonal egy pontból induló felét rajzolja meg.

## Options

### Hor

Vízszintes szerkesztővonalak, az FKR X tengelye mentén, mindegyik egy megadott ponton át, amíg az Enter le nem zárja.

### Ver

Függőleges szerkesztővonalak, az FKR Y tengelye mentén, mindegyik egy megadott ponton át.

### Ang

Szögben álló szerkesztővonalak: írja be a szöget, vagy adja meg két ponttal, majd az átmenő pontokat. A szögnél az Enter 0-t vesz. A <Keyword id="Reference" /> opció a szöget egy kijelölt vonalobjektumtól – vonaltól, szerkesztővonaltól vagy sugárvonaltól – méri, az óramutató járásával ellentétesen: minden mást a <Message id="noUsableObjectSelected" /> üzenettel elutasít.

### Bisect

A szöget megfelező szerkesztővonal: adja meg a szög csúcspontját, egy pontot az első szárán, majd egy pontot a második szárán, és a felező a csúcsponton halad át. A második szár minden további pontja újabb felezőt készít ugyanazzal az első szárral.

### Offset

Egy vonalobjektummal – vonallal, szerkesztővonallal vagy sugárvonallal – párhuzamos szerkesztővonalak: adja meg a távolságot, jelölje ki az objektumot, és válassza ki az oldalt, újra és újra, amíg az Enter le nem zárja. A <Keyword id="Through" /> opcióval ehelyett mindegyik egy megadott ponton halad át. A távolság ugyanaz, amelyet a <Command id="OFFSET" /> parancs megjegyez, és legközelebb ezt kínálja fel.

## Missing

A szerkesztővonal módosítása a HOSSZABBÍT (LENGTHEN) és az EGYBEFŰZ (JOIN) paranccsal még nincs összevetve az AutoCAD-del, ahogy a fogóinak menüi sem.

## Questions

### Mi az AutoCAD SZVONAL parancs angolul?

XLINE. A magyar AutoCAD-ben a rövidítése `SV`: írja be, majd nyomja meg az Enter vagy a Szóköz billentyűt. A teljes `SZVONAL` név is működik, a `_XLINE` pedig az AutoCAD bármely nyelvi változatában; az angol `XL` a magyar változatban nem működik. A szalagon Szerkesztővonal a neve, a Rajz panel kibontott részén; itt a Rajz eszközök között van, a Sugár mellett.

### Hogyan lehet vízszintes vagy függőleges szerkesztővonalat rajzolni?

Indítsa el a SZVONAL parancsot, írja be a <Keyword id="Hor" /> vagy a <Keyword id="Ver" /> opció betűjét, majd adja meg a pontokat, amelyeken áthalad. A vízszintes és a függőleges irány az aktuális FKR szerint értendő.

### Hogyan lehet levágni egy szerkesztővonalat?

A <Command id="TRIM" /> paranccsal, mint bármely vonalat: az egyik oldalon elvágva a szerkesztővonalból sugárvonal lesz, mindkét oldalon elvágva vonal. Ugyanez történik a <Command id="BREAK" /> paranccsal.

### Miért hagyja figyelmen kívül a ZOOM Terjedelem a szerkesztővonalakat?

A szerkesztővonalnak nincs terjedelme: mindkét irányban a végtelenbe fut. Az AutoCAD a szerkesztővonalakat és a sugárvonalakat kihagyja a rajz terjedelméből, és a MellowCAD is.

### Mi a különbség a SZVONAL és a SUGÁR parancs között?

A szerkesztővonal mindkét irányban a végtelenbe fut; a <Command id="RAY" /> parancs sugárvonala egy pontból indul, és csak egy irányba fut.
