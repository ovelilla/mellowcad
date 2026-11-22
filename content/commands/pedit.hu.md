---
title: "Vonallánc szerkesztése az AutoCAD-ben: VLEDIT (PEDIT) parancs"
metaTitle: "AutoCAD VLEDIT (PEDIT): vonallánc szerkesztése"
description: "Az AutoCAD VLEDIT (PEDIT, rövidítése VE) parancsa: vonalakból vonallánc, Egyesít, Szélesség, Görbe és Spline, csúcspont szerkesztése, Több. Próbálja ki ingyen."
figure: "Három, végpontjaival egymáshoz csatlakozó vonal: a VLEDIT az elsőt vonallánccá alakítja, hozzáfűzi a másik kettőt, és 2-es szélességet ad neki."
sourceHash: "6c9660c15d8a"
---

A VLEDIT (PEDIT) parancs egy vonalláncot szerkeszt. Válasszon ki egyet a `Válasszon vonalláncot vagy [Több]:` promptnál, vagy jelölje ki a parancs előtt; a vonalláncra duplán kattintva is a VLEDIT fut le rajta. Ha helyette vonalat, ívet vagy spline-t választ, <Message id="objectNotPolyline" /> üzenetet ír ki, és megkérdezi, hogy vonallánccá alakítsa-e, alapértelmezés szerint Igen: az új vonallánc a helyére lép, és átveszi a tulajdonságait. Ezután újra meg újra opciót kér, és mindegyiket azonnal alkalmazza, amíg az Enter be nem fejezi. A 3D vonallánc rövidebb listát kap, szélesség, görbeillesztés és vonaltípus-generálás nélkül, a spline opciója pedig a <Keyword id="Spline curve" />. Az Esc megtartja az addig elvégzetteket; a teljes szerkesztés egyetlen lépés, amelyet a <Command id="U" /> visszavon.

## Options

### Multiple

Egyszerre több vonalláncot szerkeszt: válassza ki őket, adja meg, hogy a köztük lévő vonalakat, íveket és spline-okat átalakítsa-e, majd minden opció mindegyikre érvényes. Az Egyesít opciója keresési távolságot és <Keyword id="Jointype" /> értéket kér: a <Keyword id="Extend" /> úgy vágja le vagy hosszabbítja meg a végszakaszokat, hogy találkozzanak, a <Keyword id="Add" /> új szakasszal hidalja át a rést, a <Keyword id="Both" /> meghosszabbít, ahol tud, és hozzáad, ahol nem.

### Close

Bezárja a vonalláncot egy, az utolsó csúcspontjától az elsőig tartó szakasszal, amely ív, ha az utolsó szakasz ív. Zárt vonalláncnál az opció a <Keyword id="Open" />, amely ezt a szakaszt eltávolítja.

### Join

Hozzáfűzi azokat a vonalakat, íveket és nyitott vonalláncokat, amelyek végpontjukkal a vonallánc végeihez csatlakoznak, és kiírja, hány szakaszt fűzött hozzá. Zárt vonallánchoz nem lehet hozzáfűzni: <Message id="cannotJoinClosedPolyline" />.

### Width

Egyetlen szélesség minden szakaszra, beírva vagy két ponttal mérve; a 0 megszünteti a szélességet.

### Edit vertex

X jelet tesz az első csúcspontra, és megkérdezi, mi történjen ott: a <Keyword id="Next" /> és az <Keyword id="Previous" /> lépteti az X-et, a <Keyword id="Move" /> elmozdítja a csúcspontot, a <Keyword id="Insert" /> újat szúr be utána, a <Keyword id="Break" /> és az <Keyword id="Straighten" /> megjegyzi a csúcspontot, majd miután az X-et egy másikra léptette, a <Keyword id="Go" /> a kettő között megtöri a vonalláncot, vagy egyetlen egyenes szakasszá alakítja, ami közöttük van, a <Keyword id="Width" /> a következő szakasz kezdő- és végszélességét állítja be, az <Keyword id="Tangent" /> irányt ad a csúcspontnak egy későbbi görbeillesztéshez, a <Keyword id="eXit" /> pedig visszalép.

### Fit

