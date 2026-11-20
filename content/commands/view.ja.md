---
title: "AutoCAD の VIEW[ビュー管理]コマンド"
metaTitle: "AutoCAD ビュー管理(VIEW)でアイソメと平面図"
description: "AutoCAD の VIEW[ビュー管理](V、-VIEW)で 6 つの直交投影ビューと 4 つのアイソメ ビューに切り替える方法と、直交投影ビューが設定する UCS を解説。オンラインで無料で試せます。"
figure: "平面図で描いた段付きブロック。-VIEW で南西アイソメを選ぶと、南西の上方から、隠線処理表示スタイルで見えます。"
sourceHash: "261c8657f5f7"
---

VIEW[ビュー管理]コマンドは、AutoCAD の 10 種類のプリセット ビューのいずれかにビューを切り替えます。モデルの 1 つの側面を正面から見る 6 つの直交投影ビューと、角から見下ろす 4 つのアイソメ ビューです。図面の中のものは何も動きません。VIEW はコマンド ライン版の <Command id="-VIEW" /> を実行します。最初のプロンプトには <Keyword id="Orthographic" /> が表示され、それを選ぶと側面を尋ねます。AutoCAD のメニューが応答するように、ビューの名前を直接入力することもできます。<Command id="-VIEW" /> の後に <Keyword id="SWiso" /> と入力します。各ビューは図面全体を画面に収め、<Message id="regeneratingModel" /> と表示します。

作図領域の左上のビュー コントロールにも同じ 10 種類のビューが並び、<Command id="-VIEW" /> を実行します。ViewCube の面と角でも同じビューに切り替えられますが、UCS はそのまま保たれます。VIEW の各実行は 1 回の操作なので、<Command id="U" /> でビューを、設定された UCS とともに元に戻せます。別のコマンドの実行中にアポストロフィを付けて入力すると、<Message id="requiresRegen" /> と表示して受け付けません。MellowCAD の 3D はソリッドのみで、まだ部分的な対応です。

## Options

### Orthographic

見る側面を尋ねます。既定は <Keyword id="Top" /> なので、そこで[Enter]を押すと平面図になります。<Keyword id="Top" />、<Keyword id="Bottom" />、<Keyword id="Front" />、<Keyword id="BAck" />、<Keyword id="Left" />、<Keyword id="Right" /> のいずれかです。どれも正立していて、上面は X が右、Y が上、正面は X が右、Z が上、下から見る下面は X が左になります。各側面は、このオプションを選ばずに最初のプロンプトで入力しても使えます。

各側面は、<Command id="UCS" /> の直交オプションと同様に、それまでの UCS にかかわらずワールドの軸を基準に、原点を `0,0,0` として UCS をこちらに向けます。正面の後は XY 平面が正面になるため、作図したものは画面に対して平らに置かれ、UCS の名前は `*FRONT*` になります。上面の後はワールドの軸になり、名前は `*TOP*` です。

### SWiso

南西アイソメです。手前左の角から見下ろし、正面、左側面、上面が見えます。UCS はそのまま保たれます。このセッションのビューです。

### SEiso

南東アイソメです。手前右の角から見下ろし、正面、右側面、上面が見えます。UCS はそのまま保たれます。

### NEiso

北東アイソメです。奥右の角から見下ろし、背面、右側面、上面が見えます。UCS はそのまま保たれます。

### NWiso

北西アイソメです。奥左の角から見下ろし、背面、左側面、上面が見えます。UCS はそのまま保たれます。

## Missing

名前の付いたビューはありません。最初のプロンプトに表示されるオプションは <Keyword id="Orthographic" /> だけで、AutoCAD では `?`、Delete、Restore、Save、sEttings、Window も表示されます。そこで名前を入力しても受け付けられません。AutoCAD で VIEW が開く[ビュー管理]ダイアログもありません。何も描かれていない場合、AutoCAD は図面範囲を画面に収めますが、ここではズームが保たれます。システム変数の UCSORTHO と UCSBASE もなく、直交投影ビューは常にワールドの軸を基準に UCS を位置合わせします。位置合わせした UCS は、<Command id="UCS" /> の <Keyword command="UCS" id="Previous" /> の一覧に入りません。

## Questions

### AutoCAD でアイソメ ビューにするには?

<Command id="-VIEW" /> と入力し、<Keyword id="SWiso" /> で南西アイソメにします。<Keyword id="SEiso" />、<Keyword id="NEiso" />、<Keyword id="NWiso" /> でほかの 3 つの角から見られます。左上のビュー コントロールで[南西アイソメ]を選ぶか、ViewCube の上の角をクリックしても切り替えられます。<Command id="VSCURRENT" /> で <Keyword command="VSCURRENT" id="Hidden" /> を選ぶと、奥のエッジが隠れます。

### AutoCAD で平面図(上面)にするコマンドは?

<Command id="-VIEW" /> の後に <Keyword id="Top" /> を入力します。UCS もワールドの軸に設定されます。<Command id="PLAN" /> は代わりに現在の UCS を真上から見て、UCS はそのまま保ちます。

### 正面のビューにした後で UCS が変わったのはなぜ?

直交投影ビューは、作図したものが画面上に置かれるように UCS をこちらに向けます。<Command id="UCS" /> で[Enter]を押すとワールドに戻ります。<Command id="U" /> では、ビューと UCS を一緒に元に戻せます。

### アイソメ ビューと等角図は同じですか?

違います。アイソメ ビューは 3D モデルを角から見るものです。等角図は 2D で、SNAP の等角図スタイルを使って等角図の平面上に描きますが、MellowCAD にはまだありません。

### [ビュー管理]ダイアログはどこにありますか?

VIEW はコマンド ラインで <Command id="-VIEW" /> を実行します。[ビュー管理]ダイアログはなく、名前の付いたビュー(登録、呼び出し)もまだありません。
