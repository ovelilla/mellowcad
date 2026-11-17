---
title: "Kótování v AutoCADu: šikmá kóta, příkaz KÓTYSROVNEJ (DIMALIGNED)"
metaTitle: "Kótování v AutoCADu: šikmá kóta, KÓTYSROVNEJ"
description: "Jak okótovat šikmou hranu v AutoCADu příkazem KÓTYSROVNEJ (DIMALIGNED, zkratka KSO): dva body nebo objekt, pak kótovací čára rovnoběžná s nimi."
figure: "Šikmá strana trojúhelníku okótovaná podél své délky: její dva konce, pak umístění kótovací čáry."
sourceHash: "243f7657ed7d"
---

Příkaz KÓTYSROVNEJ (DIMALIGNED) měří skutečnou vzdálenost mezi dvěma body: jeho kótovací čára vede rovnoběžně s přímkou skrz ně, pod jakýmkoli úhlem, kdežto <Command id="DIMLINEAR" /> měří jen podél X nebo Y. Jeho výzvy jsou ty příkazu <Command id="DIMLINEAR" />: počátek první a druhé vynášecí čáry, nebo Enter a výběr úsečky, oblouku nebo segmentu křivky, jejichž konce se stanou těmito počátky, pak umístění kótovací čáry, na kteroukoli stranu. Vybraná kružnice dá svůj průměr procházející vybraným bodem. Příkazový řádek vypíše naměřenou hodnotu a příkaz skončí.

## Options

### Text

Zeptá se na text, který se napíše místo naměřené hodnoty, a nabídne ji jako výchozí: Enter ji ponechá. V zadaném textu zastupuje `<>` naměřenou hodnotu.

### Angle

Zeptá se na úhel textu, který se pak kreslí pod tímto úhlem místo podél kótovací čáry. 0 ho vrátí podél čáry.

## Missing

Mtext: text kóty je jeden řádek, nastavený možností <Keyword id="Text" /> na příkazovém řádku, nikdy v editoru textu. S úhlem nastaveným možností <Keyword id="Angle" /> AutoCAD text na kótovací čáře vystředí; tady zůstane nad ní, jako bez úhlu. Kóta není asociativní: nesleduje objekt, který měří.

## Questions

### Jak se jmenuje příkaz pro šikmou kótu anglicky a jakou má zkratku?

Anglicky DIMALIGNED, v českém AutoCADu KÓTYSROVNEJ: zadejte `KSO` nebo `KOTYSO` a stiskněte Enter nebo mezerník. Funguje i celý název a `_DIMALIGNED` v AutoCADu v jakémkoli jazyce; anglické `DAL` a `DIMALI` v českém AutoCADu nefungují.

### Jaký je rozdíl mezi KÓTYPŘÍM a KÓTYSROVNEJ?

Na šikmé hraně dá <Command id="DIMLINEAR" /> její šířku nebo výšku, protože jeho kótovací čára je vodorovná nebo svislá; KÓTYSROVNEJ dá její délku, s čarou rovnoběžnou s hranou. Na hraně podél X nebo Y dají oba stejné číslo.

### Jak v AutoCADu okótovat šikmou úsečku?

Příkazem KÓTYSROVNEJ: na první výzvu stiskněte Enter, vyberte úsečku a umístěte kótu na stranu, kterou chcete. Nebo vyberte její dva konce s uchopením Koncový bod, aby počátky byly přesné.

### Jak napsat na kótu vlastní text?

Před umístěním vyberte <Keyword id="Text" /> a zadejte text: `<>` zastupuje naměřenou hodnotu, takže `<> mm` ji napíše i s jednotkou, a Enter bez zadaného textu ponechá samotnou hodnotu. Po umístění ho změní řádek Přepsání textu v paletě Vlastnosti.
