// Generated from cs.json by `npm run locales`. Do not edit.
import type { EngineLocale } from "./types"

export const cs: EngineLocale = {
  "tag": "cs",
  "interface": {
    "tool": {
      "select": "Vybrat",
      "line": "Úsečka",
      "polyline": "Křivka",
      "polyline3d": "3D křivka",
      "circle": "Kružnice",
      "circlediameter": "Kružnice, Střed, Průměr",
      "circle2p": "Kružnice, 2 body",
      "circle3p": "Kružnice, 3 body",
      "arc": "Oblouk",
      "arcsce": "Oblouk, počátek, střed, konec",
      "arccse": "Oblouk, střed, počátek, konec",
      "ellipse": "Elipsa",
      "ellipsecenter": "Elipsa, Střed",
      "ellipsearc": "Eliptický oblouk",
      "spline": "Spline",
      "splinedit": "Upravit spline",
      "pedit": "Upravit křivku",
      "splinefit": "Interpolace spline",
      "splinecv": "Řídicí vrcholy křivky spline",
      "rectangle": "Obdélník",
      "polygon": "Polygon",
      "hatch": "Šrafování",
      "block": "Vytvořit blok",
      "insert": "Vložit blok",
      "attedit": "Upravit atributy",
      "attdef": "Definovat atributy",
      "attdisp": "Zobrazení atributů",
      "purge": "Čistit",
      "text": "Text",
      "mtext": "Víceřádkový text",
      "textedit": "Upravit text",
      "dimlinear": "Přímá",
      "dimaligned": "Šikmá",
      "dimhorizontal": "Horizontální",
      "dimvertical": "Vertikální",
      "dimrotated": "OTOČENÁ",
      "dimradius": "Poloměr",
      "dimdiameter": "Průměr",
      "dimangular": "Úhlová",
      "dimbaseline": "Od základny",
      "dimcontinue": "Pokračovat",
      "dimspace": "Nastavit mezeru",
      "offset": "Odsazení",
      "move": "Posun",
      "copy": "Kopírovat",
      "stretch": "Protáhnout",
      "rotate": "Otočit",
      "scale": "Měřítko",
      "mirror": "Zrcadlit",
      "arraycommand": "Pole",
      "array": "Obdélníkové pole",
      "arraypolar": "Polární pole",
      "arraypath": "Křivkové pole",
      "trim": "Oříznout",
      "extend": "Prodloužit",
      "fillet": "Zaoblit",
      "chamfer": "Zkosit",
      "erase": "Vymazat",
      "explode": "Rozložit",
      "join": "Spojit",
      "break": "Přerušit",
      "breakatpoint": "Přerušit v bodě",
      "matchprop": "Kopírovat vlastnosti",
      "chprop": "Změnit vlastnosti",
      "copyclip": "Kopírovat",
      "cutclip": "Vyjmout",
      "copybase": "Kopírovat se základním bodem",
      "paste": "Vložit",
      "measure": "Odměřit",
      "measurearea": "Plocha",
      "id": "Souřadnice bodu",
      "list": "Výpis",
      "massprop": "Hmotové vlastnosti tělesa/oblasti",
      "zoom": "Zoom",
      "pan": "Posun pohledu",
      "dashpan": "Posun pohledu, Bod",
      "dashdimstyle": "Kótovací styl (příkazový řádek)",
      "ucs": "USS",
      "ucsicon": "Ikona USS",
      "fill": "Výplň",
      "ucsiconvariable": "Ikona USS (proměnná)",
      "plan": "Půdorys",
      "elev": "Výška",
      "vpoint": "Směr pohledu",
      "view": "Přednastavené pohledy",
      "orbit": "3D orbit",
      "navvcube": "ViewCube",
      "vscurrent": "Vizuální styly",
      "regen": "Regeneruj",
      "regenall": "Regeneruj vše",
      "ltscale": "Měřítko typu čáry",
      "auprec": "Přesnost úhlů",
      "setvar": "System Variables",
      "undo": "Zpět",
      "mredo": "Vícenásobné znovu",
      "osnap": "Režimy uchopování objektů",
      "color": "Barva",
      "linetype": "Typ čáry",
      "dashlayer": "Hladina (příkazový řádek)",
      "lweight": "Tloušťka čáry",
      "snap": "Režim kroku",
      "region": "Oblast",
      "union": "Sjednocení",
      "subtract": "Rozdíl",
      "box": "Kvádr",
      "wedge": "Klín",
      "pyramid": "Jehlan",
      "cylinder": "Válec",
      "cone": "Kužel",
      "sphere": "Koule",
      "torus": "Anuloid",
      "intersect": "Průnik",
      "extrude": "Vytáhnout",
      "revolve": "Rotace",
      "presspull": "Klikněte a potáhněte",
      "slice": "Odříznout",
      "section": "Průřez",
      "filletedge": "Zaoblit hranu",
      "chamferedge": "Zkosit hranu",
      "solidedit": "Úprava těles",
      "solideditextrude": "Vytáhnout plochy",
      "solideditmove": "Posunout plochy",
      "solideditrotate": "Otočit plochy",
      "solideditoffset": "Ekvidistanta ploch",
      "solidedittaper": "Zešikmit plochy",
      "solideditdelete": "Odstranit plochy",
      "solideditcopy": "Kopírovat plochy",
      "point": "Více bodů",
      "divide": "Dělit na úseky",
      "measuresegments": "Dělit v měřítku",
      "ptype": "Styl bodu",
      "solid": "2D těleso",
      "face3d": "3D plocha",
      "leader": "Odkaz",
      "wipeout": "Překrytí",
      "xline": "Konstrukční přímka",
      "ray": "Polopřímka"
    },
    "description": {
      "U": "Vrátí poslední akci",
      "REDO": "Vrátí účinek předchozího příkazu ZPĚT nebo Z",
      "SNAP": "Omezí pohyb kurzoru na zadané intervaly kroku",
      "-OSNAP": "Nastaví průběžné režimy uchopení objektů",
      "FROM": "Nalezne bod ve vzdálenosti od referenčního bodu",
      "NEW": "Vytvoří nový výkresový soubor",
      "QNEW": "Vytvoří nový výkresový soubor",
      "QSAVE": "Uloží aktuální výkres",
      "SAVEAS": "Uloží kopii aktuálního výkresu pod novým názvem",
      "SAVE": "Uloží aktuální výkres",
      "OPEN": "Otevře stávající výkresový soubor",
      "DXFIN": "Otevře soubor DXF",
      "DXFOUT": "Uloží výkres do souboru DXF",
      "PASTECLIP": "Vloží objekty ze schránky do aktuálního výkresu",
      "DIMSTYLE": "Vytvoří a modifikuje kótovací styly",
      "STYLE": "Vytváří, modifikuje nebo určuje styly textu",
      "INSERT": "Vloží blok z palety Bloky",
      "BLOCKSPALETTE": "Zobrazí paletu Bloky",
      "PURGE": "Odebere z výkresu nepoužívané definice bloků",
      "LAYER": "Spravuje hladiny a jejich vlastnosti",
      "LAYERCLOSE": "Zavře Správce vlastností hladiny",
      "PROPERTIES": "Zobrazí vlastnosti vybraných objektů",
      "PROPERTIESCLOSE": "Zavře paletu Vlastnosti",
      "UNITS": "Řídí zobrazenou přesnost a formát souřadnic a vzdáleností",
      "CLEANSCREENON": "Odstraní z obrazovky panely nástrojů a palety",
      "CLEANSCREENOFF": "Obnoví zobrazení do stavu před vyčištěním obrazovky"
    },
    "snap": {
      "endpoint": "Koncový",
      "midpoint": "Polovina",
      "center": "Střed",
      "node": "Uzel",
      "intersection": "Průsečík",
      "apparentIntersection": "Zdánlivý průsečík",
      "perpendicular": "Kolmo",
      "tangent": "Tečna",
      "insertion": "Vložení",
      "extension": "Protažení",
      "parallel": "Rovnoběžně",
      "quadrant": "Kvadrant",
      "nearest": "Nejbližší"
    },
    "color": {
      "red": "Červená",
      "yellow": "Žlutá",
      "green": "Zelená",
      "cyan": "SvModrá",
      "blue": "Modrá",
      "magenta": "Fialová",
      "white": "Bílá"
    },
    "byLayer": "DleHlad",
    "view": {
      "Top": "Horní",
      "Bottom": "Dolní",
      "Front": "Přední",
      "BAck": "Zadní",
      "Left": "Levý",
      "Right": "Pravý",
      "SWiso": "JZ iso",
      "SEiso": "JV iso",
      "NEiso": "SV iso",
      "NWiso": "SZ iso",
      "custom": "Uživatelský pohled"
    },
    "viewCube": {
      "face": {
        "top": "SHORA",
        "bottom": "ZDOLA",
        "front": "ZEPŘEDU",
        "back": "ZEZADU",
        "left": "ZLEVA",
        "right": "ZPRAVA"
      },
      "compass": {
        "N": "S",
        "E": "V",
        "S": "J",
        "W": "Z"
      }
    },
    "entity": {
      "line": [
        [
          "count",
          2,
          {
            "one": "Úsečka",
            "few": "Úsečky",
            "many": "Úsečky",
            "other": "Úsečky"
          }
        ]
      ],
      "circle": [
        [
          "count",
          2,
          {
            "one": "Kružnice",
            "few": "Kružnice",
            "many": "Kružnice",
            "other": "Kružnice"
          }
        ]
      ],
      "arc": [
        [
          "count",
          2,
          {
            "one": "Oblouk",
            "few": "Oblouky",
            "many": "Oblouky",
            "other": "Oblouky"
          }
        ]
      ],
      "ellipse": [
        [
          "count",
          2,
          {
            "one": "Elipsa",
            "few": "Elipsy",
            "many": "Elipsy",
            "other": "Elipsy"
          }
        ]
      ],
      "spline": [
        [
          "count",
          2,
          {
            "one": "Spline",
            "few": "Spline",
            "many": "Spline",
            "other": "Spline"
          }
        ]
      ],
      "polyline": [
        [
          "count",
          2,
          {
            "one": "Křivka",
            "few": "Křivky",
            "many": "Křivky",
            "other": "Křivky"
          }
        ]
      ],
      "polyline3d": [
        [
          "count",
          2,
          {
            "one": "3D křivka",
            "few": "3D křivky",
            "many": "3D křivky",
            "other": "3D křivky"
          }
        ]
      ],
      "text": [
        [
          "count",
          2,
          {
            "one": "Text",
            "few": "Texty",
            "many": "Texty",
            "other": "Texty"
          }
        ]
      ],
      "mtext": [
        [
          "count",
          2,
          {
            "one": "MText",
            "few": "MTexty",
            "many": "MTexty",
            "other": "MTexty"
          }
        ]
      ],
      "attdef": [
        [
          "count",
          2,
          {
            "one": "Definovat atribut",
            "few": "Definovat atribut",
            "many": "Definovat atribut",
            "other": "Definovat atribut"
          }
        ]
      ],
      "dimension": [
        [
          "count",
          2,
          {
            "one": "Kóta",
            "few": "Kóty",
            "many": "Kóty",
            "other": "Kóty"
          }
        ]
      ],
      "hatch": [
        [
          "count",
          2,
          {
            "one": "Šrafy",
            "few": "Šrafy",
            "many": "Šrafy",
            "other": "Šrafy"
          }
        ]
      ],
      "insert": [
        [
          "count",
          2,
          {
            "one": "Reference bloku",
            "few": "Reference bloku",
            "many": "Reference bloku",
            "other": "Reference bloku"
          }
        ]
      ],
      "solid3d": [
        [
          "count",
          2,
          {
            "one": "3D těleso",
            "few": "3D tělesa",
            "many": "3D tělesa",
            "other": "3D tělesa"
          }
        ]
      ],
      "region": [
        [
          "count",
          2,
          {
            "one": "Oblast",
            "few": "Oblasti",
            "many": "Oblasti",
            "other": "Oblasti"
          }
        ]
      ],
      "point": [
        [
          "count",
          2,
          {
            "one": "Bod",
            "few": "Body",
            "many": "Body",
            "other": "Body"
          }
        ]
      ],
      "solid2d": [
        [
          "count",
          2,
          {
            "one": "Deska",
            "few": "Desky",
            "many": "Desky",
            "other": "Desky"
          }
        ]
      ],
      "face3d": [
        [
          "count",
          2,
          {
            "one": "3D plocha",
            "few": "3D plochy",
            "many": "3D plochy",
            "other": "3D plochy"
          }
        ]
      ],
      "leader": [
        [
          "count",
          2,
          {
            "one": "Pozice",
            "few": "Pozice",
            "many": "Pozice",
            "other": "Pozice"
          }
        ]
      ],
      "wipeout": [
        [
          "count",
          2,
          {
            "one": "Překrytí",
            "few": "Překrytí",
            "many": "Překrytí",
            "other": "Překrytí"
          }
        ]
      ],
      "image": [
        [
          "count",
          2,
          {
            "one": "Rastrový obrázek",
            "few": "Rastrové obrázky",
            "many": "Rastrového obrázku",
            "other": "Rastrových obrázků"
          }
        ]
      ],
      "table": [
        [
          "count",
          2,
          {
            "one": "Tabulka",
            "few": "Tabulky",
            "many": "Tabulky",
            "other": "Tabulek"
          }
        ]
      ],
      "mleader": [
        [
          "count",
          2,
          {
            "one": "Multiodkaz",
            "few": "Multiodkazy",
            "many": "Multiodkazu",
            "other": "Multiodkazů"
          }
        ]
      ],
      "xline": [
        [
          "count",
          2,
          {
            "one": "Přímka",
            "few": "Přímky",
            "many": "Přímky",
            "other": "Přímky"
          }
        ]
      ],
      "ray": [
        [
          "count",
          2,
          {
            "one": "Polopřímka",
            "few": "Polopřímky",
            "many": "Polopřímky",
            "other": "Polopřímky"
          }
        ]
      ]
    },
    "array": {
      "rectangular": "Pole (obdélníkové)",
      "polar": "Pole (polární)",
      "path": "Pole (cesta)"
    },
    "property": {
      "title": {
        "ellipticalArc": "Eliptický oblouk",
        "objects": [
          [
            "count",
            2,
            {
              "one": [
                0,
                " objekt"
              ],
              "few": [
                0,
                " objekty"
              ],
              "many": [
                0,
                " objektu"
              ],
              "other": [
                0,
                " objektů"
              ]
            }
          ]
        ],
        "all": [
          "Vše (",
          [
            "count"
          ],
          ")"
        ],
        "type": [
          [
            "type"
          ],
          " (",
          [
            "count"
          ],
          ")"
        ],
        "linearDimension": "Otočená kóta",
        "alignedDimension": "Šikmá kóta",
        "angularDimension": "Kóta úhlu",
        "radiusDimension": "Kóta radiální",
        "diameterDimension": "Kóta průměru"
      },
      "group": {
        "geometry": "Geometrie",
        "solidHistory": "Historie tělesa",
        "endpoints": "Koncové body",
        "center": "Střed",
        "text": "Text",
        "position": "Poloha",
        "dimension": "Kóta",
        "definitionPoints": "Body definice",
        "pattern": "Vzor",
        "block": "Blok",
        "attributes": "Atributy",
        "misc": "Různé",
        "dataPoints": "Datové body",
        "selection": "Výběr",
        "linesArrows": "Čáry a šipky",
        "fit": "Přizpůsobit",
        "primaryUnits": "Primární jednotky"
      },
      "row": {
        "length": "Délka",
        "angle": "Úhel",
        "deltaX": "Rozdíl X",
        "deltaY": "Rozdíl Y",
        "deltaZ": "Rozdíl Z",
        "startX": "Počátek X",
        "startY": "Počátek Y",
        "startZ": "Počátek Z",
        "endX": "Konec X",
        "endY": "Konec Y",
        "endZ": "Konec Z",
        "centerX": "Střed X",
        "centerY": "Střed Y",
        "centerZ": "Střed Z",
        "radius": "Poloměr",
        "diameter": "Průměr",
        "circumference": "Obvod",
        "area": "Plocha",
        "normalX": "Normála X",
        "normalY": "Normála Y",
        "normalZ": "Normála Z",
        "x": "X",
        "y": "Y",
        "z": "Z",
        "elevation": "Výška",
        "thickness": "Tloušťka",
        "linetypeScale": "Měřítko typu čáry",
        "startAngle": "Poč. úhel",
        "endAngle": "Konc. úhel",
        "totalAngle": "Celk. úhel",
        "arcLength": "Délka oblouku",
        "majorRadius": "Hlavní poloměr",
        "minorRadius": "Vedlejší poloměr",
        "radiusRatio": "Poměr poloměrů",
        "majorAxisVectorX": "Vektor hlavní osy X",
        "majorAxisVectorY": "Vektor hlavní osy Y",
        "majorAxisVectorZ": "Vektor hlavní osy Z",
        "minorAxisVectorX": "Vektor vedlejší osy X",
        "minorAxisVectorY": "Vektor vedlejší osy Y",
        "minorAxisVectorZ": "Vektor vedlejší osy Z",
        "vertices": "Vrcholy",
        "segments": "Segmenty",
        "solidType": "Typ tělesa",
        "baseRadius": "Poloměr základny",
        "topRadius": "Horní poloměr",
        "sides": "Strany",
        "elliptical": "Eliptická",
        "baseMajorRadius": "Hlavní poloměr základny",
        "baseMinorRadius": "Vedlejší poloměr základny",
        "topMajorRadius": "Horní hlavní poloměr",
        "topMinorRadius": "Horní vedlejší poloměr",
        "torusRadius": "Poloměr anuloidu",
        "tubeRadius": "Poloměr roury",
        "currentVertex": "Aktuální vrchol",
        "vertex": "Vrchol",
        "startSegmentWidth": "Počáteční šířka segmentu",
        "endSegmentWidth": "Koncová šířka segmentu",
        "globalWidth": "Globální šířka",
        "closed": "Uzavřená",
        "contents": "Obsah",
        "justify": "Zarovnání",
        "height": "Výška",
        "taperAngle": "Úhel zúžení",
        "angleOfRevolution": "Úhel otáčení",
        "axisDirectionX": "Směr osy X",
        "axisDirectionY": "Směr osy Y",
        "axisDirectionZ": "Směr osy Z",
        "history": "Historie",
        "rotation": "Natočení",
        "lineSpaceFactor": "Faktor řádkování",
        "lineSpaceDistance": "Rozteč řádků",
        "lineSpaceStyle": "Styl řádkování",
        "definedWidth": "Definice šířky",
        "textHeight": "Výška textu",
        "textAlignmentX": "Zarovnání textu X",
        "textAlignmentY": "Zarovnání textu Y",
        "textAlignmentZ": "Zarovnání textu Z",
        "measurement": "Míra",
        "textOverride": "Přepsání textu",
        "type": "Typ",
        "vertexX": "Vrchol X",
        "vertexY": "Vrchol Y",
        "vertexZ": "Vrchol Z",
        "fitSmooth": "Vyhlazení",
        "firstX": "První bod X",
        "firstY": "První bod Y",
        "secondX": "Druhý bod X",
        "secondY": "Druhý bod Y",
        "pattern": "Vzor",
        "scale": "Měřítko",
        "boundaries": "Hranice",
        "patternName": "Název vzoru",
        "annotative": "Poznámky",
        "originX": "Počátek X",
        "originY": "Počátek Y",
        "associative": "Asociativní",
        "islandDetectionStyle": "Způsob detekce ostrůvků",
        "edge1": "Hrana 1",
        "edge2": "Hrana 2",
        "edge3": "Hrana 3",
        "edge4": "Hrana 4",
        "gradientName": "Název gradientu",
        "color1": "Barva 1",
        "color2": "Barva 2",
        "gradientAngle": "Úhel gradientu",
        "centered": "Středově",
        "cumulativeArea": "Kumulativní oblast",
        "name": "Název",
        "tag": "Štítek",
        "prompt": "Výzva",
        "value": "Hodnota",
        "invisible": "Neviditelný",
        "constant": "Konstantní",
        "verify": "Ověřovaný",
        "preset": "Přednastavený",
        "lockPosition": "Uzamknout polohu",
        "method": "Způsob",
        "degree": "Stupeň",
        "knotParameterization": "Parametrizace uzlů",
        "numberOfFitPoints": "Počet bodů vyhlazení",
        "currentFitPoint": "Aktuální bod vyhlazení",
        "fitPointX": "Bod vyhlazení X",
        "fitPointY": "Bod vyhlazení Y",
        "fitPointZ": "Bod vyhlazení Z",
        "numberOfControlPoints": "Počet řídících bodů",
        "currentControlPoint": "Aktuální řídící bod",
        "controlPointX": "Řídicí bod X",
        "controlPointY": "Řídicí bod Y",
        "controlPointZ": "Řídicí bod Z",
        "weight": "Váha",
        "width": "Šířka",
        "cvFrame": "Rámeček řídicího vrcholu",
        "periodic": "Periodická",
        "planar": "Rovinná",
        "startTangentVectorX": "Počáteční tečna X",
        "startTangentVectorY": "Počáteční tečna Y",
        "startTangentVectorZ": "Počáteční tečna Z",
        "endTangentVectorX": "Koncová tečna X",
        "endTangentVectorY": "Koncová tečna Y",
        "endTangentVectorZ": "Koncová tečna Z",
        "fitTolerance": "Tolerance vyhlazení",
        "positionX": "Umístění X",
        "positionY": "Umístění Y",
        "positionZ": "Umístění Z",
        "basePointX": "Refbod X",
        "basePointY": "Refbod Y",
        "basePointZ": "Refbod Z",
        "secondPointX": "Druhý bod X",
        "secondPointY": "Druhý bod Y",
        "secondPointZ": "Druhý bod Z",
        "directionVectorX": "Směrový vektor X",
        "directionVectorY": "Směrový vektor Y",
        "directionVectorZ": "Směrový vektor Z",
        "scaleX": "Měřítko X",
        "scaleY": "Měřítko Y",
        "scaleZ": "Měřítko Z",
        "showHistory": "Zobrazit historii",
        "baseX": "Ref. bod X",
        "baseY": "Ref. bod Y",
        "baseZ": "Ref. bod Z",
        "pathLength": "Délka cesty",
        "columns": "Sloupce",
        "columnSpacing": "Rozteč sloupců",
        "rows": "Řádky",
        "rowSpacing": "Rozteč řad",
        "rowElevationIncrement": "Přírůstek výšky řádku",
        "levels": "Úrovně",
        "levelSpacing": "Odsazení úrovní",
        "includedAxisAngle": "Sevřený úhel osy",
        "direction": "Směr",
        "items": "Prvky",
        "angleBetweenItems": "Úhel mezi prvky",
        "fillAngle": "Úhel vyplnění",
        "rotateItems": "Otáčet objekty",
        "itemSpacing": "Rozteč prvků",
        "alignItems": "Zarovnat prvky",
        "arrowSize": "Velikost šipky",
        "centerMarkSize": "Velikost středové značky",
        "extLineExt": "Přesah vynášecí čáry",
        "extLineOffset": "Odsazení vynášecí čáry",
        "textOffset": "Posun textu",
        "textPositionX": "Umístění textu X",
        "textPositionY": "Umístění textu Y",
        "textRotation": "Otočení textu",
        "dimScaleOverall": "Celkové měřítko kóty",
        "decimalSeparator": "Desetinný oddělovač",
        "suppressTrailingZeros": "Potlačení koncových nul",
        "precision": "Přesnost",
        "perimeter": "Obvod",
        "arrow": "Šipka",
        "textPosVert": "Vertikální poloha textu"
      },
      "value": {
        "yes": "Ano",
        "no": "Ne",
        "none": "—",
        "fitNone": "Žádné",
        "atLeast": "Nejméně",
        "exactly": "Přesně",
        "fitPoints": "Přizpůsobit",
        "controlVertices": "Řídicí vrcholy",
        "box": "Kvádr",
        "wedge": "Klín",
        "pyramid": "Jehlan",
        "inscribed": "Vepsané",
        "circumscribed": "Opsané",
        "cylinder": "Válec",
        "cone": "Kužel",
        "sphere": "Koule",
        "torus": "Anuloid",
        "chord": "Tětiva",
        "sqrtChord": "Odmocnina",
        "uniform": "Rovnoměrné",
        "custom": "Vlastní",
        "show": "Zobrazit",
        "hide": "Skrýt",
        "counterClockwise": "Proti směru hodinových ručiček",
        "clockwise": "Ve směru hodinových ručiček",
        "divide": "Rozdělit",
        "historyNone": "Žádný",
        "measure": "Měření",
        "predefined": "Předdefinovaný",
        "userDefined": "Uživatelsky definovaný",
        "customPattern": "Vlastní",
        "edgeVisible": "Viditelná",
        "edgeHidden": "Skrytá",
        "gradient": "Gradient",
        "gradientLinear": "Lineární",
        "gradientCylinder": "Válcový",
        "gradientInvCylinder": "Inverzní válcový",
        "gradientSpherical": "Kulový",
        "gradientHemispherical": "Půlkulový",
        "gradientCurved": "Křivkový",
        "gradientInvSpherical": "Inverzní kulový",
        "gradientInvHemispherical": "Inverzní půlkulový",
        "gradientInvCurved": "Inverzní křivkový",
        "outer": "Vnější",
        "extrusion": "Vytažení",
        "revolve": "Otočení",
        "lineWithNoArrow": "Čára bez šipky",
        "splineWithNoArrow": "Spline bez šipky",
        "lineWithArrow": "Čára se šipkou",
        "splineWithArrow": "Spline se šipkou",
        "closedFilled": "Uzavřený vyplněný",
        "centered": "Centrováno",
        "above": "Nad"
      },
      "justify": {
        "left": "Levý",
        "center": "Centr",
        "right": "Pravý",
        "middle": "Střední",
        "tl": "Horní levý",
        "tc": "Horní centr",
        "tr": "Horní pravý",
        "ml": "Střední levý",
        "mc": "Střední centr",
        "mr": "Střední pravý",
        "bl": "Dolní levý",
        "bc": "Dolní centr",
        "br": "Dolní pravý"
      },
      "dimensionKind": {
        "linear": "Přímá",
        "aligned": "Šikmá",
        "angular": "Úhlová",
        "radius": "Poloměr",
        "diameter": "Průměr"
      }
    }
  },
  "commands": {
    "names": {
      "LINE": [
        "ÚSEČKA",
        "U"
      ],
      "XLINE": [
        "PŘÍMKA",
        "PK"
      ],
      "RAY": [
        "POLOPŘÍMKA"
      ],
      "PLINE": [
        "KŘIVKA",
        "K"
      ],
      "3DFACE": [
        "3DPLOCHA",
        "3L"
      ],
      "3DPOLY": [
        "3DKŘIVKA",
        "3K"
      ],
      "CIRCLE": [
        "KRUŽNICE",
        "KR"
      ],
      "CIRCLED": [
        "KRUŽNICEP"
      ],
      "CIRCLE2P": [
        "KRUŽNICE2B"
      ],
      "CIRCLE3P": [
        "KRUŽNICE3B"
      ],
      "ARC": [
        "OBLOUK",
        "O"
      ],
      "ARCSCE": [
        "OBLOUKPSK"
      ],
      "ARCCSE": [
        "OBLOUKSPK"
      ],
      "ELLIPSE": [
        "ELIPSA",
        "EL"
      ],
      "ELLIPSEC": [
        "ELIPSAS"
      ],
      "ELLIPSEARC": [
        "ELIPSAOBLOUK"
      ],
      "SPLINE": [
        "SPLINE",
        "SPL"
      ],
      "SPLINEDIT": [
        "SPLINEDIT",
        "SPE"
      ],
      "PEDIT": [
        "KEDIT",
        "KE"
      ],
      "RECTANG": [
        "OBD",
        "OBDÉLNÍK"
      ],
      "POLYGON": [
        "POLYGON",
        "POL"
      ],
      "HATCH": [
        "ŠRAFY",
        "HS",
        "SF",
        "HŠRAFY"
      ],
      "-HATCH": [
        "-ŠRAFY",
        "-HS",
        "-SF"
      ],
      "BLOCK": [
        "BLOK",
        "B",
        "ACADBLOCKDIALOG",
        "BVYTVOŘ",
        "VYTVOŘB",
        "BMOD"
      ],
      "-BLOCK": [
        "-BLOK",
        "-B"
      ],
      "INSERT": [
        "VLOŽ",
        "VL",
        "VLOŽURL"
      ],
      "-INSERT": [
        "-VLOŽ",
        "-VL"
      ],
      "ATTEDIT": [
        "ATREDIT",
        "ATE",
        "DIATR"
      ],
      "EATTEDIT": [
        "EATREDIT"
      ],
      "ATTDEF": [
        "ATRDEF",
        "AT",
        "DDATTDEF",
        "DIATRDEF"
      ],
      "-ATTDEF": [
        "-ATRDEF",
        "-AT"
      ],
      "ATTDISP": [
        "ATRDISP"
      ],
      "TEXT": [
        "TEXT",
        "DT",
        "DTEXT"
      ],
      "-TEXT": [
        "-TEXT"
      ],
      "MTEXT": [
        "MTEXT",
        "MT",
        "T"
      ],
      "-MTEXT": [
        "-MTEXT",
        "-T"
      ],
      "TEXTEDIT": [
        "TEXTEDIT",
        "TED",
        "DIAEDIT",
        "ED"
      ],
      "DIMLINEAR": [
        "KÓTYPŘÍM",
        "KPM",
        "KOTYPM"
      ],
      "DIMALIGNED": [
        "KÓTYSROVNEJ",
        "KSO",
        "KOTYSO"
      ],
      "DIMHORIZONTAL": [
        "KÓTYHORIZ"
      ],
      "DIMVERTICAL": [
        "KÓTYVERT"
      ],
      "DIMROTATED": [
        "KÓTYOTOČ"
      ],
      "DIMRADIUS": [
        "KÓTYRÁDIUS",
        "KRA",
        "KOTYRA"
      ],
      "DIMDIAMETER": [
        "KÓTYPRŮM",
        "KPR",
        "KOTYPR"
      ],
      "DIMANGULAR": [
        "KÓTYÚHEL",
        "KUH",
        "KOTYUH"
      ],
      "DIMBASELINE": [
        "KÓTYZÁKL",
        "KZA",
        "KOTYZA"
      ],
      "DIMCONTINUE": [
        "KÓTYŘET",
        "KRE",
        "KOTYRE"
      ],
      "DIMSPACE": [
        "KÓTMEZERA"
      ],
      "OFFSET": [
        "EKVID",
        "E"
      ],
      "MOVE": [
        "POSUN",
        "POS"
      ],
      "COPY": [
        "KOPIE",
        "KO"
      ],
      "STRETCH": [
        "PROTÁHNI",
        "PT"
      ],
      "ROTATE": [
        "OTOČ",
        "OT"
      ],
      "SCALE": [
        "MĚŘÍTKO",
        "ME"
      ],
      "MIRROR": [
        "ZRCADLI",
        "ZI"
      ],
      "ARRAY": [
        "POLE",
        "PO"
      ],
      "ARRAYRECT": [
        "OBDPOLE"
      ],
      "ARRAYPOLAR": [
        "POLÁRPOLE"
      ],
      "ARRAYPATH": [
        "KŘIVPOLE"
      ],
      "TRIM": [
        "OŘEŽ",
        "OR"
      ],
      "EXTEND": [
        "PRODLUŽ",
        "PD"
      ],
      "FILLET": [
        "ZAOBLI",
        "ZA"
      ],
      "CHAMFER": [
        "ZKOS",
        "ZK"
      ],
      "EXPLODE": [
        "ROZLOŽ",
        "X"
      ],
      "JOIN": [
        "SPOJ"
      ],
      "BREAK": [
        "PŘERUŠ",
        "PR"
      ],
      "BREAKATPOINT": [
        "PŘERUŠVBODĚ"
      ],
      "MATCHPROP": [
        "KOPIEVLAST",
        "KV",
        "FORMÁT",
        "PAINTER"
      ],
      "CHPROP": [
        "ZMĚNAV"
      ],
      "COPYCLIP": [
        "SKOPIE"
      ],
      "CUTCLIP": [
        "VYJMIS"
      ],
      "COPYBASE": [
        "SKOPIEREF"
      ],
      "DIST": [
        "VZD",
        "VZ"
      ],
      "AREA": [
        "PLOCHA",
        "PL"
      ],
      "ID": [
        "ID"
      ],
      "LIST": [
        "VÝPIS",
        "VY",
        "UKAŽMAT"
      ],
      "MASSPROP": [
        "HMOTV"
      ],
      "ZOOM": [
        "ZOOM",
        "ZO"
      ],
      "PAN": [
        "PP",
        "P"
      ],
      "-PAN": [
        "-PP",
        "-P"
      ],
      "ERASE": [
        "VYMAŽ",
        "V",
        "DELETE"
      ],
      "U": [
        "Z"
      ],
      "UNDO": [
        "ZPĚT"
      ],
      "REDO": [
        "ZNOVA"
      ],
      "MREDO": [
        "NZNOVA"
      ],
      "SNAP": [
        "KROK"
      ],
      "-OSNAP": [
        "-UCHOP",
        "-UC"
      ],
      "FROM": [
        "ODBODU"
      ],
      "NEW": [
        "NOVÝ"
      ],
      "QNEW": [
        "RNOVÝ"
      ],
      "QSAVE": [
        "RULOŽ"
      ],
      "SAVEAS": [
        "ULOŽJAKO"
      ],
      "SAVE": [
        "ULOŽ",
        "ULOŽURL"
      ],
      "OPEN": [
        "OTEVŘI",
        "OTEVŘIURL"
      ],
      "DXFIN": [
        "ČTIDXF"
      ],
      "DXFOUT": [
        "PIŠDXF"
      ],
      "PASTECLIP": [
        "SVLOŽ"
      ],
      "DIMSTYLE": [
        "KÓTYSTYL",
        "KSL",
        "KOTYSL",
        "DIAKÓTY"
      ],
      "-DIMSTYLE": [
        "-KÓTYSTYL"
      ],
      "STYLE": [
        "PÍSMO",
        "PSM",
        "DIAPÍSMO"
      ],
      "BLOCKSPALETTE": [
        "PALETABLOKY"
      ],
      "PURGE": [
        "ČISTI",
        "CI"
      ],
      "-PURGE": [
        "-ČISTI"
      ],
      "LAYER": [
        "HLADINA",
        "HL",
        "DDLMODES",
        "DIAHLAD"
      ],
      "LAYERCLOSE": [
        "HLADZAVŘI"
      ],
      "PROPERTIES": [
        "VLASTNOSTI",
        "VLA",
        "VLAST",
        "VT"
      ],
      "PROPERTIESCLOSE": [
        "ZAVŘIVL",
        "VLZAV"
      ],
      "UCS": [
        "USS"
      ],
      "UCSICON": [
        "USSI"
      ],
      "FILL": [
        "VYPLNĚNÍ"
      ],
      "PLAN": [
        "PŮDORYS"
      ],
      "ELEV": [
        "ZDVIH",
        "ZD"
      ],
      "VPOINT": [
        "OKO",
        "DIAOKO",
        "BP"
      ],
      "-VPOINT": [
        "-OKO",
        "-BP"
      ],
      "VIEW": [
        "POHLED",
        "PH",
        "DIAPOHLED"
      ],
      "-VIEW": [
        "-POHLED",
        "-PH"
      ],
      "3DORBIT": [
        "3DORBIT",
        "3DO",
        "ORBIT"
      ],
      "NAVVCUBE": [
        "NAVVCUBE",
        "CUBE"
      ],
      "VSCURRENT": [
        "AKTUÁLNÍVS",
        "VC"
      ],
      "REGEN": [
        "REGEN",
        "RE"
      ],
      "REGENALL": [
        "REGENV",
        "REV"
      ],
      "UNITS": [
        "JEDNOTKY",
        "JN",
        "DIAJEDN"
      ],
      "LTSCALE": [
        "TČMĚŘ",
        "TCM"
      ],
      "AUPREC": [
        "AUPREC"
      ],
      "SETVAR": [
        "SYSPAR",
        "SPA"
      ],
      "CLEANSCREENON": [
        "ČISTÁOBRAZOVKAANO"
      ],
      "CLEANSCREENOFF": [
        "ČISTÁOBRAZOVKANE"
      ],
      "COLOR": [
        "BARVA",
        "BAR",
        "DDCOLOR",
        "DIABARVA"
      ],
      "-COLOR": [
        "-BARVA"
      ],
      "LINETYPE": [
        "TYPČ",
        "TC",
        "DDLTYPE",
        "DIATYPČ"
      ],
      "-LINETYPE": [
        "-TYPČ",
        "-TC"
      ],
      "-LAYER": [
        "-HLADINA",
        "-HL"
      ],
      "LWEIGHT": [
        "TLČÁRY",
        "TLČ"
      ],
      "-LWEIGHT": [
        "-TLČÁRY"
      ],
      "BOX": [
        "KVÁDR"
      ],
      "WEDGE": [
        "KLÍN",
        "KL"
      ],
      "PYRAMID": [
        "JEHLAN",
        "JE"
      ],
      "CYLINDER": [
        "VÁLEC",
        "VAL"
      ],
      "CONE": [
        "KUŽEL"
      ],
      "SPHERE": [
        "KOULE"
      ],
      "TORUS": [
        "ANULOID",
        "ANU"
      ],
      "REGION": [
        "OBLAST",
        "OBL"
      ],
      "UNION": [
        "SJEDNOCENÍ",
        "SJE"
      ],
      "SUBTRACT": [
        "ROZDÍL",
        "RZ"
      ],
      "INTERSECT": [
        "PRŮNIK",
        "PN"
      ],
      "EXTRUDE": [
        "VYTÁHNI",
        "VYT"
      ],
      "REVOLVE": [
        "OROTUJ",
        "ORT"
      ],
      "PRESSPULL": [
        "TLAČTÁHNI"
      ],
      "SLICE": [
        "ODŘÍZNI",
        "OZ"
      ],
      "SECTION": [
        "PRŮŘEZ",
        "PRU"
      ],
      "FILLETEDGE": [
        "ZAOBLIHRANU"
      ],
      "CHAMFEREDGE": [
        "ZKOSHRANU"
      ],
      "SOLIDEDIT": [
        "OBJEDIT"
      ],
      "POINT": [
        "BOD",
        "BO"
      ],
      "DIVIDE": [
        "DĚLÚ",
        "DU"
      ],
      "MEASURE": [
        "DĚLM",
        "DM"
      ],
      "PTYPE": [
        "BTYP"
      ],
      "SOLID": [
        "DESKA",
        "DE"
      ],
      "LEADER": [
        "ODKAZ",
        "ODK"
      ],
      "WIPEOUT": [
        "PŘEKRÝT"
      ]
    },
    "keywords": {
      "XLINE": {
        "Hor": "Hor",
        "Ver": "Ver",
        "Ang": "úheL",
        "Bisect": "Polovinu",
        "Offset": "Ekvid",
        "Reference": "Reference",
        "Through": "Bodem",
        "Thru": "Skrz"
      },
      "-OSNAP": {
        "ENDpoint": "KONcový",
        "MIDpoint": "POLovina",
        "CENter": "STŘed",
        "NODe": "BOD",
        "QUAdrant": "KVAdrant",
        "INTersection": "PRŮsečík",
        "EXTension": "PROtažení",
        "INSertion": "REFerenční",
        "PERpendicular": "KOLmo",
        "TANgent": "TANgenciální",
        "NEArest": "NEJbližší",
        "APParent": "ZDÁnprů",
        "PARallel": "ROVnoběžka",
        "NONe": "NIC",
        "OFF": "Ne"
      },
      "LINE": {
        "Close": "Uzavři",
        "Undo": "Zpět"
      },
      "3DFACE": {
        "Invisible": "Neviditelný"
      },
      "3DPOLY": {
        "Close": "Uzavři",
        "Undo": "Zpět"
      },
      "PLINE": {
        "Arc": "Oblouk",
        "Line": "úsEčka",
        "Close": "Uzavři",
        "Halfwidth": "Polotloušťka",
        "Undo": "Zpět",
        "Width": "Tloušťka",
        "Angle": "úHel",
        "Center": "Střed",
        "Direction": "Vektor",
        "Radius": "poloMěr",
        "Second pt": "Druhý",
        "Length": "Délka"
      },
      "ARC": {
        "Center": "St"
      },
      "MOVE": {
        "Displacement": "Přemístění"
      },
      "COPY": {
        "Displacement": "Přemístění",
        "Exit": "kOnec",
        "Undo": "Zpět"
      },
      "STRETCH": {
        "Displacement": "Přemístění"
      },
      "ARCSCE": {
        "Center": "St"
      },
      "CIRCLE": {
        "3P": "3B",
        "2P": "2B",
        "Ttr": "Ttr",
        "Diameter": "Průměr"
      },
      "CIRCLED": {
        "3P": "3B",
        "2P": "2B",
        "Ttr": "Ttr"
      },
      "FILL": {
        "0": "0",
        "1": "1",
        "ON": "Ano",
        "OFF": "Ne"
      },
      "ELLIPSE": {
        "Arc": "Oblouk",
        "Center": "Střed",
        "Centre": "Střed",
        "Rotation": "Rotace",
        "Included angle": "SEvřený",
        "Parameter": "Parametr",
        "Angle": "úHel"
      },
      "ELLIPSEC": {
        "Arc": "Oblouk",
        "Center": "Střed",
        "Centre": "Střed",
        "Rotation": "Rotace",
        "Included angle": "SEvřený",
        "Parameter": "Parametr",
        "Angle": "úHel"
      },
      "ELLIPSEARC": {
        "Arc": "Oblouk",
        "Center": "Střed",
        "Centre": "Střed",
        "Rotation": "Rotace",
        "Included angle": "SEvřený",
        "Parameter": "Parametr",
        "Angle": "úHel"
      },
      "SPLINE": {
        "Method": "Způsob",
        "Knots": "Uzly",
        "Degree": "Stupeň",
        "Fit": "vyHlazení",
        "CV": "řV",
        "Chord": "Tětiva",
        "Square root": "Odmocnina",
        "Uniform": "Rovnoměrná",
        "start Tangency": "Tečnost",
        "end Tangency": "Tečnost",
        "Undo": "Zpět",
        "Close": "zAvřít",
        "Object": "Objekt"
      },
      "SPLINEDIT": {
        "Close": "Uzavři",
        "Open": "Otevřít",
        "Join": "Připoj",
        "Fit data": "Data",
        "Data": "VYHLAZENÍ",
        "Edit vertex": "Editace",
        "convert to Polyline": "Křivku",
        "Reverse": "oBrátit",
        "R": "R",
        "Undo": "Zpět",
        "eXit": "kOnec",
        "X": "X",
        "Toggle": "přePNout",
        "Add": "přidAt",
        "Delete": "oDstranit",
        "Move": "Posun",
        "Purge": "čIsti",
        "Tangents": "Tečny",
        "Elevate order": "Zvýšit",
        "Order": "řád",
        "Weight": "Váha",
        "Next": "Další",
        "Previous": "Předchozí",
        "Select point": "Vybrat",
        "Point": "Bod",
        "System default": "Systémová",
        "Default": "Výchozí",
        "After": "Po",
        "Before": "přeD"
      },
      "PEDIT": {
        "Close": "Uzavři",
        "Open": "Otevři",
        "Join": "Připoj",
        "Width": "šířKa",
        "Edit vertex": "Editace",
        "Ltype gen": "tYpčgen",
        "Reverse": "OBrátit",
        "Undo": "Zpět",
        "eXit": "kOnec",
        "X": "O",
        "Multiple": "NÁsobně",
        "Yes": "Ano",
        "No": "Ne",
        "Jointype": "Typ",
        "Extend": "Prodloužit",
        "Add": "přiDat",
        "Both": "Oba",
        "ON": "Ano",
        "OFF": "Ne",
        "Next": "Vpřed",
        "Previous": "Zpátky",
        "Break": "průsEk",
        "Insert": "vLož",
        "Move": "posUv",
        "Regen": "Regen",
        "Straighten": "propoJ",
        "Tangent": "Tečna",
        "Go": "Jdi",
        "Fit": "Interpolace",
        "Spline": "Spline",
        "Spline curve": "Spline",
        "Decurve": "KOstra",
        "Defit": "KOstra"
      },
      "BOX": {
        "Center": "Střed",
        "Cube": "Krychle",
        "Length": "Délka",
        "2Point": "2Body"
      },
      "WEDGE": {
        "Center": "Střed",
        "Cube": "Krychle",
        "Length": "Délka",
        "2Point": "2Body"
      },
      "PYRAMID": {
        "Edge": "Hrana",
        "Sides": "Strany",
        "Inscribed": "Vepsaná",
        "Circumscribed": "Opsaná",
        "2Point": "2Body",
        "Axis": "Osy",
        "Top": "Horní"
      },
      "CYLINDER": {
        "3P": "3B",
        "2P": "2B",
        "Ttr": "Ttr",
        "Elliptical": "Eliptický",
        "Diameter": "Průměr",
        "Center": "Střed",
        "2Point": "2Body",
        "Axis": "Osy"
      },
      "CONE": {
        "3P": "3B",
        "2P": "2B",
        "Ttr": "Ttr",
        "Elliptical": "Eliptický",
        "Diameter": "Průměr",
        "Center": "Střed",
        "2Point": "2Body",
        "Axis": "Osy",
        "Top": "Horní"
      },
      "SPHERE": {
        "3P": "3B",
        "2P": "2B",
        "Ttr": "Ttr",
        "Diameter": "Průměr"
      },
      "TORUS": {
        "3P": "3B",
        "2P": "2B",
        "Ttr": "Ttr",
        "Diameter": "Průměr",
        "2Point": "2Body"
      },
      "MASSPROP": {
        "Yes": "Ano",
        "No": "Ne"
      },
      "RECTANG": {
        "Chamfer": "Zkosení",
        "Elevation": "zDvih",
        "Fillet": "zAoblení",
        "Thickness": "Tloušťka",
        "Area": "Oblast",
        "Dimensions": "Rozměry",
        "Rotation": "oTočení",
        "Length": "Délka",
        "Width": "Šířka",
        "Pick": "VYbrat"
      },
      "POLYGON": {
        "Edge": "Strana",
        "Inscribed": "Vepsaný",
        "Circumscribed": "Opsaný"
      },
      "HATCH": {
        "Properties": "vLastnosti",
        "Select objects": "Vybrat",
        "?": "?",
        "Solid": "Barva",
        "Undo": "Zpět"
      },
      "INSERT": {
        "?": "?",
        "Scale": "Měřítko",
        "Rotate": "Otoč"
      },
      "BLOCK": {
        "?": "?",
        "Yes": "Ano",
        "No": "Ne"
      },
      "ATTDEF": {
        "Invisible": "Neviditelný",
        "Constant": "Konstantní",
        "Verify": "Ověřovaný",
        "Preset": "Přednastavený",
        "Lock position": "Uzamknout",
        "Justify": "Upravit",
        "Style": "písMo",
        "Left": "VLevo",
        "Center": "Centr",
        "Right": "Vpravo",
        "Middle": "Střed",
        "TL": "HLevý",
        "TC": "HCentr",
        "TR": "HPravý",
        "ML": "SLevý",
        "MC": "SCentrální",
        "MR": "SPravý",
        "BL": "DLevý",
        "BC": "DCentr",
        "BR": "DPravý",
        "?": "?"
      },
      "ATTDISP": {
        "OFF": "Ne",
        "Normal": "nOrmální",
        "ON": "Ano"
      },
      "PURGE": {
        "Blocks": "Bloky",
        "LTypes": "Typyčar",
        "Yes": "Ano",
        "No": "Ne"
      },
      "SNAP": {
        "ON": "Ano",
        "OFF": "Ne",
        "Aspect": "Různý"
      },
      "TEXT": {
        "Justify": "Upravit",
        "Style": "písMo",
        "?": "?",
        "Left": "VLevo",
        "Center": "Centr",
        "Right": "Vpravo",
        "Middle": "Střed",
        "TL": "HLevý",
        "TC": "HCentr",
        "TR": "HPravý",
        "ML": "SLevý",
        "MC": "SCentrální",
        "MR": "SPravý",
        "BL": "DLevý",
        "BC": "DCentr",
        "BR": "DPravý"
      },
      "MTEXT": {
        "Height": "Výška",
        "Justify": "Zarovnání",
        "Line spacing": "řáDkování",
        "Rotation": "Otočení",
        "Style": "Styl",
        "?": "?",
        "Width": "šířKa",
        "TL": "HL",
        "TC": "HC",
        "TR": "HP",
        "ML": "SL",
        "MC": "SC",
        "MR": "SP",
        "BL": "DL",
        "BC": "DC",
        "BR": "DP",
        "At least": "Nejméně",
        "Exactly": "Přesně"
      },
      "TEXTEDIT": {
        "Undo": "Zpět",
        "Mode": "Režim",
        "Single": "Jeden",
        "Multiple": "NÁsobně"
      },
      "DIMLINEAR": {
        "Text": "Text",
        "Angle": "úheL",
        "Horizontal": "Horizontální",
        "Vertical": "Vertikální",
        "Rotated": "Otočená"
      },
      "DIMALIGNED": {
        "Text": "Text",
        "Angle": "úHel"
      },
      "DIMHORIZONTAL": {
        "Text": "Text",
        "Angle": "úHel"
      },
      "DIMVERTICAL": {
        "Text": "Text",
        "Angle": "úHel"
      },
      "DIMROTATED": {
        "Text": "Text",
        "Angle": "úHel"
      },
      "DIMRADIUS": {
        "Text": "Text",
        "Angle": "úHel"
      },
      "DIMDIAMETER": {
        "Text": "Text",
        "Angle": "úHel"
      },
      "DIMANGULAR": {
        "Text": "Text",
        "Angle": "úHel"
      },
      "DIMBASELINE": {
        "Undo": "Zpět",
        "Select": "Vybrat"
      },
      "DIMCONTINUE": {
        "Undo": "Zpět",
        "Select": "Vybrat"
      },
      "DIMSPACE": {
        "Auto": "Auto"
      },
      "-DIMSTYLE": {
        "Save": "Ulož",
        "Restore": "Obnov",
        "STatus": "Stav",
        "Variables": "proMěnné",
        "Apply": "Použij",
        "?": "?",
        "Yes": "Ano",
        "No": "Ne"
      },
      "OFFSET": {
        "Through": "Bodem",
        "Thru": "Skrz",
        "Erase": "Vymazat",
        "Layer": "Hladina",
        "Yes": "Ano",
        "No": "Ne",
        "Current": "Aktuální",
        "Source": "Zdroj",
        "Exit": "Konec",
        "Multiple": "Násobně",
        "Undo": "Zpět"
      },
      "ROTATE": {
        "Copy": "Kopie",
        "Reference": "Reference",
        "Points": "Body"
      },
      "SCALE": {
        "Copy": "Kopie",
        "Reference": "Reference",
        "Points": "Body"
      },
      "MIRROR": {
        "Yes": "Ano",
        "No": "Ne"
      },
      "JOIN": {
        "Yes": "Ano",
        "No": "Ne",
        "cLose": "Zavřít"
      },
      "ARRAY": {
        "Rectangular": "Obdélníkové",
        "PAth": "Křivkové",
        "POlar": "Polární"
      },
      "ARRAYRECT": {
        "ASsociative": "ASociativní",
        "COUnt": "Počet",
        "Spacing": "ROzteč",
        "COLumns": "Sloupce",
        "Rows": "řáDky",
        "Levels": "úrovNě",
        "Total": "Celkem",
        "eXit": "kOnec",
        "Unit cell": "Jednotková",
        "Yes": "Ano",
        "No": "Ne"
      },
      "ARRAYPOLAR": {
        "ASsociative": "ASociativní",
        "Items": "Položky",
        "Angle between": "úHel",
        "Fill angle": "Vyplnění",
        "ROWs": "řáDky",
        "ROTate items": "oTočit",
        "eXit": "kOnec",
        "Yes": "Ano",
        "No": "Ne"
      },
      "ARRAYPATH": {
        "ASsociative": "ASociativní",
        "Method": "způsoB",
        "Items": "Položky",
        "Align items": "zaroVnat",
        "eXit": "kOnec",
        "Divide": "Rozdělit",
        "Measure": "Měření",
        "Fill entire path": "Vyplnění",
        "Yes": "Ano",
        "No": "Ne"
      },
      "TRIM": {
        "Undo": "Zpět",
        "Fence": "Napříč",
        "Crossing": "Křížení",
        "eRase": "Vymazat",
        "cuTting": "řEzací",
        "mOde": "Režim",
        "Quick": "Rychlé",
        "Standard": "Standardní",
        "Edge": "Hrana",
        "Extend": "Prodluž",
        "No extend": "Neprodluž",
        "Noextend": "Neprodluž"
      },
      "EXTEND": {
        "Undo": "Zpět",
        "Fence": "Napříč",
        "Crossing": "Křížení",
        "Boundary": "hrAniční",
        "mOde": "Režim",
        "Quick": "Rychlé",
        "Standard": "Standardní",
        "Edge": "Hrana",
        "Extend": "Prodluž",
        "No extend": "Neprodluž",
        "Noextend": "Neprodluž"
      },
      "FILLET": {
        "Undo": "Zpět",
        "Polyline": "křiVka",
        "Radius": "Poloměr",
        "Multiple": "NKrát",
        "Trim": "OŘež"
      },
      "CHAMFER": {
        "Undo": "Zpět",
        "Polyline": "křiVka",
        "Distance": "Hrana",
        "Multiple": "NKrát"
      },
      "BREAK": {
        "First point": "První"
      },
      "DIST": {
        "Multiple": "Více",
        "Close": "Uzavři",
        "Length": "Délka",
        "Undo": "Zpět",
        "Total": "Celkem",
        "Arc": "Oblouk",
        "Line": "úsEčka",
        "Angle": "úHel",
        "Center": "Střed",
        "Direction": "Vektor",
        "Radius": "Poloměr",
        "Second pt": "Druhý"
      },
      "AREA": {
        "Object": "OBjekt",
        "Add": "Přičíst",
        "Subtract": "oDečíst",
        "Undo": "Zpět",
        "Total": "Celkem",
        "Entity": "Entita",
        "eXit": "KOnec"
      },
      "ZOOM": {
        "All": "Vše",
        "Extents": "Maximálně",
        "Previous": "Předchozí",
        "Scale": "měříTko",
        "Window": "Okno",
        "Object": "oBjekt"
      },
      "UCS": {
        "NAmed": "poJMenovaný",
        "OBject": "obJekt",
        "Previous": "Předchozí",
        "View": "poHled",
        "World": "Globální",
        "X": "X",
        "Y": "Y",
        "Z": "Z",
        "ZAxis": "ZOsa",
        "Object": "OBjekt",
        "Restore": "oBnov",
        "Save": "Ulož",
        "Delete": "Vymaž",
        "?": "?",
        "Yes": "Ano",
        "No": "Ne",
        "Origin": "pOčátek",
        "Face": "PLocha",
        "3point": "3body",
        "Entity": "Entita",
        "Move": "poSun",
        "orthoGraphic": "ortograF",
        "New": "Nový",
        "Top": "HOrní",
        "Bottom": "Dolní",
        "Front": "PŘední",
        "BAck": "ZAdní",
        "Left": "Levý",
        "Right": "PRavý",
        "Zdepth": "Zhloubka"
      },
      "UNDO": {
        "BEgin": "zaČátek",
        "End": "kOnec",
        "Mark": "ozNač",
        "Back": "Zpátky",
        "Group": "Skupina",
        "Yes": "Ano",
        "No": "Ne",
        "Auto": "Auto",
        "Control": "Řízení",
        "All": "Vše",
        "None": "Nic",
        "One": "Jeden",
        "Combine": "Kombinace",
        "Layer": "Hladina",
        "ON": "ANO",
        "OFF": "NE"
      },
      "MREDO": {
        "All": "Vše",
        "Last": "posLední"
      },
      "UCSICON": {
        "ON": "Ano",
        "OFF": "Ne",
        "Noorigin": "vLevo",
        "ORigin": "pOčátek"
      },
      "PLAN": {
        "Current ucs": "Aktuální",
        "Ucs": "Uss",
        "World": "Globální",
        "?": "?"
      },
      "VPOINT": {
        "Rotate": "oToč"
      },
      "VIEW": {
        "Orthographic": "oRto",
        "Top": "Horní",
        "Bottom": "Dolní",
        "Front": "Přední",
        "BAck": "Zadní",
        "Left": "Levý",
        "Right": "PRavý",
        "SWiso": "JZiso",
        "SEiso": "JViso",
        "NEiso": "SViso",
        "NWiso": "SZiso"
      },
      "NAVVCUBE": {
        "ON": "ANO",
        "OFF": "NE"
      },
      "VSCURRENT": {
        "2dwireframe": "2ddrátovýmodel",
        "Hidden": "Skryté",
        "Conceptual": "Koncepční",
        "3DHIDDEN": "3DSKRYTÉ"
      },
      "SETVAR": {
        "?": "?",
        "ON": "ANO",
        "OFF": "NE",
        "True": "Pravda",
        "False": "Nepravda",
        "Yes": "Ano",
        "No": "Ne"
      },
      "CHPROP": {
        "Color": "Barva",
        "LAyer": "Hladina",
        "LType": "Typč",
        "ltScale": "tčMěř",
        "LWeight": "tLčáry",
        "Thickness": "Výška",
        "Truecolor": "Truecolor",
        "BYLAYER": "DLEHlad",
        "RED": "čErvená",
        "YELLOW": "žLutá",
        "GREEN": "Zelená",
        "CYAN": "Svmodrá",
        "BLUE": "Modrá",
        "MAGENTA": "Fialová",
        "WHITE": "Bílá",
        "BYBLOCK": "DLEBlok",
        "?": "?"
      },
      "COLOR": {
        "Truecolor": "Truecolor",
        "BYLAYER": "DLEHlad",
        "RED": "čErvená",
        "YELLOW": "žLutá",
        "GREEN": "Zelená",
        "CYAN": "Svmodrá",
        "BLUE": "Modrá",
        "MAGENTA": "Fialová",
        "WHITE": "Bílá",
        "BYBLOCK": "DLEBlok"
      },
      "LINETYPE": {
        "?": "?",
        "Load": "Načti",
        "Set": "naStav",
        "Yes": "Ano",
        "No": "Ne",
        "BYLAYER": "DLEHlad",
        "BYLayer": "DLEHlad"
      },
      "LWEIGHT": {
        "?": "?",
        "BYLAYER": "DLEHlad"
      },
      "-LAYER": {
        "?": "?",
        "Make": "vYtvořit",
        "Set": "nastavIt",
        "New": "Definovat",
        "Rename": "přeJmen",
        "ON": "Ano",
        "OFF": "Ne",
        "Color": "Barva",
        "Ltype": "Typč",
        "LWeight": "tLčáry",
        "LOck": "zamknOut",
        "Unlock": "odemKnout",
        "DELete": "Vymazat",
        "Truecolor": "Truecolor",
        "RED": "čErvená",
        "YELLOW": "žLutá",
        "GREEN": "Zelená",
        "CYAN": "Svmodrá",
        "BLUE": "Modrá",
        "MAGENTA": "Fialová",
        "WHITE": "Bílá",
        "Yes": "Ano",
        "No": "Ne"
      },
      "EXTRUDE": {
        "MOde": "Režim",
        "SOlid": "Těleso",
        "SUrface": "Povrch",
        "Direction": "Směr",
        "Path": "Trajektorie",
        "Taper": "Zešikmení",
        "Expression": "Výraz",
        "Yes": "Ano",
        "No": "Ne"
      },
      "REVOLVE": {
        "MOde": "Režim",
        "SOlid": "Těleso",
        "SUrface": "Povrch",
        "Object": "Objekt",
        "X": "X",
        "Y": "Y",
        "Z": "Z",
        "STart": "Počáteční",
        "Reverse": "oBrátit",
        "EXpression": "výrAZ",
        "Yes": "Ano",
        "No": "Ne"
      },
      "PRESSPULL": {
        "Multiple": "Násobně"
      },
      "SLICE": {
        "Object": "Objekt",
        "Surface": "poVrch",
        "Zaxis": "Zosa",
        "View": "Pohled",
        "XY": "XY",
        "YZ": "YZ",
        "ZX": "ZX",
        "3points": "3body",
        "Both": "Obě"
      },
      "SECTION": {
        "Object": "Objekt",
        "Zaxis": "Zosa",
        "View": "Pohled",
        "XY": "XY",
        "YZ": "YZ",
        "ZX": "ZX",
        "3points": "3body"
      },
      "FILLETEDGE": {
        "Chain": "řeTěz",
        "Loop": "Smyčka",
        "Radius": "Poloměr",
        "Edge": "Hrana",
        "Expression": "Výraz",
        "Accept": "Akceptovat",
        "Next": "Další",
        "eXit": "kOnec"
      },
      "CHAMFEREDGE": {
        "Loop": "Smyčka",
        "Distance": "Vzdálenost",
        "Edge": "Hrana",
        "Expression": "Výraz",
        "Accept": "Akceptovat",
        "Next": "Další"
      },
      "SOLIDEDIT": {
        "Face": "Plocha",
        "Edge": "Hrana",
        "Body": "Těleso",
        "Undo": "Zpět",
        "eXit": "kOnec",
        "Extrude": "Vysunutí",
        "Move": "Posun",
        "Rotate": "Rotace",
        "Offset": "ekviD",
        "Taper": "zEšikmení",
        "Delete": "vYmazat",
        "Copy": "Kopie",
        "coLor": "Barva",
        "mAterial": "mAteriál",
        "Remove": "Odstranit",
        "Add": "Přidat",
        "ALL": "VŠE",
        "Crossing": "Křížení",
        "Fence": "Napříč",
        "CPolygon": "KPolygon",
        "Path": "Křivka",
        "Axis": "Osa",
        "View": "Pohled",
        "Xaxis": "Xosa",
        "Yaxis": "Yosa",
        "Zaxis": "Zosa",
        "2points": "2body",
        "Reference": "Reference"
      },
      "DIVIDE": {
        "Block": "Blok",
        "Yes": "Ano",
        "No": "Ne"
      },
      "MEASURE": {
        "Block": "Blok",
        "Yes": "Ano",
        "No": "Ne"
      },
      "LEADER": {
        "Annotation": "Poznámka",
        "Format": "Formát",
        "Undo": "Zpět",
        "Spline": "Spline",
        "STraight": "Přímá",
        "Arrow": "šipKa",
        "None": "Nic",
        "Exit": "kOnec",
        "Copy": "Kopie",
        "Mtext": "Mtext"
      },
      "WIPEOUT": {
        "Frames": "Rámečky",
        "Polyline": "Křivka",
        "Undo": "Zpět",
        "Close": "Uzavřít",
        "ON": "Ano",
        "OFF": "Ne",
        "Display": "Zobrazit",
        "Yes": "Ano",
        "No": "Ne"
      }
    },
    "promptKeywords": {
      "selectObjects": {
        "Window": "OKno",
        "Last": "posLední",
        "Crossing": "Křížení",
        "BOX": "KVádr",
        "ALL": "VŠE",
        "Fence": "Napříč",
        "WPolygon": "OPolygon",
        "CPolygon": "KPolygon",
        "Add": "přiDej",
        "Remove": "Odstraň",
        "Previous": "Předchozí",
        "Undo": "Zpět",
        "AUto": "Auto",
        "SIngle": "Jeden",
        "SUbobject": "POdobjekt",
        "Object": "Objekt"
      },
      "specifyNextFencePointOr": {
        "Undo": "Zpět"
      },
      "viewOrthographic": {
        "Top": "Horní",
        "Left": "Levý",
        "Right": "PRavý"
      },
      "ucsNewUcs": {
        "ZAxis": "ZOsas"
      },
      "ucsOrthographic": {
        "Top": "HOrní",
        "Front": "PŘední",
        "BAck": "ZAdní",
        "Left": "Levý",
        "Right": "PRavý",
        "Bottom": "Dolní"
      },
      "specifyNextPointOrClose": {
        "Undo": "Zpět"
      },
      "specifyEndpointOfLineOr": {
        "Undo": "Zpět"
      },
      "select2dPolylineOr": {
        "Radius": "Poloměr"
      },
      "selectSecondObjectOrApplyCornerOr": {
        "Radius": "Poloměr"
      },
      "specifyEndpointOfArcOr": {
        "Close": "Uzavři",
        "Arc": "Oblouk",
        "Undo": "Zpět",
        "Length": "Délka"
      },
      "plineNextPointOr": {
        "Line": "úsEčka"
      },
      "specifyFirstCornerPointOr": {
        "Width": "šířKa"
      },
      "specifyAxisEndpointOfEllipticalArcOr": {
        "Centre": "Střed"
      },
      "splineditOptionClosed": {
        "convert to Polyline": "Křivka",
        "Edit vertex": "Upravit",
        "Reverse": "obRátit",
        "eXit": "konEc",
        "Open": "Otevřít"
      },
      "peditOption": {
        "eXit": "kOnec"
      },
      "peditMultipleOption": {
        "eXit": "kOnec",
        "Width": "šířKa"
      },
      "peditOption3d": {
        "Join": "Připoj",
        "eXit": "kOnec"
      },
      "peditWalkOption": {
        "eXit": "kOnec"
      },
      "enterFitDataOption": {
        "Add": "Přidej",
        "Open": "oteVři",
        "Move": "přeSuň",
        "X": "O",
        "Delete": "vyMaž",
        "Tangents": "Tečny"
      },
      "enterVertexEditingOption": {
        "X": "O",
        "Width": "šířKa"
      },
      "specifyNewLocationOr": {
        "eXit": "kOnec",
        "X": "O"
      },
      "enterNewWeightOr": {
        "eXit": "kOnec",
        "X": "O"
      },
      "selectSplineFitPolyline": {
        "Undo": "Zpět"
      },
      "selectOpenCurvesToJoinToSource": {
        "Undo": "Zpět"
      },
      "selectObjectsOr": {
        "mOde": "Režim"
      },
      "selectEdgesOr": {
        "mOde": "Režim"
      },
      "selectFacesOr": {
        "Undo": "Zpět"
      },
      "removeFacesOr": {
        "Undo": "Zpět"
      },
      "leaderFormatOption": {
        "None": "Nic"
      }
    },
    "prompts": {
      "length": "Délka",
      "width": "Šířka",
      "angle": "Úhel",
      "trackingOffset": "Offset",
      "center": "Střed",
      "radius": "Poloměr",
      "diameter": "Průměr",
      "height": "Výška",
      "firstPoint": "První bod",
      "secondPoint": "Druhý bod",
      "thirdPoint": "Třetí bod",
      "startPoint": "Počáteční bod",
      "centerPoint": "Středový bod",
      "endPoint": "Koncový bod",
      "axisEndpoint": "Koncový bod osy",
      "otherAxisEndpoint": "Druhý koncový bod osy",
      "endpointOfAxis": "Koncový bod osy",
      "distanceToOtherAxis": "Vzdálenost k druhé ose",
      "rotationAroundMajorAxis": "Rotace kolem hlavní osy",
      "startAngle": "Počáteční úhel",
      "endAngle": "Koncový úhel",
      "startParameter": "Počáteční parametr",
      "endParameter": "Koncový parametr",
      "includedAngle": "Sevřený úhel",
      "splineStartTangent": "Zadejte počáteční tangentu",
      "splineEndTangent": "Zadejte koncovou tangentu",
      "splineDegree": "Zadejte stupeň křivky spline",
      "firstCorner": "První roh",
      "otherCorner": "Další roh",
      "rectangleElevation": "Zadejte zdvih pro obdélníky",
      "rectangleThickness": "Určete tloušťku pro obdélníky",
      "rectangleFirstChamfer": "Určete první vzdálenost zkosení pro obdélníky",
      "rectangleSecondChamfer": "Určete druhou vzdálenost zkosení pro obdélníky",
      "rectangleFillet": "Určete poloměr zaoblení pro obdélníky",
      "rectangleLineWidth": "Určete tloušťku čar pro obdélníky",
      "rectangleArea": "Zadejte oblast obdélníku v aktuálních jednotkách",
      "rectangleAreaBasis": "Vypočítat kóty obdélníku na základě hodnoty",
      "rectangleLength": "Zadejte délku obdélníku",
      "rectangleWidth": "Zadejte šířku obdélníku",
      "rectangleDimensionLength": "Zadejte délku obdélníků",
      "rectangleDimensionWidth": "Zadejte šířku obdélníků",
      "rectangleRotation": "Určete úhel otočení nebo",
      "numberOfSides": "Počet stran",
      "patternName": "Zadejte název vzoru",
      "patternScale": "Určete měřítko vzoru",
      "patternAngle": "Určete úhel vzoru",
      "blockName": "Zadejte název bloku nebo",
      "blockExists": [
        "Blok \"",
        [
          "name"
        ],
        "\" již existuje. Předefinovat jej?"
      ],
      "redefineIt": "Předefinovat jej?",
      "blocksToList": "Zadejte blok(y) pro vypsání",
      "purgeType": "Zadejte typ nepoužívaných objektů k vyčištění",
      "purgeNames": "Zadejte názvy k vyčištění",
      "purgeVerify": "Ověřovat každý název před vyčištěním?",
      "massPropWriteFile": "Uložit analýzu do souboru?",
      "purgeBlock": [
        "Čistit blok \"",
        [
          "name"
        ],
        "\"?"
      ],
      "purgeLinetype": [
        "Čistit typ čáry \"",
        [
          "name"
        ],
        "\"?"
      ],
      "insertionBasePoint": "Určete referenční bod vložení",
      "insertionPoint": "Určete bod vložení nebo",
      "specifyInsertionPoint": "Určete vkládací bod",
      "insertScale": "Určete měřítko pro osy XYZ",
      "insertRotation": "Určete úhel otočení",
      "insertXScale": "Zadejte měřítko v ose X, zadejte protější roh nebo [Obdélník/XYZ]",
      "insertYScale": "Zadejte měřítko Y",
      "attributeTag": "Zadejte název atributu",
      "attributePrompt": "Zadejte výzvu atributu",
      "attributeDefault": "Zadejte implicitní hodnotu atributu",
      "attributeValue": "Zadejte hodnotu atributu",
      "attributeValuePrompt": [
        [
          "prompt"
        ]
      ],
      "attdefModes": "Zadejte možnost, kterou chcete změnit",
      "attdefDone": "hotovo",
      "definitionTag": "Štítek",
      "definitionPrompt": "Výzva",
      "definitionDefault": "Výchozí",
      "textStartPoint": "Zadejte počáteční bod textu",
      "textHeight": "Určete výšku",
      "textRotation": "Určete úhel natočení textu",
      "text": "Text",
      "justify": "Zarovnání",
      "styleName": "Název stylu",
      "mtextFirstCorner": "Zadejte první roh",
      "mtextOppositeCorner": "Zadejte protější roh",
      "mtextRotation": "Zadejte úhel natočení",
      "mtextWidth": "Zadejte šířku",
      "mtextLineSpacing": "Zadejte faktor nebo vzdálenost řádkování",
      "mtextLine": "MText",
      "firstExtensionOrigin": "Zadejte počátek první vynášecí čáry nebo <vyberte objekt>",
      "secondExtensionOrigin": "Zadejte počátek druhé vynášecí čáry",
      "alignedSecondExtensionOrigin": "Zadejte počátek druhé vynášecí čáry",
      "dimensionLineLocation": "Zadejte umístění kótovací čáry",
      "dimensionLineAngle": "Zadejte úhel kótovací čáry",
      "dimensionText": "Zadejte kótovací text",
      "dimensionTextAngle": "Zadejte úhel kótovacího textu",
      "angleVertex": "Zadejte vrchol úhlu",
      "firstAngleEndpoint": "Zadejte první koncový bod úhlu",
      "secondAngleEndpoint": "Zadejte druhý koncový bod úhlu",
      "circleSecondAngleEndpoint": "Zadejte druhý koncový bod úhlu",
      "dimensionArcLocation": "Zadejte umístění oblouku kótovací čáry",
      "dimensionSpacing": "Zadejte hodnotu",
      "offsetDistance": "Vzdálenost ekvidistanty",
      "basePoint": "Základní bod",
      "fromOffset": "<Odsazení>",
      "pointFilterOf": "z",
      "pointFilterNeed": [
        "(potřebuji ",
        [
          "axes"
        ],
        ")"
      ],
      "distance": "Vzdálenost",
      "rotationAngle": "Úhel otočení",
      "referenceAngle": "Referenční úhel",
      "newAngle": "Nový úhel",
      "scaleFactor": "Měřítko",
      "referenceLength": "Referenční délka",
      "newLength": "Nová délka",
      "mirrorFirstPoint": "První bod osy zrcadlení",
      "mirrorSecondPoint": "Druhý bod osy zrcadlení",
      "columns": "Sloupce",
      "rows": "Řádky",
      "columnSpacing": "Vzdálenost mezi sloupci",
      "rowSpacing": "Vzdálenost mezi řádky",
      "levels": "Hladiny",
      "levelSpacing": "Vzdálenost mezi úrovněmi",
      "items": "Položky",
      "fillAngle": "Úhel vyplnění",
      "spacing": "Řádkování",
      "filletRadius": "Poloměr zaoblení",
      "firstDistance": "První vzdálenost zkosení",
      "secondDistance": "Druhá vzdálenost zkosení",
      "clipboardBasePoint": "Určete základní bod",
      "lengthen": "Délka",
      "move": "Posunout",
      "bulge": "Vyboulení",
      "ucsOrigin": "Určete počátek USS nebo",
      "ucsXAxisPoint": "Určete bod na ose X nebo",
      "ucsXYPlanePoint": "Určete bod v rovině XY nebo",
      "ucsRotationX": "Určete úhel otočení kolem osy X",
      "ucsRotationY": "Určete úhel otočení kolem osy Y",
      "ucsRotationZ": "Určete úhel otočení kolem osy Z",
      "ucsZAxisOrigin": "Zadejte nový počátek nebo",
      "ucsZAxisPoint": "Určete bod na kladné poloose Z",
      "ucsRestoreName": "Zadejte název obnovovaného USS nebo",
      "ucsSaveName": "Zadejte název ukládaného USS nebo",
      "ucsDeleteNames": "Zadejte názvy USS, které chcete odstranit",
      "ucsListNames": "Zadejte názvy USS, které chcete vypsat",
      "ucsAccept": "akceptovat",
      "ucsNone": "žádný",
      "ucsReplace": [
        "USS \"",
        [
          "name"
        ],
        "\" již existuje. Přepsat jej?"
      ],
      "ucsAlignObject": "Vyberte objekt, podle něhož vytvoříte USS",
      "ucsNewUcs": "Určete počátek nového USS nebo",
      "ucsNewOrigin": "Určete nový bod počátku",
      "ucsMoveOrigin": "Určete nový bod počátku nebo",
      "ucsZdepth": "Určete Zhloubku",
      "ucsOrthographic": "Zadejte možnost",
      "ucs3XAxisPoint": "Určete bod na kladné poloose X",
      "ucs3XYPlanePoint": "Určete bod v kladné polorovině Y roviny XY USS",
      "ucsTop": "Horní",
      "ucsBottom": "Dolní",
      "ucsFront": "Přední",
      "ucsBack": "Zadní",
      "ucsLeft": "Levý",
      "ucsRight": "Pravý",
      "ucsSelectFace": "Vyberte plochu desky, povrchu nebo sítě",
      "undoCount": "Zadejte počet operací k vrácení zpět nebo",
      "undoEverything": "Tato volba vrátí zpět všechno. Ano?",
      "mredoCount": "Zadejte počet akcí nebo",
      "undoYes": "A",
      "undoControl": "Zadejte volbu pro příkaz ZPĚT",
      "undoCombine": "Chcete kombinovat operace pro posun pohledu a zoom?",
      "undoLayer": "Sloučit operace dialogu Hladina?",
      "undoAuto": "Zadejte režim ZPĚT Auto",
      "undoOn": "Ano",
      "undoOff": "Ne",
      "panBasePoint": "Určete základní bod nebo přemístění",
      "planUcsName": "Zadejte název USS nebo",
      "planCurrent": "Aktuální",
      "zoomCornerOr": "Určete roh okna, zadejte faktor měřítka (nX nebo nXP), nebo",
      "zoomScaleFactor": "Zadejte faktor měřítka (nX nebo nXP)",
      "viewOption": "Zadejte možnost",
      "viewOrthographic": "Zadejte možnost",
      "elevDefaultElevation": "Určete nový implicitní zdvih",
      "elevDefaultThickness": "Určete novou implicitní výšku",
      "ltscaleFactor": "Zadejte nový faktor měřítka",
      "enterNewValueFor": [
        "Zadejte novou hodnotu pro ",
        [
          "name"
        ]
      ],
      "enterNewValueForOrNone": [
        "Zadejte novou hodnotu pro ",
        [
          "name"
        ],
        ", nebo . pro žádné"
      ],
      "enterVariableName": "Zadejte název proměnné nebo",
      "enterVariablesToList": "Zadejte proměnné pro vypsání",
      "pressEnterToContinue": "Pokračujte stisknutím klávesy ENTER",
      "osnapModes": "Zadejte seznam režimů uchopení",
      "snapSpacingOr": "Určete velikost kroku nebo",
      "snapAspect": "V",
      "snapHorizontalSpacing": "Určete horizontální rozteč",
      "snapVerticalSpacing": "Určete vertikální rozteč",
      "defaultObjectColor": "Zadejte implicitní barvu objektu",
      "trueColor": "Červená,Zelená,Modrá",
      "linetypeName": "Určete název typu čáry nebo",
      "linetypeListNames": "Zadejte názvy typů čar, které chcete vypsat",
      "linetypeFileToList": "Zadejte název souboru typů čar, který chcete vypsat.",
      "linetypesToLoad": "Zadejte typy čar pro načtení",
      "layerNamesToList": "Zadejte názvy hladin pro vypsání",
      "layerToMake": "Zadejte název pro novou hladinu (stane se aktuální)",
      "layerToSet": "Zadejte název hladiny, který má být aktuální nebo",
      "layerSelectObject": "vyberte objekt",
      "newLayerNames": "Zadejte seznam názvů nových hladin",
      "oldLayerName": "Zadejte původní název hladina",
      "renamedLayerName": "Zadejte nový název hladina",
      "layersToTurnOn": "Zadejte seznam názvů hladin pro zapnutí",
      "layersToTurnOff": "Zadejte seznam hladin pro vypnutí nebo",
      "layersToLock": "Zadejte seznam hladin pro uzamknutí nebo",
      "layersToUnlock": "Zadejte seznam hladin pro odemknutí nebo",
      "layerSelectObjects": "vyberte objekty",
      "currentLayerOff": [
        "Opravdu si přejete hladinu \"",
        [
          "name"
        ],
        "\" (AKTUÁLNÍ hladinu) vypnout?"
      ],
      "layerColor": "Nová barva",
      "layersForColor": [
        "Zadejte seznam názvů hladin pro barvu ",
        [
          "color"
        ]
      ],
      "layerLinetype": "Zadejte název načteného typu čáry nebo",
      "layersForLinetype": [
        "Zadejte seznam názvů hladin pro typ čáry \"",
        [
          "name"
        ],
        "\""
      ],
      "layerLineweight": "Zadejte tloušťku čáry (0.0mm – 2.11mm)",
      "layersForLineweight": [
        "Zadejte seznam názvů hladin pro tloušťku čáry ",
        [
          "value"
        ],
        "mm"
      ],
      "layersToDelete": "Zadejte hladiny, které chcete odstranit",
      "currentLayerOffNo": "N",
      "linetypeFileToSearch": "Zadejte název souboru typů čar, který chcete prohledat.",
      "reloadLinetype": [
        "Typ čáry \"",
        [
          "name"
        ],
        "\" je již načten. Mám jej načíst znovu?"
      ],
      "defaultLineweight": "Zadejte implicitní tloušťku čáry pro nové objekty nebo",
      "idPoint": "Určete bod",
      "distSecondPointOr": "Určete druhý bod nebo zadejte",
      "specifyLengthOfLine": "Určete délku úsečky",
      "polylineStartingWidth": "Určete počáteční tloušťku",
      "polylineEndingWidth": "Určete koncovou tloušťku",
      "polylineStartingHalfWidth": "Určete počáteční polotloušťku",
      "polylineEndingHalfWidth": "Určete koncovou polotloušťku",
      "fillMode": "Zadejte režim",
      "matchpropSource": "Vyberte zdrojový objekt",
      "matchpropDestination": "Vyberte cílové objekty",
      "propertyToChange": "Zadejte vlastnost, kterou chcete změnit",
      "newColor": "Nová barva",
      "newLayerName": "Zadejte název nové hladiny",
      "newLinetypeName": "Zadejte název nového typu čáry",
      "newLineweight": "Zadejte novou tloušťku čáry",
      "newThickness": "Zadejte nový(ou) výška",
      "newLinetypeScale": "Zadejte nový(ou) faktor měřítka typu čáry",
      "viewPoint": "Určete bod pohledu",
      "specifyViewPointOr": "Určete bod pohledu nebo",
      "attributeVisibilitySetting": "Zadejte nastavení viditelnosti atributů",
      "selectAnnotationObjectOr": "Vyberte objekt poznámky nebo",
      "selectBlockReference": "Vyberte referenci bloku",
      "selectABlock": "Vyberte blok",
      "textEditModeOption": "Zadejte režim úprav textu",
      "viewAngleInPlane": "Zadejte úhel od osy X v rovině XY",
      "viewAngleFromPlane": "Zadejte úhel od roviny XY",
      "boxFirstCornerOr": "Určete první roh",
      "boxOtherCornerOr": "Určete další roh nebo",
      "boxCenter": "Určete střed",
      "boxCornerOr": "Určete roh nebo",
      "boxLength": "Zadejte délku",
      "boxWidth": "Zadejte šířku",
      "boxHeightOr": "Určete výšku nebo",
      "boxHeightNoDefaultOr": "Určete výšku nebo",
      "pyramidCenterOr": "Určete středový bod základny nebo",
      "specifyBaseRadiusOr": "Určete poloměr základny nebo",
      "pyramidInscribedRadiusOr": "Určete poloměr základny",
      "specifyBaseRadiusNoDefaultOr": "Určete střed základny nebo",
      "pyramidBaseRadiusOr": "Určete poloměr základny nebo",
      "solidHeightTopOr": "Určete výšku nebo",
      "solidHeightOr": "Určete výšku nebo",
      "specifyAxisEndpoint": "Určete koncový bod osy",
      "specifyTopRadius": "Určete horní poloměr",
      "sphereCenterOr": "Určete středový bod nebo",
      "specifyRadiusOr": "Určete poloměr nebo",
      "specifyRadiusNoDefaultOr": "Určete poloměr nebo",
      "torusDiameter": "Určete průměr anuloidu",
      "tubeRadiusOr": "Určete poloměr trubky nebo",
      "tubeRadiusNoDefaultOr": "Určete poloměr trubky nebo",
      "tubeDiameter": "Určete průměr trubky",
      "roundBaseCenterOr": "Určete středový bod nebo",
      "specifyDiameter": "Určete průměr",
      "specifyThirdPoint": "Určete třetí bod",
      "firstEndOfDiameter": "Určete první koncový bod průměru",
      "secondEndOfDiameter": "Určete druhý koncový bod průměru",
      "firstTangentPoint": "Určete na objektu bod pro první tečnu",
      "secondTangentPoint": "Určete na objektu bod pro druhou tečnu",
      "firstAxisEndpointOr": "Určete koncový bod první osy nebo",
      "otherFirstAxisEndpoint": "Určete další koncový bod první osy",
      "secondAxisEndpoint": "Určete koncový bod druhé osy",
      "specifyCenterPoint": "Určete středový bod",
      "distanceToFirstAxis": "Určete vzdálenost od první osy",
      "specifyFirstPoint": "Určete první bod",
      "specifyNextPointOr": "Zadejte další bod nebo",
      "specifyNextPointOrClose": "Zadejte další bod nebo",
      "plineNextPointOr": "Zadejte další bod nebo",
      "specifyNextPointOrTotal": "Určete další bod nebo zadejte",
      "lengthOfLine": "Délka úsečky",
      "specifyStartPoint": "Určete počáteční bod",
      "specifyStartPointOfPolyline": "Určete počáteční bod křivky",
      "specifyEndpointOfArcOr": "Určete koncový bod oblouku (podržením klávesy Ctrl přepnete směr) nebo",
      "specifyCenterPointForCircleOr": "Určete středový bod kružnice nebo",
      "specifyRadiusOfCircleOr": "Určete poloměr kružnice nebo",
      "specifyRadiusOfCircle": "Určete poloměr kružnice",
      "specifyRadiusOfCircleTtr": "Určete poloměr kružnice",
      "enterNumberOfSides": "Zadejte počet stran",
      "specifyCenterOfPolygonOr": "Určete střed polygonu nebo",
      "enterAnOption": "Zadejte možnost",
      "textJustifyOption": "Zadejte možnost",
      "ucsiconOption": "Zadejte možnost",
      "navvcubeOption": "Zadejte možnost",
      "vscurrentOption": "Zadejte možnost",
      "vscurrent2dWireframe": "2ddrátovýmodel",
      "vscurrentHidden": "Skrytý",
      "vscurrentConceptual": "Koncepční",
      "inscribedShort": "V",
      "circumscribedShort": "O",
      "specifyFirstEndpointOfEdge": "Určete první koncový bod hrany",
      "specifySecondEndpointOfEdge": "Určete druhý koncový bod hrany",
      "polygonFirstEndpointOfEdge": "Určete první koncový bod hrany",
      "polygonSecondEndpointOfEdge": "Určete druhý koncový bod hrany",
      "specifyAxisEndpointOfEllipseOr": "Určete koncový bod osy elipsy nebo",
      "specifyAxisEndpointOfEllipticalArcOr": "Určete koncový bod osy eliptického oblouku nebo",
      "specifyCenterOfEllipse": "Určete střed elipsy",
      "specifyCenterOfEllipticalArc": "Určete střed eliptického oblouku",
      "specifyOtherEndpointOfAxis": "Určete druhý koncový bod osy",
      "specifyEndpointOfAxis": "Určete koncový bod osy",
      "specifyDistanceToOtherAxisOr": "Určete vzdálenost k druhé ose nebo",
      "specifyRotationAroundMajorAxis": "Určete rotaci kolem hlavní osy",
      "specifyStartAngleOr": "Zadejte počáteční úhel nebo",
      "specifyEndAngleOr": "Zadejte koncový úhel nebo",
      "specifyStartParameterOr": "Zadejte počáteční parametr nebo",
      "specifyEndParameterOr": "Zadejte koncový parametr nebo",
      "specifyIncludedAngleForArc": "Zadejte sevřený úhel oblouku",
      "specifyFirstPointOr": "Určete první objekt nebo",
      "enterSplineCreationMethod": "Zadejte způsob vytvoření spline",
      "enterKnotParameterization": "Zadejte parametrizaci uzlů",
      "knotsChord": "Tětiva",
      "knotsSquareRoot": "Druhá odmocnina",
      "knotsUniform": "Rovnoměrné",
      "enterDegreeOfSpline": "Zadejte stupeň křivky spline",
      "enterNextPoint": "Zadejte další bod",
      "enterNextPointOr": "Zadejte další bod nebo",
      "enterThirdPointOr": "Zadejte další bod nebo",
      "enterThirdCvPointOr": "Zadejte další bod nebo",
      "specifyStartTangent": "Zadejte počáteční tangentu",
      "specifyEndTangent": "Zadejte koncovou tangentu",
      "specifyDiameterOfCircle": "Určete průměr kružnice",
      "specifyFirstEndPointOfDiameter": "Určete první koncový bod průměru kružnice",
      "specifySecondEndPointOfDiameter": "Určete druhý koncový bod průměru kružnice",
      "specifyFirstPointOnCircle": "Zadejte první bod na kružnici",
      "specifySecondPointOnCircle": "Zadejte druhý bod na kružnici",
      "specifyThirdPointOnCircle": "Zadejte třetí bod na kružnici",
      "specifyFirstTangentOfCircle": "Určete bod na objektu pro první tangentu kružnice",
      "specifySecondTangentOfCircle": "Určete bod na objektu pro druhou tangentu kružnice",
      "specifySecondPoint": "Určete druhý bod",
      "secondPointOfDistance": " Určete druhý bod",
      "clarifyKeyword": [
        [
          "keywords"
        ],
        "?"
      ],
      "specifyFirstCornerPointOr": "Určete první roh nebo",
      "areaFirstCornerPointOr": "Zadejte první rohový bod nebo",
      "addModeNextPointOr": " (Režim PLUS)Určete další bod nebo zadejte",
      "subtractModeNextPointOr": " (Režim MÍNUS)Určete další bod nebo zadejte",
      "addModeNextPointOrTotal": " (Režim PLUS)Určete další bod nebo zadejte",
      "subtractModeNextPointOrTotal": " (Režim MÍNUS)Určete další bod nebo zadejte",
      "addModeSelectObjects": "(Režim PLUS) Vyberte objekty",
      "subtractModeSelectObjects": "(Režim MÍNUS) Vyberte objekty",
      "specifyOtherCornerPointOr": "Určete druhý roh nebo",
      "specifyStartPointOfArcOr": "Určete počáteční bod oblouku nebo",
      "specifySecondPointOfArcOr": "Určete druhý bod oblouku nebo",
      "specifyEndPointOfArc": "Určete koncový bod oblouku",
      "specifyCenterPointOfArc": "Určete středový bod oblouku",
      "plineCenterPointOfArc": "Určete středový bod oblouku",
      "specifyIncludedAngle": "Určete sevřený úhel",
      "specifyRadiusOfArc": "Určete poloměr oblouku",
      "specifyDirectionOfChordForArc": "Určete směr tětivy oblouku (podržením klávesy Ctrl přepnete směr)",
      "specifyIncludedAngleCtrl": "Určete sevřený úhel (podržením klávesy Ctrl přepnete směr)",
      "specifyLengthOfChordCtrl": "Určete délku tětivy (podržením klávesy Ctrl přepnete směr)",
      "specifyTangentDirectionForStartPointOfArc": "Určete tečný směr z počátečního bodu oblouku",
      "specifyEndpointOfTheArcCtrl": "Určete koncový bod oblouku (podržením klávesy Ctrl přepnete směr)",
      "specifySecondPointOnArc": "Určete druhý bod na oblouku",
      "specifyStartPointOfArc": "Určete počáteční bod oblouku",
      "specifyEndPointOfArcCtrl": "Určete koncový bod oblouku (podržením klávesy Ctrl přepnete směr)",
      "selectObjects": "Vyberte objekty",
      "removeObjects": "Vyjměte objekty",
      "specifyFirstCorner": "Určete první roh",
      "specifyOppositeCorner": "Zadejte protější roh",
      "specifyFirstFencePoint": "Zadejte první bod napříč nebo proveďte výběr/přetažení kurzorem",
      "specifyNextFencePointOr": "Zadejte další bod napříč nebo",
      "firstPolygonPoint": "První bod polygonu nebo proveďte výběr/přetažení kurzorem",
      "specifyEndpointOfLineOr": "Určete koncový bod úsečky nebo",
      "specifyBasePointOr": "Určete základní bod nebo",
      "copyBasePointOr": "Zadejte základní bod nebo",
      "copyDisplacement": "Přemístění",
      "specifyDisplacement": "Určete přemístění",
      "specifySecondPointOr": "Určete druhý bod nebo",
      "useFirstPointAsDisplacement": "použít první bod jako přemístění",
      "copyUseFirstPoint": "použít první bod jako přemístění",
      "useXScaleFactor": "použijte měřítko X",
      "copySecondPointOr": "Určete druhý bod nebo",
      "specifyBasePoint": "Určete základní bod",
      "specifyRotationAngleOr": "Určete úhel otočení nebo",
      "specifyTheReferenceAngle": "Určete referenční úhel",
      "specifyTheNewAngle": "Určete nový úhel",
      "specifyTheNewAngleOr": "Určete nový úhel nebo",
      "specifyScaleFactorOr": "Určete měřítko nebo",
      "specifyReferenceLength": "Určete referenční délku",
      "specifyNewLengthOr": "Určete novou délku nebo",
      "specifyFirstPointOfMirrorLine": "Zadejte první bod osy zrcadlení",
      "specifySecondPointOfMirrorLine": "Zadejte druhý bod osy zrcadlení",
      "eraseSourceObjects": "Chcete vymazat výchozí objekty?",
      "selectSourceOrMultipleToJoin": "Vyberte zdrojový objekt nebo více objektů, které se spojí najednou",
      "selectObjectsToJoin": "Vyberte objekty, které chcete připojit",
      "convertCombinedArcsToCircle": "Kombinované obloukové segmenty tvoří kružnici. Chcete je převést na kružnici?",
      "selectOpenCurvesToJoinToSource": "Vyberte jakékoli otevřené křivky, které chcete spojit se zdrojem",
      "selectEllipticalArcsToJoinToSourceOr": "Vyberte eliptický oblouk, který chcete spojit se zdrojem, nebo",
      "selectEllipticalArcsToJoinToSource": "Vyberte eliptické oblouky, které chcete spojit se zdrojem",
      "specifyOffsetDistanceOr": "Určete vzdálenost ekvidistanty nebo",
      "eraseSourceObjectAfterOffsetting": "Chcete vymazat zdrojový objekt po vytvoření ekvidistanty?",
      "enterLayerOptionForOffsetObjects": "Zadejte volbu hladiny objektů pro ekvidistantu",
      "selectObjectToOffsetOr": "Vyberte objekt pro ekvidistantu nebo",
      "specifyPointOnSideToOffsetOr": "Určete bod na straně odsazení nebo",
      "specifyThroughPointOr": "Určete, kterým bodem nebo",
      "nextObject": "další objekt",
      "enterImpliedEdgeExtensionMode": "Zadejte režim prodloužení hran",
      "enterTrimModeOption": "Zadejte možnost režimu oříznutí",
      "enterExtendModeOption": "Zadejte volbu režimu rozšíření",
      "selectObjectsOr": "Vyberte objekty nebo",
      "selectEdgesOr": "Vyberte objekty nebo",
      "selectAll": "vybrat vše",
      "selectObjectsToEraseOrExit": "Vyberte objekt k vymazání nebo <konec>",
      "selectObjectsToErase": "Vyberte objekty k vymazání",
      "selectObjectToTrimOrShiftSelectToExtendOr": "Vyberte objekt k oříznutí nebo s klávesou Shift k prodloužení nebo",
      "selectObjectToExtendOrShiftSelectToTrimOr": "Vyberte objekt k prodloužení nebo s klávesou Shift k oříznutí nebo",
      "selectFirstObjectOr": "Vyberte první objekt nebo",
      "selectSecondObjectOrApplyCornerOr": "Vyberte druhý objekt nebo kliknutím s podrženou klávesou Shift použijte roh nebo",
      "specifyFilletRadius": "Určete poloměr zaoblení",
      "select2dPolylineOr": "Vyberte 2D křivku nebo",
      "selectPolylineToChamferOr": "Vyberte 2D křivku nebo",
      "selectFirstLineOr": "Vyberte první úsečku nebo",
      "selectSecondLineOrApplyCornerOr": "Vyberte druhou úsečku nebo Shift-výběr pro použití rohu nebo",
      "specifyFirstChamferDistance": "Určete první vzdálenost zkosení",
      "specifySecondChamferDistance": "Určete druhou vzdálenost zkosení",
      "selectObject": "Vyberte objekt",
      "specifyFirstBreakPoint": "Zadejte první bod přerušení",
      "specifySecondBreakPointOr": "Zadejte druhý bod přerušení nebo",
      "specifySecondBreakPoint": "Zadejte druhý bod přerušení",
      "specifyBreakPoint": "Určete bod přerušení",
      "enterArrayType": "Zadejte typ pole",
      "selectGripToEditArrayOr": "Upravte pole výběrem uzlu nebo",
      "selectGripToEditPathArrayOr": "Upravte pole výběrem uzlu nebo",
      "enterNumberOfColumns": "Zadejte počet sloupců",
      "enterNumberOfRows": "Zadejte počet řádků",
      "specifyDistanceBetweenColumnsOfCell": "Určete vzdálenost mezi sloupci nebo",
      "unitCellFirstCorner": "Určete první rohový bod jednotkové buňky",
      "unitCellOppositeCorner": "Zadejte protější roh",
      "specifyDistanceBetweenColumns": "Určete vzdálenost mezi sloupců",
      "specifyDistanceBetweenRows": "Zadejte vzdálenost mezi řádky",
      "specifyDistanceBetweenRowsOfCell": "Zadejte vzdálenost mezi řádky",
      "specifyIncrementingElevationBetweenRows": "Určete rostoucí výšku mezi řádků",
      "enterNumberOfLevels": "Zadejte počet úrovně",
      "specifyDistanceBetweenLevelsOr": "Určete vzdálenost mezi úrovně nebo",
      "enterTotalDistanceBetweenLevels": "Zadejte celkovou vzdálenost mezi počáteční a koncovou úrovně",
      "specifyCenterPointOfArray": "Určete středový bod",
      "enterNumberOfItemsInArray": "Zadejte počet položek v poli",
      "specifyAngleBetweenItems": "Určete úhel mezi položkami",
      "specifyTheAngleToFill": "Určete vyplňovaný úhel (+ =pshr, -=vshr)",
      "rotateArrayedItems": "Otočit položky v poli?",
      "createAssociativeArray": "Vytvořit asociativní pole",
      "selectPathCurve": "Vyberte křivku trajektorie",
      "enterPathMethod": "Zadejte metodu křivky",
      "enterNumberOfItemsAlongPath": "Zadejte počet položek podél trajektorie",
      "specifyDistanceBetweenItemsAlongPath": "Určete vzdálenost mezi prvky podél trajektorie",
      "specifyNumberOfItemsOr": "Zadejte počet položek nebo",
      "alignArrayedItemsToPath": "Zarovnat položky v poli do trajektorie?",
      "specifyInternalPointOr": "Určete vnitřní bod nebo",
      "enterPatternNameOr": "Zadejte název vzoru nebo",
      "specifyStartPointOfText": "Zadejte počáteční bod textu",
      "specifyStartPointOfTextOr": "Zadejte počáteční bod textu nebo",
      "specifyCenterPointOfText": "Zadejte středový bod textu",
      "specifyCenterPointOfTextOr": "Zadejte středový bod textu nebo",
      "specifyRightEndpointOfTextBaseline": "Zadejte pravý koncový bod účaří textu",
      "specifyRightEndpointOfTextBaselineOr": "Zadejte pravý koncový bod účaří textu nebo",
      "specifyMiddlePointOfText": "Zadejte bod poloviny textu",
      "specifyMiddlePointOfTextOr": "Zadejte bod poloviny textu nebo",
      "specifyTopLeftPointOfText": "Zadejte levý horní bod textu",
      "specifyTopLeftPointOfTextOr": "Zadejte levý horní bod textu nebo",
      "specifyTopCenterPointOfText": "Zadejte středový horní bod textu",
      "specifyTopCenterPointOfTextOr": "Zadejte středový horní bod textu nebo",
      "specifyTopRightPointOfText": "Zadejte pravý horní bod textu",
      "specifyTopRightPointOfTextOr": "Zadejte pravý horní bod textu nebo",
      "specifyMiddleLeftPointOfText": "Zadejte levý bod poloviny textu",
      "specifyMiddleLeftPointOfTextOr": "Zadejte levý bod poloviny textu nebo",
      "specifyMiddleRightPointOfText": "Zadejte pravý bod poloviny textu",
      "specifyMiddleRightPointOfTextOr": "Zadejte pravý bod poloviny textu nebo",
      "specifyBottomLeftPointOfText": "Zadejte levý dolní bod textu",
      "specifyBottomLeftPointOfTextOr": "Zadejte levý dolní bod textu nebo",
      "specifyBottomCenterPointOfText": "Zadejte středový dolní bod textu",
      "specifyBottomCenterPointOfTextOr": "Zadejte středový dolní bod textu nebo",
      "specifyBottomRightPointOfText": "Zadejte pravý dolní bod textu",
      "specifyBottomRightPointOfTextOr": "Zadejte pravý dolní bod textu nebo",
      "enterStyleNameOr": "Zadejte název stylu nebo",
      "enterText": "Zadejte text",
      "mtextOppositeCornerOr": "Zadejte protilehlý roh nebo",
      "mtextHeight": "Zadejte výšku",
      "enterJustification": "Zadejte zarovnání",
      "enterLineSpacingType": "Zadejte typ řádkování",
      "mtextStyleNameOr": "Zadejte název stylu nebo",
      "selectObjectToDimension": "Vyberte kótovaný objekt",
      "dimensionLineLocationOr": "Zadejte umístění kótovací čáry nebo",
      "enterDimensionText": "Zadejte kótovací text",
      "specifyAngleOfDimensionText": "Zadejte úhel kótovacího textu",
      "selectArcOrCircle": "Vyberte oblouk nebo kružnici",
      "selectArcCircleLineOrVertex": "Vyberte oblouk, kružnici, úsečku nebo <zadejte vrchol>",
      "selectSecondLine": "Vyberte druhou úsečku",
      "dimensionArcLocationOr": "Zadejte umístění oblouku kótovací čáry nebo",
      "secondExtensionOriginOr": "Zadejte počátek druhé vynášecí čáry nebo",
      "selectBaseDimension": "Vyberte základní kótu",
      "selectContinuedDimension": "Vyberte řetězovou kótu",
      "spaceBaseDimension": "Vyberte základní kótu",
      "selectDimensionsToSpace": "Vyberte kóty pro nastavení mezery",
      "dimStyleOption": "Zadejte volbu kótovacího stylu",
      "dimStyleSaveName": "Zadejte název nového kótovacího stylu nebo",
      "dimStyleRedefine": "Název se již používá, předefinovat?",
      "dimStyleName": "Zadejte název kótovacího stylu, <?> nebo",
      "dimStyleSelectDimension": "vyberte kótu",
      "dimStylesToList": "Vypsat kótovací styl(y)",
      "selectDimension": "Vyberte kótu",
      "enterValueOr": "Zadejte hodnotu",
      "selectSpline": "Vyberte spline",
      "selectSplineFitPolyline": "Vyberte křivku, která bude vyhlazena na spline",
      "splineditOption": "Zadejte možnost",
      "splineditOptionClosed": "Zadejte možnost",
      "enterFitDataOption": "Zadejte možnost opravy dat",
      "specifyExistingFitPoint": "Zadejte existující bod vyhlazení na spline",
      "specifyNewPointOr": "Zadejte nový bod nebo",
      "specifyNewFitPointToAdd": "Zadejte nový bod vyhlazení, který chcete přidat",
      "specifyStartTangentOr": "Zadejte počáteční tečnu nebo",
      "specifyEndTangentOr": "Zadejte koncovou tečnu nebo",
      "enterVertexEditingOption": "Zadejte možnost úpravy vrcholů",
      "specifyPointOnSpline": "Zadejte bod na spline",
      "specifyControlVertexToDelete": "Určete řídicí vrchol, který má být odstraněn",
      "enterNewOrder": "Zadejte nový řád",
      "specifyNewLocationOr": "Zadejte nové umístění nebo",
      "enterNewWeightOr": [
        "Zadejte novou váhu (aktuální = ",
        [
          "weight"
        ],
        ") nebo"
      ],
      "specifyPrecision": "Zadejte přesnost",
      "selectPolylineOr": "Vyberte křivku nebo",
      "turnIntoPolyline": "Chcete jej změnit na křivku?",
      "convertToPolylines": "Převést úsečky, oblouky a spline na křivky [Ano/Ne]?",
      "specifyPrecisionForSplineConversion": "Určete přesnost převodu spline",
      "peditOption": "Zadejte možnost",
      "peditMultipleOption": "Zadejte možnost",
      "peditOption3d": "Zadejte možnost",
      "enterFuzzDistanceOr": "Zadejte vzdálenost nebo",
      "enterJoinType": "Zadejte typ spojení",
      "specifyNewWidthForAllSegments": "Určete novou šířku pro všechny segmenty",
      "linetypeGenerationOption": "Zadejte volbu generování typu čáry křivky",
      "peditVertexOption": "Zadejte volbu úprav vrcholů",
      "peditWalkOption": "Zadejte možnost",
      "specifyLocationForNewVertex": "Určete polohu nového vrcholu",
      "specifyNewLocationForMarkedVertex": "Určete nové umístění označeného vrcholu",
      "startingWidthForNextSegment": "Určete počáteční šířku dalšího segmentu",
      "endingWidthForNextSegment": "Určete koncovou šířku dalšího segmentu",
      "directionOfVertexTangent": "Určete směr tečny vrcholu",
      "peditNextShort": "V",
      "joinTypeExtend": "Prodloužit",
      "joinTypeAdd": "přiDat",
      "joinTypeBoth": "Oba",
      "exitLower": "konec",
      "nextShort": "D",
      "previousShort": "Z",
      "extrudeSelectOr": "Vyberte objekty, které chcete vysunout, nebo",
      "closedProfilesMode": "Režim vytváření uzavřených profilů",
      "closedProfilesSolid": "Těleso",
      "extrudeHeightOr": "Určete výšku vytažení nebo",
      "extrudeHeightDefaultOr": "Určete výšku vytažení nebo",
      "extrudeTaperOr": "Určete úhel zešikmení pro vytažení nebo",
      "enterExpression": "Zadejte výraz",
      "directionStart": "Určete počáteční bod směru",
      "directionEnd": "Určete koncový bod směru",
      "eraseDefiningObjects": "Vymazat definiční objekty?",
      "revolveSelectOr": "Vyberte objekty, které chcete otočit, nebo",
      "revolveAxisStartOr": "Určete počáteční bod osy nebo definujte osu podle",
      "revolveAxisEnd": "Určete koncový bod osy",
      "revolveSelectAxis": "Vyberte objekt",
      "revolveAngleOr": "Určete úhel otočení nebo",
      "revolveStartAngle": "Určete počáteční úhel",
      "presspullSelect": "Vyberte objekt nebo ohraničenou oblast",
      "presspullHeightOr": "Určete výšku vysunutí nebo",
      "presspullOffsetOr": "Určete vzdálenost ekvidistanty nebo",
      "selectObjectsToSlice": "Vyberte objekty, které chcete odříznout",
      "sliceStartOr": "Určete počáteční bod rovině řezu nebo",
      "sectionFirstPointOr": "Určete první bod na Rovina řezu",
      "planeSecondPoint": "Zadejte druhý bod na rovině",
      "sliceObject": "Vybráním kružnice, elipsy, oblouku, 2D spline, 2D křivky definujte rovinu odříznutí",
      "sectionObject": "Vyberte kružnici, elipsu, oblouk, 2D spline nebo 2D křivku",
      "sliceSurface": "Vyberte povrch",
      "planeSectionPoint": "Zadejte bod na rovině řezu",
      "planeZAxisPoint": "Zadejte bod na ose Z (normále) roviny",
      "planeViewPoint": "Zadejte bod v aktuální rovině pohledu",
      "planeXYPoint": "Zadejte bod v rovině XY",
      "planeYZPoint": "Zadejte bod v rovině YZ",
      "planeZXPoint": "Zadejte bod v rovině ZX",
      "planeFirstPoint": "Zadejte první bod na rovině",
      "planeThirdPoint": "Zadejte třetí bod na rovině",
      "sliceSideOr": "Určete bod na požadované straně nebo",
      "sliceBoth": "Oba",
      "filletEdgeSelectOr": "Vyberte hranu nebo",
      "filletEdgeChainOr": "Vyberte řetěz hrany nebo",
      "filletEdgeLoopOr": "Vyberte hranu smyčky nebo",
      "edgeLoopOption": "Zadejte možnost",
      "filletEdgeAccept": "Potvrďte zaoblení stisknutím klávesy Enter nebo",
      "filletEdgeRadiusOr": "Zadejte poloměr zaoblení nebo",
      "filletEdgeAcceptRadiusOr": "Určete poloměr nebo",
      "filletEdgeGripRadiusOr": "Určete poloměr nebo",
      "chamferEdgeSelectOr": "Vyberte hranu nebo",
      "chamferEdgeAnotherOr": "Vyberte jinou hranu na stejné ploše nebo",
      "chamferEdgeLoopOr": "Vyberte smyčku hran nebo",
      "chamferEdgeAccept": "Potvrďte zkosení stisknutím klávesy Enter nebo",
      "chamferEdgeDistance1Or": "Určete vzdálenost 1 nebo",
      "chamferEdgeDistance2Or": "Určete vzdálenost 2 nebo",
      "chamferEdgeBaseDistanceOr": "Určete vzdálenost zkosení základní rovina nebo",
      "chamferEdgeOtherDistanceOr": "Určete vzdálenost zkosení jiná rovina nebo",
      "solideditOption": "Zadejte volbu úprav těles",
      "solideditFaceOption": "Zadejte volbu úprav plochy",
      "selectFacesOr": "Vyberte hrany nebo",
      "removeFacesOr": "Vyjměte plochy nebo",
      "solideditHeightOr": "Zadejte výšku vysunutí nebo",
      "solideditExtrudeTaper": "Zadejte úhel zešikmení při vysunutí",
      "solideditBase": "Zadejte základní bod nebo přemístění",
      "solideditSecond": "Zadejte druhý bod přemístění",
      "solideditAxisOr": "Zadejte bod na ose nebo",
      "solideditAxisFirst": "Zadejte první bod na ose rotace",
      "solideditAxisSecond": "Zadejte druhý bod na ose rotace",
      "solideditOrigin": "Zadejte počátek rotace",
      "solideditAngleOr": "Zadejte úhel otočení nebo",
      "solideditOffset": "Zadejte vzdálenost ekvidistanty",
      "solideditTaperBase": "Zadejte základní bod",
      "solideditTaperAxis": "Zadejte jiný bod podél osy zešikmení",
      "solideditTaperAngle": "Zadejte úhel zešikmení",
      "specifyAPoint": "Určete bod",
      "specifyAPointOr": "Určete bod nebo",
      "specifyThroughPoint": "Určete kterým bodem",
      "specifyThroughPointAxis": "Určete kterým bodem",
      "xlineAngleOr": [
        "Zadejte úhel přímky (",
        [
          "angle"
        ],
        ") nebo"
      ],
      "xlineAngle": "Zadejte úhel přímky",
      "selectLineObject": "Vyberte čárový objekt",
      "specifyAngleVertexPoint": "Určete bod vrcholu úhlu",
      "specifyAngleStartPoint": "Určete počátek úhlu",
      "specifyAngleEndPoint": "Určete konec úhlu",
      "xlineOffsetDistanceOr": "Určete vzdálenost ekvidistanty nebo",
      "specifySideToOffset": "Na kterou stranu?",
      "rayStartPoint": "Určete počáteční bod",
      "selectObjectToDivide": "Vyberte objekt pro dělení dle počtu",
      "selectObjectToMeasure": "Vyberte objekt pro dělení dle měření",
      "divideCountOr": "Zadejte počet segmentů nebo",
      "divideCount": "Zadejte počet segmentů",
      "measureLengthOr": "Určete délku segmentu nebo",
      "measureLength": "Určete délku segmentu",
      "blockToInsert": "Zadejte název vkládaného bloku",
      "alignBlockWithObject": "Zarovnat blok podle objektu?",
      "solidFirstPoint": "Zadejte první bod",
      "solidSecondPoint": "Určete druhý bod",
      "solidThirdPoint": "Určete třetí bod",
      "solidFourthPointOr": "Zadejte čtvrtý bod nebo",
      "face3dFirstPoint": "Zadejte první bod nebo",
      "face3dSecondPoint": "Určete druhý bod nebo",
      "face3dThirdPoint": "Určete třetí bod nebo",
      "face3dFourthPoint": "Určete čtvrtý bod nebo",
      "exitFace3d": "konec",
      "createThreeSidedFace": "vytvoř trojstrannou plochu",
      "exitSolid": "konec",
      "leaderStartPoint": "Zadejte počáteční bod pozice",
      "leaderNextPoint": "Zadejte další bod",
      "leaderNextPointOr": "Zadejte další body nebo",
      "leaderFormatOption": "Zadejte formát pozice",
      "leaderFirstLine": "Zadejte první řádek textu poznámky nebo",
      "leaderOptions": "možnosti",
      "leaderNextLine": "Zadejte další řádek textu poznámky",
      "leaderAnnotationOption": "Zadejte volbu poznámky",
      "leaderCopyObject": "Vyberte kopírovaný objekt",
      "wipeoutFirstPoint": "Zadejte první bod nebo",
      "wipeoutSecondPoint": "Zadejte další bod",
      "wipeoutNextPointOr": "Zadejte další bod nebo",
      "wipeoutNextPointOrClose": "Zadejte další bod nebo",
      "selectClosedPolyline": "Vyberte uzavřenou křivku",
      "erasePolyline": "Vymazat křivku?",
      "wipeoutFrameMode": "Zadejte režim",
      "wipeoutFramesOn": "ANO",
      "wipeoutFramesOff": "NE",
      "wipeoutFramesDisplay": "Zobrazit bez vykreslení"
    },
    "promptForms": {
      "specifySideToOffset": "open",
      "convertToPolylines": "open",
      "currentLayerOff": "open",
      "purgeBlock": "open",
      "purgeLinetype": "open",
      "reloadLinetype": "open",
      "selectGripToEditArrayOr": "spaced",
      "selectGripToEditPathArrayOr": "spaced",
      "turnIntoPolyline": "open",
      "ucsMoveOrigin": "spaced",
      "ucsOrthographic": "spaced",
      "ucsReplace": "open",
      "ucsZdepth": "spaced",
      "undoEverything": "open",
      "viewOrthographic": "spaced",
      "sliceStartOr": "spaced",
      "solidHeightTopOr": "spaced"
    },
    "answerForms": {
      "dimStyleRedefine": "tight",
      "mredoCount": "spaced",
      "presspullHeightOr": "tight",
      "presspullOffsetOr": "tight",
      "presspullSelect": "tight",
      "selectDimensionsToSpace": "tight",
      "selectGripToEditPathArrayOr": "spaced",
      "selectPolylineOr": "spaced",
      "spaceBaseDimension": "tight",
      "specifyDistanceBetweenRowsOfCell": "spaced",
      "unitCellFirstCorner": "spaced",
      "filletEdgeAccept": "tight",
      "chamferEdgeAccept": "tight",
      "filletEdgeGripRadiusOr": "tight",
      "alignArrayedItemsToPath": "spaced",
      "enterArrayType": "spaced",
      "enterPathMethod": "spaced",
      "enterNumberOfColumns": "spaced",
      "enterNumberOfRows": "spaced",
      "enterNumberOfLevels": "spaced",
      "specifyDistanceBetweenColumns": "spaced",
      "specifyDistanceBetweenRows": "spaced",
      "specifyDistanceBetweenLevelsOr": "spaced",
      "specifyIncrementingElevationBetweenRows": "spaced",
      "selectArcCircleLineOrVertex": "spaced",
      "enterThirdCvPointOr": "spaced"
    },
    "promptTails": {
      "layerColor": ""
    },
    "format": {
      "idle": "Příkaz",
      "commandPrompt": [
        [
          "command"
        ],
        " ",
        [
          "question"
        ]
      ],
      "answered": [
        [
          "prompt"
        ],
        " ",
        [
          "answer"
        ]
      ],
      "answeredTight": [
        [
          "prompt"
        ],
        [
          "answer"
        ]
      ],
      "snapOverride": [
        [
          "snap"
        ],
        [
          "preposition",
          1,
          {
            "to": " k",
            "of": " z",
            "other": ""
          }
        ]
      ],
      "transparentCommand": [
        "'",
        [
          "command"
        ]
      ],
      "transparentPrompt": [
        ">>",
        [
          "question"
        ]
      ],
      "prompt": [
        [
          "head"
        ],
        ":"
      ],
      "promptWithValue": [
        [
          "head"
        ],
        " <",
        [
          "value"
        ],
        ">:"
      ],
      "promptWithValueTight": [
        [
          "head"
        ],
        "<",
        [
          "value"
        ],
        ">:"
      ],
      "promptWithValueOpen": [
        [
          "head"
        ],
        " <",
        [
          "value"
        ],
        ">"
      ],
      "promptWithKeywords": [
        [
          "head"
        ],
        " ",
        [
          "keywords",
          "[",
          [
            "list"
          ],
          "]"
        ],
        ":"
      ],
      "promptWithDefault": [
        [
          "head"
        ],
        " ",
        [
          "keywords",
          "[",
          [
            "list"
          ],
          "]"
        ],
        " <",
        [
          "value"
        ],
        ">:"
      ],
      "promptWithDefaultTight": [
        [
          "head"
        ],
        " ",
        [
          "keywords",
          "[",
          [
            "list"
          ],
          "]"
        ],
        "<",
        [
          "value"
        ],
        ">:"
      ],
      "promptWithDefaultOpen": [
        [
          "head"
        ],
        " ",
        [
          "keywords",
          "[",
          [
            "list"
          ],
          "]"
        ],
        " <",
        [
          "value"
        ],
        ">"
      ],
      "promptWithKeywordsTail": [
        [
          "head"
        ],
        " ",
        [
          "keywords",
          "[",
          [
            "list"
          ],
          "]"
        ],
        " ",
        [
          "tail"
        ],
        ":"
      ],
      "promptWithDefaultTail": [
        [
          "head"
        ],
        " ",
        [
          "keywords",
          "[",
          [
            "list"
          ],
          "]"
        ],
        " ",
        [
          "tail"
        ],
        " <",
        [
          "value"
        ],
        ">:"
      ],
      "promptWithDefaultBeforeTail": [
        [
          "head"
        ],
        " ",
        [
          "keywords",
          "[",
          [
            "list"
          ],
          "]"
        ],
        " <",
        [
          "value"
        ],
        "> ",
        [
          "tail"
        ],
        ":"
      ],
      "keywordSeparator": "/",
      "keywordOr": " nebo ",
      "optionValue": [
        [
          "keyword"
        ],
        ": ",
        [
          "value"
        ]
      ],
      "cartesian": "X,Y",
      "polar": "Vzd<Úhel"
    },
    "messages": {
      "unknownCommand": [
        "Neznámý příkaz \"",
        [
          "name"
        ],
        "\". Stiskněte F1 pro nápovědu."
      ],
      "cancel": "*Storno*",
      "commandCancelled": "*Storno*",
      "resumingCommand": [
        "Pokračuji v příkazu ",
        [
          "command"
        ],
        "."
      ],
      "readOnlyVariable": [
        [
          "name"
        ],
        " = ",
        [
          "value"
        ],
        " (pouze ke čtení)"
      ],
      "readOnlyListed": "(pouze ke čtení)",
      "unknownVariableName": "Neznámý název proměnné. Zadejte SYSPAR ? pro výpis seznamu proměnných.",
      "cannotSetVariable": [
        "Nelze nastavit proměnnou ",
        [
          "name"
        ],
        " na takovou hodnotu."
      ],
      "requiresZeroOrOne": "Vyžaduje pouze 0 nebo 1.",
      "requiresZeroOrOneOrKeyword": "Vyžaduje pouze 0 nebo 1, nebo klíčové slovo.",
      "notTransparent": "** Tento příkaz nelze spustit transparentně **",
      "rotateSettings": [
        "Aktuální kladný úhel v USS:  ANGDIR=proti.sm.ručiček  ANGBASE=",
        [
          "angbase"
        ]
      ],
      "rotatingCopy": "Otočení kopie vybraných objektů.",
      "scalingCopy": "Změna velikosti kopie vybraných objektů.",
      "trimExtendSettings": [
        "Aktuální nastavení: Promítnutí=USS, Hrana=",
        [
          "edge",
          1,
          {
            "extend": "Prodloužit",
            "other": "Žádné"
          }
        ],
        ", Režim=",
        [
          "mode",
          1,
          {
            "standard": "Standardní",
            "other": "Rychlé"
          }
        ]
      ],
      "selectCuttingEdges": "Vybrat ořezávací hrany...",
      "selectBoundaryEdges": "Vybrat hraniční hrany...",
      "doesNotIntersectCuttingEdge": "Neprotíná se s ořezávací hranou.",
      "pathDoesNotIntersectBoundingEdge": "Trajektorie se neprotíná s ohraničující hranou.",
      "objectDoesNotIntersectEdge": "Objekt neprotíná hranu.",
      "cannotExtendObject": "Tento objekt nelze prodloužit.",
      "cannotExtendThisObject": "Tento objekt nelze prodloužit.",
      "cannotExtendClosedPolyline": "Uzavřenou křivku nelze prodloužit.",
      "cannotTrimObject": "Tento objekt nelze oříznout.",
      "cannotTrimThisObject": "Tento objekt nelze oříznout.",
      "objectPerpendicularToUcs": "Objekt je kolmý k rovině XY v USS.",
      "edgePerpendicularToUcs": "Hrana je kolmá k rovině XY v USS.",
      "noEdgeInThatDirection": "V tomto směru není žádná hrana.",
      "noObjectsCrossedByCrossingWindow": "Křížením nebyly nalezeny žádné křížené objekty.",
      "circleMustIntersectTwice": "Kružnice musí být protnuta dvakrát.",
      "curveMustIntersectTwice": "Křivka musí protínat ořezávací hrany nejméně dvakrát.",
      "filletSettings": [
        "Aktuální nastavení: Režim = OŘEŽ, Poloměr = ",
        [
          "radius"
        ]
      ],
      "chamferSettings": [
        "(režim OŘEŽ) Aktuální zkosení: Vzd1 = ",
        [
          "dist1"
        ],
        ", Vzd2 = ",
        [
          "dist2"
        ]
      ],
      "offsetSettings": [
        "Aktuální nastavení: Vymazat zdroj=",
        [
          "erase",
          1,
          {
            "yes": "Ano",
            "other": "Ne"
          }
        ],
        "  Hladina=",
        [
          "layer",
          1,
          {
            "current": "Aktuální",
            "other": "Zdroj"
          }
        ],
        "  OFFSETGAPTYPE=0"
      ],
      "objectOnLockedLayer": "Objekt je v uzamknuté hladině.",
      "objectNotABlock": " Tento objekt není blok.",
      "blockHasNoEditableAttributes": " Tento blok nemá žádné upravitelné atributy.",
      "selectedEntityNotABlock": "Vybraná entita není blok.",
      "selectedBlockHasNoEditableAttributes": "Vybraný blok nemá žádné upravitelné atributy.",
      "matchpropSettings": "Aktuální aktivní nastavení:  Barva Hladina Typ čáry Tloušťka čáry Tloušťka Kóta Text Šrafy",
      "matchpropLockedDestination": "Cílový objekt je v uzamknuté hladině. Nelze aktualizovat.",
      "varies": "mění se",
      "layerNotFound": [
        "Nemohu nalézt hladina \"",
        [
          "name"
        ],
        "\"."
      ],
      "invalidLayerName": "Neplatný název hladina.",
      "currentLayerName": [
        "Aktuální hladina:  \"",
        [
          "name"
        ],
        "\""
      ],
      "layerListColumns": "Název hladiny Stav Barva Typ čáry Tloušťka čáry ------------------ --------- ------------- ------------ -----------------",
      "layerOn": "ano",
      "layerOff": "ne",
      "layerLockedFlag": "-U",
      "layerPlotsFlag": "-V",
      "layerListCurrent": [
        "Aktuální hladina: \"",
        [
          "name"
        ],
        "\""
      ],
      "noMatchingLayerNames": "Hladina s odpovídajícím názvem nebyla nalezena.",
      "layerAlreadyExists": [
        "Hladina \"",
        [
          "name"
        ],
        "\" již existuje."
      ],
      "invalidLayerNameQuoted": [
        "\"",
        [
          "name"
        ],
        "\" je neplatný název hladiny."
      ],
      "cannotRenameLayer": [
        "Nemohu přejmenovat hladina \"",
        [
          "name"
        ],
        "\"."
      ],
      "layerNameInUse": [
        "hladina s názvem \"",
        [
          "name"
        ],
        "\" již existuje."
      ],
      "layersNotDeleted": "Vybrané hladiny nelze odstranit.",
      "layerNoObjectFound": "Nebyl nalezen žádný objekt.",
      "layerMadeCurrent": [
        "Hladina \"",
        [
          "name"
        ],
        "\" byla nastavena jako aktuální."
      ],
      "invalidColor": "Neplatná barva.",
      "layerLoadedLinetypes": "Načtené typy čar:",
      "layerLinetypeNotFound": [
        "Typ čáry \"",
        [
          "name"
        ],
        "\" nebyl nalezen. Použijte příkaz TYPČ pro jeho načtení."
      ],
      "linetypeNotLoaded": [
        "Typ čáry \"",
        [
          "name"
        ],
        "\" nebyl nalezen. Použijte příkaz TYPČ pro jeho načtení."
      ],
      "invalidLinetypeName": "Neplatný název typ čáry.",
      "cannotChangeThickness": [
        "Nelze změnit tloušťku pro ",
        [
          "type",
          1,
          {
            "ellipse": "ELLIPSE",
            "spline": "SPLINE",
            "polyline3d": "3D křivky",
            "mtext": "MTEXT",
            "dimension": "DIMENSION",
            "hatch": "HATCH",
            "other": "BLOKy"
          }
        ],
        "."
      ],
      "invalidThroughPoint": "Neplatný bod.",
      "cannotOffsetObject": "Nelze vytvořit ekvidistantu k tomuto objektu.",
      "cannotOffsetAtViewDirection": "V aktuálním směru pohledu nelze vytvořit ekvidistantu k tomuto objektu.",
      "objectsFound": [
        [
          "box",
          1,
          {
            "yes": "Zadejte protější roh: ",
            "other": ""
          }
        ],
        "nalezeno ",
        [
          "found"
        ],
        [
          "duplicate",
          2,
          {
            "=0": "",
            "other": [
              " (duplicitní: ",
              0,
              ")"
            ]
          }
        ],
        [
          "removed",
          2,
          {
            "=0": "",
            "other": [
              ", vyjmuto: ",
              0
            ]
          }
        ],
        [
          "hasTotal",
          1,
          {
            "yes": [
              ", celkem ",
              [
                "total"
              ]
            ],
            "other": ""
          }
        ]
      ],
      "lassoMode": [
        [
          "mode",
          1,
          {
            "window": "Okno",
            "crossing": "Křížení",
            "other": "Napříč"
          }
        ],
        " Nepravidelný výběr Pomocí mezerníku můžete procházet možnostmi."
      ],
      "onLockedLayer": [
        [
          "count",
          2,
          {
            "one": [
              0,
              " byl v uzamknuté hladině."
            ],
            "other": [
              0,
              " byly v uzamknuté hladině."
            ]
          }
        ]
      ],
      "noPreviousSelection": "Žádná předchozí výběrová množina.",
      "allSelectionsUndone": "Všechny výběry byly vráceny zpět.",
      "invalidWindowSpecification": "Neplatné určení okna.",
      "invalidResponse": "Neplatná odpověď.",
      "polygonSegmentZeroLength": "Neplatný bod, segment polygonu má nulovou délku.",
      "polygonSegmentsIntersect": "Neplatný bod, segmenty polygonu se nemohou protínat.",
      "copyModeMultiple": "Aktuální nastavení:  Režim kopírování = Násobek",
      "stretchSelection": "Vyberte objekty pro protažení křížením nebo k-polygonem...",
      "currentLineWidth": [
        "Aktuální šířka úsečky je ",
        [
          "width"
        ]
      ],
      "erased": [
        [
          "count",
          2,
          {
            "one": [
              "Vymazán ",
              0,
              " objekt."
            ],
            "few": [
              "Vymazány ",
              0,
              " objekty."
            ],
            "many": [
              "Vymazáno ",
              0,
              " objektu."
            ],
            "other": [
              "Vymazáno ",
              0,
              " objektů."
            ]
          }
        ]
      ],
      "snapMode": [
        " <Krok ",
        [
          "state",
          1,
          {
            "on": "ano",
            "other": "ne"
          }
        ],
        ">"
      ],
      "osnapMode": [
        " <Uchop ",
        [
          "state",
          1,
          {
            "on": "ano",
            "other": "ne"
          }
        ],
        ">"
      ],
      "orthoMode": [
        " <Orto ",
        [
          "state",
          1,
          {
            "on": "ano",
            "other": "ne"
          }
        ],
        ">"
      ],
      "polarMode": [
        " <Polárně ",
        [
          "state",
          1,
          {
            "on": "ano",
            "other": "ne"
          }
        ],
        ">"
      ],
      "otrackMode": [
        " <Trasování uchopení objektů ",
        [
          "state",
          1,
          {
            "on": "ano",
            "other": "ne"
          }
        ],
        ">"
      ],
      "gridMode": [
        " <Rastr ",
        [
          "state",
          1,
          {
            "on": "ano",
            "other": "ne"
          }
        ],
        ">"
      ],
      "selectionCyclingMode": [
        " <Přepínání výběru ",
        [
          "state",
          1,
          {
            "on": "zapnuto",
            "other": "vypnuto"
          }
        ],
        ">"
      ],
      "everythingDeselected": "Výběr všech objektů byl zrušen",
      "selectingObjectsDone": "Výbìr objektù...hotovo.",
      "fromNeedsPoint": "ODBODU vyžaduje výzvu k zadání bodu.",
      "fromBase": "ODBODU: vyberte základní bod.",
      "fromOffset": "ODBODU: odsazení od základního bodu.",
      "angleOverride": [
        "Přenastavení úhlu: ",
        [
          "angle"
        ]
      ],
      "zNotAllowed": "Z-souřadnice zde nejsou povoleny.",
      "saveUnavailable": "Uložení do souboru zde není k dispozici.",
      "openUnavailable": "Otevření souboru zde není k dispozici.",
      "openFailed": "Soubor nelze otevřít.",
      "saveFailed": "Soubor nelze uložit.",
      "dxfHeaderError": [
        "Chyba v záhlaví výkresu na řádku ",
        [
          "line"
        ],
        "."
      ],
      "dxfReadError": [
        "Chyba čtení DXF na řádku ",
        [
          "line"
        ],
        "."
      ],
      "dxfNotValid": [
        [
          "name"
        ],
        " není platný DXF soubor"
      ],
      "dxfDiscarded": "Neplatný nebo neúplný DXF soubor -- výkres zrušen.",
      "dxfLeftOut": [
        [
          "count",
          2,
          {
            "one": [
              0,
              " objekt nebyl otevřen"
            ],
            "few": [
              0,
              " objekty nebyly otevřeny"
            ],
            "many": [
              0,
              " objektu nebylo otevřeno"
            ],
            "other": [
              0,
              " objektů nebylo otevřeno"
            ]
          }
        ],
        ": ",
        [
          "types"
        ],
        "."
      ],
      "xrefResolve": [
        "Zpracování xrefu \"",
        [
          "name"
        ],
        "\": ",
        [
          "path"
        ]
      ],
      "xrefNotFound": [
        "\"",
        [
          "file"
        ],
        "\" nelze nalézt."
      ],
      "xrefLabel": [
        "Xref ",
        [
          "path"
        ]
      ],
      "dxfLowPrecision": "Upozornění: Zadali jste nižší rozlišení pro DXF soubor, což může vést ke ztrátě přesnosti výkresu.",
      "dxfNotSaved": [
        [
          "count",
          2,
          {
            "one": [
              0,
              " objekt nebyl uložen"
            ],
            "few": [
              0,
              " objekty nebyly uloženy"
            ],
            "many": [
              0,
              " objektu nebylo uloženo"
            ],
            "other": [
              0,
              " objektů nebylo uloženo"
            ]
          }
        ],
        ": ",
        [
          "types"
        ],
        "."
      ],
      "dxfInLayouts": [
        [
          "count",
          2,
          {
            "one": [
              0,
              " objekt v rozvržení nebyl otevřen."
            ],
            "few": [
              0,
              " objekty v rozvrženích nebyly otevřeny."
            ],
            "many": [
              0,
              " objektu v rozvrženích nebylo otevřeno."
            ],
            "other": [
              0,
              " objektů v rozvrženích nebylo otevřeno."
            ]
          }
        ]
      ],
      "dxfUnreadable": [
        [
          "count",
          2,
          {
            "one": [
              0,
              " objekt nelze přečíst."
            ],
            "few": [
              0,
              " objekty nelze přečíst."
            ],
            "many": [
              0,
              " objektu nelze přečíst."
            ],
            "other": [
              0,
              " objektů nelze přečíst."
            ]
          }
        ]
      ],
      "fileError": {
        "invalidJson": "Soubor není platný JSON.",
        "unrecognised": "Nerozpoznaný soubor výkresu.",
        "notADrawing": "Tento soubor není výkres MellowCAD.",
        "newerVersion": "Tento výkres byl vytvořen v novější verzi MellowCAD. Pro jeho otevření aplikaci aktualizujte."
      },
      "clipboardEmpty": "Schránka je prázdná.",
      "noUnusedBlocks": "Žádné nepoužité bloky.",
      "blocksPurged": [
        [
          "count",
          2,
          {
            "one": [
              "Vyčištěn ",
              0,
              " blok."
            ],
            "few": [
              "Vyčištěny ",
              0,
              " bloky."
            ],
            "many": [
              "Vyčištěno ",
              0,
              " bloku."
            ],
            "other": [
              "Vyčištěno ",
              0,
              " bloků."
            ]
          }
        ]
      ],
      "purgeSettings": "Vnořené položky = Vypnuto    Osamocená data = Vypnuto",
      "deletingBlock": [
        "Odstraňování blok \"",
        [
          "name"
        ],
        "\"."
      ],
      "blocksDeleted": [
        [
          "count",
          2,
          {
            "one": [
              "Odstraněno ",
              0,
              " položek blok."
            ],
            "other": [
              "Odstraněno ",
              0,
              " položek bloky."
            ]
          }
        ]
      ],
      "noUnreferencedBlocks": "Nebyla nalezena žádná neodkazovaná položka bloky.",
      "deletingLinetype": [
        "Odstraňování typ čáry \"",
        [
          "name"
        ],
        "\"."
      ],
      "linetypesDeleted": [
        [
          "count",
          2,
          {
            "one": [
              "Odstraněno ",
              0,
              " položek typ čáry."
            ],
            "other": [
              "Odstraněno ",
              0,
              " položek typy čar."
            ]
          }
        ]
      ],
      "noUnreferencedLinetypes": "Nebyla nalezena žádná neodkazovaná položka typy čar.",
      "noBlocks": "Nejsou definovány žádné bloky.",
      "blockUndefined": [
        "Blok \"",
        [
          "name"
        ],
        "\" není definován."
      ],
      "insertXref": "** Chyba: Nelze vložit xref. Místo toho použijte XREF Připoj.",
      "hatchPatternUnknown": "Neznámý název vzoru.",
      "hatchTooDense": "Rozteč šrafů je příliš hustá nebo je velikost teček příliš malá.",
      "hatchNoBoundary": "Nenalezena platná hranice šrafování.",
      "noBoundaryToUndo": "Žádná hranice pro Zpět.",
      "areaAlreadySpecified": "Tato plocha již byla určena.",
      "unableToHatchBoundary": "Nemohu vyšrafovat hranici.",
      "pointOnObject": "Bod je přímo na objektu.",
      "textStyleUndefined": [
        "Nemohu nalézt styl písma \"",
        [
          "name"
        ],
        "\"."
      ],
      "textJustifyOptions": [
        "Zadejte možnost [",
        [
          "keywords"
        ],
        "]:"
      ],
      "attributeModes": [
        "Aktuální režimy atributů:\nNeviditelný=",
        [
          "invisible",
          1,
          {
            "yes": "A",
            "other": "N"
          }
        ],
        "  Konstantní=",
        [
          "constant",
          1,
          {
            "yes": "A",
            "other": "N"
          }
        ],
        "  Ověřovaný=",
        [
          "verify",
          1,
          {
            "yes": "A",
            "other": "N"
          }
        ],
        "  Přednastavený=",
        [
          "preset",
          1,
          {
            "yes": "A",
            "other": "N"
          }
        ],
        "  Uzamknutá pozice=",
        [
          "lockPosition",
          1,
          {
            "yes": "A",
            "other": "N"
          }
        ],
        "  Poznámky=N  Více řádků=N"
      ],
      "enterAttributeValues": "Zadejte hodnoty atributů",
      "verifyAttributeValues": "Ověření hodnot atributů",
      "explodeRejected": [
        [
          "count",
          2,
          {
            "one": [
              0,
              " byl nerozložitelný."
            ],
            "other": [
              0,
              " byly nerozložitelné."
            ]
          }
        ]
      ],
      "explodeXref": [
        [
          "count",
          2,
          {
            "one": [
              0,
              " byl xref."
            ],
            "other": [
              0,
              " byly xrefy."
            ]
          }
        ]
      ],
      "explodeLostWidth": "Rozložením této křivky ztratíte informace o tloušťce.\nObnovíte je příkazem ZPĚT.",
      "explodeCannot": [
        "Nelze rozložit ",
        [
          "name"
        ]
      ],
      "noneFound": "Nic nenalezeno.",
      "massPropRegionsIgnored": [
        [
          "count",
          2,
          {
            "=1": "1 oblast ignorována.",
            "other": [
              0,
              " oblastí ignorováno."
            ]
          }
        ]
      ],
      "massPropNoneSelected": "Nevybráno žádné těleso ani oblast.",
      "massPropNothingSelected": "Nic nebylo vybráno.",
      "massPropUnableToOpen": [
        "Nelze otevřít soubor objemových charakteristik ",
        [
          "name"
        ],
        "."
      ],
      "massPropRegions": [
        "\n ----------------   OBLASTI   ---------------- \n\nPlocha:                  ",
        [
          "area"
        ],
        " \nObvod:                   ",
        [
          "perimeter"
        ],
        " \nOhraničující kvádr:   X: ",
        [
          "minX"
        ],
        "  --  ",
        [
          "maxX"
        ],
        " \n                      Y: ",
        [
          "minY"
        ],
        "  --  ",
        [
          "maxY"
        ],
        " \nTěžiště:              X: ",
        [
          "x"
        ],
        " \n                      Y: ",
        [
          "y"
        ],
        " \nMomenty setrvačnosti: X: ",
        [
          "momentX"
        ],
        "  \n                      Y: ",
        [
          "momentY"
        ],
        "  \nDeviační moment:     XY: ",
        [
          "productXY"
        ],
        "  \nPol. setrvačnosti:    X: ",
        [
          "radiusX"
        ],
        " \n                      Y: ",
        [
          "radiusY"
        ],
        " \nHlavní momenty a X-Y směry z těžiště:\n                      I: ",
        [
          "i"
        ],
        " podél [",
        [
          "iX"
        ],
        " ",
        [
          "iY"
        ],
        "]\n                      J: ",
        [
          "j"
        ],
        " podél [",
        [
          "jX"
        ],
        " ",
        [
          "jY"
        ],
        "]\n"
      ],
      "massPropRegionsInSpace": [
        "\n ----------------   OBLASTI   ---------------- \n\nPlocha:                  ",
        [
          "area"
        ],
        " \nObvod:                   ",
        [
          "perimeter"
        ],
        " \nOhraničující kvádr:   X: ",
        [
          "minX"
        ],
        "  --  ",
        [
          "maxX"
        ],
        " \n                      Y: ",
        [
          "minY"
        ],
        "  --  ",
        [
          "maxY"
        ],
        " \n                      Z: ",
        [
          "minZ"
        ],
        "  --  ",
        [
          "maxZ"
        ],
        " \nTěžiště:              X: ",
        [
          "x"
        ],
        " \n                      Y: ",
        [
          "y"
        ],
        " \n                      Z: ",
        [
          "z"
        ],
        " \n"
      ],
      "massPropSolids": [
        "\n ----------------   TĚLESA    ---------------- \n\nHmotnost:                ",
        [
          "mass"
        ],
        " \nObjem:                   ",
        [
          "volume"
        ],
        " \nOhraničující kvádr:   X: ",
        [
          "minX"
        ],
        "  --  ",
        [
          "maxX"
        ],
        " \n                      Y: ",
        [
          "minY"
        ],
        "  --  ",
        [
          "maxY"
        ],
        " \n                      Z: ",
        [
          "minZ"
        ],
        "  --  ",
        [
          "maxZ"
        ],
        " \nTěžiště:              X: ",
        [
          "x"
        ],
        " \n                      Y: ",
        [
          "y"
        ],
        " \n                      Z: ",
        [
          "z"
        ],
        " \nMomenty setrvačnosti: X: ",
        [
          "momentX"
        ],
        "  \n                      Y: ",
        [
          "momentY"
        ],
        "  \n                      Z: ",
        [
          "momentZ"
        ],
        "  \nDeviační momenty:    XY: ",
        [
          "productXY"
        ],
        "  \n                     YZ: ",
        [
          "productYZ"
        ],
        "  \n                     ZX: ",
        [
          "productZX"
        ],
        "  \nPol. setrvačnosti:    X: ",
        [
          "radiusX"
        ],
        " \n                      Y: ",
        [
          "radiusY"
        ],
        " \n                      Z: ",
        [
          "radiusZ"
        ],
        " \nHlavní momenty a X-Y-Z směry kolem těžiště:\n                      I: ",
        [
          "i"
        ],
        " podél [",
        [
          "iX"
        ],
        " ",
        [
          "iY"
        ],
        " ",
        [
          "iZ"
        ],
        "]\n                      J: ",
        [
          "j"
        ],
        " podél [",
        [
          "jX"
        ],
        " ",
        [
          "jY"
        ],
        " ",
        [
          "jZ"
        ],
        "]\n                      K: ",
        [
          "k"
        ],
        " podél [",
        [
          "kX"
        ],
        " ",
        [
          "kY"
        ],
        " ",
        [
          "kZ"
        ],
        "]\n"
      ],
      "noneFoundToConvert": "Nic nenalezeno.",
      "onlySplineFittedPolylines": "Na spline lze převést pouze spline interpolované křivky.",
      "unableToConvertSelectedObject": "Nelze převést vybraný objekt.",
      "currentUcsName": [
        "Aktuální název uss:  ",
        [
          "kind",
          1,
          {
            "world": "*GLOBÁLNÍ*",
            "unnamed": "*BEZ NÁZVU*",
            "top": "*HORNÍ*",
            "bottom": "*DOLNÍ*",
            "front": "*PŘEDNÍ*",
            "back": "*ZADNÍ*",
            "left": "*LEVÝ*",
            "right": "*PRAVÝ*",
            "other": [
              [
                "name"
              ]
            ]
          }
        ]
      ],
      "listedUcsName": [
        "Aktuální USS: ",
        [
          "kind",
          1,
          {
            "world": "*GLOBÁLNÍ*",
            "unnamed": "*BEZ NÁZVU*",
            "top": "*HORNÍ*",
            "bottom": "*DOLNÍ*",
            "front": "*PŘEDNÍ*",
            "back": "*ZADNÍ*",
            "left": "*LEVÝ*",
            "right": "*PRAVÝ*",
            "other": [
              "\"",
              [
                "name"
              ],
              "\""
            ]
          }
        ]
      ],
      "savedUcsHeader": "Uložené souřadnicové systémy:",
      "savedUcsEntry": [
        "\"",
        [
          "name"
        ],
        "\"\n     Počátek = <",
        [
          "originX"
        ],
        ",",
        [
          "originY"
        ],
        ",",
        [
          "originZ"
        ],
        ">, Osa X = <",
        [
          "xAxisX"
        ],
        ",",
        [
          "xAxisY"
        ],
        ",",
        [
          "xAxisZ"
        ],
        ">\n     Osa Y = <",
        [
          "yAxisX"
        ],
        ",",
        [
          "yAxisY"
        ],
        ",",
        [
          "yAxisZ"
        ],
        ">, Osa Z = <",
        [
          "zAxisX"
        ],
        ",",
        [
          "zAxisY"
        ],
        ",",
        [
          "zAxisZ"
        ],
        ">"
      ],
      "ucsUndefined": [
        "Nemohu nalézt USS \"",
        [
          "name"
        ],
        "\"."
      ],
      "planUcsNotFound": [
        "Nemohu nalézt USS \"",
        [
          "name"
        ],
        "\"."
      ],
      "noMatchingUcs": "  Žádné USS odpovídajících jmen nenalezeny.",
      "ucsDeleted": [
        "Vymazáno ",
        [
          "count"
        ],
        " USS ",
        [
          "count",
          2,
          {
            "one": "název",
            "other": "jména"
          }
        ],
        "."
      ],
      "invalidUcsName": "Neplatný název USS.",
      "coincidentWithFirstPoint": "Shodný s prvním bodem",
      "pointsAreColinear": "Body jsou kolineární",
      "pointsAreCoincident": "Body jsou shodné",
      "noSolidSurfaceOrMesh": "Žádná 3D tělesa, povrch nebo síť nebyly rozpoznány.",
      "ucsNoCoordinateSystem": "Tento objekt nedefinuje souřadnicový systém",
      "polyline3dNoCoordinateSystem": "Objekt 3D křivka nedefinuje souřadnicový systém",
      "zAxisNotSupported": "U vybraného objektu není podporována volba osy Z.",
      "noPreviousUcs": "Není uložen žádný předchozí souřadnicový systém.",
      "everythingUndone": "Vše bylo vráceno zpět",
      "nothingToUndo": "Není co vracet zpět",
      "nothingToRedo": "Není co provést Znova",
      "everythingRedone": "Vše již bylo provedeno Znova",
      "redoMustFollowUndo": "ZNOVA musí následovat bezprostředně po příkazu Z nebo ZPĚT.",
      "alreadyRedone": "Poslední operace ZPĚT již byla obnovena ZNOVA.",
      "undoSettings": [
        "Aktuální nastavení: Automaticky = ",
        [
          "auto",
          1,
          {
            "on": "Ano",
            "other": "Ne"
          }
        ],
        ", Ovládání = ",
        [
          "control",
          1,
          {
            "all": "Vše",
            "one": "Jeden",
            "other": "Žádný"
          }
        ],
        ", Kombinace = ",
        [
          "combine",
          1,
          {
            "yes": "Ano",
            "other": "Ne"
          }
        ],
        ", Hladina = ",
        [
          "layer",
          1,
          {
            "yes": "Ano",
            "other": "Ne"
          }
        ]
      ],
      "markEncountered": "Nalezeno ozNač",
      "startOfGroup": "Nalezen začátek Skupiny.\nPro další návrat je nutné zadat ZPĚT KONEC.",
      "undoGroup": "SKUPINA",
      "dropGeometryStep": "DROPGEOM SKUPINA",
      "menuStep": [
        [
          "command"
        ],
        " SKUPINA"
      ],
      "emptyMenuStep": [
        "SKUPINA ",
        [
          "command"
        ]
      ],
      "shortcutMenuEntry": [
        [
          "entry",
          1,
          {
            "erase": "Vymazat",
            "move": "Posunout",
            "copySelection": "Kopírovat výběr",
            "scale": "Měřítko",
            "rotate": "Otočit",
            "deselectAll": "Zrušit výběr všech",
            "properties": "Vlastnosti",
            "pan": "Posun pohledu",
            "cut": "Vyjmout",
            "copy": "Kopírovat",
            "copyBase": "Kopírovat se základním bodem",
            "paste": "Vložit",
            "other": ""
          }
        ]
      ],
      "shortcutMenuEntryKey": [
        [
          "entry",
          1,
          {
            "cut": "Ctrl+X",
            "copy": "Ctrl+C",
            "copyBase": "Ctrl+Shift+C",
            "paste": "Ctrl+V",
            "other": ""
          }
        ]
      ],
      "menuItemStep": "SKUPINA položka nabídky",
      "intelliZoomStep": "INTELLIZOOM",
      "intelliPanStep": "INTELLIPAN",
      "viewCubeStep": "'.VIEWCUBEACTION",
      "layerManagerStep": "'.-HLADINA",
      "changePropertiesStep": "ZMĚNAV",
      "modifyPropertyStep": "Upravit vlastnost",
      "gripEditStep": "Úprava uzlů",
      "uDisabled": "Příkaz Z vyřazen. Použijte příkaz ZPĚT pro jeho zapnutí",
      "redoDisabled": [
        [
          "command",
          1,
          {
            "mredo": "Příkazy ZNOVA a NZNOVA vyřazeny",
            "other": "Příkaz ZNOVA je vyřazen"
          }
        ],
        ". Použijte ZPĚT Řízení pro jeho zapnutí."
      ],
      "requiresIntegerValueOrKeyword": [
        "Vyžaduje celočíselnou hodnotu ",
        [
          "value"
        ],
        ", nebo klíčové slovo."
      ],
      "requiresIntegerBetweenOrKeyword": [
        "Vyžaduje celé číslo mezi ",
        [
          "min"
        ],
        " a ",
        [
          "max"
        ],
        ", nebo klíčové slovo."
      ],
      "yesOrNoPlease": "Zvolte položku Ano nebo Ne.",
      "requiresDistanceNumberXOrKeyword": "Vyžaduje vzdálenost, číslo X nebo klíčové slovo.",
      "noPreviousView": "Žádné předchozí pohledy nejsou uloženy.",
      "currentLinetype": [
        "Aktuální typ čáry:  \"",
        [
          "name"
        ],
        "\""
      ],
      "linetypeByLayer": "DleHlad",
      "linetypeNotFound": [
        "Typ čáry \"",
        [
          "name"
        ],
        "\" nebyl nalezen v souboru acad.lin.\nMůžete použít volbu \"Načti\" pro jeho načtení z jiného souboru."
      ],
      "loadedLinetypes": "DLEHLAD, DLEBLOK nebo jeden z těchto načtených typů čar:",
      "linetypeColumns": "      Název         Popis\n---------------- ------------------",
      "linetypesInFile": [
        "Typy čar definované v souboru ",
        [
          "file"
        ],
        ":"
      ],
      "fileLinetypeColumns": "      Název         Popis\n---------------- -------------------",
      "solidLine": "Plná čára",
      "noMatchingLinetypes": "  Žádný odpovídající typ čáry nenalezen.",
      "linetypeLoaded": [
        "Typ čáry \"",
        [
          "name"
        ],
        "\" načten."
      ],
      "linetypeReloaded": [
        "Typ čáry \"",
        [
          "name"
        ],
        "\" znovu načten."
      ],
      "noLinetypesInFile": [
        "V souboru ",
        [
          "file"
        ],
        " nenalezeny žádné odpovídající typy čar."
      ],
      "cantFindFile": [
        "\"",
        [
          "file"
        ],
        "\": Nemohu najít soubor."
      ],
      "invalidColorNumber": "Neplatné číslo barvy.",
      "tagCannotBeNull": "Název nemůže zůstat prázdný.",
      "attdefTextStyle": [
        "Aktuální styl textu:  \"",
        [
          "style"
        ],
        "\"  Výška textu:  ",
        [
          "height"
        ],
        "  Zarovnání:  ",
        [
          "justify"
        ]
      ],
      "blockConversion": "Aktuální nastavení: Převod objektů = Převést",
      "invalidBlockName": "Neplatný název bloku.",
      "invalidNewBlockName": "Neplatný název blok.",
      "blockReferencesItself": [
        "Blok \"",
        [
          "name"
        ],
        "\" odkazuje sám na sebe"
      ],
      "blockRedefined": [
        "Blok \"",
        [
          "name"
        ],
        "\" předefinován"
      ],
      "blockIsXref": [
        "\"",
        [
          "name"
        ],
        "\" je Xref. Nemůže být předefinován."
      ],
      "zBaseNotZero": "Upozornění, Z-souřadnice bodu je nenulová.",
      "definedBlocks": "Definované bloky.",
      "definedBlock": [
        "  \"",
        [
          "name"
        ],
        "\""
      ],
      "definedXref": [
        "  ",
        [
          "name"
        ],
        "   Xref: nebyl nalezen"
      ],
      "blockCounts": [
        "Uživ.    Externí      Závislé     Nepojmenované\nbloky    reference    bloky       bloky\n",
        [
          "user"
        ],
        "    ",
        [
          "external"
        ],
        "       ",
        [
          "dependent"
        ],
        "       ",
        [
          "unnamed"
        ]
      ],
      "insertBlockCounts": [
        "Uživ.    Nepojmenované\nbloky    bloky\n",
        [
          "user"
        ],
        "    ",
        [
          "unnamed"
        ]
      ],
      "rectangleModes": [
        "Aktuální režim obdélníku:",
        [
          "corners",
          1,
          {
            "chamfer": [
              "  Zkosení=",
              [
                "first"
              ],
              " x ",
              [
                "second"
              ]
            ],
            "other": ""
          }
        ],
        [
          "hasElevation",
          1,
          {
            "yes": [
              "  Zdvih=",
              [
                "elevation"
              ]
            ],
            "other": ""
          }
        ],
        [
          "corners",
          1,
          {
            "fillet": [
              "  Zaoblení=",
              [
                "first"
              ]
            ],
            "other": ""
          }
        ],
        [
          "hasThickness",
          1,
          {
            "yes": [
              "  Tloušťka=",
              [
                "thickness"
              ]
            ],
            "other": ""
          }
        ],
        [
          "hasWidth",
          1,
          {
            "yes": [
              "  Šířka=",
              [
                "width"
              ]
            ],
            "other": ""
          }
        ],
        [
          "hasRotation",
          1,
          {
            "yes": [
              "  Otočení=",
              [
                "rotation"
              ]
            ],
            "other": ""
          }
        ]
      ],
      "textEditSettings": [
        "Aktuální nastavení: Režim úprav = ",
        [
          "mode",
          1,
          {
            "single": "Jeden",
            "other": "NÁsobně"
          }
        ]
      ],
      "totalArea": [
        "Celková plocha = ",
        [
          "total"
        ]
      ],
      "areaReport": [
        "Plocha = ",
        [
          "area"
        ],
        ", ",
        [
          "measured",
          1,
          {
            "circumference": "Obvod",
            "length": "Délka",
            "other": "Obvod"
          }
        ],
        " = ",
        [
          "around"
        ]
      ],
      "objectHasNoArea": "Vybraný objekt nemá žádnou plochu",
      "polylineWidthIgnored": "Tloušťka křivky je při výpočtu plochy ignorována.",
      "allSegmentsUndone": "Všechny segmenty již byly odstraněny.",
      "polyline3dNotLevel": "Vrcholy 3D křivky mají rozdílné Z-souřadnice.",
      "all3dSegmentsUndone": "Všechny segmenty již byly odstraněny.",
      "distanceTotal": [
        "Vzdálenost = ",
        [
          "value"
        ]
      ],
      "distanceReport": [
        "Vzdálenost = ",
        [
          "distance"
        ],
        ",  Úhel v rovině XY = ",
        [
          "angleInPlane"
        ],
        ",  Úhel od roviny XY = ",
        [
          "angleFromPlane"
        ],
        "\nDelta X = ",
        [
          "deltaX"
        ],
        ",  Delta Y = ",
        [
          "deltaY"
        ],
        ",   Delta Z = ",
        [
          "deltaZ"
        ]
      ],
      "idReport": [
        " X = ",
        [
          "x"
        ],
        "     Y = ",
        [
          "y"
        ],
        "     Z = ",
        [
          "z"
        ]
      ],
      "linesNonCoplanar": "Úsečky nejsou koplanární.",
      "lineAndPolylineNonCoplanar": "Úsečka a křivka nejsou koplanární.",
      "twoEntitiesNonCoplanar": "Oba objekty nejsou koplanární.",
      "cannotFilletBetween": "Nelze zaoblit tyto dva objekty.",
      "noValidFillet": [
        "Žádné platné zaoblení s poloměrem ",
        [
          "radius"
        ]
      ],
      "cannotFilletItself": "Nelze zaoblit objekt sám se sebou.",
      "chamferNot3dPolyline": "  Objekty 3D Křivka nemohou být zkoseny.",
      "filletNot3dPolyline": "  Objekty 3D Křivka nemohou být zaobleny.",
      "collinearCannotFillet": "Kolineární úsečky nemohou být zaobleny.",
      "capNeedsLineOrRay": "Pro zaoblení zakončení musí být prvním objektem úsečka nebo přímka.",
      "startPointMustDiffer": "Bod počátku musí být odlišný od vrcholu",
      "noUsableObjectSelected": "Nevybrán žádný použitelný objekt",
      "collinearCannotChamfer": "Kolineární úsečky nemohou být zkoseny.",
      "cannotChamferItself": "Nelze zkosit objekt sám se sebou.",
      "segmentsNotConsecutive": "Úsečkové části křivky musí spolu sousedit nebo být oddělené jedním segmentem",
      "notA2dPolyline": "Vybraný objekt není 2D křivka",
      "cornersSkipped": [
        [
          "parallel",
          2,
          {
            "=0": "",
            "one": [
              0,
              " byla rovnoběžných    "
            ],
            "other": [
              0,
              " bylo rovnoběžných    "
            ]
          }
        ],
        [
          "tooShort",
          2,
          {
            "=0": "",
            "one": [
              0,
              " byla příliš krátkých    "
            ],
            "other": [
              0,
              " bylo příliš krátkých    "
            ]
          }
        ],
        [
          "divergent",
          2,
          {
            "=0": "",
            "one": [
              0,
              " byla různoběžných    "
            ],
            "other": [
              0,
              " bylo různoběžných    "
            ]
          }
        ]
      ],
      "invalid": "*Neplatné*",
      "styleNameInUse": [
        [
          "table",
          1,
          {
            "dimension": "kótovací styl",
            "other": "styl písma"
          }
        ],
        " s názvem \"",
        [
          "name"
        ],
        "\" již existuje."
      ],
      "currentDimStyle": [
        "Aktuální kótovací styl:  ",
        [
          "name"
        ],
        "   Poznámky: Ne"
      ],
      "unknownDimStyle": "Neznámý kótovací styl:",
      "namedDimStyles": "Pojmenované kótovací styly:",
      "noMatchingDimStyles": "  Nebyly nalezeny odpovídající kótovací styly.",
      "splineSettingsFit": [
        "Aktuální nastavení: Způsob=Vyhlazení   Úhly=",
        [
          "knots",
          1,
          {
            "chord": "Tětiva",
            "sqrtChord": "Odmocnina",
            "other": "Rovnoměrná"
          }
        ]
      ],
      "splineSettingsCv": [
        "Aktuální nastavení: Způsob=řV   Stupeň=",
        [
          "degree"
        ]
      ],
      "requiresIntegerBetween": [
        "Vyžaduje celé číslo mezi ",
        [
          "min"
        ],
        " a ",
        [
          "max"
        ],
        "."
      ],
      "commandCompletelyUndone": "Příkaz byl kompletně vrácen zpět.",
      "commandCompletelyUndoneShort": "Příkaz byl kompletně vrácen zpět.",
      "linesParallel": "Úsečky jsou rovnoběžné",
      "linesDiverge": "Úsečky se rozbíhají",
      "filletRadiusTooLarge": "Poloměr zaoblení je příliš velký(á)",
      "chamferDistanceTooLarge": "Vzdálenost zkosení je příliš velký(á)",
      "cannotChamferArcSegments": "Nelze zkosit obloukové segmenty křivky.",
      "chamferRequiresLines": "Zkosení vyžaduje 2 úsečky (nejsou obloukovými segmenty).",
      "cannotFilletBetweenThese": "Nelze zaoblit tyto dva objekty.",
      "filletRequiresObjects": "Zaoblení vyžaduje 2 úsečky, oblouky nebo kružnice.",
      "filletRequiresNotBlocks": "Zaoblení vyžaduje 2 úsečky, oblouky nebo kružnice (nejsou bloky).",
      "filletRequiresNotTables": "Zaoblení vyžaduje 2 úsečky, oblouky nebo kružnice (nejsou objekty Tabulka).",
      "filletRequiresNotDimensions": "Zaoblení vyžaduje 2 úsečky, oblouky nebo kružnice (nejsou rozměry).",
      "unableToFilletCurves": "Nelze zaoblit křivky.",
      "noValidCurveFillet": [
        "Nelze zaoblit s poloměrem ",
        [
          "radius"
        ]
      ],
      "entitiesNonCoplanar": "Objekty nejsou koplanární.",
      "chamferRequiresTwoLines": "Zkosení vyžaduje 2 úsečky.",
      "chamferRequiresNotBlocks": "Zkosení vyžaduje 2 úsečky (nejsou bloky).",
      "chamferRequiresNotTables": "Zkosení vyžaduje 2 úsečky (nejsou objekty Tabulka).",
      "chamferRequiresNotDimensions": "Zkosení vyžaduje 2 úsečky (nejsou rozměry).",
      "cannotChamferBetween": "Nelze zkosit tyto dva objekty.",
      "linesChamfered": [
        [
          "count",
          2,
          {
            "one": [
              0,
              " úseček bylo zkoseno"
            ],
            "other": [
              0,
              " úseček bylo zkoseno"
            ]
          }
        ]
      ],
      "linesFilleted": [
        [
          "count",
          2,
          {
            "one": [
              0,
              " úseček bylo zaobleno"
            ],
            "other": [
              0,
              " úseček bylo zaobleno"
            ]
          }
        ]
      ],
      "nothingJoined": [
        "0 objektů spojeno",
        [
          "count",
          2,
          {
            "one": [
              ", pro ",
              0,
              " objekt operace přerušena"
            ],
            "other": [
              ", pro ",
              0,
              " objektů operace zrušena"
            ]
          }
        ]
      ],
      "linesJoined": [
        "Čáry (celkem ",
        [
          "count"
        ],
        ") spojeny do 1 čáry",
        [
          "discarded",
          2,
          {
            "=0": "",
            "one": [
              ", pro ",
              0,
              " objekt operace přerušena"
            ],
            "other": [
              ", pro ",
              0,
              " objektů operace zrušena"
            ]
          }
        ]
      ],
      "arcsJoined": [
        "Oblouky (celkem ",
        [
          "count"
        ],
        ") spojeny do 1 oblouku",
        [
          "discarded",
          2,
          {
            "=0": "",
            "one": [
              ", pro ",
              0,
              " objekt operace přerušena"
            ],
            "other": [
              ", pro ",
              0,
              " objektů operace zrušena"
            ]
          }
        ]
      ],
      "arcsJoinedIntoCircle": [
        [
          "count"
        ],
        " oblouků spojeno a převedeno na kružnici",
        [
          "discarded",
          2,
          {
            "=0": "",
            "one": [
              ", pro ",
              0,
              " objekt operace přerušena"
            ],
            "other": [
              ", pro ",
              0,
              " objektů operace zrušena"
            ]
          }
        ]
      ],
      "objectsConvertedToPolylines": [
        [
          "polylines",
          2,
          {
            "one": [
              [
                "count"
              ],
              " objektů převedeny na ",
              0,
              " křivku"
            ],
            "other": [
              "Objekty (celkem ",
              [
                "count"
              ],
              ") převedeny na křivky (celkem ",
              0,
              ")"
            ]
          }
        ],
        [
          "discarded",
          2,
          {
            "=0": "",
            "one": [
              ", pro ",
              0,
              " objekt operace přerušena"
            ],
            "other": [
              ", pro ",
              0,
              " objektů operace zrušena"
            ]
          }
        ]
      ],
      "segmentsJoinedIntoPolyline": [
        [
          "count",
          2,
          {
            "one": [
              0,
              " segment spojen do 1 křivky"
            ],
            "other": [
              0,
              " segmentů spojeno do 1 křivky"
            ]
          }
        ],
        [
          "discarded",
          2,
          {
            "=0": "",
            "one": [
              ", pro ",
              0,
              " objekt operace přerušena"
            ],
            "other": [
              ", pro ",
              0,
              " objektů operace zrušena"
            ]
          }
        ]
      ],
      "segmentsJoinedInto3dPolylines": [
        [
          "count",
          2,
          {
            "one": [
              0,
              " segment spojen do ",
              [
                "polylines",
                2,
                {
                  "one": [
                    0,
                    " 3D křivky."
                  ],
                  "other": [
                    "3D křivek (celkem ",
                    0,
                    ")"
                  ]
                }
              ]
            ],
            "other": [
              "Segmenty (celkem ",
              0,
              ") spojeny do ",
              [
                "polylines",
                2,
                {
                  "one": [
                    0,
                    " 3D křivky."
                  ],
                  "other": [
                    "3D křivek (celkem ",
                    0,
                    ")"
                  ]
                }
              ]
            ]
          }
        ],
        [
          "discarded",
          2,
          {
            "=0": "",
            "one": [
              ", pro ",
              0,
              " objekt operace přerušena"
            ],
            "other": [
              ", pro ",
              0,
              " objektů operace zrušena"
            ]
          }
        ]
      ],
      "ellipticalArcsJoined": [
        "Eliptické oblouky (celkem ",
        [
          "count"
        ],
        ") spojeny do 1 oblouku",
        [
          "discarded",
          2,
          {
            "=0": "",
            "one": [
              ", pro ",
              0,
              " objekt operace přerušena"
            ],
            "other": [
              ", pro ",
              0,
              " objektů operace zrušena"
            ]
          }
        ]
      ],
      "objectsJoinedIntoSplines": [
        "Objekty (celkem ",
        [
          "count"
        ],
        ") spojeny do ",
        [
          "splines",
          2,
          {
            "one": [
              0,
              " spline"
            ],
            "other": [
              0,
              " křivek spline"
            ]
          }
        ],
        [
          "discarded",
          2,
          {
            "=0": "",
            "one": [
              ", pro ",
              0,
              " objekt operace přerušena"
            ],
            "other": [
              ", pro ",
              0,
              " objektů operace zrušena"
            ]
          }
        ]
      ],
      "objectsConvertedToSplines": [
        "Objekty (celkem ",
        [
          "count"
        ],
        ") převedeny na ",
        [
          "splines",
          2,
          {
            "one": [
              0,
              " spline"
            ],
            "other": [
              "spline (celkem ",
              0,
              ")"
            ]
          }
        ],
        [
          "discarded",
          2,
          {
            "=0": "",
            "one": [
              ", pro ",
              0,
              " objekt operace přerušena"
            ],
            "other": [
              ", pro ",
              0,
              " objektů operace zrušena"
            ]
          }
        ]
      ],
      "objectsJoinedToSource": [
        "Celkem objektů spojených se zdrojem: ",
        [
          "count",
          2,
          {
            "one": 0,
            "other": 0
          }
        ],
        [
          "discarded",
          2,
          {
            "=0": "",
            "one": [
              ", pro ",
              0,
              " objekt operace přerušena"
            ],
            "other": [
              ", pro ",
              0,
              " objektů operace zrušena"
            ]
          }
        ]
      ],
      "ellipticalArcsJoinedToSource": [
        [
          "count",
          2,
          {
            "one": [
              0,
              " eliptický oblouk spojen se zdrojem"
            ],
            "other": [
              0,
              " eliptických oblouků spojeno se zdrojem"
            ]
          }
        ],
        [
          "discarded",
          2,
          {
            "=0": "",
            "one": [
              ", pro ",
              0,
              " objekt operace přerušena"
            ],
            "other": [
              ", pro ",
              0,
              " objektů operace zrušena"
            ]
          }
        ]
      ],
      "ellipseClosed": "Elipsa byla úspěšně uzavřena.",
      "currentViewDirection": [
        "Aktuální směr pohledu:  VIEWDIR=",
        [
          "x"
        ],
        ",",
        [
          "y"
        ],
        ",",
        [
          "z"
        ]
      ],
      "switchingToWcs": "*** Přepínám do GSS ***",
      "returningToUcs": "*** Vracím se do USS ***",
      "invalidInputTryAgain": "Neplatné zadání. Zkuste znova.",
      "regeneratingModel": "Regeneruji model.",
      "regenQueued": "Regenerace je pozdržena.",
      "requiresRegen": "** Vyžaduje regeneraci, nemůže být transparentní.",
      "panExit": "Ukončete pomocí ESC nebo ENTER nebo pravým tlačítkem vyvolejte místní nabídku.",
      "orbitExit": "Ukončete pomocí ESC nebo ENTER nebo pravým tlačítkem vyvolejte místní nabídku.",
      "requiresTwoPointsOrDisplacement": "Vyžaduje dva body nebo přemístění následované stisknutím klávesy ENTER.",
      "currentOsnapModes": [
        "Aktuální režimy uchopení: ",
        [
          "modes"
        ]
      ],
      "osnapModeName": [
        [
          "mode",
          1,
          {
            "endpoint": "KON",
            "midpoint": "POL",
            "center": "STŘ",
            "node": "BOD",
            "quadrant": "KVA",
            "intersection": "PRŮ",
            "insertion": "REF",
            "perpendicular": "KOL",
            "tangent": "TAN",
            "nearest": "NEJ",
            "apparentIntersection": "ZDÁNPRŮ",
            "extension": "PRO",
            "other": "ROV"
          }
        ]
      ],
      "currentLineweight": [
        "Aktuální tloušťka čáry: ",
        [
          "value"
        ]
      ],
      "pointingEdgeOn": "Ukazování v USS zobrazeném z hrany není povoleno.",
      "circleDoesNotExist": "Kružnice neexistuje.",
      "radiusMustBeNonZero": "Poloměr nesmí být nulový.",
      "noLineOrArcToContinue": "Žádná úsečka nebo oblouk pro pokračování.",
      "allLineSegmentsUndone": "Všechny segmenty již byly odstraněny.",
      "zeroLengthLineCreated": [
        "Čára s nulovou délkou vytvořena v (",
        [
          "x"
        ],
        ", ",
        [
          "y"
        ],
        ", ",
        [
          "z"
        ],
        ")"
      ],
      "positiveNonzero": "Hodnota musí být kladná a nenulová.",
      "parameterCannotBeZero": "Parametr nelze nastavit na 0. Zadejte nenulové číslo nebo výraz.",
      "areaPositiveNonzero": "Hodnota musí být kladná a nenulová.",
      "valueMustBePositive": "Hodnota musí být kladná.",
      "valueMustBeNonzero": "Hodnota musí být nenulová.",
      "x2dCornerPointOrKeyword": "X2D rohový bod nebo klíčové slovo.",
      "previousDirectionNotUcsParallel": [
        "Předchozí vektor není rovnoběžný s USS, použito ",
        [
          "angle"
        ],
        "."
      ],
      "lineweightRequired": "Je vyžadována tloušťka v jednotkách tloušťky.",
      "lineweightRounded": [
        "Tloušťka čáry zaokrouhlena na nejbližší platnou hodnotu ",
        [
          "value"
        ]
      ],
      "invalidLineweightNumber": "Neplatné číslo tlčáry.",
      "lineweightNone": "Žádný",
      "lineweightByLayer": "BYLAYER",
      "lineweightListByLayer": "DleHlad",
      "colorRequired": "nalezeno 1",
      "invalidTrueColor": "Neplatná barva. Napište tři čárkou oddělené hodnoty od 0 do 255.",
      "invalidOsnapModes": "Neplatný režim UCHOP.",
      "invalidPoint": "Neplatný bod.",
      "snapNotFound": [
        "Žádný(é) ",
        [
          "snap",
          1,
          {
            "endpoint": "Koncový ",
            "midpoint": "POlovina ",
            "center": "Střed ",
            "quadrant": "KVadrant ",
            "intersection": "Průsečík ",
            "insertion": "Referenční ",
            "perpendicular": "KOlmo ",
            "other": ""
          }
        ],
        "nenalezen(o) pro zadaný bod."
      ],
      "invalidPoint2d": "Neplatný 2D bod.",
      "pointOrKeywordRequired": "Vyžadován bod nebo klíčové slovo.",
      "point2dOrKeywordRequired": "Vyžadován 2D bod nebo klíčové slovo.",
      "pointsMustBeDistinct": "Body se musí lišit.",
      "requiresDistance": [
        "Vyžaduje číselnou vzdálenost",
        [
          "keyword",
          1,
          {
            "yes": [
              [
                "points",
                1,
                {
                  "second": ", druhý bod nebo klíčové slovo.",
                  "other": ", dva body nebo klíčové slovo."
                }
              ]
            ],
            "other": [
              [
                "points",
                1,
                {
                  "second": " nebo druhý bod.",
                  "other": " nebo dva body."
                }
              ]
            ]
          }
        ]
      ],
      "requiresAngle": [
        "Vyžaduje platný číselný úhel",
        [
          "keyword",
          1,
          {
            "yes": [
              [
                "points",
                1,
                {
                  "second": ", druhý bod nebo klíčové slovo.",
                  "other": ", dva body nebo klíčové slovo."
                }
              ]
            ],
            "other": [
              [
                "points",
                1,
                {
                  "second": " nebo druhý bod.",
                  "other": " nebo dva body."
                }
              ]
            ]
          }
        ]
      ],
      "requiresNumber": [
        "Vyžaduje číselnou hodnotu",
        [
          "keyword",
          1,
          {
            "yes": " nebo klíčové slovo.",
            "other": "."
          }
        ]
      ],
      "requiresInteger": [
        "Vyžaduje celočíselnou hodnotu",
        [
          "keyword",
          1,
          {
            "yes": " nebo klíčové slovo.",
            "other": "."
          }
        ]
      ],
      "requiresRadius": "Vyžaduje číselný poloměr, bod na obvodu nebo \"P\".",
      "requiresTangent": "Vyžaduje uchopení TAN a výběr Kružnice, Oblouku nebo Úsečky.",
      "requiresTangentSelection": "*Vyžaduje uchopení objektu režimem TAN a výběr kružnice, oblouku nebo úsečky.",
      "invalidOptionKeyword": "Neplatné klíčové slovo.",
      "ambiguousResponse": "Nejednoznačná odpověď, upřesněte...",
      "invalidSelection": "*Neplatný výběr*",
      "expectsPointOr": [
        "Očekává se bod nebo ",
        [
          "keywords"
        ]
      ],
      "textEditExpectsPoint": [
        "Očekává se bod nebo posLední/",
        [
          "keywords"
        ],
        [
          "mode",
          1,
          {
            "single": "]:",
            "other": ""
          }
        ]
      ],
      "selectionModes": [
        [
          "set",
          1,
          {
            "subobjects": "OKno/Křížení/KVádr/Napříč/OPolygon/KPolygon/přiDej/ODstraň/NKrát/Předchozí/Zpět/Auto/Jeden/POdobjekt/Objekt",
            "oneObject": "OKno/posLední/Křížení/KVádr/VŠE/Napříč/OPolygon/KPolygon",
            "singleSet": "OKno/posLední/Křížení/KVádr/VŠE/Napříč/OPolygon/KPolygon/Skupina",
            "pathCurve": "OKno/posLední/Křížení/KVádr/VŠE/Napříč/OPolygon/KPolygon/Skupina/Předchozí/Auto",
            "crossingObjects": "OKno/posLední/Křížení/KVádr/VŠE/Napříč/OPolygon/KPolygon/přiDej/ODstraň/NKrát/Předchozí/Zpět/Auto/Jeden",
            "wholeObjects": "OKno/posLední/Křížení/KVádr/VŠE/Napříč/OPolygon/KPolygon/Skupina/přiDej/ODstraň/NKrát/Předchozí/Zpět/Auto/Jeden",
            "faceSet": "Křížení/Napříč/KPolygon",
            "other": "OKno/posLední/Křížení/KVádr/VŠE/Napříč/OPolygon/KPolygon/Skupina/přiDej/ODstraň/NKrát/Předchozí/Zpět/Auto/Jeden/POdobjekt/Objekt"
          }
        ]
      ],
      "noObjectFound": "Žádný objekt nenalezen",
      "arcCannotBeFull360": "Oblouk nemůže mít plných 360 stupňů",
      "objectCannotBeBroken": "Objekt nemůže být přerušen",
      "cannotBreakBlock": "Nelze přerušit blok",
      "cannotBreakClosedAtOnePoint": "Nelze přerušit uzavřenou, periodickou křivku pouze v jednom bodě.",
      "arrayType": [
        "Typ = ",
        [
          "type",
          1,
          {
            "rectangular": "Obdélníkové",
            "polar": "Polární",
            "other": "Křivkové"
          }
        ],
        "  Asociativní = Ne"
      ],
      "arrayTypeAssociative": [
        "Typ = ",
        [
          "type",
          1,
          {
            "rectangular": "Obdélníkové",
            "polar": "Polární",
            "other": "Křivkové"
          }
        ],
        "  Asociativní = Ano"
      ],
      "requiresPositiveInteger": "Vyžaduje kladné nenulové celé číslo nebo klíčové slovo.",
      "requiresNonzero": "Vyžaduje číselnou nenulovou hodnotu.",
      "maximumItems": [
        "Maximum položek = ",
        [
          "count"
        ]
      ],
      "pathCurveIsArrayed": "Vybrané objekty, které chcete vložit do pole, nelze vybírat jako křivku trajektorie.",
      "filteredOut": [
        [
          "count",
          2,
          {
            "one": "1 byl odfiltrován",
            "other": [
              0,
              " bylo odfiltrováno"
            ]
          }
        ]
      ],
      "currentHatchPattern": [
        "Aktuální šrafovací vzor:  ",
        [
          "name"
        ]
      ],
      "selectingEverything": "Vybírám vše...",
      "selectingEverythingVisible": "Vybírám vše viditelné...",
      "analyzingSelectedData": "Analyzuji vybraná data...",
      "analyzingInternalIslands": "Analyzuji vnitřní ostrovy...",
      "requiresDistanceOrNumberX": "Vyžaduje vzdálenost (nebo čísloX).",
      "currentTextStyle": [
        "Aktuální styl textu:  \"",
        [
          "style"
        ],
        "\"  Výška textu:  ",
        [
          "height"
        ],
        " Poznámky:  Ne  Zarovnání:  ",
        [
          "justify"
        ]
      ],
      "textJustifyName": [
        [
          "justify",
          1,
          {
            "center": "Centr",
            "right": "Vpravo",
            "middle": "Střed",
            "tl": "HL",
            "tc": "HC",
            "tr": "HP",
            "ml": "SL",
            "mc": "SC",
            "mr": "SP",
            "bl": "DL",
            "bc": "DC",
            "br": "DP",
            "other": "VLevo"
          }
        ]
      ],
      "textStylesHeader": "Písma:",
      "textStyleEntry": [
        "Název stylu: ",
        [
          "name"
        ],
        "  Styl písma: Arial\n   Výška: ",
        [
          "height"
        ],
        "  Poměr šířky a výšky: ",
        [
          "width"
        ],
        "  Úhel sklonu: 0\n   Generování: Normální"
      ],
      "currentTextStyleName": [
        "Aktuální písmo: \"",
        [
          "name"
        ],
        "\""
      ],
      "currentMTextStyle": [
        "Aktuální styl textu:  \"",
        [
          "style"
        ],
        "\"  Výška textu:  ",
        [
          "height"
        ],
        "  Poznámky:  Ne"
      ],
      "invalidStyleName": "Neplatný název stylu",
      "lineSpacingRange": [
        "Zadejte řádkování v rozsahu ",
        [
          "min"
        ],
        " (",
        [
          "minFactor"
        ],
        "x) a ",
        [
          "max"
        ],
        " (",
        [
          "maxFactor"
        ],
        "x) včetně."
      ],
      "invalidPointInput": "Neplatné zadání bodu.",
      "invalidInputCapital": "Neplatný vstup.",
      "nonAssociativeDimension": "Byla vytvořena neasociativní kóta.",
      "dimensionTextIs": [
        "Kótovací text = ",
        [
          "text"
        ]
      ],
      "expectsSingleObject": "Očekává se jediný objekt.",
      "expectsCornerObject": [
        "Očekává se bod nebo OKno/posLední/Křížení/KVádr/Napříč/OPolygon/KPolygon/",
        [
          "set",
          1,
          {
            "fillet": "Zpět/křiVka/Poloměr",
            "filletRadius": "Poloměr]:",
            "chamfer": "Zpět/křiVka/Hrana",
            "other": "Vzdálenost"
          }
        ]
      ],
      "lastKeyword": "posLední",
      "groupKeyword": "Skupina",
      "noObjectSelected": "Nebyl vybrán žádný objekt.",
      "notLineArcOrCircleToDimension": "Vybraný objekt není úsečka, oblouk nebo kružnice.",
      "associativeDimensionRequired": "Je požadována lineární, staniční nebo úhlová asociativní kóta.",
      "selectedObjectNotDimension": "Vybraný objekt není kóta.",
      "notCircleOrArc": "Vybraný objekt není kružnice nebo oblouk.",
      "notLineArcOrCircle": "Vybraný objekt není úsečka, oblouk nebo kružnice.",
      "notALine": "Vybraný objekt není úsečka.",
      "dimLinesParallel": "Úsečky jsou rovnoběžné.",
      "negativeSpacing": "Neplatná hodnota řádkování, hodnota řádkování nemůže být záporná.",
      "objectNotSpline": "Vybraný objekt není spline.",
      "splineReversed": "Spline byla převrácena.",
      "splineMadeRational": "Spline není racionální. Bude převedena.",
      "cannotDeleteBeyond": "Nelze vymazat za tímto.",
      "objectNotPolyline": "Vybraný objekt není křivka",
      "expectsPolylineOr": "Očekává se bod nebo OKno/posLední/Křížení/KVádr/VŠE/Napříč/OPolygon/KPolygon/NÁsobně]:",
      "cannotJoinClosedPolyline": "Nemohu připojit k uzavřené křivce",
      "segmentsAddedToPolyline": [
        [
          "count"
        ],
        " segmentů připojeno ke křivce"
      ],
      "segmentsAddedToPolylines": [
        "Počet křivek: ",
        [
          "count"
        ],
        ", počet přidaných segmentů: ",
        [
          "polylines"
        ]
      ],
      "joinTypeIs": [
        "Typ spojení = ",
        [
          "type",
          1,
          {
            "extend": "Prodloužit",
            "add": "Přidat segment",
            "other": "Oba (Prodloužit nebo Přidat)"
          }
        ]
      ],
      "notAFitPoint": "Není bod vyhlazení.",
      "notAControlVertex": "Není řídicí vrchol.",
      "allAdditionsUndone": "Všechna doplnění byla vrácena zpět.",
      "listObjectName": [
        [
          "name",
          1,
          {
            "line": "úsečka",
            "circle": "kružnice",
            "arc": "oblouk",
            "ellipse": "ELLIPSE",
            "spline": "SPLINE",
            "lwpolyline": "LWPOLYLINE",
            "polyline": "POLYLINE",
            "vertex": "VERTEX",
            "endSequence": "KONEC SEKVENCE",
            "text": "TEXT",
            "mtext": "MTEXT",
            "attdef": "DEFINICE ATRIBUTU",
            "attribute": "ATRIBUT",
            "dimension": "DIMENSION",
            "hatch": "HATCH",
            "insert": "REFERENCE BLOKU",
            "region": "REGION",
            "solid3d": "3DSOLID",
            "solid2d": "SOLID",
            "leader": "LEADER",
            "face3d": "3D PLOCHA",
            "wipeout": "WIPEOUT",
            "image": "IMAGE",
            "table": "ACAD_TABLE",
            "mleader": "MULTILEADER",
            "xline": "XLINE",
            "ray": "RAY",
            "other": "POLE"
          }
        ]
      ],
      "listObject": [
        "                  ",
        [
          "name"
        ],
        "   Hladina: \"",
        [
          "layer"
        ],
        "\""
      ],
      "listSpace": "                             Prostor: Modelový prostor",
      "listColor": [
        "                   Barva: ",
        [
          "color"
        ],
        "    Typ čáry: \"",
        [
          "linetype"
        ],
        "\""
      ],
      "listLineweight": [
        "                   TloušťkaČáry: ",
        [
          "lineweight"
        ],
        " mm"
      ],
      "listThickness": [
        "                   Tloušťka = ",
        [
          "thickness"
        ]
      ],
      "listExtrusion": [
        "Směr vysunutí vzhledem k USS:\n                   X=",
        [
          "x"
        ],
        "  Y=",
        [
          "y"
        ],
        "  Z=",
        [
          "z"
        ]
      ],
      "listLineFrom": [
        "                 z bod, X=",
        [
          "x"
        ],
        "  Y=",
        [
          "y"
        ],
        "  Z=",
        [
          "z"
        ]
      ],
      "listLineTo": [
        "                na bod, X=",
        [
          "x"
        ],
        "  Y=",
        [
          "y"
        ],
        "  Z=",
        [
          "z"
        ]
      ],
      "listSolidFrom": [
        "                 z bod, X=",
        [
          "x"
        ],
        "  Y=",
        [
          "y"
        ],
        "  Z=",
        [
          "z"
        ]
      ],
      "listSolidAnd": [
        "                 a bod, X=",
        [
          "x"
        ],
        "  Y=",
        [
          "y"
        ],
        "  Z=",
        [
          "z"
        ]
      ],
      "listFace3dFirst": [
        "             první bod, X=",
        [
          "x"
        ],
        "  Y=",
        [
          "y"
        ],
        "  Z=",
        [
          "z"
        ]
      ],
      "listFace3dSecond": [
        "             druhý bod, X=",
        [
          "x"
        ],
        "  Y=",
        [
          "y"
        ],
        "  Z=",
        [
          "z"
        ]
      ],
      "listFace3dThird": [
        "             třetí bod, X=",
        [
          "x"
        ],
        "  Y=",
        [
          "y"
        ],
        "  Z=",
        [
          "z"
        ]
      ],
      "listFace3dFourth": [
        "            čtvrtý bod, X=",
        [
          "x"
        ],
        "  Y=",
        [
          "y"
        ],
        "  Z=",
        [
          "z"
        ]
      ],
      "listSolidTo": [
        "                na bod, X=",
        [
          "x"
        ],
        "  Y=",
        [
          "y"
        ],
        "  Z=",
        [
          "z"
        ]
      ],
      "listLineLength": [
        "          ",
        [
          "inUcs",
          1,
          {
            "yes": "In Aktuální USS, ",
            "other": ""
          }
        ],
        "Délka =",
        [
          "length"
        ],
        ",  Úhel v rovině XY = ",
        [
          "angle"
        ]
      ],
      "listLine3d": [
        "                  3D Délka  =",
        [
          "length"
        ],
        ",  Úhel od roviny XY = ",
        [
          "angle"
        ]
      ],
      "listLineDelta": [
        "                  Delta X =",
        [
          "x"
        ],
        ", Delta Y = ",
        [
          "y"
        ],
        ", Delta Z =",
        [
          "z"
        ]
      ],
      "listBasePoint": [
        "                   základní bod, X=",
        [
          "x"
        ],
        "  Y=",
        [
          "y"
        ],
        "  Z=",
        [
          "z"
        ]
      ],
      "listUnitDirection": [
        "                   jednotkový směr, X=",
        [
          "x"
        ],
        "  Y=",
        [
          "y"
        ],
        "  Z=",
        [
          "z"
        ]
      ],
      "listAngleInXy": [
        "                   úhel v rovině XY =",
        [
          "angle"
        ]
      ],
      "listAngleFromXy": [
        "                   úhel od roviny XY =",
        [
          "angle"
        ]
      ],
      "listCenter": [
        "             střed bod, X=",
        [
          "x"
        ],
        "  Y=",
        [
          "y"
        ],
        "  Z=",
        [
          "z"
        ]
      ],
      "listRadius": [
        "           poloměr ",
        [
          "radius"
        ]
      ],
      "listLwRadius": [
        "            poloměr ",
        [
          "radius"
        ]
      ],
      "listCircumference": [
        "             obvod ",
        [
          "length"
        ]
      ],
      "listArea": [
        "              plocha ",
        [
          "area"
        ]
      ],
      "listStartAngle": [
        "           počátek úhel ",
        [
          "angle"
        ]
      ],
      "listEndAngle": [
        "             konec úhel ",
        [
          "angle"
        ]
      ],
      "listLength": [
        "            délka ",
        [
          "length"
        ]
      ],
      "listTotalAngle": [
        "             celkový úhel ",
        [
          "angle"
        ]
      ],
      "listCurveArea": [
        "                           Plocha: ",
        [
          "area"
        ]
      ],
      "listCurveCircumference": [
        "                            Obvod: ",
        [
          "length"
        ]
      ],
      "listCurveLength": [
        "                            Délka: ",
        [
          "length"
        ]
      ],
      "listEllipseCenter": [
        "                            Střed: X = ",
        [
          "x"
        ],
        ", Y = ",
        [
          "y"
        ],
        ", Z = ",
        [
          "z"
        ]
      ],
      "listEllipseMajor": [
        "                       Hlavní osa: X = ",
        [
          "x"
        ],
        ", Y = ",
        [
          "y"
        ],
        ", Z = ",
        [
          "z"
        ]
      ],
      "listEllipseMinor": [
        "                     Vedlejší osa: X = ",
        [
          "x"
        ],
        ", Y = ",
        [
          "y"
        ],
        ", Z = ",
        [
          "z"
        ]
      ],
      "listEllipseStart": [
        "                    Počáteční bod: X = ",
        [
          "x"
        ],
        ", Y = ",
        [
          "y"
        ],
        ", Z = ",
        [
          "z"
        ]
      ],
      "listEllipseEnd": [
        "                      Koncový bod: X = ",
        [
          "x"
        ],
        ", Y = ",
        [
          "y"
        ],
        ", Z = ",
        [
          "z"
        ]
      ],
      "listEllipseStartAngle": [
        "                   Počáteční úhel: ",
        [
          "angle"
        ]
      ],
      "listEllipseEndAngle": [
        "                     Koncový úhel: ",
        [
          "angle"
        ]
      ],
      "listEllipseRatio": [
        "                   Poměr poloměrů: ",
        [
          "ratio"
        ]
      ],
      "listSplineOrder": [
        "                              Řád: ",
        [
          "order"
        ]
      ],
      "listSplineProperties": [
        "                       Vlastnosti: ",
        [
          "planar",
          1,
          {
            "yes": "Rovinná,",
            "other": "Nerovinná,"
          }
        ],
        " ",
        [
          "rational",
          1,
          {
            "yes": "Racionální,",
            "other": "Neracionální,"
          }
        ],
        " ",
        [
          "periodic",
          1,
          {
            "yes": "Periodická",
            "other": "Neperiodická"
          }
        ]
      ],
      "listSplineRange": [
        "                 Parametrický rozsah: Start",
        [
          "start"
        ],
        "\n                                   Konec",
        [
          "end"
        ]
      ],
      "listSplineControlCount": [
        "              Počet řídících bodů: ",
        [
          "count"
        ]
      ],
      "listSplineControlPoints": [
        "                      Řídící body: X = ",
        [
          "x"
        ],
        ", Y = ",
        [
          "y"
        ],
        ", Z = ",
        [
          "z"
        ]
      ],
      "listPointMore": [
        "                                   X = ",
        [
          "x"
        ],
        ", Y = ",
        [
          "y"
        ],
        ", Z = ",
        [
          "z"
        ]
      ],
      "listSplineWeight": [
        "                                   Váha",
        [
          "weight"
        ]
      ],
      "listSplineFitCount": [
        "             Počet bodů vyhlazení: ",
        [
          "count"
        ]
      ],
      "listSplineFitPoints": "                  Uživatelská data: Body vyhlazení",
      "listSplineTolerance": [
        "              Tolerance vyhlazení bodu: ",
        [
          "tolerance"
        ]
      ],
      "listSplineStartTangent": "                                   Počáteční tečna",
      "listSplineEndTangent": "                                   Koncová tečna",
      "listLwState": [
        [
          "closed",
          1,
          {
            "yes": "            Uzavřená",
            "other": "              Otevřená"
          }
        ]
      ],
      "listLwThickness": [
        "         Tloušťka ",
        [
          "thickness"
        ]
      ],
      "listLwConstantWidth": [
        "    Pevná šířka ",
        [
          "width"
        ]
      ],
      "listLwArea": [
        "              plocha   ",
        [
          "area"
        ]
      ],
      "listLwLength": [
        "            délka   ",
        [
          "length"
        ]
      ],
      "listLwPerimeter": [
        "         obvod   ",
        [
          "length"
        ]
      ],
      "listLwPoint": [
        "          v bodě  X=",
        [
          "x"
        ],
        "  Y=",
        [
          "y"
        ],
        "  Z=",
        [
          "z"
        ]
      ],
      "listStartingWidth": [
        "    počáteční šířka ",
        [
          "width"
        ]
      ],
      "listEndingWidth": [
        "      koncová šířka ",
        [
          "width"
        ]
      ],
      "listPolylineStartingWidth": [
        "   počáteční šířka ",
        [
          "width"
        ]
      ],
      "listPolylineEndingWidth": [
        "     koncová šířka ",
        [
          "width"
        ]
      ],
      "listVertexEndingWidth": [
        "     koncová šířka ",
        [
          "width"
        ]
      ],
      "listBulge": [
        "             vyboulení ",
        [
          "bulge"
        ]
      ],
      "listVertexBulge": [
        "         vyboulení ",
        [
          "bulge"
        ]
      ],
      "listLwCenter": [
        "            střed  X=",
        [
          "x"
        ],
        "  Y=",
        [
          "y"
        ],
        "  Z=",
        [
          "z"
        ]
      ],
      "listVertexCenter": [
        "             střed X=",
        [
          "x"
        ],
        "  Y=",
        [
          "y"
        ],
        "  Z=",
        [
          "z"
        ]
      ],
      "listPolylineStartAngle": [
        "       počáteční úhel ",
        [
          "angle"
        ]
      ],
      "listPolylineEndAngle": [
        "         koncový úhel ",
        [
          "angle"
        ]
      ],
      "listVertexStartAngle": [
        "    počáteční úhel ",
        [
          "angle"
        ]
      ],
      "listVertexEndAngle": [
        "      koncový úhel ",
        [
          "angle"
        ]
      ],
      "listPolylineState": [
        [
          "state",
          1,
          {
            "open": "          Otevřená",
            "closed": "          Uzavřená",
            "openSpline": "          Otevřená spline",
            "closedSpline": "          Uzavřená spline",
            "openSpace": "          Otevřená plocha",
            "closedSpace": "          Uzavřená plocha",
            "openSplineSpace": "          Otevřená spline plocha",
            "other": "          Uzavřená spline plocha"
          }
        ]
      ],
      "listPolylinePerimeter": [
        "         obvod ",
        [
          "length"
        ]
      ],
      "listVertexPoint": [
        "                  v bodě, X=",
        [
          "x"
        ],
        "  Y=",
        [
          "y"
        ],
        "  Z=",
        [
          "z"
        ]
      ],
      "listVertex3dPoint": [
        "                 v bod, X=",
        [
          "x"
        ],
        "  Y=",
        [
          "y"
        ],
        "  Z=",
        [
          "z"
        ]
      ],
      "listVertexSpace": "           Prostor",
      "listVertexCurveFit": "                   (Vloženo interpolací křivky)",
      "listVertexSplineFit": "                   (Vloženo spline interpolací)",
      "listVertexControl": "                   (Řídící bod spline)",
      "listTextStyle": [
        "             Styl = \"",
        [
          "style"
        ],
        "\""
      ],
      "listTextAnnotative": "        Poznámky: Ne",
      "listTypeface": [
        "             Písmo = ",
        [
          "font"
        ]
      ],
      "listTextPoint": [
        "  ",
        [
          "point"
        ],
        " bod, X=",
        [
          "x"
        ],
        "  Y=",
        [
          "y"
        ],
        "  Z=",
        [
          "z"
        ]
      ],
      "listJustifyPoint": [
        [
          "justify",
          1,
          {
            "start": "počátek",
            "center": "střed",
            "end": "konec",
            "mid": "střední",
            "topLeft": "horní/levý",
            "topCenter": "horní/centr",
            "topRight": "horní/pravý",
            "midLeft": "střední/levý",
            "midRight": "střední/pravý",
            "bottomLeft": "dolní/levý",
            "bottomCenter": "dolní/centr",
            "other": "dolní/pravý"
          }
        ]
      ],
      "listTextHeight": [
        "             výška ",
        [
          "height"
        ]
      ],
      "listTextValue": [
        "              text ",
        [
          "text"
        ]
      ],
      "listTextRotation": [
        "           otočení úhel ",
        [
          "angle"
        ]
      ],
      "listTextWidth": [
        "             šířka faktor měřítka ",
        [
          "factor"
        ]
      ],
      "listTextOblique": [
        "             sklon úhel ",
        [
          "angle"
        ]
      ],
      "listTextGeneration": "        generování normální",
      "listAttributeDefault": [
        "           výchozí ",
        [
          "value"
        ]
      ],
      "listAttributePrompt": [
        "             výzva ",
        [
          "prompt"
        ]
      ],
      "listAttributeTag": [
        "            štítek ",
        [
          "tag"
        ]
      ],
      "listAttributeValue": [
        "           hodnota ",
        [
          "value"
        ]
      ],
      "listAttributeFlags": [
        "          příznaky ",
        [
          "normal",
          1,
          {
            "yes": "normální",
            "other": [
              [
                "invisible",
                1,
                {
                  "yes": "neviditelný  ",
                  "other": ""
                }
              ],
              [
                "constant",
                1,
                {
                  "yes": "konstantní  ",
                  "other": ""
                }
              ],
              [
                "verify",
                1,
                {
                  "yes": "ověřovaný  ",
                  "other": ""
                }
              ],
              [
                "preset",
                1,
                {
                  "yes": "přednastavený",
                  "other": ""
                }
              ]
            ]
          }
        ]
      ],
      "listMtextLocation": [
        "Umístění:        X=",
        [
          "x"
        ],
        "  Y=",
        [
          "y"
        ],
        "  Z=",
        [
          "z"
        ]
      ],
      "listMtextWidth": [
        "Šířka:           ",
        [
          "width"
        ]
      ],
      "listMtextNormal": [
        "Normála:         X=",
        [
          "x"
        ],
        "  Y=",
        [
          "y"
        ],
        "  Z=",
        [
          "z"
        ]
      ],
      "listMtextRotation": [
        "Otočení:        ",
        [
          "angle"
        ]
      ],
      "listMtextHeight": [
        "Výška textu:     ",
        [
          "height"
        ]
      ],
      "listMtextSpacing": [
        "Řádkování:    ",
        [
          "style",
          1,
          {
            "exactly": "Přesně",
            "other": "Násobek"
          }
        ],
        " (",
        [
          "factor"
        ],
        "x = ",
        [
          "distance"
        ],
        ")"
      ],
      "listMtextAttachment": [
        "Vztažný bod:     ",
        [
          "attachment",
          1,
          {
            "tl": "HorníLevé",
            "tc": "HorníCentr",
            "tr": "HorníPravé",
            "ml": "StředníLevé",
            "mc": "StředníCentr",
            "mr": "StředníPravé",
            "bl": "DolníLevé",
            "bc": "DolníCentr",
            "other": "DolníPravé"
          }
        ]
      ],
      "listMtextFlow": "Směr textu:      DlePísma",
      "listMtextContents": [
        "Obsah:           ",
        [
          "contents"
        ]
      ],
      "listDimensionAssociative": "asociativní: ne",
      "listDimensionType": [
        "typ: ",
        [
          "type",
          1,
          {
            "horizontal": "horizontální",
            "vertical": "vertikální",
            "rotated": "otočená",
            "aligned": "šikmá",
            "arc": "oblouk",
            "radial": "radiální",
            "diameter": "průměr",
            "other": "<lineární, není rovnoběžná s USS>"
          }
        ]
      ],
      "listDimensionRotation": [
        " otočení: ",
        [
          "angle"
        ]
      ],
      "listDimensionFirstExtension": [
        "1. vynášecí     definiční bod: X=",
        [
          "x"
        ],
        "  Y=",
        [
          "y"
        ],
        "  Z=",
        [
          "z"
        ]
      ],
      "listDimensionSecondExtension": [
        "2. vynášecí     definiční bod: X=",
        [
          "x"
        ],
        "  Y=",
        [
          "y"
        ],
        "  Z=",
        [
          "z"
        ]
      ],
      "listDimensionLine": [
        "kótovací čára definiční bod: X=",
        [
          "x"
        ],
        "  Y=",
        [
          "y"
        ],
        "  Z=",
        [
          "z"
        ]
      ],
      "listDimensionArcFirst": [
        "1. vynášecí     definiční bod: X=",
        [
          "x"
        ],
        "  Y=",
        [
          "y"
        ],
        "  Z=",
        [
          "z"
        ]
      ],
      "listDimensionArcSecond": [
        "2. vynášecí     definiční bod: X=",
        [
          "x"
        ],
        "  Y=",
        [
          "y"
        ],
        "  Z=",
        [
          "z"
        ]
      ],
      "listDimensionArcCenter": [
        "střed oblouku   definiční bod: X=",
        [
          "x"
        ],
        "  Y=",
        [
          "y"
        ],
        "  Z=",
        [
          "z"
        ]
      ],
      "listDimensionArc": [
        "kótovací oblouk definiční bod: X=",
        [
          "x"
        ],
        "  Y=",
        [
          "y"
        ],
        "  Z=",
        [
          "z"
        ]
      ],
      "listDimensionRadialCenter": [
        "středový definiční bod: X=",
        [
          "x"
        ],
        "  Y=",
        [
          "y"
        ],
        "  Z=",
        [
          "z"
        ]
      ],
      "listDimensionDefiningPoint": [
        "definiční bod:        X=",
        [
          "x"
        ],
        "  Y=",
        [
          "y"
        ],
        "  Z=",
        [
          "z"
        ]
      ],
      "listDimensionFarPoint": [
        "       definiční bod: X=",
        [
          "x"
        ],
        "  Y=",
        [
          "y"
        ],
        "  Z=",
        [
          "z"
        ]
      ],
      "listDimensionTextAngle": [
        "úhel textu: ",
        [
          "angle"
        ]
      ],
      "listDimensionTextPosition": [
        [
          "user",
          1,
          {
            "yes": "zadaný uživatelem",
            "other": "výchozí"
          }
        ],
        " poloha textu X=",
        [
          "x"
        ],
        "  Y=",
        [
          "y"
        ],
        "  Z=",
        [
          "z"
        ]
      ],
      "listDimensionDefaultText": "výchozí text",
      "listDimensionTextModifier": [
        "modifikátor textu kóty: ",
        [
          "text"
        ]
      ],
      "listDimensionStyle": [
        "kótovací styl: \"",
        [
          "style"
        ],
        "\""
      ],
      "listDimensionOverrides": "přenastavení kótovacího stylu:\n DIMUPT      Ano",
      "listDimensionAnnotative": "Poznámka: Ne",
      "listHatchPattern": [
        "                 Šrafovací vzor ",
        [
          "pattern"
        ]
      ],
      "listHatchAnnotative": "                 Poznámky: Ne",
      "listHatchScale": [
        "                 Měřítko šraf ",
        [
          "scale"
        ]
      ],
      "listHatchUserPattern": "                 Šrafovací vzor U",
      "listHatchUserSpacing": [
        "                 Rozteč šraf pro uživatelský vzor ",
        [
          "scale"
        ]
      ],
      "listHatchAngle": [
        "                 Úhel šraf ",
        [
          "angle"
        ]
      ],
      "listHatchGradientPattern": "GRADIENT",
      "listHatchGradientAngle": [
        "                 -úhel gradientu ",
        [
          "angle"
        ]
      ],
      "listHatchGradientCentered": "                 gradient vycentrován",
      "listHatchGradientNotCentered": "                 gradient nevycentrován",
      "listHatchNotAssociative": "                 Neasociativní",
      "listHatchArea": [
        "                 Plocha      ",
        [
          "area"
        ]
      ],
      "listHatchOrigin": [
        "                 Počátek    X=",
        [
          "x"
        ],
        "  Y=",
        [
          "y"
        ],
        "  Z=",
        [
          "z"
        ]
      ],
      "listInsertName": [
        "      Název bloku: \"",
        [
          "name"
        ],
        "\""
      ],
      "listInsertXref": "                  Externí reference",
      "listInsertPoint": [
        "                 v bod, X=",
        [
          "x"
        ],
        "  Y=",
        [
          "y"
        ],
        "  Z=",
        [
          "z"
        ]
      ],
      "listInsertScaleX": [
        " Faktor měřítka X: ",
        [
          "scale"
        ]
      ],
      "listInsertScaleY": [
        " Faktor měřítka Y: ",
        [
          "scale"
        ]
      ],
      "listInsertScaleZ": [
        " Faktor měřítka Z: ",
        [
          "scale"
        ]
      ],
      "listInsertRotation": [
        "     úhel otočení: ",
        [
          "angle"
        ]
      ],
      "listInsertUnits": [
        " Jednotky vložení: ",
        [
          "unit",
          1,
          {
            "cm": "Centimetry",
            "m": "Metry",
            "other": "Milimetry"
          }
        ]
      ],
      "listInsertConversion": [
        "  Převod jednotky: ",
        [
          "factor"
        ]
      ],
      "listInsertUniform": "Použít stejné měřítko: Ne",
      "listInsertExploding": "Povolit rozkládání: Ano",
      "listArrayType": [
        "        Typ pole:  ",
        [
          "kind",
          1,
          {
            "rectangular": "Obdélníkové",
            "polar": "  Polárně",
            "other": "    Cesta"
          }
        ]
      ],
      "listArrayBasePoint": [
        "    Základní bod:  X=",
        [
          "x"
        ],
        "  Y=",
        [
          "y"
        ],
        "  Z=",
        [
          "z"
        ]
      ],
      "listArrayCenter": [
        "    Středový bod:  X=",
        [
          "x"
        ],
        "  Y=",
        [
          "y"
        ],
        "  Z=",
        [
          "z"
        ]
      ],
      "listArrayColumns": [
        "            Počet sloupců:  ",
        [
          "count"
        ]
      ],
      "listArrayColumnSpacing": [
        "           Rozteč sloupců:  ",
        [
          "spacing"
        ]
      ],
      "listArrayRows": [
        "              Počet řádků:  ",
        [
          "count"
        ]
      ],
      "listArrayRowSpacing": [
        "             Rozteč řádků:  ",
        [
          "spacing"
        ]
      ],
      "listArrayRowElevation": [
        "    Přírůstek výšky řádku:  ",
        [
          "spacing"
        ]
      ],
      "listArrayLevels": [
        "             Počet úrovní:  ",
        [
          "count"
        ]
      ],
      "listArrayLevelSpacing": [
        "            Rozteč úrovní:  ",
        [
          "spacing"
        ]
      ],
      "listArrayAxisAngle": [
        "         Sevřený úhel osy:  ",
        [
          "angle"
        ]
      ],
      "listArrayRadius": [
        "                  Poloměr:  ",
        [
          "radius"
        ]
      ],
      "listArrayItems": [
        "              Počet prvků:  ",
        [
          "count"
        ]
      ],
      "listArrayAngleBetween": [
        "          Úhel mezi prvky:  ",
        [
          "angle"
        ]
      ],
      "listArrayFillAngle": [
        "            Úhel vyplnění:  ",
        [
          "angle"
        ]
      ],
      "listArrayItemSpacing": [
        "             Rozteč prvků:  ",
        [
          "spacing"
        ]
      ],
      "listArrayStartOffset": [
        "       Počáteční odsazení:  ",
        [
          "spacing"
        ]
      ],
      "listArrayEndOffset": [
        "         Koncové odsazení:  ",
        [
          "spacing"
        ]
      ],
      "listArrayDirection": [
        "                     Směr:  ",
        [
          "direction",
          1,
          {
            "clockwise": "      SHR",
            "other": "     PSHR"
          }
        ]
      ],
      "listArrayRotate": [
        "           Otočit objekty:  ",
        [
          "answer",
          1,
          {
            "yes": "      Ano",
            "other": "       Ne"
          }
        ]
      ],
      "listArrayMethod": [
        "          Metoda:  ",
        [
          "method",
          1,
          {
            "measure": "   Měření",
            "other": " Rozdělit"
          }
        ]
      ],
      "listArrayAlign": [
        "           Zarovnat prvky:  ",
        [
          "answer",
          1,
          {
            "yes": "      Ano",
            "other": "       Ne"
          }
        ]
      ],
      "regionNoneFound": "Nic nenalezeno.",
      "regionObjectsRejected": [
        [
          "count",
          2,
          {
            "one": [
              0,
              " byla uzavřena, degenerované nebo nepodporované objekt byly odmítnuty."
            ],
            "few": [
              0,
              " byla uzavřena, degenerované nebo nepodporované objekty byly odmítnuty."
            ],
            "many": [
              0,
              " byla uzavřena, degenerované nebo nepodporované objekty byly odmítnuty."
            ],
            "other": [
              0,
              " byla uzavřena, degenerované nebo nepodporované objekty byly odmítnuty."
            ]
          }
        ]
      ],
      "regionOpenNotCoplanar": "Otevřené objekty musí ležet v jedné rovině.",
      "regionOpenEdgesColinear": "Všechny otevřené křivky nemohou být kolineární.",
      "regionLoopsExtracted": [
        [
          "count",
          2,
          {
            "one": [
              "Vyjmuta(y) ",
              0,
              " smyčka."
            ],
            "few": [
              "Vyjmuta(y) ",
              0,
              " smyčky."
            ],
            "many": [
              "Vyjmuta(y) ",
              0,
              " smyčky."
            ],
            "other": [
              "Vyjmuta(y) ",
              0,
              " smyčky."
            ]
          }
        ]
      ],
      "regionLoopsRejected": [
        [
          "count",
          2,
          {
            "one": [
              "Odmítnuta(y) ",
              0,
              " smyčka."
            ],
            "few": [
              "Odmítnuta(y) ",
              0,
              " smyčky."
            ],
            "many": [
              "Odmítnuta(y) ",
              0,
              " smyčky."
            ],
            "other": [
              "Odmítnuta(y) ",
              0,
              " smyčky."
            ]
          }
        ]
      ],
      "regionSelfIntersections": [
        "    Protíná sám sebe                     : ",
        [
          "count",
          2,
          {
            "one": [
              0,
              " smyčka."
            ],
            "few": [
              0,
              " smyčky."
            ],
            "many": [
              0,
              " smyčky."
            ],
            "other": [
              0,
              " smyčky."
            ]
          }
        ]
      ],
      "regionsCreated": [
        [
          "count",
          2,
          {
            "one": [
              "Vytvořena(y) ",
              0,
              " Oblast."
            ],
            "few": [
              "Vytvořena(y) ",
              0,
              " oblasti."
            ],
            "many": [
              "Vytvořena(y) ",
              0,
              " oblasti."
            ],
            "other": [
              "Vytvořena(y) ",
              0,
              " oblasti."
            ]
          }
        ]
      ],
      "nullRegion": "Vytvořena prázdná oblast – vymazána",
      "nullSolid": "Vytvořeno prázdné těleso – vymazáno",
      "booleanFailed": [
        [
          "count"
        ],
        " booleovská operace selhala."
      ],
      "booleanNeedsTwo": "Musí být vybráno nejméně 2 těles, povrchů nebo koplanárních oblastí.",
      "subtractFrom": "Vyberte tělesa, povrchy a oblasti pro odečtení od..",
      "subtractWhat": "Vyberte tělesa, povrchy a oblasti pro odečtení..",
      "subtractNeedsTwo": "Musí být vybrána nejméně dvě tělesa, povrchy nebo koplanární oblasti.",
      "noSolidsOrRegionsSelected": "Nevybráno žádné těleso, povrch ani oblast.",
      "regionAreaReport": [
        "Plocha = ",
        [
          "area"
        ],
        ", oříznutá plocha = ",
        [
          "trimmed"
        ],
        " , Obvod = ",
        [
          "around"
        ]
      ],
      "boxZeroLength": "Kvádr s nulovou délkou není povolen.",
      "boxZeroWidth": "Kvádr s nulovou šířkou není povolen.",
      "boxValueNonzero": "Hodnota musí být nenulová.",
      "solidAxisNonzero": "Hodnota musí být nenulová.",
      "wedgeZeroLength": "Klín s nulovou délkou není povolen.",
      "wedgeZeroWidth": "Klín s nulovou šířkou není povolen.",
      "pyramidSettings": [
        " ",
        [
          "sides"
        ],
        " strany ",
        [
          "type",
          1,
          {
            "inscribed": "Vepsaná",
            "other": "Opsaná"
          }
        ]
      ],
      "pointsCollinear": "Body nemohou ležet na stejné přímce. *Neplatné*",
      "pointsCoincident": "Body nemohou být shodné. *Neplatné*",
      "ellipseAxesNonzero": "Délky os elipsy musí být kladné a nenulové",
      "solidTangentRequired": [
        [
          "typed",
          1,
          {
            "yes": "*Vyžaduje uchopení objektu režimem TAN a výběr kružnice, oblouku nebo úsečky.",
            "other": "Vyžaduje uchopení TAN a výběr Kružnice, Oblouku nebo Úsečky."
          }
        ]
      ],
      "torusTubeTooSmall": [
        "Je-li poloměr anuloidu ",
        [
          "radius"
        ],
        ", musí poloměr roury větší než ",
        [
          "minimum"
        ],
        "."
      ],
      "listSolidHistory": "         Historie = Žádný\nZobrazit historii = Ne",
      "listSolidType": [
        "       Typ těleso = ",
        [
          "type",
          1,
          {
            "extrusion": "Vysunutí",
            "revolve": "Rotace",
            "wedge": "Klín",
            "pyramid": "Jehlan",
            "cylinder": "Válec",
            "cone": "Kužel",
            "sphere": "Koule",
            "torus": "Anuloid",
            "other": "Kvádr"
          }
        ]
      ],
      "listBoxPosition": [
        "            Pozice, X = ",
        [
          "x"
        ],
        " Y = ",
        [
          "y"
        ],
        " Z = ",
        [
          "z"
        ]
      ],
      "listBoxNormal": [
        "           Normála: X = ",
        [
          "x"
        ],
        " Y = ",
        [
          "y"
        ],
        " Z = ",
        [
          "z"
        ]
      ],
      "listBoxLength": [
        "             Délka: ",
        [
          "length"
        ]
      ],
      "listBoxWidth": [
        "             Šířka: ",
        [
          "width"
        ]
      ],
      "listBoxHeight": [
        "             Výška: ",
        [
          "height"
        ]
      ],
      "listBoxRotation": [
        "           Otočení: ",
        [
          "angle"
        ]
      ],
      "listPyramidInscribedBase": [
        " Vepsaný poloměr základny: ",
        [
          "radius"
        ]
      ],
      "listPyramidCircumscribedBase": [
        "  Opsaný poloměr základny: ",
        [
          "radius"
        ]
      ],
      "listPyramidInscribedTop": [
        "    Vepsaný horní poloměr: ",
        [
          "radius"
        ]
      ],
      "listPyramidCircumscribedTop": [
        "     Opsaný horní poloměr: ",
        [
          "radius"
        ]
      ],
      "listPyramidSides": [
        "      Počet stran: ",
        [
          "sides"
        ]
      ],
      "listRoundRadius": [
        "           Poloměr: ",
        [
          "radius"
        ]
      ],
      "listRoundMajorRadius": [
        "    Hlavní poloměr: ",
        [
          "radius"
        ]
      ],
      "listRoundMinorRadius": [
        "  Vedlejší poloměr: ",
        [
          "radius"
        ]
      ],
      "listConeBaseRadius": [
        "  Poloměr základny: ",
        [
          "radius"
        ]
      ],
      "listConeTopRadius": [
        "     Horní poloměr: ",
        [
          "radius"
        ]
      ],
      "listConeBaseMajorRadius": [
        "Hlavní poloměr základny: ",
        [
          "radius"
        ]
      ],
      "listConeBaseMinorRadius": [
        "Vedlejší poloměr základny: ",
        [
          "radius"
        ]
      ],
      "listConeTopMajorRadius": [
        "Hlavní horní poloměr: ",
        [
          "radius"
        ]
      ],
      "listTorusRadius": [
        "  Poloměr anuloidu: ",
        [
          "radius"
        ]
      ],
      "listTubeRadius": [
        "     Poloměr roury: ",
        [
          "radius"
        ]
      ],
      "listRegionArea": [
        "                           Plocha: ",
        [
          "area"
        ]
      ],
      "listRegionPerimeter": [
        "                            Obvod: ",
        [
          "perimeter"
        ]
      ],
      "listRegionBounds": [
        "Hraniční obdélník: Dolní hranice X = ",
        [
          "minX"
        ],
        ", Y = ",
        [
          "minY"
        ],
        ", Z = ",
        [
          "minZ"
        ],
        "\n                 Horní hranice X = ",
        [
          "maxX"
        ],
        ", Y = ",
        [
          "maxY"
        ],
        ", Z = ",
        [
          "maxZ"
        ]
      ],
      "listSolidBounds": [
        "Hraniční obdélník: Dolní hranice X = ",
        [
          "minX"
        ],
        ", Y = ",
        [
          "minY"
        ],
        ", Z = ",
        [
          "minZ"
        ],
        "\n                 Horní hranice X = ",
        [
          "maxX"
        ],
        ", Y = ",
        [
          "maxY"
        ],
        ", Z = ",
        [
          "maxZ"
        ]
      ],
      "sweepDensity": [
        "Aktuální hustota drátového modelu:  ISOLINES=",
        [
          "isolines"
        ],
        ", Režim vytváření uzavřených profilů = Těleso"
      ],
      "sweepRefused": [
        "Nelze táhnout nebo vysunout objekt tohoto typu.\n",
        [
          "count",
          2,
          {
            "one": [
              "Objekt ",
              0,
              " odstraněn z výběrové množiny."
            ],
            "few": [
              "Objekty ",
              0,
              " odstraněny z výběrové množiny."
            ],
            "many": [
              "Objekty ",
              0,
              " odstraněny z výběrové množiny."
            ],
            "other": [
              "Objekty ",
              0,
              " odstraněny z výběrové množiny."
            ]
          }
        ]
      ],
      "sweepRefusedType": "Nelze táhnout nebo vysunout objekt tohoto typu.",
      "sweepRemoved": [
        [
          "count",
          2,
          {
            "one": [
              "Objekt ",
              0,
              " odstraněn z výběrové množiny."
            ],
            "few": [
              "Objekty ",
              0,
              " odstraněny z výběrové množiny."
            ],
            "many": [
              "Objekty ",
              0,
              " odstraněny z výběrové množiny."
            ],
            "other": [
              "Objekty ",
              0,
              " odstraněny z výběrové množiny."
            ]
          }
        ]
      ],
      "sweepNothingSelected": "Nic nebylo vybráno.",
      "sweepSelfIntersecting": "Nelze táhnout nebo vysunout křivku, která protíná sebe samu.",
      "extrudeValueNonzero": "Hodnota musí být nenulová.",
      "taperAngleRange": "Úhel musí být větší než -90 stupňů a menší než 90 stupňů.",
      "directionCoincident": "Body jsou shodné.",
      "directionParallel": "Směr vysunutí je rovnoběžný s rovinou křivky dráhy tažení.",
      "expressionSyntax": "Je použita nesprávná syntaxe nebo není definována proměnná.  Zadejte výraz nebo hodnotu znovu.",
      "listExtrusionHeight": [
        "    Výška vysunutí: ",
        [
          "height"
        ]
      ],
      "listTaperAngle": [
        "       Úhel zúžení: ",
        [
          "angle"
        ]
      ],
      "revolveRefused": [
        "Objekt tohoto typu nelze otáčet.\n",
        [
          "count",
          2,
          {
            "one": [
              "Objekt ",
              0,
              " odstraněn z výběrové množiny."
            ],
            "few": [
              "Objekty ",
              0,
              " odstraněny z výběrové množiny."
            ],
            "many": [
              "Objekty ",
              0,
              " odstraněny z výběrové množiny."
            ],
            "other": [
              "Objekty ",
              0,
              " odstraněny z výběrové množiny."
            ]
          }
        ]
      ],
      "revolveOneSide": "Objekt má být na jedné straně osy.",
      "revolveUnable": "Nelze orotovat vybraný objekt.",
      "revolvePerpendicular": "Osa otáčení je kolmá k rovině křivky rotace.",
      "revolveZeroAxis": "Osa s nulovou délkou není povolena.",
      "revolveClosedAxis": "Nelze stanovit směr osy z uzavřené křivky nebo hrany.",
      "revolveSelfIntersecting": "Nelze otočit křivku, která protíná sebe samu.",
      "listRevolveStart": [
        "        Poč. úhel: ",
        [
          "angle"
        ]
      ],
      "listRevolveAngle": [
        "     Úhel otáčení: ",
        [
          "angle"
        ]
      ],
      "listDirectionVector": [
        "   Směrový vektor: X = ",
        [
          "x"
        ],
        "Y = ",
        [
          "y"
        ],
        "Z = ",
        [
          "z"
        ]
      ],
      "presspullClick": "Klikněte na plochu, křivku nebo uvnitř ohraničené oblasti.",
      "presspullExtruded": [
        "Vysunutí vytvořena (celkem ",
        [
          "count"
        ],
        ")"
      ],
      "presspullOffset": [
        "Odsazeno celkem ploch: ",
        [
          "count"
        ]
      ],
      "presspullSelected": [
        "Vybráno: ",
        [
          "count"
        ],
        ", celkem: ",
        [
          "total"
        ]
      ],
      "presspullFiltered": [
        "Odfiltrováno: ",
        [
          "count"
        ],
        ", celkem: ",
        [
          "total"
        ]
      ],
      "noSurfacesSelected": "Nejsou vybrány žádné povrchy.",
      "planeZIdentical": "Bod na rovině a bod na ose Z nesmí být totožné.",
      "planeFirstSecondIdentical": "První a druhý bod nemohou být totožné.",
      "planeThirdCollinear": "Vyžaduje bod, který se liší a není kolineární s první a druhým bodem.",
      "sliceDistinctXY": "První a druhý bod musí mít odlišné souřadnice X,Y. *Neplatné*",
      "sliceOnPlane": "Bod by neměl být na rovině řezu.",
      "sliceMissedOne": "Rovina řezu neprotíná vybrané těleso.",
      "sliceMissed": [
        "Rovina řezu neprotíná ",
        [
          "count",
          2,
          {
            "one": "jedno vybrané těleso",
            "few": [
              0,
              " vybraná tělesa"
            ],
            "many": [
              0,
              " vybraná tělesa"
            ],
            "other": [
              0,
              " vybraná tělesa"
            ]
          }
        ],
        "."
      ],
      "sectionMissedOne": "Rovina řezu neprotíná vybrané těleso.",
      "sectionMissed": [
        "Rovina řezu neprotíná ",
        [
          "count",
          2,
          {
            "one": "jedno vybrané těleso",
            "few": [
              0,
              " vybraná tělesa"
            ],
            "many": [
              0,
              " vybraná tělesa"
            ],
            "other": [
              0,
              " vybraná tělesa"
            ]
          }
        ],
        "."
      ],
      "noSolidsSelected": "Nebyl proveden výběr těles, povrchů nebo sítí.",
      "noObjectsSelected": "Nejsou vybrány žádné objekty.",
      "noObjectsNoSolidsSelected": "Nejsou vybrány žádné objekty.Nebyl proveden výběr těles, povrchů nebo sítí.",
      "unableToExtractPlane": "Nelze extrahovat rovinu z vybraného objektu.",
      "filletEdgeRadius": [
        "Poloměr = ",
        [
          "radius"
        ]
      ],
      "chamferEdgeDistances": [
        "Vzdálenost 1 = ",
        [
          "distance1"
        ],
        ", Vzdálenost 2 = ",
        [
          "distance2"
        ]
      ],
      "filletEdgesSelected": [
        [
          "count"
        ],
        " hran(a) bylo vybráno pro zaoblení."
      ],
      "noFilletComputed": "Žádné zaoblení nebude spočteno.",
      "noEdgesToChamfer": "Žádné hrany pro zkosení.",
      "edgesOneFace": "Hrany musí patřit k jedné ploše.",
      "radiusTooSmall": "Příliš malý poloměr. *Neplatné*",
      "distanceTooSmall": "Vzdálenost příliš malá. *Neplatné*",
      "filletEdgeFailed": "Chyba modelovací operace:\nSelhání při provádění zkosení.\nSelhání při zaoblování.",
      "chamferEdgeFailed": "Chyba modelovací operace:\nError Code Number is 12069\nSelhání při provádění zkosení.\nSelhání při zkosení.",
      "filletMultipleBodies": "Nelze zaoblit více těles.",
      "chamferMultipleBodies": "Zkosení více těles není povoleno.",
      "edgeAlreadyPicked": "Hrana již byla vybrána.",
      "noTangentChainEdges": "Žádné přilehlé tečné hrany nebyly v řetězu nalezeny.",
      "solideditChecking": [
        "Automatická kontrola úprav těles:  SOLIDCHECK=",
        [
          "value"
        ]
      ],
      "facesFound": [
        [
          "count",
          2,
          {
            "one": "Byla nalezena 1 plocha.",
            "few": [
              "Bylo nalezeno ",
              0,
              " ploch."
            ],
            "many": [
              "Bylo nalezeno ",
              0,
              " ploch."
            ],
            "other": [
              "Bylo nalezeno ",
              0,
              " ploch."
            ]
          }
        ]
      ],
      "facesFoundRemoved": [
        [
          "count",
          2,
          {
            "one": [
              "1 plocha byla nalezena, ",
              [
                "removed"
              ],
              " bylo odstraněno."
            ],
            "few": [
              0,
              " ploch(y) bylo nalezeno,; ",
              [
                "removed"
              ],
              " bylo odstraněno."
            ],
            "many": [
              0,
              " ploch(y) bylo nalezeno,; ",
              [
                "removed"
              ],
              " bylo odstraněno."
            ],
            "other": [
              0,
              " ploch(y) bylo nalezeno,; ",
              [
                "removed"
              ],
              " bylo odstraněno."
            ]
          }
        ]
      ],
      "solidValidationStarted": "Kontrola tělesa byla spuštěna.",
      "solidValidationCompleted": "Kontrola tělesa byla dokončena.",
      "modelingError": "Chyba modelovací operace:",
      "modelingErrorCode": [
        "Chyba modelovací operace:\nError Code Number is ",
        [
          "code"
        ]
      ],
      "faceSelectionUndone": "Výběr plochy byl kompletně vrácen zpět.",
      "noSolidsDetected": "Nebyla zjištěna žádná tělesa.",
      "taperAngleNonzero": "Úhel zešikmení nesmí být nulový a musí být v rozsahu -90 a 90.",
      "zeroDisplacement": "Nebyla provedena žádná změna, protože vektor přemístění je nulový.",
      "zeroRotation": "Nebyla provedena žádná změna, protože úhel otočení je nulový.",
      "offsetDistanceBound": [
        "Vzdálenost ekvidistanty musí být větší než ",
        [
          "distance"
        ],
        "."
      ],
      "currentPointModes": [
        "Aktuální režimy bodů:  PDMODE=",
        [
          "mode"
        ],
        "  PDSIZE=",
        [
          "size"
        ]
      ],
      "cannotDivideObject": "Nelze dělit tento objekt.",
      "cannotMeasureObject": "Nelze dělit tento objekt.",
      "objectNotThatLong": "Objekt není dostatečně dlouhý.",
      "objectTooLong": "Objekt je příliš dlouhý.",
      "cannotFindBlock": [
        "Nemohu nalézt blok \"",
        [
          "name"
        ],
        "\"."
      ],
      "blockNameNotValid": "Neplatný název blok.",
      "leaderCopyRefused": "Vyberte mtext, text, referenci bloku nebo objekt tolerance.",
      "listLeaderNormal": [
        "Normála:              X=",
        [
          "x"
        ],
        "  Y=",
        [
          "y"
        ],
        "  Z=",
        [
          "z"
        ]
      ],
      "listLeaderHorizontal": [
        "Horizontální směr:    X=",
        [
          "x"
        ],
        "  Y=",
        [
          "y"
        ],
        "  Z=",
        [
          "z"
        ]
      ],
      "listLeaderVertex": [
        "Vrchol:        X=",
        [
          "x"
        ],
        "  Y=",
        [
          "y"
        ],
        "  Z=",
        [
          "z"
        ]
      ],
      "listLeaderHook": [
        "Kotvička:  ",
        [
          "on",
          1,
          {
            "yes": "Ano",
            "other": "Ne"
          }
        ]
      ],
      "listLeaderArrow": [
        "Šipka:     ",
        [
          "on",
          1,
          {
            "yes": "Ano",
            "other": "Ne"
          }
        ]
      ],
      "listLeaderPath": [
        "Typ čáry:  ",
        [
          "spline",
          1,
          {
            "yes": "Spline",
            "other": "Přímá"
          }
        ]
      ],
      "listLeaderAnnotative": "        Poznámky: Ne",
      "wipeoutPolylineNotClosed": "Křivka musí být uzavřená a složená jen z úsečkových segmentů.",
      "listWipeoutPoints": [
        "Počet bodů hranice: ",
        [
          "count"
        ]
      ],
      "listWipeoutPoint": [
        "       v bodě, X = ",
        [
          "x"
        ],
        ", Y = ",
        [
          "y"
        ],
        ", Z = ",
        [
          "z"
        ]
      ],
      "listImageName": [
        "Obrázek:                   ",
        [
          "name"
        ]
      ],
      "listImageInsertion": [
        "Vložení:               X=",
        [
          "x"
        ],
        ",  Y=",
        [
          "y"
        ],
        ",  Z=",
        [
          "z"
        ]
      ],
      "listImageScale": [
        "Měřítko:                   ",
        [
          "scale"
        ]
      ],
      "listImageRotation": [
        "Úhel otočení:          ",
        [
          "angle"
        ]
      ],
      "listImageBrightness": [
        "Jas:                         ",
        [
          "value"
        ]
      ],
      "listImageContrast": [
        "Kontrast:                 ",
        [
          "value"
        ]
      ],
      "listImageFade": [
        "Útlum:                   ",
        [
          "value"
        ]
      ],
      "listImageShown": [
        "Zobrazit obrázek:      ",
        [
          "shown",
          1,
          {
            "yes": "Ano",
            "other": "Ne"
          }
        ]
      ],
      "listImageNonOrtho": [
        "Zobrazit nepravoúhlé:  ",
        [
          "shown",
          1,
          {
            "yes": "Ano",
            "other": "Ne"
          }
        ]
      ],
      "listImageTransparency": [
        "Průhlednost pozadí:            ",
        [
          "on",
          1,
          {
            "yes": "Ano",
            "other": "Ne"
          }
        ]
      ],
      "listImageClipping": [
        "Oříznutí:                ",
        [
          "on",
          1,
          {
            "yes": "Ano",
            "other": "Ne"
          }
        ]
      ],
      "listImageClipType": [
        "Typ hranice oříznutí:    ",
        [
          "polygonal",
          1,
          {
            "yes": "Polygon",
            "other": "Obdélník"
          }
        ]
      ],
      "listImagePoint": [
        "       v bodě, X = ",
        [
          "x"
        ],
        ",  Y = ",
        [
          "y"
        ],
        ",  Z = ",
        [
          "z"
        ]
      ],
      "listImageExtrusion": [
        "Směr vytažení vzhzledem k UCS:\n                   X =",
        [
          "x"
        ],
        "    Y =",
        [
          "y"
        ],
        "    Z = ",
        [
          "z"
        ]
      ],
      "listTablePosition": [
        "Poloha:        X= ",
        [
          "x"
        ],
        ", Y= ",
        [
          "y"
        ],
        ", Z= ",
        [
          "z"
        ]
      ],
      "listTableNormal": [
        "Normála:          X= ",
        [
          "x"
        ],
        ", Y= ",
        [
          "y"
        ],
        ", Z= ",
        [
          "z"
        ]
      ],
      "listTableDirection": [
        "Horizontální směr:  X= ",
        [
          "x"
        ],
        ", Y= ",
        [
          "y"
        ],
        ", Z= ",
        [
          "z"
        ]
      ],
      "listTableColumns": [
        "Počet sloupců:  ",
        [
          "count"
        ]
      ],
      "listTableRows": [
        "Počet řádků:     ",
        [
          "count"
        ]
      ],
      "listTableStyle": [
        "Styl tabulky:     ",
        [
          "name"
        ]
      ],
      "listMLeaderType": [
        [
          "type",
          1,
          {
            "straight": "Typ odkazu:        Přímý odkaz",
            "spline": "Typ odkazu:        Odkaz se spline",
            "other": "Typ odkazu:        Neviditelný odkaz"
          }
        ]
      ],
      "listMLeaderContent": [
        [
          "content",
          1,
          {
            "mtext": "Typ obsahu:       Obsah víceřádkového textu",
            "block": "Typ obsahu:       Obsah bloku",
            "other": "Typ obsahu:       Žádný obsah"
          }
        ]
      ],
      "listMLeaderLanding": [
        "Prodloužení čáry:      ",
        [
          "on",
          1,
          {
            "true": "ZAP",
            "other": "VYP"
          }
        ]
      ],
      "listMLeaderNumber": [
        "Číslo odkazu:      ",
        [
          "number"
        ]
      ],
      "listMLeaderVertex": [
        "Vrchol:            X = ",
        [
          "x"
        ],
        ", Y = ",
        [
          "y"
        ],
        ", Z = ",
        [
          "z"
        ]
      ],
      "listMLeaderStyle": [
        "Styl multiodkazů:  ",
        [
          "name"
        ]
      ],
      "listMLeaderAnnotative": "S poznámkou:      NE"
    },
    "feedback": {
      "snap": {
        "endpoint": "Koncový",
        "midpoint": "Polovina",
        "center": "Střed",
        "node": "Uzel",
        "intersection": "Průsečík",
        "apparentIntersection": "Zdánlivý průsečík",
        "perpendicular": "Kolmo",
        "tangent": "Tečná",
        "insertion": "Vložení",
        "extension": "Protažení",
        "parallel": "Rovnoběžně",
        "quadrant": "Kvadrant",
        "nearest": "Nejbližší"
      },
      "deferredTangent": "Odložená tangenta",
      "deferredPerpendicular": "Odložená kolmice",
      "polar": [
        "Polárně: ",
        [
          "distance"
        ],
        [
          "unit"
        ],
        " < ",
        [
          "angle"
        ],
        "°"
      ],
      "polarZ": [
        "Polárně: ",
        [
          "distance"
        ],
        [
          "unit"
        ],
        " < ",
        [
          "axis"
        ]
      ],
      "zPositive": "+Z",
      "zNegative": "-Z",
      "ucsIconX": "X",
      "ucsIconY": "Y",
      "ucsIconZ": "Z",
      "measureDistance": [
        "Vzdálenost ",
        [
          "value"
        ],
        " ",
        [
          "unit"
        ]
      ],
      "measureAngle": [
        "Úhel ",
        [
          "value"
        ],
        "°"
      ],
      "measureDeltaX": [
        "ΔX    ",
        [
          "value"
        ]
      ],
      "measureDeltaY": [
        "ΔY    ",
        [
          "value"
        ]
      ],
      "measureDeltaZ": [
        "ΔZ    ",
        [
          "value"
        ]
      ],
      "measureArea": [
        "Plocha ",
        [
          "value"
        ],
        " ",
        [
          "unit"
        ],
        "²"
      ],
      "measurePerimeter": [
        "Obvod ",
        [
          "value"
        ],
        " ",
        [
          "unit"
        ]
      ]
    },
    "keywordLabels": {
      "CIRCLE": {
        "Ttr": "Ttr (tan tan poloměr)"
      },
      "TRIM": {
        "cuTting": "řEzací hrany",
        "Noextend": "Neprodluž"
      },
      "EXTEND": {
        "Boundary": "hrAniční hrany",
        "Noextend": "Neprodluž"
      },
      "POLYGON": {
        "Inscribed": "Vepsaný v kružnici",
        "Circumscribed": "Opsaný kolem kružnice"
      },
      "PYRAMID": {
        "Axis": "koncový bod Osy",
        "Top": "Horní poloměr"
      },
      "CYLINDER": {
        "Axis": "koncový bod Osy"
      },
      "CONE": {
        "Axis": "koncový bod Osy",
        "Top": "Horní poloměr"
      },
      "CIRCLED": {
        "Ttr": "Ttr (tan tan poloměr)"
      },
      "PLINE": {
        "Halfwidth": "Polotloušťka",
        "Second pt": "Druhý bod"
      },
      "DIST": {
        "Line": "úsEčka",
        "Direction": "Vektor",
        "Multiple": "Více bodů",
        "Second pt": "Druhý bod"
      },
      "RECTANG": {
        "Pick": "VYbrat body"
      },
      "AREA": {
        "Add": "Přičíst oblast",
        "Subtract": "oDečíst oblast"
      },
      "MTEXT": {
        "Line spacing": "řáDkování",
        "At least": "Nejméně"
      },
      "TEXT": {
        "TL": "HL",
        "TC": "HC",
        "TR": "HP",
        "ML": "SL",
        "MC": "SC",
        "MR": "SP",
        "BL": "DL",
        "BC": "DC",
        "BR": "DP"
      },
      "ATTDEF": {
        "TL": "HL",
        "TC": "HC",
        "TR": "HP",
        "ML": "SL",
        "MC": "SC",
        "MR": "SP",
        "BL": "DL",
        "BC": "DC",
        "BR": "DP",
        "Lock position": "Uzamknout polohu"
      },
      "ATTDISP": {
        "ON": "Ano",
        "OFF": "Ne"
      },
      "-LAYER": {
        "OFF": "Ne"
      },
      "SNAP": {
        "OFF": "Ne"
      },
      "FILL": {
        "OFF": "Ne"
      },
      "UNDO": {
        "OFF": "Ne"
      },
      "ARC": {
        "Center": "Střed"
      },
      "ARCSCE": {
        "Center": "Střed"
      },
      "ELLIPSE": {
        "Included angle": "SEvřený úhel"
      },
      "ELLIPSEC": {
        "Included angle": "SEvřený úhel"
      },
      "ELLIPSEARC": {
        "Included angle": "SEvřený úhel"
      },
      "PLAN": {
        "Current ucs": "Aktuální uss"
      },
      "SPLINE": {
        "Square root": "Odmocnina",
        "start Tangency": "počáteční Tečnost",
        "end Tangency": "konečná Tečnost"
      },
      "SPLINEDIT": {
        "After": "Po",
        "Fit data": "Data vyhlazení",
        "Edit vertex": "Editace vrcholů",
        "convert to Polyline": "převeď na Křivku",
        "Reverse": "oBrátit",
        "eXit": "kOnec",
        "Elevate order": "Zvýšit řád",
        "Select point": "Vybrat bod",
        "System default": "Systémová výchozí"
      },
      "PEDIT": {
        "Edit vertex": "Editace vrcholů",
        "Ltype gen": "tYpčgen",
        "OFF": "Ne",
        "Jointype": "Typ spoje",
        "Spline curve": "Spline"
      },
      "HATCH": {
        "Select objects": "Vybrat objekty"
      },
      "BREAK": {
        "First point": "První bod"
      },
      "ARRAYRECT": {
        "Unit cell": "Jednotková buňka"
      },
      "ARRAYPOLAR": {
        "Angle between": "úHel mezi",
        "Fill angle": "úhel Vyplnění",
        "ROTate items": "oTočit položky"
      },
      "ARRAYPATH": {
        "Align items": "zaroVnat položky",
        "Fill entire path": "VYPlnit celou trajektorii"
      },
      "COPY": {
        "Displacement": "Přemístění"
      },
      "UCSICON": {
        "Noorigin": "vLevo"
      },
      "OFFSET": {
        "Through": "Bodem"
      },
      "XLINE": {
        "Reference": "Reference",
        "Through": "Bodem"
      },
      "EXTRUDE": {
        "Taper": "úhel Zešikmení"
      },
      "REVOLVE": {
        "STart": "Počáteční úhel"
      },
      "SLICE": {
        "Object": "rovinný Objekt",
        "Both": "zachovat Obě strany"
      },
      "SOLIDEDIT": {
        "Axis": "Osa podle objektu"
      },
      "WIPEOUT": {
        "Close": "Uzavři",
        "OFF": "Ne",
        "Display": "Zobrazit bez vykreslení"
      }
    },
    "promptKeywordLabels": {
      "ucsNewUcs": {
        "ZAxis": "ZOsa"
      },
      "filletEdgeLoopOr": {
        "Edge": "Hrana"
      },
      "splineditOptionClosed": {
        "Reverse": "oBrátit"
      },
      "enterThirdPointOr": {
        "end Tangency": "konečná Tečnost"
      },
      "specifyEndTangentOr": {
        "System default": "Systémová výchozí"
      },
      "peditMultipleOption": {
        "Ltype gen": "tYpčgen"
      }
    },
    "listing": {
      "dimVariable": [
        [
          "name"
        ],
        [
          "value"
        ],
        [
          "description"
        ]
      ],
      "dimVariableOn": "Ano",
      "dimVariableOff": "Ne",
      "dimVariableDescription": {
        "DIMSTYLE": "Aktuální kótovací styl (pouze ke čtení)",
        "DIMADEC": "Desetinná místa úhlových kót",
        "DIMASZ": "Velikost šipky",
        "DIMCEN": "Velikost značky středu",
        "DIMDEC": "Desetinná místa",
        "DIMDLI": "Rozteč kótovacích čar",
        "DIMDSEP": "Desetinný oddělovač",
        "DIMEXE": "Přesah nad kótovací čáru",
        "DIMEXO": "Odsazení počátku vynášecí čáry",
        "DIMGAP": "Mezera mezi kótovací čarou a textem",
        "DIMSCALE": "Celkový faktor měřítka",
        "DIMTOFL": "Vynutit čáru mezi vynášecími čarami",
        "DIMTXT": "Výška textu",
        "DIMZIN": "Potlačení nul"
      },
      "hatchPattern": [
        [
          "name"
        ],
        " - ",
        [
          "description"
        ]
      ],
      "hatchPatternDescription": {
        "SOLID": " Vyplnění",
        "ANGLE": " Ocel",
        "ANSI31": " ANSI železo, cihly, kámen",
        "ANSI32": " ANSI ocel",
        "ANSI33": " ANSI bronz, mosaz, měď",
        "ANSI34": " ANSI plasty, guma",
        "ANSI35": " ANSI ohnivzdorné materiály",
        "ANSI36": " ANSI mramor, břidlice, sklo",
        "ANSI37": " ANSI ocel, zinek, magnézium, hluková/tepelná/elektrická izolace",
        "ANSI38": " ANSI hliník",
        "LINE": " Rovnoběžné vodorovné čáry",
        "NET": " Svislá / vodorovná mřížka",
        "NET3": " Síťový vzor 0-60-120",
        "DASH": " Čárkované čáry",
        "SQUARE": " Malé vyrovnané čtverce",
        "STEEL": " Ocelový materiál",
        "BRICK": " Cihly nebo omítnuté povrchy",
        "CROSS": " Řada křížků",
        "ZIGZAG": " Schodovitý efekt",
        "HONEY": " Vzor včelí plástve",
        "EARTH": " Země nebo podzemí",
        "DOTS": " Řady teček",
        "AR-SAND": " Náhodný bodový vzor",
        "AR-CONC": " Bodový a kamenný vzor - náhodná kombinace"
      }
    },
    "defaults": {
      "layer": [
        "Hladina",
        [
          "n"
        ]
      ],
      "textStyle": [
        "styl",
        [
          "n"
        ]
      ],
      "copyOf": [
        "Kopie ",
        [
          "name"
        ]
      ],
      "fileName": [
        "výkres-",
        [
          "date"
        ]
      ]
    }
  }
}
