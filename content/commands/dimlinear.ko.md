---
title: "오토캐드 치수 기입: DIMLINEAR(선형) 명령"
metaTitle: "오토캐드 치수 명령: 선형 치수(DIMLINEAR)와 단축키 DLI"
description: "AutoCAD 선형 치수(DIMLINEAR, DLI)로 치수를 기입하는 방법을 프롬프트 순서대로 설명합니다: 두 원점이나 객체, 그리고 수평 또는 수직 치수선. 브라우저에서 무료로 사용해 보세요."
figure: "직사각형에 치수를 두 번 기입합니다. 위쪽 모서리는 두 구석으로, 오른쪽 모서리는 Enter 키를 누르고 모서리를 선택하여 기입합니다."
sourceHash: "e48a0a6f18c9"
---

DIMLINEAR(선형) 명령은 두 점 사이의 거리를 X나 Y 방향으로 재서 치수로 그립니다. 치수보조선 두 개, 화살촉이 있는 치수선, 그 위의 측정값으로 이루어집니다. 첫 번째와 두 번째 치수보조선 원점을 지정한 다음 치수선 위치를 지정하며, AutoCAD와 같이 놓는 위치가 방향을 정합니다. 두 점의 위나 아래에 놓으면 수평으로, 옆에 놓으면 수직으로 잽니다. 대신 첫 번째 프롬프트에서 Enter 키를 누르고 선, 호, 폴리선 세그먼트, 원을 선택하면, 그 두 끝점이나 원의 지름이 원점이 됩니다. 그러면 명령행에 측정값이 표시되고 명령이 끝납니다.

치수는 현재 치수 스타일로 그려지며, 새 도면에서는 ISO-25입니다. AutoCAD의 미터법 도면처럼 소수점은 쉼표이고 뒤의 0은 붙지 않습니다. 입력해서만 실행할 수 있는 <Command id="DIMHORIZONTAL" />, <Command id="DIMVERTICAL" />, <Command id="DIMROTATED" /> 명령은 한 방향으로 고정된 DIMLINEAR입니다.

## Options

### Text

측정값 대신 쓸 문자를 묻습니다. 측정값이 기본값으로 제시되므로 Enter 키는 측정값을 유지합니다. 입력하는 문자에서 `<>`는 측정값을 나타내므로, `<> mm`는 측정값 뒤에 단위를 붙여 씁니다.

### Angle

문자의 각도를 묻습니다. 그러면 문자가 치수선을 따르지 않고 그 각도로 그려집니다. 0은 다시 치수선을 따르게 합니다.

### Horizontal

치수선을 어디에 놓든 X 방향으로 재며, 치수선은 수평으로 유지됩니다. 그러면 프롬프트에는 <Keyword id="Text" />와 <Keyword id="Angle" /> 옵션만 남습니다.

### Vertical

치수선을 어디에 놓든 Y 방향으로 재며, 치수선은 수직으로 유지됩니다.

### Rotated

치수선의 각도(기본값 `0`)를 묻고, 원점 사이의 거리를 그 방향으로 잽니다. 기울어진 모서리에서 모서리 자체의 각도를 주면 <Command id="DIMALIGNED" /> 명령처럼 길이를 잽니다.

## Missing

여러 줄 문자 옵션이 없습니다. 치수 문자는 한 줄이며, 문자 편집기가 아니라 명령행에서 <Keyword id="Text" /> 옵션으로 정합니다. <Keyword id="Angle" /> 옵션으로 각도를 정하면 AutoCAD는 문자를 치수선 위 가운데에 놓지만, 여기서는 각도가 없을 때와 같이 치수선 위쪽에 남습니다. 치수는 연관되지 않으므로, 잰 객체를 따라가지 않습니다.

## Questions

### 오토캐드 선형 치수 단축키는 무엇입니까?

`DLI` 또는 `DIMLIN`을 입력하고 Enter 키나 Space 키를 누릅니다. 전체 명령 이름을 입력해도 되며, AutoCAD의 어느 언어 버전에서든 `_DIMLINEAR`도 됩니다.

### 오토캐드의 치수 명령에는 어떤 것이 있습니까?

수평 거리와 수직 거리는 <Command id="DIMLINEAR" />, 기울어진 모서리를 따른 거리는 <Command id="DIMALIGNED" />, 호와 원은 <Command id="DIMRADIUS" />와 <Command id="DIMDIAMETER" />, 각도는 <Command id="DIMANGULAR" />, 체인은 <Command id="DIMCONTINUE" />와 <Command id="DIMBASELINE" />, 간격 맞추기는 <Command id="DIMSPACE" />, 모양은 <Command id="DIMSTYLE" /> 명령입니다. 하나의 프롬프트에서 어떤 종류든 만드는 AutoCAD의 DIM과 여러 객체에 한 번에 치수를 기입하는 QDIM은 MellowCAD에 아직 없습니다.

### 객체를 바꿔도 치수가 따라가지 않는 이유는 무엇입니까?

<Message id="nonAssociativeDimension" />가 말하듯 MellowCAD의 치수는 아직 연관되지 않습니다. 치수는 지정받은 점을 유지합니다. 함께 늘립니다. <Command id="STRETCH" /> 명령의 걸치기 윈도우 하나로 옮길 끝과 그곳의 치수 원점을 함께 잡으면 측정값이 다시 계산됩니다. 또는 원점의 그립을 새 위치로 끕니다.

### 치수 문자와 화살표의 크기를 바꾸려면 어떻게 합니까?

AutoCAD와 같이 치수 스타일에서 바꿉니다. <Command id="DIMSTYLE" /> 명령(`D`)이 치수 스타일을 엽니다. AutoCAD에서는 치수 스타일 관리자이고, 여기서는 스타일 팔레트입니다. 현재 스타일의 문자 높이, 화살표 크기, 전체 축척, 소수 자릿수를 거기서 정하며, 그 스타일의 모든 치수가 따릅니다.
