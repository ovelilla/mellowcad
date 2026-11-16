---
title: "Szyk wzdłuż ścieżki w AutoCADzie: polecenie ŚCIEŻKASZYK (ARRAYPATH)"
metaTitle: "Szyk wzdłuż ścieżki w AutoCADzie: ŚCIEŻKASZYK"
description: "Jak zrobić szyk wzdłuż ścieżki w AutoCADzie poleceniem ŚCIEŻKASZYK (ARRAYPATH): krzywa ścieżki, metoda Zmierz lub Podziel, elementy i ich wyrównanie."
figure: "Mały kwadrat na początku łuku, rozłożony wzdłuż niego: Podziel, 7 elementów, każdy obrócony zgodnie z łukiem."
sourceHash: "d0d77418d682"
---

Polecenie ŚCIEŻKASZYK (ARRAYPATH) kopiuje zaznaczenie wzdłuż ścieżki: linii, łuku, okręgu lub polilinii, jako jeden obiekt szyku. Pyta o obiekty, podaje typ i to, czy szyk jest skojarzony, pyta o krzywą ścieżki i od razu pokazuje szyk: elementy w odstępach półtora raza większych od rozmiaru zaznaczenia, tyle, ile zmieści się na ścieżce, każdy obrócony tak, jak skręca ścieżka. Otwarta ścieżka biegnie od końca bliższego miejscu wskazania, okrąg przeciwnie do ruchu wskazówek zegara od swojego kąta 0. Potem jeden monit edytuje szyk na żywo, aż Enter go utworzy, opcjami lub uchwytami podglądu, jak w AutoCADzie. Zaznaczone obiekty zostają na miejscu jako jego pierwszy element.

## Options

### ASsociative

<Keyword id="Yes" />, wartość domyślna, tworzy jeden obiekt szyku, który później zmieniają jego uchwyty i paleta Właściwości; <Keyword id="No" /> tworzy oddzielne kopie obok zaznaczonych obiektów. Odpowiedź jest pamiętana do końca sesji, także przez SZYKPROST i SZYKBIEGUN.

### Method

<Keyword id="Measure" />, wartość domyślna, rozmieszcza elementy w zadanej odległości, tyle, ile się zmieści; <Keyword id="Divide" /> rozkłada podaną liczbę elementów równomiernie na całej ścieżce, po jednym na każdym końcu otwartej ścieżki.

### Items

Przy metodzie Podziel liczba elementów. Przy metodzie Zmierz odległość między nimi, a potem ich liczba, aż do największej, która się mieści i którą polecenie podaje; <Keyword id="Fill entire path" /> bierze je wszystkie.

### Align items

<Keyword id="Yes" />, wartość domyślna, obraca każdy element tak, jak ścieżka skręca od swojego początku; <Keyword id="No" /> tylko go przesuwa.

### eXit

Tworzy szyk i kończy polecenie, tak jak Enter.

## Missing

Szyk nie podąża za swoją ścieżką: gdy później edytujesz ścieżkę, szyk zachowuje tę, na której powstał. Splajny, elipsy i polilinie 3D nie mogą jeszcze być ścieżkami, podobnie jak ścieżka poza płaszczyzną układu LUW. Nie są dostępne opcje punkt Bazowy, kierunek stycznej, Wiersze, Poziomy, kierunek Z i Wyrażenie ani grupa przy monicie o ścieżkę, a uchwyty szyku nie mają menu.

## Questions

### Jak rozmieścić obiekty wzdłuż krzywej w AutoCADzie?

Wpisz `ŚCIEŻKASZYK`, zaznacz obiekty, naciśnij Enter i wskaż ścieżkę blisko końca, od którego ma się zaczynać; albo wpisz `SZ`, czyli <Command id="ARRAY" />, i po obiektach wybierz <Keyword command="ARRAY" id="PAth" />. Potem ustaw odstęp lub liczbę elementów i naciśnij Enter, aby utworzyć szyk.

### Dlaczego szyk wzdłuż ścieżki nie podąża za ścieżką?

Tu szyk zachowuje ścieżkę taką, jaka była w chwili jego utworzenia: gdy potem przesuniesz lub rozciągniesz ścieżkę, szyk zostaje bez zmian, podczas gdy skojarzony szyk wzdłuż ścieżki w AutoCADzie podążyłby za nią. Wymazanie ścieżki również pozostawia szyk. Jeśli elementy nie obracają się razem ze ścieżką, wybierz <Keyword id="Align items" /> i odpowiedz <Keyword id="Yes" />.

### Jak zmienić kierunek szyku wzdłuż ścieżki?

Wskaż ścieżkę blisko jej drugiego końca: otwarta ścieżka biegnie od końca bliższego miejscu wskazania. Okrąg zawsze biegnie przeciwnie do ruchu wskazówek zegara od swojego kąta 0.

### Jak równomiernie rozmieścić elementy na całej ścieżce?

Wybierz <Keyword id="Method" />, potem <Keyword id="Divide" />, potem <Keyword id="Items" /> i wpisz liczbę: elementy rozkładają się równomiernie, pierwszy i ostatni na końcach otwartej ścieżki.
