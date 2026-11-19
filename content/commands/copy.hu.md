---
title: "Másolás az AutoCAD-ben: MÁSOL (COPY) parancs"
metaTitle: "Másolás az AutoCAD-ben: MÁSOL (COPY) parancs"
description: "Másolás az AutoCAD-ben a MÁSOL (COPY, M) paranccsal: egy bázispont, majd tetszőleges számú másolat a Vissza és a Kilépés opcióval, vagy egy elmozdulással."
figure: "Egy kör háromszor másolva X irányban ugyanabból a bázispontból, majd Enter."
sourceHash: "e74bbdabf97c"
---

A MÁSOL (COPY) parancs másolatokat helyez el a kijelölt objektumokról: jelölje ki őket, adjon meg egy bázispontot, majd minden másolathoz egy második pontot. Ahogy az AutoCAD-ben, ahol a másolási mód alapértelmezés szerint Többszörös, mindig újabb másolatot kér, amíg meg nem nyomja az Enter billentyűt, vagy a Kilépés opciót nem választja, és minden másolatot ugyanabból a bázispontból mér. A másolatok megtartják az objektumok fóliáját, színét és minden más tulajdonságát. A parancs előtt kijelölt objektumokat másolja, és amíg egy másolatot elhelyez, a készlet követi a kurzort.

## Options

### Displacement

A bázispont promptjánál választva vagy ott az Enter billentyűvel: egyetlen elmozdulást kér be vektorként – a `30,0` egy másolatot tesz X irányban 30-cal arrébb –, majd befejezi a parancsot. Az alapértéke az, amelyet a MÁSOL abban a rajzban utoljára használt.

### Exit

Befejezi a parancsot, ahogy az Enter is, ha már elhelyezett egy másolatot.

### Undo

Visszavonja az utoljára elhelyezett másolatot. Az első visszavonásakor az üzenet <Message id="commandCompletelyUndone" />, és ismét a második pontot kéri.

## Missing

A COPYMODE Egyszeres módja (egy másolat, majd vége) nem érhető el: a MÁSOL mindig Többszörös módban fut, így a bázispont promptja csak az <Keyword id="Displacement" /> opciót sorolja fel. A második pont Kiosztás opciója, az AutoCAD egyenletesen elosztott másolatsora, szintén nem érhető el.

## Questions

### Mi az AutoCAD MÁSOL parancs angolul, és mi a rövidítése?

Angolul COPY, a magyar AutoCAD-ben MÁSOL: írja be az `M` vagy az `MÁ` rövidítést, majd nyomja meg az Enter vagy a Szóköz billentyűt. Az angol `CO` és `CP` a magyar AutoCAD-ben nem működik; a `_COPY` az AutoCAD bármely nyelvén igen.

### Hogyan lehet egyszerre több másolatot készíteni?

Helyezze el őket egymás után: minden megadott pont egy újabb másolat ugyanabból a bázispontból, amíg meg nem nyomja az Enter billentyűt. Sorokba, oszlopokba vagy egy középpont köré a <Command id="ARRAY" /> parancs egy lépésben készíti el őket.

### Hogyan lehet egy objektumot adott távolságra másolni?

Adja meg a bázispontot, majd a második pontot távolságként írja be: a `30,0` X irányban 30-cal arrébb másolja, mert a dinamikus bevitel az első utáni pontot ahhoz képest olvassa. Vagy mutasson a kurzorral a kívánt irányba Orto móddal vagy poláris követéssel, és csak a távolságot írja be.

### Miért nincs Kiosztás opció a MÁSOL parancsban?

A MellowCAD-ben még nem érhető el. Egyenletesen elosztott másolatsorhoz a <Command id="ARRAYRECT" /> parancs egyetlen sorral ugyanezt készíti el, és egyetlen, szerkeszthető kiosztásként tartja meg őket.
