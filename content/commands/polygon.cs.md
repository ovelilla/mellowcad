---
title: "Mnohoúhelník v AutoCADu: příkaz POLYGON"
description: "Jak nakreslit pravidelný mnohoúhelník v AutoCADu příkazem POLYGON (zkratka POL): počet stran, střed, vepsaný nebo opsaný, nebo podle strany. Vyzkoušejte online."
figure: "Dvě kružnice o poloměru 30, šestiúhelník vepsaný do jedné a opsaný druhé a pětiúhelník sestrojený na straně."
sourceHash: "90e1cc9a53c4"
---

Příkaz POLYGON nakreslí pravidelný mnohoúhelník, se všemi stranami a úhly stejnými, jako jednu uzavřenou křivku. Zeptá se na počet stran, od 3 do 1024, pak na střed a na to, zda je mnohoúhelník vepsaný do kružnice, nebo jí opsaný, a pak na poloměr této kružnice. Nebo se sestrojí na jedné své straně volbou <Keyword id="Edge" />. Počet stran a volba vepsaný či opsaný jsou výchozími hodnotami příštího příkazu POLYGON v tomto výkresu. Poloměr zadaný číslem nakreslí spodní stranu vodorovně; poloměr zadaný bodem, ukázaným nebo napsaným, určí velikost i natočení mnohoúhelníku. Zatímco zadáváte poloměr, mnohoúhelník sleduje kurzor, s jantarovou čárkovanou čarou od středu.

## Options

### Edge

Místo středu: zadejte oba konce jedné strany a mnohoúhelník se od ní sestrojí proti směru hodinových ručiček.

### Inscribed

Vrcholy leží na kružnici: poloměr vede od středu k vrcholu. Výchozí volba.

### Circumscribed

Strany se dotýkají kružnice svými středy: poloměr vede od středu ke středu strany.

## Missing

Natočený krok: poloměr zadaný číslem vždy nakreslí spodní stranu vodorovně s USS, kdežto AutoCAD ji natočí o úhel kroku, SNAPANG.

## Questions

### Jaká je zkratka příkazu POLYGON v AutoCADu?

`POL`, stejně jako v anglickém AutoCADu, pak Enter nebo mezerník. Celý název `POLYGON` funguje také a `_POLYGON` v AutoCADu v jakémkoli jazyce.

### Jak nakreslit šestiúhelník v AutoCADu?

Spusťte příkaz POLYGON, zadejte `6` jako počet stran, určete střed, zvolte <Keyword id="Inscribed" /> nebo <Keyword id="Circumscribed" /> a zadejte poloměr. Opsaný šestiúhelník měří mezi protilehlými stranami dvojnásobek zadaného poloměru.

### Jaký je rozdíl mezi vepsaným a opsaným mnohoúhelníkem?

S volbou <Keyword id="Inscribed" /> se rohy mnohoúhelníku dotýkají kružnice, takže se do ní vejde. S volbou <Keyword id="Circumscribed" /> se kružnice dotýkají jeho strany, takže kružnice se vejde do něj. Při stejném poloměru je opsaný mnohoúhelník větší.

### Jak nakreslit mnohoúhelník se zadanou délkou strany?

Zvolte <Keyword id="Edge" /> a zadejte oba konce jedné strany: `0,0`, pak délku zadanou relativně k němu, třeba `40,0`. Ostatní strany následují proti směru hodinových ručiček.
