---
title: "Polecenie USUŃ (PURGE) w AutoCADzie"
description: "Jak usunąć nieużywane bloki i rodzaje linii w AutoCADzie poleceniem USUŃ (PURGE, skrót US): według nazwy lub wszystkie naraz, z potwierdzeniem lub bez."
figure: "Dwa bloki, TAG wstawiony na ścianie i BOX, którego jedyny odnośnik wymazano: USUŃ, wszystkie nazwy, bez potwierdzania, usuwa tylko BOX."
sourceHash: "7a22ff19d409"
---

Polecenie USUŃ (PURGE) usuwa to, co rysunek definiuje, ale czego nie używa; tutaj są to bloki i rodzaje linii. W AutoCADzie polecenie USUŃ otwiera okno dialogowe Usuń; MellowCAD go nie ma, więc polecenie USUŃ pyta w wierszu polecenia o to, o co pyta <Command id="-PURGE" />, tak jak robi to konsola AutoCADa. Podaje ustawienia Elementy zagnieżdżone i Osierocone dane, oba wyłączone, i pyta, jaki typ nieużywanych obiektów usunąć, proponując <Keyword id="Blocks" /> i <Keyword id="LTypes" />; Enter w tym miejscu kończy polecenie.

Blok jest w użyciu, dopóki umieszcza go odnośnik w rysunku albo zawiera go definicja używanego bloku, na dowolnej głębokości. Wymazanie ostatniego odnośnika bloku zostawia jego definicję w rysunku, skąd <Command id="INSERT" /> może go wstawić ponownie: to polecenie USUŃ ją kasuje. Blok zawarty w zachowanym bloku nigdy nie jest usuwany, a łańcuch bloków, które zawierają tylko siebie nawzajem, znika w jednym uruchomieniu. Gdy nie ma czego usunąć, polecenie wyświetla <Message id="noUnreferencedBlocks" />. Każde uruchomienie to jeden krok, który cofa <Command id="U" />.

## Options

### Blocks

Pyta o nazwy do usunięcia, domyślnie `*` dla każdego nieużywanego bloku, albo o nazwy z symbolami wieloznacznymi, oddzielone przecinkami. Potem pyta, czy potwierdzać każdą nazwę: <Keyword id="Yes" />, odpowiedź domyślna, pyta o każdy blok przed jego usunięciem, a <Keyword id="No" /> usuwa wszystkie i podaje każdą nazwę oraz ich liczbę.

### LTypes

Pyta o nazwy i o potwierdzanie każdej, tak jak <Keyword id="Blocks" />, i usuwa rodzaje linii, których nic nie używa. Continuous, bieżący rodzaj linii i rodzaj używany przez warstwę lub obiekt, także wewnątrz bloku, zawsze zostają; gdy nie ma czego usunąć, polecenie wyświetla <Message id="noUnreferencedLinetypes" />. Opcja <Keyword command="LINETYPE" id="Load" /> polecenia <Command id="LINETYPE" /> przywraca usunięty rodzaj.

## Missing

Okno dialogowe Usuń i każdy inny typ: warstwy, style tekstu i wymiarowania, grupy, materiały, style wielolinii odniesienia, tabel i style wizualne, zarejestrowane aplikacje, geometria o zerowej długości, puste obiekty tekstowe, osierocone dane oraz Wszystko. Ustawień Elementy zagnieżdżone i Osierocone dane nie można zmienić.

## Questions

### Jak się nazywa polecenie USUŃ po angielsku?

PURGE. W polskim AutoCADzie jego skrót to `US`: wpisz go i naciśnij Enter lub spację. Angielskie `PU` w polskiej wersji uruchamia polecenie PUNKT. `-USUŃ` to <Command id="-PURGE" />, wersja dla wiersza polecenia, którą polecenie USUŃ uruchamia też tutaj. `_PURGE` działa w AutoCADzie w każdym języku.

### Jak usunąć nieużywane bloki w AutoCADzie?

Wpisz `US`, wybierz <Keyword id="Blocks" />, naciśnij Enter dla wszystkich nazw i odpowiedz <Keyword id="No" />, aby usunąć je wszystkie bez pytania o każdy.

### Dlaczego nie mogę usunąć bloku?

Bo jest w użyciu: umieszcza go odnośnik w rysunku albo zawiera go używany blok, być może zagnieżdżony kilka poziomów głębiej. Wymaż jego odnośniki albo rozbij bloki, które go zawierają, a polecenie USUŃ będzie mogło go usunąć.

### Jak usunąć nieużywane warstwy?

W AutoCADzie – typem Warstwy polecenia USUŃ. Tutaj jeszcze nie: polecenie USUŃ czyści bloki i rodzaje linii; pustą warstwę usuń zamiast tego w Menedżerze właściwości warstw.
