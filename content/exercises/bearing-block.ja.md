---
title: "AutoCAD 3D 練習問題：軸受ブロック"
metaTitle: "AutoCAD 3D 練習問題(上級)：軸受ブロック"
description: "AutoCAD 3D の機械系練習問題。軸受ブロックを押し出しと和で作成し、軸穴と 2 つのボルト穴を円柱の差で抜きます。手順付きで、ブラウザで無料で練習できます。"
figure: "軸受ブロックの平面図。100 × 60、ボス、軸穴、ボルト穴の寸法付き。"
model: "ソリッドとしての軸受ブロック。南東から見た、コンセプト表示スタイル。"
sourceHash: "5579d6bd5a86"
---

次の軸受ブロックをモデリングします(単位は mm)。ベースは 100 × 60、厚さ 12 で、角の半径は 10 です。中央に直径 40、高さ 40 のボスが立ちます。ボスを貫通する直径 20 の軸穴と、ベースを貫通する直径 10 のボルト穴が 2 つ(間隔 76)あります。ベースとボスは外形から押し出して 1 つのソリッドに結合し、軸穴とボルト穴は円柱を作成してそこから差し引きます。

## Steps

### 平面図を描く [#plan]

「外形線」画層で、<Command id="RECTANG" />[長方形]コマンドを <Keyword command="RECTANG" id="Fillet" /> `10` で使い、`0,0` から `100,60` まで描きます。次に、その中心 `50,30` に、<Keyword command="CIRCLE" id="Diameter" /> `40` の円を描きます。

### ベースとボスを押し出す [#extrude]

<Command id="EXTRUDE" />[押し出し]コマンドで、外形を高さ `12`、円を高さ `40` に押し出します。2 つのソリッドになります。

### 結合する [#union]

<Command id="UNION" />[和]コマンドで両方を選択し、[Enter]を押します。1 つのソリッドになります。

### 円柱を描く [#holes]

<Command id="CYLINDER" />[円柱]コマンドで、軸穴とボルト穴 1 つを円柱として描きます。軸穴は `50,30` に <Keyword command="CYLINDER" id="Diameter" /> `20`、高さ `40` で、ボルト穴は `12,30` に直径 `10`、高さ `12` で描きます。次に <Command id="COPY" />[複写]コマンドで、ボルト穴を `12,30` から `76,0` 先へ複写します。

### 差し引く [#subtract]

<Command id="SUBTRACT" />[差]コマンドでブロックを選択し、[Enter]を押します。次に 3 つの円柱を選択し、[Enter]を押します。軸穴とボルト穴が貫通します。

### ビューを回転する [#view]

<Command id="-VIEW" /> コマンドの <Keyword command="VIEW" id="SEiso" />、<Command id="VSCURRENT" />[ビューポート表示スタイル]コマンドの <Keyword command="VSCURRENT" id="Conceptual" /> を選び、<Command id="ZOOM" />[ズーム]コマンドの <Keyword command="ZOOM" id="Extents" /> と `0.8x` でソリッドを画面に収めます。
