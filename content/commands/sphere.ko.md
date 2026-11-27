---
title: "AutoCAD SPHERE(구) 명령"
metaTitle: "오토캐드 구(SPHERE)로 3D 구 그리기"
description: "AutoCAD SPHERE(구, 캐드 스피어)로 3D 솔리드 구를 그리는 방법을 프롬프트 순서대로 설명합니다: 중심과 반지름, 지름, 3P, 2P, Ttr, 그리고 선으로 보이는 이유. 브라우저에서 무료로 해 볼 수 있습니다."
figure: "중심에서 반지름 25로 그린 구를 개념 비주얼 스타일로 남동쪽에서 봅니다."
sourceHash: "c7bc67d1d847"
---

SPHERE(구) 명령은 3D 솔리드 구를 그립니다. 중심을 지정한 다음 반지름을 지정합니다. 마우스로 지정한 반지름은 중심을 지나는 평면에서 읽으며, 마지막 반지름이 기본값으로 제시되어 Enter 키로 받습니다. 이 기본값은 <Command id="CYLINDER" />, <Command id="CONE" />과 다른 기본체가 함께 씁니다. 구는 현재 도면층에 작성되며, 명령 취소 한 번으로 되돌릴 수 있습니다.

2D 와이어프레임과 숨김에서는 `ISOLINES`가 정한 수만큼의 경선과 위선으로 그려지며, 중심 말고는 스냅되는 곳이 없습니다. <Command id="LIST" />는 위치와 반지름을 표시하고, 특성 팔레트에서 반지름이나 지름을 입력할 수 있습니다. 그립으로 구를 이동하고, 적도의 사분점마다 있는 그립으로 반지름을 정합니다. <Command id="UNION" />, <Command id="SUBTRACT" />와 MellowCAD의 나머지 3D 기능에서 3D 솔리드로 다뤄집니다. MellowCAD의 3D는 솔리드만 다루며 아직 일부만 구현되어 있습니다.

## Options

### 3P

중심에서 선택합니다. 세 점을 묻고, 그 세 점을 지나는 원의 중심과 반지름으로 구를 만듭니다.

### 2P

중심에서 선택합니다. 공간 어디서든 지름의 두 끝을 묻습니다.

### Ttr

중심에서 선택합니다. 접점 스냅으로 선, 원, 호 두 개를 선택하고 반지름을 지정합니다. 중심은 그 반지름으로 둘 다에 접하는 원 위, 두 객체의 높이에 놓입니다.

### Diameter

반지름에서 선택합니다. 대신 지름을 물으며, 마지막 반지름의 두 배를 제시합니다.

## Missing

AutoCAD가 표면으로 바꾸는 구의 <Command id="EXPLODE" />: MellowCAD에는 표면이 없으므로 분해할 수 없다고 알려 줍니다. 핫 그립에서의 이동, 회전, 축척, 대칭, 그리고 3D 전용 명령(3DSCALE). <Command id="3DMOVE" /> 및 <Command id="3DROTATE" /> 명령은 구를 이동하고 회전합니다. AutoCAD의 `DISPSILH`가 그리는 윤곽선. 2D 와이어프레임, 숨김, 개념 외에 <Command id="VSCURRENT" />에 없는 비주얼 스타일.

## Questions

### 오토캐드에서 구는 어떻게 만듭니까?

SPHERE를 실행하고 중심과 반지름을 지정합니다. `0,0,0`과 `25`를 입력하면 세션의 구가 그려집니다. 둥근 모양을 보려면 ViewCube의 구석이나 <Command id="-VIEW" />와 <Keyword command="VIEW" id="SEiso" />로 뷰를 돌립니다.

### 구가 선이 그어진 원처럼 보이는 이유는 무엇입니까?

2D 와이어프레임과 숨김은 구를 경선과 위선으로 그리며, 평면도에서는 원과 그 안을 지나는 선으로 보입니다. <Command id="VSCURRENT" />에서 <Keyword command="VSCURRENT" id="Conceptual" />을 고르면 음영이 표시되고, `ISOLINES`로 선의 수를 정합니다.

### 반구는 어떻게 만듭니까?

구를 그린 다음 <Command id="SLICE" />로 중심을 지나게 자릅니다. 평면 위의 세 점이나 <Keyword command="SLICE" id="XY" />와 중심을 지정하고, 남길 쪽을 지정합니다.

### 지름으로 구를 그리려면 어떻게 합니까?

반지름에서 <Keyword id="Diameter" />를 고르고 지름을 입력합니다. <Keyword id="2P" />로 지름의 두 끝을 지정해도 됩니다.
