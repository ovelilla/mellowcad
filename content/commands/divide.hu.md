---
title: "AutoCAD FELOSZT (DIVIDE) parancs"
metaTitle: "Felosztás az AutoCAD-ben: FELOSZT (DIVIDE)"
description: "Vonal vagy kör egyenlő részekre osztása az AutoCAD FELOSZT (DIVIDE, FE) parancsával: pontok vagy blokkok, és miért nem látszanak a pontok. Próbálja ki ingyen."
figure: "PDMODE 3, hogy a pontok keresztként látsszanak, majd egy 5 részre osztott vonal és egy 6 részre osztott kör, amely a 0°-os pontjánál kezdődik."
sourceHash: "6f3c52078466"
---

A FELOSZT (DIVIDE) parancs egyenlő részekre osztva megjelöl egy objektumot. Válasszon ki egy vonalat, ívet, kört, ellipszist, elliptikus ívet, vonalláncot, 3D vonalláncot vagy spline-t, rákattintva vagy egy rajta lévő pontot beírva, majd adja meg a szakaszok számát 2 és 32 767 között: a FELOSZT minden osztóhelyre egy pontobjektumot tesz, és véget ér. Az objektumot nem vágja el, az egyben marad. Egy 5 részre osztott nyitott objektum 4 pontot kap, a kezdőpontjától számítva; egy zárt 5-öt, köztük a kezdőpontját: a kör a 0°-os pontjától, az óramutató járásával ellentétesen, a zárt vonallánc az első csúcspontjától. A pontok az objektumon, annak magasságában fekszenek, az aktuális fólián, az aktuális színnel, vonaltípussal és vonalvastagsággal.

A pontok a rajz pontstílusa szerint jelennek meg, és az alapértelmezés egy pötty, amely elbújik a vonal alatt: előbb állítson be jól látható alakot a <Command id="PTYPE" /> paranccsal vagy a PDMODE változóval. A teljes felosztás egyetlen lépés, amelyet a <Command id="U" /> parancs visszavon, a pontjai pedig az Előző kijelölést alkotják, így azonnal törölhetők vagy mozgathatók. Bármely más objektumra, például szövegre vagy blokkreferenciára a válasz <Message id="cannotDivideObject" />, és a parancs véget ér. A FELOSZT parancs a Rajz eszközök Pontok legördülő listájából is indítható.

## Options

### Block

Pontok helyett egy, a rajzban már meglévő blokk referenciái: adja meg a nevét, majd hogy mindegyiket az objektumhoz igazítsa-e, <Keyword id="Yes" /> (az alapértelmezés) vagy <Keyword id="No" />, végül a szakaszok számát. Igazítva minden referencia az objektummal együtt fordul a helyén, vonal mentén vagy ív érintője irányában; igazítás nélkül mindegyik megtartja az FKR X irányát. Az olyan nevet, amely mögött nincs blokk, a parancs elutasítja, és újra kéri a nevet. A blokk változó attribútumai kimaradnak, ahogy az AutoCAD-ben.

## Missing

A csavarvonal, amelyet a MellowCAD még nem tud rajzolni. Az FKR síkjában nem fekvő objektum mentén a blokkok az FKR síkjába kerülnek, ahol az AutoCAD súgója az objektum saját síkjába helyezi őket. A kör pontjai mindig az FKR X irányánál kezdődnek, ahol az AutoCAD a raszter szögénél, a SNAPANG értékénél kezdi őket, ami a MellowCAD-ben nincs meg.

## Questions

### Mi az AutoCAD FELOSZT parancs angolul?

DIVIDE. A magyar AutoCAD-ben a rövidítése `FE`: írja be, majd nyomja meg az Enter vagy a Szóköz billentyűt. A teljes név is működik, az AutoCAD bármely nyelvi változatában pedig a `_DIVIDE` is; az angol `DIV` a magyar változatban nem működik.

### Miért nem működik a FELOSZT parancs?

Valószínűleg működik: a pontok ott vannak, pöttyökként a vonalon. Nyissa meg a <Command id="PTYPE" /> (`DPPTÍPUS`) parancsot, és válasszon keresztet vagy kört, vagy írja be a PDMODE változót és a `3` értéket: a rajz összes pontja egyszerre megváltozik. A kiválasztásukhoz használja a Pont tárgyrasztert (`PON`).

### Hogyan lehet egy vonalat egyenlő részekre osztani?

Indítsa el a FELOSZT parancsot, válassza ki a vonalat, és írja be a részek számát, öt részhez `5`. A részek közötti négy pontra tárgyraszterrel lehet illeszkedni: a Pont tárgyraszter megtalálja őket.

### Hogyan lehet egy kört egyenlő részekre osztani?

Ugyanígy: válassza ki a kört, és írja be a részek számát. A zárt objektum annyi pontot kap, ahány része van, így a 6 hat pontot ad, az elsőt a kör 0°-os pontjánál, a többit az óramutató járásával ellentétesen.

### Hogyan lehet egy vonalat különálló darabokra vágni?

A FELOSZT parancs csak megjelöli a helyeket. A vonal ott történő elvágásához használja a <Command id="BREAK" /> parancsot, vagy minden pontnál a <Command id="BREAKATPOINT" /> parancsot, a Pont tárgyraszterrel a pontra illesztve.
