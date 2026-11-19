---
title: "AutoCAD 3D gyakorló feladat: szíjtárcsa"
metaTitle: "AutoCAD 3D feladat: szíjtárcsa megforgatással"
description: "Szíjtárcsa modellezése AutoCAD 3D-ben: a félmetszete zárt vonalláncként, az Y tengely körül szilárdtestté forgatva, lépésről lépésre. 3D gyakorlás ingyen."
figure: "A szíjtárcsa félmetszete a tengelye mellett, a tengelytől mért távolságok méretezve."
model: "A szíjtárcsa szilárdtestként, délkeletről nézve, Látványtervi látványstílusban."
sourceHash: "f9c2a81b39fe"
---

Modellezze ezt a szíjtárcsát a félmetszetének a tengelye körüli megforgatásával, milliméterben: 20-as furat, 30 hosszú, 40 átmérőjű agy, 10 vastag tárcsa és 24 széles koszorú 90-től 110-ig terjedő átmérővel, az agyra központosítva. A metszetet a tengelytől mért távolságokként rajzolja meg; a tengely az Y tengely mentén fut, ezért minden átmérőnek a fele kerül a rajzra.

## Steps

### Rajzolja meg a félmetszetet [#profile]

A Körvonal fólián egyetlen zárt vonallánc a <Command id="PLINE" /> paranccsal a `10,0` ponttól, utána minden pont lépésként az előzőtől: `10,0`, `0,10`, `25,0`, `0,-7`, `10,0`, `0,24`, `-10,0`, `0,-7`, `-25,0`, `0,10` és `-10,0`, majd a <Keyword command="PLINE" id="Close" /> opció.

### Fordítsa el a nézetet [#view]

A <Command id="-VIEW" /> parancs és a <Keyword command="VIEW" id="SEiso" /> opció délkeletről és felülről mutatja; az <Command id="VSCURRENT" /> parancs és a <Keyword command="VSCURRENT" id="Conceptual" /> opció árnyalja a lapokat, így látszik legjobban egy esztergált alkatrész.

### Forgassa meg [#revolve]

A <Command id="REVOLVE" /> parancs: válassza ki a metszetet, és nyomja meg az Enter billentyűt, majd válassza az <Keyword command="REVOLVE" id="Y" /> opciót: az Y tengely a szíjtárcsa tengelye. Az Enter elfogadja az alapértelmezett szöget, a teljes fordulatot. A <Command id="ZOOM" /> parancs <Keyword command="ZOOM" id="Extents" /> opciója kitölti vele a képet, a `0.8x` lépték pedig helyet hagy körülötte.
