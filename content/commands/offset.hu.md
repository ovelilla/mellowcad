---
title: "AutoCAD PÁRH (OFFSET) parancs"
metaTitle: "AutoCAD PÁRH (OFFSET) parancs: opciók, rövidítés"
description: "Az AutoCAD PÁRH (OFFSET, rövidítése P) parancsa promptról promptra: távolság vagy Kijelölt pont, Töröl és Fólia, egyszerre egy objektum. Próbálja ki ingyen."
figure: "Egy téglalap 6-os távolságú párhuzamosa befelé és egy köré kifelé: mindkettőnél előbb az objektum, aztán az oldal kiválasztása."
sourceHash: "b495af1e1410"
---

A PÁRH (OFFSET) parancs egy objektummal párhuzamos másolatot rajzol, beírt távolságra vagy egy megadott ponton át: vonalból párhuzamos vonal lesz, körből vagy ívből koncentrikus kör vagy ív, vonalláncból a belsejében vagy kívül futó körvonal, ellipszisből vagy spline-ból egy azt követő spline. Ahogy az AutoCAD-ben, egyszerre egy objektummal dolgozik: a távolságot egyszer adja meg, majd kiválaszt egy objektumot és az oldalt, ahová a másolat kerül, ahányszor csak akarja. Az Enter befejezi a parancsot.

## Options

### Through

Távolság helyett minden másolat egy megadott vagy beírt ponton halad át. Ez az első prompt alapértéke, így ott az Enter ezt választja, amíg távolságot nem adott meg; attól kezdve az Enter az utolsó távolságot ismétli, az adott rajzban.

### Erase

Megkérdezi, hogy a párhuzamos másolat elkészülte után törölje-e a forrásobjektumot: <Keyword id="Yes" /> vagy <Keyword id="No" /> (az alapérték). <Keyword id="Yes" /> esetén a másolat a forrásobjektum helyébe lép. A választás a munkamenet végéig megmarad, és a következő PÁRH parancs az első sorában jelzi.

### Layer

Megkérdezi, hová kerüljenek a másolatok: az aktuális fóliára (<Keyword id="Current" />), vagy a forrásobjektum fóliájára (<Keyword id="Source" />, az alapérték). Ez is a munkamenet végéig megmarad.

### Exit

Befejezi a parancsot, ahogy az objektumpromptnál az Enter is.

### Multiple

Az oldalpromptnál: ugyanabból az objektumból újabb párhuzamosokat készít anélkül, hogy újra ki kellene választani, mindegyiket egy távolsággal az előző másolaton túl, amíg az Enter vagy a <Keyword id="Exit" /> le nem zárja.

### Undo

Visszavonja az utolsó másolatot, akármelyik objektumból készült, és újra objektumot kér. Ha már nincs visszavonható másolat, ezt jelzi.

## Missing

Az OFFSETGAPTYPE 1 és 2 értéke: a vonallánc párhuzamosának sarkai mindig úgy záródnak, mint 0 esetén, a szakaszok metszésükig meghosszabbítva. A spline vagy az ellipszis párhuzamosa az AutoCAD tűrésén belül van, de a csomópontjai oda esnek, ahová a MellowCAD teszi őket, nem oda, ahová az AutoCAD. Spline esetén a <Keyword id="Through" /> az elemleírásban X-et és Y-t mutat, nem a távolságot.

## Questions

### Mi az AutoCAD PÁRH parancs angolul?

OFFSET. A magyar AutoCAD-ben a rövidítése `P`: írja be, majd nyomja meg az Enter vagy a Szóköz billentyűt. Az angol `O` a magyar változatban nem működik; a teljes `PÁRH` név igen, a `_OFFSET` pedig az AutoCAD bármely nyelvi változatában.

### Miért nem lehet egy objektumról párhuzamost rajzolni?

A PÁRH parancs vonalakról, ívekről, körökről, 2D vonalláncokról, ellipszisekről és spline-okról rajzol párhuzamost. Szöveget, bekezdéses szöveget, blokkreferenciát, méretet és sraffozást <Message id="cannotOffsetObject" /> üzenettel elutasít, és akkor is, ha a távolság semmivé zsugorítaná a kört, az ívet vagy a vonalláncot. Zárolt fólián lévő objektumot nem lehet kiválasztani, a 3D vonalláncot pedig átugorja.

### Hogyan lehet ugyanabból a vonalból több párhuzamost készíteni?

Válassza ki a vonalat, majd az oldalpromptnál írja be a <Keyword id="Multiple" /> opció betűjét: az adott oldalra mutató minden kattintás újabb másolatot készít, mindegyiket egy távolsággal az előzőn túl. Vagy maradjon az alapértelmezésnél, és mindig a legújabb másolatot válassza ki.

### Hogyan lehet a párhuzamos másolatokat az aktuális fóliára tenni?

Az első promptnál válassza a <Keyword id="Layer" /> opciót, majd az <Keyword id="Current" /> értéket. Ettől kezdve minden másolat az aktuális fóliára kerül, amíg újra a <Keyword id="Source" /> értéket nem választja.
