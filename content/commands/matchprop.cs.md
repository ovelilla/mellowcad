---
title: "Kopírování vlastností v AutoCADu: příkaz KOPIEVLAST (MATCHPROP)"
metaTitle: "Kopírování vlastností v AutoCADu: KOPIEVLAST"
description: "Jak kopírovat vlastnosti v AutoCADu příkazem KOPIEVLAST (MATCHPROP, zkratka KV): hladina, barva, typ a tloušťka čáry, styly. Vyzkoušejte zdarma online."
figure: "Deska a její otvor, svislá osa, červená a s typem čáry Center ve své hladině, a vodorovná úsečka v hladině 0, kterou KOPIEVLAST promění ve stejnou osu."
sourceHash: "603d5ab849b1"
---

Příkaz KOPIEVLAST (MATCHPROP) zkopíruje vlastnosti jednoho objektu na jiné: je to štětec Kopírovat vlastnosti z AutoCADu. Vyberte zdrojový objekt, nebo ho vyberte před příkazem; přijme i objekt v uzamknuté hladině. Pak vypíše, které vlastnosti kopíruje, `Aktuální aktivní nastavení:` a jejich seznam, a zeptá se na cílové objekty: každý výběr kliknutím nebo oknem je hned přetře, dokud příkaz neukončí Enter. Cílový objekt v uzamknuté hladině zůstane, jak je, se zprávou <Message id="matchpropLockedDestination" />. Kurzor nese štětec AutoCADu a celé spuštění je jeden krok, který vrátí <Command id="U" />. Když příkaz zadáte s apostrofem, `'KOPIEVLAST`, běží uvnitř jiného příkazu.

Kopíruje to, co ve výchozím stavu zapíná dialog Nastavení vlastností: hladinu, barvu a tloušťku čáry; typ čáry, kromě šraf, víceřádkového textu a definic atributů; tloušťku; mezi texty styl, výšku a natočení, a z jednoho jednořádkového textu na jiný i zarovnání; mezi kótami kótovací styl; mezi šrafami vzor, měřítko a úhel, ale ne počátek.

## Missing

Možnost Nastavení a její dialog Nastavení vlastností: každá vlastnost, kterou zná, se kopíruje vždy a první výzva možnost Nastavení nenabízí. Měřítko typu čáry, průhlednost a styl vykreslování, které objekty zde nemají; šířky křivky, faktor šířky a úhel sklonu textu a poznámkové vlastnosti. Náhled změny pod kurzorem, který ukazuje AutoCAD.

## Questions

### Jak se jmenuje příkaz KOPIEVLAST anglicky?

MATCHPROP. V českém AutoCADu jsou jeho zkratky `KV`, `FORMÁT` a `PAINTER`: zadejte jednu z nich a stiskněte Enter nebo mezerník. Anglické `MA` v české verzi nefunguje, `PAINTER` ano; celý název `KOPIEVLAST` funguje také a `_MATCHPROP` v AutoCADu v jakémkoli jazyce.

### Jak zkopírovat vlastnosti jedné úsečky na jinou?

Spusťte příkaz KOPIEVLAST, vyberte úsečku, jejíž vlastnosti chcete přenést, pak vyberte úsečky, které je mají převzít, a stiskněte Enter. Přejdou do její hladiny, s její barvou, typem čáry a tloušťkou čáry.

### Proč Kopírovat vlastnosti nefunguje?

Cílový objekt v uzamknuté hladině se nezmění: nejprve hladinu odemkněte. Vlastnost se kopíruje jen mezi objekty, které ji mají: kótovací styl jen na kóty, textový styl jen na texty, vzor jen na šrafy. A typ čáry se na šrafy ani na víceřádkový text nekopíruje, jako v AutoCADu.

### Jak přenést vlastnosti kóty nebo šraf?

Vyberte kótu jako zdroj a jiné kóty jako cíle: převezmou její kótovací styl, s hladinou a barvou. Šrafy předají jiným šrafám svůj vzor, měřítko a úhel a každé si ponechají vlastní počátek.
