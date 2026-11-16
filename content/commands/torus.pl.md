---
title: "Polecenie TORUS w AutoCADzie"
description: "Jak narysować torus 3D w AutoCADzie poleceniem TORUS (skrót TOR): środek, promień torusa, promień rury, Średnica, 3P, 2P i Ssr, krok po kroku."
figure: "Torus o promieniu 30 wokół rury o promieniu 8, widziany z południowego wschodu w stylu wizualnym Koncepcyjny."
sourceHash: "a19600f3e357"
---

Polecenie TORUS rysuje bryłę 3D w kształcie pierścienia, oponki: podaj środek, potem promień torusa, od środka do osi rury, a potem promień rury. Pierścień leży na płaszczyźnie XY układu LUW, na wysokości Z środka. Punkt wskazany przy monicie o promień rury jest mierzony od punktu pierścienia, tego, w którym podano promień torusa. Promień torusa to wspólna wartość domyślna brył podstawowych, a promień rury ma własną wartość domyślną, którą przyjmuje Enter. Torus powstaje na bieżącej warstwie, a cofnięcie usuwa go w jednym kroku.

Ujemny promień torusa z szerszą rurą daje bryłę w kształcie piłki do rugby, ostro zakończoną; pierścień węższy niż rura – jabłko. W stylach Model szkieletowy 2D i Ukryty jest rysowany liniami wokół rury i wokół pierścienia, w liczbie określonej przez `ISOLINES`. <Command id="LIST" /> pokazuje jego położenie, normalną, promień torusa i promień rury, a w palecie Właściwości można wpisać oba promienie. Jego uchwyty przesuwają go, ustalają promień torusa i promień rury. Jest bryłą 3D dla poleceń <Command id="UNION" />, <Command id="SUBTRACT" /> i reszty funkcji 3D w MellowCAD, które obejmują tylko bryły i wciąż są częściowe.

## Options

### 3P

Przy środku: pyta o trzy punkty, a pierścień to okrąg przez nie przechodzący, w ich płaszczyźnie.

### 2P

Przy środku: pyta o dwa końce średnicy pierścienia.

### Ttr

Przy środku: wskaż dwie linie, okręgi lub łuki z lokalizacją Styczny i podaj promień: pierścień jest styczny do obu, na ich wysokości.

### Diameter

Przy promieniu torusa: pyta zamiast tego o średnicę torusa. Przy promieniu rury: pyta o średnicę rury. Każdy z tych monitów proponuje dwukrotność odpowiedniego promienia domyślnego.

### 2Point

Przy promieniu rury: pyta o dwa punkty, a promień rury to odległość między nimi.

## Missing

<Command id="EXPLODE" /> torusa, który AutoCAD zamienia w powierzchnię: MellowCAD nie ma powierzchni, więc informuje, że nie może go rozbić. Przesuwanie, obracanie, skalowanie i odbicie lustrzane z aktywnego uchwytu oraz sylwetka, którą w AutoCADzie rysuje `DISPSILH`.

## Questions

### Jak się nazywa polecenie TORUS po angielsku?

Tak samo: TORUS, a skrót `TOR` działa w polskim AutoCADzie tak jak w angielskim. Wpisz go i naciśnij Enter lub spację, potem podaj środek, promień torusa i promień rury: `0,0,0`, `30` i `8` rysują torus z sesji. `_TORUS` działa w AutoCADzie w każdym języku.

### Czym się różni promień torusa od promienia rury?

Promień torusa biegnie od środka torusa do osi rury; promień rury to promień samej rury. Torus o średnicy zewnętrznej 76 i rurze grubości 16 ma promień 30 i promień rury 8.

### Jak narysować torus w kształcie piłki do rugby?

Podaj ujemny promień, a potem promień rury większy od jego wartości bezwzględnej: `-5` i `8` tworzą zamkniętą bryłę ostro zakończoną z obu stron. Promień rury nie większy od niej polecenie odrzuca i pyta ponownie.

### Dlaczego torus wygląda jak dwa okręgi?

Patrzysz na niego z góry, w rzucie. Obróć widok: kliknij narożnik ViewCube, użyj polecenia <Command id="-VIEW" /> z opcją <Keyword command="VIEW" id="SEiso" /> albo polecenia <Command id="3DORBIT" />. Polecenie <Command id="VSCURRENT" /> z opcją <Keyword command="VSCURRENT" id="Conceptual" /> go cieniuje.
