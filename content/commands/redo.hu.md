---
title: "AutoCAD ELŐRE (REDO) parancs: a visszavonás visszavonása"
metaTitle: "AutoCAD ELŐRE (REDO) parancs: Ctrl+Y, TELŐRE"
description: "Az AutoCAD ELŐRE (REDO) parancsa visszaállítja, amit az utolsó T vagy VISSZA visszavont, közvetlenül utána; a TELŐRE és a Ctrl+Y lépésenként. Ingyen, online."
figure: "Egy alaplapba rajzolt furat, a T paranccsal visszavonva és az ELŐRE paranccsal visszaállítva."
sourceHash: "be2e44b98ac0"
---

Az ELŐRE (REDO) parancs az utolsó <Command id="U" /> vagy <Command id="UNDO" /> hatását fordítja vissza: amit az visszavont, az újra megjelenik, mégpedig egészében, így egy öt parancsot visszavonó VISSZA után az ELŐRE mind az ötöt visszaállítja. Közben kiírja a parancsok nevét, majd <Message id="everythingRedone" /> üzenetet, ha már nincs mit visszaállítani. Semmit sem kérdez, és nincsenek opciói.

Csak közvetlenül a visszavonás után működik. Máskor <Message id="redoMustFollowUndo" /> az üzenete, és ha közben egy másik parancs futott, akár olyan is, amely semmit sem változtat, mint a LISTA vagy a ZOOM, akkor <Message id="nothingToRedo" />. Ha a visszavonás ki van kapcsolva a VISSZA parancs VEzérlés opciójának Semmi értékével, az ELŐRE jelzi, hogy le van tiltva.

A <Command id="MREDO" /> lépésenként állít vissza: bekéri a műveletek számát, vagy a <Keyword command="MREDO" id="All" /> vagy a <Keyword command="MREDO" id="Last" /> opciót, és ennyit állít vissza a visszavonások által visszavett lépésekből, akármilyen T, VISSZA és ELŐRE futott is azóta; az Utolsó az utolsó visszavonás egészét állítja vissza, egyszer (<Message id="alreadyRedone" />). A Ctrl+Y és a helyi menü Előre parancsa 1-gyel futtatja a TELŐRE parancsot, és megszakítja a futó parancsot.

## Missing

A Ctrl+Shift+Z is visszaállít, szó nélkül, bár az AutoCAD semmit sem rendel hozzá. A felső sáv Vissza és Előre gombja semmit sem ír az előzményekbe, míg az AutoCAD Gyorselérési eszköztára a sajátját kiírja.

## Questions

### Mi az AutoCAD ELŐRE parancs billentyűparancsa?

A Ctrl+Y, amely egy lépést állít vissza (TELŐRE 1). Magának az ELŐRE parancsnak nincs rövidítése: írja be, hogy `ELŐRE`, vagy az AutoCAD bármely nyelvi változatában `_REDO`.

### Miért nem működik az ELŐRE?

Az ELŐRE csak a közvetlenül előtte futó T vagy VISSZA hatását fordítja vissza. Bármely más parancs után nincs mit visszaállítani, még ha az semmit sem változtatott is: vonja vissza, majd rögtön állítsa vissza.

### Mi a különbség az ELŐRE és a TELŐRE (MREDO) parancs között?

Az ELŐRE az utolsó visszavonás egészét állítja vissza, és csak közvetlenül utána. A <Command id="MREDO" /> a visszavont lépések közül adott számút állít vissza, egyenként, vagy mindet, és egy ELŐRE után is működik.

### Hogyan lehet megismételni az utolsó parancsot az AutoCAD-ben?

Nyomja meg az Enter vagy a Szóköz billentyűt a Parancs promptnál: az utolsó parancs újra elindul. Az ELŐRE nem ismétel meg parancsot; egy visszavonást fordít vissza.
