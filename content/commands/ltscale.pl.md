---
title: "Skala rodzaju linii w AutoCADzie: polecenie RLSKALA (LTSCALE)"
metaTitle: "Skala rodzaju linii w AutoCADzie: RLSKALA"
description: "Jak zmienić skalę rodzaju linii w AutoCADzie poleceniem RLSKALA (LTSCALE, skrót RLS) dla całego rysunku, by linia kreskowa pokazywała kreski w każdej skali."
before: "Płytka długości 4 metrów, jej otwór narysowany rodzajem HIDDEN, a osie rodzajem CENTER, przy domyślnej skali rodzaju linii 1: kreski są zbyt drobne, by je zobaczyć."
figure: "Ta sama płytka po RLSKALA 20: kreski otworu i osi narysowane 20 razy dłuższe."
sourceHash: "33b956c956fa"
---

Polecenie RLSKALA (LTSCALE) ustala globalny współczynnik skali rodzaju linii: jak długie są kreski i przerwy każdego nieciągłego rodzaju linii w rysunku. Pyta o nowy współczynnik, proponując bieżący, w nowym rysunku `1.0000`: 2 wydłuża dwukrotnie każdą kreskę, 0,5 skraca ją o połowę. Współczynnik musi być większy od 0, inaczej polecenie wyświetla <Message id="positiveNonzero" /> i pyta ponownie, a `1/2` i `1e3` są czytane jako liczby. Zmiana przerysowuje cały rysunek, z komunikatem `Ponowne generowanie modelu.`, jak w AutoCADzie 2027, i zapisuje się razem z rysunkiem; to krok, który cofa <Command id="U" />. Wpisane z apostrofem wewnątrz polecenia, `'RLSKALA`, przerysowuje rysunek po zakończeniu tamtego polecenia.

Rodzaje linii to wzory przygotowane dla rysunku w rozmiarze arkusza: w rysunku szerokim na 4 metry, w milimetrach, wzór CENTER o długości około 51 jednostek powtarza się na nim jakieś 80 razy, zbyt drobno, by go zobaczyć, a linia krótsza niż jeden wzór jest rysowana jako ciągła. Właściwa skala to zwykle skala samego rysunku: 20 dla rysunku czytanego w skali 1:20, 50 dla 1:50.

## Missing

Menedżer rodzajów linii, w którym Globalny współczynnik skali to RLSKALA, a Bieżąca skala obiektu to CELTSCALE. PSLTSCALE i MSLTSCALE, bo nie ma obszaru papieru. Kształty złożonych rodzajów linii, takich jak BATTING, rysowane jako ich przerwy.

## Questions

### Jak się nazywa polecenie RLSKALA po angielsku?

LTSCALE. W polskim AutoCADzie jego skrót to `RLS`: wpisz go i naciśnij Enter lub spację. Angielskie `LTS` w polskiej wersji nie działa; pełna nazwa `RLSKALA` działa, a `_LTSCALE` – w AutoCADzie w każdym języku.

### Dlaczego linia kreskowa wygląda na ciągłą?

Jej wzór nie pasuje do rysunku przy bieżącej skali. Linia krótsza niż jedno powtórzenie wzoru jest rysowana jako ciągła; długa linia przy małej skali układa kreski tak gęsto, że wygląda na ciągłą. Zwiększ RLSKALA dla dużego rysunku, zmniejsz dla małego, aż kreski staną się widoczne.

### Jaką wartość RLSKALA ustawić?

Skalę rysunku: w rysunku w milimetrach czytanym w skali 1:50 – `50`. Dla rysunku w rozmiarze arkusza – 1.

### Czym się różni RLSKALA od samego rodzaju linii?

Rodzaj linii, ustawiany poleceniem <Command id="LINETYPE" /> lub przez warstwę, to wzór: kreski, kropki i przerwy. RLSKALA mówi, jak długi jest rysowany ten wzór – jeden współczynnik dla każdego obiektu w rysunku.
