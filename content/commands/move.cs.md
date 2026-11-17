---
title: "Příkaz POSUN (MOVE) v AutoCADu"
description: "Jak posunout objekt v AutoCADu příkazem POSUN (MOVE, zkratka POS), výzva po výzvě: základní bod a druhý bod, nebo posunutí zadané jako X,Y,Z. Vyzkoušejte."
figure: "Kružnice posunutá o 50 doprava: vybraná, její střed jako základní bod, druhý bod zadaný."
sourceHash: "753ca38448bf"
---

Příkaz POSUN (MOVE) přesune vybrané objekty z jednoho místa na jiné: vyberte je, zadejte základní bod a pak druhý bod a posunou se o vzdálenost a ve směru od prvního ke druhému. Nic jiného se na nich nezmění. Stejně jako v AutoCADu posune objekty vybrané před příkazem, bod lze ukázat, uchopit na objektu nebo zadat a při volbě druhého bodu výběr sleduje kurzor, s čárou od základního bodu. Posunutí je jeden krok, který vrátí <Command id="U" />.

## Options

### Displacement

Volí se ve výzvě k základnímu bodu, nebo tamtéž klávesou Enter, protože je to její výchozí možnost: zeptá se na posunutí jako vektor, `10,5` posune o 10 ve směru X a o 5 ve směru Y, a jako výchozí nabídne poslední posunutí, které příkaz POSUN v tomto výkresu použil. U druhého bodu udělá Enter totéž se základním bodem: jeho souřadnice jsou posunutím.

## Missing

Dva z režimů výběru AutoCADu ve výzvě k výběru objektů, Skupina a Násobně, a výběr ploch, hran nebo vrcholů tělesa s klávesou Ctrl pro změnu jeho tvaru. Zatímco výběr sleduje kurzor, má barvu každého objektu, ale ne jeho typ ani tloušťku čáry, a objekty reference bloku mají všechny barvu reference.

## Questions

### Jak se jmenuje příkaz POSUN anglicky?

MOVE. V českém AutoCADu je jeho zkratka `POS`: zadejte ji a stiskněte Enter nebo mezerník. Anglické `M` v české verzi nefunguje; celý název `POSUN` funguje také a `_MOVE` v AutoCADu v jakémkoli jazyce.

### Jak posunout objekt o zadanou vzdálenost?

Zadejte základní bod a pak posunutí napište jako druhý bod: `50,0` posune o 50 ve směru X. Se zapnutým dynamickým zadáváním, jak je na začátku, je bod po prvním relativní k němu, takže ho historie zapíše jako `@50,0`. Nebo ukažte kurzorem směr, s režimem Orto nebo polárním trasováním, a zadejte jen vzdálenost.

### Jak posunout objekty nahoru ve 3D?

Dejte posunutí souřadnici Z: `0,0,5` jako druhý bod nebo jako <Keyword id="Displacement" /> zvedne výběr o 5. Bod zadaný bez Z leží v aktuálním zdvihu.

### Jaký je rozdíl mezi příkazy POSUN a PROTÁHNI (STRETCH)?

Příkaz POSUN přesouvá celé objekty. <Command id="STRETCH" /> přesune jen koncové body a vrcholy uvnitř svého křížového okna a objekty, k nimž patří, protáhne.
