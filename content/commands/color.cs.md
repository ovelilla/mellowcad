---
title: "Příkaz BARVA (COLOR) v AutoCADu"
metaTitle: "Barva objektů v AutoCADu: BARVA a DleHlad"
description: "Jak nastavit barvu nových objektů v AutoCADu příkazem BARVA (COLOR, zkratka BAR): DleHlad, barva indexu názvem nebo číslem, nebo barva RGB. Vyzkoušejte zdarma."
figure: "Deska nakreslená DleHlad, její otvor červeně, její vývrt v barvě Truecolor 0,128,255, pak BARVA nastavená zpět na DleHlad."
sourceHash: "93793c2915da"
---

Příkaz BARVA (COLOR) nastaví barvu, kterou se kreslí nové objekty. AutoCAD otevře dialog Vybrat barvu; MellowCAD ho zatím nemá, takže BARVA spustí verzi pro příkazový řádek, kterou má i AutoCAD, <Command id="-COLOR" />. Zeptá se na implicitní barvu objektu a nabídne aktuální, v novém výkresu `DLEHLAD`: DleHlad znamená, že každý objekt přebírá barvu své hladiny, a barva zvolená místo toho je vlastní barvou objektu. Zadejte číslo nebo název barvy indexu, nebo zvolte <Keyword id="Truecolor" />. Enter ponechá aktuální barvu a změna je krok, který <Command id="U" /> vrátí zpět.

Slovo, které nedokáže přečíst, vypíše <Message id="colorRequired" />, a 0, záporné číslo nebo číslo nad 255 <Message id="invalidColorNumber" />; výzva se zopakuje. Zadaný s apostrofem uvnitř příkazu, `'BARVA`, způsobí, že každý objekt nakreslený po něm převezme novou barvu: každý segment příkazu <Command id="LINE" /> převezme barvu aktuální v okamžiku, kdy začíná. BARVA nastaví jen to, co vznikne potom; již nakreslené objekty změní paleta Vlastnosti nebo seznam barev na horním panelu.

## Options

### Truecolor

Zeptá se na barvu jako tři hodnoty od 0 do 255, červenou, zelenou a modrou, oddělené čárkami bez mezery: `0,128,255` je středně modrá. Barva, která je zároveň barvou indexu, `255,0,0`, se uloží jako tato barva indexu.

### BYLAYER

Nové objekty přebírají barvu své hladiny, jako na začátku.

### RED

Barva indexu 1, lze ji zadat i jako `1`.

### YELLOW

Barva indexu 2, lze ji zadat i jako `2`.

### GREEN

Barva indexu 3, lze ji zadat i jako `3`.

### CYAN

Barva indexu 4, lze ji zadat i jako `4`.

### BLUE

Barva indexu 5, lze ji zadat i jako `5`.

### MAGENTA

Barva indexu 6, lze ji zadat i jako `6`.

### WHITE

Barva indexu 7, lze ji zadat i jako `7`: bílá na tmavém pozadí a černá na světlém.

## Missing

Dialog Vybrat barvu, knihy barev a zápis HSL. Barvy indexu 8 až 255: přijímají se jen 1 až 7. DleBlok. Barva Truecolor shodná s barvou indexu se uloží jako tato barva indexu, zatímco AutoCAD zachová RGB. Průhlednost (CETRANSPARENCY) a výchozí hodnoty pro jednotlivé typy HPCOLOR, HPLAYER, DIMLAYER a TEXTLAYER.

## Questions

### Jak se jmenuje příkaz BARVA anglicky a jakou má zkratku?

Anglicky COLOR, v českém AutoCADu BARVA: zadejte `BAR` a stiskněte Enter nebo mezerník; funguje i `DIABARVA`. Anglické `COL` v českém AutoCADu nefunguje; celý název funguje také a `_COLOR` v AutoCADu v jakémkoli jazyce.

### Jak změnit barvu objektu v AutoCADu?

Vyberte ho a zvolte barvu v seznamu barev na horním panelu nebo v řádku Barva palety Vlastnosti: změní se v jednom kroku. Nebo zkopírujte barvu jiného objektu příkazem <Command id="MATCHPROP" />. BARVA nastaví jen barvu objektů nakreslených po ní.

### Co znamená DleHlad v AutoCADu?

Že objekt přebírá barvu své hladiny, takže změna barvy hladiny ve Správci vlastností hladin změní každý objekt DleHlad v této hladině. Je to výchozí hodnota, díky které jsou barvy výkresu uspořádané podle hladin: <Command id="LAYER" />.

### Jak používat barvy RGB v AutoCADu?

Zvolte <Keyword id="Truecolor" /> a zadejte tři hodnoty oddělené čárkami, například `0,128,255`.
