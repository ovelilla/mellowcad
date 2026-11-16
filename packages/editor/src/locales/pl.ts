// Generated from pl.json by `npm run locales`. Do not edit.
import type { EditorLocale } from "./types"

export const pl: EditorLocale = {
  "tag": "pl",
  "messages": {
    "Workspace": {
      "canvas": "Obszar rysunku CAD"
    },
    "Keys": {
      "save": "Ctrl+S",
      "open": "Ctrl+O",
      "undo": "Ctrl+Z",
      "redo": "Ctrl+Y",
      "commandLine": "Ctrl+9",
      "cleanScreen": "Ctrl+0",
      "cut": "Ctrl+X",
      "copy": "Ctrl+C",
      "copyBase": "Ctrl+Shift+C",
      "paste": "Ctrl+V"
    },
    "TopBar": {
      "menu": "Menu aplikacji",
      "new": "Nowy",
      "open": "Otwórz",
      "save": "Zapisz",
      "saveAs": "Zapisz jako",
      "units": "Jednostki rysunku…",
      "language": "Język",
      "feedback": "Wyślij opinię",
      "saving": "Zapisywanie…",
      "saved": "Zapisano",
      "savedHint": "Zapisano na tym urządzeniu",
      "undo": "Cofnij",
      "redo": "Odtwórz",
      "commandLine": "Wiersz polecenia",
      "layer": "Warstwa",
      "color": "Kolor obiektu",
      "lineweight": "Szerokość linii",
      "linetype": "Rodzaj linii"
    },
    "NavigationBar": {
      "label": "Pasek nawigacji",
      "zoom": "Zoom",
      "extents": "Zoom zakres",
      "window": "Zoom okno",
      "previous": "Zoom poprzedni",
      "in": "Powiększ",
      "out": "Pomniejsz"
    },
    "Viewport": {
      "view": [
        "Kontrolki widoku: ",
        [
          "name"
        ]
      ]
    },
    "ViewCube": {
      "label": "ViewCube",
      "home": "Początek",
      "parallel": "Równoległy",
      "setHome": "Ustaw bieżący widok jako Początek",
      "rollClockwise": "Obróć zgodnie z ruchem wskazówek zegara",
      "rollCounterclockwise": "Obróć przeciwnie do ruchu wskazówek zegara",
      "wcs": "GUW",
      "unnamed": "Nienazwany",
      "newUcs": "Nowy GUW",
      "adjacent": {
        "up": "Pokaż ścianę powyżej",
        "down": "Pokaż ścianę poniżej",
        "left": "Pokaż ścianę po lewej",
        "right": "Pokaż ścianę po prawej"
      }
    },
    "ToolRail": {
      "flyouts": {
        "circle": "Okrąg",
        "arc": "Łuk",
        "ellipse": "Elipsa",
        "spline": "Splajn",
        "rectangle": "Prostokąt",
        "trim": "Utnij",
        "fillet": "Zaokrąglij",
        "filletedge": "Zaokrąglij krawędź",
        "solideditextrude": "Wyciągnij powierzchnie",
        "break": "Przerwij",
        "pedit": "Edytuj polilinię",
        "array": "Szyk",
        "text": "Tekst",
        "dimension": "Wymiar",
        "dimchain": "Szeregowy",
        "attributes": "Atrybuty",
        "measure": "Zmierz",
        "union": "Edycja brył",
        "box": "Modelowanie",
        "extrude": "Wyciągnij",
        "point": "Punkty"
      },
      "sections": {
        "draw": "Rysuj",
        "modify": "Zmień",
        "annotation": "Opis",
        "block": "Blok",
        "utilities": "Narzędzia"
      }
    },
    "CommandLine": {
      "label": "Wiersz polecenia",
      "placeholder": "Wpisz polecenie (LINIA, UT, K…)",
      "history": "Historia poleceń"
    },
    "DynamicInput": {
      "locked": "zablokowane"
    },
    "StatusBar": {
      "coordinates": "Współrzędne",
      "model": "MODEL",
      "modelSpace": "Obszar modelu",
      "grid": "Siatka",
      "objectSnap": "Lokalizacja względem obiektu",
      "objectSnapSettings": "Ustawienia lokalizacji",
      "snapMode": "Tryb skoku",
      "snapSettings": "Ustawienia skoku",
      "snap": "Skok",
      "gridSnap": "Skok w siatce",
      "polarSnap": "Skok biegunowy",
      "snapX": "Skok X",
      "snapXSpacing": "Odstęp X",
      "snapY": "Skok Y",
      "snapYSpacing": "Odstęp Y",
      "polarDistance": "Odległość biegunowa",
      "polarSnapDistance": "Odległość skoku biegunowego",
      "ortho": "Tryb orto",
      "polarTracking": "Śledzenie biegunowe",
      "polarTrackingAngle": "Kąt śledzenia biegunowego",
      "polarAngle": "Kąt biegunowy",
      "objectSnapTracking": "Śledzenie lokalizacji",
      "selectionCycling": "Wybieranie cykliczne",
      "selectionCyclingSettings": "Ustawienia wybierania cyklicznego",
      "selectionList": "Wyświetl pole listy wyboru cyklicznego",
      "showLineweight": "Pokaż szerokość linii",
      "units": "Jednostki",
      "cleanScreen": "Wyczyść ekran",
      "customization": "Ustawienia"
    },
    "Units": {
      "title": "Jednostki rysunku",
      "length": "Długość",
      "type": "Typ",
      "precision": "Dokładność",
      "decimal": "Dziesiętne",
      "insertionScale": "Skala wstawiania",
      "insertedContent": "Jednostki do skalowania wstawianej zawartości:",
      "millimeters": "Milimetry",
      "centimeters": "Centymetry",
      "meters": "Metry",
      "sampleOutput": "Przykładowy wygląd",
      "ok": "OK",
      "cancel": "Anuluj"
    },
    "SaveAs": {
      "title": "Zapisz rysunek jako",
      "fileName": "Nazwa pliku:",
      "fileType": "Pliki typu:",
      "tools": "Narzędzia",
      "options": "Opcje…",
      "save": "Zapisz",
      "cancel": "Anuluj",
      "drawing": "Rysunek MellowCAD (*.ecad.json)",
      "dxf2018": "AutoCAD 2018 DXF (*.dxf)",
      "dxf2013": "AutoCAD 2013/LT2013 DXF (*.dxf)",
      "dxf2010": "AutoCAD 2010/LT2010 DXF (*.dxf)",
      "dxf2007": "AutoCAD 2007/LT2007 DXF (*.dxf)",
      "dxf2004": "AutoCAD 2004/LT2004 DXF (*.dxf)",
      "dxf2000": "AutoCAD 2000/LT2000 DXF (*.dxf)",
      "optionsTitle": "Opcje Zapisz jako",
      "dxfOptions": "Opcje DXF",
      "format": "Format",
      "ascii": "ASCII",
      "binary": "BINARNY",
      "selectObjects": "Wybierz obiekty",
      "preview": "Zapisz obraz podglądu miniatury",
      "precision": "Liczba miejsc dziesiętnych (od 0 do 16)",
      "ok": "OK"
    },
    "SnapOverride": {
      "from": "Od",
      "pointFilters": "Filtry współrzędnych",
      "none": "Brak"
    },
    "SelectionCycling": {
      "title": "Wybór",
      "none": "Brak"
    },
    "ShortcutMenu": {
      "label": "Menu skrótów",
      "repeat": [
        "Powtórz ",
        [
          "command"
        ]
      ],
      "clipboard": "Schowek",
      "copyBase": "Kopiuj z punktem bazowym",
      "paste": "Wklej",
      "undo": "Cofnij",
      "redo": "Odtwórz",
      "copySelection": "Kopiuj wybrane",
      "deselectAll": "Odznacz wszystkie",
      "properties": "Właściwości",
      "enter": "Wprowadź",
      "cancel": "Anuluj",
      "snapOverrides": "Nadpisania obiektu",
      "dimensionStyle": "Styl wymiarowania"
    },
    "Layers": {
      "title": "Warstwy",
      "new": "Nowa warstwa",
      "setCurrentLabel": [
        "Ustaw warstwę ",
        [
          "name"
        ],
        " jako bieżącą"
      ],
      "current": "Bieżąca warstwa",
      "setCurrent": "Ustaw bieżącą",
      "colorLabel": [
        "Kolor warstwy ",
        [
          "name"
        ]
      ],
      "color": "Kolor warstwy",
      "linetypeLabel": [
        "Rodzaj linii warstwy ",
        [
          "name"
        ]
      ],
      "lineweightLabel": [
        "Szerokość linii warstwy ",
        [
          "name"
        ]
      ],
      "on": "Włączona",
      "off": "Wyłączona",
      "unlocked": "Odblokowana",
      "locked": "Zablokowana",
      "deleteLabel": [
        "Usuń warstwę ",
        [
          "name"
        ]
      ],
      "delete": "Usuń warstwę",
      "rename": "Kliknij ponownie nazwę wybranej warstwy, aby ją zmienić",
      "renameLabel": [
        "Zmień nazwę warstwy ",
        [
          "name"
        ]
      ],
      "list": "Lista warstw",
      "nextColumns": "Następne kolumny",
      "previousColumns": "Poprzednie kolumny",
      "dialog": {
        "close": "Zamknij",
        "notDeleted": {
          "title": "Warstwa – nie usunięto",
          "instruction": "Wybrana warstwa nie została usunięta.",
          "content": "Poniższe warstwy nie mogą zostać usunięte:",
          "base": "Warstwy 0 i Defpoints",
          "current": "Bieżąca warstwa",
          "inUse": "Warstwy zawierające obiekty",
          "xref": "Warstwy zależne od odnośnika zewnętrznego"
        },
        "currentOff": {
          "title": "Warstwa – bieżąca warstwa wyłączona",
          "instruction": "Bieżąca warstwa zostanie wyłączona. Co chcesz zrobić?",
          "turnOff": "Wyłącz bieżącą warstwę",
          "turnOffNote": "Obiekty tworzone od tej chwili nie będą wyświetlane na rysunku, dopóki warstwa nie zostanie ponownie włączona.",
          "keepOn": "Pozostaw bieżącą warstwę włączoną"
        },
        "nameInUse": {
          "title": "Warstwa – nazwa już istnieje",
          "instruction": [
            "Nazwa ",
            [
              "name"
            ],
            " jest już używana."
          ],
          "content": "Należy podać inną nazwę."
        },
        "invalidName": {
          "title": "Warstwa",
          "instruction": "Niedozwolone znaki w nazwie warstwy.",
          "content": "Nazwy warstw nie mogą zawierać następujących znaków:"
        },
        "cannotRename": {
          "title": "Warstwa – zmiana nazwy",
          "instruction": "Nie można zmienić nazwy wybranej warstwy.",
          "content": "Nie można zmienić nazw następujących warstw:",
          "base": "Warstwa 0",
          "xref": "Warstwy zależne od odnośnika zewnętrznego"
        }
      },
      "columns": {
        "status": "Stan",
        "name": "Nazwa",
        "on": "Widoczność",
        "lock": "Zamknięcie",
        "color": "Kolor",
        "linetype": "Rodzaj linii",
        "lineweight": "Szerokość linii",
        "objects": "Obiekty"
      }
    },
    "Styles": {
      "title": "Style",
      "dimension": "Wymiar",
      "text": "Tekst",
      "current": [
        "Bieżący: ",
        [
          "value",
          [
            "name"
          ]
        ]
      ],
      "new": "Nowy",
      "setCurrent": [
        "Ustaw ",
        [
          "name"
        ],
        " jako bieżący"
      ],
      "rename": [
        "Zmień nazwę ",
        [
          "name"
        ]
      ],
      "delete": [
        "Usuń ",
        [
          "name"
        ]
      ],
      "lines": "Linie",
      "baselineSpacing": "Odstępy między liniami bazowymi",
      "extendBeyond": "Przedłużenie",
      "offsetFromOrigin": "Odsunięcie od początku",
      "symbolsAndArrows": "Symbole i strzałki",
      "arrowSize": "Rozmiar strzałki",
      "centerMark": "Rozmiar znacznika środka",
      "textGroup": "Tekst",
      "textHeight": "Wysokość tekstu",
      "offsetFromDimLine": "Odsunięcie od linii wymiarowej",
      "fit": "Dopasowanie",
      "overallScale": "Globalny wsp. skali",
      "drawDimLineBetween": "Zawsze rysuj linię między liniami wymiarowymi",
      "primaryUnits": "Jednostki podstawowe",
      "precision": "Dokładność",
      "angularPrecision": "Dokładność kątów",
      "decimalSeparator": "Separator dziesiętny",
      "comma": "',' (przecinek)",
      "period": "'.' (kropka)",
      "space": "' ' (spacja)",
      "suppressTrailingZeros": "Pomiń zera końcowe",
      "yes": "Tak",
      "no": "Nie",
      "size": "Rozmiar",
      "height": "Wysokość",
      "heightHint": "Przy wysokości 0 wysokość nie jest ustalona, więc polecenie TEKST pyta o nią za każdym razem."
    },
    "Blocks": {
      "title": "Bloki",
      "filter": "Filtr (dozwolone ? i *)",
      "filterLabel": "Filtruj bloki",
      "empty": "Brak zdefiniowanych bloków. Narysuj coś i uruchom polecenie BLOK.",
      "noMatch": "Żaden blok nie pasuje do filtru.",
      "references": [
        [
          "name"
        ],
        " – ",
        [
          "count",
          2,
          {
            "one": [
              0,
              " na rysunku"
            ],
            "few": [
              0,
              " na rysunku"
            ],
            "many": [
              0,
              " na rysunku"
            ],
            "other": [
              0,
              " na rysunku"
            ]
          }
        ]
      ]
    },
    "Properties": {
      "noSelection": "Nic nie wybrano",
      "general": "Ogólne",
      "color": "Kolor",
      "colorLabel": "Kolor wybranych obiektów",
      "layer": "Warstwa",
      "layerLabel": "Warstwa wybranych obiektów",
      "linetype": "Rodzaj linii",
      "linetypeLabel": "Rodzaj linii wybranych obiektów",
      "lineweight": "Szerokość linii",
      "lineweightLabel": "Szerokość linii wybranych obiektów",
      "textStyle": "Styl tekstu",
      "textStyleLabel": "Styl tekstu wybranych obiektów",
      "dimStyle": "Styl wymiarowania",
      "dimStyleLabel": "Styl wymiarowania wybranych obiektów",
      "varies": "*RÓŻNE*",
      "customColor": "Kolor niestandardowy",
      "title": "Właściwości",
      "objectType": "Typ obiektu",
      "currentLayerLabel": "Bieżąca warstwa",
      "currentColorLabel": "Bieżący kolor",
      "currentLinetypeLabel": "Bieżący rodzaj linii",
      "currentLineweightLabel": "Bieżąca szerokość linii",
      "lockedObjects": {
        "title": "Właściwości – zablokowane obiekty",
        "instruction": "Co najmniej jeden z wybranych obiektów jest zablokowany i nie można go zaktualizować.",
        "content": [
          "Liczba obiektów usuniętych ze zbioru wskazań: ",
          [
            "count",
            4
          ]
        ],
        "close": "Zamknij"
      }
    },
    "MText": {
      "unsavedChanges": {
        "title": "Tekst wielowierszowy – niezapisane zmiany",
        "instruction": "Czy chcesz zapisać zmiany w tekście?",
        "yes": "Tak",
        "no": "Nie",
        "cancel": "Anuluj"
      }
    },
    "Palette": {
      "label": "Palety",
      "fold": "Zwiń palety",
      "unfold": "Pokaż palety",
      "resize": "Szerokość palety"
    },
    "PointStyle": {
      "title": "Styl punktu",
      "figures": "Symbole wyświetlania punktów",
      "pointSize": "Rozmiar punktu:",
      "relative": "Ustal rozmiar względem ekranu",
      "absolute": "Ustal rozmiar w jednostkach rysunku",
      "percent": "%",
      "units": "Jednostki",
      "invalid": "Niewłaściwe dane wejściowe.",
      "ok": "OK",
      "cancel": "Anuluj"
    }
  }
}
