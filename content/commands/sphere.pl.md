---
title: "Polecenie SFERA (SPHERE) w AutoCADzie"
description: "Jak narysować kulę 3D w AutoCADzie poleceniem SFERA (SPHERE): środek i promień, Średnica, 3P, 2P i Ssr, oraz dlaczego sfera jest pokazana liniami."
figure: "Sfera o promieniu 25 narysowana od środka, widziana z południowego wschodu w stylu wizualnym Koncepcyjny."
sourceHash: "a35a57352d16"
---

Polecenie SFERA (SPHERE) rysuje bryłę 3D w kształcie kuli: podaj środek, a potem promień. Promień wskazany myszą jest odczytywany na płaszczyźnie przechodzącej przez środek, a ostatni promień jest proponowany jako wartość domyślna, którą przyjmuje Enter; dzielą go <Command id="CYLINDER" />, <Command id="CONE" /> i inne bryły podstawowe. Sfera leży na bieżącej warstwie i cofa się w jednym kroku.

W stylach Model szkieletowy 2D i Ukryty jest rysowana liniami: południkami i równoleżnikami, w liczbie określonej przez `ISOLINES`, a lokalizacja względem obiektu znajduje na niej tylko środek. <Command id="LIST" /> pokazuje jej położenie i promień, a w palecie Właściwości można wpisać promień lub średnicę. Jej uchwyty przesuwają ją, a w każdej ćwiartce równika ustalają promień. Jest bryłą 3D dla <Command id="UNION" />, <Command id="SUBTRACT" /> i reszty 3D w MellowCAD, które obejmuje tylko bryły i wciąż jest częściowe.

## Options

### 3P

Przy środku: pyta o trzy punkty, a środek sfery leży w środku okręgu przez nie przechodzącego, z jego promieniem.

### 2P

Przy środku: pyta o dwa końce średnicy, w dowolnym miejscu przestrzeni.

### Ttr

Przy środku: wskaż dwie linie, okręgi lub łuki z lokalizacją Styczny i podaj promień: środek leży na okręgu o tym promieniu stycznym do obu, na ich wysokości.

### Diameter

Przy promieniu: pyta zamiast tego o średnicę, proponując dwukrotność ostatniego promienia.

## Missing

<Command id="EXPLODE" /> sfery, którą AutoCAD zamienia w powierzchnię: MellowCAD nie ma powierzchni, więc informuje, że nie może jej rozbić. Przesuwanie, obracanie, skalowanie i odbicie lustrzane z aktywnego uchwytu oraz własne polecenia 3D (3DPRZESUŃ, 3DOBRÓĆ, 3DSKALA). Kontur, który rysuje `DISPSILH` w AutoCADzie. Style wizualne, których brakuje w <Command id="VSCURRENT" /> poza Modelem szkieletowym 2D, Ukrytym i Koncepcyjnym.

## Questions

### Jak zrobić kulę w AutoCADzie?

Uruchom SFERA, podaj środek, a potem promień: `0,0,0` i `25` rysują sferę z sesji. Obróć widok, aby zobaczyć ją przestrzennie: narożnikiem ViewCube albo poleceniem <Command id="-VIEW" /> z opcją <Keyword command="VIEW" id="SEiso" />.

### Dlaczego sfera wygląda jak okrąg z liniami?

Style Model szkieletowy 2D i Ukryty rysują sferę jako jej południki i równoleżniki; w rzucie z góry są to okrąg i linie przez niego przechodzące. <Command id="VSCURRENT" /> z opcją <Keyword command="VSCURRENT" id="Conceptual" /> cieniuje ją, a `ISOLINES` określa, ile linii pokazuje.

### Jak zrobić półkulę w AutoCADzie?

Narysuj sferę, a potem przetnij ją przez środek poleceniem <Command id="SLICE" />: trzy punkty na płaszczyźnie albo <Keyword command="SLICE" id="XY" /> i środek, a potem strona do zachowania.

### Jak narysować sferę o danej średnicy?

Przy promieniu wybierz <Keyword id="Diameter" /> i wpisz średnicę. Sferę wyznaczają też dwa końce średnicy podane w opcji <Keyword id="2P" />.
