---
title: "Příkaz SPOJ (JOIN) v AutoCADu"
description: "Jak spojit úsečky do křivky v AutoCADu příkazem SPOJ (JOIN): úsečky na jedné přímce v jednu, oblouky v kružnici, oblouky a spline ve spline. Vyzkoušejte online."
figure: "Tři úsečky spojené do jedné křivky, ze které pak příkaz EKVID jedním výběrem vytvoří ekvidistantu celé."
sourceHash: "c4f26ede4174"
---

Příkaz SPOJ (JOIN) vytvoří z několika objektů jeden. Vyberte je, kolik chcete, a stiskněte Enter: úsečky a oblouky, které na sebe navazují koncovými body, se stanou jednou křivkou, připojenou ke křivce, pokud je mezi nimi; úsečky na jedné přímce se stanou jednou úsečkou, i přes mezeru; oblouky jedné kružnice se stanou jedním obloukem, a když se uzavřou, příkaz SPOJ se zeptá, zda z nich vytvořit kružnici, ve výchozím stavu <Keyword id="Yes" />, nebo je ponechat jako oblouk možností <Keyword id="No" />. Eliptické oblouky jedné elipsy se stanou jedním obloukem a spline nebo eliptický oblouk mezi navazujícími objekty vytvoří spline. Potom vypíše, co vytvořil a kolik objektů vynechal. Křivka se připojuje jen svými konci a uzavřená křivka nespojí nic. Celé spojení vrátí jeden krok zpět.

## Options

### cLose

Když je zdrojem eliptický oblouk vybraný samostatně: doplní ho na celou elipsu.

## Missing

Samostatný krok AutoCADu, když je zdrojem jediná úsečka, oblouk nebo křivka vybraná samostatně (`Vyberte čáry, které chcete spojit se zdrojem:`): zde nespojí nic. Uzavřený objekt vybraný samostatně, na který se AutoCAD zeptá znovu. Šroubovice, objekty v nakloněné nebo obrácené rovině a úsečky, které neleží v jedné rovině, které AutoCAD spojí do 3D křivky nebo zploští do křivky.

## Questions

### Jak se jmenuje příkaz SPOJ anglicky a jakou má zkratku?

JOIN. V českém AutoCADu příkaz SPOJ zkratku nemá: zadejte celý název a stiskněte Enter nebo mezerník. Anglické `J` v české verzi nefunguje; `_JOIN` funguje v AutoCADu v jakémkoli jazyce.

### Jak spojit úsečky do křivky v AutoCADu?

Spusťte příkaz SPOJ, vyberte úsečky, klidně oknem, a stiskněte Enter: ty, které na sebe navazují koncovými body, se stanou jednou křivkou.

### Proč příkaz SPOJ nefunguje?

Objekty musí navazovat přesně, konec na konec a v jedné rovině: mezera nebo křížení je vyřadí a příkaz SPOJ vypíše, kolik jich vyřadil. Přes mezeru se spojují jen úsečky na jedné přímce, oblouky jedné kružnice a oblouky jedné elipsy. Uzavřená křivka nespojí nic.

### Jak spojit oblouky do kružnice?

Vyberte oblouky jedné kružnice, které ji celou pokrývají, a stiskněte Enter: příkaz SPOJ se zeptá, zda je převést na kružnici, a <Keyword id="Yes" />, výchozí odpověď, to udělá.
