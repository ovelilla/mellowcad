---
title: "Vágólapra másolás az AutoCAD-ben: VGMÁSOL (COPYCLIP) parancs"
metaTitle: "Vágólapra másolás az AutoCAD-ben: Ctrl+C"
description: "A VGMÁSOL (COPYCLIP, Ctrl+C) az AutoCAD-ben a VGVÁG, az ALAPMÁSOL és a VGBEILL paranccsal: objektumok másolása a vágólapra és beillesztésük egy pontban."
figure: "Egy lemez furatának VGMÁSOL parancsa, majd VGBEILL a 65,20 pontban: a másolat a bal alsó sarkánál fogva oda kerül, második furatként."
sourceHash: "f84c995e7c2b"
---

A VGMÁSOL (COPYCLIP) parancs a kijelölt objektumokat a vágólapra másolja, az általuk használt fóliákkal, stílusokkal és blokkokkal együtt; a rajz nem változik, a parancs előtt kijelölt objektumok pedig kijelölve maradnak. A Ctrl+C futtatja, megszakítva az éppen futó parancsot. A <Command id="PASTECLIP" />, Ctrl+V, ezután beszúrási pontot kér: az objektumok követik a kurzort, és a befoglaló téglalapjuk bal alsó sarkánál fogva a pontra kerülnek, az aktuális FKR-ben, egyetlen lépésben, amelyet a <Command id="U" /> parancs visszavon. Beillesztheti ugyanabba a rajzba vagy egy másikba: a vágólap a rendszeré, így egy másik lapon megnyitott rajz is olvashatja, ha a böngésző engedi, hogy az oldal olvassa a vágólapot. Ha egy beillesztett fólia, stílus vagy blokk neve megegyezik a rajzban már meglévőével, a rajz sajátja marad érvényben.

A <Command id="CUTCLIP" />, Ctrl+X, átmásolja az objektumokat, és törli őket, ahogy a RADÍR. Az <Command id="COPYBASE" />, Ctrl+Shift+C, előbb egy bázispontot kér, a VGBEILL pedig ezután a sarkuk helyett ennél a pontnál fogva helyezi el az objektumokat, így pontosan oda kerülnek, ahová szánja őket. A Ctrl+A a rajz összes objektumát kijelöli.

## Missing

A BLOKKBEILL és az ALAPKIVÁG, így a Ctrl+Shift+V és a Ctrl+Shift+X sem, ezeket a böngésző kezeli, ahogy a Ctrl+Shift+A billentyűt is. A BEILLORIG, a VGIRBEILL, az objektumok áthúzása ablakok között, és a más programból beillesztett szöveg bekezdéses szövegként. A VGBEILL pontjánál a BEILL parancs rejtett opciói, így a beillesztés közben a tartalom nem méretezhető át, nem forgatható el és nem vethető szét.

## Questions

### Mi a különbség a MÁSOL és a VGMÁSOL parancs között?

A <Command id="COPY" /> parancs ugyanabban a rajzban helyez el másolatokat, egy bázisponttól egy második pontig. A VGMÁSOL a vágólapra teszi az objektumokat, hogy a VGBEILL paranccsal beillessze őket ebbe vagy egy másik rajzba.

### Hogyan lehet bázisponttal másolni?

Nyomja meg a Ctrl+Shift+C billentyűkombinációt, vagy írja be az `ALAPMÁSOL` parancsot, adja meg a bázispontot, és jelölje ki az objektumokat. A Ctrl+V ezután ennél a pontnál fogva helyezi el őket.

### Hogyan lehet objektumokat egyik rajzból a másikba másolni?

Jelölje ki őket, nyomja meg a Ctrl+C billentyűkombinációt, nyissa meg a másik rajzot, nyomja meg a Ctrl+V billentyűkombinációt, majd adja meg a beszúrási pontot. A fóliáik, stílusaik és blokkjaik is velük jönnek.

### Miért nem működik a beillesztés?

Lehet, hogy a böngésző megkérdezi, olvashatja-e az oldal a vágólapot: engedélyezze. Ha megtagadja, a VGBEILL azt illeszti be, amit utoljára ugyanazon az oldalon másolt. Ha semmit sem másolt, semmit sem illeszt be.
