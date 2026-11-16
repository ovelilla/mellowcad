---
title: "Polecenie WYCIĄGNIJ (EXTRUDE) w AutoCADzie"
description: "Jak wyciągnąć kontur 2D w bryłę 3D w AutoCADzie poleceniem WYCIĄGNIJ (EXTRUDE, skrót WYC): wysokość, kierunek, kąt zwężania. Wypróbuj za darmo online."
figure: "Zamknięta polilinia w kształcie litery L wyciągnięta o 20 w bryłę, potem widziana z południowego wschodu w stylu wizualnym Ukryty."
sourceHash: "53bfe3dd1e9c"
---

Polecenie WYCIĄGNIJ (EXTRUDE) zamienia zamknięte profile 2D w bryły 3D, każdy wyciągnięty prosto ze swojej płaszczyzny na podaną wysokość. Wybierz profile – okręgi, elipsy, zamknięte polilinie lub splajny, regiony – i naciśnij Enter, a potem wpisz wysokość albo pokaż ją punktem; ostatnia wysokość jest domyślną przy następnym uruchomieniu. Każdy profil staje się osobną bryłą, na bieżącej warstwie, i jest wymazywany, jak domyślnie stanowi DELOBJ. Całe polecenie to jeden krok cofania.

3D w MellowCAD to tylko bryły 3D, na razie częściowo: profil otwarty, z którego AutoCAD robi powierzchnię, dostaje <Message id="sweepRefusedType" /> i jest usuwany z wyboru.

## Options

### MOde

Pyta o <Keyword id="SOlid" /> lub <Keyword id="SUrface" />. <Keyword id="SOlid" /> jest domyślna i jako jedyna istnieje: bez obiektów powierzchni <Keyword id="SUrface" /> jest odrzucana.

### Direction

Zamiast wysokości dwa punkty podają kierunek i długość: profile są wyciągane wzdłuż tej linii, ukośnie, jeśli jest ukośna. Kierunek leżący w płaszczyźnie profilu dostaje <Message id="directionParallel" /> i polecenie się kończy.

### Path

Jest na liście, jak w AutoCADzie, ale nie działa: jej wybór jest odrzucany, a pytanie o wysokość pada ponownie.

### Taper

Pyta o kąt od −90 do 90 stopni, a potem znowu o wysokość: kąt dodatni zwęża bryłę w miarę wznoszenia, ujemny ją poszerza. Okrąg, który zamyka się przed osiągnięciem wysokości, kończy się w punkcie, jako stożek; profil, którego nie da się tak zwęzić, nic nie tworzy.

### Expression

Wysokość jako wyrażenie: `2*3` to 6. Na razie tylko arytmetyka.

## Missing

Ścieżka, czyli przeciągnięcie wzdłuż ścieżki. Tryb powierzchni i profile otwarte, z których AutoCAD robi powierzchnie: obiektów powierzchni jeszcze nie ma. Ściany brył i obszary, które kliknięcie znajduje wewnątrz obiektów, przyjmowane przez polecenie <Command id="PRESSPULL" />. Zwężanie na elipsie, splajnie albo łuku, który spotyka następny segment w narożniku. Parametry i funkcje opcji Wyrażenie. Polecenie <Command id="EXPLODE" /> wyciągniętej bryły o zakrzywionych bokach, którą AutoCAD zamienia w powierzchnie i regiony. Jej uchwyty oraz wysokość i kąt zwężania edytowane w palecie „Właściwości”.

## Questions

### Jak się nazywa polecenie WYCIĄGNIJ po angielsku i jaki ma skrót?

EXTRUDE. W polskim AutoCADzie jego skrót to `WYC`: wpisz go i naciśnij Enter lub spację. Angielskie `EXT` w polskiej wersji nie działa; `_EXTRUDE` działa w AutoCADzie w każdym języku.

### Jak zrobić 3D z rysunku 2D?

Narysuj obrys jako jeden zamknięty obiekt – zamkniętą polilinię, okrąg lub region – uruchom polecenie WYCIĄGNIJ, wybierz go, naciśnij Enter i wpisz wysokość. Z góry bryła wygląda jak jej obrys: obróć widok narzędziem ViewCube albo poleceniem <Command id="-VIEW" /> i opcją <Keyword command="VIEW" id="SEiso" />, aby zobaczyć ją w 3D.

### Dlaczego polecenie WYCIĄGNIJ nie tworzy bryły?

Profil jest otwarty albo sam się przecina. Linia, łuk lub otwarta polilinia tworzą w AutoCADzie powierzchnię, a MellowCAD jeszcze ich nie ma: polecenie WYCIĄGNIJ mówi <Message id="sweepRefusedType" /> i usuwa je z wyboru; profil, który sam się przecina, dostaje <Message id="sweepSelfIntersecting" /> i też jest usuwany. Połącz kawałki poleceniem <Command id="JOIN" />, zrób z nich region poleceniem <Command id="REGION" /> albo kliknij wewnątrz nich poleceniem <Command id="PRESSPULL" />.

### Jak wyciągnąć kształt z otworem?

Zrób z niego jeden region: polecenie <Command id="REGION" /> na obrysie i otworze, potem polecenie <Command id="SUBTRACT" />, aby odjąć region otworu od regionu obrysu. Wyciągnij ten region, a otwór przejdzie przez bryłę. Albo uruchom polecenie <Command id="PRESSPULL" /> i kliknij między obrysem a otworem.

### Jak wyciągnąć wzdłuż ścieżki?

Na razie się nie da: opcja <Keyword id="Path" /> jest na liście, ale jest odrzucana, a polecenia SKOS nie ma. Opcja <Keyword id="Direction" /> wyciąga wzdłuż prostej między dwoma punktami.
