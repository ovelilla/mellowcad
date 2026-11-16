---
title: "Atrybuty bloku w AutoCADzie: polecenie ATRDEF (ATTDEF)"
metaTitle: "Atrybuty bloku w AutoCADzie: polecenie ATRDEF"
description: "Jak zdefiniować atrybut bloku w AutoCADzie poleceniem ATRDEF (ATTDEF, skrót ATR): tryby, etykieta, monit i wartość domyślna, potem miejsce tekstu."
figure: "Oznaczenie drzwi: atrybut NUM wyśrodkowany w okręgu, jego monitem jest sama etykieta, a wartością domyślną 1, gotowy do włączenia do bloku."
sourceHash: "f0fc3d8763e7"
---

Polecenie ATRDEF (ATTDEF) definiuje atrybut: etykietę, monit i wartość domyślną, umieszczone w rysunku jako wiersz tekstu. Zaznacz go razem z innymi obiektami, gdy tworzysz blok poleceniem <Command id="BLOCK" />, a każdy odnośnik tego bloku będzie miał dla niego własną wartość: numer drzwi, kod części, nazwę pomieszczenia. Do tego czasu definicja pokazuje swoją etykietę.

ATRDEF w AutoCADzie otwiera okno dialogowe Definicja atrybutu, którego MellowCAD nie ma: tu ATRDEF pyta w wierszu polecenia o to, o co pyta <Command id="-ATTDEF" />, tak jak w konsoli AutoCADa. Wypisuje bieżące tryby i pyta, który zmienić, aż Enter przejdzie dalej. Potem etykieta: bez spacji, bo spacja ją kończy, a małe litery zamieniane są na wielkie; sam Enter daje komunikat <Message id="tagCannotBeNull" />. Potem monit, którym <Command id="INSERT" /> zapyta o wartość, przy czym Enter przyjmuje etykietę, i wartość domyślna. Na końcu miejsce tekstu, z pytaniami polecenia <Command id="TEXT" />: punkt początkowy, wysokość i obrót. Wysokość i wyrównanie są wspólne z poleceniem TEKST, w obie strony. Enter przy punkcie początkowym umieszcza definicję jeden wiersz poniżej ostatnio zdefiniowanej, z jej wysokością, obrotem, stylem i wyrównaniem, więc atrybuty bloku układają się jeden pod drugim.

## Options

### Invisible

Wartość nie jest widoczna na odnośnikach, dopóki nie włączy jej <Command id="ATTDISP" />. Każdy tryb to przełącznik: wybranie go zmienia go między `T` a `N`, ponownie wypisuje tryby i pyta jeszcze raz. Tryby pozostają ustawione do następnego wywołania ATRDEF.

### Constant

Każdy odnośnik ma tę samą wartość, o którą ATRDEF pyta zamiast monitu i wartości domyślnej; WSTAW nigdy o nią nie pyta.

### Verify

WSTAW pyta o wartość po raz drugi, aby ją sprawdzić, gdy już raz zapyta o wszystkie wartości.

### Preset

WSTAW nie pyta o wartość: każdy odnośnik przyjmuje wartość domyślną.

### Lock position

Na początku włączony: atrybut zostaje tam, gdzie umieszcza go blok.

### Justify

Pyta, jak tekst jest wyrównany względem swojego punktu, tak jak TEKST: <Keyword id="Left" />, <Keyword id="Center" />, <Keyword id="Right" />, <Keyword id="Middle" /> albo jeden z dziewięciu punktów: u góry, pośrodku lub u dołu oraz z lewej, na środku lub z prawej. Monit o punkt początkowy pyta potem o wybrany punkt: środek w pionie i w poziomie centruje wartość w oznaczeniu.

### Style

Pyta o styl tekstu, który staje się bieżący; <Keyword id="?" /> wypisuje style rysunku.

## Missing

Okno dialogowe Definicja atrybutu: ATRDEF pyta w wierszu polecenia. Tryby Opisowy i Wiele linii, które AutoCAD 2027 wymienia po Blokadzie położenia, oraz wiersze atrybutu wielowierszowego. Pola, wyrównania Wyrównaj i Dopasuj oraz pytanie opcji Styl o to, które style wypisać po `?`.

## Questions

### Jak się nazywa polecenie ATRDEF po angielsku i jaki ma skrót?

Po angielsku ATTDEF, w polskim AutoCADzie ATRDEF: wpisz `ATR`, potem naciśnij Enter albo spację; działa też `ODATRDEF`. <Command id="-ATTDEF" /> to forma wiersza polecenia, którą tu uruchamia także ATRDEF. `_ATTDEF` działa w AutoCADzie w każdym języku.

### Jak zrobić blok z atrybutami w AutoCADzie?

Narysuj symbol, potem uruchom ATRDEF dla każdego atrybutu i umieść jego tekst tam, gdzie ma być widoczna wartość. Uruchom <Command id="BLOCK" />, wskaż punkt bazowy i zaznacz symbol oraz atrybuty, w kolejności, w jakiej WSTAW ma o nie pytać. Każde wstawienie bloku poleceniem <Command id="INSERT" /> pyta potem o wartość każdego atrybutu, proponując jego wartość domyślną.

### Czym się różnią etykieta, monit i wartość domyślna atrybutu?

Etykieta nazywa atrybut, jak identyfikator: to ją pokazuje definicja i nią <Command id="EATTEDIT" /> opisuje pole. Monit to pytanie, którym WSTAW prosi o wartość. Wartość domyślna to proponowana wartość, którą przyjmuje Enter.

### Jak edytować definicję atrybutu?

Kliknij ją dwukrotnie, zanim trafi do bloku: <Command id="TEXTEDIT" /> otwiera jej etykietę, monit i wartość domyślną. Gdy jest już w bloku, wartości każdego odnośnika edytuje się poleceniem <Command id="ATTEDIT" /> lub <Command id="EATTEDIT" />.
