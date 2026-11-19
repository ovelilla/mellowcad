---
title: "AutoCAD SPLINE parancs"
description: "Így működik az AutoCAD SPLINE (SPL) parancsa: görbe illesztési pontokon át vagy vezérlő csomópontokkal, csomópontok, fok, érintők, bezárás. Próbálja ki ingyen."
figure: "Öt ponton átmenő illesztett spline, alatta ugyanígy elhelyezett öt csomópontú VCS spline: az első átmegy rajtuk, a másodikat magukhoz húzzák."
sourceHash: "1056b5067125"
---

A SPLINE parancs sima görbét rajzol, kétféleképpen: a megadott pontokon át (<Keyword id="Fit" />, ez az alapérték), vagy az elhelyezett vezérlő csomópontok felé húzva (<Keyword id="CV" />). Indításkor kiírja a beállításait, `Módszer=Illesztés   Csomópontok=Húr`, majd az első pontot kéri; ott az Enter billentyűt nem fogadja el, ahogy az AutoCAD sem. Minden további pont hajlít a görbén, az előnézet követi a kurzort, az Enter pedig befejezi. A pontok megadhatók kattintással, tárgyraszterrel vagy begépelve, a begépelt hossz a kurzor irányában mérődik, és a pont megtartja a Z koordinátáját, így a spline a térben emelkedhet is. Az Esc eldobja a görbét; az egész spline egyetlen lépés, amelyet a <Command id="U" /> parancs visszavon. A szalag Spline illesztés és Spline VCS gombja úgy indítja a SPLINE parancsot, hogy a módszer már ki van választva.

## Options

### Method

<Keyword id="Fit" /> vagy <Keyword id="CV" />. Az illesztett spline minden megadott ponton átmegy; a VCS spline csak az első és az utolsó csomópontján megy át, a többi csak magához húzza, így simább lesz, és messzebb halad tőlük. A módszer, ahogy a csomópontok és a fok is, a munkamenet végéig megmarad.

### Knots

Azt adja meg, hogyan osztja el az illesztett spline a pontjait a görbe mentén: <Keyword id="Chord" /> (az alapérték, a pontok távolsága szerint), <Keyword id="Square root" /> (a távolság négyzetgyöke szerint) vagy <Keyword id="Uniform" /> (mind egyforma). Ugyanazokon a pontokon át mindegyik kissé más görbét ad.

### Degree

A VCS spline foka, 1-től (egyenes szakaszok a csomópontok között) 10-ig; a 3, az alapérték, harmadfokú görbe. Ha kevesebb a csomópont, mint amennyit a fok megkíván, a görbe a lehető legmagasabb fokot kapja.

### Object

A VLEDIT parancs Spline opciójával illesztett 2D vagy 3D vonalláncot ugyanilyen görbéjű VCS spline-ná alakítja, a vonalláncot pedig törli, egyetlen lépésben. Minden mást ezzel az üzenettel utasít el: <Message id="onlySplineFittedPolylines" />.

### start Tangency

Az első pont után jelenik meg: az az irány, amelyben a görbe elhagyja a pontot, kattintással vagy begépelve, ebből a pontból.

### end Tangency

Az az irány, amelyből a görbe az utolsó pontjába érkezik; ezután a spline elkészül.

### Undo

Visszavonja az utolsó pontot, egészen az elsőig.

### Close

A harmadik ponttól kezdve: a végét sima hurokban, sarok nélkül visszaköti a kezdetéhez, és befejezi a parancsot.

## Missing

Az illesztési tűrés: az illesztett spline mindig pontosan átmegy a pontjain, a Tűréshatár opció nem jelenik meg. Rajzolás közben a spline-hoz még nem lehet tárgyraszterrel kötni vagy követni, ahogy az AutoCAD-ben. Az Objektum opció mindig törli a vonalláncot (DELOBJ). Az elkészült spline-on nincs VPMEGJELENÍT és VPELREJT, és nincsenek fogómenük pont hozzáadására vagy eltávolítására; a Tulajdonságok paletta a pontjait szerkeszti, de a módszerét, fokát, csomópontjait, súlyait és bezártságát nem; a Gköz, a Mer és az Éri tárgyraszter nem köt hozzá. A SRAFFOZ parancs nem találja meg a spline-t határként, és a SIMÍT (BLEND) parancs még nem létezik.

## Questions

### Mi az AutoCAD SPLINE parancs magyarul?

A magyar AutoCAD-ben is SPLINE a neve, és a rövidítése is `SPL`, akárcsak az angolban: írja be valamelyiket, majd nyomja meg az Enter vagy a Szóköz billentyűt. A `_SPLINE` az AutoCAD bármely nyelvi változatában működik.

### Mi a különbség az Illesztés és a VCS között?

Az illesztett spline átmegy a kattintott pontokon, ezért akkor jó, ha a görbének érintenie kell őket. A VCS spline alakját a vezérlő csomópontjai adják, amelyeket csak megközelít, ezért szép, sima formához való. A választás az első promptnál a <Keyword id="Method" /> opcióval történik.

### Hogyan lehet a spline-t vonallánccá alakítani?

Indítsa el a <Command id="PEDIT" /> parancsot, és jelölje ki a spline-t: ezt írja ki: <Message id="objectNotPolyline" />, és felajánlja az átalakítást, majd 0 és 99 közötti pontosságot kér, alapértelmezés szerint 10-et. A vonallánc rövid egyenes szakaszokkal követi a spline-t, többel, mint amennyit az AutoCAD készít.

### Hogyan lehet a vonalláncot spline-ná alakítani?

Illessze a vonalláncot a <Command id="PEDIT" /> parancs Spline opciójával, majd indítsa el a SPLINE parancsot, és válassza az <Keyword id="Object" /> opciót: a vonalláncból ugyanilyen görbéjű spline lesz.

### Szétvethető-e a spline az AutoCAD-ben?

Nem: a <Command id="EXPLODE" /> parancs nem fogadja el a spline-t, ahogy az AutoCAD sem. Ha darabokra bontaná, előbb alakítsa vonallánccá a <Command id="PEDIT" /> paranccsal, majd azt vesse szét vonalakra.
