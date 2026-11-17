---
title: "Křivkové pole v AutoCADu: příkaz KŘIVPOLE (ARRAYPATH)"
metaTitle: "Křivkové pole v AutoCADu: KŘIVPOLE"
description: "Jak vytvořit křivkové pole v AutoCADu příkazem KŘIVPOLE (ARRAYPATH): trajektorie, Měření nebo Rozdělit, položky a jejich zarovnání. Vyzkoušejte zdarma online."
figure: "Malý čtverec na začátku oblouku, rozmístěný podél něj: Rozdělit, 7 položek, každá natočená podle oblouku."
sourceHash: "d0d77418d682"
---

Příkaz KŘIVPOLE (ARRAYPATH) kopíruje výběr podél trajektorie – úsečky, oblouku, kružnice nebo křivky – jako jeden objekt pole. Zeptá se na objekty, oznámí typ a to, zda je pole asociativní, zeptá se na trajektorii a pole hned ukáže: položky ve vzdálenosti jedenapůlnásobku velikosti výběru, tolik, kolik se jich na trajektorii vejde, každá natočená tak, jak se trajektorie stáčí. Otevřená trajektorie začíná u konce bližšího místu, kde jste ji vybrali, kružnice proti směru hodinových ručiček od svého úhlu 0. Potom jedna výzva upravuje pole živě, dokud ho Enter nevytvoří, a to možnostmi nebo uzly náhledu, jako v AutoCADu. Vybrané objekty zůstanou na místě jako jeho první položka.

## Options

### ASsociative

<Keyword id="Yes" />, výchozí, vytvoří jeden objekt pole, který později mění jeho uzly a paleta Vlastnosti; <Keyword id="No" /> vytvoří samostatné kopie vedle vybraných objektů. Odpověď platí po celou relaci, i pro příkazy OBDPOLE a POLÁRPOLE.

### Method

<Keyword id="Measure" />, výchozí, rozmístí položky v zadané vzdálenosti, tolik, kolik se jich vejde; <Keyword id="Divide" /> rozloží zadaný počet položek rovnoměrně po celé trajektorii, po jedné na každém konci otevřené trajektorie.

### Items

Při způsobu Rozdělit počet položek. Při způsobu Měření vzdálenost mezi nimi a potom jejich počet, nejvýše tolik, kolik se jich vejde, což příkaz oznámí; <Keyword id="Fill entire path" /> vezme všechny.

### Align items

<Keyword id="Yes" />, výchozí, natočí každou položku tak, jak se trajektorie stáčí od svého začátku; <Keyword id="No" /> ji jen posune.

### eXit

Vytvoří pole a ukončí příkaz, stejně jako Enter.

## Missing

Pole nesleduje svou trajektorii: když trajektorii později upravíte, pole si ponechá tu, na které vzniklo. Trajektorií zatím nemohou být křivky spline, elipsy ani 3D křivky, ani trajektorie mimo rovinu USS. Nejsou k dispozici možnosti Základní bod, Směr tečny, Řádky, Úrovně, Směr Z a Výraz, ani skupina na výzvu k trajektorii, a uzly pole nemají nabídky.

## Questions

### Jak rozmístit objekty podél křivky v AutoCADu?

Zadejte `KŘIVPOLE`, vyberte objekty, stiskněte Enter a vyberte trajektorii blízko konce, od kterého má pole začínat; nebo zadejte `PO`, tedy <Command id="ARRAY" />, a po objektech zvolte <Keyword command="ARRAY" id="PAth" />. Potom nastavte rozteč nebo počet položek a stisknutím Enter pole vytvořte.

### Proč křivkové pole nesleduje trajektorii?

Zde si pole ponechá trajektorii takovou, jaká byla při jeho vytvoření: když trajektorii později posunete nebo protáhnete, pole zůstane, jak je, kdežto asociativní křivkové pole v AutoCADu by ji sledovalo. Ani vymazání trajektorie pole neodstraní. Pokud se položky s trajektorií nenatáčejí, zvolte <Keyword id="Align items" /> a odpovězte <Keyword id="Yes" />.

### Jak změnit směr křivkového pole?

Vyberte trajektorii blízko jejího druhého konce: otevřená trajektorie začíná u konce bližšího místu výběru. Kružnice vždy běží proti směru hodinových ručiček od svého úhlu 0.

### Jak rozmístit položky rovnoměrně po celé trajektorii?

Zvolte <Keyword id="Method" />, potom <Keyword id="Divide" />, potom <Keyword id="Items" /> a zadejte jejich počet: rozloží se rovnoměrně, první a poslední na koncích otevřené trajektorie.
