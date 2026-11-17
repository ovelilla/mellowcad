---
title: "Posun pohledu v AutoCADu: příkaz PP (PAN)"
description: "Jak posouvat pohled v AutoCADu příkazem PP (PAN, zkratka P): kurzor ve tvaru ruky nebo kolečko myši, -PP o dva body a PP uvnitř jiného příkazu. Vyzkoušejte."
figure: "PP tažený doprava a dolů, pak Enter: deska se v pohledu posune, její souřadnice se nezmění."
sourceHash: "0ca3050831f3"
---

Příkaz PP (PAN) posouvá pohled; nic ve výkresu se nepohne. Začne zprávou <Message id="panExit" /> a na nic dalšího se neptá: kurzor se změní v ruku a tažení levým tlačítkem posouvá pohled s ním, kolikrát chcete, dokud příkaz neukončí Enter nebo Esc. Bez příkazu PP posouvá pohled kdykoli tažení se stisknutým kolečkem myši, i uprostřed příkazu. Každé spuštění příkazu PP je krok vrácení, spojený s okolními příkazy ZOOM a PP, takže <Command id="U" /> vrátí pohled. Když příkaz zadáte s apostrofem, `'PP` nebo `'P`, funguje uvnitř jiného příkazu, který po něm pokračuje.

<Command id="-PAN" /> posouvá místo toho o dva body: základní bod a druhý bod, pohled se posune o vzdálenost mezi nimi; nebo posunutí zadané na první výzvě, třeba `50,0`, a Enter na druhé. Je také transparentní a je samostatným krokem vrácení.

## Missing

Místní nabídka, kterou AutoCAD ukáže po kliknutí pravým tlačítkem během posunu, s položkami pro ukončení, posun pohledu, zoom, 3D orbit, zoom oknem, původní zoom a zoom na rozsah.

## Questions

### Jak se jmenuje příkaz PP anglicky?

PAN. V českém AutoCADu je jeho zkratka `P`, stejná jako v anglickém AutoCADu: zadejte ji a stiskněte Enter nebo mezerník. Nebo žádný příkaz: podržte stisknuté kolečko myši a táhněte. Celý název `PP` funguje také a `_PAN` v AutoCADu v jakémkoli jazyce.

### Jak posouvat pohled myší v AutoCADu?

Podržte stisknuté kolečko myši a táhněte: pohled sleduje kurzor. Otáčením kolečka se pohled přibližuje a oddaluje kolem kurzoru. Na touchpadu spusťte příkaz PP a táhněte levým tlačítkem.

### Jak posunout pohled během kreslení?

Táhněte se stisknutým kolečkem, nebo ve výzvě příkazu zadejte `'P`: příkaz počká, než pohled posunete, a pak se znovu zeptá tam, kde byl.

### Jak posunout pohled o přesnou vzdálenost?

Použijte <Command id="-PAN" />: zadejte posunutí, třeba `100,0`, a u druhého bodu stiskněte Enter. Pohled se posune o 100 jednotek ve směru X.
