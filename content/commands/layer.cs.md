---
title: "Hladiny v AutoCADu: příkaz HLADINA (LAYER)"
description: "Jak pracovat s hladinami v AutoCADu: příkaz HLADINA (LAYER, zkratka HL), Správce vlastností hladin, vytvoření, odstranění, vypnutí a uzamknutí hladiny."
figure: "Tři hladiny, každá nastavená jako aktuální před kreslením v ní: zdi bíle, dveře žlutě, osa červeně s typem čáry Center."
sourceHash: "85620b673df6"
---

Příkaz HLADINA (LAYER) otevře Správce vlastností hladin, ve kterém se hladiny výkresu vytvářejí, pojmenovávají a nastavují. Stejně jako v AutoCADu je to paleta, ne dialog: zůstává otevřená, zatímco kreslíte, zde jako karta panelu palet, dokud ji nezavře příkaz <Command id="LAYERCLOSE" />, a když ho zadáte s apostrofem uvnitř jiného příkazu, otevře se, aniž by ten příkaz ukončil. Každý objekt leží v nějaké hladině a jeho barva, typ čáry a tloušťka čáry, pokud jsou DleHlad, jsou ty, které má hladina. Nové objekty se umisťují do aktuální hladiny.

Každá hladina je jeden řádek se sloupci v pořadí AutoCADu: Stav, se zatržítkem u aktuální hladiny, pak Název, Zap, Zamknout, Barva, Typ čáry a Tloušťka čáry a počet objektů v hladině; řádky jsou seřazené podle názvu. Tlačítko Nová hladina přidá hladinu s barvou, typem čáry a tloušťkou čáry vybrané hladiny, s názvem připraveným k přepsání, a aktuální hladinu nezmění. Nastavit aktuální nebo poklepání na řádek udělá hladinu aktuální. Kliknutí na název vybrané hladiny nebo F2 ji přejmenuje; název, který už existuje nebo obsahuje znaky, které AutoCAD zakazuje, se odmítne, stejně jako přejmenování hladiny 0. Tlačítko Odstranit hladinu ji odstraní, nikdy však hladinu 0, aktuální hladinu ani hladinu s objekty: dialog Hladina – neodstraněna, stejný jako v AutoCADu, uvede, kterou. Každá změna ve správci je krok, který vrátí <Command id="U" />, po sobě jdoucí změny společně. Na příkazovém řádku dělá totéž bez palety -HLADINA, s výzvami AutoCADu, i ve skriptech.

## Missing

Příkaz LAYDEL a ostatní nástroje panelu Hladiny: nastavení hladiny objektu jako aktuální, shoda hladiny, předchozí hladina a další, a také ikony zapnutí, zmrazení a zamknutí v jeho rozevíracím seznamu. Hladiny nelze zmrazit a správce nemá sloupce Zmrazit, Vykreslit, Průhlednost, Styl vykreslování, Zmrazení v novém výřezu ani Popis, nedovolí měnit pořadí sloupců, nemá filtry ani strom hladin ani dialog nastavení. Samotné spuštění příkazu HLADINA není samostatným krokem vrácení. Nová hladina se hned zařadí podle názvu, kdežto AutoCAD ji ukazuje pod vybranou, dokud ji nepřejmenujete, a tloušťka čáry hladiny 0 je 0,25 mm, ne Výchozí. LAYLOCKFADECTL nelze zadat: objekty uzamknuté hladiny jsou vždy ztlumené napůl.

## Questions

### Jak se jmenuje příkaz HLADINA anglicky?

LAYER. V českém AutoCADu jsou jeho zkratky `HL`, `DDLMODES` a `DIAHLAD`: zadejte jednu z nich a stiskněte Enter nebo mezerník. Anglické `LA` v české verzi nefunguje, `DDLMODES` ano; celý název `HLADINA` funguje také a `_LAYER` v AutoCADu v jakémkoli jazyce. Příkaz otevře Správce vlastností hladin a <Command id="LAYERCLOSE" /> ho zavře.

### Jak změnit hladinu objektu?

Vyberte objekt a pak zvolte hladinu v rozevíracím seznamu Hladiny na horní liště: objekt do ní přejde v jednom kroku vrácení a aktuální hladina zůstane, jak byla. Totéž udělá řádek Hladina v paletě Vlastnosti. Když není nic vybráno, rozevírací seznam nastaví zvolenou hladinu jako aktuální.

### Jak odstranit hladinu v AutoCADu?

Vyberte ji ve Správci vlastností hladin a stiskněte Odstranit hladinu. Hladinu 0, aktuální hladinu ani hladinu, ve které jsou objekty, i v definici bloku, odstranit nelze: nejprve vymažte nebo přesuňte její objekty a nastavte jako aktuální jinou hladinu.

### Jaký je rozdíl mezi vypnutím a uzamknutím hladiny?

Vypnutá hladina skryje své objekty: nelze je vybrat ani uchopit a vypadnou z výběru. Objekty uzamknuté hladiny zůstanou vidět, ztlumené, a lze je uchopit i vybrat, ale žádný příkaz je nezmění: když je dostane, spočítá je a vynechá. Vypnutí aktuální hladiny se nejprve zeptá, jako v AutoCADu.

### Jak vytvořit novou hladinu?

Stiskněte Nová hladina ve Správci vlastností hladin a zadejte její název: hladina převezme barvu, typ čáry a tloušťku čáry hladiny vybrané, které pak změníte v jejím řádku. Chcete-li v ní kreslit, nastavte ji jako aktuální.
