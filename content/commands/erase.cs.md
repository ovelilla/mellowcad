---
title: "Příkaz VYMAŽ (ERASE) v AutoCADu"
description: "Jak v AutoCADu smazat objekty příkazem VYMAŽ (ERASE, zkratka V): výběr, Enter a jsou pryč; klávesa Delete, VŠE a jak vymazané objekty vrátit. Vyzkoušejte to."
figure: "Obdélník a jeho dvě úhlopříčky: vybraná jedna úhlopříčka, pak Enter a je vymazaná."
sourceHash: "2de33971060a"
---

Příkaz VYMAŽ (ERASE) odstraní z výkresu vybrané objekty. Vyberte je u výzvy `Vyberte objekty:`, výběrem nebo kterýmkoli způsobem výběru AutoCADu, mezi nimi oknem nebo křížením, a pak stiskněte Enter nebo mezerník: zmizí a příkaz už nic dalšího neřekne. Esc ho ukončí, aniž by cokoli vymazal. Jako v AutoCADu se objekty vybrané před příkazem vymažou hned a klávesa Delete při vybraných objektech na ně spustí příkaz VYMAŽ. Během výběru se objekt pod kurzorem a už vybrané objekty kreslí vybledle, tak jako AutoCAD ukazuje náhled toho, co vymaže. Celé vymazání je jeden krok, který lze vrátit zpět.

## Missing

Příkaz OBNOV, který v AutoCADu vrátí poslední sadu vymazanou příkazem VYMAŽ, i po jiných příkazech. Zde vymazání vrátí příkaz <Command id="U" /> nebo Ctrl+Z, spolu se vším, co následovalo po něm.

## Questions

### Jak se jmenuje příkaz VYMAŽ anglicky a jakou má zkratku?

ERASE. V české verzi AutoCADu jsou jeho zkratky `V` a `DELETE`: zadejte jednu z nich a stiskněte Enter nebo mezerník. Anglické `E` spouští v české verzi příkaz EKVID (OFFSET); `_ERASE` funguje v AutoCADu v každém jazyce. Můžete také vybrat objekty u výzvy `Příkaz:` a stisknout klávesu Delete.

### Jak vymazat všechno ve výkresu?

Spusťte příkaz VYMAŽ, u výzvy `Vyberte objekty:` zadejte `VŠE` a pak stiskněte Enter. Objekty v uzamknuté hladině se vynechají a výzva výběru uvede, kolik jich bylo.

### Jak vrátit, co jsem vymazal?

Zadejte příkaz <Command id="U" /> nebo hned stiskněte Ctrl+Z: vymazání je jeden krok zpět. Příkaz OBNOV, který vrátí naposledy vymazanou sadu i po jiných příkazech, zatím není.

### Jaký je rozdíl mezi příkazy VYMAŽ a OŘEŽ?

Příkaz VYMAŽ odstraní celé objekty. Příkaz <Command id="TRIM" /> odstraní jen tu část objektu, která přečnívá přes hrany, na které narazí, a zbytek ponechá.
