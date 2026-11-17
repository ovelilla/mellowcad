---
title: "Příkaz OBJEDIT (SOLIDEDIT) v AutoCADu"
description: "Jak příkaz OBJEDIT (SOLIDEDIT) v AutoCADu upravuje plochy 3D tělesa krok za krokem: Vysunutí, Posun, Rotace, ekviD, zEšikmení, vYmazat a Kopie."
figure: "Horní plocha kvádru vysunutá o 15 nahoru se zúžením 15 stupňů příkazem OBJEDIT: komolý jehlan na kvádru, pohled od jihovýchodu."
sourceHash: "775cdc271d4f"
---

Příkaz OBJEDIT (SOLIDEDIT) upravuje 3D těleso pomocí jeho ploch. Nejprve oznámí, zda se každá úprava kontroluje, a pak se zeptá, co upravit: <Keyword id="Face" />, pak možnost pro plochy, pak plochy a pak to, co možnost potřebuje. Každá úprava se provede hned a možnosti pro plochy se nabídnou znovu, takže jedno spuštění může provést několik úprav; <Keyword id="eXit" /> nebo Enter opustí možnosti pro plochy a pak příkaz. Sousední plochy upravovanou plochu následují: posuňte horní plochu kvádru nahoru a jeho boky se prodlouží, aby se s ní setkaly.

Těleso si ponechá hladinu a vlastnosti, ale ztratí to, z čeho vzniklo: kvádr už není kvádrem. Celé spuštění je jeden krok, který lze vrátit zpět, a jeho možnost <Keyword id="Undo" /> vrací úpravy uvnitř něj jednu po druhé. Enter ve výzvě `Příkaz:` ho spustí znovu od první otázky. Tlačítko ploch na panelu Úprava těles spouští každou možnost pro plochy přímo. 3D v MellowCAD jsou jen 3D tělesa, zatím částečně.

## Options

### Face

Možnosti pro plochy. Každá se ptá na plochy, dokud nestisknete Enter: kliknutí nebo zapsaný bod vybere plochu, která je pod ním nejblíž k vám, nebo dvě plochy hrany v tom místě, a určení plochy, která už je vybraná, vybere tu, která leží za ní. Jakmile je plocha vybraná, <Keyword id="ALL" /> vybere všechny plochy jejího tělesa; <Keyword id="Remove" /> plochy ze sady naopak odebírá a <Keyword id="Undo" /> vrátí poslední výběr. Určení prázdného místa vypíše <Message id="noSolidsDetected" />. Jen plochy jednoho tělesa.

### Extrude

Zeptá se na výšku a úhel zúžení: každá plocha vyroste v hranol přidaný k tělesu, nebo při záporné výšce od něj odečtený, který se při kladném úhlu směrem nahoru zužuje. Enter u výšky převezme poslední výšku, kterou použily příkazy základních těles nebo příkaz <Command id="EXTRUDE" />.

### Move

Zeptá se na základní bod a druhý bod: rovinná plocha se posune o tolik, kolik tento vektor měří podél její normály, a sousední plochy s sebou potáhne. Enter u druhého bodu převezme základní bod jako přemístění.

### Rotate

Zeptá se na osu, dvěma body nebo podél os <Keyword id="Xaxis" />, <Keyword id="Yaxis" /> nebo <Keyword id="Zaxis" /> systému USS, nebo kolmo k obrazovce možností <Keyword id="View" />, a pak na úhel: plocha se kolem ní otočí podle pravidla pravé ruky.

### Offset

Zeptá se na vzdálenost: plocha se posune ven podél své normály, nebo při záporné hodnotě dovnitř, a sousední plochy s sebou potáhne; zakřivené plochy také kolem své osy. Odsazení dovnitř o polovinu nejdelší strany kvádru opsaného tělesu se odmítne se zprávou, jak daleko lze jít.

### Taper

Zeptá se na základní bod, bod na ose zúžení a úhel: plocha se nakloní kolem čáry, ve které protíná rovinu procházející základním bodem; kladný úhel ji nakloní dovnitř podél osy.

### Delete

Odstraní stěnu otvoru a otvor uzavře, nebo pruh zaoblení či zkosení a vrátí hranu, kterou nahradil.

### Copy

Vytvoří oblast z každé rovinné plochy, tam, kde leží, nebo posunutou o vektor zadaný dvěma body, v aktuální hladině a s aktuálními vlastnostmi.

### Undo

U možností pro plochy vrátí poslední úpravu tohoto spuštění; když už žádná nezbývá, vypíše <Message id="commandCompletelyUndone" />.

### eXit

Opustí možnosti pro plochy a vrátí se k první otázce, a tatáž možnost v první otázce příkaz ukončí; Enter funguje stejně.

## Missing

<Keyword id="Edge" /> a <Keyword id="Body" /> a <Keyword id="coLor" /> a <Keyword id="mAterial" /> ploch, které se nabízejí, ale odmítnou, stejně jako <Keyword id="Path" /> možnosti <Keyword id="Extrude" />, osa objektem u možnosti <Keyword id="Rotate" /> a její úhel <Keyword id="Reference" />. <Keyword id="Crossing" />, <Keyword id="Fence" /> a <Keyword id="CPolygon" /> při výběru ploch. Posun, otočení, zešikmení nebo kopie zakřivené plochy, její odsazení, když má jiné sousedy, vymazání plochy, která není stěnou otvoru ani pruhem, a úprava, která změní tvar tělesa natolik, že jedna plocha pohltí druhou. Úpravy vedle plochy vysunuté se zúžením. Odsazení ven příliš velké na to, aby se dalo provést, které AutoCAD bez upozornění vynechá a MellowCAD provede. Náhled při zadávání vzdálenosti nebo úhlu.

## Questions

### Jak v AutoCADu upravit 3D těleso?

Spusťte příkaz OBJEDIT, zvolte <Keyword id="Face" /> a pak úpravu: <Keyword id="Extrude" /> nebo <Keyword id="Move" /> plochy, aby bylo těleso vyšší, <Keyword id="Delete" />, aby se zaplnil otvor, <Keyword id="Taper" />, aby se zkosil bok. Vyberte plochy, stiskněte Enter a odpovězte na výzvy možnosti. Chcete-li plochu rychle vytlačit nebo vtlačit, přetáhněte ji příkazem <Command id="PRESSPULL" />.

### Jak vysunout plochu 3D tělesa?

OBJEDIT, <Keyword id="Face" />, <Keyword id="Extrude" />, vyberte plochu a stiskněte Enter, pak zadejte výšku a úhel zúžení: `15` a `15` z ukázky vytvoří na horní ploše kvádru komolý jehlan.

### Jak v AutoCADu odstranit otvor z tělesa?

OBJEDIT, <Keyword id="Face" />, <Keyword id="Delete" />, vyberte stěnu otvoru a stiskněte Enter: otvor se zaplní. Stejně se odstraní zaoblení nebo zkosení.

### Jaký je rozdíl mezi příkazy OBJEDIT a TLAČTÁHNI?

<Command id="PRESSPULL" /> posune jednu plochu přetažením nebo o vzdálenost, kolmo k ní. Příkaz OBJEDIT umí totéž a víc: zešikmuje, otáčí, odsazuje, maže a kopíruje plochy, několik najednou.
