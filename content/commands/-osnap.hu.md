---
title: "Tárgyraszter az AutoCAD-ben: -TRASZTER (-OSNAP) parancs"
metaTitle: "Tárgyraszter az AutoCAD-ben: -TRASZTER és F3"
description: "Tárgyraszter az AutoCAD-ben: a -TRASZTER (-OSNAP) beállítja a futó módokat, az F3 kapcsolja őket, a VÉG, a FEL vagy a Shift + jobb kattintás egyet kényszerít."
figure: "A -TRASZTER futó módnak a Felezőpontot és a Középpontot állítja be; a VONAL ezután egy él felezőpontjából a kör középpontjába húz, a felső élen pedig a Felezőpont jelölője látszik."
sourceHash: "627cd26c12df"
---

A tárgyraszter egy kijelölt pontot pontosan egy objektum valamely pontjára tesz: a végére, a felezőpontjára, a középpontjára. Bekapcsolt tárgyraszternél a kurzor egy ilyen pont közelében megjeleníti a pont zöld jelölőjét, eszköztippben pedig a nevét; a kattintás ekkor erre a pontra kerül, nem oda, ahol a kurzor áll. A futó tárgyraszterek azok a módok, amelyek minden pontot kérő promptnál működnek: kezdetben a Végpont, a Középpont, a Metszéspont és a Meghosszabbítás, ahogy az AutoCAD-ben. Az F3 be- és kikapcsolja a tárgyrasztert, és kiírja: `<Traszter be>` vagy `<Traszter ki>`; ugyanezt teszi az állapotsor Tárgyraszter gombja, amelynek menüjében minden módhoz jelölőnégyzet tartozik. Ha a kurzor alatt több raszterpont is van, a legközelebbi nyer, a Tab billentyű pedig végiglépked a többin. Az Orto mód, a poláris követés és a Raszter mód soha nem mozdít el egy raszterezett pontot.

A -TRASZTER (-OSNAP) parancs a parancssorban állítja be a futó tárgyrasztereket. Kiírja az éppen futó módokat, majd a módok listáját kéri: mindegyiket a neve nagybetűivel, vesszővel elválasztva, például `VÉG,FEL,KÖZ`, vagy `_END,_MID` alakban, ami az AutoCAD bármely nyelvén működik. A lista lecseréli a futó készletet, és bekapcsolja a tárgyrasztert; a <Keyword id="NONe" />, a <Keyword id="OFF" /> vagy egy magában álló Enter kiüríti. Ismeretlen módra a válasz <Message id="invalidOsnapModes" />, és a kérdés megismétlődik. Aposztróffal beírva, `'-TRASZTER` alakban, egy másik parancson belül is működik. A futó tárgyraszterek az oldal újratöltéséig maradnak érvényben, utána ismét az AutoCAD négy módja lép életbe: ahogy az AutoCAD-ben, a rajz nem tárolja őket.

Egyetlen pontra felül is bírálhatók: pontot kérő promptnál írja be egy mód nagybetűit, `FEL` vagy `_MID`, vagy tartsa lenyomva a Shift billentyűt, kattintson a jobb gombbal, és válassza ki a módot a menüből. Ekkor csak ez az egy mód keres, bármi fut is, és csak erre az egy pontra; ha nem talál semmit, a pontot elutasítja, és újra kérdez. Nagybetűivel beírva a <Keyword id="NONe" /> egyetlen pontra kikapcsolja a tárgyrasztert. Ugyanez a menü kínálja a <Command id="FROM" /> parancsot is: egy bázispont, majd attól egy eltolás, így a `@10,0` a bázisponttól 10 egységgel jobbra van.

## Options

### ENDpoint

Egy vonal, ív, vonalláncszakasz, elliptikus ív vagy spline legközelebbi vége: egy téglalap sarkai, egy sokszög csúcsai. A jelölője négyzet.

### MIDpoint

Egy vonal, ív, vonalláncszakasz, elliptikus ív vagy spline hosszának fele. Háromszög.

### CENter

Egy kör, ív vagy vonalláncív középpontja. Magát a görbét érintse a kurzorral: a középpontban nincs mit megfogni. Kör.

### NODe

Pontobjektum, amilyet a <Command id="POINT" />, a <Command id="DIVIDE" /> és a <Command id="MEASURE" /> parancs hoz létre, bármilyen alakot ad is neki a <Command id="PTYPE" /> parancs. Kezdetben nincs a futó tárgyraszterek között. Kör kereszttel.

### QUAdrant

Egy kör vagy ív 0°-os, 90°-os, 180°-os és 270°-os pontjai az FKR X és Y tengelye mentén, valamint egy ellipszis tengelyeinek végpontjai. Rombusz.

### INTersection

Ahol két objektum metszi egymást, vagy ahol egy poláris követési vonal metsz egy objektumot. Kereszt.

