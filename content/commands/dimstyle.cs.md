---
title: "Kótovací styl v AutoCADu: příkaz KÓTYSTYL (DIMSTYLE)"
metaTitle: "Kótovací styl v AutoCADu: KÓTYSTYL"
description: "Jak v AutoCADu nastavit kótovací styl: KÓTYSTYL (DIMSTYLE, zkratka KSL), styly od ISO-25, výška textu, šipky, měřítko a jednotky. Vyzkoušejte zdarma online."
figure: "Kóty nakreslené v ISO-25, aktuálním stylu: šipky, text nad čarou a čárka jako desetinný oddělovač."
sourceHash: "7bcae870d3ae"
---

Příkaz KÓTYSTYL (DIMSTYLE) spravuje kótovací styly výkresu: pojmenované sady nastavení – velikost šipky, výška textu, celkové měřítko, jednotky a další –, které každá kóta přebírá ze svého stylu. Nový výkres začíná s aktuálním stylem ISO-25, metrickým stylem, se kterým začíná i AutoCAD. Příkaz KÓTYSTYL otevře Správce kótovacího stylu, stejně jako v AutoCADu; zadaný s apostrofem uvnitř jiného příkazu, `'KÓTYSTYL`, se otevře, aniž by ten příkaz ukončil.

Správce uvede aktuální styl a vypíše styly, „Všechny styly“ nebo jen „Používané styly“. „Nastavit aktuální“ nastaví vybraný styl jako aktuální. „Nový...“ se zeptá na název, nabídne `Kopie` a název stylu, ze kterého vychází, a pak otevře nastavení nového stylu; aktuální se stane, jakmile se správce zavře. „Upravit...“ otevře nastavení vybraného stylu na kartách správce: „Čáry“ (odsazení základny, přesah za kótovací čáru, odsazení od počátku), „Symboly a šipky“ (velikost šipky, středové značky), „Text“ (výška textu, odsazení od kótovací čáry), „Přizpůsobit“ (celkové měřítko a to, zda se mezi vynášecími čarami kreslí kótovací čára) a „Primární jednotky“ (přesnost, desetinný oddělovač, potlačení koncových nul, přesnost úhlů). „OK“ je použije a každá kóta v tomto stylu se hned překreslí. Kliknutím pravým tlačítkem myši na styl se styl přejmenuje nebo vymaže; název, který už existuje, se odmítne a ISO-25, aktuální styl a používaný styl nelze vymazat. Vše, co se ve správci udělá, je jeden krok, který vrátí příkaz <Command id="U" />.

## Missing

Správce nemá náhled, popis ani tlačítka „Přepsat“ a „Porovnat“, nemá podstyly pro jeden druh kót, karty „Alternativní jednotky“ a „Tolerance“ a jen nastavení vyjmenovaná výše. Kótovací proměnná zadaná na příkazovém řádku, například DIMSCALE, nevytvoří přepsání aktuálního stylu. Nový výkres má jen ISO-25, bez stylů Standard a Annotative, které má v AutoCADu i nový metrický výkres.

## Questions

### Jak se jmenuje příkaz KÓTYSTYL anglicky a jakou má zkratku?

DIMSTYLE. V české verzi AutoCADu jsou jeho zkratky `KSL`, `KOTYSL` a `DIAKÓTY`: zadejte jednu z nich a stiskněte Enter nebo mezerník. Anglické `D`, `DST`, `DIMSTY` a `DDIM` v české verzi nefungují; `_DIMSTYLE` funguje v AutoCADu v každém jazyce. Na příkazovém řádku místo něj funguje příkaz <Command id="-DIMSTYLE" />: uloží aktuální nastavení jako nový styl nebo nastaví jako aktuální styl zadaného názvu.

### Jak v AutoCADu změnit velikost textu kót?

Vyberte styl ve správci, stiskněte „Upravit...“ a změňte hodnotu „Výška textu“ na kartě „Text“ nebo „Použít celkové měřítko“ na kartě „Přizpůsobit“, které násobí každou velikost stylu, šipky a odsazení spolu s textem. Každá kóta v tomto stylu se hned překreslí. Chcete-li změnit jen některé kóty, dejte jim vlastní styl.

### Jak použít kótovací styl na existující kóty?

Vyberte kóty a zvolte styl v řádku „Kótovací styl“ palety Vlastnosti, nebo na ně klikněte pravým tlačítkem myši a vyberte ho v nabídce „Kótovací styl“: v obou případech je to jeden krok zpět. Nové kóty přebírají aktuální styl, který mění tlačítko „Nastavit aktuální“ ve správci.

### Jak změnit desetinný oddělovač kót?

ISO-25 píše čárku, například `82,5`. Na kartě „Primární jednotky“ nastavte „Desetinný oddělovač“ na tečku nebo mezeru; jsou tam i „Přesnost“ a „Potlačit koncové nuly“. Příkazový řádek dál vypisuje naměřenou hodnotu s tečkou, stejně jako v AutoCADu.

### Jak vytvořit nový kótovací styl?

Stiskněte „Nový...“, zadejte název a vyberte styl, ze kterého vychází, pak „Pokračovat“: otevře se jeho nastavení a „OK“ ho vytvoří. Aktuální se stane, jakmile se správce zavře, a přebírá ho každá kóta nakreslená od té chvíle.
