---
title: "Cvičení v AutoCADu: táhlo s tečnami"
metaTitle: "Cvičení v AutoCADu pro pokročilé: táhlo"
description: "Nakreslete táhlo v AutoCADu: dvě oka spojená úsečkami tečnými k oběma s uchopením Tečná, oblouky mezi nimi oříznuté, a kóty. Zdarma online."
figure: "Táhlo se dvěma oky ve vzdálenosti 90, spojenými tečnami, s kótami."
sourceHash: "383984af61b7"
---

Nakreslete toto táhlo v milimetrech: dvě oka vzdálená 90, o poloměru 20 a 12, s otvory o poloměru 10 a 6, spojená úsečkami tečnými k oběma, s oblouky mezi úsečkami oříznutými. Tečné úsečky používají na obou koncích uchopení objektu Tečná; příkaz <Command id="TRIM" /> potom změní kružnici každého oka v oblouk.

## Steps

### Nakreslete oka [#bosses]

V hladině Obrys čtyři kružnice příkazem <Command id="CIRCLE" />, každá zadaná poloměrem: `20` a `10` v bodě `0,0`, `12` a `6` v bodě `90,0`.

### Nakreslete tečny [#tangents]

Příkaz <Command id="LINE" />, potom zadejte `_TAN`, uchopení objektu Tečná pro jeden bod, a vyberte velkou kružnici blízko jejího horního okraje; znovu `_TAN` a vyberte malou kružnici blízko jejího horního okraje. Úsečka se dotýká obou. Stejně podél spodní strany.

### Ořízněte oblouky [#trim]

Příkaz <Command id="TRIM" />: vyberte každé oko mezi oběma úsečkami, na straně obrácené k druhému oku. Vnitřní oblouky zmizí a z každé kružnice je oblouk.

### Nakreslete osy [#centreLines]

V hladině Osy osa procházející oběma středy a úsečka napříč každým okem.

### Okótujte výkres [#dimensions]

V hladině Kóty vzdálenost středů příkazem <Command id="DIMLINEAR" />, poloměry ok příkazem <Command id="DIMRADIUS" /> a jejich otvory příkazem <Command id="DIMDIAMETER" />.
