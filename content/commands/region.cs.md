---
title: "Příkaz OBLAST (REGION) v AutoCADu"
description: "Jak v AutoCADu vytvořit oblast příkazem OBLAST (REGION, zkratka OBL): které smyčky najde, proč žádnou nevytvoří a k čemu oblast slouží. Vyzkoušejte zdarma."
figure: "Čtyři úsečky uzavřené konec na konec a kružnice uvnitř nich: OBLAST s oknem kolem obou tvarů vytvoří dvě oblasti a objekty vymaže."
sourceHash: "69a5423c3d5c"
---

Příkaz OBLAST (REGION) mění uzavřené tvary v oblasti: rovinné plochy bez tloušťky, každou ohraničenou jejími smyčkami. Vyberte objekty a stiskněte Enter: každá smyčka, kterou tvoří, se stane oblastí. Uzavřený objekt je smyčkou sám o sobě: kružnice, elipsa, uzavřená křivka nebo spline. Otevřené objekty – úsečky, oblouky, eliptické oblouky, otevřené křivky a spline – se řetězí konec na konec, nikdy v místě, kde se protínají, a řetěz, který se neuzavře, se vynechá. Příkazový řádek pak vypíše počet nalezených smyček, odmítnutých smyček i s důvodem a vytvořených oblastí; Enter bez vybraných objektů vypíše <Message id="regionNoneFound" />.

Objekty, ze kterých oblast vznikla, se vymažou, ostatní zůstanou, a oblasti dostanou aktuální hladinu a vlastnosti, ne vlastnosti objektů. Smyčka uvnitř jiné vytvoří vlastní oblast, ne otvor v té vnější: <Command id="SUBTRACT" /> odečte jednu od druhé. Oblast se kreslí jako své hrany a na nich funguje uchopení objektu; paleta Vlastnosti ukazuje její plochu a obvod, které měří také <Command id="AREA" />, <Command id="LIST" /> a <Command id="MASSPROP" />. <Command id="UNION" />, <Command id="SUBTRACT" /> a <Command id="INTERSECT" /> kombinují oblasti v jedné rovině, <Command id="EXTRUDE" />, <Command id="REVOLVE" /> a <Command id="PRESSPULL" /> z nich udělají 3D tělesa a <Command id="EXPLODE" /> vrátí jejich úsečky, oblouky a kružnice. Celý příkaz je jeden krok, který lze vrátit zpět.

## Missing

Systémová proměnná `DELOBJ` AutoCADu: objekty, ze kterých oblast vznikla, se zde vymažou vždy. Příkaz HRANICE (BOUNDARY), který umí vytvořit oblast z plochy kolem bodu, a oblast z hranice šrafování. Úpravy oblasti uzly: uzly se zobrazí, ale jejich přetažení nic nezmění. Hrany oblasti jako řezné nebo hraniční hrany pro <Command id="TRIM" /> a <Command id="EXTEND" /> v rychlém režimu a <Command id="HATCH" /> oblasti s eliptickou hranou nebo hranou spline. Kombinace oblastí s povrchy, které MellowCAD nemá, a řádek Materiál v paletě Vlastnosti.

## Questions

### Jak se jmenuje příkaz OBLAST anglicky a jak se používá?

REGION. V české verzi AutoCADu zadejte `OBLAST` nebo zkratku `OBL`; zkratka `REG` z anglické verze v české nefunguje a `_REGION` funguje v AutoCADu v každém jazyce. Spusťte příkaz, vyberte uzavřené tvary nebo úsečky, které jeden tvar uzavírají konec na konec, a stiskněte Enter. V ukázce okno kolem čtyř úseček a kružnice vytvoří dvě oblasti a příkazový řádek vypíše dvě extrahované smyčky a dvě vytvořené oblasti.

### Proč OBLAST nevytvoří oblast?

Tvar není uzavřený konec na konec. Úsečky, které se protínají nebo k sobě nedosahují, nic neuzavírají: příkaz OBLAST řetězí otevřené objekty jen jejich konci a mezera o tloušťce vlasu stačí, aby se řetěz vynechal. Smyčka, která protíná sama sebe, jako motýlek, se odmítne a započítá mezi samoprotínající. Spojte konce příkazem <Command id="FILLET" /> s poloměrem 0 nebo ořízněte příkazem <Command id="TRIM" /> to, co přečnívá, a zkuste to znovu.

### Jak v AutoCADu vytvořit oblast s otvorem?

Vytvořte oblast z obrysu a druhou z otvoru a pak spusťte <Command id="SUBTRACT" />: vyberte obrys, Enter, otvor, Enter. Výsledkem je jedna oblast a <Command id="EXTRUDE" /> z ní udělá těleso s průchozím otvorem.

### Jak zjistit plochu oblasti?

Vyberte ji a přečtěte Plochu v paletě Vlastnosti nebo spusťte <Command id="AREA" />, zvolte <Keyword command="AREA" id="Object" /> a vyberte oblast. <Command id="MASSPROP" /> přidá obvod, těžiště a momenty setrvačnosti.
