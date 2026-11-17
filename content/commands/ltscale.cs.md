---
title: "Měřítko typu čáry v AutoCADu: příkaz TČMĚŘ (LTSCALE)"
metaTitle: "Měřítko typu čáry v AutoCADu: TČMĚŘ (LTSCALE)"
description: "Jak změnit měřítko typu čáry v AutoCADu příkazem TČMĚŘ (LTSCALE, zkratka TCM) pro celý výkres, aby čárkovaná čára ukázala čárky v každé velikosti."
before: "Deska dlouhá 4 metry, její otvor nakreslený typem HIDDEN a osy typem CENTER, při výchozím měřítku typu čáry 1: čárky jsou příliš drobné, aby byly vidět."
figure: "Tatáž deska po TČMĚŘ 20: čárky otvoru a os nakreslené 20krát delší."
sourceHash: "33b956c956fa"
---

Příkaz TČMĚŘ (LTSCALE) nastaví globální faktor měřítka typu čáry: jak dlouhé jsou čárky a mezery každého přerušovaného typu čáry ve výkresu. Zeptá se na nový faktor a nabídne aktuální, v novém výkresu `1.0000`: 2 prodlouží každou čárku na dvojnásobek, 0,5 ji zkrátí na polovinu. Faktor musí být větší než 0, jinak vypíše <Message id="positiveNonzero" /> a zeptá se znovu; `1/2` a `1e3` čte jako čísla. Změna překreslí celý výkres se zprávou `Regeneruji model.`, jak ji píše AutoCAD 2027, a uloží se s výkresem; je to krok, který vrátí <Command id="U" />. Když příkaz zadáte s apostrofem uvnitř jiného příkazu, `'TČMĚŘ`, výkres se překreslí, až ten příkaz skončí.

Typy čar jsou vzory navržené pro výkres ve velikosti papíru: ve výkresu širokém 4 metry, v milimetrech, se vzor CENTER, dlouhý asi 51 jednotek, zopakuje zhruba 80krát, příliš jemně, aby byl vidět, a čára kratší než jeden vzor se kreslí plná. Správné měřítko je obvykle měřítko samotného výkresu: 20 pro výkres čtený v měřítku 1:20, 50 pro 1:50.

## Missing

Správce typů čar, jehož Globální měřítko je TČMĚŘ a Měřítko aktuálního objektu CELTSCALE. PSLTSCALE a MSLTSCALE, protože tu není výkresový prostor. Tvary složených typů čar, jako je BATTING, kreslené jako jejich mezery.

## Questions

### Jak se jmenuje příkaz TČMĚŘ anglicky?

LTSCALE. V českém AutoCADu je jeho zkratka `TCM`: zadejte ji a stiskněte Enter nebo mezerník. Anglické `LTS` v české verzi nefunguje; celý název `TČMĚŘ` funguje také a `_LTSCALE` v AutoCADu v jakémkoli jazyce.

### Proč se čárkovaná čára zobrazuje jako plná?

Její vzor neodpovídá výkresu při aktuálním měřítku. Čára kratší než jedno opakování vzoru se kreslí plná; dlouhá čára při malém měřítku nahustí čárky tak blízko k sobě, že vypadá plná. U velkého výkresu TČMĚŘ zvětšete, u malého zmenšete, dokud se čárky neukážou.

### Jaké měřítko TČMĚŘ nastavit?

Měřítko výkresu: ve výkresu v milimetrech čteném v měřítku 1:50 `50`. Pro výkres ve velikosti papíru 1.

### Jaký je rozdíl mezi TČMĚŘ a samotným typem čáry?

Typ čáry, nastavený příkazem <Command id="LINETYPE" /> nebo hladinou, je vzor: čárky, tečky a mezery. TČMĚŘ určuje, jak dlouhý se ten vzor kreslí – stejný faktor pro všechny objekty výkresu.
