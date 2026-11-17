---
title: "Styl textu v AutoCADu: příkaz PÍSMO (STYLE)"
description: "Jak příkaz PÍSMO (STYLE, zkratka PSM) v AutoCADu spravuje styly textu: nový, přejmenování, odstranění, nastavení aktuálního, pevná výška."
figure: "Typový štítek: PÍSMO, pak TEXT, jehož Styl ? vypíše styl výkresu, Standard písmem Arial, a jím napsaný název štítku."
sourceHash: "8c15a1a95e66"
---

Příkaz PÍSMO (STYLE) spravuje styly textu výkresu: to, čím se text píše. Každý text, víceřádkový text a atribut má styl a nové dostanou aktuální styl, v novém výkresu Standard. V AutoCADu otevře příkaz PÍSMO dialog Styl textu; MellowCAD ho zatím nemá, takže PÍSMO otevře tabulku Text v paletě Styly, kde jsou i kótovací styly příkazu <Command id="DIMSTYLE" />. Sada vybraná předem se zahodí, stejně jako ji zahodí dialog, a zadaný s apostrofem uvnitř jiného příkazu, `'PÍSMO`, otevře paletu, aniž by ten příkaz ukončil.

Tabulka vypíše styly a označí aktuální. Nový vytvoří kopii vybraného stylu s názvem `style1`, `style2`… – prvním volným – a nastaví ji jako aktuální. Nastavit aktuální nastaví styl jako aktuální; název stylu lze přepsat a název, který už se používá, bez ohledu na velikost písmen, se odmítne, stejně jako v AutoCADu. Odstranit odstraní styl, ale nikdy Standard, aktuální styl ani styl, který se používá. Výška dá stylu pevnou výšku: 0, výchozí hodnota, ji nechá volnou, takže se příkaz <Command id="TEXT" /> pokaždé na výšku zeptá; s nastavenou výškou se příkaz TEXT neptá. Každá změna je krok, který vrátí <Command id="U" />. Když jsou vybrané texty, řádek Styl v paletě Vlastnosti jim dá jiný styl, v jednom kroku.

## Missing

Dialog Styl textu a jeho náhled: PÍSMO místo něj otevře paletu Styly. Název písma, řez písma a velké písmo, faktor šířky, úhel sklonu a efekty Vzhůru nohama, Pozpátku a Vertikálně: každý styl se kreslí písmem Arial, bez sklonu, s faktorem šířky 1. Poznámkové styly a styl Annotative, který má nový výkres AutoCADu vedle stylu Standard. Příkaz `-PÍSMO`, který se na vše ptá v příkazovém řádku.

## Questions

### Jak se jmenuje příkaz PÍSMO anglicky?

STYLE. V české verzi AutoCADu zadejte `PÍSMO` nebo zkratku `PSM` a stiskněte Enter nebo mezerník; funguje i `DIAPÍSMO`, zatímco zkratka `ST` z anglické verze spouští v české příkaz SHADEMODE. `_STYLE` funguje v AutoCADu v každém jazyce.

### Jak v AutoCADu změnit styl textu?

Pro nový text nastavte styl jako aktuální v paletě Styly, kterou otevře příkaz PÍSMO, nebo možností <Keyword command="TEXT" id="Style" /> příkazu <Command id="TEXT" />. U textu, který už je napsaný, ho vyberte a zvolte styl v řádku Styl palety Vlastnosti.

### Jak změnit písmo stylu textu?

V AutoCADu v poli Název písma dialogu Styl textu. Zde zatím ne: každý styl se kreslí písmem Arial a styly se liší jen názvem a výškou.

### Proč se příkaz TEXT neptá na výšku?

Aktuální styl má vlastní výšku. Nastavte jeho výšku v paletě Styly na 0 a <Command id="TEXT" /> se na výšku zeptá znovu a nabídne naposledy použitou.
