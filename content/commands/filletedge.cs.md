---
title: "Příkaz ZAOBLIHRANU (FILLETEDGE) v AutoCADu"
description: "Jak v AutoCADu zaoblit hrany 3D tělesa příkazem ZAOBLIHRANU (FILLETEDGE): hrany, řetěz, smyčka, poloměr a šipkový uzel. Vyzkoušejte zdarma online."
figure: "Kvádr viděný od jihovýchodu: ZAOBLIHRANU s poloměrem 8 zaoblí jeho dvě svislé hrany vpravo."
sourceHash: "403a055efb24"
---

Příkaz ZAOBLIHRANU (FILLETEDGE) zaoblí hrany 3D tělesa. Uvede aktuální poloměr a pak se ptá na hrany, až do Enter: kliknutí vezme hranu pod kurzorem, zvýrazněnou, když nad ní kurzor přejde, a zadaný bod vezme hranu, která jím prochází. Jak hrany přibývají, kreslí se těleso tak, jak bude vypadat, se zaobleními na místě. Enter hrany spočítá a vyzve vás, abyste znovu stiskli Enter pro potvrzení, nebo změnili poloměr; tento Enter zaoblení vytvoří. Jen hrany jednoho tělesa: hrana jiného vyvolá <Message id="filletMultipleBodies" />, hrana vybraná dvakrát <Message id="edgeAlreadyPicked" />.

Přímá hrana mezi dvěma rovinnými plochami se stane čtvrtinou válce a kruhová hrana otvoru nebo okraje čtvrtinou anuloidu; zaoblení, která se setkají v rohu, se spojí, tři z nich kusem koule. Poloměr se uloží ve výkresu a příště se nabídne znovu. Těleso si ponechá hladinu a vlastnosti, ale ztratí to, z čeho vzniklo: kvádr už není kvádr. Celý příkaz je jeden krok zpět. MellowCAD umí ve 3D jen 3D tělesa, zatím částečně.

## Options

### Chain

Vezme vybranou hranu a každou hranu k ní tečnou, jednu za druhou: osm kolem horní plochy kvádru, jehož svislé hrany už jsou zaoblené. Když žádná tečná není, vypíše <Message id="noTangentChainEdges" /> a vezme jen vybranou. <Keyword id="Edge" /> se vrátí k jednotlivým hranám.

### Loop

Vezme každou hranu kolem plochy: vyberte jednu hranu a pak <Keyword id="Accept" /> pro zobrazenou smyčku nebo <Keyword id="Next" /> pro smyčku druhé plochy, ke které hrana patří.

### Radius

Zeptá se na poloměr, zadaný nebo jako vzdálenost mezi dvěma body; 0 nebo méně vyvolá <Message id="radiusTooSmall" />. <Keyword id="Expression" /> ho přijme jako vzorec. U výzvy k potvrzení změní poloměr zobrazených zaoblení. Šipkový uzel uprostřed prvního zaoblení ho nastaví tažením: klikněte na něj, posuňte, klikněte; <Keyword id="eXit" /> nebo Esc ho ponechá beze změny.

## Missing

Zaoblení dvou poloměrů, která se setkají, a zaoblení končící na zakřivené ploše. Zaoblení širší než sousední plocha, které AutoCAD převalí přes další hranu: zde skončí chybou modelování. Přímá hrana vedle zakřivené plochy, kruhová hrana mimo osu svého válce a jakákoli hrana koule, anuloidu, vytaženého nebo rotačního tělesa, které skončí stejně. Některé rohy, kde se zaoblení setkávají na hranách s různým sklonem. Šipkový uzel na jiné než první hraně a čára od něj ke kurzoru. Výběr hrany tělesa v příkazu <Command id="FILLET" />, který AutoCAD také umožňuje. Zaoblení kreslené jako síť během výběru a povrchy.

## Questions

### Jak v AutoCADu zaoblit hranu 3D tělesa?

Spusťte příkaz ZAOBLIHRANU, zvolte <Keyword id="Radius" /> a zadejte ho, vyberte hrany a pak dvakrát stiskněte Enter: jednou pro ukončení výběru, podruhé pro potvrzení. V ukázce `8` zaoblí dvě hrany kvádru.

### Jak zaoblit všechny hrany plochy?

Zvolte <Keyword id="Loop" /> a vyberte hranu plochy, pak <Keyword id="Accept" />, nebo <Keyword id="Next" />, pokud zobrazená smyčka patří druhé ploše. Pro hrany, které už plynule přecházejí jedna v druhou, jako kolem horní plochy zaobleného kvádru, vezme je všechny možnost <Keyword id="Chain" />.

### Proč příkaz ZAOBLI nefunguje na 3D tělese?

Příkaz <Command id="FILLET" /> v AutoCADu hranu tělesa také zaoblí, ale v MellowCAD zatím ne: použijte příkaz ZAOBLIHRANU a pro zkosení příkaz <Command id="CHAMFEREDGE" />.

### Jak změnit poloměr zaoblení?

Zvolte <Keyword id="Radius" /> před výběrem nebo u výzvy k potvrzení, nebo přetáhněte šipkový uzel uprostřed prvního zaoblení. Poslední poloměr se příště nabídne znovu.
