---
title: "Vonallánc az AutoCAD-ben: VLÁNC (PLINE) parancs"
metaTitle: "Vonallánc az AutoCAD-ben: VLÁNC (PLINE) parancs"
description: "Vonallánc rajzolása az AutoCAD VLÁNC (PLINE, rövidítése VL) parancsával: vonalak és ívek egy objektumban, széLesség és Félszélesség, Hossz, Bezárás és Vissza."
figure: "Egy vonal, egy érintő ív és egy vonal vissza, majd egy 10 széles, 0-ra elvékonyodó hegy: egyetlen vonallánc."
sourceHash: "216b83656483"
---

A VLÁNC (PLINE) parancs vonalláncot rajzol: egyetlen objektumot, amely végpontjaikkal egymáshoz csatlakozó egyenes szakaszokból és ívekből áll, mindegyik a saját szélességével. A kezdőpont után kiírja az aktuális szélességet; ezután minden pont egy szakaszt ad hozzá, amíg az Enter vagy a <Keyword id="Close" /> be nem fejezi. Ahogy az AutoCAD-ben, vonalakkal kezd: az <Keyword id="Arc" /> ívekre vált, amelyek mindegyike érinti az előtte lévő szakaszt, a <Keyword id="Line" /> pedig visszavált. A kezdőpontnál az Enter az utoljára rajzolt vonal, ív vagy vonallánc végétől folytatja.

## Options

### Arc

Ív mód: minden végpont az utolsó szakaszt érintő ívet rajzol, első szakaszként pedig abban az irányban indul, amerre az utoljára rajzolt vonal, ív vagy vonallánc végződik. Az irányváltáshoz tartsa lenyomva a Ctrl billentyűt. Az alábbi opciók a következő ívet alakítják.

### Close

Akkor jelenik meg, ha már van szakasz: visszazárja a vonalláncot a kezdőpontjához, és befejezi a parancsot; ív módban érintő ívvel.

### Halfwidth

Mint a <Keyword id="Width" />, de minden szélességet a szakasz középvonalától a széléig mér.

### Length

A megadott hosszúságú vonal abban az irányban, amerre a vonallánc tart: az utolsó szakasz mentén, vagy az utolsó ívet érintve. A negatív hossz visszafelé halad.

### Undo

Visszavonja az utolsó szakaszt, és az azt megelőző szakasz módjában folytatja. Ha már nincs szakasz, ezt írja ki: <Message id="allSegmentsUndone" />

### Width

A kezdő-, majd a végszélesség, mindkettő beírva vagy az utolsó csúcsponttól mutatva: a 10-ről 0-ra csökkenő szélesség hegyben végződik, ahogy egy nyílhegy. A végszélesség a következő szakaszokra is átöröklődik, és PLINEWID értékként a következő VLÁNC parancsra is.

### Angle

Ív mód: az ív középponti szöge, majd a végpontja, a középpontja vagy a sugara.

### Center

Ív mód: az ív középpontja, majd a végpontja, a középponti szöge vagy a húrjának hossza.

### Direction

Ív mód: az az irány, amelyben az ív az utolsó csúcspontot elhagyja, az érintő helyett, majd a végpontja.

### Line

Ív mód: vissza az egyenes szakaszokhoz.

### Radius

Ív mód: az ív sugara, majd a végpontja vagy a középponti szöge. A negatív sugár a nagyobbik ívet rajzolja meg.

### Second pt

Ív mód: egy pont, amelyen az ív áthalad, majd a végpontja: három ponton átmenő ív.

## Missing

PLINEGEN: az új vonallánc szakaszonként rakja le a vonaltípusát, mint PLINEGEN 0 esetén (a VLEDIT VTípus gen opciója egy-egy vonalláncra bekapcsolja). A széles szakaszon a szaggatott vonaltípus folytonosnak rajzolódik. A széles szakasz előnézete nem halványabb árnyalattal jelenik meg, és az ívprompt egy sorba íródik, ahol az AutoCAD kettőbe tördeli.

## Questions

### Mi az AutoCAD VLÁNC parancs angolul?

PLINE. A magyar AutoCAD-ben a rövidítése `VL`: írja be, majd nyomja meg az Enter vagy a Szóköz billentyűt. Az angol `PL` a magyar változatban nem működik; a teljes `VLÁNC` név igen, a `_PLINE` pedig az AutoCAD bármely nyelvi változatában.

### Hogyan lehet íves vonalláncot rajzolni?

Válassza az <Keyword id="Arc" /> opciót: ettől kezdve minden pont egy, az előző szakaszt érintő ívet zár le, amíg a <Keyword id="Line" /> opciót nem választja. Egy már megrajzolt vonallánc csúcspontjain át húzott simításhoz használja a <Command id="PEDIT" /> parancsot és annak <Keyword command="PEDIT" id="Fit" /> vagy <Keyword command="PEDIT" id="Spline" /> opcióját.

### Miért rajzolódik vastagon a vonallánc?

Egy korábbi VLÁNC parancsban megadott szélesség megmarad, és a következő vonallánc azzal indul, ahogy a kezdőpont utáni sor ki is írja. Válassza a <Keyword id="Width" /> opciót, és adjon meg kétszer 0-t, hogy újra vékonyan rajzoljon. Kikapcsolt <Command id="FILL" /> mellett a széles vonalláncok körvonalként jelennek meg.

### Hogyan lehet vonalakat vonallánccá egyesíteni?

Futtassa az <Command id="JOIN" /> parancsot, és válasszon ki végpontjaikkal egymáshoz csatlakozó vonalakat, íveket és vonalláncokat: minden lánc egyetlen vonallánccá válik. Vagy futtassa a <Command id="PEDIT" /> parancsot egy vonalon, válaszoljon <Keyword command="PEDIT" id="Yes" /> értékkel, hogy vonallánccá alakítsa, és fűzze hozzá a többit az <Keyword command="PEDIT" id="Join" /> opcióval.

### Hogyan lehet megtudni egy vonallánc területét vagy hosszát?

Futtassa a <Command id="AREA" /> parancsot, nyomja meg az Enter billentyűt az <Keyword command="AREA" id="Object" /> opcióhoz, és válassza ki a vonalláncot: a zárt vonallánc a területét és a kerületét, a nyitott a hosszát adja meg.
