---
title: "Prostokąt w AutoCADzie: polecenie PROSTOK (RECTANG)"
metaTitle: "Prostokąt w AutoCADzie: PROSTOK (RECTANG)"
description: "Jak narysować prostokąt w AutoCADzie poleceniem PROSTOK (RECTANG, skrót PRO): dwa narożniki, wymiary, pole i obrót, z zaokrąglonymi lub fazowanymi narożnikami."
figure: "Dwa prostokąty z dwóch narożników, drugi wpisany względem pierwszego: jeden z zaokrągleniem 8, następny z fazą 8."
sourceHash: "a5d4e90c06aa"
---

Polecenie PROSTOK (RECTANG) rysuje prostokąt z dwóch przeciwległych narożników, wskazanych lub wpisanych: `0,0`, a potem `100,50`, liczone względem pierwszego przy wprowadzaniu dynamicznym, daje prostokąt 100 na 50. To jedna zamknięta polilinia o czterech wierzchołkach, utworzona na bieżącej warstwie. Opcje pierwszego monitu ustalają, jak rysowane są następne prostokąty, a każda zachowuje swoją wartość do końca sesji: następne polecenie PROSTOK podaje w pierwszym wierszu te, które obowiązują. Jego opcja szerokości nadaje każdemu bokowi szerokość polilinii. Gdy umieszczasz drugi narożnik, prostokąt podąża za kursorem; przy włączonym wprowadzaniu dynamicznym możesz wpisać jego długość, Tab i szerokość.

## Options

### Chamfer

Pyta o pierwszą i drugą odległość fazowania i ścina nimi każdy narożnik: osiem wierzchołków. Odległość 0 wyłącza fazowanie. Zastępuje zaokrąglenie.

### Elevation

Pyta o wysokość, na której rysowany jest prostokąt, czyli jego Z.

### Fillet

Pyta o promień i zaokrągla nim każdy narożnik. Promień 0 wyłącza zaokrąglenie. Zastępuje fazowanie.

### Thickness

Pyta o grubość: w widoku 3D prostokąt wznosi się na tę wysokość, jak ściana.

### Area

Przy drugim narożniku: pyta o pole, potem, czy podać <Keyword id="Length" />, czy <Keyword id="Width" />, a potem o długość tego boku. Drugi bok zostaje obliczony, z uwzględnieniem narożników, a prostokąt powstaje od razu.

### Dimensions

Przy drugim narożniku: pyta o długość i szerokość, a potem o punkt, który ustala, w którą stronę od pierwszego narożnika leży prostokąt.

### Rotation

Przy drugim narożniku: pyta o kąt obrotu prostokąta, wpisany lub jako punkt od pierwszego narożnika, albo o dwa punkty opcją <Keyword id="Pick" />. Kąt zostaje zachowany do końca sesji.

## Missing

Długość lub szerokość 0 przy <Keyword id="Area" />, która tutaj nic nie rysuje, a w AutoCADzie rysuje zdegenerowaną polilinię. Po odrzuconej odpowiedzi przy monicie <Keyword id="Rotation" /> MellowCAD zadaje monit ponownie w całości, podczas gdy AutoCAD niczego więcej nie wypisuje.

## Questions

### Jak się nazywa polecenie PROSTOK po angielsku?

RECTANG. W polskim AutoCADzie wpisz `PROSTOK`, jego skrót `PRO` albo `PROSTOKĄT`, potem Enter lub spację. Angielskie `REC` i `RECTANGLE` w polskiej wersji nie działają; `_RECTANG` działa w AutoCADzie w każdym języku.

### Jak narysować prostokąt o dokładnych wymiarach?

Podaj pierwszy narożnik, a drugi wpisz względem niego: `100,50` przy włączonym wprowadzaniu dynamicznym (tak jest domyślnie) albo `@100,50` przy wyłączonym daje prostokąt o długości 100 i szerokości 50. Albo wybierz <Keyword id="Dimensions" /> i wpisz oba boki.

### Jak narysować prostokąt z zaokrąglonymi narożnikami?

Przy pierwszym monicie wybierz <Keyword id="Fillet" /> i wpisz promień, potem podaj dwa narożniki.

### Dlaczego mój prostokąt ma zaokrąglone lub ścięte narożniki?

Polecenie PROSTOK zachowuje zaokrąglenie i fazowanie do końca sesji, więc kolejne prostokąty też je mają: mówi o tym jego pierwszy wiersz. Wybierz <Keyword id="Fillet" /> i wpisz `0`, aby znów rysować zwykłe narożniki.

### Czy prostokąt w AutoCADzie to polilinia?

Tak: jedna zamknięta polilinia. <Command id="EXPLODE" /> rozbija go na cztery linie, a <Command id="OFFSET" /> odsuwa go w całości.
