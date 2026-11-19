---
title: "AutoCAD LISTA (LIST) parancs"
metaTitle: "AutoCAD LISTA (LIST) parancs: objektumadatok"
description: "Az AutoCAD LISTA (LIST, rövidítése LI) parancsa: minden kiválasztott objektum típusa, fóliája, színe, pontjai, hossza és területe. Próbálja ki online."
figure: "LISTA egy alaplap furatáról: a kör fóliája, középpontja, sugara, kerülete és területe."
sourceHash: "d0ebcf466ff5"
---

A LISTA (LIST) parancs a parancssorba jelentést ír minden kiválasztott objektumról, az AutoCAD 2027 oszlopaiban és szavaival. Mindegyik a típusával, a fóliájával és a terével kezdődik, majd a színével, a vonaltípusával, a vonalvastagságával és a vastagságával, ha ezek nem FÓLIA értékűek, illetve nem nullák, aztán azzal, ami az adott típusnak van: a vonal végpontjai, hossza, szöge és delta értékei; a kör középpontja, sugara, kerülete és területe; az ív szögei és hossza; a vonallánc csúcspontjai, szélességei, területe és hossza; a spline vezérlőpontjai és illesztési pontjai; a szöveg stílusa, magassága és igazítása; a méret típusa, pontjai és stílusa; a sraffozás mintája, léptéke és területe; a blokkreferencia neve, beillesztési pontja, léptékei és attribútumai; a kiosztás sorai és elemei; a lemez területe, kerülete és befoglaló téglalapja.

A pontok az aktuális FKR-ben, a hosszak a rajz pontosságával, a szögek az AUPREC szerinti pontossággal jelennek meg. A parancs előtt kiválasztott objektumokat azonnal, prompt nélkül listázza, üres kiválasztásnál pedig az Enter szó nélkül befejezi a parancsot. Minden sor egyszerre jelenik meg: az AutoCAD szövegablaka minden képernyőnyi szöveg után megáll az `A folytatáshoz nyomja meg az ENTER billentyűt:` promptnál, itt viszont az előzmények görgethetők. Azonosító (`Handle`) sor nincs: az itteni objektumoknak nincs azonosítójuk.

## Missing

A nyitott, ívekkel illesztett vonallánc területe: itt a húrjával lezárt görbe területe, az AutoCAD-é nagyobb. A spline hossza itt pontos, az AutoCAD-ben közelítő érték. A két vonalból készült <Command id="DIMANGULAR" /> méretet a három pontjával listázza, és egyetlen méret sem asszociatív a listában. Az AutoCAD szüneteltetése és szövegablaka. Ami az itteni objektumoknak nincs: BLOKK, ALAPÉRTELMEZETT vonalvastagság, saját vonaltípuslépték, átlátszóság és csoportok.

## Questions

### Mi az AutoCAD LISTA parancs angolul?

LIST. A magyar AutoCAD-ben a rövidítése `LI` és `LS`, akárcsak az angolban, és `ANYAGLISTA` is: írja be valamelyiket, majd nyomja meg az Enter vagy a Szóköz billentyűt. A teljes `LISTA` név is működik, a `_LIST` pedig az AutoCAD bármely nyelvi változatában.

### Mit mutat a LISTA parancs?

Mindazt, amit az AutoCAD LISTA parancsa az objektumról közöl: a típusát, a fóliáját, a terét és a nem FÓLIA értékű tulajdonságait, majd a geometriáját, minden pontot és hosszt számként. Ha több objektumot választ ki, mindegyikről külön jelentés készül.

### Hogyan lehet megtudni egy objektum hosszát vagy területét?

Listázza ki a LISTA paranccsal: a vonal hosszát, a kör kerületét és területét, a vonallánc hosszát vagy kerületét és területét kapja meg. Több terület összeadásához használja a <Command id="AREA" /> parancsot.

### Hogyan lehet megnézni egy vonal végpontjainak koordinátáit?

Listázza ki a vonalat a LISTA paranccsal: a kezdő- és a végpontját az aktuális FKR-ben írja ki. Egyetlen ponthoz használja a <Command id="ID" /> parancsot tárgyraszterrel.

### Mi a különbség a LISTA és a TULAJDONSÁGOK (PROPERTIES) parancs között?

A LISTA parancs jelentést ír, amelyet az előzményekből olvashat és másolhat ki. A <Command id="PROPERTIES" /> ugyanezeket az értékeket egy palettán mutatja, ahol módosíthatja is őket.
