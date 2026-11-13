import type { Linetype } from "./linetypes"

/**
 * acadiso.lin, the linetype file a metric drawing (MEASUREMENT 1) loads from,
 * as AutoCAD 2027's English install ships it (`R26.0/enu/support/`), in the
 * file's order, which -LINETYPE's Load and `?` follow (probe ltype/p10). Each
 * definition is quoted verbatim above its data; a description is cut at 47
 * characters, as AutoCAD loads it (ltype/p06), and the JIS ones drop the byte
 * 0x81 of their full-width space, as AutoCAD does (ltype/p10). A shape is
 * named in the file and numbered in its shape file: ltypeshp.shx's CIRC1 133,
 * BOX 132, TRACK1 130, ZIG 131 and BAT 134, as AutoCAD writes them (ltype/p06,
 * p10; the DesignCenter sample's FENCELINE2).
 */
export const ACADISO_LIN: readonly Linetype[] = [
  // *BORDER,Border __ __ . __ __ . __ __ . __ __ . __ __ .
  // A, 12.7, -6.35, 12.7, -6.35, 0, -6.35
  {
    name: "BORDER",
    description: "Border __ __ . __ __ . __ __ . __ __ . __ __ .",
    pattern: [12.7, -6.35, 12.7, -6.35, 0, -6.35],
  },
  // *BORDER2,Border (.5x) __.__.__.__.__.__.__.__.__.__.__.
  // A, 6.35, -3.175, 6.35, -3.175, 0, -3.175
  {
    name: "BORDER2",
    description: "Border (.5x) __.__.__.__.__.__.__.__.__.__.__.",
    pattern: [6.35, -3.175, 6.35, -3.175, 0, -3.175],
  },
  // *BORDERX2,Border (2x) ____  ____  .  ____  ____  .  ___
  // A, 25.4, -12.7, 25.4, -12.7, 0, -12.7
  {
    name: "BORDERX2",
    description: "Border (2x) ____  ____  .  ____  ____  .  ___",
    pattern: [25.4, -12.7, 25.4, -12.7, 0, -12.7],
  },
  // *CENTER,Center ____ _ ____ _ ____ _ ____ _ ____ _ ____
  // A, 31.75, -6.35, 6.35, -6.35
  {
    name: "CENTER",
    description: "Center ____ _ ____ _ ____ _ ____ _ ____ _ ____",
    pattern: [31.75, -6.35, 6.35, -6.35],
  },
  // *CENTER2,Center (.5x) ___ _ ___ _ ___ _ ___ _ ___ _ ___
  // A, 19.05, -3.175, 3.175, -3.175
  {
    name: "CENTER2",
    description: "Center (.5x) ___ _ ___ _ ___ _ ___ _ ___ _ ___",
    pattern: [19.05, -3.175, 3.175, -3.175],
  },
  // *CENTERX2,Center (2x) ________  __  ________  __  _____
  // A, 63.5, -12.7, 12.7, -12.7
  {
    name: "CENTERX2",
    description: "Center (2x) ________  __  ________  __  _____",
    pattern: [63.5, -12.7, 12.7, -12.7],
  },
  // *DASHDOT,Dash dot __ . __ . __ . __ . __ . __ . __ . __
  // A, 12.7, -6.35, 0, -6.35
  {
    name: "DASHDOT",
    description: "Dash dot __ . __ . __ . __ . __ . __ . __ . __",
    pattern: [12.7, -6.35, 0, -6.35],
  },
  // *DASHDOT2,Dash dot (.5x) _._._._._._._._._._._._._._._.
  // A, 6.35, -3.175, 0, -3.175
  {
    name: "DASHDOT2",
    description: "Dash dot (.5x) _._._._._._._._._._._._._._._.",
    pattern: [6.35, -3.175, 0, -3.175],
  },
  // *DASHDOTX2,Dash dot (2x) ____  .  ____  .  ____  .  ___
  // A, 25.4, -12.7, 0, -12.7
  {
    name: "DASHDOTX2",
    description: "Dash dot (2x) ____  .  ____  .  ____  .  ___",
    pattern: [25.4, -12.7, 0, -12.7],
  },
  // *DASHED,Dashed __ __ __ __ __ __ __ __ __ __ __ __ __ _
  // A, 12.7, -6.35
  {
    name: "DASHED",
    description: "Dashed __ __ __ __ __ __ __ __ __ __ __ __ __ _",
    pattern: [12.7, -6.35],
  },
  // *DASHED2,Dashed (.5x) _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
  // A, 6.35, -3.175
  {
    name: "DASHED2",
    description: "Dashed (.5x) _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _",
    pattern: [6.35, -3.175],
  },
  // *DASHEDX2,Dashed (2x) ____  ____  ____  ____  ____  ___
  // A, 25.4, -12.7
  {
    name: "DASHEDX2",
    description: "Dashed (2x) ____  ____  ____  ____  ____  ___",
    pattern: [25.4, -12.7],
  },
  // *DIVIDE,Divide ____ . . ____ . . ____ . . ____ . . ____
  // A, 12.7, -6.35, 0, -6.35, 0, -6.35
  {
    name: "DIVIDE",
    description: "Divide ____ . . ____ . . ____ . . ____ . . ____",
    pattern: [12.7, -6.35, 0, -6.35, 0, -6.35],
  },
  // *DIVIDE2,Divide (.5x) __..__..__..__..__..__..__..__.._
  // A, 6.35, -3.175, 0, -3.175, 0, -3.175
  {
    name: "DIVIDE2",
    description: "Divide (.5x) __..__..__..__..__..__..__..__.._",
    pattern: [6.35, -3.175, 0, -3.175, 0, -3.175],
  },
  // *DIVIDEX2,Divide (2x) ________  .  .  ________  .  .  _
  // A, 25.4, -12.7, 0, -12.7, 0, -12.7
  {
    name: "DIVIDEX2",
    description: "Divide (2x) ________  .  .  ________  .  .  _",
    pattern: [25.4, -12.7, 0, -12.7, 0, -12.7],
  },
  // *DOT,Dot . . . . . . . . . . . . . . . . . . . . . . . .
  // A, 0, -6.35
  {
    name: "DOT",
    description: "Dot . . . . . . . . . . . . . . . . . . . . . .",
    pattern: [0, -6.35],
  },
  // *DOT2,Dot (.5x) ........................................
  // A, 0, -3.175
  {
    name: "DOT2",
    description: "Dot (.5x) .....................................",
    pattern: [0, -3.175],
  },
  // *DOTX2,Dot (2x) .  .  .  .  .  .  .  .  .  .  .  .  .  .
  // A, 0, -12.7
  {
    name: "DOTX2",
    description: "Dot (2x) .  .  .  .  .  .  .  .  .  .  .  .  . ",
    pattern: [0, -12.7],
  },
  // *HIDDEN,Hidden __ __ __ __ __ __ __ __ __ __ __ __ __ __
  // A, 6.35, -3.175
  {
    name: "HIDDEN",
    description: "Hidden __ __ __ __ __ __ __ __ __ __ __ __ __ _",
    pattern: [6.35, -3.175],
  },
  // *HIDDEN2,Hidden (.5x) _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
  // A, 3.175, -1.5875
  {
    name: "HIDDEN2",
    description: "Hidden (.5x) _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _",
    pattern: [3.175, -1.5875],
  },
  // *HIDDENX2,Hidden (2x) ____ ____ ____ ____ ____ ____ ____
  // A, 12.7, -6.35
  {
    name: "HIDDENX2",
    description: "Hidden (2x) ____ ____ ____ ____ ____ ____ ____",
    pattern: [12.7, -6.35],
  },
  // *PHANTOM,Phantom ______  __  __  ______  __  __  ______
  // A, 31.75, -6.35, 6.35, -6.35, 6.35, -6.35
  {
    name: "PHANTOM",
    description: "Phantom ______  __  __  ______  __  __  ______",
    pattern: [31.75, -6.35, 6.35, -6.35, 6.35, -6.35],
  },
  // *PHANTOM2,Phantom (.5x) ___ _ _ ___ _ _ ___ _ _ ___ _ _
  // A, 15.875, -3.175, 3.175, -3.175, 3.175, -3.175
  {
    name: "PHANTOM2",
    description: "Phantom (.5x) ___ _ _ ___ _ _ ___ _ _ ___ _ _",
    pattern: [15.875, -3.175, 3.175, -3.175, 3.175, -3.175],
  },
  // *PHANTOMX2,Phantom (2x) ____________    ____    ____   _
  // A, 63.5, -12.7, 12.7, -12.7, 12.7, -12.7
  {
    name: "PHANTOMX2",
    description: "Phantom (2x) ____________    ____    ____   _",
    pattern: [63.5, -12.7, 12.7, -12.7, 12.7, -12.7],
  },
  // *ACAD_ISO02W100,ISO dash __ __ __ __ __ __ __ __ __ __ __ __ __
  // A,12,-3
  {
    name: "ACAD_ISO02W100",
    description: "ISO dash __ __ __ __ __ __ __ __ __ __ __ __ __",
    pattern: [12, -3],
  },
  // *ACAD_ISO03W100,ISO dash space __    __    __    __    __    __
  // A,12,-18
  {
    name: "ACAD_ISO03W100",
    description: "ISO dash space __    __    __    __    __    __",
    pattern: [12, -18],
  },
  // *ACAD_ISO04W100,ISO long-dash dot ____ . ____ . ____ . ____ . _
  // A,24,-3,0,-3
  {
    name: "ACAD_ISO04W100",
    description: "ISO long-dash dot ____ . ____ . ____ . ____ . _",
    pattern: [24, -3, 0, -3],
  },
  // *ACAD_ISO05W100,ISO long-dash double-dot ____ .. ____ .. ____ .
  // A,24,-3,0,-3,0,-3
  {
    name: "ACAD_ISO05W100",
    description: "ISO long-dash double-dot ____ .. ____ .. ____ .",
    pattern: [24, -3, 0, -3, 0, -3],
  },
  // *ACAD_ISO06W100,ISO long-dash triple-dot ____ ... ____ ... ____
  // A,24,-3,0,-3,0,-3,0,-3
  {
    name: "ACAD_ISO06W100",
    description: "ISO long-dash triple-dot ____ ... ____ ... ____",
    pattern: [24, -3, 0, -3, 0, -3, 0, -3],
  },
  // *ACAD_ISO07W100,ISO dot . . . . . . . . . . . . . . . . . . . .
  // A,0,-3
  {
    name: "ACAD_ISO07W100",
    description: "ISO dot . . . . . . . . . . . . . . . . . . . .",
    pattern: [0, -3],
  },
  // *ACAD_ISO08W100,ISO long-dash short-dash ____ __ ____ __ ____ _
  // A,24,-3,6,-3
  {
    name: "ACAD_ISO08W100",
    description: "ISO long-dash short-dash ____ __ ____ __ ____ _",
    pattern: [24, -3, 6, -3],
  },
  // *ACAD_ISO09W100,ISO long-dash double-short-dash ____ __ __ ____
  // A,24,-3,6,-3,6,-3
  {
    name: "ACAD_ISO09W100",
    description: "ISO long-dash double-short-dash ____ __ __ ____",
    pattern: [24, -3, 6, -3, 6, -3],
  },
  // *ACAD_ISO10W100,ISO dash dot __ . __ . __ . __ . __ . __ . __ .
  // A,12,-3,0,-3
  {
    name: "ACAD_ISO10W100",
    description: "ISO dash dot __ . __ . __ . __ . __ . __ . __ .",
    pattern: [12, -3, 0, -3],
  },
  // *ACAD_ISO11W100,ISO double-dash dot __ __ . __ __ . __ __ . __ _
  // A,12,-3,12,-3,0,-3
  {
    name: "ACAD_ISO11W100",
    description: "ISO double-dash dot __ __ . __ __ . __ __ . __ ",
    pattern: [12, -3, 12, -3, 0, -3],
  },
  // *ACAD_ISO12W100,ISO dash double-dot __ . . __ . . __ . . __ . .
  // A,12,-3,0,-3,0,-3
  {
    name: "ACAD_ISO12W100",
    description: "ISO dash double-dot __ . . __ . . __ . . __ . .",
    pattern: [12, -3, 0, -3, 0, -3],
  },
  // *ACAD_ISO13W100,ISO double-dash double-dot __ __ . . __ __ . . _
  // A,12,-3,12,-3,0,-3,0,-3
  {
    name: "ACAD_ISO13W100",
    description: "ISO double-dash double-dot __ __ . . __ __ . . ",
    pattern: [12, -3, 12, -3, 0, -3, 0, -3],
  },
  // *ACAD_ISO14W100,ISO dash triple-dot __ . . . __ . . . __ . . . _
  // A,12,-3,0,-3,0,-3,0,-3
  {
    name: "ACAD_ISO14W100",
    description: "ISO dash triple-dot __ . . . __ . . . __ . . . ",
    pattern: [12, -3, 0, -3, 0, -3, 0, -3],
  },
  // *ACAD_ISO15W100,ISO double-dash triple-dot __ __ . . . __ __ . .
  // A,12,-3,12,-3,0,-3,0,-3,0,-3
  {
    name: "ACAD_ISO15W100",
    description: "ISO double-dash triple-dot __ __ . . . __ __ . ",
    pattern: [12, -3, 12, -3, 0, -3, 0, -3, 0, -3],
  },
  // *FENCELINE1,Fenceline circle ----0-----0----0-----0----0-----0--
  // A,6.35,-2.54,[CIRC1,ltypeshp.shx,x=-2.54,s=2.54],-2.54,25.4
  {
    name: "FENCELINE1",
    description: "Fenceline circle ----0-----0----0-----0----0---",
    pattern: [6.35, -2.54, -2.54, 25.4],
    elements: [
      {
        index: 1,
        kind: "shape",
        shape: 133,
        shapeFile: "ltypeshp.shx",
        scale: 2.54,
        rotation: 0,
        rotationMode: "relative",
        offset: { x: -2.54, y: 0 },
      },
    ],
  },
  // *FENCELINE2,Fenceline square ----[]-----[]----[]-----[]----[]---
  // A,6.35,-2.54,[BOX,ltypeshp.shx,x=-2.54,s=2.54],-2.54,25.4
  {
    name: "FENCELINE2",
    description: "Fenceline square ----[]-----[]----[]-----[]----",
    pattern: [6.35, -2.54, -2.54, 25.4],
    elements: [
      {
        index: 1,
        kind: "shape",
        shape: 132,
        shapeFile: "ltypeshp.shx",
        scale: 2.54,
        rotation: 0,
        rotationMode: "relative",
        offset: { x: -2.54, y: 0 },
      },
    ],
  },
  // *TRACKS,Tracks -|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-
  // A,3.81,[TRACK1,ltypeshp.shx,s=6.35],3.81
  {
    name: "TRACKS",
    description: "Tracks -|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|",
    pattern: [3.81, 3.81],
    elements: [
      {
        index: 0,
        kind: "shape",
        shape: 130,
        shapeFile: "ltypeshp.shx",
        scale: 6.35,
        rotation: 0,
        rotationMode: "relative",
        offset: { x: 0, y: 0 },
      },
    ],
  },
  // *BATTING,Batting SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS
  // A,.00254,-2.54,[BAT,ltypeshp.shx,x=-2.54,s=2.54],-5.08,[BAT,ltypeshp.shx,r=180,x=2.54,s=2.54],-2.54
  {
    name: "BATTING",
    description: "Batting SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS",
    pattern: [0.00254, -2.54, -5.08, -2.54],
    elements: [
      {
        index: 1,
        kind: "shape",
        shape: 134,
        shapeFile: "ltypeshp.shx",
        scale: 2.54,
        rotation: 0,
        rotationMode: "relative",
        offset: { x: -2.54, y: 0 },
      },
      {
        index: 2,
        kind: "shape",
        shape: 134,
        shapeFile: "ltypeshp.shx",
        scale: 2.54,
        rotation: Math.PI,
        rotationMode: "relative",
        offset: { x: 2.54, y: 0 },
      },
    ],
  },
  // *HOT_WATER_SUPPLY,Hot water supply ---- HW ---- HW ---- HW ----
  // A,12.7,-5.08,["HW",STANDARD,S=2.54,U=0.0,X=-2.54,Y=-1.27],-5.08
  {
    name: "HOT_WATER_SUPPLY",
    description: "Hot water supply ---- HW ---- HW ---- HW ----",
    pattern: [12.7, -5.08, -5.08],
    elements: [
      {
        index: 1,
        kind: "text",
        text: "HW",
        style: "STANDARD",
        scale: 2.54,
        rotation: 0,
        rotationMode: "upright",
        offset: { x: -2.54, y: -1.27 },
      },
    ],
  },
  // *GAS_LINE,Gas line ----GAS----GAS----GAS----GAS----GAS----GAS--
  // A,12.7,-5.08,["GAS",STANDARD,S=2.54,U=0.0,X=-2.54,Y=-1.27],-6.35
  {
    name: "GAS_LINE",
    description: "Gas line ----GAS----GAS----GAS----GAS----GAS---",
    pattern: [12.7, -5.08, -6.35],
    elements: [
      {
        index: 1,
        kind: "text",
        text: "GAS",
        style: "STANDARD",
        scale: 2.54,
        rotation: 0,
        rotationMode: "upright",
        offset: { x: -2.54, y: -1.27 },
      },
    ],
  },
  // *ZIGZAG,Zig zag /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/
  // A,.00254,-5.08,[ZIG,ltypeshp.shx,x=-5.08,s=5.08],-10.16,[ZIG,ltypeshp.shx,r=180,x=5.08,s=5.08],-5.08
  {
    name: "ZIGZAG",
    description:
      "Zig zag /\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/",
    pattern: [0.00254, -5.08, -10.16, -5.08],
    elements: [
      {
        index: 1,
        kind: "shape",
        shape: 131,
        shapeFile: "ltypeshp.shx",
        scale: 5.08,
        rotation: 0,
        rotationMode: "relative",
        offset: { x: -5.08, y: 0 },
      },
      {
        index: 2,
        kind: "shape",
        shape: 131,
        shapeFile: "ltypeshp.shx",
        scale: 5.08,
        rotation: Math.PI,
        rotationMode: "relative",
        offset: { x: 5.08, y: 0 },
      },
    ],
  },
  // *JIS_08_11,1SASEN11 ___ _ ___ _ ___ _ ___ _ ___ _ ___
  // A,11,-.60,.60,-.60
  {
    name: "JIS_08_11",
    description: "1SASEN11 ___ _ ___ _ ___ _ ___ _ ___ _ ___",
    pattern: [11, -0.6, 0.6, -0.6],
  },
  // *JIS_08_15,1SASEN15 ____ _ ____ _ ____ _ ____ _ ____
  // A,15,-.75,.75,-.75
  {
    name: "JIS_08_15",
    description: "1SASEN15 ____ _ ____ _ ____ _ ____ _ ____",
    pattern: [15, -0.75, 0.75, -0.75],
  },
  // *JIS_08_25,1SASEN25 ________  __  ________  __  _____
  // A,25,-1.125,.75,-1.125
  {
    name: "JIS_08_25",
    description: "1SASEN25 ________  __  ________  __  _____",
    pattern: [25, -1.125, 0.75, -1.125],
  },
  // *JIS_08_37,1SASEN37 ________  __  ________  __  _____
  // A,37.5,-1.125,.75,-1.125
  {
    name: "JIS_08_37",
    description: "1SASEN37 ________  __  ________  __  _____",
    pattern: [37.5, -1.125, 0.75, -1.125],
  },
  // *JIS_08_50,1SASEN50 _______________  __  ____________
  // A,50,-1.125,.75,-1.125
  {
    name: "JIS_08_50",
    description: "1SASEN50 _______________  __  ____________",
    pattern: [50, -1.125, 0.75, -1.125],
  },
  // *JIS_02_0.7,HIDDEN0.75 _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
  // A,.75,-.60
  {
    name: "JIS_02_0.7",
    description: "HIDDEN0.75 _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _",
    pattern: [0.75, -0.6],
  },
  // *JIS_02_1.0,HIDDEN01 _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
  // A,1,-1
  {
    name: "JIS_02_1.0",
    description: "HIDDEN01 _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _",
    pattern: [1, -1],
  },
  // *JIS_02_1.2,HIDDEN01.25  _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
  // A,1.25,-1.25
  {
    name: "JIS_02_1.2",
    description: "HIDDEN01.25  _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _",
    pattern: [1.25, -1.25],
  },
  // *JIS_02_2.0,HIDDEN02 __ __ __ __ __ __ __ __ __ __ __
  // A,2,-1
  {
    name: "JIS_02_2.0",
    description: "HIDDEN02 __ __ __ __ __ __ __ __ __ __ __",
    pattern: [2, -1],
  },
  // *JIS_02_4.0,HIDDEN04 ____ ____ ____ ____ ____ ____ ____
  // A,4,-1.5
  {
    name: "JIS_02_4.0",
    description: "HIDDEN04 ____ ____ ____ ____ ____ ____ ____",
    pattern: [4, -1.5],
  },
  // *JIS_09_08,2SASEN8 __ _ _ __ _ _ __ _ _ __ _ _ __ _ _
  // A,8,-.55,.55,-.55,.55,-.55
  {
    name: "JIS_09_08",
    description: "2SASEN8 __ _ _ __ _ _ __ _ _ __ _ _ __ _ _",
    pattern: [8, -0.55, 0.55, -0.55, 0.55, -0.55],
  },
  // *JIS_09_15,2SASEN15 ___ _ _ ___ _ _ ___ _ _ ___ _ _ ___
  // A,15,-.90,.60,-.90,.60,-.90
  {
    name: "JIS_09_15",
    description: "2SASEN15 ___ _ _ ___ _ _ ___ _ _ ___ _ _ ___",
    pattern: [15, -0.9, 0.6, -0.9, 0.6, -0.9],
  },
  // *JIS_09_29,2SASEN29 ______@__  __  ______@__  __  ___
  // A,29,-1.2,.70,-1.2,.70,-1.2
  {
    name: "JIS_09_29",
    description: "2SASEN29 ______@__  __  ______@__  __  ___",
    pattern: [29, -1.2, 0.7, -1.2, 0.7, -1.2],
  },
  // *JIS_09_50,2SASEN50 ____________@__  __  _____________
  // A,50,-1.2,.70,-1.2,.70,-1.2
  {
    name: "JIS_09_50",
    description: "2SASEN50 ____________@__  __  _____________",
    pattern: [50, -1.2, 0.7, -1.2, 0.7, -1.2],
  },
]

