---
title: "Polecenie ZAOKRĄGL (FILLET) w AutoCADzie"
description: "Jak zaokrąglić narożnik w AutoCADzie poleceniem ZAOKRĄGL (FILLET, skrót ZA): promień, dwie linie, narożniki polilinii, promień 0 i Wiele. Wypróbuj online."
figure: "Cztery linie, potem Promień 15 i Wiele: dwa narożniki zaokrąglone, dwa pozostawione ostre."
sourceHash: "f97d737f74a9"
---

Polecenie ZAOKRĄGL (FILLET) zaokrągla narożnik między dwoma obiektami łukiem o podanym promieniu, ucinając lub wydłużając każdy obiekt do niego. Pierwszy wiersz podaje tryb i bieżący promień; potem wskazujesz pierwszy i drugi obiekt, każdy po stronie, którą chcesz zachować, i polecenie się kończy. Przyjmuje linie, łuki, okręgi, elipsy, splajny i segmenty polilinii 2D. Dwie linie nie muszą się stykać: są wydłużane do łuku, jak w AutoCADzie. Przy promieniu 0, albo z wciśniętym klawiszem Shift przy drugim wskazaniu, tworzy zamiast tego ostry narożnik.

## Options

### Undo

Cofa ostatnie zaokrąglenie, opcję <Keyword id="Polyline" /> lub promień podany w tym poleceniu ZAOKRĄGL, po jednym. Gdy nie ma już czego cofnąć, mówi <Message id="commandCompletelyUndone" />

### Polyline

Pyta o polilinię 2D i zaokrągla każdy narożnik, w którym stykają się dwa jej segmenty, w jednym kroku, a potem mówi, ile zaokrągliła, a ile pominęła, bo były równoległe albo za krótkie dla promienia. Prostokąt narysowany poleceniem <Command id="RECTANG" /> jest taką polilinią.

### Radius

Pyta o promień, proponowany też przy drugim monicie. Jest to promień rysunku (FILLETRAD): następne polecenie ZAOKRĄGL zaczyna od niego i jest on zapisywany razem z rysunkiem. 0 tworzy ostre narożniki; promień ujemny jest odrzucany.

### Multiple

Po każdym zaokrągleniu znowu pyta o pierwszy obiekt, więc zaokrąglasz narożnik za narożnikiem bez ponownego uruchamiania, aż do Enter.

## Missing

<Keyword id="Trim" />: obiekty są zawsze ucinane lub wydłużane do łuku, jak przy TRIMMODE 1, domyślnym ustawieniu AutoCADa; opcja Bez ucinania nie jest dostępna. Łuk nie przejmuje skali rodzaju linii drugiego obiektu, bo tutaj żaden obiekt nie ma własnej. Przed kliknięciem etykieta narzędzia pokazuje monit, a nie powód, dla którego pary nie da się zaokrąglić, i żadna kłódka nie oznacza obiektu na zablokowanej warstwie. Kilka rzadkich par elips lub splajnów kończy się inaczej: zamknięty splajn z linią przy promieniu 0, łuk, który tylko dotyka odsunięcia elipsy, i taka para w pochylonej płaszczyźnie.

## Questions

### Jak się nazywa polecenie ZAOKRĄGL po angielsku i jaki ma skrót?

FILLET. W polskim AutoCADzie jego skrót to `ZA`: wpisz go i naciśnij Enter lub spację. Angielskie `F` w polskiej wersji nie działa; `_FILLET` działa w AutoCADzie w każdym języku.

### Jak zaokrąglić dwie linie w AutoCADzie?

Wybierz <Keyword id="Radius" />, wpisz go, a potem wskaż każdą linię po stronie, którą chcesz zachować. Linie, które się nie stykają, są wydłużane do łuku, a linie, które się przecinają, są do niego ucinane. Dwie równoległe linie łączy półokrąg, niezależnie od promienia. Linia i segment polilinii są łączone w jedną polilinię.

### Co daje promień zaokrąglenia 0?

Tworzy ostry narożnik: każda linia jest ucinana lub wydłużana, aż się spotkają, i nie powstaje żaden łuk. Aby zrobić jeden ostry narożnik bez zmiany promienia, przytrzymaj klawisz Shift przy wskazywaniu drugiego obiektu.

### Dlaczego zaokrąglanie nie działa?

Polecenie podaje przyczynę w wierszu polecenia. <Message id="filletRadiusTooLarge" /> oznacza, że łuk nie mieści się między liniami; <Message id="segmentsNotConsecutive" />, że dwa segmenty jednej polilinii są od siebie za daleko; tekst, bloki, wymiary i kreskowania są odrzucane, o obiektach na różnych wysokościach polecenie mówi, że nie są współpłaszczyznowe, a obiekt na zablokowanej warstwie nie jest przyjmowany.

### Jak zaokrąglić krawędzie bryły 3D?

Uruchom polecenie <Command id="FILLETEDGE" />: wybierz <Keyword command="FILLETEDGE" id="Radius" />, jeśli promień nie jest tym, który podaje, wskaż krawędzie bryły, a potem naciśnij Enter i jeszcze raz Enter, aby przyjąć zaokrąglenie. Działa na bryłach 3D, które są tutaj wciąż częściowe.
