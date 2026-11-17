---
title: "Změna měřítka v AutoCADu: příkaz MĚŘÍTKO (SCALE)"
description: "Jak v AutoCADu změnit měřítko objektů příkazem MĚŘÍTKO (SCALE, zkratka ME): základní bod, měřítko, Kopie a Reference ke známé délce."
figure: "Deska s otvorem změněná na kopii možností Reference vzhledem k rohu: určená hrana o délce 40 dostane délku 60."
sourceHash: "005829bf17ad"
---

Příkaz MĚŘÍTKO (SCALE) zvětší nebo zmenší vybrané objekty vzhledem k základnímu bodu, který zůstane na místě: měřítko 2 je zdvojnásobí, 0,5 zmenší na polovinu, stejně ve všech směrech. Vyberte objekty, určete základní bod a pak zadejte měřítko, nebo pohněte kurzorem a klikněte: objekty ho sledují. Enter na tomto místě, bez zapsané hodnoty, použije naposledy zadané měřítko. Každé spuštění je jeden krok, který lze vrátit zpět.

Mění měřítko všeho, co zahrne, stejně jako AutoCAD: vzor šraf roste spolu s hranicí, kóta měří svou novou délku a objekt nad rovinou se vzhledem k základnímu bodu změní i v ose Z.

## Options

### Copy

Změní měřítko kopie a objekty ponechá beze změny: vypíše <Message id="scalingCopy" /> a znovu se zeptá na měřítko, s možností <Keyword id="Copy" /> stále v nabídce.

### Reference

Zeptá se na referenční délku, zapsanou nebo určenou dvěma body, a pak na délku, kterou má mít: měřítko je nová délka dělená referenční. Novou délku zapíšete, nebo ji určíte bodem, jehož vzdálenost od základního bodu ji udává; <Keyword id="Points" /> se místo toho zeptá na dva body a změří vzdálenost mezi nimi. Obě délky nabízejí naposledy zadané, v novém výkresu 1.

## Missing

Enter u prvního nebo druhého bodu možnosti <Keyword id="Points" /> ukončí příkaz beze změny měřítka, zatímco AutoCAD použije hodnotu kurzoru v daném místě. Velmi malé měřítko se použije bez upozornění, zatímco AutoCAD oznámí, že ho ignoruje. Přetahované objekty se kreslí tak, jak je přetahuje <Command id="MOVE" />, jen v jejich barvě.

## Questions

### Jak se jmenuje příkaz MĚŘÍTKO anglicky?

SCALE. V české verzi AutoCADu zadejte `MĚŘÍTKO` nebo zkratku `ME` a stiskněte Enter nebo mezerník; zkratka `SC` z anglické verze v české nefunguje. `_SCALE` funguje v AutoCADu v každém jazyce.

### Jak v AutoCADu změnit měřítko pomocí reference?

U měřítka zvolte <Keyword id="Reference" />, určete dva konce hrany, jejíž délku znáte, a pak zadejte délku, kterou má mít. Všechno vybrané se změní v poměru nové délky ke staré, takže výkres ve špatné velikosti opravíte podle jediného známého rozměru.

### Jak změnit měřítko objektu a zachovat originál?

U měřítka zvolte <Keyword id="Copy" />: měřítko se změní u kopie a originál zůstane na místě.

### Jak změnit měřítko typu čáry?

Ne příkazem MĚŘÍTKO, který mění velikost objektů: <Command id="LTSCALE" /> určuje, jak dlouhé se kreslí čárky a mezery každého typu čáry.

### Jak nastavit měřítko tisku nebo rozvržení?

MellowCAD nemá rozvržení, výřezy ani tisk: kreslíte ve skutečné velikosti v modelovém prostoru a příkaz MĚŘÍTKO mění velikost samotných objektů, ne to, jak by se vytiskly.
