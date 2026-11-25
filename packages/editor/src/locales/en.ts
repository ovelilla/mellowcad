// Generated from en.json by `npm run locales`. Do not edit.
import type { EditorCatalog } from "./types"

export const en: EditorCatalog = {
  "tag": "en",
  "messages": {
    "Workspace": {
      "canvas": "CAD drawing canvas"
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
      "menu": "Application menu",
      "new": "New",
      "open": "Open",
      "save": "Save",
      "saveAs": "Save As",
      "units": "Drawing Units…",
      "language": "Language",
      "feedback": "Send Feedback",
      "help": "Help",
      "saving": "Saving…",
      "saved": "Saved",
      "savedHint": "Saved on this device",
      "undo": "Undo",
      "redo": "Redo"
    },
    "NavigationBar": {
      "label": "Navigation bar",
      "zoom": "Zoom",
      "extents": "Zoom Extents",
      "window": "Zoom Window",
      "previous": "Zoom Previous",
      "in": "Zoom In",
      "out": "Zoom Out"
    },
    "Viewport": {
      "view": [
        "View controls: ",
        [
          "name"
        ]
      ]
    },
    "ViewCube": {
      "label": "ViewCube",
      "home": "Home",
      "parallel": "Parallel",
      "setHome": "Set Current View as Home",
      "rollClockwise": "Rotate clockwise",
      "rollCounterclockwise": "Rotate counterclockwise",
      "wcs": "WCS",
      "unnamed": "Unnamed",
      "newUcs": "New UCS",
      "adjacent": {
        "up": "View the face above",
        "down": "View the face below",
        "left": "View the face to the left",
        "right": "View the face to the right"
      }
    },
    "Ribbon": {
      "tabs": {
        "home": "Home",
        "insert": "Insert",
        "annotate": "Annotate",
        "tools3d": "3D Tools",
        "view": "View"
      },
      "panels": {
        "draw": "Draw",
        "modify": "Modify",
        "annotation": "Annotation",
        "layers": "Layers",
        "block": "Block",
        "properties": "Properties",
        "utilities": "Utilities",
        "clipboard": "Clipboard",
        "insertBlock": "Block",
        "blockDefinition": "Block Definition",
        "text": "Text",
        "dimensions": "Dimensions",
        "markup": "Markup",
        "viewportTools": "Viewport Tools",
        "visualStyles": "Visual Styles",
        "coordinates": "Coordinates",
        "palettes": "Palettes",
        "navigate": "Navigate",
        "modeling": "Modeling",
        "solidEditing": "Solid Editing",
        "coordinates3d": "Coordinates"
      },
      "items": {
        "line": "Line",
        "polyline": "Polyline",
        "circle": "Center, Radius",
        "circlediameter": "Center, Diameter",
        "circle2p": "2-Point",
        "circle3p": "3-Point",
        "arc": "3-Point",
        "arcsce": "Start, Center, End",
        "arccse": "Center, Start, End",
        "rectangle": "Rectangle",
        "polygon": "Polygon",
        "ellipsecenter": "Center",
        "ellipse": "Axis, End",
        "ellipsearc": "Elliptical Arc",
        "hatch": "Hatch",
        "splinefit": "Spline Fit",
        "splinecv": "Spline CV",
        "xline": "Construction Line",
        "ray": "Ray",
        "point": "Multiple Points",
        "divide": "Divide",
        "measuresegments": "Measure",
        "region": "Region",
        "wipeout": "Wipeout",
        "polyline3d": "3D Polyline",
        "move": "Move",
        "copy": "Copy",
        "stretch": "Stretch",
        "rotate": "Rotate",
        "mirror": "Mirror",
        "scale": "Scale",
        "trim": "Trim",
        "extend": "Extend",
        "fillet": "Fillet",
        "chamfer": "Chamfer",
        "array": "Rectangular Array",
        "arraypath": "Path Array",
        "arraypolar": "Polar Array",
        "erase": "Erase",
        "explode": "Explode",
        "offset": "Offset",
        "pedit": "Edit Polyline",
        "splinedit": "Edit Spline",
        "break": "Break",
        "breakatpoint": "Break at Point",
        "join": "Join",
        "mtext": "Multiline Text",
        "text": "Single Line",
        "dimlinear": "Linear",
        "dimaligned": "Aligned",
        "dimangular": "Angular",
        "dimradius": "Radius",
        "dimdiameter": "Diameter",
        "textStyle": "Text Style",
        "dimensionStyle": "Dimension Style",
        "layerProperties": "Layer Properties",
        "insert": "Insert",
        "block": "Create",
        "attedit": "Single",
        "attdef": "Define Attributes",
        "matchprop": "Match Properties",
        "list": "List",
        "measure": "Distance",
        "measurearea": "Area",
        "id": "ID Point",
        "ptype": "Point Style...",
        "paste": "Paste",
        "cutclip": "Cut",
        "copyclip": "Copy Clip",
        "copybase": "Copy with Base Point",
        "createBlock": "Create Block",
        "dimspace": "Adjust Space",
        "dimensionUpdate": "Update",
        "dimcontinue": "Continue",
        "dimbaseline": "Baseline",
        "ucsIcon": "UCS Icon",
        "viewCube": "View Cube",
        "ucs": "UCS",
        "ucsWorld": "UCS, World",
        "ucsX": "X",
        "ucsY": "Y",
        "ucsZ": "Z",
        "ucsPrevious": "UCS, Previous",
        "ucsOrigin": "Origin",
        "ucsZAxis": "Z-Axis Vector",
        "ucs3Point": "3 Point",
        "ucsView": "View",
        "ucsObject": "Object",
        "ucsFace": "Face",
        "propertiesPalette": "Properties",
        "blocksPalette": "Blocks",
        "commandLine": "Command Line",
        "pan": "Pan",
        "orbit": "Orbit",
        "zoomExtents": "Extents",
        "zoomWindow": "Window",
        "zoomPrevious": "Previous",
        "zoomIn": "In",
        "zoomOut": "Out",
        "box": "Box",
        "cylinder": "Cylinder",
        "cone": "Cone",
        "sphere": "Sphere",
        "pyramid": "Pyramid",
        "wedge": "Wedge",
        "torus": "Torus",
        "extrude": "Extrude",
        "revolve": "Revolve",
        "presspull": "Presspull",
        "filletedge": "Fillet Edge",
        "chamferedge": "Chamfer Edge",
        "slice": "Slice",
        "union": "Union",
        "subtract": "Subtract",
        "intersect": "Intersect",
        "solideditextrude": "Extrude faces",
        "solidedittaper": "Taper faces",
        "solideditmove": "Move faces",
        "solideditcopy": "Copy faces",
        "solideditoffset": "Offset faces",
        "solideditrotate": "Rotate faces",
        "solideditdelete": "Delete faces",
        "insertAttedit": "Single",
        "defineAttributes": "Define Attributes",
        "multilineText": "Multiline Text",
        "dimensionsLinear": "Linear",
        "dimensionsAligned": "Aligned",
        "dimensionsAngular": "Angular",
        "dimensionsRadius": "Radius",
        "dimensionsDiameter": "Diameter",
        "axisX": "X",
        "axisY": "Y",
        "axisZ": "Z",
        "view3d": "View",
        "world": "World",
        "previous": "Previous",
        "attModeNormal": "Retain Attribute Display",
        "attModeOn": "Display All Attributes",
        "attModeOff": "Hide All Attributes"
      },
      "splits": {
        "circle": "Circle",
        "arc": "Arc",
        "text": "Text",
        "array": "Array",
        "measure": "Measure",
        "editAttributes": "Edit Attributes",
        "editAttribute": "Edit Attribute",
        "rotateUcs": "Rotate UCS",
        "defineUcs": "Define UCS"
      },
      "layer": "Layer",
      "color": "Object color",
      "lineweight": "Lineweight",
      "linetype": "Linetype",
      "pin": "Pin",
      "moreColors": "More Colors...",
      "minimize": {
        "full": "Show Full Ribbon",
        "tabs": "Minimize to Tabs",
        "panelTitles": "Minimize to Panel Titles",
        "panelButtons": "Minimize to Panel Buttons",
        "cycle": "Cycle through All"
      }
    },
    "CommandLine": {
      "label": "Command line",
      "placeholder": "Type a command (LINE, TR, CO…)",
      "history": "Command history"
    },
    "DynamicInput": {
      "locked": "locked"
    },
    "StatusBar": {
      "coordinates": "Coordinates",
      "model": "MODEL",
      "modelSpace": "Model space",
      "grid": "Grid",
      "objectSnap": "Object snap",
      "objectSnapSettings": "Object snap settings",
      "snapMode": "Snap mode",
      "snapSettings": "Snap settings",
      "snap": "Snap",
      "gridSnap": "Grid Snap",
      "polarSnap": "Polar Snap",
      "snapX": "Snap X",
      "snapXSpacing": "Snap X spacing",
      "snapY": "Snap Y",
      "snapYSpacing": "Snap Y spacing",
      "polarDistance": "Polar distance",
      "polarSnapDistance": "Polar snap distance",
      "ortho": "Ortho mode",
      "polarTracking": "Polar tracking",
      "polarTrackingAngle": "Polar tracking angle",
      "polarAngle": "Polar angle",
      "objectSnapTracking": "Object snap tracking",
      "selectionCycling": "Selection cycling",
      "selectionCyclingSettings": "Selection cycling settings",
      "selectionList": "Display selection list box",
      "showLineweight": "Show lineweight",
      "units": "Units",
      "cleanScreen": "Clean screen",
      "customization": "Customization"
    },
    "Units": {
      "title": "Drawing Units",
      "length": "Length",
      "type": "Type",
      "precision": "Precision",
      "decimal": "Decimal",
      "insertionScale": "Insertion scale",
      "insertedContent": "Units to scale inserted content:",
      "millimeters": "Millimeters",
      "centimeters": "Centimeters",
      "meters": "Meters",
      "sampleOutput": "Sample output",
      "ok": "OK",
      "cancel": "Cancel"
    },
    "SaveAs": {
      "title": "Save Drawing As",
      "fileName": "File name:",
      "fileType": "Files of type:",
      "tools": "Tools",
      "options": "Options…",
      "save": "Save",
      "cancel": "Cancel",
      "drawing": "MellowCAD Drawing (*.ecad.json)",
      "dxf2018": "AutoCAD 2018 DXF (*.dxf)",
      "dxf2013": "AutoCAD 2013/LT2013 DXF (*.dxf)",
      "dxf2010": "AutoCAD 2010/LT2010 DXF (*.dxf)",
      "dxf2007": "AutoCAD 2007/LT2007 DXF (*.dxf)",
      "dxf2004": "AutoCAD 2004/LT2004 DXF (*.dxf)",
      "dxf2000": "AutoCAD 2000/LT2000 DXF (*.dxf)",
      "dxfR12": "AutoCAD R12/LT2 DXF (*.dxf)",
      "optionsTitle": "Saveas Options",
      "dxfOptions": "DXF Options",
      "format": "Format",
      "ascii": "ASCII",
      "binary": "BINARY",
      "selectObjects": "Select objects",
      "preview": "Save thumbnail preview image",
      "precision": "Decimal places of accuracy (0 to 16)",
      "ok": "OK"
    },
    "SnapOverride": {
      "from": "From",
      "pointFilters": "Point Filters",
      "none": "None"
    },
    "SelectionCycling": {
      "title": "Selection",
      "none": "None"
    },
    "ShortcutMenu": {
      "label": "Shortcut menu",
      "repeat": [
        "Repeat ",
        [
          "command"
        ]
      ],
      "clipboard": "Clipboard",
      "copyBase": "Copy with Base Point",
      "paste": "Paste",
      "undo": "Undo",
      "redo": "Redo",
      "copySelection": "Copy Selection",
      "deselectAll": "Deselect All",
      "properties": "Properties",
      "enter": "Enter",
      "cancel": "Cancel",
      "snapOverrides": "Osnap Overrides",
      "dimensionStyle": "Dimension Style"
    },
    "Layers": {
      "title": "Layers",
      "new": "New layer",
      "setCurrentLabel": [
        "Set ",
        [
          "name"
        ],
        " as current layer"
      ],
      "current": "Current layer",
      "setCurrent": "Set current",
      "colorLabel": [
        [
          "name"
        ],
        " color"
      ],
      "color": "Layer color",
      "linetypeLabel": [
        [
          "name"
        ],
        " linetype"
      ],
      "lineweightLabel": [
        [
          "name"
        ],
        " lineweight"
      ],
      "on": "On",
      "off": "Off",
      "unlocked": "Unlocked",
      "locked": "Locked",
      "deleteLabel": [
        "Delete layer ",
        [
          "name"
        ]
      ],
      "delete": "Delete layer",
      "rename": "Click the selected layer's name again to rename it",
      "renameLabel": [
        "Rename layer ",
        [
          "name"
        ]
      ],
      "list": "Layer list",
      "nextColumns": "Next columns",
      "previousColumns": "Previous columns",
      "dialog": {
        "close": "Close",
        "notDeleted": {
          "title": "Layer - Not Deleted",
          "instruction": "The selected layer was not deleted.",
          "content": "The following layers cannot be deleted:",
          "base": "Layers 0 and Defpoints",
          "current": "The current layer",
          "inUse": "Layers containing objects",
          "xref": "Xref-dependent layers"
        },
        "currentOff": {
          "title": "Layer - Current Layer Off",
          "instruction": "The current layer will be turned off. What do you want to do?",
          "turnOff": "Turn the current layer off",
          "turnOffNote": "Objects that you create from now on will not be displayed in the drawing until you turn the layer back on.",
          "keepOn": "Keep the current layer on"
        },
        "nameInUse": {
          "title": "Layer - Name Already Exists",
          "instruction": [
            "The name, ",
            [
              "name"
            ],
            ", is already in use."
          ],
          "content": "You will need to enter a different name."
        },
        "invalidName": {
          "title": "Layer",
          "instruction": "Invalid characters in layer name.",
          "content": "The following characters are not valid in layer names:"
        },
        "cannotRename": {
          "title": "Layer - Rename",
          "instruction": "The selected layer cannot be renamed.",
          "content": "The following layers cannot be renamed:",
          "base": "Layer 0",
          "xref": "Xref-dependent layers"
        }
      },
      "columns": {
        "status": "Status",
        "name": "Name",
        "on": "On",
        "lock": "Lock",
        "color": "Color",
        "linetype": "Linetype",
        "lineweight": "Lineweight",
        "objects": "Objects"
      }
    },
    "Styles": {
      "title": "Styles",
      "dimension": "Dimension",
      "text": "Text",
      "current": [
        "Current: ",
        [
          "value",
          [
            "name"
          ]
        ]
      ],
      "new": "New",
      "setCurrent": [
        "Set ",
        [
          "name"
        ],
        " current"
      ],
      "rename": [
        "Rename ",
        [
          "name"
        ]
      ],
      "delete": [
        "Delete ",
        [
          "name"
        ]
      ],
      "lines": "Lines",
      "baselineSpacing": "Baseline spacing",
      "extendBeyond": "Extend beyond dim lines",
      "offsetFromOrigin": "Offset from origin",
      "symbolsAndArrows": "Symbols and arrows",
      "arrowSize": "Arrow size",
      "centerMark": "Center mark size",
      "textGroup": "Text",
      "textHeight": "Text height",
      "offsetFromDimLine": "Offset from dim line",
      "fit": "Fit",
      "overallScale": "Use overall scale of",
      "drawDimLineBetween": "Draw dim line between ext lines",
      "primaryUnits": "Primary units",
      "precision": "Precision",
      "angularPrecision": "Angular precision",
      "decimalSeparator": "Decimal separator",
      "comma": "',' (Comma)",
      "period": "'.' (Period)",
      "space": "' ' (Space)",
      "suppressTrailingZeros": "Suppress trailing zeros",
      "yes": "Yes",
      "no": "No",
      "size": "Size",
      "height": "Height",
      "heightHint": "A height of 0 leaves it free, so TEXT asks for one each time."
    },
    "Blocks": {
      "title": "Blocks",
      "filter": "Filter (? and * allowed)",
      "filterLabel": "Filter blocks",
      "empty": "No blocks defined. Draw something and run BLOCK.",
      "noMatch": "No block matches the filter.",
      "references": [
        [
          "name"
        ],
        " — ",
        [
          "count",
          2,
          {
            "other": [
              0,
              " in drawing"
            ]
          }
        ]
      ]
    },
    "Properties": {
      "noSelection": "No selection",
      "general": "General",
      "color": "Color",
      "colorLabel": "Color of the selected objects",
      "layer": "Layer",
      "layerLabel": "Layer of the selected objects",
      "linetype": "Linetype",
      "linetypeLabel": "Linetype of the selected objects",
      "lineweight": "Lineweight",
      "lineweightLabel": "Lineweight of the selected objects",
      "textStyle": "Text style",
      "textStyleLabel": "Text style of the selected objects",
      "dimStyle": "Dim style",
      "dimStyleLabel": "Dim style of the selected objects",
      "varies": "*VARIES*",
      "title": "Properties",
      "objectType": "Object type",
      "currentLayerLabel": "Current layer",
      "currentColorLabel": "Current color",
      "currentLinetypeLabel": "Current linetype",
      "currentLineweightLabel": "Current lineweight",
      "lockedObjects": {
        "title": "Properties - Locked objects",
        "instruction": "One or more selected objects are locked and cannot be updated.",
        "content": [
          "Number of objects removed from the selection set: ",
          [
            "count",
            4
          ]
        ],
        "close": "Close"
      },
      "selectColor": "Select Color..."
    },
    "MText": {
      "unsavedChanges": {
        "title": "Multiline Text - Unsaved Changes",
        "instruction": "Do you want to save your text changes?",
        "yes": "Yes",
        "no": "No",
        "cancel": "Cancel"
      }
    },
    "Palette": {
      "label": "Palettes",
      "fold": "Fold the palettes",
      "unfold": "Show the palettes",
      "resize": "Palette width"
    },
    "PointStyle": {
      "title": "Point Style",
      "figures": "Point display images",
      "pointSize": "Point Size:",
      "relative": "Set Size Relative to Screen",
      "absolute": "Set Size in Absolute Units",
      "percent": "%",
      "units": "Units",
      "invalid": "Invalid input.",
      "ok": "OK",
      "cancel": "Cancel"
    }
  }
}
