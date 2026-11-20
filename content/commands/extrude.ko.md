---
title: "AutoCAD EXTRUDE(돌출) 명령"
metaTitle: "캐드 돌출: 돌출(EXTRUDE) 사용법과 단축키 EXT"
description: "AutoCAD 돌출(EXTRUDE, EXT)로 닫힌 2D 윤곽을 3D 솔리드로 만드는 방법을 프롬프트 순서대로 설명합니다: 높이, 방향, 테이퍼 각도. 브라우저에서 무료로 해 볼 수 있습니다."
figure: "닫힌 L자형 폴리선을 20만큼 돌출하여 솔리드로 만든 다음, 숨김 비주얼 스타일로 남동쪽에서 봅니다."
sourceHash: "53bfe3dd1e9c"
---

EXTRUDE(돌출) 명령은 닫힌 2D 윤곽을 3D 솔리드로 만듭니다. 각 윤곽을 지정한 높이만큼 그 평면에서 곧게 밀어냅니다. 윤곽(원, 타원, 닫힌 폴리선이나 스플라인, 영역)을 선택하고 Enter 키를 누른 다음, 높이를 입력하거나 점으로 지정합니다. 마지막 높이는 다음 실행의 기본값이 됩니다. 각 윤곽은 현재 도면층에 별도의 솔리드가 되고, DELOBJ의 기본값대로 원래 윤곽은 지워집니다. 명령 전체가 한 단계이므로 명령 취소로 되돌립니다.

MellowCAD의 3D는 솔리드뿐이며 아직 일부만 지원합니다. AutoCAD가 표면으로 만드는 열린 윤곽은 <Message id="sweepRefusedType" /> 메시지와 함께 선택에서 제거됩니다.

## Options

### MOde

<Keyword id="SOlid" />와 <Keyword id="SUrface" /> 중에서 묻습니다. <Keyword id="SOlid" />가 기본값이며 실제로 있는 것도 이것뿐입니다. 아직 표면 객체가 없으므로 <Keyword id="SUrface" />는 거부됩니다.

### Direction

높이 대신 두 점으로 방향과 길이를 지정합니다. 윤곽이 그 선을 따라 돌출되며, 선이 기울어 있으면 비스듬히 돌출됩니다. 윤곽의 평면에 놓인 방향은 <Message id="directionParallel" /> 메시지와 함께 명령이 끝납니다.

### Path

AutoCAD처럼 옵션 목록에는 나오지만 구현되어 있지 않습니다. 고르면 거부되고 높이를 다시 묻습니다.

### Taper

−90도에서 90도 사이의 각도를 묻고, 이어서 다시 높이를 묻습니다. 양의 각도는 올라갈수록 솔리드를 좁히고, 음의 각도는 넓힙니다. 높이에 이르기 전에 닫히는 원은 한 점에서 끝나 원추가 됩니다. 테이퍼를 적용할 수 없는 윤곽은 아무것도 만들지 않습니다.

### Expression

높이를 식으로 지정합니다. `2*3`은 6입니다. 지금은 사칙연산만 됩니다.

## Missing

경로를 따라 쓸어 내는 경로 옵션이 없습니다. AutoCAD가 표면으로 만드는 표면 모드와 열린 윤곽도 없습니다. 아직 표면 객체가 없기 때문입니다. <Command id="PRESSPULL" />이 받아들이는 솔리드의 면과, 클릭으로 객체 안에서 찾는 영역도 받지 않습니다. 타원, 스플라인, 다음 세그먼트와 모서리로 만나는 호에는 테이퍼를 적용할 수 없습니다. 식의 매개변수와 함수가 없습니다. 측면이 곡면인 돌출 솔리드의 <Command id="EXPLODE" />가 없으며, AutoCAD는 이를 표면과 영역으로 바꿉니다. 그립과, 특성 팔레트에서 높이와 테이퍼 각도를 편집하는 기능도 없습니다.

## Questions

### AutoCAD 돌출 단축키는?

`EXT`를 입력하고 Enter 키나 Space 키를 누릅니다. 전체 명령 이름을 입력해도 되고, AutoCAD의 어느 언어 버전에서나 `_EXTRUDE`를 쓸 수 있습니다.

### 2D 도면을 3D로 돌출하려면?

윤곽을 닫힌 폴리선, 원, 영역 같은 닫힌 객체 하나로 그리고, EXTRUDE를 실행하여 선택한 다음 Enter 키를 누르고 높이를 입력합니다. 위에서 보면 솔리드는 윤곽과 똑같아 보이므로, ViewCube로 뷰를 돌리거나 <Command id="-VIEW" />와 <Keyword command="VIEW" id="SEiso" />로 3D로 봅니다.

### 캐드 돌출이 안 될 때, 솔리드가 만들어지지 않는 이유는?

윤곽이 열려 있거나 자기 자신과 교차합니다. 선, 호, 열린 폴리선은 AutoCAD에서 표면이 되는데, MellowCAD에는 아직 표면이 없습니다. EXTRUDE는 <Message id="sweepRefusedType" /> 메시지를 표시하고 선택에서 제거합니다. 자기 교차하는 윤곽은 <Message id="sweepSelfIntersecting" /> 메시지를 표시하고 역시 제거됩니다. <Command id="JOIN" />으로 조각을 결합하거나, <Command id="REGION" />으로 영역을 만들거나, <Command id="PRESSPULL" />로 그 안쪽을 클릭합니다.

### 구멍이 있는 모양을 돌출하려면?

하나의 영역으로 만듭니다. 바깥 윤곽과 구멍에 <Command id="REGION" />을 실행한 다음, 바깥 윤곽의 영역에서 구멍의 영역을 <Command id="SUBTRACT" />로 뺍니다. 그 영역을 돌출하면 구멍이 솔리드를 관통합니다. 또는 <Command id="PRESSPULL" />을 실행하고 바깥 윤곽과 구멍 사이를 클릭합니다.

### 경로를 따라 돌출하려면?

아직 안 됩니다. <Keyword id="Path" />는 옵션 목록에 있지만 거부되며, SWEEP도 없습니다. <Keyword id="Direction" />은 두 점 사이의 직선을 따라 돌출합니다.
