---
title: "Příkaz PŘERUŠ (BREAK) v AutoCADu"
metaTitle: "Jak přerušit čáru v AutoCADu: PŘERUŠ"
description: "Jak přerušit čáru v AutoCADu příkazem PŘERUŠ (BREAK, zkratka PR): výběr je první bod, pak druhý, nebo možnost První bod; přerušení v bodě. Vyzkoušejte zdarma."
figure: "Úsečka přerušená mezi dvěma body zadanými možností První bod a kružnice přerušená od místa výběru proti směru hodinových ručiček k druhému bodu."
sourceHash: "f351112ef2fc"
---

Příkaz PŘERUŠ (BREAK) vyřízne z objektu mezeru, nebo ho rozdělí na dva. Vyberte objekt: jako v AutoCADu je bod, ve kterém jste ho vybrali, prvním bodem přerušení, takže další výzva se ptá už jen na druhý a část mezi nimi se odstraní. Úsečka, oblouk, otevřená křivka, eliptický oblouk nebo spline přijde o část mezi body a stane se dvěma objekty; kružnice nebo elipsa přijde o část, která vede proti směru hodinových ručiček od prvního bodu k druhému, a uzavřená křivka o část mezi nimi v pořadí jejích vrcholů: každá se stane jedním otevřeným objektem. Bod mimo objekt se vezme v nejbližším bodě objektu a bod za koncem řeže až k tomuto konci. Zatímco zadáváte druhý bod, část, kterou by PŘERUŠ zachoval, se zobrazuje přes objekt. Přerušení je jeden krok, který lze vrátit zpět.

## Options

### First point

U druhého bodu přerušení: zadejte znovu první bod přerušení a pak druhý, když místo, kde jste objekt vybrali, není začátkem mezery.

## Missing

Oblouk, kružnice nebo elipsa, které neleží rovnoběžně s rovinou XY systému USS: AutoCAD je přeruší, MellowCAD je nenajde. Celá elipsa převrácená příkazem <Command id="MIRROR" />, kterou AutoCAD přeruší opačným směrem.

## Questions

### Jak se jmenuje příkaz PŘERUŠ anglicky a jakou má zkratku?

Anglicky BREAK, v českém AutoCADu PŘERUŠ: zadejte `PR` a stiskněte Enter nebo mezerník. Anglické `BR` v českém AutoCADu nefunguje; `_BREAK` funguje v AutoCADu v jakémkoli jazyce.

### Jak přerušit čáru v bodě v AutoCADu?

Spusťte <Command id="BREAKATPOINT" />, vyberte úsečku a zadejte bod: stane se z ní dvojice úseček, které se v něm stýkají. V příkazu PŘERUŠ dosáhnete téhož zadáním `@` u druhého bodu přerušení.

### Jak přerušit čáru mezi dvěma body?

Vyberte úsečku, zvolte <Keyword id="First point" /> a pak zadejte první a druhý bod: část mezi nimi se odstraní. Nebo vyberte úsečku v prvním bodě a zadejte jen druhý.

### Proč nelze přerušit blok nebo text?

PŘERUŠ přerušuje úsečky, oblouky, kružnice, křivky, elipsy a spliny. Reference bloku vypíše <Message id="cannotBreakBlock" />, text, kóta nebo šrafa <Message id="objectCannotBeBroken" />; chcete-li přerušit části bloku, nejprve ho rozložte příkazem <Command id="EXPLODE" />.

### Kterým směrem PŘERUŠ řeže kružnici?

Proti směru hodinových ručiček, od prvního bodu k druhému, jako v AutoCADu. Chcete-li zachovat druhou část, zadejte body v opačném pořadí.
