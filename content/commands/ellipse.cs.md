---
title: "Příkaz ELIPSA (ELLIPSE) v AutoCADu"
description: "Jak v AutoCADu nakreslit elipsu příkazem ELIPSA (ELLIPSE, zkratka EL): osa a druhá poloosa, ze středu, natočením, eliptický oblouk. Vyzkoušejte zdarma online."
figure: "Elipsa dvěma konci osy, elipsa ze středu a polovina eliptického oblouku, od 0 do 180 stupňů."
sourceHash: "2ee0d1b3a8a4"
---

Příkaz ELIPSA (ELLIPSE) kreslí elipsu ze dvou konců jedné osy a pak ze vzdálenosti od jejího středu ke konci druhé osy, tedy z poloviny délky druhé osy. Delší může být kterákoli z os. Je to skutečná elipsa, jako v AutoCADu, ne křivka, takže na ní fungují uchopení Střed, Kvadrant a Nejbližší a její uzly ji posouvají a nastavují každou poloosu. Zatímco zadáváte druhý konec, vede od prvního jantarová čárkovaná čára; při zadávání vzdálenosti sleduje elipsa kurzor. Elipsa vznikne v aktuální hladině, s vlastnostmi aktuálními v okamžiku, kdy se dokončí.

## Options

### Arc

Nakreslí eliptický oblouk: stejné výzvy jako u elipsy, pak počáteční a koncový úhel, proti směru hodinových ručiček od konce první zadané osy.

### Center

Začne od středu: pak konec jedné osy, pak vzdálenost k druhé.

### Rotation

Místo vzdálenosti: úhel, o který je elipsa natočená kolem své první osy, jako kružnice viděná pod tímto úhlem. 0 nakreslí kružnici; úhel, který se od 90 liší o méně než 0,6 stupně, se odmítne zprávou <Message id="invalid" />.

### Parameter

V oblouku místo počátečního nebo koncového úhlu: úhel na kružnici, ze které se elipsa kreslí, tedy parametr AutoCADu. <Keyword id="Angle" /> se vrátí k úhlům.

### Included angle

V oblouku místo koncového úhlu: úhel, který oblouk opíše od začátku. Enter přijme 180, polovinu elipsy.

## Missing

Možnost Izokruh, kterou AutoCAD nabízí jen s izometrickým stylem krokování, který zde není. PELLIPSE 1, elipsa nakreslená jako křivka. Šrafování a kótování elipsy a uchopení Průsečík, Tečna a Kolmo na ní. Šipkové uzly na koncích eliptického oblouku, zde kreslené jako čtvercové, a zadání délky nebo úhlu při aktivním uzlu. Bod se souřadnicí Z se u vzdálenosti měří v půdorysu, kde ho AutoCAD měří v prostoru.

## Questions

### Jak se jmenuje příkaz ELIPSA anglicky a jakou má zkratku?

ELLIPSE. Zkratka je v české verzi AutoCADu stejná jako v anglické, `EL`: zadejte ji a stiskněte Enter nebo mezerník. Funguje i celý název a `_ELLIPSE` v AutoCADu v každém jazyce.

### Jak v AutoCADu nakreslit polovinu elipsy?

Zvolte <Keyword id="Arc" />, zadejte osu a vzdálenost a pak počáteční úhel `0` a koncový úhel `180`. Nebo stiskněte Enter u možnosti <Keyword id="Included angle" />, která ve výchozím nastavení opíše 180°.

### Jak nakreslit elipsu ze středu?

Zvolte <Keyword id="Center" />, zadejte střed, pak konec jedné osy a pak vzdálenost od středu ke konci druhé: to jsou dvě poloosy elipsy.

### Jak v AutoCADu nakreslit izometrickou kružnici?

AutoCAD ji kreslí možností Izokruh příkazu ELIPSA, když je styl krokování izometrický. Ani jedno v MellowCAD zatím není.
