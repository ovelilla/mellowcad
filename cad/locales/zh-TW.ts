// Generated from zh-TW.json by `npm run locales`. Do not edit.
import type { EngineLocale } from "./types"

export const zhTW: EngineLocale = {
  "tag": "zh-TW",
  "interface": {
    "tool": {
      "move3d": "3D 移動",
      "mesh3d": "3D 網面",
      "select": "選取",
      "line": "線",
      "polyline": "聚合線",
      "polyline3d": "3D 聚合線",
      "circle": "圓",
      "circlediameter": "圓，中心點、直徑",
      "circle2p": "圓，兩點",
      "circle3p": "圓，三點",
      "arc": "弧",
      "arcsce": "弧，起點、中心點、終點",
      "arccse": "弧，中心點、起點、終點",
      "ellipse": "橢圓",
      "ellipsecenter": "橢圓，中心點",
      "ellipsearc": "橢圓弧",
      "spline": "雲形線",
      "splinedit": "編輯雲形線",
      "pedit": "編輯聚合線",
      "splinefit": "雲形線擬合",
      "splinecv": "雲形線 CV",
      "rectangle": "矩形",
      "polygon": "多邊形",
      "hatch": "填充線",
      "hatchedit": "填充線編輯(指令行)",
      "block": "建立圖塊",
      "insert": "插入圖塊",
      "attedit": "編輯屬性",
      "attdef": "定義屬性",
      "attdisp": "顯示屬性",
      "purge": "清除",
      "text": "單行文字",
      "mtext": "多行文字",
      "textedit": "編輯文字",
      "dimlinear": "線性",
      "dimaligned": "對齊式",
      "dimhorizontal": "水平",
      "dimvertical": "垂直",
      "dimrotated": "旋轉標註",
      "dimradius": "半徑",
      "dimdiameter": "直徑",
      "dimangular": "角度",
      "dimbaseline": "基線式",
      "dimcontinue": "連續式",
      "dimspace": "標註空間",
      "offset": "偏移",
      "move": "移動",
      "copy": "複製",
      "stretch": "拉伸",
      "rotate": "旋轉",
      "scale": "比例",
      "mirror": "鏡射",
      "arraycommand": "陣列",
      "array": "矩形陣列",
      "arraypolar": "環形陣列",
      "arraypath": "路徑陣列",
      "trim": "修剪",
      "extend": "延伸",
      "fillet": "圓角",
      "chamfer": "倒角",
      "erase": "刪除",
      "explode": "分解",
      "join": "接合",
      "break": "切斷",
      "breakatpoint": "切斷於點",
      "matchprop": "複製性質",
      "chprop": "變更性質",
      "copyclip": "複本截取",
      "cutclip": "剪下",
      "copybase": "以基準點複製",
      "paste": "貼上",
      "measure": "測量",
      "measurearea": "面積",
      "id": "點位置",
      "list": "清單",
      "massprop": "面域/質量性質",
      "zoom": "縮放",
      "pan": "平移",
      "dashpan": "平移，點",
      "dashdimstyle": "標註型式(指令行)",
      "ucs": "UCS",
      "ucsicon": "UCS 圖示",
      "fill": "填滿",
      "ucsiconvariable": "UCS 圖示(系統變數)",
      "plan": "平面視圖",
      "elev": "高程",
      "vpoint": "檢視點",
      "view": "預置視圖",
      "orbit": "3D 環轉",
      "navvcube": "ViewCube",
      "vscurrent": "視覺型式",
      "regen": "重生",
      "regenall": "全部重生",
      "ltscale": "線型比例",
      "auprec": "角度精確度",
      "setvar": "設定變數",
      "undo": "退回",
      "mredo": "多重重做",
      "osnap": "物件鎖點模式",
      "color": "顏色",
      "linetype": "線型",
      "dashlayer": "圖層(指令行)",
      "lweight": "線粗",
      "snap": "鎖點模式",
      "region": "面域",
      "union": "聯集",
      "subtract": "差集",
      "box": "方塊",
      "wedge": "楔形塊",
      "pyramid": "角錐",
      "cylinder": "圓柱",
      "cone": "圓錐",
      "sphere": "圓球",
      "torus": "圓環",
      "intersect": "交集",
      "extrude": "擠出",
      "revolve": "迴轉",
      "presspull": "按拉",
      "slice": "切割",
      "section": "剖面",
      "filletedge": "圓角邊",
      "chamferedge": "倒角邊",
      "solidedit": "實體編輯",
      "solideditextrude": "擠出面",
      "solideditmove": "移動面",
      "solideditrotate": "旋轉面",
      "solideditoffset": "偏移面",
      "solidedittaper": "錐形面",
      "solideditdelete": "刪除面",
      "solideditcopy": "複製面",
      "point": "多個點",
      "divide": "等分",
      "measuresegments": "等距",
      "ptype": "點型式",
      "solid": "2D 實面",
      "face3d": "3D 面",
      "leader": "引線",
      "wipeout": "遮蔽",
      "xline": "作圖線",
      "ray": "射線",
      "minsert": "插入圖塊陣列"
    },
    "description": {
      "U": "倒回最近的動作",
      "REDO": "倒回先前 UNDO 或 U 指令的效果",
      "SNAP": "限制游標以指定的鎖點間距移動",
      "-OSNAP": "設定常駐式物件鎖點模式",
      "FROM": "於某個指令中指定一點時，指定一個做為偏移依據的參考點",
      "NEW": "建立一個新圖檔",
      "QNEW": "建立一個新圖檔",
      "QSAVE": "儲存目前的圖面",
      "SAVEAS": "以新檔名儲存目前的圖面",
      "SAVE": "儲存目前的圖面",
      "OPEN": "開啟既有的圖檔",
      "DXFIN": "開啟 DXF 檔案",
      "DXFOUT": "將目前的圖面儲存為 DXF 檔案",
      "PASTECLIP": "將物件從剪貼簿貼到目前圖面中",
      "DIMSTYLE": "建立與修改標註型式",
      "STYLE": "建立與修改文字型式",
      "INSERT": "從「圖塊」選項板插入圖塊",
      "BLOCKSPALETTE": "開啟「圖塊」選項板",
      "PURGE": "從圖面移除未使用的圖塊定義",
      "LAYER": "管理圖層與圖層性質",
      "LAYERCLOSE": "關閉「圖層性質管理員」",
      "PROPERTIES": "顯示選取物件的性質",
      "PROPERTIESCLOSE": "關閉「性質」選項板",
      "UNITS": "控制座標和距離顯示的精確度和格式",
      "CLEANSCREENON": "清除螢幕上的工具列和選項板",
      "CLEANSCREENOFF": "回復「清爽螢幕」之前的顯示狀態",
      "RIBBON": "顯示功能區",
      "RIBBONCLOSE": "隱藏功能區"
    },
    "snap": {
      "endpoint": "端點",
      "midpoint": "中點",
      "center": "中心點",
      "node": "節點",
      "intersection": "交點",
      "apparentIntersection": "外觀交點",
      "perpendicular": "互垂點",
      "tangent": "相切點",
      "insertion": "插入點",
      "extension": "延伸",
      "parallel": "平行",
      "quadrant": "四分點",
      "nearest": "最近點"
    },
    "color": {
      "red": "紅",
      "yellow": "黃",
      "green": "綠",
      "cyan": "青",
      "blue": "藍",
      "magenta": "洋紅",
      "white": "白"
    },
    "byLayer": "ByLayer",
    "colorNumber": [
      "顏色 ",
      [
        "index"
      ]
    ],
    "view": {
      "Top": "上",
      "Bottom": "下",
      "Front": "前",
      "BAck": "後",
      "Left": "左",
      "Right": "右",
      "SWiso": "西南等角",
      "SEiso": "東南等角",
      "NEiso": "東北等角",
      "NWiso": "西北等角",
      "custom": "自訂視圖"
    },
    "visualStyle": {
      "2dWireframe": "2D 線架構",
      "hidden": "隱藏",
      "conceptual": "概念"
    },
    "visualStyleFast": "(快速)",
    "viewCube": {
      "face": {
        "top": "上",
        "bottom": "下",
        "front": "前",
        "back": "後",
        "left": "左",
        "right": "右"
      },
      "compass": {
        "N": "北",
        "E": "東",
        "S": "南",
        "W": "西"
      }
    },
    "entity": {
      "polygonMesh": [
        [
          "count",
          2,
          {
            "other": "多邊形網面"
          }
        ]
      ],
      "line": [
        [
          "count",
          2,
          {
            "other": "線"
          }
        ]
      ],
      "circle": [
        [
          "count",
          2,
          {
            "other": "圓"
          }
        ]
      ],
      "arc": [
        [
          "count",
          2,
          {
            "other": "弧"
          }
        ]
      ],
      "ellipse": [
        [
          "count",
          2,
          {
            "other": "橢圓"
          }
        ]
      ],
      "spline": [
        [
          "count",
          2,
          {
            "other": "雲形線"
          }
        ]
      ],
      "polyline": [
        [
          "count",
          2,
          {
            "other": "聚合線"
          }
        ]
      ],
      "polyline3d": [
        [
          "count",
          2,
          {
            "other": "3D 聚合線"
          }
        ]
      ],
      "text": [
        [
          "count",
          2,
          {
            "other": "文字"
          }
        ]
      ],
      "mtext": [
        [
          "count",
          2,
          {
            "other": "多行文字"
          }
        ]
      ],
      "attdef": [
        [
          "count",
          2,
          {
            "other": "屬性定義"
          }
        ]
      ],
      "dimension": [
        [
          "count",
          2,
          {
            "other": "標註"
          }
        ]
      ],
      "hatch": [
        [
          "count",
          2,
          {
            "other": "填充線"
          }
        ]
      ],
      "insert": [
        [
          "count",
          2,
          {
            "other": "圖塊參考"
          }
        ]
      ],
      "solid3d": [
        [
          "count",
          2,
          {
            "other": "3D 實體"
          }
        ]
      ],
      "region": [
        [
          "count",
          2,
          {
            "other": "面域"
          }
        ]
      ],
      "point": [
        [
          "count",
          2,
          {
            "other": "點"
          }
        ]
      ],
      "solid2d": [
        [
          "count",
          2,
          {
            "other": "實體"
          }
        ]
      ],
      "face3d": [
        [
          "count",
          2,
          {
            "other": "3D 面"
          }
        ]
      ],
      "leader": [
        [
          "count",
          2,
          {
            "other": "引線"
          }
        ]
      ],
      "wipeout": [
        [
          "count",
          2,
          {
            "other": "遮蔽"
          }
        ]
      ],
      "image": [
        [
          "count",
          2,
          {
            "other": "點陣式影像"
          }
        ]
      ],
      "table": [
        [
          "count",
          2,
          {
            "other": "表格"
          }
        ]
      ],
      "mleader": [
        [
          "count",
          2,
          {
            "other": "多重引線"
          }
        ]
      ],
      "xline": [
        [
          "count",
          2,
          {
            "other": "作圖線"
          }
        ]
      ],
      "ray": [
        [
          "count",
          2,
          {
            "other": "射線"
          }
        ]
      ]
    },
    "array": {
      "rectangular": "陣列 (矩形)",
      "polar": "陣列 (環形)",
      "path": "陣列 (路徑)"
    },
    "property": {
      "title": {
        "ellipticalArc": "橢圓弧",
        "objects": [
          [
            "count",
            2,
            {
              "other": [
                0,
                " 個物件"
              ]
            }
          ]
        ],
        "all": [
          "全部 (",
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
        "linearDimension": "旋轉標註",
        "alignedDimension": "對齊式標註",
        "angularDimension": "角度標註",
        "radiusDimension": "半徑標註",
        "diameterDimension": "直徑標註",
        "minsert": "插入圖塊陣列"
      },
      "group": {
        "mesh": "網面",
        "geometry": "幾何圖形",
        "solidHistory": "實體歷程",
        "endpoints": "端點",
        "center": "中心點",
        "text": "文字",
        "position": "位置",
        "dimension": "標註",
        "definitionPoints": "定義點",
        "pattern": "樣式",
        "block": "圖塊",
        "attributes": "屬性",
        "misc": "雜項",
        "dataPoints": "資料點",
        "linesArrows": "線與箭頭",
        "fit": "填入",
        "primaryUnits": "主要單位"
      },
      "row": {
        "meshMClosed": "M 向封閉",
        "meshNClosed": "N 向封閉",
        "meshMDensity": "M 向密度",
        "meshNDensity": "N 向密度",
        "meshMVertexCount": "M 向頂點數",
        "meshNVertexCount": "N 向頂點數",
        "length": "長度",
        "angle": "角度",
        "deltaX": "差值 X",
        "deltaY": "差值 Y",
        "deltaZ": "差值 Z",
        "startX": "起點 X",
        "startY": "起點 Y",
        "startZ": "起點 Z",
        "endX": "終點 X",
        "endY": "終點 Y",
        "endZ": "終點 Z",
        "centerX": "中心點 X",
        "centerY": "中心點 Y",
        "centerZ": "中心點 Z",
        "radius": "半徑",
        "diameter": "直徑",
        "circumference": "圓周",
        "area": "面積",
        "normalX": "法線 X",
        "normalY": "法線 Y",
        "normalZ": "法線 Z",
        "x": "X",
        "y": "Y",
        "z": "Z",
        "elevation": "高程",
        "thickness": "厚度",
        "linetypeScale": "線型比例",
        "startAngle": "起始角度",
        "endAngle": "結束角度",
        "totalAngle": "總角度",
        "arcLength": "弧長",
        "majorRadius": "主半徑",
        "minorRadius": "次半徑",
        "radiusRatio": "半徑比",
        "majorAxisVectorX": "長軸向量 X",
        "majorAxisVectorY": "長軸向量 Y",
        "majorAxisVectorZ": "長軸向量 Z",
        "minorAxisVectorX": "短軸向量 X",
        "minorAxisVectorY": "短軸向量 Y",
        "minorAxisVectorZ": "短軸向量 Z",
        "vertices": "頂點",
        "segments": "線段",
        "solidType": "實體類型",
        "baseRadius": "底部半徑",
        "topRadius": "頂部半徑",
        "sides": "邊數",
        "elliptical": "橢圓",
        "baseMajorRadius": "主底部半徑",
        "baseMinorRadius": "次底部半徑",
        "topMajorRadius": "主頂部半徑",
        "topMinorRadius": "次頂部半徑",
        "torusRadius": "圓環半徑",
        "tubeRadius": "細管半徑",
        "currentVertex": "目前頂點",
        "vertex": "頂點",
        "startSegmentWidth": "起始線段寬度",
        "endSegmentWidth": "結束線段寬度",
        "globalWidth": "整體寬度",
        "closed": "封閉",
        "contents": "內容",
        "justify": "對正",
        "height": "高度",
        "taperAngle": "推拔角度",
        "angleOfRevolution": "迴轉角度",
        "axisDirectionX": "軸方向 X",
        "axisDirectionY": "軸方向 Y",
        "axisDirectionZ": "軸方向 Z",
        "history": "歷程",
        "rotation": "旋轉",
        "lineSpaceFactor": "行距係數",
        "lineSpaceDistance": "行距",
        "lineSpaceStyle": "行距型式",
        "definedWidth": "定義的寬度",
        "textHeight": "文字高度",
        "textAlignmentX": "文字對齊 X",
        "textAlignmentY": "文字對齊 Y",
        "textAlignmentZ": "文字對齊 Z",
        "measurement": "測量",
        "textOverride": "文字置換",
        "type": "類型",
        "vertexX": "頂點 X",
        "vertexY": "頂點 Y",
        "vertexZ": "頂點 Z",
        "fitSmooth": "擬合/平滑化",
        "firstX": "第一點 X",
        "firstY": "第一點 Y",
        "secondX": "第二點 X",
        "secondY": "第二點 Y",
        "pattern": "樣式",
        "scale": "比例",
        "boundaries": "邊界",
        "patternName": "樣式名稱",
        "annotative": "可註解",
        "originX": "原點 X",
        "originY": "原點 Y",
        "associative": "關聯式",
        "islandDetectionStyle": "孤立物件偵測型式",
        "edge1": "邊 1",
        "edge2": "邊 2",
        "edge3": "邊 3",
        "edge4": "邊 4",
        "gradientName": "漸層名稱",
        "color1": "顏色 1",
        "color2": "顏色 2",
        "gradientAngle": "漸層角度",
        "centered": "置中",
        "cumulativeArea": "累計面積",
        "name": "名稱",
        "tag": "標籤",
        "prompt": "提示",
        "value": "值",
        "invisible": "不可見",
        "constant": "常數",
        "verify": "確認",
        "preset": "預置",
        "lockPosition": "鎖住位置",
        "method": "方式",
        "degree": "次數",
        "knotParameterization": "節點參數",
        "numberOfFitPoints": "擬合點數目",
        "currentFitPoint": "目前擬合點",
        "fitPointX": "擬合點 X",
        "fitPointY": "擬合點 Y",
        "fitPointZ": "擬合點 Z",
        "numberOfControlPoints": "控制點數目",
        "currentControlPoint": "目前控制點",
        "controlPointX": "控制點 X",
        "controlPointY": "控制點 Y",
        "controlPointZ": "控制點 Z",
        "weight": "權值",
        "width": "寬度",
        "cvFrame": "CV 框",
        "periodic": "週期性",
        "planar": "平面",
        "startTangentVectorX": "起點切線向量 X",
        "startTangentVectorY": "起點切線向量 Y",
        "startTangentVectorZ": "起點切線向量 Z",
        "endTangentVectorX": "終點切線向量 X",
        "endTangentVectorY": "終點切線向量 Y",
        "endTangentVectorZ": "終點切線向量 Z",
        "fitTolerance": "擬合公差",
        "positionX": "位置 X",
        "positionY": "位置 Y",
        "positionZ": "位置 Z",
        "insertionPointX": "插入點 X",
        "insertionPointY": "插入點 Y",
        "insertionPointZ": "插入點 Z",
        "minsertColumns": "行數",
        "minsertColumnSpacing": "行間距",
        "minsertRows": "列數",
        "minsertRowSpacing": "列間距",
        "basePointX": "基準點 X",
        "basePointY": "基準點 Y",
        "basePointZ": "基準點 Z",
        "secondPointX": "第二點 X",
        "secondPointY": "第二點 Y",
        "secondPointZ": "第二點 Z",
        "directionVectorX": "方向量 X",
        "directionVectorY": "方向量 Y",
        "directionVectorZ": "方向量 Z",
        "scaleX": "比例 X",
        "scaleY": "比例 Y",
        "scaleZ": "比例 Z",
        "showHistory": "展示歷程",
        "baseX": "基準 X",
        "baseY": "基準 Y",
        "baseZ": "基準 Z",
        "pathLength": "路徑長度",
        "columns": "行數",
        "columnSpacing": "行間距",
        "rows": "列",
        "rowSpacing": "列間距",
        "rowElevationIncrement": "列高程增量",
        "levels": "層數",
        "levelSpacing": "圖層間距",
        "includedAxisAngle": "包含軸角度",
        "direction": "方向",
        "items": "項目",
        "angleBetweenItems": "項目間的角度",
        "fillAngle": "填滿角度",
        "rotateItems": "旋轉項目",
        "itemSpacing": "項目間距",
        "alignItems": "對齊項目",
        "arrowSize": "箭頭大小",
        "centerMarkSize": "中心標記大小",
        "extLineExt": "延伸線延伸量",
        "extLineOffset": "延伸線偏移",
        "textOffset": "文字偏移",
        "textPositionX": "文字位置 X",
        "textPositionY": "文字位置 Y",
        "textRotation": "文字旋轉",
        "dimScaleOverall": "整體標註比例",
        "decimalSeparator": "小數分隔符號",
        "suppressTrailingZeros": "抑制結尾零",
        "precision": "精確度",
        "perimeter": "周長",
        "arrow": "箭頭",
        "textPosVert": "垂直文字位置"
      },
      "value": {
        "meshFitNone": "無",
        "fitQuadratic": "二次",
        "fitCubic": "三次",
        "fitBezier": "Bezier",
        "yes": "是",
        "no": "否",
        "none": "—",
        "fitNone": "無",
        "atLeast": "最小",
        "exactly": "精確",
        "fitPoints": "擬合",
        "controlVertices": "控制頂點",
        "box": "方塊",
        "wedge": "楔形塊",
        "pyramid": "角錐",
        "inscribed": "內接",
        "circumscribed": "外切",
        "cylinder": "圓柱",
        "cone": "圓錐",
        "sphere": "圓球",
        "torus": "圓環",
        "chord": "弦",
        "sqrtChord": "平方根弦",
        "uniform": "均勻",
        "custom": "自訂",
        "show": "展示",
        "hide": "隱藏",
        "counterClockwise": "逆時鐘",
        "clockwise": "順時鐘",
        "divide": "等分",
        "historyNone": "無",
        "measure": "等距",
        "predefined": "預先定義",
        "userDefined": "使用者定義",
        "customPattern": "自訂",
        "edgeVisible": "可見",
        "edgeHidden": "隱藏",
        "gradient": "漸層",
        "gradientLinear": "線性",
        "gradientCylinder": "圓柱",
        "gradientInvCylinder": "反轉的圓柱",
        "gradientSpherical": "球形",
        "gradientHemispherical": "半球形",
        "gradientCurved": "曲線",
        "gradientInvSpherical": "反轉的球形",
        "gradientInvHemispherical": "反轉的半球形",
        "gradientInvCurved": "反轉的曲線",
        "outer": "外側",
        "extrusion": "擠出",
        "revolve": "迴轉",
        "lineWithNoArrow": "無箭頭線",
        "splineWithNoArrow": "無箭頭雲形線",
        "lineWithArrow": "含箭頭線",
        "splineWithArrow": "含箭頭雲形線",
        "closedFilled": "封閉填滿",
        "centered": "置中",
        "above": "上方"
      },
      "justify": {
        "left": "左",
        "center": "中心",
        "right": "右",
        "middle": "中央",
        "tl": "左上",
        "tc": "中上",
        "tr": "右上",
        "ml": "左中",
        "mc": "正中",
        "mr": "右中",
        "bl": "左下",
        "bc": "中下",
        "br": "右下"
      },
      "dimensionKind": {
        "linear": "線性",
        "aligned": "對齊",
        "angular": "角度",
        "radius": "半徑",
        "diameter": "直徑"
      }
    }
  }
}
