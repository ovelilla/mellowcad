---
title: "AutoCAD gyakorló feladat: összekötő kar érintőkkel"
metaTitle: "AutoCAD haladó gyakorló feladat: összekötő kar"
description: "Összekötő kar AutoCAD-ben: két agy, mindkettőt érintő vonalakkal összekötve az Érintő tárgyraszterrel, a köztük lévő ívek levágva, és a méretek. Ingyen, online."
figure: "Összekötő kar két, egymástól 90-re lévő aggyal, érintő vonalakkal összekötve, méretezve."
sourceHash: "383984af61b7"
---

Rajzolja meg ezt az összekötő kart milliméterben: két agy egymástól 90 távolságra, 20 és 12 sugárral, 10 és 6 sugarú furattal, mindkettőt érintő vonalakkal összekötve, a vonalak közötti íveket levágva. Az érintő vonalak mindkét végükön az Érintő tárgyrasztert használják; a <Command id="TRIM" /> parancs ezután mindkét agy körét ívvé alakítja.

## Steps

### Rajzolja meg az agyakat [#bosses]

A Körvonal fólián négy kör a <Command id="CIRCLE" /> paranccsal, mindegyik a sugarával megadva: `20` és `10` a `0,0` pontban, `12` és `6` a `90,0` pontban.

### Rajzolja meg az érintő vonalakat [#tangents]

A <Command id="LINE" /> parancs, majd írja be a `_TAN` értéket, az Érintő tárgyrasztert egyetlen pontra, és mutasson a nagy körre a teteje közelében; ismét `_TAN`, és mutasson a kicsire a teteje közelében. A vonal mindkettőt érinti. Ugyanígy alul is.

### Vágja le az íveket [#trim]

A <Command id="TRIM" /> parancs: mutasson mindkét agyra a két vonal között, azon az oldalon, amely a másik agy felé néz. A belső ívek eltűnnek, és mindkét kör ívvé válik.

### Rajzolja meg a középvonalakat [#centreLines]

A Középvonalak fólián a mindkét középponton átmenő tengelyvonal, és mindkét agyon egy-egy keresztirányú vonal.

### Méretezze [#dimensions]

A Méretek fólián a középpontok távolsága a <Command id="DIMLINEAR" />, az agyak sugara a <Command id="DIMRADIUS" />, a furataik a <Command id="DIMDIAMETER" /> paranccsal.
