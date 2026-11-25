---
title: "AutoCAD REDO(명령 복구) 명령"
metaTitle: "오토캐드 명령 복구(REDO)와 Ctrl+Y, MREDO"
description: "AutoCAD REDO(명령 복구, 캐드 리두)는 직전의 U나 UNDO가 되돌린 것을 바로 다시 복구합니다. MREDO와 Ctrl+Y는 한 단계씩 복구합니다. 브라우저에서 무료로 해 볼 수 있습니다."
figure: "판에 그린 구멍을 U로 되돌리고 REDO로 다시 복구합니다."
sourceHash: "6017450979c2"
---

REDO(명령 복구) 명령은 직전의 <Command id="U" />나 <Command id="UNDO" />를 반대로 되돌립니다. 그 명령이 되돌린 것이 모두 다시 그려지므로, 명령 다섯 개를 UNDO로 되돌린 뒤에는 REDO가 다섯 개를 모두 복구합니다. 복구하면서 명령 이름을 쓰고, 더 복구할 것이 없으면 <Message id="everythingRedone" />라는 메시지를 표시합니다. 아무것도 묻지 않으며 옵션이 없습니다.

명령 취소 직후에만 작동합니다. 그 밖의 경우에는 <Message id="redoMustFollowUndo" />라는 메시지를 표시하고, 다른 명령이 실행된 뒤에는 LIST나 ZOOM처럼 아무것도 바꾸지 않는 명령이라도 <Message id="nothingToRedo" />라는 메시지를 표시합니다. UNDO의 조정 옵션에서 없음을 골라 명령 취소를 끈 상태에서는 REDO가 사용할 수 없다고 알려 줍니다.

<Command id="MREDO" />는 한 단계씩 복구합니다. 작업 수, 또는 <Keyword command="MREDO" id="All" />이나 <Keyword command="MREDO" id="Last" />를 묻고, 그 사이에 U, UNDO, REDO가 무엇을 실행했든 명령 취소로 되돌린 단계를 그 수만큼 복구합니다. <Keyword command="MREDO" id="Last" />는 마지막 명령 취소 전체를 한 번만 복구합니다(<Message id="alreadyRedone" />). Ctrl+Y와 바로 가기 메뉴의 명령 복구는 실행 중인 명령을 취소하고 MREDO를 1로 실행합니다.

## Missing

Ctrl+Shift+Z도 아무 표시 없이 복구하지만, AutoCAD는 이 키에 아무것도 지정하지 않습니다.

## Questions

### AutoCAD 명령 복구(REDO)의 단축키는 무엇입니까?

Ctrl+Y이며, 한 단계를 복구합니다(MREDO 1). REDO 자체에는 단축키가 없으므로 `REDO`를 입력하거나, AutoCAD의 모든 언어 버전에서 `_REDO`를 입력합니다.

### REDO가 안 될 때는 왜 그렇습니까?

REDO는 바로 앞의 U나 UNDO만 반대로 되돌립니다. 그 사이에 다른 명령을 실행했다면 아무것도 바꾸지 않은 명령이라도 복구할 것이 없습니다. 명령 취소 후 곧바로 복구하십시오.

### REDO와 MREDO의 차이는 무엇입니까?

REDO는 마지막 명령 취소 전체를, 그 직후에만 복구합니다. <Command id="MREDO" />는 되돌린 단계를 하나씩 원하는 수만큼, 또는 전부 복구하며 REDO 다음에도 작동합니다.

### AutoCAD에서 마지막 명령을 반복하려면 어떻게 합니까?

명령 프롬프트에서 Enter 키나 Space 키를 누르면 마지막 명령이 다시 시작됩니다. REDO는 명령을 반복하지 않고, 명령 취소를 반대로 되돌립니다.
