---
title: "AutoCAD gyakorló feladat: lépcső alaprajzban"
metaTitle: "AutoCAD építész gyakorló feladat: lépcső"
description: "Egyenes lépcső alaprajza AutoCAD-ben: tíz fellépő egy vonalból és négyszögletes kiosztással, a felmenetet jelző nyíl és a méretek. Ingyen, lépésről lépésre."
figure: "Egyenes lépcsőkar alaprajzban, 280 × 100 centiméter, a felmenet irányába mutató nyíllal."
sourceHash: "ff6e60262cd9"
---

Rajzolja meg egy egyenes lépcsőkar alaprajzát centiméterben: 280 hosszú és 100 széles, tíz 28-as fellépővel és a felmenet irányát mutató nyíllal. A rajz méretléptéke centiméteres alaprajzra van beállítva, így a méretek ebben a nagyságban is olvashatók. Egy fellépő élét rajzolja meg; a többit egy négyszögletes kiosztás helyezi el.

## Steps

### Rajzolja meg a körvonalat [#outline]

A Körvonal fólián a <Command id="RECTANG" /> parancs a `0,0` ponttól a `280,100` pontig: a lépcsőkar körvonala.

### Rajzolja meg az első fellépőt [#tread]

Az első fellépő éle: egy vonal a <Command id="LINE" /> paranccsal a `28,0` ponttól `0,100` értékkel felfelé, és Enter.

### Ossza ki a fellépőket [#array]

A <Command id="ARRAYRECT" /> parancs végigmásolja a lépcsőkaron: válassza ki a vonalat, és nyomja meg az Enter billentyűt, majd válassza a <Keyword command="ARRAYRECT" id="COUnt" /> opciót, `9` oszlop és `1` sor, és az <Keyword command="ARRAYRECT" id="Spacing" /> opciót, `28` az oszlopok és `1` a sorok között, aminek egyetlen sornál nincs hatása. A <Keyword command="ARRAYRECT" id="eXit" /> opció asszociatív kiosztásként tartja meg, amelyet később a fogóival lehet szerkeszteni.

### Rajzolja meg a nyilat [#arrow]

A <Command id="PLINE" /> parancs a `14,50` ponttól a lépcsőkar mentén `226,0` értékkel tovább; ezután a <Keyword command="PLINE" id="Width" /> opció, `10` az elején és `0` a végén, és egy utolsó, `24,0` hosszú szakasz: a nyílhegy. Az Enter befejezi.

### Méretezze [#dimensions]

A Méretek fólián háromszor a <Command id="DIMLINEAR" /> parancs: alul a hosszt, jobb oldalt a szélességet, fent egy fellépőt, 28.
