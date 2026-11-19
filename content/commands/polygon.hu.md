---
title: "Sokszög az AutoCAD-ben: POLIGON (POLYGON) parancs"
metaTitle: "Sokszög az AutoCAD-ben: POLIGON (POLYGON)"
description: "Szabályos sokszög az AutoCAD POLIGON (POLYGON, rövidítése POL) parancsával: oldalszám, középpont, beleírt vagy kör köré írt, vagy egy éle alapján. Próbálja ki."
figure: "Két 30 sugarú kör, az egyikbe írt és a másik köré írt hatszög, valamint egy éle alapján rajzolt ötszög."
sourceHash: "90e1cc9a53c4"
---

A POLIGON (POLYGON) parancs szabályos sokszöget rajzol, amelynek minden oldala és szöge egyenlő, egyetlen zárt vonalláncként. Bekéri az oldalak számát 3 és 1024 között, aztán a középpontot, és azt, hogy a sokszög egy körbe írt vagy egy kör köré írt legyen, végül ennek a körnek a sugarát. Vagy az egyik oldalára építi fel az Él opcióval. Az oldalak száma és a beleírt vagy kör köré írt választás a következő POLIGON parancs alapértéke lesz az adott rajzban. A számként beírt sugár vízszintes alsó éllel rajzolja meg; a pontként megadott, mutatott vagy beírt sugár a sokszög méretét és elfordulását is meghatározza. Amíg a sugarat adja meg, a sokszög a kurzort követi, egy borostyánsárga szaggatott vonallal a középponttól.

## Options

### Edge

Középpont helyett: adja meg az egyik oldal két végpontját, és a sokszög az óramutató járásával ellentétesen épül fel belőle.

### Inscribed

A csúcspontok a körön fekszenek: a sugár a középponttól egy csúcspontig tart. Ez az alapérték.

### Circumscribed

Az oldalak a felezőpontjukban érintik a kört: a sugár a középponttól egy oldal közepéig tart.

## Missing

Az elforgatott raszter: a számként beírt sugár mindig az FKR-rel vízszintes alsó éllel rajzol, ahol az AutoCAD a raszterszöggel (SNAPANG) elfordítja.

## Questions

### Mi az AutoCAD POLIGON parancs angolul?

POLYGON. A rövidítése a magyar AutoCAD-ben is `POL`, akárcsak az angolban: írja be, majd nyomja meg az Enter vagy a Szóköz billentyűt. A teljes `POLIGON` név is működik, a `_POLYGON` pedig az AutoCAD bármely nyelvi változatában.

### Hogyan lehet hatszöget rajzolni az AutoCAD-ben?

Futtassa a POLIGON parancsot, oldalszámként írja be a `6`-ot, adja meg a középpontot, válassza a <Keyword id="Inscribed" /> vagy a <Keyword id="Circumscribed" /> opciót, és írja be a sugarat. A kör köré írt hatszög laptávolsága a beírt sugár kétszerese.

### Mi a különbség a beleírt és a kör köré írt sokszög között?

A <Keyword id="Inscribed" /> opcióval a sokszög csúcsai érintik a kört, így a sokszög a körön belül fér el. A <Keyword id="Circumscribed" /> opcióval az oldalai érintik a kört, így a kör fér el a sokszögön belül. Azonos sugárnál a kör köré írt sokszög a nagyobb.

### Hogyan lehet adott oldalhosszúságú sokszöget rajzolni?

Válassza az <Keyword id="Edge" /> opciót, és adja meg az egyik oldal két végpontját: `0,0`, majd a hosszt hozzá képest relatívan beírva, például `40,0`. A többi oldal az óramutató járásával ellentétesen következik.
