---
title: "AutoCAD の REDO[やり直し]コマンド"
metaTitle: "AutoCAD やり直し：REDO と Ctrl+Y、MREDO"
description: "AutoCAD の REDO[やり直し]の使い方を解説します。直前の U や UNDO で元に戻した操作をその直後に復元します。MREDO と[Ctrl]+[Y]は 1 ステップずつやり直します。"
figure: "プレートに作図した穴を U で元に戻し、REDO で復元します。"
sourceHash: "be2e44b98ac0"
---

REDO[やり直し]コマンドは、直前の <Command id="U" /> または <Command id="UNDO" /> を取り消します。元に戻したものがすべて再び作図されるため、5 つのコマンドを UNDO で戻した後に REDO を実行すると、5 つとも復元されます。その際にコマンド名を表示し、やり直すものがなくなると <Message id="everythingRedone" /> と表示します。何も尋ねず、オプションもありません。

元に戻した直後にだけ使えます。それ以外では <Message id="redoMustFollowUndo" /> と表示し、ほかのコマンドを実行した後は、LIST や ZOOM のように何も変更しないコマンドでも <Message id="nothingToRedo" /> と表示します。UNDO のコントロールの[なし]で元に戻すがオフになっているときは、REDO は無効だと表示します。

<Command id="MREDO" /> は 1 ステップずつやり直します。操作の数、または <Keyword command="MREDO" id="All" /> か <Keyword command="MREDO" id="Last" /> を尋ね、その後に実行された U、UNDO、REDO にかかわらず、元に戻したステップをその数だけやり直します。最後は直前の元に戻す全体を 1 回だけやり直します(<Message id="alreadyRedone" />)。[Ctrl]+[Y]とショートカット メニューの[やり直し]は、実行中のコマンドをキャンセルして MREDO を 1 で実行します。

## Missing

[Ctrl]+[Shift]+[Z]でも何も表示せずにやり直しますが、AutoCAD ではこのキーに何も割り当てられていません。上部バーの[元に戻す]と[やり直し]のボタンは履歴に何も書き込みませんが、AutoCAD のクイック アクセス ツールバーは独自の内容を書き込みます。

## Questions

### AutoCAD のやり直しのショートカット キーは?

[Ctrl]+[Y]で、1 ステップやり直します(MREDO 1)。REDO 自体には短縮コマンドがありません。`REDO` と入力するか、AutoCAD のどの言語版でも `_REDO` と入力します。

### REDO が使えないのはなぜ?

REDO が取り消せるのは、直前の U か UNDO だけです。ほかのコマンドを実行した後は、そのコマンドが何も変更していなくても、やり直すものはありません。元に戻したら、すぐにやり直してください。

### REDO と MREDO の違いは?

REDO は直前の元に戻す全体を、その直後にだけ復元します。<Command id="MREDO" /> は元に戻したステップを指定した数だけ 1 つずつ、またはすべてやり直し、REDO の後でも使えます。

### AutoCAD で直前のコマンドを繰り返すには?

コマンド プロンプトで[Enter]または[Space]を押すと、直前のコマンドが再び始まります。REDO はコマンドを繰り返すのではなく、元に戻した操作を取り消します。
