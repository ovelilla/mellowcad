---
title: "AutoCAD ATTDISP(속성 화면표시) 명령"
metaTitle: "오토캐드 속성 화면표시(ATTDISP) 속성 보이기와 숨기기"
description: "AutoCAD 속성 화면표시(ATTDISP)로 블록 속성을 표시하는 방법: 일반, 숨긴 속성까지 보이는 ON, 모두 숨기는 OFF. 도면에 저장됩니다. 브라우저에서 무료로 해 볼 수 있습니다."
figure: "부품 번호가 숨김 속성인 책상 두 개입니다. ATTDISP ON을 실행하면 보이는 번호 옆, 각 책상 아래에 번호가 표시됩니다."
sourceHash: "8821fdeb2077"
---

ATTDISP(속성 화면표시) 명령은 도면의 블록 참조가 어떤 속성을 표시할지 정합니다. 현재 설정을 제시하며 설정을 묻고, 새 도면에서는 일반입니다. 다른 단어를 입력하면 키워드가 잘못되었다고 알리고 다시 물으며, Enter 키는 설정을 유지합니다. 설정을 바꾸면 도면 전체를 다시 그리며, AutoCAD 2027과 같이 `Regenerating model.`을 표시합니다. 설정은 ATTMODE로 도면에 저장되며, <Command id="U" /> 명령으로 되돌릴 수 있는 한 단계입니다. 명령 안에서 아포스트로피를 붙여 입력하면 그 안에서도 실행됩니다.

바뀌는 것은 표시뿐입니다. 숨김 속성은 값을 유지하고, 숨겨진 속성도 <Command id="ATTEDIT" /> 또는 <Command id="EATTEDIT" /> 명령으로 편집할 수 있습니다.

## Options

### Normal

각 속성을 정의한 대로 표시합니다. 보이는 속성은 표시하고, <Command id="ATTDEF" /> 명령의 <Keyword command="ATTDEF" id="Invisible" /> 모드로 정의한 속성은 표시하지 않습니다.

### ON

숨김 속성까지 모든 속성을 표시합니다.

### OFF

보이는 속성까지 모든 속성을 숨깁니다.

## Questions

### 오토캐드에서 숨김 속성을 보이게 하려면 어떻게 합니까?

`ATTDISP`를 입력하고 <Keyword id="ON" /> 옵션을 선택합니다. 숨김 속성까지 모든 속성이 표시됩니다. <Keyword id="Normal" /> 옵션은 다시 숨깁니다.

### 블록 속성이 안 보일 때는 어떻게 합니까?

<Command id="ATTDISP" /> 명령이 모든 속성을 숨기는 <Keyword id="OFF" /> 상태이거나, 속성이 숨김으로 정의된 채 <Keyword id="Normal" /> 상태일 수 있습니다. <Keyword id="ON" /> 옵션을 선택하면 모두 보입니다. 블록에 속성이 없는 참조는 설정과 상관없이 아무 속성도 표시하지 않습니다.

### 오토캐드에서 속성 값을 숨기려면 어떻게 합니까?

블록을 만들기 전에 <Command id="ATTDEF" /> 명령의 <Keyword command="ATTDEF" id="Invisible" /> 모드로 숨김 속성을 정의합니다. ATTDISP의 <Keyword id="OFF" /> 옵션은 도면 전체의 모든 속성을 한 번에 숨깁니다.
