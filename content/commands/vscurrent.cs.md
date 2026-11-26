---
title: "Vizuální styly v AutoCADu: příkaz AKTUÁLNÍVS (VSCURRENT)"
metaTitle: "Vizuální styly v AutoCADu: AKTUÁLNÍVS"
description: "Jak v AutoCADu změnit vizuální styl příkazem AKTUÁLNÍVS (VSCURRENT, zkratka VC): 2D drátový model, Skrytý a Koncepční, co který kreslí a jak se vrátit do 2D."
figure: "Kvádr s průchozím otvorem, viděný od jihovýchodu: AKTUÁLNÍVS Koncepční vystínuje jeho plochy a nakreslí na ně hrany."
sourceHash: "d06873f62261"
---

Příkaz AKTUÁLNÍVS (VSCURRENT) nastaví vizuální styl: to, jak pohled kreslí 3D tělesa. Zeptá se na styl a nabídne aktuální jako výchozí, takže Enter ho ponechá. <Keyword id="2dwireframe" /> kreslí každou hranu, i ty vzadu; <Keyword id="Hidden" /> skryje to, co zakrývají plochy; <Keyword id="Conceptual" /> plochy vybarví, se stínováním. Styl patří pohledu a ukládá se do výkresu a každé spuštění je jeden krok, který lze vrátit zpět. Uvnitř jiného příkazu ho použít nelze.

To, co není těleso (úsečky, kružnice, oblasti, text), se kreslí jako ve stylu 2D drátový model bez ohledu na styl, ve vlastních barvách. Ve stylech Skrytý a Koncepční vybere kliknutí těleso, jehož plocha je pod kurzorem nejblíž k vám, nikdy těleso za plochou, která ho zakrývá, a uchopení objektů dál najde každou hranu. Hrany tělesa v uzamknuté hladině se kreslí bledší. 3D v MellowCAD jsou jen 3D tělesa, zatím částečně.

## Options

### 2dwireframe

Každá hrana každého tělesa, i vzadu, spolu s čarami, které ukazují jeho zakřivené plochy; výchozí styl nového výkresu. Při návratu k němu z jiného stylu vypíše příkaz AKTUÁLNÍVS <Message id="regeneratingModel" />.

### Hidden

Hrany každého tělesa a obrysy jeho zakřivených ploch tam, kde je nezakrývá žádná plocha žádného tělesa, v barvě objektu: těleso za jiným je jím zakryté. Čáry, které ve stylu 2D drátový model ukazují zakřivenou plochu, se nekreslí.

### Conceptual

Plochy obrácené k vám vybarvené barvou objektu, která na straně odvrácené od světla přechází do chladné modré, přičemž světlo sleduje váš úhel pohledu, a na nich hrany stylu Skrytý v jedné barvě, bez ohledu na barvu objektu. Zde i ve stylu Skrytý ukáže válec nebo kužel viděný v půdorysu jen svou kružnici, jako v AutoCADu.

## Missing

Ostatní styly AutoCADu – Drátový model, Realistický, Stínovaný, Stínovaný s hranami, Odstíny šedé, Náčrt a Rentgen – a zadání názvu stylu nebo jejich výpis pomocí `?`: výzva vypisuje jen tři hotové styly a každou jinou odpověď odmítne.

## Questions

### Jak v AutoCADu změnit vizuální styl?

Spusťte příkaz AKTUÁLNÍVS (nebo zkratku `VC`; anglická `VS` v české verzi spouští příkaz SVLOŽSPEC) a zvolte styl: <Keyword id="Hidden" /> pro skrytí hran vzadu, <Keyword id="Conceptual" /> pro vystínování ploch. Mění jen pohled, ne objekty. Bez psaní ho vyberete v popisku v levém horním rohu výkresu, který ukazuje aktuální styl.

### Jak se vrátit k 2D drátovému modelu?

Spusťte příkaz AKTUÁLNÍVS a zvolte <Keyword id="2dwireframe" />, písmeno `2`.

### Jaký je rozdíl mezi stylem Skrytý a Koncepční?

Oba skrývají to, co zakrývají plochy. Skrytý kreslí jen hrany, na pozadí, jako čárový výkres; Koncepční navíc vybarví plochy, stínované světlem, se stejnými hranami navrchu.

### Proč tělesem stále prosvítají čáry?

Nepatří k tělesu. Úsečky, kružnice a oblasti se v každém stylu kreslí jako ve stylu 2D drátový model, takže úsečka za kvádrem zůstane vidět. Ve stylu <Keyword id="2dwireframe" /> jsou vidět i zadní hrany samotného tělesa: zvolte <Keyword id="Hidden" />.
