---
title: "Zmiana właściwości w AutoCADzie: polecenie ZMCECHY (CHPROP)"
metaTitle: "Zmiana właściwości w AutoCADzie: ZMCECHY"
description: "Jak zmienić właściwości obiektów w AutoCADzie poleceniem ZMCECHY (CHPROP): kolor, warstwa, rodzaj linii i jego skala, szerokość linii lub grubość z klawiatury."
figure: "ZMCECHY na linii przechodzącej przez otwór płyty: kolor 1 i rodzaj linii CENTER, oś, na tej samej warstwie, na której była."
sourceHash: "1cba888e4b31"
---

Polecenie ZMCECHY (CHPROP) zmienia właściwości wybranych obiektów w wierszu polecenia: wiersze sekcji Ogólne palety Właściwości, zadawane jako monity. Wybierz obiekty, także przed poleceniem, a potem wybierz właściwość do zmiany; po każdej pyta o kolejną, aż Enter zakończy polecenie. Monit każdej właściwości proponuje jako domyślną wartość zestawu, <Message id="varies" /> tam, gdzie obiekty się różnią, a Enter w tym miejscu zostawia każdemu obiektowi jego własną. To, co ustawisz, zostaje zastosowane po zakończeniu polecenia, więc Esc zostawia każdy obiekt bez zmian. Obiekty na zablokowanej warstwie są liczone i pomijane, każdy z komunikatem <Message id="objectOnLockedLayer" />. Całe wywołanie to jeden krok, który cofa <Command id="U" />.

## Options

### Color

Numer koloru od 1 do 255, nazwa taka jak `czerwony`, `JAKWARSTWA` albo <Keyword id="Truecolor" /> i jego `czerwony,zielony,niebieski`, tak jak przyjmuje je <Command id="COLOR" />; to, co odrzuca KOLOR, zostaje odrzucone także tu i pytanie się powtarza.

### LAyer

Nazwa warstwy, w dowolnej wielkości liter. Nazwa, która nie może być nazwą warstwy, daje komunikat <Message id="invalidLayerName" />, a nazwa, której nie ma w rysunku, komunikat, że nie można jej znaleźć; w obu przypadkach pytanie się powtarza. ZMCECHY nie tworzy warstw.

### LType

Nazwa rodzaju linii, w dowolnej wielkości liter, albo `JakWarstwa`. Rodzaj, którego rysunek nie wczytał, jest wczytywany z acad.lin, pliku AutoCADa w calach, tak jak robi to AutoCAD nawet w rysunku metrycznym; nazwa, której brakuje także w tym pliku, daje komunikat, że jej nie znaleziono, i polecenie wraca do monitu o właściwość.

### ltScale

Własna skala rodzaju linii obiektów, która mnoży skalę polecenia <Command id="LTSCALE" /> tylko dla nich: odległość wpisana lub zmierzona dwoma punktami; ujemna jest brana jako jej wartość bezwzględna, a 0 daje komunikat <Message id="valueMustBeNonzero" /> i pytanie się powtarza.

### LWeight

Szerokość linii w milimetrach, zaokrąglona do najbliższej standardowej, tak jak zaokrągla ją <Command id="LWEIGHT" />, albo `JakWarstwa`; `?` wypisuje ich listę.

### Thickness

Odległość wpisana lub zmierzona dwoma punktami, także ujemna i zerowa. Jest ustawiana liniom, okręgom, łukom i poliliniom w zestawie, wzdłuż normalnej każdego z nich; dla każdego innego typu polecenie podaje na końcu, że nie może zmienić jego grubości.

## Missing

PRZezroczystość, Materiał i Opisowy, których obiekty tu nie mają, więc monit ich nie wymienia. JakBlok przy opcjach Kolor, rodzajLinii i Szerlinii oraz wartość Domyślna szerokości linii. Palety kolorów. Grubość tekstu i definicji atrybutu, pozostawiana bez zmian. ZMIEŃ, którego opcja Właściwości zadaje ten sam monit z opcją POziom.

## Questions

### Jak się nazywa polecenie ZMCECHY po angielsku i czy ma skrót?

Po angielsku CHPROP, w polskim AutoCADzie ZMCECHY. Nie ma skrótu: wpisz `ZMCECHY` albo `_CHPROP`, które działa w AutoCADzie w każdym języku. Enter przy monicie Polecenie je powtarza.

### Czym się różni ZMCECHY od WŁAŚCIWOŚCI?

Oba polecenia zmieniają te same właściwości. <Command id="PROPERTIES" /> pokazuje je w palecie, razem z geometrią każdego obiektu; ZMCECHY pyta o nie w wierszu polecenia, dzięki czemu ręce zostają na klawiaturze.

### Jak zmienić kolor obiektów z wiersza polecenia?

Wpisz `ZMCECHY`, wybierz obiekty, naciśnij Enter, wybierz <Keyword id="Color" /> i wpisz kolor, na przykład `1` dla czerwonego. Ponownie naciśnij Enter, aby zakończyć.

### Jak przenieść kilka obiektów na inną warstwę?

Uruchom ZMCECHY, wybierz obiekty, wybierz <Keyword id="LAyer" /> i wpisz nazwę warstwy. Warstwa musi istnieć: najpierw utwórz ją w poleceniu <Command id="LAYER" />.
