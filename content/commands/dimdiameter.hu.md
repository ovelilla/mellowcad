---
title: "Átmérőméret az AutoCAD-ben: MÉRETÁTMÉRŐ (DIMDIAMETER) parancs"
metaTitle: "Átmérőméret az AutoCAD-ben: MÉRETÁTMÉRŐ"
description: "Kör vagy ív átmérőjének méretezése az AutoCAD MÉRETÁTMÉRŐ (DIMDIAMETER, MAT) parancsával: válassza ki, majd helyezze el belül vagy kívül. Próbálja ki ingyen."
figure: "Egy nagy kör belül, egy kicsi kívül méretezve: mindkét kör kiválasztva, majd a szöveg elhelyezve."
sourceHash: "76537f5f9854"
---

A MÉRETÁTMÉRŐ (DIMDIAMETER) parancs kör, ív vagy vonallánc ívszakaszának átmérőjét méretezi, a <Command id="DIMRADIUS" /> parancs promptjaival: válassza ki a görbét, és a parancssor azonnal kiírja a mért értéket; ezután helyezze el a méretet, és a parancs véget ér. A szövege az átmérőjel után álló átmérő. A körön belül elhelyezve egyetlen vonal fut a szövegtől a kerületen lévő nyílfejig; kívül elhelyezve a vonal a kört kerülettől kerületig keresztezi, a túlsó nyílfej pedig egy rövid toldalékból mutat vissza befelé, ahogy az ISO-25 rajzolja.

## Options

### Text

A mért érték helyett írandó szöveget kéri, és alapértelmezésként a mért értéket kínálja fel: az Enter megtartja. A beírt szövegben a `<>` a mért értéket jelenti a jelével együtt, így a `4x <>` a „4x” jelölést írja az átmérő elé.

### Angle

A szöveg szögét kéri: a szöveg ezután ebben a szögben jelenik meg, a közepe a vonalon, és a vonal nála véget ér. A 0 ismét a vonal mentén helyezi el.

## Missing

A Bszöveg opció: a méret szövege egyetlen sor, amelyet a parancssorban a <Keyword id="Text" /> opcióval lehet megadni, soha nem a szövegszerkesztőben. A jel Ø-ként jelenik meg, ahol az AutoCAD ∅-t ír: a rajz betűtípusában nincs ∅. Íven a nyílfejek a végpontjai között maradnak, ahol az AutoCAD ívsegédvonalat rajzol. Ahogy a <Command id="DIMRADIUS" /> parancsnál, blokkreferencián belüli görbe nem választható ki, a stílus középvonalai nem jelennek meg, és a görbén kívüli szövegre vonatkozó beállításai nem érhetők el. A méret nem asszociatív: nem követi a mért görbét.

## Questions

### Mi az AutoCAD MÉRETÁTMÉRŐ parancs angolul?

DIMDIAMETER. A magyar AutoCAD-ben a rövidítése `MAT` vagy `MATM`: írja be, majd nyomja meg az Enter vagy a Szóköz billentyűt. A teljes név is működik, az AutoCAD bármely nyelvi változatában pedig a `_DIMDIAMETER` is; az angol `DDI` és `DIMDIA` a magyar változatban nem működik.

### Hogyan lehet egy kis furatot méretezni?

Helyezze a szöveget a körön kívülre: a méretvonal ekkor keresztezi a furatot, mindkét oldalán egy-egy nyílfejjel, a szöveg pedig kívül marad. Belül a szövegnek el kell férnie a körben.

### Méretezhető-e ív a MÉRETÁTMÉRŐ paranccsal?

Igen: ív vagy vonallánc ívszakasza ugyanúgy, mint kör, és az ív körének átmérőjét adja meg. Bármi más esetén a <Message id="notCircleOrArc" /> üzenet jelenik meg, és a parancs újra kérdez.

### Hogyan lehet a furatok számát vagy megjegyzést írni egy átmérőméretbe?

Elhelyezés előtt válassza a <Keyword id="Text" /> opciót, és írja be: `4x <>`; a `<>` a mért érték a jelével. Elhelyezett méretnél a Tulajdonságok paletta Méretszöveg felülírás sora módosítja.
