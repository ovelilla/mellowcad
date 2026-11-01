// Generated from en.json by `npm run locales`. Do not edit.
import type { EngineCatalog } from "./types"

export const en: EngineCatalog = {
  "tag": "en",
  "interface": {
    "tool": {
      "select": "Select",
      "line": "Line",
      "polyline": "Polyline",
      "polyline3d": "3D Polyline",
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
      "splinedit": "Edit Spline",
      "pedit": "Edit Polyline",
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
      "purge": "Purge",
      "text": "Text",
      "mtext": "Multiline text",
      "textedit": "Edit text",
      "dimlinear": "Linear",
      "dimaligned": "Aligned",
      "dimhorizontal": "Horizontal",
      "dimvertical": "Vertical",
      "dimrotated": "Rotated",
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
      "chprop": "Change properties",
      "copyclip": "Copy",
      "cutclip": "Cut",
      "copybase": "Copy with base point",
      "paste": "Paste",
      "measure": "Measure",
      "measurearea": "Area",
      "id": "ID Point",
      "list": "List",
      "massprop": "Region/Mass Properties",
      "zoom": "Zoom",
      "pan": "Pan",
      "dashpan": "Pan by points",
      "dashdimstyle": "Dimension style (command line)",
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
      "setvar": "System variables",
      "undo": "Undo",
      "mredo": "Multiple redo",
      "osnap": "Object snap modes",
      "color": "Color",
      "linetype": "Linetype",
      "lweight": "Lineweight",
      "snap": "Snap mode",
      "region": "Region",
      "union": "Union",
      "subtract": "Subtract",
      "box": "Box",
      "wedge": "Wedge",
      "pyramid": "Pyramid",
      "cylinder": "Cylinder",
      "cone": "Cone",
      "sphere": "Sphere",
      "torus": "Torus",
      "intersect": "Intersect",
      "extrude": "Extrude",
      "revolve": "Revolve",
      "presspull": "Presspull"
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
      "SAVE": "Save the drawing to a file",
      "OPEN": "Open a drawing file",
      "PASTECLIP": "Paste the clipboard into the drawing",
      "DIMSTYLE": "Create and modify dimension styles",
      "STYLE": "Create and modify text styles",
      "INSERT": "Insert a block from the Blocks palette",
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
      "polyline3d": [
        [
          "count",
          2,
          {
            "one": "3D Polyline",
            "other": "3D Polylines"
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
            "one": "Block Reference",
            "other": "Block References"
          }
        ]
      ],
      "solid3d": [
        [
          "count",
          2,
          {
            "one": "3D Solid",
            "other": "3D Solids"
          }
        ]
      ],
      "region": [
        [
          "count",
          2,
          {
            "one": "Region",
            "other": "Regions"
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
        ],
        "linearDimension": "Rotated Dimension",
        "alignedDimension": "Aligned Dimension",
        "angularDimension": "Angular Dimension",
        "radiusDimension": "Radial Dimension",
        "diameterDimension": "Diametric Dimension"
      },
      "group": {
        "geometry": "Geometry",
        "solidHistory": "Solid History",
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
        "selection": "Selection",
        "linesArrows": "Lines & Arrows",
        "fit": "Fit",
        "primaryUnits": "Primary Units"
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
        "solidType": "Solid type",
        "baseRadius": "Base radius",
        "topRadius": "Top radius",
        "sides": "Sides",
        "elliptical": "Elliptical",
        "baseMajorRadius": "Base major radius",
        "baseMinorRadius": "Base minor radius",
        "topMajorRadius": "Top major radius",
        "topMinorRadius": "Top minor radius",
        "torusRadius": "Torus radius",
        "tubeRadius": "Tube radius",
        "currentVertex": "Current Vertex",
        "vertex": "Vertex",
        "startSegmentWidth": "Start segment width",
        "endSegmentWidth": "End segment width",
        "globalWidth": "Global width",
        "closed": "Closed",
        "contents": "Contents",
        "justify": "Justify",
        "height": "Height",
        "history": "History",
        "rotation": "Rotation",
        "lineSpaceFactor": "Line space factor",
        "lineSpaceDistance": "Line space distance",
        "lineSpaceStyle": "Line space style",
        "definedWidth": "Defined width",
        "textHeight": "Text height",
        "textAlignmentX": "Text alignment X",
        "textAlignmentY": "Text alignment Y",
        "textAlignmentZ": "Text alignment Z",
        "measurement": "Measurement",
        "textOverride": "Text override",
        "type": "Type",
        "vertexX": "Vertex X",
        "vertexY": "Vertex Y",
        "vertexZ": "Vertex Z",
        "fitSmooth": "Fit/Smooth",
        "firstX": "First X",
        "firstY": "First Y",
        "secondX": "Second X",
        "secondY": "Second Y",
        "pattern": "Pattern",
        "scale": "Scale",
        "boundaries": "Boundaries",
        "patternName": "Pattern name",
        "annotative": "Annotative",
        "originX": "Origin X",
        "originY": "Origin Y",
        "associative": "Associative",
        "islandDetectionStyle": "Island detection style",
        "cumulativeArea": "Cumulative Area",
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
        "width": "Width",
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
        "positionX": "Position X",
        "positionY": "Position Y",
        "positionZ": "Position Z",
        "scaleX": "Scale X",
        "scaleY": "Scale Y",
        "scaleZ": "Scale Z",
        "showHistory": "Show History",
        "baseX": "Base X",
        "baseY": "Base Y",
        "baseZ": "Base Z",
        "pathLength": "Path length",
        "columns": "Columns",
        "columnSpacing": "Column spacing",
        "rows": "Rows",
        "rowSpacing": "Row spacing",
        "rowElevationIncrement": "Row elevation increment",
        "levels": "Levels",
        "levelSpacing": "Level spacing",
        "includedAxisAngle": "Included axis angle",
        "direction": "Direction",
        "items": "Items",
        "angleBetweenItems": "Angle between items",
        "fillAngle": "Fill angle",
        "rotateItems": "Rotate items",
        "itemSpacing": "Item spacing",
        "alignItems": "Align items",
        "arrowSize": "Arrow size",
        "centerMarkSize": "Center mark size",
        "extLineExt": "Ext line ext",
        "extLineOffset": "Ext line offset",
        "textOffset": "Text offset",
        "textPositionX": "Text position X",
        "textPositionY": "Text position Y",
        "textRotation": "Text rotation",
        "dimScaleOverall": "Dim scale overall",
        "decimalSeparator": "Decimal separator",
        "suppressTrailingZeros": "Suppress trailing zeros",
        "precision": "Precision",
        "perimeter": "Perimeter"
      },
      "value": {
        "yes": "Yes",
        "no": "No",
        "none": "—",
        "fitNone": "None",
        "atLeast": "At least",
        "exactly": "Exactly",
        "fitPoints": "Fit",
        "controlVertices": "Control Vertices",
        "box": "Box",
        "wedge": "Wedge",
        "pyramid": "Pyramid",
        "inscribed": "Inscribed",
        "circumscribed": "Circumscribed",
        "cylinder": "Cylinder",
        "cone": "Cone",
        "sphere": "Sphere",
        "torus": "Torus",
        "chord": "Chord",
        "sqrtChord": "SqrtChord",
        "uniform": "Uniform",
        "custom": "Custom",
        "show": "Show",
        "hide": "Hide",
        "counterClockwise": "Counter-clockwise",
        "clockwise": "Clockwise",
        "divide": "Divide",
        "historyNone": "None",
        "measure": "Measure",
        "predefined": "Predefined",
        "outer": "Outer",
        "extrusion": "Extrusion",
        "revolve": "Revolve"
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
      "3DPOLY": [
        "3DPOLY",
        "3P"
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
      "SPLINEDIT": [
        "SPLINEDIT",
        "SPE"
      ],
      "PEDIT": [
        "PEDIT",
        "PE"
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
        "BH",
        "BHATCH"
      ],
      "-HATCH": [
        "-HATCH",
        "-H",
        "-BH",
        "-BHATCH"
      ],
      "BLOCK": [
        "BLOCK",
        "B",
        "ACADBLOCKDIALOG",
        "BMAKE",
        "BMOD"
      ],
      "-BLOCK": [
        "-BLOCK",
        "-B"
      ],
      "INSERT": [
        "INSERT",
        "I"
      ],
      "-INSERT": [
        "-INSERT",
        "-I"
      ],
      "ATTEDIT": [
        "ATTEDIT",
        "ATE",
        "DDATTE"
      ],
      "EATTEDIT": [
        "EATTEDIT"
      ],
      "ATTDEF": [
        "ATTDEF",
        "ATT",
        "DDATTDEF"
      ],
      "-ATTDEF": [
        "-ATTDEF",
        "-ATT"
      ],
      "ATTDISP": [
        "ATTDISP"
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
        "T",
        "MT"
      ],
      "-MTEXT": [
        "-MTEXT",
        "-T"
      ],
      "TEXTEDIT": [
        "TEXTEDIT",
        "DDEDIT",
        "ED",
        "TEDIT"
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
      "DIMHORIZONTAL": [
        "DIMHORIZONTAL"
      ],
      "DIMVERTICAL": [
        "DIMVERTICAL"
      ],
      "DIMROTATED": [
        "DIMROTATED"
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
      "CHPROP": [
        "CHPROP"
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
      "LIST": [
        "LIST",
        "LI",
        "LS"
      ],
      "MASSPROP": [
        "MASSPROP"
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
        "-PAN",
        "-P"
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
        "QSAVE"
      ],
      "SAVEAS": [
        "SAVEAS"
      ],
      "SAVE": [
        "SAVE",
        "SAVEURL"
      ],
      "OPEN": [
        "OPEN",
        "OPENURL"
      ],
      "PASTECLIP": [
        "PASTECLIP"
      ],
      "DIMSTYLE": [
        "DIMSTYLE",
        "D",
        "DIMSTY",
        "DST",
        "DDIM"
      ],
      "-DIMSTYLE": [
        "-DIMSTYLE"
      ],
      "STYLE": [
        "STYLE",
        "ST",
        "DDSTYLE"
      ],
      "BLOCKSPALETTE": [
        "BLOCKSPALETTE"
      ],
      "PURGE": [
        "PURGE",
        "PU"
      ],
      "-PURGE": [
        "-PURGE",
        "-PU"
      ],
      "LAYER": [
        "LAYER",
        "LA",
        "DDLMODES"
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
        "VP",
        "DDVPOINT"
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
        "UN",
        "DDUNITS"
      ],
      "LTSCALE": [
        "LTSCALE",
        "LTS"
      ],
      "AUPREC": [
        "AUPREC"
      ],
      "SETVAR": [
        "SETVAR",
        "SET"
      ],
      "CLEANSCREENON": [
        "CLEANSCREENON"
      ],
      "CLEANSCREENOFF": [
        "CLEANSCREENOFF"
      ],
      "COLOR": [
        "COLOR",
        "COL",
        "COLOUR"
      ],
      "-COLOR": [
        "-COLOR"
      ],
      "LINETYPE": [
        "LINETYPE",
        "LT",
        "LTYPE",
        "DDLTYPE"
      ],
      "-LINETYPE": [
        "-LINETYPE",
        "-LT",
        "-LTYPE"
      ],
      "LWEIGHT": [
        "LWEIGHT",
        "LW",
        "LINEWEIGHT"
      ],
      "-LWEIGHT": [
        "-LWEIGHT"
      ],
      "BOX": [
        "BOX"
      ],
      "WEDGE": [
        "WEDGE",
        "WE"
      ],
      "PYRAMID": [
        "PYRAMID",
        "PYR"
      ],
      "CYLINDER": [
        "CYLINDER",
        "CYL"
      ],
      "CONE": [
        "CONE"
      ],
      "SPHERE": [
        "SPHERE"
      ],
      "TORUS": [
        "TORUS",
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
        "SUBTRACT",
        "SU"
      ],
      "INTERSECT": [
        "INTERSECT",
        "IN"
      ],
      "EXTRUDE": [
        "EXTRUDE",
        "EXT"
      ],
      "REVOLVE": [
        "REVOLVE",
        "REV"
      ],
      "PRESSPULL": [
        "PRESSPULL"
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
      "SPLINEDIT": {
        "Fit data": "Fit",
        "Edit vertex": "Edit",
        "convert to Polyline": "Polyline",
        "Reverse": "REverse",
        "eXit": "EXit",
        "Elevate order": "Elevate",
        "Select point": "Select",
        "System default": "System"
      },
      "PEDIT": {
        "Edit vertex": "Edit",
        "Ltype gen": "Ltype",
        "OFF": "OFf",
        "Spline curve": "Spline"
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
      "MTEXT": {
        "Line spacing": "Linespacing",
        "At least": "Atleast"
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
      "CHPROP": {
        "BYLAYER": "BYLayer",
        "RED": "Red",
        "YELLOW": "Yellow",
        "GREEN": "Green",
        "CYAN": "Cyan",
        "BLUE": "Blue",
        "MAGENTA": "Magenta",
        "WHITE": "White",
        "BYBLOCK": "BYBlock"
      },
      "COLOR": {
        "BYLAYER": "BYLayer",
        "RED": "Red",
        "YELLOW": "Yellow",
        "GREEN": "Green",
        "CYAN": "Cyan",
        "BLUE": "Blue",
        "MAGENTA": "Magenta",
        "WHITE": "White",
        "BYBLOCK": "BYBlock"
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
        "Top": "Top",
        "Left": "Left",
        "Right": "Right"
      },
      "ucsNewUcs": {
        "ZAxis": "ZAxis"
      },
      "ucsOrthographic": {
        "Top": "Top",
        "Front": "Front",
        "BAck": "BAck",
        "Left": "Left",
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
      "plineNextPointOr": {
        "Line": "LIne"
      },
      "specifyFirstCornerPointOr": {
        "Width": "Width"
      },
      "specifyAxisEndpointOfEllipticalArcOr": {
        "Centre": "Centre"
      },
      "splineditOptionClosed": {
        "convert to Polyline": "Polyline"
      },
      "peditOption": {
        "eXit": "EXit"
      },
      "peditOption3d": {
        "Join": "Join",
        "eXit": "EXit"
      },
      "peditWalkOption": {
        "eXit": "eXit"
      },
      "enterFitDataOption": {
        "Add": "Add",
        "Open": "Open",
        "Move": "Move",
        "X": "X"
      },
      "enterVertexEditingOption": {
        "X": "X"
      },
      "specifyNewLocationOr": {
        "eXit": "EXit",
        "X": "X"
      },
      "enterNewWeightOr": {
        "eXit": "EXit",
        "X": "X"
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
      "blockExists": [
        "Block \"",
        [
          "name"
        ],
        "\" already exists. Redefine it?"
      ],
      "redefineIt": "Redefine it?",
      "blocksToList": "Enter block(s) to list",
      "purgeType": "Enter type of unused objects to purge",
      "purgeNames": "Enter name(s) to purge",
      "purgeVerify": "Verify each name to be purged?",
      "massPropWriteFile": "Write analysis to a file?",
      "purgeBlock": [
        "Purge block \"",
        [
          "name"
        ],
        "\"?"
      ],
      "insertionBasePoint": "Specify insertion base point",
      "insertionPoint": "Specify insertion point or",
      "specifyInsertionPoint": "Specify insertion point",
      "insertScale": "Specify scale factor for XYZ axes",
      "insertRotation": "Specify rotation angle",
      "insertXScale": "Enter X scale factor, specify opposite corner, or [Corner/XYZ]",
      "insertYScale": "Enter Y scale factor",
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
      "circleSecondAngleEndpoint": "Specify second angle endpoint",
      "dimensionArcLocation": "Specify dimension arc line location",
      "dimensionSpacing": "Enter value",
      "offsetDistance": "Offset distance",
      "basePoint": "Base point",
      "fromOffset": "<Offset>",
      "pointFilterOf": "of",
      "pointFilterNeed": [
        "(need ",
        [
          "axes"
        ],
        ")"
      ],
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
      "levels": "Levels",
      "levelSpacing": "Level spacing",
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
      "ucsSelectFace": "Select face of solid, surface, or mesh",
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
      "enterNewValueForOrNone": [
        "Enter new value for ",
        [
          "name"
        ],
        ", or . for none"
      ],
      "enterVariableName": "Enter variable name or",
      "enterVariablesToList": "Enter variable(s) to list",
      "pressEnterToContinue": "Press ENTER to continue",
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
      "propertyToChange": "Enter property to change",
      "newColor": "New color",
      "newLayerName": "Enter new layer name",
      "newLinetypeName": "Enter new linetype name",
      "newLineweight": "Enter new lineweight",
      "newThickness": "Specify new thickness",
      "viewPoint": "Specify a view point",
      "specifyViewPointOr": "Specify a view point or",
      "attributeVisibilitySetting": "Enter attribute visibility setting",
      "selectAnnotationObjectOr": "Select an annotation object or",
      "selectBlockReference": "Select block reference",
      "selectABlock": "Select a block",
      "textEditModeOption": "Enter a text edit mode option",
      "viewAngleInPlane": "Enter angle in XY plane from X axis",
      "viewAngleFromPlane": "Enter angle from XY plane",
      "boxFirstCornerOr": "Specify first corner or",
      "boxOtherCornerOr": "Specify other corner or",
      "boxCenter": "Specify center",
      "boxCornerOr": "Specify corner or",
      "boxLength": "Specify length",
      "boxWidth": "Specify width",
      "boxHeightOr": "Specify height or",
      "pyramidCenterOr": "Specify center point of base or",
      "specifyBaseRadiusOr": "Specify base radius or",
      "pyramidBaseRadiusOr": "Specify base radius or",
      "solidHeightTopOr": "Specify height or",
      "solidHeightOr": "Specify height or",
      "specifyAxisEndpoint": "Specify axis endpoint",
      "specifyTopRadius": "Specify top radius",
      "sphereCenterOr": "Specify center point or",
      "specifyRadiusOr": "Specify radius or",
      "torusDiameter": "Specify diameter of torus",
      "tubeRadiusOr": "Specify tube radius or",
      "tubeDiameter": "Specify tube diameter",
      "roundBaseCenterOr": "Specify center point of base or",
      "specifyDiameter": "Specify diameter",
      "specifyThirdPoint": "Specify third point",
      "firstEndOfDiameter": "Specify first end point of diameter",
      "secondEndOfDiameter": "Specify second end point of diameter",
      "firstTangentPoint": "Specify point on object for first tangent",
      "secondTangentPoint": "Specify point on object for second tangent",
      "firstAxisEndpointOr": "Specify endpoint of first axis or",
      "otherFirstAxisEndpoint": "Specify other endpoint of first axis",
      "secondAxisEndpoint": "Specify endpoint of second axis",
      "specifyCenterPoint": "Specify center point",
      "distanceToFirstAxis": "Specify distance to first axis",
      "specifyFirstPoint": "Specify first point",
      "specifyNextPointOr": "Specify next point or",
      "specifyNextPointOrClose": "Specify next point or",
      "plineNextPointOr": "Specify next point or",
      "specifyNextPointOrTotal": "Specify next point or",
      "lengthOfLine": "Length of line",
      "specifyStartPoint": "Specify start point",
      "specifyStartPointOfPolyline": "Specify start point of polyline",
      "specifyEndpointOfArcOr": "Specify endpoint of arc (hold Ctrl to switch direction) or",
      "specifyCenterPointForCircleOr": "Specify center point for circle or",
      "specifyRadiusOfCircleOr": "Specify radius of circle or",
      "specifyRadiusOfCircle": "Specify radius of circle",
      "specifyRadiusOfCircleTtr": "Specify radius of circle",
      "enterNumberOfSides": "Enter number of sides",
      "specifyCenterOfPolygonOr": "Specify center of polygon or",
      "enterAnOption": "Enter an option",
      "textJustifyOption": "Enter an option",
      "ucsiconOption": "Enter an option",
      "navvcubeOption": "Enter an option",
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
      "areaFirstCornerPointOr": "Specify first corner point or",
      "addModeNextPointOr": " (ADD mode)Specify next point or",
      "subtractModeNextPointOr": " (SUBTRACT mode)Specify next point or",
      "addModeNextPointOrTotal": " (ADD mode)Specify next point or",
      "subtractModeNextPointOrTotal": " (SUBTRACT mode)Specify next point or",
      "addModeSelectObjects": "(ADD mode) Select objects",
      "subtractModeSelectObjects": "(SUBTRACT mode) Select objects",
      "specifyOtherCornerPointOr": "Specify other corner point or",
      "specifyStartPointOfArcOr": "Specify start point of arc or",
      "specifySecondPointOfArcOr": "Specify second point of arc or",
      "specifyEndPointOfArc": "Specify end point of arc",
      "specifyCenterPointOfArc": "Specify center point of arc",
      "plineCenterPointOfArc": "Specify center point of arc",
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
      "copyBasePointOr": "Specify base point or",
      "copyDisplacement": "Displacement",
      "specifyDisplacement": "Specify displacement",
      "specifySecondPointOr": "Specify second point or",
      "useFirstPointAsDisplacement": "use first point as displacement",
      "copyUseFirstPoint": "use first point as displacement",
      "useXScaleFactor": "use X scale factor",
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
      "selectOpenCurvesToJoinToSource": "Select any open curves to join to source",
      "selectEllipticalArcsToJoinToSourceOr": "Select elliptical arcs to join to source or",
      "selectEllipticalArcsToJoinToSource": "Select elliptical arcs to join to source",
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
      "selectEdgesOr": "Select objects or",
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
      "selectGripToEditPathArrayOr": "Select grip to edit array or",
      "enterNumberOfColumns": "Enter the number of columns",
      "enterNumberOfRows": "Enter the number of rows",
      "specifyDistanceBetweenColumnsOfCell": "Specify the distance between columns or",
      "unitCellFirstCorner": "Specify first corner point of unit cell",
      "unitCellOppositeCorner": "Specify opposite corner",
      "specifyDistanceBetweenColumns": "Specify the distance between columns",
      "specifyDistanceBetweenRows": "Specify the distance between rows",
      "specifyDistanceBetweenRowsOfCell": "Specify the distance between rows",
      "specifyIncrementingElevationBetweenRows": "Specify the incrementing elevation between rows",
      "enterNumberOfLevels": "Enter the number of levels",
      "specifyDistanceBetweenLevelsOr": "Specify the distance between levels or",
      "enterTotalDistanceBetweenLevels": "Enter total distance between start and end levels",
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
      "dimStyleOption": "Enter a dimension style option",
      "dimStyleSaveName": "Enter name for new dimension style or",
      "dimStyleRedefine": "That name is already in use, redefine it?",
      "dimStyleName": "Enter a dimension style name, [?] or",
      "dimStyleSelectDimension": "select dimension",
      "dimStylesToList": "Enter dimension style(s) to list",
      "selectDimension": "Select dimension",
      "enterValueOr": "Enter value or",
      "selectSpline": "Select spline",
      "selectSplineFitPolyline": "Select spline-fit polyline",
      "splineditOption": "Enter an option",
      "splineditOptionClosed": "Enter an option",
      "enterFitDataOption": "Enter a fit data option",
      "specifyExistingFitPoint": "Specify existing fit point on spline",
      "specifyNewPointOr": "Specify new point or",
      "specifyNewFitPointToAdd": "Specify new fit point to add",
      "specifyStartTangentOr": "Specify start tangent or",
      "specifyEndTangentOr": "Specify end tangent or",
      "enterVertexEditingOption": "Enter a vertex editing option",
      "specifyPointOnSpline": "Specify a point on the spline",
      "specifyControlVertexToDelete": "Specify control vertex to delete",
      "enterNewOrder": "Enter new order",
      "specifyNewLocationOr": "Specify new location or",
      "enterNewWeightOr": [
        "Enter new weight (current = ",
        [
          "weight"
        ],
        ") or"
      ],
      "specifyPrecision": "Specify a precision",
      "selectPolylineOr": "Select polyline or",
      "turnIntoPolyline": "Do you want to turn it into one?",
      "convertToPolylines": "Convert Lines, Arcs and Splines to polylines [Yes/No]?",
      "specifyPrecisionForSplineConversion": "Specify a precision for spline conversion",
      "peditOption": "Enter an option",
      "peditOption3d": "Enter an option",
      "enterFuzzDistanceOr": "Enter fuzz distance or",
      "enterJoinType": "Enter join type",
      "specifyNewWidthForAllSegments": "Specify new width for all segments",
      "linetypeGenerationOption": "Enter polyline linetype generation option",
      "peditVertexOption": "Enter a vertex editing option",
      "peditWalkOption": "Enter an option",
      "specifyLocationForNewVertex": "Specify location for new vertex",
      "specifyNewLocationForMarkedVertex": "Specify new location for marked vertex",
      "startingWidthForNextSegment": "Specify starting width for next segment",
      "endingWidthForNextSegment": "Specify ending width for next segment",
      "directionOfVertexTangent": "Specify direction of vertex tangent",
      "peditNextShort": "N",
      "joinTypeExtend": "Extend",
      "joinTypeAdd": "Add",
      "joinTypeBoth": "Both",
      "exitLower": "exit",
      "nextShort": "N",
      "previousShort": "P",
      "extrudeSelectOr": "Select objects to extrude or",
      "closedProfilesMode": "Closed profiles creation mode",
      "closedProfilesSolid": "Solid",
      "extrudeHeightOr": "Specify height of extrusion or",
      "extrudeHeightDefaultOr": "Specify height of extrusion or",
      "extrudeTaperOr": "Specify angle of taper for extrusion or",
      "enterExpression": "Enter expression",
      "directionStart": "Specify start point of direction",
      "directionEnd": "Specify end point of direction",
      "eraseDefiningObjects": "Erase defining objects?",
      "revolveSelectOr": "Select objects to revolve or",
      "revolveAxisStartOr": "Specify axis start point or define axis by",
      "revolveAxisEnd": "Specify axis endpoint",
      "revolveSelectAxis": "Select an object",
      "revolveAngleOr": "Specify angle of revolution or",
      "revolveStartAngle": "Specify start angle",
      "presspullSelect": "Select object or bounded area",
      "presspullHeightOr": "Specify extrusion height or"
    },
    "promptForms": {
      "convertToPolylines": "open",
      "purgeBlock": "open",
      "selectGripToEditArrayOr": "tight",
      "selectGripToEditPathArrayOr": "tight",
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
      "unitCellFirstCorner": "spaced"
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
      "readOnlyListed": "(read only)",
      "unknownVariableName": "Unknown variable name.  Type SETVAR ? for a list of variables.",
      "cannotSetVariable": [
        "Cannot set ",
        [
          "name"
        ],
        " to that value."
      ],
      "requiresZeroOrOne": "Requires 0 or 1 only.",
      "requiresZeroOrOneOrKeyword": "Requires 0 or 1 only, or option keyword.",
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
      "cannotExtendClosedPolyline": "Cannot extend a closed polyline.",
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
      "objectNotABlock": " That object is not a block.",
      "blockHasNoEditableAttributes": " That block has no editable attributes.",
      "selectedEntityNotABlock": "The selected entity is not a block.",
      "selectedBlockHasNoEditableAttributes": "The selected block has no editable attributes.",
      "matchpropSettings": "Current active settings:  Color Layer Ltype Lineweight Thickness Dim Text Hatch",
      "matchpropLockedDestination": "Destination object on a locked layer. Cannot be updated.",
      "varies": "varies",
      "layerNotFound": [
        "Cannot find layer \"",
        [
          "name"
        ],
        "\"."
      ],
      "invalidLayerName": "Invalid layer name.",
      "linetypeNotLoaded": [
        "Linetype \"",
        [
          "name"
        ],
        "\" not found.  Use LINETYPE command to load it."
      ],
      "invalidLinetypeName": "Invalid linetype name.",
      "cannotChangeThickness": [
        "Cannot change thickness for ",
        [
          "type",
          1,
          {
            "ellipse": "ELLIPSE",
            "spline": "SPLINE",
            "polyline3d": "3D Polylines",
            "mtext": "MTEXT",
            "dimension": "DIMENSION",
            "hatch": "HATCH",
            "other": "BLOCKs"
          }
        ],
        "."
      ],
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
      "gridMode": [
        " <Grid ",
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
      "selectionCyclingMode": [
        " <Selection Cycling ",
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
      "everythingDeselected": "Everything has been deselected",
      "selectingObjectsDone": "Selecting objects...done.",
      "fromNeedsPoint": "FROM needs a point prompt.",
      "fromBase": "FROM: pick the base point.",
      "fromOffset": "FROM: offset from the base point.",
      "angleOverride": [
        "Angle Override: ",
        [
          "angle"
        ]
      ],
      "zNotAllowed": "Z coordinates not allowed here.",
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
      "purgeSettings": "Nested items = Off    Orphaned data = Off",
      "deletingBlock": [
        "Deleting block \"",
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
              0,
              " block deleted."
            ],
            "other": [
              0,
              " blocks deleted."
            ]
          }
        ]
      ],
      "noUnreferencedBlocks": "No unreferenced blocks found.",
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
      "areaAlreadySpecified": "This area has already been specified.",
      "unableToHatchBoundary": "Unable to hatch the boundary.",
      "pointOnObject": "Point is directly on an object.",
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
      "massPropRegionsIgnored": [
        [
          "count",
          2,
          {
            "=1": "1 region ignored.",
            "other": [
              0,
              " regions ignored."
            ]
          }
        ]
      ],
      "massPropNoneSelected": "No solids or regions selected.",
      "massPropNothingSelected": "Nothing selected.",
      "massPropUnableToOpen": [
        "Unable to open mass and area properties file ",
        [
          "name"
        ],
        "."
      ],
      "massPropRegions": [
        "\n ----------------   REGIONS   ---------------- \n\nArea:                    ",
        [
          "area"
        ],
        " \nPerimeter:               ",
        [
          "perimeter"
        ],
        " \nBounding box:         X: ",
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
        " \nCentroid:             X: ",
        [
          "x"
        ],
        " \n                      Y: ",
        [
          "y"
        ],
        " \nMoments of inertia:   X: ",
        [
          "momentX"
        ],
        "  \n                      Y: ",
        [
          "momentY"
        ],
        "  \nProduct of inertia:  XY: ",
        [
          "productXY"
        ],
        "  \nRadii of gyration:    X: ",
        [
          "radiusX"
        ],
        " \n                      Y: ",
        [
          "radiusY"
        ],
        " \nPrincipal moments and X-Y directions about centroid:\n                      I: ",
        [
          "i"
        ],
        " along [",
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
        " along [",
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
        "\n ----------------   REGIONS   ---------------- \n\nArea:                    ",
        [
          "area"
        ],
        " \nPerimeter:               ",
        [
          "perimeter"
        ],
        " \nBounding box:         X: ",
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
        " \nCentroid:             X: ",
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
        "\n ----------------   SOLIDS    ---------------- \n\nMass:                    ",
        [
          "mass"
        ],
        " \nVolume:                  ",
        [
          "volume"
        ],
        " \nBounding box:         X: ",
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
        " \nCentroid:             X: ",
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
        " \nMoments of inertia:   X: ",
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
        "  \nProducts of inertia: XY: ",
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
        "  \nRadii of gyration:    X: ",
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
        " \nPrincipal moments and X-Y-Z directions about centroid:\n                      I: ",
        [
          "i"
        ],
        " along [",
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
        " along [",
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
        " along [",
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
      "noneFoundToConvert": "None found.",
      "onlySplineFittedPolylines": "Only spline fitted polylines can be converted to splines.",
      "unableToConvertSelectedObject": "Unable to convert the selected object.",
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
      "planUcsNotFound": [
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
      "pointsAreCoincident": "Points are coincident",
      "noSolidSurfaceOrMesh": "No 3D solid, surface or mesh detected.",
      "ucsNoCoordinateSystem": "This object does not define a coordinate system",
      "polyline3dNoCoordinateSystem": "3D Polyline object does not define a coordinate system",
      "zAxisNotSupported": "Z axis option not supported for selected object.",
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
      "menuStep": [
        [
          "command"
        ],
        " GROUP"
      ],
      "emptyMenuStep": [
        "GROUP ",
        [
          "command"
        ]
      ],
      "shortcutMenuEntry": [
        [
          "entry",
          1,
          {
            "erase": "Erase",
            "move": "Move",
            "copySelection": "Copy Selection",
            "scale": "Scale",
            "rotate": "Rotate",
            "deselectAll": "Deselect All",
            "properties": "Properties",
            "pan": "Pan",
            "cut": "Cut",
            "copy": "Copy",
            "copyBase": "Copy with Base Point",
            "paste": "Paste",
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
      "menuItemStep": "GROUP menu item",
      "intelliZoomStep": "INTELLIZOOM",
      "intelliPanStep": "INTELLIPAN",
      "viewCubeStep": "'.VIEWCUBEACTION",
      "layerManagerStep": "'.-LAYER",
      "changePropertiesStep": "CHPROP",
      "modifyPropertyStep": "Modify Property",
      "gripEditStep": "Grip Edit",
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
        "\" not found in acad.lin.\nYou can use the \"Load\" option to load it from another file."
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
      "invalidNewBlockName": "Invalid block name.",
      "blockReferencesItself": [
        "Block \"",
        [
          "name"
        ],
        "\" references itself"
      ],
      "blockRedefined": [
        "Block \"",
        [
          "name"
        ],
        "\" redefined"
      ],
      "zBaseNotZero": "Beware, Z insertion base is not zero.",
      "definedBlocks": "Defined blocks.",
      "definedBlock": [
        "  \"",
        [
          "name"
        ],
        "\""
      ],
      "blockCounts": [
        "User     External     Dependent   Unnamed\nBlocks   References   Blocks      Blocks\n",
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
        "User     Unnamed\nBlocks   Blocks\n",
        [
          "user"
        ],
        "    ",
        [
          "unnamed"
        ]
      ],
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
      "polylineWidthIgnored": "Polyline's width ignored in area calculation.",
      "allSegmentsUndone": "All segments already undone.",
      "polyline3dNotLevel": "3D Polyline vertices had differing Z coordinates.",
      "all3dSegmentsUndone": "All segments already undone.",
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
      "chamferNot3dPolyline": "  3D Polyline objects may not be chamfered.",
      "filletNot3dPolyline": "  3D Polyline objects may not be filleted.",
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
      "styleNameInUse": [
        "A ",
        [
          "table",
          1,
          {
            "dimension": "dimension style",
            "other": "text style"
          }
        ],
        " named \"",
        [
          "name"
        ],
        "\" already exists."
      ],
      "currentDimStyle": [
        "Current dimension style: ",
        [
          "name"
        ],
        "   Annotative: No"
      ],
      "unknownDimStyle": "Unknown dimension style.",
      "namedDimStyles": "Named dimension styles:",
      "noMatchingDimStyles": "  No matching dimension styles found.",
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
      "noValidCurveFillet": [
        "No valid fillet with radius ",
        [
          "radius"
        ]
      ],
      "entitiesNonCoplanar": "The entities are non-coplanar.",
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
      "segmentsJoinedInto3dPolylines": [
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
        " joined into ",
        [
          "polylines",
          2,
          {
            "one": [
              0,
              " 3D polyline"
            ],
            "other": [
              0,
              " 3D polylines"
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
      "ellipticalArcsJoined": [
        [
          "count"
        ],
        " elliptical arcs joined into 1 arc",
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
      "objectsJoinedIntoSplines": [
        [
          "count"
        ],
        " objects joined into ",
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
      "objectsConvertedToSplines": [
        [
          "count"
        ],
        " objects converted to ",
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
      "objectsJoinedToSource": [
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
        " joined to source",
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
      "ellipticalArcsJoinedToSource": [
        [
          "count",
          2,
          {
            "one": [
              0,
              " elliptical arc"
            ],
            "other": [
              0,
              " elliptical arcs"
            ]
          }
        ],
        " joined to source",
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
      "ellipseClosed": "Ellipse successfully closed.",
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
      "switchingToWcs": "*** Switching to the WCS ***",
      "returningToUcs": "*** Returning to the UCS ***",
      "invalidInputTryAgain": "Invalid input. Try again.",
      "regeneratingModel": "Regenerating model.",
      "regenQueued": "Regen queued.",
      "requiresRegen": "** Requires a regen, cannot be transparent.",
      "panExit": "Press ESC or ENTER to exit, or right-click to display shortcut menu.",
      "orbitExit": "Press ESC or ENTER to exit, or right-click to display shortcut-menu.",
      "requiresTwoPointsOrDisplacement": "Requires two points, or a displacement followed by ENTER.",
      "currentOsnapModes": [
        "Current osnap modes: ",
        [
          "modes"
        ]
      ],
      "osnapModeName": [
        [
          "mode",
          1,
          {
            "endpoint": "End",
            "midpoint": "Mid",
            "center": "Cen",
            "quadrant": "Quad",
            "intersection": "Int",
            "insertion": "Ins",
            "perpendicular": "Perp",
            "tangent": "Tan",
            "nearest": "Near",
            "apparentIntersection": "App Int",
            "extension": "Ext",
            "other": "Par"
          }
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
      "x2dCornerPointOrKeyword": "X2D corner point, or option keyword.",
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
      "invalidLineweightNumber": "Invalid lweight number.",
      "lineweightNone": "None",
      "lineweightByLayer": "BYLAYER",
      "lineweightListByLayer": "ByLayer",
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
      "textEditExpectsPoint": [
        "Expects a point or Last/",
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
            "subobjects": "Window/Crossing/BOX/Fence/WPolygon/CPolygon/Add/Remove/Multiple/Previous/Undo/AUto/SIngle/SUbobject/Object",
            "oneObject": "Window/Last/Crossing/BOX/ALL/Fence/WPolygon/CPolygon",
            "singleSet": "Window/Last/Crossing/BOX/ALL/Fence/WPolygon/CPolygon/Group",
            "pathCurve": "Window/Last/Crossing/BOX/ALL/Fence/WPolygon/CPolygon/Group/Previous/AUto",
            "crossingObjects": "Window/Last/Crossing/BOX/ALL/Fence/WPolygon/CPolygon/Add/Remove/Multiple/Previous/Undo/AUto/SIngle",
            "wholeObjects": "Window/Last/Crossing/BOX/ALL/Fence/WPolygon/CPolygon/Group/Add/Remove/Multiple/Previous/Undo/AUto/SIngle",
            "faceSet": "Crossing/Fence/CPolygon",
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
      "textJustifyName": [
        [
          "justify",
          1,
          {
            "center": "Center",
            "right": "Right",
            "middle": "Middle",
            "tl": "TL",
            "tc": "TC",
            "tr": "TR",
            "ml": "ML",
            "mc": "MC",
            "mr": "MR",
            "bl": "BL",
            "bc": "BC",
            "br": "BR",
            "other": "Left"
          }
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
      "notLineArcOrCircleToDimension": "Object selected is not a line, arc or circle.",
      "associativeDimensionRequired": "Linear, ordinate, or angular associative dimension required.",
      "selectedObjectNotDimension": "Selected object is not a dimension.",
      "notCircleOrArc": "Object selected is not a circle or arc.",
      "notLineArcOrCircle": "Object selected is not a line, arc or circle.",
      "notALine": "Object selected is not a line.",
      "dimLinesParallel": "Lines are parallel.",
      "negativeSpacing": "Invalid spacing value, spacing value cannot be negative.",
      "objectNotSpline": "Object selected is not a spline.",
      "splineReversed": "Spline has been reversed.",
      "splineMadeRational": "Spline is not rational. Will make it so.",
      "cannotDeleteBeyond": "Cannot delete beyond this.",
      "objectNotPolyline": "Object selected is not a polyline",
      "expectsPolylineOr": "Expects a point or Window/Last/Crossing/BOX/ALL/Fence/WPolygon/CPolygon/Multiple]:",
      "cannotJoinClosedPolyline": "Can't join to a closed polyline",
      "segmentsAddedToPolyline": [
        [
          "count"
        ],
        " segments added to polyline"
      ],
      "segmentsAddedToPolylines": [
        [
          "count"
        ],
        " segments added to ",
        [
          "polylines"
        ],
        " polylines"
      ],
      "joinTypeIs": [
        "Join Type = ",
        [
          "type",
          1,
          {
            "extend": "Extend",
            "add": "Add segment",
            "other": "Both (Extend or Add)"
          }
        ]
      ],
      "notAFitPoint": "Not a fit point.",
      "notAControlVertex": "Not a control vertex.",
      "listObjectName": [
        [
          "name",
          1,
          {
            "line": "LINE",
            "circle": "CIRCLE",
            "arc": "ARC",
            "ellipse": "ELLIPSE",
            "spline": "SPLINE",
            "lwpolyline": "LWPOLYLINE",
            "polyline": "POLYLINE",
            "vertex": "VERTEX",
            "endSequence": "END SEQUENCE",
            "text": "TEXT",
            "mtext": "MTEXT",
            "attdef": "ATTRIBUTE DEFINITION",
            "attribute": "ATTRIBUTE",
            "dimension": "DIMENSION",
            "hatch": "HATCH",
            "insert": "BLOCK REFERENCE",
            "region": "REGION",
            "solid3d": "3DSOLID",
            "other": "ARRAY"
          }
        ]
      ],
      "listObject": [
        "                  ",
        [
          "name"
        ],
        "  Layer: \"",
        [
          "layer"
        ],
        "\""
      ],
      "listSpace": "                            Space: Model space",
      "listColor": [
        "                   Color: ",
        [
          "color"
        ],
        "    Linetype: \"",
        [
          "linetype"
        ],
        "\""
      ],
      "listLineweight": [
        "                   LineWeight: ",
        [
          "lineweight"
        ],
        " mm"
      ],
      "listThickness": [
        "                   Thickness = ",
        [
          "thickness"
        ]
      ],
      "listExtrusion": [
        "Extrusion direction relative to UCS:\n                   X=",
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
        "              from point, X=",
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
        "                to point, X=",
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
            "yes": "In Current UCS, ",
            "other": ""
          }
        ],
        "Length =",
        [
          "length"
        ],
        ",  Angle in XY Plane = ",
        [
          "angle"
        ]
      ],
      "listLine3d": [
        "                  3D Length  =",
        [
          "length"
        ],
        ",  Angle from XY Plane = ",
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
      "listCenter": [
        "            center point, X=",
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
        "            radius ",
        [
          "radius"
        ]
      ],
      "listCircumference": [
        "     circumference ",
        [
          "length"
        ]
      ],
      "listArea": [
        "              area ",
        [
          "area"
        ]
      ],
      "listStartAngle": [
        "             start angle ",
        [
          "angle"
        ]
      ],
      "listEndAngle": [
        "               end angle ",
        [
          "angle"
        ]
      ],
      "listLength": [
        "            length ",
        [
          "length"
        ]
      ],
      "listTotalAngle": [
        "             total angle ",
        [
          "angle"
        ]
      ],
      "listCurveArea": [
        "                             Area: ",
        [
          "area"
        ]
      ],
      "listCurveCircumference": [
        "                    Circumference: ",
        [
          "length"
        ]
      ],
      "listCurveLength": [
        "                           Length: ",
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
        "                       Major Axis: X = ",
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
        "                       Minor Axis: X = ",
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
        "                      Start Point: X = ",
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
        "                        End Point: X = ",
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
        "                      Start Angle: ",
        [
          "angle"
        ]
      ],
      "listEllipseEndAngle": [
        "                        End Angle: ",
        [
          "angle"
        ]
      ],
      "listEllipseRatio": [
        "                     Radius Ratio: ",
        [
          "ratio"
        ]
      ],
      "listSplineOrder": [
        "                            Order: ",
        [
          "order"
        ]
      ],
      "listSplineProperties": [
        "                       Properties: ",
        [
          "planar",
          1,
          {
            "yes": "Planar,",
            "other": "Non-Planar,"
          }
        ],
        " ",
        [
          "rational",
          1,
          {
            "yes": "Rational,",
            "other": "Non-Rational,"
          }
        ],
        " ",
        [
          "periodic",
          1,
          {
            "yes": "Periodic",
            "other": "Non-Periodic"
          }
        ]
      ],
      "listSplineRange": [
        "                 Parametric Range: Start",
        [
          "start"
        ],
        "\n                                     End",
        [
          "end"
        ]
      ],
      "listSplineControlCount": [
        "         Number of control points: ",
        [
          "count"
        ]
      ],
      "listSplineControlPoints": [
        "                   Control Points: X = ",
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
        "                                   Weight",
        [
          "weight"
        ]
      ],
      "listSplineFitCount": [
        "             Number of fit points: ",
        [
          "count"
        ]
      ],
      "listSplineFitPoints": "                        User Data: Fit Points",
      "listSplineTolerance": [
        "              Fit point tolerance: ",
        [
          "tolerance"
        ]
      ],
      "listSplineStartTangent": "                                   Start Tangent",
      "listSplineEndTangent": "                                   End Tangent",
      "listLwState": [
        [
          "closed",
          1,
          {
            "yes": "            Closed",
            "other": "              Open"
          }
        ]
      ],
      "listLwThickness": [
        "         Thickness ",
        [
          "thickness"
        ]
      ],
      "listLwConstantWidth": [
        "    Constant width ",
        [
          "width"
        ]
      ],
      "listLwArea": [
        "              area   ",
        [
          "area"
        ]
      ],
      "listLwLength": [
        "            length   ",
        [
          "length"
        ]
      ],
      "listLwPerimeter": [
        "         perimeter   ",
        [
          "length"
        ]
      ],
      "listLwPoint": [
        "          at point  X=",
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
        "    starting width ",
        [
          "width"
        ]
      ],
      "listEndingWidth": [
        "      ending width ",
        [
          "width"
        ]
      ],
      "listBulge": [
        "             bulge ",
        [
          "bulge"
        ]
      ],
      "listLwCenter": [
        "            center  X=",
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
        "            center X=",
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
        "       start angle ",
        [
          "angle"
        ]
      ],
      "listPolylineEndAngle": [
        "         end angle ",
        [
          "angle"
        ]
      ],
      "listPolylineState": [
        [
          "state",
          1,
          {
            "open": "              Open",
            "closed": "            Closed",
            "openSpline": "              Open spline",
            "closedSpline": "            Closed spline",
            "openSpace": "              Open space",
            "closedSpace": "            Closed space",
            "openSplineSpace": "              Open spline space",
            "other": "            Closed spline space"
          }
        ]
      ],
      "listPolylinePerimeter": [
        "         perimeter ",
        [
          "length"
        ]
      ],
      "listVertexPoint": [
        "                at point, X=",
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
        "                at point, X=",
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
      "listVertexSpace": "             Space",
      "listVertexCurveFit": "                   (Inserted by curve fitting)",
      "listVertexSplineFit": "                   (Inserted by spline fitting)",
      "listVertexControl": "                   (Spline control point)",
      "listTextStyle": [
        "             Style = \"",
        [
          "style"
        ],
        "\""
      ],
      "listTextAnnotative": "        Annotative: No",
      "listTypeface": [
        "             Typeface = ",
        [
          "font"
        ]
      ],
      "listTextPoint": [
        "  ",
        [
          "point"
        ],
        " point, X=",
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
            "start": "start",
            "center": "center",
            "end": "end",
            "mid": "mid",
            "topLeft": "top/left",
            "topCenter": "top/center",
            "topRight": "top/right",
            "midLeft": "mid/left",
            "midRight": "mid/right",
            "bottomLeft": "bottom/left",
            "bottomCenter": "bottom/center",
            "other": "bottom/right"
          }
        ]
      ],
      "listTextHeight": [
        "            height ",
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
        "          rotation angle ",
        [
          "angle"
        ]
      ],
      "listTextWidth": [
        "             width scale factor ",
        [
          "factor"
        ]
      ],
      "listTextOblique": [
        "         obliquing angle ",
        [
          "angle"
        ]
      ],
      "listTextGeneration": "        generation normal",
      "listAttributeDefault": [
        "           default ",
        [
          "value"
        ]
      ],
      "listAttributePrompt": [
        "            prompt ",
        [
          "prompt"
        ]
      ],
      "listAttributeTag": [
        "               tag ",
        [
          "tag"
        ]
      ],
      "listAttributeValue": [
        "             value ",
        [
          "value"
        ]
      ],
      "listAttributeFlags": [
        "             flags ",
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
                  "yes": "constant  ",
                  "other": ""
                }
              ],
              [
                "verify",
                1,
                {
                  "yes": "verify  ",
                  "other": ""
                }
              ],
              [
                "preset",
                1,
                {
                  "yes": "preset",
                  "other": ""
                }
              ]
            ]
          }
        ]
      ],
      "listMtextLocation": [
        "Location:        X=",
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
        "Width:           ",
        [
          "width"
        ]
      ],
      "listMtextNormal": [
        "Normal:          X=",
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
        "Rotation:        ",
        [
          "angle"
        ]
      ],
      "listMtextHeight": [
        "Text height:     ",
        [
          "height"
        ]
      ],
      "listMtextSpacing": [
        "Line spacing:    ",
        [
          "style",
          1,
          {
            "exactly": "Exactly",
            "other": "Multiple"
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
        "Attachment:      ",
        [
          "attachment",
          1,
          {
            "tl": "TopLeft",
            "tc": "TopCenter",
            "tr": "TopRight",
            "ml": "MiddleLeft",
            "mc": "MiddleCenter",
            "mr": "MiddleRight",
            "bl": "BottomLeft",
            "bc": "BottomCenter",
            "other": "BottomRight"
          }
        ]
      ],
      "listMtextFlow": "Flow direction:  ByStyle",
      "listMtextContents": [
        "Contents:        ",
        [
          "contents"
        ]
      ],
      "listDimensionAssociative": "associative: no",
      "listDimensionType": [
        "type: ",
        [
          "type",
          1,
          {
            "horizontal": "horizontal",
            "vertical": "vertical",
            "rotated": "rotated",
            "aligned": "aligned",
            "arc": "arc",
            "radial": "radial",
            "diameter": "diameter",
            "other": "<linear, not parallel to UCS>"
          }
        ]
      ],
      "listDimensionRotation": [
        " rotation: ",
        [
          "angle"
        ]
      ],
      "listDimensionFirstExtension": [
        "1st extension  defining point: X=",
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
        "2nd extension  defining point: X=",
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
        "dimension line defining point: X=",
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
        "1st extension defining point: X=",
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
        "2nd extension defining point: X=",
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
        "arc center    defining point: X=",
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
        "dimension arc defining point: X=",
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
        "center defining point: X=",
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
        "defining point:        X=",
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
        "       defining point: X=",
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
        "text angle: ",
        [
          "angle"
        ]
      ],
      "listDimensionTextPosition": [
        [
          "user",
          1,
          {
            "yes": "user specified",
            "other": "default"
          }
        ],
        " text position: X=",
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
      "listDimensionDefaultText": "default text",
      "listDimensionTextModifier": [
        "dimension text modifier: ",
        [
          "text"
        ]
      ],
      "listDimensionStyle": [
        "dimension style: \"",
        [
          "style"
        ],
        "\""
      ],
      "listDimensionOverrides": "dimension style overrides:\n DIMUPT      On",
      "listDimensionAnnotative": "Annotative: No",
      "listHatchPattern": [
        "                 Hatch pattern ",
        [
          "pattern"
        ]
      ],
      "listHatchAnnotative": "                 Annotative: No",
      "listHatchScale": [
        "                 Hatch scale ",
        [
          "scale"
        ]
      ],
      "listHatchAngle": [
        "                 Hatch angle ",
        [
          "angle"
        ]
      ],
      "listHatchNotAssociative": "                 Not associative",
      "listHatchArea": [
        "                 Area      ",
        [
          "area"
        ]
      ],
      "listHatchOrigin": [
        "                 Origin    X=",
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
        "       Block Name: \"",
        [
          "name"
        ],
        "\""
      ],
      "listInsertPoint": [
        "                at point, X=",
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
        "   X scale factor: ",
        [
          "scale"
        ]
      ],
      "listInsertScaleY": [
        "   Y scale factor: ",
        [
          "scale"
        ]
      ],
      "listInsertScaleZ": [
        "   Z scale factor: ",
        [
          "scale"
        ]
      ],
      "listInsertRotation": [
        "   rotation angle: ",
        [
          "angle"
        ]
      ],
      "listInsertUnits": [
        "         InsUnits: ",
        [
          "unit",
          1,
          {
            "cm": "Centimeters",
            "m": "Meters",
            "other": "Millimeters"
          }
        ]
      ],
      "listInsertConversion": [
        "  Unit conversion: ",
        [
          "factor"
        ]
      ],
      "listInsertUniform": "  Scale uniformly: No",
      "listInsertExploding": "  Allow exploding: Yes",
      "listArrayType": [
        "      Array type:  ",
        [
          "kind",
          1,
          {
            "rectangular": "Rectangular",
            "polar": "    Polar",
            "other": "     Path"
          }
        ]
      ],
      "listArrayBasePoint": [
        "      Base point:  X=",
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
        "    Center point:  X=",
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
        "        Number of columns:  ",
        [
          "count"
        ]
      ],
      "listArrayColumnSpacing": [
        "           Column spacing:  ",
        [
          "spacing"
        ]
      ],
      "listArrayRows": [
        "           Number of rows:  ",
        [
          "count"
        ]
      ],
      "listArrayRowSpacing": [
        "              Row spacing:  ",
        [
          "spacing"
        ]
      ],
      "listArrayRowElevation": [
        "  Row elevation increment:  ",
        [
          "spacing"
        ]
      ],
      "listArrayLevels": [
        "         Number of levels:  ",
        [
          "count"
        ]
      ],
      "listArrayLevelSpacing": [
        "            Level spacing:  ",
        [
          "spacing"
        ]
      ],
      "listArrayAxisAngle": [
        "      Included axis angle:  ",
        [
          "angle"
        ]
      ],
      "listArrayRadius": [
        "                   Radius:  ",
        [
          "radius"
        ]
      ],
      "listArrayItems": [
        "          Number of items:  ",
        [
          "count"
        ]
      ],
      "listArrayAngleBetween": [
        "      Angle between items:  ",
        [
          "angle"
        ]
      ],
      "listArrayFillAngle": [
        "               Fill angle:  ",
        [
          "angle"
        ]
      ],
      "listArrayItemSpacing": [
        "             Item spacing:  ",
        [
          "spacing"
        ]
      ],
      "listArrayStartOffset": [
        "             Start offset:  ",
        [
          "spacing"
        ]
      ],
      "listArrayEndOffset": [
        "               End offset:  ",
        [
          "spacing"
        ]
      ],
      "listArrayDirection": [
        "                Direction:  ",
        [
          "direction",
          1,
          {
            "clockwise": "       CW",
            "other": "      CCW"
          }
        ]
      ],
      "listArrayRotate": [
        "           Rotate objects:  ",
        [
          "answer",
          1,
          {
            "yes": "      Yes",
            "other": "       No"
          }
        ]
      ],
      "listArrayMethod": [
        "          Method:  ",
        [
          "method",
          1,
          {
            "measure": "  Measure",
            "other": "   Divide"
          }
        ]
      ],
      "listArrayAlign": [
        "              Align items:  ",
        [
          "answer",
          1,
          {
            "yes": "      Yes",
            "other": "       No"
          }
        ]
      ],
      "regionNoneFound": "None found.",
      "regionObjectsRejected": [
        [
          "count",
          2,
          {
            "one": [
              0,
              " closed, degenerate or unsupported object rejected."
            ],
            "other": [
              0,
              " closed, degenerate or unsupported objects rejected."
            ]
          }
        ]
      ],
      "regionOpenNotCoplanar": "Open objects must be coplanar.",
      "regionLoopsExtracted": [
        [
          "count",
          2,
          {
            "one": [
              0,
              " loop extracted."
            ],
            "other": [
              0,
              " loops extracted."
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
              0,
              " loop rejected."
            ],
            "other": [
              0,
              " loops rejected."
            ]
          }
        ]
      ],
      "regionSelfIntersections": [
        "    Self intersections                     : ",
        [
          "count",
          2,
          {
            "one": [
              0,
              " loop."
            ],
            "other": [
              0,
              " loops."
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
              " Region created."
            ],
            "other": [
              0,
              " Regions created."
            ]
          }
        ]
      ],
      "nullRegion": "Null region created - deleted",
      "nullSolid": "Null solid created - deleted",
      "booleanFailed": [
        [
          "count"
        ],
        " boolean operation(s) failed."
      ],
      "booleanNeedsTwo": "At least 2 solids, surfaces, or coplanar regions must be selected.",
      "subtractFrom": "Select solids, surfaces, and regions to subtract from ..",
      "subtractWhat": "Select solids, surfaces, and regions to subtract ..",
      "regionAreaReport": [
        "Area = ",
        [
          "area"
        ],
        ", Trimmed area = ",
        [
          "trimmed"
        ],
        " , Perimeter = ",
        [
          "around"
        ]
      ],
      "boxZeroLength": "Box of zero length not permitted.",
      "boxZeroWidth": "Box of zero width not permitted.",
      "boxValueNonzero": "Value must be nonzero.",
      "wedgeZeroLength": "Wedge of zero length not permitted.",
      "wedgeZeroWidth": "Wedge of zero width not permitted.",
      "pyramidSettings": [
        " ",
        [
          "sides"
        ],
        " sides  ",
        [
          "type",
          1,
          {
            "inscribed": "Inscribed",
            "other": "Circumscribed"
          }
        ]
      ],
      "pointsCollinear": "Points cannot be collinear. *Invalid*",
      "pointsCoincident": "Points cannot be coincident. *Invalid*",
      "ellipseAxesNonzero": "Ellipse axes lengths must be positive and nonzero",
      "solidTangentRequired": [
        [
          "typed",
          1,
          {
            "yes": "*",
            "other": ""
          }
        ],
        "Requires a TAN object-snap and selection of Circle, Arc, or Line."
      ],
      "torusTubeTooSmall": [
        "If torus radius is ",
        [
          "radius"
        ],
        ", tube radius must be greater than ",
        [
          "minimum"
        ],
        "."
      ],
      "listSolidHistory": "         History = None\n    Show History = No",
      "listSolidType": [
        "      Solid type = ",
        [
          "type",
          1,
          {
            "extrusion": "Extrusion",
            "revolve": "Revolve",
            "wedge": "Wedge",
            "pyramid": "Pyramid",
            "cylinder": "Cylinder",
            "cone": "Cone",
            "sphere": "Sphere",
            "torus": "Torus",
            "other": "Box"
          }
        ]
      ],
      "listBoxPosition": [
        "         Position, X = ",
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
        "           Length: ",
        [
          "length"
        ]
      ],
      "listBoxWidth": [
        "            Width: ",
        [
          "width"
        ]
      ],
      "listBoxHeight": [
        "           Height: ",
        [
          "height"
        ]
      ],
      "listBoxRotation": [
        "         Rotation: ",
        [
          "angle"
        ]
      ],
      "listPyramidInscribedBase": [
        "    Inscribed base radius: ",
        [
          "radius"
        ]
      ],
      "listPyramidCircumscribedBase": [
        "Circumscribed base radius: ",
        [
          "radius"
        ]
      ],
      "listPyramidInscribedTop": [
        "     Inscribed top radius: ",
        [
          "radius"
        ]
      ],
      "listPyramidCircumscribedTop": [
        " Circumscribed top radius: ",
        [
          "radius"
        ]
      ],
      "listPyramidSides": [
        "  Number of sides: ",
        [
          "sides"
        ]
      ],
      "listRoundRadius": [
        "           Radius: ",
        [
          "radius"
        ]
      ],
      "listRoundMajorRadius": [
        "     Major radius: ",
        [
          "radius"
        ]
      ],
      "listRoundMinorRadius": [
        "     Minor radius: ",
        [
          "radius"
        ]
      ],
      "listConeBaseRadius": [
        "      Base radius: ",
        [
          "radius"
        ]
      ],
      "listConeTopRadius": [
        "       Top radius: ",
        [
          "radius"
        ]
      ],
      "listConeBaseMajorRadius": [
        "Base major radius: ",
        [
          "radius"
        ]
      ],
      "listConeBaseMinorRadius": [
        "Base minor radius: ",
        [
          "radius"
        ]
      ],
      "listConeTopMajorRadius": [
        " Top major radius: ",
        [
          "radius"
        ]
      ],
      "listTorusRadius": [
        "     Torus radius: ",
        [
          "radius"
        ]
      ],
      "listTubeRadius": [
        "      Tube radius: ",
        [
          "radius"
        ]
      ],
      "listRegionArea": [
        "                             Area: ",
        [
          "area"
        ]
      ],
      "listRegionPerimeter": [
        "                        Perimeter: ",
        [
          "perimeter"
        ]
      ],
      "listRegionBounds": [
        "   Bounding Box: Lower Bound X = ",
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
        "\n                 Upper Bound X = ",
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
        "Current wire frame density:  ISOLINES=",
        [
          "isolines"
        ],
        ", Closed profiles creation mode = Solid"
      ],
      "sweepRefused": [
        "Cannot sweep or extrude an object of this type.\n",
        [
          "count",
          2,
          {
            "one": [
              0,
              " object removed from selection set."
            ],
            "other": [
              0,
              " objects removed from selection set."
            ]
          }
        ]
      ],
      "sweepNothingSelected": "Nothing selected.",
      "sweepSelfIntersecting": "Cannot sweep or extrude a self-intersecting curve",
      "extrudeValueNonzero": "Value must be nonzero.",
      "taperAngleRange": "Angle must be greater than -90 degrees and less than 90 degrees.",
      "directionCoincident": "Points are coincident.",
      "directionParallel": "Extrude direction is parallel to plane of sweep curve.",
      "expressionSyntax": "The syntax is incorrect or a variable is not defined.  Reenter the expression or value.",
      "listExtrusionHeight": [
        " Extrusion height: ",
        [
          "height"
        ]
      ],
      "listTaperAngle": [
        "      Taper angle: ",
        [
          "angle"
        ]
      ],
      "revolveRefused": [
        "Cannot revolve an object of this type.\n",
        [
          "count",
          2,
          {
            "one": [
              0,
              " object removed from selection set."
            ],
            "other": [
              0,
              " objects removed from selection set."
            ]
          }
        ]
      ],
      "revolveOneSide": "The object should be on one side of the axis.",
      "revolveUnable": "Unable to revolve the selected object.",
      "revolvePerpendicular": "Axis of revolution is perpendicular to plane of revolve curve.",
      "revolveZeroAxis": "Zero length axis is not permitted.",
      "revolveClosedAxis": "Cannot get axis direction from a closed curve or edge.",
      "listRevolveStart": [
        "      Start angle: ",
        [
          "angle"
        ]
      ],
      "listRevolveAngle": [
        "Angle of revolution: ",
        [
          "angle"
        ]
      ],
      "listDirectionVector": [
        " Direction vector: X = ",
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
      "presspullClick": "Click a face, curve, or inside a bounded area"
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
      "PYRAMID": {
        "Axis": "Axis endpoint",
        "Top": "Top radius"
      },
      "CYLINDER": {
        "Axis": "Axis endpoint"
      },
      "CONE": {
        "Axis": "Axis endpoint",
        "Top": "Top radius"
      },
      "CIRCLED": {
        "Ttr": "Ttr (tan tan radius)"
      },
      "PLINE": {
        "Halfwidth": "Halfwidth",
        "Second pt": "Second pt"
      },
      "DIST": {
        "Line": "Line",
        "Direction": "Direction",
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
      "MTEXT": {
        "Line spacing": "Line spacing",
        "At least": "At least"
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
        "ON": "ON",
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
      "SPLINEDIT": {
        "After": "After",
        "Fit data": "Fit data",
        "Edit vertex": "Edit vertex",
        "convert to Polyline": "convert to Polyline",
        "Reverse": "Reverse",
        "eXit": "eXit",
        "Elevate order": "Elevate order",
        "Select point": "Select point",
        "System default": "System default"
      },
      "PEDIT": {
        "Edit vertex": "Edit vertex",
        "Ltype gen": "Ltype gen",
        "OFF": "OFF",
        "Jointype": "Jointype",
        "Spline curve": "Spline curve"
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
      "COPY": {
        "Displacement": "Displacement"
      },
      "UCSICON": {
        "Noorigin": "Noorigin"
      },
      "OFFSET": {
        "Through": "Through"
      },
      "EXTRUDE": {
        "Taper": "Taper angle"
      },
      "REVOLVE": {
        "STart": "STart angle"
      }
    },
    "promptKeywordLabels": {
      "ucsNewUcs": {
        "ZAxis": "ZAxis"
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
      "dimVariableOn": "On",
      "dimVariableOff": "Off",
      "dimVariableDescription": {
        "DIMSTYLE": "Current dimension style (read-only)",
        "DIMADEC": "Angular decimal places",
        "DIMASZ": "Arrow size",
        "DIMCEN": "Center mark size",
        "DIMDEC": "Decimal places",
        "DIMDLI": "Dimension line spacing",
        "DIMDSEP": "Decimal separator",
        "DIMEXE": "Extension above dimension line",
        "DIMEXO": "Extension line origin offset",
        "DIMGAP": "Gap from dimension line to text",
        "DIMSCALE": "Overall scale factor",
        "DIMTOFL": "Force line inside extension lines",
        "DIMTXT": "Text height",
        "DIMZIN": "Zero suppression"
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
        "SOLID": " Solid fill",
        "ANGLE": "Angle steel",
        "ANSI31": "ANSI Iron, Brick, Stone masonry",
        "ANSI32": "ANSI Steel",
        "ANSI33": "ANSI Bronze, Brass, Copper",
        "ANSI34": "ANSI Plastic, Rubber",
        "ANSI35": "ANSI Fire brick, Refractory material",
        "ANSI36": "ANSI Marble, Slate, Glass",
        "ANSI37": "ANSI Lead, Zinc, Magnesium, Sound/Heat/Elec Insulation",
        "ANSI38": "ANSI Aluminum",
        "LINE": "Parallel horizontal lines",
        "NET": "Horizontal / vertical grid",
        "NET3": "Network pattern 0-60-120",
        "DASH": "Dashed lines",
        "SQUARE": "Small aligned squares",
        "STEEL": "Steel material",
        "BRICK": "Brick or masonry-type surface",
        "CROSS": "A series of crosses",
        "ZIGZAG": "Staircase effect",
        "HONEY": "Honeycomb pattern",
        "EARTH": "Earth or ground (subterranean)",
        "DOTS": "A series of dots",
        "AR-SAND": " random dot pattern",
        "AR-CONC": " random dot and stone pattern"
      }
    },
    "defaults": {
      "layer": [
        "Layer",
        [
          "n"
        ]
      ],
      "textStyle": [
        "style",
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
