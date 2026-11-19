---
title: "Mozgatás az AutoCAD-ben: MOZGAT (MOVE) parancs"
metaTitle: "Mozgatás az AutoCAD-ben: MOZGAT (MOVE)"
description: "Mozgatás az AutoCAD MOZGAT (MOVE, rövidítése MO) parancsával promptról promptra: bázispont és második pont, vagy X,Y,Z elmozdulás. Próbálja ki ingyen online."
figure: "Egy kör 50-nel jobbra mozgatva: kiválasztva, a középpontja a bázispont, a második pont beírva."
sourceHash: "753ca38448bf"
---

A MOZGAT (MOVE) parancs a kiválasztott objektumokat egyik helyről a másikra viszi: válassza ki őket, adjon meg egy bázispontot, majd egy második pontot, és az objektumok az elsőtől a másodikig mért távolsággal és irányban elmozdulnak. Más nem változik rajtuk. Ahogy az AutoCAD-ben, a parancs előtt kiválasztott objektumokat mozgatja, a pontot meg lehet mutatni, tárgyraszterrel megfogni vagy beírni, és amíg a második pontot választja, a kiválasztás a kurzort követi, egy vonallal a bázisponttól. A mozgatás egyetlen lépés, amelyet a Vissza visszavon.

## Options

### Displacement

A bázispont promptjánál választható, vagy ott az Enterrel, mert ez az alapérték: vektorként kéri be az elmozdulást, a `10,5` 10-zel mozgat X, 5-tel Y irányban, alapértéke pedig az, amelyet a MOZGAT legutóbb használt az adott rajzban. A második pontnál az Enter ugyanezt teszi a bázisponttal: annak koordinátái adják az elmozdulást.

## Missing

Az AutoCAD két kiválasztási módja az objektumpromptnál, a Csoport és a Többszörös, valamint egy szilárdtest lapjainak, éleinek vagy csúcsainak kiválasztása a Ctrl billentyűvel az alakja módosításához. Amíg a kiválasztás a kurzort követi, minden objektum a saját színével látszik, de a vonaltípusával és a vonalvastagságával nem, a blokkreferencia objektumai pedig mind a referencia színét viselik.

## Questions

### Mi az AutoCAD MOZGAT parancs angolul?

MOVE. A magyar AutoCAD-ben a rövidítése `MO`: írja be, majd nyomja meg az Enter vagy a Szóköz billentyűt. Az angol `M` a magyar változatban a MÁSOL parancsot indítja; a teljes `MOZGAT` név működik, a `_MOVE` pedig az AutoCAD bármely nyelvi változatában.

### Hogyan lehet egy objektumot adott távolsággal elmozgatni?

Adja meg a bázispontot, majd második pontként írja be az elmozdulást: az `50,0` 50-nel mozgat X irányban. Bekapcsolt dinamikus bevitelnél, ahogy a program indul, az első utáni pont ahhoz képest relatív, ezért az előzmények `@50,0` formában írják. Vagy mutasson a kurzorral a kívánt irányba, Orto móddal vagy poláris követéssel, és csak a távolságot írja be.

### Hogyan lehet objektumokat felfelé mozgatni 3D-ben?

Adjon Z értéket az elmozdulásnak: a második pontként vagy <Keyword id="Displacement" /> értékként megadott `0,0,5` 5-tel emeli meg a kiválasztást. A Z nélkül beírt pont az aktuális szinten fekszik.

### Mi a különbség a MOZGAT és a NYÚJT (STRETCH) parancs között?

A MOZGAT egész objektumokat mozgat. A <Command id="STRETCH" /> csak a metsző ablakán belül eső végpontokat és csúcspontokat mozgatja, és megnyújtja azokat az objektumokat, amelyekhez tartoznak.
