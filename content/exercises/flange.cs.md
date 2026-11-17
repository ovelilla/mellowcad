---
title: "Cvičení v AutoCADu: příruba"
metaTitle: "Cvičení v AutoCADu: příruba s drážkou pro pero"
description: "Nakreslete přírubu v AutoCADu: otvor s drážkou pro pero vyříznutou oříznutím, osm otvorů v polárním poli, osy a průměry. Krok za krokem, zdarma online."
figure: "Příruba o průměru 140 s drážkou pro pero, osmi otvory a kótami průměrů."
sourceHash: "32f94d57ae25"
---

Nakreslete tuto přírubu v milimetrech: průměr 140, středový otvor o průměru 60 s drážkou pro pero širokou 16, jejíž dno leží 36 od středu, osm otvorů o průměru 14 na roztečné kružnici o průměru 110 a osy. Drážka je obdélník oříznutý do otvoru; otvory jsou jedna kružnice a polární pole.

## Steps

### Nakreslete kružnice [#circles]

V hladině Obrys dvě kružnice v bodě `0,0`, každá s možností <Keyword command="CIRCLE" id="Diameter" />: `140` a `60`.

### Vyřízněte drážku pro pero [#keyway]

Příkaz <Command id="RECTANG" /> od `-8,20` do bodu o `16,16` dál: protne otvor. Příkaz <Command id="TRIM" /> ořízne objekt tam, kde ho protínají jiné: vyberte oblouk otvoru mezi stranami obdélníku, potom spodní stranu obdélníku uvnitř otvoru. Zbude drážka pro pero: její dvě boční strany a dno.

### Vytvořte pole otvorů [#holes]

Otvor na roztečné kružnici: kružnice v bodě `55<22.5`, 55 od počátku pod úhlem 22,5°, s možností <Keyword command="CIRCLE" id="Diameter" /> `14`. Příkaz <Command id="ARRAYPOLAR" />: vyberte ji, stiskněte Enter a zadejte střed, `0,0`; možnosti <Keyword command="ARRAYPOLAR" id="ASsociative" /> a <Keyword command="ARRAYPOLAR" id="No" /> ponechají osm samostatných kružnic, které lze vybrat při kótování, a <Keyword command="ARRAYPOLAR" id="Items" />, `8`, je rozmístí po celé kružnici. Potom v hladině Osy roztečná kružnice v bodě `0,0`, její průměr `110`.

### Nakreslete osy [#centreLines]

Stále v hladině Osy dvě úsečky příkazem <Command id="LINE" /> středem, dlouhé 156: od `-78,0` o `156,0` vodorovně; od `0,-78` o `0,156` nahoru.

### Okótujte výkres [#dimensions]

V hladině Kóty příkaz <Command id="DIMDIAMETER" /> na středovém otvoru, jednom z malých otvorů, roztečné kružnici a obrysu, každý vybraný tam, kde ho ještě žádná kóta neprotíná, potom příkaz <Command id="DIMLINEAR" /> přes dno drážky: 16.
