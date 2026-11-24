---
title: "Příkaz VZD (DIST) v AutoCADu"
description: "Jak v AutoCADu změřit vzdálenost příkazem VZD (DIST, zkratka VZ): mezi dvěma body, s úhly a přírůstky X, Y a Z, nebo délku řady bodů. Vyzkoušejte zdarma online."
figure: "VZD po úhlopříčce desky 100 × 60: vzdálenost, úhel v rovině XY a přírůstky."
sourceHash: "43624d8b3d78"
---

Příkaz VZD (DIST) měří vzdálenost mezi dvěma body. Vyberte (i s uchopením objektu) nebo zadejte první a druhý bod a příkaz vypíše na příkazovém řádku vzdálenost, úhel v rovině XY a úhel od ní a přírůstky X, Y a Z, a pak skončí. Každý bod se měří tam, kde leží, i se svou souřadnicí Z, takže vzdálenost je skutečná vzdálenost v prostoru. Enter u prvního bodu začne od naposledy zadaného bodu a u druhého změří vzdálenost zpět k prvnímu. Čísla mají přesnost výkresu a úhly AUPREC.

## Options

### Multiple

<Keyword id="Multiple" /> u druhé výzvy: řada bodů místo jednoho úseku; dosavadní vzdálenost se vypíše před každým dalším bodem a zobrazí se nad kurzorem, až do Enter nebo možnosti <Keyword id="Total" />.

### Arc

Měří místo toho po obloucích, s možnostmi oblouku příkazu KŘIVKA: <Keyword id="Angle" />, <Keyword id="Center" />, <Keyword id="Close" />, <Keyword id="Direction" />, <Keyword id="Line" />, <Keyword id="Radius" />, <Keyword id="Second pt" />, <Keyword id="Undo" />. Délka každého oblouku se přičte k řadě.

### Close

Vrátí se k prvnímu bodu, přičte tento poslední úsek, vypíše součet a skončí.

### Length

Přidá úsek zadané délky ve směru posledního.

### Undo

Vrátí poslední bod řady.

### Total

Vypíše součet řady a skončí; Enter udělá totéž.

## Missing

Příkaz MĚŘITGEOM, nástroje Měřit na pásu karet, které kladou otázky příkazu VZD ve smyčce s možnostmi Poloměr, Úhel, Plocha, Objem a Rychlé: zde tlačítko Vzdálenost na pásu karet spustí příkaz VZD. U možnosti <Keyword id="Center" /> možnosti Oblouk se středový úhel čte ve stupních, kde AutoCAD 2027 čte číslo jako vzdálenost ve směru kurzoru.

## Questions

### Jak se jmenuje příkaz VZD anglicky a jakou má zkratku?

DIST. V české verzi AutoCADu je jeho zkratka `VZ`: zadejte ji a stiskněte Enter nebo mezerník. Anglická zkratka `DI` v české verzi nefunguje; `_DIST` funguje v AutoCADu v každém jazyce.

### Jak v AutoCADu změřit vzdálenost?

Zadejte `VZ` a pak vyberte dva body, s uchopením objektu, abyste trefili koncové body nebo středy objektů. Vzdálenost se vypíše na příkazovém řádku spolu s úhlem a přírůstky.

### Jak změřit celkovou délku několika úseků?

U druhého bodu zvolte <Keyword id="Multiple" /> a vybírejte dál: u každého bodu se zobrazí dosavadní vzdálenost a Enter vypíše součet.

### Jak změřit vzdálenost ve 3D?

Zadejte body i s jejich souřadnicí Z nebo je uchopte na objektech v jejich výšce: příkaz VZD změří skutečnou vzdálenost v prostoru a vypíše úhel od roviny XY a přírůstek Z.

### Proč příkaz VZD ukazuje méně desetinných míst, než potřebuji?

Vypisuje délky s přesností výkresu, zde dvě místa v novém výkresu. Nastavte víc, až osm, příkazem <Command id="UNITS" />.
