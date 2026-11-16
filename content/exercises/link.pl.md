---
title: "Ćwiczenie AutoCAD: łącznik z liniami stycznymi"
metaTitle: "Ćwiczenie AutoCAD dla zaawansowanych: łącznik"
description: "Narysuj łącznik w AutoCADzie: dwa oczka połączone liniami stycznymi do obu z lokalizacją Styczny, łuki między nimi ucięte, i wymiary. Za darmo online."
figure: "Łącznik z dwoma oczkami w rozstawie 90, połączonymi liniami stycznymi, z wymiarami."
sourceHash: "383984af61b7"
---

Narysuj ten łącznik w milimetrach: dwa oczka w rozstawie 90, o promieniu 20 i 12, z otworami o promieniu 10 i 6, połączone liniami stycznymi do obu, a łuki między liniami ucięte. Linie styczne korzystają z lokalizacji Styczny na obu końcach; potem polecenie <Command id="TRIM" /> zamienia okrąg każdego oczka w łuk.

## Steps

### Narysuj oczka [#bosses]

Na warstwie Kontur cztery okręgi poleceniem <Command id="CIRCLE" />, każdy przez promień: `20` i `10` w `0,0`, `12` i `6` w `90,0`.

### Narysuj linie styczne [#tangents]

Polecenie <Command id="LINE" />, potem wpisz `_TAN`, tryb lokalizacji Styczny dla jednego punktu, i wskaż duży okrąg blisko jego góry; znowu `_TAN` i wskaż mały okrąg blisko jego góry. Linia jest styczna do obu. Tak samo na dole.

### Utnij łuki [#trim]

Polecenie <Command id="TRIM" />: wskaż każde oczko między dwiema liniami, po stronie zwróconej do drugiego oczka. Wewnętrzne łuki znikają, a każdy okrąg jest łukiem.

### Narysuj osie [#centreLines]

Na warstwie Linie osiowe oś przez oba środki i linia w poprzek każdego oczka.

### Zwymiaruj rysunek [#dimensions]

Na warstwie Wymiary odległość między środkami poleceniem <Command id="DIMLINEAR" />, promienie oczek poleceniem <Command id="DIMRADIUS" />, a ich otwory poleceniem <Command id="DIMDIAMETER" />.
