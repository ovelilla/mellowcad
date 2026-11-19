---
title: "AutoCAD TOL (PAN) parancs: a nézet eltolása"
metaTitle: "AutoCAD TOL (PAN) parancs: nézet eltolása"
description: "Az AutoCAD TOL (PAN) parancsa: a nézet húzása kéz kurzorral vagy a görgővel, -TOL két ponttal, és TOL egy másik parancson belül. Ingyen, online."
figure: "TOL jobbra és lefelé húzva, majd Enter: az alaplap elcsúszik a nézetben, a koordinátái nem változnak."
sourceHash: "0ca3050831f3"
---

A TOL (PAN) parancs a nézetet tolja el; a rajzban semmi sem mozdul. <Message id="panExit" /> üzenettel indul, és mást nem kérdez: a kurzor kézzé változik, és a bal gombbal húzva a nézet vele együtt mozdul, ahányszor csak akarja, amíg az Enter vagy az Esc be nem fejezi. TOL parancs nélkül a görgő lenyomva tartásával bármikor eltolhatja a nézetet, akár egy parancs közben is. Minden TOL egy visszavonási lépés, amely összeolvad a körülötte lévő ZOOM és TOL lépésekkel, így a <Command id="U" /> visszaállítja a nézetet. Aposztróffal beírva, `'TOL`, egy másik parancson belül is működik, amely utána folytatódik.

A <Command id="-PAN" /> ehelyett két ponttal tolja el a nézetet: egy bázisponttal és egy második ponttal, a nézet a köztük lévő távolsággal mozdul el; vagy az első promptnál beírt elmozdulással, például `50,0`, és Enterrel a másodiknál. Ez is transzparens parancs, és saját visszavonási lépés.

## Missing

A helyi menü, amelyet az AutoCAD eltolás közben jobb kattintásra mutat: Kilépés, Eltolás, Zoom, 3D keringés, Zoom - Ablak, Zoom - Eredeti és Zoom - Terjedelem.

## Questions

### Mi az AutoCAD TOL parancs angolul?

PAN. A magyar AutoCAD-ben nincs működő rövidítése: az acad.pgp ugyan a `T` rövidítést rendeli hozzá, de a `T` az U parancs magyar neve, így visszavon. Írja be a teljes `TOL` nevet, majd nyomja meg az Enter vagy a Szóköz billentyűt. Vagy parancs nélkül: tartsa lenyomva az egér görgőjét, és húzza. Az angol `P` a magyar változatban a PÁRH parancsot indítja; a `_PAN` az AutoCAD bármely nyelvi változatában működik.

### Hogyan lehet egérrel eltolni a nézetet az AutoCAD-ben?

Tartsa lenyomva a görgőt, és húzza: a nézet követi a kurzort. A görgő forgatásával a kurzor körül nagyít és kicsinyít. Érintőpadon futtassa a TOL parancsot, és húzzon a bal gombbal.

### Hogyan lehet rajzolás közben eltolni a nézetet?

Húzza a görgőt lenyomva tartva, vagy írja be a `'TOL` parancsot a parancs promptjánál: a parancs megvárja, amíg eltolja a nézetet, aztán ott folytatja a kérdezést, ahol abbahagyta.

### Hogyan lehet pontos távolsággal eltolni a nézetet?

Használja a <Command id="-PAN" /> parancsot: írja be az elmozdulást, például `100,0`, és a második pontnál nyomja meg az Enter billentyűt. A nézet 100 egységgel mozdul el az X tengely mentén.
