---
title: "AutoCAD 3D gyakorló feladat: szerelőlap"
metaTitle: "AutoCAD 3D feladat kezdőknek: szerelőlap"
description: "Szerelőlap modellezése AutoCAD 3D-ben: lemezek, a furatok kivonása és egyetlen kihúzás adja a szilárdtestet, lépésről lépésre. Gyakorolja a 3D-t ingyen, online."
figure: "A lap körvonala, 100 × 60, négy furattal, méretezve."
model: "A lap 10 vastag szilárdtestként, délkeletről nézve, takart vonalak nélkül."
sourceHash: "87b8f906b0fd"
---

Modellezzen egy 10 vastag szerelőlapot milliméterben: a körvonala 100 × 60, 8 sugarú sarkokkal, és négy 10-es furat, amelyek középpontja 15-re van a szélektől. Síkban kezdődik. A körvonalból és a körökből lemezek lesznek, a furatokat még a sík lapból vonja ki, és egyetlen kihúzás teszi szilárdtestté, a furataival együtt.

## Steps

### Rajzolja meg a profilt [#profile]

A Körvonal fólián a <Command id="RECTANG" /> parancs a <Keyword command="RECTANG" id="Fillet" /> opcióval, `8` sugárral, a `0,0` ponttól a `100,60` pontig. Ezután egy kör a `15,15` pontban az <Keyword command="CIRCLE" id="Diameter" /> opcióval, `10` átmérővel, és a <Command id="COPY" /> paranccsal másolja a középpontjától a `70,0`, a `70,30` és a `0,30` pontba.

### Hozzon létre lemezeket [#region]

A <Command id="REGION" /> parancs a zárt objektumokat lemezzé alakítja: válassza ki a körvonalat és a négy kört, majd Enter. Öt hurok, öt lemez.

### Vonja ki a furatokat [#subtract]

A <Command id="SUBTRACT" /> parancs: válassza ki a lap lemezét, és nyomja meg az Enter billentyűt, majd a négy kör lemezét, és Enter. Egyetlen lemez marad, benne négy furattal.

### Fordítsa el a nézetet [#view]

A <Command id="-VIEW" /> parancs és a <Keyword command="VIEW" id="SEiso" /> opció délkeletről és felülről mutatja; az <Command id="VSCURRENT" /> parancs és a <Keyword command="VSCURRENT" id="Hidden" /> opció elrejti, amit a lapok eltakarnak. A ViewCube is elfordítja a nézetet egy kattintással.

### Húzza ki [#extrude]

A <Command id="EXTRUDE" /> parancs: válassza ki a lemezt, nyomja meg az Enter billentyűt, és írja be a magasságot, `10`. A lap szilárdtest lett, a furataival együtt. A <Command id="ZOOM" /> parancs <Keyword command="ZOOM" id="Extents" /> opciója kitölti vele a képet, a `0.8x` lépték pedig helyet hagy körülötte.
