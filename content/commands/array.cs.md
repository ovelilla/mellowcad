---
title: "Příkaz POLE (ARRAY) v AutoCADu"
metaTitle: "Pole objektů v AutoCADu: příkaz POLE (ARRAY)"
description: "Jak vytvořit pole v AutoCADu příkazem POLE (ARRAY, zkratka PO): obdélníkové, polární a křivkové, upravované živě před vytvořením. Vyzkoušejte zdarma online."
figure: "Čtverec a jeho kružnice v poli s výchozími hodnotami: Enter pro obdélníkové pole, 4 sloupce a 3 řady."
sourceHash: "5e0a412c9f13"
---

Příkaz POLE (ARRAY) kopíruje výběr podle vzoru: ve sloupcích a řadách, kolem středu nebo podél trajektorie. Zeptá se na objekty, pak na typ pole, přičemž Enter vybere obdélníkové, a předá výběr příkazu <Command id="ARRAYRECT" />, <Command id="ARRAYPOLAR" /> nebo <Command id="ARRAYPATH" />, který pokračuje, aniž by se znovu ptal na objekty. Každý z nich pole hned ukáže a upravuje ho živě, svými možnostmi a uzly, dokud ho Enter nevytvoří: jeden objekt pole, nebo volné kopie, pokud jste zvolili, že nemá být asociativní. Celý příkaz je jeden krok zpět a Enter na příkazovém řádku příkaz POLE zopakuje.

## Options

### Rectangular

Sloupce a řady a podle potřeby úrovně skládané podél Z: <Command id="ARRAYRECT" />. Začíná se 4 sloupci a 3 řadami, s roztečí jedenapůlkrát větší než velikost výběru.

### PAth

Podél úsečky, oblouku, kružnice nebo křivky: <Command id="ARRAYPATH" />. Zeptá se na křivku trajektorie a pak na ni rozloží položky, každou natočenou tak, jak se trajektorie stáčí.

### POlar

Kolem středového bodu: <Command id="ARRAYPOLAR" />. Zeptá se na střed a začíná se 6 položkami na celé otočce.

## Missing

Nabízený typ je vždy obdélníkový: proměnná ARRAYTYPE, která v AutoCADu nastavuje výchozí typ, se nečte.

## Questions

### Jak se jmenuje příkaz POLE anglicky a jakou má zkratku?

Anglicky ARRAY, v českém AutoCADu POLE: zadejte `PO` a stiskněte Enter nebo mezerník. Anglické `AR` v českém AutoCADu nefunguje; `_ARRAY` funguje v AutoCADu v jakémkoli jazyce. <Command id="ARRAYRECT" />, <Command id="ARRAYPOLAR" /> a <Command id="ARRAYPATH" /> zkratku nemají a zadané celé přeskočí otázku na typ.

### Jak v AutoCADu vytvořit kruhové pole?

Vyberte <Keyword id="POlar" /> nebo spusťte <Command id="ARRAYPOLAR" /> a vyberte středový bod: výběr se zkopíruje kolem něj, zpočátku v 6 položkách. Počet změňte možností <Keyword command="ARRAYPOLAR" id="Items" /> a úhel, který vyplňují, nastavte možností <Keyword command="ARRAYPOLAR" id="Fill angle" />.

### Jak rozložit pole v AutoCADu?

Vyberte ho a spusťte <Command id="EXPLODE" />: pole se rozpadne na objekty svých položek, každý objekt ve své hladině. Chcete-li volné kopie hned od začátku, odpovězte <Keyword command="ARRAYRECT" id="No" /> na <Keyword command="ARRAYRECT" id="ASsociative" />, než stisknete Enter.

### Jak změnit pole po jeho vytvoření?

Vyberte ho. Mění ho jeho uzly: čtverec v základním bodě ho posouvá, šipky nastavují počty a rozteče a číslo zadané, když je šipka počtu aktivní, je nový počet. Paleta Vlastnosti uvádí jeho sloupce, řady a rozteče, nebo položky a úhly, k přepsání. Příkaz EDITPOLE tu zatím není.
