---
title: "Téglalap az AutoCAD-ben: TÉGL (RECTANG) parancs"
metaTitle: "Téglalap az AutoCAD-ben: TÉGL (RECTANG) parancs"
description: "Téglalap az AutoCAD TÉGL vagy TÉGLALAP (RECTANG) parancsával: két sarokpont, méretek, terület és forgatás, lekerekített vagy letört sarkok. Próbálja ki ingyen."
figure: "Két téglalap két sarokpontból, a második sarokpont az elsőhöz képest relatívan beírva: az egyik 8-as lekerekítéssel, a következő 8-as letöréssel."
sourceHash: "a5d4e90c06aa"
---

A TÉGL (RECTANG) parancs két átellenes sarokpontból rajzol téglalapot, amelyeket megmutat vagy beír: a `0,0`, majd a dinamikus bevitelnél az elsőhöz képest relatív `100,50` egy 100 × 50-es téglalapot ad. Ez egyetlen, négy csúcspontú zárt vonallánc, az aktuális fólián. Az első prompt opciói azt állítják be, hogyan rajzolódnak a következő téglalapok, és mindegyik a munkamenet végéig megtartja az értékét: a következő TÉGL parancs az első sorában kiírja az érvényben lévőket. A szélesség opciója minden oldalnak vonalláncszélességet ad. Amíg a másik sarokpontot helyezi el, a téglalap a kurzort követi; bekapcsolt dinamikus bevitelnél beírhatja a hosszát, majd a Tab billentyű után a szélességét.

## Options

### Chamfer

Bekér egy első és egy második letörési távolságot, és ezekkel levágja mindegyik sarkot: nyolc csúcspont lesz. A 0 távolság kikapcsolja. A lekerekítés helyébe lép.

### Elevation

Bekéri a magasságot, amelyen a téglalap rajzolódik, vagyis a Z koordinátáját.

### Fillet

Bekér egy sugarat, és azzal lekerekíti mindegyik sarkot. A 0 sugár kikapcsolja. A letörés helyébe lép.

### Thickness

Bekér egy vastagságot: a téglalap 3D nézetben ilyen magasan áll, ahogy egy fal.

### Area

A másik sarokpontnál: bekéri a területet, aztán hogy a <Keyword id="Length" /> vagy a <Keyword id="Width" /> értéket adja-e meg, majd azt az oldalt. A másik oldalt kiszámítja, a sarkokat is beleszámítva, és a téglalap azonnal elkészül.

### Dimensions

A másik sarokpontnál: bekéri a hosszt és a szélességet, aztán egy pontot, amely megadja, hogy az első sarokponttól melyik irányban fekszik a téglalap.

### Rotation

A másik sarokpontnál: bekéri a téglalap elforgatási szögét, beírva vagy az első sarokponttól mutatott pontként, vagy két ponttal a <Keyword id="Pick" /> opcióval. A szöget a munkamenet végéig megőrzi.

## Missing

A <Keyword id="Area" /> opcióban megadott 0 hosszúság vagy szélesség, amely itt semmit sem rajzol, az AutoCAD-ben pedig hibás vonalláncot rajzol. A Forgatás promptjánál elutasított válasz után a MellowCAD újra teljes egészében kiírja a promptot, ahol az AutoCAD már semmit sem ír.

## Questions

### Mi az AutoCAD TÉGL parancs angolul?

RECTANG. A magyar AutoCAD-ben a rövidítése `TE`, és a `TÉGLALAP` is működik: írja be valamelyiket, majd nyomja meg az Enter vagy a Szóköz billentyűt. Az angol `REC` és `RECTANGLE` a magyar változatban nem működik; a teljes `TÉGL` név igen, a `_RECTANG` pedig az AutoCAD bármely nyelvi változatában.

### Hogyan lehet pontos méretű téglalapot rajzolni?

Adja meg az első sarokpontot, majd írja be a másikat ahhoz képest relatívan: bekapcsolt dinamikus bevitelnél, ahogy a program indul, `100,50`, nélküle `@100,50`, és a téglalap 100 hosszú és 50 széles lesz. Vagy válassza a <Keyword id="Dimensions" /> opciót, és írja be a két oldalt.

### Hogyan lehet lekerekített sarkú téglalapot rajzolni?

Az első promptnál válassza a <Keyword id="Fillet" /> opciót, írja be a sugarat, majd adja meg a két sarokpontot.

### Miért lekerekített vagy letört sarkú a téglalapom?

A TÉGL parancs a munkamenet végéig megőrzi a lekerekítést és a letörést, így az utána rajzolt téglalapra is érvényes: az első sora ezt ki is írja. Válassza a <Keyword id="Fillet" /> opciót, és írja be a `0` értéket, hogy újra egyszerű sarkokat rajzoljon.

### Vonallánc-e a téglalap az AutoCAD-ben?

Igen: egyetlen zárt vonallánc. A <Command id="EXPLODE" /> négy vonalra bontja, a <Command id="OFFSET" /> pedig egészben rajzol vele párhuzamost.
