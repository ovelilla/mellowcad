---
title: "Cvičení v AutoCADu: úhelník tvaru L"
metaTitle: "Cvičení v AutoCADu pro začátečníky: úhelník"
description: "Nakreslete úhelník tvaru L v AutoCADu relativními souřadnicemi: obrys, zaoblení, dva otvory a kóty od základny. Krok za krokem, zdarma online."
figure: "Úhelník tvaru L, 100 × 80, okótovaný od levého dolního rohu."
sourceHash: "5c7cd5d57c92"
---

Nakreslete tento úhelník v milimetrech: délka 100, vodorovné rameno vysoké 20 a svislé rameno široké 30 a vysoké 80, vnitřní roh zaoblený poloměrem 10, otvor o průměru 8 ve vodorovném rameni a otvor o průměru 10 ve svislém, každý uprostřed svého ramene. Obrys je jeden tah příkazu <Command id="LINE" />, každý bod zadaný jako posun od předchozího, a všechny kóty vycházejí z levého dolního rohu.

## Steps

### Nakreslete obrys [#outline]

V hladině Obrys příkaz <Command id="LINE" /> od `0,0`, potom každý bod jako krok od předchozího: `100,0`, `0,20`, `-70,0`, `0,60` a `-30,0`. Možnost <Keyword command="LINE" id="Close" /> nakreslí poslední stranu zpět k počátečnímu bodu a příkaz ukončí.

### Zaoblete vnitřní roh [#fillet]

Příkaz <Command id="FILLET" />: zvolte možnost <Keyword command="FILLET" id="Radius" />, zadejte `10` a potom vyberte dvě úsečky, které se setkávají ve vnitřním rohu: horní hranu vodorovného ramene a bok svislého.

### Nakreslete otvory [#holes]

Dvě kružnice příkazem <Command id="CIRCLE" />, každá s možností <Keyword command="CIRCLE" id="Diameter" />: `8` v bodě `80,10`, ve vodorovném rameni, a `10` v bodě `15,65`, ve svislém rameni.

### Okótujte výkres [#dimensions]

V hladině Kóty příkaz <Command id="DIMLINEAR" /> od `0,0` k otvoru ve vodorovném rameni, `80,10`, s kótou umístěnou dole: 80. Příkaz <Command id="DIMBASELINE" /> pokračuje od stejné první vynášecí čáry: zadejte pravý konec, `#100,0`, kde # měří od počátku souřadnic, a potom dvakrát Enter pro ukončení. Stejně podél levé strany, k hornímu otvoru a potom k horní hraně, `#0,80`. Příkazy <Command id="DIMRADIUS" /> na zaoblení a <Command id="DIMDIAMETER" /> na každém otvoru výkres dokončí.
