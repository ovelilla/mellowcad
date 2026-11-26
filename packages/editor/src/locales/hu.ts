// Generated from hu.json by `npm run locales`. Do not edit.
import type { EditorLocale } from "./types"

export const hu: EditorLocale = {
  "tag": "hu",
  "messages": {
    "Workspace": {
      "canvas": "CAD-rajzterület"
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
    "TitleBar": {
      "menu": "Alkalmazásmenü",
      "new": "Új",
      "open": "Megnyitás",
      "save": "Mentés",
      "saveAs": "Mentés másként",
      "newHint": "Új rajz létrehozása",
      "newDrawing": "Rajz",
      "newDrawingHint": "Nyisson meg egy új rajzot.",
      "openHint": "Fájl megnyitása",
      "openDrawing": "Rajz",
      "openDrawingHint": "Nyisson meg egy létező rajzfájlt.",
      "saveAsHint": "A rajz egy példányának mentése",
      "saveAsDrawing": "Rajz",
      "saveAsDrawingHint": "Az aktuális rajz mentése az alapértelmezett rajzfájlformátumban.",
      "saveAsOther": "Egyéb formátumok",
      "saveAsOtherHint": "Az aktuális rajz mentése DXF fájlformátumban.",
      "utilities": "Rajzolási segéd-\neszközök",
      "utilitiesHint": "A rajz karbantartásának eszközei",
      "units": "Mértékegységek",
      "unitsHint": "Koordináták és szögek megjelenítési formátumának és pontosságának meghatározása.",
      "openDocuments": "Megnyitott dokumentumok",
      "language": "Nyelv",
      "feedback": "Visszajelzés küldése",
      "help": "Súgó",
      "saving": "Mentés…",
      "saved": "Mentve",
      "savedHint": "Mentve ezen az eszközön",
      "undo": "Vissza",
      "redo": "Előre",
      "undoCount": [
        [
          "count",
          2,
          {
            "=1": [
              0,
              " parancs visszavonása"
            ],
            "other": [
              0,
              " parancs visszavonása"
            ]
          }
        ]
      ],
      "redoCount": [
        [
          "count",
          2,
          {
            "=1": [
              0,
              " parancs ismétlése"
            ],
            "other": [
              0,
              " parancs ismétlése"
            ]
          }
        ]
      ]
    },
    "NavigationBar": {
      "label": "Navigációs sáv",
      "zoom": "Zoom",
      "extents": "Zoom – Terjedelem",
      "window": "Zoom – Ablak",
      "previous": "Zoom – Előző",
      "in": "Nagyítás",
      "out": "Kicsinyítés"
    },
    "Viewport": {
      "view": [
        "Nézetvezérlők: ",
        [
          "name"
        ]
      ]
    },
    "ViewCube": {
      "label": "ViewCube",
      "home": "Kezdőlap",
      "parallel": "Párhuzamos",
      "setHome": "Jelenlegi nézet beállítása kezdőnézetként",
      "rollClockwise": "Elforgatás az óramutató járásával megegyező irányban",
      "rollCounterclockwise": "Elforgatás az óramutató járásával ellentétes irányban",
      "wcs": "VKR",
      "unnamed": "Névtelen",
      "newUcs": "Új FKR",
      "adjacent": {
        "up": "A felette lévő lap megtekintése",
        "down": "Az alatta lévő lap megtekintése",
        "left": "A tőle balra lévő lap megtekintése",
        "right": "A tőle jobbra lévő lap megtekintése"
      }
    },
    "Ribbon": {
      "tabs": {
        "home": "Kezdőlap",
        "insert": "Beszúrás",
        "annotate": "Feliratozás",
        "tools3d": "3D eszközök",
        "view": "Nézet"
      },
      "panels": {
        "draw": "Rajz",
        "modify": "Módosítás",
        "annotation": "Feliratozás",
        "layers": "Fóliák",
        "block": "Blokk",
        "properties": "Tulajdonságok",
        "utilities": "Segédprogramok",
        "clipboard": "Vágólap",
        "insertBlock": "Blokk",
        "blockDefinition": "Blokk definiálása",
        "text": "Szöveg",
        "dimensions": "Méretek",
        "markup": "Jelölő",
        "viewportTools": "Nézetablakok eszközei",
        "visualStyles": "Látványstílusok",
        "coordinates": "Koordináták",
        "palettes": "Paletták",
        "navigate": "Navigálás",
        "modeling": "Modellezés",
        "solidEditing": "Szilárdtest szerkesztése",
        "coordinates3d": "Koordináták"
      },
      "items": {
        "line": "Vonal",
        "polyline": "Vonallánc",
        "circle": "Középpont, Sugár",
        "circlediameter": "Középpont, Átmérő",
        "circle2p": "2 pont",
        "circle3p": "3 pont",
        "arc": "3 pont",
        "arcsce": "Kezdőpont, Középpont, Végpont",
        "arccse": "Középpont, Kezdőpont, Végpont",
        "rectangle": "Téglalap",
        "polygon": "Sokszög",
        "ellipsecenter": "Középpont",
        "ellipse": "Tengely, Végpont",
        "ellipsearc": "Elliptikus ív",
        "hatch": "Sraffozás",
        "splinefit": "Spline illesztése",
        "splinecv": "Spline VCS",
        "xline": "Szerkesztővonal",
        "ray": "Sugár",
        "point": "Több pont",
        "divide": "Felosztás",
        "measuresegments": "Beosztás",
        "region": "Lemez",
        "wipeout": "Kitakarás",
        "polyline3d": "3D vonallánc",
        "move": "Mozgatás",
        "copy": "Másolás",
        "stretch": "Nyújtás",
        "rotate": "Elforgatás",
        "mirror": "Tükrözés",
        "scale": "Léptékezés",
        "trim": "Metszés",
        "extend": "Meghosszabbítás",
        "fillet": "Lekerekítés",
        "chamfer": "Letörés",
        "array": "Négyszögletes kiosztás",
        "arraypath": "Útvonalkiosztás",
        "arraypolar": "Poláris kiosztás",
        "erase": "Törlés",
        "explode": "Szétvetés",
        "offset": "Eltolás",
        "pedit": "Vonallánc módosítása",
        "splinedit": "Spline módosítása",
        "break": "Megtörés",
        "breakatpoint": "Megtörés egy pontban",
        "join": "Egyesítés",
        "mtext": "Bekezdéses szöveg",
        "text": "Egysoros szöveg",
        "dimlinear": "Hosszirányú",
        "dimaligned": "Illesztett",
        "dimangular": "Szög",
        "dimradius": "Sugár",
        "dimdiameter": "Átmérő",
        "textStyle": "Szövegstílus",
        "dimensionStyle": "Méretstílus",
        "layerProperties": "Fólia- tulajdonságok",
        "insert": "Beszúrás",
        "block": "Létrehozás",
        "attedit": "Egyetlen",
        "attdef": "Attribútumok definiálása",
        "matchprop": "Tulajdonságok másolása",
        "list": "Lista",
        "measure": "Távolság",
        "measurearea": "Terület",
        "id": "Pont koordinátái",
        "ptype": "Pontstílus...",
        "paste": "Beillesztés",
        "cutclip": "Kivágás",
        "copyclip": "Másolás vágólapra",
        "copybase": "Másolás bázisponttal",
        "createBlock": "Blokk létrehozása",
        "dimspace": "Tér módosítása",
        "dimensionUpdate": "Frissítés",
        "dimcontinue": "Folytatás",
        "dimbaseline": "Bázisvonalas",
        "ucsIcon": "FKR ikon",
        "viewCube": "View Cube",
        "ucs": "FKR",
        "ucsWorld": "FKR, Világ",
        "ucsX": "X",
        "ucsY": "Y",
        "ucsZ": "Z",
        "ucsPrevious": "FKR, Előző",
        "ucsOrigin": "Origó",
        "ucsZAxis": "Z tengelyű vektor",
        "ucs3Point": "3 pont",
        "ucsView": "Nézet",
        "ucsObject": "Objektum",
        "ucsFace": "Lap",
        "propertiesPalette": "Tulajdonságok",
        "blocksPalette": "Blokkok",
        "commandLine": "Parancssor",
        "pan": "Eltolás",
        "orbit": "Keringés",
        "zoomExtents": "Terjedelem",
        "zoomWindow": "Ablak",
        "zoomPrevious": "Előző",
        "zoomIn": "Nagyítás",
        "zoomOut": "Kicsinyítés",
        "box": "Téglatest",
        "cylinder": "Henger",
        "cone": "Kúp",
        "sphere": "Gömb",
        "pyramid": "Gúla",
        "wedge": "Ék",
        "torus": "Tórusz",
        "extrude": "Kihúzás",
        "revolve": "Megforgatás",
        "presspull": "Tolás-húzás",
        "filletedge": "Él lekerekítése",
        "chamferedge": "Él letörése",
        "slice": "Kettészelés",
        "union": "Egyesítés",
        "subtract": "Kivonás",
        "intersect": "Metszetképzés",
        "solideditextrude": "Lapok kihúzása",
        "solidedittaper": "Lapok szűkítése",
        "solideditmove": "Lapok mozgatása",
        "solideditcopy": "Lapok másolása",
        "solideditoffset": "Lapok eltolása",
        "solideditrotate": "Lapok elforgatása",
        "solideditdelete": "Lapok törlése",
        "insertAttedit": "Egyetlen",
        "defineAttributes": "Attribútumok definiálása",
        "multilineText": "Bekezdéses szöveg",
        "dimensionsLinear": "Hossz",
        "dimensionsAligned": "Illesztett",
        "dimensionsAngular": "Szög",
        "dimensionsRadius": "Sugár",
        "dimensionsDiameter": "Átmérő",
        "axisX": "X",
        "axisY": "Y",
        "axisZ": "Z",
        "view3d": "Nézet",
        "world": "Világ",
        "previous": "Előző",
        "attModeNormal": "Attribútummegjelenítés megtartása",
        "attModeOn": "Minden attribútum megjelenítése",
        "attModeOff": "Minden attribútum elrejtése"
      },
      "splits": {
        "circle": "Kör",
        "arc": "Ív",
        "text": "Szöveg",
        "array": "Kiosztás",
        "measure": "Mérés",
        "editAttributes": "Attribútumok szerkesztése",
        "editAttribute": "Attribútumok szerkesztése",
        "rotateUcs": "FKR elforgatása",
        "defineUcs": "FKR megadása"
      },
      "layer": "Fólia",
      "color": "Objektum színe",
      "lineweight": "Vonalvastagság",
      "linetype": "Vonaltípus",
      "pin": "Kitűzés",
      "moreColors": "Több szín...",
      "minimize": {
        "full": "A teljes szalag megjelenítése",
        "tabs": "Összecsukás füllé",
        "panelTitles": "Összecsukás panelcímmé",
        "panelButtons": "Kicsinyítés a panel gombjaira",
        "cycle": "Végiglépés az összesen"
      }
    },
    "CommandLine": {
      "label": "Parancssor",
      "placeholder": "Írjon be egy parancsot (VONAL, ME, M…)",
      "history": "Parancselőzmények"
    },
    "DynamicInput": {
      "locked": "zárolt"
    },
    "StatusBar": {
      "coordinates": "Koordináták",
      "model": "MODELL",
      "modelSpace": "Modelltér",
      "grid": "Háló",
      "objectSnap": "Tárgyraszter",
      "objectSnapSettings": "Tárgyraszter-beállítások",
      "snapMode": "Raszter mód",
      "snapSettings": "Raszterbeállítások",
      "snap": "Raszter",
      "gridSnap": "Háló raszter",
      "polarSnap": "Poláris raszter",
      "snapX": "Raszter X",
      "snapXSpacing": "Raszterkiosztás X irányban",
      "snapY": "Raszter Y",
      "snapYSpacing": "Raszterkiosztás Y irányban",
      "polarDistance": "Poláris távolság",
      "polarSnapDistance": "Poláris rasztertávolság",
      "ortho": "Orto mód",
      "polarTracking": "Poláris követés",
      "polarTrackingAngle": "Poláris követés szöge",
      "polarAngle": "Poláris szög",
      "objectSnapTracking": "Tárgyraszterkövetés",
      "selectionCycling": "Ciklikus kiválasztás",
      "selectionCyclingSettings": "Ciklikus kiválasztás beállításai",
      "selectionList": "Ciklikus kiválasztási listamező megjelenítése",
      "showLineweight": "Vonalvastagság megjelenítése",
      "units": "Mértékegységek",
      "cleanScreen": "Tiszta képernyő",
      "customization": "Testreszabás"
    },
    "Units": {
      "title": "Rajzi mértékegységek",
      "length": "Hosszúság",
      "type": "Típus",
      "precision": "Pontosság",
      "decimal": "Tizedes",
      "insertionScale": "Beszúrási lépték",
      "insertedContent": "Tartalom rajzba illesztésekor a lépték mértékegysége:",
      "millimeters": "Milliméter",
      "centimeters": "Centiméter",
      "meters": "Méter",
      "sampleOutput": "Minta",
      "ok": "OK",
      "cancel": "Mégse"
    },
    "SaveAs": {
      "title": "Rajz mentése másként",
      "fileName": "Fájlnév:",
      "fileType": "Fájltípus:",
      "tools": "Eszközök",
      "options": "Opciók…",
      "save": "Mentés",
      "cancel": "Mégse",
      "drawing": "MellowCAD-rajz (*.ecad.json)",
      "dxf2018": "AutoCAD 2018 DXF (*.dxf)",
      "dxf2013": "AutoCAD 2013/LT2013 DXF (*.dxf)",
      "dxf2010": "AutoCAD 2010/LT2010 DXF (*.dxf)",
      "dxf2007": "AutoCAD 2007/LT2007 DXF (*.dxf)",
      "dxf2004": "AutoCAD 2004/LT2004 DXF (*.dxf)",
      "dxf2000": "AutoCAD 2000/LT2000 DXF (*.dxf)",
      "dxfR12": "AutoCAD R12/LT2 DXF (*.dxf)",
      "optionsTitle": "Mentés másként opciók",
      "dxfOptions": "DXF opciók",
      "format": "Formátum",
      "ascii": "ASCII",
      "binary": "BINÁRIS",
      "selectObjects": "Objektumok kiválasztása",
      "preview": "Miniatűr előnézeti kép mentése",
      "precision": "Tizedes pontosság (0 - 16)",
      "ok": "OK"
    },
    "SnapOverride": {
      "from": "Ponttól",
      "pointFilters": "Pontszűrők",
      "none": "Semmi"
    },
    "SelectionCycling": {
      "title": "Kijelölés",
      "none": "Nincs"
    },
    "ShortcutMenu": {
      "label": "Helyi menü",
      "repeat": [
        "Ismétlés: ",
        [
          "command"
        ]
      ],
      "clipboard": "Vágólap",
      "copyBase": "Másolás bázisponttal",
      "paste": "Beillesztés",
      "undo": "Vissza",
      "redo": "Előre",
      "copySelection": "Kijelölés másolása",
      "deselectAll": "Kijelölés megszüntetése",
      "properties": "Tulajdonságok",
      "enter": "Enter",
      "cancel": "Megszakítás",
      "snapOverrides": "Traszter-felülírások",
      "dimensionStyle": "Méretstílus"
    },
    "Layers": {
      "title": "Fóliák",
      "newLayer": "Új fólia",
      "deleteLayer": "Fólia törlése",
      "setCurrentLayer": "Aktuálissá tétel",
      "keys": {
        "new": "J",
        "delete": "R",
        "setCurrent": "A"
      },
      "withKey": [
        [
          "label"
        ],
        " (Alt+",
        [
          "key"
        ],
        ")"
      ],
      "currentLayer": [
        "Aktuális fólia: ",
        [
          "name"
        ]
      ],
      "all": "Mind",
      "status": [
        [
          "filter"
        ],
        ": ",
        [
          "shown",
          4
        ],
        " fólia megjelenítve, ",
        [
          "total",
          4
        ],
        " fólia összesen"
      ],
      "statusShort": [
        [
          "filter"
        ],
        ": ",
        [
          "shown",
          4
        ],
        " az összesből (",
        [
          "total",
          4
        ],
        ")"
      ],
      "current": "Aktuális fólia",
      "colorLabel": [
        "A(z) ",
        [
          "name"
        ],
        " fólia színe"
      ],
      "color": "Fólia színe",
      "linetypeLabel": [
        "A(z) ",
        [
          "name"
        ],
        " fólia vonaltípusa"
      ],
      "lineweightLabel": [
        "A(z) ",
        [
          "name"
        ],
        " fólia vonalvastagsága"
      ],
      "on": "Be",
      "off": "Ki",
      "unlocked": "Felszabadított",
      "locked": "Zárolt",
      "rename": "A fólia átnevezéséhez kattintson ismét a kijelölt fólia nevére",
      "renameLabel": [
        "A(z) ",
        [
          "name"
        ],
        " fólia átnevezése"
      ],
      "list": "Fóliák listája",
      "dialog": {
        "close": "Bezárás",
        "notDeleted": {
          "title": "Fólia - Nem törölhető",
          "instruction": "A kiválasztott fólia törlése nem történt meg.",
          "content": "A következő fóliák nem törölhetők:",
          "base": "A 0 és a Defpoints fólia",
          "current": "Az aktuális fólia",
          "inUse": "Objektumokat tartalmazó fóliák",
          "xref": "Xref eredetű fóliák"
        },
        "currentOff": {
          "title": "Fólia - Aktuális fólia kikapcsolva",
          "instruction": "Az aktuális fóliát a program kikapcsolja. Mit kíván tenni?",
          "turnOff": "Az aktuális fólia kikapcsolása",
          "turnOffNote": "Az ezután létrehozott objektumok nem jelennek meg a rajzon, amíg vissza nem kapcsolja a fóliát.",
          "keepOn": "Az aktuális fólia maradjon bekapcsolva"
        },
        "nameInUse": {
          "title": "Fólia - A név már foglalt",
          "instruction": [
            "A(z) ",
            [
              "name"
            ],
            " név már használatban van."
          ],
          "content": "Adjon meg egy másik nevet."
        },
        "invalidName": {
          "title": "Fólia",
          "instruction": "Érvénytelen karakterek szerepelnek a fólianévben.",
          "content": "A következő karakterek nem szerepelhetnek fólianévben:"
        },
        "cannotRename": {
          "title": "Fólia - Átnevezés",
          "instruction": "A kiválasztott fólia nem nevezhető át.",
          "content": "A következő fóliák nem nevezhetők át:",
          "base": "A 0 fólia",
          "xref": "Xref eredetű fóliák"
        }
      },
      "columns": {
        "status": "Állapot",
        "name": "Név",
        "on": "Be",
        "lock": "Zárolás",
        "color": "Szín",
        "linetype": "Vonaltípus",
        "lineweight": "Vonalvastagság"
      }
    },
    "TextStyle": {
      "title": "Szövegstílus",
      "current": [
        "Aktuális szövegstílus: ",
        [
          "name"
        ]
      ],
      "styles": "Stílusok:",
      "allStyles": "Minden stílus",
      "stylesInUse": "Használatban lévő stílusok",
      "font": "Betűtípus",
      "fontName": "Betűtípus neve:",
      "size": "Méret",
      "height": "Magasság",
      "setCurrent": "Aktuálissá tétel",
      "new": "Új...",
      "delete": "Törlés",
      "apply": "Alkalmaz",
      "cancel": "Mégse",
      "close": "Bezárás",
      "newTitle": "Új szövegstílus",
      "styleName": "Stílusnév:",
      "ok": "OK"
    },
    "DimStyle": {
      "title": "Méretstílus-kezelő",
      "current": [
        "Aktuális méretstílus: ",
        [
          "name"
        ]
      ],
      "styles": "Stílusok:",
      "list": "Szűrőlista:",
      "allStyles": "Minden stílus",
      "stylesInUse": "Felhasznált stílusok",
      "setCurrent": "Aktuális",
      "new": "Új...",
      "modify": "Módosítás...",
      "close": "Bezárás",
      "menuSetCurrent": "Aktuális",
      "rename": "Átnevezés",
      "delete": "Törlés",
      "createTitle": "Új méretstílus létrehozása",
      "newStyleName": "Új stílus neve:",
      "startWith": "Alapja:",
      "continue": "Folytatás",
      "cancel": "Mégse",
      "newTitle": [
        "Új méretstílus: ",
        [
          "name"
        ]
      ],
      "modifyTitle": [
        "Méretstílus módosítása: ",
        [
          "name"
        ]
      ],
      "ok": "OK",
      "lines": "Vonalak",
      "symbolsAndArrows": "Jelek és nyilak",
      "text": "Szöveg",
      "fit": "Illesztés",
      "primaryUnits": "Elsődleges mértékegységek",
      "dimensionLines": "Méretvonalak",
      "baselineSpacing": "Méretvonalak távolsága:",
      "extensionLines": "Segédvonalak",
      "extendBeyondDimLines": "Túlnyúlás a méretvonalakon:",
      "offsetFromOrigin": "Eltolás a kezdőponttól:",
      "arrowheads": "Nyílfejek",
      "arrowSize": "Nyílfej mérete:",
      "centerMarks": "Középjelek",
      "none": "Nincs",
      "mark": "Jel",
      "textAppearance": "Szöveg megjelenése",
      "textHeight": "Szöveg magassága:",
      "textPlacement": "Szöveg elhelyezése",
      "offsetFromDimLine": "Eltolás a méretvonaltól:",
      "scaleForFeatures": "Méretobjektumok léptéke",
      "useOverallScale": "Globális lépték használata:",
      "fineTuning": "Finomhangolás",
      "drawDimLine": "Méretvonal a segédvonalak között",
      "linearDimensions": "Hosszméretek",
      "precision": "Pontosság:",
      "decimalSeparator": "Tizedesjel:",
      "comma": "',' (Vessző)",
      "period": "'.' (Pont)",
      "space": "' ' (Szóköz)",
      "zeroSuppression": "Nullák elnyomása",
      "trailing": "Hátul",
      "angularDimensions": "Szögméretek",
      "angularPrecision": "Pontosság:"
    },
    "Blocks": {
      "title": "Blokkok",
      "empty": "Nincs definiált blokk. Rajzoljon valamit, majd adja ki a BLOKK parancsot.",
      "currentDrawing": "Aktuális rajz",
      "currentDrawingBlocks": "Aktuális rajz blokkjai",
      "filterHint": "Szűrő...",
      "views": {
        "extraLarge": "Nagyon nagy ikon",
        "large": "Nagy ikon",
        "medium": "Közepes méretű ikon",
        "small": "Kis ikon",
        "list": "Lista"
      },
      "options": "Beállítások",
      "insertionPoint": "Beszúrási pont",
      "scale": "Lépték",
      "uniformScale": "Egységes lépték",
      "rotation": "Elforgatás",
      "angle": "Szög",
      "x": "X:",
      "y": "Y:",
      "z": "Z:"
    },
    "Properties": {
      "noSelection": "Nincs kiválasztás",
      "general": "Általános",
      "color": "Szín",
      "colorLabel": "A kijelölt objektumok színe",
      "layer": "Fólia",
      "layerLabel": "A kijelölt objektumok fóliája",
      "linetype": "Vonaltípus",
      "linetypeLabel": "A kijelölt objektumok vonaltípusa",
      "lineweight": "Vonalvastagság",
      "lineweightLabel": "A kijelölt objektumok vonalvastagsága",
      "style": "Stílus",
      "textStyleLabel": "A kijelölt objektumok szövegstílusa",
      "dimStyle": "Méretstílus",
      "dimStyleLabel": "A kijelölt objektumok méretstílusa",
      "varies": "*ELTÉRŐ*",
      "title": "Tulajdonságok",
      "objectType": "Objektumtípus",
      "currentLayerLabel": "Aktuális fólia",
      "currentColorLabel": "Aktuális szín",
      "currentLinetypeLabel": "Aktuális vonaltípus",
      "currentLineweightLabel": "Aktuális vonalvastagság",
      "lockedObjects": {
        "title": "Tulajdonságok - Zárolt objektumok",
        "instruction": "Egy vagy több kijelölt objektum zárolt, ezért nem frissíthető.",
        "content": [
          "A kiválasztási halmazból eltávolított objektumok száma: ",
          [
            "count",
            4
          ]
        ],
        "close": "Bezárás"
      },
      "selectColor": "Szín kiválasztása..."
    },
    "MText": {
      "unsavedChanges": {
        "title": "Bekezdéses szöveg – Nem mentett változtatások",
        "instruction": "Menti a szöveg módosításait?",
        "yes": "Igen",
        "no": "Nem",
        "cancel": "Mégse"
      }
    },
    "Palette": {
      "layers": "Fóliatulajdonság-kezelő",
      "close": "Bezárás",
      "options": "Tulajdonságok",
      "move": "Mozgatás",
      "size": "Átméretezés",
      "allowDocking": "Rögzítés engedélyezése",
      "anchorLeft": "Horgonyzás balra",
      "anchorRight": "Horgonyzás jobbra",
      "autoHide": "Automatikus elrejtés",
      "autoHideButton": "Automatikus elrejtés",
      "ctrlPrevents": "A rögzítés elkerüléséhez nyomja meg a Ctrl billentyűt.",
      "ctrlAllows": "Nyomja le a Ctrl billentyűt a rögzítés engedélyezéséhez.",
      "releasePrevents": "Engedje fel a Ctrl billentyűt a rögzítés megakadályozásához.",
      "resize": "Paletta szélessége"
    },
    "PointStyle": {
      "title": "Pont stílusa",
      "figures": "Pontmegjelenítési képek",
      "pointSize": "Pontméret:",
      "relative": "Méretbeállítás a képernyőhöz viszonyítva",
      "absolute": "Méretbeállítás abszolút egységekben",
      "percent": "%",
      "units": "Mértegys",
      "invalid": "Érvénytelen bevitel.",
      "ok": "OK",
      "cancel": "Mégse"
    }
  }
}
