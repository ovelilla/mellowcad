---
title: "AutoCAD BATTEDIT (EATTEDIT) parancs"
metaTitle: "AutoCAD BATTEDIT: Bővített attribútumszerkesztő"
description: "Blokkattribútumok értékének módosítása az AutoCAD BATTEDIT (EATTEDIT) parancsával a Bővített attribútumszerkesztőben, és miért indítja a dupla kattintás."
figure: "Két íróasztal, egy NUM és PART attribútumú blokk referenciái: a BATTEDIT kiválasztja a másodikat, és a PART mezője B-200 lesz."
sourceHash: "3517c89fd5da"
---

A BATTEDIT (EATTEDIT) parancs egyetlen blokkreferenciához nyitja meg az AutoCAD Bővített attribútumszerkesztőjét: blokk kiválasztását kéri, majd minden attribútumához megjelenít egy mezőt, a címkéjével feliratozva és az értékével kitöltve, ahogy a szerkesztő Attribútum lapja sorolja fel őket. Írja át az értékeket – a Tab billentyű mezőről mezőre lép –, és az Enter egyetlen lépésben alkalmazza őket, amelyet a <Command id="U" /> parancs visszavon; az Esc semmit sem módosít.

Ha duplán kattint egy attribútumokat tartalmazó referenciára, az a BATTEDIT parancsot futtatja, ahogy az AutoCAD-ben: a parancssor kiírja a parancsot, válaszként a dupla kattintás pontjával, és a párbeszédpanel azonnal megnyílik. A kattintás a kijelölődoboz alatti objektumot választja ki: minden mást, ami nem blokkreferencia, a parancs elutasít, ahogy az attribútumok nélküli blokkot is, és újra kérdez. Csak a kiválasztott referencia változik; a blokk definíciója és a többi referenciája megtartja az értékeit.

## Missing

A szerkesztő Szövegbeállítások lapja (az egyes attribútumok szövegének stílusa, igazítása, magassága, forgatása, szélességi tényezője és a többi) és Tulajdonságok lapja (fólia, vonaltípus, szín, vonalvastagság), valamint a Blokk kiválasztása gomb. Az ATTIPEDIT parancs, amely egyetlen attribútumot a helyén szerkeszt, és a hozzá tartozó Ctrl + dupla kattintás. A nem rögzített helyzetű attribútum saját fogója a referencián, és a Tulajdonságok paletta attribútumsorai. A `-ATTEDIT` parancs.

## Questions

### Hogyan lehet megnyitni a Bővített attribútumszerkesztőt az AutoCAD-ben?

Kattintson duplán egy attribútumokat tartalmazó blokkreferenciára, vagy írja be: `BATTEDIT`, és válassza ki a referenciát. Az `_EATTEDIT` az AutoCAD bármely nyelvi változatában működik.

### Hogyan lehet módosítani egy attribútum értékét az AutoCAD-ben?

Kattintson duplán a blokkra, írja be az új értéket az attribútum mezőjébe, és nyomja meg az Enter billentyűt. Minden referencia megtartja a saját értékeit: az egyik módosítása a többit változatlanul hagyja.

### Miért nem lehet dupla kattintással szerkeszteni egy blokk attribútumait?

A BATTEDIT parancs olyan referenciánál nyílik meg, amelynek blokkja attribútumokat tartalmaz, és az attribútumok nélkül létrehozott blokknak nincs ilyenje: definiálja őket az <Command id="ATTDEF" /> paranccsal, és a blokk létrehozásakor jelölje ki őket a többi objektummal együtt. Ha egy attribútum értéke nem látszik, ellenőrizze az <Command id="ATTDISP" /> parancsot, amely elrejtheti a láthatatlan attribútumokat vagy mindet.

### Mi a különbség a BATTEDIT és az ATTEDIT parancs között?

Ugyanazokat az értékeket szerkesztik. A BATTEDIT minden mezőt a címkéjével feliratoz, ahogy a Bővített attribútumszerkesztő Attribútum lapja; az <Command id="ATTEDIT" /> parancs a promptjával, ahogy az Attribútumok módosítása párbeszédpanel. Az AutoCAD-ben a BATTEDIT az egyes attribútumok szövegbeállításait és tulajdonságait is szerkeszti.
