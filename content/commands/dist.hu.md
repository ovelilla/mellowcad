---
title: "AutoCAD TÁVS (DIST) parancs"
metaTitle: "Távolság mérése az AutoCAD-ben: TÁVS (DIST)"
description: "Távolság mérése az AutoCAD TÁVS (DIST, TÁ) parancsával: két pont távolsága a szögekkel és az X, Y, Z különbséggel, vagy pontsorozat hossza. Próbálja ki ingyen."
figure: "TÁVS egy 100 × 60-as lemez átlója mentén: a távolság, az XY síkbeli szög és a koordináta-különbségek."
sourceHash: "31fbe420bc43"
---

A TÁVS (DIST) parancs két pont távolságát méri. Kattintással, tárgyraszterrel vagy beírással adja meg az első és a második pontot, és a parancs kiírja a parancssorba a távolságot, az XY síkbeli szöget és az XY síkkal bezárt szöget, valamint az X, Y és Z irányú különbséget, majd véget ér. Minden pontot ott mér, ahol van, a Z koordinátájával együtt, így a távolság a valódi térbeli távolság. Az első pontnál az Enter az utoljára megadott pontból indul, a másodiknál pedig visszamér az elsőhöz. A számok a rajz pontosságát követik, a szögek az AUPREC változóét.

## Options

### Multiple

<Keyword id="Multiple" />, a második promptnál: egyetlen szakasz helyett pontsorozat, amelynél az addigi távolság minden következő pont előtt kiíródik, és a kurzor fölött is látszik, egészen az Enter billentyűig vagy a <Keyword id="Total" /> opcióig.

### Arc

Ehelyett íveken mér, a VLÁNC parancs ívopcióival: <Keyword id="Angle" />, <Keyword id="Center" />, <Keyword id="Close" />, <Keyword id="Direction" />, <Keyword id="Line" />, <Keyword id="Radius" />, <Keyword id="Second pt" />, <Keyword id="Undo" />. Minden ív hossza hozzáadódik a sorozathoz.

### Close

Visszatér az első ponthoz, hozzáadja ezt az utolsó szakaszt, kiírja a teljes hosszt, és véget ér.

### Length

Az utolsó szakasz irányában hozzáad egy megadott hosszúságú szakaszt.

### Undo

Visszavonja a sorozat utolsó pontját.

### Total

Kiírja a sorozat teljes hosszát, és véget ér; az Enter ugyanezt teszi.

## Missing

A GEOMMÉR (MEASUREGEOM) parancs, a szalag Mérés eszközei, amelyek a TÁVS parancs promptjait egy ciklusban kérdezik, Sugár, Szög, Terület, Térfogat és Gyors opcióval: itt a szalag Távolság gombja a TÁVS parancsot futtatja. Az <Keyword id="Arc" /> opció <Keyword id="Center" /> opciójánál a bezárt szöget fokban olvassa be, ahol az AutoCAD 2027 az ott beírt számot a kurzor irányában mért távolságként értelmezi.

## Questions

### Mi az AutoCAD TÁVS parancs angolul?

DIST. A magyar AutoCAD-ben a rövidítése `TÁ`: írja be, majd nyomja meg az Enter billentyűt vagy a szóközt. A teljes név is működik, az AutoCAD bármely nyelvi változatában pedig a `_DIST` is; az angol `DI` a magyar változatban nem működik.

### Hogyan lehet távolságot mérni az AutoCAD-ben?

Írja be: `TÁ`, majd adja meg a két pontot, tárgyraszterrel, hogy pontosan az objektumok végpontjaira vagy középpontjaira essenek. A távolság a szöggel és a koordináta-különbségekkel együtt a parancssorba íródik ki.

### Hogyan lehet több szakasz teljes hosszát megmérni?

A második pontnál válassza a <Keyword id="Multiple" /> opciót, és adja meg a további pontokat: minden pontnál látszik az addigi távolság, az Enter pedig kiírja a teljes hosszt.

### Hogyan lehet 3D-ben távolságot mérni?

Adja meg a pontokat a Z koordinátájukkal együtt, vagy használjon tárgyrasztert az objektumokon, azok magasságában: a TÁVS parancs a valódi térbeli távolságot méri, és kiírja az XY síkkal bezárt szöget és a Z irányú különbséget.

### Miért mutat a TÁVS parancs kevesebb tizedesjegyet a szükségesnél?

A hosszakat a rajz pontosságával írja ki, ami itt új rajzban két tizedesjegy. A <Command id="UNITS" /> parancsban többet is beállíthat, legfeljebb nyolcat.
