---
title: "AutoCAD ELÉR (EXTEND) parancs"
metaTitle: "Hosszabbítás az AutoCAD-ben: ELÉR (EXTEND)"
description: "Az AutoCAD ELÉR (EXTEND, EL) parancsa: Gyors és Szabványos mód, határolóélek, felfűzés, metszőablak, Él, és Shift a metszéshez. Próbálja ki ingyen, online."
figure: "Két vonal meghosszabbítva az útjukba eső vonalig: mindegyik egyszer kiválasztva a meghosszabbodó vége közelében, Gyors módban."
sourceHash: "b2c0044f8e87"
---

Az ELÉR (EXTEND) parancs addig hosszabbít meg egy objektumot, amíg egy másikat el nem ér: válassza ki a meghosszabbítandó vége közelében, és az a vége az útjába eső legközelebbi élig nyúlik. Meghosszabbít vonalakat, íveket, elliptikus íveket, nyitott vonalláncokat (a végső szakaszuk mentén, egyenesen vagy annak íve mentén), 3D vonalláncokat és nyitott spline-okat. Gyors módban indul, ahogy az AutoCAD-é: minden objektum határolóél. Ha kiválasztáskor lenyomva tartja a Shift billentyűt, metszés történik helyette, ahogy a <Command id="TRIM" /> parancsnál. Minden kiválasztás egyetlen lépés, amely a Vissza paranccsal visszavonható; az Enter befejezi a parancsot.

## Options

### Boundary

Kiválasztja, mely objektumok legyenek határolóélek: jelölje ki őket, vagy nyomja meg az Enter billentyűt, és minden objektum az lesz. Ettől kezdve csak ezek határolnak, bármelyik módban, amíg a parancs véget nem ér.

### Fence

Egy vonal pontjait kéri, tetszőleges számban, az Enter billentyűig: minden objektum, amelyet a vonal metsz, annál a végénél hosszabbodik meg, amelyikhez közelebb a felfűzés metszi, egyetlen lépésben. A Szabványos mód felsorolja; a Gyors mód is elfogadja.

### Crossing

Egy ablak két sarkát kéri: minden objektum, amelyet az ablak körvonala metsz, meghosszabbodik, egyetlen lépésben.

### mOde

Vált a <Keyword id="Quick" /> és a <Keyword id="Standard" /> mód között. Szabványos módban az ELÉR először a határolóéleket kéri (az Enter mindet kiválasztja), és felsorolja a Felfűz és az Él opciót. A mód az ELÉR és a METSZ parancsé egyaránt, és a munkamenet végéig megmarad.

### Edge

Csak Szabványos módban. A <Keyword id="Extend" /> beállítással egy objektum ott is megáll, ahol egy határolóél lenne, ha tovább folytatódna – a vonal mindkét irányban, az ív a köre mentén –, így egy vonal olyan vonalig is meghosszabbodhat, amely nem éri el az útját; a <Keyword id="No extend" /> az alapértelmezés.

### Undo

Akkor jelenik meg, ha a prompt már kapott választ – kiválasztást, felfűzést, ablakot –: visszavonja az utolsó hosszabbítást, és ha már nincs mit visszavonni, ezt jelzi.

## Missing

Vetítés: az AutoCAD vetítési opciója (Nincs, Fkr, Nézet) nem érhető el, és minden az FKR XY síkjára vetítve számítódik, ami az AutoCAD alapértelmezése, az Fkr. A felfűzési vonalat még nem lehet a kurzorral húzni, csak pontonként kijelölni. A mód és az Él opció beállítása a munkamenet végéig marad meg, ahol az AutoCAD egyik munkamenetről a másikra megőrzi. Az FKR-rel szöget bezáró objektum – a spline kivételével – sem nem határol, sem nem hosszabbítható meg, és a <Command id="PEDIT" /> parancs <Keyword command="PEDIT" id="Fit" /> opciójával simított vonalláncot a parancs elutasítja, ahol az AutoCAD az utolsó ívét hosszabbítja meg.

## Questions

### Mi az AutoCAD ELÉR parancs angolul?

EXTEND. A magyar AutoCAD-ben a rövidítése `EL`: írja be, majd nyomja meg az Enter vagy a Szóköz billentyűt. A teljes név is működik, az AutoCAD bármely nyelvi változatában pedig az `_EXTEND` is; az angol `EX` a magyar változatban nem működik.

### Miért írja ki az ELÉR parancs, hogy nincs él?

Mert semmi sem esik keresztbe azon az úton, amelyet a vég követne. A vonal a <Message id="noEdgeInThatDirection" /> üzenetet adja, ha a másik vége érne el egy élt, egyébként a vonal vagy az ív a <Message id="pathDoesNotIntersectBoundingEdge" /> üzenetet; a vonallánc vagy a spline a <Message id="objectDoesNotIntersectEdge" /> üzenetet. Válassza ki a másik végéhez közelebb, vagy Szabványos módban válassza az <Keyword id="Edge" /> és a <Keyword id="Extend" /> opciót, hogy a rövidebb határolóél úgy számítson, mintha tovább folytatódna. A kör, a zárt vonallánc, a teljes ellipszis, a szöveg és a sraffozás egyáltalán nem hosszabbítható meg: <Message id="cannotExtendObject" />

### Hogyan lehet egyszerre több vonalat meghosszabbítani?

Kattintson egy üres helyre, majd adjon meg egy második pontot: minden objektum, amelyet ez a felfűzés metsz, a közelebbi végénél hosszabbodik meg, egyetlen lépésben. Vagy válassza a <Keyword id="Crossing" /> opciót, és húzzon ablakot a meghosszabbítandó végek fölé.

### Hogyan lehet metszeni az ELÉR paranccsal?

Kiválasztáskor tartsa lenyomva a Shift billentyűt: a darab a legközelebbi metszéspontokig levágódik, ahogy a <Command id="TRIM" /> parancs tenné, a semmivel sem metszett objektum pedig törlődik. A következő, Shift nélküli kiválasztás ismét hosszabbít.
