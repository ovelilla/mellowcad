// Generated from es.json by `npm run locales`. Do not edit.
import type { EditorLocale } from "./types"

export const es: EditorLocale = {
  "tag": "es",
  "messages": {
    "Workspace": {
      "canvas": "Lienzo de dibujo CAD"
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
      "copyBase": "Ctrl+Mayús+C",
      "paste": "Ctrl+V"
    },
    "TitleBar": {
      "menu": "Menú de la aplicación",
      "new": "Nuevo",
      "open": "Abrir",
      "save": "Guardar",
      "saveAs": "Guardar como",
      "newHint": "Crea un nuevo dibujo",
      "newDrawing": "Dibujo",
      "newDrawingHint": "Cree un nuevo dibujo.",
      "openHint": "Abrir un archivo",
      "openDrawing": "Dibujo",
      "openDrawingHint": "Abra un archivo de dibujo ya existente.",
      "saveAsHint": "Guardar una copia del dibujo",
      "saveAsDrawing": "Dibujo",
      "saveAsDrawingHint": "Guarde el dibujo actual en el formato de archivo de dibujo por defecto.",
      "saveAsOther": "Otros formatos",
      "saveAsOtherHint": "Guarde el dibujo actual en un formato de archivo DXF.",
      "utilities": "Ayudas al dibujo",
      "utilitiesHint": "Herramientas de mantenimiento del dibujo",
      "units": "Unidades",
      "unitsHint": "Controle el formato de coordenadas, el ángulo de visualización y la precisión.",
      "openDocuments": "Documentos abiertos",
      "language": "Idioma",
      "feedback": "Enviar comentarios",
      "help": "Ayuda",
      "saving": "Guardando…",
      "saved": "Guardado",
      "savedHint": "Guardado en este dispositivo",
      "undo": "Deshacer",
      "redo": "Rehacer",
      "undoCount": [
        [
          "count",
          2,
          {
            "=1": [
              "Deshacer ",
              0,
              " comando"
            ],
            "other": [
              "Deshacer ",
              0,
              " comandos"
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
              "Repetir ",
              0,
              " comando"
            ],
            "other": [
              "Repetir ",
              0,
              " comandos"
            ]
          }
        ]
      ]
    },
    "NavigationBar": {
      "label": "Barra de navegación",
      "zoom": "Zoom",
      "extents": "Extensión",
      "window": "Zoom ventana",
      "previous": "Previo",
      "in": "Acercar",
      "out": "Alejar"
    },
    "Viewport": {
      "view": [
        "Controles de vista: ",
        [
          "name"
        ]
      ]
    },
    "ViewCube": {
      "label": "ViewCube",
      "home": "Inicio",
      "parallel": "Paralelo",
      "setHome": "Definir vista actual como inicio",
      "rollClockwise": "Girar en sentido horario",
      "rollCounterclockwise": "Girar en sentido antihorario",
      "wcs": "SCU",
      "unnamed": "S-nombre",
      "newUcs": "Nuevo SCP",
      "adjacent": {
        "up": "Ver la cara de arriba",
        "down": "Ver la cara de abajo",
        "left": "Ver la cara de la izquierda",
        "right": "Ver la cara de la derecha"
      }
    },
    "Ribbon": {
      "tabs": {
        "home": "Inicio",
        "insert": "Inserción",
        "annotate": "Anotar",
        "tools3d": "Herramientas 3D",
        "view": "Vista"
      },
      "panels": {
        "draw": "Dibujo",
        "modify": "Modificar",
        "annotation": "Anotación",
        "layers": "Capas",
        "block": "Bloque",
        "properties": "Propiedades",
        "utilities": "Utilidades",
        "clipboard": "Portapapeles",
        "insertBlock": "Bloque",
        "blockDefinition": "Definición de bloque",
        "text": "Texto",
        "dimensions": "Cotas",
        "markup": "Marca de revisión",
        "viewportTools": "Herramientas de ventana gráfica",
        "visualStyles": "Estilos visuales",
        "coordinates": "Coordenadas",
        "palettes": "Paletas",
        "navigate": "Navegar",
        "modeling": "Modelado",
        "solidEditing": "Editar sólidos",
        "coordinates3d": "Coordenadas"
      },
      "items": {
        "line": "Línea",
        "polyline": "Polilínea",
        "circle": "Centro, Radio",
        "circlediameter": "Centro, Diámetro",
        "circle2p": "2 puntos",
        "circle3p": "3 puntos",
        "arc": "3 puntos",
        "arcsce": "Inicio, Centro, Fin",
        "arccse": "Centro, Inicio, Fin",
        "rectangle": "Rectángulo",
        "polygon": "Polígono",
        "ellipsecenter": "Centro",
        "ellipse": "Ejes, Fin",
        "ellipsearc": "Arco elíptico",
        "hatch": "Sombreado",
        "splinefit": "Ajuste de spline",
        "splinecv": "VC de spline",
        "xline": "Línea de construcción",
        "ray": "Rayo",
        "point": "Varios puntos",
        "divide": "Dividir",
        "measuresegments": "Medir",
        "region": "Región",
        "wipeout": "Cobertura",
        "polyline3d": "Polilínea 3D",
        "move": "Desplazar",
        "copy": "Copiar",
        "stretch": "Estirar",
        "rotate": "Girar",
        "mirror": "Simetría",
        "scale": "Escala",
        "trim": "Recortar",
        "extend": "Alargar",
        "fillet": "Empalme",
        "chamfer": "Chaflán",
        "array": "Matriz rectangular",
        "arraypath": "Matriz de camino",
        "arraypolar": "Matriz polar",
        "erase": "Borrar",
        "explode": "Descomponer",
        "offset": "Desfase",
        "pedit": "Editar polilínea",
        "splinedit": "Editar spline",
        "break": "Partir",
        "breakatpoint": "Partir en un punto",
        "join": "Juntar",
        "mtext": "Texto de líneas múltiples",
        "text": "Una línea",
        "dimlinear": "Lineal",
        "dimaligned": "Alineada",
        "dimangular": "Angular",
        "dimradius": "Radio",
        "dimdiameter": "Diámetro",
        "textStyle": "Estilo de texto",
        "dimensionStyle": "Estilo de cota",
        "manageTextStyles": "Administrar estilos de texto...",
        "manageDimensionStyles": "Administrar estilos de cota...",
        "layerProperties": "Propiedades de capa",
        "insert": "Insertar",
        "block": "Crear",
        "attedit": "Única",
        "attdef": "Definir atributos",
        "matchprop": "Igualar propiedades",
        "list": "Lista",
        "measure": "Distancia",
        "measurearea": "Área",
        "id": "Coordenadas punto",
        "ptype": "Tipo de punto...",
        "paste": "Pegar",
        "cutclip": "Cortar",
        "copyclip": "Copiar",
        "copybase": "Copiar con punto base",
        "createBlock": "Crear bloque",
        "dimspace": "Ajustar espacio",
        "dimensionUpdate": "Actualizar",
        "dimcontinue": "Continuar",
        "dimbaseline": "Línea base",
        "ucsIcon": "Icono SCP",
        "viewCube": "View Cube",
        "ucs": "SCP",
        "ucsWorld": "SCP, Universal",
        "ucsX": "X",
        "ucsY": "Y",
        "ucsZ": "Z",
        "ucsPrevious": "SCP, Previo",
        "ucsOrigin": "Origen",
        "ucsZAxis": "Vector Z",
        "ucs3Point": "3 puntos",
        "ucsView": "Vista",
        "ucsObject": "Objeto",
        "ucsFace": "Cara",
        "propertiesPalette": "Propiedades",
        "blocksPalette": "Bloq.",
        "commandLine": "Línea de comando",
        "pan": "Enc",
        "orbit": "Órbita",
        "zoomExtents": "Extensión",
        "zoomWindow": "Ventana",
        "zoomPrevious": "Previo",
        "zoomIn": "Ampliar",
        "zoomOut": "Reducir",
        "box": "De textura cuadrada",
        "cylinder": "Cilindro",
        "cone": "Cono",
        "sphere": "Esfera",
        "pyramid": "Pirámide",
        "wedge": "Cuña",
        "torus": "Toroide",
        "extrude": "Extrusión",
        "revolve": "Revolución",
        "presspull": "Presionartirar",
        "filletedge": "Empalmar aristas",
        "chamferedge": "Achaflanar aristas",
        "slice": "Corte",
        "union": "Unión",
        "subtract": "Diferencia",
        "intersect": "Intersección",
        "solideditextrude": "Extruir caras",
        "solidedittaper": "Inclinar caras",
        "solideditmove": "Desplazar caras",
        "solideditcopy": "Copiar caras",
        "solideditoffset": "Desfasar caras",
        "solideditrotate": "Girar caras",
        "solideditdelete": "Suprimir caras",
        "insertAttedit": "Única",
        "defineAttributes": "Definir atributos",
        "multilineText": "T. líneas múltiples",
        "dimensionsLinear": "Lineal",
        "dimensionsAligned": "Alineada",
        "dimensionsAngular": "Angular",
        "dimensionsRadius": "Radio",
        "dimensionsDiameter": "Diámetro",
        "axisX": "X",
        "axisY": "Y",
        "axisZ": "Z",
        "view3d": "Vista",
        "world": "Universal",
        "previous": "Previo",
        "attModeNormal": "Conservar visualización de atributos",
        "attModeOn": "Mostrar todos los atributos",
        "attModeOff": "Ocultar todos los atributos"
      },
      "splits": {
        "circle": "Círculo",
        "arc": "Arco",
        "text": "Texto",
        "array": "Matriz",
        "measure": "Medir",
        "editAttributes": "Editar atributos",
        "editAttribute": "Editar atributo",
        "rotateUcs": "Girar SCP",
        "defineUcs": "Definir SCP"
      },
      "layer": "Capa",
      "color": "Color de objeto",
      "lineweight": "Grosor de línea",
      "linetype": "Tipo de línea",
      "pin": "Fijar",
      "moreColors": "Más colores...",
      "minimize": {
        "full": "Mostrar cinta de opciones completa",
        "tabs": "Minimizar a fichas",
        "panelTitles": "Minimizar a títulos de grupo",
        "panelButtons": "Minimizar a botones de grupo",
        "cycle": "Recorrer todo cíclicamente"
      }
    },
    "CommandLine": {
      "label": "Línea de comando",
      "placeholder": "Escriba un comando (LINEA, RR, CP…)",
      "history": "Historial de comandos"
    },
    "DynamicInput": {
      "locked": "bloqueado"
    },
    "StatusBar": {
      "coordinates": "Coordenadas",
      "model": "MODELO",
      "modelSpace": "Espacio modelo",
      "grid": "Rejilla",
      "objectSnap": "Referencia a objetos",
      "objectSnapSettings": "Parámetros de referencia a objetos",
      "snapMode": "Modo Forzcursor",
      "snapSettings": "Parámetros de forzcursor",
      "snap": "Forzcursor",
      "gridSnap": "Referencia a rejilla",
      "polarSnap": "Referencia polar",
      "snapX": "Forzcursor X",
      "snapXSpacing": "Distancia resolución X",
      "snapY": "Forzcursor Y",
      "snapYSpacing": "Distancia resolución Y",
      "polarDistance": "Distancia polar",
      "polarSnapDistance": "Distancia de forzcursor polar",
      "ortho": "Modo Orto",
      "polarTracking": "Rastreo polar",
      "polarTrackingAngle": "Ángulo de rastreo polar",
      "polarAngle": "Ángulo polar",
      "objectSnapTracking": "Rastreo de referencia a objetos",
      "selectionCycling": "Ciclo de selección",
      "selectionCyclingSettings": "Parámetros del ciclo de selección",
      "selectionList": "Mostrar el cuadro de lista de selección",
      "showLineweight": "Mostrar grosor de línea",
      "units": "Unidades",
      "cleanScreen": "Limpiar pantalla",
      "customization": "Personalización"
    },
    "Units": {
      "title": "Unidades de dibujo",
      "length": "Longitud",
      "type": "Tipo",
      "precision": "Precisión",
      "decimal": "Decimales",
      "insertionScale": "Escala de inserción",
      "insertedContent": "Unidades de escala del contenido insertado:",
      "millimeters": "Milímetros",
      "centimeters": "Centímetros",
      "meters": "Metros",
      "sampleOutput": "Muestra de salida",
      "ok": "Aceptar",
      "cancel": "Cancelar"
    },
    "SaveAs": {
      "title": "Guardar dibujo como",
      "fileName": "Nombre archivo:",
      "fileType": "Archivos de tipo:",
      "tools": "Herramientas",
      "options": "Opciones…",
      "save": "Guardar",
      "cancel": "Cancelar",
      "drawing": "Dibujo MellowCAD (*.ecad.json)",
      "dxf2018": "DXF AutoCAD 2018 (*.dxf)",
      "dxf2013": "DXF de AutoCAD 2013/LT2013 (*.dxf)",
      "dxf2010": "DXF de AutoCAD 2010/LT2010 (*.dxf)",
      "dxf2007": "DXF AutoCAD 2007/LT2007 (*.dxf)",
      "dxf2004": "DXF AutoCAD 2004/LT2004 (*.dxf)",
      "dxf2000": "DXF AutoCAD 2000/LT2000 (*.dxf)",
      "dxfR12": "DXF AutoCAD R12/LT2 (*.dxf)",
      "optionsTitle": "Opciones de guardado",
      "dxfOptions": "Opciones DXF",
      "format": "Formato",
      "ascii": "ASCII",
      "binary": "Binario",
      "selectObjects": "Designar objetos",
      "preview": "Guardar imagen prelim. en miniatura",
      "precision": "Número de decimales (de 0 a 16)",
      "ok": "Aceptar"
    },
    "SnapOverride": {
      "from": "Desde",
      "pointFilters": "Filtros para puntos",
      "none": "Ninguno"
    },
    "SelectionCycling": {
      "title": "Selección",
      "none": "Ninguna"
    },
    "ShortcutMenu": {
      "label": "Menú contextual",
      "repeat": [
        "Repetir ",
        [
          "command"
        ]
      ],
      "clipboard": "Portapapeles",
      "copyBase": "Copiar con punto base",
      "paste": "Pegar",
      "undo": "Deshacer",
      "redo": "Rehacer",
      "copySelection": "Copiar selección",
      "deselectAll": "Anular selección",
      "properties": "Propiedades",
      "enter": "Intro",
      "cancel": "Cancelar",
      "snapOverrides": "Modificaciones de REFENT",
      "dimensionStyle": "Estilo de cota"
    },
    "Layers": {
      "title": "Capas",
      "newLayer": "Nueva capa",
      "deleteLayer": "Suprimir capa",
      "setCurrentLayer": "Definir actual",
      "keys": {
        "new": "N",
        "delete": "U",
        "setCurrent": "C"
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
        "Capa actual: ",
        [
          "name"
        ]
      ],
      "all": "Todas",
      "status": [
        [
          "filter"
        ],
        ": ",
        [
          "shown",
          4
        ],
        " capas mostradas de ",
        [
          "total",
          4
        ],
        " capas totales"
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
        " de un total de ",
        [
          "total",
          4
        ]
      ],
      "current": "Capa actual",
      "colorLabel": [
        "Color de ",
        [
          "name"
        ]
      ],
      "color": "Color de capa",
      "linetypeLabel": [
        "Tipo de línea de ",
        [
          "name"
        ]
      ],
      "lineweightLabel": [
        "Grosor de línea de ",
        [
          "name"
        ]
      ],
      "on": "Activada",
      "off": "Desactivada",
      "unlocked": "Desbloqueada",
      "locked": "Bloqueada",
      "rename": "Pulse otra vez el nombre de la capa designada para cambiarle el nombre",
      "renameLabel": [
        "Cambiar el nombre de la capa ",
        [
          "name"
        ]
      ],
      "list": "Lista de capas",
      "dialog": {
        "close": "Cerrar",
        "notDeleted": {
          "title": "Capa - Sin suprimir",
          "instruction": "La capa designada no se ha suprimido.",
          "content": "Las siguientes capas no se pueden suprimir:",
          "base": "Capas 0 y DEFPOINTS",
          "current": "La capa actual",
          "inUse": "Capas que contienen objetos",
          "xref": "Capas que dependen de refX"
        },
        "currentOff": {
          "title": "Capa - Capa actual desactivada",
          "instruction": "La capa actual se desactivará. ¿Qué desea hacer?",
          "turnOff": "Desactivar la capa actual",
          "turnOffNote": "Los objetos que cree a partir de ahora no se mostrarán en el dibujo hasta que vuelva a activar la capa.",
          "keepOn": "Mantener la capa actual activada"
        },
        "nameInUse": {
          "title": "Capa - El nombre ya existe",
          "instruction": [
            "El nombre ",
            [
              "name"
            ],
            " ya está en uso."
          ],
          "content": "Debe indicar un nombre diferente."
        },
        "invalidName": {
          "title": "Capa",
          "instruction": "Caracteres no válidos en nombre de capa.",
          "content": "Los caracteres siguientes no son válidos en nombres de capa:"
        },
        "cannotRename": {
          "title": "Capa - Cambiar nombre",
          "instruction": "No se puede cambiar el nombre de la capa seleccionada.",
          "content": "No se puede cambiar el nombre de las siguientes capas:",
          "base": "Capa 0",
          "xref": "Capas que dependen de refX"
        }
      },
      "columns": {
        "status": "Estado",
        "name": "Nombre",
        "on": "Act",
        "lock": "Bloquear",
        "color": "Color",
        "linetype": "Tipo de línea",
        "lineweight": "Grosor de línea"
      }
    },
    "TextStyle": {
      "title": "Estilo de texto",
      "current": [
        "Estilo de texto actual: ",
        [
          "name"
        ]
      ],
      "styles": "Estilos:",
      "allStyles": "Todos los estilos",
      "stylesInUse": "Estilos en uso",
      "font": "Tipo de letra",
      "fontName": "Nombre del tipo de letra:",
      "size": "Tamaño",
      "height": "Altura",
      "setCurrent": "Definir actual",
      "new": "Nuevo...",
      "delete": "Suprimir",
      "apply": "Aplicar",
      "cancel": "Cancelar",
      "close": "Cerrar",
      "newTitle": "Nuevo estilo de texto",
      "styleName": "Nombre de estilo:",
      "ok": "Aceptar"
    },
    "DimStyle": {
      "title": "Administrador de estilos de cota",
      "current": [
        "Estilo de cota actual: ",
        [
          "name"
        ]
      ],
      "styles": "Estilos:",
      "list": "Lista:",
      "allStyles": "Todos los estilos",
      "stylesInUse": "Estilos en uso",
      "setCurrent": "Definir actual",
      "new": "Nuevo...",
      "modify": "Modificar...",
      "close": "Cerrar",
      "menuSetCurrent": "Definir actual",
      "rename": "Cambiar nombre",
      "delete": "Suprimir",
      "createTitle": "Crear estilo de cota",
      "newStyleName": "Nombre de nuevo estilo:",
      "startWith": "Comenzar por:",
      "continue": "Continuar",
      "cancel": "Cancelar",
      "newTitle": [
        "Crear estilo de cota: ",
        [
          "name"
        ]
      ],
      "modifyTitle": [
        "Modificar estilo de cota: ",
        [
          "name"
        ]
      ],
      "ok": "Aceptar",
      "lines": "Líneas",
      "symbolsAndArrows": "Símbolos y flechas",
      "text": "Texto",
      "fit": "Ajustar",
      "primaryUnits": "Unidades principales",
      "dimensionLines": "Líneas de cota",
      "baselineSpacing": "Intervalo de línea base:",
      "extensionLines": "Líneas de referencia",
      "extendBeyondDimLines": "Ampliar líneas de cota:",
      "offsetFromOrigin": "Desfase desde origen:",
      "arrowheads": "Extremos de cota",
      "arrowSize": "Tamaño de flecha:",
      "centerMarks": "Marcas de centro",
      "none": "Ninguna",
      "mark": "Marca",
      "textAppearance": "Aspecto del texto",
      "textHeight": "Altura de texto:",
      "textPlacement": "Ubicación del texto",
      "offsetFromDimLine": "Desfase de línea cota:",
      "scaleForFeatures": "Escala para funciones de cota",
      "useOverallScale": "Usar escala general:",
      "fineTuning": "Ajuste preciso",
      "drawDimLine": "Dibujar línea de cota entre líneas de referencia",
      "linearDimensions": "Acotaciones lineales",
      "precision": "Precisión:",
      "decimalSeparator": "Separador decimal:",
      "comma": "',' (Coma)",
      "period": "'.' (Periodo)",
      "space": "' ' (Espacio)",
      "zeroSuppression": "Supresión de ceros",
      "trailing": "A la derecha",
      "angularDimensions": "Acotaciones angulares",
      "angularPrecision": "Precisión:"
    },
    "Blocks": {
      "title": "Bloques",
      "empty": "No hay bloques definidos. Dibuje algo y ejecute BLOQUE.",
      "currentDrawing": "Dibujo actual",
      "currentDrawingBlocks": "Bloques del dibujo actual",
      "filterHint": "Filtrar...",
      "views": {
        "extraLarge": "Icono muy grande",
        "large": "Icono grande",
        "medium": "Icono mediano",
        "small": "Icono pequeño",
        "list": "Lista"
      },
      "options": "Opciones",
      "insertionPoint": "Punto de inserción",
      "scale": "Escala",
      "uniformScale": "Escala uniforme",
      "rotation": "Rotación",
      "angle": "Ángulo",
      "x": "X:",
      "y": "Y:",
      "z": "Z:"
    },
    "Properties": {
      "noSelection": "No hay selección",
      "general": "General",
      "color": "Color",
      "colorLabel": "Color de los objetos seleccionados",
      "layer": "Capa",
      "layerLabel": "Capa de los objetos seleccionados",
      "linetype": "Tipo de línea",
      "linetypeLabel": "Tipo de línea de los objetos seleccionados",
      "lineweight": "Grosor de línea",
      "lineweightLabel": "Grosor de línea de los objetos seleccionados",
      "style": "Estilo",
      "textStyleLabel": "Estilo de texto de los objetos seleccionados",
      "dimStyle": "Estilo de cota",
      "dimStyleLabel": "Estilo de cota de los objetos seleccionados",
      "varies": "*VARIOS*",
      "title": "Propiedades",
      "objectType": "Tipo de objeto",
      "currentLayerLabel": "Capa actual",
      "currentColorLabel": "Color actual",
      "currentLinetypeLabel": "Tipo de línea actual",
      "currentLineweightLabel": "Grosor de línea actual",
      "lockedObjects": {
        "title": "Propiedades: objetos bloqueados",
        "instruction": "Uno o varios objetos seleccionados están bloqueados y no se pueden actualizar.",
        "content": [
          "Número de objetos eliminados del conjunto de selección: ",
          [
            "count",
            4
          ]
        ],
        "close": "Cerrar"
      },
      "selectColor": "Seleccionar color..."
    },
    "MText": {
      "unsavedChanges": {
        "title": "Texto de líneas múltiples - Cambios sin guardar",
        "instruction": "¿Desea guardar los cambios del texto?",
        "yes": "Sí",
        "no": "No",
        "cancel": "Cancelar"
      }
    },
    "Palette": {
      "layers": "Administrador de propiedades de capas",
      "close": "Cerrar",
      "options": "Propiedades",
      "move": "Desplazar",
      "size": "Tamaño",
      "allowDocking": "Permitir anclaje",
      "anchorLeft": "Anclaje a la izquierda",
      "anchorRight": "Anclaje a la derecha",
      "autoHide": "Ocultar automáticamente",
      "autoHideButton": "Ocultar automáticamente",
      "ctrlPrevents": "Pulse la tecla Ctrl para evitar el anclaje.",
      "ctrlAllows": "Pulse la tecla Ctrl para permitir el anclaje.",
      "releasePrevents": "Suelte la tecla Ctrl para evitar el anclaje.",
      "resize": "Anchura de las paletas"
    },
    "PointStyle": {
      "title": "Estilo de punto",
      "figures": "Imágenes de visualización de punto",
      "pointSize": "Tamaño de punto:",
      "relative": "Establecer tamaño relativo a pantalla",
      "absolute": "Establecer tamaño en unid. absolutas",
      "percent": "%",
      "units": "Unidades",
      "invalid": "Entrada no válida.",
      "ok": "Aceptar",
      "cancel": "Cancelar"
    }
  }
}
