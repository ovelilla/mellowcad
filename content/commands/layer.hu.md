---
title: "Fóliák az AutoCAD-ben: FÓLIA (LAYER) parancs"
description: "Fóliák az AutoCAD-ben: a FÓLIA (LAYER, FO) parancs és a Fóliatulajdonság-kezelő oszlopai, új fólia, törlés, aktuálissá tétel, kikapcsolás és zárolás."
figure: "Három fólia, mindegyik aktuálissá téve a rárajzolás előtt: a falak fehérrel, egy ajtó sárgával, egy tengely pirossal, Center vonaltípussal."
sourceHash: "85620b673df6"
---

A FÓLIA (LAYER) parancs megnyitja a Fóliatulajdonság-kezelőt, ahol a rajz fóliái létrehozhatók, elnevezhetők és beállíthatók. Ahogy az AutoCAD-ben, ez paletta, nem párbeszédpanel: rajzolás közben nyitva marad, itt a palettapanel egyik lapjaként, amíg a <Command id="LAYERCLOSE" /> parancs be nem zárja, és ha egy másik parancson belül aposztróffal beírják, megnyílik anélkül, hogy azt a parancsot befejezné. Minden objektum valamelyik fólián van, és a színe, vonaltípusa és vonalvastagsága, ha FÓLIA szerinti, a fóliáé. Az új objektumok az aktuális fóliára kerülnek.

Minden fólia egy sor, az AutoCAD oszlopsorrendjében: Állapot, az aktuális fólián pipával, majd Név, Be, Zárolás, Szín, Vonaltípus és Vonalvastagság, végül hogy hány objektumot tartalmaz; a sorok név szerint rendezettek. Az Új fólia gomb a kijelölt fólia színével, vonaltípusával és vonalvastagságával ad hozzá egy fóliát, a nevét azonnal szerkeszthetővé téve, és az aktuális fóliát nem változtatja meg. Az Aktuálissá tétel gomb vagy egy sorra való dupla kattintás aktuálissá tesz egy fóliát. A kijelölt fólia nevére kattintva vagy az F2 billentyűvel átnevezhető, és a már használt vagy az AutoCAD által tiltott karaktereket tartalmazó nevet a kezelő elutasítja, ahogy a 0 fólia átnevezését is. A Fólia törlése gomb eltávolít egy fóliát, de soha a 0 fóliát, az aktuális fóliát vagy az objektumokat tartalmazó fóliát: az AutoCAD Layer - Not Deleted párbeszédpanelje megmondja, melyiket. A kezelőben végzett minden módosítás egy lépés, amelyet a <Command id="U" /> parancs visszavon, az egymást követők együtt. A parancssorban a -FÓLIA ugyanezt teszi paletta nélkül, az AutoCAD promptjaival, szkriptekben is.

## Missing

A LAYDEL és a Fóliák panel többi eszköze: az objektum fóliájának aktuálissá tétele, a fóliaegyeztetés, az előző fóliaállapot visszaállítása és a többi, valamint a legördülő lista Be, Fagyasztás és Zárolás ikonja. A fóliák nem fagyaszthatók, és a kezelőben nincs Fagyasztás, Nyomtatás, Átlátszóság, Nyomtatási stílus, Fagyasztás új nézetablakokban és Leírás oszlop, az oszlopok nem rendezhetők át, nincsenek fóliaszűrők és szűrőfa, és nincs beállítási párbeszédpanel. A FÓLIA parancs futtatása önmagában nem visszavonási lépés. Az új fóliát a kezelő azonnal besorolja, ahol az AutoCAD az átnevezéséig a kijelölt alatt mutatja, és a 0 fólia vonalvastagsága 0,25 mm, nem Alapértelmezett. A LAYLOCKFADECTL nem írható be: a zárolt fólia objektumai mindig félig halványítva jelennek meg.

## Questions

### Mi az AutoCAD FÓLIA parancs angolul?

LAYER. A magyar AutoCAD-ben a rövidítése `FO`, és a `DPFMÓD` is az: írja be valamelyiket, majd nyomja meg az Enter billentyűt vagy a szóközt. Az angol `LA` és `DDLMODES` a magyar változatban nem működik; a `_LAYER` az AutoCAD bármely nyelvi változatában működik. Megnyitja a Fóliatulajdonság-kezelőt, a <Command id="LAYERCLOSE" /> parancs pedig bezárja.

### Hogyan lehet módosítani egy objektum fóliáját?

Jelölje ki az objektumot, majd válassza ki a fóliát a felső sáv Fóliák legördülő listájában: az objektum egyetlen visszavonási lépésben átkerül oda, az aktuális fólia pedig nem változik. A Tulajdonságok paletta Fólia sora ugyanezt teszi. Ha nincs semmi kijelölve, a legördülő lista a kiválasztott fóliát teszi aktuálissá.

### Hogyan lehet fóliát törölni az AutoCAD-ben?

Jelölje ki a Fóliatulajdonság-kezelőben, és nyomja meg a Fólia törlése gombot. A 0 fólia, az aktuális fólia és az objektumokat tartalmazó fólia – blokkdefinícióban is – nem törölhető: előbb törölje vagy helyezze át az objektumait, és tegyen aktuálissá egy másik fóliát.

### Mi a különbség egy fólia kikapcsolása és zárolása között?

A kikapcsolt fólia elrejti az objektumait: nem választhatók ki, tárgyraszterrel sem érhetők el, és kikerülnek a kijelölésből. A zárolt fólia objektumai láthatók maradnak, halványítva, tárgyraszterrel elérhetők és kijelölhetők, de egyetlen parancs sem módosítja őket: ha egy parancs mégis megkapja őket, beszámítja és kihagyja őket. Az aktuális fólia kikapcsolása előtt a program rákérdez, ahogy az AutoCAD-ben.

### Hogyan lehet új fóliát létrehozni?

Nyomja meg az Új fólia gombot a Fóliatulajdonság-kezelőben, és írja be a nevét: a fólia a kijelölt fólia színét, vonaltípusát és vonalvastagságát kapja, amelyeket aztán a sorában módosíthat. Tegye aktuálissá, hogy rajzolhasson rá.
