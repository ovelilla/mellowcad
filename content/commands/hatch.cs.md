---
title: "Šrafování v AutoCADu: příkaz ŠRAFY (HATCH)"
metaTitle: "Šrafování v AutoCADu: příkaz ŠRAFY (HATCH)"
description: "Jak v AutoCADu šrafovat příkazem ŠRAFY (HATCH), výzvu po výzvě: bod uvnitř nebo hraniční objekty, vzor, měřítko, úhel, ostrovy. Vyzkoušejte zdarma online."
figure: "Obdélník s kružnicí uvnitř, vyšrafovaný vzorem ANSI31 z jednoho bodu uvnitř: kružnice zůstane prázdná jako ostrov."
sourceHash: "e0fc9a2fa81f"
---

Příkaz ŠRAFY (HATCH) vyplní uzavřenou oblast vzorem čar nebo plnou výplní. Vyberte bod uvnitř oblasti a příkaz najde její hranici v objektech kolem ní a to, co leží uvnitř, ponechá prázdné jako ostrov – kružnici v obdélníku, text; nebo vyberte objekty, které oblast ohraničují. Vyberte tolik oblastí, kolik chcete: Enter nebo Esc z nich všech vytvoří jedny šrafy, v aktuální hladině, pod jejich hranicí. Celý příkaz je jeden krok, který lze vrátit zpět.

Během běhu příkazu ukazuje pás karet kontextovou kartu Vytváření šraf, stejně jako v AutoCADu: Vybrat body a Vyber, galerii vzorů, Typ šraf (Barva nebo Vzor), Úhel, Měřítko šrafovacího vzoru a Ukončit vytváření šraf. Se zavřeným pásem karet AutoCAD otevře dialog Šrafování a gradient, který MellowCAD nemá: tehdy se příkaz ŠRAFY na příkazovém řádku ptá na to, na co se ptá příkaz <Command id="-HATCH" />, vzor v možnosti <Keyword id="Properties" />. Klávesa Esc šrafy ponechá, kdežto v příkazu <Command id="-HATCH" /> oblasti zahodí. Každé šrafy začínají se vzorem, měřítkem a úhlem, které dostaly poslední: v novém výkresu ANGLE, v měřítku 1 a pod úhlem 0.

Jsou-li vybrány šrafy, pás karet ukáže kartu Editor šraf, stejně jako v AutoCADu: vzor, typ, úhel nebo měřítko zvolené na ní je změní příkazem -ŠRAFEDIT, který lze i napsat, a šrafy zůstanou vybrané; Ukončit Editor šraf výběr zruší.

## Options

### Properties

Ptá se na ni na příkazovém řádku při zavřeném pásu karet nebo v příkazu <Command id="-HATCH" />; při otevřeném pásu karet nastaví tytéž tři hodnoty karta. Zeptá se na název vzoru, velkými i malými písmeny, a nabídne aktuální: <Keyword id="Solid" /> oblast plně vyplní a <Keyword id="?" /> vypíše seznam vzorů s jejich popisy a vrátí se k bodu. U vzoru se pak zeptá na měřítko – číslo větší než 0, nebo dva body, mezi nimiž se měří – a na úhel, zadaný nebo dvěma body. Další šrafy si ponechají všechny tři.

<Session name="hatchPatterns" caption="SOLID a jedenáct vzorů z acadiso.pat, každý vyšrafovaný ve čtverci o straně 30 v měřítku 1, AR-CONC a AR-SAND v měřítku 0,08 a 0,1." />

### Select objects

Místo bodu uvnitř vyberte objekty, které oblast ohraničují; při otevřeném pásu karet se po každém výběru zeptá znovu, <Keyword id="Pick internal point" /> se vrátí k bodu a Enter příkaz ukončí, při zavřeném se Enter vrátí k bodu. Objekt, který žádnou oblast neuzavírá, se vynechá; když žádný z nich oblast neohraničuje, Enter vypíše <Message id="unableToHatchBoundary" /> a nic nevytvoří. Oblast vytvořená příkazem <Command id="REGION" /> dá svůj obrys a její otvory ostrovy.

### Undo

