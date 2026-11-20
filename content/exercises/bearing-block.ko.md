---
title: "캐드 3D 연습도면: 베어링 블록"
metaTitle: "오토캐드 3D 연습 문제 (고급): 베어링 블록"
description: "AutoCAD 3D 기계 연습도면. 베어링 블록을 돌출과 합집합으로 만들고, 축 구멍과 볼트 구멍 2개를 원통의 차집합으로 뚫습니다. 단계별 풀이가 있고 3D 솔리드를 무료로 연습할 수 있습니다."
figure: "베어링 블록의 평면도. 100 × 60, 보스, 축 구멍, 볼트 구멍 치수 포함."
model: "솔리드 베어링 블록. 남동쪽에서 본 모습, 개념 비주얼 스타일."
sourceHash: "5579d6bd5a86"
---

다음 베어링 블록을 모델링합니다(단위: mm). 바닥판은 100 × 60에 두께 12이고 모서리 반지름은 10입니다. 가운데에 지름 40, 높이 40의 보스가 서 있습니다. 보스를 관통하는 지름 20의 축 구멍과, 바닥판을 관통하는 지름 10의 볼트 구멍 2개(간격 76)가 있습니다. 바닥판과 보스는 외형에서 돌출해 하나의 솔리드로 합치고, 축 구멍과 볼트 구멍은 원통으로 만들어 빼냅니다.

## Steps

### 평면도 그리기 [#plan]

“외형선” 도면층에서 <Command id="RECTANG" />(직사각형) 명령의 <Keyword command="RECTANG" id="Fillet" /> 옵션을 `10`으로 설정하고 `0,0`에서 `100,60`까지 그립니다. 이어서 그 중심 `50,30`에 <Keyword command="CIRCLE" id="Diameter" /> `40`인 원을 그립니다.

### 바닥판과 보스 돌출하기 [#extrude]

<Command id="EXTRUDE" />(돌출) 명령으로 외형을 높이 `12`로, 원을 높이 `40`으로 돌출합니다. 솔리드 두 개가 됩니다.

### 합치기 [#union]

<Command id="UNION" />(합집합) 명령으로 두 솔리드를 선택하고 Enter 키를 누릅니다. 하나의 솔리드가 됩니다.

### 원통 그리기 [#holes]

<Command id="CYLINDER" />(원통) 명령으로 축 구멍과 볼트 구멍 하나를 원통으로 그립니다. 축 구멍은 `50,30`에 <Keyword command="CYLINDER" id="Diameter" /> `20`, 높이 `40`이고, 볼트 구멍은 `12,30`에 지름 `10`, 높이 `12`입니다. 이어서 <Command id="COPY" />(복사) 명령으로 볼트 구멍을 `12,30`에서 `76,0`만큼 떨어진 곳으로 복사합니다.

### 빼기 [#subtract]

<Command id="SUBTRACT" />(차집합) 명령으로 블록을 선택하고 Enter 키를 누른 다음, 원통 세 개를 선택하고 Enter 키를 누릅니다. 축 구멍과 볼트 구멍이 관통합니다.

### 뷰 돌리기 [#view]

<Command id="-VIEW" /> 명령의 <Keyword command="VIEW" id="SEiso" /> 옵션, <Command id="VSCURRENT" />(비주얼 스타일) 명령의 <Keyword command="VSCURRENT" id="Conceptual" /> 옵션을 선택한 다음, <Command id="ZOOM" />(줌) 명령의 <Keyword command="ZOOM" id="Extents" /> 옵션과 0.8x로 화면에 맞춥니다.
