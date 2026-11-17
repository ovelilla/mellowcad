---
title: "Kóta poloměru v AutoCADu: příkaz KÓTYRÁDIUS (DIMRADIUS)"
metaTitle: "Kóta poloměru v AutoCADu: KÓTYRÁDIUS"
description: "Jak v AutoCADu okótovat poloměr kružnice, oblouku nebo zaoblení příkazem KÓTYRÁDIUS (DIMRADIUS, KRA): vyberte křivku, umístěte text R dovnitř nebo ven."
figure: "Zaoblený roh desky okótovaný vně a její otvor uvnitř: vybraná každá křivka, pak umístěný text."
sourceHash: "6b1cdea584be"
---

Příkaz KÓTYRÁDIUS (DIMRADIUS) kótuje poloměr kružnice, oblouku nebo obloukového segmentu křivky. Vyberte křivku a příkazový řádek hned vypíše naměřenou hodnotu; pak kótu umístěte a příkaz skončí. Jako v AutoCADu je textem poloměr za písmenem R, na čáře vedené po poloměru, která končí jednou šipkou na křivce, uvnitř nebo vně křivky podle toho, kam kótu umístíte. Vně pokračuje čára přes křivku až do středu, jak ji kreslí ISO-25.

## Options

### Text

Zeptá se na text, který se má napsat místo naměřené hodnoty, a tu nabídne jako výchozí: Enter ji ponechá. V zadaném textu zastupuje `<>` naměřenou hodnotu i s písmenem R, takže `<> max` napíše u poloměru 10 `R10 max`.

### Angle

Zeptá se na úhel textu, který se pak nakreslí pod tímto úhlem, středem na čáře, a čára u něj skončí. 0 ho vrátí podél čáry.

## Missing

Mtext: text kóty je jeden řádek, nastavený možností <Keyword id="Text" /> na příkazovém řádku, nikdy v textovém editoru. Na oblouku zůstává šipka mezi jeho konci, kde AutoCAD kreslí ke kótě umístěné za nimi obloukovou vynášecí čáru. Křivku uvnitř reference bloku nelze vybrat. Osy ze stylu (záporná velikost středové značky) se nekreslí a jeho nastavení textu vně křivky nejsou k dispozici: text vede vždy podél čáry, bez vodorovného ramene, jak ho kreslí ISO-25. Kóta není asociativní: nesleduje křivku, kterou měří.

## Questions

### Jak se jmenuje příkaz pro kótu poloměru anglicky a jakou má zkratku?

Anglicky DIMRADIUS, v české verzi AutoCADu KÓTYRÁDIUS: zadejte `KRA` nebo `KOTYRA` a stiskněte Enter nebo mezerník. Funguje i celý název a `_DIMRADIUS` v AutoCADu v každém jazyce; anglické `DRA` a `DIMRAD` v české verzi nefungují.

### Jak okótovat zaoblení nebo zaoblený roh?

Vyberte zaoblení: je to oblouk nebo obloukový segment křivky, jako rohy, které příkaz <Command id="RECTANG" /> zaoblí možností <Keyword command="RECTANG" id="Fillet" />, a příkaz KÓTYRÁDIUS přijme obojí.

### Proč nemůžu vybrat objekt, který chci okótovat?

Příkaz KÓTYRÁDIUS přijme kružnici, oblouk nebo obloukový segment křivky, i v zamknuté hladině. Jakýkoli jiný objekt, i elipsa, vyvolá <Message id="notCircleOrArc" /> a otázka se zopakuje; křivku uvnitř reference bloku zatím vybrat nelze.

### Jak přidat ke kótě poloměru poznámku?

Před umístěním kóty zvolte <Keyword id="Text" /> a zadejte `<> max`: `<>` je naměřená hodnota s písmenem R, takže kóta zní `R10 max`. U už umístěné kóty text změní řádek „Přepsání textu“ v paletě Vlastnosti.
