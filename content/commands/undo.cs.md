---
title: "Příkaz ZPĚT (UNDO) v AutoCADu"
description: "Jak funguje příkaz ZPĚT (UNDO) v AutoCADu: počet kroků zpět, Označ a Zpátky, Začátek a Konec, Řízení, a čím se liší od Z a Ctrl+Z."
before: "Deska se dvěma otvory a úsečkou napříč, nakreslená čtyřmi příkazy: OBD, dvakrát KRUŽNICE a ÚSEČKA."
figure: "ZPĚT 2: dva poslední příkazy se vrátí, úsečka a druhý otvor, a deska si ponechá první otvor."
sourceHash: "b4fed2178b6a"
---

Příkaz ZPĚT (UNDO) vrací příkazy. Krok je celý příkaz: všechno, co nakreslil jeden příkaz ÚSEČKA, zmizí najednou, bez ohledu na počet segmentů, stejně jako to, co příkaz nastavil, například TČMĚŘ. ZPĚT vypíše svá aktuální nastavení a pak se zeptá na počet operací, které se mají vrátit, nebo na možnost; Enter vrátí jednu. Názvy vrácených příkazů vypíše na jeden řádek, `KRUŽNICE ÚSEČKA`, a když dojde na začátek, <Message id="everythingUndone" />; potom <Message id="nothingToUndo" />. Příkaz, který nic nezměnil, jako ID nebo VÝPIS, je také krok, stejně jako to, co s pohledem udělaly ZOOM a PP.

<Command id="U" /> je zkrácená forma: jeden krok zpět, bez otázky. Ctrl+Z u výzvy `Příkaz:` spustí příkaz Z; uvnitř příkazu je to jeho vlastní možnost Zpět, jak ji zapisuje makro AutoCADu: ÚSEČKA vrátí poslední segment a pokračuje. <Command id="REDO" />, hned potom, vrátí to, co vzal poslední Z nebo ZPĚT.

## Options

### Auto

Zeptá se <Keyword id="ON" /> nebo <Keyword id="OFF" /> a nabídne aktuální nastavení, které pak ukazuje řádek nastavení. V AutoCADu spojí do jednoho kroku příkazy, které spustí jedna položka nabídky; zde žádná nabídka nespouští víc než jeden, takže zde nic nespojuje.

### Control

Zeptá se, v jakém rozsahu vracení zachovat, ve výchozím nastavení <Keyword id="All" />. <Keyword id="None" /> zahodí všechny uchované kroky a vracení vypne: Z pak vypíše <Message id="uDisabled" /> a ZPĚT se hned zeptá na <Keyword id="Control" />. <Keyword id="One" /> uchová jen poslední krok a ZPĚT se pak ptá na 1 nebo <Keyword id="Control" />. <Keyword id="All" /> zapne úplné vracení znovu. <Keyword id="Combine" /> určuje, zda jsou po sobě jdoucí ZOOM a PP jeden krok, a <Keyword id="Layer" />, zda jsou jím po sobě jdoucí úpravy ve Správci vlastností hladin, v obou případech ve výchozím nastavení Ano. Nastavení patří výkresu, ale neukládají se s ním: nový nebo otevřený výkres začíná s <Keyword id="All" />, <Keyword id="Combine" /> Ano a <Keyword id="Layer" /> Ano.

### BEgin

Začne skupinu: příkazy spuštěné až do <Keyword id="End" /> tvoří jeden krok, který Z vrátí celý a vypíše `SKUPINA` spolu s jejich názvy. Když je skupina otevřená, Z, počet a <Keyword id="Back" /> se zastaví na jejím začátku. <Keyword id="BEgin" /> při otevřené skupině ji nejprve uzavře.

### End

Uzavře skupinu, kterou otevřel <Keyword id="BEgin" />.

### Mark

Vloží mezi kroky značku. <Keyword id="Back" />, Z a počet se na ní zastaví se zprávou <Message id="markEncountered" />.

### Back

Vrátí všechny kroky až k poslední značce, i se značkou. Bez značky se zeptá, zda vrátit vše, ve výchozím nastavení Ano.

## Missing

<Keyword id="Auto" /> nic nespojuje, protože zde žádná nabídka nespouští víc než jeden příkaz. <Keyword id="Combine" /> a <Keyword id="Layer" /> platí do konce relace prohlížeče, zatímco AutoCAD je zachová z jedné relace do další. Tlačítka Zpět a Znovu na horní liště nic nezapisují do historie, zatímco panel nástrojů Rychlý přístup AutoCADu zapisuje vlastní záznamy. Ctrl+Shift+Z také obnovuje, beze zprávy, přestože mu AutoCAD nic nepřiřazuje.

## Questions

### Jak se jmenuje příkaz ZPĚT anglicky?

UNDO. Nemá zkratku: zadejte `ZPĚT` celý, chcete-li zadat počet kroků nebo možnost, nebo `_UNDO` v AutoCADu v každém jazyce. Jeden krok zpět je Ctrl+Z nebo `Z` a Enter; `U` z anglické verze je v české zkratka příkazu ÚSEČKA (LINE).

### Jaký je rozdíl mezi Z a ZPĚT?

<Command id="U" /> vrátí poslední příkaz a na nic se neptá. ZPĚT se ptá, kolik vrátit, a má <Keyword id="Mark" /> a <Keyword id="Back" /> pro návrat k označenému místu, <Keyword id="BEgin" /> a <Keyword id="End" />, aby se z několika příkazů stal jeden krok, a <Keyword id="Control" /> pro omezení nebo vypnutí vracení.

### Jak v AutoCADu vrátit několik příkazů najednou?

Zadejte `ZPĚT` a počet příkazů, například `5`. Nebo zvolte <Keyword id="Mark" /> před řadou příkazů, kterou možná budete chtít zahodit, a <Keyword id="Back" /> pro návrat k ní.

### Proč ZPĚT nefunguje?

Vracení bylo vypnuto možností <Keyword id="Control" /> › <Keyword id="None" />: Z to oznámí a ZPĚT se ptá na <Keyword id="Control" />. Odpovězte <Keyword id="All" /> a vracení se znovu zapne. Kroky provedené předtím jsou pryč.

### Jak v AutoCADu obnovit vrácené změny?

<Command id="REDO" /> hned po Z nebo ZPĚT vrátí všechno najednou. Ctrl+Y obnovuje po jednom kroku.
