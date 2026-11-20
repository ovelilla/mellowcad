---
title: "AutoCAD ARRAY(배열) 명령"
metaTitle: "캐드 어레이(ARRAY): 배열 사용법과 단축키 AR"
description: "AutoCAD 배열(ARRAY, AR), 캐드 어레이를 프롬프트 순서대로 설명합니다: 직사각형, 원형, 경로 배열을 작성 전에 실시간으로 편집합니다. 브라우저에서 무료로 해 볼 수 있습니다."
figure: "정사각형과 그 안의 원을 기본값으로 배열합니다. Enter 키로 직사각형 배열, 4열 3행이 됩니다."
sourceHash: "5e0a412c9f13"
---

ARRAY(배열) 명령은 선택한 객체를 패턴으로 복사합니다. 열과 행으로, 중심을 돌아, 또는 경로를 따라 복사합니다. 객체를 묻고 배열 유형을 묻는데, Enter 키는 직사각형 배열을 선택합니다. 그리고 선택 세트를 <Command id="ARRAYRECT" />, <Command id="ARRAYPOLAR" />, <Command id="ARRAYPATH" /> 명령에 넘기며, 이 명령들은 객체를 다시 묻지 않고 계속합니다. 각 명령은 배열을 바로 보여 주고, Enter 키로 작성할 때까지 옵션과 그립으로 실시간으로 편집합니다. 결과는 하나의 배열 객체이며, 연관이 아니라고 답했다면 낱개의 복사본입니다. 실행 전체가 명령 취소 한 단계이며, 명령 프롬프트에서 Enter 키를 누르면 ARRAY가 반복됩니다.

## Options

### Rectangular

열과 행, 원하면 Z 방향으로 쌓은 레벨입니다. <Command id="ARRAYRECT" /> 명령이 실행됩니다. 4열 3행으로 시작하며, 간격은 선택한 객체 크기의 1.5배입니다.

### PAth

선, 호, 원, 폴리선을 따라 배열합니다. <Command id="ARRAYPATH" /> 명령이 실행됩니다. 경로 곡선을 묻고 항목을 그 위에 놓으며, 각 항목은 경로가 도는 만큼 회전합니다.

### POlar

중심점을 돌아 배열합니다. <Command id="ARRAYPOLAR" /> 명령이 실행됩니다. 중심을 묻고 한 바퀴에 6개 항목으로 시작합니다.

## Missing

제안하는 유형은 항상 직사각형입니다. AutoCAD의 기본값을 정하는 시스템 변수 ARRAYTYPE을 읽지 않습니다.

## Questions

### 캐드 어레이 단축키는 무엇입니까?

`AR`을 입력하고 Enter 키나 Space 키를 누릅니다. 전체 명령 이름을 입력해도 되며, AutoCAD의 어느 언어 버전에서든 `_ARRAY`도 됩니다. <Command id="ARRAYRECT" />, <Command id="ARRAYPOLAR" />, <Command id="ARRAYPATH" /> 명령에는 단축키가 없으며, 전체 이름으로 입력하면 유형을 묻는 단계를 건너뜁니다.

### 원형 배열은 어떻게 만듭니까?

<Keyword id="POlar" /> 옵션을 선택하거나 <Command id="ARRAYPOLAR" /> 명령을 실행하고 중심점을 지정합니다. 선택한 객체가 그 둘레로 복사되며, 처음에는 6개 항목입니다. 개수는 <Keyword command="ARRAYPOLAR" id="Items" /> 옵션으로 바꾸고, 채울 각도는 <Keyword command="ARRAYPOLAR" id="Fill angle" /> 옵션으로 정합니다.

### 배열을 분해하려면 어떻게 합니까?

배열을 선택하고 <Command id="EXPLODE" /> 명령을 실행합니다. 배열이 항목의 객체들로 바뀌며, 각 객체는 원래 도면층에 놓입니다. 처음부터 낱개의 복사본을 얻으려면 Enter 키를 누르기 전에 <Keyword command="ARRAYRECT" id="ASsociative" /> 옵션에 <Keyword command="ARRAYRECT" id="No" />로 답합니다.

### 작성한 배열을 바꾸려면 어떻게 합니까?

배열을 선택합니다. 그립으로 바꿀 수 있습니다. 기준점의 사각형 그립은 배열을 이동하고, 화살표 그립은 개수와 간격을 정하며, 개수 화살표가 활성일 때 입력한 숫자가 개수가 됩니다. 특성 팔레트에는 열, 행, 간격 또는 항목과 각도가 나열되어 다시 입력할 수 있습니다. ARRAYEDIT는 아직 없습니다.
