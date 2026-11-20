---
title: "캐드 3D 연습도면: 마운팅 플레이트"
metaTitle: "캐드 3D 초보 연습도면: 플레이트"
description: "AutoCAD 3D 초보 연습도면. 영역을 만들고 차집합으로 구멍을 뺀 뒤 한 번 돌출해 마운팅 플레이트를 솔리드로 만듭니다. 단계별 풀이가 있고 브라우저에서 3D 솔리드를 무료로 연습할 수 있습니다."
figure: "구멍 4개가 있는 100 × 60 플레이트의 외형, 치수 포함."
model: "두께 10의 솔리드 플레이트. 남동쪽에서 본 모습, 숨은선 제거."
sourceHash: "87b8f906b0fd"
---

두께 10의 마운팅 플레이트를 모델링합니다(단위: mm). 외형은 100 × 60이고 모서리 반지름은 8이며, 가장자리에서 15 떨어진 곳에 중심이 있는 지름 10의 구멍이 4개 있습니다. 평면에서 시작합니다. 외형과 원을 영역으로 만들고, 아직 평평할 때 구멍을 빼낸 다음, 한 번 돌출해 구멍이 뚫린 솔리드로 만듭니다.

## Steps

### 프로파일 그리기 [#profile]

“외형선” 도면층에서 <Command id="RECTANG" />(직사각형) 명령의 <Keyword command="RECTANG" id="Fillet" /> 옵션을 `8`로 설정하고 `0,0`에서 `100,60`까지 그립니다. 이어서 `15,15`에 <Keyword command="CIRCLE" id="Diameter" /> `10`인 원을 그리고, <Command id="COPY" />(복사) 명령으로 그 중심에서 `70,0`, `70,30`, `0,30`으로 복사합니다.

### 영역 만들기 [#region]

<Command id="REGION" />(영역) 명령은 닫힌 객체를 영역으로 바꿉니다. 외형과 원 네 개를 선택하고 Enter 키를 누릅니다. 닫힌 루프 다섯 개가 영역 다섯 개가 됩니다.

### 구멍 빼기 [#subtract]

<Command id="SUBTRACT" />(차집합) 명령으로 판의 영역을 선택하고 Enter 키를 누른 다음, 원 네 개의 영역을 선택하고 Enter 키를 누릅니다. 구멍 네 개가 뚫린 영역 하나가 남습니다.

### 뷰 돌리기 [#view]

<Command id="-VIEW" /> 명령의 <Keyword command="VIEW" id="SEiso" /> 옵션은 남동쪽 위에서 바라보게 하고, <Command id="VSCURRENT" />(비주얼 스타일) 명령의 <Keyword command="VSCURRENT" id="Hidden" /> 옵션은 면에 가려진 것을 숨깁니다. ViewCube를 클릭해도 뷰가 돌아갑니다.

### 돌출하기 [#extrude]

<Command id="EXTRUDE" />(돌출) 명령으로 영역을 선택하고 Enter 키를 누른 다음 높이 `10`을 입력합니다. 구멍까지 포함해 플레이트가 솔리드가 됩니다. <Command id="ZOOM" />(줌) 명령의 <Keyword command="ZOOM" id="Extents" /> 옵션으로 화면에 맞추고, 축척 0.8x로 주위에 여백을 둡니다.
