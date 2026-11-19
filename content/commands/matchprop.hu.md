---
title: "Tulajdonságok másolása az AutoCAD-ben: TULMÁSOL (MATCHPROP) parancs"
metaTitle: "Tulajdonságok másolása az AutoCAD-ben: TULMÁSOL"
description: "Tulajdonságok másolása az AutoCAD TULMÁSOL (MATCHPROP, rövidítése TUM) parancsával: fólia, szín, vonaltípus, vonalvastagság és stílusok. Próbálja ki ingyen."
figure: "Egy alaplap és a furata, egy függőleges tengely pirosan és Center vonaltípussal a saját fóliáján, valamint egy vízszintes vonal a 0 fólián, amelyet a TULMÁSOL ugyanilyen tengellyé alakít."
sourceHash: "603d5ab849b1"
---

A TULMÁSOL (MATCHPROP) parancs egy objektum tulajdonságait másolja át más objektumokra: ez az AutoCAD Tulajdonságmásolás ecsetje. Válassza ki a forrásobjektumot, vagy jelölje ki a parancs előtt; zárolt fólián lévő objektumot is elfogad. Ezután kiírja, mely tulajdonságokat másolja, `Aktuális aktív beállítások:` és a lista, majd bekéri a célobjektumokat: minden kijelölés vagy ablak azonnal átfesti őket, amíg az Enter be nem fejezi a parancsot. A zárolt fólián lévő célobjektum változatlan marad, <Message id="matchpropLockedDestination" /> üzenettel. A kurzoron az AutoCAD ecsete látszik, és a teljes futás egyetlen lépés, amelyet a <Command id="U" /> visszavon. Aposztróffal beírva, `'TULMÁSOL`, egy másik parancson belül fut.

Azt másolja, amit a Tulajdonságmásolás beállításai párbeszédpanel alapértelmezésként bejelöl: a fóliát, a színt és a vonalvastagságot; a vonaltípust, kivéve sraffozásra, bekezdéses szövegre és attribútumdefinícióra; a vastagságot; szövegek között a stílust, a magasságot és az elforgatást, egysoros szövegről egysoros szövegre az igazítást is; méretek között a méretstílust; sraffozások között a mintát, a léptéket és a szöget, az origót viszont nem.

## Missing

A Beállítások opció és a hozzá tartozó Tulajdonságmásolás beállításai párbeszédpanel: minden ismert tulajdonságot mindig másol, és az első prompt nem kínálja fel a Beállítások opciót. A vonaltípus-lépték, az átlátszóság és a nyomtatási stílus, amelyek itt nincsenek meg az objektumokon; a vonallánc szélességei, a szöveg szélességi tényezője és dőlésszöge, valamint a feliratozási tulajdonságok. Az AutoCAD előnézete, amely a kurzor alatt mutatja a változást.

## Questions

### Mi az AutoCAD TULMÁSOL parancs angolul?

MATCHPROP. A magyar AutoCAD-ben a rövidítése `TUM` és `FESTŐ`: írja be valamelyiket, majd nyomja meg az Enter vagy a Szóköz billentyűt. Az angol `MA` és `PAINTER` a magyar változatban nem működik; a teljes `TULMÁSOL` név igen, a `_MATCHPROP` pedig az AutoCAD bármely nyelvi változatában.

### Hogyan lehet egy vonal tulajdonságait átmásolni egy másikra?

Futtassa a TULMÁSOL parancsot, válassza ki azt a vonalat, amelynek tulajdonságait át akarja vinni, majd azokat a vonalakat, amelyek megkapják őket, és nyomja meg az Enter billentyűt. Ezek a forrás fóliájára kerülnek, annak színével, vonaltípusával és vonalvastagságával.

### Miért nem működik a tulajdonságok másolása?

A zárolt fólián lévő célobjektum nem változik: előbb oldja fel a fólia zárolását. Egy tulajdonság csak olyan objektumok között másolódik, amelyeknek van ilyen: méretstílus csak méretre, szövegstílus csak szövegre, minta csak sraffozásra. Vonaltípust pedig nem másol sraffozásra és bekezdéses szövegre, ahogy az AutoCAD sem.

### Hogyan lehet átvinni egy méret vagy egy sraffozás tulajdonságait?

Válasszon egy méretet forrásnak és más méreteket célnak: megkapják a méretstílusát, a fóliájával és a színével együtt. A sraffozás a mintáját, a léptékét és a szögét adja át más sraffozásoknak, és mindegyik megtartja a saját origóját.
