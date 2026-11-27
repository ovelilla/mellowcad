---
title: "Obdélníkové pole v AutoCADu: příkaz OBDPOLE (ARRAYRECT)"
metaTitle: "Obdélníkové pole v AutoCADu: OBDPOLE"
description: "Jak vytvořit obdélníkové pole v AutoCADu příkazem OBDPOLE (ARRAYRECT): sloupce, řádky a úrovně, rozteč mezi nimi, asociativita. Zdarma online."
figure: "Čtverec a jeho kružnice v 5 sloupcích a 3 řádcích, s roztečí 16 a 14: nejprve počet, potom rozteč."
sourceHash: "27ed7142411e"
---

Příkaz OBDPOLE (ARRAYRECT) kopíruje výběr do sloupců a řádků, a pokud chcete, i do úrovní, jako jeden objekt pole. Zeptá se na objekty, oznámí typ a to, zda je pole asociativní, a hned ho ukáže: 4 sloupce podél osy X USS a 3 řádky podél její osy Y, ve vzdálenosti jedenapůlnásobku velikosti výběru. Potom jedna výzva upravuje pole živě, dokud ho Enter nevytvoří, a to možnostmi nebo uzly náhledu, jako v AutoCADu: klikněte na jednu z jeho šipek a potom klikněte tam, kam má jít, nebo zadejte číslo, a nastavíte tak počet nebo rozteč. Esc na této výzvě pole také vytvoří. Vybrané objekty se stanou jeho první položkou.

## Options

### ASsociative

<Keyword id="Yes" />, výchozí, vytvoří jeden objekt pole: později ho mění jeho uzly a paleta Vlastnosti a <Command id="EXPLODE" /> ho rozloží na položky. <Keyword id="No" /> vytvoří samostatné kopie vedle vybraných objektů. Odpověď platí po celou relaci, i pro příkazy POLÁRPOLE a KŘIVPOLE.

### COUnt

Počet sloupců, potom řádků, každý od 1 do 32767.

### Spacing

Vzdálenost mezi sloupci, potom mezi řádky, záporná doleva nebo dolů. Nebo <Keyword id="Unit cell" />: dva rohy obdélníku, jehož strany jsou obě vzdálenosti.

### COLumns

Počet sloupců a vzdálenost mezi nimi.

### Rows

Počet řádků, vzdálenost mezi nimi a přírůstek výšky každého řádku oproti předchozímu.

### Levels

Kopie naskládané podél osy Z USS: počet úrovní, potom vzdálenost mezi nimi, nebo s možností <Keyword id="Total" /> vzdálenost od první úrovně k poslední.

### eXit

Vytvoří pole a ukončí příkaz, stejně jako Enter.

## Missing

Základní bod; Celkem u vzdáleností mezi sloupci a mezi řádky (Úrovně ji mají); Výraz, který váže hodnotu na parametry výkresu. Příkazy EDITPOLE a ZAVŘIPOLE (ARRAYEDIT, ARRAYCLOSE), které upravují zdroj pole nebo nahrazují jeho položky. Karta Pole, kterou otevře vybrané pole, proto nemá Základní bod, Možnosti ani Zavřít pole. Nabídky uzlů pole (počet sloupců, celková rozteč sloupců, úhel osy…) a Ctrl k přepínání mezi nimi, takže celkovou rozteč ani úhel osy nelze uzlem nastavit; uzel také nevypisuje své řádky na příkazový řádek. Hodnoty Základní X a Základní Y v paletě nelze znovu zadat.

## Questions

### Jak vytvořit obdélníkové pole v AutoCADu?

Zadejte `OBDPOLE`, které nemá zkratku, nebo `PO`, tedy <Command id="ARRAY" />, a na jeho otázku stiskněte Enter, protože obdélníkové pole je výchozí. Vyberte objekty a stiskněte Enter: pole se hned nakreslí, připravené k úpravám.

### Jak nastavit vzdálenost mezi řádky a sloupci pole?

Zvolte <Keyword id="Spacing" /> a zadejte vzdálenost mezi sloupci, potom mezi řádky; záporná jde doleva nebo dolů. S možností <Keyword id="Unit cell" /> zadají obě najednou dva rohy. Nebo přetáhněte šipky u druhého sloupce a druhého řádku.

### Jak udělat z kopií pole samostatné objekty?

Než stisknete Enter, zvolte <Keyword id="ASsociative" /> a odpovězte <Keyword id="No" />: každá kopie je samostatný objekt. Asociativní pole lze na položky rozložit i později příkazem <Command id="EXPLODE" />.

### Jak vytvořit 3D pole v AutoCADu?

Zvolte <Keyword id="Levels" />: řádky a sloupce se zkopírují nahoru podél osy Z USS, v tolika úrovních, kolik zadáte, a v zadané vzdálenosti. Možnost <Keyword id="Rows" /> se ptá i na přírůstek výšky, který zvedne každý řádek oproti předchozímu.
