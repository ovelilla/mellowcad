---
title: "AutoCAD 3D 練習問題：プーリ"
metaTitle: "AutoCAD 3D 練習問題：回転でプーリを作る"
description: "AutoCAD 3D の機械系練習問題。プーリの半断面を閉じたポリラインで描き、Y 軸を中心に回転してソリッドにします。手順付きで、ブラウザで無料で練習できます。"
figure: "軸の横に描いたプーリの半断面。軸からの距離の寸法付き。"
model: "ソリッドとしてのプーリ。南東から見た、コンセプト表示スタイル。"
sourceHash: "f9c2a81b39fe"
---

次のプーリを、半断面を軸の周りに回転させてモデリングします(単位は mm)。直径 20 の軸穴、長さ 30、直径 40 のハブ、厚さ 10 のウェブ、幅 24 で直径 90 から 110 までのリムがあり、リムはハブの中央に位置します。断面は Y 軸に沿った軸からの距離で描くため、各直径はその半分の値で描きます。

## Steps

### 半断面を描く [#profile]

「外形線」画層で、閉じた <Command id="PLINE" />[ポリライン]を 1 本、`10,0` から描きます。以降の各点は直前の点からの距離で、`10,0`、`0,10`、`25,0`、`0,-7`、`10,0`、`0,24`、`-10,0`、`0,-7`、`-25,0`、`0,10`、`-10,0` と入力し、<Keyword command="PLINE" id="Close" /> を選びます。

### ビューを回転する [#view]

<Command id="-VIEW" /> コマンドの <Keyword command="VIEW" id="SEiso" /> で、南東の上方から見ます。<Command id="VSCURRENT" />[ビューポート表示スタイル]コマンドの <Keyword command="VSCURRENT" id="Conceptual" /> で面に陰影が付き、旋削部品の形が最もよくわかります。

### 回転する [#revolve]

<Command id="REVOLVE" />[回転ソリッド]コマンドで断面を選択し、[Enter]を押して、<Keyword command="REVOLVE" id="Y" /> を選びます。Y 軸がプーリの軸です。[Enter]で既定の角度(1 回転)を確定します。<Command id="ZOOM" />[ズーム]コマンドの <Keyword command="ZOOM" id="Extents" /> で全体を表示し、尺度 `0.8x` で周囲に余白を残します。
