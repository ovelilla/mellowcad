---
title: "Lemez az AutoCAD-ben: LEMEZ (REGION) parancs"
metaTitle: "Lemez az AutoCAD-ben: LEMEZ (REGION) parancs"
description: "Az AutoCAD LEMEZ (REGION, rövidítése LEM) parancsa zárt alakzatokból lemezt készít: milyen hurkokat talál, miért nem készít egyet sem, és mire jó a lemez."
figure: "Négy, végpontjaival zárt alakzatot alkotó vonal és bennük egy kör: a LEMEZ, mindkettő köré húzott ablakkal, két lemezt készít, és törli az objektumokat."
sourceHash: "69a5423c3d5c"
---

A LEMEZ (REGION) parancs zárt alakzatokból lemezt készít: vastagság nélküli sík területet, amelyet a hurkai határolnak. Válassza ki az objektumokat, és nyomja meg az Enter billentyűt; minden hurokból, amelyet alkotnak, lemez lesz. A zárt objektum önmagában egy hurok: a kör, az ellipszis, a zárt vonallánc vagy spline. A nyitottakat – vonalakat, íveket, ellipszisíveket, nyitott vonalláncokat és spline-okat – végpontjaiknál fűzi láncba, soha nem ott, ahol metszik egymást, a be nem záródó láncot pedig elveti. A parancssor ezután kiírja, hány hurkot talált, hányat utasított el és miért, és hány lemezt hozott létre; üres kiválasztásnál az Enterre <Message id="regionNoneFound" /> a válasz.

A lemezbe bekerült objektumokat törli, a többit megtartja, a lemezek pedig az aktuális fóliát és tulajdonságokat kapják, nem az objektumokét. A másik hurkon belüli hurok saját lemezt ad, nem lyukat a másikban: a <Command id="SUBTRACT" /> vonja ki az egyiket a másikból. A lemezből csak az élei rajzolódnak ki, és azokra lehet tárgyraszterrel illeszkedni; a Tulajdonságok paletta mutatja a területét és a kerületét, amelyet a <Command id="AREA" />, a <Command id="LIST" /> és a <Command id="MASSPROP" /> is megmér. Az <Command id="UNION" />, a <Command id="SUBTRACT" /> és a <Command id="INTERSECT" /> egy síkban fekvő lemezeket kombinál, a <Command id="EXTRUDE" />, a <Command id="REVOLVE" /> és a <Command id="PRESSPULL" /> 3D szilárdtestté alakítja őket, a <Command id="EXPLODE" /> pedig visszaadja a vonalaikat, íveiket és köreiket. A teljes parancs egyetlen visszavonási lépés.

## Missing

Az AutoCAD `DELOBJ` változója: a lemezbe bekerült objektumokat itt mindig törli. A HVONAL (BOUNDARY), amely egy pont körüli területből is készíthet lemezt, valamint a lemez sraffozás határvonalából. A lemez szerkesztése a fogóival: megjelennek, de a húzásuk semmit sem változtat. Az élei vágó- vagy határélként a <Command id="TRIM" /> és az <Command id="EXTEND" /> Gyors módjában, valamint az ellipszis- vagy spline-élű lemez sraffozása a <Command id="HATCH" /> paranccsal. A lemezek és felületek kombinálása, mert felületek a MellowCAD-ben nincsenek, és a Tulajdonságok paletta Anyag sora.

## Questions

### Mi az AutoCAD LEMEZ parancs angolul, és hogyan kell használni?

REGION. A magyar AutoCAD-ben a rövidítése `LEM` (az angol `REG` itt nem működik), a `_REGION` pedig az AutoCAD bármely nyelvi változatában fut. Futtassa a parancsot, válassza ki a zárt alakzatokat vagy azokat a vonalakat, amelyek végpontjaikkal zárt alakzatot alkotnak, és nyomja meg az Enter billentyűt. A mintában a négy vonal és egy kör köré húzott ablak két lemezt készít, a parancssor pedig két kiemelt hurkot és két létrehozott lemezt számol.

### Miért nem hoz létre lemezt a LEMEZ parancs?

Az alakzat nem zárt végpontról végpontra. Az egymást metsző vagy egymásig nem érő vonalak semmit sem zárnak be: a LEMEZ a nyitott objektumokat csak a végpontjaiknál fűzi láncba, és egy hajszálnyi rés is elég ahhoz, hogy a láncot elvesse. Az önmagát metsző hurkot, például egy csokornyakkendő alakút, elutasítja, és az önmetszések között számolja. Kösse össze a végeket a <Command id="FILLET" /> paranccsal 0 sugárral, vagy vágja le a <Command id="TRIM" /> paranccsal, ami túlnyúlik, és próbálja újra.

### Hogyan lehet lyukas lemezt készíteni?

Készítsen lemezt a körvonalból és egyet a lyukból, majd futtassa a <Command id="SUBTRACT" /> parancsot: válassza ki a körvonalat, Enter, a lyukat, Enter. Az eredmény egyetlen lemez, amelyet a <Command id="EXTRUDE" /> átmenő lyukas szilárdtestté alakít.

### Hogyan lehet megtudni egy lemez területét?

Válassza ki, és olvassa le a Terület értékét a Tulajdonságok palettán, vagy futtassa a <Command id="AREA" /> parancsot, válassza az <Keyword command="AREA" id="Object" /> opciót, és jelölje ki a lemezt. A <Command id="MASSPROP" /> ehhez hozzáadja a kerületet, a súlypontot és a tehetetlenségi nyomatékokat.
