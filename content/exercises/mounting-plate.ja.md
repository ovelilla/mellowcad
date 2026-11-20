---
title: "AutoCAD 3D 練習問題：取付プレート"
metaTitle: "AutoCAD 3D 練習問題 初心者向け：取付プレート"
description: "AutoCAD 3D の初心者向け練習問題。リージョンを作成して穴を差し引き、1 回の押し出しで取付プレートのソリッドにします。手順付きで、ブラウザで無料で練習できます。"
figure: "100 × 60 で穴が 4 つあるプレートの外形、寸法付き。"
model: "厚さ 10 のソリッドとしてのプレート。南東から見た、隠線処理の表示。"
sourceHash: "87b8f906b0fd"
---

厚さ 10 の取付プレートをモデリングします(単位は mm)。外形は 100 × 60 で角の半径は 8、縁から 15 の位置を中心とする直径 10 の穴が 4 つあります。最初は平面で作図します。外形と円をリージョンにし、平面のうちに穴を差し引いてから、1 回の押し出しで穴付きのソリッドにします。

## Steps

### プロファイルを描く [#profile]

「外形線」画層で、<Command id="RECTANG" />[長方形]コマンドを <Keyword command="RECTANG" id="Fillet" /> `8` で使い、`0,0` から `100,60` まで描きます。次に `15,15` に <Keyword command="CIRCLE" id="Diameter" /> `10` の円を描き、<Command id="COPY" />[複写]コマンドでその中心から、それぞれ `70,0`、`70,30`、`0,30` 先へ複写します。

### リージョンを作成する [#region]

<Command id="REGION" />[リージョン]コマンドは、閉じたオブジェクトをリージョンに変換します。外形と 4 つの円を選択し、[Enter]を押します。5 つのループから 5 つのリージョンができます。

### 穴を差し引く [#subtract]

<Command id="SUBTRACT" />[差]コマンドでプレートのリージョンを選択し、[Enter]を押します。次に 4 つの円のリージョンを選択し、[Enter]を押します。穴が 4 つあいた 1 つのリージョンが残ります。

### ビューを回転する [#view]

<Command id="-VIEW" /> コマンドの <Keyword command="VIEW" id="SEiso" /> で、南東の上方から見ます。<Command id="VSCURRENT" />[ビューポート表示スタイル]コマンドの <Keyword command="VSCURRENT" id="Hidden" /> で、面に隠れる部分を非表示にします。ViewCube をクリックしてもビューを回転できます。

### 押し出す [#extrude]

<Command id="EXTRUDE" />[押し出し]コマンドでリージョンを選択し、[Enter]を押して高さ `10` を入力します。プレートは穴も含めてソリッドになります。<Command id="ZOOM" />[ズーム]コマンドの <Keyword command="ZOOM" id="Extents" /> で全体を表示し、尺度 `0.8x` で周囲に余白を残します。