Ívekből álló sima görbét rajzol minden csúcsponton át, a találkozásuknál érintő ívekkel, ahogy az AutoCAD görbeillesztése rakja le őket. A csúcspontok megmaradnak, és a szerkesztésük átformálja a görbét.

### Spline

B-spline görbét illeszt a vonalláncra; a görbét a csúcspontok keretezik, nem halad át rajtuk: másod- vagy harmadfokút a SPLINETYPE szerint, a SPLINESEGS szerinti finomsággal. A 3D vonalláncnál ez a <Keyword id="Spline curve" />. A SPLINE parancs Objektum opciója az ilyen vonalláncot valódi spline-ná alakítja.

### Decurve

Eltávolítja a görbeillesztést vagy a spline-görbét: a csúcspontok között újra egyenes szakaszok vannak.

### Ltype gen

A <Keyword id="ON" /> a vonaltípust egyetlen mintában fekteti végig az egész vonalláncon, így a rövid szakaszokból álló szaggatott vonallánc is szaggatottnak látszik; a <Keyword id="OFF" />, az alapérték, minden csúcspontnál újrakezdi a mintát.

### Reverse

Megfordítja a vonalláncot: a csúcspontjai fordított sorrendbe kerülnek, az ívek és a szélességek velük együtt.

### Undo

Visszavonja ennek a futásnak az utolsó opcióját, és tovább kérdez.

## Missing

PEDITACCEPT: a vonal, ív vagy spline kiválasztásakor átalakítás előtt mindig rákérdez. PLINECONVERTMODE: a spline egyenes szakaszokból álló vonalláncra alakul, sokkal több szakaszból, mint amennyit az AutoCAD készít, és soha nem ívekből. A görbeillesztett vonallánc a Tulajdonságok palettán egyszerű vonalláncként jelenik meg, az AutoCAD 2D vonallánc címe és Görbe/Simítás sora nélkül. Ha a Több opcióval csak 3D vonalláncokat választ ki, a 3D promptot kapja, míg az AutoCAD a 2D promptot kérdezi. A <Keyword id="Multiple" /> opció nem szerkeszti a poligonhálókat.

## Questions

### Mi az AutoCAD VLEDIT parancs angolul?

PEDIT. A magyar AutoCAD-ben a rövidítése `VE`: írja be, majd nyomja meg az Enter vagy a Szóköz billentyűt. Az angol `PE` a magyar változatban nem működik; a teljes `VLEDIT` név igen, a `_PEDIT` pedig az AutoCAD bármely nyelvi változatában. A vonalláncra duplán kattintva is elindul.

### Hogyan lehet vonalakat vonallánccá egyesíteni?

Futtassa a VLEDIT parancsot, válassza ki az egyik vonalat, nyomja meg az Enter billentyűt, hogy vonallánccá alakuljon, majd válassza az <Keyword id="Join" /> opciót, és jelölje ki a többit: amelyek végpontjukkal csatlakoznak, egyetlen vonallánccá válnak. Az <Command id="JOIN" /> parancs egy lépésben teszi ugyanezt.

### Miért nem működik a VLEDIT az objektumon?

A VLEDIT vonalláncokat szerkeszt, a vonalakat, íveket és spline-okat pedig felajánlja átalakításra; minden mást, szöveget, kört, blokkot elutasít, és újra kérdez. Zárolt fólián lévő objektumra <Message id="objectOnLockedLayer" /> a válasz. Az Egyesít csak olyan objektumokat fűz hozzá, amelyeknek a vége pontosan a vonallánc végére esik: résekhez használja a <Keyword id="Multiple" /> opciót egy keresési távolsággal.

### Hogyan lehet módosítani a vonallánc szélességét?

Válassza a <Keyword id="Width" /> opciót, és írja be a szélességet: minden szakasz ezt kapja. Egyetlen szakaszhoz használja a <Keyword id="Edit vertex" /> opciót, lépjen arra a csúcspontra, ahol a szakasz kezdődik, és válassza a <Keyword id="Width" /> opcióját.

### Hogyan lehet egy vonalláncot görbévé tenni?

A <Keyword id="Fit" /> íveket vezet át minden csúcsponton; a <Keyword id="Spline" /> simább görbét készít, amelyet a csúcspontjai kereteznek. A <Keyword id="Decurve" /> újra kiegyenesíti.
