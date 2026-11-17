---
title: "Kopírování do schránky v AutoCADu: příkaz SKOPIE (COPYCLIP)"
metaTitle: "Kopírování do schránky v AutoCADu: Ctrl+C"
description: "Jak funguje SKOPIE (COPYCLIP, Ctrl+C) v AutoCADu spolu s VYJMIS, SKOPIEREF a SVLOŽ: kopírování objektů do schránky a jejich vložení v bodě. Vyzkoušejte zdarma."
figure: "SKOPIE otvoru desky, pak SVLOŽ v 65,20: kopie položená tam svým levým dolním rohem, druhý otvor."
sourceHash: "f84c995e7c2b"
---

Příkaz SKOPIE (COPYCLIP) zkopíruje vybrané objekty do schránky, spolu s hladinami, styly a bloky, které používají; výkres se nezmění a objekty vybrané před ním zůstanou vybrané. Spouští ho Ctrl+C, které přeruší běžící příkaz. <Command id="PASTECLIP" />, Ctrl+V, se pak zeptá na bod vložení: objekty sledují kurzor a dopadnou levým dolním rohem svého rozsahu do tohoto bodu, v aktuálním systému USS, vše v jednom kroku, který <Command id="U" /> vrátí zpět. Vkládat můžete do téhož výkresu nebo do jiného: schránka je systémová, takže ji může přečíst výkres na jiné kartě, pokud prohlížeč stránce dovolí schránku číst. Když má vkládaná hladina, styl nebo blok název, který výkres už má, použije se ten z výkresu.

<Command id="CUTCLIP" />, Ctrl+X, objekty zkopíruje a vymaže, jako VYMAŽ. <Command id="COPYBASE" />, Ctrl+Shift+C, se nejprve zeptá na základní bod a SVLOŽ pak objekty umístí podle tohoto bodu místo rohu, takže dopadnou přesně tam, kam chcete. Ctrl+A vybere všechny objekty výkresu.

## Missing

SVLOŽBLOK a VYJMISREF, a tedy Ctrl+Shift+V a Ctrl+Shift+X, které zůstávají prohlížeči, stejně jako Ctrl+Shift+A. SVLOŽORIG, SVLOŽSPEC, přetahování objektů mezi okny a text z jiného programu vložený jako víceřádkový text. Skryté možnosti příkazu VLOŽ u bodu příkazu SVLOŽ, takže vkládaný objekt nelze při tom změnit měřítkem, otočit ani rozložit.

## Questions

### Jaký je rozdíl mezi příkazy KOPIE a SKOPIE?

<Command id="COPY" /> umístí kopie do téhož výkresu, od základního bodu k druhému bodu. SKOPIE vloží objekty do schránky, odkud je příkaz SVLOŽ vloží do tohoto výkresu nebo do jiného.

### Jak kopírovat se základním bodem v AutoCADu?

Stiskněte Ctrl+Shift+C nebo zadejte `SKOPIEREF`, zadejte základní bod a vyberte objekty. Ctrl+V je pak umístí podle tohoto bodu.

### Jak zkopírovat objekty z jednoho výkresu do druhého?

Vyberte je a stiskněte Ctrl+C, otevřete druhý výkres a stiskněte Ctrl+V, pak určete bod vložení. Jejich hladiny, styly a bloky se přenesou s nimi.

### Proč nefunguje vkládání?

Prohlížeč se může zeptat, zda stránka smí číst schránku: povolte to. Pokud přístup odmítne, SVLOŽ vloží to, co bylo naposledy zkopírováno na téže stránce. Když nebylo zkopírováno nic, nevloží nic.
