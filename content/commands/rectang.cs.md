---
title: "Obdélník v AutoCADu: příkaz OBD (RECTANG)"
description: "Jak nakreslit obdélník v AutoCADu příkazem OBD nebo OBDÉLNÍK (RECTANG): dva rohy, rozměry, plocha a natočení, zaoblené nebo zkosené rohy. Vyzkoušejte online."
figure: "Dva obdélníky ze dvou rohů, druhý zadaný relativně k prvnímu: jeden se zaoblením 8, další se zkosením 8."
sourceHash: "a5d4e90c06aa"
---

Příkaz OBD (RECTANG), také OBDÉLNÍK, nakreslí obdélník ze dvou protilehlých rohů, ukázaných nebo zadaných: `0,0` a pak `100,50`, při dynamickém zadávání relativně k prvnímu, vytvoří obdélník 100 × 50. Je to jedna uzavřená křivka se čtyřmi vrcholy, v aktuální hladině. Možnosti první výzvy nastavují, jak se budou kreslit další obdélníky, a každá si hodnotu ponechá do konce relace: příští spuštění příkazu OBD uvede platné hodnoty na svém prvním řádku. Možnost Šířka dá každé straně šířku křivky. Zatímco umisťujete druhý roh, obdélník sleduje kurzor; se zapnutým dynamickým zadáváním můžete zadat jeho délku, Tab a šířku.

## Options

### Chamfer

Zeptá se na první a druhou vzdálenost zkosení a každý roh o ně zkosí: osm vrcholů. Vzdálenost 0 zkosení vypne. Nahrazuje zaoblení.

### Elevation

Zeptá se na zdvih, výšku Z, ve které se obdélník nakreslí.

### Fillet

Zeptá se na poloměr a každý roh jím zaoblí. Poloměr 0 zaoblení vypne. Nahrazuje zkosení.

### Thickness

Zeptá se na tloušťku: obdélník ve 3D pohledu stojí tak vysoko, jako by byl stěnou.

### Area

Ve výzvě k druhému rohu: zeptá se na plochu, pak zda zadat <Keyword id="Length" />, nebo <Keyword id="Width" />, a pak tuto stranu. Druhá strana se dopočítá, včetně rohů, a obdélník se vytvoří hned.

### Dimensions

Ve výzvě k druhému rohu: zeptá se na délku a šířku, pak na bod, který určí, kterým směrem od prvního rohu obdélník leží.

### Rotation

Ve výzvě k druhému rohu: zeptá se na úhel natočení obdélníku, zadaný číslem nebo bodem od prvního rohu, nebo dvěma body možností <Keyword id="Pick" />. Úhel se pamatuje do konce relace.

## Missing

Délka nebo šířka 0 u možnosti <Keyword id="Area" />, která zde nenakreslí nic a v AutoCADu nakreslí zlomenou křivku. Po odmítnuté odpovědi ve výzvě k natočení položí MellowCAD celou výzvu znovu, kdežto AutoCAD už nic nevypíše.

## Questions

### Jak se jmenuje příkaz OBD anglicky?

RECTANG. V českém AutoCADu zadejte `OBD` nebo `OBDÉLNÍK`, pak Enter nebo mezerník. Anglické `REC` v české verzi nefunguje; `_RECTANG` funguje v AutoCADu v jakémkoli jazyce.

### Jak nakreslit obdélník s přesnými rozměry?

Zadejte první roh, pak druhý relativně k němu: `100,50` se zapnutým dynamickým zadáváním, jak je na začátku, nebo `@100,50` bez něj vytvoří obdélník dlouhý 100 a široký 50. Nebo zvolte <Keyword id="Dimensions" /> a zadejte obě strany.

### Jak nakreslit obdélník se zaoblenými rohy?

V první výzvě zvolte <Keyword id="Fillet" />, zadejte poloměr a pak oba rohy.

### Proč má můj obdélník zaoblené nebo zkosené rohy?

Příkaz OBD si zaoblení i zkosení pamatuje do konce relace, takže je má i každý další obdélník: jeho první řádek to uvádí. Zvolte <Keyword id="Fillet" /> a zadejte `0`, abyste znovu kreslili ostré rohy.

### Je obdélník v AutoCADu křivka?

Ano: jedna uzavřená křivka. <Command id="EXPLODE" /> ji rozloží na čtyři úsečky a <Command id="OFFSET" /> vytvoří ekvidistantu celé křivky.
