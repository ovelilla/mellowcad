---
title: "Wstawianie bloku w AutoCADzie: polecenie WSTAW (INSERT)"
metaTitle: "Wstawianie bloku w AutoCADzie: WSTAW (INSERT)"
description: "Jak wstawić blok w AutoCADzie poleceniem WSTAW (INSERT, skrót W): paleta Bloki albo -WSTAW w wierszu polecenia, ze skalą, obrotem i atrybutami."
figure: "Krzesło zamienione w blok, potem wstawione dwa razy przy stole: obrócone o 180 po podaniu punktu, potem o 90 opcją Obrót przed nim."
sourceHash: "ea41fdd8000f"
---

Polecenie WSTAW (INSERT) umieszcza blok zdefiniowany w rysunku jako odnośnik: kolejną jego kopię, z własnym punktem, skalą i obrotem, rysowaną z jednej definicji, którą utworzyło polecenie <Command id="BLOCK" />. Tak jak polecenie WSTAW w AutoCADzie 2027, otwiera paletę „Bloki”, która pokazuje bloki rysunku; kliknij jeden, a wiersz polecenia zapyta o jego punkt wstawienia, z blokiem przeciąganym pod kursorem; skala i obrót pochodzą z Opcji palety, w których można też ustawić, by o nie pytano. Paleta zostaje otwarta, więc wstawianie bloku za blokiem to po jednym kliknięciu na każdy.

Polecenie <Command id="-INSERT" /> pyta o wszystko w wierszu polecenia: nazwę bloku (Enter przyjmuje proponowaną: ostatnio wstawiony blok albo, jeśli go nie ma, ostatnio zdefiniowany), punkt wstawienia, potem współczynnik skali X, współczynnik skali Y (Enter przyjmuje współczynnik X) i kąt obrotu. Ujemny współczynnik odbija blok, a nierówne go rozciągają: okrąg w nim jest rysowany jako elipsa. Blok z atrybutami pyta potem o każdą wartość jej monitem, proponując wartość domyślną. Obiekty bloku na warstwie 0 przyjmują warstwę odnośnika, pozostałe zachowują swoje. Każde wstawienie to jeden krok cofania.

## Options

### ?

Przy nazwie bloku: wyświetla listę bloków w rysunku, tak jak polecenie <Command id="BLOCK" />, i kończy polecenie.

### Scale

Przy punkcie wstawienia: pyta o jeden współczynnik dla obu osi, a potem ponownie o punkt, z blokiem przeciąganym w tej wielkości. Po podaniu punktu nie pyta już o współczynniki X i Y.

### Rotate

Przy punkcie wstawienia: pyta o kąt, wpisany lub między dwoma punktami, a potem ponownie o punkt, z blokiem przeciąganym już obróconym. Po podaniu punktu nie pyta już o obrót.

## Missing

Wstawianie innego pliku rysunku: wstawić można tylko bloki zdefiniowane w rysunku, a nazwa, której rysunek nie zawiera, jest odrzucana. Przy punkcie wstawienia opcje Punkt bazowy, X, Y, Z, Rozbij i Powtórz; przy skali X opcje Narożnik i XYZ oraz punkt wskazany jako przeciwległy narożnik. Przy nierównych współczynnikach X i Y tekst lub atrybut jest rysowany w wielkości X zamiast rozciągnięty, a łuk polilinii pozostaje łukiem; ujemny X nie pisze tekstu wspak. ATTDIA 1, czyli okno dialogowe Edycja atrybutów przy wstawianiu, i ATTREQ 0. Właściwości Opisowy, Jednostka bloku i Współczynnik jednostki w palecie „Właściwości”. JakBlok: obiekt wewnątrz bloku nie może przyjąć własnego koloru, rodzaju linii ani szerokości linii odnośnika, tak jak w AutoCADzie obiekt narysowany jako JakBlok.

## Questions

### Jak się nazywa polecenie WSTAW po angielsku i jaki ma skrót?

INSERT. W polskim AutoCADzie jego skrót to `W`: wpisz go i naciśnij Enter lub spację, a otworzy się paleta „Bloki”, tak jak w AutoCADzie 2027. `-W` to polecenie <Command id="-INSERT" />, które pyta w wierszu polecenia. Angielskie `I` w polskiej wersji nie działa; `_INSERT` działa w AutoCADzie w każdym języku.

### Jak wstawić blok z wiersza polecenia?

Wpisz `-W` i nazwę bloku, potem wskaż punkt wstawienia i odpowiedz na pytania o skalę i obrót, a Enter zachowa każdą wartość domyślną. <Keyword id="?" /> przy nazwie wyświetla listę istniejących bloków.

### Jak wstawić blok w innej skali?

Wpisz współczynnik skali X po punkcie wstawienia, a przy współczynniku Y naciśnij Enter, aby były równe; albo wybierz <Keyword id="Scale" /> przed punktem i wpisz jeden współczynnik dla obu. Ujemny współczynnik odbija blok lustrzanie. W palecie „Bloki” wpisz ją w polach X i Y w sekcji Opcje albo zaznacz Skala, by była pytana po punkcie.

### Jak wstawić blok z innego rysunku w AutoCADzie?

Nie z jego pliku: polecenie WSTAW umieszcza tylko bloki zdefiniowane w rysunku. Zamiast tego skopiuj jego odnośnik (Ctrl+C), otwórz rysunek, do którego ma trafić, i wklej go (Ctrl+V): jego blok przychodzi razem z nim, chyba że ten rysunek ma już blok o tej nazwie, którego definicja zostaje zachowana.
