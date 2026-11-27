// Generated from ko.json by `npm run locales`. Do not edit.
import type { EngineLocale } from "./types"

export const ko: EngineLocale = {
  "tag": "ko",
  "interface": {
    "tool": {
      "mesh3d": "3D 메쉬",
      "select": "선택",
      "line": "선",
      "polyline": "폴리선",
      "polyline3d": "3D 폴리선",
      "circle": "원",
      "circlediameter": "원, 중심점, 지름",
      "circle2p": "원, 2점",
      "circle3p": "원, 3점",
      "arc": "호",
      "arcsce": "호, 시작점, 중심점, 끝점",
      "arccse": "호, 중심점, 시작점, 끝점",
      "ellipse": "타원",
      "ellipsecenter": "타원, 중심점",
      "ellipsearc": "타원형 호",
      "spline": "스플라인",
      "splinedit": "스플라인 편집",
      "pedit": "폴리선 편집",
      "splinefit": "스플라인 맞춤",
      "splinecv": "스플라인 CV",
      "rectangle": "직사각형",
      "polygon": "폴리곤",
      "hatch": "해치",
      "hatchedit": "해치 편집(명령행)",
      "block": "블록 작성",
      "insert": "블록 삽입",
      "attedit": "속성 편집",
      "attdef": "속성 정의",
      "attdisp": "속성 화면표시",
      "purge": "소거",
      "text": "문자",
      "mtext": "여러 줄 문자",
      "textedit": "문자 편집",
      "dimlinear": "선형",
      "dimaligned": "정렬",
      "dimhorizontal": "수평",
      "dimvertical": "수직",
      "dimrotated": "회전된 치수",
      "dimradius": "반지름",
      "dimdiameter": "지름",
      "dimangular": "각도",
      "dimbaseline": "기준선",
      "dimcontinue": "연속",
      "dimspace": "공간 조정",
      "offset": "간격띄우기",
      "move": "이동",
      "copy": "복사",
      "stretch": "신축",
      "rotate": "회전",
      "scale": "축척",
      "mirror": "대칭",
      "arraycommand": "배열",
      "array": "직사각형 배열",
      "arraypolar": "원형 배열",
      "arraypath": "경로 배열",
      "trim": "자르기",
      "extend": "연장",
      "fillet": "모깎기",
      "chamfer": "모따기",
      "erase": "지우기",
      "explode": "분해",
      "join": "결합",
      "break": "끊기",
      "breakatpoint": "점에서 끊기",
      "matchprop": "특성 일치",
      "chprop": "특성 변경",
      "copyclip": "클립 복사",
      "cutclip": "잘라내기",
      "copybase": "기준점을 사용하여 복사",
      "paste": "붙여넣기",
      "measure": "측정",
      "measurearea": "면적",
      "id": "ID 점",
      "list": "리스트",
      "massprop": "영역/질량 특성",
      "zoom": "줌",
      "pan": "초점이동",
      "dashpan": "초점이동, 점",
      "dashdimstyle": "치수 스타일(명령행)",
      "ucs": "UCS",
      "ucsicon": "UCS 아이콘",
      "fill": "채우기",
      "ucsiconvariable": "UCS 아이콘(시스템 변수)",
      "plan": "평면도",
      "elev": "고도",
      "vpoint": "관측점",
      "view": "뷰 사전 설정",
      "orbit": "3D 궤도",
      "navvcube": "ViewCube",
      "vscurrent": "비주얼 스타일",
      "regen": "재생성",
      "regenall": "전체 재생성",
      "ltscale": "선종류 축척",
      "auprec": "각도 정밀도",
      "setvar": "변수 설정",
      "undo": "명령 취소",
      "mredo": "다중 명령 복구",
      "osnap": "객체 스냅 모드",
      "color": "색상",
      "linetype": "선종류",
      "dashlayer": "도면층(명령행)",
      "lweight": "선가중치",
      "snap": "스냅 모드",
      "region": "영역",
      "union": "합집합",
      "subtract": "차집합",
      "box": "상자",
      "wedge": "쐐기",
      "pyramid": "피라미드",
      "cylinder": "원통",
      "cone": "원추",
      "sphere": "구",
      "torus": "토러스",
      "intersect": "교집합",
      "extrude": "돌출",
      "revolve": "회전",
      "presspull": "눌러 당기기",
      "slice": "슬라이스",
      "section": "단면",
      "filletedge": "모서리 모깎기",
      "chamferedge": "모서리 모따기",
      "solidedit": "솔리드 편집",
      "solideditextrude": "면 돌출",
      "solideditmove": "면 이동",
      "solideditrotate": "면 회전",
      "solideditoffset": "면 간격띄우기",
      "solidedittaper": "면 테이퍼",
      "solideditdelete": "면 삭제",
      "solideditcopy": "면 복사",
      "point": "다중 점",
      "divide": "등분할",
      "measuresegments": "길이 분할",
      "ptype": "점 스타일",
      "solid": "2D 솔리드",
      "face3d": "3D 면",
      "leader": "지시선",
      "wipeout": "객체 가리기",
      "xline": "구성선",
      "ray": "광선",
      "minsert": "다중 삽입 블록"
    },
    "description": {
      "U": "가장 최근의 작업을 취소합니다",
      "REDO": "앞서 실행한 UNDO 또는 U 명령의 효과를 취소합니다",
      "SNAP": "커서 이동을 스냅 간격으로 제한합니다",
      "-OSNAP": "활성 객체 스냅 모드를 설정합니다",
      "FROM": "한 명령 내에서 참조점으로부터 간격띄우기된 점을 찾습니다",
      "NEW": "새 도면 파일을 작성합니다",
      "QNEW": "새 도면 파일을 작성합니다",
      "QSAVE": "현재 도면을 저장합니다",
      "SAVEAS": "현재 도면을 새 파일 이름으로 저장합니다",
      "SAVE": "현재 도면을 저장합니다",
      "OPEN": "기존의 도면 파일을 엽니다",
      "DXFIN": "DXF 파일을 엽니다",
      "DXFOUT": "현재 도면을 DXF 파일로 저장합니다",
      "PASTECLIP": "클립보드의 객체를 현재 도면에 붙여 넣습니다",
      "DIMSTYLE": "치수 스타일을 작성하고 수정합니다",
      "STYLE": "문자 스타일을 작성하고 수정합니다",
      "INSERT": "블록 팔레트에서 블록을 삽입합니다",
      "BLOCKSPALETTE": "블록 팔레트를 엽니다",
      "PURGE": "사용하지 않는 블록 정의를 제거합니다",
      "LAYER": "도면층 및 도면층 특성을 관리합니다",
      "LAYERCLOSE": "도면층 특성 관리자를 닫습니다",
      "PROPERTIES": "선택한 객체의 특성을 표시합니다",
      "PROPERTIESCLOSE": "특성 팔레트를 닫습니다",
      "UNITS": "좌표 및 거리에 대해 표시된 정밀도와 형식을 조정합니다",
      "CLEANSCREENON": "화면에서 도구막대와 팔레트를 지웁니다",
      "CLEANSCREENOFF": "화면 정리 이전의 화면표시로 복원합니다",
      "RIBBON": "리본을 표시합니다",
      "RIBBONCLOSE": "리본을 숨깁니다"
    },
    "snap": {
      "endpoint": "끝점",
      "midpoint": "중간점",
      "center": "중심",
      "node": "노드",
      "intersection": "교차점",
      "apparentIntersection": "가상 교차점",
      "perpendicular": "직교",
      "tangent": "접점",
      "insertion": "삽입",
      "extension": "연장선",
      "parallel": "평행",
      "quadrant": "사분점",
      "nearest": "근처점"
    },
    "color": {
      "red": "빨간색",
      "yellow": "노란색",
      "green": "초록색",
      "cyan": "하늘색",
      "blue": "파란색",
      "magenta": "선홍색",
      "white": "흰색"
    },
    "byLayer": "ByLayer",
    "colorNumber": [
      "색상 ",
      [
        "index"
      ]
    ],
    "view": {
      "Top": "평면도",
      "Bottom": "저면도",
      "Front": "정면도",
      "BAck": "배면도",
      "Left": "좌측면도",
      "Right": "우측면도",
      "SWiso": "남서 등각투영",
      "SEiso": "남동 등각투영",
      "NEiso": "북동 등각투영",
      "NWiso": "북서 등각투영",
      "custom": "사용자 뷰"
    },
    "visualStyle": {
      "2dWireframe": "2D 와이어프레임",
      "hidden": "숨김",
      "conceptual": "개념"
    },
    "visualStyleFast": "(빠름)",
    "viewCube": {
      "face": {
        "top": "평면도",
        "bottom": "저면도",
        "front": "정면도",
        "back": "배면도",
        "left": "좌측면도",
        "right": "우측면도"
      },
      "compass": {
        "N": "북",
        "E": "동",
        "S": "남",
        "W": "서"
      }
    },
    "entity": {
      "polygonMesh": [
        [
          "count",
          2,
          {
            "other": "폴리곤 메쉬"
          }
        ]
      ],
      "line": [
        [
          "count",
          2,
          {
            "other": "선"
          }
        ]
      ],
      "circle": [
        [
          "count",
          2,
          {
            "other": "원"
          }
        ]
      ],
      "arc": [
        [
          "count",
          2,
          {
            "other": "호"
          }
        ]
      ],
      "ellipse": [
        [
          "count",
          2,
          {
            "other": "타원"
          }
        ]
      ],
      "spline": [
        [
          "count",
          2,
          {
            "other": "스플라인"
          }
        ]
      ],
      "polyline": [
        [
          "count",
          2,
          {
            "other": "폴리선"
          }
        ]
      ],
      "polyline3d": [
        [
          "count",
          2,
          {
            "other": "3D 폴리선"
          }
        ]
      ],
      "text": [
        [
          "count",
          2,
          {
            "other": "문자"
          }
        ]
      ],
      "mtext": [
        [
          "count",
          2,
          {
            "other": "여러 줄 문자"
          }
        ]
      ],
      "attdef": [
        [
          "count",
          2,
          {
            "other": "속성 정의"
          }
        ]
      ],
      "dimension": [
        [
          "count",
          2,
          {
            "other": "치수"
          }
        ]
      ],
      "hatch": [
        [
          "count",
          2,
          {
            "other": "해치"
          }
        ]
      ],
      "insert": [
        [
          "count",
          2,
          {
            "other": "블록 참조"
          }
        ]
      ],
      "solid3d": [
        [
          "count",
          2,
          {
            "other": "3D 솔리드"
          }
        ]
      ],
      "region": [
        [
          "count",
          2,
          {
            "other": "영역"
          }
        ]
      ],
      "point": [
        [
          "count",
          2,
          {
            "other": "점"
          }
        ]
      ],
      "solid2d": [
        [
          "count",
          2,
          {
            "other": "솔리드"
          }
        ]
      ],
      "face3d": [
        [
          "count",
          2,
          {
            "other": "3D 면"
          }
        ]
      ],
      "leader": [
        [
          "count",
          2,
          {
            "other": "지시선"
          }
        ]
      ],
      "wipeout": [
        [
          "count",
          2,
          {
            "other": "객체 가리기"
          }
        ]
      ],
      "image": [
        [
          "count",
          2,
          {
            "other": "래스터 이미지"
          }
        ]
      ],
      "table": [
        [
          "count",
          2,
          {
            "other": "테이블"
          }
        ]
      ],
      "mleader": [
        [
          "count",
          2,
          {
            "other": "다중 지시선"
          }
        ]
      ],
      "xline": [
        [
          "count",
          2,
          {
            "other": "X선"
          }
        ]
      ],
      "ray": [
        [
          "count",
          2,
          {
            "other": "광선"
          }
        ]
      ]
    },
    "array": {
      "rectangular": "배열(직사각형)",
      "polar": "배열(원형)",
      "path": "배열(경로)"
    },
    "property": {
      "title": {
        "ellipticalArc": "타원형 호",
        "objects": [
          [
            "count",
            2,
            {
              "other": [
                0,
                "개의 객체"
              ]
            }
          ]
        ],
        "all": [
          "전체 (",
          [
            "count"
          ],
          ")"
        ],
        "type": [
          [
            "type"
          ],
          " (",
          [
            "count"
          ],
          ")"
        ],
        "linearDimension": "회전된 치수",
        "alignedDimension": "정렬된 치수",
        "angularDimension": "각도 치수",
        "radiusDimension": "반지름 치수",
        "diameterDimension": "지름 치수",
        "minsert": "다중 삽입 블록"
      },
      "group": {
        "mesh": "메쉬",
        "geometry": "형상",
        "solidHistory": "솔리드 사용 내역",
        "endpoints": "끝점",
        "center": "중심",
        "text": "문자",
        "position": "위치",
        "dimension": "치수",
        "definitionPoints": "정의점",
        "pattern": "패턴",
        "block": "블록",
        "attributes": "속성",
        "misc": "기타",
        "dataPoints": "데이터 점",
        "linesArrows": "선 및 화살표",
        "fit": "맞춤",
        "primaryUnits": "1차 단위"
      },
      "row": {
        "meshMClosed": "M 닫힘",
        "meshNClosed": "N 닫힘",
        "meshMDensity": "M 밀도",
        "meshNDensity": "N 밀도",
        "meshMVertexCount": "M 정점 수",
        "meshNVertexCount": "N 정점 수",
        "length": "길이",
        "angle": "각도",
        "deltaX": "X 증분",
        "deltaY": "Y 증분",
        "deltaZ": "Z 증분",
        "startX": "X 시작",
        "startY": "Y 시작",
        "startZ": "Z 시작",
        "endX": "X 끝",
        "endY": "Y 끝",
        "endZ": "Z 끝",
        "centerX": "X 중심",
        "centerY": "Y 중심",
        "centerZ": "Z 중심",
        "radius": "반지름",
        "diameter": "지름",
        "circumference": "원주",
        "area": "면적",
        "normalX": "법선 X",
        "normalY": "법선 Y",
        "normalZ": "법선 Z",
        "x": "X",
        "y": "Y",
        "z": "Z",
        "elevation": "고도",
        "thickness": "두께",
        "linetypeScale": "선종류 축척",
        "startAngle": "시작 각도",
        "endAngle": "끝 각도",
        "totalAngle": "전체 각도",
        "arcLength": "호 길이",
        "majorRadius": "장축 반지름",
        "minorRadius": "단축 반지름",
        "radiusRatio": "반지름 비율",
        "majorAxisVectorX": "장축 벡터 X",
        "majorAxisVectorY": "장축 벡터 Y",
        "majorAxisVectorZ": "장축 벡터 Z",
        "minorAxisVectorX": "단축 벡터 X",
        "minorAxisVectorY": "단축 벡터 Y",
        "minorAxisVectorZ": "단축 벡터 Z",
        "vertices": "정점",
        "segments": "세그먼트",
        "solidType": "솔리드 유형",
        "baseRadius": "밑면 반지름",
        "topRadius": "상단 반지름",
        "sides": "면",
        "elliptical": "타원형",
        "baseMajorRadius": "기준 장축 반지름",
        "baseMinorRadius": "기준 단축 반지름",
        "topMajorRadius": "상단 장축 반지름",
        "topMinorRadius": "상단 단축 반지름",
        "torusRadius": "토러스 반지름",
        "tubeRadius": "튜브 반지름",
        "currentVertex": "현재 정점",
        "vertex": "정점",
        "startSegmentWidth": "시작 세그먼트 폭",
        "endSegmentWidth": "끝 세그먼트 폭",
        "globalWidth": "전역 폭",
        "closed": "닫기",
        "contents": "내용",
        "justify": "자리맞추기",
        "height": "높이",
        "taperAngle": "테이퍼 각도",
        "angleOfRevolution": "회전 각도",
        "axisDirectionX": "X 축 방향",
        "axisDirectionY": "Y 축 방향",
        "axisDirectionZ": "Z 축 방향",
        "history": "사용 내역",
        "rotation": "회전",
        "lineSpaceFactor": "행 간격 비율",
        "lineSpaceDistance": "행 간격 거리",
        "lineSpaceStyle": "행 간격 스타일",
        "definedWidth": "정의된 폭",
        "textHeight": "문자 높이",
        "textAlignmentX": "문자 정렬 X",
        "textAlignmentY": "문자 정렬 Y",
        "textAlignmentZ": "문자 정렬 Z",
        "measurement": "측정 단위",
        "textOverride": "문자 재지정",
        "type": "유형",
        "vertexX": "정점 X",
        "vertexY": "정점 Y",
        "vertexZ": "정점 Z",
        "fitSmooth": "맞춤/부드러움",
        "firstX": "첫 번째 점 X",
        "firstY": "첫 번째 점 Y",
        "secondX": "두 번째 점 X",
        "secondY": "두 번째 점 Y",
        "pattern": "패턴",
        "scale": "축척",
        "boundaries": "경계",
        "patternName": "패턴 이름",
        "annotative": "주석",
        "originX": "원점 X",
        "originY": "원점 Y",
        "associative": "연관",
        "islandDetectionStyle": "고립영역 탐지 스타일",
        "edge1": "모서리 1",
        "edge2": "모서리 2",
        "edge3": "모서리 3",
        "edge4": "모서리 4",
        "gradientName": "그라데이션 이름",
        "color1": "색상 1",
        "color2": "색상 2",
        "gradientAngle": "그라데이션 각도",
        "centered": "중심",
        "cumulativeArea": "누적 영역",
        "name": "이름",
        "tag": "태그",
        "prompt": "프롬프트",
        "value": "값",
        "invisible": "숨김",
        "constant": "상수",
        "verify": "검증",
        "preset": "사전 설정",
        "lockPosition": "잠금 위치",
        "method": "메서드",
        "degree": "차수",
        "knotParameterization": "매듭 매개변수화",
        "numberOfFitPoints": "맞춤점의 수",
        "currentFitPoint": "현재 맞춤점",
        "fitPointX": "맞춤점 X",
        "fitPointY": "맞춤점 Y",
        "fitPointZ": "맞춤점 Z",
        "numberOfControlPoints": "조정점의 수",
        "currentControlPoint": "현재 조정점",
        "controlPointX": "조정점 X",
        "controlPointY": "조정점 Y",
        "controlPointZ": "조정점 Z",
        "weight": "가중치",
        "width": "폭",
        "cvFrame": "CV 프레임",
        "periodic": "주기적",
        "planar": "평면형",
        "startTangentVectorX": "시작 접선 벡터 X",
        "startTangentVectorY": "시작 접선 벡터 Y",
        "startTangentVectorZ": "시작 접선 벡터 Z",
        "endTangentVectorX": "끝 접선 벡터 X",
        "endTangentVectorY": "끝 접선 벡터 Y",
        "endTangentVectorZ": "끝 접선 벡터 Z",
        "fitTolerance": "공차 맞춤",
        "positionX": "X 위치",
        "positionY": "Y 위치",
        "positionZ": "Z 위치",
        "insertionPointX": "삽입점 X",
        "insertionPointY": "삽입점 Y",
        "insertionPointZ": "삽입점 Z",
        "minsertColumns": "열",
        "minsertColumnSpacing": "열 간격 조정",
        "minsertRows": "행",
        "minsertRowSpacing": "행 간격 조정",
        "basePointX": "기준점 X",
        "basePointY": "기준점 Y",
        "basePointZ": "기준점 Z",
        "secondPointX": "두 번째 점 X",
        "secondPointY": "두 번째 점 Y",
        "secondPointZ": "두 번째 점 Z",
        "directionVectorX": "방향 벡터 X",
        "directionVectorY": "방향 벡터 Y",
        "directionVectorZ": "방향 벡터 Z",
        "scaleX": "X 축척",
        "scaleY": "Y 축척",
        "scaleZ": "Z 축척",
        "showHistory": "사용 내역 표시",
        "baseX": "기준 X",
        "baseY": "기준 Y",
        "baseZ": "기준 Z",
        "pathLength": "경로 길이",
        "columns": "열",
        "columnSpacing": "열 간격 조정",
        "rows": "행",
        "rowSpacing": "행 간격 조정",
        "rowElevationIncrement": "행 고도 증분",
        "levels": "수준",
        "levelSpacing": "레벨 간격",
        "includedAxisAngle": "축 사이각",
        "direction": "방향",
        "items": "항목",
        "angleBetweenItems": "항목 사이의 각도",
        "fillAngle": "채울 각도",
        "rotateItems": "항목 회전",
        "itemSpacing": "항목 간격",
        "alignItems": "항목 정렬",
        "arrowSize": "화살표 크기",
        "centerMarkSize": "중심 표식 크기",
        "extLineExt": "치수보조선 연장",
        "extLineOffset": "치수보조선 간격띄우기",
        "textOffset": "문자 간격띄우기",
        "textPositionX": "문자 위치 X",
        "textPositionY": "문자 위치 Y",
        "textRotation": "문자 회전",
        "dimScaleOverall": "전체 치수 축척",
        "decimalSeparator": "소수 구분 기호",
        "suppressTrailingZeros": "후행 0 억제",
        "precision": "정밀도",
        "perimeter": "둘레",
        "arrow": "화살표",
        "textPosVert": "문자 세로 위치"
      },
      "value": {
        "meshFitNone": "없음",
        "fitQuadratic": "2차원",
        "fitCubic": "3차원",
        "fitBezier": "베지어",
        "yes": "예",
        "no": "아니오",
        "none": "—",
        "fitNone": "없음",
        "atLeast": "최소한",
        "exactly": "정확히",
        "fitPoints": "맞춤",
        "controlVertices": "조정 정점",
        "box": "상자",
        "wedge": "쐐기",
        "pyramid": "피라미드",
        "inscribed": "내접",
        "circumscribed": "외접",
        "cylinder": "원통",
        "cone": "원추",
        "sphere": "구",
        "torus": "토러스",
        "chord": "현",
        "sqrtChord": "SqrtChord",
        "uniform": "균일",
        "custom": "사용자화",
        "show": "표시",
        "hide": "숨기기",
        "counterClockwise": "시계 반대 방향",
        "clockwise": "시계 방향",
        "divide": "등분할",
        "historyNone": "없음",
        "measure": "길이 분할",
        "predefined": "미리 정의",
        "userDefined": "사용자 정의",
        "customPattern": "사용자",
        "edgeVisible": "표시",
        "edgeHidden": "숨김",
        "gradient": "그라데이션",
        "gradientLinear": "선형",
        "gradientCylinder": "원통형",
        "gradientInvCylinder": "반전된 원통형",
        "gradientSpherical": "구형",
        "gradientHemispherical": "반구형",
        "gradientCurved": "곡선형",
        "gradientInvSpherical": "반전된 구형",
        "gradientInvHemispherical": "반전된 반구형",
        "gradientInvCurved": "반전된 곡선형",
        "outer": "외부",
        "extrusion": "돌출",
        "revolve": "회전",
        "lineWithNoArrow": "화살표 없는 선",
        "splineWithNoArrow": "화살표 없는 스플라인",
        "lineWithArrow": "화살표 있는 선",
        "splineWithArrow": "화살표 있는 스플라인",
        "closedFilled": "닫고 채움",
        "centered": "중심",
        "above": "위"
      },
      "justify": {
        "left": "왼쪽",
        "center": "중심",
        "right": "오른쪽",
        "middle": "중간",
        "tl": "맨 위 왼쪽",
        "tc": "맨 위 중심",
        "tr": "맨 위 오른쪽",
        "ml": "중간 왼쪽",
        "mc": "중간 중심",
        "mr": "중간 오른쪽",
        "bl": "맨 아래 왼쪽",
        "bc": "맨 아래 중심",
        "br": "맨 아래 오른쪽"
      },
      "dimensionKind": {
        "linear": "선형",
        "aligned": "정렬",
        "angular": "각도",
        "radius": "반지름",
        "diameter": "지름"
      }
    }
  }
}
