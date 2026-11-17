---
title: "Příkaz SJEDNOCENÍ (UNION) v AutoCADu"
description: "Jak v AutoCADu sjednotit 3D tělesa nebo oblasti v jedné rovině příkazem SJEDNOCENÍ (UNION, zkratka SJE), co přeskočí a proč chce dva objekty."
figure: "Dva kvádry, které se překrývají, sjednocené příkazem SJEDNOCENÍ do jednoho tělesa: pohled od jihovýchodu, se skrytými čarami odstraněnými."
sourceHash: "be43813a7dee"
---

Příkaz SJEDNOCENÍ (UNION) spojí dvě nebo více 3D těles do jednoho tělesa, nebo dvě nebo více oblastí ležících v jedné rovině do jedné oblasti: společná část se počítá jednou a hrany uvnitř zmizí. Ptá se na libovolný počet objektů a Enter je sjednotí. Jako v AutoCADu 2027 se sada vybraná předem zahodí a příkaz se zeptá znovu, a co není těleso ani oblast, se přeskočí. Tělesa a oblasti se sjednocují zvlášť: všechna tělesa do jednoho, oblasti rovinu po rovině.

Objekt vybraný jako první se stane výsledkem, se svou hladinou a barvou, a ostatní se vymažou; při výběru oknem, křížovým oknem nebo možností VŠE je to nejnovější z nich. Výsledek je složené těleso: už to není kvádr ani válec a nemá historii (<Command id="LIST" /> u něj žádnou historii neuvede), a když je vybrané, ukáže jeden uzel, který ho posouvá celé. Tělesa, která se nedotýkají, se stanou jedním objektem o dvou částech. Celý příkaz je jeden krok, který lze vrátit zpět. 3D v MellowCADu je zatím částečné: tělesa existují, povrchy a sítě ne.

## Missing

Povrchy, které zde nejsou. Zakřivené plochy, které se protínají podél křivky, pro kterou MellowCAD zatím nemá přesný tvar: válce, kužely, koule nebo anuloidy, jejichž osy ani nesplývají, ani nejsou rovnoběžné (dva válce se také mohou křížit); kužel s čímkoli jiným než rovinou nebo tělesem na jeho ose; anuloid nebo rotační těleso s rovinou, která není kolmá k ose ani jí neprochází, nebo s tělesem mimo osu; vysunuté těleso s čímkoli jiným než rovinou nebo plochou vysunutou stejným směrem. Ty se odmítnou a tělesa zůstanou beze změny; stejně tak řez, který se hrany dotkne tečně, plochy ležící téměř, ale ne úplně, na jednom povrchu a velmi tenký pásek mezi řezem a hranou. Válec ležící podél plochy kvádru se sjednotí do správného objemu, ale s jednou hranou a jednou plochou méně než v AutoCADu. Historie těles se neuchovává (SOLIDHIST, SHOWHISTORY).

## Questions

### Jak se jmenuje příkaz SJEDNOCENÍ anglicky?

UNION. V české verzi AutoCADu zadejte `SJEDNOCENÍ` nebo zkratku `SJE` a stiskněte Enter nebo mezerník; zkratka `UNI` z anglické verze v české nefunguje. `_UNION` funguje v AutoCADu v každém jazyce.

### Proč SJEDNOCENÍ nefunguje?

Potřebuje dvě tělesa nebo dvě oblasti ve stejné rovině: s menším počtem vypíše <Message id="booleanNeedsTwo" /> a nic nezmění. Úsečky, oblouky a křivky nejsou oblasti, ani uzavřené: nejprve z nich vytvořte oblasti příkazem <Command id="REGION" />. Objekty vybrané před příkazem SJEDNOCENÍ se zahodí, jako v AutoCADu 2027: vyberte je u jeho výzvy. Když oznámí, že jedna booleovská operace selhala, tělesa se stýkají způsobem, který MellowCAD zatím neumí spočítat, a zůstanou beze změny.

### Jak vrátit příkaz SJEDNOCENÍ?

<Command id="U" /> nebo Ctrl+Z hned po něm: celý příkaz se vrátí v jednom kroku a objekty budou jako předtím. Později už není co rozdělit, protože sjednocené těleso si o svých částech nic nepamatuje. Opačnou operací je <Command id="SUBTRACT" />, která tělesa odečítá, místo aby je přidávala.

### Jak v AutoCADu sjednotit oblasti?

Z každého uzavřeného tvaru vytvořte oblast příkazem <Command id="REGION" /> a pak je sjednoťte příkazem SJEDNOCENÍ: oblasti každé roviny se stanou jednou oblastí a jejich společné strany splynou. Tvary, které se uzavírají kolem prázdného místa, zanechají otvor, a oddělené oblasti se stanou jednou oblastí z oddělených částí. Oblast, která je ve své rovině sama, zůstane beze změny.
