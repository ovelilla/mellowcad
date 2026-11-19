---
title: "AutoCAD BEOSZTÁS (MEASURE) parancs"
metaTitle: "AutoCAD BEOSZTÁS (MEASURE): pontok adott hosszon"
description: "Az AutoCAD BEOSZTÁS (MEASURE, rövidítése BEO) parancsa: pontok vagy blokkok adott hosszanként vonalon, íven, körön vagy vonalláncon, a közelebbi végtől."
figure: "Egy 190 hosszú vonallánc 15-önként beosztva attól a végtől, amelynek közelében kiválasztották: tizenkét pont, az utolsó 10-zel a túlsó vég előtt."
sourceHash: "3975c3873eff"
---

A BEOSZTÁS (MEASURE) parancs adott hosszanként jelöl meg egy objektumot. Válasszon ki egy vonalat, ívet, kört, ellipszist, ellipszisívet, vonalláncot, 3D vonalláncot vagy spline-t, majd adja meg a hosszt, beírva vagy két ponttal: a BEOSZTÁS az objektum mentén minden ilyen hossznál elhelyez egy pont objektumot, ameddig csak elfér, és befejeződik. Távolságot nem mér, és az objektumot sem vágja el. Attól a végtől indul, amely közelebb esik a kiválasztás helyéhez, ezért annak a végnek a közelében válassza ki, ahonnan mérni szeretne; a maradék a másik végre jut, és ha a hossz egész számszor fér el az objektumon, a túlsó végre is kerül pont. A kör a 0°-os pontjánál kezdődik, és az óramutató járásával ellentétesen halad, bárhol választja is ki; a zárt vonallánc az első csúcspontjánál kezdődik.

A pontok a rajz pontstílusa szerint rajzolódnak, alapértelmezés szerint pontként: előbb állítson be jól látható alakot a <Command id="PTYPE" /> paranccsal vagy a PDMODE változóval. A pontok az objektumon fekszenek, az aktuális fólián, az aktuális színnel, vonaltípussal és vonalvastagsággal; a teljes futás egyetlen lépés, amelyet a <Command id="U" /> visszavon, és a pontok alkotják az Előző kiválasztási halmazt. Az objektumnál hosszabb hossz <Message id="objectNotThatLong" /> üzenetet kap, a túl rövid, amely 32767-nél több pontot adna, <Message id="objectTooLong" /> üzenetet, és egyik sem hoz létre semmit. Bármely más objektumra <Message id="cannotMeasureObject" /> a válasz. A BEOSZTÁS parancsot a Rajz eszközök Pontok legördülő listája is elindítja.

## Options

### Block

Pontok helyett egy, a rajzban már meglévő blokk referenciái: adja meg a nevét, aztán hogy mindegyiket az objektumhoz igazítsa-e, <Keyword id="Yes" /> (az alapérték) vagy <Keyword id="No" />, végül a hosszt. Igazítva minden referencia az objektummal együtt fordul a helyén, egy vonal mentén vagy egy ív érintőjeként, akármelyik végtől indul a beosztás; igazítás nélkül mindegyik az FKR X tengelyének irányában marad. Az olyan nevet, amelyhez nem tartozik blokk, elutasítja, és újra kéri a nevet.

## Missing

Hogy merre halad a közepén túl kiválasztott zárt vonallánc: itt az első csúcspontjától visszafelé osztja be, ahogy az AutoCAD a zárt ellipszist vagy spline-t, de az AutoCAD saját vonalláncán ezt még nem ellenőriztük. A kör pontjai mindig az FKR X tengelyének irányától indulnak, míg az AutoCAD a raszterszögtől (SNAPANG) indítja őket, ami a MellowCAD-ben nincs meg.

## Questions

### Mi az AutoCAD BEOSZTÁS parancs angolul?

MEASURE. A magyar AutoCAD-ben a rövidítése `BEO`: írja be, majd nyomja meg az Enter vagy a Szóköz billentyűt. Az angol `ME` a magyar változatban a METSZ parancsot indítja; a teljes `BEOSZTÁS` név működik, a `_MEASURE` pedig az AutoCAD bármely nyelvi változatában.

### Mér-e távolságot a BEOSZTÁS parancs?

Nem: a megadott hosszanként pontokat helyez el. Két pont távolságához használja a <Command id="DIST" /> parancsot; egy objektum hosszához a <Command id="LIST" /> vagy a <Command id="AREA" /> parancsot.

### Melyik végtől indul a BEOSZTÁS parancs?

Attól a végtől, amely közelebb esik ahhoz a ponthoz, ahol az objektumot kiválasztotta. Annak a végnek a közelében válassza ki, ahonnan az első hosszt mérni szeretné.

### Miért nem látszanak a BEOSZTÁS által létrehozott pontok?

Pontként rajzolódnak, ez az alapértelmezett pontstílus. Nyissa meg a <Command id="PTYPE" /> parancsot, és válasszon keresztet vagy kört, vagy állítsa a PDMODE értékét `3`-ra: minden pont egyszerre megváltozik.

### Mi a különbség a BEOSZTÁS és a FELOSZT (DIVIDE) parancs között?

A <Command id="DIVIDE" /> adott számú egyenlő részre osztja az objektumot; a BEOSZTÁS adott hosszanként lépked végig rajta, és a maradékot a túlsó végen hagyja.
