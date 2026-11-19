---
title: "AutoCAD gyakorló feladat: L alakú konzol"
metaTitle: "AutoCAD gyakorló feladat kezdőknek: L-konzol"
description: "L alakú konzol rajzolása AutoCAD-ben relatív koordinátákkal: körvonal, lekerekítés, két furat, bázisvonalas méretek, lépésről lépésre. Gyakorolja ingyen."
figure: "Az L alakú konzol, 100 × 80, a bal alsó sarkától méretezve."
sourceHash: "5c7cd5d57c92"
---

Rajzolja meg ezt a konzolt milliméterben: 100 hosszú, 20 magas talppal és 30 széles, 80 magas függőleges szárral, a belső sarok 10 sugárral lekerekítve, a talpban egy 8-as, a szárban egy 10-es furattal, mindkettő a talp, illetve a szár közepén. A körvonalat egyetlen <Command id="LINE" /> paranccsal rajzolja meg, minden pontot az előzőhöz képesti elmozdulásként beírva, és a méretei mind a bal alsó sarokból indulnak.

## Steps

### Rajzolja meg a körvonalat [#outline]

A Körvonal fólián a <Command id="LINE" /> parancs a `0,0` ponttól, majd minden pont lépésként az előzőtől: `100,0`, `0,20`, `-70,0`, `0,60` és `-30,0`. A <Keyword command="LINE" id="Close" /> opció megrajzolja az utolsó oldalt vissza a kezdőpontig, és befejezi a parancsot.

### Kerekítse le a belső sarkot [#fillet]

A <Command id="FILLET" /> parancs: válassza a <Keyword command="FILLET" id="Radius" /> opciót, írja be: `10`, majd válassza ki a belső saroknál találkozó két vonalat, a talp tetejét és a szár oldalát.

### Rajzolja meg a furatokat [#holes]

Két kör a <Command id="CIRCLE" /> paranccsal, mindkettő az <Keyword command="CIRCLE" id="Diameter" /> opcióval: `8` a `80,10` pontban, a talpban, és `10` a `15,65` pontban, a szárban.

### Méretezze [#dimensions]

A Méretek fólián a <Command id="DIMLINEAR" /> parancs a `0,0` ponttól a talp furatáig, `80,10`, alul elhelyezve: 80. A <Command id="DIMBASELINE" /> parancs ugyanattól az első méretsegédvonaltól folytatja: írja be a jobb oldali végpontot, `#100,0`, ahol a # az origótól mér, majd a befejezéshez nyomja meg kétszer az Enter billentyűt. Ugyanígy a bal oldalon felfelé, a felső furatig, majd a tetejéig, `#0,80`. A <Command id="DIMRADIUS" /> parancs a lekerekítésen és a <Command id="DIMDIAMETER" /> parancs mindkét furaton befejezi a méretezést.
