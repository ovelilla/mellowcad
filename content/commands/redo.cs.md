---
title: "Příkaz ZNOVA (REDO) v AutoCADu: obnovení vrácených změn"
metaTitle: "Příkaz ZNOVA (REDO) v AutoCADu"
description: "Jak funguje příkaz ZNOVA (REDO) v AutoCADu: obnoví to, co vrátil poslední Z nebo ZPĚT, hned po něm; NZNOVA a Ctrl+Y obnovují krok po kroku. Vyzkoušejte online."
figure: "Otvor nakreslený v desce, vrácený příkazem Z a obnovený příkazem ZNOVA."
sourceHash: "d88f63f885fd"
---

Příkaz ZNOVA (REDO) obrátí poslední <Command id="U" /> nebo <Command id="UNDO" />: co vrátil, se znovu nakreslí, všechno, takže po vrácení pěti příkazů příkazem ZPĚT příkaz ZNOVA obnoví všech pět. Přitom vypisuje názvy příkazů a pak <Message id="everythingRedone" />, jakmile už nic obnovit nelze. Na nic se neptá a nemá žádné možnosti.

Funguje jen hned po vrácení. Kdekoli jinde vypíše <Message id="redoMustFollowUndo" />, a jakmile proběhne jiný příkaz, i takový, který nic nemění, jako VÝPIS nebo ZOOM, <Message id="nothingToRedo" />. Když je vracení vypnuté možností <Keyword command="UNDO" id="Control" /> › <Keyword command="UNDO" id="None" /> příkazu ZPĚT, ZNOVA oznámí, že je vyřazen.

<Command id="MREDO" /> obnovuje krok po kroku: zeptá se na počet akcí, nebo <Keyword command="MREDO" id="All" /> či <Keyword command="MREDO" id="Last" />, a obnoví tolik kroků, které vrácení vzala, ať mezitím proběhly jakékoli příkazy Z, ZPĚT a ZNOVA; <Keyword command="MREDO" id="Last" /> je celé poslední vrácení, jednou (<Message id="alreadyRedone" />). Ctrl+Y a položka Znovu v místní nabídce spustí příkaz NZNOVA s hodnotou 1 a zruší právě běžící příkaz.

## Missing

Ctrl+Shift+Z také obnovuje, potichu, ačkoli AutoCAD této zkratce nic nepřiřazuje. Tlačítka Zpět a Znovu na panelu nástrojů Rychlý přístup nic nezapisují do historie, kdežto tlačítka AutoCADu zapisují vlastní řádky.

## Questions

### Jak se jmenuje příkaz ZNOVA anglicky?

REDO. Zkratku nemá: zadejte `ZNOVA`, nebo `_REDO` v AutoCADu v jakémkoli jazyce. Nejrychleji funguje Ctrl+Y, které obnoví jeden krok (NZNOVA 1).

### Proč příkaz ZNOVA nefunguje?

Příkaz ZNOVA obrací jen Z nebo ZPĚT těsně před ním. Po jakémkoli jiném příkazu není co obnovit, i když nic nezměnil: vraťte a hned obnovte.

### Jaký je rozdíl mezi příkazy ZNOVA a NZNOVA?

Příkaz ZNOVA obnoví celé poslední vrácení, a jen hned po něm. <Command id="MREDO" /> obnoví zadaný počet vrácených kroků, jeden po druhém, nebo všechny, a funguje i po příkazu ZNOVA.

### Jak zopakovat poslední příkaz v AutoCADu?

Ve výzvě Příkaz stiskněte Enter nebo mezerník: poslední příkaz se spustí znovu. Příkaz ZNOVA neopakuje jiné příkazy; obrací vrácení.
