---
title: "Úprava atributů v AutoCADu: příkaz ATREDIT (ATTEDIT)"
metaTitle: "Úprava atributů v AutoCADu: ATREDIT"
description: "Jak změnit hodnoty atributů reference bloku v AutoCADu příkazem ATREDIT (ATTEDIT, zkratka ATE): pole pro každou výzvu, jeden krok zpět. Vyzkoušejte zdarma."
figure: "Tři označení dveří, reference bloku s atributem NUM: ATREDIT vybere poslední, vložené jako 2, a jeho okno ho změní na 3."
sourceHash: "4a8ee28ecc53"
---

Příkaz ATREDIT (ATTEDIT) mění hodnoty atributů jedné reference bloku. Vyzve vás k výběru reference a potom otevře okno s polem pro každý z jejích atributů, popsaným výzvou atributu a vyplněným jeho hodnotou, jako dialog Upravit atributy v AutoCADu. Přepište hodnoty, klávesou Tab přecházejte z pole do pole, a Enter, v AutoCADu OK, je použije v jednom kroku, který <Command id="U" /> vrátí zpět; Esc, jeho Storno, nic nezmění.

Výběr vezme objekt pod kurzorem. Cokoli jiného než reference bloku je odmítnuto, stejně jako reference, jejíž blok nemá atributy, a otázka se zopakuje; výběr do prázdna se zeptá znovu bez hlášení. Definice bloku se nezmění, ani jeho ostatní reference: každá má vlastní hodnoty. <Command id="EATTEDIT" /> upravuje tytéž hodnoty v okně popsaném názvy atributů a spustí ho poklepání na referenci s atributy.

## Missing

`-ATREDIT`, forma pro příkazový řádek, která upravuje atributy jednotlivě nebo globálně, a její zkratka `-ATE`. Tlačítka Předchozí a Další dialogu Upravit atributy, pro blok s více atributy, než se vejde na jednu stránku, a jeho řádek Název bloku. ATRPEDIT (ATTIPEDIT), který upravuje jeden atribut na místě, a jeho Ctrl + poklepání. Vlastní uzel odemknutého atributu na referenci a řádky atributů v paletě Vlastnosti.

## Questions

### Jak se jmenuje příkaz ATREDIT anglicky a jakou má zkratku?

Anglicky ATTEDIT, v českém AutoCADu ATREDIT: zadejte `ATE` a stiskněte Enter nebo mezerník; funguje i `DIATR`. `_ATTEDIT` funguje v AutoCADu v jakémkoli jazyce.

### Jak upravit atributy bloku v AutoCADu?

Zadejte `ATE` a vyberte referenci, nebo na ni poklepejte, což spustí <Command id="EATTEDIT" />. Změňte hodnoty v okně a stiskněte Enter. Chcete-li změnit samotné atributy, jejich název, výzvu nebo polohu, upravte definice a blok znovu definujte příkazem <Command id="BLOCK" />.

### Proč ATREDIT hlásí, že blok nemá upravitelné atributy?

Protože blok vybrané reference žádné atributy nemá: ATREDIT upravuje hodnoty reference bloku, který je má. Definice, která ještě není součástí bloku, se upravuje příkazem <Command id="TEXTEDIT" />, poklepáním na ni.

### Jaký je rozdíl mezi příkazy ATREDIT a EATREDIT?

Oba upravují hodnoty jedné reference. Okno příkazu ATREDIT popisuje každé pole výzvou atributu, jako dialog Upravit atributy v AutoCADu; okno příkazu <Command id="EATTEDIT" />, Rozšířený editor atributů, jeho názvem. V AutoCADu má EATREDIT také karty s možnostmi textu a vlastnostmi každého atributu.
