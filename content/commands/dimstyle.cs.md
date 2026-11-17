---
title: "Kótovací styl v AutoCADu: příkaz KÓTYSTYL (DIMSTYLE)"
metaTitle: "Kótovací styl v AutoCADu: KÓTYSTYL"
description: "Jak v AutoCADu nastavit kótovací styl: KÓTYSTYL (DIMSTYLE, zkratka KSL), styly od ISO-25, výška textu, šipky, měřítko a jednotky. Vyzkoušejte zdarma online."
figure: "Kóty nakreslené v ISO-25, aktuálním stylu: šipky, text nad čarou a čárka jako desetinný oddělovač."
sourceHash: "a363c0740c11"
---

Příkaz KÓTYSTYL (DIMSTYLE) spravuje kótovací styly výkresu: pojmenované sady nastavení – velikost šipky, výška textu, celkové měřítko, jednotky a další –, které každá kóta přebírá ze svého stylu. Nový výkres začíná s aktuálním stylem ISO-25, metrickým stylem, se kterým začíná i AutoCAD. Kde AutoCAD otevře dialog Správce kótovacího stylu, otevře zde příkaz KÓTYSTYL tabulku kót v paletě Styly, kartu panelu palet, který zůstává otevřený při kreslení; příkaz <Command id="STYLE" /> otevře tutéž paletu na textových stylech.

Paleta zobrazuje seznam stylů s vyznačeným aktuálním. „Nový“ vytvoří kopii vybraného stylu, pojmenovanou podle něj, a nastaví ji jako aktuální; styl se přejmenuje v seznamu a název, který už existuje, se odmítne. ISO-25, aktuální styl a používaný styl nelze odstranit. Pod seznamem jsou nastavení vybraného stylu seskupena pod názvy karet správce: „Čáry“ (odsazení základny, přesah za kótovací čáru, odsazení od počátku), „Symboly a šipky“ (velikost šipky, velikost středové značky), „Text“ (výška textu, odsazení od kótovací čáry), „Přizpůsobit“ (celkové měřítko a to, zda se mezi vynášecími čarami kreslí kótovací čára) a „Primární jednotky“ (přesnost, desetinný oddělovač, potlačení koncových nul, přesnost úhlů). Změna hned překreslí každou kótu v tomto stylu. Každá změna a také každý nový styl, přejmenování, odstranění a změna aktuálního stylu je krok, který vrátí příkaz <Command id="U" />.

## Missing

Samotný dialog Správce kótovacího stylu: paleta nemá náhled, filtr seznamu, tlačítka „Přepsat“ a „Porovnat“ ani popis, nemá podstyly pro jeden druh kót, karty „Alternativní jednotky“ a „Tolerance“ a jen nastavení vyjmenovaná výše. Kótovací proměnná zadaná na příkazovém řádku, například DIMSCALE, nevytvoří přepsání aktuálního stylu. Nový výkres má jen ISO-25, bez stylů Standard a Annotative, které má v AutoCADu i nový metrický výkres.

## Questions

### Jak se jmenuje příkaz KÓTYSTYL anglicky a jakou má zkratku?

DIMSTYLE. V české verzi AutoCADu jsou jeho zkratky `KSL`, `KOTYSL` a `DIAKÓTY`: zadejte jednu z nich a stiskněte Enter nebo mezerník. Anglické `D`, `DST`, `DIMSTY` a `DDIM` v české verzi nefungují; `_DIMSTYLE` funguje v AutoCADu v každém jazyce. Na příkazovém řádku místo něj funguje příkaz <Command id="-DIMSTYLE" />: uloží aktuální nastavení jako nový styl nebo nastaví jako aktuální styl zadaného názvu.

### Jak v AutoCADu změnit velikost textu kót?

Vyberte styl v paletě a změňte „Výšku textu“ ve skupině „Text“ nebo „Použít celkové měřítko“ ve skupině „Přizpůsobit“, které násobí každou velikost stylu, šipky a odsazení spolu s textem. Každá kóta v tomto stylu se hned překreslí. Chcete-li změnit jen některé kóty, dejte jim vlastní styl.

### Jak použít kótovací styl na existující kóty?

Vyberte kóty a zvolte styl v řádku „Kótovací styl“ palety Vlastnosti, nebo na ně klikněte pravým tlačítkem myši a vyberte ho v nabídce „Kótovací styl“: v obou případech je to jeden krok zpět. Nové kóty přebírají aktuální styl, který mění tlačítko „Nastavit aktuální“ v paletě.

### Jak změnit desetinný oddělovač kót?

ISO-25 píše čárku, například `82,5`. Ve skupině „Primární jednotky“ nastavte „Desetinný oddělovač“ na tečku nebo mezeru; jsou tam i „Přesnost“ a „Potlačit koncové nuly“. Příkazový řádek dál vypisuje naměřenou hodnotu s tečkou, stejně jako v AutoCADu.

### Jak vytvořit nový kótovací styl?

Vyberte styl, ze kterého chcete vyjít, a stiskněte „Nový“: kopie dostane název podle něj, stane se aktuální a je připravená k přejmenování a úpravám. Přebírá ji každá kóta nakreslená od té chvíle.
