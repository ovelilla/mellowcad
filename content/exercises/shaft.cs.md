---
title: "Cvičení v AutoCADu: osazený hřídel"
metaTitle: "Cvičení v AutoCADu 2D: osazený hřídel"
description: "Nakreslete osazený hřídel v AutoCADu: polovina obrysu jako křivka, zkosená, zrcadlená podle osy, a délky jako řetězové kóty. Krok za krokem, zdarma."
figure: "Osazený hřídel v bočním pohledu, délka 150, délky okótované řetězově."
sourceHash: "8c649e73bc55"
---

Nakreslete tento osazený hřídel v bočním pohledu, v milimetrech: délka 150, průměry 30, 40 a 30 na délkách 40, 60 a 50, oba konce zkosené 2 × 2. Polovinu nad osou nakreslete jako jednu křivku, zkoste ji a zrcadlete; potom hrany viditelné napříč hřídelem, osu a délky. Průměry jsou uvedené zde, v zadání.

## Steps

### Nakreslete horní polovinu [#half]

V hladině Obrys jedna křivka příkazem <Command id="PLINE" /> od `0,0`: nahoru `0,15`, podél `40,0`, nahoru `0,5`, podél `60,0`, dolů `0,-5`, podél `50,0` a dolů `0,-15`, zpět k ose. Enter příkaz ukončí.

### Zkoste konce [#chamfers]

Příkaz <Command id="CHAMFER" />, potom možnost <Keyword command="CHAMFER" id="Distance" />: `2`, a Enter přijme `2` i pro druhou vzdálenost. Možnost <Keyword command="CHAMFER" id="Multiple" /> zkosí jeden roh za druhým bez nového spuštění příkazu: vyberte dva segmenty v rohu každého konce.

### Zrcadlete polovinu [#mirror]

Příkaz <Command id="MIRROR" />: vyberte křivku, stiskněte Enter, potom osu zrcadlení od `0,0` do `150,0`, tedy osu hřídele, a Enter, kterým originál ponecháte.

### Nakreslete hrany [#edges]

Příkazem <Command id="LINE" /> hrany viditelné napříč hřídelem, každou o `0,30` nahoru od spodního okraje: od `2,-15` a `148,-15` u zkosení a od `40,-15` a `100,-15` u osazení.

### Nakreslete osu [#axis]

V hladině Osy osa: úsečka od `-8,0` do bodu o `166,0` dál.

### Okótujte výkres [#dimensions]

V hladině Kóty příkaz <Command id="DIMLINEAR" /> pro první délku, 40, s kótou umístěnou dole. Příkaz <Command id="DIMCONTINUE" /> pokračuje řetězem od její druhé vynášecí čáry: `#100,-20`, potom `#150,-15`, zadané od počátku souřadnic se znakem #, a dvakrát Enter pro ukončení. Poslední příkaz <Command id="DIMLINEAR" /> udá celkovou délku, 150, ještě níže.
