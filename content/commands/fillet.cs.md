---
title: "Příkaz ZAOBLI (FILLET) v AutoCADu"
description: "Jak v AutoCADu zaoblit roh příkazem ZAOBLI (FILLET, zkratka ZA): poloměr, dvě úsečky, rohy křivky, poloměr 0 a NKrát. Vyzkoušejte zdarma online."
figure: "Čtyři úsečky, pak Poloměr 15 a NKrát: dva rohy zaoblené, dva ponechané ostré."
sourceHash: "f97d737f74a9"
---

Příkaz ZAOBLI (FILLET) zaoblí roh mezi dvěma objekty obloukem zadaného poloměru a každý objekt k němu ořízne nebo prodlouží. Jeho první řádek uvádí režim a aktuální poloměr; pak vyberete první a druhý objekt, každý na straně, kterou chcete zachovat, a příkaz skončí. Přijímá úsečky, oblouky, kružnice, elipsy, spline a segmenty 2D křivky. Dvě úsečky se nemusí dotýkat: prodlouží se k oblouku, jako v AutoCADu. S poloměrem 0, nebo s podrženou klávesou Shift u druhého výběru, místo toho vytvoří ostrý roh.

## Options

### Undo

Vrátí poslední zaoblení, možnost <Keyword id="Polyline" /> nebo poloměr zadaný v tomto příkazu ZAOBLI, jedno po druhém. Když už není co vracet, odpoví <Message id="commandCompletelyUndone" />

### Polyline

Zeptá se na 2D křivku a zaoblí každý roh, kde se stýkají dva její segmenty, v jednom kroku, a pak vypíše, kolik jich zaoblila a kolik vynechala, protože byly rovnoběžné nebo pro poloměr příliš krátké. Obdélník nakreslený příkazem <Command id="RECTANG" /> je taková křivka.

### Radius

Zeptá se na poloměr, nabízený i u druhé výzvy. Je to poloměr výkresu (FILLETRAD): další příkaz ZAOBLI s ním začne a ukládá se s výkresem. 0 vytváří ostré rohy; záporný poloměr se odmítne.

### Multiple

Po každém zaoblení se znovu zeptá na první objekt, takže zaoblujete roh za rohem bez nového spuštění, až do Enter.

## Missing

<Keyword id="Trim" />: objekty se k oblouku vždy oříznou nebo prodlouží, jako při TRIMMODE 1, výchozím nastavení AutoCADu; možnost Neořezávat není k dispozici. Oblouk nepřebírá měřítko typu čáry druhého objektu, protože zde žádný objekt nemá vlastní. Před kliknutím ukazuje popisek výzvu, ne důvod, proč dvojici nelze zaoblit, a žádný zámek neoznačí objekt v zamknuté hladině. Několik vzácných dvojic elips nebo spline skončí jinak: uzavřený spline s úsečkou při poloměru 0, oblouk, který se jen dotkne ekvidistanty elipsy, a taková dvojice v nakloněné rovině.

## Questions

### Jak se jmenuje příkaz ZAOBLI anglicky a jakou má zkratku?

FILLET. V české verzi AutoCADu je jeho zkratka `ZA`: zadejte ji a stiskněte Enter nebo mezerník. Anglická zkratka `F` v české verzi nefunguje; `_FILLET` funguje v AutoCADu v každém jazyce.

### Jak v AutoCADu zaoblit dvě úsečky?

Zvolte <Keyword id="Radius" />, zadejte ho a pak vyberte každou úsečku na straně, kterou chcete zachovat. Úsečky, které se nedotýkají, se k oblouku prodlouží, a úsečky, které se kříží, se k němu oříznou. Dvě rovnoběžné úsečky spojí půlkruh, ať je poloměr jakýkoli. Úsečka a segment křivky se spojí do jedné křivky.

### Co udělá poloměr zaoblení 0?

Vytvoří ostrý roh: každá úsečka se ořízne nebo prodlouží, až se setkají, a žádný oblouk se nenakreslí. Chcete-li vytvořit jeden ostrý roh bez změny poloměru, podržte při výběru druhého objektu klávesu Shift.

### Proč zaoblení nefunguje?

Příkaz to řekne na příkazovém řádku. <Message id="filletRadiusTooLarge" /> znamená, že se oblouk mezi úsečky nevejde; <Message id="segmentsNotConsecutive" />, že jsou dva segmenty jedné křivky od sebe příliš daleko; text, bloky, kóty a šrafy se odmítnou, o objektech v různých výškách příkaz řekne, že nejsou koplanární, a objekt v zamknuté hladině se nepřijme.

### Jak zaoblit hrany 3D tělesa?

Spusťte příkaz <Command id="FILLETEDGE" />: zvolte <Keyword command="FILLETEDGE" id="Radius" />, pokud poloměr není ten, který uvádí, vyberte hrany tělesa, pak stiskněte Enter a dalším Enter zaoblení potvrďte. Funguje na 3D tělesech, která jsou zde zatím částečná.
