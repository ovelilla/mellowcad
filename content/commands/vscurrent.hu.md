---
title: "Látványstílusok az AutoCAD-ben: LSAKTUÁLIS (VSCURRENT) parancs"
metaTitle: "Látványstílusok az AutoCAD-ben: LSAKTUÁLIS"
description: "Így állítja be az AutoCAD LSAKTUÁLIS (VSCURRENT, LSA) parancsa a látványstílust: 2D drótváz, Takartvonalas, Látványtervi, vissza a drótvázhoz. Próbálja ki!"
figure: "Átmenő furatos tömb délkeletről nézve: az LSAKTUÁLIS Látványtervi stílusa árnyalja a lapjait, és rájuk rajzolja az éleit."
sourceHash: "d06873f62261"
---

Az LSAKTUÁLIS (VSCURRENT) parancs a látványstílust állítja be: azt, hogyan rajzolja a nézet a 3D szilárdtesteket. Stílust kér, alapértelmezésként az aktuálisat kínálva fel, így az Enter megtartja. A <Keyword id="2dwireframe" /> minden élt megrajzol, a hátsókat is; a <Keyword id="Hidden" /> elrejti, amit lapok takarnak; a <Keyword id="Conceptual" /> kiszínezi és árnyalja a lapokat. A stílus a nézethez tartozik, a rajzzal együtt mentődik, és minden futtatás egyetlen visszavonási lépés. Másik parancson belül nem használható.

Ami nem szilárdtest – vonal, kör, lemez, szöveg –, az a stílustól függetlenül úgy jelenik meg, mint 2D drótvázban, a saját színeivel. Takartvonalas és Látványtervi stílusban a kattintás azt a szilárdtestet jelöli ki, amelynek a lapja a kurzor alatt a nézőhöz a legközelebb van, soha nem azt, amelyet egy lap eltakar, a tárgyraszter pedig továbbra is minden élt megtalál. A zárolt fólián lévő szilárdtest élei halványabban jelennek meg. A MellowCAD 3D-je csak szilárdtestekből áll, és egyelőre részleges.

## Options

### 2dwireframe

Minden szilárdtest minden éle, a hátsókat is beleértve, az ívelt lapjait jelző vonalakkal együtt; új rajzban ez az alapérték. Ha más stílusból tér vissza hozzá, az LSAKTUÁLIS parancs ezt írja ki: <Message id="regeneratingModel" />.

### Hidden

Minden szilárdtest élei és ívelt lapjainak körvonalai ott, ahol egyetlen szilárdtest lapja sem takarja őket, az objektum színével: a másik mögött lévő szilárdtestet az elülső eltakarja. Az ívelt lapot 2D drótvázban jelző vonalak nem jelennek meg.

### Conceptual

A néző felé forduló lapok az objektum színére festve, a fénytől elforduló oldalon hideg kékbe hajolva – a fény a nézőpontot követi –, rajtuk pedig a Takartvonalas stílus élei egy színnel, az objektum színétől függetlenül. Itt és a Takartvonalas stílusban a felülnézetből látott henger vagy kúp csak a körét mutatja, ahogy az AutoCAD-ben.

## Missing

Az AutoCAD többi stílusa – Drótváz, Valósághű, Árnyalt, Árnyalt, élekkel, Szürkeárnyalatos, Vázlatos és Röntgen –, valamint stílus megadása a nevével, vagy a stílusok kilistázása a `?` jellel: a prompt csak a három elkészült stílust sorolja fel, és minden más választ elutasít.

## Questions

### Hogyan lehet látványstílust váltani az AutoCAD-ben?

Indítsa el az LSAKTUÁLIS parancsot (vagy az `LSA` rövidítést), és válassza ki a stílust: a <Keyword id="Hidden" /> elrejti a hátsó éleket, a <Keyword id="Conceptual" /> árnyalja a lapokat. Csak a nézetet változtatja meg, az objektumokat nem. Gépelés nélkül a rajz bal felső sarkában lévő, az aktuális stílust mutató feliratban is kiválaszthatja. Az angol változat `VS` rövidítése a magyarban nem működik, a `_VSCURRENT` viszont bármely nyelvi változatban igen.

### Hogyan lehet visszatérni a 2D drótvázhoz?

Indítsa el az LSAKTUÁLIS parancsot, és válassza a <Keyword id="2dwireframe" /> opciót, a betűje `2`.

### Mi a különbség a Takartvonalas és a Látványtervi stílus között?

Mindkettő elrejti, amit lapok takarnak. A Takartvonalas csak éleket rajzol a háttérre, vonalas rajzként; a Látványtervi a lapokat is kifesti, a fény szerint árnyalva, rajtuk ugyanazokkal az élekkel.

### Miért látszanak még vonalak a szilárdtesten át?

Ezek nem a szilárdtest részei. A vonalak, körök és lemezek minden stílusban úgy jelennek meg, mint 2D drótvázban, így a téglatest mögötti vonal is látszik. A <Keyword id="2dwireframe" /> stílusban a szilárdtest saját hátsó élei is látszanak: válassza a <Keyword id="Hidden" /> opciót.
