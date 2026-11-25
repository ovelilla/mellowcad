---
title: "Styl textu v AutoCADu: příkaz PÍSMO (STYLE)"
description: "Jak příkaz PÍSMO (STYLE, zkratka PSM) v AutoCADu spravuje styly textu: nový, přejmenování, odstranění, nastavení aktuálního, pevná výška."
figure: "Typový štítek: PÍSMO, pak TEXT, jehož Styl ? vypíše styl výkresu, Standard písmem Arial, a jím napsaný název štítku."
sourceHash: "5e9a49c82ada"
---

Příkaz PÍSMO (STYLE) spravuje styly textu výkresu: to, čím se text píše. Každý text, víceřádkový text a atribut má styl a nové dostanou aktuální styl, v novém výkresu Standard. Příkaz PÍSMO otevře dialog Styl textu, stejně jako v AutoCADu. Sada vybraná předem se zahodí, stejně jako ji zahodí dialog, a zadaný s apostrofem uvnitř jiného příkazu, `'PÍSMO`, otevře dialog, aniž by ten příkaz ukončil; ten pokračuje, jakmile se dialog zavře.

Dialog uvede aktuální styl a vypíše styly, Všechny styly nebo jen Používané styly. Nový... se zeptá na název, nabídne `style1`, `style2`… – první volný – a vytvoří kopii vybraného stylu, která se stane aktuální. Tlačítko Aktuální nastaví vybraný styl jako aktuální; F2 upraví jeho název a název, který už se používá, bez ohledu na velikost písmen, se odmítne, stejně jako v AutoCADu. Vymazat odstraní styl, ale nikdy Standard, aktuální styl ani styl, který se používá. Výška dá stylu pevnou výšku, kterou uplatní tlačítko Použít: 0, výchozí hodnota, ji nechá volnou, takže se příkaz <Command id="TEXT" /> pokaždé na výšku zeptá; s nastavenou výškou se příkaz TEXT neptá. Storno zahodí výšku, která nebyla použita, a po první změně se z něj stane Zavřít. Vše, co se v dialogu udělá, je jeden krok, který vrátí <Command id="U" />. Když jsou vybrané texty, řádek Styl v paletě Vlastnosti jim dá jiný styl, v jednom kroku.

## Missing

Náhled v dialogu. Název písma, řez písma a velké písmo, faktor šířky, úhel sklonu a efekty Vzhůru nohama, Pozpátku a Vertikálně: každý styl se kreslí písmem Arial, bez sklonu, s faktorem šířky 1. Poznámkové styly a styl Annotative, který má nový výkres AutoCADu vedle stylu Standard. Příkaz `-PÍSMO`, který se na vše ptá v příkazovém řádku.

## Questions

### Jak se jmenuje příkaz PÍSMO anglicky?

STYLE. V české verzi AutoCADu zadejte `PÍSMO` nebo zkratku `PSM` a stiskněte Enter nebo mezerník; funguje i `DIAPÍSMO`, zatímco zkratka `ST` z anglické verze spouští v české příkaz SHADEMODE. `_STYLE` funguje v AutoCADu v každém jazyce.

### Jak v AutoCADu změnit styl textu?

Pro nový text nastavte styl jako aktuální tlačítkem Aktuální v dialogu, který otevře příkaz PÍSMO, nebo možností <Keyword command="TEXT" id="Style" /> příkazu <Command id="TEXT" />. U textu, který už je napsaný, ho vyberte a zvolte styl v řádku Styl palety Vlastnosti.

### Jak změnit písmo stylu textu?

V AutoCADu v poli Název písma dialogu Styl textu. Zde zatím ne: každý styl se kreslí písmem Arial a styly se liší jen názvem a výškou.

### Proč se příkaz TEXT neptá na výšku?

Aktuální styl má vlastní výšku. Nastavte jeho výšku v dialogu Styl textu na 0, pak klikněte na Použít a <Command id="TEXT" /> se na výšku zeptá znovu a nabídne naposledy použitou.
