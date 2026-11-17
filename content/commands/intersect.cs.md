---
title: "Příkaz PRŮNIK (INTERSECT) v AutoCADu"
description: "Jak funguje PRŮNIK (INTERSECT) v AutoCADu: ze dvou nebo více 3D těles nebo oblastí v jedné rovině zůstane jen společná část, zbytek zmizí."
figure: "Kvádr a koule, která do něj zasahuje, po průniku: jejich společná část je koule se šesti rovinnými plochami, viděná od jihovýchodu."
sourceHash: "c8ea61c0525d"
---

Příkaz PRŮNIK (INTERSECT) ponechá jen to, co mají dvě nebo více 3D těles nebo dvě nebo více oblastí v jedné rovině společné, a zbytek vymaže: kvádr a koule, která do něj zasahuje, zanechají kouli s rovinnými plochami. Ptá se na objekty až do Enter, jako příkaz <Command id="UNION" />, a vynechá to, co není těleso ani oblast. Jako v AutoCADu 2027 se sada vybraná před příkazem zahodí a otázka na objekty se zopakuje. Tělesa a oblasti se počítají zvlášť, oblasti rovinu po rovině.

Objekt vybraný jako první se stane výsledkem, se svou hladinou a barvou, a ostatní se vymažou; při výběru oknem, křížením nebo VŠE je to nejnovější z nich. Výsledkem je složené těleso, už ne kvádr ani koule, bez historie. Když objekty nemají nic společného, příkaz vypíše <Message id="nullSolid" /> nebo <Message id="nullRegion" /> a vymaže je všechny, jako AutoCAD. Celý příkaz je jeden krok zpět. 3D v MellowCADu jsou zatím částečná: tělesa existují, povrchy a sítě ne.

## Missing

Povrchy, které zde neexistují. Zakřivené plochy, které se setkávají podél křivky, pro kterou MellowCAD zatím nemá přesný tvar: válce, kužely, koule nebo anuloidy, jejichž osy nesplývají ani nejsou rovnoběžné (dva válce se mohou i křížit); kužel s čímkoli jiným než rovinou nebo tělesem na jeho ose; anuloid nebo rotační těleso s rovinou, která není kolmá k jeho ose ani jí neprochází, nebo s tělesem mimo jeho osu; vytažené těleso s čímkoli jiným než rovinou nebo plochou vytaženou v jeho směru. Ty se odmítnou se zprávou, že jedna booleovská operace selhala, a tělesa zůstanou beze změny; stejně tak řez, který se dotkne hrany tečně, plochy skoro, ale ne úplně na jednom povrchu, a velmi tenký proužek mezi řezem a hranou. Válec ležící podél plochy kvádru se sjednotí do správného objemu, ale s jednou hranou a jednou plochou méně než v AutoCADu. Historie těles se neuchovává (SOLIDHIST, SHOWHISTORY) a který objekt zůstane při výběru napříč nebo sadou Předchozí, není ověřeno.

## Questions

### Jak se jmenuje příkaz PRŮNIK anglicky a jakou má zkratku?

INTERSECT. V české verzi AutoCADu je jeho zkratka `PN`: zadejte ji a stiskněte Enter nebo mezerník. Anglická zkratka `IN` v české verzi nefunguje; celý název funguje a `_INTERSECT` funguje v AutoCADu v každém jazyce.

### Jaký je rozdíl mezi příkazy SJEDNOCENÍ, ROZDÍL a PRŮNIK?

Všechny tři vytvoří jeden objekt z 3D těles nebo z oblastí v jedné rovině. Příkaz <Command id="UNION" /> ponechá vše, co pokrývá kterýkoli z nich, příkaz <Command id="SUBTRACT" /> ponechá první sadu zmenšenou o druhou a příkaz PRŮNIK ponechá jen to, co mají všechny společné. Každý je jeden krok zpět a každý vymaže objekty, které spotřeboval.

### Jak v AutoCADu protnout úsečky?

Ne příkazem PRŮNIK, který pracuje s tělesy a oblastmi a úsečky vynechá. Chcete-li najít místo, kde se dvě úsečky kříží, uchopte ho uchopením Průsečík; chcete-li, aby se setkaly, použijte příkaz <Command id="FILLET" /> s poloměrem 0, <Command id="TRIM" /> nebo <Command id="EXTEND" />.

### Proč příkaz PRŮNIK maže moje objekty?

Protože nemají nic společného: bez společné části vypíše <Message id="nullSolid" />, u oblastí <Message id="nullRegion" />, a vymaže je, jako AutoCAD. Příkaz <Command id="U" /> je vrátí. Jedno těleso a jedna oblast nebo dvě oblasti v různých rovinách se vůbec neprotnou: příkaz vypíše <Message id="booleanNeedsTwo" /> a nic nezmění.
