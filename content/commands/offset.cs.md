---
title: "Ekvidistanta v AutoCADu: příkaz EKVID (OFFSET)"
description: "Jak vytvořit ekvidistantu v AutoCADu příkazem EKVID (OFFSET, zkratka E): vzdálenost nebo bod, vymazání a hladina, jeden objekt najednou. Vyzkoušejte online."
figure: "Obdélník s ekvidistantou 6 uvnitř a kružnice s ekvidistantou 6 vně: u každého vybraný objekt, pak strana."
sourceHash: "b495af1e1410"
---

Příkaz EKVID (OFFSET) nakreslí kopii objektu rovnoběžnou s ním, ve vzdálenosti, kterou zadáte, nebo procházející bodem, který určíte: z úsečky vznikne rovnoběžná úsečka, z kružnice nebo oblouku soustředná, z křivky obrys uvnitř nebo vně ní, z elipsy nebo spline spline, který ji sleduje. Stejně jako v AutoCADu bere jeden objekt najednou: vzdálenost zadáte jednou, pak vyberete objekt a stranu, na kterou má kopie přijít, kolikrát chcete. Enter příkaz ukončí.

## Options

### Through

Místo vzdálenosti prochází každá kopie bodem, který ukážete nebo zadáte. Je to výchozí volba první výzvy, takže ji tam Enter vybere, dokud nebyla zadána vzdálenost; od té chvíle Enter opakuje poslední vzdálenost, v tomto výkresu.

### Erase

Zeptá se, zda každý zdrojový objekt po vytvoření ekvidistanty vymazat, <Keyword id="Yes" /> nebo <Keyword id="No" /> (výchozí). S <Keyword id="Yes" /> nahradí kopie objekt. Volba platí do konce relace a příští EKVID ji uvede na svém prvním řádku.

### Layer

Zeptá se, kam kopie přijdou: do aktuální hladiny (<Keyword id="Current" />), nebo do hladiny zdrojového objektu (<Keyword id="Source" />, výchozí). Také platí do konce relace.

### Exit

Ukončí příkaz, stejně jako Enter na výzvě k výběru objektu.

### Multiple

Na výzvě ke straně: vytváří další ekvidistanty téhož objektu bez nového výběru, každou kopii o jednu vzdálenost dál od předchozí, až do Enter nebo <Keyword id="Exit" />.

### Undo

Vrátí poslední kopii, ať vznikla z kteréhokoli objektu, a znovu se zeptá na objekt. Když už žádnou kopii vrátit nelze, oznámí to.

## Missing

OFFSETGAPTYPE 1 a 2: rohy ekvidistanty křivky se vždy uzavírají jako při 0, prodloužením segmentů až k jejich průsečíku. Ekvidistanta spline nebo elipsy je v toleranci AutoCADu, ale její uzly leží tam, kam je umístí MellowCAD, ne AutoCAD. <Keyword id="Through" /> u spline ukazuje ve svém popisku X a Y, ne vzdálenost.

## Questions

### Jak se jmenuje příkaz EKVID anglicky?

OFFSET. V českém AutoCADu je jeho zkratka `E`: zadejte ji a stiskněte Enter nebo mezerník. Anglické `O` v české verzi spouští příkaz OBLOUK; celý název `EKVID` funguje také a `_OFFSET` v AutoCADu v jakémkoli jazyce.

### Proč nemohu vytvořit ekvidistantu objektu?

Příkaz EKVID pracuje s úsečkami, oblouky, kružnicemi, 2D křivkami, elipsami a spliny. Text, víceřádkový text, reference bloků, kóty a šrafy odmítne zprávou <Message id="cannotOffsetObject" />, stejně jako když by vzdálenost zmenšila kružnici, oblouk nebo křivku na nic. Objekt v zamknuté hladině nelze vybrat a 3D křivka se přeskočí.

### Jak vytvořit několik ekvidistant téže úsečky?

Vyberte úsečku a pak na výzvě ke straně zadejte písmeno volby <Keyword id="Multiple" />: každé kliknutí na tu stranu přidá další kopii, každou o vzdálenost dál než předchozí. Nebo ponechte výchozí režim a pokaždé vyberte nejnovější kopii.

### Jak umístit ekvidistanty do aktuální hladiny?

Na první výzvě zvolte <Keyword id="Layer" />, pak <Keyword id="Current" />. Od té chvíle jde každá kopie do aktuální hladiny, dokud znovu nezvolíte <Keyword id="Source" />.