### EXTension

Egy vonal, ív vagy egyenes vonalláncszakasz végén túl: érintse a kurzorral a végpontot, majd távolodjon az objektum vonala mentén. A végponttól szaggatott vonal jelenik meg, és a beírt távolságot ezen méri. Pluszjel.

### INSertion

Az a pont, amelyhez egy szöveg, egy attribútumdefiníció vagy egy blokkreferencia illeszkedik.

### PERpendicular

Az utolsó pontból egy vonalra – a végpontjain túl is –, körre, ívre vagy vonalláncszakaszra bocsátott merőleges talppontja. A <Command id="LINE" /> parancs első pontjánál megvárja a következő pontot: a vonal merőlegesen indul ki az objektumból. Derékszög.

### TANgent

Egy kör vagy ív azon pontja, ahol az utolsó pontból húzott vonal érinti. A <Command id="LINE" /> parancs első pontjánál megvárja a következő pontot: a vonal érintőlegesen indul ki a görbéből. Kör vonallal.

### NEArest

Az objektum kurzorhoz legközelebbi pontja. Homokóra.

### APParent

Látszólagos metszéspont: ahol két objektum a nézetben metszi egymást, bár különböző magasságban vannak; ahol valóban találkoznak, ott ez a metszéspontjuk.

### PARallel

Tartsa a kurzort egy pillanatig egy vonal fölött, majd mozogjon az utolsó pontból a vonal irányában: a következő pontot a vonallal párhuzamos segédvonal tartja.

### NONe

Nincs futó tárgyraszter: a tárgyraszter nem talál semmit, amíg újra be nem állít egy módot.

### OFF

Ugyanaz, mint a <Keyword id="NONe" />: a futó készlet kiürül.

## Missing

A Rajzbeállítások párbeszédpanel, amelyet az AutoCAD-ben a TRASZTER és a TR nyit meg: itt ezek ismeretlen parancsok, a módokat az állapotsor menüje állítja be. A Geometriai középpont, módként és a menükben. A Pont mód a méret definíciós pontjain és a méretszöveg kezdőpontján: itt csak pontobjektumokat talál. A két pont közötti felezőpont, az ideiglenes követési pont és az egyetlen pontra lenyomva tartott billentyűk (Shift + A, Shift + Q…). A Metszéspont, a Merőleges és az Érintő ellipszisen, a Merőleges és az Érintő spline-on, a Meghosszabbítás egy vonalláncív végétől, illetve távolsággal és szöggel az eszköztippben. A Merőleges vagy az Érintő, amely a másik pontra vár, a <Command id="LINE" /> és a <Command id="CIRCLE" /> parancson kívül más parancs elején. A céldoboz és a jelölő beállításai, a CÉLDOBOZ és az AUTOSNAP.

## Questions

### Mi az AutoCAD TRASZTER (OSNAP) parancsa?

Az AutoCAD-ben a TRASZTER (`TR`; angolul OSNAP, `OS`) a Rajzbeállítások párbeszédpanel Tárgyraszter lapját nyitja meg, ahol a futó tárgyraszterek választhatók ki. A MellowCAD-nek nincs ilyen párbeszédpanelje: írja be a `-TRASZTER` vagy a `-TR` parancsot és a módok listáját, vagy jelölje be őket az állapotsor Tárgyraszter gombjának menüjében.

### Hogyan lehet bekapcsolni a tárgyrasztert az AutoCAD-ben?

Az F3 be- és kikapcsolja a tárgyrasztert, ahogy az AutoCAD-ben; ugyanezt teszi az állapotsor Tárgyraszter gombja. Pontot kérő promptnál a Shift + jobb kattintás megnyitja az egyetlen pontra szóló tárgyraszterek menüjét.

### Miért nem működik a tárgyraszter az AutoCAD-ben?

Lehet, hogy az F3 kikapcsolta: ezt az állapotsor gombja mutatja. Vagy a mód nincs a futók között: állítsa be a `-TRASZTER` paranccsal vagy a gomb menüjében. A kurzornak nagyjából 10 képpontnyira meg kell közelítenie a pontot, középpontnál pedig magán a körön vagy íven kell lennie. A tárgyraszter csak akkor működik, amikor egy parancs pontot kér.

### Hogyan lehet csak egyszer raszterezni egy pontra?

Pontot kérő promptnál írja be a mód nagybetűit, például `VÉG` vagy `ÉRI`, vagy válassza ki a Shift + jobb kattintásra megjelenő menüből. Csak arra az egy pontra érvényes, akár fut ez a mód, akár nem.

### Megmaradnak a tárgyraszter beállításai?

Az oldal újratöltéséig; utána ismét a Végpont, a Középpont, a Metszéspont és a Meghosszabbítás érvényes. Az AutoCAD sem tárolja őket a rajzban.
