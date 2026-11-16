---
title: "Polecenie PRZEKRĘĆ (REVOLVE) w AutoCADzie"
description: "Jak utworzyć bryłę obrotową w AutoCADzie poleceniem PRZEKRĘĆ (REVOLVE, skrót PRZK): profil 2D wokół osi, oś przez obiekt lub X, Y, Z, kąt. Wypróbuj za darmo."
figure: "Profil z kołnierzami obrócony o pełny obrót wokół osi Y: szpula widziana z południowego wschodu w stylu wizualnym Ukryty."
sourceHash: "dc0576311912"
---

Polecenie PRZEKRĘĆ (REVOLVE) obraca zamknięte profile 2D wokół osi, tworząc bryły 3D: prostokąt z krawędzią na osi daje walec, okrąg obok osi – pierścień. Wybierz profile – okręgi, elipsy, zamknięte polilinie lub splajny, regiony – i naciśnij Enter; określ oś dwoma punktami albo jedną z opcji, a potem kąt; Enter oznacza pełny obrót. Każdy profil staje się bryłą na bieżącej warstwie i zostaje usunięty, jak domyślnie stanowi DELOBJ. Całe polecenie to jeden krok, który można cofnąć.

Oś leży w płaszczyźnie profilu, a cały profil po jednej jej stronie; w przeciwnym razie polecenie kończy się komunikatem <Message id="revolveOneSide" />, zanim zapyta o kąt. Kąt obraca zgodnie z regułą prawej dłoni wokół osi skierowanej od jej pierwszego punktu do drugiego; kąt ujemny obraca w drugą stronę. 3D w MellowCAD to tylko bryły i wciąż jest częściowe: profile otwarte, z których AutoCAD tworzy powierzchnie, są odrzucane.

## Options

### MOde

Pyta o <Keyword id="SOlid" /> lub <Keyword id="SUrface" />, jak <Command id="EXTRUDE" />: dopóki nie ma obiektów powierzchniowych, przyjmowana jest tylko <Keyword id="SOlid" />, wartość domyślna.

### Object

Domyślna odpowiedź na pytanie o oś, więc wybiera ją Enter: wskaż linię, polilinię, łuk lub splajn, a oś biegnie prosto między jego dwoma końcami, od końca bliższego miejscu wskazania. Obiekt zamknięty nie ma końców: <Message id="revolveClosedAxis" />, i polecenie się kończy.

### X

Oś X układu LUW, przez jego początek.

### Y

Oś Y układu LUW, przez jego początek: profil narysowany na prawo od niej, jak w sesji, zamienia się w część leżącą wzdłuż Y.

### Z

Oś Z układu LUW, przez jego początek. Profil na płaszczyźnie XY układu LUW jest do niej prostopadły, więc PRZEKRĘĆ odpowiada <Message id="revolvePerpendicular" /> i kończy działanie: Z służy profilom ustawionym pionowo.

### STart

Przy pytaniu o kąt: kąt początkowy, zawsze domyślnie 0. Profil zostaje najpierw obrócony do tego położenia, a potem pytanie o kąt pada ponownie.

### Reverse

Odwraca kierunek osi, więc kąt biegnie w drugą stronę, i ponownie pyta o kąt.

### EXpression

Kąt jako wyrażenie arytmetyczne, jak w <Command id="EXTRUDE" />.

## Missing

Oś poza płaszczyzną profilu, wokół której AutoCAD obraca profil, tworząc powierzchnie: tutaj PRZEKRĘĆ wyświetla <Message id="revolveUnable" /> i kończy działanie. Łuk eliptyczny lub krawędź bryły jako oś <Keyword id="Object" />. Tryb <Keyword id="SUrface" /> i profile otwarte, bo nie ma jeszcze obiektów powierzchniowych. Podgląd obracający się za kursorem: podczas podawania kąta widać pełny obrót. <Command id="EXPLODE" /> bryły obrotowej, którą AutoCAD rozbija na powierzchnie i regiony. Jej uchwyty i edycja kąta w palecie Właściwości.

## Questions

### Jak się nazywa polecenie PRZEKRĘĆ po angielsku?

REVOLVE. W polskim AutoCADzie wpisz `PRZEKRĘĆ` lub skrót `PRZK` i naciśnij Enter lub spację; skrót `REV` z wersji angielskiej w polskiej nie działa. Angielska nazwa z podkreśleniem, `_REVOLVE`, działa w AutoCADzie w każdym języku.

### Jak obrócić profil wokół osi w AutoCADzie?

Narysuj połowę przekroju jako jeden zamknięty obiekt obok linii osi: zamkniętą polilinię lub region. Uruchom PRZEKRĘĆ, wybierz profil i naciśnij Enter; naciśnij Enter ponownie, aby wybrać <Keyword id="Object" />, i wskaż linię osi albo podaj jej dwa końce; potem Enter dla pełnego obrotu.

### Dlaczego PRZEKRĘĆ nie działa?

Najczęściej oś przecina profil: PRZEKRĘĆ wyświetla <Message id="revolveOneSide" /> i kończy działanie. Przesuń oś do krawędzi profilu lub dalej; krawędź leżąca na osi jest dozwolona. Oś prostopadła do płaszczyzny profilu daje <Message id="revolvePerpendicular" />, a profil otwarty jest odrzucany, bo MellowCAD nie ma jeszcze powierzchni.

### Jak obrócić profil tylko o część obrotu?

Wpisz kąt, 90 lub 270, przy pytaniu o kąt. <Keyword id="STart" /> zaczyna obrót dalej, a <Keyword id="Reverse" /> obraca w drugą stronę.
