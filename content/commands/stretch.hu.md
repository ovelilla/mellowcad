---
title: "AutoCAD NYÚJT (STRETCH) parancs"
description: "Így működik az AutoCAD NYÚJT (STRETCH, NY) parancsa: metszőablak a mozgatandó végpontokra, bázispont és második pont, és miért csak mozgat néha. Próbálja ki!"
figure: "Téglalap és kör 40 egységgel jobbra nyújtva, metszőablakkal a jobb oldalon át: az ablakon belüli sarkok elmozdulnak, és velük a kör is."
sourceHash: "de8671fb4290"
---

A NYÚJT (STRETCH) parancs elmozdítja a rajznak azt a részét, amelyet a metszőablak elkap, és megnyújtja azt, ami ezt a rajz többi részével összeköti. A kijelöléshez jobbról balra húzott metszőablakot vagy metszőpoligont használjon a mozgatandó végpontok és csúcspontok fölött; ezután adjon meg egy bázispontot és egy második pontot, ahogy a <Command id="MOVE" /> parancsban. Amit az ablak elkap, az ekkora távolsággal mozdul el: a vonal végpontjai, a vonallánc csúcspontjai, az ív végpontjai, a sraffozás határa, a méret kezdőpontjai. Ami teljesen az ablakon belül van, az egészben mozdul el; a kör, a szöveg és a blokkreferencia akkor mozdul el, ha a középpontja vagy a beillesztési pontja az ablakon belül van. Az egyenként kijelölt vagy Ablak kijelöléssel talált objektumok szintén egészben mozdulnak el. A nyújtás egyetlen visszavonási lépés.

## Options

### Displacement

A bázispont promptjánál választható, vagy ott az Enter billentyűvel, mert ez az alapérték: az elmozdulást vektorként kéri, a `40,0` 40 egységgel nyújt az X tengely mentén. A második pontnál az Enter ugyanezt teszi a bázisponttal: annak a koordinátái adják az elmozdulást.

## Missing

Az olyan elliptikus ív, amelynek egyik vége az ablakban van, és amelyet az AutoCAD átalakít: itt egészben mozdul el, ha a középpontja az ablakban van, egyébként a helyén marad. A részben elkapott nem asszociatív sraffozás, amelyet az AutoCAD a helyén hagy. A méret alapértelmezett helyén lévő szövege a helyén marad, ha csak azt kapja el az ablak.

## Questions

### Mi az AutoCAD NYÚJT parancs angolul?

STRETCH. A magyar AutoCAD-ben a rövidítése `NY`: írja be, majd nyomja meg az Enter vagy a Szóköz billentyűt. Az angol `S` a magyar változatban a SZÍN parancsot indítja; a teljes `NYÚJT` név működik, a `_STRETCH` pedig az AutoCAD bármely nyelvi változatában.

### Miért csak mozgatja az objektumokat a NYÚJT parancs?

Mert az objektum teljes egészében az ablakon belül van, vagy egyenként jelölte ki: ezeket a NYÚJT parancs egészben mozgatja. Húzzon jobbról balra metszőablakot csak a mozgatni kívánt végpontok fölé.

### Hogyan lehet pontos távolsággal nyújtani?

Adja meg a bázispontot, majd gépelje be az elmozdulást: bekapcsolt dinamikus bevitel mellett a `40,0` a bázisponthoz képest értendő, és 40 egységgel nyújt az X tengely mentén. Vagy mutasson a kurzorral a kívánt irányba Orto móddal vagy poláris követéssel, és csak a távolságot gépelje be.

### Lehet-e blokkot nyújtani az AutoCAD-ben?

A blokkreferencia egészben mozdul el, ha a beillesztési pontja az ablakon belül van, és a helyén marad, ha nincs: a belseje nem nyúlik. Ha a részeit nyújtaná, előbb vesse szét a <Command id="EXPLODE" /> paranccsal.
