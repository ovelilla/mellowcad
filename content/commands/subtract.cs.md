---
title: "Příkaz ROZDÍL (SUBTRACT) v AutoCADu"
description: "Jak funguje příkaz ROZDÍL (SUBTRACT, zkratka RZ) v AutoCADu: tělesa nebo oblasti, které zůstanou, Enter, pak ty, které se odečtou, i s otvory."
figure: "Válec odečtený od kvádru příkazem ROZDÍL, průchozí otvor: nejprve vybraný kvádr, pak válec."
sourceHash: "416991f5f4d1"
---

Příkaz ROZDÍL (SUBTRACT) odečte 3D tělesa od jiných těles, nebo oblasti od oblastí ve stejné rovině: válec odečtený od kvádru v něm zanechá průchozí otvor, kružnice odečtená od čtverce čtverec s otvorem. Ptá se dvakrát. Nejprve vypíše <Message id="subtractFrom" /> a ptá se na objekty, které mají zůstat, dokud nestisknete Enter; pak <Message id="subtractWhat" /> a ptá se na objekty, které se odečtou, dokud znovu nestisknete Enter. Jako v AutoCADu 2027 se sada vybraná předem zahodí a příkaz se zeptá znovu.

Tělesa první sady se stanou jedním tělesem a každé těleso druhé sady se od něj odečte a vymaže, ať se s ním překrývalo, nebo ne. Oblasti se zpracují rovinu po rovině: oblasti první sady v dané rovině se sjednotí, oblasti druhé sady v této rovině se od nich odečtou a vymažou a oblast v rovině, kde první sada žádnou nemá, zůstane beze změny. Výsledné těleso je složené těleso: už to není kvádr ani válec a nemá historii. Když nic nezbude, příkaz vypíše <Message id="nullSolid" /> nebo <Message id="nullRegion" /> a objekty vymaže. Celý příkaz je jeden krok, který lze vrátit zpět. 3D v MellowCAD je zatím částečné: tělesa existují, povrchy a sítě ne.

## Missing

Povrchy, které zde nejsou. Zakřivené plochy, které se protínají podél křivky, pro kterou MellowCAD zatím nemá přesný tvar: válce, kužely, koule nebo anuloidy, jejichž osy ani nesplývají, ani nejsou rovnoběžné (dva válce se také mohou křížit); kužel s čímkoli jiným než rovinou nebo tělesem na jeho ose; anuloid nebo rotační těleso s rovinou, která není kolmá k ose ani jí neprochází, nebo s tělesem mimo osu; vysunuté těleso s čímkoli jiným než rovinou nebo plochou vysunutou stejným směrem. Ty se odmítnou a tělesa zůstanou beze změny; stejně tak řez, který se hrany dotkne tečně, plochy ležící téměř, ale ne úplně, na jednom povrchu a velmi tenký pásek mezi řezem a hranou. Předchozí po příkazu ROZDÍL oznámí, že neexistuje předchozí výběrová sada, zatímco AutoCAD nenajde žádný z vymazaných objektů. Historie těles se neuchovává (SOLIDHIST, SHOWHISTORY).

## Questions

### Jak se jmenuje příkaz ROZDÍL anglicky?

SUBTRACT. V české verzi AutoCADu zadejte `ROZDÍL` nebo zkratku `RZ` a stiskněte Enter nebo mezerník; zkratka `SU` z anglické verze v české nefunguje. `_SUBTRACT` funguje v AutoCADu v každém jazyce.

### Jak v AutoCADu odečíst jedno těleso od druhého?

Nakreslete těleso, které se má odečíst, tam, kde se překrývá s druhým: válec skrz kvádr, aby vznikl otvor. Spusťte příkaz ROZDÍL, vyberte kvádr a stiskněte Enter, pak vyberte válec a stiskněte Enter: v kvádru zůstane otvor a válec zmizí. Na pořadí záleží, protože zůstane to, co vyberete jako první.

### Proč příkaz ROZDÍL nefunguje?

Často jde o pořadí: co má zůstat, patří do první sady, co se má odečíst, do druhé. Když první sada neobsahuje těleso ani oblast, nebo druhá neobsahuje žádné, které už není v první, příkaz vypíše <Message id="noSolidsOrRegionsSelected" /> a skončí; když od první sady nelze odečíst nic z druhé, například těleso od oblasti nebo oblast v jiné rovině, vypíše <Message id="subtractNeedsTwo" /> a nic nezmění. Z úseček a křivek je třeba nejprve vytvořit oblasti. Když oznámí, že jedna booleovská operace selhala, tělesa se protínají způsobem, který MellowCAD zatím neumí spočítat, a zůstanou beze změny.

### Jak v AutoCADu odečíst plochu?

Chcete-li vyříznout jeden 2D tvar z druhého, vytvořte z obou oblasti příkazem <Command id="REGION" /> a vnitřní odečtěte od vnějšího příkazem ROZDÍL: čtverec, od kterého se odečte kružnice, se stane jednou oblastí s otvorem. Chcete-li změřit plochu beze změny výkresu, příkaz <Command id="AREA" /> odečítá plochy od průběžného součtu možností <Keyword command="AREA" id="Subtract" />.

### Lze odečíst bez vymazání objektu?

Příkaz ROZDÍL vymaže to, co odečte, stejně jako v AutoCADu. Chcete-li objekt zachovat, nejprve ho zkopírujte na totéž místo: <Command id="COPY" />, objekt a Enter, základní bod 0,0, pak znovu Enter, aby se zkopíroval o 0,0, sám na sebe. Příkaz ROZDÍL pak spotřebuje jeden z nich.
