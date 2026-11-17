---
title: "Zkosení hrany tělesa v AutoCADu: příkaz ZKOSHRANU (CHAMFEREDGE)"
metaTitle: "Zkosení hrany v AutoCADu: ZKOSHRANU"
description: "Jak zkosit hrany 3D tělesa v AutoCADu příkazem ZKOSHRANU (CHAMFEREDGE): hrany jedné plochy, Smyčka, dvě vzdálenosti. Vyzkoušejte zdarma online."
figure: "Kvádr z jihovýchodu: ZKOSHRANU s oběma vzdálenostmi 6 zkosí dvě horní hrany u jeho předního rohu, které se setkají v čáře."
sourceHash: "43b1908ad4b3"
---

Příkaz ZKOSHRANU (CHAMFEREDGE) zkosí hrany 3D tělesa. Uvede dvě aktuální vzdálenosti, pak se zeptá na hranu a po první na další na téže ploše, dokud nestisknete Enter: kliknutí vezme hranu pod kurzorem, zadaný bod hranu, která jím prochází. Hrana, která nemá s předchozími společnou plochu, vypíše <Message id="edgesOneFace" />, hrana jiného tělesa <Message id="chamferMultipleBodies" />. Jak hrany přibývají, těleso se kreslí tak, jak bude vypadat. Enter pak požádá o další Enter, kterým zkosení potvrdíte, nebo o změnu vzdáleností pro toto zkosení; tento Enter ho vytvoří.

První vzdálenost vede podél plochy, kterou mají hrany společnou; u samostatné hrany podél plochy, kterou zvolí AutoCAD: přední u horní přední hrany kvádru a horní u okraje válce. Přímá hrana mezi dvěma rovinnými plochami se stane rovinným pásem, kruhová hrana otvoru nebo okraje pásem kužele a zkosení, která se setkají v rohu, se spojí v čáře. Vzdálenosti se při dalším použití nabídnou znovu. Těleso si ponechá hladinu a vlastnosti, ale ztratí to, z čeho vzniklo: kvádr už není kvádr. Celý příkaz je jeden krok zpět. MellowCAD umí ve 3D jen 3D tělesa, zatím částečně.

## Options

### Loop

Vezme všechny hrany kolem plochy: vyberte jednu hranu, pak <Keyword id="Accept" /> pro zobrazenou smyčku, nebo <Keyword id="Next" /> pro smyčku druhé plochy, ke které hrana patří. <Keyword id="Edge" /> se vrátí k jednotlivým hranám.

### Distance

Zeptá se na první vzdálenost, pak na druhou, každou zadanou číslem nebo jako vzdálenost mezi dvěma body; 0 nebo méně vypíše <Message id="distanceTooSmall" />. <Keyword id="Expression" /> ji přijme jako vzorec. Na výzvu k potvrzení se zeptá na vzdálenost na základní ploše a na druhé ploše, jen pro toto zkosení.

## Missing

Roh, ve kterém se setkají tři zkosené hrany. Přímá hrana vedle zakřivené plochy, kruhová hrana mimo osu svého válce a každá hrana koule, anuloidu, vytaženého nebo rotačního tělesa: zde skončí chybou modelování. Dva šipkové uzly, které AutoCAD zobrazuje na výzvu k potvrzení, po jednom pro každou vzdálenost. Výběr hrany tělesa v příkazu <Command id="CHAMFER" />, který AutoCAD také umožňuje. Zkosení kreslené jako síť během výběru a povrchy.

## Questions

### Jak zkosit hranu 3D tělesa v AutoCADu?

Spusťte příkaz ZKOSHRANU, zvolte <Keyword id="Distance" /> a zadejte obě vzdálenosti, vyberte hrany jedné plochy a pak dvakrát stiskněte Enter: jednou pro ukončení výběru, jednou pro potvrzení. Hodnoty `6` a `6` z ukázky zkosí dvě horní hrany kvádru.

### Proč ZKOSHRANU hlásí, že hrany musí patřit jedné ploše?

Hrany jednoho zkosení mají společnou plochu: podél ní vede první vzdálenost. Hrany jiné plochy zkoste v dalším spuštění.

### Proč ZKOS nefunguje na 3D tělese?

<Command id="CHAMFER" /> v AutoCADu zkosí i hranu tělesa, v MellowCAD zatím ne: použijte ZKOSHRANU a k zaoblení hrany <Command id="FILLETEDGE" />.

### Jak zkosit hranu otvoru?

Vyberte jeho kruhovou hranu v místě, kde se stýká s rovinnou plochou: zkosení je pás kužele kolem otvoru.
