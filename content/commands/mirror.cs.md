---
title: "Zrcadlení v AutoCADu: příkaz ZRCADLI (MIRROR)"
description: "Jak zrcadlit objekty v AutoCADu příkazem ZRCADLI (MIRROR, zkratka ZI): dva body osy zrcadlení, ponechání nebo vymazání zdroje, čitelný text. Vyzkoušejte online."
figure: "Uzavřený obrys zrcadlený podle svislé osy zrcadlení, zdroj ponechán."
sourceHash: "fd4b7540311a"
---

Příkaz ZRCADLI (MIRROR) zrcadlí vybrané objekty podle přímky: vyberte je, zadejte první a druhý bod osy zrcadlení a pak určete, zda vymazat zdrojové objekty. Zrcadlový obraz je kopie a s výchozí odpovědí, <Keyword id="No" />, originály zůstanou: tak se kreslí souměrný díl po polovinách. Oba body se berou v rovině XY USS, takže osa nakreslená se zapnutým režimem Orto zrcadlí přímo napříč, vodorovně nebo svisle. Stejně jako v AutoCADu s MIRRTEXT na 0, výchozí hodnotě, se text v zrcadlovém obrazu dál čte zleva doprava a šrafy si ponechají úhel svého vzoru. Celé spuštění je jeden krok, který vrátí <Command id="U" />.

## Options

### Yes

Vymaže zdrojové objekty, takže zůstane jen zrcadlový obraz: převrácení na místě.

### No

Výchozí odpověď: ponechá zdrojové objekty vedle jejich zrcadlového obrazu.

## Missing

MIRRTEXT a MIRRHATCH zůstávají na 0: text se nikdy nezrcadlí tak, aby se četl pozpátku, a vzor šraf se nikdy nezrcadlí. Text uvnitř zrcadlené reference bloku se otočí zpět, aby byl čitelný, jako samostatný text, kdežto AutoCAD ho zrcadlí spolu s blokem. Zrcadlená elipsa si ponechá svou normálu, takže její počáteční a koncový úhel mají jiné hodnoty než v AutoCADu pro tutéž křivku. Zatímco zrcadlový obraz sleduje kurzor, má barvu každého objektu, ale ne jeho typ čáry ani tloušťku čáry.

## Questions

### Jak se jmenuje příkaz ZRCADLI anglicky?

MIRROR. V českém AutoCADu je jeho zkratka `ZI`: zadejte ji a stiskněte Enter nebo mezerník. Anglické `MI` v české verzi nefunguje; celý název `ZRCADLI` funguje také a `_MIRROR` v AutoCADu v jakémkoli jazyce.

### Jak zrcadlit, aby se text nečetl pozpátku?

Nemusíte dělat nic: jako v AutoCADu s MIRRTEXT na 0 se zrcadlený text dál čte normálně a stojí tam, kam padne zrcadlový obraz jeho rámečku.

### Jak zrcadlit a smazat originál?

Odpovězte <Keyword id="Yes" />, když se příkaz ZRCADLI zeptá, zda vymazat zdrojové objekty.

### Jak zrcadlit vodorovně nebo svisle?

Zapněte režim Orto (F8) a zadejte dva body osy zrcadlení podél osy, podle které chcete zrcadlit: svislá osa prohodí levou a pravou stranu, vodorovná horní a dolní.
