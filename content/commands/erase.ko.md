---
title: "AutoCAD ERASE(지우기) 명령"
metaTitle: "AutoCAD 지우기(ERASE) 사용법과 단축키 E, Delete"
description: "AutoCAD 지우기(ERASE, E) 사용법: 객체를 선택하고 Enter 키로 삭제, Delete 키, ALL로 전체 지우기, 지운 객체 되살리기. 브라우저에서 무료로 해 볼 수 있습니다."
figure: "직사각형과 두 대각선. 대각선 하나를 클릭하고 Enter 키를 누르면 지워집니다."
sourceHash: "2de33971060a"
---

ERASE(지우기) 명령은 선택한 객체를 도면에서 제거합니다. `Select objects:`에서 객체를 클릭하거나, 윈도우나 걸치기를 비롯한 AutoCAD의 선택 모드로 선택한 다음 Enter 키나 Space 키를 누릅니다. 객체가 사라지고 명령은 더 이상 아무것도 표시하지 않습니다. Esc 키를 누르면 아무것도 지우지 않고 끝납니다. AutoCAD와 마찬가지로 명령 전에 선택한 객체는 바로 지워지고, 객체를 선택한 상태에서 Delete 키를 누르면 그 객체에 ERASE가 실행됩니다. 선택하는 동안 커서 아래의 객체와 이미 고른 객체가 흐리게 그려지며, AutoCAD처럼 지워질 객체를 미리 보여 줍니다. 지우기 전체가 한 단계이므로 명령 취소로 되돌립니다.

## Missing

OOPS가 없습니다. AutoCAD에서는 다른 명령을 실행한 뒤에도 ERASE가 마지막으로 지운 세트를 되살립니다. 여기서는 <Command id="U" />나 Ctrl+Z로 지우기를 되돌리며, 그 뒤에 한 작업도 함께 되돌아갑니다.

## Questions

### AutoCAD 지우기 단축키는?

`E`를 입력하고 Enter 키나 Space 키를 누릅니다. `DELETE`도 단축키입니다. 또는 `Command:`에서 객체를 선택하고 Delete 키를 누릅니다. 전체 명령 이름을 입력해도 되고, AutoCAD의 어느 언어 버전에서나 `_ERASE`를 쓸 수 있습니다.

### 도면 전체를 지우려면?

ERASE를 실행하고 `Select objects:`에서 `ALL`을 입력한 다음 Enter 키를 누릅니다. 잠긴 도면층의 객체는 제외되며, 몇 개가 제외되었는지 선택 단계에서 알려 줍니다.

### 지운 객체를 되살리려면?

바로 <Command id="U" />를 입력하거나 Ctrl+Z를 누릅니다. 지우기는 명령 취소 한 단계입니다. 다른 명령을 실행한 뒤에도 마지막으로 지운 세트를 되살리는 OOPS는 아직 없습니다.

### ERASE와 TRIM의 차이는?

ERASE는 객체 전체를 제거합니다. <Command id="TRIM" />은 객체 중 만나는 경계를 넘어가는 부분만 제거하고 나머지는 남깁니다.
