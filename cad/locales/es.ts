// Generated from es.json by `npm run locales`. Do not edit.
import type { EngineLocale } from "./types"

export const es: EngineLocale = {
  "tag": "es",
  "interface": {
    "tool": {
      "select": "Seleccionar",
      "line": "Línea",
      "polyline": "Polilínea",
      "circle": "Círculo",
      "circlediameter": "Círculo por diámetro",
      "circle2p": "Círculo por 2 puntos",
      "circle3p": "Círculo por 3 puntos",
      "arc": "Arco",
      "arcsce": "Arco inicio, centro, fin",
      "arccse": "Arco centro, inicio, fin",
      "ellipse": "Elipse",
      "ellipsecenter": "Elipse por centro",
      "ellipsearc": "Arco elíptico",
      "spline": "Spline",
      "rectangle": "Rectángulo",
      "polygon": "Polígono",
      "hatch": "Sombreado",
      "block": "Crear bloque",
      "insert": "Insertar bloque",
      "attedit": "Editar atributos",
      "attdef": "Definir atributos",
      "attdisp": "Visualización de atributos",
      "text": "Texto",
      "mtext": "Texto de líneas múltiples",
      "textedit": "Editar texto",
      "dimlinear": "Lineal",
      "dimaligned": "Alineada",
      "dimradius": "Radio",
      "dimdiameter": "Diámetro",
      "dimangular": "Angular",
      "dimbaseline": "Línea base",
      "dimcontinue": "Continuar",
      "dimspace": "Ajustar espacio",
      "offset": "Desfase",
      "move": "Desplazar",
      "copy": "Copiar",
      "stretch": "Estirar",
      "rotate": "Girar",
      "scale": "Escala",
      "mirror": "Simetría",
      "array": "Matriz rectangular",
      "arraypolar": "Matriz polar",
      "arraypath": "Matriz de camino",
      "trim": "Recortar",
      "extend": "Alargar",
      "fillet": "Empalme",
      "chamfer": "Chaflán",
      "erase": "Borrar",
      "explode": "Descomponer",
      "join": "Juntar",
      "break": "Partir",
      "breakatpoint": "Partir en punto",
      "matchprop": "Igualar propiedades",
      "copyclip": "Copiar",
      "cutclip": "Cortar",
      "copybase": "Copiar con punto base",
      "paste": "Pegar",
      "measure": "Medir",
      "measurearea": "Área",
      "id": "Coordenadas punto",
      "zoom": "Zoom",
      "pan": "Encuadre",
      "ucs": "SCP",
      "ucsicon": "Icono SCP",
      "plan": "Vista en planta",
      "elev": "Elevación",
      "vpoint": "Punto de vista",
      "view": "Vistas predefinidas",
      "orbit": "Órbita 3D",
      "navvcube": "ViewCube",
      "ltscale": "Escala de tipo de línea",
      "osnap": "Modos de referencia a objetos",
      "color": "Color",
      "linetype": "Tipo de línea",
      "lweight": "Grosor de línea"
    },
    "description": {
      "UNDO": "Deshacer la última acción",
      "REDO": "Rehacer la última acción deshecha",
      "SNAP": "Restringir el cursor a los intervalos de resolución",
      "-OSNAP": "Establece los modos de referencia a objetos en ejecución",
      "FROM": "Designar un punto desfasado de un punto base",
      "NEW": "Iniciar un dibujo nuevo",
      "QNEW": "Iniciar un dibujo nuevo",
      "QSAVE": "Guardar el dibujo en un archivo",
      "SAVEAS": "Guardar el dibujo en un archivo con otro nombre",
      "OPEN": "Abrir un archivo de dibujo",
      "PASTECLIP": "Pegar el portapapeles en el dibujo",
      "DIMSTYLE": "Crear y modificar estilos de cota",
      "STYLE": "Crear y modificar estilos de texto",
      "BLOCKSPALETTE": "Mostrar la paleta Bloques",
      "PURGE": "Eliminar las definiciones de bloque no utilizadas",
      "LAYER": "Administrar las capas y sus propiedades",
      "LAYERCLOSE": "Cerrar el Administrador de propiedades de capas",
      "PROPERTIES": "Mostrar las propiedades de los objetos designados",
      "PROPERTIESCLOSE": "Cerrar la paleta Propiedades",
      "UNITS": "Controlar la precisión y el formato de visualización de las coordenadas y las distancias",
      "CLEANSCREENON": "Borrar de la pantalla las barras de herramientas y las paletas",
      "CLEANSCREENOFF": "Restablecer la pantalla como estaba antes de limpiarla"
    },
    "snap": {
      "endpoint": "Punto final",
      "midpoint": "Punto medio",
      "center": "Centro",
      "intersection": "Intersección",
      "apparentIntersection": "Intersección ficticia",
      "perpendicular": "Perpendicular",
      "tangent": "Tangente",
      "insertion": "Inserción",
      "extension": "Extensión",
      "parallel": "Paralelo",
      "quadrant": "Cuadrante",
      "nearest": "Cercano"
    },
    "color": {
      "red": "Rojo",
      "yellow": "Amarillo",
      "green": "Verde",
      "cyan": "Cián",
      "blue": "Azul",
      "magenta": "Magenta",
      "white": "Blanco"
    },
    "byLayer": "PorCapa",
    "view": {
      "Top": "Superior",
      "Bottom": "Inferior",
      "Front": "Frontal",
      "BAck": "Posterior",
      "Left": "Izquierda",
      "Right": "Derecha",
      "SWiso": "Isométrica SO",
      "SEiso": "Isométrica SE",
      "NEiso": "Isométrica NE",
      "NWiso": "Isométrica NO",
      "custom": "Vista personalizada"
    },
    "viewCube": {
      "face": {
        "top": "SUPERIOR",
        "bottom": "INFERIOR",
        "front": "FRONTAL",
        "back": "POSTERIOR",
        "left": "IZQUIERDA",
        "right": "DERECHA"
      },
      "compass": {
        "N": "N",
        "E": "E",
        "S": "S",
        "W": "O"
      }
    },
    "entity": {
      "line": [
        [
          "count",
          2,
          {
            "one": "Línea",
            "other": "Líneas"
          }
        ]
      ],
      "circle": [
        [
          "count",
          2,
          {
            "one": "Círculo",
            "other": "Círculos"
          }
        ]
      ],
      "arc": [
        [
          "count",
          2,
          {
            "one": "Arco",
            "other": "Arcos"
          }
        ]
      ],
      "ellipse": [
        [
          "count",
          2,
          {
            "one": "Elipse",
            "other": "Elipses"
          }
        ]
      ],
      "spline": [
        [
          "count",
          2,
          {
            "one": "Spline",
            "other": "Splines"
          }
        ]
      ],
      "polyline": [
        [
          "count",
          2,
          {
            "one": "Polilínea",
            "other": "Polilíneas"
          }
        ]
      ],
      "text": [
        [
          "count",
          2,
          {
            "one": "Texto",
            "other": "Textos"
          }
        ]
      ],
      "mtext": [
        [
          "count",
          2,
          {
            "one": "Texto M",
            "other": "Textos M"
          }
        ]
      ],
      "attdef": [
        [
          "count",
          2,
          {
            "one": "Definición de atributo",
            "other": "Definiciones de atributo"
          }
        ]
      ],
      "dimension": [
        [
          "count",
          2,
          {
            "one": "Cota",
            "other": "Cotas"
          }
        ]
      ],
      "hatch": [
        [
          "count",
          2,
          {
            "one": "Sombreado",
            "other": "Sombreados"
          }
        ]
      ],
      "insert": [
        [
          "count",
          2,
          {
            "one": "Referencia a bloque",
            "other": "Referencias a bloque"
          }
        ]
      ]
    },
    "property": {
      "title": {
        "ellipticalArc": "Arco elíptico",
        "objects": [
          [
            "count",
            2,
            {
              "one": [
                0,
                " objeto"
              ],
              "other": [
                0,
                " objetos"
              ]
            }
          ]
        ],
        "all": [
          "Todo (",
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
        ]
      },
      "group": {
        "geometry": "Geometría",
        "endpoints": "Extremos",
        "center": "Centro",
        "text": "Texto",
        "position": "Posición",
        "dimension": "Cota",
        "definitionPoints": "Puntos de definición",
        "pattern": "Patrón",
        "block": "Bloque",
        "attributes": "Atributos",
        "misc": "Varios",
        "selection": "Selección"
      },
      "row": {
        "length": "Longitud",
        "angle": "Ángulo",
        "deltaX": "Delta X",
        "deltaY": "Delta Y",
        "deltaZ": "Delta Z",
        "startX": "Inicio X",
        "startY": "Inicio Y",
        "startZ": "Inicio Z",
        "endX": "Fin X",
        "endY": "Fin Y",
        "endZ": "Fin Z",
        "radius": "Radio",
        "diameter": "Diámetro",
        "circumference": "Circunferencia",
        "area": "Área",
        "normalX": "Normal X",
        "normalY": "Normal Y",
        "normalZ": "Normal Z",
        "x": "X",
        "y": "Y",
        "z": "Z",
        "elevation": "Elevación",
        "thickness": "Altura de objeto",
        "startAngle": "Ángulo inicial",
        "endAngle": "Ángulo final",
        "majorRadius": "Radio mayor",
        "minorRadius": "Radio menor",
        "radiusRatio": "Relación de radios",
        "vertices": "Vértices",
        "segments": "Segmentos",
        "closed": "Cerrado",
        "contents": "Contenido",
        "justify": "Justificar",
        "height": "Altura",
        "rotation": "Rotación",
        "lineSpaceFactor": "Factor de interlineado",
        "lineSpaceDistance": "Distancia de interlineado",
        "lineSpaceStyle": "Estilo de interlineado",
        "definedWidth": "Anchura definida",
        "measurement": "Medidas",
        "textOverride": "Modificar texto",
        "type": "Tipo",
        "vertexX": "Vértice X",
        "vertexY": "Vértice Y",
        "firstX": "Primero X",
        "firstY": "Primero Y",
        "secondX": "Segundo X",
        "secondY": "Segundo Y",
        "pattern": "Patrón",
        "scale": "Escala",
        "boundaries": "Contornos",
        "name": "Nombre",
        "tag": "Identificador",
        "prompt": "Solicitud",
        "value": "Valor",
        "invisible": "Invisible",
        "constant": "Constante",
        "verify": "Verificable",
        "preset": "Predefinido",
        "lockPosition": "Bloquear posición",
        "method": "Método",
        "degree": "Grado",
        "knotParameterization": "Parametrización de nudos"
      },
      "value": {
        "yes": "Sí",
        "no": "No",
        "none": "—",
        "atLeast": "Al menos",
        "exactly": "Exactamente",
        "fitPoints": "Ajustar",
        "controlVertices": "VC",
        "chord": "Cuerda",
        "sqrtChord": "Raíz cuadrada",
        "uniform": "Uniforme"
      },
      "justify": {
        "left": "Izquierda",
        "center": "Centro",
        "right": "Derecha",
        "middle": "Medio",
        "tl": "Superior izquierda",
        "tc": "Superior centro",
        "tr": "Superior derecha",
        "ml": "Medio izquierda",
        "mc": "Medio centro",
        "mr": "Medio derecha",
        "bl": "Inferior izquierda",
        "bc": "Inferior centro",
        "br": "Inferior derecha"
      },
      "dimensionKind": {
        "linear": "Lineal",
        "aligned": "Alineada",
        "angular": "Angular",
        "radius": "Radio",
        "diameter": "Diámetro"
      }
    }
  },
  "commands": {
    "names": {
      "LINE": [
        "LINEA",
        "L"
      ],
      "PLINE": [
        "POL",
        "PL"
      ],
      "CIRCLE": [
        "CIRCULO",
        "C"
      ],
      "CIRCLED": [
        "CIRCULOD"
      ],
      "CIRCLE2P": [
        "CIRCULO2P"
      ],
      "CIRCLE3P": [
        "CIRCULO3P"
      ],
      "ARC": [
        "ARCO",
        "A"
      ],
      "ARCSCE": [
        "ARCOICF"
      ],
      "ARCCSE": [
        "ARCOCIF"
      ],
      "ELLIPSE": [
        "ELIPSE",
        "EL"
      ],
      "ELLIPSEC": [
        "ELIPSEC"
      ],
      "ELLIPSEARC": [
        "ELIPSEARCO"
      ],
      "SPLINE": [
        "SPLINE",
        "SPL"
      ],
      "RECTANG": [
        "RECTANG",
        "REC"
      ],
      "POLYGON": [
        "POLIGONO",
        "PG"
      ],
      "HATCH": [
        "SOMBREA",
        "SB",
        "SMB"
      ],
      "BLOCK": [
        "BLOQUE",
        "BQ"
      ],
      "INSERT": [
        "INSERT",
        "IN"
      ],
      "ATTEDIT": [
        "ATREDIT"
      ],
      "EATTEDIT": [
        "EDITATR"
      ],
      "ATTDEF": [
        "ATRDEF",
        "AT"
      ],
      "-ATTDEF": [
        "-ATRDEF",
        "-AT"
      ],
      "ATTDISP": [
        "ATRVIS"
      ],
      "TEXT": [
        "TEXTO",
        "T"
      ],
      "MTEXT": [
        "TEXTOM"
      ],
      "-MTEXT": [
        "-TEXTOM"
      ],
      "TEXTEDIT": [
        "EDITARTEXTO",
        "ED",
        "DDEDIC"
      ],
      "DIMLINEAR": [
        "ACOLINEAL",
        "ACOLIN",
        "DIMLIN"
      ],
      "DIMALIGNED": [
        "ACOALINEADA",
        "ACOALI"
      ],
      "DIMRADIUS": [
        "ACORADIO",
        "ACORAD"
      ],
      "DIMDIAMETER": [
        "ACODIAMETRO",
        "ACODIA"
      ],
      "DIMANGULAR": [
        "ACOANGULO",
        "ACOANG",
        "ACOANGULAR"
      ],
      "DIMBASELINE": [
        "ACOLINEABASE",
        "ACOLINE"
      ],
      "DIMCONTINUE": [
        "ACOCONTINUA",
        "ACOCONT"
      ],
      "DIMSPACE": [
        "ACOESPAC"
      ],
      "OFFSET": [
        "DESFASE",
        "DF",
        "EQ"
      ],
      "MOVE": [
        "DESPLAZA",
        "D"
      ],
      "COPY": [
        "COPIA",
        "CP",
        "DUP"
      ],
      "STRETCH": [
        "ESTIRA",
        "EI"
      ],
      "ROTATE": [
        "GIRA",
        "GI"
      ],
      "SCALE": [
        "ESCALA",
        "ES"
      ],
      "MIRROR": [
        "SIMETRIA",
        "SI"
      ],
      "ARRAYRECT": [
        "MATRIZRECTANG",
        "MA",
        "MATRIZ"
      ],
      "ARRAYPOLAR": [
        "MATRIZPOLAR"
      ],
      "ARRAYPATH": [
        "MATRIZCAMINO"
      ],
      "TRIM": [
        "RECORTA",
        "RR"
      ],
      "EXTEND": [
        "ALARGA",
        "AL"
      ],
      "FILLET": [
        "EMPALME",
        "MP"
      ],
      "CHAMFER": [
        "CHAFLAN",
        "CH"
      ],
      "EXPLODE": [
        "DESCOMP",
        "DP"
      ],
      "JOIN": [
        "UNIR",
        "U"
      ],
      "BREAK": [
        "PARTE",
        "P"
      ],
      "BREAKATPOINT": [
        "PARTIRENPUNTO"
      ],
      "MATCHPROP": [
        "IGUALARPROP",
        "IP",
        "COPARPROP"
      ],
      "COPYCLIP": [
        "COPIAPP"
      ],
      "CUTCLIP": [
        "CORTAPP"
      ],
      "COPYBASE": [
        "COPIARBASE"
      ],
      "DIST": [
        "DIST",
        "DI"
      ],
      "AREA": [
        "AREA",
        "AA"
      ],
      "ID": [
        "ID"
      ],
      "ZOOM": [
        "ZOOM",
        "Z"
      ],
      "PAN": [
        "ENCUADRE",
        "E"
      ],
      "ERASE": [
        "BORRA",
        "B"
      ],
      "UNDO": [
        "DESHACER",
        "H"
      ],
      "REDO": [
        "REHACER"
      ],
      "SNAP": [
        "FORZCURSOR",
        "FC"
      ],
      "-OSNAP": [
        "-REFENT"
      ],
      "FROM": [
        "DESDE"
      ],
      "NEW": [
        "NUEVO"
      ],
      "QNEW": [
        "RNUEVO"
      ],
      "QSAVE": [
        "GUARDARR",
        "GUARDAR"
      ],
      "SAVEAS": [
        "GUARDARCOMO"
      ],
      "OPEN": [
        "ABRE"
      ],
      "PASTECLIP": [
        "PEGAPP"
      ],
      "DIMSTYLE": [
        "ACOESTIL",
        "ACES",
        "ACOEST",
        "AES"
      ],
      "STYLE": [
        "ESTILO",
        "EST"
      ],
      "BLOCKSPALETTE": [
        "PALETABLOQUES"
      ],
      "PURGE": [
        "LIMPIA",
        "LI"
      ],
      "LAYER": [
        "CAPA",
        "CA"
      ],
      "LAYERCLOSE": [
        "CERRARCAPA"
      ],
      "PROPERTIES": [
        "PROPIEDADES",
        "PR"
      ],
      "PROPERTIESCLOSE": [
        "CERPROP"
      ],
      "UCS": [
        "SCP"
      ],
      "UCSICON": [
        "SIMBSCP"
      ],
      "PLAN": [
        "PLANTA"
      ],
      "ELEV": [
        "ELEV"
      ],
      "VPOINT": [
        "PTOVISTA"
      ],
      "-VPOINT": [
        "-PTOVISTA",
        "-PV"
      ],
      "VIEW": [
        "VISTA"
      ],
      "-VIEW": [
        "-VISTA"
      ],
      "3DORBIT": [
        "3DORBITA"
      ],
      "NAVVCUBE": [
        "NAVVCUBE"
      ],
      "UNITS": [
        "UNIDADES",
        "UNS"
      ],
      "LTSCALE": [
        "ESCALATL",
        "EC"
      ],
      "CLEANSCREENON": [
        "LIMPIAPANTACT"
      ],
      "CLEANSCREENOFF": [
        "LIMPIAPANTDES"
      ],
      "COLOR": [
        "COLOR"
      ],
      "-COLOR": [
        "-COLOR"
      ],
      "LINETYPE": [
        "TIPOLIN"
      ],
      "-LINETYPE": [
        "-TIPOLIN"
      ],
      "LWEIGHT": [
        "GROSORLIN"
      ],
      "-LWEIGHT": [
        "-GROSORLIN"
      ]
    },
    "keywords": {
      "-OSNAP": {
        "ENDpoint": "FINal",
        "MIDpoint": "MEDio",
        "CENter": "CENtro",
        "QUAdrant": "CUAdrante",
        "INTersection": "INTersección",
        "EXTension": "EXTensión",
        "INSertion": "INSerción",
        "PERpendicular": "PERpendicular",
        "TANgent": "TANgente",
        "NEArest": "CERcano",
        "APParent": "APP",
        "PARallel": "PARalelo",
        "NONe": "NINguno",
        "OFF": "DES"
      },
      "LINE": {
        "Close": "Cerrar",
        "Undo": "desHacer"
      },
      "PLINE": {
        "Arc": "Arco",
        "Line": "líNea",
        "Close": "Cerrar",
        "Undo": "desHacer"
      },
      "ARC": {
        "Center": "Centro"
      },
      "MOVE": {
        "Displacement": "Desplazamiento"
      },
      "COPY": {
        "Displacement": "Desplazamiento",
        "Exit": "Salir",
        "Undo": "desHacer"
      },
      "STRETCH": {
        "Displacement": "Desplazamiento"
      },
      "ARCSCE": {
        "Center": "Centro"
      },
      "CIRCLE": {
        "3P": "3P",
        "2P": "2P",
        "Ttr": "Ttr",
        "Diameter": "Diámetro"
      },
      "CIRCLED": {
        "3P": "3P",
        "2P": "2P",
        "Ttr": "Ttr"
      },
      "ELLIPSE": {
        "Arc": "Arco",
        "Center": "Centro",
        "Rotation": "Rotación",
        "Included angle": "ángulo Incluido"
      },
      "ELLIPSEC": {
        "Arc": "Arco",
        "Center": "Centro",
        "Rotation": "Rotación",
        "Included angle": "ángulo Incluido"
      },
      "ELLIPSEARC": {
        "Arc": "Arco",
        "Center": "Centro",
        "Rotation": "Rotación",
        "Included angle": "ángulo Incluido"
      },
      "SPLINE": {
        "Method": "Método",
        "Knots": "Nudos",
        "Degree": "Grado",
        "Fit": "Ajustar",
        "CV": "VC",
        "Chord": "Cuerda",
        "Square root": "Raíz cuadrada",
        "Uniform": "Uniforme",
        "start Tangency": "iniciar Tangencia",
        "end Tangency": "finalizar Tangencia",
        "Undo": "desHacer",
        "Close": "Cerrar"
      },
      "RECTANG": {
        "Elevation": "Elevación",
        "Thickness": "Alt-objeto"
      },
      "POLYGON": {
        "Type": "Tipo",
        "Inscribed": "Inscrito en el círculo",
        "Circumscribed": "Circunscrito alrededor del círculo"
      },
      "HATCH": {
        "Properties": "Propiedades",
        "Select objects": "Designar objetos"
      },
      "INSERT": {
        "Scale": "Escala",
        "Rotate": "Girar"
      },
      "ATTDEF": {
        "Invisible": "Invisible",
        "Constant": "Constante",
        "Verify": "Verificable",
        "Preset": "Predefinido",
        "Lock position": "Bloquear posición",
        "Justify": "jUstificar",
        "Style": "Estilo",
        "Left": "Izquierda",
        "Center": "Centro",
        "Right": "Derecha",
        "Middle": "Medio",
        "TL": "SIZ",
        "TC": "SC",
        "TR": "SD",
        "ML": "MI",
        "MC": "MC",
        "MR": "MD",
        "BL": "II",
        "BC": "IC",
        "BR": "ID"
      },
      "ATTDISP": {
        "Normal": "Normal",
        "ON": "ACT",
        "OFF": "DES"
      },
      "TEXT": {
        "Justify": "jUstificar",
        "Style": "Estilo",
        "Left": "Izquierda",
        "Center": "Centro",
        "Right": "Derecha",
        "Middle": "Medio",
        "TL": "SIZ",
        "TC": "SC",
        "TR": "SD",
        "ML": "MI",
        "MC": "MC",
        "MR": "MD",
        "BL": "II",
        "BC": "IC",
        "BR": "ID"
      },
      "MTEXT": {
        "Height": "Altura",
        "Justify": "Justificar",
        "Line spacing": "Interlineado",
        "Rotation": "Rotación",
        "Style": "Estilo",
        "Width": "aNchura",
        "TL": "SI",
        "TC": "SC",
        "TR": "SD",
        "ML": "MI",
        "MC": "MC",
        "MR": "MD",
        "BL": "II",
        "BC": "IC",
        "BR": "ID",
        "At least": "Mínimo",
        "Exactly": "Exactamente"
      },
      "TEXTEDIT": {
        "Undo": "desHacer",
        "Mode": "Modo",
        "Single": "Única",
        "Multiple": "Múltiple"
      },
      "DIMLINEAR": {
        "Text": "Texto",
        "Angle": "ángUlo",
        "Horizontal": "Horizontal",
        "Vertical": "Vertical",
        "Rotated": "Girar"
      },
      "DIMALIGNED": {
        "Text": "Texto",
        "Angle": "ángUlo"
      },
      "DIMRADIUS": {
        "Text": "Texto",
        "Angle": "ángUlo"
      },
      "DIMDIAMETER": {
        "Text": "Texto",
        "Angle": "ángUlo"
      },
      "DIMANGULAR": {
        "Text": "Texto",
        "Angle": "ángUlo"
      },
      "DIMBASELINE": {
        "Undo": "desHacer",
        "Select": "Designar"
      },
      "DIMCONTINUE": {
        "Undo": "desHacer",
        "Select": "Designar"
      },
      "DIMSPACE": {
        "Auto": "Auto"
      },
      "OFFSET": {
        "Through": "punto a Atravesar",
        "Erase": "Borrar",
        "Layer": "Capa",
        "Yes": "Sí",
        "No": "No",
        "Current": "Actual",
        "Source": "Origen",
        "Exit": "Salir",
        "Multiple": "Múltiple",
        "Undo": "Deshacer"
      },
      "ROTATE": {
        "Copy": "Copiar",
        "Reference": "Referencia"
      },
      "SCALE": {
        "Copy": "Copiar",
        "Reference": "Referencia"
      },
      "MIRROR": {
        "Yes": "Sí",
        "No": "No"
      },
      "ARRAYPOLAR": {
        "Rotate items": "Girar objetos",
        "Yes": "Sí",
        "No": "No"
      },
      "ARRAYPATH": {
        "Method": "Método",
        "Align items": "ALinear elementos",
        "Divide": "Dividir",
        "Measure": "Medir",
        "Yes": "Sí",
        "No": "No"
      },
      "TRIM": {
        "Undo": "desHacer"
      },
      "EXTEND": {
        "Undo": "desHacer"
      },
      "FILLET": {
        "Undo": "Deshacer",
        "Polyline": "Polilínea",
        "Radius": "RAdio",
        "Multiple": "múLtiple"
      },
      "CHAMFER": {
        "Undo": "desHacer",
        "Polyline": "Polilínea",
        "Distance": "Distancia",
        "Multiple": "múLtiple"
      },
      "BREAK": {
        "First point": "Primer punto"
      },
      "AREA": {
        "Undo": "desHacer"
      },
      "ZOOM": {
        "All": "Todo",
        "Extents": "Extensión",
        "Previous": "Previo",
        "Scale": "EScala",
        "Window": "Ventana",
        "Object": "Objeto"
      },
      "UCS": {
        "NAmed": "gUArdado",
        "OBject": "oBjeto",
        "Previous": "PRev",
        "View": "Vista",
        "World": "Univ",
        "X": "X",
        "Y": "Y",
        "Z": "Z",
        "ZAxis": "ejEZ",
        "Object": "Objeto",
        "Restore": "Rest",
        "Save": "Guardar",
        "Delete": "Supr",
        "Yes": "Sí",
        "No": "No"
      },
      "UCSICON": {
        "ON": "ACT",
        "OFF": "DES",
        "Noorigin": "Sin origen",
        "ORigin": "Origen"
      },
      "PLAN": {
        "Current ucs": "scp Actual",
        "Ucs": "SCP",
        "World": "Universal"
      },
      "VPOINT": {
        "Rotate": "Rotación"
      },
      "VIEW": {
        "Orthographic": "Ortogonal",
        "Top": "SUperior",
        "Bottom": "Inferior",
        "Front": "Frontal",
        "BAck": "Posterior",
        "Left": "IZquierda",
        "Right": "Derecha",
        "SWiso": "isoSO",
        "SEiso": "isoSE",
        "NEiso": "isoNE",
        "NWiso": "isoNO"
      },
      "NAVVCUBE": {
        "ON": "ACT",
        "OFF": "DES"
      },
      "COLOR": {
        "Truecolor": "COlorverdadero",
        "BYLAYER": "PORCAPA",
        "RED": "ROJO",
        "YELLOW": "AMARILLO",
        "GREEN": "VERDE",
        "CYAN": "CIÁN",
        "BLUE": "AZUL",
        "MAGENTA": "MAGENTA",
        "WHITE": "BLANCO"
      },
      "LINETYPE": {
        "Set": "Defina",
        "BYLAYER": "PORCAPA"
      },
      "LWEIGHT": {
        "BYLAYER": "PORCAPA"
      }
    },
    "promptKeywords": {
      "select2dPolylineOr": {
        "Radius": "Radio"
      }
    },
    "prompts": {
      "length": "Longitud",
      "angle": "Ángulo",
      "trackingOffset": "Desfase",
      "center": "Centro",
      "radius": "Radio",
      "diameter": "Diámetro",
      "firstPoint": "Primer punto",
      "secondPoint": "Segundo punto",
      "thirdPoint": "Tercer punto",
      "startPoint": "Punto inicial",
      "centerPoint": "Punto central",
      "endPoint": "Punto final",
      "axisEndpoint": "Punto final de eje",
      "otherAxisEndpoint": "Otro punto final de eje",
      "endpointOfAxis": "Punto final de eje",
      "distanceToOtherAxis": "Distancia de otro eje",
      "rotationAroundMajorAxis": "Rotación alrededor del eje mayor",
      "startAngle": "Ángulo inicial",
      "endAngle": "Ángulo final",
      "includedAngle": "Ángulo incluido",
      "splineStartTangent": "Precise tangente inicial",
      "splineEndTangent": "Precise tangente final",
      "splineCloseTangent": "Precise tangente",
      "splineDegree": "Indique grado de spline",
      "firstCorner": "Primer punto de esquina",
      "otherCorner": "Esquina opuesta",
      "rectangleElevation": "Precise la elevación de los rectángulos",
      "rectangleThickness": "Precise la altura de objeto de los rectángulos",
      "numberOfSides": "Número de lados",
      "internalPoint": "Precise punto interno",
      "patternName": "Indique nombre de patrón",
      "patternScale": "Precise escala de patrón",
      "patternAngle": "Precise ángulo de patrón",
      "blockName": "Indique nombre de bloque o [?]",
      "insertionBasePoint": "Precise punto base de inserción",
      "insertionPoint": "Precise punto de inserción",
      "insertScale": "Indique factor de escala",
      "insertRotation": "Precise ángulo de rotación",
      "attributeTag": "Indique nombre de identificador de atributo",
      "attributePrompt": "Indique solicitud de atributo",
      "attributeDefault": "Indique valor de atributo por defecto",
      "attributeValue": "Indique valor de atributo",
      "definitionTag": "Identificador",
      "definitionPrompt": "Solicitud",
      "definitionDefault": "Por defecto",
      "textStartPoint": "Precise punto inicial de texto",
      "textHeight": "Precise altura",
      "textRotation": "Precise ángulo de rotación de texto",
      "text": "Texto",
      "justify": "Justificar",
      "styleName": "Nombre de estilo",
      "mtextFirstCorner": "Precise la primera esquina",
      "mtextOppositeCorner": "Indique la esquina opuesta",
      "mtextRotation": "Precise ángulo de rotación",
      "mtextWidth": "Precise anchura",
      "mtextLineSpacing": "Indique factor o distancia de interlineado",
      "mtextLine": "TextoM",
      "firstExtensionOrigin": "Designe el origen de la primera línea de referencia o <designar objeto>",
      "secondExtensionOrigin": "Designe el origen de la segunda línea de referencia",
      "nextExtensionOrigin": "Designe un origen de la segunda línea de referencia",
      "dimensionLineLocation": "Designe ubicación de línea de cota",
      "dimensionLineAngle": "Precise ángulo de línea de cota",
      "dimensionText": "Indique texto de cota",
      "dimensionTextAngle": "Precise ángulo de texto de cota",
      "angleVertex": "Designe vértice del ángulo",
      "firstAngleEndpoint": "Designe primer extremo",
      "secondAngleEndpoint": "Designe segundo extremo",
      "dimensionArcLocation": "Designe ubicación del arco de línea de cota",
      "dimensionSpacing": "Indique valor",
      "offsetDistance": "Distancia de desfase",
      "basePoint": "Punto base",
      "distance": "Distancia",
      "rotationAngle": "Ángulo de rotación",
      "referenceAngle": "Ángulo de referencia",
      "newAngle": "Nuevo ángulo",
      "scaleFactor": "Factor de escala",
      "referenceLength": "Longitud de referencia",
      "newLength": "Longitud nueva",
      "mirrorFirstPoint": "Primer punto de línea de simetría",
      "mirrorSecondPoint": "Segundo punto de línea de simetría",
      "columns": "Columnas",
      "rows": "Filas",
      "columnSpacing": "Distancia entre columnas",
      "rowSpacing": "Distancia entre filas",
      "items": "Elementos",
      "fillAngle": "Ángulo de relleno",
      "spacing": "Intervalo",
      "filletRadius": "Radio de empalme",
      "firstDistance": "Primera distancia de chaflán",
      "secondDistance": "Segunda distancia de chaflán",
      "clipboardBasePoint": "Precise punto base",
      "lengthen": "Alargar",
      "move": "Desplazar",
      "bulge": "Curvatura",
      "ucsOrigin": "Indique origen de SCP",
      "ucsXAxisPoint": "Precise punto en eje X o <Aceptar>",
      "ucsXYPlanePoint": "Precise punto en plano XY o <Aceptar>",
      "ucsRotationX": "Precise ángulo de rotación sobre eje X",
      "ucsRotationY": "Precise ángulo de rotación sobre eje Y",
      "ucsRotationZ": "Precise ángulo de rotación sobre eje Z",
      "ucsZAxisOrigin": "Precise nuevo punto de origen <0,0,0>",
      "ucsZAxisPoint": "Precise punto en parte positiva del eje Z",
      "ucsNamedOption": "Indique una opción [Rest/Guardar/Supr/?]",
      "ucsRestoreName": "Indique nombre de SCP para restaurarlo o [?]",
      "ucsSaveName": "Indique nombre para guardar SCP actual o [?]",
      "ucsDeleteNames": "Indique el nombre del SCP que se suprimirá <ninguno>",
      "ucsListNames": "Indique nombre(s) del SCP que enumerar <*>",
      "planUcsName": "Indique nombre de SCP o [?]",
      "elevDefaultElevation": "Precise nueva elevación por defecto",
      "elevDefaultThickness": "Precise nueva altura de objeto por defecto",
      "ltscaleFactor": "Indique nuevo factor de escala de tipo de línea",
      "osnapModes": "Indique una lista de modo de referencia a objetos",
      "defaultObjectColor": "Indique color de objeto por defecto [COlorverdadero]",
      "trueColor": "Rojo, Verde, Azul",
      "linetypeOption": "Indique una opción [?/Defina]",
      "linetypeName": "Precise nombre de tipo de línea o [?]",
      "defaultLineweight": "Indique grosor de línea por defecto para objetos nuevos o [?]",
      "idPoint": "Precise punto",
      "viewPoint": "Precise un punto de vista",
      "viewAngleInPlane": "Ángulo a partir del eje X en el plano XY",
      "viewAngleFromPlane": "Ángulo a partir del plano XY",
      "specifyFirstPoint": "Precise primer punto",
      "specifyNextPointOr": "Precise punto siguiente o",
      "specifyStartPoint": "Precise punto inicial",
      "specifyEndpointOfArcOr": "Precise punto final de arco (mantenga pulsada Ctrl para cambiar de dirección) o",
      "specifyCenterPointForCircleOr": "Precise punto central para círculo o",
      "specifyRadiusOfCircleOr": "Precise radio de círculo o",
      "specifyRadiusOfCircle": "Precise radio de círculo",
      "specifyDiameterOfCircle": "Precise diámetro de círculo",
      "specifyFirstEndPointOfDiameter": "Precise primer punto final del diámetro del círculo",
      "specifySecondEndPointOfDiameter": "Precise segundo punto final del diámetro del círculo",
      "specifyFirstPointOnCircle": "Precise primer punto del círculo",
      "specifySecondPointOnCircle": "Precise segundo punto del círculo",
      "specifyThirdPointOnCircle": "Precise tercer punto del círculo",
      "specifyFirstTangentOfCircle": "Precise punto en objeto para la primera tangente del círculo",
      "specifySecondTangentOfCircle": "Precise punto en objeto para la segunda tangente del círculo",
      "specifySecondPoint": "Precise segundo punto",
      "specifyFirstCornerPointOr": "Precise primer punto de esquina o",
      "specifyOtherCornerPoint": "Precise otro punto de esquina",
      "specifyStartPointOfArcOr": "Precise punto inicial del arco o",
      "specifySecondPointOfArcOr": "Precise segundo punto de arco o",
      "specifyEndPointOfArc": "Precise punto final del arco",
      "specifyCenterPointOfArc": "Precise punto central del arco",
      "specifyStartPointOfArc": "Precise punto inicial del arco",
      "specifyEndPointOfArcCtrl": "Precise punto final del arco (mantenga pulsada Ctrl para cambiar de dirección)",
      "selectObjects": "Designe objetos",
      "specifyBasePointOr": "Precise punto base o",
      "specifyDisplacement": "Precise desplazamiento",
      "specifySecondPointOr": "Precise segundo punto o",
      "useFirstPointAsDisplacement": "usar primer punto como desplazamiento",
      "copySecondPointOr": "Precise el segundo punto o",
      "specifyBasePoint": "Precise punto base",
      "specifyRotationAngleOr": "Precise ángulo de rotación o",
      "specifyTheReferenceAngle": "Precise ángulo de referencia",
      "specifyTheNewAngle": "Precise el nuevo ángulo",
      "specifyScaleFactorOr": "Precise factor de escala o",
      "specifyReferenceLength": "Precise longitud de referencia",
      "specifyNewLength": "Precise nueva longitud",
      "specifyFirstPointOfMirrorLine": "Precise primer punto de línea de simetría",
      "specifySecondPointOfMirrorLine": "Precise segundo punto de línea de simetría",
      "eraseSourceObjects": "¿Borrar objetos de origen?",
      "selectSourceOrMultipleToJoin": "Designe un objeto de origen o varios objetos para unirlos a la vez",
      "selectObjectsToJoin": "Seleccione objetos para unir",
      "specifyOffsetDistanceOr": "Precise distancia de desfase o",
      "selectObjectToOffsetOr": "Designe objeto a desplazar o",
      "specifyPointOnSideToOffsetOr": "Precise punto en lado de desplazamiento o",
      "eraseSourceObjectAfterOffsetting": "¿Borrar objeto de origen después del desfase?",
      "enterLayerOptionForOffsetObjects": "Indique opción de capa para objetos desfasados",
      "specifyThroughPointOr": "Precise punto a atravesar o",
      "nextObject": "siguiente objeto",
      "selectObjectToTrimOrShiftSelectToExtend": "Seleccione un objeto que recortar o use la tecla Mayús y seleccione para alargar",
      "selectObjectToExtendOrShiftSelectToTrim": "Seleccione un objeto que alargar o use la tecla Mayús y seleccione para recortar",
      "selectObjectToTrimOrShiftSelectToExtendOr": "Seleccione un objeto que recortar o use la tecla Mayús y seleccione para alargar, o",
      "selectObjectToExtendOrShiftSelectToTrimOr": "Seleccione un objeto que alargar o use la tecla Mayús y seleccione para recortar, o",
      "selectFirstObjectOr": "Designe el primer objeto o",
      "selectSecondObjectOrApplyCornerOr": "Designe segundo objeto o use la tecla Mayús para aplicar esquina o",
      "specifyFilletRadius": "Precise radio de empalme",
      "select2dPolylineOr": "Designe polilínea 2D o",
      "selectFirstLineOr": "Designe la primera línea o",
      "selectSecondLineOrApplyCornerOr": "Designe segunda línea o use la tecla Mayús para aplicar esquina o",
      "specifyFirstChamferDistance": "Precise primera distancia de chaflán",
      "specifySecondChamferDistance": "Precise segunda distancia de chaflán"
    },
    "format": {
      "idle": "Comando",
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
      "snapOverride": [
        [
          "snap"
        ],
        [
          "preposition",
          1,
          {
            "to": " a",
            "of": " de",
            "other": ""
          }
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
      "keywordSeparator": "/",
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
      "polar": "Dist<Ang"
    },
    "messages": {
      "unknownCommand": [
        "Comando \"",
        [
          "name"
        ],
        "\" desconocido."
      ],
      "cancel": "*Cancelar*",
      "rotateSettings": "Ángulo actual positivo en SCP:  ANGDIR=en sentido horario inverso  ANGBASE=0",
      "trimExtendSettings": "Parámetros actuales: Proyección=SCP, Arista=Ninguno, Modo=Rápido",
      "filletSettings": [
        "Parámetros actuales: Modo = Recortar, Radio = ",
        [
          "radius"
        ]
      ],
      "chamferSettings": [
        "(Modo Recortar) Primera distancia de chaflán actual = ",
        [
          "dist1"
        ],
        ", Segunda distancia = ",
        [
          "dist2"
        ]
      ],
      "offsetSettings": [
        "Parámetros actuales: Borrar origen=",
        [
          "erase",
          1,
          {
            "yes": "Sí",
            "other": "No"
          }
        ],
        "  Capa=",
        [
          "layer",
          1,
          {
            "current": "Actual",
            "other": "Origen"
          }
        ],
        "  OFFSETGAPTYPE=0"
      ],
      "rotatingCopy": "Girando una copia de los objetos designados.",
      "scalingCopy": "Ajustando la escala de una copia de los objetos designados.",
      "objectsFound": [
        [
          "box",
          1,
          {
            "yes": "Designe esquina opuesta: ",
            "other": ""
          }
        ],
        [
          "found"
        ],
        " encontrados",
        [
          "removed",
          2,
          {
            "=0": "",
            "other": [
              ", ",
              0,
              " eliminados"
            ]
          }
        ],
        [
          "hasTotal",
          1,
          {
            "yes": [
              ", ",
              [
                "total"
              ],
              " total"
            ],
            "other": ""
          }
        ]
      ],
      "copyModeMultiple": "Parámetros actuales:  modo de copia = Múltiple",
      "stretchSelection": "Designe objetos que estirar mediante ventana de captura o polígono de captura...",
      "currentLineWidth": [
        "El grosor de la línea actual es ",
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
              0,
              " objeto borrado."
            ],
            "other": [
              0,
              " objetos borrados."
            ]
          }
        ]
      ],
      "snapMode": [
        [
          "state",
          1,
          {
            "on": "Modo Forzcursor activado.",
            "other": "Modo Forzcursor desactivado."
          }
        ]
      ],
      "fromNeedsPoint": "DESDE necesita una solicitud de punto.",
      "fromBase": "DESDE: precise el punto base.",
      "fromOffset": "DESDE: desfase desde el punto base.",
      "angleOverride": [
        "Modo momentáneo de ángulo: ",
        [
          "angle"
        ]
      ],
      "saveUnavailable": "Guardar en un archivo no está disponible aquí.",
      "openUnavailable": "Abrir un archivo no está disponible aquí.",
      "openFailed": "No se ha podido abrir el archivo.",
      "fileError": {
        "invalidJson": "El archivo no es un JSON válido.",
        "unrecognised": "Archivo de dibujo no reconocido.",
        "notADrawing": "Este archivo no es un dibujo de MellowCAD.",
        "newerVersion": "Este dibujo se creó con una versión más reciente de MellowCAD. Actualice para abrirlo."
      },
      "clipboardEmpty": "No hay nada en el portapapeles.",
      "noUnusedBlocks": "No hay bloques sin usar.",
      "blocksPurged": [
        [
          "count",
          2,
          {
            "one": [
              0,
              " bloque limpiado."
            ],
            "other": [
              0,
              " bloques limpiados."
            ]
          }
        ]
      ],
      "noBlocks": "No hay bloques definidos.",
      "blockUndefined": [
        "El bloque \"",
        [
          "name"
        ],
        "\" no está definido."
      ],
      "hatchPatternUnknown": [
        "Patrón de sombreado \"",
        [
          "name"
        ],
        "\" desconocido."
      ],
      "hatchTooDense": "El intervalo de sombreado es demasiado denso o el trazo demasiado pequeño.",
      "hatchNoBoundary": "No se ha encontrado un contorno de sombreado válido.",
      "textStyleUndefined": [
        "El estilo de texto \"",
        [
          "name"
        ],
        "\" no está definido."
      ],
      "textJustifyOptions": [
        "Indique una opción [",
        [
          "keywords"
        ],
        "]:"
      ],
      "attributeModes": [
        "Modos de atributo actuales:  Invisible=",
        [
          "invisible",
          1,
          {
            "yes": "S",
            "other": "N"
          }
        ],
        "  Constante=",
        [
          "constant",
          1,
          {
            "yes": "S",
            "other": "N"
          }
        ],
        "  Verificable=",
        [
          "verify",
          1,
          {
            "yes": "S",
            "other": "N"
          }
        ],
        "  Predefinido=",
        [
          "preset",
          1,
          {
            "yes": "S",
            "other": "N"
          }
        ],
        "  Bloquear posición=",
        [
          "lockPosition",
          1,
          {
            "yes": "S",
            "other": "N"
          }
        ]
      ],
      "enterAttributeValues": "Indique los valores de atributo",
      "verifyAttributeValues": "Verifique los valores de atributo",
      "explodeRejected": [
        [
          "count",
          2,
          {
            "one": [
              0,
              " no se ha podido descomponer."
            ],
            "other": [
              0,
              " no se han podido descomponer."
            ]
          }
        ]
      ],
      "currentUcsName": [
        "Nombre de scp actual: ",
        [
          "kind",
          1,
          {
            "world": "*UNIVERSAL*",
            "unnamed": "*SIN NOMBRE*",
            "other": [
              [
                "name"
              ]
            ]
          }
        ]
      ],
      "savedUcsHeader": "Sistemas de coordenadas guardados:",
      "savedUcsEntry": [
        [
          "name"
        ],
        "\nOrigen = <",
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
        ">, Eje X = <",
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
        ">\n    Eje Y = <",
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
        ">, Eje Z = <",
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
        "No se encuentra el SCP ",
        [
          "name"
        ],
        "."
      ],
      "rectangleModes": [
        "Modos de rectángulo actuales:",
        [
          "hasElevation",
          1,
          {
            "yes": [
              " Elevación=",
              [
                "elevation"
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
              " Alt-objeto=",
              [
                "thickness"
              ]
            ],
            "other": ""
          }
        ]
      ],
      "distanceReport": [
        "Distancia = ",
        [
          "distance"
        ],
        ",  Ángulo en plano XY = ",
        [
          "angleInPlane"
        ],
        ",  Ángulo desde plano XY = ",
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
        "X = ",
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
      "linesNonCoplanar": "Las líneas no son coplanares.",
      "cornersSkipped": [
        [
          "parallel",
          2,
          {
            "=0": "",
            "one": [
              0,
              " era paralela    "
            ],
            "other": [
              0,
              " eran paralelas    "
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
              " era demasiado corta    "
            ],
            "other": [
              0,
              " eran demasiado cortas    "
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
              " era divergente    "
            ],
            "other": [
              0,
              " eran divergentes    "
            ]
          }
        ]
      ],
      "invalid": "*No válido*",
      "commandCompletelyUndone": "Se ha deshecho completamente el comando.",
      "linesParallel": "Las líneas son paralelas",
      "linesDiverge": "Las líneas divergen",
      "filletRadiusTooLarge": "El radio de empalme es demasiado grande",
      "chamferDistanceTooLarge": "La distancia de chaflán es demasiado grande",
      "linesChamfered": [
        [
          "count",
          2,
          {
            "one": [
              "Se ha achaflanado ",
              0,
              " línea"
            ],
            "other": [
              "Se han achaflanado ",
              0,
              " líneas"
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
              "Se ha empalmado ",
              0,
              " línea"
            ],
            "other": [
              "Se han empalmado ",
              0,
              " líneas"
            ]
          }
        ]
      ],
      "nothingJoined": [
        "0 objetos unidos, ",
        [
          "count",
          2,
          {
            "one": [
              0,
              " objeto descartado"
            ],
            "other": [
              0,
              " objetos descartados"
            ]
          }
        ],
        " de la operación"
      ],
      "currentViewDirection": [
        "Dirección de vista actual:  VIEWDIR=",
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
      "regeneratingModel": "Regenerando modelo.",
      "currentOsnapModes": [
        "Modos de referencia a objetos actuales: ",
        [
          "modes"
        ]
      ],
      "currentLineweight": [
        "Grosor de línea actual: ",
        [
          "value"
        ]
      ],
      "pointingEdgeOn": "No se puede señalar en un SCP visto de canto.",
      "circleDoesNotExist": "El círculo no existe."
    },
    "feedback": {
      "snap": {
        "endpoint": "Punto final",
        "midpoint": "Punto medio",
        "center": "Centro",
        "intersection": "Intersección",
        "apparentIntersection": "Intersección ficticia",
        "perpendicular": "Perpendicular",
        "tangent": "Tangente",
        "insertion": "Inserción",
        "extension": "Extensión",
        "parallel": "Paralelo",
        "quadrant": "Cuadrante",
        "nearest": "Cercano"
      },
      "polar": [
        "Polar: ",
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
        "Polar: ",
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
      "measureDistance": [
        "Dist  ",
        [
          "value"
        ],
        " ",
        [
          "unit"
        ]
      ],
      "measureAngle": [
        "Áng   ",
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
        "Área  ",
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
        "Perím ",
        [
          "value"
        ],
        " ",
        [
          "unit"
        ]
      ],
      "measureHint": [
        "[",
        [
          "undo"
        ],
        "] deshacer  [Intro] terminar"
      ]
    },
    "keywordLabels": {
      "CIRCLE": {
        "Ttr": "Ttr (Tangente tangente radio)"
      },
      "CIRCLED": {
        "Ttr": "Ttr (Tangente tangente radio)"
      }
    },
    "listing": {
      "hatchPattern": [
        [
          "name"
        ],
        "  ",
        [
          "description"
        ]
      ],
      "hatchPatternDescription": {
        "SOLID": "Relleno sólido",
        "ANSI31": "ANSI hierro, ladrillo, mampostería de piedra"
      }
    },
    "defaults": {
      "layer": [
        "Capa",
        [
          "n"
        ]
      ],
      "copyOf": [
        "Copia de ",
        [
          "name"
        ]
      ],
      "fileName": [
        "dibujo-",
        [
          "date"
        ]
      ]
    }
  }
}
