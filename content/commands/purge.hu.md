---
title: "AutoCAD TISZTÍT (PURGE) parancs: nem használt blokkok törlése"
metaTitle: "AutoCAD TISZTÍT (PURGE): nem használt blokkok"
description: "Az AutoCAD TISZTÍT (PURGE, rövidítése TT) parancsa törli a nem használt blokkokat és vonaltípusokat, név szerint vagy egyszerre, ellenőrzéssel vagy anélkül."
figure: "Két blokk, a falra helyezett TAG és a BOX, amelynek egyetlen referenciáját törölték: a TISZTÍT, minden név, ellenőrzés nélkül, csak a BOX blokkot törli."
sourceHash: "7a22ff19d409"
---

A TISZTÍT (PURGE) parancs eltávolítja azt, amit a rajz definiál, de nem használ; itt ezek a blokkok és a vonaltípusok. Az AutoCAD TISZTÍT parancsa a Tisztítás párbeszédpanelt nyitja meg; a MellowCAD-ben ilyen nincs, ezért a TISZTÍT a parancssorban azt kérdezi, amit a <Command id="-PURGE" />, ahogy az AutoCAD konzolja is. Kiírja a beágyazott elemek és az elárvult adatok beállítását, mindkettő ki van kapcsolva, és megkérdezi, milyen típusú, használaton kívüli objektumokat tisztítson, a <Keyword id="Blocks" /> és a <Keyword id="LTypes" /> lehetőséget kínálva; ott az Enter befejezi a parancsot.

Egy blokk addig van használatban, amíg egy referencia elhelyezi a rajzban, vagy egy használatban lévő blokk definíciója tartalmazza, bármilyen mélyen. Egy blokk utolsó referenciájának törlése után a definíciója a rajzban marad, ahol a <Command id="INSERT" /> újra elhelyezheti: a TISZTÍT az, ami törli. A megtartott blokkban lévő blokkot soha nem törli, az olyan blokkláncot pedig, amelynek tagjai csak egymást tartalmazzák, egyetlen futással eltávolítja. Ha nincs mit törölni, <Message id="noUnreferencedBlocks" /> üzenetet ír ki. Minden futás egyetlen lépés, amelyet a <Command id="U" /> visszavon.

## Options

### Blocks

Bekéri a tisztítandó neveket, alapértelmezés szerint `*` minden nem használt blokkhoz, vagy helyettesítő karakteres neveket vesszővel elválasztva. Ezután megkérdezi, hogy ellenőrizze-e az egyes neveket: az <Keyword id="Yes" />, az alapérték, minden blokkra rákérdez a törlés előtt, a <Keyword id="No" /> mindet törli, és kiírja mindegyik nevét és a számukat.

### LTypes

Bekéri a neveket, és hogy ellenőrizze-e őket egyenként, ahogy a <Keyword id="Blocks" />, majd törli a sehol nem használt vonaltípusokat. A Continuous, az aktuális vonaltípus és az, amelyet egy fólia vagy egy objektum használ, akár egy blokkon belül is, mindig megmarad; ha nincs mit törölni, <Message id="noUnreferencedLinetypes" /> üzenetet ír ki. A <Command id="LINETYPE" /> Betöltés gombja visszahozza.

## Missing

A Tisztítás párbeszédpanel és minden más típus: fóliák, szöveg- és méretstílusok, csoportok, anyagok, többszörösmutató-, táblázat- és látványstílusok, regisztrált alkalmazások, nulla hosszúságú geometria, üres szövegobjektumok, elárvult adatok és az összes egyszerre. A beágyazott elemek és az elárvult adatok beállítása nem módosítható.

## Questions

### Mi az AutoCAD TISZTÍT parancs angolul?

PURGE. A magyar AutoCAD-ben a rövidítése `TT`: írja be, majd nyomja meg az Enter vagy a Szóköz billentyűt. A `-TT` a <Command id="-PURGE" />, a parancssori változat, amelyet itt a TISZTÍT is futtat. Az angol `PU` a magyar változatban nem működik; a `_PURGE` az AutoCAD bármely nyelvi változatában igen.

### Hogyan lehet törölni a nem használt blokkokat az AutoCAD-ben?

Írja be: `TT`, válassza a <Keyword id="Blocks" /> opciót, nyomja meg az Enter billentyűt minden névhez, és válassza a <Keyword id="No" /> opciót, hogy mindet egyenkénti rákérdezés nélkül törölje.

### Miért nem lehet egy blokkot kitisztítani?

Mert használatban van: egy referencia elhelyezi a rajzban, vagy egy használatban lévő blokk tartalmazza, akár több szinten át beágyazva. Törölje a referenciáit, vagy bontsa szét az őt tartalmazó blokkokat, és a TISZTÍT már törölheti.

### Hogyan lehet kitisztítani a fóliákat?

Az AutoCAD-ben a TISZTÍT parancs Fóliák típusával. Itt ez még nincs meg, a TISZTÍT itt blokkokat és vonaltípusokat tisztít; egy üres fóliát helyette a Fóliatulajdonság-kezelőben törölhet.
