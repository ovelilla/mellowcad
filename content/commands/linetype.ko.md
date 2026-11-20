---
title: "AutoCAD LINETYPE(선종류) 명령"
metaTitle: "AutoCAD 선종류(LINETYPE) 로드와 단축키 LT"
description: "AutoCAD 선종류(LINETYPE, LT) 사용법: acadiso.lin에서 선종류 로드, 새 객체의 현재 선종류, ByLayer, 점선이 실선으로 보이는 이유."
figure: "HIDDEN을 현재로 하여 구멍을, CENTER로 두 축선을 그린 판. 마지막에 LINETYPE을 ByLayer로 되돌립니다."
sourceHash: "d15530a865c1"
---

LINETYPE(선종류) 명령은 새 객체를 그릴 선종류를 설정합니다. AutoCAD는 선종류 관리자를 열지만 MellowCAD에는 아직 없으므로, LINETYPE은 AutoCAD에도 있는 명령행 형식 <Command id="-LINETYPE" />을 실행합니다. 현재 선종류(처음에는 `ByLayer`)를 표시하고, 답할 때마다 다시 옵션을 묻다가 Enter 키를 누르면 끝납니다. ByLayer는 각 객체가 자기 도면층의 선종류를 따른다는 뜻이며, 대신 이름을 지정한 선종류는 객체 자신의 선종류가 됩니다. 실행 전체가 한 단계이므로 <Command id="U" />로 되돌리며, 다른 명령 안에서 아포스트로피를 붙여 입력하면 그 명령이 다음에 그리는 객체에 선종류가 적용됩니다.

도면은 자기 선종류를 가지며, 도면과 그 DXF에 함께 저장됩니다. 새 도면에는 Continuous와, AutoCAD의 미터법 파일 acadiso.lin에서 온 DASHED, HIDDEN, CENTER, PHANTOM, DASHDOT의 6개가 있습니다. 나머지는 acadiso.lin에서 로드하며, DXF는 ISO 선종류와 복합 선종류를 포함해 자기 선종류를 가져옵니다. 복합 선종류의 문자, 예를 들어 GAS_LINE의 `GAS`는 선을 따라 그려집니다. 패턴은 AutoCAD처럼 각 선의 길이를 따라 가운데를 맞추고 양 끝의 대시 길이를 같게 하여 놓이며, <Command id="LTSCALE" />과 객체 자신의 선종류 축척으로 축척됩니다. 객체의 선종류 축척은 <Command id="CHPROP" />과 특성 팔레트에서 설정하고, 새 객체에는 CELTSCALE이 적용됩니다.

## Options

### ?

선종류를 이름과 설명의 두 열로 나열합니다. 옵션 프롬프트에서는 나열할 파일을 묻습니다. 기본값은 acadiso.lin이고, 인치 단위의 AutoCAD 파일인 acad.lin도 됩니다. 그 파일의 선종류를 파일 순서대로 나열합니다. 설정 프롬프트에서는 도면에 로드된 선종류 중 입력한 이름과 일치하는 것(`*`이면 전부)을 이름순으로 나열합니다.

### Load

로드할 선종류를 묻습니다. 이름 하나 또는 쉼표로 구분한 여러 이름이며, 와일드카드(`DASH*`)도 됩니다. 이어서 검색할 파일을 묻습니다. 처음에는 acadiso.lin이고, 그다음부터는 마지막으로 검색한 파일입니다. 찾은 선종류는 파일 순서대로 로드되고 그 사실을 알려 줍니다. 이미 로드된 선종류는 먼저 확인하며, 기본값인 <Keyword id="Yes" />를 고르면 다시 로드합니다. 파일에 없는 이름이나 acadiso.lin과 acad.lin 외의 파일이면 그렇다고 알려 줍니다.

### Set

현재 선종류를 제시하며 선종류 이름을 묻습니다. 로드된 선종류의 이름이나 <Keyword id="BYLayer" />를 입력합니다. acadiso.lin에 있는 선종류는 AutoCAD처럼 먼저 로드됩니다. 그 밖의 이름은 AutoCAD가 표시하는 대로 찾을 수 없다고 나오고, 옵션 프롬프트로 돌아갑니다. Enter 키를 누르면 현재 선종류를 유지합니다.

## Missing

선종류 관리자가 없고, 선종류를 만들거나 직접 만든 파일에서 로드할 수 없습니다. BATTING이나 ZIGZAG 같은 복합 선종류의 모양은 그 자리의 틈으로 그려집니다. ByBlock이 없습니다. 도면 공간이 없으므로 PSLTSCALE과 MSLTSCALE도 없습니다. 언어별 AutoCAD의 acadiso.lin, 즉 스페인어나 독일어 AutoCAD가 로드하는 이름(TRAZOS, STRICHLINIE)이 없습니다. 로드는 모든 언어에서 영어 파일을 읽지만, 그런 선종류로 만든 도면은 자기 선종류를 가지고 열립니다. PLINEGEN이 없어, 새 폴리선은 PEDIT의 선종류 생성으로 켜지 않는 한 각 정점에서 패턴을 다시 시작합니다.

## Questions

### AutoCAD 선종류 단축키는?

`LT`를 입력하고 Enter 키나 Space 키를 누릅니다. `LTYPE`과 `DDLTYPE`도 됩니다. 전체 명령 이름을 입력해도 되고, AutoCAD의 어느 언어 버전에서나 `_LINETYPE`을 쓸 수 있습니다.

### 캐드 점선이 실선으로 보일 때는?

AutoCAD와 마찬가지로 패턴 한 번의 반복보다 짧은 선은 실선으로 그려집니다. CENTER의 패턴은 기본 축척에서 약 51 단위입니다. <Command id="LTSCALE" />을 올리거나 내려 패턴을 도면에 맞춥니다. 객체의 선종류, 또는 ByLayer라면 그 도면층의 선종류가 Continuous가 아닌지도 확인합니다.

### 기존 객체의 선종류를 바꾸려면?

객체를 선택하고 특성 팔레트의 선종류 행에서 선종류를 고르거나, <Command id="MATCHPROP" />으로 다른 객체에서 복사합니다. LINETYPE은 그 뒤에 그리는 객체의 선종류만 설정합니다.

### AutoCAD에서 선종류 축척을 바꾸려면?

<Command id="LTSCALE" />과 새 비율을 입력합니다. 2이면 도면 전체의 모든 대시가 2배 길어집니다.

### AutoCAD에서 선종류를 로드하려면?

AutoCAD는 선종류 관리자에서 로드합니다. 여기서는 `-LINETYPE`을 입력하고 <Keyword id="Load" />를 고른 다음, `HIDDEN2`나 `ACAD_ISO02W100` 같은 선종류 이름을 입력하고 Enter 키를 눌러 acadiso.lin에서 찾습니다. <Keyword id="Set" />은 acadiso.lin에 있는 선종류를 현재로 설정하면서 로드합니다.
