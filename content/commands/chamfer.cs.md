---
title: "Zkosení v AutoCADu: příkaz ZKOS (CHAMFER)"
metaTitle: "Zkosení v AutoCADu: příkaz ZKOS (CHAMFER)"
description: "Jak zkosit roh v AutoCADu příkazem ZKOS (CHAMFER, zkratka ZK): dvě vzdálenosti, dvě úsečky nebo rohy křivky, NKrát, Shift. Vyzkoušejte zdarma online."
figure: "Čtyři úsečky, pak vzdálenost 10 pro obě a NKrát: dva rohy zkosené, dva ponechané ostré."
sourceHash: "e43c5b72ffc8"
---

Příkaz ZKOS (CHAMFER) seřízne roh mezi dvěma úsečkami přímým zkosením. Vyberte první úsečku, pak druhou: každá se ořízne nebo prodlouží ke zkosení, první o první vzdálenost a druhá o druhou, a zkosení je spojí. Funguje na dvou úsečkách, na dvou přímých segmentech křivky nebo na úsečce a křivce, které spojí do jedné křivky. Jako v AutoCADu první řádek uvádí aktuální vzdálenosti, uložené ve výkresu; obě rovné 0, výchozí hodnota, vytvoří ostrý roh, ve kterém se úsečky setkají. Zatímco vybíráte druhou úsečku, roh, který by vznikl, se zobrazuje přes úsečky.

## Options

### Undo

Vrátí zpět poslední zkosení tohoto spuštění a s ním i změnu vzdáleností.

### Polyline

Zeptá se na 2D křivku a zkosí každý její roh, pak uvede, kolik úseček bylo zkoseno a proč některé zkoseny nebyly.

### Distance

Zeptá se na první a druhou vzdálenost zkosení. Druhá nabízí první, takže Enter v tomto místě vytvoří rovnoměrné zkosení, na pravoúhlém rohu pod úhlem 45 stupňů.

### Multiple

Po každém zkosení se znovu ptá na první úsečku, dokud nestisknete Enter nebo Esc.

## Missing

Možnosti úhEl (zkosení zadané jednou vzdáleností a úhlem), Metoda a Ořež: ZKOS vždy pracuje se dvěma vzdálenostmi a úsečky vždy ořízne. V AutoCADu zkosení přebírá měřítko typu čáry druhé úsečky, zde ne.

## Questions

### Jak se jmenuje příkaz ZKOS anglicky a jakou má zkratku?

Anglicky CHAMFER, v českém AutoCADu ZKOS: zadejte `ZK` a stiskněte Enter nebo mezerník. Anglické `CHA` v českém AutoCADu nefunguje; `_CHAMFER` funguje v AutoCADu v jakémkoli jazyce.

### Jak udělat zkosení 45 stupňů v AutoCADu?

Zvolte <Keyword id="Distance" />, zadejte vzdálenost a u druhé stiskněte Enter: na pravoúhlém rohu vytvoří dvě stejné vzdálenosti zkosení pod úhlem 45 stupňů.

### Jaký je rozdíl mezi příkazy ZKOS a ZAOBLI?

ZKOS spojí dvě úsečky přímým zkosením, <Command id="FILLET" /> obloukem tečným k oběma. Oba příkazy úsečky oříznou nebo prodlouží a oba vytvoří ostrý roh při vzdálenosti nebo poloměru 0 nebo s podrženou klávesou Shift u druhé úsečky.

### Proč zkosení v AutoCADu nefunguje?

Příkaz uvede důvod: <Message id="chamferDistanceTooLarge" />, když vzdálenost přesahuje konec úsečky, <Message id="linesParallel" /> u rovnoběžných úseček a <Message id="chamferRequiresLines" /> u oblouku nebo kružnice. Když jsou obě vzdálenosti 0, vytvoří roh, ne zkosení.

### Jak zkosit všechny rohy obdélníku?

Obdélník je křivka: zvolte <Keyword id="Polyline" />, vyberte ho a každý roh se zkosí aktuálními vzdálenostmi.
