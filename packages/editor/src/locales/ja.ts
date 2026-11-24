// Generated from ja.json by `npm run locales`. Do not edit.
import type { EditorLocale } from "./types"

export const ja: EditorLocale = {
  "tag": "ja",
  "messages": {
    "Workspace": {
      "canvas": "作図領域"
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
      "menu": "アプリケーション メニュー",
      "new": "新規作成",
      "open": "開く",
      "save": "上書き保存",
      "saveAs": "名前を付けて保存",
      "units": "単位管理…",
      "language": "言語",
      "feedback": "フィードバックを送信",
      "saving": "保存中…",
      "saved": "保存済み",
      "savedHint": "このデバイスに保存済み",
      "undo": "元に戻す",
      "redo": "やり直し",
      "commandLine": "コマンド ライン",
      "layer": "画層",
      "color": "オブジェクトの色",
      "lineweight": "線の太さ",
      "linetype": "線種"
    },
    "NavigationBar": {
      "label": "ナビゲーション バー",
      "zoom": "ズーム",
      "extents": "オブジェクト範囲ズーム",
      "window": "窓ズーム",
      "previous": "前画面ズーム",
      "in": "拡大ズーム",
      "out": "縮小ズーム"
    },
    "Viewport": {
      "view": [
        "ビュー コントロール: ",
        [
          "name"
        ]
      ]
    },
    "ViewCube": {
      "label": "ViewCube",
      "home": "ホーム",
      "parallel": "平行投影ビュー",
      "setHome": "現在のビューをホーム ビューに設定",
      "rollClockwise": "時計回りに回転",
      "rollCounterclockwise": "反時計回りに回転",
      "wcs": "WCS",
      "unnamed": "名前なし",
      "newUcs": "UCS を新規作成",
      "adjacent": {
        "up": "上の面を表示",
        "down": "下の面を表示",
        "left": "左の面を表示",
        "right": "右の面を表示"
      }
    },
    "ToolRail": {
      "flyouts": {
        "circle": "円",
        "arc": "円弧",
        "ellipse": "楕円",
        "spline": "スプライン",
        "rectangle": "長方形",
        "trim": "トリム",
        "fillet": "フィレット",
        "filletedge": "フィレット エッジ",
        "solideditextrude": "面を押し出し",
        "break": "部分削除",
        "pedit": "ポリライン編集",
        "array": "配列複写",
        "text": "文字",
        "dimension": "寸法記入",
        "dimchain": "直列寸法記入",
        "attributes": "属性",
        "measure": "計測",
        "union": "ソリッド編集",
        "box": "モデリング",
        "extrude": "押し出し",
        "point": "点"
      },
      "sections": {
        "draw": "作成",
        "modify": "修正",
        "annotation": "注釈",
        "block": "ブロック",
        "utilities": "ユーティリティ"
      }
    },
    "CommandLine": {
      "label": "コマンド ライン",
      "placeholder": "ここにコマンドを入力(LINE、TR、CO…)",
      "history": "コマンド ヒストリ"
    },
    "DynamicInput": {
      "locked": "ロック"
    },
    "StatusBar": {
      "coordinates": "座標",
      "model": "モデル",
      "modelSpace": "モデル空間",
      "grid": "グリッド",
      "objectSnap": "オブジェクト スナップ",
      "objectSnapSettings": "オブジェクト スナップ設定",
      "snapMode": "スナップ モード",
      "snapSettings": "スナップ設定",
      "snap": "スナップ",
      "gridSnap": "グリッド スナップ",
      "polarSnap": "PolarSnap",
      "snapX": "スナップ X",
      "snapXSpacing": "スナップ X 間隔",
      "snapY": "スナップ Y",
      "snapYSpacing": "スナップ Y 間隔",
      "polarDistance": "極間隔",
      "polarSnapDistance": "極スナップ間隔",
      "ortho": "直交モード",
      "polarTracking": "極トラッキング",
      "polarTrackingAngle": "極トラッキング角度",
      "polarAngle": "極角度",
      "objectSnapTracking": "オブジェクト スナップ トラッキング",
      "selectionCycling": "選択の循環",
      "selectionCyclingSettings": "選択の循環の設定",
      "selectionList": "選択循環リスト ボックスを表示",
      "showLineweight": "線の太さを表示",
      "units": "単位",
      "cleanScreen": "フル スクリーン表示",
      "customization": "カスタマイズ"
    },
    "Units": {
      "title": "単位管理",
      "length": "長さ",
      "type": "タイプ",
      "precision": "精度",
      "decimal": "十進表記",
      "insertionScale": "挿入尺度",
      "insertedContent": "挿入されるコンテンツの尺度単位:",
      "millimeters": "ミリメートル",
      "centimeters": "センチメートル",
      "meters": "メートル",
      "sampleOutput": "サンプル出力",
      "ok": "OK",
      "cancel": "キャンセル"
    },
    "SaveAs": {
      "title": "図面に名前を付けて保存",
      "fileName": "ファイル名:",
      "fileType": "ファイルの種類:",
      "tools": "ツール",
      "options": "オプション…",
      "save": "保存",
      "cancel": "キャンセル",
      "drawing": "MellowCAD 図面 (*.ecad.json)",
      "dxf2018": "AutoCAD 2018 DXF (*.dxf)",
      "dxf2013": "AutoCAD 2013/LT2013 DXF (*.dxf)",
      "dxf2010": "AutoCAD 2010/LT2010 DXF (*.dxf)",
      "dxf2007": "AutoCAD 2007/LT2007 DXF (*.dxf)",
      "dxf2004": "AutoCAD 2004/LT2004 DXF (*.dxf)",
      "dxf2000": "AutoCAD 2000/LT2000 DXF (*.dxf)",
      "dxfR12": "AutoCAD R12/LT2 DXF (*.dxf)",
      "optionsTitle": "名前を付けて保存オプション",
      "dxfOptions": "DXF オプション",
      "format": "形式",
      "ascii": "ASCII",
      "binary": "バイナリ",
      "selectObjects": "オブジェクトを選択",
      "preview": "サムネイル プレビュー イメージを保存",
      "precision": "精度を入力(0 から 16)",
      "ok": "OK"
    },
    "SnapOverride": {
      "from": "基点設定",
      "pointFilters": "XYZ フィルタ",
      "none": "なし"
    },
    "SelectionCycling": {
      "title": "選択",
      "none": "なし"
    },
    "ShortcutMenu": {
      "label": "ショートカット メニュー",
      "repeat": [
        "繰り返し ",
        [
          "command"
        ]
      ],
      "clipboard": "クリップボード",
      "copyBase": "基点コピー",
      "paste": "貼り付け",
      "undo": "元に戻す",
      "redo": "やり直し",
      "copySelection": "複写",
      "deselectAll": "すべてを選択解除",
      "properties": "オブジェクト プロパティ管理",
      "enter": "Enter",
      "cancel": "キャンセル",
      "snapOverrides": "優先オブジェクト スナップ",
      "dimensionStyle": "寸法スタイル管理"
    },
    "Layers": {
      "title": "画層",
      "new": "画層を新規作成",
      "setCurrentLabel": [
        [
          "name"
        ],
        " を現在の画層に設定"
      ],
      "current": "現在の画層",
      "setCurrent": "現在に設定",
      "colorLabel": [
        [
          "name"
        ],
        " の色"
      ],
      "color": "画層の色",
      "linetypeLabel": [
        [
          "name"
        ],
        " の線種"
      ],
      "lineweightLabel": [
        [
          "name"
        ],
        " の線の太さ"
      ],
      "on": "表示",
      "off": "非表示",
      "unlocked": "ロック解除",
      "locked": "ロック",
      "deleteLabel": [
        "画層 ",
        [
          "name"
        ],
        " を削除"
      ],
      "delete": "画層を削除",
      "rename": "選択した画層の名前をもう一度クリックすると名前を変更できます",
      "renameLabel": [
        "画層 ",
        [
          "name"
        ],
        " の名前を変更"
      ],
      "list": "画層の一覧",
      "nextColumns": "次の列",
      "previousColumns": "前の列",
      "dialog": {
        "close": "閉じる",
        "notDeleted": {
          "title": "画層 - 削除できません",
          "instruction": "選択した画層は削除されませんでした。",
          "content": "次の画層は削除できません:",
          "base": "画層 0 および Defpoints",
          "current": "現在の画層",
          "inUse": "オブジェクトを含む画層",
          "xref": "外部参照の従属画層"
        },
        "currentOff": {
          "title": "画層 - 現在の画層が非表示",
          "instruction": "現在の画層が非表示になってしまいます。どのようにしますか?",
          "turnOff": "現在の画層を非表示にする",
          "turnOffNote": "画層が再び「表示」に設定されるまで、これ以降に作成されるオブジェクトは、図面に表示されなくなります。",
          "keepOn": "現在の画層を表示のままにする"
        },
        "nameInUse": {
          "title": "画層 - 名前が既に存在します",
          "instruction": [
            "名前 ",
            [
              "name"
            ],
            " は使用中です。"
          ],
          "content": "異なる名前を入力してください。"
        },
        "invalidName": {
          "title": "画層",
          "instruction": "画層名に無効な文字があります。",
          "content": "画層名に次の文字は使用できません:"
        },
        "cannotRename": {
          "title": "画層 - 名前変更",
          "instruction": "選択した画層は名前変更できません。",
          "content": "次の画層は名前変更できません:",
          "base": "画層 0",
          "xref": "外部参照の従属画層"
        }
      },
      "columns": {
        "status": "状態",
        "name": "名前",
        "on": "表示",
        "lock": "ロック",
        "color": "色",
        "linetype": "線種",
        "lineweight": "線の太さ",
        "objects": "オブジェクト"
      }
    },
    "Styles": {
      "title": "スタイル",
      "dimension": "寸法",
      "text": "文字",
      "current": [
        "現在: ",
        [
          "value",
          [
            "name"
          ]
        ]
      ],
      "new": "新規作成",
      "setCurrent": [
        [
          "name"
        ],
        " を現在に設定"
      ],
      "rename": [
        [
          "name"
        ],
        " の名前を変更"
      ],
      "delete": [
        [
          "name"
        ],
        " を削除"
      ],
      "lines": "寸法線",
      "baselineSpacing": "並列寸法の寸法線間隔",
      "extendBeyond": "補助線延長長さ",
      "offsetFromOrigin": "起点からのオフセット",
      "symbolsAndArrows": "シンボルと矢印",
      "arrowSize": "矢印のサイズ",
      "centerMark": "中心マークのサイズ",
      "textGroup": "寸法値",
      "textHeight": "文字の高さ",
      "offsetFromDimLine": "寸法線からのオフセット",
      "fit": "フィット",
      "overallScale": "全体の尺度",
      "drawDimLineBetween": "寸法線を寸法補助線の内側に記入",
      "primaryUnits": "基本単位",
      "precision": "精度",
      "angularPrecision": "角度の精度",
      "decimalSeparator": "十進数の区切り",
      "comma": "',' (カンマ)",
      "period": "'.' (ピリオド)",
      "space": "' ' (スペース)",
      "suppressTrailingZeros": "末尾の 0 を省略",
      "yes": "はい",
      "no": "いいえ",
      "size": "サイズ",
      "height": "高さ",
      "heightHint": "高さを 0 にすると固定されず、TEXT で毎回高さを指定します。"
    },
    "Blocks": {
      "title": "ブロック",
      "filter": "フィルタ(? と * を使用可能)",
      "filterLabel": "ブロックをフィルタ",
      "empty": "ブロックが定義されていません。何か作図して BLOCK を実行してください。",
      "noMatch": "フィルタに一致するブロックはありません。",
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
              "図面内に ",
              0,
              " 個"
            ]
          }
        ]
      ]
    },
    "Properties": {
      "noSelection": "何も選択されていません",
      "general": "一般",
      "color": "色",
      "colorLabel": "選択したオブジェクトの色",
      "layer": "画層",
      "layerLabel": "選択したオブジェクトの画層",
      "linetype": "線種",
      "linetypeLabel": "選択したオブジェクトの線種",
      "lineweight": "線の太さ",
      "lineweightLabel": "選択したオブジェクトの線の太さ",
      "textStyle": "文字スタイル",
      "textStyleLabel": "選択したオブジェクトの文字スタイル",
      "dimStyle": "寸法スタイル",
      "dimStyleLabel": "選択したオブジェクトの寸法スタイル",
      "varies": "*各種*",
      "customColor": "カスタム色",
      "title": "プロパティ",
      "objectType": "オブジェクト タイプ",
      "currentLayerLabel": "現在の画層",
      "currentColorLabel": "現在の色",
      "currentLinetypeLabel": "現在の線種",
      "currentLineweightLabel": "現在の線の太さ",
      "lockedObjects": {
        "title": "プロパティ - ロックされたオブジェクト",
        "instruction": "選択した 1 つまたは複数のオブジェクトがロックされているため、更新できません。",
        "content": [
          "選択セットから削除されたオブジェクトの数: ",
          [
            "count",
            4
          ]
        ],
        "close": "閉じる"
      }
    },
    "MText": {
      "unsavedChanges": {
        "title": "マルチ テキスト - 変更が保存されていません",
        "instruction": "文字の変更を保存しますか?",
        "yes": "はい",
        "no": "いいえ",
        "cancel": "キャンセル"
      }
    },
    "Palette": {
      "label": "パレット",
      "fold": "パレットを折りたたむ",
      "unfold": "パレットを表示",
      "resize": "パレットの幅"
    },
    "PointStyle": {
      "title": "点スタイル管理",
      "figures": "点の表示イメージ",
      "pointSize": "点サイズ:",
      "relative": "スクリーンに対する相対サイズ",
      "absolute": "絶対単位のサイズ",
      "percent": "%",
      "units": "単位",
      "invalid": "無効な入力です。",
      "ok": "OK",
      "cancel": "キャンセル"
    }
  }
}
