---
title: "Visszavonás az AutoCAD-ben: VISSZA (UNDO) parancs"
metaTitle: "Visszavonás az AutoCAD-ben: VISSZA (UNDO)"
description: "Így működik az AutoCAD VISSZA (UNDO) parancsa: lépések vissza, Jel és Hátra, Kezdet és Vége, Vezérlés, és miben más, mint a T és a Ctrl+Z. Próbálja ki ingyen."
before: "Alaplap két furattal és egy rajta átmenő vonallal, négy paranccsal rajzolva: TÉGL, kétszer KÖR és VONAL."
figure: "VISSZA 2: az utolsó két parancs visszavonva, a vonal és a második furat, az alaplapon az első furat megmarad."
sourceHash: "b4fed2178b6a"
---

A VISSZA (UNDO) parancs parancsokat von vissza. Egy lépés egy teljes parancs: mindaz, amit egy VONAL parancs rajzolt, egyszerre tűnik el, akárhány szakasza volt, és ugyanígy az is, amit egy parancs beállított, például a VTLÉPTÉK. A VISSZA parancs kiírja az aktuális beállításait, majd a visszavonandó műveletek számát vagy egy opciót kér; az Enter egyet von vissza. A visszavont parancsok nevét egy sorba írja ki, `KÖR VONAL`, és amikor elfogynak, ezt: <Message id="everythingUndone" />; ezután ezt: <Message id="nothingToUndo" />. Az a parancs is lépés, amely semmit sem változtatott, például a KOORD vagy a LISTA, és az is, amit a ZOOM és a TOL a nézettel tett.

A <Command id="U" /> a rövid forma: egy lépés vissza, kérdés nélkül. A `Parancs:` promptnál a Ctrl+Z a T parancsot futtatja; egy parancson belül az adott parancs saját Vissza opciója, ahogy az AutoCAD makrója begépeli: a VONAL visszavonja az utolsó szakaszát, és folytatja. Az <Command id="REDO" /> parancs közvetlenül utána visszaállítja azt, amit az utolsó T vagy VISSZA parancs visszavont.

## Options

### Auto

<Keyword id="ON" /> vagy <Keyword id="OFF" /> választ kér, az aktuális beállítást ajánlva fel, amelyet aztán a beállítások sora mutat. Az AutoCAD-ben egyetlen lépéssé fogja össze azokat a parancsokat, amelyeket egy menüelem futtat; itt egyetlen menü sem futtat egynél több parancsot, így itt semmit sem fog össze.

### Control

Azt kérdezi, mennyi visszavonást őrizzen meg, alapértelmezés szerint <Keyword id="All" />. A <Keyword id="None" /> eldobja az összes megőrzött lépést, és kikapcsolja a visszavonást: a T parancs ekkor ezt írja ki: <Message id="uDisabled" />, a VISSZA parancs pedig azonnal a Vezérlés opciót kéri. Az <Keyword id="One" /> csak az utolsó lépést őrzi meg, és a VISSZA parancs ezután 1-et vagy a Vezérlés opciót kéri. A Mind visszakapcsolja a teljes visszavonást. Az <Keyword id="Combine" /> azt adja meg, hogy az egymást követő ZOOM és TOL parancsok egy lépést alkotnak-e, a <Keyword id="Layer" /> pedig azt, hogy a Fóliatulajdonság-kezelőben egymás után végzett szerkesztések egy lépést alkotnak-e; mindkettő alapértéke az Igen. A beállítások a rajzéi, de nem mentődnek vele: az új vagy megnyitott rajz a Mind, az Egyesít Igen és a Fólia Igen beállítással indul.

### BEgin

Csoportot nyit: a <Keyword id="End" /> opcióig futtatott parancsok egy lépést alkotnak, amelyet a T parancs egészben von vissza, és velük együtt `CSOPORT` néven ír ki. Amíg egy csoport nyitva van, a T, a megadott szám és a Hátra a csoport elején megáll. Nyitott csoportnál a Kezdet előbb lezárja azt.

### End

Lezárja a Kezdet opcióval nyitott csoportot.

### Mark

Jelet hagy a lépések között. A Hátra, a T és a megadott szám ennél megáll, ezzel az üzenettel: <Message id="markEncountered" />.

### Back

Minden lépést visszavon az utolsó jelig, és vele együtt a jelet is. Ha nincs jel, megkérdezi, hogy mindent visszavonjon-e, alapértelmezés szerint Igen.

## Missing

Az Auto semmit sem fog össze, mert itt egyetlen menü sem futtat egynél több parancsot. Az Egyesít és a Fólia beállítás a böngésző munkamenetének végéig marad meg, míg az AutoCAD az egyik munkamenetből a másikba is megőrzi őket. A felső sáv Vissza és Előre gombja semmit sem ír az előzményekbe, míg az AutoCAD Gyorselérési eszköztára a sajátját beírja. A Ctrl+Shift+Z szó nélkül szintén újra végrehajt, pedig az AutoCAD-ben semmi sincs hozzárendelve.

## Questions

### Mi az AutoCAD VISSZA parancs angolul?

UNDO. Nincs rövidítése: a lépések számához vagy az opcióihoz írja be teljes nevén, `VISSZA`, vagy az AutoCAD bármely nyelvi változatában `_UNDO`. Egy lépés visszavonása a Ctrl+Z, vagy a `T` és az Enter; az angol változat `U` parancsa a magyarban T.

### Mi a különbség a T és a VISSZA parancs között?

A <Command id="U" /> parancs visszavonja az utolsó parancsot, és semmit sem kérdez. A VISSZA parancs megkérdezi, hányat vonjon vissza, és van Jel és Hátra opciója, hogy egy megjelölt pontig lépjen vissza, Kezdet és Vége opciója, hogy több parancsból egy lépés legyen, valamint Vezérlés opciója a visszavonás korlátozására vagy kikapcsolására.

### Hogyan lehet egyszerre több parancsot visszavonni?

Írja be a `VISSZA` nevet és a parancsok számát, például `5`. Vagy válassza a <Keyword id="Mark" /> opciót egy olyan sorozat előtt, amelyet esetleg el szeretne vetni, és a <Keyword id="Back" /> opcióval térjen vissza hozzá.

### Miért nem működik a VISSZA parancs?

A visszavonást a Vezérlés opció <Keyword id="None" /> beállításával kikapcsolták: a T parancs ezt jelzi, a VISSZA parancs pedig a Vezérlés opciót kéri. Válaszoljon a <Keyword id="All" /> opcióval a visszakapcsoláshoz. Az előtte tett lépések elvesztek.

### Hogyan lehet visszaállítani a visszavont műveletet?

Az <Command id="REDO" /> parancs közvetlenül a T vagy a VISSZA után az egészet visszaállítja. A Ctrl+Y lépésenként hajtja végre újra.
