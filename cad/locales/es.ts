// Generated from es.json by `npm run locales`. Do not edit.
import type { EngineLocale } from "./types"

export const es: EngineLocale = {
  "tag": "es",
  "interface": {
    "tool": {
      "select": "Seleccionar",
      "line": "Línea",
      "polyline": "Polilínea",
      "polyline3d": "Polilínea 3D",
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
      "splinedit": "Editar spline",
      "pedit": "Editar polilínea",
      "splinefit": "Ajuste de spline",
      "splinecv": "VC de spline",
      "rectangle": "Rectángulo",
      "polygon": "Polígono",
      "hatch": "Sombreado",
      "block": "Crear bloque",
      "insert": "Insertar bloque",
      "attedit": "Editar atributos",
      "attdef": "Definir atributos",
      "attdisp": "Visualizar atributos",
      "purge": "Limpiar",
      "text": "Texto",
      "mtext": "Texto de líneas múltiples",
      "textedit": "Editar texto",
      "dimlinear": "Lineal",
      "dimaligned": "Alineada",
      "dimhorizontal": "Horizontal",
      "dimvertical": "Vertical",
      "dimrotated": "Girada",
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
      "arraycommand": "Matriz",
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
      "breakatpoint": "Partir en un punto",
      "matchprop": "Igualar propiedades",
      "chprop": "Cambiar propiedades",
      "copyclip": "Copiar",
      "cutclip": "Cortar",
      "copybase": "Copiar con punto base",
      "paste": "Pegar",
      "measure": "Medir",
      "measurearea": "Área",
      "id": "Coordenadas punto",
      "list": "Lista",
      "massprop": "Propiedades físicas y de región",
      "zoom": "Zoom",
      "pan": "Encuadre",
      "dashpan": "Encuadre por puntos",
      "dashdimstyle": "Estilo de cota (línea de comando)",
      "ucs": "SCP",
      "ucsicon": "Icono SCP",
      "fill": "Rellenar",
      "ucsiconvariable": "Icono SCP (variable)",
      "plan": "Vista en planta",
      "elev": "Elevación",
      "vpoint": "Punto de vista",
      "view": "Vistas predefinidas",
      "orbit": "Órbita 3D",
      "navvcube": "ViewCube",
      "ltscale": "Escala de tipo de línea",
      "auprec": "Precisión de ángulos",
      "setvar": "Variables de sistema",
      "undo": "Deshacer",
      "mredo": "Rehacer varias",
      "osnap": "Modos de referencia a objetos",
      "color": "Color",
      "linetype": "Tipo de línea",
      "lweight": "Grosor de línea",
      "snap": "Modo Forzcursor",
      "region": "Región",
      "union": "Unión",
      "subtract": "Diferencia",
      "box": "Prisma rectangular",
      "wedge": "Cuña",
      "pyramid": "Pirámide",
      "cylinder": "Cilindro",
      "cone": "Cono",
      "sphere": "Esfera",
      "torus": "Toroide",
      "intersect": "Intersección",
      "extrude": "Extruir",
      "revolve": "Revolución"
    },
    "description": {
      "U": "Deshacer la última acción",
      "REDO": "Rehacer la última acción deshecha",
      "SNAP": "Restringir el cursor a los intervalos de resolución",
      "-OSNAP": "Establece los modos de referencia a objetos en ejecución",
      "FROM": "Designar un punto desfasado de un punto base",
      "NEW": "Iniciar un dibujo nuevo",
      "QNEW": "Iniciar un dibujo nuevo",
      "QSAVE": "Guardar el dibujo en un archivo",
      "SAVEAS": "Guardar el dibujo en un archivo con otro nombre",
      "SAVE": "Guardar el dibujo en un archivo",
      "OPEN": "Abrir un archivo de dibujo",
      "PASTECLIP": "Pegar el portapapeles en el dibujo",
      "DIMSTYLE": "Crear y modificar estilos de cota",
      "STYLE": "Crear y modificar estilos de texto",
      "INSERT": "Insertar un bloque desde la paleta de bloques",
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
      "polyline3d": [
        [
          "count",
          2,
          {
            "one": "Polilínea 3D",
            "other": "Polilíneas 3D"
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
      ],
      "solid3d": [
        [
          "count",
          2,
          {
            "one": "Sólido 3D",
            "other": "Sólidos 3D"
          }
        ]
      ],
      "region": [
        [
          "count",
          2,
          {
            "one": "Región",
            "other": "Regiones"
          }
        ]
      ]
    },
    "array": {
      "rectangular": "Matriz (rectangular)",
      "polar": "Matriz (polar)",
      "path": "Matriz (de ruta)"
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
          "Todos (",
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
        "linearDimension": "Cota girada",
        "alignedDimension": "Cota alineada",
        "angularDimension": "Cota angular",
        "radiusDimension": "Cota radial",
        "diameterDimension": "Cota diamétrica"
      },
      "group": {
        "geometry": "Geometría",
        "solidHistory": "Historial de sólido",
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
        "dataPoints": "Puntos auxiliares",
        "selection": "Selección",
        "linesArrows": "Líneas y flechas",
        "fit": "Ajustar",
        "primaryUnits": "Unidades principales"
      },
      "row": {
        "length": "Longitud",
        "angle": "Ángulo",
        "deltaX": "Incremento X",
        "deltaY": "Incremento Y",
        "deltaZ": "Incremento Z",
        "startX": "Inicio X",
        "startY": "Inicio Y",
        "startZ": "Inicio Z",
        "endX": "Fin X",
        "endY": "Fin Y",
        "endZ": "Fin Z",
        "centerX": "Centro X",
        "centerY": "Centro Y",
        "centerZ": "Centro Z",
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
        "totalAngle": "Ángulo total",
        "arcLength": "Longitud de arco",
        "majorRadius": "Radio mayor",
        "minorRadius": "Radio menor",
        "radiusRatio": "Relación del radio",
        "majorAxisVectorX": "Vector de radio mayor X",
        "majorAxisVectorY": "Vector de radio mayor Y",
        "majorAxisVectorZ": "Vector de radio mayor Z",
        "minorAxisVectorX": "Vector de eje menor X",
        "minorAxisVectorY": "Vector de eje menor Y",
        "minorAxisVectorZ": "Vector de eje menor Z",
        "vertices": "Vértices",
        "segments": "Segmentos",
        "solidType": "Tipo de sólido",
        "baseRadius": "Radio de base",
        "topRadius": "Radio superior",
        "sides": "Lados",
        "elliptical": "Elíptico",
        "baseMajorRadius": "Radio mayor de base",
        "baseMinorRadius": "Radio menor de base",
        "topMajorRadius": "Radio mayor superior",
        "topMinorRadius": "Radio menor superior",
        "torusRadius": "Radio de toroide",
        "tubeRadius": "Radio de sección",
        "currentVertex": "Vértice actual",
        "vertex": "Vértice",
        "startSegmentWidth": "Anchura inicial del segmento",
        "endSegmentWidth": "Anchura final del segmento",
        "globalWidth": "Grosor global",
        "closed": "Cerrado",
        "contents": "Contenido",
        "justify": "Justificar",
        "height": "Altura",
        "history": "Historial",
        "rotation": "Rotación",
        "lineSpaceFactor": "Factor de espacio de línea",
        "lineSpaceDistance": "Distancia de espacio de línea",
        "lineSpaceStyle": "Estilo de espacio de línea",
        "definedWidth": "Anchura definida",
        "textHeight": "Altura de texto",
        "textAlignmentX": "Alineación de texto X",
        "textAlignmentY": "Alineación de texto Y",
        "textAlignmentZ": "Alineación de texto Z",
        "measurement": "Medidas",
        "textOverride": "Modificar texto",
        "type": "Tipo",
        "vertexX": "Vértice X",
        "vertexY": "Vértice Y",
        "vertexZ": "Vértice Z",
        "fitSmooth": "Ajustar/Suavizar",
        "firstX": "Primero X",
        "firstY": "Primero Y",
        "secondX": "Segundo X",
        "secondY": "Segundo Y",
        "pattern": "Patrón",
        "scale": "Escala",
        "boundaries": "Contornos",
        "patternName": "Nombre de patrón",
        "annotative": "Anotativo",
        "originX": "Origen X",
        "originY": "Origen Y",
        "associative": "Asociativo",
        "islandDetectionStyle": "Estilo de detección de islas",
        "cumulativeArea": "Área acumulada",
        "name": "Nombre",
        "tag": "Identificador",
        "prompt": "Solicitud",
        "value": "Valor",
        "invisible": "Invisible",
        "constant": "Constante",
        "verify": "Verificar",
        "preset": "Prestablecer",
        "lockPosition": "Bloquear posición",
        "method": "Método",
        "degree": "Grado",
        "knotParameterization": "Parametrización de nudos",
        "numberOfFitPoints": "Número de puntos de ajuste",
        "currentFitPoint": "Punto de ajuste actual",
        "fitPointX": "Punto de ajuste X",
        "fitPointY": "Punto de ajuste Y",
        "fitPointZ": "Punto de ajuste Z",
        "numberOfControlPoints": "Número de puntos de apoyo",
        "currentControlPoint": "Punto de apoyo actual",
        "controlPointX": "Punto de apoyo X",
        "controlPointY": "Punto de apoyo Y",
        "controlPointZ": "Punto de apoyo Z",
        "weight": "Peso",
        "width": "Anchura",
        "cvFrame": "Marco de vértices de control",
        "periodic": "Periódica",
        "planar": "Plana",
        "startTangentVectorX": "Inicio vector de tangente X",
        "startTangentVectorY": "Inicio vector de tangente Y",
        "startTangentVectorZ": "Inicio vector de tangente Z",
        "endTangentVectorX": "Vector de tangente final X",
        "endTangentVectorY": "Vector de tangente final Y",
        "endTangentVectorZ": "Vector de tangente final Z",
        "fitTolerance": "Ajustar tolerancia",
        "positionX": "Posición X",
        "positionY": "Posición Y",
        "positionZ": "Posición Z",
        "scaleX": "Escala X",
        "scaleY": "Escala Y",
        "scaleZ": "Escala Z",
        "showHistory": "Mostrar historial",
        "baseX": "Base X",
        "baseY": "Base Y",
        "baseZ": "Base Z",
        "pathLength": "Longitud de trayectoria",
        "columns": "Columnas",
        "columnSpacing": "Espacio entre columnas",
        "rows": "Filas",
        "rowSpacing": "Espacio entre filas",
        "rowElevationIncrement": "Incremento de elevación de fila",
        "levels": "Niveles",
        "levelSpacing": "Espaciado de niveles",
        "includedAxisAngle": "Incluye el ángulo de eje",
        "direction": "Dirección",
        "items": "Elementos",
        "angleBetweenItems": "Ángulo entre elementos",
        "fillAngle": "Ángulo de relleno",
        "rotateItems": "Girar objetos",
        "itemSpacing": "Espaciado entre elementos",
        "alignItems": "Alinear elementos",
        "arrowSize": "Tamaño de flecha",
        "centerMarkSize": "Tamaño de marca de centro",
        "extLineExt": "Ext de línea de extensión",
        "extLineOffset": "Desfase de línea de extensión",
        "textOffset": "Desfase de texto",
        "textPositionX": "Posición de texto X",
        "textPositionY": "Posición de texto Y",
        "textRotation": "Rotación de texto",
        "dimScaleOverall": "Escala de cota general",
        "decimalSeparator": "Separador decimal",
        "suppressTrailingZeros": "Suprimir ceros a la derecha",
        "precision": "Precisión",
        "perimeter": "Perímetro"
      },
      "value": {
        "yes": "Sí",
        "no": "No",
        "none": "—",
        "fitNone": "Ninguna",
        "atLeast": "Mínimo",
        "exactly": "Exactamente",
        "fitPoints": "Ajustar",
        "controlVertices": "Vértices de control",
        "box": "Prisma",
        "wedge": "Cuña",
        "pyramid": "Pirámide",
        "inscribed": "Inscrito",
        "circumscribed": "Circunscrito",
        "cylinder": "Cilindro",
        "cone": "Cono",
        "sphere": "Esfera",
        "torus": "Toroide",
        "chord": "Cuerda",
        "sqrtChord": "RaízcuadradaCuerda",
        "uniform": "Uniforme",
        "custom": "Personalizado",
        "show": "Mostrar",
        "hide": "Ocultar",
        "counterClockwise": "En el sentido antihorario",
        "clockwise": "En el sentido horario",
        "divide": "Dividir",
        "historyNone": "Ninguno",
        "measure": "Medir",
        "predefined": "Predefinido",
        "outer": "Exterior",
        "extrusion": "Extrusión",
        "revolve": "Revolución"
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
      "3DPOLY": [
        "3DPOL",
        "3P"
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
      "SPLINEDIT": [
        "EDITSPLINE",
        "SPE"
      ],
      "PEDIT": [
        "EDITPOL",
        "PE"
      ],
      "RECTANG": [
        "RECTANG",
        "REC",
        "RECTANGLE"
      ],
      "POLYGON": [
        "POLIGONO",
        "PG"
      ],
      "HATCH": [
        "SOMBREA",
        "SB",
        "SMB",
        "-SMB"
      ],
      "-HATCH": [
        "-SOMBREA"
      ],
      "BLOCK": [
        "BLOQUE",
        "BQ",
        "MODBLQ",
        "ACADBLOCKDIALOG",
        "BMAKE",
        "BMOD"
      ],
      "-BLOCK": [
        "-BLOQUE",
        "-BQ"
      ],
      "INSERT": [
        "INSERT",
        "IN"
      ],
      "-INSERT": [
        "-INSERT",
        "-IN"
      ],
      "ATTEDIT": [
        "ATREDIT",
        "ATR",
        "DDATTE"
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
        "T",
        "TEXTODIN"
      ],
      "-TEXT": [
        "-TEXTO"
      ],
      "MTEXT": [
        "TEXTOM",
        "TXM",
        "MTEXT"
      ],
      "-MTEXT": [
        "-TEXTOM",
        "-TXM"
      ],
      "TEXTEDIT": [
        "EDITARTEXTO",
        "ED",
        "DDEDIC",
        "TEDIT"
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
      "DIMHORIZONTAL": [
        "ACOHORIZONTAL"
      ],
      "DIMVERTICAL": [
        "ACOVERTICAL"
      ],
      "DIMROTATED": [
        "ACOGIRADA"
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
        "ACOANGULAR",
        "ACOANG"
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
      "ARRAY": [
        "MATRIZ",
        "MA"
      ],
      "ARRAYRECT": [
        "MATRIZRECTANG"
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
        "COPIARPROP"
      ],
      "CHPROP": [
        "CAMBPROP"
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
      "LIST": [
        "LIST",
        "LS",
        "LT"
      ],
      "MASSPROP": [
        "PROPFIS"
      ],
      "ZOOM": [
        "ZOOM",
        "Z"
      ],
      "PAN": [
        "ENCUADRE",
        "E"
      ],
      "-PAN": [
        "-ENCUADRE",
        "-E"
      ],
      "ERASE": [
        "BORRA",
        "B",
        "DELETE"
      ],
      "U": [
        "H"
      ],
      "UNDO": [
        "DESHACER"
      ],
      "REDO": [
        "REHACER"
      ],
      "MREDO": [
        "MREHACER"
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
        "GUARDARR"
      ],
      "SAVEAS": [
        "GUARDARCOMO"
      ],
      "SAVE": [
        "GUARDAR",
        "GUARDARURL"
      ],
      "OPEN": [
        "ABRE",
        "ABREURL"
      ],
      "PASTECLIP": [
        "PEGAPP"
      ],
      "DIMSTYLE": [
        "ACOESTIL",
        "ACES",
        "ACOEST",
        "AES",
        "DCOTA"
      ],
      "-DIMSTYLE": [
        "-ACOESTIL"
      ],
      "STYLE": [
        "ESTILO",
        "EST",
        "ESTILODD"
      ],
      "BLOCKSPALETTE": [
        "PALETABLOQUES"
      ],
      "PURGE": [
        "LIMPIA",
        "LI"
      ],
      "-PURGE": [
        "-LIMPIA",
        "-LI"
      ],
      "LAYER": [
        "CAPA",
        "CA",
        "LAYER",
        "DDLMODES"
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
      "FILL": [
        "RELLENAR"
      ],
      "PLAN": [
        "PLANTA"
      ],
      "ELEV": [
        "ELEV"
      ],
      "VPOINT": [
        "PTOVISTA",
        "PV",
        "DDVPOINT"
      ],
      "-VPOINT": [
        "-PTOVISTA",
        "-PV"
      ],
      "VIEW": [
        "VISTA",
        "VI"
      ],
      "-VIEW": [
        "-VISTA",
        "-VI"
      ],
      "3DORBIT": [
        "3DORBITA",
        "3DO",
        "ORBIT"
      ],
      "NAVVCUBE": [
        "NAVVCUBE",
        "CUBE"
      ],
      "UNITS": [
        "UNIDADES",
        "UNS",
        "DDUNITS"
      ],
      "LTSCALE": [
        "ESCALATL",
        "EC"
      ],
      "AUPREC": [
        "AUPREC"
      ],
      "SETVAR": [
        "MODIVAR",
        "MV"
      ],
      "CLEANSCREENON": [
        "LIMPIAPANTACT"
      ],
      "CLEANSCREENOFF": [
        "LIMPIAPANTDES"
      ],
      "COLOR": [
        "COLOR",
        "COL"
      ],
      "-COLOR": [
        "-COLOR"
      ],
      "LINETYPE": [
        "TIPOLIN",
        "TL",
        "TLINEA",
        "DDLTYPE"
      ],
      "-LINETYPE": [
        "-TIPOLIN",
        "-TL",
        "-TLINEA"
      ],
      "LWEIGHT": [
        "GROSORLIN",
        "LINEWEIGHT"
      ],
      "-LWEIGHT": [
        "-GROSORLIN"
      ],
      "BOX": [
        "PRISMARECT"
      ],
      "WEDGE": [
        "CUÑA"
      ],
      "PYRAMID": [
        "PIRAMIDE",
        "PIR"
      ],
      "CYLINDER": [
        "CILINDRO",
        "CIL"
      ],
      "CONE": [
        "CONO"
      ],
      "SPHERE": [
        "ESFERA"
      ],
      "TORUS": [
        "TOROIDE",
        "TOR"
      ],
      "REGION": [
        "REGION",
        "REG"
      ],
      "UNION": [
        "UNION",
        "UNI"
      ],
      "SUBTRACT": [
        "DIFERENCIA",
        "DIF"
      ],
      "INTERSECT": [
        "INTERSEC",
        "INT"
      ],
      "EXTRUDE": [
        "EXTRUSION",
        "EXT"
      ],
      "REVOLVE": [
        "REVOLUCION",
        "RV"
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
      "3DPOLY": {
        "Close": "Cerrar",
        "Undo": "desHacer"
      },
      "PLINE": {
        "Arc": "Arco",
        "Line": "líNea",
        "Close": "Cerrar",
        "Halfwidth": "Mitad",
        "Undo": "desHacer",
        "Width": "Grosor",
        "Angle": "ángUlo",
        "Center": "cEntro",
        "Direction": "Dirección",
        "Radius": "Radio",
        "Second pt": "Segundo",
        "Length": "Longitud"
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
      "FILL": {
        "0": "0",
        "1": "1",
        "ON": "ACT",
        "OFF": "DES"
      },
      "ELLIPSE": {
        "Arc": "Arco",
        "Center": "Centro",
        "Centre": "Centro",
        "Rotation": "Rotación",
        "Included angle": "Incluido",
        "Parameter": "Parámetro",
        "Angle": "ángUlo"
      },
      "ELLIPSEC": {
        "Arc": "Arco",
        "Center": "Centro",
        "Centre": "Centro",
        "Rotation": "Rotación",
        "Included angle": "Incluido",
        "Parameter": "Parámetro",
        "Angle": "ángUlo"
      },
      "ELLIPSEARC": {
        "Arc": "Arco",
        "Center": "Centro",
        "Centre": "Centro",
        "Rotation": "Rotación",
        "Included angle": "Incluido",
        "Parameter": "Parámetro",
        "Angle": "ángUlo"
      },
      "SPLINE": {
        "Method": "Método",
        "Knots": "Nudos",
        "Degree": "Grado",
        "Fit": "Ajustar",
        "CV": "VC",
        "Chord": "Cuerda",
        "Square root": "cuaDrada",
        "Uniform": "Uniforme",
        "start Tangency": "Tangencia",
        "end Tangency": "Tangencia",
        "Undo": "desHacer",
        "Close": "Cerrar",
        "Object": "Objeto"
      },
      "SPLINEDIT": {
        "Close": "Cerrar",
        "Open": "aBrir",
        "Join": "Unir",
        "Fit data": "Ajustar",
        "Data": "daTos",
        "Edit vertex": "Editar",
        "convert to Polyline": "coNvertir",
        "Reverse": "Invertir",
        "R": "I",
        "Undo": "desHacer",
        "eXit": "Salir",
        "X": "SA",
        "Toggle": "COnmutar",
        "Add": "Añadir",
        "Delete": "sUprimir",
        "Move": "Desplazar",
        "Purge": "Limpiar",
        "Tangents": "Tangentes",
        "Elevate order": "Elevar",
        "Order": "Orden",
        "Weight": "Peso",
        "Next": "siGuiente",
        "Previous": "Previo",
        "Select point": "Designar",
        "Point": "pUnto",
        "System default": "Defecto",
        "Default": "sistema",
        "After": "Después",
        "Before": "Antes"
      },
      "PEDIT": {
        "Close": "Cerrar",
        "Open": "Abrir",
        "Join": "Juntar",
        "Width": "Grosor",
        "Edit vertex": "Editar",
        "Ltype gen": "generarTlínea",
        "Reverse": "Invertir",
        "Undo": "desHacer",
        "eXit": "Salir",
        "X": "SA",
        "Multiple": "Múltiple",
        "Yes": "Sí",
        "No": "No",
        "Jointype": "Tipodejunta",
        "Extend": "Alargar",
        "Add": "aÑadir",
        "Both": "aMbos",
        "ON": "ACT",
        "OFF": "DES",
        "Next": "sigUiente",
        "Previous": "Precedente",
        "Break": "Cortar",
        "Insert": "Insertar",
        "Move": "Desplazar",
        "Regen": "Regenerar",
        "Straighten": "Alisar",
        "Tangent": "Tangente",
        "Go": "Ejecutar",
        "Fit": "curVar",
        "Spline": "Spline",
        "Spline curve": "Spline",
        "Decurve": "anularcuRVatura",
        "Defit": "ELiminarcurva"
      },
      "BOX": {
        "Center": "Centro",
        "Cube": "Cubo",
        "Length": "Longitud",
        "2Point": "2Puntos"
      },
      "WEDGE": {
        "Center": "Centro",
        "Cube": "Cubo",
        "Length": "Longitud",
        "2Point": "2Puntos"
      },
      "PYRAMID": {
        "Edge": "Arista",
        "Sides": "Lados",
        "Inscribed": "Inscrito",
        "Circumscribed": "Circunscrito",
        "2Point": "2Puntos",
        "Axis": "Eje",
        "Top": "Radio"
      },
      "CYLINDER": {
        "3P": "3P",
        "2P": "2P",
        "Ttr": "Ttr",
        "Elliptical": "Elíptico",
        "Diameter": "Diámetro",
        "Center": "Centro",
        "2Point": "2Puntos",
        "Axis": "Eje"
      },
      "CONE": {
        "3P": "3P",
        "2P": "2P",
        "Ttr": "Ttr",
        "Elliptical": "Elíptico",
        "Diameter": "Diámetro",
        "Center": "Centro",
        "2Point": "2Puntos",
        "Axis": "Eje",
        "Top": "Radio"
      },
      "SPHERE": {
        "3P": "3P",
        "2P": "2P",
        "Ttr": "Ttr",
        "Diameter": "Diámetro"
      },
      "TORUS": {
        "3P": "3P",
        "2P": "2P",
        "Ttr": "Ttr",
        "Diameter": "Diámetro",
        "2Point": "2Puntos"
      },
      "MASSPROP": {
        "Yes": "Sí",
        "No": "No"
      },
      "RECTANG": {
        "Chamfer": "Chaflán",
        "Elevation": "Elevación",
        "Fillet": "eMpalme",
        "Thickness": "Alt-objeto",
        "Area": "áRea",
        "Dimensions": "Cotas",
        "Rotation": "rOtación",
        "Length": "Longitud",
        "Width": "Anchura",
        "Pick": "Designar"
      },
      "POLYGON": {
        "Edge": "Lado",
        "Inscribed": "Inscrito",
        "Circumscribed": "Circunscrito"
      },
      "HATCH": {
        "Properties": "Propiedades",
        "Select objects": "Designar",
        "?": "?",
        "Solid": "Sólido",
        "Undo": "desHacer"
      },
      "INSERT": {
        "?": "?",
        "Scale": "Escala",
        "Rotate": "Girar"
      },
      "BLOCK": {
        "?": "?",
        "Yes": "Sí",
        "No": "No"
      },
      "ATTDEF": {
        "Invisible": "Invisible",
        "Constant": "Constante",
        "Verify": "Verificable",
        "Preset": "Predefinido",
        "Lock position": "Bloquear",
        "Justify": "jUstificar",
        "Style": "Estilo",
        "Left": "Izquierda",
        "Center": "Centro",
        "Right": "Derecha",
        "Middle": "Medio",
        "TL": "SIZquierda",
        "TC": "SCentro",
        "TR": "SDerecha",
        "ML": "MIzquierda",
        "MC": "MCentro",
        "MR": "MDerecha",
        "BL": "IIzquierda",
        "BC": "ICentro",
        "BR": "IDerecha",
        "?": "?"
      },
      "ATTDISP": {
        "OFF": "DES",
        "Normal": "Normal",
        "ON": "ACT"
      },
      "PURGE": {
        "Blocks": "Bloques",
        "Yes": "Sí",
        "No": "No"
      },
      "SNAP": {
        "ON": "ACT",
        "OFF": "DES",
        "Aspect": "asPecto"
      },
      "TEXT": {
        "Justify": "jUstificar",
        "Style": "Estilo",
        "?": "?",
        "Left": "Izquierda",
        "Center": "Centro",
        "Right": "Derecha",
        "Middle": "Medio",
        "TL": "SIZquierda",
        "TC": "SCentro",
        "TR": "SDerecha",
        "ML": "MIzquierda",
        "MC": "MCentro",
        "MR": "MDerecha",
        "BL": "IIzquierda",
        "BC": "ICentro",
        "BR": "IDerecha"
      },
      "MTEXT": {
        "Height": "Altura",
        "Justify": "Justificar",
        "Line spacing": "Interlineado",
        "Rotation": "Rotación",
        "Style": "Estilo",
        "?": "?",
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
        "At least": "Almenos",
        "Exactly": "Exactamente"
      },
      "TEXTEDIT": {
        "Undo": "desHacer",
        "Mode": "Modo",
        "Single": "Simple",
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
      "DIMHORIZONTAL": {
        "Text": "Texto",
        "Angle": "ángUlo"
      },
      "DIMVERTICAL": {
        "Text": "Texto",
        "Angle": "ángUlo"
      },
      "DIMROTATED": {
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
      "-DIMSTYLE": {
        "Save": "Guardar",
        "Restore": "Restituir",
        "STatus": "Estado",
        "Variables": "Variables",
        "Apply": "Aplicar",
        "?": "?",
        "Yes": "Sí",
        "No": "No"
      },
      "OFFSET": {
        "Through": "Atravesar",
        "Thru": "Pun",
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
        "Reference": "Referencia",
        "Points": "Puntos"
      },
      "SCALE": {
        "Copy": "Copiar",
        "Reference": "Referencia",
        "Points": "Puntos"
      },
      "MIRROR": {
        "Yes": "Sí",
        "No": "No"
      },
      "JOIN": {
        "Yes": "Sí",
        "No": "No",
        "cLose": "cErrar"
      },
      "ARRAY": {
        "Rectangular": "Rectangular",
        "PAth": "CAmino",
        "POlar": "POlar"
      },
      "ARRAYRECT": {
        "ASsociative": "Asociativa",
        "COUnt": "COntar",
        "Spacing": "Espaciado",
        "COLumns": "Columnas",
        "Rows": "Filas",
        "Levels": "Niveles",
        "Total": "Total",
        "eXit": "Salir",
        "Unit cell": "Unidad",
        "Yes": "Sí",
        "No": "No"
      },
      "ARRAYPOLAR": {
        "ASsociative": "Asociativa",
        "Items": "Elementos",
        "Angle between": "ángUlo",
        "Fill angle": "Relleno",
        "ROWs": "Filas",
        "ROTate items": "Girar",
        "eXit": "Salir",
        "Yes": "Sí",
        "No": "No"
      },
      "ARRAYPATH": {
        "ASsociative": "Asociativa",
        "Method": "Método",
        "Items": "Elementos",
        "Align items": "ALinear",
        "eXit": "Salir",
        "Divide": "Dividir",
        "Measure": "Medir",
        "Fill entire path": "Llenar",
        "Yes": "Sí",
        "No": "No"
      },
      "TRIM": {
        "Undo": "desHacer",
        "Fence": "Borde",
        "Crossing": "Captura",
        "eRase": "bOrrar",
        "cuTting": "COrte",
        "mOde": "MOdo",
        "Quick": "Rápido",
        "Standard": "Estándar",
        "Edge": "Arista",
        "Extend": "Alargar",
        "No extend": "No alargar",
        "Noextend": "No"
      },
      "EXTEND": {
        "Undo": "desHacer",
        "Fence": "Borde",
        "Crossing": "Captura",
        "Boundary": "COrte",
        "mOde": "MOdo",
        "Quick": "Rápido",
        "Standard": "Estándar",
        "Edge": "Arista",
        "Extend": "Alargar",
        "No extend": "No alargar",
        "Noextend": "No"
      },
      "FILLET": {
        "Undo": "Deshacer",
        "Polyline": "Polilínea",
        "Radius": "RAdio",
        "Multiple": "múLtiple",
        "Trim": "Recortar"
      },
      "CHAMFER": {
        "Undo": "desHacer",
        "Polyline": "Polilínea",
        "Distance": "Distancia",
        "Multiple": "múLtiple"
      },
      "BREAK": {
        "First point": "Primer"
      },
      "DIST": {
        "Multiple": "Múltiples",
        "Close": "Cerrar",
        "Length": "Longitud",
        "Undo": "desHacer",
        "Total": "Total",
        "Arc": "Arco",
        "Line": "líNea",
        "Angle": "ángUlo",
        "Center": "cEntro",
        "Direction": "Dirección",
        "Radius": "Radio",
        "Second pt": "Segundo"
      },
      "AREA": {
        "Object": "Objeto",
        "Add": "Añadir",
        "Subtract": "Sustraer",
        "Undo": "desHacer",
        "Total": "Total",
        "Entity": "Entidad",
        "eXit": "SAlir"
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
        "?": "?",
        "Yes": "Sí",
        "No": "No",
        "Origin": "ORigen",
        "Face": "Cara",
        "3point": "3p",
        "Entity": "Entidad",
        "Move": "DEsplazar",
        "orthoGraphic": "Ortogonal",
        "New": "Nuevo",
        "Top": "SUperior",
        "Bottom": "Inferior",
        "Front": "Frontal",
        "BAck": "Posterior",
        "Left": "IZquierda",
        "Right": "Derecha",
        "Zdepth": "profundidadZ"
      },
      "UNDO": {
        "BEgin": "Inicio",
        "End": "Fin",
        "Mark": "Marca",
        "Back": "Retorno",
        "Group": "Grupo",
        "Yes": "Sí",
        "No": "No",
        "Auto": "Auto",
        "Control": "Control",
        "All": "Todas",
        "None": "Ninguna",
        "One": "Una",
        "Combine": "Combinar",
        "Layer": "CApa",
        "ON": "ACT",
        "OFF": "DES"
      },
      "MREDO": {
        "All": "Todas",
        "Last": "úLtima"
      },
      "UCSICON": {
        "ON": "ACT",
        "OFF": "DES",
        "Noorigin": "Sin",
        "ORigin": "Origen"
      },
      "PLAN": {
        "Current ucs": "Actual",
        "Ucs": "SCP",
        "World": "Universal",
        "?": "?"
      },
      "VPOINT": {
        "Rotate": "Rotación"
      },
      "VIEW": {
        "Orthographic": "Ortogonal",
        "Top": "sUperior",
        "Bottom": "Inferior",
        "Front": "Frontal",
        "BAck": "Posterior",
        "Left": "IZquierda",
        "Right": "Derecha",
        "SWiso": "SOIso",
        "SEiso": "SEIso",
        "NEiso": "NEIso",
        "NWiso": "NOIso"
      },
      "NAVVCUBE": {
        "ON": "ACT",
        "OFF": "DES"
      },
      "SETVAR": {
        "?": "?",
        "ON": "ACT",
        "OFF": "DES",
        "True": "Verdadero",
        "False": "Falso",
        "Yes": "Sí",
        "No": "No"
      },
      "CHPROP": {
        "Color": "COlor",
        "LAyer": "Capa",
        "LType": "Tlínea",
        "LWeight": "Grosorl",
        "Thickness": "Alt-objeto",
        "Truecolor": "COlorverdadero",
        "BYLAYER": "porCapa",
        "RED": "Rojo",
        "YELLOW": "Amarillo",
        "GREEN": "Verde",
        "CYAN": "cIán",
        "BLUE": "aZul",
        "MAGENTA": "Magenta",
        "WHITE": "bLanco",
        "BYBLOCK": "porBloque",
        "?": "?"
      },
      "COLOR": {
        "Truecolor": "COlorverdadero",
        "BYLAYER": "porCapa",
        "RED": "Rojo",
        "YELLOW": "Amarillo",
        "GREEN": "Verde",
        "CYAN": "cIán",
        "BLUE": "aZul",
        "MAGENTA": "Magenta",
        "WHITE": "bLanco",
        "BYBLOCK": "porBloque"
      },
      "LINETYPE": {
        "?": "?",
        "Set": "Definir",
        "BYLAYER": "porCapa",
        "BYLayer": "porCapa"
      },
      "LWEIGHT": {
        "?": "?",
        "BYLAYER": "porCapa"
      },
      "EXTRUDE": {
        "MOde": "MOdo",
        "SOlid": "Sólido",
        "SUrface": "SUperficie",
        "Direction": "Dirección",
        "Path": "Trayectoria",
        "Taper": "Inclinación",
        "Expression": "Expresión",
        "Yes": "Sí",
        "No": "No"
      },
      "REVOLVE": {
        "MOde": "MOdo",
        "SOlid": "Sólido",
        "SUrface": "SUperficie",
        "Object": "Objeto",
        "X": "X",
        "Y": "Y",
        "Z": "Z",
        "STart": "Inicial",
        "Reverse": "iNvertir",
        "EXpression": "EXpresión",
        "Yes": "Sí",
        "No": "No"
      }
    },
    "promptKeywords": {
      "selectObjects": {
        "Window": "Ventana",
        "Last": "úLTimo",
        "Crossing": "Captura",
        "BOX": "MArco",
        "ALL": "Todos",
        "Fence": "Borde",
        "WPolygon": "polígonOV",
        "CPolygon": "polígonOC",
        "Add": "Añadir",
        "Remove": "Eliminar",
        "Previous": "Previo",
        "Undo": "desHacer",
        "AUto": "AUto",
        "SIngle": "úNico",
        "SUbobject": "Subobjeto",
        "Object": "Objeto"
      },
      "specifyNextFencePointOr": {
        "Undo": "desHacer"
      },
      "viewOrthographic": {
        "Top": "sUperior",
        "Left": "IZquierda",
        "Right": "Derecha"
      },
      "ucsNewUcs": {
        "ZAxis": "ejEZ"
      },
      "ucsOrthographic": {
        "Top": "SUperior",
        "Front": "Frontal",
        "BAck": "Posterior",
        "Left": "IZquierda",
        "Right": "Derecha"
      },
      "specifyEndpointOfLineOr": {
        "Undo": "desHacer"
      },
      "select2dPolylineOr": {
        "Radius": "Radio"
      },
      "selectSecondObjectOrApplyCornerOr": {
        "Radius": "Radio"
      },
      "specifyEndpointOfArcOr": {
        "Close": "Cerrar",
        "Arc": "Arco"
      },
      "plineNextPointOr": {
        "Line": "líNea"
      },
      "specifyFirstCornerPointOr": {
        "Width": "Grosor"
      },
      "specifyAxisEndpointOfEllipticalArcOr": {
        "Centre": "cEntro"
      },
      "splineditOptionClosed": {
        "convert to Polyline": "Polilínea"
      },
      "peditOption": {
        "eXit": "SAlir"
      },
      "peditOption3d": {
        "Join": "Unir",
        "eXit": "SAlir"
      },
      "peditWalkOption": {
        "eXit": "Salir"
      },
      "enterFitDataOption": {
        "Add": "añaDIr",
        "Open": "Abrir",
        "Move": "dEsplazar",
        "X": "S"
      },
      "enterVertexEditingOption": {
        "X": "S"
      },
      "specifyNewLocationOr": {
        "eXit": "Salir",
        "X": "S"
      },
      "enterNewWeightOr": {
        "eXit": "Salir",
        "X": "SA"
      }
    },
    "prompts": {
      "length": "Longitud",
      "width": "Anchura",
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
      "startParameter": "Parámetro inicial",
      "endParameter": "Parámetro final",
      "includedAngle": "Ángulo incluido",
      "splineStartTangent": "Precise tangente inicial",
      "splineEndTangent": "Precise tangente final",
      "splineDegree": "Indique grado de spline",
      "firstCorner": "Primer punto de esquina",
      "otherCorner": "Esquina opuesta",
      "rectangleElevation": "Precise elevación para rectángulos",
      "rectangleThickness": "Precise Alt-objeto para rectángulos",
      "rectangleFirstChamfer": "Precise primera distancia de chaflán para rectángulos",
      "rectangleSecondChamfer": "Precise segunda distancia de chaflán para rectángulos",
      "rectangleFillet": "Precise radio de empalme para rectángulos",
      "rectangleLineWidth": "Precise grosor de línea para rectángulos",
      "rectangleArea": "Precise área del rectángulo con las unidades actuales",
      "rectangleAreaBasis": "Calcular cotas del rectángulo en función de",
      "rectangleLength": "Precise longitud del rectángulo",
      "rectangleWidth": "Precise anchura del rectángulo",
      "rectangleDimensionLength": "Precise longitud para rectángulos",
      "rectangleDimensionWidth": "Precise anchura para rectángulos",
      "rectangleRotation": "Precise ángulo de rotación o",
      "numberOfSides": "Número de lados",
      "patternName": "Indique nombre de patrón",
      "patternScale": "Precise escala del patrón",
      "patternAngle": "Precise ángulo del patrón",
      "blockName": "Indique nombre de bloque o",
      "blockExists": [
        "El bloque \"",
        [
          "name"
        ],
        "\" ya existe. ¿Desea redefinirlo?"
      ],
      "redefineIt": "¿Desea redefinirlo?",
      "blocksToList": "Indique bloque(s) a enumerar",
      "purgeType": "Indique un tipo de objetos sin utilizar para limpiar",
      "purgeNames": "Indique nombres que limpiar",
      "purgeVerify": "Verifique cada nombre que se va a limpiar?",
      "massPropWriteFile": "¿Escribir análisis en un archivo?",
      "purgeBlock": [
        "Limpiar bloque \"",
        [
          "name"
        ],
        "\"?"
      ],
      "insertionBasePoint": "Especifique un punto base de inserción",
      "specifyInsertionPoint": "Precise punto de inserción",
      "insertionPoint": "Especifique un punto de inserción o",
      "insertScale": "Precise factor de escala para ejes XYZ",
      "insertRotation": "Precise ángulo de rotación",
      "insertXScale": "Indique factor de escala X, precise esquina opuesta, o [Esquina/XYZ]",
      "insertYScale": "Indique factor de escala Y",
      "attributeTag": "Indique nombre de identificador de atributo",
      "attributePrompt": "Indique solicitud de atributo",
      "attributeDefault": "Indique valor de atributo por defecto",
      "attributeValue": "Indique valor de atributo",
      "attributeValuePrompt": [
        [
          "prompt"
        ]
      ],
      "attdefModes": "Indique una opción para modificar",
      "attdefDone": "terminado",
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
      "mtextRotation": "Indique el ángulo de rotación",
      "mtextWidth": "Indique la anchura",
      "mtextLineSpacing": "Indique el factor de interlineado o distancia",
      "mtextLine": "textoM",
      "firstExtensionOrigin": "Especifique el origen de la primera línea de referencia o <designar objeto>",
      "secondExtensionOrigin": "Especifique el origen de la segunda línea de referencia",
      "dimensionLineLocation": "Designe ubicación de línea de cota",
      "dimensionLineAngle": "Designe ángulo de línea de cota",
      "dimensionText": "Indique texto de cota",
      "dimensionTextAngle": "Precise ángulo de texto de cota",
      "angleVertex": "Designe vértice del ángulo",
      "firstAngleEndpoint": "Designe primer punto final del ángulo",
      "secondAngleEndpoint": "Designe segundo punto final del ángulo",
      "circleSecondAngleEndpoint": "Precise segundo punto final del ángulo",
      "dimensionArcLocation": "Designe ubicación del arco de línea de cota",
      "dimensionSpacing": "Indique valor",
      "offsetDistance": "Distancia de desfase",
      "basePoint": "Punto base",
      "fromOffset": "<Desfase>",
      "pointFilterOf": "de",
      "pointFilterNeed": [
        "(falta ",
        [
          "axes"
        ],
        ")"
      ],
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
      "levels": "Niveles",
      "levelSpacing": "Distancia entre niveles",
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
      "ucsOrigin": "Indique origen de SCP o",
      "ucsXAxisPoint": "Precise punto en eje X o",
      "ucsXYPlanePoint": "Precise punto en plano XY o",
      "ucsRotationX": "Precise ángulo de rotación sobre eje X",
      "ucsRotationY": "Precise ángulo de rotación sobre eje Y",
      "ucsRotationZ": "Precise ángulo de rotación sobre eje Z",
      "ucsZAxisOrigin": "Precise nuevo punto de origen u",
      "ucsZAxisPoint": "Precise punto en parte positiva del eje Z",
      "ucsRestoreName": "Indique nombre de SCP para restaurarlo o",
      "ucsSaveName": "Indique nombre para guardar SCP actual o",
      "ucsDeleteNames": "Indique el nombre del SCP que se suprimirá",
      "ucsListNames": "Indique nombre(s) del SCP que enumerar",
      "ucsAccept": "Aceptar",
      "ucsNone": "ninguno",
      "ucsReplace": [
        "El SCP \"",
        [
          "name"
        ],
        "\" ya existe. Reemplácelo.?"
      ],
      "ucsAlignObject": "Designe el objeto a alinear con el SCP",
      "ucsNewUcs": "Precise origen de nuevo SCP o",
      "ucsNewOrigin": "Precise nuevo punto de origen",
      "ucsMoveOrigin": "Precise nuevo punto de origen o",
      "ucsZdepth": "Precise profundidadZ",
      "ucsOrthographic": "Indique una opción",
      "ucs3XAxisPoint": "Precise punto en parte positiva del eje X",
      "ucs3XYPlanePoint": "Precise punto en parte Y positiva del plano XY del SCP",
      "ucsTop": "Superior",
      "ucsBottom": "Inferior",
      "ucsFront": "Frontal",
      "ucsBack": "Posterior",
      "ucsLeft": "Izquierda",
      "ucsRight": "Derecha",
      "ucsSelectFace": "Designe la cara del sólido, la superficie o la malla",
      "undoCount": "Indique el número de operaciones a deshacer o",
      "undoEverything": "Esto lo deshará todo. ¿De acuerdo?",
      "mredoCount": "Indique número de acciones o",
      "undoYes": "S",
      "undoControl": "Indique una opción de control DESHACER",
      "undoCombine": "¿Combinar operaciones de zoom y encuadre?",
      "undoLayer": "¿Combinar operaciones de cuadro de diálogo de capa?",
      "undoAuto": "Indique modo automático de DESHACER",
      "undoOn": "ACT",
      "undoOff": "DES",
      "panBasePoint": "Precise punto base de desplazamiento",
      "planUcsName": "Indique nombre de SCP o",
      "planCurrent": "Actual",
      "zoomCornerOr": "Precise esquina de ventana, indique un factor de escala (nX o nXP), o",
      "zoomScaleFactor": "Indique factor de escala (nX o nXP)",
      "viewOption": "Indique una opción",
      "viewOrthographic": "Indique una opción",
      "elevDefaultElevation": "Precise nueva elevación por defecto",
      "elevDefaultThickness": "Precise nueva altura de objeto por defecto",
      "ltscaleFactor": "Indique nuevo factor de escala del tipo de línea",
      "enterNewValueFor": [
        "Indique nuevo valor para ",
        [
          "name"
        ]
      ],
      "enterNewValueForOrNone": [
        "Indique nuevo valor para ",
        [
          "name"
        ],
        ", o . para ninguno"
      ],
      "enterVariableName": "Indique nombre de variable o",
      "enterVariablesToList": "Indique variable(s) a listar",
      "pressEnterToContinue": "Pulse INTRO para continuar",
      "osnapModes": "Indique lista de modo de referencia a objetos",
      "snapSpacingOr": "Precise distancia de resolución o",
      "snapAspect": "asP",
      "snapHorizontalSpacing": "Precise intervalo horizontal",
      "snapVerticalSpacing": "Precise intervalo vertical",
      "defaultObjectColor": "Indique el color de objeto por defecto",
      "trueColor": "Rojo,Verde,Azul",
      "linetypeName": "Precise nombre de tipo de línea o",
      "linetypeListNames": "Indique nombre(s) de tlínea que se van a enumerar",
      "defaultLineweight": "Indique el grosor de línea por defecto para los nuevos objetos o",
      "idPoint": "Precise punto",
      "distSecondPointOr": "Especifique segundo punto o",
      "specifyLengthOfLine": "Precise longitud de línea",
      "polylineStartingWidth": "Precise grosor inicial",
      "polylineEndingWidth": "Precise grosor final",
      "polylineStartingHalfWidth": "Precise mitad de grosor inicial",
      "polylineEndingHalfWidth": "Precise mitad de grosor final",
      "fillMode": "Indique modo",
      "matchpropSource": "Designe objeto de origen",
      "matchpropDestination": "Designe objeto(s) de destino",
      "propertyToChange": "Indique propiedad que cambiar",
      "newColor": "Nuevo color",
      "newLayerName": "Indique nuevo nombre de capa",
      "newLinetypeName": "Indique nuevo nombre de tipo de línea",
      "newLineweight": "Indique el nuevo grosor de línea",
      "newThickness": "Precise nueva alt-objeto",
      "viewPoint": "Precise un punto de vista",
      "specifyViewPointOr": "Precise un punto de vista o",
      "attributeVisibilitySetting": "Indique parámetro de visibilidad de atributo",
      "selectAnnotationObjectOr": "Designe un objeto de anotación o",
      "selectBlockReference": "Designe referencia a bloque",
      "selectABlock": "Designe un bloque",
      "textEditModeOption": "Indique una opción de modo de edición de texto",
      "viewAngleInPlane": "Ángulo a partir del eje X en el plano XY",
      "viewAngleFromPlane": "Ángulo a partir del plano XY",
      "boxFirstCornerOr": "Precise primera esquina o",
      "boxOtherCornerOr": "Precise otra esquina o",
      "boxCenter": "Precise centro",
      "boxCornerOr": "Precise esquina o",
      "boxLength": "Precise longitud",
      "boxWidth": "Precise anchura",
      "boxHeightOr": "Precise altura o",
      "pyramidCenterOr": "Precise centro de base o",
      "specifyBaseRadiusOr": "Precise radio de base o",
      "pyramidBaseRadiusOr": "Precise radio de base o",
      "solidHeightTopOr": "Indique altura o",
      "solidHeightOr": "Precise altura o",
      "specifyAxisEndpoint": "Precise punto final de eje",
      "specifyTopRadius": "Precise radio superior",
      "sphereCenterOr": "Precise centro o",
      "specifyRadiusOr": "Precise radio o",
      "torusDiameter": "Precise diámetro de toroide",
      "tubeRadiusOr": "Precise radio de sección o",
      "tubeDiameter": "Precise diámetro de sección",
      "roundBaseCenterOr": "Precise centro de base o",
      "specifyDiameter": "Precise diámetro",
      "specifyThirdPoint": "Precise tercer punto",
      "firstEndOfDiameter": "Precise primer punto final de diámetro",
      "secondEndOfDiameter": "Precise segundo punto final de diámetro",
      "firstTangentPoint": "Precise punto en objeto para primera tangente",
      "secondTangentPoint": "Precise punto en objeto para segunda tangente",
      "firstAxisEndpointOr": "Precise punto final de primer eje o",
      "otherFirstAxisEndpoint": "Precise otro punto final de primer eje",
      "secondAxisEndpoint": "Precise punto final de segundo eje",
      "specifyCenterPoint": "Precise centro",
      "distanceToFirstAxis": "Precise distancia a primer eje",
      "specifyFirstPoint": "Precise primer punto",
      "specifyNextPointOr": "Precise punto siguiente o",
      "specifyNextPointOrClose": "Precise siguiente punto o",
      "plineNextPointOr": "Precise punto siguiente o",
      "specifyNextPointOrTotal": "Precise punto siguiente o",
      "lengthOfLine": "Longitud de la línea",
      "specifyStartPoint": "Precise punto inicial",
      "specifyStartPointOfPolyline": "Precise punto inicial de polilínea",
      "specifyEndpointOfArcOr": "Precise punto final del arco (mantenga pulsada la tecla Ctrl para cambiar de dirección) o",
      "specifyCenterPointForCircleOr": "Precise punto central para círculo o",
      "specifyRadiusOfCircleOr": "Precise radio de círculo o",
      "specifyRadiusOfCircle": "Precise radio de círculo",
      "specifyRadiusOfCircleTtr": "Precise radio del círculo",
      "enterNumberOfSides": "Indique número de lados",
      "specifyCenterOfPolygonOr": "Precise centro de polígono o",
      "enterAnOption": "Indique una opción",
      "textJustifyOption": "Indique una opción",
      "ucsiconOption": "Indique una opción",
      "navvcubeOption": "Indique una opción",
      "inscribedShort": "I",
      "circumscribedShort": "C",
      "specifyFirstEndpointOfEdge": "Precise primer punto final de lado",
      "specifySecondEndpointOfEdge": "Precise segundo punto final de lado",
      "specifyAxisEndpointOfEllipseOr": "Precise punto final de eje de elipse o",
      "specifyAxisEndpointOfEllipticalArcOr": "Precise punto final de eje de arco elíptico o",
      "specifyCenterOfEllipse": "Precise centro de elipse",
      "specifyCenterOfEllipticalArc": "Precise centro de arco elíptico",
      "specifyOtherEndpointOfAxis": "Precise otro punto final de eje",
      "specifyEndpointOfAxis": "Precise punto final de eje",
      "specifyDistanceToOtherAxisOr": "Precise distancia de otro eje o",
      "specifyRotationAroundMajorAxis": "Precise rotación alrededor del eje mayor",
      "specifyStartAngleOr": "Precise ángulo inicial o",
      "specifyEndAngleOr": "Precise ángulo final o",
      "specifyStartParameterOr": "Precise parámetro inicial o",
      "specifyEndParameterOr": "Precise parámetro final o",
      "specifyIncludedAngleForArc": "Precise ángulo incluido para arco",
      "specifyFirstPointOr": "Precise primer punto o",
      "enterSplineCreationMethod": "Introduzca método de creación de spline",
      "enterKnotParameterization": "Introduzca parametrización de nudos",
      "knotsChord": "Cuerda",
      "knotsSquareRoot": "Raíz cuadrada",
      "knotsUniform": "Uniforme",
      "enterDegreeOfSpline": "Indique grado de spline",
      "enterNextPoint": "Especifique punto siguiente",
      "enterNextPointOr": "Especifique punto siguiente o",
      "enterThirdPointOr": "Precise el punto siguiente o",
      "specifyStartTangent": "Precise tangente inicial",
      "specifyEndTangent": "Precise tangente final",
      "specifyDiameterOfCircle": "Precise diámetro de círculo",
      "specifyFirstEndPointOfDiameter": "Precise primer punto final del diámetro del círculo",
      "specifySecondEndPointOfDiameter": "Precise segundo punto final del diámetro del círculo",
      "specifyFirstPointOnCircle": "Precise primer punto del círculo",
      "specifySecondPointOnCircle": "Precise segundo punto del círculo",
      "specifyThirdPointOnCircle": "Precise tercer punto del círculo",
      "specifyFirstTangentOfCircle": "Precise punto en objeto para la primera tangente del círculo",
      "specifySecondTangentOfCircle": "Precise punto en objeto para la segunda tangente del círculo",
      "specifySecondPoint": "Precise segundo punto",
      "secondPointOfDistance": " Designe segundo punto",
      "clarifyKeyword": [
        [
          "keywords"
        ],
        "?"
      ],
      "specifyFirstCornerPointOr": "Precise primer punto de esquina o",
      "areaFirstCornerPointOr": "Precise primer punto de esquina o",
      "addModeNextPointOr": " (modo AÑADIR)Precise punto siguiente o",
      "subtractModeNextPointOr": " (modo SUSTRAER)Precise punto siguiente o",
      "addModeNextPointOrTotal": " (modo AÑADIR)Precise punto siguiente o",
      "subtractModeNextPointOrTotal": " (modo SUSTRAER)Precise punto siguiente o",
      "addModeSelectObjects": "(modo AÑADIR) Designe objetos",
      "subtractModeSelectObjects": "(modo SUSTRAER) Designe objetos",
      "specifyOtherCornerPointOr": "Precise esquina opuesta o",
      "specifyStartPointOfArcOr": "Precise punto inicial del arco o",
      "specifySecondPointOfArcOr": "Precise segundo punto de arco o",
      "specifyEndPointOfArc": "Precise punto final del arco",
      "specifyCenterPointOfArc": "Precise punto central del arco",
      "plineCenterPointOfArc": "Precise punto central del arco",
      "specifyIncludedAngle": "Precise ángulo incluido",
      "specifyRadiusOfArc": "Precise radio de arco",
      "specifyDirectionOfChordForArc": "Precise dirección de cuerda para arco (mantenga pulsada la tecla Ctrl para cambiar de dirección)",
      "specifyIncludedAngleCtrl": "Precise ángulo incluido (mantenga pulsada la tecla Ctrl para cambiar de dirección)",
      "specifyLengthOfChordCtrl": "Precise longitud de cuerda (mantenga pulsada la tecla Ctrl para cambiar de dirección)",
      "specifyTangentDirectionForStartPointOfArc": "Precise la dirección de tangente para el punto inicial del arco",
      "specifyEndpointOfTheArcCtrl": "Precise punto final del arco (mantenga pulsada la tecla Ctrl para cambiar de dirección)",
      "specifySecondPointOnArc": "Precise segundo punto en arco",
      "specifyStartPointOfArc": "Precise punto inicial del arco",
      "specifyEndPointOfArcCtrl": "Precise punto final de arco (mantenga pulsada la tecla Ctrl para cambiar de dirección)",
      "selectObjects": "Designe objetos",
      "removeObjects": "Elimine objetos",
      "specifyFirstCorner": "Designe primera esquina",
      "specifyOppositeCorner": "Designe esquina opuesta",
      "specifyFirstFencePoint": "Precise primer punto del borde o designe/arrastre cursor",
      "specifyNextFencePointOr": "Precise punto del borde o",
      "firstPolygonPoint": "Primer punto del polígono o designe/arrastre cursor",
      "specifyEndpointOfLineOr": "Precise punto final de línea o",
      "specifyBasePointOr": "Precise punto base o",
      "copyBasePointOr": "Precise punto base o",
      "copyDisplacement": "Desplazamiento",
      "specifyDisplacement": "Precise desplazamiento",
      "specifySecondPointOr": "Precise segundo punto o",
      "useFirstPointAsDisplacement": "usar primer punto como desplazamiento",
      "copyUseFirstPoint": "usar primer punto como desplazamiento",
      "useXScaleFactor": "usar factor de escala X",
      "copySecondPointOr": "Precise el segundo punto o",
      "specifyBasePoint": "Precise punto base",
      "specifyRotationAngleOr": "Precise ángulo de rotación o",
      "specifyTheReferenceAngle": "Precise ángulo de referencia",
      "specifyTheNewAngle": "Precise el nuevo ángulo",
      "specifyTheNewAngleOr": "Precise el nuevo ángulo o",
      "specifyScaleFactorOr": "Precise factor de escala o",
      "specifyReferenceLength": "Precise longitud de referencia",
      "specifyNewLengthOr": "Precise nueva longitud o",
      "specifyFirstPointOfMirrorLine": "Precise primer punto de línea de simetría",
      "specifySecondPointOfMirrorLine": "Especifique segundo punto de línea de simetría",
      "eraseSourceObjects": "¿Borrar objetos de origen?",
      "selectSourceOrMultipleToJoin": "Designe un objeto de origen o varios objetos para unirlos a la vez",
      "selectObjectsToJoin": "Seleccione objetos para unir",
      "convertCombinedArcsToCircle": "Los segmentos de arco combinados forman un círculo. ¿Convertir en círculo?",
      "selectOpenCurvesToJoinToSource": "Designe cualesquiera curvas abiertas para unir al origen",
      "selectEllipticalArcsToJoinToSourceOr": "Designe arcos elípticos que unir al origen o",
      "selectEllipticalArcsToJoinToSource": "Designe arcos elípticos que unir al origen",
      "specifyOffsetDistanceOr": "Precise distancia de desfase o",
      "selectObjectToOffsetOr": "Designe objeto a desplazar o",
      "specifyPointOnSideToOffsetOr": "Precise punto en lado de desplazamiento o",
      "eraseSourceObjectAfterOffsetting": "¿Borrar objeto de origen tras desfase?",
      "enterLayerOptionForOffsetObjects": "Indique opción de capa para objetos desfasados",
      "specifyThroughPointOr": "Precise punto a atravesar o",
      "nextObject": "siguiente objeto",
      "enterImpliedEdgeExtensionMode": "Indique modo de alargamiento de arista implícito",
      "enterTrimModeOption": "Introduzca una opción de modo de recorte",
      "enterExtendModeOption": "Introduzca una opción de modo de alargamiento",
      "selectObjectsOr": "Seleccione objetos o",
      "selectEdgesOr": "Seleccione objetos o",
      "selectAll": "seleccionar todo",
      "selectObjectsToEraseOrExit": "Designe objetos que borrar o <salir>",
      "selectObjectsToErase": "Designe objetos que borrar",
      "selectObjectToTrimOrShiftSelectToExtendOr": "Seleccione un objeto que recortar o use la tecla Mayús y seleccione para alargar, o",
      "selectObjectToExtendOrShiftSelectToTrimOr": "Seleccione un objeto que alargar o use la tecla Mayús y seleccione para recortar, o",
      "selectFirstObjectOr": "Designe el primer objeto o",
      "selectSecondObjectOrApplyCornerOr": "Designe el segundo objeto o use la tecla Mayús para aplicar esquina o",
      "specifyFilletRadius": "Precise radio de empalme",
      "select2dPolylineOr": "Designe una polilínea 2D o",
      "selectPolylineToChamferOr": "Seleccione una polilínea 2D o",
      "selectFirstLineOr": "Designe la primera línea o",
      "selectSecondLineOrApplyCornerOr": "Designe la segunda línea o use la tecla Mayús para aplicar esquina o",
      "specifyFirstChamferDistance": "Precise  primera distancia de chaflán",
      "specifySecondChamferDistance": "Precise  segunda distancia de chaflán",
      "selectObject": "Designe objeto",
      "specifyFirstBreakPoint": "Precise primer punto de ruptura",
      "specifySecondBreakPointOr": "Precise segundo punto de ruptura o",
      "specifySecondBreakPoint": "Precise segundo punto de ruptura",
      "specifyBreakPoint": "Especifique el punto de interrupción",
      "enterArrayType": "Indique el tipo de matriz",
      "selectGripToEditArrayOr": "Seleccione un pinzamiento para editar la matriz o",
      "selectGripToEditPathArrayOr": "Seleccione un pinzamiento para editar la matriz o",
      "enterNumberOfColumns": "Indique el número de columnas",
      "enterNumberOfRows": "Indique el número de filas",
      "specifyDistanceBetweenColumnsOfCell": "Especificar la distancia entre columnas o",
      "unitCellFirstCorner": "Precise primer punto de esquina de la celda de unidad",
      "unitCellOppositeCorner": "Precise esquina opuesta",
      "specifyDistanceBetweenColumns": "Especifique la distancia entre columnas",
      "specifyDistanceBetweenRows": "Especifique la distancia entre filas",
      "specifyDistanceBetweenRowsOfCell": "Especifique la distancia entre filas",
      "specifyIncrementingElevationBetweenRows": "Especifique la elevación incremental entre filas",
      "enterNumberOfLevels": "Indique el número de niveles",
      "specifyDistanceBetweenLevelsOr": "Especifique la distancia entre niveles o",
      "enterTotalDistanceBetweenLevels": "Introduzca la distancia total entre los puntos inicial y final niveles",
      "specifyCenterPointOfArray": "Especifique el punto central de la matriz",
      "enterNumberOfItemsInArray": "Indique el número de elementos de la matriz",
      "specifyAngleBetweenItems": "Indique el ángulo entre elementos",
      "specifyTheAngleToFill": "Precise el ángulo que se debe rellenar (+ =antihorario, -=horario)",
      "rotateArrayedItems": "¿Girar elementos de la matriz?",
      "createAssociativeArray": "Crear matriz asociativa",
      "selectPathCurve": "Seleccione la curva de trayectoria",
      "enterPathMethod": "Introduzca el método de camino",
      "enterNumberOfItemsAlongPath": "Introduzca el número de elementos a lo largo del camino",
      "specifyDistanceBetweenItemsAlongPath": "Especifique la distancia entre los elementos a lo largo del camino",
      "specifyNumberOfItemsOr": "Introduzca el número de elementos o",
      "alignArrayedItemsToPath": "¿Alinear elementos de matriz con el camino?",
      "specifyInternalPointOr": "Precise punto interno o",
      "enterPatternNameOr": "Indique nombre de patrón o",
      "specifyStartPointOfText": "Precise punto inicial de texto",
      "specifyStartPointOfTextOr": "Precise punto inicial de texto o",
      "specifyCenterPointOfText": "Precise punto central de texto",
      "specifyCenterPointOfTextOr": "Precise punto central de texto o",
      "specifyRightEndpointOfTextBaseline": "Precise punto final derecho de la línea base de texto",
      "specifyRightEndpointOfTextBaselineOr": "Precise punto final derecho de la línea base de texto o",
      "specifyMiddlePointOfText": "Precise punto medio de texto",
      "specifyMiddlePointOfTextOr": "Precise punto medio de texto o",
      "specifyTopLeftPointOfText": "Precise punto superior izquierdo de texto",
      "specifyTopLeftPointOfTextOr": "Precise punto superior izquierdo de texto o",
      "specifyTopCenterPointOfText": "Precise punto central superior de texto",
      "specifyTopCenterPointOfTextOr": "Precise punto central superior de texto o",
      "specifyTopRightPointOfText": "Precise punto superior derecho de texto",
      "specifyTopRightPointOfTextOr": "Precise punto superior derecho de texto o",
      "specifyMiddleLeftPointOfText": "Precise punto medio izquierdo de texto",
      "specifyMiddleLeftPointOfTextOr": "Precise punto medio izquierdo de texto o",
      "specifyMiddleRightPointOfText": "Precise punto medio derecho de texto",
      "specifyMiddleRightPointOfTextOr": "Precise punto medio derecho de texto o",
      "specifyBottomLeftPointOfText": "Precise punto inferior izquierdo de texto",
      "specifyBottomLeftPointOfTextOr": "Precise punto inferior izquierdo de texto o",
      "specifyBottomCenterPointOfText": "Precise punto central inferior de texto",
      "specifyBottomCenterPointOfTextOr": "Precise punto central inferior de texto o",
      "specifyBottomRightPointOfText": "Precise punto inferior derecho de texto",
      "specifyBottomRightPointOfTextOr": "Precise punto inferior derecho de texto o",
      "enterStyleNameOr": "Indique nombre de estilo o",
      "enterText": "Escriba el texto",
      "mtextOppositeCornerOr": "Indique la esquina opuesta o",
      "mtextHeight": "Indique la altura",
      "enterJustification": "Indique la justificación",
      "enterLineSpacingType": "Indique el tipo de interlineado",
      "mtextStyleNameOr": "Indique el nombre de estilo o",
      "selectObjectToDimension": "Designe objeto para acotar",
      "dimensionLineLocationOr": "Especifique una ubicación de línea de cota o",
      "enterDimensionText": "Indique texto de cota",
      "specifyAngleOfDimensionText": "Designe ángulo de texto de cota",
      "selectArcOrCircle": "Designe un arco o un círculo",
      "selectArcCircleLineOrVertex": "Designe arco, círculo, línea o <designar vértice>",
      "selectSecondLine": "Designe segunda línea",
      "dimensionArcLocationOr": "Designe ubicación del arco de línea de cota o",
      "secondExtensionOriginOr": "Especifique un origen de la segunda línea de referencia o",
      "selectBaseDimension": "Designe cota base",
      "selectContinuedDimension": "Designe cota continua",
      "spaceBaseDimension": "Designar cota base",
      "selectDimensionsToSpace": "Designe cotas para intervalo",
      "dimStyleOption": "Indique una opción de estilo de cota",
      "dimStyleSaveName": "Indique nombre para estilo de cota nuevo o",
      "dimStyleRedefine": "Este nombre está ya en uso; ¿redefinirlo?",
      "dimStyleName": "Indique un nombre de estilo de cota, [?] o",
      "dimStyleSelectDimension": "designar cota",
      "dimStylesToList": "Indique estilo(s) de cota a enumerar",
      "selectDimension": "Designe una cota",
      "enterValueOr": "Indique valor o",
      "selectSpline": "Designe spline",
      "selectSplineFitPolyline": "Designe polilínea de ajuste de spline",
      "splineditOption": "Indique una opción",
      "splineditOptionClosed": "Indique una opción",
      "enterFitDataOption": "Indique una opción de datos de ajuste",
      "specifyExistingFitPoint": "Precise punto de ajuste existente en spline",
      "specifyNewPointOr": "Precise nuevo punto o",
      "specifyNewFitPointToAdd": "Precise nuevo punto de ajuste a añadir",
      "specifyStartTangentOr": "Precise tangente inicial o",
      "specifyEndTangentOr": "Precise tangente final o",
      "enterVertexEditingOption": "Indique una opción de edición de vértices",
      "specifyPointOnSpline": "Precise un punto en la spline",
      "specifyControlVertexToDelete": "Especifique vértice de control a suprimir",
      "enterNewOrder": "Indique nuevo orden",
      "specifyNewLocationOr": "Precise nueva ubicación o",
      "enterNewWeightOr": [
        "Indique nuevo peso (actual = ",
        [
          "weight"
        ],
        ") o"
      ],
      "specifyPrecision": "Especifique una precisión",
      "selectPolylineOr": "Designe polilínea o",
      "turnIntoPolyline": "¿Lo quiere transformar en una?",
      "convertToPolylines": "¿Convertir líneas, arcos y splines en polilíneas? [Sí/No]?",
      "specifyPrecisionForSplineConversion": "Especifique una precisión para la conversión de spline",
      "peditOption": "Indique una opción",
      "peditOption3d": "Indique una opción",
      "enterFuzzDistanceOr": "Indique la distancia de aproximación o",
      "enterJoinType": "Indique el tipo de junta",
      "specifyNewWidthForAllSegments": "Precise nuevo grosor para todos los segmentos",
      "linetypeGenerationOption": "Indique opción de creación de tipos de línea de polilínea",
      "peditVertexOption": "Indique una opción de edición de vértices",
      "peditWalkOption": "Indique una opción",
      "specifyLocationForNewVertex": "Precise ubicación del nuevo vértice",
      "specifyNewLocationForMarkedVertex": "Precise nueva ubicación del vértice marcado",
      "startingWidthForNextSegment": "Precise grosor inicial para siguiente segmento",
      "endingWidthForNextSegment": "Precise grosor final del siguiente segmento",
      "directionOfVertexTangent": "Precise dirección de la tangente de vértice",
      "peditNextShort": "U",
      "joinTypeExtend": "Alargar",
      "joinTypeAdd": "Añadir",
      "joinTypeBoth": "Ambos",
      "exitLower": "salir",
      "nextShort": "G",
      "previousShort": "P",
      "extrudeSelectOr": "Designe objetos para extruir o",
      "closedProfilesMode": "Modo de creación de perfiles cerrados",
      "closedProfilesSolid": "Sólido",
      "extrudeHeightOr": "Precise altura de extrusión o",
      "extrudeHeightDefaultOr": "Precise altura de extrusión o",
      "extrudeTaperOr": "Precise ángulo de inclinación para extrusión o",
      "enterExpression": "Introduzca expresión",
      "directionStart": "Precise punto inicial de dirección",
      "directionEnd": "Precise punto final de dirección",
      "eraseDefiningObjects": "¿Desea borrar los objetos de definición?",
      "revolveSelectOr": "Designe objetos para revolución o",
      "revolveAxisStartOr": "Precise punto inicial del eje o defina el eje mediante",
      "revolveAxisEnd": "Precise punto final del eje",
      "revolveSelectAxis": "Designe un objeto",
      "revolveAngleOr": "Precise ángulo de revolución o",
      "revolveStartAngle": "Precise ángulo inicial"
    },
    "promptForms": {
      "convertToPolylines": "open",
      "purgeBlock": "open",
      "selectGripToEditArrayOr": "spaced",
      "selectGripToEditPathArrayOr": "spaced",
      "turnIntoPolyline": "open",
      "ucsMoveOrigin": "tight",
      "ucsOrthographic": "tight",
      "ucsReplace": "open",
      "ucsZdepth": "tight",
      "undoEverything": "open",
      "viewOrthographic": "tight"
    },
    "answerForms": {
      "dimStyleRedefine": "tight",
      "mredoCount": "spaced",
      "selectDimensionsToSpace": "tight",
      "selectGripToEditPathArrayOr": "spaced",
      "selectPolylineOr": "spaced",
      "spaceBaseDimension": "tight",
      "specifyDistanceBetweenRowsOfCell": "spaced",
      "unitCellFirstCorner": "tight"
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
            "to": " a",
            "of": " de",
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
      "keywordSeparator": "/",
      "keywordOr": " o ",
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
        "\" desconocido. Pulse F1 para obtener ayuda."
      ],
      "cancel": "*Cancelar*",
      "commandCancelled": "*Cancelado*",
      "resumingCommand": [
        "Reanudando el comando ",
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
        " (sólo lectura)"
      ],
      "readOnlyListed": "(sólo lectura)",
      "unknownVariableName": "Nombre de variable desconocido. Teclee MODIVAR ?\npara ver la lista de variables.",
      "cannotSetVariable": [
        "Imposible dar a ",
        [
          "name"
        ],
        " ese valor."
      ],
      "requiresZeroOrOne": "Requiere 0 o sólo 1.",
      "requiresZeroOrOneOrKeyword": "Requiere 0 o sólo 1, o una opción.",
      "notTransparent": "** Este comando no funciona de forma transparente **",
      "rotateSettings": [
        "Ángulo actual positivo en SCP:  ANGDIR=en sentido horario inverso ANGBASE=",
        [
          "angbase"
        ]
      ],
      "trimExtendSettings": [
        "Parámetros actuales: Proyección=SCP, Arista=",
        [
          "edge",
          1,
          {
            "extend": "Alargar",
            "other": "Ninguno"
          }
        ],
        ", Modo=",
        [
          "mode",
          1,
          {
            "standard": "Estándar",
            "other": "Rápido"
          }
        ]
      ],
      "selectCuttingEdges": "Seleccione aristas de corte...",
      "selectBoundaryEdges": "Seleccione las aristas de contorno...",
      "doesNotIntersectCuttingEdge": "No se interseca con la arista de corte.",
      "pathDoesNotIntersectBoundingEdge": "La trayectoria no se interseca con la arista de contorno.",
      "objectDoesNotIntersectEdge": "El objeto no se interseca con ninguna arista.",
      "cannotExtendObject": "Objeto no procesado por ALARGA.",
      "cannotExtendThisObject": "Este objeto no se puede ALARGAR.",
      "cannotExtendClosedPolyline": "Imposible alargar polilínea cerrada.",
      "cannotTrimObject": "Objeto no procesado por RECORTA.",
      "cannotTrimThisObject": "Este objeto no se puede RECORTAR.",
      "objectPerpendicularToUcs": "El objeto es perpendicular al plano XY del SCP.",
      "edgePerpendicularToUcs": "La arista es perpendicular al plano XY del SCP.",
      "noEdgeInThatDirection": "No hay límite en esta dirección.",
      "noObjectsCrossedByCrossingWindow": "No hay objetos intersecados en la ventana de captura.",
      "circleMustIntersectTwice": "Se requieren dos intersecciones para el círculo.",
      "curveMustIntersectTwice": "La curva debe intersecar las aristas de corte al menos dos veces.",
      "filletSettings": [
        "Parámetros actuales: Modo = Recortar, Radio = ",
        [
          "radius"
        ]
      ],
      "chamferSettings": [
        "(Modo Recortar) Primera distancia de chaflán actual  = ",
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
      "objectOnLockedLayer": "El objeto está en una capa bloqueada.",
      "objectNotABlock": " Este objeto no es un bloque.",
      "blockHasNoEditableAttributes": " Este bloque no tiene atributos editables.",
      "selectedEntityNotABlock": "La entidad seleccionada no es un bloque.",
      "selectedBlockHasNoEditableAttributes": " El bloque seleccionado no contiene atributos editables.",
      "matchpropSettings": "Parámetros activos actuales:  Color Capa Tlínea Grosor de línea Alt-objeto Acota Texto Sombreado",
      "matchpropLockedDestination": "El objeto de destino no puede actualizarse porque se encuentra en una capa bloqueada.",
      "varies": "varía",
      "layerNotFound": [
        "No se puede encontrar capa \"",
        [
          "name"
        ],
        "\"."
      ],
      "invalidLayerName": "Nombre capa no válido.",
      "linetypeNotLoaded": [
        "Tipo de línea \"",
        [
          "name"
        ],
        "\" no encontrado. Utilice TIPOLIN para cargarlo."
      ],
      "invalidLinetypeName": "Nombre tipo de línea no válido.",
      "cannotChangeThickness": [
        "Imposible cambiar la altura de objeto de ",
        [
          "type",
          1,
          {
            "ellipse": "ELLIPSE",
            "spline": "SPLINE",
            "polyline3d": "Polilíneas 3D",
            "mtext": "MTEXT",
            "dimension": "DIMENSION",
            "hatch": "HATCH",
            "other": "BLOQUEs"
          }
        ],
        "."
      ],
      "invalidThroughPoint": "Punto a atravesar no válido.",
      "cannotOffsetObject": "Imposible transponer este objeto.",
      "cannotOffsetAtViewDirection": "Imposible transponer este objeto en la dirección de la vista actual.",
      "rotatingCopy": "Girando una copia de los objetos seleccionados.",
      "scalingCopy": "Escalando una copia de los objetos seleccionados.",
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
          "duplicate",
          2,
          {
            "=0": "",
            "other": [
              " (",
              0,
              " duplicados)"
            ]
          }
        ],
        [
          "removed",
          2,
          {
            "=0": "",
            "other": [
              ", eliminados ",
              0
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
      "lassoMode": [
        [
          "mode",
          1,
          {
            "window": "Ventana",
            "crossing": "Captura",
            "other": "Borde"
          }
        ],
        " Forma irregular: pulse la barra espaciadora para recorrer las opciones."
      ],
      "onLockedLayer": [
        [
          "count",
          2,
          {
            "one": [
              0,
              " estaba en una capa bloqueada."
            ],
            "other": [
              0,
              " estaban en una capa bloqueada."
            ]
          }
        ]
      ],
      "noPreviousSelection": "No hay ningún conjunto de selección previo.",
      "allSelectionsUndone": "Se han anulado todas las designaciones.",
      "invalidWindowSpecification": "Designación de ventana no válida.",
      "invalidResponse": "Respuesta no válida.",
      "polygonSegmentZeroLength": "Punto no válido: el segmento del polígono tiene una longitud cero.",
      "polygonSegmentsIntersect": "Punto no válido: los segmentos del polígono no pueden intersecarse.",
      "copyModeMultiple": "Parámetros actuales:  modo de copia = Múltiple",
      "stretchSelection": "Designe objetos que estirar mediante ventana o polígono...",
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
        " <Forzcursor ",
        [
          "state",
          1,
          {
            "on": "activado",
            "other": "desactivado"
          }
        ],
        ">"
      ],
      "osnapMode": [
        " <Refent ",
        [
          "state",
          1,
          {
            "on": "activado",
            "other": "desactivado"
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
            "on": "activado",
            "other": "desactivado"
          }
        ],
        ">"
      ],
      "polarMode": [
        " <Polar ",
        [
          "state",
          1,
          {
            "on": "activado",
            "other": "desactivado"
          }
        ],
        ">"
      ],
      "otrackMode": [
        " <Rastreo de referencia a objetos ",
        [
          "state",
          1,
          {
            "on": "activado",
            "other": "desactivado"
          }
        ],
        ">"
      ],
      "gridMode": [
        " <Rejilla ",
        [
          "state",
          1,
          {
            "on": "activado",
            "other": "desactivado"
          }
        ],
        ">"
      ],
      "selectionCyclingMode": [
        " <Ciclo de selección ",
        [
          "state",
          1,
          {
            "on": "activado",
            "other": "desactivado"
          }
        ],
        ">"
      ],
      "everythingDeselected": "Se ha anulado la selección de todo",
      "selectingObjectsDone": "Designando objetos...terminado.",
      "fromNeedsPoint": "DESDE necesita una solicitud de punto.",
      "fromBase": "DESDE: precise el punto base.",
      "fromOffset": "DESDE: desfase desde el punto base.",
      "angleOverride": [
        "Modo momentáneo de ángulo: ",
        [
          "angle"
        ]
      ],
      "zNotAllowed": "Aquí no están permitidas las coordenadas Z.",
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
      "purgeSettings": "Elementos anidados = DES Datos huérfanos = DES",
      "deletingBlock": [
        "Suprimiendo bloque \"",
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
            "other": [
              0,
              " bloque suprimido(s)."
            ]
          }
        ]
      ],
      "noUnreferencedBlocks": "No se ha encontrado ningún elemento sin referencia bloque.",
      "noBlocks": "No hay bloques definidos.",
      "blockUndefined": [
        "El bloque \"",
        [
          "name"
        ],
        "\" no está definido."
      ],
      "hatchPatternUnknown": "Nombre de patrón desconocido.",
      "hatchTooDense": "Intervalo de sombreado demasiado denso o trazo demasiado pequeño.",
      "hatchNoBoundary": "No se ha encontrado un contorno de sombreado válido.",
      "noBoundaryToUndo": "Ningún contorno por deshacer.",
      "areaAlreadySpecified": "Esta área ya se ha especificado.",
      "unableToHatchBoundary": "Imposible sombrear el contorno.",
      "pointOnObject": "El punto está directamente sobre un objeto.",
      "textStyleUndefined": [
        "No se puede encontrar estilo de texto \"",
        [
          "name"
        ],
        "\"."
      ],
      "textJustifyOptions": [
        "Indique una opción [",
        [
          "keywords"
        ],
        "]:"
      ],
      "attributeModes": [
        "Modos de atributo actuales:\nInvisible=",
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
        ],
        "  Anotativo=N  línea Múltiple=N"
      ],
      "enterAttributeValues": "Indique valores de atributo",
      "verifyAttributeValues": "Verificar valores de atributo",
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
      "explodeLostWidth": "Al descomponer esta línea se ha perdido información de grosor.\nSe puede restituir con el comando DESHACER.",
      "explodeCannot": [
        "No se puede descomponer ",
        [
          "name"
        ]
      ],
      "noneFound": "No hallada.",
      "massPropRegionsIgnored": [
        [
          "count",
          2,
          {
            "=1": "1 región ignorada.",
            "other": [
              0,
              " regiones ignoradas."
            ]
          }
        ]
      ],
      "massPropNoneSelected": "No se ha designado ningún sólido o región.",
      "massPropNothingSelected": "No se ha designado nada.",
      "massPropUnableToOpen": [
        "Imposible abrir el archivo ",
        [
          "name"
        ],
        " sobre propiedades físicas y de área."
      ],
      "massPropRegions": [
        "\n ----------------   REGIONES   ---------------- \n\nÁrea:                    ",
        [
          "area"
        ],
        " \nPerímetro:               ",
        [
          "perimeter"
        ],
        " \nCuadro delimitador:         X: ",
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
        " \nCentro de gravedad:             X: ",
        [
          "x"
        ],
        " \n                      Y: ",
        [
          "y"
        ],
        " \nMomentos de inercia:   X: ",
        [
          "momentX"
        ],
        "  \n                      Y: ",
        [
          "momentY"
        ],
        "  \nProducto de inercia:  XY: ",
        [
          "productXY"
        ],
        "  \nRadios de giro:    X: ",
        [
          "radiusX"
        ],
        " \n                      Y: ",
        [
          "radiusY"
        ],
        " \nMomentos principales y direcciones X-Y alrededor del centro de gravedad:\n                      I: ",
        [
          "i"
        ],
        " a lo largo de [",
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
        " a lo largo de [",
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
        "\n ----------------   REGIONES   ---------------- \n\nÁrea:                    ",
        [
          "area"
        ],
        " \nPerímetro:               ",
        [
          "perimeter"
        ],
        " \nCuadro delimitador:         X: ",
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
        " \nCentro de gravedad:             X: ",
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
        "\n ----------------   SOLIDOS    ---------------- \n\nMasa:                     ",
        [
          "mass"
        ],
        " \nVolumen:                  ",
        [
          "volume"
        ],
        " \nCuadro delimitador:   X: ",
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
        " \nCentro de gravedad:   X: ",
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
        " \nMomentos de inercia:  X: ",
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
        "  \nProductos de inercia:XY: ",
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
        "  \nRadios de giro:       X: ",
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
        " \nMomentos principales y direcciones X-Y-Z alrededor del centro de gravedad:\n                      I: ",
        [
          "i"
        ],
        " a lo largo de [",
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
        " a lo largo de [",
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
        " a lo largo de [",
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
      "noneFoundToConvert": "No se ha encontrado ninguno.",
      "onlySplineFittedPolylines": "Solo pueden convertirse en splines las polilíneas ajustadas como spline.",
      "unableToConvertSelectedObject": "Imposible convertir el objeto designado.",
      "currentUcsName": [
        "Nombre de scp actual:  ",
        [
          "kind",
          1,
          {
            "world": "*UNIVERSAL*",
            "unnamed": "*SIN NOMBRE*",
            "top": "*SUPERIOR*",
            "bottom": "*INFERIOR*",
            "front": "*FRONTAL*",
            "back": "*POSTERIOR*",
            "left": "*IZQUIERDA*",
            "right": "*DERECHA*",
            "other": [
              [
                "name"
              ]
            ]
          }
        ]
      ],
      "listedUcsName": [
        "Nombre de scp actual: ",
        [
          "kind",
          1,
          {
            "world": "*UNIVERSAL*",
            "unnamed": "*SIN NOMBRE*",
            "top": "*SUPERIOR*",
            "bottom": "*INFERIOR*",
            "front": "*FRONTAL*",
            "back": "*POSTERIOR*",
            "left": "*IZQUIERDA*",
            "right": "*DERECHA*",
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
      "savedUcsHeader": "Sistemas de coordenadas guardados:",
      "savedUcsEntry": [
        "\"",
        [
          "name"
        ],
        "\"\n     Origen = <",
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
        ">\n     Eje Y = <",
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
        "No se puede encontrar SCP \"",
        [
          "name"
        ],
        "\"."
      ],
      "planUcsNotFound": [
        "No se puede encontrar SCP \"",
        [
          "name"
        ],
        "\"."
      ],
      "noMatchingUcs": "  No se ha encontrado ningún SCP con ese nombre.",
      "ucsDeleted": [
        "Suprimidos ",
        [
          "count"
        ],
        " ",
        [
          "count",
          2,
          {
            "one": "nombre",
            "other": "nombres"
          }
        ],
        " de SCP."
      ],
      "invalidUcsName": "Nombre SCP no válido.",
      "coincidentWithFirstPoint": "Coincide con el primer punto",
      "pointsAreColinear": "Puntos colineales",
      "pointsAreCoincident": "Los puntos coinciden",
      "noSolidSurfaceOrMesh": "No hay ningún sólido, superficie o malla 3D.",
      "ucsNoCoordinateSystem": "Este objeto no define un sistema de coordenadas",
      "polyline3dNoCoordinateSystem": "El objeto polilínea 3D no define el sistema de coordenadas",
      "zAxisNotSupported": "No se admite la opción de eje Z para el objeto seleccionado.",
      "noPreviousUcs": "No hay ningún sistema de coordenadas guardado.",
      "everythingUndone": "Ya se ha deshecho todo",
      "nothingToUndo": "No hay nada que se pueda deshacer",
      "nothingToRedo": "Nada que repetir",
      "everythingRedone": "Todo repetido",
      "redoMustFollowUndo": "REHACER debe ir directamente a continuación del comando H o DESHACER.",
      "alreadyRedone": "Ya se ha repetido la última operación DESHACER.",
      "undoSettings": [
        "Parámetros actuales: Auto = ",
        [
          "auto",
          1,
          {
            "on": "Act",
            "other": "Des"
          }
        ],
        ", Control = ",
        [
          "control",
          1,
          {
            "all": "Todos",
            "one": "Uno",
            "other": "Ninguna"
          }
        ],
        ", Combinar = ",
        [
          "combine",
          1,
          {
            "yes": "Sí",
            "other": "No"
          }
        ],
        ", Capa = ",
        [
          "layer",
          1,
          {
            "yes": "Sí",
            "other": "No"
          }
        ]
      ],
      "markEncountered": "Marca encontrada",
      "startOfGroup": "Se ha encontrado el comienzo del Grupo.\nPara retroceder aún más, utilice DESHACER FIN.",
      "undoGroup": "GRUPO",
      "dropGeometryStep": "SOLTARGEOM GRUPO",
      "menuStep": [
        [
          "command"
        ],
        " GRUPO"
      ],
      "emptyMenuStep": [
        "GRUPO ",
        [
          "command"
        ]
      ],
      "shortcutMenuEntry": [
        [
          "entry",
          1,
          {
            "erase": "Borrar",
            "move": "Desplazar",
            "copySelection": "Copiar selección",
            "scale": "Escala",
            "rotate": "Girar",
            "deselectAll": "Anular selección",
            "properties": "Propiedades",
            "pan": "Encuadre",
            "cut": "Cortar",
            "copy": "Copiar",
            "copyBase": "Copiar con punto base",
            "paste": "Pegar",
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
            "copyBase": "Ctrl+Mayús+C",
            "paste": "Ctrl+V",
            "other": ""
          }
        ]
      ],
      "menuItemStep": "GRUPO menu item",
      "intelliZoomStep": "INTELLIZOOM",
      "intelliPanStep": "INTELLIPAN",
      "viewCubeStep": "'.VIEWCUBEACTION",
      "layerManagerStep": "'.-CAPA",
      "changePropertiesStep": "CAMBPROP",
      "modifyPropertyStep": "Modify Property",
      "gripEditStep": "Editar pinzamiento",
      "uDisabled": "Comando H desactivado. Utilice el comando DESHACER para activarlo",
      "redoDisabled": [
        [
          "command",
          1,
          {
            "mredo": "Comandos REHACER y MREHACER desactivados",
            "other": "Comando REHACER desactivado"
          }
        ],
        ". Usar DESHACER C para activarlo."
      ],
      "requiresIntegerValueOrKeyword": [
        "Requiere un valor ",
        [
          "value"
        ],
        " entero, o una opción."
      ],
      "requiresIntegerBetweenOrKeyword": [
        "Requiere un nº entero entre ",
        [
          "min"
        ],
        " y ",
        [
          "max"
        ],
        ", o una opción."
      ],
      "yesOrNoPlease": "Sí o No.",
      "requiresDistanceNumberXOrKeyword": "Requiere una distancia, un factorX o una opción.",
      "noPreviousView": "No se ha guardado ninguna vista previa.",
      "currentLinetype": [
        "Tipo de línea actual: \"",
        [
          "name"
        ],
        "\""
      ],
      "linetypeByLayer": "PorCapa",
      "linetypeNotFound": [
        "Tipo de línea \"",
        [
          "name"
        ],
        "\" no encontrado en acad.lin.\nPuede utilizar la opción \"Cargar\" para cargarlo desde otro archivo."
      ],
      "loadedLinetypes": "porCapa, porBloque o uno de estos tipos de línea cargados:",
      "linetypeColumns": "      Nombre         Descripción\n---------------- ------------------",
      "linetypesInFile": [
        "Tipos de línea definidos en el archivo ",
        [
          "file"
        ],
        ":"
      ],
      "fileLinetypeColumns": "      Nombre          Descripción\n---------------- -------------------",
      "solidLine": "Línea continua",
      "noMatchingLinetypes": "  Tipo de línea no encontrado.",
      "invalidColorNumber": "Número de color no válido.",
      "tagCannotBeNull": "El identificador no puede ser nulo",
      "attdefTextStyle": [
        "Estilo de texto actual:  \"",
        [
          "style"
        ],
        "\"  Altura del texto:  ",
        [
          "height"
        ],
        "  Justificar:  ",
        [
          "justify"
        ]
      ],
      "blockConversion": "Parámetros actuales: conversión de objetos=Convertir",
      "invalidBlockName": "Nombre de bloque no válido.",
      "invalidNewBlockName": "Nombre bloque no válido.",
      "blockReferencesItself": [
        "El bloque \"",
        [
          "name"
        ],
        "\" hace referencia a sí mismo"
      ],
      "blockRedefined": [
        "Bloque \"",
        [
          "name"
        ],
        "\" redefinido"
      ],
      "zBaseNotZero": "Cuidado, la base de inserción de Z no es cero.",
      "definedBlocks": "Bloques definidos.",
      "definedBlock": [
        "  \"",
        [
          "name"
        ],
        "\""
      ],
      "blockCounts": [
        "Bloques     Referencias     Bloques          Bloques\nusuario     externas        dependientes     sin nombre\n",
        [
          "user"
        ],
        "      ",
        [
          "external"
        ],
        "           ",
        [
          "dependent"
        ],
        "            ",
        [
          "unnamed"
        ]
      ],
      "insertBlockCounts": [
        "Bloques      Bloques\nusuario      sin nombre\n",
        [
          "user"
        ],
        "        ",
        [
          "unnamed"
        ]
      ],
      "rectangleModes": [
        "Modos de rectángulo actuales:",
        [
          "corners",
          1,
          {
            "chamfer": [
              "  Chaflán=",
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
              "  Elevación=",
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
              "  Empalme=",
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
              "  Alt-objeto=",
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
              "  Grosor=",
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
              "  Rotación=",
              [
                "rotation"
              ]
            ],
            "other": ""
          }
        ]
      ],
      "textEditSettings": [
        "Parámetros actuales: Editar modo = ",
        [
          "mode",
          1,
          {
            "single": "Simple",
            "other": "Múltiple"
          }
        ]
      ],
      "totalArea": [
        "Área total = ",
        [
          "total"
        ]
      ],
      "areaReport": [
        "Área = ",
        [
          "area"
        ],
        ", ",
        [
          "measured",
          1,
          {
            "circumference": "Circunferencia",
            "length": "Longitud",
            "other": "Perímetro"
          }
        ],
        " = ",
        [
          "around"
        ]
      ],
      "objectHasNoArea": "El objeto seleccionado no tiene área",
      "polylineWidthIgnored": "Grosor de polilínea ignorado en cálculo de área.",
      "allSegmentsUndone": "Ya están deshechos todos los segmentos.",
      "polyline3dNotLevel": "Vértices de polilínea 3D con coordenadas diferentes.",
      "all3dSegmentsUndone": "Ya se han deshecho todos los segmentos.",
      "distanceTotal": [
        "Distancia = ",
        [
          "value"
        ]
      ],
      "distanceReport": [
        "Distancia = ",
        [
          "distance"
        ],
        ", Ángulo en el plano XY = ",
        [
          "angleInPlane"
        ],
        ", Ángulo a partir del plano XY = ",
        [
          "angleFromPlane"
        ],
        "\nIncremento X = ",
        [
          "deltaX"
        ],
        ", Incremento Y = ",
        [
          "deltaY"
        ],
        ",   Incremento Z = ",
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
      "linesNonCoplanar": "Las líneas no son coplanares.",
      "lineAndPolylineNonCoplanar": "La línea y la polilínea no son coplanares.",
      "twoEntitiesNonCoplanar": "Los dos objetos no son coplanares.",
      "cannotFilletBetween": "Imposible empalmar esos dos objetos.",
      "noValidFillet": [
        "No hay un empalme válido con el radio ",
        [
          "radius"
        ]
      ],
      "cannotFilletItself": "No se puede empalmar un objeto consigo mismo.",
      "chamferNot3dPolyline": "  Puede que los objetos de polilínea 3D no estén unidos con chaflán.",
      "filletNot3dPolyline": "  Puede que los objetos de polilínea 3D no estén unidos con empalme.",
      "collinearCannotFillet": "Las líneas colineales no pueden ser unidos con empalme.",
      "collinearCannotChamfer": "Las líneas colineales no pueden ser unidos con chaflán.",
      "cannotChamferItself": "No se puede achaflanar un objeto consigo mismo.",
      "segmentsNotConsecutive": "Las líneas pertenecientes a polilíneas tienen que ser consecutivas o estar separadas por un segmento",
      "notA2dPolyline": "El objeto designado no es una polilínea 2D.",
      "cornersSkipped": [
        [
          "parallel",
          2,
          {
            "=0": "",
            "one": [
              0,
              " resulta paralela(s)    "
            ],
            "other": [
              0,
              " resultan paralela(s)    "
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
              " resulta demasiado corta(s)    "
            ],
            "other": [
              0,
              " resultan demasiado corta(s)    "
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
              " resulta divergente(s)    "
            ],
            "other": [
              0,
              " resultan divergente(s)    "
            ]
          }
        ]
      ],
      "invalid": "*No válido*",
      "styleNameInUse": [
        "Ya existe un ",
        [
          "table",
          1,
          {
            "dimension": "estilo de cota",
            "other": "estilo de texto"
          }
        ],
        " con el nombre \"",
        [
          "name"
        ],
        "\"."
      ],
      "currentDimStyle": [
        "Estilo de cota actual: ",
        [
          "name"
        ],
        "   Anotativo: No"
      ],
      "unknownDimStyle": "Estilo de cota desconocido.",
      "namedDimStyles": "Estilos de cota guardados:",
      "noMatchingDimStyles": "  Estilo de cota no encontrado.",
      "splineSettingsFit": [
        "Parámetros actuales: Método=Ajustar Nudos=",
        [
          "knots",
          1,
          {
            "chord": "Cuerda",
            "sqrtChord": "Raíz cuadrada",
            "other": "Uniforme"
          }
        ]
      ],
      "splineSettingsCv": [
        "Parámetros actuales: Método=VC   Grado=",
        [
          "degree"
        ]
      ],
      "requiresIntegerBetween": [
        "Requiere un nº entero entre ",
        [
          "min"
        ],
        " y ",
        [
          "max"
        ],
        "."
      ],
      "commandCompletelyUndone": "Todos los efectos del comando han sido deshechos.",
      "commandCompletelyUndoneShort": "Comando deshecho totalmente.",
      "linesParallel": "Las líneas son paralelas",
      "linesDiverge": "Las líneas son divergentes",
      "filletRadiusTooLarge": "Radio de empalme es demasiado grande",
      "chamferDistanceTooLarge": "Distancia de chaflán es demasiado grande",
      "cannotChamferArcSegments": "Imposible unir con chaflán segmentos de arco de polilínea.",
      "chamferRequiresLines": "Chaflán requiere 2 líneas (no segmentos de arco).",
      "cannotFilletBetweenThese": "Imposible empalmar estos dos objetos.",
      "filletRequiresObjects": "Empalme requiere 2 líneas, arcos o círculos.",
      "filletRequiresNotBlocks": "Empalme requiere 2 líneas, arcos o círculos (no referencias a bloque).",
      "filletRequiresNotDimensions": "Empalme requiere 2 líneas, arcos o círculos (no cotas).",
      "unableToFilletCurves": "No se pueden empalmar curvas.",
      "noValidCurveFillet": [
        "Imposible hacer un empalme de radio ",
        [
          "radius"
        ]
      ],
      "entitiesNonCoplanar": "Los objetos no son coplanares.",
      "chamferRequiresTwoLines": "Chaflán requiere 2 líneas.",
      "chamferRequiresNotBlocks": "Chaflán requiere 2 líneas (no referencias a bloque).",
      "chamferRequiresNotDimensions": "Chaflán requiere 2 líneas (no cotas).",
      "cannotChamferBetween": "Imposible hacer un chaflán entre estas dos entidades.",
      "linesChamfered": [
        [
          "count",
          2,
          {
            "one": [
              0,
              " línea resulta unida(s) con chaflán"
            ],
            "other": [
              0,
              " líneas resultan unida(s) con chaflán"
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
              " línea resulta unida(s) con empalme"
            ],
            "other": [
              0,
              " líneas resultan unida(s) con empalme"
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
      "linesJoined": [
        [
          "count"
        ],
        " líneas unidas en 1 línea",
        [
          "discarded",
          2,
          {
            "=0": "",
            "one": [
              ", ",
              0,
              " objeto descartado de la operación"
            ],
            "other": [
              ", ",
              0,
              " objetos descartados de la operación"
            ]
          }
        ]
      ],
      "arcsJoined": [
        [
          "count"
        ],
        " arcos unidos en 1 arco",
        [
          "discarded",
          2,
          {
            "=0": "",
            "one": [
              ", ",
              0,
              " objeto descartado de la operación"
            ],
            "other": [
              ", ",
              0,
              " objetos descartados de la operación"
            ]
          }
        ]
      ],
      "arcsJoinedIntoCircle": [
        [
          "count"
        ],
        " arcos unidos y convertidos a círculo",
        [
          "discarded",
          2,
          {
            "=0": "",
            "one": [
              ", ",
              0,
              " objeto descartado de la operación"
            ],
            "other": [
              ", ",
              0,
              " objetos descartados de la operación"
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
              " objetos convertidos en ",
              0,
              " polilínea"
            ],
            "other": [
              [
                "count"
              ],
              " objetos convertidos a ",
              0,
              " polilíneas"
            ]
          }
        ],
        [
          "discarded",
          2,
          {
            "=0": "",
            "one": [
              ", ",
              0,
              " objeto descartado de la operación"
            ],
            "other": [
              ", ",
              0,
              " objetos descartados de la operación"
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
              " segmento unido"
            ],
            "other": [
              0,
              " segmentos unidos"
            ]
          }
        ],
        " en 1 polilínea",
        [
          "discarded",
          2,
          {
            "=0": "",
            "one": [
              ", ",
              0,
              " objeto descartado de la operación"
            ],
            "other": [
              ", ",
              0,
              " objetos descartados de la operación"
            ]
          }
        ]
      ],
      "segmentsJoinedInto3dPolylines": [
        [
          "polylines",
          2,
          {
            "one": [
              [
                "count",
                2,
                {
                  "one": [
                    0,
                    " segmento unido a 1 polilínea 3D"
                  ],
                  "other": [
                    0,
                    " segmentos unidos en 1 polilínea 3D"
                  ]
                }
              ]
            ],
            "other": [
              [
                "count",
                2,
                {
                  "other": [
                    0,
                    " segmentos unidos"
                  ]
                }
              ],
              " en",
              0,
              " polilíneas 3D"
            ]
          }
        ],
        [
          "discarded",
          2,
          {
            "=0": "",
            "one": [
              ", ",
              0,
              " objeto descartado de la operación"
            ],
            "other": [
              ", ",
              0,
              " objetos descartados de la operación"
            ]
          }
        ]
      ],
      "ellipticalArcsJoined": [
        [
          "count"
        ],
        " arcos elípticos unidos en 1 arco",
        [
          "discarded",
          2,
          {
            "=0": "",
            "one": [
              ", ",
              0,
              " objeto descartado de la operación"
            ],
            "other": [
              ", ",
              0,
              " objetos descartados de la operación"
            ]
          }
        ]
      ],
      "objectsJoinedIntoSplines": [
        [
          "count"
        ],
        " objetos unidos en ",
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
              " splines"
            ]
          }
        ],
        [
          "discarded",
          2,
          {
            "=0": "",
            "one": [
              ", ",
              0,
              " objeto descartado de la operación"
            ],
            "other": [
              ", ",
              0,
              " objetos descartados de la operación"
            ]
          }
        ]
      ],
      "objectsConvertedToSplines": [
        [
          "count"
        ],
        " objetos convertidos en ",
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
              " splines"
            ]
          }
        ],
        [
          "discarded",
          2,
          {
            "=0": "",
            "one": [
              ", ",
              0,
              " objeto descartado de la operación"
            ],
            "other": [
              ", ",
              0,
              " objetos descartados de la operación"
            ]
          }
        ]
      ],
      "objectsJoinedToSource": [
        [
          "count",
          2,
          {
            "one": [
              0,
              " objeto unido"
            ],
            "other": [
              0,
              " objetos unidos"
            ]
          }
        ],
        " al origen",
        [
          "discarded",
          2,
          {
            "=0": "",
            "one": [
              ", ",
              0,
              " objeto descartado de la operación"
            ],
            "other": [
              ", ",
              0,
              " objetos descartados de la operación"
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
              " arco elíptico unido"
            ],
            "other": [
              0,
              " arcos elípticos unidos"
            ]
          }
        ],
        " al origen",
        [
          "discarded",
          2,
          {
            "=0": "",
            "one": [
              ", ",
              0,
              " objeto descartado de la operación"
            ],
            "other": [
              ", ",
              0,
              " objetos descartados de la operación"
            ]
          }
        ]
      ],
      "ellipseClosed": "Elipse cerrada correctamente.",
      "panExit": "Pulse Esc o Intro para salir, o haga clic con el botón derecho para activar el menú contextual.",
      "orbitExit": "Pulse ESC o INTRO para salir, o haga clic con el botón derecho para ver el menú contextual.",
      "requiresTwoPointsOrDisplacement": "Requiere dos puntos o un desplazamiento seguido por INTRO.",
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
      "switchingToWcs": "*** Cambiando al SCU ***",
      "returningToUcs": "*** Volviendo al SCP ***",
      "invalidInputTryAgain": "Entrada no válida. Vuelva a intentarlo.",
      "regeneratingModel": "Regenerando modelo.",
      "regenQueued": "La regeneración está en espera.",
      "requiresRegen": "** Regeneración necesaria, no puede ser transparente.",
      "currentOsnapModes": [
        "Modos refent actuales: ",
        [
          "modes"
        ]
      ],
      "osnapModeName": [
        [
          "mode",
          1,
          {
            "endpoint": "Fin",
            "midpoint": "Med",
            "center": "Cen",
            "quadrant": "Cua",
            "intersection": "Int",
            "insertion": "Ins",
            "perpendicular": "Per",
            "tangent": "Tan",
            "nearest": "Cer",
            "apparentIntersection": "Fic Int",
            "extension": "Ext",
            "other": "Par"
          }
        ]
      ],
      "currentLineweight": [
        "Grosor de línea actual: ",
        [
          "value"
        ]
      ],
      "pointingEdgeOn": "No se puede señalar en un SCP visto de canto.",
      "circleDoesNotExist": "El círculo no existe.",
      "radiusMustBeNonZero": "El radio no debe ser cero.",
      "noLineOrArcToContinue": "No hay línea o arco que se pueda continuar.",
      "allLineSegmentsUndone": "Ya están anulados todos los segmentos.",
      "zeroLengthLineCreated": [
        "Línea de longitud cero creada en (",
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
      "positiveNonzero": "El valor debe ser positivo y diferente de cero.",
      "parameterCannotBeZero": "El parámetro no se puede establecer en 0. Introduzca un número distinto de cero o una expresión.",
      "areaPositiveNonzero": "El valor debe ser positivo y distinto de cero.",
      "valueMustBePositive": "El valor debe ser positivo.",
      "valueMustBeNonzero": "El valor debe ser diferente de cero.",
      "x2dCornerPointOrKeyword": "Xuna esquina 2D o una opción.",
      "previousDirectionNotUcsParallel": [
        "La dirección anterior no es paralela al SCP; usando ",
        [
          "angle"
        ],
        "."
      ],
      "lineweightRequired": "Se precisa un grosor en unidades de grosor de línea.",
      "lineweightRounded": [
        "Grosor de línea redondeado al valor válido más cercano de ",
        [
          "value"
        ]
      ],
      "invalidLineweightNumber": "Número de grosor de línea no válido.",
      "lineweightNone": "Ninguno",
      "lineweightByLayer": "BYLAYER",
      "lineweightListByLayer": "ByLayer",
      "colorRequired": "Se necesita un número o nombre de color normalizado.",
      "invalidTrueColor": "Color no válido. Escriba tres valores separados por comas comprendidos entre 0 y 255.",
      "invalidOsnapModes": "Modos no válidos de referencia a objetos.",
      "invalidPoint": "Punto no válido.",
      "snapNotFound": [
        "No se ha encontrado ",
        [
          "snap",
          1,
          {
            "endpoint": "ptoFINal ",
            "midpoint": "puntoMEDio ",
            "center": "CENtro ",
            "quadrant": "CUAdrante ",
            "intersection": "INTersección ",
            "insertion": "INSerción ",
            "perpendicular": "PERpendicular ",
            "other": ""
          }
        ],
        "para el punto designado."
      ],
      "invalidPoint2d": "Punto 2D no válido.",
      "pointOrKeywordRequired": "Se requiere un punto o una opción.",
      "point2dOrKeywordRequired": "Se requiere un punto 2D o una opción.",
      "pointsMustBeDistinct": "Los puntos tienen que ser distintos.",
      "requiresDistance": [
        "Requiere una distancia numérica",
        [
          "keyword",
          1,
          {
            "yes": [
              [
                "points",
                1,
                {
                  "second": ", un segundo punto o una opción.",
                  "other": ", dos puntos o una opción."
                }
              ]
            ],
            "other": [
              [
                "points",
                1,
                {
                  "second": " o un segundo punto.",
                  "other": " o dos puntos."
                }
              ]
            ]
          }
        ]
      ],
      "requiresAngle": [
        "Requiere un ángulo numérico válido",
        [
          "keyword",
          1,
          {
            "yes": [
              [
                "points",
                1,
                {
                  "second": ", un segundo punto o una opción.",
                  "other": ", dos puntos o una opción."
                }
              ]
            ],
            "other": [
              [
                "points",
                1,
                {
                  "second": " o un segundo punto.",
                  "other": " o dos puntos."
                }
              ]
            ]
          }
        ]
      ],
      "requiresNumber": [
        "Requiere un valor numérico",
        [
          "keyword",
          1,
          {
            "yes": " o una opción.",
            "other": "."
          }
        ]
      ],
      "requiresInteger": [
        "Requiere un valor entero",
        [
          "keyword",
          1,
          {
            "yes": " o una opción.",
            "other": "."
          }
        ]
      ],
      "requiresRadius": "Precisa un radio numérico, un punto en la circunferencia, o \"D\".",
      "requiresTangent": "Requiere una REFENT TAN y la designación de un círculo, arco o línea.",
      "requiresTangentSelection": "*Necesita una referencia a un objeto tangente y que se designe un círculo, arco o línea.",
      "invalidOptionKeyword": "Opción no válida.",
      "ambiguousResponse": "Respuesta ambigua, especifique...",
      "invalidSelection": "*Designación no válida*",
      "expectsPointOr": [
        "Requiere un punto o ",
        [
          "keywords"
        ]
      ],
      "textEditExpectsPoint": [
        "Requiere un punto o úLTimo/",
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
            "subobjects": "Ventana/Captura/MArco/Borde/polígonOV/polígonOC/Añadir/Eliminar/Múltiple/Previo/desHacer/AUto/úNico/Subobjeto/Objeto",
            "oneObject": "Ventana/úLTimo/Captura/MArco/Todos/Borde/polígonOV/polígonOC",
            "singleSet": "Ventana/úLTimo/Captura/MArco/Todos/Borde/polígonOV/polígonOC/Grupo",
            "pathCurve": "Ventana/úLTimo/Captura/MArco/Todos/Borde/polígonOV/polígonOC/Grupo/Previo/AUto",
            "crossingObjects": "Ventana/úLTimo/Captura/MArco/Todos/Borde/polígonOV/polígonOC/Añadir/Eliminar/Múltiple/Previo/desHacer/AUto/úNico",
            "wholeObjects": "Ventana/úLTimo/Captura/MArco/Todos/Borde/polígonOV/polígonOC/Grupo/Añadir/Eliminar/Múltiple/Previo/desHacer/AUto/úNico",
            "faceSet": "Captura/Borde/polígonOC",
            "other": "Ventana/úLTimo/Captura/MArco/Todos/Borde/polígonOV/polígonOC/Grupo/Añadir/Eliminar/Múltiple/Previo/desHacer/AUto/úNico/Subobjeto/Objeto"
          }
        ]
      ],
      "noObjectFound": "No se ha encontrado ningún objeto",
      "arcCannotBeFull360": "Un arco no puede tener 360 grados",
      "objectCannotBeBroken": "Imposible partir este objeto",
      "cannotBreakBlock": "Imposible partir un bloque",
      "cannotBreakClosedAtOnePoint": "No es posible partir una curva periódica cerrada en un solo punto.",
      "arrayType": [
        "Tipo = ",
        [
          "type",
          1,
          {
            "rectangular": "Rectangular",
            "polar": "Polar",
            "other": "Ruta"
          }
        ],
        "  Asociativa = No"
      ],
      "arrayTypeAssociative": [
        "Tipo = ",
        [
          "type",
          1,
          {
            "rectangular": "Rectangular",
            "polar": "Polar",
            "other": "Ruta"
          }
        ],
        "  Asociativa = Sí"
      ],
      "requiresPositiveInteger": "Requiere un nº entero positivo que no sea cero o una opción.",
      "requiresNonzero": "Necesita un valor numérico distinto de cero.",
      "maximumItems": [
        "Número máximo de elementos = ",
        [
          "count"
        ]
      ],
      "pathCurveIsArrayed": "Los objetos seleccionados para la matriz no se pueden seleccionar como curva de trayectoria.",
      "filteredOut": [
        [
          "count",
          2,
          {
            "one": "1 se ha filtrado",
            "other": [
              0,
              " se han filtrado"
            ]
          }
        ]
      ],
      "currentHatchPattern": [
        "Patrón de sombreado actual:  ",
        [
          "name"
        ]
      ],
      "selectingEverything": "Seleccionándolo todo...",
      "selectingEverythingVisible": "Designando todo lo visible...",
      "analyzingSelectedData": "Analizando los datos designados...",
      "analyzingInternalIslands": "Analizando islas internas...",
      "requiresDistanceOrNumberX": "Requiere una distancia (o un factor X).",
      "currentTextStyle": [
        "Estilo de texto actual:  \"",
        [
          "style"
        ],
        "\"  Altura de texto:  ",
        [
          "height"
        ],
        "  Anotativo:  No  Justificar:  ",
        [
          "justify"
        ]
      ],
      "textJustifyName": [
        [
          "justify",
          1,
          {
            "center": "Centro",
            "right": "Derecha",
            "middle": "Medio",
            "tl": "SI",
            "tc": "SC",
            "tr": "SD",
            "ml": "MI",
            "mc": "MC",
            "mr": "MD",
            "bl": "II",
            "bc": "IC",
            "br": "ID",
            "other": "Izquierda"
          }
        ]
      ],
      "textStylesHeader": "Estilos de texto:",
      "textStyleEntry": [
        "Nombre del estilo: ",
        [
          "name"
        ],
        "  Fuente: Arial\n   Altura: ",
        [
          "height"
        ],
        "  Relación anchura/altura: ",
        [
          "width"
        ],
        "  Ángulo de oblicuidad: 0\n   Generación: Normal"
      ],
      "currentTextStyleName": [
        "Estilo de texto actual: \"",
        [
          "name"
        ],
        "\""
      ],
      "currentMTextStyle": [
        "Estilo de texto actual:  \"",
        [
          "style"
        ],
        "\"  Altura del texto:  ",
        [
          "height"
        ],
        "  Anotativo:  No"
      ],
      "invalidStyleName": "Nombre de estilo no válido",
      "lineSpacingRange": [
        "Precise un valor de interlineado entre ",
        [
          "min"
        ],
        " (",
        [
          "minFactor"
        ],
        "x) y ",
        [
          "max"
        ],
        " (",
        [
          "maxFactor"
        ],
        "x), ambos inclusive."
      ],
      "invalidPointInput": "Entrada de punto no válida.",
      "invalidInputCapital": "Entrada no válida.",
      "nonAssociativeDimension": "Se ha creado una cota no asociativa.",
      "dimensionTextIs": [
        "Texto de cota = ",
        [
          "text"
        ]
      ],
      "expectsSingleObject": "Requiere un único objeto.",
      "expectsCornerObject": [
        "Requiere un punto o Ventana/úLTimo/Captura/MArco/Borde/polígonOV/polígonOC/",
        [
          "set",
          1,
          {
            "fillet": "Deshacer/Polilínea/RAdio",
            "filletRadius": "Radio]:",
            "chamfer": "desHacer/Polilínea/Distancia",
            "other": "Distancia"
          }
        ]
      ],
      "lastKeyword": "úLTimo",
      "noObjectSelected": "No se ha designado ningún objeto.",
      "notLineArcOrCircleToDimension": "El objeto designado no es ni una línea ni un círculo.",
      "associativeDimensionRequired": "Requiere una cota asociativa lineal, de coordenada o angular.",
      "selectedObjectNotDimension": "El objeto designado no es una cota.",
      "notCircleOrArc": "El objeto designado no es ni un círculo ni un arco.",
      "notLineArcOrCircle": "El objeto designado no es ni una línea, un arco ni un círculo.",
      "notALine": "El objeto seleccionado no es una línea.",
      "dimLinesParallel": "Las líneas son paralelas.",
      "negativeSpacing": "Valor de intervalo no válido, el valor de intervalo no puede ser negativo.",
      "objectNotSpline": "El objeto designado no es una spline.",
      "splineReversed": "Se ha invertido la spline.",
      "splineMadeRational": "Spline no racional. Se va a convertir.",
      "cannotDeleteBeyond": "Imposible eliminar nada más.",
      "objectNotPolyline": "El objeto designado no es una polilínea",
      "expectsPolylineOr": "Requiere un punto o Ventana/úLTimo/Captura/MArco/Todos/Borde/polígonOV/polígonOC/Múltiple]:",
      "cannotJoinClosedPolyline": "Imposible unir a una polilínea cerrada",
      "segmentsAddedToPolyline": [
        [
          "count"
        ],
        " segmentos añadidos a la polilínea"
      ],
      "segmentsAddedToPolylines": [
        [
          "count"
        ],
        " segmentos añadidos a ",
        [
          "polylines"
        ],
        " polilíneas"
      ],
      "joinTypeIs": [
        "Tipo de junta = ",
        [
          "type",
          1,
          {
            "extend": "Alargar",
            "add": "Añadir segmento",
            "other": "Ambos (Alargar o Añadir)"
          }
        ]
      ],
      "notAFitPoint": "No es ningún punto de ajuste.",
      "notAControlVertex": "No es un vértice de control.",
      "listObjectName": [
        [
          "name",
          1,
          {
            "line": "LINEA",
            "circle": "CIRCULO",
            "arc": "ARCO",
            "ellipse": "ELLIPSE",
            "spline": "SPLINE",
            "lwpolyline": "LWPOLYLINE",
            "polyline": "POLILINEA",
            "vertex": "VERTICE",
            "endSequence": "FIN SECUENCIA",
            "text": "TEXT",
            "mtext": "MTEXT",
            "attdef": "DEFINICIÓN DE ATRIBUTO",
            "attribute": "ATRIBUTO",
            "dimension": "ACOTACION",
            "hatch": "HATCH",
            "insert": "REFERENCIA A BLOQUE",
            "region": "REGION",
            "solid3d": "3DSOLID",
            "other": "MATRIZ"
          }
        ]
      ],
      "listObject": [
        "                  ",
        [
          "name"
        ],
        "  Capa: \"",
        [
          "layer"
        ],
        "\""
      ],
      "listSpace": "                            Espacio: Espacio modelo",
      "listColor": [
        "                   Color: ",
        [
          "color"
        ],
        "    Tipo de línea: \"",
        [
          "linetype"
        ],
        "\""
      ],
      "listLineweight": [
        "                   GrosorLínea: ",
        [
          "lineweight"
        ],
        " mm"
      ],
      "listThickness": [
        "                   Alt-objeto = ",
        [
          "thickness"
        ]
      ],
      "listExtrusion": [
        "Dirección de extrusión relativa al SCP:\n                   X=",
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
        "                de punto, X=",
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
        "             hasta punto, X=",
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
            "yes": "En SCP actual, ",
            "other": ""
          }
        ],
        "Longitud = ",
        [
          "length"
        ],
        ", Ángulo en el plano XY = ",
        [
          "angle"
        ]
      ],
      "listLine3d": [
        "                  3D Longitud = ",
        [
          "length"
        ],
        ", Ángulo del plano XY = ",
        [
          "angle"
        ]
      ],
      "listLineDelta": [
        "                  Incremento X =",
        [
          "x"
        ],
        ",  Incremento Y = ",
        [
          "y"
        ],
        ",  Incremento Z = ",
        [
          "z"
        ]
      ],
      "listCenter": [
        "            centro punto, X=",
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
        "             radio ",
        [
          "radius"
        ]
      ],
      "listCircumference": [
        "     circunferencia ",
        [
          "length"
        ]
      ],
      "listArea": [
        "              área ",
        [
          "area"
        ]
      ],
      "listStartAngle": [
        "           inicial ángulo ",
        [
          "angle"
        ]
      ],
      "listEndAngle": [
        "             final ángulo ",
        [
          "angle"
        ]
      ],
      "listLength": [
        "            longitud ",
        [
          "length"
        ]
      ],
      "listTotalAngle": [
        "             ángulo total ",
        [
          "angle"
        ]
      ],
      "listCurveArea": [
        "                             Área: ",
        [
          "area"
        ]
      ],
      "listCurveCircumference": [
        "                   Circunferencia: ",
        [
          "length"
        ]
      ],
      "listCurveLength": [
        "                         Longitud: ",
        [
          "length"
        ]
      ],
      "listEllipseCenter": [
        "                           Center: X = ",
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
        "                        Eje mayor: X = ",
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
        "                        Eje menor: X = ",
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
        "                    Punto inicial: X = ",
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
        "                      Punto final: X = ",
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
        "                   Ángulo inicial: ",
        [
          "angle"
        ]
      ],
      "listEllipseEndAngle": [
        "                     Ángulo final: ",
        [
          "angle"
        ]
      ],
      "listEllipseRatio": [
        "                  Relación del radio: ",
        [
          "ratio"
        ]
      ],
      "listSplineOrder": [
        "                            Orden: ",
        [
          "order"
        ]
      ],
      "listSplineProperties": [
        "                      Propiedades: ",
        [
          "planar",
          1,
          {
            "yes": "Plana,",
            "other": "No plana,"
          }
        ],
        " ",
        [
          "rational",
          1,
          {
            "yes": "Racional,",
            "other": "No racional,"
          }
        ],
        " ",
        [
          "periodic",
          1,
          {
            "yes": "Periódica",
            "other": "No periódica"
          }
        ]
      ],
      "listSplineRange": [
        "                 Rango de parámetros: Inicio",
        [
          "start"
        ],
        "\n                                     Fin",
        [
          "end"
        ]
      ],
      "listSplineControlCount": [
        "         Número de puntos de apoyo: ",
        [
          "count"
        ]
      ],
      "listSplineControlPoints": [
        "                  Puntos de apoyo: X = ",
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
        "                                   Peso",
        [
          "weight"
        ]
      ],
      "listSplineFitCount": [
        "             Número de puntos de ajuste: ",
        [
          "count"
        ]
      ],
      "listSplineFitPoints": "                  Datos del usuario: Ajustar puntos",
      "listSplineTolerance": [
        "              Tolerancia de punto de ajuste: ",
        [
          "tolerance"
        ]
      ],
      "listSplineStartTangent": "                                   Tangente inicial",
      "listSplineEndTangent": "                                   Tangente final",
      "listLwState": [
        [
          "closed",
          1,
          {
            "yes": "           Cerrada",
            "other": "             Abrir"
          }
        ]
      ],
      "listLwThickness": [
        " Altura del objeto ",
        [
          "thickness"
        ]
      ],
      "listLwConstantWidth": [
        " Anchura constante ",
        [
          "width"
        ]
      ],
      "listLwArea": [
        "              área   ",
        [
          "area"
        ]
      ],
      "listLwLength": [
        "          longitud   ",
        [
          "length"
        ]
      ],
      "listLwPerimeter": [
        "         perímetro   ",
        [
          "length"
        ]
      ],
      "listLwPoint": [
        "          en el punto  X=",
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
        "   anchura inicial ",
        [
          "width"
        ]
      ],
      "listEndingWidth": [
        "     anchura final ",
        [
          "width"
        ]
      ],
      "listBulge": [
        "         curvatura ",
        [
          "bulge"
        ]
      ],
      "listLwCenter": [
        "            centro  X=",
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
        "            centro X=",
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
        "    ángulo inicial ",
        [
          "angle"
        ]
      ],
      "listPolylineEndAngle": [
        "      ángulo final ",
        [
          "angle"
        ]
      ],
      "listPolylineState": [
        [
          "state",
          1,
          {
            "open": "           Abierta",
            "closed": "           Cerrada",
            "openSpline": "           Abierta spline",
            "closedSpline": "           Cerrada spline",
            "openSpace": "           Abierta espacio",
            "closedSpace": "           Cerrada espacio",
            "openSplineSpace": "           Abierta spline espacio",
            "other": "           Cerrada spline espacio"
          }
        ]
      ],
      "listPolylinePerimeter": [
        "         perímetro ",
        [
          "length"
        ]
      ],
      "listVertexPoint": [
        "                en punto; X=",
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
        "                en punto, X=",
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
      "listVertexSpace": "           Espacio",
      "listVertexCurveFit": "                   (Inserción por adaptación de curva)",
      "listVertexSplineFit": "                   (insertado por transformación en spline)",
      "listVertexControl": "                   (punto de apoyo de spline)",
      "listTextStyle": [
        "             Estilo = \"",
        [
          "style"
        ],
        "\""
      ],
      "listTextAnnotative": "        Anotativo: no",
      "listTypeface": [
        "             Tipo de letra = ",
        [
          "font"
        ]
      ],
      "listTextPoint": [
        "  ",
        [
          "point"
        ],
        " punto, X=",
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
            "start": "inicial",
            "center": "centro",
            "end": "final",
            "mid": "mitad",
            "topLeft": "superior/izquierda",
            "topCenter": "superior/centro",
            "topRight": "superior/derecha",
            "midLeft": "mitad/izquierda",
            "midRight": "mitad/derecha",
            "bottomLeft": "inferior/izquierda",
            "bottomCenter": "inferior/centro",
            "other": "inferior/derecha"
          }
        ]
      ],
      "listTextHeight": [
        "            altura ",
        [
          "height"
        ]
      ],
      "listTextValue": [
        "             texto ",
        [
          "text"
        ]
      ],
      "listTextRotation": [
        "          rotación ángulo ",
        [
          "angle"
        ]
      ],
      "listTextWidth": [
        "           anchura factor de escala ",
        [
          "factor"
        ]
      ],
      "listTextOblique": [
        "        oblicuidad ángulo ",
        [
          "angle"
        ]
      ],
      "listTextGeneration": "        generación normal",
      "listAttributeDefault": [
        "       por defecto ",
        [
          "value"
        ]
      ],
      "listAttributePrompt": [
        "         solicitud ",
        [
          "prompt"
        ]
      ],
      "listAttributeTag": [
        "     identificador ",
        [
          "tag"
        ]
      ],
      "listAttributeValue": [
        "             valor ",
        [
          "value"
        ]
      ],
      "listAttributeFlags": [
        "       indicadores ",
        [
          "normal",
          1,
          {
            "yes": "normal",
            "other": [
              [
                "invisible",
                1,
                {
                  "yes": "invisible  ",
                  "other": ""
                }
              ],
              [
                "constant",
                1,
                {
                  "yes": "constante  ",
                  "other": ""
                }
              ],
              [
                "verify",
                1,
                {
                  "yes": "verific.  ",
                  "other": ""
                }
              ],
              [
                "preset",
                1,
                {
                  "yes": "predefinido",
                  "other": ""
                }
              ]
            ]
          }
        ]
      ],
      "listMtextLocation": [
        "Ubicación:        X=",
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
        "Anchura:          ",
        [
          "width"
        ]
      ],
      "listMtextNormal": [
        "Normal:           X=",
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
        "Rotación:        ",
        [
          "angle"
        ]
      ],
      "listMtextHeight": [
        "Altura de texto: ",
        [
          "height"
        ]
      ],
      "listMtextSpacing": [
        "Interlineado:     ",
        [
          "style",
          1,
          {
            "exactly": "Exactamente",
            "other": "Múltiple"
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
        "Enlace:           ",
        [
          "attachment",
          1,
          {
            "tl": "SIzquierda",
            "tc": "SCentro",
            "tr": "SDerecha",
            "ml": "MIzquierda",
            "mc": "MCentro",
            "mr": "MDerecha",
            "bl": "IIzquierda",
            "bc": "ICentro",
            "other": "IDerecha"
          }
        ]
      ],
      "listMtextFlow": "Dirección:        PorEstilo",
      "listMtextContents": [
        "Contenido:        ",
        [
          "contents"
        ]
      ],
      "listDimensionAssociative": "asociativo: no",
      "listDimensionType": [
        "tipo: ",
        [
          "type",
          1,
          {
            "horizontal": "horizontal",
            "vertical": "vertical",
            "rotated": "girada",
            "aligned": "alineado",
            "arc": "arco",
            "radial": "radial",
            "diameter": "diámetro",
            "other": "<lineal, no paralelo al SCP>"
          }
        ]
      ],
      "listDimensionRotation": [
        " rotación: ",
        [
          "angle"
        ]
      ],
      "listDimensionFirstExtension": [
        "1ª extensión    punto definidor X=",
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
        "2ª extensión    punto definidor X=",
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
        "línea de cota punto definidor X=",
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
        "1ª extensión    punto definidor X=",
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
        "2ª extensión    punto definidor X=",
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
        "centro del arco punto definidor X=",
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
        "cota del arco   punto definidor X=",
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
        "punto de definición de centro: X=",
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
        "punto definidor        X=",
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
        "       punto definidor X=",
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
        "ángulo del texto: ",
        [
          "angle"
        ]
      ],
      "listDimensionTextPosition": [
        [
          "user",
          1,
          {
            "yes": "determinada por el usuario",
            "other": "por defecto"
          }
        ],
        " posición del texto: X=",
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
      "listDimensionDefaultText": "texto por defecto",
      "listDimensionTextModifier": [
        "modif. del texto de cota: ",
        [
          "text"
        ]
      ],
      "listDimensionStyle": [
        "estilo de cota: \"",
        [
          "style"
        ],
        "\""
      ],
      "listDimensionOverrides": "modificaciones de estilos de cota:\n DIMUPT      ACT",
      "listDimensionAnnotative": "Anotativo: No",
      "listHatchPattern": [
        "                 Patrón de sombreado ",
        [
          "pattern"
        ]
      ],
      "listHatchAnnotative": "                 Anotativo: no",
      "listHatchScale": [
        "                 Escala de sombreado ",
        [
          "scale"
        ]
      ],
      "listHatchAngle": [
        "                 Orientación del sombreado ",
        [
          "angle"
        ]
      ],
      "listHatchNotAssociative": "                 No asociativo",
      "listHatchArea": [
        "                 Área      ",
        [
          "area"
        ]
      ],
      "listHatchOrigin": [
        "                 Origen    X=",
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
        " Nombre de bloque: \"",
        [
          "name"
        ],
        "\""
      ],
      "listInsertPoint": [
        "                en punto, X=",
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
        "Factor de escala X: ",
        [
          "scale"
        ]
      ],
      "listInsertScaleY": [
        "Factor de escala Y: ",
        [
          "scale"
        ]
      ],
      "listInsertScaleZ": [
        "Factor de escala Z: ",
        [
          "scale"
        ]
      ],
      "listInsertRotation": [
        "ángulo de rotación: ",
        [
          "angle"
        ]
      ],
      "listInsertUnits": [
        "      UnidadesIns: ",
        [
          "unit",
          1,
          {
            "cm": "Centímetros",
            "m": "Metros",
            "other": "Milímetros"
          }
        ]
      ],
      "listInsertConversion": [
        "Conversión de unidades: ",
        [
          "factor"
        ]
      ],
      "listInsertUniform": "Aplicar escala uniforme: No",
      "listInsertExploding": "Permitir descomposición: Sí",
      "listArrayType": [
        "  Tipo de matriz:  ",
        [
          "kind",
          1,
          {
            "rectangular": "Rectangular",
            "polar": "    Polar",
            "other": "     Ruta"
          }
        ]
      ],
      "listArrayBasePoint": [
        "      Punto base:  X=",
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
        "          Centro:  X=",
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
        "       Número de columnas:  ",
        [
          "count"
        ]
      ],
      "listArrayColumnSpacing": [
        "    Espaciado de columnas:  ",
        [
          "spacing"
        ]
      ],
      "listArrayRows": [
        "          Número de filas:  ",
        [
          "count"
        ]
      ],
      "listArrayRowSpacing": [
        "       Espaciado de filas:  ",
        [
          "spacing"
        ]
      ],
      "listArrayRowElevation": [
        "  Incremento de elevación de fila:  ",
        [
          "spacing"
        ]
      ],
      "listArrayLevels": [
        "        Número de niveles:  ",
        [
          "count"
        ]
      ],
      "listArrayLevelSpacing": [
        "     Espaciado de niveles:  ",
        [
          "spacing"
        ]
      ],
      "listArrayAxisAngle": [
        "  Incluye el ángulo de eje:  ",
        [
          "angle"
        ]
      ],
      "listArrayRadius": [
        "                    Radio:  ",
        [
          "radius"
        ]
      ],
      "listArrayItems": [
        "      Número de elementos:  ",
        [
          "count"
        ]
      ],
      "listArrayAngleBetween": [
        "   Ángulo entre elementos:  ",
        [
          "angle"
        ]
      ],
      "listArrayFillAngle": [
        "        Ángulo de relleno:  ",
        [
          "angle"
        ]
      ],
      "listArrayItemSpacing": [
        "   Espaciado de elementos:  ",
        [
          "spacing"
        ]
      ],
      "listArrayStartOffset": [
        "          Desfase inicial:  ",
        [
          "spacing"
        ]
      ],
      "listArrayEndOffset": [
        "            Desfase final:  ",
        [
          "spacing"
        ]
      ],
      "listArrayDirection": [
        "                Dirección:  ",
        [
          "direction",
          1,
          {
            "clockwise": "  Horaria",
            "other": "Antihoraria"
          }
        ]
      ],
      "listArrayRotate": [
        "            Girar objetos:  ",
        [
          "answer",
          1,
          {
            "yes": "       Sí",
            "other": "       No"
          }
        ]
      ],
      "listArrayMethod": [
        "          Método:  ",
        [
          "method",
          1,
          {
            "measure": "    Medir",
            "other": "  Dividir"
          }
        ]
      ],
      "listArrayAlign": [
        "        Alinear elementos:  ",
        [
          "answer",
          1,
          {
            "yes": "       Sí",
            "other": "       No"
          }
        ]
      ],
      "regionNoneFound": "No se ha encontrado ninguno.",
      "regionObjectsRejected": [
        "Se ha rechazado ",
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
        ],
        " cerrado, dañado o no admitido."
      ],
      "regionOpenNotCoplanar": "Los objetos abiertos deben ser coplanares.",
      "regionLoopsExtracted": [
        [
          "count",
          2,
          {
            "one": [
              0,
              " bucle"
            ],
            "other": [
              0,
              " bucles"
            ]
          }
        ],
        " extraído(s)."
      ],
      "regionLoopsRejected": [
        [
          "count",
          2,
          {
            "one": [
              0,
              " bucle"
            ],
            "other": [
              0,
              " bucles"
            ]
          }
        ],
        " rechazado(s)."
      ],
      "regionSelfIntersections": [
        "    Autointersecciones                     : ",
        [
          "count",
          2,
          {
            "one": [
              0,
              " bucle."
            ],
            "other": [
              0,
              " bucles."
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
              0,
              " región"
            ],
            "other": [
              0,
              " regiones"
            ]
          }
        ],
        " creada(s)."
      ],
      "nullRegion": "Región nula creada - eliminada.",
      "booleanNeedsTwo": "Hay que designar al menos 2 sólidos, superficies o regiones coplanares.",
      "subtractFrom": "Designe sólidos, superficies y regiones de las que sustraer...",
      "subtractWhat": "Designe sólidos, superficies y regiones de las que sustraer...",
      "regionAreaReport": [
        "Área = ",
        [
          "area"
        ],
        ", área recortada = ",
        [
          "trimmed"
        ],
        " , Perímetro = ",
        [
          "around"
        ]
      ],
      "boxZeroLength": "No puede ser un Prisma de longitud cero.",
      "boxZeroWidth": "No puede ser un Prisma de anchura cero.",
      "boxValueNonzero": "No puede ser un valor igual a cero.",
      "wedgeZeroLength": "No puede ser un Cuña de longitud cero.",
      "wedgeZeroWidth": "No puede ser un Cuña de anchura cero.",
      "pyramidSettings": [
        " ",
        [
          "sides"
        ],
        " lados ",
        [
          "type",
          1,
          {
            "inscribed": "inscritos",
            "other": "circunscritos"
          }
        ]
      ],
      "pointsCollinear": "Los puntos no pueden ser colineales. *No válido*",
      "pointsCoincident": "Los puntos no pueden coincidir. *No válido*",
      "ellipseAxesNonzero": "Las longitudes de los ejes de la elipse deben ser positivas y distintas de cero",
      "solidTangentRequired": [
        [
          "typed",
          1,
          {
            "yes": "*",
            "other": ""
          }
        ],
        "Requiere una REFENT TAN y la designación de un círculo, arco o línea."
      ],
      "torusTubeTooSmall": [
        "Si el radio del toroide es ",
        [
          "radius"
        ],
        ", el radio de sección debe ser superior a ",
        [
          "minimum"
        ],
        "."
      ],
      "listSolidHistory": "         Historial = Ninguno\n Mostrar historial = No",
      "listSolidType": [
        "    Tipo de sólido = ",
        [
          "type",
          1,
          {
            "extrusion": "Extrusión",
            "revolve": "Revolución",
            "wedge": "Cuña",
            "pyramid": "Pirámide",
            "cylinder": "Cilindro",
            "cone": "Cono",
            "sphere": "Esfera",
            "torus": "Toroide",
            "other": "Prisma"
          }
        ]
      ],
      "listBoxPosition": [
        "         Posición, X = ",
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
        "           Normal: X = ",
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
        "         Longitud: ",
        [
          "length"
        ]
      ],
      "listBoxWidth": [
        "          Anchura: ",
        [
          "width"
        ]
      ],
      "listBoxHeight": [
        "           Altura: ",
        [
          "height"
        ]
      ],
      "listBoxRotation": [
        "         Rotación: ",
        [
          "angle"
        ]
      ],
      "listPyramidInscribedBase": [
        "   Radio de base inscrito: ",
        [
          "radius"
        ]
      ],
      "listPyramidCircumscribedBase": [
        "Radio de base circunscrito: ",
        [
          "radius"
        ]
      ],
      "listPyramidInscribedTop": [
        "  Radio superior inscrito: ",
        [
          "radius"
        ]
      ],
      "listPyramidCircumscribedTop": [
        "Radio superior circunscrito: ",
        [
          "radius"
        ]
      ],
      "listPyramidSides": [
        "  Número de lados: ",
        [
          "sides"
        ]
      ],
      "listRoundRadius": [
        "            Radio: ",
        [
          "radius"
        ]
      ],
      "listRoundMajorRadius": [
        "      Radio mayor: ",
        [
          "radius"
        ]
      ],
      "listRoundMinorRadius": [
        "      Radio menor: ",
        [
          "radius"
        ]
      ],
      "listConeBaseRadius": [
        "    Radio de base: ",
        [
          "radius"
        ]
      ],
      "listConeTopRadius": [
        "   Radio superior: ",
        [
          "radius"
        ]
      ],
      "listConeBaseMajorRadius": [
        "Radio mayor de base: ",
        [
          "radius"
        ]
      ],
      "listConeBaseMinorRadius": [
        "Radio menor de base: ",
        [
          "radius"
        ]
      ],
      "listConeTopMajorRadius": [
        "Radio mayor superior: ",
        [
          "radius"
        ]
      ],
      "listTorusRadius": [
        " Radio de toroide: ",
        [
          "radius"
        ]
      ],
      "listTubeRadius": [
        " Radio de sección: ",
        [
          "radius"
        ]
      ],
      "listRegionArea": [
        "                             Área: ",
        [
          "area"
        ]
      ],
      "listRegionPerimeter": [
        "                        Perímetro: ",
        [
          "perimeter"
        ]
      ],
      "listRegionBounds": [
        "Cuadro delimitador: Límite inferior X = ",
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
        "\n                 Límite superior X = ",
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
        "Densidad de estructura alámbrica actual: ISOLINES=",
        [
          "isolines"
        ],
        ", Modo de creación de perfiles cerrados = Sólido"
      ],
      "sweepRefused": [
        "No se puede barrer ni extruir un objeto de este tipo.\n",
        [
          "count",
          2,
          {
            "one": [
              "Se ha eliminado ",
              0,
              " objeto del conjunto de selección."
            ],
            "other": [
              "Se han eliminado ",
              0,
              " objetos del conjunto de selección."
            ]
          }
        ]
      ],
      "sweepNothingSelected": "No se ha designado nada.",
      "sweepSelfIntersecting": "No se puede barrer ni extruir una curva que se interseca a sí misma",
      "extrudeValueNonzero": "El valor debe ser diferente de cero.",
      "taperAngleRange": "Debe ser un ángulo superior a -90º e inferior a 90º.",
      "directionCoincident": "Los puntos coinciden.",
      "directionParallel": "La dirección de extrusión es paralela al plano de la curva de barrido.",
      "expressionSyntax": "La sintaxis no es correcta o no se ha definido una variable. Vuelva a introducir la expresión o el valor.",
      "listExtrusionHeight": [
        "Altura de extrusión: ",
        [
          "height"
        ]
      ],
      "listTaperAngle": [
        "Ángulo Inclinación: ",
        [
          "angle"
        ]
      ],
      "revolveRefused": [
        "No se puede efectuar la revolución de un objeto de este tipo.\n",
        [
          "count",
          2,
          {
            "one": [
              "Se ha eliminado ",
              0,
              " objeto del conjunto de selección."
            ],
            "other": [
              "Se han eliminado ",
              0,
              " objetos del conjunto de selección."
            ]
          }
        ]
      ],
      "revolveOneSide": "El objeto debe encontrarse a un lado del eje.",
      "revolveUnable": "Imposible efectuar la revolución del objeto designado.",
      "revolvePerpendicular": "El eje de revolución es perpendicular al plano de la curva de revolución.",
      "revolveZeroAxis": "El eje no puede tener longitud cero.",
      "revolveClosedAxis": "No se puede obtener la dirección del eje a partir de una curva cerrada o una arista.",
      "listRevolveStart": [
        "   Ángulo inicial: ",
        [
          "angle"
        ]
      ],
      "listRevolveAngle": [
        "Ángulo de revolución: ",
        [
          "angle"
        ]
      ],
      "listDirectionVector": [
        "Vector de dirección: X = ",
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
      ]
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
      "deferredTangent": "Tangente diferida",
      "deferredPerpendicular": "Perpendicular diferida",
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
      "ucsIconZ": "Z",
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
      ]
    },
    "keywordLabels": {
      "CIRCLE": {
        "Ttr": "Ttr (Tangente tangente radio)"
      },
      "TRIM": {
        "cuTting": "aristas de COrte",
        "Noextend": "No alargar"
      },
      "EXTEND": {
        "Boundary": "aristas de COrte",
        "Noextend": "No alargar"
      },
      "POLYGON": {
        "Inscribed": "Inscrito en el círculo",
        "Circumscribed": "Circunscrito alrededor del círculo"
      },
      "PYRAMID": {
        "Axis": "punto final Eje",
        "Top": "Radio superior"
      },
      "CYLINDER": {
        "Axis": "punto final Eje"
      },
      "CONE": {
        "Axis": "punto final Eje",
        "Top": "Radio superior"
      },
      "CIRCLED": {
        "Ttr": "Ttr (Tangente tangente radio)"
      },
      "PLINE": {
        "Halfwidth": "Mitad grosor",
        "Second pt": "Segundo pto."
      },
      "DIST": {
        "Line": "líNea",
        "Direction": "Dirección",
        "Multiple": "puntos Múltiples",
        "Second pt": "Segundo pto."
      },
      "RECTANG": {
        "Pick": "Designar puntos"
      },
      "AREA": {
        "Add": "Añadir área",
        "Subtract": "Sustraer área"
      },
      "MTEXT": {
        "Line spacing": "Interlineado",
        "At least": "Al menos"
      },
      "TEXT": {
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
      "ATTDEF": {
        "TL": "SIZ",
        "TC": "SC",
        "TR": "SD",
        "ML": "MI",
        "MC": "MC",
        "MR": "MD",
        "BL": "II",
        "BC": "IC",
        "BR": "ID",
        "Lock position": "Bloquear posición"
      },
      "ATTDISP": {
        "ON": "ACT",
        "OFF": "DES"
      },
      "SNAP": {
        "OFF": "DES"
      },
      "FILL": {
        "OFF": "DES"
      },
      "UNDO": {
        "OFF": "DES"
      },
      "ARC": {
        "Center": "Centro"
      },
      "ARCSCE": {
        "Center": "Centro"
      },
      "ELLIPSE": {
        "Included angle": "ángulo Incluido"
      },
      "ELLIPSEC": {
        "Included angle": "ángulo Incluido"
      },
      "ELLIPSEARC": {
        "Included angle": "ángulo Incluido"
      },
      "PLAN": {
        "Current ucs": "scp Actual"
      },
      "SPLINE": {
        "Square root": "raíz cuaDrada",
        "start Tangency": "iniciar Tangencia",
        "end Tangency": "finalizar Tangencia"
      },
      "SPLINEDIT": {
        "After": "Después",
        "Fit data": "Ajustar datos",
        "Edit vertex": "Editar vértices",
        "convert to Polyline": "coNvertir en polilínea",
        "Reverse": "Invertir",
        "eXit": "Salir",
        "Elevate order": "Elevar orden",
        "Select point": "Designar punto",
        "System default": "Defecto sistema"
      },
      "PEDIT": {
        "Edit vertex": "Editar vértices",
        "Ltype gen": "generarTlínea",
        "OFF": "DES",
        "Jointype": "Tipo de junta",
        "Spline curve": "curva Spline"
      },
      "HATCH": {
        "Select objects": "Designar objetos"
      },
      "BREAK": {
        "First point": "Primer punto"
      },
      "ARRAYRECT": {
        "Unit cell": "célula de Unidad"
      },
      "ARRAYPOLAR": {
        "Angle between": "ángUlo entre",
        "Fill angle": "ángulo de Relleno",
        "ROTate items": "Girar objetos"
      },
      "ARRAYPATH": {
        "Align items": "ALinear elementos",
        "Fill entire path": "Llenar todo el camino"
      },
      "COPY": {
        "Displacement": "Desplazamiento"
      },
      "UCSICON": {
        "Noorigin": "Sin origen"
      },
      "OFFSET": {
        "Through": "punto a Atravesar"
      },
      "EXTRUDE": {
        "Taper": "ángulo Inclinación"
      },
      "REVOLVE": {
        "STart": "ángulo Inicial"
      }
    },
    "promptKeywordLabels": {
      "ucsNewUcs": {
        "ZAxis": "ejEZ"
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
      "dimVariableOn": "ACT",
      "dimVariableOff": "DES",
      "dimVariableDescription": {
        "DIMSTYLE": "Estilo de cota actual (de sólo lectura)",
        "DIMADEC": "Decimales angulares",
        "DIMASZ": "Tamaño de la flecha",
        "DIMCEN": "Tamaño de la marca de centro",
        "DIMDEC": "Precisión decimal",
        "DIMDLI": "Intervalo para continuar la línea de cota",
        "DIMDSEP": "Separador decimal",
        "DIMEXE": "Extensión sobre la línea de cota",
        "DIMEXO": "Desfase línea de referencia - origen",
        "DIMGAP": "Distancia entre el texto y la línea de cota",
        "DIMSCALE": "Factor de escala general",
        "DIMTOFL": "Forzar línea dentro de las líneas de referencia",
        "DIMTXT": "Altura del texto",
        "DIMZIN": "Supresión de ceros"
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
        "SOLID": " Relleno sólido",
        "ANGLE": " acero angular",
        "ANSI31": " ANSI albañilería de acero, ladrillo, piedra",
        "ANSI32": " ANSI acero",
        "ANSI33": " ANSI bronce, latón, cobre",
        "ANSI34": " ANSI plástico, goma",
        "ANSI35": " ANSI ladrillo o material refractario",
        "ANSI36": " ANSI mármol, esquisto, vidrio",
        "ANSI37": " ANSI plomo, cinc, magnesio, aislamiento térmico/fónico/eléct",
        "ANSI38": " ANSI aluminio",
        "LINE": "líneas paralelas horizontales",
        "NET": "rejilla",
        "NET3": "rejilla triangular 0-60-120",
        "DASH": "líneas de trazos",
        "SQUARE": " pequeños cuadrados alineados",
        "STEEL": "acero",
        "BRICK": "superficie de ladrillos o albañilería",
        "CROSS": "serie de cruces",
        "ZIGZAG": "efecto de escalera",
        "HONEY": "panal",
        "EARTH": "tierra o subsuelo",
        "DOTS": "serie de puntos",
        "AR-SAND": " patrón aleatorio de puntos",
        "AR-CONC": " patrón aleatorio de puntos y piedras"
      }
    },
    "defaults": {
      "layer": [
        "Capa",
        [
          "n"
        ]
      ],
      "textStyle": [
        "Estilo",
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
