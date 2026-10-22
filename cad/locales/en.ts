// Generated from en.json by `npm run locales`. Do not edit.
import type { EngineCatalog } from "./types"

export const en: EngineCatalog = {
  "tag": "en",
  "interface": {
    "tool": {
      "select": "Select",
      "line": "Line",
      "polyline": "Polyline",
      "circle": "Circle",
      "circlediameter": "Diameter circle",
      "circle2p": "2-Point circle",
      "circle3p": "3-Point circle",
      "arc": "Arc",
      "arcsce": "Start, Center, End arc",
      "arccse": "Center, Start, End arc",
      "ellipse": "Ellipse",
      "ellipsecenter": "Center ellipse",
      "ellipsearc": "Elliptical arc",
      "spline": "Spline",
      "splinefit": "Spline Fit",
      "splinecv": "Spline CV",
      "rectangle": "Rectangle",
      "polygon": "Polygon",
      "hatch": "Hatch",
      "block": "Create block",
      "insert": "Insert block",
      "attedit": "Edit attributes",
      "attdef": "Define attributes",
      "attdisp": "Attribute display",
      "text": "Text",
      "mtext": "Multiline text",
      "textedit": "Edit text",
      "dimlinear": "Linear",
      "dimaligned": "Aligned",
      "dimradius": "Radius",
      "dimdiameter": "Diameter",
      "dimangular": "Angular",
      "dimbaseline": "Baseline",
      "dimcontinue": "Continue",
      "dimspace": "Adjust space",
      "offset": "Offset",
      "move": "Move",
      "copy": "Copy",
      "stretch": "Stretch",
      "rotate": "Rotate",
      "scale": "Scale",
      "mirror": "Mirror",
      "arraycommand": "Array",
      "array": "Rectangular array",
      "arraypolar": "Polar array",
      "arraypath": "Path array",
      "trim": "Trim",
      "extend": "Extend",
      "fillet": "Fillet",
      "chamfer": "Chamfer",
      "erase": "Erase",
      "explode": "Explode",
      "join": "Join",
      "break": "Break",
      "breakatpoint": "Break at point",
      "matchprop": "Match properties",
      "copyclip": "Copy",
      "cutclip": "Cut",
      "copybase": "Copy with base point",
      "paste": "Paste",
      "measure": "Measure",
      "measurearea": "Area",
      "id": "ID Point",
      "zoom": "Zoom",
      "pan": "Pan",
      "dashpan": "Pan by points",
      "ucs": "UCS",
      "ucsicon": "UCS icon",
      "fill": "Fill",
      "ucsiconvariable": "UCS icon (variable)",
      "plan": "Plan view",
      "elev": "Elevation",
      "vpoint": "Viewpoint",
      "view": "Preset views",
      "orbit": "3D Orbit",
      "navvcube": "ViewCube",
      "ltscale": "Linetype scale",
      "auprec": "Angle precision",
      "undo": "Undo",
      "mredo": "Multiple redo",
      "osnap": "Object snap modes",
      "color": "Color",
      "linetype": "Linetype",
      "lweight": "Lineweight",
      "snap": "Snap mode"
    },
    "description": {
      "U": "Undo the last action",
      "REDO": "Redo the last undone action",
      "SNAP": "Force the cursor onto the snap increments",
      "-OSNAP": "Set the running object snap modes",
      "FROM": "Pick a point offset from a base point",
      "NEW": "Start a new drawing",
      "QNEW": "Start a new drawing",
      "QSAVE": "Save the drawing to a file",
      "SAVEAS": "Save the drawing to a file under a new name",
      "OPEN": "Open a drawing file",
      "PASTECLIP": "Paste the clipboard into the drawing",
      "DIMSTYLE": "Create and modify dimension styles",
      "STYLE": "Create and modify text styles",
      "BLOCKSPALETTE": "Show the blocks palette",
      "PURGE": "Remove unused block definitions",
      "LAYER": "Manage layers and layer properties",
      "LAYERCLOSE": "Close the Layer Properties Manager",
      "PROPERTIES": "Show the properties of the selected objects",
      "PROPERTIESCLOSE": "Close the Properties palette",
      "UNITS": "Control the precision and display format of coordinates and distances",
      "CLEANSCREENON": "Clear toolbars and palettes from the screen",
      "CLEANSCREENOFF": "Restore the display as it was before Clean Screen"
    },
    "snap": {
      "endpoint": "Endpoint",
      "midpoint": "Midpoint",
      "center": "Center",
      "intersection": "Intersection",
      "apparentIntersection": "Apparent Intersection",
      "perpendicular": "Perpendicular",
      "tangent": "Tangent",
      "insertion": "Insertion",
      "extension": "Extension",
      "parallel": "Parallel",
      "quadrant": "Quadrant",
      "nearest": "Nearest"
    },
    "color": {
      "red": "Red",
      "yellow": "Yellow",
      "green": "Green",
      "cyan": "Cyan",
      "blue": "Blue",
      "magenta": "Magenta",
      "white": "White"
    },
    "byLayer": "ByLayer",
    "view": {
      "Top": "Top",
      "Bottom": "Bottom",
      "Front": "Front",
      "BAck": "Back",
      "Left": "Left",
      "Right": "Right",
      "SWiso": "SW Isometric",
      "SEiso": "SE Isometric",
      "NEiso": "NE Isometric",
      "NWiso": "NW Isometric",
      "custom": "Custom View"
    },
    "viewCube": {
      "face": {
        "top": "TOP",
        "bottom": "BOTTOM",
        "front": "FRONT",
        "back": "BACK",
        "left": "LEFT",
        "right": "RIGHT"
      },
      "compass": {
        "N": "N",
        "E": "E",
        "S": "S",
        "W": "W"
      }
    },
    "linetype": {
      "DashDot": "Dash dot"
    },
    "hatchPattern": {
      "SOLID": "Solid"
    },
    "entity": {
      "line": [
        [
          "count",
          2,
          {
            "one": "Line",
            "other": "Lines"
          }
        ]
      ],
      "circle": [
        [
          "count",
          2,
          {
            "one": "Circle",
            "other": "Circles"
          }
        ]
      ],
      "arc": [
        [
          "count",
          2,
          {
            "one": "Arc",
            "other": "Arcs"
          }
        ]
      ],
      "ellipse": [
        [
          "count",
          2,
          {
            "one": "Ellipse",
            "other": "Ellipses"
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
            "one": "Polyline",
            "other": "Polylines"
          }
        ]
      ],
      "text": [
        [
          "count",
          2,
          {
            "one": "Text",
            "other": "Texts"
          }
        ]
      ],
      "mtext": [
        [
          "count",
          2,
          {
            "one": "MText",
            "other": "MTexts"
          }
        ]
      ],
      "attdef": [
        [
          "count",
          2,
          {
            "one": "Attribute Definition",
            "other": "Attribute Definitions"
          }
        ]
      ],
      "dimension": [
        [
          "count",
          2,
          {
            "one": "Dimension",
            "other": "Dimensions"
          }
        ]
      ],
      "hatch": [
        [
          "count",
          2,
          {
            "one": "Hatch",
            "other": "Hatches"
          }
        ]
      ],
      "insert": [
        [
          "count",
          2,
          {
            "one": "Block reference",
            "other": "Block references"
          }
        ]
      ]
    },
    "array": {
      "rectangular": "Array (Rectangular)",
      "polar": "Array (Polar)",
      "path": "Array (Path)"
    },
    "property": {
      "title": {
        "ellipticalArc": "Elliptical arc",
        "objects": [
          [
            "count",
            2,
            {
              "one": [
                0,
                " object"
              ],
              "other": [
                0,
                " objects"
              ]
            }
          ]
        ],
        "all": [
          "All (",
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
        "geometry": "Geometry",
        "endpoints": "Endpoints",
        "center": "Center",
        "text": "Text",
        "position": "Position",
        "dimension": "Dimension",
        "definitionPoints": "Definition points",
        "pattern": "Pattern",
        "block": "Block",
        "attributes": "Attributes",
        "misc": "Misc",
        "dataPoints": "Data Points",
        "selection": "Selection"
      },
      "row": {
        "length": "Length",
        "angle": "Angle",
        "deltaX": "Delta X",
        "deltaY": "Delta Y",
        "deltaZ": "Delta Z",
        "startX": "Start X",
        "startY": "Start Y",
        "startZ": "Start Z",
        "endX": "End X",
        "endY": "End Y",
        "endZ": "End Z",
        "centerX": "Center X",
        "centerY": "Center Y",
        "centerZ": "Center Z",
        "radius": "Radius",
        "diameter": "Diameter",
        "circumference": "Circumference",
        "area": "Area",
        "normalX": "Normal X",
        "normalY": "Normal Y",
        "normalZ": "Normal Z",
        "x": "X",
        "y": "Y",
        "z": "Z",
        "elevation": "Elevation",
        "thickness": "Thickness",
        "startAngle": "Start angle",
        "endAngle": "End angle",
        "totalAngle": "Total angle",
        "arcLength": "Arc length",
        "majorRadius": "Major radius",
        "minorRadius": "Minor radius",
        "radiusRatio": "Radius ratio",
        "majorAxisVectorX": "Major axis vector X",
        "majorAxisVectorY": "Major axis vector Y",
        "majorAxisVectorZ": "Major axis vector Z",
        "minorAxisVectorX": "Minor axis vector X",
        "minorAxisVectorY": "Minor axis vector Y",
        "minorAxisVectorZ": "Minor axis vector Z",
        "vertices": "Vertices",
        "segments": "Segments",
        "currentVertex": "Current Vertex",
        "vertex": "Vertex",
        "startSegmentWidth": "Start segment width",
        "endSegmentWidth": "End segment width",
        "globalWidth": "Global width",
        "closed": "Closed",
        "contents": "Contents",
        "justify": "Justify",
        "height": "Height",
        "rotation": "Rotation",
        "lineSpaceFactor": "Line space factor",
        "lineSpaceDistance": "Line space distance",
        "lineSpaceStyle": "Line space style",
        "definedWidth": "Defined width",
        "measurement": "Measurement",
        "textOverride": "Text override",
        "type": "Type",
        "vertexX": "Vertex X",
        "vertexY": "Vertex Y",
        "firstX": "First X",
        "firstY": "First Y",
        "secondX": "Second X",
        "secondY": "Second Y",
        "pattern": "Pattern",
        "scale": "Scale",
        "boundaries": "Boundaries",
        "name": "Name",
        "tag": "Tag",
        "prompt": "Prompt",
        "value": "Value",
        "invisible": "Invisible",
        "constant": "Constant",
        "verify": "Verify",
        "preset": "Preset",
        "lockPosition": "Lock position",
        "method": "Method",
        "degree": "Degree",
        "knotParameterization": "Knot parameterization",
        "numberOfFitPoints": "Number of fit points",
        "currentFitPoint": "Current Fit point",
        "fitPointX": "Fit point X",
        "fitPointY": "Fit point Y",
        "fitPointZ": "Fit point Z",
        "numberOfControlPoints": "Number of control points",
        "currentControlPoint": "Current Control point",
        "controlPointX": "Control point X",
        "controlPointY": "Control point Y",
        "controlPointZ": "Control point Z",
        "weight": "Weight",
        "cvFrame": "CV frame",
        "periodic": "Periodic",
        "planar": "Planar",
        "startTangentVectorX": "Start tangent vector X",
        "startTangentVectorY": "Start tangent vector Y",
        "startTangentVectorZ": "Start tangent vector Z",
        "endTangentVectorX": "End tangent vector X",
        "endTangentVectorY": "End tangent vector Y",
        "endTangentVectorZ": "End tangent vector Z",
        "fitTolerance": "Fit tolerance",
        "baseX": "Base X",
        "baseY": "Base Y",
        "baseZ": "Base Z",
        "pathLength": "Path length",
        "columns": "Columns",
        "columnSpacing": "Column spacing",
        "rows": "Rows",
        "rowSpacing": "Row spacing",
        "rowElevationIncrement": "Row elevation increment",
        "includedAxisAngle": "Included axis angle",
        "direction": "Direction",
        "items": "Items",
        "angleBetweenItems": "Angle between items",
        "fillAngle": "Fill angle",
        "rotateItems": "Rotate items",
        "itemSpacing": "Item spacing",
        "alignItems": "Align items"
      },
      "value": {
        "yes": "Yes",
        "no": "No",
        "none": "—",
        "atLeast": "At least",
        "exactly": "Exactly",
        "fitPoints": "Fit",
        "controlVertices": "Control Vertices",
        "chord": "Chord",
        "sqrtChord": "SqrtChord",
        "uniform": "Uniform",
        "show": "Show",
        "hide": "Hide",
        "counterClockwise": "Counter-clockwise",
        "clockwise": "Clockwise",
        "divide": "Divide",
        "measure": "Measure"
      },
      "justify": {
        "left": "Left",
        "center": "Center",
        "right": "Right",
        "middle": "Middle",
        "tl": "Top left",
        "tc": "Top center",
        "tr": "Top right",
        "ml": "Middle left",
        "mc": "Middle center",
        "mr": "Middle right",
        "bl": "Bottom left",
        "bc": "Bottom center",
        "br": "Bottom right"
      },
      "dimensionKind": {
        "linear": "Linear",
        "aligned": "Aligned",
        "angular": "Angular",
        "radius": "Radius",
        "diameter": "Diameter"
      }
    }
  },
  "commands": {
    "names": {
      "LINE": [
        "LINE",
        "L"
      ],
      "PLINE": [
        "PLINE",
        "PL"
      ],
      "CIRCLE": [
        "CIRCLE",
        "C"
      ],
      "CIRCLED": [
        "CIRCLED"
      ],
      "CIRCLE2P": [
        "CIRCLE2P"
      ],
      "CIRCLE3P": [
        "CIRCLE3P"
      ],
      "ARC": [
        "ARC",
        "A"
      ],
      "ARCSCE": [
        "ARCSCE"
      ],
      "ARCCSE": [
        "ARCCSE"
      ],
      "ELLIPSE": [
        "ELLIPSE",
        "EL"
      ],
      "ELLIPSEC": [
        "ELLIPSEC"
      ],
      "ELLIPSEARC": [
        "ELLIPSEARC"
      ],
      "SPLINE": [
        "SPLINE",
        "SPL"
      ],
      "RECTANG": [
        "RECTANG",
        "REC",
        "RECTANGLE"
      ],
      "POLYGON": [
        "POLYGON",
        "POL"
      ],
      "HATCH": [
        "HATCH",
        "H",
        "BH"
      ],
      "BLOCK": [
        "BLOCK",
        "B"
      ],
      "INSERT": [
        "INSERT",
        "I"
      ],
      "ATTEDIT": [
        "ATTEDIT",
        "ATE"
      ],
      "EATTEDIT": [
        "EATTEDIT"
      ],
      "ATTDEF": [
        "ATTDEF",
        "ATT"
      ],
      "-ATTDEF": [
        "-ATTDEF"
      ],
      "ATTDISP": [
        "ATTDISP"
      ],
      "TEXT": [
        "TEXT",
        "DT",
        "DTEXT"
      ],
      "MTEXT": [
        "MTEXT",
        "T",
        "MT"
      ],
      "-MTEXT": [
        "-MTEXT"
      ],
      "TEXTEDIT": [
        "TEXTEDIT",
        "DDEDIT",
        "ED"
      ],
      "DIMLINEAR": [
        "DIMLINEAR",
        "DIMLIN",
        "DLI"
      ],
      "DIMALIGNED": [
        "DIMALIGNED",
        "DIMALI",
        "DAL"
      ],
      "DIMRADIUS": [
        "DIMRADIUS",
        "DIMRAD",
        "DRA"
      ],
      "DIMDIAMETER": [
        "DIMDIAMETER",
        "DIMDIA",
        "DDI"
      ],
      "DIMANGULAR": [
        "DIMANGULAR",
        "DIMANG",
        "DAN"
      ],
      "DIMBASELINE": [
        "DIMBASELINE",
        "DBA"
      ],
      "DIMCONTINUE": [
        "DIMCONTINUE",
        "DCO"
      ],
      "DIMSPACE": [
        "DIMSPACE"
      ],
      "OFFSET": [
        "OFFSET",
        "O"
      ],
      "MOVE": [
        "MOVE",
        "M"
      ],
      "COPY": [
        "COPY",
        "CO",
        "CP"
      ],
      "STRETCH": [
        "STRETCH",
        "S"
      ],
      "ROTATE": [
        "ROTATE",
        "RO"
      ],
      "SCALE": [
        "SCALE",
        "SC"
      ],
      "MIRROR": [
        "MIRROR",
        "MI"
      ],
      "ARRAY": [
        "ARRAY",
        "AR"
      ],
      "ARRAYRECT": [
        "ARRAYRECT"
      ],
      "ARRAYPOLAR": [
        "ARRAYPOLAR"
      ],
      "ARRAYPATH": [
        "ARRAYPATH"
      ],
      "TRIM": [
        "TRIM",
        "TR"
      ],
      "EXTEND": [
        "EXTEND",
        "EX"
      ],
      "FILLET": [
        "FILLET",
        "F"
      ],
      "CHAMFER": [
        "CHAMFER",
        "CHA"
      ],
      "EXPLODE": [
        "EXPLODE",
        "X"
      ],
      "JOIN": [
        "JOIN",
        "J"
      ],
      "BREAK": [
        "BREAK",
        "BR"
      ],
      "BREAKATPOINT": [
        "BREAKATPOINT"
      ],
      "MATCHPROP": [
        "MATCHPROP",
        "MA",
        "PAINTER"
      ],
      "COPYCLIP": [
        "COPYCLIP"
      ],
      "CUTCLIP": [
        "CUTCLIP"
      ],
      "COPYBASE": [
        "COPYBASE"
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
        "PAN",
        "P"
      ],
      "-PAN": [
        "-PAN"
      ],
      "ERASE": [
        "ERASE",
        "E",
        "DELETE"
      ],
      "U": [
        "U"
      ],
      "UNDO": [
        "UNDO"
      ],
      "REDO": [
        "REDO"
      ],
      "MREDO": [
        "MREDO"
      ],
      "SNAP": [
        "SNAP",
        "SN"
      ],
      "-OSNAP": [
        "-OSNAP",
        "-OS"
      ],
      "FROM": [
        "FROM",
        "FRO"
      ],
      "NEW": [
        "NEW"
      ],
      "QNEW": [
        "QNEW"
      ],
      "QSAVE": [
        "QSAVE",
        "SAVE"
      ],
      "SAVEAS": [
        "SAVEAS"
      ],
      "OPEN": [
        "OPEN"
      ],
      "PASTECLIP": [
        "PASTECLIP"
      ],
      "DIMSTYLE": [
        "DIMSTYLE",
        "D"
      ],
      "STYLE": [
        "STYLE",
        "ST"
      ],
      "BLOCKSPALETTE": [
        "BLOCKSPALETTE"
      ],
      "PURGE": [
        "PURGE",
        "PU"
      ],
      "LAYER": [
        "LAYER",
        "LA"
      ],
      "LAYERCLOSE": [
        "LAYERCLOSE"
      ],
      "PROPERTIES": [
        "PROPERTIES",
        "PR",
        "CH",
        "MO"
      ],
      "PROPERTIESCLOSE": [
        "PROPERTIESCLOSE"
      ],
      "UCS": [
        "UCS"
      ],
      "UCSICON": [
        "UCSICON"
      ],
      "FILL": [
        "FILL"
      ],
      "PLAN": [
        "PLAN"
      ],
      "ELEV": [
        "ELEV"
      ],
      "VPOINT": [
        "VPOINT",
        "VP"
      ],
      "-VPOINT": [
        "-VPOINT",
        "-VP"
      ],
      "VIEW": [
        "VIEW",
        "V"
      ],
      "-VIEW": [
        "-VIEW",
        "-V"
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
      "UNITS": [
        "UNITS",
        "UN"
      ],
      "LTSCALE": [
        "LTSCALE",
        "LTS"
      ],
      "AUPREC": [
        "AUPREC"
      ],
      "SETVAR": [
        "SETVAR"
      ],
      "CLEANSCREENON": [
        "CLEANSCREENON"
      ],
      "CLEANSCREENOFF": [
        "CLEANSCREENOFF"
      ],
      "COLOR": [
        "COLOR",
        "COL"
      ],
      "-COLOR": [
        "-COLOR"
      ],
      "LINETYPE": [
        "LINETYPE",
        "LT"
      ],
      "-LINETYPE": [
        "-LINETYPE"
      ],
      "LWEIGHT": [
        "LWEIGHT",
        "LW"
      ],
      "-LWEIGHT": [
        "-LWEIGHT"
      ]
    },
    "keywords": {
      "-OSNAP": {
        "APParent": "APPint"
      },
      "PLINE": {
        "Center": "CEnter"
      },
      "ARC": {
        "Center": "Ce"
      },
      "ARCSCE": {
        "Center": "Ce"
      },
      "FILL": {
        "OFF": "OFf"
      },
      "ELLIPSE": {
        "Included angle": "Included"
      },
      "ELLIPSEC": {
        "Included angle": "Included"
      },
      "ELLIPSEARC": {
        "Included angle": "Included"
      },
      "SPLINE": {
        "Square root": "Square",
        "start Tangency": "Tangency",
        "end Tangency": "Tangency"
      },
      "HATCH": {
        "Select objects": "Select"
      },
      "ATTDEF": {
        "Lock position": "Lock",
        "TL": "TLeft",
        "TC": "TCenter",
        "TR": "TRight",
        "ML": "MLeft",
        "MC": "MCenter",
        "MR": "MRight",
        "BL": "BLeft",
        "BC": "BCenter",
        "BR": "BRight"
      },
      "ATTDISP": {
        "OFF": "OFf"
      },
      "SNAP": {
        "OFF": "OFf"
      },
      "TEXT": {
        "TL": "TLeft",
        "TC": "TCenter",
        "TR": "TRight",
        "ML": "MLeft",
        "MC": "MCenter",
        "MR": "MRight",
        "BL": "BLeft",
        "BC": "BCenter",
        "BR": "BRight"
      },
      "ARRAYRECT": {
        "Unit cell": "Unit"
      },
      "ARRAYPOLAR": {
        "Angle between": "Angle",
        "Fill angle": "Fill",
        "ROTate items": "ROTate"
      },
      "ARRAYPATH": {
        "Align items": "Align",
        "Fill entire path": "Fill"
      },
      "BREAK": {
        "First point": "First"
      },
      "DIST": {
        "Center": "CEnter"
      },
      "UCS": {
        "Front": "FRont",
        "Right": "RIght"
      },
      "UNDO": {
        "OFF": "OFf"
      },
      "PLAN": {
        "Current ucs": "Current"
      },
      "VIEW": {
        "Right": "RIght",
        "SWiso": "SWIso",
        "SEiso": "SEIso",
        "NEiso": "NEIso",
        "NWiso": "NWIso"
      },
      "COLOR": {
        "BYLAYER": "BYLayer",
        "RED": "Red",
        "YELLOW": "Yellow",
        "GREEN": "Green",
        "CYAN": "Cyan",
        "BLUE": "Blue",
        "MAGENTA": "Magenta",
        "WHITE": "White"
      },
      "LINETYPE": {
        "BYLAYER": "BYLayer"
      },
      "LWEIGHT": {
        "BYLAYER": "BYLayer"
      }
    },
    "promptKeywords": {
      "selectObjects": {
        "Window": "Window",
        "Last": "Last",
        "Crossing": "Crossing",
        "BOX": "BOX",
        "ALL": "ALL",
        "Fence": "Fence",
        "WPolygon": "WPolygon",
        "CPolygon": "CPolygon",
        "Add": "Add",
        "Remove": "Remove",
        "Previous": "Previous",
        "Undo": "Undo",
        "AUto": "AUto",
        "SIngle": "SIngle",
        "SUbobject": "SUbobject",
        "Object": "Object"
      },
      "specifyNextFencePointOr": {
        "Undo": "Undo"
      },
      "viewOrthographic": {
        "Right": "Right"
      },
      "ucsOrthographic": {
        "Front": "Front",
        "Right": "Right"
      },
      "specifyEndpointOfLineOr": {
        "Undo": "Undo"
      },
      "select2dPolylineOr": {
        "Radius": "Radius"
      },
      "selectSecondObjectOrApplyCornerOr": {
        "Radius": "Radius"
      },
      "specifyEndpointOfArcOr": {
        "Close": "CLose",
        "Arc": "ARc"
      },
      "specifyNextPointOr": {
        "Line": "LIne"
      },
      "specifyFirstCornerPointOr": {
        "Width": "Width"
      },
      "specifyAxisEndpointOfEllipticalArcOr": {
        "Centre": "Centre"
      }
    },
    "prompts": {
      "length": "Length",
      "width": "Width",
      "angle": "Angle",
      "trackingOffset": "Offset",
      "center": "Center",
      "radius": "Radius",
      "diameter": "Diameter",
      "firstPoint": "First point",
      "secondPoint": "Second point",
      "thirdPoint": "Third point",
      "startPoint": "Start point",
      "centerPoint": "Center point",
      "endPoint": "End point",
      "axisEndpoint": "Axis endpoint",
      "otherAxisEndpoint": "Other endpoint of axis",
      "endpointOfAxis": "Endpoint of axis",
      "distanceToOtherAxis": "Distance to other axis",
      "rotationAroundMajorAxis": "Rotation around major axis",
      "startAngle": "Start angle",
      "endAngle": "End angle",
      "startParameter": "Start parameter",
      "endParameter": "End parameter",
      "includedAngle": "Included angle",
      "splineStartTangent": "Specify start tangent",
      "splineEndTangent": "Specify end tangent",
      "splineDegree": "Enter spline degree",
      "firstCorner": "First corner",
      "otherCorner": "Other corner",
      "rectangleElevation": "Specify the elevation for rectangles",
      "rectangleThickness": "Specify thickness for rectangles",
      "rectangleFirstChamfer": "Specify first chamfer distance for rectangles",
      "rectangleSecondChamfer": "Specify second chamfer distance for rectangles",
      "rectangleFillet": "Specify fillet radius for rectangles",
      "rectangleLineWidth": "Specify line width for rectangles",
      "rectangleArea": "Enter area of rectangle in current units",
      "rectangleAreaBasis": "Calculate rectangle dimensions based on",
      "rectangleLength": "Enter rectangle length",
      "rectangleWidth": "Enter rectangle width",
      "rectangleDimensionLength": "Specify length for rectangles",
      "rectangleDimensionWidth": "Specify width for rectangles",
      "rectangleRotation": "Specify rotation angle or",
      "numberOfSides": "Number of sides",
      "patternName": "Enter a pattern name",
      "patternScale": "Specify a scale for the pattern",
      "patternAngle": "Specify an angle for the pattern",
      "blockName": "Enter block name or",
      "insertionBasePoint": "Specify insertion base point",
      "insertionPoint": "Specify insertion point or",
      "specifyInsertionPoint": "Specify insertion point",
      "insertScale": "Specify scale factor for XYZ axes",
      "insertRotation": "Specify rotation angle",
      "attributeTag": "Enter attribute tag name",
      "attributePrompt": "Enter attribute prompt",
      "attributeDefault": "Enter default attribute value",
      "attributeValue": "Enter attribute value",
      "attributeValuePrompt": [
        [
          "prompt"
        ]
      ],
      "attdefModes": "Enter an option to change",
      "attdefDone": "done",
      "definitionTag": "Tag",
      "definitionPrompt": "Prompt",
      "definitionDefault": "Default",
      "textStartPoint": "Specify start point of text",
      "textHeight": "Specify height",
      "textRotation": "Specify rotation angle of text",
      "text": "Text",
      "justify": "Justify",
      "styleName": "Style name",
      "mtextFirstCorner": "Specify first corner",
      "mtextOppositeCorner": "Specify opposite corner",
      "mtextRotation": "Specify rotation angle",
      "mtextWidth": "Specify width",
      "mtextLineSpacing": "Enter line spacing factor or distance",
      "mtextLine": "MText",
      "firstExtensionOrigin": "Specify first extension line origin or <select object>",
      "secondExtensionOrigin": "Specify second extension line origin",
      "dimensionLineLocation": "Specify dimension line location",
      "dimensionLineAngle": "Specify angle of dimension line",
      "dimensionText": "Enter dimension text",
      "dimensionTextAngle": "Specify angle of dimension text",
      "angleVertex": "Specify angle vertex",
      "firstAngleEndpoint": "Specify first angle endpoint",
      "secondAngleEndpoint": "Specify second angle endpoint",
      "dimensionArcLocation": "Specify dimension arc line location",
      "dimensionSpacing": "Enter value",
      "offsetDistance": "Offset distance",
      "basePoint": "Base point",
      "fromOffset": "<Offset>",
      "distance": "Distance",
      "rotationAngle": "Rotation angle",
      "referenceAngle": "Reference angle",
      "newAngle": "New angle",
      "scaleFactor": "Scale factor",
      "referenceLength": "Reference length",
      "newLength": "New length",
      "mirrorFirstPoint": "First point of mirror line",
      "mirrorSecondPoint": "Second point of mirror line",
      "columns": "Columns",
      "rows": "Rows",
      "columnSpacing": "Column spacing",
      "rowSpacing": "Row spacing",
      "items": "Items",
      "fillAngle": "Fill angle",
      "spacing": "Spacing",
      "filletRadius": "Fillet radius",
      "firstDistance": "First distance",
      "secondDistance": "Second distance",
      "clipboardBasePoint": "Specify base point",
      "lengthen": "Lengthen",
      "move": "Move",
      "bulge": "Bulge",
      "ucsOrigin": "Specify origin of UCS or",
      "ucsXAxisPoint": "Specify point on X-axis or",
      "ucsXYPlanePoint": "Specify point on the XY plane or",
      "ucsRotationX": "Specify rotation angle about X axis",
      "ucsRotationY": "Specify rotation angle about Y axis",
      "ucsRotationZ": "Specify rotation angle about Z axis",
      "ucsZAxisOrigin": "Specify new origin point or",
      "ucsZAxisPoint": "Specify point on positive portion of Z-axis",
      "ucsRestoreName": "Enter name of UCS to restore or",
      "ucsSaveName": "Enter name to save current UCS or",
      "ucsDeleteNames": "Enter UCS name(s) to delete",
      "ucsListNames": "Enter UCS name(s) to list",
      "ucsAccept": "accept",
      "ucsNone": "none",
      "ucsReplace": [
        "UCS \"",
        [
          "name"
        ],
        "\" already exists.  Replace it?"
      ],
      "ucsAlignObject": "Select object to align UCS",
      "ucsNewUcs": "Specify origin of new UCS or",
      "ucsNewOrigin": "Specify new origin point",
      "ucsMoveOrigin": "Specify new origin point or",
      "ucsZdepth": "Specify Zdepth",
      "ucsOrthographic": "Enter an option",
      "ucs3XAxisPoint": "Specify point on positive portion of X-axis",
      "ucs3XYPlanePoint": "Specify point on positive-Y portion of the UCS XY plane",
      "ucsTop": "Top",
      "ucsBottom": "Bottom",
      "ucsFront": "Front",
      "ucsBack": "Back",
      "ucsLeft": "Left",
      "ucsRight": "Right",
      "undoCount": "Enter the number of operations to undo or",
      "undoEverything": "This will undo everything. OK?",
      "mredoCount": "Enter number of actions or",
      "undoYes": "Y",
      "undoControl": "Enter an UNDO control option",
      "undoCombine": "Combine zoom and pan operations?",
      "undoLayer": "Combine layer dialog operations?",
      "undoAuto": "Enter UNDO Auto mode",
      "undoOn": "On",
      "undoOff": "Off",
      "panBasePoint": "Specify base point or displacement",
      "planUcsName": "Enter name of UCS or",
      "planCurrent": "Current",
      "zoomCornerOr": "Specify corner of window, enter a scale factor (nX or nXP), or",
      "zoomScaleFactor": "Enter a scale factor (nX or nXP)",
      "viewOption": "Enter an option",
      "viewOrthographic": "Enter an option",
      "elevDefaultElevation": "Specify new default elevation",
      "elevDefaultThickness": "Specify new default thickness",
      "ltscaleFactor": "Enter new linetype scale factor",
      "enterNewValueFor": [
        "Enter new value for ",
        [
          "name"
        ]
      ],
      "osnapModes": "Enter list of object snap modes",
      "snapSpacingOr": "Specify snap spacing or",
      "snapAspect": "A",
      "snapHorizontalSpacing": "Specify horizontal spacing",
      "snapVerticalSpacing": "Specify vertical spacing",
      "defaultObjectColor": "Enter default object color",
      "trueColor": "Red,Green,Blue",
      "linetypeName": "Specify linetype name or",
      "linetypeListNames": "Enter linetype name(s) to list",
      "defaultLineweight": "Enter default lineweight for new objects or",
      "idPoint": "Specify point",
      "distSecondPointOr": "Specify second point or",
      "specifyLengthOfLine": "Specify length of line",
      "polylineStartingWidth": "Specify starting width",
      "polylineEndingWidth": "Specify ending width",
      "polylineStartingHalfWidth": "Specify starting half-width",
      "polylineEndingHalfWidth": "Specify ending half-width",
      "fillMode": "Enter mode",
      "matchpropSource": "Select source object",
      "matchpropDestination": "Select destination object(s)",
      "viewPoint": "Specify a view point",
      "specifyViewPointOr": "Specify a view point or",
      "attributeVisibilitySetting": "Enter attribute visibility setting",
      "selectAnnotationObjectOr": "Select an annotation object or",
      "textEditModeOption": "Enter a text edit mode option",
      "viewAngleInPlane": "Enter angle in XY plane from X axis",
      "viewAngleFromPlane": "Enter angle from XY plane",
      "specifyFirstPoint": "Specify first point",
      "specifyNextPointOr": "Specify next point or",
      "specifyNextPointOrClose": "Specify next point or",
      "lengthOfLine": "Length of line",
      "specifyStartPoint": "Specify start point",
      "specifyEndpointOfArcOr": "Specify endpoint of arc (hold Ctrl to switch direction) or",
      "specifyCenterPointForCircleOr": "Specify center point for circle or",
      "specifyRadiusOfCircleOr": "Specify radius of circle or",
      "specifyRadiusOfCircle": "Specify radius of circle",
      "specifyRadiusOfCircleTtr": "Specify radius of circle",
      "enterNumberOfSides": "Enter number of sides",
      "specifyCenterOfPolygonOr": "Specify center of polygon or",
      "enterAnOption": "Enter an option",
      "inscribedShort": "I",
      "circumscribedShort": "C",
      "specifyFirstEndpointOfEdge": "Specify first endpoint of edge",
      "specifySecondEndpointOfEdge": "Specify second endpoint of edge",
      "specifyAxisEndpointOfEllipseOr": "Specify axis endpoint of ellipse or",
      "specifyAxisEndpointOfEllipticalArcOr": "Specify axis endpoint of elliptical arc or",
      "specifyCenterOfEllipse": "Specify center of ellipse",
      "specifyCenterOfEllipticalArc": "Specify center of elliptical arc",
      "specifyOtherEndpointOfAxis": "Specify other endpoint of axis",
      "specifyEndpointOfAxis": "Specify endpoint of axis",
      "specifyDistanceToOtherAxisOr": "Specify distance to other axis or",
      "specifyRotationAroundMajorAxis": "Specify rotation around major axis",
      "specifyStartAngleOr": "Specify start angle or",
      "specifyEndAngleOr": "Specify end angle or",
      "specifyStartParameterOr": "Specify start parameter or",
      "specifyEndParameterOr": "Specify end parameter or",
      "specifyIncludedAngleForArc": "Specify included angle for arc",
      "specifyFirstPointOr": "Specify first point or",
      "enterSplineCreationMethod": "Enter spline creation method",
      "enterKnotParameterization": "Enter knot parameterization",
      "knotsChord": "Chord",
      "knotsSquareRoot": "Square root",
      "knotsUniform": "Uniform",
      "enterDegreeOfSpline": "Enter degree of spline",
      "enterNextPoint": "Enter next point",
      "enterNextPointOr": "Enter next point or",
      "enterThirdPointOr": "Enter next point or",
      "specifyStartTangent": "Specify start tangent",
      "specifyEndTangent": "Specify end tangent",
      "specifyDiameterOfCircle": "Specify diameter of circle",
      "specifyFirstEndPointOfDiameter": "Specify first end point of circle's diameter",
      "specifySecondEndPointOfDiameter": "Specify second end point of circle's diameter",
      "specifyFirstPointOnCircle": "Specify first point on circle",
      "specifySecondPointOnCircle": "Specify second point on circle",
      "specifyThirdPointOnCircle": "Specify third point on circle",
      "specifyFirstTangentOfCircle": "Specify point on object for first tangent of circle",
      "specifySecondTangentOfCircle": "Specify point on object for second tangent of circle",
      "specifySecondPoint": "Specify second point",
      "secondPointOfDistance": " Specify second point",
      "clarifyKeyword": [
        [
          "keywords"
        ],
        "?"
      ],
      "specifyFirstCornerPointOr": "Specify first corner point or",
      "addModeNextPointOr": " (ADD mode)Specify next point or",
      "subtractModeNextPointOr": " (SUBTRACT mode)Specify next point or",
      "addModeSelectObjects": "(ADD mode) Select objects",
      "subtractModeSelectObjects": "(SUBTRACT mode) Select objects",
      "specifyOtherCornerPointOr": "Specify other corner point or",
      "specifyStartPointOfArcOr": "Specify start point of arc or",
      "specifySecondPointOfArcOr": "Specify second point of arc or",
      "specifyEndPointOfArc": "Specify end point of arc",
      "specifyCenterPointOfArc": "Specify center point of arc",
      "specifyIncludedAngle": "Specify included angle",
      "specifyRadiusOfArc": "Specify radius of arc",
      "specifyDirectionOfChordForArc": "Specify direction of chord for arc (hold Ctrl to switch direction)",
      "specifyIncludedAngleCtrl": "Specify included angle (hold Ctrl to switch direction)",
      "specifyLengthOfChordCtrl": "Specify length of chord (hold Ctrl to switch direction)",
      "specifyTangentDirectionForStartPointOfArc": "Specify the tangent direction for the start point of arc",
      "specifyEndpointOfTheArcCtrl": "Specify endpoint of the arc (hold Ctrl to switch direction)",
      "specifySecondPointOnArc": "Specify second point on arc",
      "specifyStartPointOfArc": "Specify start point of arc",
      "specifyEndPointOfArcCtrl": "Specify end point of arc (hold Ctrl to switch direction)",
      "selectObjects": "Select objects",
      "removeObjects": "Remove objects",
      "specifyFirstCorner": "Specify first corner",
      "specifyOppositeCorner": "Specify opposite corner",
      "specifyFirstFencePoint": "Specify first fence point or pick/drag cursor",
      "specifyNextFencePointOr": "Specify next fence point or",
      "firstPolygonPoint": "First polygon point or pick/drag cursor",
      "specifyEndpointOfLineOr": "Specify endpoint of line or",
      "specifyBasePointOr": "Specify base point or",
      "specifyDisplacement": "Specify displacement",
      "specifySecondPointOr": "Specify second point or",
      "useFirstPointAsDisplacement": "use first point as displacement",
      "copySecondPointOr": "Specify second point or",
      "specifyBasePoint": "Specify base point",
      "specifyRotationAngleOr": "Specify rotation angle or",
      "specifyTheReferenceAngle": "Specify the reference angle",
      "specifyTheNewAngle": "Specify the new angle",
      "specifyTheNewAngleOr": "Specify the new angle or",
      "specifyScaleFactorOr": "Specify scale factor or",
      "specifyReferenceLength": "Specify reference length",
      "specifyNewLengthOr": "Specify new length or",
      "specifyFirstPointOfMirrorLine": "Specify first point of mirror line",
      "specifySecondPointOfMirrorLine": "Specify second point of mirror line",
      "eraseSourceObjects": "Erase source objects?",
      "selectSourceOrMultipleToJoin": "Select source object or multiple objects to join at once",
      "selectObjectsToJoin": "Select objects to join",
      "convertCombinedArcsToCircle": "Combined arc segments form a circle.  Convert to circle?",
      "specifyOffsetDistanceOr": "Specify offset distance or",
      "eraseSourceObjectAfterOffsetting": "Erase source object after offsetting?",
      "enterLayerOptionForOffsetObjects": "Enter layer option for offset objects",
      "selectObjectToOffsetOr": "Select object to offset or",
      "specifyPointOnSideToOffsetOr": "Specify point on side to offset or",
      "specifyThroughPointOr": "Specify through point or",
      "nextObject": "next object",
      "enterImpliedEdgeExtensionMode": "Enter an implied edge extension mode",
      "enterTrimModeOption": "Enter a trim mode option",
      "enterExtendModeOption": "Enter an extend mode option",
      "selectObjectsOr": "Select objects or",
      "selectAll": "select all",
      "selectObjectsToEraseOrExit": "Select objects to erase or <exit>",
      "selectObjectsToErase": "Select objects to erase",
      "selectObjectToTrimOrShiftSelectToExtendOr": "Select object to trim or shift-select to extend or",
      "selectObjectToExtendOrShiftSelectToTrimOr": "Select object to extend or shift-select to trim or",
      "selectFirstObjectOr": "Select first object or",
      "selectSecondObjectOrApplyCornerOr": "Select second object or shift-select to apply corner or",
      "specifyFilletRadius": "Specify fillet radius",
      "select2dPolylineOr": "Select 2D polyline or",
      "selectPolylineToChamferOr": "Select 2D polyline or",
      "selectFirstLineOr": "Select first line or",
      "selectSecondLineOrApplyCornerOr": "Select second line or shift-select to apply corner or",
      "specifyFirstChamferDistance": "Specify first chamfer distance",
      "specifySecondChamferDistance": "Specify second chamfer distance",
      "selectObject": "Select object",
      "specifyFirstBreakPoint": "Specify first break point",
      "specifySecondBreakPointOr": "Specify second break point or",
      "specifySecondBreakPoint": "Specify second break point",
      "specifyBreakPoint": "Specify break point",
      "enterArrayType": "Enter array type",
      "selectGripToEditArrayOr": "Select grip to edit array or",
      "enterNumberOfColumns": "Enter the number of columns",
      "enterNumberOfRows": "Enter the number of rows",
      "specifyDistanceBetweenColumnsOfCell": "Specify the distance between columns or",
      "unitCellFirstCorner": "Specify first corner point of unit cell",
      "unitCellOppositeCorner": "Specify opposite corner",
      "specifyDistanceBetweenColumns": "Specify the distance between columns",
      "specifyDistanceBetweenRows": "Specify the distance between rows",
      "specifyIncrementingElevationBetweenRows": "Specify the incrementing elevation between rows",
      "specifyCenterPointOfArray": "Specify center point of array",
      "enterNumberOfItemsInArray": "Enter number of items in array",
      "specifyAngleBetweenItems": "Specify angle between items",
      "specifyTheAngleToFill": "Specify the angle to fill (+=ccw, -=cw)",
      "rotateArrayedItems": "Rotate arrayed items?",
      "createAssociativeArray": "Create associative array",
      "selectPathCurve": "Select path curve",
      "enterPathMethod": "Enter path method",
      "enterNumberOfItemsAlongPath": "Enter number of items along path",
      "specifyDistanceBetweenItemsAlongPath": "Specify the distance between items along path",
      "specifyNumberOfItemsOr": "Specify number of items or",
      "alignArrayedItemsToPath": "Align arrayed items to path?",
      "specifyInternalPointOr": "Specify internal point or",
      "enterPatternNameOr": "Enter a pattern name or",
      "specifyStartPointOfText": "Specify start point of text",
      "specifyStartPointOfTextOr": "Specify start point of text or",
      "specifyCenterPointOfText": "Specify center point of text",
      "specifyCenterPointOfTextOr": "Specify center point of text or",
      "specifyRightEndpointOfTextBaseline": "Specify right endpoint of text baseline",
      "specifyRightEndpointOfTextBaselineOr": "Specify right endpoint of text baseline or",
      "specifyMiddlePointOfText": "Specify middle point of text",
      "specifyMiddlePointOfTextOr": "Specify middle point of text or",
      "specifyTopLeftPointOfText": "Specify top-left point of text",
      "specifyTopLeftPointOfTextOr": "Specify top-left point of text or",
      "specifyTopCenterPointOfText": "Specify top-center point of text",
      "specifyTopCenterPointOfTextOr": "Specify top-center point of text or",
      "specifyTopRightPointOfText": "Specify top-right point of text",
      "specifyTopRightPointOfTextOr": "Specify top-right point of text or",
      "specifyMiddleLeftPointOfText": "Specify middle-left point of text",
      "specifyMiddleLeftPointOfTextOr": "Specify middle-left point of text or",
      "specifyMiddleRightPointOfText": "Specify middle-right point of text",
      "specifyMiddleRightPointOfTextOr": "Specify middle-right point of text or",
      "specifyBottomLeftPointOfText": "Specify bottom-left point of text",
      "specifyBottomLeftPointOfTextOr": "Specify bottom-left point of text or",
      "specifyBottomCenterPointOfText": "Specify bottom-center point of text",
      "specifyBottomCenterPointOfTextOr": "Specify bottom-center point of text or",
      "specifyBottomRightPointOfText": "Specify bottom-right point of text",
      "specifyBottomRightPointOfTextOr": "Specify bottom-right point of text or",
      "enterStyleNameOr": "Enter style name or",
      "enterText": "Enter text",
      "mtextOppositeCornerOr": "Specify opposite corner or",
      "mtextHeight": "Specify height",
      "enterJustification": "Enter justification",
      "enterLineSpacingType": "Enter line spacing type",
      "mtextStyleNameOr": "Enter style name or",
      "selectObjectToDimension": "Select object to dimension",
      "dimensionLineLocationOr": "Specify dimension line location or",
      "enterDimensionText": "Enter dimension text",
      "specifyAngleOfDimensionText": "Specify angle of dimension text",
      "selectArcOrCircle": "Select arc or circle",
      "selectArcCircleLineOrVertex": "Select arc, circle, line, or <specify vertex>",
      "selectSecondLine": "Select second line",
      "dimensionArcLocationOr": "Specify dimension arc line location or",
      "secondExtensionOriginOr": "Specify second extension line origin or",
      "selectBaseDimension": "Select base dimension",
      "selectContinuedDimension": "Select continued dimension",
      "spaceBaseDimension": "Select base dimension",
      "selectDimensionsToSpace": "Select dimensions to space",
      "enterValueOr": "Enter value or"
    },
    "format": {
      "idle": "Command",
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
            "to": " to",
            "of": " of",
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
      "keywordOr": " or ",
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
        "Unknown command \"",
        [
          "name"
        ],
        "\".  Press F1 for help."
      ],
      "cancel": "*Cancel*",
      "commandCancelled": "*Cancel*",
      "resumingCommand": [
        "Resuming ",
        [
          "command"
        ],
        " command."
      ],
      "readOnlyVariable": [
        [
          "name"
        ],
        " = ",
        [
          "value"
        ],
        " (read only)"
      ],
      "notTransparent": "** That command may not be invoked transparently **",
      "rotateSettings": [
        "Current positive angle in UCS:  ANGDIR=counterclockwise  ANGBASE=",
        [
          "angbase"
        ]
      ],
      "rotatingCopy": "Rotating a copy of the selected objects.",
      "scalingCopy": "Scaling a copy of the selected objects.",
      "trimExtendSettings": [
        "Current settings: Projection=UCS, Edge=",
        [
          "edge",
          1,
          {
            "extend": "Extend",
            "other": "None"
          }
        ],
        ", Mode=",
        [
          "mode",
          1,
          {
            "standard": "Standard",
            "other": "Quick"
          }
        ]
      ],
      "selectCuttingEdges": "Select cutting edges ...",
      "selectBoundaryEdges": "Select boundary edges ...",
      "doesNotIntersectCuttingEdge": "Does not intersect with the cutting edge.",
      "pathDoesNotIntersectBoundingEdge": "Path does not intersect with the bounding edge.",
      "objectDoesNotIntersectEdge": "Object does not intersect an edge.",
      "cannotExtendObject": "Cannot EXTEND this object.",
      "cannotExtendThisObject": "Cannot EXTEND this object.",
      "cannotTrimObject": "Cannot TRIM this object.",
      "cannotTrimThisObject": "Cannot TRIM this object.",
      "objectPerpendicularToUcs": "Object is perpendicular to UCS XY plane.",
      "edgePerpendicularToUcs": "Edge is perpendicular to UCS XY plane.",
      "noEdgeInThatDirection": "No edge in that direction.",
      "noObjectsCrossedByCrossingWindow": "No objects crossed by crossing window.",
      "circleMustIntersectTwice": "Circle must intersect twice.",
      "curveMustIntersectTwice": "Curve must intersect cutting edges at least twice.",
      "filletSettings": [
        "Current settings: Mode = TRIM, Radius = ",
        [
          "radius"
        ]
      ],
      "chamferSettings": [
        "(TRIM mode) Current chamfer Dist1 = ",
        [
          "dist1"
        ],
        ", Dist2 = ",
        [
          "dist2"
        ]
      ],
      "offsetSettings": [
        "Current settings: Erase source=",
        [
          "erase",
          1,
          {
            "yes": "Yes",
            "other": "No"
          }
        ],
        "  Layer=",
        [
          "layer",
          1,
          {
            "current": "Current",
            "other": "Source"
          }
        ],
        "  OFFSETGAPTYPE=0"
      ],
      "objectOnLockedLayer": "The object is on a locked layer.",
      "invalidThroughPoint": "Invalid through point.",
      "cannotOffsetObject": "Cannot offset that object.",
      "cannotOffsetAtViewDirection": "Cannot offset that object at current view direction.",
      "objectsFound": [
        [
          "box",
          1,
          {
            "yes": "Specify opposite corner: ",
            "other": ""
          }
        ],
        [
          "found"
        ],
        " found",
        [
          "duplicate",
          2,
          {
            "=0": "",
            "other": [
              " (",
              0,
              " duplicate)"
            ]
          }
        ],
        [
          "removed",
          2,
          {
            "=0": "",
            "other": [
              ", ",
              0,
              " removed"
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
            "window": "Window",
            "crossing": "Crossing",
            "other": "Fence"
          }
        ],
        " Lasso  Press Spacebar to cycle options"
      ],
      "onLockedLayer": [
        [
          "count",
          2,
          {
            "one": [
              0,
              " was on a locked layer."
            ],
            "other": [
              0,
              " were on a locked layer."
            ]
          }
        ]
      ],
      "noPreviousSelection": "No previous selection set.",
      "allSelectionsUndone": "All selections have been undone.",
      "invalidWindowSpecification": "Invalid window specification.",
      "invalidResponse": "Invalid response.",
      "polygonSegmentZeroLength": "Invalid point, polygon segment is zero length.",
      "polygonSegmentsIntersect": "Invalid point, polygon segments cannot intersect.",
      "copyModeMultiple": "Current settings:  Copy mode = Multiple",
      "stretchSelection": "Select objects to stretch by crossing-window or crossing-polygon...",
      "currentLineWidth": [
        "Current line-width is ",
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
              " object erased."
            ],
            "other": [
              0,
              " objects erased."
            ]
          }
        ]
      ],
      "snapMode": [
        " <Snap ",
        [
          "state",
          1,
          {
            "on": "on",
            "other": "off"
          }
        ],
        ">"
      ],
      "osnapMode": [
        " <Osnap ",
        [
          "state",
          1,
          {
            "on": "on",
            "other": "off"
          }
        ],
        ">"
      ],
      "orthoMode": [
        " <Ortho ",
        [
          "state",
          1,
          {
            "on": "on",
            "other": "off"
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
            "on": "on",
            "other": "off"
          }
        ],
        ">"
      ],
      "otrackMode": [
        " <Object Snap Tracking ",
        [
          "state",
          1,
          {
            "on": "on",
            "other": "off"
          }
        ],
        ">"
      ],
      "fromNeedsPoint": "FROM needs a point prompt.",
      "fromBase": "FROM: pick the base point.",
      "fromOffset": "FROM: offset from the base point.",
      "angleOverride": [
        "Angle Override: ",
        [
          "angle"
        ]
      ],
      "saveUnavailable": "Saving to a file is not available here.",
      "openUnavailable": "Opening a file is not available here.",
      "openFailed": "Could not open the file.",
      "fileError": {
        "invalidJson": "The file is not valid JSON.",
        "unrecognised": "Unrecognised drawing file.",
        "notADrawing": "This file is not a MellowCAD drawing.",
        "newerVersion": "This drawing was created with a newer version of MellowCAD. Please update to open it."
      },
      "clipboardEmpty": "Nothing on the clipboard.",
      "noUnusedBlocks": "No unused blocks.",
      "blocksPurged": [
        [
          "count",
          2,
          {
            "one": [
              0,
              " block purged."
            ],
            "other": [
              0,
              " blocks purged."
            ]
          }
        ]
      ],
      "noBlocks": "No blocks defined.",
      "blockUndefined": [
        "Block \"",
        [
          "name"
        ],
        "\" is not defined."
      ],
      "hatchPatternUnknown": "Unknown pattern name.",
      "hatchTooDense": "Hatch spacing too dense, or dash size too small.",
      "hatchNoBoundary": "Valid hatch boundary not found.",
      "noBoundaryToUndo": "No boundary to Undo.",
      "textStyleUndefined": [
        "Cannot find text style \"",
        [
          "name"
        ],
        "\"."
      ],
      "textJustifyOptions": [
        "Enter an option [",
        [
          "keywords"
        ],
        "]:"
      ],
      "attributeModes": [
        "Current attribute modes:\nInvisible=",
        [
          "invisible",
          1,
          {
            "yes": "Y",
            "other": "N"
          }
        ],
        "  Constant=",
        [
          "constant",
          1,
          {
            "yes": "Y",
            "other": "N"
          }
        ],
        "  Verify=",
        [
          "verify",
          1,
          {
            "yes": "Y",
            "other": "N"
          }
        ],
        "  Preset=",
        [
          "preset",
          1,
          {
            "yes": "Y",
            "other": "N"
          }
        ],
        "  Lock position=",
        [
          "lockPosition",
          1,
          {
            "yes": "Y",
            "other": "N"
          }
        ],
        "  Annotative=N  Multiple line=N"
      ],
      "enterAttributeValues": "Enter attribute values",
      "verifyAttributeValues": "Verify attribute values",
      "explodeRejected": [
        [
          "count",
          2,
          {
            "one": [
              0,
              " was not able to be exploded."
            ],
            "other": [
              0,
              " were not able to be exploded."
            ]
          }
        ]
      ],
      "explodeLostWidth": "Exploding this polyline has lost width information.\nThe UNDO command will restore it.",
      "explodeCannot": [
        "Cannot explode ",
        [
          "name"
        ]
      ],
      "noneFound": "None found.",
      "currentUcsName": [
        "Current ucs name:  ",
        [
          "kind",
          1,
          {
            "world": "*WORLD*",
            "unnamed": "*NO NAME*",
            "top": "*TOP*",
            "bottom": "*BOTTOM*",
            "front": "*FRONT*",
            "back": "*BACK*",
            "left": "*LEFT*",
            "right": "*RIGHT*",
            "other": [
              [
                "name"
              ]
            ]
          }
        ]
      ],
      "listedUcsName": [
        "Current ucs name: ",
        [
          "kind",
          1,
          {
            "world": "*WORLD*",
            "unnamed": "*NO NAME*",
            "top": "*TOP*",
            "bottom": "*BOTTOM*",
            "front": "*FRONT*",
            "back": "*BACK*",
            "left": "*LEFT*",
            "right": "*RIGHT*",
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
      "savedUcsHeader": "Saved coordinate systems:",
      "savedUcsEntry": [
        "\"",
        [
          "name"
        ],
        "\"\n     Origin = <",
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
        ">, X Axis = <",
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
        ">\n     Y Axis = <",
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
        ">, Z Axis = <",
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
        "Cannot find UCS \"",
        [
          "name"
        ],
        "\"."
      ],
      "noMatchingUcs": "  No matching UCS names found.",
      "ucsDeleted": [
        "Deleted ",
        [
          "count"
        ],
        " UCS ",
        [
          "count",
          2,
          {
            "one": "name",
            "other": "names"
          }
        ],
        "."
      ],
      "invalidUcsName": "Invalid UCS name.",
      "coincidentWithFirstPoint": "Coincident with first point",
      "pointsAreColinear": "Points are colinear",
      "noPreviousUcs": "No previous coordinate system saved.",
      "everythingUndone": "Everything has been undone",
      "nothingToUndo": "Nothing to undo",
      "nothingToRedo": "Nothing to redo",
      "everythingRedone": "Everything has been redone",
      "redoMustFollowUndo": "REDO must immediately follow the U or UNDO command.",
      "alreadyRedone": "The last UNDO operation has been already redone.",
      "undoSettings": [
        "Current settings: Auto = ",
        [
          "auto",
          1,
          {
            "on": "On",
            "other": "Off"
          }
        ],
        ", Control = ",
        [
          "control",
          1,
          {
            "all": "All",
            "one": "One",
            "other": "None"
          }
        ],
        ", Combine = ",
        [
          "combine",
          1,
          {
            "yes": "Yes",
            "other": "No"
          }
        ],
        ", Layer = ",
        [
          "layer",
          1,
          {
            "yes": "Yes",
            "other": "No"
          }
        ]
      ],
      "markEncountered": "Mark encountered",
      "startOfGroup": "Start of Group encountered.\nMust enter UNDO END to go back further.",
      "undoGroup": "GROUP",
      "dropGeometryStep": "DROPGEOM GROUP",
      "uDisabled": "U command disabled.  Use UNDO command to turn it on",
      "redoDisabled": [
        [
          "command",
          1,
          {
            "mredo": "REDO and MREDO commands disabled",
            "other": "REDO command disabled"
          }
        ],
        ". Use UNDO C to turn it on."
      ],
      "requiresIntegerValueOrKeyword": [
        "Requires an integer value ",
        [
          "value"
        ],
        ", or option keyword."
      ],
      "requiresIntegerBetweenOrKeyword": [
        "Requires an integer between ",
        [
          "min"
        ],
        " and ",
        [
          "max"
        ],
        ", or option keyword."
      ],
      "yesOrNoPlease": "Yes or No, please.",
      "requiresDistanceNumberXOrKeyword": "Requires a distance, numberX, or option keyword.",
      "noPreviousView": "No previous view saved.",
      "currentLinetype": [
        "Current line type:  \"",
        [
          "name"
        ],
        "\""
      ],
      "linetypeByLayer": "ByLayer",
      "linetypeNotFound": [
        "Linetype \"",
        [
          "name"
        ],
        "\" not found in acadiso.lin.\nYou can use the \"Load\" option to load it from another file."
      ],
      "loadedLinetypes": "ByLayer, ByBlock, or one of these loaded linetypes:",
      "linetypeColumns": "      Name          Description\n---------------- ------------------",
      "linetypesInFile": [
        "Linetypes defined in file ",
        [
          "file"
        ],
        ":"
      ],
      "fileLinetypeColumns": "      Name          Description\n---------------- -------------------",
      "solidLine": "Solid line",
      "noMatchingLinetypes": "  No matching linetype names found.",
      "invalidColorNumber": "Invalid color number.",
      "tagCannotBeNull": "Tag cannot be null",
      "attdefTextStyle": [
        "Current text style:  \"",
        [
          "style"
        ],
        "\"  Text height:  ",
        [
          "height"
        ],
        "  Justify:  ",
        [
          "justify"
        ]
      ],
      "blockConversion": "Current settings: Object conversion=Convert",
      "invalidBlockName": "Invalid block name.",
      "rectangleModes": [
        "Current rectangle modes:",
        [
          "corners",
          1,
          {
            "chamfer": [
              "  Chamfer=",
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
              "  Elevation=",
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
              "  Fillet=",
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
              "  Thickness=",
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
              "  Width=",
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
              "  Rotation=",
              [
                "rotation"
              ]
            ],
            "other": ""
          }
        ]
      ],
      "textEditSettings": [
        "Current settings: Edit mode = ",
        [
          "mode",
          1,
          {
            "single": "Single",
            "other": "Multiple"
          }
        ]
      ],
      "totalArea": [
        "Total area = ",
        [
          "total"
        ]
      ],
      "areaReport": [
        "Area = ",
        [
          "area"
        ],
        ", ",
        [
          "measured",
          1,
          {
            "circumference": "Circumference",
            "length": "Length",
            "other": "Perimeter"
          }
        ],
        " = ",
        [
          "around"
        ]
      ],
      "objectHasNoArea": "Selected object does not have an area",
      "allSegmentsUndone": "All segments already undone.",
      "distanceTotal": [
        "Distance = ",
        [
          "value"
        ]
      ],
      "distanceReport": [
        "Distance = ",
        [
          "distance"
        ],
        ",  Angle in XY Plane = ",
        [
          "angleInPlane"
        ],
        ",  Angle from XY Plane = ",
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
      "linesNonCoplanar": "Lines are non coplanar.",
      "lineAndPolylineNonCoplanar": "Line and polyline are non coplanar.",
      "twoEntitiesNonCoplanar": "Two entities are non coplanar.",
      "cannotFilletBetween": "Cannot fillet between these two entities.",
      "noValidFillet": [
        "No valid fillet with radius ",
        [
          "radius"
        ]
      ],
      "cannotFilletItself": "Cannot fillet an entity with itself.",
      "collinearCannotFillet": "Collinear lines connot be filleted.",
      "collinearCannotChamfer": "Collinear lines connot be chamfered.",
      "cannotChamferItself": "Cannot chamfer an entity with itself.",
      "segmentsNotConsecutive": "Lines belonging to polylines must be consecutive or separated by one segment",
      "notA2dPolyline": "Object selected is not a 2D polyline",
      "cornersSkipped": [
        [
          "parallel",
          2,
          {
            "=0": "",
            "one": [
              0,
              " was parallel    "
            ],
            "other": [
              0,
              " were parallel    "
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
              " was too short    "
            ],
            "other": [
              0,
              " were too short    "
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
              " was divergent    "
            ],
            "other": [
              0,
              " were divergent    "
            ]
          }
        ]
      ],
      "invalid": "*Invalid*",
      "splineSettingsFit": [
        "Current settings: Method=Fit   Knots=",
        [
          "knots",
          1,
          {
            "chord": "Chord",
            "sqrtChord": "Square root",
            "other": "Uniform"
          }
        ]
      ],
      "splineSettingsCv": [
        "Current settings: Method=CV   Degree=",
        [
          "degree"
        ]
      ],
      "requiresIntegerBetween": [
        "Requires an integer between ",
        [
          "min"
        ],
        " and ",
        [
          "max"
        ],
        "."
      ],
      "commandCompletelyUndone": "Command has been completely undone.",
      "commandCompletelyUndoneShort": "Command has been completely undone.",
      "linesParallel": "Lines are parallel",
      "linesDiverge": "Lines diverge",
      "filletRadiusTooLarge": "Fillet radius is too large",
      "chamferDistanceTooLarge": "Chamfer distance is too large",
      "cannotChamferArcSegments": "Cannot chamfer polyline arc segments.",
      "chamferRequiresLines": "Chamfer requires 2 lines (not arc segments).",
      "cannotFilletBetweenThese": "Cannot fillet between these two entities.",
      "filletRequiresObjects": "Fillet requires 2 lines, arcs, or circles.",
      "filletRequiresNotBlocks": "Fillet requires 2 lines, arcs, or circles (not block references).",
      "filletRequiresNotDimensions": "Fillet requires 2 lines, arcs, or circles (not dimensions).",
      "unableToFilletCurves": "Unable to fillet curves.",
      "chamferRequiresTwoLines": "Chamfer requires 2 lines.",
      "chamferRequiresNotBlocks": "Chamfer requires 2 lines (not block references).",
      "chamferRequiresNotDimensions": "Chamfer requires 2 lines (not dimensions).",
      "cannotChamferBetween": "Cannot chamfer between these two entities.",
      "linesChamfered": [
        [
          "count",
          2,
          {
            "one": [
              0,
              " line was chamfered"
            ],
            "other": [
              0,
              " lines were chamfered"
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
              " line was filleted"
            ],
            "other": [
              0,
              " lines were filleted"
            ]
          }
        ]
      ],
      "nothingJoined": [
        "0 objects joined, ",
        [
          "count",
          2,
          {
            "one": [
              0,
              " object"
            ],
            "other": [
              0,
              " objects"
            ]
          }
        ],
        " discarded from the operation"
      ],
      "linesJoined": [
        [
          "count"
        ],
        " lines joined into 1 line",
        [
          "discarded",
          2,
          {
            "=0": "",
            "one": [
              ", ",
              0,
              " object discarded from the operation"
            ],
            "other": [
              ", ",
              0,
              " objects discarded from the operation"
            ]
          }
        ]
      ],
      "arcsJoined": [
        [
          "count"
        ],
        " arcs joined into 1 arc",
        [
          "discarded",
          2,
          {
            "=0": "",
            "one": [
              ", ",
              0,
              " object discarded from the operation"
            ],
            "other": [
              ", ",
              0,
              " objects discarded from the operation"
            ]
          }
        ]
      ],
      "arcsJoinedIntoCircle": [
        [
          "count"
        ],
        " arcs joined and converted to circle",
        [
          "discarded",
          2,
          {
            "=0": "",
            "one": [
              ", ",
              0,
              " object discarded from the operation"
            ],
            "other": [
              ", ",
              0,
              " objects discarded from the operation"
            ]
          }
        ]
      ],
      "objectsConvertedToPolylines": [
        [
          "count"
        ],
        " objects converted to ",
        [
          "polylines",
          2,
          {
            "one": [
              0,
              " polyline"
            ],
            "other": [
              0,
              " polylines"
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
              " object discarded from the operation"
            ],
            "other": [
              ", ",
              0,
              " objects discarded from the operation"
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
              " segment"
            ],
            "other": [
              0,
              " segments"
            ]
          }
        ],
        " joined into 1 polyline",
        [
          "discarded",
          2,
          {
            "=0": "",
            "one": [
              ", ",
              0,
              " object discarded from the operation"
            ],
            "other": [
              ", ",
              0,
              " objects discarded from the operation"
            ]
          }
        ]
      ],
      "currentViewDirection": [
        "Current view direction:  VIEWDIR=",
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
      "invalidInputTryAgain": "Invalid input. Try again.",
      "regeneratingModel": "Regenerating model.",
      "regenQueued": "Regen queued.",
      "requiresRegen": "** Requires a regen, cannot be transparent.",
      "panExit": "Press ESC or ENTER to exit, or right-click to display shortcut menu.",
      "requiresTwoPointsOrDisplacement": "Requires two points, or a displacement followed by ENTER.",
      "currentOsnapModes": [
        "Current osnap modes: ",
        [
          "modes"
        ]
      ],
      "currentLineweight": [
        "Current lineweight: ",
        [
          "value"
        ]
      ],
      "pointingEdgeOn": "Pointing in edge-on UCS is prohibited.",
      "circleDoesNotExist": "Circle does not exist.",
      "radiusMustBeNonZero": "Radius must be non-zero.",
      "noLineOrArcToContinue": "No line or arc to continue.",
      "allLineSegmentsUndone": "All segments already undone.",
      "zeroLengthLineCreated": [
        "Zero length line created at (",
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
      "positiveNonzero": "Value must be positive and nonzero.",
      "parameterCannotBeZero": "The parameter cannot be set to 0.  Enter a non-zero number or expression.",
      "areaPositiveNonzero": "Value must be positive and nonzero.",
      "valueMustBePositive": "Value must be positive.",
      "valueMustBeNonzero": "Value must be nonzero.",
      "previousDirectionNotUcsParallel": [
        "Previous direction not UCS parallel, using ",
        [
          "angle"
        ],
        "."
      ],
      "lineweightRequired": "A weight in lineweight units is required.",
      "lineweightRounded": [
        "Lineweight rounded to nearest valid value of ",
        [
          "value"
        ]
      ],
      "colorRequired": "A color number or standard color name is required.",
      "invalidTrueColor": "Invalid color.  Type three comma separated values from 0 to 255.",
      "invalidOsnapModes": "Invalid object snap modes.",
      "invalidPoint": "Invalid point.",
      "snapNotFound": [
        "No ",
        [
          "snap",
          1,
          {
            "endpoint": "Endpoint ",
            "midpoint": "Midpoint ",
            "center": "Center ",
            "quadrant": "Quadrant ",
            "intersection": "Intersection ",
            "insertion": "Insert ",
            "perpendicular": "Perpendicular ",
            "nearest": "Nearest ",
            "other": ""
          }
        ],
        "found for specified point."
      ],
      "invalidPoint2d": "Invalid 2D point.",
      "pointOrKeywordRequired": "Point or option keyword required.",
      "point2dOrKeywordRequired": "2D point or option keyword required.",
      "pointsMustBeDistinct": "Points must be distinct.",
      "requiresDistance": [
        "Requires numeric distance",
        [
          "keyword",
          1,
          {
            "yes": [
              [
                "points",
                1,
                {
                  "second": ", second point, or option keyword.",
                  "other": ", two points, or option keyword."
                }
              ]
            ],
            "other": [
              [
                "points",
                1,
                {
                  "second": " or second point.",
                  "other": " or two points."
                }
              ]
            ]
          }
        ]
      ],
      "requiresAngle": [
        "Requires valid numeric angle",
        [
          "keyword",
          1,
          {
            "yes": [
              [
                "points",
                1,
                {
                  "second": ", second point, or option keyword.",
                  "other": ", two points, or option keyword."
                }
              ]
            ],
            "other": [
              [
                "points",
                1,
                {
                  "second": " or second point.",
                  "other": " or two points."
                }
              ]
            ]
          }
        ]
      ],
      "requiresNumber": [
        "Requires numeric value",
        [
          "keyword",
          1,
          {
            "yes": " or option keyword.",
            "other": "."
          }
        ]
      ],
      "requiresInteger": [
        "Requires an integer value",
        [
          "keyword",
          1,
          {
            "yes": " or option keyword.",
            "other": "."
          }
        ]
      ],
      "requiresRadius": "Requires numeric radius, point on circumference, or \"D\".",
      "requiresTangent": "Requires a TAN object-snap and selection of Circle, Arc, or Line.",
      "requiresTangentSelection": "*Requires a TAN object-snap and selection of Circle, Arc, or Line.",
      "invalidOptionKeyword": "Invalid option keyword.",
      "ambiguousResponse": "Ambiguous response, please clarify...",
      "invalidSelection": "*Invalid selection*",
      "expectsPointOr": [
        "Expects a point or ",
        [
          "keywords"
        ]
      ],
      "selectionModes": [
        [
          "set",
          1,
          {
            "subobjects": "Window/Crossing/BOX/Fence/WPolygon/CPolygon/Add/Remove/Multiple/Previous/Undo/AUto/SIngle/SUbobject/Object",
            "oneObject": "Window/Last/Crossing/BOX/ALL/Fence/WPolygon/CPolygon",
            "singleSet": "Window/Last/Crossing/BOX/ALL/Fence/WPolygon/CPolygon/Group",
            "pathCurve": "Window/Last/Crossing/BOX/ALL/Fence/WPolygon/CPolygon/Group/Previous/AUto",
            "crossingObjects": "Window/Last/Crossing/BOX/ALL/Fence/WPolygon/CPolygon/Add/Remove/Multiple/Previous/Undo/AUto/SIngle",
            "wholeObjects": "Window/Last/Crossing/BOX/ALL/Fence/WPolygon/CPolygon/Group/Add/Remove/Multiple/Previous/Undo/AUto/SIngle",
            "other": "Window/Last/Crossing/BOX/ALL/Fence/WPolygon/CPolygon/Group/Add/Remove/Multiple/Previous/Undo/AUto/SIngle/SUbobject/Object"
          }
        ]
      ],
      "noObjectFound": "No object found",
      "arcCannotBeFull360": "Arc cannot be full 360 degrees",
      "objectCannotBeBroken": "Object can't be broken",
      "cannotBreakBlock": "Can't break a block",
      "cannotBreakClosedAtOnePoint": "Cannot break a closed, periodic curve at only one point.",
      "arrayType": [
        "Type = ",
        [
          "type",
          1,
          {
            "rectangular": "Rectangular",
            "polar": "Polar",
            "other": "Path"
          }
        ],
        "  Associative = No"
      ],
      "arrayTypeAssociative": [
        "Type = ",
        [
          "type",
          1,
          {
            "rectangular": "Rectangular",
            "polar": "Polar",
            "other": "Path"
          }
        ],
        "  Associative = Yes"
      ],
      "requiresPositiveInteger": "Requires a positive nonzero integer or option keyword.",
      "requiresNonzero": "Requires numeric nonzero value.",
      "maximumItems": [
        "Maximum items = ",
        [
          "count"
        ]
      ],
      "pathCurveIsArrayed": "Objects selected to be arrayed may not be selected as path curve.",
      "filteredOut": [
        [
          "count",
          2,
          {
            "one": "1 was filtered out",
            "other": [
              0,
              " were filtered out"
            ]
          }
        ]
      ],
      "currentHatchPattern": [
        "Current hatch pattern:  ",
        [
          "name"
        ]
      ],
      "selectingEverything": "Selecting everything...",
      "selectingEverythingVisible": "Selecting everything visible...",
      "analyzingSelectedData": "Analyzing the selected data...",
      "analyzingInternalIslands": "Analyzing internal islands...",
      "requiresDistanceOrNumberX": "Requires a distance (or numberX).",
      "currentTextStyle": [
        "Current text style:  \"",
        [
          "style"
        ],
        "\"  Text height:  ",
        [
          "height"
        ],
        "  Annotative:  No  Justify:  ",
        [
          "justify"
        ]
      ],
      "textStylesHeader": "Text styles:",
      "textStyleEntry": [
        "Style name: ",
        [
          "name"
        ],
        "  Font typeface: Arial\n   Height: ",
        [
          "height"
        ],
        "  Width factor: ",
        [
          "width"
        ],
        "  Obliquing angle: 0\n   Generation: Normal"
      ],
      "currentTextStyleName": [
        "Current text style: \"",
        [
          "name"
        ],
        "\""
      ],
      "currentMTextStyle": [
        "Current text style:  \"",
        [
          "style"
        ],
        "\"  Text height:  ",
        [
          "height"
        ],
        "  Annotative:  No"
      ],
      "invalidStyleName": "Invalid style name",
      "lineSpacingRange": [
        "Please specify a line spacing value between ",
        [
          "min"
        ],
        " (",
        [
          "minFactor"
        ],
        "x) and ",
        [
          "max"
        ],
        " (",
        [
          "maxFactor"
        ],
        "x), inclusive."
      ],
      "invalidPointInput": "Invalid point input.",
      "invalidInputCapital": "Invalid Input.",
      "nonAssociativeDimension": "Non-associative dimension created.",
      "dimensionTextIs": [
        "Dimension text = ",
        [
          "text"
        ]
      ],
      "expectsSingleObject": "Expects a single object.",
      "expectsCornerObject": [
        "Expects a point or Window/Last/Crossing/BOX/Fence/WPolygon/CPolygon/",
        [
          "set",
          1,
          {
            "fillet": "Undo/Polyline/Radius",
            "filletRadius": "Radius]:",
            "chamfer": "Undo/Polyline/Distance",
            "other": "Distance"
          }
        ]
      ],
      "lastKeyword": "Last",
      "noObjectSelected": "No object selected.",
      "associativeDimensionRequired": "Linear, ordinate, or angular associative dimension required.",
      "selectedObjectNotDimension": "Selected object is not a dimension.",
      "negativeSpacing": "Invalid spacing value, spacing value cannot be negative."
    },
    "feedback": {
      "snap": {
        "endpoint": "Endpoint",
        "midpoint": "Midpoint",
        "center": "Center",
        "intersection": "Intersection",
        "apparentIntersection": "Apparent Intersection",
        "perpendicular": "Perpendicular",
        "tangent": "Tangent",
        "insertion": "Insertion",
        "extension": "Extension",
        "parallel": "Parallel",
        "quadrant": "Quadrant",
        "nearest": "Nearest"
      },
      "deferredTangent": "Deferred Tangent",
      "deferredPerpendicular": "Deferred Perpendicular",
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
        "Angle ",
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
        "Area  ",
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
        "Perim ",
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
        "Ttr": "Ttr (tan tan radius)"
      },
      "TRIM": {
        "cuTting": "cuTting edges",
        "Noextend": "No extend"
      },
      "EXTEND": {
        "Boundary": "Boundary edges",
        "Noextend": "No extend"
      },
      "POLYGON": {
        "Inscribed": "Inscribed in circle",
        "Circumscribed": "Circumscribed about circle"
      },
      "CIRCLED": {
        "Ttr": "Ttr (tan tan radius)"
      },
      "PLINE": {
        "Halfwidth": "Halfwidth",
        "Second pt": "Second pt"
      },
      "DIST": {
        "Multiple": "Multiple points",
        "Second pt": "Second pt"
      },
      "RECTANG": {
        "Pick": "Pick points"
      },
      "AREA": {
        "Add": "Add area",
        "Subtract": "Subtract area"
      },
      "TEXT": {
        "TL": "TL",
        "TC": "TC",
        "TR": "TR",
        "ML": "ML",
        "MC": "MC",
        "MR": "MR",
        "BL": "BL",
        "BC": "BC",
        "BR": "BR"
      },
      "ATTDEF": {
        "TL": "TL",
        "TC": "TC",
        "TR": "TR",
        "ML": "ML",
        "MC": "MC",
        "MR": "MR",
        "BL": "BL",
        "BC": "BC",
        "BR": "BR",
        "Lock position": "Lock position"
      },
      "ATTDISP": {
        "OFF": "OFF"
      },
      "SNAP": {
        "OFF": "OFF"
      },
      "FILL": {
        "OFF": "OFF"
      },
      "UNDO": {
        "OFF": "OFF"
      },
      "ARC": {
        "Center": "Center"
      },
      "ARCSCE": {
        "Center": "Center"
      },
      "ELLIPSE": {
        "Included angle": "Included angle"
      },
      "ELLIPSEC": {
        "Included angle": "Included angle"
      },
      "ELLIPSEARC": {
        "Included angle": "Included angle"
      },
      "PLAN": {
        "Current ucs": "Current ucs"
      },
      "SPLINE": {
        "Square root": "Square root",
        "start Tangency": "start Tangency",
        "end Tangency": "end Tangency"
      },
      "HATCH": {
        "Select objects": "Select objects"
      },
      "BREAK": {
        "First point": "First point"
      },
      "ARRAYRECT": {
        "Unit cell": "Unit cell"
      },
      "ARRAYPOLAR": {
        "Angle between": "Angle between",
        "Fill angle": "Fill angle",
        "ROTate items": "ROTate items"
      },
      "ARRAYPATH": {
        "Align items": "Align items",
        "Fill entire path": "Fill entire path"
      },
      "OFFSET": {
        "Through": "Through"
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
        "SOLID": "Solid fill",
        "ANSI31": "ANSI Iron, Brick, Stone masonry"
      }
    },
    "defaults": {
      "layer": [
        "Layer",
        [
          "n"
        ]
      ],
      "copyOf": [
        "Copy of ",
        [
          "name"
        ]
      ],
      "fileName": [
        "drawing-",
        [
          "date"
        ]
      ]
    }
  }
}
