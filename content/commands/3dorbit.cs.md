---
title: "3D orbit v AutoCADu: příkaz 3DORBIT"
metaTitle: "3D orbit v AutoCADu: příkaz 3DORBIT a zkratka"
description: "Jak otáčet pohled v AutoCADu příkazem 3DORBIT (zkratky 3DO, ORBIT): tažením, se Shiftem a kolečkem myši a návrat k půdorysu. Vyzkoušejte zdarma."
figure: "Kvádr nejprve v půdorysu: 3DORBIT, tažení do strany a dolů, pak Enter, a kvádr je vidět shora, od předního rohu."
sourceHash: "66fc1859c8fd"
---

Příkaz 3DORBIT otáčí pohled kolem výkresu, zatímco táhnete myší; ve výkresu se nic neposune ani nezmění. Tažení do strany otáčí kameru kolem osy Z globálního souřadného systému, tažení nahoru a dolů ji zvedá nebo snižuje, kolem středu výkresu pod středem obrazovky, v rovnoběžném promítání. Na začátku příkaz řekne, jak ho ukončit: dokud běží, můžete jen otáčet pohled a Enter nebo Esc ho ukončí, ať jste táhli, nebo ne.

Podržení Shiftu a kolečka myši otáčí pohled odkudkoli, i uvnitř jiného příkazu, a příkaz spouští také tlačítko Orbit na panelu navigace. Zadaný s apostrofem, `'3DORBIT`, funguje uvnitř jiného příkazu, který pak pokračuje. Každé tažení je krok pro možnost <Keyword command="ZOOM" id="Previous" /> příkazu <Command id="ZOOM" /> a celý příkaz je jeden krok, takže <Command id="U" /> vrátí pohled zpět. Chcete-li vidět tělesa jako tělesa, ne jako drátový model, použijte <Command id="VSCURRENT" />; 3D v MellowCADu jsou jen 3D tělesa, zatím částečně.

## Missing

Místní nabídka s promítáním, vizuálními styly a dalšími režimy navigace. Otáčení jen kolem vybraných objektů. Perspektiva. Volná a nepřetržitá orbita (3DFORBIT, 3DCORBIT) a zbytek 3D navigace AutoCADu.

## Questions

### Jakou zkratku má 3D orbit v AutoCADu?

`3DO` nebo `ORBIT`, pak Enter nebo mezerník; v českém AutoCADu se příkaz jmenuje stejně jako v anglickém, 3DORBIT, a `_3DORBIT` funguje v AutoCADu v jakémkoli jazyce. Bez psaní: podržte Shift a kolečko myši a táhněte.

### Jak otáčet model myší v AutoCADu?

Podržte Shift, stiskněte kolečko myši a táhněte: do strany, abyste model otočili, nahoru a dolů, abyste se na něj podívali z výšky nebo zespodu. Po uvolnění se vrátíte do příkazu, který běžel.

### Jak ukončit 3D orbit?

Stiskněte Enter nebo Esc. Pohled zůstane tak, jak jste ho nechali.

### Jak se po orbitě vrátit k půdorysu?

Spusťte <Command id="PLAN" /> a stiskněte Enter, nebo <Command id="-VIEW" /> s možností <Keyword command="VIEW" id="Top" />, nebo klikněte na horní stěnu krychle ViewCube. Možnost <Keyword command="ZOOM" id="Previous" /> příkazu <Command id="ZOOM" /> vrací pohled po jednom tažení.
