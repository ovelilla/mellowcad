---
title: "Příkaz OROTUJ (REVOLVE) v AutoCADu"
description: "Jak v AutoCADu vytvořit rotační těleso příkazem OROTUJ (REVOLVE, zkratka ORT): 2D profil kolem osi, osa objektem nebo X, Y, Z, úhel. Vyzkoušejte zdarma."
figure: "Profil s přírubami orotovaný o celou otáčku kolem osy Y: cívka viděná od jihovýchodu ve vizuálním stylu Skrytý."
sourceHash: "dc0576311912"
---

Příkaz OROTUJ (REVOLVE) otáčí uzavřené 2D profily kolem osy a vytváří z nich 3D tělesa: obdélník s hranou na ose dá válec, kružnice vedle osy prstenec. Vyberte profily – kružnice, elipsy, uzavřené křivky nebo spline, oblasti – a stiskněte Enter; zadejte osu dvěma body nebo jednou z možností a pak úhel; Enter znamená celou otáčku. Každý profil se stane tělesem v aktuální hladině a vymaže se, jak ve výchozím nastavení určuje DELOBJ. Celý příkaz je jeden krok, který lze vrátit zpět.

Osa musí ležet v rovině profilu a celý profil na jedné její straně; jinak příkaz skončí zprávou <Message id="revolveOneSide" />, ještě než se zeptá na úhel. Otáčí se podle pravidla pravé ruky kolem osy orientované od jejího prvního bodu ke druhému; záporný úhel otáčí opačně. 3D v MellowCAD jsou jen 3D tělesa, zatím částečně: otevřené profily, ze kterých AutoCAD vytváří povrchy, se odmítnou.

## Options

### MOde

Zeptá se na <Keyword id="SOlid" /> nebo <Keyword id="SUrface" />, jako <Command id="EXTRUDE" />: dokud nejsou povrchové objekty, přijme se jen <Keyword id="SOlid" />, výchozí hodnota.

### Object

Výchozí možnost výzvy k zadání osy, takže ji zvolí Enter: vyberte úsečku, křivku, oblouk nebo spline a osa povede přímo mezi jeho dvěma konci, od konce bližšího místu výběru. Uzavřený objekt nemá konce: <Message id="revolveClosedAxis" /> – a příkaz skončí.

### X

Osa X souřadnicového systému USS, procházející jeho počátkem.

### Y

Osa Y souřadnicového systému USS, procházející jeho počátkem: profil nakreslený vpravo od ní, jako v ukázce, se změní v díl ležící podél Y.

### Z

Osa Z souřadnicového systému USS, procházející jeho počátkem. Profil v rovině XY systému USS je k ní kolmý, takže příkaz OROTUJ odpoví <Message id="revolvePerpendicular" /> a skončí: Z slouží profilům postaveným svisle.

### STart

Ve výzvě k zadání úhlu: počáteční úhel, výchozí hodnota vždy 0. Profil se nejprve otočí do této polohy a pak se příkaz na úhel zeptá znovu.

### Reverse

Obrátí směr osy, takže úhel běží opačně, a znovu se zeptá na úhel.

### EXpression

Úhel jako aritmetický výraz, jako v příkazu <Command id="EXTRUDE" />.

## Missing

Osa mimo rovinu profilu, kolem které AutoCAD profil otočí do povrchů: zde příkaz OROTUJ vypíše <Message id="revolveUnable" /> a skončí. Eliptický oblouk nebo hrana tělesa jako osa <Keyword id="Object" />. Režim <Keyword id="SUrface" /> a otevřené profily, protože zatím nejsou povrchové objekty. Náhled, který se otáčí s kurzorem: při zadávání úhlu se zobrazí celá otáčka. <Command id="EXPLODE" /> rotačního tělesa, které AutoCAD rozloží na povrchy a oblasti. Jeho uzly a úprava úhlu v paletě Vlastnosti.

## Questions

### Jak se jmenuje příkaz OROTUJ anglicky?

REVOLVE. V české verzi AutoCADu zadejte `OROTUJ` nebo zkratku `ORT` a stiskněte Enter nebo mezerník; zkratka `REV` z anglické verze v české spouští příkaz REGENV (REGENALL). Anglický název s podtržítkem, `_REVOLVE`, funguje v AutoCADu v každém jazyce.

### Jak v AutoCADu orotovat profil kolem osy?

Nakreslete polovinu průřezu jako jeden uzavřený objekt vedle úsečky osy: uzavřenou křivku nebo oblast. Spusťte příkaz OROTUJ, vyberte profil a stiskněte Enter; dalším Enter zvolte <Keyword id="Object" /> a vyberte úsečku osy, nebo zadejte její dva konce; pak Enter pro celou otáčku.

### Proč příkaz OROTUJ nefunguje?

Nejčastěji osa protíná profil: příkaz OROTUJ vypíše <Message id="revolveOneSide" /> a skončí. Posuňte osu na hranu profilu nebo za ni; hrana ležící na ose je povolená. Osa kolmá k rovině profilu vede ke zprávě <Message id="revolvePerpendicular" /> a otevřený profil se odmítne, protože MellowCAD zatím nemá povrchy.

### Jak orotovat profil jen o část otáčky?

Ve výzvě k zadání úhlu zadejte úhel, například 90 nebo 270. <Keyword id="STart" /> posune začátek otáčení dál a <Keyword id="Reverse" /> otáčí opačně.
