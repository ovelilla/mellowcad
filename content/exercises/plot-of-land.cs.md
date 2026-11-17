---
title: "Cvičení v AutoCADu: pozemek"
metaTitle: "Cvičení v AutoCADu: plocha a strany pozemku"
description: "Nakreslete pozemek v AutoCADu z délek a úhlů jeho stran polárními souřadnicemi, potom změřte jeho plochu a okótujte ho. Krok za krokem, zdarma online."
figure: "Pozemek o pěti stranách, v metrech, s kótou každé strany a jednoho úhlu."
sourceHash: "f5542a75eef7"
---

Nakreslete tento pozemek v metrech podle délek a směrů jeho stran: 40 pod úhlem 0°, 30 pod úhlem 80°, 35 pod úhlem 155° a 25 pod úhlem 230°, a potom zpět k počátečnímu bodu. Změřte jeho plochu a obvod a okótujte každou stranu i úhel u jeho druhého vrcholu. Polární souřadnice – délka a úhel – vedou každou stranu od konce předchozí. Měřítko kót výkresu je nastavené pro metry.

## Steps

### Nakreslete hranici [#boundary]

V hladině Obrys příkaz <Command id="PLINE" /> od `0,0`, potom každou stranu jako její délku a úhel: `40<0`, `30<80`, `35<155` a `25<230`, každou měřenou od posledního bodu. Možnost <Keyword command="PLINE" id="Close" /> nakreslí pátou stranu a hranici uzavře: jeden objekt, který příkaz <Command id="AREA" /> dokáže změřit.

### Změřte plochu [#area]

Příkaz <Command id="AREA" />, potom možnost <Keyword command="AREA" id="Object" />, a vyberte hranici: příkazový řádek vypíše její plochu ve čtverečních metrech a obvod.

### Okótujte výkres [#dimensions]

V hladině Kóty příkaz <Command id="DIMALIGNED" /> a Enter na jeho první výzvu: příkaz se pak zeptá na objekt a výběr strany okótuje tuto stranu, rovnoběžně s ní. Každou kótu umístěte vně pozemku. Příkaz <Command id="DIMANGULAR" /> na dvou stranách, které se setkávají v bodě `40,0`, udá úhel mezi nimi, 100°.
