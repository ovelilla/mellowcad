---
title: "AutoCAD の ARRAY[配列複写]コマンド"
metaTitle: "AutoCAD 配列複写(ARRAY)の使い方と短縮コマンド AR"
description: "AutoCAD の配列複写(ARRAY、AR)の使い方をプロンプト順に解説します。矩形状、円形状、パス配列複写を、作成前にその場で編集できます。ブラウザで無料で試せます。"
figure: "正方形とその中の円を既定値で配列複写したところ。[Enter]で矩形状配列複写になり、4 列 3 行です。"
sourceHash: "5e0a412c9f13"
---

ARRAY[配列複写]コマンドは、選択したオブジェクトをパターン状に複写します。列と行に、中心の周りに、またはパスに沿って並べます。オブジェクトを尋ね、次に配列複写の種類を尋ねます([Enter]で矩形状)。選択セットは <Command id="ARRAYRECT" />、<Command id="ARRAYPOLAR" />、<Command id="ARRAYPATH" /> に渡され、オブジェクトを再び尋ねずに続行します。いずれもすぐに配列複写を表示し、オプションとグリップでその場で編集でき、[Enter]で作成します。1 つの配列複写オブジェクトになるか、自動調整しないと指定した場合は個別の複写になります。実行全体が 1 回の元に戻す操作になり、コマンド プロンプトで[Enter]を押すと ARRAY が繰り返されます。

## Options

### Rectangular

列と行、必要なら Z 方向に積み重ねたレベルに配置します。<Command id="ARRAYRECT" /> と同じです。最初は 4 列 3 行で、間隔は選択セットのサイズの 1.5 倍です。

### PAth

線分、円弧、円、ポリラインに沿って配置します。<Command id="ARRAYPATH" /> と同じです。パス曲線を尋ね、項目をパスに沿って並べ、パスの向きに合わせて各項目を回転します。

### POlar

中心点の周りに配置します。<Command id="ARRAYPOLAR" /> と同じです。中心を尋ね、最初は 360° に 6 個の項目を配置します。

## Missing

提示される種類は常に矩形状です。AutoCAD の既定値を決めるシステム変数 ARRAYTYPE は読み取りません。

## Questions

### AutoCAD の配列複写の短縮コマンドは?

`AR` と入力し、[Enter]または[Space]を押します。コマンド名を入力しても実行でき、AutoCAD のどの言語版でも `_ARRAY` が使えます。<Command id="ARRAYRECT" />、<Command id="ARRAYPOLAR" />、<Command id="ARRAYPATH" /> には短縮コマンドがなく、コマンド名を入力すると種類の質問が省略されます。

### 円形状に配列複写するには?

<Keyword id="POlar" /> を選ぶか <Command id="ARRAYPOLAR" /> を実行し、中心点を指定します。選択したオブジェクトがその周りに複写され、最初は 6 個です。数は <Keyword command="ARRAYPOLAR" id="Items" /> で変え、配置する角度は <Keyword command="ARRAYPOLAR" id="Fill angle" /> で設定します。

### 配列複写を分解するには?

選択して <Command id="EXPLODE" /> を実行します。配列複写が項目のオブジェクトに分かれ、各オブジェクトはそれぞれの画層に置かれます。最初から個別の複写にするには、[Enter]を押す前に <Keyword command="ARRAYRECT" id="ASsociative" /> に <Keyword command="ARRAYRECT" id="No" /> と答えます。

### 作成後に配列複写を変更するには?

配列複写を選択します。グリップで変更でき、基点の正方形のグリップで移動、矢印で数と間隔を設定します。数の矢印がホットの間に数値を入力すると、それが数になります。プロパティ パレットには列、行、間隔、または項目と角度が表示され、入力し直せます。ARRAYEDIT はまだありません。
