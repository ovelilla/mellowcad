---
title: "AutoCAD PLAN(평면도) 명령"
metaTitle: "AutoCAD 평면 뷰로 돌아가기: 평면도(PLAN)"
description: "AutoCAD 평면도(PLAN)로 현재 UCS, 저장한 UCS, 표준 좌표계를 바로 위에서 내려다보는 방법과 평면 뷰로 돌아가는 방법. 브라우저에서 무료로 해 볼 수 있습니다."
figure: "UCS를 Z축을 중심으로 30도 회전하고 남서쪽에서 본 계단형 블록. PLAN과 Enter 키로 그 UCS를 바로 위에서 보면 X축이 오른쪽을 향하므로 블록이 회전되어 보입니다."
sourceHash: "50d157803309"
---

PLAN(평면도) 명령은 UCS의 XY 평면을 바로 위에서, X축이 오른쪽을 향하도록 내려다봅니다. 그린 그대로의 평면 뷰입니다. 현재 UCS, 저장한 UCS, 표준 좌표계 중 어느 UCS인지 묻고, Enter 키를 누르면 현재 UCS입니다. 이어서 도면 전체가 화면에 들어오게 하고 <Message id="regeneratingModel" /> 메시지를 표시합니다.

도면의 객체는 움직이지 않고 UCS도 그대로입니다. PLAN은 뷰만 돌립니다. 명령 취소 한 단계이므로 <Command id="U" />로 뷰를 되돌리며, <Command id="ZOOM" /> <Keyword command="ZOOM" id="Previous" />로 이전 뷰로 돌아갈 수도 있습니다. <Command id="3DORBIT" />이나 등각 <Command id="VIEW" /> 다음에 평면으로 돌아오는 방법입니다. MellowCAD의 3D는 솔리드뿐이며 아직 일부만 지원합니다.

## Options

### Current ucs

현재 UCS의 평면이며 기본값입니다. <Command id="UCS" />로 UCS를 Z축을 중심으로 30도 회전했다면, UCS의 X축이 오른쪽을 향하도록 도면이 시계 방향으로 30도 회전되어 보입니다. 경사진 면에 UCS를 놓았다면 그 면을 정면으로 봅니다.

### Ucs

<Command id="UCS" />의 <Keyword command="UCS" id="NAmed" />로 저장한 UCS의 평면이며, 이름을 입력합니다. 저장되지 않은 이름이면 그 UCS를 찾을 수 없다고 표시하고 다시 묻습니다. <Keyword id="?" />는 UCS처럼 저장된 UCS를 나열하고 역시 다시 묻습니다. 현재 UCS는 바뀌지 않습니다.

### World

표준 좌표계의 평면입니다. 현재 UCS가 무엇이든 처음 그대로의 도면을 X는 오른쪽, Y는 위로 하여 보여 주며, 현재 UCS는 그대로 남습니다.

## Missing

아무것도 그리지 않은 상태에서는 PLAN이 줌을 그대로 두지만, AutoCAD는 도면 한계를 화면에 맞춥니다.

## Questions

### AutoCAD에서 평면 뷰로 돌아가려면?

`PLAN`을 입력하고 Enter 키를 두 번 누릅니다. 두 번째 Enter 키가 <Keyword id="Current ucs" />를 고릅니다. UCS가 회전되어 있고 표준 좌표계의 평면을 보고 싶다면 대신 <Keyword id="World" />를 고릅니다.

### UCS 평면 뷰를 보는 명령은?

<Keyword id="Current ucs" />를 고른 PLAN입니다. 현재 UCS를 X축이 오른쪽을 향하도록 내려다봅니다. 먼저 <Command id="UCS" />로 UCS를 회전한 다음 PLAN을 실행하고 Enter 키를 두 번 누르면, 회전한 평면에서도 반듯한 평면처럼 그릴 수 있습니다.

### 평면 뷰에서 도면이 회전되어 보이는 이유는?

뷰가 회전된 UCS의 평면이기 때문입니다. PLAN을 실행하고 <Keyword id="World" />를 고르면 다시 표준 좌표계의 X가 오른쪽인 도면이 보입니다. <Command id="UCS" />에서 Enter 키를 눌러도 UCS가 표준(World)으로 돌아갑니다.

### PLAN은 UCS를 바꾸나요?

아닙니다. 뷰만 돌리며 UCS는 그대로입니다. UCS까지 함께 돌리는 것은 <Command id="VIEW" />의 정투영 뷰입니다.
