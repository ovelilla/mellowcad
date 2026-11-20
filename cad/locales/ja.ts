// Generated from ja.json by `npm run locales`. Do not edit.
import type { EngineLocale } from "./types"

export const ja: EngineLocale = {
  "tag": "ja",
  "interface": {
    "tool": {
      "select": "選択",
      "line": "線分",
      "polyline": "ポリライン",
      "polyline3d": "3D ポリライン",
      "circle": "円",
      "circlediameter": "円、中心、直径",
      "circle2p": "円、2 点",
      "circle3p": "円、3 点",
      "arc": "円弧",
      "arcsce": "円弧、始点、中心、終点",
      "arccse": "円弧、中心、始点、終点",
      "ellipse": "楕円",
      "ellipsecenter": "楕円、中心",
      "ellipsearc": "楕円弧",
      "spline": "スプライン",
      "splinedit": "スプライン編集",
      "pedit": "ポリライン編集",
      "splinefit": "スプライン フィット",
      "splinecv": "スプライン制御点",
      "rectangle": "長方形",
      "polygon": "ポリゴン",
      "hatch": "ハッチング",
      "block": "ブロック作成",
      "insert": "ブロック挿入",
      "attedit": "属性編集",
      "attdef": "属性定義",
      "attdisp": "属性表示",
      "purge": "名前削除",
      "text": "文字",
      "mtext": "マルチ テキスト",
      "textedit": "文字編集",
      "dimlinear": "長さ寸法記入",
      "dimaligned": "平行寸法記入",
      "dimhorizontal": "水平寸法",
      "dimvertical": "垂直寸法",
      "dimrotated": "回転寸法",
      "dimradius": "半径寸法記入",
      "dimdiameter": "直径寸法記入",
      "dimangular": "角度寸法記入",
      "dimbaseline": "並列寸法記入",
      "dimcontinue": "直列寸法記入",
      "dimspace": "寸法線間隔",
      "offset": "オフセット",
      "move": "移動",
      "copy": "複写",
      "stretch": "ストレッチ",
      "rotate": "回転",
      "scale": "尺度変更",
      "mirror": "鏡像",
      "arraycommand": "配列複写",
      "array": "矩形状配列複写",
      "arraypolar": "円形状配列複写",
      "arraypath": "パス配列複写",
      "trim": "トリム",
      "extend": "延長",
      "fillet": "フィレット",
      "chamfer": "面取り",
      "erase": "削除",
      "explode": "分解",
      "join": "結合",
      "break": "部分削除",
      "breakatpoint": "点で部分削除",
      "matchprop": "プロパティ コピー",
      "chprop": "プロパティ変更",
      "copyclip": "コピー クリップ",
      "cutclip": "切り取り",
      "copybase": "基点コピー",
      "paste": "貼り付け",
      "measure": "計測",
      "measurearea": "面積",
      "id": "位置表示",
      "list": "オブジェクト情報",
      "massprop": "リージョン/マス プロパティ",
      "zoom": "ズーム",
      "pan": "画面移動",
      "dashpan": "画面移動、点をクリック",
      "dashdimstyle": "寸法スタイル管理(コマンド ライン)",
      "ucs": "UCS",
      "ucsicon": "UCS アイコン",
      "fill": "塗り潰し",
      "ucsiconvariable": "UCS アイコン(システム変数)",
      "plan": "プラン ビュー",
      "elev": "高度設定",
      "vpoint": "3D 視点",
      "view": "プリセット ビュー",
      "orbit": "3D オービット",
      "navvcube": "ViewCube",
      "vscurrent": "表示スタイル",
      "regen": "再作図",
      "regenall": "全再作図",
      "ltscale": "線種尺度",
      "auprec": "角度の精度",
      "setvar": "変数設定",
      "undo": "元に戻す",
      "mredo": "複数回やり直し",
      "osnap": "オブジェクト スナップ モード",
      "color": "色設定",
      "linetype": "線種設定",
      "dashlayer": "画層(コマンド ライン)",
      "lweight": "線の太さ",
      "snap": "スナップ モード",
      "region": "リージョン",
      "union": "和",
      "subtract": "差",
      "box": "直方体",
      "wedge": "くさび",
      "pyramid": "角錐",
      "cylinder": "円柱",
      "cone": "円錐",
      "sphere": "球",
      "torus": "トーラス",
      "intersect": "交差",
      "extrude": "押し出し",
      "revolve": "回転",
      "presspull": "境界引き伸ばし",
      "slice": "切断",
      "section": "断面",
      "filletedge": "フィレット エッジ",
      "chamferedge": "面取りエッジ",
      "solidedit": "ソリッド編集",
      "solideditextrude": "面を押し出し",
      "solideditmove": "面を移動",
      "solideditrotate": "面を回転",
      "solideditoffset": "面をオフセット",
      "solidedittaper": "面にテーパを付ける",
      "solideditdelete": "面を削除",
      "solideditcopy": "面を複写",
      "point": "複数点",
      "divide": "ディバイダ",
      "measuresegments": "メジャー",
      "ptype": "点スタイル管理",
      "solid": "2D 塗り潰し",
      "face3d": "3D 面",
      "leader": "引出線記入",
      "wipeout": "ワイプアウト"
    },
    "description": {
      "U": "最後の操作を元に戻す",
      "REDO": "直前の UNDO または U コマンドの効果を取り消す",
      "SNAP": "カーソルの動きをスナップ間隔に制限",
      "-OSNAP": "定常オブジェクト スナップ モードを設定",
      "FROM": "コマンド実行中に参照点からのオフセットにより点を位置付ける",
      "NEW": "新しい図面ファイルを作成",
      "QNEW": "新しい図面ファイルを作成",
      "QSAVE": "現在の図面を保存",
      "SAVEAS": "現在の図面のコピーを新しいファイル名で保存",
      "SAVE": "現在の図面を保存",
      "OPEN": "既存の図面ファイルを開く",
      "DXFIN": "DXF ファイルを開く",
      "DXFOUT": "現在の図面を DXF ファイルとして保存",
      "PASTECLIP": "クリップボードのオブジェクトを現在の図面に貼り付け",
      "DIMSTYLE": "寸法スタイルを作成、修正",
      "STYLE": "文字スタイルを作成、修正",
      "INSERT": "ブロック パレットからブロックを挿入",
      "BLOCKSPALETTE": "ブロック パレットを開く",
      "PURGE": "使用されていないブロック定義を削除",
      "LAYER": "画層と画層のプロパティを管理",
      "LAYERCLOSE": "[画層プロパティ管理]パレットを閉じる",
      "PROPERTIES": "選択したオブジェクトのプロパティを表示",
      "PROPERTIESCLOSE": "[プロパティ]パレットを閉じる",
      "UNITS": "座標と距離の表示精度および表示形式をコントロール",
      "CLEANSCREENON": "ツールバーとパレットを画面から消去",
      "CLEANSCREENOFF": "フル スクリーン表示の前の表示に戻す"
    },
    "snap": {
      "endpoint": "端点",
      "midpoint": "中点",
      "center": "中心",
      "node": "点",
      "intersection": "交点",
      "apparentIntersection": "仮想交点",
      "perpendicular": "垂線",
      "tangent": "接線",
      "insertion": "挿入基点",
      "extension": "延長",
      "parallel": "平行",
      "quadrant": "四半円点",
      "nearest": "近接点"
    },
    "color": {
      "red": "赤",
      "yellow": "黄",
      "green": "緑",
      "cyan": "水色",
      "blue": "青",
      "magenta": "紫",
      "white": "白"
    },
    "byLayer": "ByLayer",
    "view": {
      "Top": "平面図",
      "Bottom": "下面図",
      "Front": "正面図",
      "BAck": "背面図",
      "Left": "左側面図",
      "Right": "右側面図",
      "SWiso": "南西アイソメ ビュー",
      "SEiso": "南東アイソメ ビュー",
      "NEiso": "北東アイソメ ビュー",
      "NWiso": "北西アイソメ ビュー",
      "custom": "カスタム ビュー"
    },
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
      "line": [
        [
          "count",
          2,
          {
            "other": "線分"
          }
        ]
      ],
      "circle": [
        [
          "count",
          2,
          {
            "other": "円"
          }
        ]
      ],
      "arc": [
        [
          "count",
          2,
          {
            "other": "円弧"
          }
        ]
      ],
      "ellipse": [
        [
          "count",
          2,
          {
            "other": "楕円"
          }
        ]
      ],
      "spline": [
        [
          "count",
          2,
          {
            "other": "スプライン"
          }
        ]
      ],
      "polyline": [
        [
          "count",
          2,
          {
            "other": "ポリライン"
          }
        ]
      ],
      "polyline3d": [
        [
          "count",
          2,
          {
            "other": "3D ポリライン"
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
            "other": "マルチ テキスト"
          }
        ]
      ],
      "attdef": [
        [
          "count",
          2,
          {
            "other": "属性定義"
          }
        ]
      ],
      "dimension": [
        [
          "count",
          2,
          {
            "other": "寸法"
          }
        ]
      ],
      "hatch": [
        [
          "count",
          2,
          {
            "other": "ハッチング"
          }
        ]
      ],
      "insert": [
        [
          "count",
          2,
          {
            "other": "ブロック参照"
          }
        ]
      ],
      "solid3d": [
        [
          "count",
          2,
          {
            "other": "3D ソリッド"
          }
        ]
      ],
      "region": [
        [
          "count",
          2,
          {
            "other": "リージョン"
          }
        ]
      ],
      "point": [
        [
          "count",
          2,
          {
            "other": "点"
          }
        ]
      ],
      "solid2d": [
        [
          "count",
          2,
          {
            "other": "ソリッド"
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
            "other": "引出線"
          }
        ]
      ],
      "wipeout": [
        [
          "count",
          2,
          {
            "other": "ワイプアウト"
          }
        ]
      ],
      "image": [
        [
          "count",
          2,
          {
            "other": "ラスター イメージ"
          }
        ]
      ],
      "table": [
        [
          "count",
          2,
          {
            "other": "表"
          }
        ]
      ],
      "mleader": [
        [
          "count",
          2,
          {
            "other": "マルチ引出線"
          }
        ]
      ]
    },
    "array": {
      "rectangular": "配列複写(矩形状)",
      "polar": "配列複写(円形状)",
      "path": "配列複写(パス)"
    },
    "property": {
      "title": {
        "ellipticalArc": "楕円弧",
        "objects": [
          [
            "count",
            2,
            {
              "other": [
                0,
                " 個のオブジェクト"
              ]
            }
          ]
        ],
        "all": [
          "すべて (",
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
        "linearDimension": "長さ寸法",
        "alignedDimension": "平行寸法",
        "angularDimension": "角度寸法",
        "radiusDimension": "半径寸法",
        "diameterDimension": "直径寸法"
      },
      "group": {
        "geometry": "ジオメトリ",
        "solidHistory": "ソリッド履歴",
        "endpoints": "端点",
        "center": "中心",
        "text": "文字",
        "position": "位置",
        "dimension": "寸法",
        "definitionPoints": "定義点",
        "pattern": "パターン",
        "block": "ブロック",
        "attributes": "属性",
        "misc": "その他",
        "dataPoints": "データ点",
        "selection": "選択",
        "linesArrows": "線分と矢印",
        "fit": "フィット",
        "primaryUnits": "基本単位"
      },
      "row": {
        "length": "長さ",
        "angle": "角度",
        "deltaX": "デルタ X",
        "deltaY": "デルタ Y",
        "deltaZ": "デルタ Z",
        "startX": "始点 X",
        "startY": "始点 Y",
        "startZ": "始点 Z",
        "endX": "終点 X",
        "endY": "終点 Y",
        "endZ": "終点 Z",
        "centerX": "中心 X",
        "centerY": "中心 Y",
        "centerZ": "中心 Z",
        "radius": "半径",
        "diameter": "直径",
        "circumference": "円周",
        "area": "面積",
        "normalX": "法線 X",
        "normalY": "法線 Y",
        "normalZ": "法線 Z",
        "x": "X",
        "y": "Y",
        "z": "Z",
        "elevation": "高度",
        "thickness": "厚さ",
        "linetypeScale": "線種尺度",
        "startAngle": "始点での角度",
        "endAngle": "終点での角度",
        "totalAngle": "全角度",
        "arcLength": "円弧の長さ",
        "majorRadius": "主軸の半径",
        "minorRadius": "副軸の半径",
        "radiusRatio": "半径比",
        "majorAxisVectorX": "主軸ベクトル X",
        "majorAxisVectorY": "主軸ベクトル Y",
        "majorAxisVectorZ": "主軸ベクトル Z",
        "minorAxisVectorX": "補助軸ベクトル X",
        "minorAxisVectorY": "補助軸ベクトル Y",
        "minorAxisVectorZ": "補助軸ベクトル Z",
        "vertices": "頂点",
        "segments": "セグメント",
        "solidType": "ソリッド タイプ",
        "baseRadius": "底面半径",
        "topRadius": "上面半径",
        "sides": "側面",
        "elliptical": "楕円状",
        "baseMajorRadius": "底面の主軸の半径",
        "baseMinorRadius": "底面の副軸の半径",
        "topMajorRadius": "上面の主軸の半径",
        "topMinorRadius": "上面の副軸の半径",
        "torusRadius": "トーラスの半径",
        "tubeRadius": "チューブの半径",
        "currentVertex": "現在の頂点",
        "vertex": "頂点",
        "startSegmentWidth": "開始セグメント幅",
        "endSegmentWidth": "終了セグメント幅",
        "globalWidth": "グローバル幅",
        "closed": "閉じている",
        "contents": "内容",
        "justify": "位置合わせ",
        "height": "高さ",
        "taperAngle": "テーパ角度",
        "angleOfRevolution": "回転の角度",
        "axisDirectionX": "軸の方向 X",
        "axisDirectionY": "軸の方向 Y",
        "axisDirectionZ": "軸の方向 Z",
        "history": "履歴",
        "rotation": "回転角度",
        "lineSpaceFactor": "行間隔の尺度",
        "lineSpaceDistance": "行間隔の距離",
        "lineSpaceStyle": "行間隔のスタイル",
        "definedWidth": "定義幅",
        "textHeight": "文字高さ",
        "textAlignmentX": "文字位置合わせ X",
        "textAlignmentY": "文字位置合わせ Y",
        "textAlignmentZ": "文字位置合わせ Z",
        "measurement": "計測値",
        "textOverride": "寸法値の優先",
        "type": "タイプ",
        "vertexX": "頂点 X",
        "vertexY": "頂点 Y",
        "vertexZ": "頂点 Z",
        "fitSmooth": "フィット/スムーズ",
        "firstX": "1 点目 X",
        "firstY": "1 点目 Y",
        "secondX": "2 点目 X",
        "secondY": "2 点目 Y",
        "pattern": "パターン",
        "scale": "尺度",
        "boundaries": "境界",
        "patternName": "パターン名",
        "annotative": "異尺度対応",
        "originX": "原点 X",
        "originY": "原点 Y",
        "associative": "自動調整",
        "islandDetectionStyle": "島の検出スタイル",
        "edge1": "エッジ 1",
        "edge2": "エッジ 2",
        "edge3": "エッジ 3",
        "edge4": "エッジ 4",
        "gradientName": "グラデーション名",
        "color1": "色 1",
        "color2": "色 2",
        "gradientAngle": "グラデーション角度",
        "centered": "中心合わせ",
        "cumulativeArea": "累積面積",
        "name": "名前",
        "tag": "名称",
        "prompt": "プロンプト",
        "value": "値",
        "invisible": "非表示",
        "constant": "一定",
        "verify": "確認",
        "preset": "プリセット",
        "lockPosition": "位置をロック",
        "method": "方式",
        "degree": "度",
        "knotParameterization": "ノット パラメータ",
        "numberOfFitPoints": "フィット点の数",
        "currentFitPoint": "現在のフィット点",
        "fitPointX": "フィット点 X",
        "fitPointY": "フィット点 Y",
        "fitPointZ": "フィット点 Z",
        "numberOfControlPoints": "制御点の数",
        "currentControlPoint": "現在の制御点",
        "controlPointX": "制御点 X",
        "controlPointY": "制御点 Y",
        "controlPointZ": "制御点 Z",
        "weight": "重み",
        "width": "幅",
        "cvFrame": "CV フレーム",
        "periodic": "周期的",
        "planar": "平面状",
        "startTangentVectorX": "開始接線ベクトル X",
        "startTangentVectorY": "開始接線ベクトル Y",
        "startTangentVectorZ": "開始接線ベクトル Z",
        "endTangentVectorX": "終了接線ベクトル X",
        "endTangentVectorY": "終了接線ベクトル Y",
        "endTangentVectorZ": "終了接線ベクトル Z",
        "fitTolerance": "フィット許容差",
        "positionX": "位置 X",
        "positionY": "位置 Y",
        "positionZ": "位置 Z",
        "scaleX": "尺度 X",
        "scaleY": "尺度 Y",
        "scaleZ": "尺度 Z",
        "showHistory": "履歴を表示",
        "baseX": "基点 X",
        "baseY": "基点 Y",
        "baseZ": "基点 Z",
        "pathLength": "パスの長さ",
        "columns": "列",
        "columnSpacing": "列の間隔",
        "rows": "行",
        "rowSpacing": "行の間隔",
        "rowElevationIncrement": "行の高さの増分",
        "levels": "レベル",
        "levelSpacing": "レベルの間隔",
        "includedAxisAngle": "軸内側の角度",
        "direction": "方向",
        "items": "項目",
        "angleBetweenItems": "項目間の角度",
        "fillAngle": "全体の複写角度",
        "rotateItems": "項目を回転",
        "itemSpacing": "項目の間隔",
        "alignItems": "項目を位置合わせ",
        "arrowSize": "矢印サイズ",
        "centerMarkSize": "中心マークのサイズ",
        "extLineExt": "寸法補助線延長長さ",
        "extLineOffset": "寸法補助線のオフセット",
        "textOffset": "文字オフセット",
        "textPositionX": "寸法値位置 X",
        "textPositionY": "寸法値位置 Y",
        "textRotation": "寸法値の角度",
        "dimScaleOverall": "全体の寸法尺度",
        "decimalSeparator": "十進数の区切り",
        "suppressTrailingZeros": "末尾の 0 を省略",
        "precision": "精度",
        "perimeter": "周長",
        "arrow": "矢印",
        "textPosVert": "垂直方向の寸法値位置"
      },
      "value": {
        "yes": "はい",
        "no": "いいえ",
        "none": "—",
        "fitNone": "なし",
        "atLeast": "最小",
        "exactly": "固定",
        "fitPoints": "フィット",
        "controlVertices": "制御点",
        "box": "直方体",
        "wedge": "くさび",
        "pyramid": "角錐",
        "inscribed": "内接",
        "circumscribed": "外接",
        "cylinder": "円柱",
        "cone": "円錐",
        "sphere": "球",
        "torus": "トーラス",
        "chord": "弦",
        "sqrtChord": "平方根弦",
        "uniform": "均一",
        "custom": "カスタム",
        "show": "表示",
        "hide": "非表示",
        "counterClockwise": "反時計回り",
        "clockwise": "時計回り",
        "divide": "ディバイダ",
        "historyNone": "なし",
        "measure": "メジャー",
        "predefined": "定義済みパターン",
        "userDefined": "ユーザ定義",
        "customPattern": "カスタム",
        "edgeVisible": "表示",
        "edgeHidden": "非表示",
        "gradient": "グラデーション",
        "gradientLinear": "直線状",
        "gradientCylinder": "円柱状",
        "gradientInvCylinder": "逆円柱状",
        "gradientSpherical": "球状",
        "gradientHemispherical": "半球状",
        "gradientCurved": "曲線状",
        "gradientInvSpherical": "逆球状",
        "gradientInvHemispherical": "逆半球状",
        "gradientInvCurved": "逆曲線状",
        "outer": "外側のみ",
        "extrusion": "押し出し",
        "revolve": "回転",
        "lineWithNoArrow": "矢印なしの線分",
        "splineWithNoArrow": "矢印なしのスプライン",
        "lineWithArrow": "矢印付きの線分",
        "splineWithArrow": "矢印付きのスプライン",
        "closedFilled": "塗り潰し矢印",
        "centered": "中心",
        "above": "上側"
      },
      "justify": {
        "left": "左寄せ(L)",
        "center": "中心(C)",
        "right": "右寄せ(R)",
        "middle": "中央(M)",
        "tl": "左上(TL)",
        "tc": "上中心(TC)",
        "tr": "右上(TR)",
        "ml": "左中央(ML)",
        "mc": "中央(MC)",
        "mr": "右中央(MR)",
        "bl": "左下(BL)",
        "bc": "下中心(BC)",
        "br": "右下(BR)"
      },
      "dimensionKind": {
        "linear": "長さ寸法",
        "aligned": "平行寸法",
        "angular": "角度寸法",
        "radius": "半径寸法",
        "diameter": "直径寸法"
      }
    }
  }
}
