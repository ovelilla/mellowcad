---
title: "Méretezés az AutoCAD-ben: MÉRETHOSSZ (DIMLINEAR) parancs"
metaTitle: "Méretezés az AutoCAD-ben: MÉRETHOSSZ parancs"
description: "Méretezés az AutoCAD MÉRETHOSSZ (DIMLINEAR, MHO) parancsával: két kezdőpont vagy egy objektum, majd a vízszintes vagy függőleges méretvonal. Próbálja ki ingyen."
figure: "Kétszer méretezett téglalap: a felső éle a két sarkával, a jobb éle Enterrel és az élre kattintva."
sourceHash: "e48a0a6f18c9"
---

A MÉRETHOSSZ (DIMLINEAR) parancs két pont távolságát méri az X vagy az Y tengely mentén, és méretként rajzolja meg: két segédvonal, egy méretvonal a nyílfejeivel és fölötte a mért érték. Meg kell adni az első és a második segédvonal kezdőpontját, majd a méretvonal helyét, és ahogy az AutoCAD-ben, az elhelyezés határozza meg az irányt: a két pont fölött vagy alatt vízszintesen mér, mellettük függőlegesen. Az első promptnál nyomja meg inkább az Enter billentyűt, és válasszon ki egy vonalat, ívet, vonalláncszakaszt vagy kört: a két végpontja, illetve a kör átmérője adja a kezdőpontokat. Ezután a parancssor kiírja a mért értéket, és a parancs véget ér.

A méret az aktuális méretstílusban készül, új rajzban ez az ISO-25: tizedesvessző és záró nullák nélkül, ahogy az AutoCAD metrikus rajzai írják. A csak begépelve elérhető <Command id="DIMHORIZONTAL" />, <Command id="DIMVERTICAL" /> és <Command id="DIMROTATED" /> parancs nem más, mint egyetlen irányhoz kötött MÉRETHOSSZ parancs.

## Options

### Text

A mért érték helyett írandó szöveget kéri, és alapértelmezésként a mért értéket kínálja fel: az Enter megtartja. A beírt szövegben a `<>` a mért értéket jelenti, így a `<> mm` a mértékegységével együtt írja ki.

### Angle

A szöveg szögét kéri: a szöveg ezután a méretvonal iránya helyett ebben a szögben jelenik meg. A 0 ismét a vonal mentén helyezi el.

### Horizontal

Az X tengely mentén mér, bárhová helyezi is a méretvonalat, amely vízszintes marad; a prompt ezután csak a <Keyword id="Text" /> és a <Keyword id="Angle" /> opciót kínálja.

### Vertical

Az Y tengely mentén mér, bárhová helyezi is a méretvonalat, amely függőleges marad.

### Rotated

A méretvonal szögét kéri, alapértelmezés szerint `0`, és a kezdőpontok távolságát ebben az irányban méri. Ferde élnél az él saját szöge adja a hosszát, ahogy a <Command id="DIMALIGNED" /> parancs.

## Missing

Bekezdéses szöveg: a méret szövege egyetlen sor, amelyet a parancssorban a <Keyword id="Text" /> opcióval lehet megadni, soha nem a szövegszerkesztőben. A <Keyword id="Angle" /> opcióval megadott szögnél az AutoCAD a méretvonalra középre igazítja a szöveget; itt a vonal fölött marad, ahogy szög nélkül is. A méret nem asszociatív: nem követi a mért objektumot.

## Questions

### Mi az AutoCAD MÉRETHOSSZ parancs angolul?

DIMLINEAR. A magyar AutoCAD-ben a rövidítése `MHO` vagy `MHOSZ`: írja be, majd nyomja meg az Enter billentyűt vagy a szóközt. A teljes név is működik, az AutoCAD bármely nyelvi változatában pedig a `_DIMLINEAR` is; az angol `DLI` és `DIMLIN` a magyar változatban nem működik.

### Melyek az AutoCAD méretezési parancsai?

<Command id="DIMLINEAR" /> a vízszintes és függőleges távolságokhoz, <Command id="DIMALIGNED" /> a ferde él menti távolsághoz, <Command id="DIMRADIUS" /> és <Command id="DIMDIAMETER" /> az ívekhez és körökhöz, <Command id="DIMANGULAR" /> a szögekhez, <Command id="DIMCONTINUE" /> és <Command id="DIMBASELINE" /> a láncokhoz, <Command id="DIMSPACE" /> a köztük lévő távolság kiegyenlítéséhez és <Command id="DIMSTYLE" /> a megjelenésükhöz. Az AutoCAD MÉRET parancsa, amely egyetlen promptból bármilyen méretet létrehoz, és a GYMÉRET, amely egyszerre sok objektumot méretez, a MellowCAD-ben még nem érhető el.

### Miért nem követi a méret az objektumot, amikor módosítom?

A MellowCAD méretei még nem asszociatívak, ahogy a <Message id="nonAssociativeDimension" /> üzenet is jelzi: a méret megtartja a kapott pontokat. Nyújtsa őket együtt: egyetlen <Command id="STRETCH" /> metsző ablakkal fogja be a mozgatott végpontot és a méret ott lévő kezdőpontját, és a mért érték újraszámolódik; vagy húzza a kezdőpont fogóját az új helyére.

### Hogyan lehet módosítani a méretszöveg és a nyilak méretét?

A méretstílusban, ahogy az AutoCAD-ben: a <Command id="DIMSTYLE" /> (`D`) parancs megnyitja a méretstílusokat, itt a Stílusok palettán, az AutoCAD-ben a Méretstílus-kezelőben. Itt állítható be az aktuális stílus szövegmagassága, nyílmérete, teljes léptéke és tizedesjegyei, és az adott stílusú összes méret ezeket követi.
