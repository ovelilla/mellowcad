---
title: "Sugárméret az AutoCAD-ben: MÉRETSUGÁR (DIMRADIUS) parancs"
metaTitle: "Sugárméret az AutoCAD-ben: MÉRETSUGÁR"
description: "Kör, ív vagy lekerekítés sugarának méretezése az AutoCAD MÉRETSUGÁR (DIMRADIUS, MSU) parancsával: kiválasztás, majd az R szöveg elhelyezése. Próbálja ki ingyen."
figure: "Egy lemez lekerekített sarka kívül, a furata belül méretezve: mindkét görbe kiválasztva, majd a szöveg elhelyezve."
sourceHash: "6b1cdea584be"
---

A MÉRETSUGÁR (DIMRADIUS) parancs kör, ív vagy vonallánc ívszakaszának sugarát méretezi. Válassza ki a görbét, és a parancssor azonnal kiírja a mért értéket; ezután helyezze el a méretet, és a parancs véget ér. Ahogy az AutoCAD-ben, a szövege az R betű után álló sugár, egy sugárirányú vonalon, amely egyetlen nyílfejben végződik a görbén, a görbén belül vagy kívül, aszerint, hová helyezi el. Kívül a vonal a görbén át egészen a középpontig folytatódik, ahogy az ISO-25 rajzolja.

## Options

### Text

A mért érték helyett írandó szöveget kéri, és alapértelmezésként a mért értéket kínálja fel: az Enter megtartja. A beírt szövegben a `<>` a mért értéket jelenti az R betűvel együtt, így a `<> max` 10-es sugárnál `R10 max` szöveget ír.

### Angle

A szöveg szögét kéri: a szöveg ezután ebben a szögben jelenik meg, a közepe a vonalon, és a vonal nála véget ér. A 0 ismét a vonal mentén helyezi el.

## Missing

Bekezdéses szöveg: a méret szövege egyetlen sor, amelyet a parancssorban a <Keyword id="Text" /> opcióval lehet megadni, soha nem a szövegszerkesztőben. Íven a nyílfej a végpontjai között marad, ahol az AutoCAD a végpontokon túl elhelyezett mérethez ívsegédvonalat rajzol. Blokkreferencián belüli görbe nem választható ki. A stílus középvonalai (negatív középjelméret) nem jelennek meg, és a görbén kívüli szövegre vonatkozó beállításai nem érhetők el: a szöveg mindig a vonal mentén fut, vízszintes szakasz nélkül, ahogy az ISO-25 rajzolja. A méret nem asszociatív: nem követi a mért görbét.

## Questions

### Mi az AutoCAD MÉRETSUGÁR parancs angolul?

DIMRADIUS. A magyar AutoCAD-ben a rövidítése `MSU` vagy `MSUG`: írja be, majd nyomja meg az Enter billentyűt vagy a szóközt. A teljes név is működik, az AutoCAD bármely nyelvi változatában pedig a `_DIMRADIUS` is; az angol `DRA` és `DIMRAD` a magyar változatban nem működik.

### Hogyan lehet egy lekerekítést vagy lekerekített sarkot méretezni?

Válassza ki a lekerekítést: ez egy ív vagy egy vonallánc ívszakasza, mint a sarkok, amelyeket a <Command id="RECTANG" /> parancs a <Keyword command="RECTANG" id="Fillet" /> opcióval kerekít le, és a MÉRETSUGÁR parancs mindkettőt elfogadja.

### Miért nem lehet kiválasztani a méretezendő objektumot?

A MÉRETSUGÁR parancs kört, ívet vagy vonallánc ívszakaszát fogad el, zárolt fólián is. Bármi más, az ellipszist is beleértve, a <Message id="notCircleOrArc" /> üzenetet váltja ki, és a parancs újra kérdez; blokkreferencián belüli görbe egyelőre nem választható ki.

### Hogyan lehet megjegyzést írni egy sugárméretbe?

Elhelyezés előtt válassza a <Keyword id="Text" /> opciót, és írja be: `<> max`; a `<>` a mért érték az R betűvel, így a méret szövege `R10 max` lesz. Elhelyezett méretnél a Tulajdonságok paletta Szöveg felülírása sora módosítja.
