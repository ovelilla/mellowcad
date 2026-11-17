---
title: "Kótování v AutoCADu: příkaz KÓTYPŘÍM (DIMLINEAR)"
metaTitle: "Kótování v AutoCADu: příkaz KÓTYPŘÍM"
description: "Jak v AutoCADu kótovat příkazem KÓTYPŘÍM (DIMLINEAR, zkratka KPM): dva body nebo objekt, pak kótovací čára, vodorovná nebo svislá. Vyzkoušejte zdarma online."
figure: "Obdélník okótovaný dvakrát: horní hrana jejími dvěma rohy, pravá hrana přes Enter a výběr hrany."
sourceHash: "e48a0a6f18c9"
---

Příkaz KÓTYPŘÍM (DIMLINEAR) měří vzdálenost mezi dvěma body podél X nebo podél Y a kreslí ji jako kótu: dvě vynášecí čáry, kótovací čáru se šipkami a naměřenou hodnotu nad ní. Zadáte počátek první a druhé vynášecí čáry, pak umístění kótovací čáry, a to umístění určí směr, jako v AutoCADu: nad dvěma body nebo pod nimi měří vodorovně, vedle nich svisle. Můžete také u první výzvy stisknout Enter a vybrat úsečku, oblouk, segment křivky nebo kružnici: počátky jsou pak jeho dva konce, u kružnice její průměr. Příkazový řádek pak vypíše naměřenou hodnotu a příkaz skončí.

Kóta se kreslí v aktuálním kótovacím stylu, v novém výkresu ISO-25: desetinná čárka a žádné koncové nuly, jak to píšou metrické výkresy AutoCADu. Příkazy <Command id="DIMHORIZONTAL" />, <Command id="DIMVERTICAL" /> a <Command id="DIMROTATED" />, dostupné jen z klávesnice, jsou příkaz KÓTYPŘÍM omezený na jeden směr.

## Options

### Text

Zeptá se na text, který se má napsat místo naměřené hodnoty, a tu nabídne jako výchozí: Enter ji ponechá. V zadaném textu zastupuje `<>` naměřenou hodnotu, takže `<> mm` ji napíše i s jednotkou.

### Angle

Zeptá se na úhel textu, který se pak nakreslí pod tímto úhlem místo podél kótovací čáry. 0 ho vrátí podél čáry.

### Horizontal

Měří podél X, ať kótovací čáru umístíte kamkoli, a ta zůstane vodorovná; výzva pak nabízí jen <Keyword id="Text" /> a <Keyword id="Angle" />.

### Vertical

Měří podél Y, ať kótovací čáru umístíte kamkoli, a ta zůstane svislá.

### Rotated

Zeptá se na úhel kótovací čáry, výchozí `0`, a měří vzdálenost mezi počátky v tomto směru. Na šikmé hraně dá její vlastní úhel její délku, jako příkaz <Command id="DIMALIGNED" />.

## Missing

Mtext: text kóty je jeden řádek, nastavený možností <Keyword id="Text" /> na příkazovém řádku, nikdy v textovém editoru. S úhlem nastaveným možností <Keyword id="Angle" /> AutoCAD text vystředí na kótovací čáře; zde zůstane nad ní, stejně jako bez úhlu. Kóta není asociativní: nesleduje objekt, který měří.

## Questions

### Jak se jmenuje příkaz pro lineární kótu anglicky a jakou má zkratku?

Anglicky DIMLINEAR, v české verzi AutoCADu KÓTYPŘÍM: zadejte `KPM` nebo `KOTYPM` a stiskněte Enter nebo mezerník. Funguje i celý název a `_DIMLINEAR` v AutoCADu v každém jazyce; anglické `DLI` a `DIMLIN` v české verzi nefungují.

### Jaké jsou příkazy pro kótování v AutoCADu?

<Command id="DIMLINEAR" /> pro vodorovné a svislé vzdálenosti, <Command id="DIMALIGNED" /> pro vzdálenost podél šikmé hrany, <Command id="DIMRADIUS" /> a <Command id="DIMDIAMETER" /> pro oblouky a kružnice, <Command id="DIMANGULAR" /> pro úhly, <Command id="DIMCONTINUE" /> a <Command id="DIMBASELINE" /> pro řetězy kót, <Command id="DIMSPACE" /> pro vyrovnání jejich rozestupů a <Command id="DIMSTYLE" /> pro jejich vzhled. Příkaz KÓTY z AutoCADu, který vytvoří jakýkoli druh kóty z jedné výzvy, a RKÓTY, který okótuje mnoho objektů najednou, v MellowCAD zatím nejsou.

### Proč kóta nesleduje objekt, když ho změním?

Kóty v MellowCAD zatím nejsou asociativní, jak říká <Message id="nonAssociativeDimension" />: kóta si ponechá body, které dostala. Protáhněte je společně: zachyťte posouvaný konec i počátek kóty, který na něm leží, jedním oknem křížení příkazu <Command id="STRETCH" /> a hodnota se přepočítá; nebo přetáhněte uzel počátku na nové místo.

### Jak změnit velikost textu a šipek kóty?

V kótovacím stylu, jako v AutoCADu: příkaz <Command id="DIMSTYLE" /> (`KSL`) otevře kótovací styly, zde v paletě Styly, v AutoCADu ve Správci kótovacího stylu. Nastavíte tam výšku textu, velikost šipky, celkové měřítko a desetinná místa aktuálního stylu a řídí se jimi každá kóta v tomto stylu.
