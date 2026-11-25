---
title: "Mértékegységek az AutoCAD-ben: MÉRTEGYS (UNITS) parancs"
metaTitle: "Mértékegységek az AutoCAD-ben: MÉRTEGYS"
description: "Így működik az AutoCAD MÉRTEGYS (UNITS, MES) parancsa: Rajzi mértékegységek párbeszédpanel, 0–8 tizedesjegy, beszúrási lépték mm, cm vagy m. Próbálja ki!"
figure: "MÉRTEGYS megnyitva egy 100 × 60-as alaplap fölött, majd KOORD a túlsó sarkán: a koordináták a rajz pontosságával, két tizedesjeggyel."
sourceHash: "4dd8ca2f4f5c"
---

A MÉRTEGYS (UNITS) parancs megnyitja a Rajzi mértékegységek párbeszédpanelt, amely azt állítja be, hogyan írja ki a rajz a hosszakat, és mit jelent egy rajzi egység. Ahogy az AutoCAD-ben, a párbeszédpanel modális: a parancs addig tart, amíg az OK vagy a Mégse be nem zárja, az OK módosítása egy lépés, amelyet a <Command id="U" /> parancs visszavon, a Mégse vagy az Esc pedig semmit sem változtat. Aposztróffal begépelve (`'MÉRTEGYS`) egy futó parancson belül is megnyílik, és az a parancs a párbeszédpanel bezárása után folytatódik. Az állapotsor Mértékegységek gombja és az alkalmazásmenü Rajzolási segédeszközök ▸ Mértékegységek eleme is megnyitja.

A Hosszúság típusa Tizedes, a Pontossága pedig, 0-tól 8 tizedesjegyig, minden hossz kiírását meghatározza: a koordinátákét, a távolságokét, a területekét, a promptokban felajánlott alapértékekét. Az új rajz itt két tizedesjeggyel indul, míg az AutoCAD metrikus sablonja néggyel. A Beszúrási lépték azt adja meg, mi egy rajzi egység: milliméter, centiméter vagy méter; az állapotsor és a dinamikus bevitel ezt mutatja. A Minta egy pontot mutat a választott pontossággal.

## Missing

A többi hosszúságtípus, az Építészeti, a Mérnöki, a Tört és a Tudományos, valamint a nagyon nagy hosszak tudományos jelölése. A Szög csoport: a szögek tizedes fokban, az óramutató járásával ellentétesen, keletről mérve értendők, az AUPREC által beállított, begépelt pontossággal. A többi beillesztési egység, köztük a hüvelyk és a láb; a Megvilágítás; az Irány; és a -MÉRTEGYS, a parancssori változat.

## Questions

### Mi az AutoCAD MÉRTEGYS parancs angolul?

UNITS. A magyar AutoCAD-ben a rövidítése `MES`, és a `DPMÉRTEGYS` is működik: írja be valamelyiket, majd nyomja meg az Enter vagy a Szóköz billentyűt. Az angol `UN` a magyar változatban nem működik; a teljes `MÉRTEGYS` név igen, a `_UNITS` pedig az AutoCAD bármely nyelvi változatában.

### Hogyan lehet milliméterre vagy méterre állítani a rajzi egységeket?

Indítsa el a MÉRTEGYS parancsot, és a Beszúrási lépték alatt válassza a Milliméter, Centiméter vagy Méter beállítást. Egy rajzi egység ettől még egy egység marad: egy 5 m-es fal méterben 5, milliméterben 5000 hosszúra rajzolandó. A választás azt adja meg, melyik, és az állapotsor és a dinamikus bevitel ezt mutatja.

### Hogyan lehet megváltoztatni a tizedesjegyek számát?

Válassza ki a Pontosságot a MÉRTEGYS parancsban, `0`-tól `0.00000000`-ig. Ez csak azt változtatja meg, hogyan íródnak ki a hosszak, a geometriát soha: a 10,125 hosszúra rajzolt vonal bármilyen pontosság mellett 10,125 hosszú marad.

### Miért nem követik a méretek a MÉRTEGYS parancsban beállított pontosságot?

A méret az értékét a saját méretstílusának pontosságával írja ki, nem a rajzéval. Ezt a <Command id="DIMSTYLE" /> parancsban, az Elsődleges mértékegységek alatt módosíthatja.

### Lehet lábban és hüvelykben rajzolni?

Még nem: a hosszak tizedesek, a beillesztési lépték pedig millimétert, centimétert és métert kínál. Az építészeti és a mérnöki egységek hiányoznak.
