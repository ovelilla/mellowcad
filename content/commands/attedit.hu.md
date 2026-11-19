---
title: "Attribútumok szerkesztése az AutoCAD-ben: ATTEDIT parancs"
metaTitle: "Attribútumok szerkesztése AutoCAD-ben: ATTEDIT"
description: "Egy blokkreferencia attribútumértékeinek módosítása az AutoCAD-ben az ATTEDIT (ATE) paranccsal: promptonként egy mező, egyetlen visszavonási lépésben."
figure: "Három ajtójelölő, a NUM attribútumos blokk referenciái: az ATTEDIT kiválasztja az utolsót, amelyet 2-ként illesztettek be, és a mezője 3-ra módosítja."
sourceHash: "4a8ee28ecc53"
---

Az ATTEDIT parancs egyetlen blokkreferencia attribútumértékeit módosítja. Bekéri a referenciát, majd egy ablakot nyit meg, benne minden attribútumához egy mezővel, amelynek felirata az attribútum promptja, tartalma pedig az értéke, ahogy az AutoCAD Attribútumok szerkesztése párbeszédpanelje. Írja át az értékeket – a Tab billentyű mezőről mezőre lép –, és az Enter, az AutoCAD OK gombja, egyetlen lépésben alkalmazza őket, amelyet a <Command id="U" /> parancs visszavon; az Esc, a Mégse gombja, semmit sem változtat.

A kijelölés a kijelölődoboz alatti objektumot veszi. Bármit, ami nem blokkreferencia, elutasít, és azt a referenciát is, amelynek a blokkjában nincs attribútum, majd újra kérdez; az üres helyre mutató kijelölés után szó nélkül kérdez újra. A blokk definíciója nem változik, és a többi referenciája sem: mindegyik saját értékeket tárol. A <Command id="EATTEDIT" /> parancs ugyanezeket az értékeket egy címke szerint feliratozott ablakban szerkeszti, és egy attribútumos referenciára duplán kattintva ez indul el.

## Missing

A `-ATTEDIT`, a parancssori változat, amely egyenként vagy globálisan szerkeszti az attribútumokat, és a `-ATE` és az `ATTE` rövidítése. Az Attribútumok szerkesztése párbeszédpanel Előző és Következő gombja – azokhoz a blokkokhoz, amelyeknek több attribútumuk van, mint amennyi egy oldalra fér – és a Blokknév sora. Az ATTIPEDIT, amely egy attribútumot a helyén szerkeszt, és a hozzá tartozó Ctrl + dupla kattintás. A nem rögzített attribútum saját fogója a referencián, és a Tulajdonságok paletta attribútumsorai.

## Questions

### Mi az ATTEDIT parancs rövidítése az AutoCAD-ben?

`ATE`, majd Enter vagy Szóköz. A parancs neve a magyar AutoCAD-ben is ATTEDIT, az `_ATTEDIT` pedig az AutoCAD bármely nyelvén működik.

### Hogyan lehet blokkattribútumokat szerkeszteni az AutoCAD-ben?

Írja be az `ATE` rövidítést, és válassza ki a referenciát, vagy kattintson rá duplán, ami a <Command id="EATTEDIT" /> parancsot indítja. Módosítsa az értékeket az ablakban, és nyomja meg az Enter billentyűt. Ha magukat az attribútumokat – a címkéjüket, a promptjukat vagy a helyüket – szeretné módosítani, szerkessze a definíciókat, és definiálja újra a blokkot a <Command id="BLOCK" /> paranccsal.

### Miért írja az ATTEDIT, hogy a blokknak nincsenek szerkeszthető attribútumai?

Mert a kiválasztott referencia blokkjában nincs attribútum: az ATTEDIT olyan blokk referenciájának értékeit szerkeszti, amelynek vannak attribútumai. A még blokkba nem került definíciót a <Command id="TEXTEDIT" /> paranccsal lehet szerkeszteni, rá duplán kattintva.

### Mi a különbség az ATTEDIT és a BATTEDIT (EATTEDIT) parancs között?

Mindkettő egyetlen referencia értékeit szerkeszti. Az ATTEDIT ablaka minden mezőt az attribútum promptjával feliratoz, ahogy az AutoCAD Attribútumok szerkesztése párbeszédpanelje; a <Command id="EATTEDIT" /> parancsé, a Bővített attribútumszerkesztőé, a címkéjével. Az AutoCAD-ben a BATTEDIT ablakában lapok is vannak az egyes attribútumok szövegbeállításaihoz és tulajdonságaihoz.
