---
title: "AutoCAD TEXTEDIT(문자 편집) 명령"
metaTitle: "오토캐드 문자 편집(TEXTEDIT) 사용법, ED와 DDEDIT"
description: "AutoCAD TEXTEDIT(문자 편집, ED)로 문자, 여러 줄 문자, 속성 정의를 차례로 편집하는 방법과 명령 취소, 모드 옵션. 브라우저에서 무료로 해 보십시오."
figure: "명판의 철자가 틀린 PALTE를 TEXTEDIT로 선택해 PLATE로 다시 입력한 다음, Esc 키로 명령을 끝냅니다."
sourceHash: "2d0ed6fe5acc"
---

TEXTEDIT(문자 편집) 명령은 주석 객체를 편집합니다. 현재 편집 모드(처음에는 <Keyword id="Multiple" />)를 알려 주고 객체를 선택하라고 묻습니다. 단일 행 문자는 그 자리에서 다시 입력하도록 열리고, 여러 줄 문자는 <Command id="MTEXT" />의 편집기에서, 속성 정의는 태그, 프롬프트, 기본값으로 열립니다. <Keyword id="Multiple" /> 모드에서는 이어서 다음 객체를 물으며, Esc 키나 Enter 키로 명령이 끝납니다. 실행 전체가 <Command id="U" />로 되돌릴 수 있는 한 단계입니다. 문자나 속성 정의를 두 번 클릭하면 TEXTEDIT가 실행되고, 여러 줄 문자를 두 번 클릭하면 그 객체 하나의 편집기가 열립니다.

단일 행 문자의 편집기에서 Esc 키를 누르면 그 편집을 버리고 다음 객체를 묻습니다. Esc 키를 한 번 더 누르면 명령이 끝납니다. 잠긴 도면층의 객체에는 <Message id="objectOnLockedLayer" />라고 표시하고 다시 물으며, 그 밖의 객체를 선택하면 아무 표시 없이 다시 묻습니다. 명령 전에 문자 하나를 선택해 두면 바로 열립니다.

## Options

### Undo

이번 실행의 마지막 편집을 되돌리고 다시 묻습니다. 되돌릴 것이 없으면 명령이 완전히 취소되었다고 알려 줍니다.

### Mode

편집 모드를 묻습니다. <Keyword id="Single" />은 객체 하나 다음에 명령을 끝내고, <Keyword id="Multiple" />은 다른 객체를 묻습니다. 모드는 모든 도면에서 다음 TEXTEDIT에 유지됩니다.

## Missing

치수 문자: TEXTEDIT는 치수 문자를 편집하지 않으며, 치수 문자는 <Command id="DIMLINEAR" />의 문자 옵션으로 배치할 때 정합니다. 특성 팔레트에서 문자 내용 편집. MTEDIT 입력과 -MTEDIT. 편집기가 열려 있는 동안 명령행에 `TEXTEDIT:`가 표시되지만, AutoCAD는 그 자리에서 편집하며 아무것도 묻지 않습니다.

## Questions

### AutoCAD 문자 편집(TEXTEDIT)의 단축키는 무엇입니까?

`ED`를 입력하고 Enter 키나 Space 키를 누릅니다. AutoCAD의 예전 이름인 `DDEDIT`와 `TEDIT`도 됩니다. AutoCAD의 모든 언어 버전에서 `_TEXTEDIT`가 됩니다.

### 캐드에서 문자를 수정하려면 어떻게 합니까?

문자를 두 번 클릭하거나, `ED`를 입력하고 문자를 선택합니다. 다시 입력하고 Enter 키를 누릅니다. 그러면 TEXTEDIT가 Esc 키를 누를 때까지 다음에 편집할 문자를 묻습니다. 높이와 회전은 특성 팔레트의 행에 있고, 스타일은 스타일 행에 있습니다.

### 여러 문자를 차례로 수정하려면 어떻게 합니까?

TEXTEDIT를 기본값인 <Keyword id="Multiple" /> 모드로 둡니다. 문자 하나를 편집할 때마다 다음 문자를 묻습니다. <Keyword id="Mode" />에서 <Keyword id="Single" />을 고르면 두 번 클릭할 때처럼 하나만 편집하고 끝납니다.

### 문자를 두 번 클릭해도 수정이 안될때는 왜 그렇습니까?

문자가 잠긴 도면층에 있을 수 있습니다. 도면층 특성 관리자에서 도면층의 잠금을 해제하십시오. 치수 문자는 아직 TEXTEDIT로 편집되지 않으며, 블록의 속성 값은 <Command id="EATTEDIT" />가 열립니다.