Ve výzvě pásu karet uvedena je, ve výzvě příkazu <Command id="-HATCH" /> uvedena není, ale přijme se: vrátí oblasti naposledy vybraného bodu a zeptá se znovu, přičemž vybrané objekty ponechá; během výběru objektů vrátí poslední výběr. Vypíše <Message id="noBoundaryToUndo" />, když už není žádný bod k vrácení.

## Missing

Elipsy a spline jako hranice: oblast, kterou uzavírají, se nenajde a oblast vytvořená příkazem OBLAST s takovou hranou se vynechá. Tolerance mezer (HPGAPTOL): oblast musí být přesně uzavřená. Asociativní šrafy, styly šrafování Normální a Ignorovat. Gradienty, uživatelsky definované vzory a ostatní vzory z acadiso.pat se zde nevytvářejí: přinášejí je jen šrafy ze souboru DXF, gradienty v jejich barvách a vzory i s jejich čarami. Ostatní možnosti příkazu -ŠRAFY: nakreslení hranice, odebrání hranic, Pokročilé, pořadí kreslení, počátek, Poznámky, barva, hladina a průhlednost; možnosti Kreslit a Nastavení ve výzvě pásu karet. Z karty Vytváření šraf: Odebrat a Znovu vytvořit, typy Gradient a Uživatelsky definovaný, barvy, průhlednost, počátek a možnosti. Dialog příkazu ŠRAFEDIT a dvojklik, který v AutoCADu otevře Editor šraf; z této karty hranice, barvy, průhlednost, počátek a možnosti. MIRRHATCH 1: zrcadlené šrafy si vždy ponechají úhel svého vzoru. Nabídky uzlů šraf.

## Questions

### Jak se jmenuje příkaz ŠRAFY anglicky a jakou má zkratku?

HATCH. V české verzi AutoCADu jsou jeho zkratky `HS` a `SF`: zadejte jednu z nich a stiskněte Enter nebo mezerník. Anglické `H` a `BH` v české verzi nefungují; `_HATCH` funguje v AutoCADu v každém jazyce. Příkaz otevře kartu Vytváření šraf; `-HS` (<Command id="-HATCH" />) se na vše ptá na příkazovém řádku.

### Proč šrafování v AutoCADu nefunguje?

Nejčastěji proto, že oblast není uzavřená: příkaz vypíše <Message id="hatchNoBoundary" /> a stačí i nejmenší mezera, protože nic ji nepřemostí. Uzavřete obrys a vyberte znovu. Oblast uzavřená elipsou nebo spline se zatím nenajde a objekty ve vypnuté hladině se neberou v úvahu.

### Jaké jsou šrafovací vzory a dají se stáhnout další?

Výběr z acadiso.pat, metrického souboru vzorů AutoCADu: SOLID, ANGLE, ANSI31 až ANSI38, AR-CONC, AR-SAND, BRICK, CROSS, DASH, DOTS, EARTH, HONEY, LINE, NET, NET3, SQUARE, STEEL a ZIGZAG. Ukazuje je karta Vytváření šraf; <Keyword id="?" /> v možnosti <Keyword id="Properties" /> je vypíše. Vlastní ani stažený soubor vzorů zatím nelze načíst, ale šrafy ze souboru DXF se otevřou se vzorem, který obsahují, ať je jakýkoli, tak jak je kreslí AutoCAD.

### Jak v AutoCADu změnit měřítko šraf?

Během výběru v poli „Měřítko šrafovacího vzoru“ na kartě Vytváření šraf, nebo v možnosti <Keyword id="Properties" /> příkazu <Command id="-HATCH" />, po názvu vzoru. Už vytvořené šrafy vyberte a přepište „Měřítko“ v paletě Vlastnosti, nebo jim dejte vzor, měřítko a úhel jiných šraf příkazem <Command id="MATCHPROP" />. Tak malé měřítko, že by vzor potřeboval příliš mnoho čar, vyvolá <Message id="hatchTooDense" /> a šrafy nevzniknou.

### Jak zjistit plochu šraf?

Vyberte je a přečtěte hodnotu „Plocha“ ve skupině „Geometrie“ palety Vlastnosti, bez ostrovů; při několika vybraných šrafách je sečte „Kumulativní oblast“. Nebo spusťte příkaz <Command id="AREA" />, zvolte <Keyword command="AREA" id="Object" /> a vyberte šrafy.
