---
title: "AutoCAD の PLAN[プラン ビュー]コマンド"
metaTitle: "AutoCAD 平面ビューに戻す：プラン ビュー(PLAN)の使い方"
description: "AutoCAD の PLAN[プラン ビュー]で、現在の UCS、保存した UCS、WCS を真上から見る方法を解説します。現在の UCS、UCS 選択、WCS と、平面図に戻る方法。ブラウザで無料で試せます。"
figure: "UCS を Z 軸まわりに 30° 回転し、南西から見た段付きブロック。PLAN と[Enter]でその UCS を真上から見ると、X 軸が右を向き、ブロックは回転して表示されます。"
sourceHash: "50d157803309"
---

PLAN[プラン ビュー]コマンドは、UCS の XY 平面を真上から、X 軸が右を向くように見ます。作図したとおりの平面ビューです。どの UCS(現在の UCS、保存した UCS、ワールド座標系)かを尋ね、[Enter]で現在の UCS を選びます。続いて図面全体を表示し、<Message id="regeneratingModel" /> と表示します。

図面内のものは何も移動せず、UCS もそのままです。PLAN はビューを回転するだけです。元に戻す 1 ステップなので、<Command id="U" /> でビューを戻せ、<Command id="ZOOM" /> の <Keyword command="ZOOM" id="Previous" /> で直前のビューに戻れます。<Command id="3DORBIT" /> やアイソメトリックの <Command id="VIEW" /> の後で平面図に戻る方法です。MellowCAD の 3D は 3D ソリッドだけで、まだ部分的な対応です。

## Options

### Current ucs

既定で、現在の UCS の平面ビューです。<Command id="UCS" /> で UCS を Z 軸まわりに 30° 回転した後は、UCS の X 軸が右を向くように、図面が時計回りに 30° 回転して表示されます。傾斜した面に UCS を設定した後は、その面を正面から見ます。

### Ucs

<Command id="UCS" /> の <Keyword command="UCS" id="NAmed" /> で保存した UCS の平面ビューで、名前を入力して指定します。保存されていない名前では、その UCS が見つからないと表示して再度尋ねます。<Keyword id="?" /> は UCS と同じく保存した UCS を一覧表示し、こちらも再度尋ねます。現在の UCS は変わりません。

### World

ワールド座標系の平面ビューです。現在の UCS がどうであっても、最初の状態(X が右、Y が上)で図面を表示し、UCS はそのままです。

## Missing

何も作図されていないとき、PLAN はズームをそのままにしますが、AutoCAD では図面範囲を表示します。

## Questions

### AutoCAD で平面ビューに戻すには?

`PLAN` と入力し、[Enter]を 2 回押します。2 回目の[Enter]で <Keyword id="Current ucs" /> が選ばれます。UCS が回転していて WCS の平面ビューにしたいときは、代わりに <Keyword id="World" /> を選びます。

### UCS に合わせた平面ビューにするコマンドは?

PLAN の <Keyword id="Current ucs" /> です。X 軸を右に向けて現在の UCS を真上から見ます。先に <Command id="UCS" /> で UCS を回転してから PLAN を実行して[Enter]を 2 回押すと、回転した平面にまっすぐな向きで作図できます。

### 平面ビューで図面が回転して表示されるのはなぜ?

回転した UCS の平面ビューになっているためです。PLAN を実行して <Keyword id="World" /> を選ぶと、ワールドの X 軸が右を向く表示に戻ります。<Command id="UCS" /> で[Enter]を押しても UCS がワールドに戻ります。

### PLAN で UCS は変わる?

いいえ。ビューを回転するだけで、UCS はそのままです。UCS も一緒に回転するのは、<Command id="VIEW" /> の正投影ビューです。
