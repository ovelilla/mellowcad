---
title: "Vonalvastagság az AutoCAD-ben: VVAST (LWEIGHT) parancs"
metaTitle: "Vonalvastagság az AutoCAD-ben: VVAST (LWEIGHT)"
description: "Az AutoCAD VVAST (LWEIGHT, rövidítése VV) parancsa: az új objektumok vonalvastagsága mm-ben, a 24 szabványos érték, a FÓLIA és a megjelenítés. Próbálja ki."
figure: "Egy alaplap körvonala 0,70 mm-es vonalvastagsággal, majd a furatához beírt 0.1, amelyet 0,09 mm-re kerekít: a két vastagság, ahogy a képernyő mutatja."
sourceHash: "154784b2b402"
---

A VVAST (LWEIGHT) parancs azt a vonalvastagságot állítja be milliméterben, amellyel az új objektumok rajzolódnak. Az AutoCAD a Vonalvastagság - beállítások párbeszédpanelt nyitja meg; a MellowCAD-ben ez még nincs meg, ezért a VVAST az AutoCAD-ben is meglévő parancssori változatot futtatja, a <Command id="-LWEIGHT" /> parancsot. Kiírja az aktuális vonalvastagságot, kezdetben `FÓLIA`, és újat kér: az AutoCAD 24 szabványos értékének egyikét, 0,00 és 2,11 mm között. Bármely más értéket a legközelebbi szabványos értékre állít, és ezt jelzi is, a negatívat pedig <Message id="invalidLineweightNumber" /> üzenettel elutasítja. Az Enter megtartja az aktuális vonalvastagságot. Minden változtatás olyan lépés, amelyet a <Command id="U" /> visszavon.

A vonalvastagságok itt kezdettől látszanak a képernyőn: az AutoCAD csak akkor mutatja őket, ha az állapotsor Vonalvastagság gombja (LWDISPLAY) be van kapcsolva, a MellowCAD-ben azonban nincsenek elrendezések és nyomtatás, így a képernyő az egyetlen hely, ahol megjelenhetnek. A gomb ki- és bekapcsolja őket. A szélességgel rendelkező vonallánc felülnézetben a szélességét mutatja, nem a vonalvastagságát.

## Options

### ?

Kilistázza az elfogadott értékeket, a Fólia szerint értéket és a 24 szabványos vonalvastagságot, majd újra kérdez.

### BYLAYER

Az új objektumok a fóliájuk vonalvastagságát kapják, ahogy kezdetben is.

## Missing

A Blokk szerint és az Alapértelmezett érték (LWDEFAULT), a hüvelykben megadott vonalvastagság, a Vonalvastagság - beállítások párbeszédpanel és a legördülő lista Vonalvastagság - beállítások… eleme.

## Questions

### Mi az AutoCAD VVAST parancs angolul?

LWEIGHT. A magyar AutoCAD-ben a rövidítése `VV`, és a `VONALVASTAGSÁG` is: írja be valamelyiket, majd nyomja meg az Enter vagy a Szóköz billentyűt. Az angol `LW` és `LINEWEIGHT` a magyar változatban nem működik; a teljes `VVAST` név igen, a `_LWEIGHT` pedig az AutoCAD bármely nyelvi változatában.

### Miért nem látszik a vonalvastagság az AutoCAD-ben?

Az AutoCAD-ben a vonalvastagságok csak akkor jelennek meg a képernyőn, ha az állapotsor Vonalvastagság gombja be van kapcsolva (LWDISPLAY 1); kezdetben ki van kapcsolva. Itt kezdettől be van kapcsolva. A vékony vonalvastagságok mind a képernyő legvékonyabb vonalával rajzolódnak, így a különbség a vastagabbaknál látszik; a Fólia szerinti vonalvastagságú objektum pedig a fóliája vonalvastagságát kapja.

### Hogyan lehet módosítani egy meglévő objektum vonalvastagságát?

Válassza ki, és állítsa be a vonalvastagságot a Tulajdonságok paletta Vonalvastagság sorában, vagy ha az objektum vonalvastagsága Fólia szerint van beállítva, módosítsa a fóliája vonalvastagságát a Fóliatulajdonság-kezelőben. A VVAST parancs csak az utána rajzolt objektumok vonalvastagságát állítja be.

### Milyen vonalvastagságok vannak az AutoCAD-ben?

24 rögzített érték milliméterben: 0,00; 0,05; 0,09; 0,13; 0,15; 0,18; 0,20; 0,25; 0,30; 0,35; 0,40; 0,50; 0,53; 0,60; 0,70; 0,80; 0,90; 1,00; 1,06; 1,20; 1,40; 1,58; 2,00 és 2,11. Ha mást ír be, például `0.45`-öt, a VVAST parancs a legközelebbit veszi, egyenlő távolságnál a vékonyabbat.
