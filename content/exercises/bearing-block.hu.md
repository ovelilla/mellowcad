---
title: "AutoCAD 3D gyakorló feladat: csapágybak"
metaTitle: "AutoCAD 3D haladó gyakorló feladat: csapágybak"
description: "Csapágybak modellezése AutoCAD 3D-ben: kihúzás, egyesítés, majd a furat és két csavarfurat kivonása hengerként, lépésről lépésre. 3D szilárdtestek ingyen."
figure: "A csapágybak felülnézetben, 100 × 60, az agy, a furat és a csavarfuratok méretezve."
model: "A csapágybak szilárdtestként, délkeletről nézve, Látványtervi látványstílusban."
sourceHash: "5579d6bd5a86"
---

Modellezze ezt a csapágybakot milliméterben: 100 × 60-as, 12 vastag alaplap 10 sugarú sarkokkal; a közepén 40 átmérőjű, 40 magas agy; az agyon át 20-as furat, az alaplapon át két 10-es csavarfurat, egymástól 76 távolságra. Az alaplapot és az agyat a körvonalukból húzza ki, és egyetlen szilárdtestté egyesíti; a furatok belőle kivont hengerek.

## Steps

### Rajzolja meg a felülnézetet [#plan]

A Körvonal fólián a <Command id="RECTANG" /> parancs a <Keyword command="RECTANG" id="Fillet" /> opcióval, `10` sugárral, a `0,0` ponttól a `100,60` pontig, és egy kör a közepén, az `50,30` pontban, az <Keyword command="CIRCLE" id="Diameter" /> opcióval, `40` átmérővel.

### Húzza ki az alaplapot és az agyat [#extrude]

A <Command id="EXTRUDE" /> paranccsal húzza ki a körvonalat `12`, majd a kört `40` magasra: két szilárdtest lesz belőlük.

### Egyesítse őket [#union]

Az <Command id="UNION" /> parancs: válassza ki mindkettőt, és nyomja meg az Enter billentyűt. Egyetlen szilárdtest lesz belőlük.

### Rajzolja meg a hengereket [#holes]

A furatot és egy csavarfuratot hengerként rajzolja meg a <Command id="CYLINDER" /> paranccsal: a furatot az `50,30` pontban, az <Keyword command="CYLINDER" id="Diameter" /> opcióval `20` átmérővel és `40` magasan; egy csavarfuratot a `12,30` pontban, `10` átmérővel és `12` magasan. Ezután a <Command id="COPY" /> paranccsal másolja a csavarfuratot a `12,30` pontból `76,0` értékkel tovább.

### Vonja ki őket [#subtract]

A <Command id="SUBTRACT" /> parancs: válassza ki a testet, és nyomja meg az Enter billentyűt, majd a három hengert, és ismét Enter. A furatok átmennek a testen.

### Fordítsa el a nézetet [#view]

A <Command id="-VIEW" /> parancs és a <Keyword command="VIEW" id="SEiso" /> opció, az <Command id="VSCURRENT" /> parancs és a <Keyword command="VSCURRENT" id="Conceptual" /> opció, majd a <Command id="ZOOM" /> parancs <Keyword command="ZOOM" id="Extents" /> opciója és `0.8x`, hogy a test kitöltse a képet.
