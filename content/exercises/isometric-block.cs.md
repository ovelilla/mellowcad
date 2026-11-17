---
title: "Cvičení v AutoCADu: stupňovitý hranol v izometrii"
metaTitle: "Izometrické zobrazení v AutoCADu: cvičení"
description: "Nakreslete stupňovitý hranol v izometrii v AutoCADu příkazem ÚSEČKA (LINE) a polárními souřadnicemi podél os 30°, 90° a 150°, potom ho okótujte."
figure: "Stupňovitý hranol v izometrii: délka 60, hloubka 40, výška 40, kóty podél hran."
sourceHash: "c1039d3b5e97"
---

Nakreslete tento stupňovitý hranol v izometrii, v milimetrech: délka 60, hloubka 40 a výška 40, se stupněm hlubokým 20 a vysokým 20 podél přední strany. Každá hrana vede podél jedné z izometrických os: 30° a 210° pro délku, 150° a 330° pro hloubku, 90° a 270° pro výšku. MellowCAD zatím nemá izometrické kreslení AutoCADu, jeho izometrický krok ani izokružnice, takže hrany jsou úsečky zadané polárními souřadnicemi: délkou a úhlem.

## Steps

### Nakreslete přední stranu stupně [#front]

V hladině Obrys příkaz <Command id="LINE" /> od `0,0`, dolního předního rohu: `60<30`, `20<90`, `60<210`, potom možnost <Keyword command="LINE" id="Close" />.

### Nakreslete bok [#side]

Znovu od `0,0` levý bok: `40<150`, `40<90`, `20<330`, `20<270` a `20<330`. Enter ukončí úsečku na přední hraně stupně.

### Nakreslete horní plochy [#top]

Zbytek začíná v rozích, které už jsou nakreslené: zadejte `_END`, uchopení objektu Koncový pro jeden bod, a vyberte roh. Od pravého horního rohu přední strany: `20<150`, `20<90`, `20<150` a `60<210`. Potom dvě úsečky `60<210`, od paty čela stupně a od jeho horní hrany.

### Okótujte výkres [#dimensions]

V hladině Kóty příkaz <Command id="DIMALIGNED" /> podél hran, každá kóta vedle své hrany: 60 a 40 dole, 40 podél levé strany, 20 podél pravé.
