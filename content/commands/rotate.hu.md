---
title: "Forgatás az AutoCAD-ben: FORGAT (ROTATE) parancs"
metaTitle: "Forgatás az AutoCAD-ben: FORGAT (ROTATE)"
description: "Forgatás az AutoCAD FORGAT (ROTATE, rövidítése FOR) parancsával promptról promptra: bázispont és szög, Másol az eredeti megtartásához, Referencia. Próbálja ki."
figure: "Egy téglalap 30°-kal elforgatva a sarka körül a Másol opcióval, az eredeti megmarad."
sourceHash: "0e5ae021e108"
---

A FORGAT (ROTATE) parancs egy bázispont körül forgatja el a kiválasztott objektumokat: válassza ki őket, adja meg a bázispontot, majd a szöget – beírva, vagy egy ponttal, amelynek a bázisponttól mért iránya adja a szöget. Az első sora kiírja, melyik irány a pozitív, alapértelmezés szerint az óramutató járásával ellentétes (ANGDIR), és hol van a 0 (ANGBASE). A szögnél az Enter az utolsó elforgatást ismétli, új rajzban 0-t. Az objektumok egy, az FKR Z tengelyével párhuzamos, a bázisponton átmenő tengely körül fordulnak el, így 3D-ben megtartják a magasságukat. Az elforgatás egyetlen lépésként vonható vissza.

## Options

### Copy

Egy másolatot forgat el, az objektumokat pedig a helyükön hagyja, és ezt írja ki: <Message id="rotatingCopy" />. A prompt ezután újra a szöget kéri.

### Reference

Egy meglévő szögből forgat a kívántba: bekéri a referenciaszöget (beírva, vagy két ponttal, amelyek kimérik), majd az új szöget, és a különbséggel forgat. Egy ferde él vízszintessé tételéhez jelölje ki referenciaként a két végpontját, és írja be a 0-t.

### Points

A Referencia új szögénél: az új szög két kijelölt pont közötti egyenes szöge, így az objektumok egy már megrajzolt élhez igazodnak.

## Missing

Amíg a szöget adja meg, az elforgatott kiválasztás minden objektum saját színével követi a kurzort, a vonaltípusával és a vonalvastagságával azonban nem.

## Questions

### Mi az AutoCAD FORGAT parancs angolul?

ROTATE. A magyar AutoCAD-ben a rövidítése `FOR`: írja be, majd nyomja meg az Enter vagy a Szóköz billentyűt. Az angol `RO` a magyar változatban az XPLODE parancsot indítja; a teljes `FORGAT` név működik, a `_ROTATE` pedig az AutoCAD bármely nyelvi változatában.

### Hogyan lehet egy objektumot egy másikhoz igazítva elforgatni?

Válassza a <Keyword id="Reference" /> opciót, jelöljön ki két pontot az objektum éle mentén, majd válassza a <Keyword id="Points" /> opciót, és jelöljön ki két pontot azon a vonalon, amelyhez igazodnia kell.

### Hogyan lehet egy objektumot úgy elforgatni, hogy az eredeti megmaradjon?

A szög megadása előtt válassza a <Keyword id="Copy" /> opciót: a másolat elfordul, az eredeti a helyén marad.

### Miért rossz irányba forgat a FORGAT?

A pozitív szög az óramutató járásával ellentétesen forgat, ahogy az első sorban az ANGDIR is jelzi. Az óramutató járásával megegyező forgatáshoz írjon be negatív szöget, például `-30`.
