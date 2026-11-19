---
title: "AutoCAD MEGFORGAT (REVOLVE) parancs: forgástest"
metaTitle: "AutoCAD MEGFORGAT (REVOLVE): forgástest 3D-ben"
description: "Az AutoCAD MEGFORGAT (REVOLVE, rövidítése MFR) parancsa egy 2D profilt tengely körül 3D szilárdtestté forgat: tengely, Objektum, X, Y, Z. Próbálja ki ingyen."
figure: "Egy karimás profil egy teljes fordulattal megforgatva az Y tengely körül: orsó, délkeletről nézve, Takartvonalas látványstílusban."
sourceHash: "dc0576311912"
---

A MEGFORGAT (REVOLVE) parancs zárt 2D profilokat forgat meg egy tengely körül, és 3D szilárdtestet készít belőlük: a tengelyen fekvő élű téglalapból henger lesz, a tengely mellett fekvő körből gyűrű. Válassza ki a profilokat – köröket, ellipsziseket, zárt vonalláncokat vagy spline-okat, lemezeket –, és nyomja meg az Enter billentyűt; adja meg a tengelyt két ponttal vagy valamelyik opciójával, majd a szöget, ahol az Enter teljes fordulatot jelent. Minden profilból szilárdtest lesz az aktuális fólián, a profil pedig törlődik, ahogy a DELOBJ alapértéke előírja. A teljes parancs egyetlen lépésként vonható vissza.

A tengelynek a profil síkjában kell feküdnie, és a teljes profilnak az egyik oldalán, különben a parancs <Message id="revolveOneSide" /> üzenettel befejeződik, mielőtt a szöget kérné. A szög a jobbkéz-szabály szerint forgat a tengely körül, annak első pontjától a második felé; a negatív szög a másik irányba forgat. A MellowCAD 3D-je csak szilárdtestekből áll, és egyelőre részleges: a nyitott profilokat, amelyekből az AutoCAD felületet készít, elutasítja.

## Options

### MOde

A <Keyword id="SOlid" /> vagy a <Keyword id="SUrface" /> módot kéri, ahogy a <Command id="EXTRUDE" />: mivel felületobjektumok még nincsenek, csak a <Keyword id="SOlid" />, az alapérték, fogadható el.

### Object

A tengelyprompt alapértéke, így az Enter ezt választja: jelöljön ki egy vonalat, vonalláncot, ívet vagy spline-t, és a tengely egyenesen fut a két vége között, attól a végtől, amely a kijelölés helyéhez közelebb esik. A zárt objektumnak nincsenek végei: <Message id="revolveClosedAxis" />, és a parancs befejeződik.

### X

Az FKR X tengelye, az origóján át.

### Y

Az FKR Y tengelye, az origóján át: a tőle jobbra rajzolt profilból, ahogy a mintában, az Y tengely mentén fekvő alkatrész lesz.

### Z

Az FKR Z tengelye, az origóján át. Az FKR XY síkjában fekvő profil merőleges rá, ezért a MEGFORGAT <Message id="revolvePerpendicular" /> üzenettel befejeződik: a Z a függőlegesen álló profilokhoz való.

### STart

A szögpromptnál: a kezdőszög, amelynek alapértéke mindig 0. A profilt előbb oda forgatja, majd újra bekéri a szöget.

### Reverse

Megfordítja a tengelyt, így a szög a másik irányba fut, és újra bekéri a szöget.

### EXpression

A szög számtani kifejezésként, ahogy a <Command id="EXTRUDE" /> parancsban.

## Missing

A profil síkján kívül eső tengely, amely körül az AutoCAD felületté forgatja a profilt: itt a MEGFORGAT <Message id="revolveUnable" /> üzenettel befejeződik. Az ellipszisív vagy a szilárdtest éle mint Objektum tengely. A Felület mód és a nyitott profilok, mivel felületobjektumok még nincsenek. A kurzorral együtt forduló előnézet: amíg a szöget adja meg, a teljes fordulat látszik. A megforgatott szilárdtest szétvetése a <Command id="EXPLODE" /> paranccsal: az AutoCAD felületekre és lemezekre bontja. A fogói, és a szögének szerkesztése a Tulajdonságok palettán.

## Questions

### Mi az AutoCAD MEGFORGAT parancs angolul?

REVOLVE. A magyar AutoCAD-ben a rövidítése `MFR`: írja be, majd nyomja meg az Enter vagy a Szóköz billentyűt. Az angol `REV` a magyar változatban nem működik; a teljes `MEGFORGAT` név igen, a `_REVOLVE` pedig az AutoCAD bármely nyelvi változatában.

### Hogyan lehet egy profilt tengely körül megforgatni?

Rajzolja meg a metszet felét egyetlen zárt objektumként a tengelyvonal mellé, zárt vonalláncként vagy lemezként. Futtassa a MEGFORGAT parancsot, válassza ki a profilt, és nyomja meg az Enter billentyűt; nyomja meg újra az Enter billentyűt az <Keyword id="Object" /> opcióhoz, és jelölje ki a tengelyvonalat, vagy adja meg a két végpontját; végül az Enter teljes fordulatot ad.

### Miért nem működik a MEGFORGAT?

Leggyakrabban azért, mert a tengely keresztezi a profilt: a MEGFORGAT <Message id="revolveOneSide" /> üzenettel befejeződik. Tegye a tengelyt a profil szélére vagy azon túlra; a tengelyen fekvő él megengedett. A profil síkjára merőleges tengelyre <Message id="revolvePerpendicular" /> a válasz, a nyitott profilt pedig elutasítja, mert a MellowCAD-ben még nincsenek felületek.

### Hogyan lehet csak egy fordulat részével megforgatni?

A szögpromptnál írja be a szöget, például 90-et vagy 270-et. A <Keyword id="STart" /> elforgatott helyzetből indítja a forgatást, a <Keyword id="Reverse" /> pedig a másik irányba fordítja.
