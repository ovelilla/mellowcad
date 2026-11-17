---
title: "Cvičení v AutoCADu: kulatý stůl a židle"
metaTitle: "Cvičení v AutoCADu: kulatý stůl a šest židlí"
description: "Nakreslete v AutoCADu kulatý stůl se šesti židlemi: jednu židli, potom polární pole kolem středu stolu a kóty. Krok za krokem, zdarma online."
figure: "Kulatý stůl o průměru 120 se šesti židlemi, v půdorysu, okótovaný v centimetrech."
sourceHash: "1e307bf5e17a"
---

Nakreslete kulatý stůl o průměru 120 se šesti židlemi, v centimetrech: každá židle je sedák 44 × 40 s rohy zaoblenými poloměrem 4 a opěradlo hluboké 8, přední hrana sedáku leží 8 od okraje stolu. Nakreslete jednu židli nad stolem a všech šest rozmístí polární pole. Měřítko kót výkresu je nastavené pro centimetry.

## Steps

### Nakreslete stůl [#table]

V hladině Obrys příkaz <Command id="CIRCLE" /> v bodě `0,0`, možnost <Keyword command="CIRCLE" id="Diameter" />, `120`.

### Nakreslete židli [#chair]

Sedák, nad stolem: příkaz <Command id="RECTANG" /> s možností <Keyword command="RECTANG" id="Fillet" /> `4`, od `-22,68` do bodu o `44,40` dál. Potom opěradlo, s poloměrem zaoblení vráceným na `0`, od `-22,108` do bodu o `44,8` dál. Příkaz <Command id="RECTANG" /> si poloměr zaoblení pamatuje, dokud ho nezměníte.

### Vytvořte pole židlí [#array]

Příkaz <Command id="ARRAYPOLAR" />: vyberte sedák a opěradlo, stiskněte Enter, zadejte střed stolu, `0,0`, a potom možnost <Keyword command="ARRAYPOLAR" id="Items" />, `6`. Každá židle se při rozmístění natočí, takže všech šest je obráceno ke stolu.

### Okótujte výkres [#dimensions]

V hladině Kóty příkaz <Command id="DIMDIAMETER" /> na stole, s kótou umístěnou uvnitř, a příkaz <Command id="DIMLINEAR" /> pro šířku horní židle, 44, a její hloubku s opěradlem, 48.
