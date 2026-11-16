---
title: "Tryb skoku w AutoCADzie: polecenie SKOK (SNAP)"
description: "Skok w AutoCADzie: polecenie SKOK (SNAP, skrót SKO) i F9 trzymają kursor w węzłach o zadanym odstępie; Różne ustawia X i Y osobno, jest też skok biegunowy."
figure: "SKOK 10 z włączoną siatką, potem LINIA wskazywana poza węzłami: każdy punkt trafia w węzeł, a kursor razem z nim."
sourceHash: "a1089484f2f1"
---

Tryb skoku trzyma kursor na siatce punktów: każde wskazanie trafia w najbliższy z nich, więc przy odstępie 10 kliknięcie w 13,7 daje 10,10. Siatka punktów należy do bieżącego układu LUW i biegnie od jego początku wzdłuż jego osi. F9 włącza i wyłącza tryb skoku, a wiersz polecenia odnotowuje, czy jest włączony, czy wyłączony; to samo robi jego przycisk na pasku stanu. Zaokrąglane są tylko wskazania: wpisana współrzędna zostaje przyjęta tak, jak ją wpisano, a lokalizacja względem obiektu ma pierwszeństwo przed siatką punktów. Siatka (F7) rysuje własną siatkę punktów i pokazuje ją niezależnie od tego, czy skok jest włączony.

Polecenie SKOK (SNAP) ustala odstęp: wpisz go albo podaj dwa punkty oddalone o tę odległość, a tryb skoku włącza się z tym odstępem w X i Y. Enter włącza go bez zmian. Odstęp 0 lub mniejszy jest odrzucany komunikatem <Message id="positiveNonzero" />. Wpisane z apostrofem, `'SKOK`, polecenie działa wewnątrz innego polecenia. Tryb skoku i jego odstęp zapisują się w rysunku, a <Command id="U" /> cofa SKOK.

Menu Skok na pasku stanu pozwala zamiast tego wybrać skok biegunowy: wzdłuż wektora śledzenia biegunowego kursor przesuwa się o POLARDIST albo, dopóki POLARDIST wynosi 0, o odstęp skoku w X.

## Options

### ON

Włącza tryb skoku z bieżącym odstępem, jak Enter.

### OFF

Wyłącza tryb skoku; odstęp zostaje zachowany.

### Aspect

Pyta o odstęp poziomy, potem o pionowy, i włącza tryb skoku: siatka punktów wyższa lub szersza niż kwadratowa. Domyślną odpowiedzią pytania jest wtedy <Keyword id="Aspect" />, więc Enter pyta o nie ponownie.

## Missing

Opcje Styl, skok izometryczny, i Typ, siatka lub biegunowy, przy pytaniu: typ wybiera menu na pasku stanu. Pochodny, ukryta opcja Obrót (SNAPANG) i SNAPBASE. Ujemna wartość POLARDIST, którą skok biegunowy AutoCADa traktuje jako jej wielkość: −10 przesuwa o 10.

## Questions

### Jak się nazywa polecenie SKOK po angielsku?

SNAP. F9 włącza i wyłącza tryb skoku. Aby ustawić odstęp, wpisz `SKOK` lub skrót `SKO` i naciśnij Enter lub spację; skrót `SN` z wersji angielskiej w polskiej nie działa. `_SNAP` działa w AutoCADzie w każdym języku.

### Czym się różni skok od lokalizacji względem obiektu?

Tryb skoku zaokrągla kursor do siatki punktów w przestrzeni. Lokalizacja względem obiektu (F3) przyciąga go do punktów na obiektach: punktów końcowych, punktów symetrii, środków. Działają razem, a gdy oba znajdują punkt, wygrywa lokalizacja względem obiektu.

### Dlaczego kursor skacze co krok w AutoCADzie?

Tryb skoku jest włączony: naciśnij F9 albo przycisk skoku na pasku stanu, aby go wyłączyć. Jeśli chcesz drobniejszych kroków, ustaw mniejszy odstęp poleceniem SKOK.

### Jak ustawić różny skok w X i Y?

Uruchom SKOK, wybierz <Keyword id="Aspect" /> i podaj odstęp poziomy, a potem pionowy.

### Czy jest skok izometryczny?

Jeszcze nie: opcja Styl polecenia SKOK, która obraca siatkę punktów do rysunku izometrycznego, nie jest dostępna.
