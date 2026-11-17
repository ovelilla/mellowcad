---
title: "Kóta průměru v AutoCADu: příkaz KÓTYPRŮM (DIMDIAMETER)"
metaTitle: "Kóta průměru v AutoCADu: KÓTYPRŮM"
description: "Jak v AutoCADu okótovat průměr kružnice nebo oblouku příkazem KÓTYPRŮM (DIMDIAMETER, zkratka KPR): vyberte křivku a umístěte kótu dovnitř nebo ven."
figure: "Velká kružnice okótovaná uvnitř a malá vně: vybraná každá kružnice, pak umístěný text."
sourceHash: "76537f5f9854"
---

Příkaz KÓTYPRŮM (DIMDIAMETER) kótuje průměr kružnice, oblouku nebo obloukového segmentu křivky, s výzvami příkazu <Command id="DIMRADIUS" />: vyberte křivku a příkazový řádek hned vypíše naměřenou hodnotu; pak kótu umístěte a příkaz skončí. Jejím textem je průměr za značkou průměru. Umístěná uvnitř kružnice má jednu čáru od textu k šipce na obvodu; umístěná vně přechází čára přes kružnici od okraje k okraji a vzdálenější šipka míří zpět dovnitř z krátkého prodloužení, jak ji kreslí ISO-25.

## Options

### Text

Zeptá se na text, který se má napsat místo naměřené hodnoty, a tu nabídne jako výchozí: Enter ji ponechá. V zadaném textu zastupuje `<>` naměřenou hodnotu i se značkou, takže `4x <>` napíše před průměr „4x“.

### Angle

Zeptá se na úhel textu, který se pak nakreslí pod tímto úhlem, středem na čáře, a čára u něj skončí. 0 ho vrátí podél čáry.

## Missing

Mtext: text kóty je jeden řádek, nastavený možností <Keyword id="Text" /> na příkazovém řádku, nikdy v textovém editoru. Značka se kreslí jako Ø, kde AutoCAD píše ∅: písmo výkresu ∅ nemá. Na oblouku zůstávají šipky mezi jeho konci, kde AutoCAD kreslí obloukovou vynášecí čáru. Stejně jako u příkazu <Command id="DIMRADIUS" /> nelze vybrat křivku uvnitř reference bloku, osy ze stylu se nekreslí a jeho nastavení textu vně křivky nejsou k dispozici. Kóta není asociativní: nesleduje křivku, kterou měří.

## Questions

### Jak se jmenuje příkaz pro kótu průměru anglicky a jakou má zkratku?

Anglicky DIMDIAMETER, v české verzi AutoCADu KÓTYPRŮM: zadejte `KPR` nebo `KOTYPR` a stiskněte Enter nebo mezerník. Funguje i celý název a `_DIMDIAMETER` v AutoCADu v každém jazyce; anglické `DDI` a `DIMDIA` v české verzi nefungují.

### Jak okótovat malý otvor?

Umístěte text vně kružnice: kótovací čára pak otvor přetne, se šipkou na každé straně, a text stojí mimo něj. Uvnitř potřebuje text v kružnici místo.

### Okótuje příkaz KÓTYPRŮM oblouk?

Ano: oblouk nebo obloukový segment křivky, stejně jako kružnici, a vypíše průměr kružnice, ke které oblouk patří. Jakýkoli jiný objekt vyvolá <Message id="notCircleOrArc" /> a otázka se zopakuje.

### Jak přidat ke kótě průměru počet otvorů nebo poznámku?

Před umístěním kóty zvolte <Keyword id="Text" /> a zadejte `4x <>`: `<>` je naměřená hodnota se značkou. U už umístěné kóty text změní řádek „Přepsání textu“ v paletě Vlastnosti.
