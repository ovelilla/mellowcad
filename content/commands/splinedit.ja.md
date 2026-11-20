---
title: "AutoCAD の SPLINEDIT[スプライン編集]コマンド"
metaTitle: "AutoCAD スプライン編集(SPLINEDIT)の使い方と短縮コマンド SPE"
description: "AutoCAD の SPLINEDIT[スプライン編集](SPE)の手順を解説。閉じる、結合、フィット データ、頂点編集、ポリラインに変換、反転。ブラウザで無料で試せます。"
figure: "5 つのフィット点を通るスプラインを SPLINEDIT で閉じたところ。すべての点を通る滑らかなループになります。"
sourceHash: "bedcaab2fac3"
---

SPLINEDIT[スプライン編集]コマンドは、スプラインを編集します。`Select spline:` でスプラインを選択するか、コマンドの前に選択しておきます。スプラインをダブルクリックしても、そのスプラインで SPLINEDIT が実行されます。それ以外のものは <Message id="objectNotSpline" /> と表示されて再び尋ねられます。PEDIT のスプラインでフィットしたポリラインは、何も表示されずに同じ曲線のスプラインに変換されます。その後、<Keyword id="eXit" /> または[Enter]を押すまでオプションを繰り返し尋ね、各オプションはすぐに適用されます。スプラインにはフィット点のグリップが表示され、頂点を編集する間は制御点とそのフレームが表示されます。編集全体が 1 回の操作で、<Command id="U" /> で元に戻せます。どのプロンプトでも `'ZOOM` を入力して使えます。

## Options

### Close

スプラインを滑らかに閉じます。フィット スプラインはフィット点を通り、制御点スプラインは制御点に沿って閉じます。閉じたスプラインではこのオプションが <Keyword id="Open" /> になり、結合は表示されません。

### Join

スプラインの端点に接する開いた曲線を、JOIN のスプラインの規則に従って結合し、結合した数を表示します。

### Fit data

スプラインが通る点を編集します。フィット点を持たない制御点スプラインには、まず曲線上にフィット点が与えられます。オプションは次のとおりです。<Keyword id="Add" /> はフィット点を選択し、その後に新しい点を繰り返し追加します(開いたスプラインの最初の点では <Keyword id="After" /> か <Keyword id="Before" /> を選びます)。<Keyword id="Delete" /> はフィット点を削除します。最少 2 点、閉じたスプラインでは 3 点までです(<Message id="cannotDeleteBeyond" />)。<Keyword id="Move" /> は <Keyword id="Next" /> と <Keyword id="Previous" />、または <Keyword id="Select point" /> でフィット点を順にたどり、現在の点を指定した点に移動します。<Keyword id="Purge" /> はフィット データを破棄し、制御点スプラインにします。<Keyword id="Tangents" /> は始点と終点の方向を設定するか、<Keyword id="System default" /> にします。<Keyword id="Close" /> と <Keyword id="eXit" /> は最初のプロンプトと同じです。フィット点でない位置を選択すると <Message id="notAFitPoint" /> と表示されます。

### Edit vertex

制御点を編集します。フィット スプラインは最初の編集でフィット データを失います。<Keyword id="Add" /> はスプライン上で選択した点に制御点を追加します。<Keyword id="Delete" /> は制御点を削除します。最少 2 点、閉じたスプラインでは 3 点までです。<Keyword id="Elevate order" /> は次数を 26 まで上げます。下げることはできません。<Keyword id="Move" /> は、フィット データの移動と同様に点をたどって制御点を移動します。<Keyword id="Weight" /> は <Message id="splineMadeRational" /> と表示した後、制御点の重みを設定し、曲線をその点に近づけたり遠ざけたりします。制御点でない位置を選択すると <Message id="notAControlVertex" /> と表示されます。

### convert to Polyline

0 から 99 までの精度(既定は 10)を尋ね、スプラインを直線セグメントのポリラインに置き換えます。精度が高いほどセグメントが多くなります。スプラインが XY 平面に平行な平面上にない場合は 3D ポリラインになります。コマンドは終了します。精度はセッション中保持され、PEDIT の変換でも使われます。

### Reverse

スプラインの向きを反転し、最初の点を最後にします。<Message id="splineReversed" /> と表示されます。

### Undo

最後のオプションを元に戻します。フィット データや頂点編集は全体が一度に戻ります。戻すものがなくなると、<Message id="commandCompletelyUndone" /> と表示されます。

### eXit

[Enter]と同様に、コマンドを終了します。

## Missing

フィット点や制御点に鋭い角を作るキンク、許容差内でスプラインを再フィットする toLerance、閉じたスプラインの接線方向はありません。ポリラインに変換では、フィット スプラインから AutoCAD よりはるかに多くの頂点が作られ、円弧は作られず、スプラインは常に置き換えられます。`Select spline:` でのグループ選択はできません。点を順にたどる間、AutoCAD が現在の点に描く `+` もありません。

## Questions

### AutoCAD の SPLINEDIT の短縮コマンドは?

`SPE` と入力し、[Enter]または[Space]を押します。コマンド名を入力しても実行でき、AutoCAD のどの言語版でも `_SPLINEDIT` が使えます。スプラインをダブルクリックしても実行されます。

### スプラインをポリラインに変換するには?

SPLINEDIT を実行してスプラインを選択し、<Keyword id="convert to Polyline" /> を選びます。精度 10 で滑らかなポリラインになります。スプラインに <Command id="PEDIT" /> を使っても、変換するかどうかを尋ねられます。

### スプラインの点を追加・移動するには?

スプラインが通る点を編集するには、<Keyword id="Fit data" /> を選んでから <Keyword id="Add" /> または <Keyword id="Move" /> を選びます。スプラインの形を決める制御点を編集するには、<Keyword id="Edit vertex" /> を選びます。

### スプラインを閉じるには?

<Keyword id="Close" /> を選びます。つなぎ目に角を作らずに滑らかに閉じます。<Keyword id="Open" /> で再び開きます。

### 2 つのスプラインを結合するには?

<Keyword id="Join" /> を選び、端点がこのスプラインの端点に接するスプラインを選択します。<Command id="JOIN" /> を使うこともできます。
