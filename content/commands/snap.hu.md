---
title: "Raszter mód az AutoCAD-ben: RASZTER (SNAP) parancs"
metaTitle: "Raszter mód az AutoCAD-ben: RASZTER (SNAP)"
description: "Raszter az AutoCAD-ben: a RASZTER (SNAP) parancs és az F9 a megadott kiosztású rácshoz köti a kurzort; Arány külön X-re és Y-ra, poláris raszter. Próbálja ki!"
figure: "RASZTER 10 bekapcsolt hálóval, majd VONAL a pontok mellé kattintva: minden pont a rácsra kerül, és vele a kurzor is."
sourceHash: "a1089484f2f1"
---

A raszter mód pontrácshoz köti a kurzort: minden kattintás a rács legközelebbi pontjára kerül, így 10-es kiosztásnál a 13,7 helyre kattintva a pont 10,10 lesz. A rács az aktuális FKR-é, az origójából indul a tengelyei mentén. Az F9 billentyű be- és kikapcsolja a raszter módot, és kiírja: `<Raszter Be>` vagy `<Raszter Ki>`; ugyanezt teszi az állapotsoron lévő gombja is. Csak a kattintással megadott pontokat kerekíti: a begépelt koordinátát úgy veszi, ahogy beírták, és a tárgyraszter elsőbbséget élvez a ráccsal szemben. A háló (F7) saját rácsot rajzol, és akkor is mutatja, ha a raszter mód ki van kapcsolva.

A RASZTER (SNAP) parancs a kiosztást állítja be: írja be, vagy adjon meg két pontot ilyen távolságra egymástól, és a raszter mód ezzel a kiosztással X és Y irányban is bekapcsol. Az Enter változtatás nélkül kapcsolja be. A 0 vagy annál kisebb kiosztást ezzel az üzenettel utasítja vissza: <Message id="positiveNonzero" />. Aposztróffal begépelve (`'RASZTER`) egy másik parancson belül is működik. A raszter mód és a kiosztása a rajzzal együtt mentődik, és a <Command id="U" /> parancs visszavonja a RASZTER parancs beállítását.

Az állapotsor Raszter menüjében ehelyett a poláris raszter is választható: poláris követési útvonal mentén a kurzor POLARDIST értékű lépésekben halad, vagy amíg a POLARDIST 0, a raszter X kiosztásával.

## Options

### ON

Az aktuális kiosztással bekapcsolja a raszter módot, ahogy az Enter is.

### OFF

Kikapcsolja a raszter módot; a kiosztás megmarad.

### Aspect

Először a vízszintes, majd a függőleges kiosztást kéri, és bekapcsolja a raszter módot: a rács így nem négyzetes, hanem magasabb vagy szélesebb. A prompt alapértéke ezután az <Keyword id="Aspect" /> opció, így az Enter újra ezeket kérdezi.

## Missing

A promptnál a Stílus opció (izometrikus raszter) és a Típus opció (háló vagy poláris): a típust az állapotsor menüje választja. A Korábbi opció, a rejtett elforgatás (SNAPANG) és a SNAPBASE. A negatív POLARDIST érték, amelynek az AutoCAD poláris rasztere az abszolút értékét veszi: −10 esetén 10-es lépésekben halad.

## Questions

### Mi az AutoCAD RASZTER parancs angolul?

SNAP. Az F9 billentyű be- és kikapcsolja a raszter módot. A kiosztás beállításához a parancs rövidítése a magyar AutoCAD-ben `RA`: írja be, majd nyomja meg az Enter vagy a Szóköz billentyűt. Az angol `SN` a magyar változatban nem működik; a teljes `RASZTER` név igen, a `_SNAP` pedig az AutoCAD bármely nyelvi változatában.

### Mi a különbség a raszter és a tárgyraszter között?

A raszter mód a tér egy pontrácsára kerekíti a kurzort. A tárgyraszter (F3) az objektumok pontjaihoz köti: végpontokhoz, felezőpontokhoz, középpontokhoz. Együtt működnek, és ahol mindkettő talál pontot, ott a tárgyraszter nyer.

### Miért ugrál a kurzor az AutoCAD-ben?

Be van kapcsolva a raszter mód: nyomja meg az F9 billentyűt vagy az állapotsor raszter gombját a kikapcsolásához. Ha finomabb lépéseket szeretne, állítson be kisebb kiosztást a RASZTER paranccsal.

### Hogyan lehet eltérő X és Y raszterkiosztást beállítani?

Indítsa el a RASZTER parancsot, válassza az <Keyword id="Aspect" /> opciót, és adja meg a vízszintes, majd a függőleges kiosztást.

### Van izometrikus raszter?

Még nincs: a RASZTER parancs Stílus opciója, amely izometrikus rajzoláshoz fordítja el a rácsot, nem érhető el.
