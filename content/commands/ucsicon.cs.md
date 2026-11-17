---
title: "Příkaz USSI (UCSICON) v AutoCADu"
description: "Jak v AutoCADu zobrazit nebo skrýt ikonu USS příkazem USSI (UCSICON) a umístit ji do počátku nebo do rohu: Ano, Ne, vLevo, pOčátek."
figure: "USSI vLevo přesune ikonu do rohu; USS přesune počátek na stupeň kvádru a pOčátek tam ikonu nakreslí, s osou X červenou, Y zelenou a Z modrou."
sourceHash: "c431e70eda01"
---

Příkaz USSI (UCSICON) zobrazí nebo skryje ikonu USS, ramena X a Y, která ukazují, kde je aktuální USS a kam směřuje, a určí, kde ikona leží: v počátku USS, nebo v levém dolním rohu výkresu. Jeho jediná výzva nabídne aktuální stav jako výchozí, takže Enter ho ponechá. Nastavení se ukládá do výkresu a každé spuštění příkazu USSI je jeden krok, který lze vrátit zpět.

Ikona má 3D styl, jako v AutoCADu 2027: rameno pro X a rameno pro Y, s písmenem na každém konci, a čtverec v počátku, dokud je USS globální. Mimo pohled shora ukazuje rameno Z, kam směřuje osa Z systému USS, a rameno viděné ve směru své osy se vynechá. Ve stylu 2D drátový model je ikona bílá; ve stylech Skrytý a Koncepční je její osa X červená, Y zelená a Z modrá. Zadaný s apostrofem, `'USSI`, nastaví místo toho proměnnou UCSICON, i uvnitř jiného příkazu: od 0 do 3, kde 1 ikonu zobrazí a 2 ji umístí do počátku.

## Options

### ON

Zobrazí ikonu.

### OFF

Skryje ikonu. USS dál existuje a to, co kreslíte, v něm dál leží.

### Noorigin

Drží ikonu v levém dolním rohu výkresu, ať je počátek kdekoli.

### ORigin

Kreslí ikonu v počátku USS; to je výchozí nastavení. Když je počátek mimo obrazovku nebo tak blízko jejího okraje, že by se ikona nevešla, přesune se ikona do levého dolního rohu, dokud se počátek nevrátí do pohledu.

## Missing

Možnost všUde, která v AutoCADu použije nastavení na všechny výřezy (zde je jen jeden); Vybíratelná, tedy uzly ikony; a vlaStnosti, tedy dialog Ikona USS, se stylem 2D, velikostí, tloušťkou čáry a barvami.

## Questions

### Jak v AutoCADu vypnout ikonu USS?

Zadejte `USSI`, stiskněte Enter a pak zvolte <Keyword id="OFF" />. <Keyword id="ON" /> ji vrátí. Příkaz nemá zkratku; anglický název s podtržítkem, `_UCSICON`, funguje v AutoCADu v každém jazyce.

### Jak přesunout ikonu USS do počátku?

USSI, pak <Keyword id="ORigin" />: ikona se postaví do počátku USS. Pokud zůstane v rohu, je počátek mimo obrazovku nebo příliš blízko jejího okraje: posuňte pohled nebo ho zmenšete. <Keyword id="Noorigin" /> drží ikonu v rohu.

### Co znamená čtverec na ikoně USS?

Že USS je globální souřadnicový systém. Posuňte nebo otočte USS příkazem <Command id="UCS" /> a čtverec zmizí; <Command id="UCS" /> a Enter vrátí globální systém, a s ním i čtverec.

### Jak změnit styl, velikost nebo barvu ikony USS?

V AutoCADu možností vlaStnosti příkazu USSI, v dialogu Ikona USS. MellowCAD ho zatím nemá: ikona se kreslí tak, jak ji AutoCAD 2027 kreslí ve výchozím nastavení, ve 3D stylu.
