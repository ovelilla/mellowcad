---
title: "AutoCAD FKRIKON (UCSICON) parancs"
description: "Így jeleníti meg vagy rejti el az AutoCAD FKRIKON (UCSICON) parancsa az FKR ikont, és teszi az origóba vagy a sarokba: Be, Ki, Nincs, Origó. Próbálja ki ingyen."
figure: "Az FKRIKON Nincs opciója a sarokba küldi az ikont; az FKR a blokk lépcsőjére helyezi az origót, és az Origó opció oda rajzolja az ikont, X tengelye piros, Y zöld, Z kék."
sourceHash: "c431e70eda01"
---

Az FKRIKON (UCSICON) parancs megjeleníti vagy elrejti az FKR ikont, azt az X és Y szárat, amely megmutatja, hol van az aktuális FKR, és merre néz, és beállítja, hol álljon: az FKR origójában vagy a rajz bal alsó sarkában. Egyetlen promptja alapértelmezésként az aktuális állapotot kínálja fel, így az Enter megtartja. A beállítás a rajzzal együtt mentődik, és minden FKRIKON parancs egy visszavonási lépés.

Az ikon az AutoCAD 2027 3D ikonja: egy szár az X, egy az Y tengelynek, mindegyik végén egy betű, és az origóban egy négyzet, amíg az FKR a világé. Felülnézeten kívül egy Z szár mutatja, merre néz az FKR Z tengelye, a pontosan szemből látott szár pedig elmarad. 2D drótváz látványstílusban fehér; Takartvonalas és Látványtervi látványstílusban az X piros, az Y zöld, a Z kék. Aposztróffal begépelve (`'FKRIKON`) ehelyett az UCSICON változót állítja be, akár egy másik parancson belül is: 0-tól 3-ig, ahol az 1 megjeleníti az ikont, a 2 pedig az origóba teszi.

## Options

### ON

Megjeleníti az ikont.

### OFF

Elrejti az ikont. Az FKR ettől még megvan, és amit rajzol, az továbbra is benne fekszik.

### Noorigin

Az ikont a rajz bal alsó sarkában tartja, bárhol legyen is az origó.

### ORigin

Az ikont az FKR origójába rajzolja, ez az alapérték. Ha az origó a képernyőn kívül esik, vagy olyan közel van a széléhez, hogy az ikon nem férne el, az ikon a bal alsó sarokba kerül, amíg az origó vissza nem kerül a látótérbe.

## Missing

A Mind opció, amely az AutoCAD-ben minden nézetablakra alkalmazza a beállítást (itt csak egy van); a Választható opció, vagyis az ikon fogói; és a Tulajdonságok opció, az FKR ikon párbeszédpanel a 2D stílussal, a mérettel, a vonalvastagsággal és a színekkel.

## Questions

### Hogyan lehet kikapcsolni az FKR ikont az AutoCAD-ben?

Írja be az `FKRIKON` nevet, nyomja meg az Enter billentyűt, majd válassza a <Keyword id="OFF" /> opciót. A <Keyword id="ON" /> opció visszahozza.

### Hogyan lehet az FKR ikont az origóba helyezni?

FKRIKON, majd <Keyword id="ORigin" />: az ikon az FKR origójába kerül. Ha a sarokban marad, az origó a képernyőn kívül vagy túl közel van a széléhez: toljon vagy kicsinyítsen a nézeten. A <Keyword id="Noorigin" /> opció a sarokban tartja.

### Mit jelent a négyzet az FKR ikonon?

Azt, hogy az FKR a világ koordináta-rendszer. Mozgassa vagy forgassa el az FKR-t az <Command id="UCS" /> paranccsal, és a négyzet eltűnik; az <Command id="UCS" /> parancs és az Enter visszaállítja a világot, és vele a négyzetet is.

### Hogyan lehet megváltoztatni az FKR ikon stílusát, méretét vagy színét?

Az AutoCAD-ben az FKRIKON parancs Tulajdonságok opciójával, az FKR ikon párbeszédpanelen. A MellowCAD-ben ez még nincs meg: az ikon úgy jelenik meg, ahogy az AutoCAD 2027 alapértelmezés szerint rajzolja, 3D stílusban.