/**
 * How many of acadiso.lin's linetypes acad.lin has: the first 45, the JIS
 * ones aside.
 */
const ACAD_LIN_COUNT = 45

/** 25.4 mm to the inch: acad.lin's lengths are acadiso.lin's in inches. */
const MM_PER_INCH = 25.4

/**
 * A length of acadiso.lin's in inches, as acad.lin writes it: rounded to 12
 * digits, so 19.05 is `.75`, not the division's 0.7500000000000001 (acad.lin's
 * have four decimals at most).
 */
function inches(length: number): number {
  return Number((length / MM_PER_INCH).toPrecision(12))
}

/**
 * acad.lin, the imperial file, which CHPROP's LType (and AutoCAD's -LAYER's)
 * loads a linetype the drawing lacks from, even in a metric drawing (probe ltype/p03:
 * CENTER2 and DASHED2 with acad.lin's lengths). WHY derived, not quoted: it is
 * acadiso.lin's first 45 with every length but the ISO linetypes' divided by
 * 25.4, compared definition by definition against the 2027 install's two
 * files (the ISO ones are the same in both).
 */
export function acadLin(): readonly Linetype[] {
  return ACADISO_LIN.slice(0, ACAD_LIN_COUNT).map((linetype) =>
    linetype.name.startsWith("ACAD_ISO")
      ? linetype
      : {
          ...linetype,
          pattern: linetype.pattern.map(inches),
          ...(linetype.elements && {
            elements: linetype.elements.map((element) => ({
              ...element,
              scale: inches(element.scale),
              offset: {
                x: inches(element.offset.x),
                y: inches(element.offset.y),
              },
            })),
          }),
        }
  )
}
