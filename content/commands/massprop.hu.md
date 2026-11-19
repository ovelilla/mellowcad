---
title: "AutoCAD FIZJELL (MASSPROP) parancs"
metaTitle: "AutoCAD FIZJELL (MASSPROP): térfogat, súlypont"
description: "Térfogat és súlypont az AutoCAD FIZJELL (MASSPROP) parancsával: szilárdtestek és lemezek tömegjellemzői, tehetetlenségi nyomatékok, .mpr fájl. Ingyen, online."
figure: "Egy 60 × 40 × 25-ös téglatest az origóban: a FIZJELL kiírja a térfogatát, a befoglaló téglalapját, a súlypontját és a nyomatékait, az Enter pedig elutasítja a fájlt."
sourceHash: "a0286a5d599e"
---

A FIZJELL (MASSPROP) parancs 3D szilárdtesteket és lemezeket mér. Válassza ki őket, és nyomja meg az Enter billentyűt: a jelentés a parancssorba íródik, az AutoCAD oszlopaiban, majd a parancs megkérdezi, hogy fájlba írja-e. Ha a kiválasztásban egyik sincs, <Message id="massPropNoneSelected" /> üzenetet ír ki, és befejeződik.

A szilárdtesteket együtt, egyetlen testként méri 1-es sűrűséggel, így a tömeg a térfogattal egyenlő: tömeg, térfogat, befoglaló téglalap, súlypont, tehetetlenségi nyomatékok, centrifugális nyomatékok és tehetetlenségi sugarak, mind az aktuális FKR-re vonatkoztatva, majd a súlypontra vett főnyomatékok az irányaikkal. Az egymást átfedő szilárdtesteket kétszer számolja. Az FKR XY síkjában fekvő lemezeknél: terület, kerület, befoglaló téglalap, súlypont, tehetetlenségi és centrifugális nyomaték, tehetetlenségi sugarak és főnyomatékok; a síkon kívüli lemez csak a területét, a kerületét, a befoglaló téglalapját és a súlypontját adja. Előbb a lemezek következnek, aztán a szilárdtestek; az első lemez síkján kívül eső lemezeket kihagyja, és a számukat is közli. A számok a rajz pontosságával jelennek meg, amelyet a <Command id="UNITS" /> paranccsal lehet beállítani, és pontosak: a szilárdtesteket lapról lapra integrálja. A FIZJELL parancs semmit sem változtat a rajzon; be kell gépelni, ahogy az AutoCAD-ben is, amelynek szalagján nincs hozzá gomb.

## Options

### Yes

A fájlra vonatkozó kérdésnél, amelynek alapértéke <Keyword id="No" />: a jelentést fájlba írja, ahogy az AutoCAD írja, sorról sorra. Az AutoCAD-ben egy párbeszédpanel kérdezi meg a helyét; a böngészőben a letöltés tölti be ezt a szerepet, és a fájl a rajz nevét kapja `.mpr` kiterjesztéssel.

## Missing

A számok utáni mértékegységek építészeti vagy mérnöki egységeknél (`sq in`, `cu in`, `lb`), amelyeket az AutoCAD kiír: itt egyetlen szám után sincs mértékegység. A fájlnév megválasztása és a kérdés egy meglévő fájl felülírása előtt. Az origótól távol az AutoCAD a nagy számokat exponenciális alakban írja, és jegyeket veszít, az utolsó jegye pedig a saját kerekítése miatt eltérhet: a MellowCAD számai pontosak. Két egyenlő főnyomatékú szilárdtestnél az az iránypár, amelyet az AutoCAD kerekítése választ.

## Questions

### Hogyan lehet megtudni egy 3D szilárdtest térfogatát az AutoCAD-ben?

Futtassa a FIZJELL parancsot, válassza ki a szilárdtestet, és nyomja meg az Enter billentyűt: a Térfogat a jelentés második sora. A mintában szereplő 60 × 40 × 25-ös téglatest 60 000-et ad. A fájlra vonatkozó kérdésnél nyomja meg az Enter billentyűt, és a parancs befejeződik.

### Hogyan lehet megtalálni egy alakzat súlypontját?

Alakítsa lemezzé a <Command id="REGION" /> paranccsal, vagy szilárdtestté, majd futtassa a FIZJELL parancsot, és válassza ki: a Súlypont sor megadja az X és Y koordinátáját, szilárdtestnél a Z-t is, az aktuális FKR-ben.

### Miért írja a FIZJELL, hogy nincs kiválasztva szilárdtest vagy lemez?

Amit kiválasztott, egyik sem: a vonalaknak, vonalláncoknak, köröknek és sraffozásoknak nincsenek tömegjellemzőik, és a szilárdtestet tartalmazó blokk sem szilárdtest. A zárt alakzatokat alakítsa lemezzé a <Command id="REGION" /> paranccsal, vagy szilárdtestté a <Command id="EXTRUDE" /> paranccsal.

### Miért egyenlő a tömeg a térfogattal?

A FIZJELL parancs 1-es sűrűséggel mér, ahogy az AutoCAD is: a szilárdtesteknek itt nincs anyaguk. A valódi tömeghez szorozza meg a térfogatot az anyag sűrűségével.
