---
title: "AutoCAD VIEW(명명된 뷰) 명령"
metaTitle: "오토캐드 VIEW로 등각투영 뷰와 평면 뷰 보기"
description: "AutoCAD VIEW(V, -VIEW)로 여섯 가지 정투영 뷰와 네 가지 등각투영 뷰로 뷰를 돌리는 방법, 그리고 정투영 뷰가 설정하는 UCS. 브라우저에서 무료로 해 보십시오."
figure: "평면도로 그린 계단 모양 블록: -VIEW와 남서 등각투영을 고르면 남서쪽 위에서 본 모습이 숨김 비주얼 스타일로 표시됩니다."
sourceHash: "261c8657f5f7"
---

VIEW(명명된 뷰) 명령은 AutoCAD에 미리 정의된 뷰 열 가지 중 하나로 뷰를 돌립니다. 모형의 한 면을 똑바로 보는 정투영 뷰 여섯 가지와, 구석에서 내려다보는 등각투영 뷰 네 가지입니다. 도면의 객체는 움직이지 않습니다. VIEW는 명령행 형식인 <Command id="-VIEW" />를 실행합니다. 첫 프롬프트에는 <Keyword id="Orthographic" />이 나열되어 있고 이를 고르면 면을 묻습니다. AutoCAD의 메뉴가 답하는 것처럼 뷰 이름도 바로 받습니다. <Command id="-VIEW" /> 다음에 <Keyword id="SWiso" />를 입력하는 식입니다. 뷰마다 도면 전체가 화면에 들어오고 <Message id="regeneratingModel" />라고 표시합니다.

도면 왼쪽 위의 뷰 컨트롤에도 같은 열 가지 뷰가 나열되어 <Command id="-VIEW" />를 실행하며, ViewCube의 면과 구석도 그 뷰로 돌리되 UCS는 그대로 둡니다. VIEW 한 번이 명령 취소 한 단계이므로, <Command id="U" />는 뷰를 그 뷰가 설정한 UCS와 함께 되돌립니다. 다른 명령 안에서 아포스트로피를 붙여 입력하면 <Message id="requiresRegen" />로 거부합니다. MellowCAD의 3D는 솔리드만 다루며 아직 일부만 구현되어 있습니다.

## Options

### Orthographic

볼 면을 묻습니다. 기본값이 <Keyword id="Top" />이므로 거기서 Enter 키를 누르면 평면도가 됩니다. <Keyword id="Top" />, <Keyword id="Bottom" />, <Keyword id="Front" />, <Keyword id="BAck" />, <Keyword id="Left" />, <Keyword id="Right" /> 중에서 고릅니다. 모든 뷰는 똑바로 서 있습니다. <Keyword id="Top" />은 X가 오른쪽, Y가 위쪽이고, <Keyword id="Front" />는 X가 오른쪽, Z가 위쪽이며, 아래에서 보는 <Keyword id="Bottom" />은 X가 왼쪽입니다. 첫 프롬프트에서 면을 바로 입력해도 이 옵션 없이 작동합니다.

정투영 뷰는 <Command id="UCS" />의 정투영 옵션처럼, 이전 UCS가 무엇이었든 표준 좌표계의 축을 기준으로 UCS를 사용자 쪽으로 돌리고 원점을 `0,0,0`에 둡니다. <Keyword id="Front" /> 다음에는 XY 평면이 정면이므로 그리는 객체가 화면에 평평하게 놓이고, UCS의 이름은 `*FRONT*`가 됩니다. <Keyword id="Top" /> 다음에는 표준 좌표계의 축을 갖고 이름은 `*TOP*`입니다.

### SWiso

남서 등각투영: 앞쪽 왼쪽 구석에서 내려다보며 정면, 왼쪽 면, 윗면이 보입니다. UCS는 그대로입니다. 세션의 뷰입니다.

### SEiso

남동 등각투영: 앞쪽 오른쪽 구석에서 내려다보며 정면, 오른쪽 면, 윗면이 보입니다. UCS는 그대로입니다.

### NEiso

북동 등각투영: 뒤쪽 오른쪽 구석에서 내려다보며 뒷면, 오른쪽 면, 윗면이 보입니다. UCS는 그대로입니다.

### NWiso

북서 등각투영: 뒤쪽 왼쪽 구석에서 내려다보며 뒷면, 왼쪽 면, 윗면이 보입니다. UCS는 그대로입니다.

## Missing

명명된 뷰: 첫 프롬프트에 나열되는 옵션은 <Keyword id="Orthographic" />뿐이며, AutoCAD는 `?`, Delete, Restore, Save, sEttings, Window도 나열합니다. 여기서 입력한 이름은 거부됩니다. AutoCAD에서 VIEW가 여는 뷰 관리자. 아무것도 그리지 않은 도면에서 뷰는 줌을 그대로 두지만, AutoCAD는 도면 한계를 화면에 맞춥니다. 변수로서의 UCSORTHO와 UCSBASE: 정투영 뷰는 항상 표준 좌표계의 축을 기준으로 UCS를 맞춥니다. <Command id="UCS" />의 <Keyword command="UCS" id="Previous" /> 목록에 들어가는, 뷰가 맞춘 UCS.

## Questions

### 오토캐드에서 등각투영 뷰는 어떻게 봅니까?

<Command id="-VIEW" />를 입력하고 남서 등각투영인 <Keyword id="SWiso" />를 입력합니다. <Keyword id="SEiso" />, <Keyword id="NEiso" />, <Keyword id="NWiso" />는 나머지 세 구석입니다. 또는 왼쪽 위의 뷰 컨트롤에서 남서 등각투영을 고르거나, ViewCube의 위쪽 구석을 클릭합니다. <Command id="VSCURRENT" />에서 <Keyword command="VSCURRENT" id="Hidden" />을 고르면 뒤쪽 모서리가 숨겨집니다.

### 평면 뷰(위에서 본 뷰)로 돌아가는 명령은 무엇입니까?

<Command id="-VIEW" /> 다음에 <Keyword id="Top" />이며, UCS도 표준 좌표계의 축으로 설정합니다. <Command id="PLAN" />은 대신 현재 UCS를 내려다보고 UCS를 그대로 둡니다.

### 정면 뷰 다음에 UCS가 바뀐 이유는 무엇입니까?

정투영 뷰는 그리는 객체가 화면에 놓이도록 UCS를 사용자 쪽으로 돌립니다. <Command id="UCS" />에서 Enter 키를 누르면 표준으로 돌아가고, <Command id="U" />는 뷰와 그 UCS를 함께 되돌립니다.

### 등각투영 뷰와 등각투영 도면은 같은 것입니까?

아닙니다. 등각투영 뷰는 3D 모형을 구석에서 보는 것입니다. 등각투영 도면은 SNAP의 등각 스타일로 등각 평면 위에 그리는 2D 도면이며, MellowCAD에는 아직 그 스타일이 없습니다.

### 뷰 관리자는 어디에 있습니까?

VIEW는 명령행에서 <Command id="-VIEW" />를 실행합니다. 뷰 관리자는 없고, 명명된 뷰(Save, Restore)도 아직 없습니다.
