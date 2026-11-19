---
title: "Letörés az AutoCAD-ben: LETÖR (CHAMFER) parancs"
metaTitle: "Letörés az AutoCAD-ben: LETÖR (CHAMFER) parancs"
description: "Sarok letörése az AutoCAD-ben a LETÖR (CHAMFER, LT) paranccsal, promptról promptra: két távolság, két vonal vagy egy vonallánc sarkai, Többszörös, Shift."
figure: "Négy vonal, majd Távolság mindkettőre 10 és Többszörös: két sarok letörve, kettő hegyes marad."
sourceHash: "e43c5b72ffc8"
---

A LETÖR (CHAMFER) parancs két vonal közötti sarkot egyenes ferde éllel vágja le. Válassza ki az első vonalat, majd a másodikat: mindkettőt a parancs a letörésig vágja vagy meghosszabbítja, az elsőt az első, a másodikat a második távolsággal, és a letörés összeköti őket. Két vonalon, egy vonallánc két egyenes szakaszán, illetve egy vonalon és egy vonalláncon működik, ez utóbbiakat egyetlen vonallánccá fűzi. Ahogy az AutoCAD-ben, az első sora kiírja az aktuális távolságokat, amelyeket a rajz megőriz; ha mindkettő 0, ami az alapértelmezés, hegyes sarok keletkezik, a vonalak összeérnek. Amíg a második vonalat választja ki, a vonalakon látszik a sarok, amelyet létrehozna.

## Options

### Undo

Visszavonja ennek a futásnak az utolsó letörését, és vele együtt a távolságok módosítását is.

### Polyline

Bekér egy 2D vonalláncot, és minden sarkát letöri, majd kiírja, hány vonalat tört le, és miért nem a többit.

### Distance

Bekéri az első és a második letörési távolságot. A második az elsőt kínálja fel, így ott az Enter szimmetrikus letörést készít, derékszögű saroknál 45 fokosat.

### Multiple

Minden letörés után újra bekér egy első vonalat, amíg az Enter vagy az Esc meg nem állítja.

## Missing

A Szög opció, amely a letörést egy távolsággal és egy szöggel adja meg, valamint a Módszer és a Metszés: a LETÖR mindig két távolsággal dolgozik, és mindig vágja a vonalakat. Az AutoCAD-ben a letörés a második vonal vonaltípus-léptékét kapja, itt nem.

## Questions

### Mi az AutoCAD LETÖR parancs angolul, és mi a rövidítése?

Angolul CHAMFER, a magyar AutoCAD-ben LETÖR: írja be az `LT` rövidítést, majd nyomja meg az Enter vagy a Szóköz billentyűt. Az angol `CHA` a magyar AutoCAD-ben nem működik; a `_CHAMFER` az AutoCAD bármely nyelvén igen.

### Hogyan lehet 45 fokos letörést készíteni az AutoCAD-ben?

Válassza a <Keyword id="Distance" /> opciót, írja be a távolságot, és a másodiknál nyomja meg az Enter billentyűt: derékszögű saroknál két egyenlő távolság 45 fokos letörést ad.

### Mi a különbség a LETÖR és a LEKEREKÍT parancs között?

A LETÖR két vonalat egyenes ferde éllel köt össze, a <Command id="FILLET" /> parancs mindkettőhöz érintő ívvel. Mindkettő hozzávágja vagy meghosszabbítja a vonalakat, és mindkettő hegyes sarkot készít 0 értéknél, vagy ha a második vonal kiválasztásakor lenyomva tartja a Shift billentyűt.

### Miért nem működik a LETÖR?

Kiírja, miért: <Message id="chamferDistanceTooLarge" />, ha egy távolság túlnyúlik a vonala végén, <Message id="linesParallel" /> párhuzamos vonalaknál, és <Message id="chamferRequiresLines" /> ívnél vagy körnél. Ha mindkét távolság 0, sarkot készít, nem letörést.

### Hogyan lehet egy téglalap minden sarkát letörni?

A téglalap vonallánc: válassza a <Keyword id="Polyline" /> opciót, és jelölje ki, így minden sarka letörik az aktuális távolságokkal.
