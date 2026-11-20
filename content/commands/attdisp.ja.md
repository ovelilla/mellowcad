---
title: "AutoCAD の ATTDISP[属性表示]コマンド"
metaTitle: "AutoCAD 属性表示(ATTDISP)で属性を表示・非表示"
description: "AutoCAD でブロックの属性を表示・非表示にする ATTDISP の使い方を解説します。Normal、非表示属性も表示する ON、すべて隠す OFF。設定は図面に保存されます。ブラウザで無料で試せます。"
figure: "部品番号が非表示属性になっている 2 つの机。ATTDISP ON で、表示されている番号の横、各机の下に部品番号が表示されます。"
sourceHash: "8821fdeb2077"
---

ATTDISP[属性表示]コマンドは、図面内のブロック参照にどの属性を表示するかを設定します。現在の設定(新しい図面では Normal)を提示して設定を尋ねます。それ以外の語を入力するとキーワードが無効である旨が表示されてもう一度尋ねられ、[Enter]で現在の設定のままになります。設定を変えると図面全体が再作図され(AutoCAD 2027 と同じく `Regenerating model.` と表示されます)、ATTMODE として図面に保存されます。この変更は <Command id="U" /> で取り消せる 1 ステップです。コマンドの実行中にアポストロフィを付けて入力すると、そのコマンドの中でも実行できます。

変わるのは表示だけです。非表示の属性も値は保持され、隠れている属性も <Command id="ATTEDIT" /> または <Command id="EATTEDIT" /> で編集できます。

## Options

### Normal

各属性を定義どおりに表示します。表示属性は表示され、<Command id="ATTDEF" /> の <Keyword command="ATTDEF" id="Invisible" /> で定義した属性は表示されません。

### ON

非表示の属性も含め、すべての属性を表示します。

### OFF

表示属性も含め、すべての属性を非表示にします。

## Questions

### AutoCAD で非表示の属性を表示するには?

`ATTDISP` を入力し、<Keyword id="ON" /> を選びます。非表示の属性も含め、すべての属性が表示されます。<Keyword id="Normal" /> で再び非表示になります。

### ブロックの属性が表示されないのはなぜ?

<Command id="ATTDISP" /> が <Keyword id="OFF" /> になっていてすべての属性が隠れているか、<Keyword id="Normal" /> で属性が非表示として定義されている可能性があります。<Keyword id="ON" /> を選ぶとすべて表示されます。属性を持たないブロックの参照には、設定に関係なく何も表示されません。

### AutoCAD で属性の値を非表示にするには?

非表示として定義します。ブロックを作成する前に、<Command id="ATTDEF" /> の <Keyword command="ATTDEF" id="Invisible" /> モードを使います。ATTDISP の <Keyword id="OFF" /> では、図面全体のすべての属性が一度に隠れます。
