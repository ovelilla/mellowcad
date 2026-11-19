---
title: "AutoCAD KIHÚZ (EXTRUDE) parancs"
metaTitle: "Kihúzás az AutoCAD-ben: KIHÚZ (EXTRUDE)"
description: "2D profilból 3D szilárdtest az AutoCAD KIHÚZ (EXTRUDE, KH) parancsával, promptról promptra: magasság, Irány, szűkítési szög. Próbálja ki ingyen, online."
figure: "Egy zárt, L alakú vonallánc 20-szal szilárdtestté kihúzva, majd délkeletről nézve, Takartvonalas látványstílusban."
sourceHash: "53bfe3dd1e9c"
---

A KIHÚZ (EXTRUDE) parancs zárt 2D profilokból 3D szilárdtesteket készít: mindegyiket egyenesen kihúzza a síkjából a megadott magasságig. Jelölje ki a profilokat – köröket, ellipsziseket, zárt vonalláncokat vagy spline-okat, lemezeket –, nyomja meg az Enter billentyűt, majd írja be a magasságot, vagy mutassa meg egy ponttal; az utolsó magasság lesz a következő futtatás alapértelmezése. Minden profilból külön szilárdtest lesz, az aktuális fólián, maga a profil pedig törlődik, ahogy a DELOBJ alapértelmezése előírja. A teljes parancs egyetlen lépés, amely a Vissza paranccsal visszavonható.

A MellowCAD-ben a 3D egyelőre csak szilárdtesteket jelent, és csak részben érhető el: a nyitott profil, amelyből az AutoCAD felületet készít, a <Message id="sweepRefusedType" /> üzenetet kapja, és kikerül a kijelölésből.

## Options

### MOde

<Keyword id="SOlid" /> vagy <Keyword id="SUrface" /> módot kér. A <Keyword id="SOlid" /> az alapértelmezés, és csak ez létezik: felületobjektumok híján a <Keyword id="SUrface" /> módot a parancs elutasítja.

### Direction

Magasság helyett két pont adja meg az irányt és a hosszt: a profilok ennek a vonalnak a mentén húzódnak ki, ferdén, ha a vonal ferde. A profil síkjában fekvő irányra a válasz <Message id="directionParallel" />, és a parancs véget ér.

### Path

A prompt felsorolja, ahogy az AutoCAD-ben, de nincs megvalósítva: a kiválasztását a parancs elutasítja, és újra a magasságot kéri.

### Taper

−90 és 90 fok közötti szöget kér, majd ismét a magasságot: a pozitív szög felfelé szűkíti a szilárdtestet, a negatív bővíti. Az a kör, amely a magasság elérése előtt összezárul, pontban végződik, kúp lesz belőle; az a profil, amelyre a szűkítés nem alkalmazható, nem hoz létre semmit.

### Expression

A magasság kifejezésként: a `2*3` értéke 6. Egyelőre csak aritmetika.

## Missing

Az Útvonal, vagyis a pálya menti söprés. A Felület mód és a nyitott profilok, amelyekből az AutoCAD felületet készít: felületobjektumok még nincsenek. A szilárdtestek lapjai és az objektumokon belül kattintással talált területek, amelyeket a <Command id="PRESSPULL" /> parancs elfogad. Szűkítés ellipszisen, spline-on, vagy a következő szakasszal sarokban találkozó íven. A Kifejezés paraméterei és függvényei. Az ívelt oldalú kihúzott szilárdtest <Command id="EXPLODE" /> paranccsal történő szétvetése, amely az AutoCAD-ben felületeket és lemezeket ad. A fogói, valamint a magassága és a szűkítési szöge a Tulajdonságok palettán szerkesztve.

## Questions

### Mi az AutoCAD KIHÚZ parancs angolul?

EXTRUDE. A magyar AutoCAD-ben a rövidítése `KH`: írja be, majd nyomja meg az Enter billentyűt vagy a szóközt. A teljes név is működik, az AutoCAD bármely nyelvi változatában pedig az `_EXTRUDE` is; az angol `EXT` a magyar változatban nem működik.

### Hogyan lehet egy 2D rajzból 3D-t készíteni?

Rajzolja meg a körvonalat egyetlen zárt objektumként – zárt vonalláncként, körként vagy lemezként –, indítsa el a KIHÚZ parancsot, jelölje ki az objektumot, nyomja meg az Enter billentyűt, és írja be a magasságot. Felülről a szilárdtest a körvonalának látszik: fordítsa el a nézetet a ViewCube-bal, vagy a <Command id="-VIEW" /> paranccsal és a <Keyword command="VIEW" id="SEiso" /> opcióval, hogy 3D-ben lássa.

### Miért nem készít szilárdtestet a KIHÚZ parancs?

A profil nyitott, vagy önmagát metszi. A vonalból, az ívből vagy a nyitott vonalláncból az AutoCAD-ben felület lesz, a MellowCAD-ben pedig ilyen még nincs: a KIHÚZ a <Message id="sweepRefusedType" /> üzenetet adja, és eltávolítja őket a kijelölésből; az önmagát metsző profil a <Message id="sweepSelfIntersecting" /> üzenetet kapja, és szintén kikerül. Fűzze össze a darabokat az <Command id="JOIN" /> paranccsal, készítsen belőlük lemezt a <Command id="REGION" /> paranccsal, vagy kattintson beléjük a <Command id="PRESSPULL" /> paranccsal.

### Hogyan lehet egy lyukas alakzatot kihúzni?

Készítsen belőle egyetlen lemezt: a <Command id="REGION" /> paranccsal a körvonalból és a lyukból, majd a <Command id="SUBTRACT" /> paranccsal vonja ki a lyuk lemezét a körvonaléból. Húzza ki ezt a lemezt, és a lyuk végigfut a szilárdtesten. Vagy indítsa el a <Command id="PRESSPULL" /> parancsot, és kattintson a körvonal és a lyuk közé.

### Hogyan lehet útvonal mentén kihúzni?

Egyelőre sehogy: az <Keyword id="Path" /> opció megjelenik, de a parancs elutasítja, a SÖPÖR (SWEEP) parancs pedig nincs megvalósítva. Az <Keyword id="Direction" /> opció két pont közötti egyenes mentén húz ki.
