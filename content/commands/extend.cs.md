---
title: "Příkaz PRODLUŽ (EXTEND) v AutoCADu"
description: "Jak v AutoCADu prodloužit úsečku příkazem PRODLUŽ (EXTEND, zkratka PD): rychlý a standardní režim, hraniční hrany, napříč, křížení, Hrana a Shift pro oříznutí."
figure: "Dvě úsečky prodloužené k úsečce, která jim leží v cestě: každá vybraná jednou blízko konce, který roste, v rychlém režimu."
sourceHash: "b2c0044f8e87"
---

Příkaz PRODLUŽ (EXTEND) prodlužuje objekt, dokud nenarazí na jiný: vyberete ho blízko konce, který má růst, a ten konec pokračuje k nejbližší hraně, která mu leží v cestě. Prodlužuje úsečky, oblouky, eliptické oblouky, otevřené křivky (podél jejich koncového segmentu, přímého nebo po jeho oblouku), 3D křivky a otevřené spline. Začíná v rychlém režimu, jako v AutoCADu: hranicí je každý objekt. Výběr s podrženou klávesou Shift místo prodloužení ořezává, jako příkaz <Command id="TRIM" />. Každý výběr je jeden krok, který lze vrátit zpět; Enter příkaz ukončí.

## Options

### Boundary

Určí, které objekty budou hranicemi: vyberte je, nebo stiskněte Enter a vezmou se všechny objekty. Od té chvíle jsou hranicemi jen ony, v každém režimu, až do konce příkazu.

### Fence

Zeptá se na body čáry napříč, kolik chcete, až do Enter: každý objekt, který překříží, se prodlouží od konce bližšího místu křížení, v jednom kroku. Standardní režim tuto možnost uvádí; rychlý režim ji také přijme.

### Crossing

Zeptá se na dva rohy okna: prodlouží se každý objekt, který jeho obrys křižuje, v jednom kroku.

### mOde

Přepíná mezi <Keyword id="Quick" /> a <Keyword id="Standard" />. Ve standardním režimu se příkaz PRODLUŽ nejprve zeptá na hraniční hrany (Enter vezme všechny) a uvádí možnosti <Keyword id="Fence" /> a <Keyword id="Edge" />. Režim je společný pro příkazy PRODLUŽ a OŘEŽ a platí do konce relace.

### Edge

Jen ve standardním režimu. S možností <Keyword id="Extend" /> se objekt zastaví i tam, kde by byla hranice, kdyby pokračovala dál – úsečka oběma směry, oblouk po své kružnici –, takže úsečka může dorůst k takové, která její dráhu nezasáhne; výchozí je <Keyword id="No extend" />.

### Undo

Objeví se v seznamu, jakmile výzva dostala odpověď – výběr, čáru napříč, okno: vrátí poslední prodloužení, a když už není co vracet, řekne to.

## Missing

Promítnutí: volba projekce AutoCADu (Nic, Uss, Pohled) není k dispozici a vše se počítá v průmětu do roviny XY systému USS, což je výchozí nastavení AutoCADu, Uss. Čáru napříč zatím nelze táhnout kurzorem, jen zadat bod po bodu. Režim a volba v možnosti <Keyword id="Edge" /> platí do konce relace, kde je AutoCAD uchovává mezi relacemi. Objekt pod úhlem k USS, kromě spline, není hranicí ani se neprodlouží a křivka vyhlazená možností <Keyword command="PEDIT" id="Fit" /> příkazu <Command id="PEDIT" /> se odmítne, kde AutoCAD prodlouží její poslední oblouk.

## Questions

### Jak se jmenuje příkaz PRODLUŽ anglicky a jakou má zkratku?

EXTEND. V české verzi AutoCADu je jeho zkratka `PD`: zadejte ji a stiskněte Enter nebo mezerník. Anglické `EX` spouští v české verzi příkaz EXTERNÍREFERENCE; `_EXTEND` funguje v AutoCADu v každém jazyce.

### Proč příkaz PRODLUŽ hlásí, že není žádná hrana?

Protože přes dráhu, kterou by ten konec sledoval, nic neleží. Úsečka hlásí <Message id="noEdgeInThatDirection" />, když by její druhý konec hranu zasáhl, a úsečka nebo oblouk jinak <Message id="pathDoesNotIntersectBoundingEdge" />; křivka nebo spline hlásí <Message id="objectDoesNotIntersectEdge" />. Vyberte blíž druhému konci, nebo ve standardním režimu zvolte <Keyword id="Edge" /> a <Keyword id="Extend" />, aby se hranice, která nedosahuje, počítala, jako by pokračovala dál. Kružnici, uzavřenou křivku, celou elipsu, text ani šrafy prodloužit vůbec nelze: <Message id="cannotExtendObject" />

### Jak prodloužit několik úseček najednou?

Klikněte do prázdného místa a zadejte druhý bod: každý objekt, který tato čára napříč překříží, se prodlouží od bližšího konce, v jednom kroku. Nebo zvolte <Keyword id="Crossing" /> a nakreslete okno přes konce, které chcete prodloužit.

### Jak ořezávat příkazem PRODLUŽ?

Vybírejte s podrženou klávesou Shift: kus se ořízne k nejbližším průsečíkům, jako by to udělal příkaz <Command id="TRIM" />, a objekt, který nic nekříží, se odstraní. Další výběr bez klávesy Shift zase prodlužuje.
