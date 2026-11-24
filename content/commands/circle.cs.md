---
title: "Kružnice v AutoCADu: příkaz KRUŽNICE (CIRCLE)"
metaTitle: "Kružnice v AutoCADu: příkaz KRUŽNICE (CIRCLE)"
description: "Jak nakreslit kružnici v AutoCADu příkazem KRUŽNICE (CIRCLE, zkratka KR): střed a poloměr nebo průměr, 2B, 3B a Ttr, kružnice tečná ke dvěma objektům."
figure: "Tři kružnice: střed a poloměr, dva konce průměru (2B), střed a průměr."
sourceHash: "3f6a42208e31"
---

Příkaz KRUŽNICE (CIRCLE) nakreslí kružnici ze středu a poloměru, zadaného číslem nebo bodem na kružnici, nebo jedním z dalších způsobů, které nabízí jeho první výzva. Enter u poloměru zopakuje velikost poslední kružnice, uloženou pro výkres. Zatímco zadáváte poloměr, vede od středu ke kurzoru jantarová čárkovaná čára, při zadávání průměru až za obvod, jak ji kreslí AutoCAD. Kružnice leží v rovině svého prvního bodu, v aktuálním zdvihu, pokud bod nemá vlastní souřadnici Z.

## Options

### 3P

Třemi body. S uchopením Tečna před každým bodem, `TAN` nebo `_TAN`, je to způsob Tečna, tečna, tečna z AutoCADu: kružnice tečná ke třem objektům.

### 2P

Ze dvou koncových bodů průměru.

### Ttr

Tečná ke dvěma objektům, s poloměrem: vyberte každou úsečku, kružnici nebo oblouk blízko místa, kde se jich má kružnice dotýkat, a pak zadejte poloměr. Z kružnic, které vyhovují, nakreslí tu, která se dotýká nejblíže místům výběru; když nevyhovuje žádná, vypíše <Message id="circleDoesNotExist" />.

### Diameter

Na výzvu k zadání poloměru: zadejte místo něj průměr, číslem nebo bodem.

## Missing

Ttr na segmentu křivky, který AutoCAD přijme a MellowCAD odmítne; položka Tečna, tečna, tečna na pásu karet (zadání tohoto způsobu, tedy 3B se třemi uchopeními Tečna, funguje); Rychlé vlastnosti po dvojitém kliknutí na kružnici.

## Questions

### Jak se jmenuje příkaz KRUŽNICE anglicky a jakou má zkratku?

Anglicky CIRCLE, v českém AutoCADu KRUŽNICE: zadejte `KR` a stiskněte Enter nebo mezerník. Anglické `C` v českém AutoCADu nefunguje; `_CIRCLE` funguje v AutoCADu v jakémkoli jazyce.

### Jak nakreslit kružnici tečnou ke dvěma úsečkám?

Zvolte <Keyword id="Ttr" />, vyberte první úsečku, pak druhou, blízko míst, kde se jich má kružnice dotýkat, a zadejte poloměr.

### Jak nakreslit kružnici tečnou ke třem objektům?

Zvolte <Keyword id="3P" /> a před každým ze tří bodů zadejte `TAN`; každý objekt vyberte blízko místa, kde se ho má kružnice dotýkat.

### Jak nakreslit kružnici zadanou průměrem v AutoCADu?

Zadejte střed, pak zvolte <Keyword id="Diameter" /> a zadejte průměr. Nebo zvolte <Keyword id="2P" /> a zadejte dva koncové body průměru.
