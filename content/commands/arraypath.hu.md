---
title: "Útvonal menti kiosztás az AutoCAD-ben: KIOSZTÚTVONAL (ARRAYPATH) parancs"
metaTitle: "Útvonal menti kiosztás: KIOSZTÚTVONAL parancs"
description: "Útvonal menti kiosztás az AutoCAD-ben a KIOSZTÚTVONAL (ARRAYPATH) paranccsal: az útvonalgörbe, Beosztás vagy Felosztás, az elemek és illesztésük. Próbálja ki."
figure: "Egy kis négyzet egy ív elején, az ív mentén kiosztva: Felosztás, 7 elem, mindegyik az ívvel együtt elforgatva."
sourceHash: "d0d77418d682"
---

A KIOSZTÚTVONAL (ARRAYPATH) parancs egy útvonal – vonal, ív, kör vagy vonallánc – mentén másolja a kijelölést, egyetlen kiosztásobjektumként. Bekéri az objektumokat, kiírja a típust és azt, hogy a kiosztás asszociatív-e, bekéri az útvonalgörbét, és azonnal megmutatja a kiosztást: az elemek egymástól a kijelölés méretének másfélszerese távolságra vannak, annyi, amennyi elfér az útvonalon, és mindegyik úgy fordul, ahogy az útvonal. A nyitott útvonal a kattintáshoz közelebbi végétől indul, a kör a 0°-os szögétől az óramutató járásával ellentétesen. Ezután egyetlen prompt élőben szerkeszti a kiosztást az opcióival vagy az előnézet fogóival, amíg az Enter létre nem hozza, ahogy az AutoCAD-ben. A kijelölt objektumok a helyükön maradnak, a kiosztás első elemeként.

## Options

### ASsociative

Az <Keyword id="Yes" />, az alapértelmezés, egyetlen kiosztásobjektumot hoz létre, amelyet később a fogói és a Tulajdonságok paletta módosít; a <Keyword id="No" /> különálló másolatokat készít a kijelölt objektumok mellé. A válasz a munkamenet végéig megmarad, a KIOSZTNÉGYSZ és a KIOSZTPOLÁRIS parancsban is.

### Method

A <Keyword id="Measure" />, az alapértelmezés, adott távolságra rakja egymástól az elemeket, annyit, amennyi elfér; a <Keyword id="Divide" /> adott számú elemet egyenletesen oszt el a teljes útvonalon, nyitott útvonalnál mindkét végre egyet-egyet téve.

### Items

Felosztásnál az elemek száma. Beosztásnál az elemek közötti távolság, majd a darabszám, legfeljebb annyi, amennyi elfér – ezt ki is írja –; a <Keyword id="Fill entire path" /> mindet felhasználja.

### Align items

Az <Keyword id="Yes" />, az alapértelmezés, minden elemet úgy forgat el, ahogy az útvonal a kezdetétől fordul; a <Keyword id="No" /> csak eltolja őket az útvonal mentén.

### eXit

Létrehozza a kiosztást, és befejezi a parancsot, ahogy az Enter.

## Missing

A kiosztás nem követi az útvonalát: ha később módosítja az útvonalat, a kiosztás megtartja azt, amelyen létrejött. Spline, ellipszis és 3D vonallánc még nem lehet útvonal, és az FKR síkjából kilépő útvonal sem. A Bázispont, az Érintő iránya, a Sorok, a Szintek, a Z irány és a Kifejezés nem érhető el, csoport sem adható meg az útvonal promptjánál, és a kiosztás fogóinak nincs menüje.

## Questions

### Hogyan lehet objektumokat egy görbe mentén kiosztani az AutoCAD-ben?

Írja be a `KIOSZTÚTVONAL` parancsot, jelölje ki az objektumokat, nyomja meg az Enter billentyűt, és válassza ki az útvonalat annak a végnek a közelében, ahonnan indulni kell; vagy írja be a `KI` rövidítést a <Command id="ARRAY" /> parancshoz, és az objektumok után válassza az <Keyword command="ARRAY" id="PAth" /> opciót. Ezután állítsa be a távolságot vagy az elemek számát, és az Enter megnyomásával hozza létre.

### Miért nem követi az útvonal menti kiosztás az útvonalat?

Itt a kiosztás az útvonalat olyannak őrzi meg, amilyen a létrehozásakor volt: ha később elmozdítja vagy megnyújtja az útvonalat, a kiosztás változatlan marad, míg az AutoCAD asszociatív útvonal menti kiosztása követné. Az útvonal törlése után is megmarad a kiosztás. Ha az elemek nem fordulnak az útvonallal, válassza az <Keyword id="Align items" /> opciót, és válaszoljon így: <Keyword id="Yes" />.

### Hogyan lehet megfordítani egy útvonal menti kiosztás irányát?

Válassza ki az útvonalat a másik végének közelében: a nyitott útvonal a kattintáshoz közelebbi végétől indul. A kör mindig a 0°-os szögétől, az óramutató járásával ellentétesen halad.

### Hogyan lehet az elemeket egyenletesen elosztani a teljes útvonalon?

Válassza a <Keyword id="Method" />, majd a <Keyword id="Divide" />, végül az <Keyword id="Items" /> opciót, és írja be a darabszámot: az elemek egyenletesen oszlanak el, nyitott útvonalnál az első és az utolsó a két végre kerül.
