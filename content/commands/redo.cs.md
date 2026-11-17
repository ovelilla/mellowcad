---
title: "Příkaz ZNOVA (REDO) v AutoCADu: obnovení vrácených změn"
metaTitle: "Příkaz ZNOVA (REDO) v AutoCADu"
description: "Jak funguje příkaz ZNOVA (REDO) v AutoCADu: obnoví to, co vzalo poslední Z nebo ZPĚT, hned po něm; NZNOVA a Ctrl+Y obnovují krok po kroku. Vyzkoušejte online."
figure: "Otvor nakreslený v desce, vrácený příkazem Z a obnovený příkazem ZNOVA."
sourceHash: "be2e44b98ac0"
---

Příkaz ZNOVA (REDO) obrátí poslední <Command id="U" /> nebo <Command id="UNDO" />: co vrátily, se znovu nakreslí, všechno, takže po ZPĚT pěti příkazů ZNOVA obnoví všech pět. Přitom vypisuje názvy příkazů a pak <Message id="everythingRedone" />, jakmile už nic obnovit nelze. Na nic se neptá a nemá žádné volby.

Funguje jen hned po vrácení. Kdekoli jinde vypíše <Message id="redoMustFollowUndo" />, a jakmile proběhne jiný příkaz, i takový, který nic nemění, jako VÝPIS nebo ZOOM, <Message id="nothingToRedo" />. Když je vracení vypnuté volbou <Keyword command="UNDO" id="Control" /> › <Keyword command="UNDO" id="None" /> příkazu ZPĚT, ZNOVA oznámí, že je vypnutý.

<Command id="MREDO" /> obnovuje krok po kroku: zeptá se na počet akcí, nebo <Keyword command="MREDO" id="All" /> či <Keyword command="MREDO" id="Last" />, a obnoví tolik kroků, které vrácení vzala, ať mezitím proběhlo cokoli z Z, ZPĚT a ZNOVA; <Keyword command="MREDO" id="Last" /> je celé poslední vrácení, jednou (<Message id="alreadyRedone" />). Ctrl+Y a položka Znovu v místní nabídce spustí NZNOVA s 1 a zruší právě běžící příkaz.

## Missing

Ctrl+Shift+Z také obnovuje, potichu, ačkoli AutoCAD na tuto zkratku nic nepřiřazuje. Tlačítka Zpět a Znovu na horní liště nic nezapisují do historie, kdežto panel nástrojů Rychlý přístup AutoCADu zapisuje vlastní řádky.

## Questions

### Jak se jmenuje příkaz ZNOVA anglicky?

REDO. Zkratku nemá: zadejte `ZNOVA`, nebo `_REDO` v AutoCADu v jakémkoli jazyce. Nejrychleji funguje Ctrl+Y, které obnoví jeden krok (NZNOVA 1).

### Proč ZNOVA nefunguje?

Příkaz ZNOVA obrací jen Z nebo ZPĚT těsně před ním. Po jakémkoli jiném příkazu není co obnovit, i když nic nezměnil: vraťte a hned obnovte.

### Jaký je rozdíl mezi příkazy ZNOVA a NZNOVA?

ZNOVA obnoví celé poslední vrácení, a jen hned po něm. <Command id="MREDO" /> obnoví zadaný počet vrácených kroků, jeden po druhém, nebo všechny, a funguje i po ZNOVA.

### Jak zopakovat poslední příkaz v AutoCADu?

Na výzvě Příkaz stiskněte Enter nebo mezerník: poslední příkaz se spustí znovu. ZNOVA příkaz neopakuje; obrací vrácení.
