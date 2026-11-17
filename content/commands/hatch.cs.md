---
title: "Šrafování v AutoCADu: příkaz ŠRAFY (HATCH)"
metaTitle: "Šrafování v AutoCADu: příkaz ŠRAFY (HATCH)"
description: "Jak v AutoCADu šrafovat příkazem ŠRAFY (HATCH), výzvu po výzvě: bod uvnitř nebo hraniční objekty, vzor, měřítko, úhel, ostrůvky. Vyzkoušejte zdarma online."
figure: "Obdélník s kružnicí uvnitř, vyšrafovaný vzorem ANSI31 z jednoho bodu uvnitř: kružnice zůstane prázdná jako ostrůvek."
sourceHash: "edf4b860d8cb"
---

Příkaz ŠRAFY (HATCH) vyplní uzavřenou oblast vzorem čar nebo plnou výplní. Vyberte bod uvnitř oblasti a příkaz najde její hranici v objektech kolem ní a to, co leží uvnitř, ponechá prázdné jako ostrůvek – kružnici v obdélníku, text; nebo vyberte objekty, které oblast ohraničují. Vyberte tolik oblastí, kolik chcete: Enter nebo Esc z nich všech vytvoří jednu šrafu, v aktuální hladině, pod její hranicí. Celý příkaz je jeden krok, který lze vrátit zpět.

Příkaz ŠRAFY v AutoCADu nastavuje vzor na kontextové kartě Vytváření šraf nebo v dialogu, které MellowCAD nemá: zde se na příkazovém řádku ptá na to, na co se ptá příkaz <Command id="-HATCH" />, vzor v možnosti <Keyword id="Properties" />. Oba příkazy se liší jen klávesou Esc, která v příkazu <Command id="-HATCH" /> oblasti zahodí. Každá šrafa začíná se vzorem, měřítkem a úhlem, které dostala poslední: v novém výkresu ANGLE, v měřítku 1 a pod úhlem 0.

## Options

### Properties

Zeptá se na název vzoru, velkými i malými písmeny, a nabídne aktuální: <Keyword id="Solid" /> oblast plně vyplní a <Keyword id="?" /> vypíše seznam vzorů s jejich popisy a vrátí se k bodu. U vzoru se pak zeptá na měřítko – číslo větší než 0, nebo dva body, mezi nimiž se měří – a na úhel, zadaný nebo dvěma body. Další šrafa si ponechá všechny tři.

<Session name="hatchPatterns" caption="SOLID a jedenáct vzorů z acadiso.pat, každý vyšrafovaný ve čtverci o straně 30 v měřítku 1, AR-CONC a AR-SAND v měřítku 0,08 a 0,1." />

### Select objects

Místo bodu uvnitř vyberte objekty, které oblast ohraničují; Enter se vrátí k bodu. Objekt, který žádnou oblast neuzavírá, se vynechá; když žádný z nich oblast neohraničuje, Enter vypíše <Message id="unableToHatchBoundary" /> a nic nevytvoří. Oblast vytvořená příkazem <Command id="REGION" /> dá svůj obrys a její otvory ostrůvky.

### Undo

Ve výzvě uvedena není, ale přijme se tam: vrátí oblasti naposledy vybraného bodu a zeptá se znovu, přičemž vybrané objekty ponechá. Vypíše <Message id="noBoundaryToUndo" />, když už není žádný bod k vrácení.

## Missing

Elipsy a spline jako hranice: oblast, kterou uzavírají, se nenajde a oblast vytvořená příkazem OBLAST s takovou hranou se vynechá. Tolerance mezer (HPGAPTOL): oblast musí být přesně uzavřená. Asociativní šrafy, styly ostrůvků Normální a Ignorovat, gradienty, uživatelsky definované vzory a ostatní vzory z acadiso.pat, které přinášejí i s jejich čarami jen šrafy ze souboru DXF. Ostatní možnosti příkazu -ŠRAFY: nakreslení hranice, odebrání hranic, Pokročilé, pořadí kreslení, počátek, popisná šrafa, barva, hladina a průhlednost. Příkaz ŠRAFEDIT a Editor šraf, které v AutoCADu otevře dvojklik. MIRRHATCH 1: zrcadlená šrafa si vždy ponechá úhel svého vzoru. Nabídky uzlů šrafy.

## Questions

### Jak se jmenuje příkaz ŠRAFY anglicky a jakou má zkratku?

HATCH. V české verzi AutoCADu jsou jeho zkratky `HS` a `SF`: zadejte jednu z nich a stiskněte Enter nebo mezerník. Anglické `H` a `BH` v české verzi nefungují; `_HATCH` funguje v AutoCADu v každém jazyce. Bez karty Vytváření šraf se příkaz ptá na příkazovém řádku, stejně jako `-HS` (<Command id="-HATCH" />).

### Proč šrafování v AutoCADu nefunguje?

Nejčastěji proto, že oblast není uzavřená: příkaz vypíše <Message id="hatchNoBoundary" /> a stačí i nejmenší mezera, protože nic ji nepřemostí. Uzavřete obrys a vyberte znovu. Oblast uzavřená elipsou nebo spline se zatím nenajde a objekty ve vypnuté hladině se neberou v úvahu.

### Jaké jsou šrafovací vzory a dají se stáhnout další?

Výběr z acadiso.pat, metrického souboru vzorů AutoCADu: SOLID, ANGLE, ANSI31 až ANSI38, AR-CONC, AR-SAND, BRICK, CROSS, DASH, DOTS, EARTH, HONEY, LINE, NET, NET3, SQUARE, STEEL a ZIGZAG. <Keyword id="?" /> v možnosti <Keyword id="Properties" /> je vypíše. Vlastní ani stažený soubor vzorů zatím nelze načíst, ale šrafy ze souboru DXF se otevřou se vzorem, který obsahují, ať je jakýkoli, tak jak je kreslí AutoCAD.

### Jak v AutoCADu změnit měřítko šrafy?

Před výběrem, v možnosti <Keyword id="Properties" />: měřítko následuje po názvu vzoru. U už vytvořené šrafy ji vyberte a přepište „Měřítko“ v paletě Vlastnosti, nebo jí dejte vzor, měřítko a úhel jiné šrafy příkazem <Command id="MATCHPROP" />. Tak malé měřítko, že by vzor potřeboval příliš mnoho čar, vyvolá <Message id="hatchTooDense" /> a šrafa nevznikne.

### Jak zjistit plochu šrafy?

Vyberte ji a přečtěte „Plochu“ ve skupině „Geometrie“ palety Vlastnosti, bez ostrůvků; při několika vybraných šrafách je sečte „Kumulativní oblast“. Nebo spusťte příkaz <Command id="AREA" />, zvolte <Keyword command="AREA" id="Object" /> a vyberte šrafu.
