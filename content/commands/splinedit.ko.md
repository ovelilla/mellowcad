---
title: "AutoCAD SPLINEDIT(스플라인 편집) 명령"
metaTitle: "오토캐드 스플라인 편집(SPLINEDIT)과 단축키 SPE"
description: "AutoCAD SPLINEDIT(스플라인 편집, SPE)를 프롬프트 순서대로: 닫기, 결합, 맞춤 데이터, 정점 편집, 폴리선으로 변환, 반전. 브라우저에서 무료로 해 보십시오."
figure: "다섯 맞춤점을 지나는 스플라인을 SPLINEDIT로 닫은 모습: 모든 점을 지나는 매끄러운 고리입니다."
sourceHash: "bedcaab2fac3"
---

SPLINEDIT(스플라인 편집) 명령은 스플라인을 편집합니다. `Select spline:`에서 스플라인을 선택하거나 명령 전에 선택해 둡니다. 스플라인을 두 번 클릭해도 SPLINEDIT가 실행됩니다. 그 밖의 객체에는 <Message id="objectNotSpline" />라고 표시하고 다시 묻습니다. PEDIT의 스플라인으로 맞춘 폴리선은 아무 표시 없이 같은 곡선의 스플라인으로 바뀝니다. 그런 다음 <Keyword id="eXit" />나 Enter 키를 누를 때까지 옵션을 거듭 묻고, 각 옵션은 바로 적용됩니다. 스플라인에는 맞춤점의 그립이 표시되고, 정점을 편집하는 동안에는 조정 정점과 그 프레임이 표시됩니다. 편집 전체가 <Command id="U" />로 되돌릴 수 있는 한 단계입니다. 어느 프롬프트에서든 `'ZOOM`을 입력할 수 있습니다.

## Options

### Close

스플라인을 매끄럽게 닫습니다. 맞춤 스플라인은 맞춤점을 지나고, CV 스플라인은 정점 위에서 닫힙니다. 닫힌 스플라인에서는 이 옵션이 <Keyword id="Open" />이 되고, <Keyword id="Join" />은 제시되지 않습니다.

### Join

스플라인에 대한 JOIN의 규칙에 따라, 끝에서 만나는 열린 곡선을 결합하고 몇 개를 결합했는지 알려 줍니다.

### Fit data

스플라인이 지나는 점을 편집합니다. 맞춤점이 없는 CV 스플라인에는 먼저 곡선 위에 맞춤점을 줍니다. 옵션은 다음과 같습니다. <Keyword id="Add" />는 맞춤점 하나를 선택하고 그 뒤에 새 점을 거듭 추가합니다(열린 스플라인의 첫 번째 점에서는 <Keyword id="After" />나 <Keyword id="Before" />). <Keyword id="Delete" />는 맞춤점을 두 개(닫힌 스플라인은 세 개)가 남을 때까지 제거합니다(<Message id="cannotDeleteBeyond" />). <Keyword id="Move" />는 <Keyword id="Next" />와 <Keyword id="Previous" />, 또는 <Keyword id="Select point" />로 맞춤점을 옮겨 다니며 현재 점을 지정한 점으로 이동합니다. <Keyword id="Purge" />는 맞춤 데이터를 버리고 CV 스플라인으로 남깁니다. <Keyword id="Tangents" />는 시작과 끝의 방향을 설정하거나 <Keyword id="System default" />를 씁니다. <Keyword id="Close" />와 <Keyword id="eXit" />는 첫 프롬프트에서와 같습니다. 맞춤점이 아닌 곳을 선택하면 <Message id="notAFitPoint" />라고 표시합니다.

### Edit vertex

조정 정점을 편집합니다. 맞춤 스플라인은 첫 편집에서 맞춤 데이터를 잃습니다. <Keyword id="Add" />는 스플라인 위에서 지정한 점에 정점을 넣고, <Keyword id="Delete" />는 정점을 두 개(닫힌 스플라인은 세 개)가 남을 때까지 제거합니다. <Keyword id="Elevate order" />는 차수를 26까지 올리며, 내리지는 않습니다. <Keyword id="Move" />는 <Keyword id="Fit data" />의 <Keyword id="Move" />처럼 정점을 옮겨 다니며 이동합니다. <Keyword id="Weight" />는 <Message id="splineMadeRational" /> 다음에 정점의 가중치를 설정해 곡선이 정점에 더 가까워지거나 멀어지게 합니다. 정점이 아닌 곳을 선택하면 <Message id="notAControlVertex" />라고 표시합니다.

### convert to Polyline

0부터 99까지(기본값 10)의 정밀도를 묻고, 스플라인을 직선 세그먼트의 폴리선으로 바꿉니다. 정밀도가 높을수록 세그먼트가 많아집니다. 스플라인이 XY 평면에 평행하게 평평하지 않으면 3D 폴리선이 됩니다. 이 옵션은 명령을 끝냅니다. 정밀도는 세션 동안 유지되며, PEDIT의 변환도 이 값을 씁니다.

### Reverse

스플라인의 방향을 뒤집어 첫 번째 점이 마지막이 됩니다. <Message id="splineReversed" />.

### Undo

마지막 옵션을 되돌리며, <Keyword id="Fit data" />나 <Keyword id="Edit vertex" />는 전체를 한 번에 되돌립니다. 되돌릴 것이 없으면 <Message id="commandCompletelyUndone" />.

### eXit

Enter 키처럼 명령을 끝냅니다.

## Missing

맞춤점이나 정점에 날카로운 구석을 만드는 Kink, 공차 안에서 스플라인을 다시 맞추는 toLerance, 닫힌 스플라인의 접선. <Keyword id="convert to Polyline" />은 맞춤 스플라인에서 AutoCAD보다 훨씬 많은 정점을 만들고, 호는 만들지 않으며, 항상 스플라인을 대체합니다. `Select spline:`에서의 그룹. 점을 옮겨 다니는 동안 AutoCAD가 현재 점에 그리는 `+`.

## Questions

### AutoCAD 스플라인 편집(SPLINEDIT)의 단축키는 무엇입니까?

`SPE`를 입력하고 Enter 키나 Space 키를 누릅니다. 전체 명령 이름을 입력해도 되고, AutoCAD의 모든 언어 버전에서 `_SPLINEDIT`도 됩니다. 스플라인을 두 번 클릭해도 실행됩니다.

### 스플라인을 폴리선으로 바꾸려면 어떻게 합니까?

SPLINEDIT를 실행하고 스플라인을 선택한 다음 <Keyword id="convert to Polyline" />을 고릅니다. 정밀도 10이면 매끄러운 폴리선이 됩니다. 스플라인에 <Command id="PEDIT" />를 실행해도 변환할지 묻습니다.

### 스플라인의 점을 추가하거나 옮기려면 어떻게 합니까?

스플라인이 지나는 점을 다루려면 <Keyword id="Fit data" />를 고른 다음 <Keyword id="Add" />나 <Keyword id="Move" />를 고릅니다. 스플라인의 틀이 되는 조정 정점을 다루려면 <Keyword id="Edit vertex" />를 고릅니다.

### 스플라인을 닫으려면 어떻게 합니까?

<Keyword id="Close" />를 고릅니다. 만나는 곳에 구석 없이 매끄럽게 닫힙니다. <Keyword id="Open" />은 다시 엽니다.

### 스플라인 두 개를 결합하려면 어떻게 합니까?

<Keyword id="Join" />을 고르고 이 스플라인의 끝과 만나는 스플라인을 선택하거나, <Command id="JOIN" />을 씁니다.
