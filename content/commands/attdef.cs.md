---
title: "Atributy bloku v AutoCADu: příkaz ATRDEF (ATTDEF)"
metaTitle: "Atributy bloku v AutoCADu: příkaz ATRDEF"
description: "Jak definovat atribut bloku v AutoCADu příkazem ATRDEF (ATTDEF, zkratka AT): režimy, název, výzva a implicitní hodnota, potom umístění textu."
figure: "Označení dveří: atribut NUM vystředěný v kružnici, jeho výzvou je sám název a implicitní hodnotou 1, připravený ke vložení do bloku."
sourceHash: "f0fc3d8763e7"
---

Příkaz ATRDEF (ATTDEF) definuje atribut: název, výzvu a implicitní hodnotu, umístěné ve výkresu jako řádek textu. Vyberte ho spolu s ostatními objekty, když vytváříte blok příkazem <Command id="BLOCK" />, a každá reference tohoto bloku pro něj bude mít vlastní hodnotu: číslo dveří, kód dílu, název místnosti. Do té doby definice ukazuje svůj název.

ATRDEF v AutoCADu otevře dialog Definice atributu, který MellowCAD nemá: zde se ATRDEF ptá na příkazovém řádku na to, na co se ptá <Command id="-ATTDEF" />, stejně jako konzole AutoCADu. Vypíše aktuální režimy a ptá se, který změnit, dokud Enter nepokračuje dál. Potom název: bez mezer, protože mezera ho ukončí, a malá písmena se změní na velká; samotný Enter vypíše <Message id="tagCannotBeNull" />. Potom výzva, kterou se <Command id="INSERT" /> na hodnotu zeptá, přičemž Enter převezme název, a implicitní hodnota. Nakonec umístění textu, s otázkami příkazu <Command id="TEXT" />: počáteční bod, výška a otočení. Výška a zarovnání jsou společné s příkazem TEXT, oběma směry. Enter na výzvu k počátečnímu bodu umístí definici o řádek níž pod naposledy definovanou, s její výškou, otočením, stylem a zarovnáním, takže se atributy bloku řadí jeden pod druhý.

## Options

### Invisible

Hodnota se na referencích nezobrazí, dokud ji nezapne <Command id="ATTDISP" />. Každý režim je přepínač: jeho volba ho přepne mezi `A` a `N`, znovu vypíše režimy a zeptá se ještě jednou. Režimy zůstanou nastavené pro další ATRDEF.

### Constant

Každá reference má stejnou hodnotu, na kterou se ATRDEF ptá místo výzvy a implicitní hodnoty; VLOŽ se na ni nikdy nezeptá.

### Verify

VLOŽ se na hodnotu zeptá podruhé, aby ji ověřil, až se jednou zeptá na všechny hodnoty.

### Preset

VLOŽ se na hodnotu neptá: každá reference převezme implicitní hodnotu.

### Lock position

Na začátku zapnuto: atribut zůstane tam, kam ho blok umístí.

### Justify

Ptá se, jak je text zarovnán ke svému bodu, stejně jako TEXT: <Keyword id="Left" />, <Keyword id="Center" />, <Keyword id="Right" />, <Keyword id="Middle" /> nebo jeden z devíti bodů: nahoře, uprostřed nebo dole a vlevo, na středu nebo vpravo. Výzva k počátečnímu bodu se potom ptá na zvolený bod: střed uprostřed vystředí hodnotu v označení.

### Style

Ptá se na textový styl, který se stane aktuálním; <Keyword id="?" /> vypíše styly výkresu.

## Missing

Dialog Definice atributu: ATRDEF se ptá na příkazovém řádku. Režimy Poznámky a Více řádků, které AutoCAD 2027 uvádí za Uzamknutou pozicí, a řádky víceřádkového atributu. Pole, zarovnání Zarovnat a Přizpůsobit a otázka možnosti Styl, které styly po `?` vypsat.

## Questions

### Jak se jmenuje příkaz ATRDEF anglicky a jakou má zkratku?

Anglicky ATTDEF, v českém AutoCADu ATRDEF: zadejte `AT` a stiskněte Enter nebo mezerník; funguje i `DIATRDEF`. Anglické `ATT` v českém AutoCADu nefunguje. <Command id="-ATTDEF" /> je forma pro příkazový řádek, kterou zde spouští i ATRDEF. `_ATTDEF` funguje v AutoCADu v jakémkoli jazyce.

### Jak vytvořit blok s atributy v AutoCADu?

Nakreslete symbol, potom spusťte ATRDEF pro každý atribut a umístěte jeho text tam, kde se má hodnota zobrazit. Spusťte <Command id="BLOCK" />, určete základní bod a vyberte symbol i atributy, v pořadí, v jakém se na ně má VLOŽ ptát. Každé vložení bloku příkazem <Command id="INSERT" /> se pak zeptá na hodnotu každého atributu a nabídne jeho implicitní hodnotu.

### Jaký je rozdíl mezi názvem, výzvou a implicitní hodnotou atributu?

Název atribut pojmenovává, jako identifikátor: ten ukazuje definice a jím <Command id="EATTEDIT" /> označuje pole. Výzva je otázka, kterou se VLOŽ ptá na hodnotu. Implicitní hodnota je nabízená hodnota, kterou přijme Enter.

### Jak upravit definici atributu?

Poklepejte na ni, než se stane součástí bloku: <Command id="TEXTEDIT" /> otevře její název, výzvu a implicitní hodnotu. Jakmile je v bloku, hodnoty každé reference se upravují příkazem <Command id="ATTEDIT" /> nebo <Command id="EATTEDIT" />.
