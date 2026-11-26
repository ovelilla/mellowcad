---
title: "Bekezdéses szöveg az AutoCAD-ben: BSZÖVEG (MTEXT) parancs"
metaTitle: "Bekezdéses szöveg AutoCAD-ben: BSZÖVEG (MTEXT)"
description: "Az AutoCAD BSZÖVEG (MTEXT, rövidítése BS) parancsa: két sarokpont vagy szélesség, magasság, igazítás és sorköz, bekezdések egy objektumban. Próbálja ki online."
figure: "Egy megjegyzés keretben: előbb a magasság beállítása, aztán az átellenes sarokpont, és egyetlen bekezdés, amely a kettő közötti szélességre tördelődik."
sourceHash: "0177fafe871f"
---

A BSZÖVEG (MTEXT) parancs bekezdéses szöveget ír: egyetlen objektumot, amelynek bekezdései egy adott szélességre tördelődnek. Megad egy első sarokpontot és az átellenest, a köztük lévő keret pedig a szélességet adja meg; ezután a helyben megjelenő szerkesztőben gépel, ahol az Enter új bekezdést kezd, a Ctrl+Enter vagy egy kattintás a kereten kívül pedig megtartja a szöveget. Amíg a szerkesztő nyitva van, a szalagon a Szövegszerkesztő lap látható, ahol a választott stílus, magasság vagy igazítás az egész szövegre érvényes. Ha már beírt valamit, az Esc megkérdezi, hogy mentse-e, ahogy az AutoCAD Nem mentett változtatások párbeszédpanelje is. Ha minden sornak külön objektumnak kell lennie, használja a <Command id="TEXT" /> parancsot.

Az első sor kiírja az aktuális stílust és magasságot. Minden opciót az átellenes sarokpont promptjánál kérdez, és utána oda tér vissza, így egy futás alatt a keret lezárása előtt beállítható a magasság, az igazítás és a többi. A szavak ott törnek új sorba, ahol a sor túllépné a szélességet, a szélességnél hosszabb szó pedig túlnyúlik rajta. A magasság közös a <Command id="TEXT" /> paranccsal, és a rajz megőrzi; az igazítás, az elforgatás és a sorköz minden futáskor az alapértékéről indul. A <Command id="-MTEXT" /> ugyanezt kérdezi, majd a szöveget a parancssorban veszi át, soronként.

## Options

### Height

Beállítja a szövegmagasságot, beírva vagy az első sarokponttól egy pontig mért távolságként; nullánál nagyobbnak kell lennie. Megmarad a következő futásra és a <Command id="TEXT" /> parancshoz is.

### Justify

Beállítja, hogy a keret kilenc pontja közül melyikhez igazodjon a szöveg: alapértelmezés szerint a bal felsőhöz, vagy a felső, középső és alsó sor bal, középső és jobb pontjához, ahogy a prompt felsorolja őket. A szöveg a keret ehhez a pontjához igazodik, akármerre húzta is a keretet.

### Line spacing

Bekéri a típust, legalább (az alapérték), amely helyet hagy a magasabb betűket tartalmazó sornak, vagy pontosan, majd egy x-szel írt tényezőt, például `2x`, vagy egy távolságot. A szimpla sorköz 1x, a tényező 0,25x és 4x között lehet.

### Rotation

Elforgatja a keretet és a szövegét, beírt vagy az első sarokponttól mutatott szöggel.

### Style

Név szerint aktuálissá tesz egy szövegstílust; a <Keyword id="?" /> kilistázza a rajz stílusait, a rajzban nem létező nevet pedig elutasítja. A stílusok a <Command id="STYLE" /> parancs által megnyitott Szövegstílus párbeszédpanelen készülnek.

### Width

Az átellenes sarokpont helyett a szélességet kéri be, beírva vagy egy pontig mért távolságként, majd megnyitja a szerkesztőt. A 0 szélesség vagy az Enter tördeletlenül hagyja a sorokat, mindegyik olyan hosszú, ahogy beírta.

## Missing

A hasábokat, amelyeket az AutoCAD 2027 az átellenes sarokpont promptjánál felsorol, nem kínálja fel. A szövegen belüli formázást, például egy szó magasságát, betűtípusát vagy színét, a törtalakú szöveget vagy az aláhúzást nem rajzolja meg és nem alkalmazza, a szerkesztőben pedig nincs vonalzó, tabulátor, behúzás vagy lista, sem kurzor a rajzon. A Szövegszerkesztő szalaglapon megvan a stílusgaléria, a magasság, az Igazítás és a Szövegszerkesztő bezárása, de nincsenek meg az AutoCAD elemei: Feliratozási, Maszk, formázás, felsorolás és sorszámozás, sorköz és bekezdésigazítás, Beszúrás, Helyesírás-ellenőrzés, Eszközök és Beállítások, és a magassága az egész szöveget módosítja, míg az AutoCAD-é a következőként beírt szövegét állítja be. Nincs háttérmaszk és szövegkeret, nincs definiált magasság, feliratozási léptékezés és a sarkain Pont tárgyraszter, és a keretén belüli kattintás akkor is kijelöli, ha nem a betűire esik, míg az AutoCAD ilyenkor semmit sem jelöl ki.

## Questions

### Mi az AutoCAD BSZÖVEG parancs angolul?

MTEXT. A magyar AutoCAD-ben a rövidítése `BS` és `SZ`: írja be valamelyiket, majd nyomja meg az Enter vagy a Szóköz billentyűt; a `_MTEXT` az AutoCAD bármely nyelvi változatában működik. Az angol `T` a magyar változatban visszavon, mert a `T` az U parancs magyar neve; az `MT` pedig az MTÉR parancsot indítja. A <Command id="-MTEXT" />, `-BS`, ugyanezt kérdezi, és a szöveget a parancssorban veszi át.

### Hogyan lehet új sort kezdeni a bekezdéses szövegben?

Nyomja meg az Enter billentyűt: új bekezdést kezd. Egy bekezdésen belül a sorok maguktól törnek a keret szélességénél. A Ctrl+Enter vagy egy kattintás a kereten kívül bezárja a szerkesztőt, és megtartja a szöveget.

### Hogyan lehet módosítani a bekezdéses szöveg szélességét?

Válassza ki, és húzza el az oldalán lévő fogót: a szöveg a szélesség változásával újratördelődik, az igazítási pontja körül. A Tulajdonságok paletta Definiált szélesség sora számmal teszi ugyanezt, a sorköz sorai pedig a sortávolságot módosítják.

### Hogyan lehet a BSZÖVEG szöveget egysoros szöveggé alakítani?

Bontsa szét a <Command id="EXPLODE" /> paranccsal: minden sora egy-egy <Command id="TEXT" /> objektummá válik, balra igazítva ott, ahol a sor állt, ahogy az AutoCAD-ben is. Ha inkább átírná, kattintson rá duplán, és írja át a szerkesztőjében.
