---
title: "Kótování v AutoCADu: úhlová kóta, příkaz KÓTYÚHEL (DIMANGULAR)"
metaTitle: "Kótování v AutoCADu: úhlová kóta, KÓTYÚHEL"
description: "Jak okótovat úhel v AutoCADu příkazem KÓTYÚHEL (DIMANGULAR, zkratka KUH): dvě úsečky, oblouk, kružnice nebo tři body, pak umístění kótovacího oblouku."
figure: "Dvě úsečky svírající úhel 30 stupňů: vybraná každá z nich, pak kótovací oblouk umístěný mezi ně."
sourceHash: "30943abd60f6"
---

Příkaz KÓTYÚHEL (DIMANGULAR) kótuje úhel a jeho kótovací čarou je oblouk. Co vyberete jako první, rozhodne o zbytku, jako v AutoCADu: úsečka si řekne o druhou úsečku (mohou to být i dva segmenty jedné křivky); oblouk se měří od konce ke konci kolem svého středu; kružnice od bodu, ve kterém jste ji vybrali, k druhému bodu, který zadáte; a Enter místo výběru se zeptá na vrchol úhlu, pak na jeho dva koncové body. Pak umístěte oblouk: jeho poloha určí měřený úhel. Mezi dvěma úsečkami je to ten ze čtyř výsečí, ve kterém oblouk leží; jinak samotný úhel nebo, za jeho rameny, úhel větší než 180°, který ho doplňuje do 360°. Příkazový řádek vypíše hodnotu ve stupních a příkaz skončí.

## Options

### Text

Zeptá se na text, který se napíše místo naměřené hodnoty, a nabídne ji jako výchozí: Enter ji ponechá. V zadaném textu zastupuje `<>` naměřenou hodnotu.

### Angle

Zeptá se na úhel textu, který se pak kreslí pod tímto úhlem místo podél kótovacího oblouku. 0 ho vrátí podél oblouku.

## Missing

Mtext: text kóty je jeden řádek, nastavený možností <Keyword id="Text" /> na příkazovém řádku. Kvadrant, který kótu přiřadí jedné výseči, aby její text mohl stát mimo ni. Úhlové jednotky jiné než desetinné stupně (DIMAUNIT). Úhlovou kótu nelze řetězit ani rozmístit: <Command id="DIMCONTINUE" />, <Command id="DIMBASELINE" /> a <Command id="DIMSPACE" /> berou jen přímé a šikmé kóty. Úsečku ani oblouk uvnitř reference bloku nelze vybrat. Mezi dvěma úsečkami si kóta pamatuje body, kde je její oblouk protnul, ne samotné úsečky: když ji později posunete, vede vynášecí čáry od těchto bodů, kdežto AutoCAD měří znovu vůči úsečkám. Kóta není asociativní: nesleduje objekty, které měří.

## Questions

### Jak se jmenuje příkaz pro úhlovou kótu anglicky a jakou má zkratku?

Anglicky DIMANGULAR, v českém AutoCADu KÓTYÚHEL: zadejte `KUH` nebo `KOTYUH` a stiskněte Enter nebo mezerník. Funguje i celý název a `_DIMANGULAR` v AutoCADu v jakémkoli jazyce; anglické `DAN` a `DIMANG` v českém AutoCADu nefungují.

### Jak okótovat úhel větší než 180 stupňů?

Na první výzvu stiskněte Enter, zadejte vrchol a dva koncové body a pak umístěte oblouk mimo úhel mezi nimi: změří se úhel větší než 180°, tedy 360° bez vnitřního úhlu. S obloukem nebo kružnicí je to stejné. Mezi dvěma úsečkami je úhel vždy menší než 180°.

### Jak v AutoCADu okótovat úhel oblouku?

Na první výzvu vyberte oblouk: jeho střed je vrchol a jeho konce počátky vynášecích čar, takže další otázka už je, kam kótu umístit.

### Proč KÓTYÚHEL hlásí, že jsou úsečky rovnoběžné?

Dvě rovnoběžné úsečky nebo tatáž úsečka vybraná dvakrát úhel netvoří: <Message id="dimLinesParallel" />, a příkaz skončí.

### Jak změnit počet desetinných míst úhlové kóty?

V kótovacím stylu: <Command id="DIMSTYLE" /> (`KSL`) ho otevře v paletě Styly, kde je nastaví Přesnost úhlových kót v části Primární jednotky, 0 v ISO-25. Řídí se jí každá úhlová kóta v tomto stylu.
