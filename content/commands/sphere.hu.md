---
title: "AutoCAD GÖMB (SPHERE) parancs"
description: "Így rajzol 3D gömb szilárdtestet az AutoCAD GÖMB (SPHERE) parancsa: középpont és sugár, Átmérő, 3P, 2P és Éés, és miért látszik vonalakként. Próbálja ki ingyen."
figure: "25 sugarú gömb a középpontjából rajzolva, délkeletről nézve, Koncepcionális látványstílusban."
sourceHash: "a35a57352d16"
---

A GÖMB (SPHERE) parancs 3D gömb szilárdtestet rajzol: adja meg a középpontot, majd a sugarat. Az egérrel megadott sugarat a középponton átmenő síkon méri, az utolsó sugarat pedig alapértelmezésként ajánlja fel, amelyet az Enter elfogad; ezt az értéket a <Command id="CYLINDER" />, a <Command id="CONE" /> és a többi alaptest parancsa is használja. A gömb az aktuális fóliára kerül, és a visszavonás egy lépésben eltávolítja.

2D drótváz és Takartvonalas látványstílusban vonalakként jelenik meg: hosszúsági és szélességi körökként, annyival, amennyit az `ISOLINES` előír, és rajta a tárgyraszter csak a középpontjához köt. A <Command id="LIST" /> parancs megmutatja a helyzetét és a sugarát, a Tulajdonságok palettán pedig begépelhető a sugara vagy az átmérője. A fogói mozgatják, az egyenlítő negyedeinél lévők pedig a sugarát állítják. Az <Command id="UNION" />, a <Command id="SUBTRACT" /> és a MellowCAD többi 3D-s parancsa számára 3D szilárdtest; a MellowCAD 3D-s része csak szilárdtestekből áll, és egyelőre részleges.

## Options

### 3P

A középpontnál: három pontot kér, és a gömb középpontja az ezeken átmenő kör középpontja lesz, sugara a kör sugara.

### 2P

A középpontnál: egy átmérő két végpontját kéri, a tér bármely pontján.

### Ttr

A középpontnál: Érintő tárgyraszterrel jelöljön ki két vonalat, kört vagy ívet, és adjon meg egy sugarat: a gömb középpontja annak az adott sugarú körnek a középpontja lesz, amely mindkettőt érinti, az ő magasságukban.

### Diameter

A sugárnál: helyette az átmérőt kéri, és az utolsó sugár kétszeresét ajánlja fel.

## Missing

A gömb <Command id="EXPLODE" /> paranccsal történő szétvetése, amelyből az AutoCAD felületet készít: a MellowCAD-ben nincsenek felületek, ezért azt írja ki, hogy nem tudta szétvetni. Mozgatás, Forgatás, Lépték és Tükrözés aktív fogóról, valamint a saját 3D parancsaik (3DMOZGAT, 3DFORGAT, 3DLÉPTÉK). A körvonal, amelyet az AutoCAD `DISPSILH` változója rajzol. Azok a látványstílusok, amelyek a 2D drótváz, a Takartvonalas és a Koncepcionális mellett az <Command id="VSCURRENT" /> parancsból még hiányoznak.

## Questions

### Hogyan lehet gömböt rajzolni az AutoCAD-ben?

Indítsa el a GÖMB parancsot, adja meg a középpontot, majd a sugarat: a `0,0,0` és a `25` megrajzolja a munkamenet gömbjét. Ahhoz, hogy kereknek lássa, fordítsa el a nézetet a ViewCube egyik sarkával, vagy a <Command id="-VIEW" /> paranccsal és a <Keyword command="VIEW" id="SEiso" /> opcióval.

### Miért néz ki a gömb vonalakkal áthúzott körnek?

A 2D drótváz és a Takartvonalas stílus a gömböt a hosszúsági és szélességi köreivel rajzolja; felülnézetben ezek egy kört és rajta átmenő vonalakat adnak. Az <Command id="VSCURRENT" /> parancs <Keyword command="VSCURRENT" id="Conceptual" /> opciója árnyalja, a vonalak számát pedig az `ISOLINES` adja meg.

### Hogyan lehet félgömböt készíteni?

Rajzolja meg a gömböt, majd vágja el a középpontján át a <Command id="SLICE" /> paranccsal: három ponttal a síkon, vagy az <Keyword command="SLICE" id="XY" /> opcióval és a középponttal, majd adja meg a megtartandó oldalt.

### Hogyan lehet gömböt rajzolni az átmérőjével?

A sugárnál válassza az <Keyword id="Diameter" /> opciót, és gépelje be az átmérőt. A <Keyword id="2P" /> opcióval egy átmérő két végpontja is elhelyezi.
