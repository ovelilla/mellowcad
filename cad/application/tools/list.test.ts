import { describe, expect, it } from "vitest"
import {
  createAttributeDefinition,
  blockAttribute,
} from "../../domain/attributes"
import {
  createBlockDefinition,
  createInsert,
} from "../../domain/entityFactories"
import { createSpline } from "../../domain/splines"
import { es } from "../../locales/es"
import { createHarness, type CadHarness } from "../../../test/harness"
import { circleOf, layerOf, lineOf, p } from "../../../test/builders"

/**
 * LIST against the transcripts of AutoCAD 2027's console (probes
 * inquiry/p400–p446, run with QAFLAGS 2 so that nothing pauses): the probe's
 * answers typed here at LUPREC 4, the console's, and every line LIST wrote
 * but the `Handle = …` the model has none for. A line that differs on
 * purpose says AutoCAD's beside it.
 */

const en = undefined

function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/** The probe's answers, `|` between them: an empty one is Enter. */
function run(locale: typeof es | undefined, answers: string): CadHarness {
  const cad = createHarness(locale ? { locale } : {})
  return answer(cad, "_LUPREC", "4", ...answers.split("|"))
}

/** What LIST wrote: each object's report, which opens with its type at column 19. */
function listed(cad: CadHarness): string[] {
  return cad
    .commandLog()
    .filter((entry) => /^ {18}\S/.test(entry))
    .flatMap((entry) => entry.split("\n"))
}

describe("LIST against AutoCAD 2027's console in English", () => {
  it("lists a line (p400)", () => {
    const cad = run(en, "_LINE|0,0|10,5||_LIST|_L|")
    expect(listed(cad)).toEqual([
      '                  LINE      Layer: "0"',
      "                            Space: Model space",
      "              from point, X=   0.0000  Y=   0.0000  Z=   0.0000",
      "                to point, X=  10.0000  Y=   5.0000  Z=   0.0000",
      "          Length =  11.1803,  Angle in XY Plane =     27",
      "                  Delta X =  10.0000, Delta Y =    5.0000, Delta Z =   0.0000",
    ])
  })

  it("lists circles, one thick and raised (p402)", () => {
    const cad = run(
      en,
      "_CIRCLE|3,4|5|_LIST|_L||THICKNESS|1.5|ELEVATION|2|_CIRCLE|-3,4|2.5|_LIST|_L|"
    )
    expect(listed(cad)).toEqual([
      '                  CIRCLE    Layer: "0"',
      "                            Space: Model space",
      "            center point, X=   3.0000  Y=   4.0000  Z=   0.0000",
      "            radius    5.0000",
      "     circumference   31.4159",
      "              area   78.5398",
      '                  CIRCLE    Layer: "0"',
      "                            Space: Model space",
      "                   Thickness =    1.5000",
      "            center point, X=  -3.0000  Y=   4.0000  Z=   2.0000",
      "            radius    2.5000",
      "     circumference   15.7080",
      "              area   19.6350",
    ])
  })

  it("lists arcs (p403)", () => {
    const cad = run(
      en,
      "_ARC|_C|0,0|10,0|0,10|_LIST|_L||_ARC|10,0|7,7|-10,0|_LIST|_L|"
    )
    expect(listed(cad)).toEqual([
      '                  ARC       Layer: "0"',
      "                            Space: Model space",
      "            center point, X=   0.0000  Y=   0.0000  Z=   0.0000",
      "            radius   10.0000",
      "             start angle      0",
      "               end angle     90",
      "            length   15.7080",
      '                  ARC       Layer: "0"',
      "                            Space: Model space",
      "            center point, X=   0.0000  Y=  -0.1429  Z=   0.0000",
      "            radius   10.0010",
      "             start angle      1",
      "               end angle    179",
      "            length   31.1334",
    ])
  })

  it("lists an ellipse and an elliptical arc (p404)", () => {
    const cad = run(
      en,
      "_ELLIPSE|_C|0,0|10,0|4|_LIST|_L||_ELLIPSE|_A|_C|0,0|10,10|4|30|200|_LIST|_L|"
    )
    expect(listed(cad)).toEqual([
      '                  ELLIPSE   Layer: "0"',
      "                            Space: Model space",
      "                             Area: 125.6637",
      "                    Circumference: 46.0262",
      "                           Center: X = 0.0000   , Y = 0.0000   , Z = 0.0000",
      "                       Major Axis: X = 10.0000  , Y = 0.0000   , Z = 0.0000",
      "                       Minor Axis: X = 0.0000   , Y = 4.0000   , Z = 0.0000",
      "                     Radius Ratio: 0.4000",
      '                  ELLIPSE   Layer: "0"',
      "                            Space: Model space",
      "                           Length: 28.2769",
      "                           Center: X = 0.0000   , Y = 0.0000   , Z = 0.0000",
      "                       Major Axis: X = 10.0000  , Y = 10.0000  , Z = 0.0000",
      "                       Minor Axis: X = -2.8284  , Y = 2.8284   , Z = 0.0000",
      "                      Start Point: X = 1.8594   , Y = 6.9394   , Z = 0.0000",
      "                        End Point: X = -3.9027  , Y = -8.3694  , Z = 0.0000",
      "                      Start Angle: 30",
      "                        End Angle: 200",
      "                     Radius Ratio: 0.2828",
    ])
  })

  it("lists a fit spline (p405)", () => {
    const cad = run(en, "_SPLINE|_M|_F|0,0|10,10|20,0|30,10||_LIST|_L|")
    expect(listed(cad)).toEqual([
      '                  SPLINE    Layer: "0"',
      "                            Space: Model space",
      "                           Length: 44.2385",
      "                            Order: 4",
      "                       Properties: Planar, Non-Rational, Non-Periodic",
      "                 Parametric Range: Start   0.0000",
      "                                     End  42.4264",
      "         Number of control points: 6",
      "                   Control Points: X = 0.0000   , Y = 0.0000   , Z = 0.0000",
      "                                   X = 3.3333   , Y = 5.5556   , Z = 0.0000",
      "                                   X = 10.0000  , Y = 16.6667  , Z = 0.0000",
      "                                   X = 20.0000  , Y = -6.6667  , Z = 0.0000",
      "                                   X = 26.6667  , Y = 4.4444   , Z = 0.0000",
      "                                   X = 30.0000  , Y = 10.0000  , Z = 0.0000",
      "             Number of fit points: 4",
      "                        User Data: Fit Points",
      "                                   X = 0.0000   , Y = 0.0000   , Z = 0.0000",
      "                                   X = 10.0000  , Y = 10.0000  , Z = 0.0000",
      "                                   X = 20.0000  , Y = 0.0000   , Z = 0.0000",
      "                                   X = 30.0000  , Y = 10.0000  , Z = 0.0000",
      "              Fit point tolerance: 1.0000E-10",
    ])
  })

  it("lists a CV spline and a closed fit spline (p406)", () => {
    const cad = run(
      en,
      "_SPLINE|_M|_CV|0,0|10,10|20,0|30,10||_LIST|_L||_SPLINE|_M|_F|0,0|10,10|20,0|_C|_LIST|_L|"
    )
    expect(listed(cad)).toEqual([
      '                  SPLINE    Layer: "0"',
      "                            Space: Model space",
      // AutoCAD 32.6835: its spline length is approximate
      "                           Length: 32.6829",
      "                            Order: 4",
      "                       Properties: Planar, Non-Rational, Non-Periodic",
      "                 Parametric Range: Start   0.0000",
      "                                     End   1.0000",
      "         Number of control points: 4",
      "                   Control Points: X = 0.0000   , Y = 0.0000   , Z = 0.0000",
      "                                   X = 10.0000  , Y = 10.0000  , Z = 0.0000",
      "                                   X = 20.0000  , Y = 0.0000   , Z = 0.0000",
      "                                   X = 30.0000  , Y = 10.0000  , Z = 0.0000",
      '                  SPLINE    Layer: "0"',
      "                            Space: Model space",
      "                             Area: 217.9130",
      "                    Circumference: 54.2113",
      "                            Order: 4",
      "                       Properties: Planar, Non-Rational, Periodic",
      "                 Parametric Range: Start   0.0000",
      "                                     End  48.2843",
      "         Number of control points: 3",
      "                   Control Points: X = 29.4281  , Y = -5.2241  , Z = 0.0000",
      "                                   X = -9.4281  , Y = -5.2241  , Z = 0.0000",
      "                                   X = 10.0000  , Y = 16.3060  , Z = 0.0000",
      "             Number of fit points: 4",
      "                        User Data: Fit Points",
      "                                   X = 0.0000   , Y = 0.0000   , Z = 0.0000",
      "                                   X = 10.0000  , Y = 10.0000  , Z = 0.0000",
      "                                   X = 20.0000  , Y = 0.0000   , Z = 0.0000",
      "                                   X = 0.0000   , Y = 0.0000   , Z = 0.0000",
      "              Fit point tolerance: 1.0000E-10",
    ])
  })

  it("lists lightweight polylines, an arc segment and a closed one (p407)", () => {
    const cad = run(
      en,
      "_PLINE|0,0|10,0|_A|20,10|_L|20,20||_LIST|_L||_PLINE|0,0|-10,0|-10,-10|_C|_LIST|_L|"
    )
    expect(listed(cad)).toEqual([
      '                  LWPOLYLINE  Layer: "0"',
      "                            Space: Model space",
      "              Open",
      "    Constant width    0.0000",
      "              area   178.5398",
      "            length   35.7080",
      "          at point  X=   0.0000  Y=   0.0000  Z=   0.0000",
      "          at point  X=  10.0000  Y=   0.0000  Z=   0.0000",
      "             bulge    0.4142",
      "            center  X=  10.0000  Y=  10.0000  Z=   0.0000",
      "            radius   10.0000",
      "       start angle       270",
      "         end angle         0",
      "          at point  X=  20.0000  Y=  10.0000  Z=   0.0000",
      "          at point  X=  20.0000  Y=  20.0000  Z=   0.0000",
      '                  LWPOLYLINE  Layer: "0"',
      "                            Space: Model space",
      "            Closed",
      "    Constant width    0.0000",
      "              area   50.0000",
      "         perimeter   34.1421",
      "          at point  X=   0.0000  Y=   0.0000  Z=   0.0000",
      "          at point  X= -10.0000  Y=   0.0000  Z=   0.0000",
      "          at point  X= -10.0000  Y= -10.0000  Z=   0.0000",
    ])
  })

  it("lists polylines with widths, thickness and elevation (p408)", () => {
    const cad = run(
      en,
      "_PLINE|0,0|_W|1|1|10,0|_W|2|0.5|20,5||_LIST|_L||THICKNESS|3|ELEVATION|4|_PLINE|0,0|-10,0|-10,-10||_LIST|_L|"
    )
    expect(listed(cad)).toEqual([
      '                  LWPOLYLINE  Layer: "0"',
      "                            Space: Model space",
      "              Open",
      "              area   25.0000",
      "            length   21.1803",
      "          at point  X=   0.0000  Y=   0.0000  Z=   0.0000",
      "    starting width    1.0000",
      "      ending width    1.0000",
      "          at point  X=  10.0000  Y=   0.0000  Z=   0.0000",
      "    starting width    2.0000",
      "      ending width    0.5000",
      "          at point  X=  20.0000  Y=   5.0000  Z=   0.0000",
      '                  LWPOLYLINE  Layer: "0"',
      "                            Space: Model space",
      "                   Thickness =    3.0000",
      "              Open",
      "         Thickness    3.0000",
      "    Constant width    0.5000",
      "              area   50.0000",
      "            length   20.0000",
      "          at point  X=   0.0000  Y=   0.0000  Z=   4.0000",
      "          at point  X= -10.0000  Y=   0.0000  Z=   4.0000",
      "          at point  X= -10.0000  Y= -10.0000  Z=   4.0000",
    ])
  })

  it("lists 3D polylines (p410)", () => {
    const cad = run(
      en,
      "_3DPOLY|0,0,0|10,0,5|10,10,-3||_LIST|_L||_3DPOLY|0,0,0|10,0,0|10,10,0|_C|_LIST|_L|"
    )
    expect(listed(cad)).toEqual([
      '                  POLYLINE  Layer: "0"',
      "                            Space: Model space",
      "              Open space",
      "              area   68.7386",
      "            length   23.9866",
      '                  VERTEX    Layer: "0"',
      "                            Space: Model space",
      "             Space",
      "                at point, X=   0.0000  Y=   0.0000  Z=   0.0000",
      '                  VERTEX    Layer: "0"',
      "                            Space: Model space",
      "             Space",
      "                at point, X=  10.0000  Y=   0.0000  Z=   5.0000",
      '                  VERTEX    Layer: "0"',
      "                            Space: Model space",
      "             Space",
      "                at point, X=  10.0000  Y=  10.0000  Z=  -3.0000",
      '                  END SEQUENCE  Layer: "0"',
      "                            Space: Model space",
      '                  POLYLINE  Layer: "0"',
      "                            Space: Model space",
      "            Closed space",
      "              area   50.0000",
      "         perimeter   34.1421",
      '                  VERTEX    Layer: "0"',
      "                            Space: Model space",
      "             Space",
      "                at point, X=   0.0000  Y=   0.0000  Z=   0.0000",
      '                  VERTEX    Layer: "0"',
      "                            Space: Model space",
      "             Space",
      "                at point, X=  10.0000  Y=   0.0000  Z=   0.0000",
      '                  VERTEX    Layer: "0"',
      "                            Space: Model space",
      "             Space",
      "                at point, X=  10.0000  Y=  10.0000  Z=   0.0000",
      '                  END SEQUENCE  Layer: "0"',
      "                            Space: Model space",
    ])
  })

  it("lists text, left and middle-centred (p411)", () => {
    const cad = run(
      en,
      "_-TEXT|5,5|2.5|0|Hello|_LIST|_L||_-TEXT|_J|_MC|20,10|3|30|Mid text|_LIST|_L|"
    )
    expect(listed(cad)).toEqual([
      '                  TEXT      Layer: "0"',
      "                            Space: Model space",
      '             Style = "Standard"',
      "        Annotative: No",
      "             Typeface = Arial",
      "             start point, X=   5.0000  Y=   5.0000  Z=   0.0000",
      "            height    2.5000",
      "              text Hello",
      "          rotation angle      0",
      "             width scale factor    1.0000",
      "         obliquing angle      0",
      "        generation normal",
      '                  TEXT      Layer: "0"',
      "                            Space: Model space",
      '             Style = "Standard"',
      "        Annotative: No",
      "             Typeface = Arial",
      "               mid point, X=  20.0000  Y=  10.0000  Z=   0.0000",
      "            height    3.0000",
      "              text Mid text",
      "          rotation angle     30",
      "             width scale factor    1.0000",
      "         obliquing angle      0",
      "        generation normal",
    ])
  })

  it("lists MTEXT (p412)", () => {
    const cad = run(en, "_-MTEXT|0,0|40,-20|First line|Second||_LIST|_L|")
    expect(listed(cad)).toEqual([
      '                  MTEXT     Layer: "0"',
      "                            Space: Model space",
      '             Style = "Standard"',
      "        Annotative: No",
      "Location:        X=   0.0000  Y=   0.0000  Z=   0.0000",
      "Width:             40.0000",
      "Normal:          X=   0.0000  Y=   0.0000  Z=   1.0000",
      "Rotation:                0",
      "Text height:        2.5000",
      "Line spacing:    Multiple (1x =    4.1667)",
      "Attachment:      TopLeft",
      "Flow direction:  ByStyle",
      "Contents:        First line\\PSecond",
    ])
  })

  it("lists attribute definitions (p413)", () => {
    const cad = run(
      en,
      "_-ATTDEF||TAG1|Your prompt|Dflt|0,0|2.5|0|_LIST|_L||_-ATTDEF|_I|_C||TAG2|Fixed value|10,0|2.5|0|_LIST|_L|"
    )
    expect(listed(cad)).toEqual([
      '                  ATTRIBUTE DEFINITION  Layer: "0"',
      "                            Space: Model space",
      '             Style = "Standard"',
      "        Annotative: No",
      "             Typeface = Arial",
      "             start point, X=   0.0000  Y=   0.0000  Z=   0.0000",
      "            height    2.5000",
      "           default Dflt",
      "            prompt Your prompt",
      "               tag TAG1",
      "          rotation angle      0",
      "             width scale factor    1.0000",
      "         obliquing angle      0",
      "             flags normal",
      "        generation normal",
      '                  ATTRIBUTE DEFINITION  Layer: "0"',
      "                            Space: Model space",
      '             Style = "Standard"',
      "        Annotative: No",
      "             Typeface = Arial",
      "             start point, X=  10.0000  Y=   0.0000  Z=   0.0000",
      "            height    2.5000",
      "           default Fixed value",
      "            prompt",
      "               tag TAG2",
      "          rotation angle      0",
      "             width scale factor    1.0000",
      "         obliquing angle      0",
      "             flags invisible  constant",
      "        generation normal",
    ])
  })

  it("lists linear and aligned dimensions (p414)", () => {
    const cad = run(
      en,
      "_DIMLINEAR|0,0|100,0|50,10|_LIST|_L||_DIMLINEAR|0,0|30,40|50,20|_LIST|_L||_DIMLINEAR|0,0|30,40|_R|30|50,20|_LIST|_L||_DIMALIGNED|0,0|30,40|-10,10|_LIST|_L|"
    )
    expect(listed(cad)).toEqual([
      '                  DIMENSION  Layer: "0"',
      "                            Space: Model space",
      "associative: no",
      "type: horizontal",
      "1st extension  defining point: X=   0.0000  Y=   0.0000  Z=   0.0000",
      "2nd extension  defining point: X= 100.0000  Y=   0.0000  Z=   0.0000",
      "dimension line defining point: X= 100.0000  Y=  10.0000  Z=   0.0000",
      // AutoCAD's console sets the text by its own font
      "default text position: X=  50.0000  Y=  11.8750  Z=   0.0000",
      "default text",
      'dimension style: "ISO-25"',
      "Annotative: No",
      '                  DIMENSION  Layer: "0"',
      "                            Space: Model space",
      "associative: no",
      "type: vertical",
      "1st extension  defining point: X=   0.0000  Y=   0.0000  Z=   0.0000",
      "2nd extension  defining point: X=  30.0000  Y=  40.0000  Z=   0.0000",
      "dimension line defining point: X=  50.0000  Y=  40.0000  Z=   0.0000",
      // AutoCAD's console sets the text by its own font
      "default text position: X=  48.1250  Y=  20.0000  Z=   0.0000",
      "default text",
      'dimension style: "ISO-25"',
      "Annotative: No",
      '                  DIMENSION  Layer: "0"',
      "                            Space: Model space",
      "associative: no",
      "type: rotated",
      " rotation:     30",
      "1st extension  defining point: X=   0.0000  Y=   0.0000  Z=   0.0000",
      "2nd extension  defining point: X=  30.0000  Y=  40.0000  Z=   0.0000",
      "dimension line defining point: X=  43.6603  Y=  16.3397  Z=   0.0000",
      // AutoCAD's console sets the text by its own font
      "default text position: X=  22.8125  Y=   6.4684  Z=   0.0000",
      "default text",
      'dimension style: "ISO-25"',
      "Annotative: No",
      '                  DIMENSION  Layer: "0"',
      "                            Space: Model space",
      "associative: no",
      "type: aligned",
      "1st extension  defining point: X=   0.0000  Y=   0.0000  Z=   0.0000",
      "2nd extension  defining point: X=  30.0000  Y=  40.0000  Z=   0.0000",
      "dimension line defining point: X=  18.8000  Y=  48.4000  Z=   0.0000",
      // AutoCAD's console sets the text by its own font
      "default text position: X=   2.3000  Y=  29.5250  Z=   0.0000",
      "default text",
      'dimension style: "ISO-25"',
      "Annotative: No",
    ])
  })

  it("lists radial, diametric and an overridden dimension (p416)", () => {
    const cad = run(
      en,
      "_ZOOM|_W|-50,-50|50,50|_CIRCLE|0,0|10|_DIMRADIUS|10,0|20,10|_LIST|_L||_DIMDIAMETER|0,10|5,25|_LIST|_L||_DIMLINEAR|0,0|30,0|_T|Custom|15,10|_LIST|_L|"
    )
    expect(listed(cad)).toEqual([
      '                  DIMENSION  Layer: "0"',
      "                            Space: Model space",
      // AutoCAD yes: no dimension here is associative
      "associative: no",
      "type: radial",
      "center defining point: X=   0.0000  Y=   0.0000  Z=   0.0000",
      "defining point:        X=   8.9443  Y=   4.4721  Z=   0.0000",
      "user specified text position: X=  20.0000  Y=  10.0000  Z=   0.0000",
      "default text",
      'dimension style: "ISO-25"',
      "dimension style overrides:",
      " DIMUPT      On",
      "Annotative: No",
      '                  DIMENSION  Layer: "0"',
      "                            Space: Model space",
      // AutoCAD yes: no dimension here is associative
      "associative: no",
      "type: diameter",
      "       defining point: X=  -1.9612  Y=  -9.8058  Z=   0.0000",
      "defining point:        X=   1.9612  Y=   9.8058  Z=   0.0000",
      "user specified text position: X=   5.0000  Y=  25.0000  Z=   0.0000",
      "default text",
      'dimension style: "ISO-25"',
      "dimension style overrides:",
      " DIMUPT      On",
      "Annotative: No",
      '                  DIMENSION  Layer: "0"',
      "                            Space: Model space",
      "associative: no",
      "type: horizontal",
      "1st extension  defining point: X=   0.0000  Y=   0.0000  Z=   0.0000",
      "2nd extension  defining point: X=  30.0000  Y=   0.0000  Z=   0.0000",
      "dimension line defining point: X=  30.0000  Y=  10.0000  Z=   0.0000",
      // AutoCAD's console sets the text by its own font
      "default text position: X=  15.0000  Y=  11.8750  Z=   0.0000",
      "dimension text modifier: Custom",
      'dimension style: "ISO-25"',
      "Annotative: No",
    ])
  })

  it("lists hatches, solid and patterned (p417)", () => {
    const cad = run(
      en,
      "_ZOOM|_W|-200,-200|300,300|_RECTANG|0,0|100,50|_CIRCLE|50,25|10|_-HATCH|_P|SOLID|10,10||_LIST|_L||_-HATCH|_P|ANSI31|2|45|10,10||_LIST|_L|"
    )
    expect(listed(cad)).toEqual([
      '                  HATCH     Layer: "0"',
      "                            Space: Model space",
      "                 Hatch pattern SOLID",
      "                 Not associative",
      "                 Area      4685.8407",
      "                 Origin    X=   0.0000  Y=   0.0000  Z=   0.0000",
      '                  HATCH     Layer: "0"',
      "                            Space: Model space",
      "                 Hatch pattern ANSI31",
      "                 Annotative: No",
      "                 Hatch scale    2.0000",
      "                 Hatch angle     45",
      "                 Not associative",
      "                 Area      4685.8407",
      "                 Origin    X=   0.0000  Y=   0.0000  Z=   0.0000",
    ])
  })

  it("lists a polar and a path array (p419)", () => {
    const cad = run(
      en,
      "_ZOOM|_W|-200,-200|200,200|_CIRCLE|10,10|2|_ARRAYPOLAR|_L||0,0||_LIST|_L||_LINE|0,-50|100,-50||_CIRCLE|0,-40|2|_ARRAYPATH|_L||0,-50||_LIST|_L|"
    )
    expect(listed(cad)).toEqual([
      '                  ARRAY     Layer: "0"',
      "                            Space: Model space",
      "      Array type:      Polar",
      "      Base point:  X=  10.0000  Y=  10.0000  Z=   0.0000",
      "    Center point:  X=   0.0000  Y=   0.0000  Z=   0.0000",
      "                   Radius:    14.1421",
      "                Direction:        CCW",
      "          Number of items:          6",
      "      Angle between items:         60",
      "               Fill angle:        360",
      "           Number of rows:          1",
      "              Row spacing:     6.0000",
      "  Row elevation increment:     0.0000",
      "         Number of levels:          1",
      "            Level spacing:     1.0000",
      "           Rotate objects:        Yes",
      '                  ARRAY     Layer: "0"',
      "                            Space: Model space",
      "      Array type:       Path",
      "          Method:    Measure",
      "      Base point:  X=   0.0000  Y= -50.0000  Z=   0.0000",
      "          Number of items:         17",
      "             Item spacing:     6.0000",
      "             Start offset:     0.0000",
      "               End offset:     0.0000",
      "           Number of rows:          1",
      "              Row spacing:     6.0000",
      "  Row elevation increment:     0.0000",
      "         Number of levels:          1",
      "            Level spacing:     1.0000",
      "              Align items:        Yes",
    ])
  })

  it("lists ALL and Previous, newest first (p420)", () => {
    const cad = run(
      en,
      "_LINE|0,0|10,0||_CIRCLE|5,5|2|_ARC|_C|0,0|3,0|0,3|_LIST|_ALL||_LIST|_P|"
    )
    expect(listed(cad)).toEqual([
      '                  ARC       Layer: "0"',
      "                            Space: Model space",
      "            center point, X=   0.0000  Y=   0.0000  Z=   0.0000",
      "            radius    3.0000",
      "             start angle      0",
      "               end angle     90",
      "            length    4.7124",
      '                  CIRCLE    Layer: "0"',
      "                            Space: Model space",
      "            center point, X=   5.0000  Y=   5.0000  Z=   0.0000",
      "            radius    2.0000",
      "     circumference   12.5664",
      "              area   12.5664",
      '                  LINE      Layer: "0"',
      "                            Space: Model space",
      "              from point, X=   0.0000  Y=   0.0000  Z=   0.0000",
      "                to point, X=  10.0000  Y=   0.0000  Z=   0.0000",
      "          Length =  10.0000,  Angle in XY Plane =      0",
      "                  Delta X =  10.0000, Delta Y =    0.0000, Delta Z =   0.0000",
      '                  ARC       Layer: "0"',
      "                            Space: Model space",
      "            center point, X=   0.0000  Y=   0.0000  Z=   0.0000",
      "            radius    3.0000",
      "             start angle      0",
      "               end angle     90",
      "            length    4.7124",
      '                  CIRCLE    Layer: "0"',
      "                            Space: Model space",
      "            center point, X=   5.0000  Y=   5.0000  Z=   0.0000",
      "            radius    2.0000",
      "     circumference   12.5664",
      "              area   12.5664",
      '                  LINE      Layer: "0"',
      "                            Space: Model space",
      "              from point, X=   0.0000  Y=   0.0000  Z=   0.0000",
      "                to point, X=  10.0000  Y=   0.0000  Z=   0.0000",
      "          Length =  10.0000,  Angle in XY Plane =      0",
      "                  Delta X =  10.0000, Delta Y =    0.0000, Delta Z =   0.0000",
    ])
  })

  it("lists lengths at LUPREC and angles at AUPREC (p423)", () => {
    const cad = run(
      en,
      "LUPREC|2|AUPREC|3|_ARC|_C|1.23456,0|11.23456,0|1.23456,10|_LIST|_L||LUPREC|0|AUPREC|0|_LIST|_L|"
    )
    expect(listed(cad)).toEqual([
      '                  ARC       Layer: "0"',
      "                            Space: Model space",
      "            center point, X=     1.23  Y=     0.00  Z=     0.00",
      "            radius     10.00",
      "             start angle  0.000",
      "               end angle 90.000",
      "            length     15.71",
      '                  ARC       Layer: "0"',
      "                            Space: Model space",
      "            center point, X=        1  Y=        0  Z=        0",
      "            radius        10",
      "             start angle      0",
      "               end angle     90",
      "            length        16",
    ])
  })

  it("lists in a UCS, and an object off its plane (p424)", () => {
    const cad = run(
      en,
      "_LINE|1,2|11,7||_UCS|_O|5,5,2|_LIST|_L||_UCS|_Z|90|_LIST|_L||_UCS|_W|_UCS|_X|90|_CIRCLE|0,0|5|_LIST|_L||_UCS|_W|_LIST|_L|"
    )
    expect(listed(cad)).toEqual([
      '                  LINE      Layer: "0"',
      "                            Space: Model space",
      "              from point, X=  -4.0000  Y=  -3.0000  Z=  -2.0000",
      "                to point, X=   6.0000  Y=   2.0000  Z=  -2.0000",
      "          Length =  11.1803,  Angle in XY Plane =     27",
      "                  Delta X =  10.0000, Delta Y =    5.0000, Delta Z =   0.0000",
      '                  LINE      Layer: "0"',
      "                            Space: Model space",
      "              from point, X=  -3.0000  Y=   4.0000  Z=  -2.0000",
      "                to point, X=   2.0000  Y=  -6.0000  Z=  -2.0000",
      "          Length =  11.1803,  Angle in XY Plane =    297",
      "                  Delta X =   5.0000, Delta Y =  -10.0000, Delta Z =   0.0000",
      '                  CIRCLE    Layer: "0"',
      "                            Space: Model space",
      "            center point, X=   0.0000  Y=   0.0000  Z=   0.0000",
      "            radius    5.0000",
      "     circumference   31.4159",
      "              area   78.5398",
      '                  CIRCLE    Layer: "0"',
      "                            Space: Model space",
      "            center point, X=   0.0000  Y=   0.0000  Z=   0.0000",
      "            radius    5.0000",
      "Extrusion direction relative to UCS:",
      "                   X=   0.0000  Y=  -1.0000  Z=   0.0000",
      "     circumference   31.4159",
      "              area   78.5398",
    ])
  })

  it("lists a linetype or a lineweight alone (p427)", () => {
    const cad = run(
      en,
      "_-LINETYPE|_L|DASHED|acadiso.lin||CELTYPE|DASHED|_LINE|0,0|10,0||_LIST|_L||CELTYPE|BYLAYER|CELWEIGHT|50|_LINE|0,0,1|10,0,1||_LIST|_L||CELWEIGHT|0|_LINE|0,0|0,10||_LIST|_L|"
    )
    expect(listed(cad)).toEqual([
      '                  LINE      Layer: "0"',
      "                            Space: Model space",
      '                   Color: BYLAYER    Linetype: "DASHED"',
      "              from point, X=   0.0000  Y=   0.0000  Z=   0.0000",
      "                to point, X=  10.0000  Y=   0.0000  Z=   0.0000",
      "          Length =  10.0000,  Angle in XY Plane =      0",
      "                  Delta X =  10.0000, Delta Y =    0.0000, Delta Z =   0.0000",
      '                  LINE      Layer: "0"',
      "                            Space: Model space",
      "                   LineWeight: 0.50 mm",
      "              from point, X=   0.0000  Y=   0.0000  Z=   1.0000",
      "                to point, X=  10.0000  Y=   0.0000  Z=   1.0000",
      "          Length =  10.0000,  Angle in XY Plane =      0",
      "                  Delta X =  10.0000, Delta Y =    0.0000, Delta Z =   0.0000",
      '                  LINE      Layer: "0"',
      "                            Space: Model space",
      "                   LineWeight: 0.00 mm",
      "              from point, X=   0.0000  Y=   0.0000  Z=   0.0000",
      "                to point, X=   0.0000  Y=  10.0000  Z=   0.0000",
      "          Length =  10.0000,  Angle in XY Plane =     90",
      "                  Delta X =   0.0000, Delta Y =   10.0000, Delta Z =   0.0000",
    ])
  })

  it("lists a spline's tangents and one in space (p428)", () => {
    const cad = run(
      en,
      "_SPLINE|_M|_F|0,0|_T|1,1|10,10|20,0|_T|1,0|_LIST|_L||_SPLINE|_M|_F|0,0,0|10,10,5|20,0,0|30,10,-2||_LIST|_L|"
    )
    expect(listed(cad)).toEqual([
      '                  SPLINE    Layer: "0"',
      "                            Space: Model space",
      // AutoCAD 31.7176: its spline length is approximate
      "                           Length: 31.7172",
      "                            Order: 4",
      "                       Properties: Planar, Non-Rational, Non-Periodic",
      "                 Parametric Range: Start   0.0000",
      "                                     End  28.2843",
      "         Number of control points: 5",
      "                   Control Points: X = 0.0000   , Y = 0.0000   , Z = 0.0000",
      "                                   X = 4.7140   , Y = 4.7140   , Z = 0.0000",
      "                                   X = 5.2860   , Y = 17.6430  , Z = 0.0000",
      "                                   X = 24.7140  , Y = 0.0000   , Z = 0.0000",
      "                                   X = 20.0000  , Y = 0.0000   , Z = 0.0000",
      "             Number of fit points: 3",
      "                        User Data: Fit Points",
      "                                   X = 0.0000   , Y = 0.0000   , Z = 0.0000",
      "                                   X = 10.0000  , Y = 10.0000  , Z = 0.0000",
      "                                   X = 20.0000  , Y = 0.0000   , Z = 0.0000",
      "              Fit point tolerance: 1.0000E-10",
      "                                   Start Tangent",
      "                                   X = 1.0000   , Y = 1.0000   , Z = 0.0000",
      "                                   End Tangent",
      "                                   X = -1.0000  , Y = 0.0000   , Z = 0.0000",
      '                  SPLINE    Layer: "0"',
      "                            Space: Model space",
      "                           Length: 46.1961",
      "                            Order: 4",
      "                       Properties: Non-Planar, Non-Rational, Non-Periodic",
      "                 Parametric Range: Start   0.0000",
      "                                     End  44.2829",
      "         Number of control points: 6",
      "                   Control Points: X = 0.0000   , Y = 0.0000   , Z = 0.0000",
      "                                   X = 3.3448   , Y = 5.5815   , Z = 2.6231",
      "                                   X = 10.0343  , Y = 16.7446  , Z = 7.8694",
      "                                   X = 19.7060  , Y = -6.6004  , Z = -1.3286",
      "                                   X = 26.6251  , Y = 4.5576   , Z = -1.7799",
      "                                   X = 30.0000  , Y = 10.0000  , Z = -2.0000",
      "             Number of fit points: 4",
      "                        User Data: Fit Points",
      "                                   X = 0.0000   , Y = 0.0000   , Z = 0.0000",
      "                                   X = 10.0000  , Y = 10.0000  , Z = 5.0000",
      "                                   X = 20.0000  , Y = 0.0000   , Z = 0.0000",
      "                                   X = 30.0000  , Y = 10.0000  , Z = -2.0000",
      "              Fit point tolerance: 1.0000E-10",
    ])
  })

  it("lists a closed curve-fit polyline with widths (p430)", () => {
    const cad = run(
      en,
      "_PLINE|0,0|_W|1|0.5|10,0|10,10|0,10|_C|_PEDIT|_L|_F||_LIST|_L|"
    )
    expect(listed(cad)).toEqual([
      '                  POLYLINE  Layer: "0"',
      "                            Space: Model space",
      "            Closed",
      "    starting width    1.0000",
      "      ending width    0.5000",
      "              area  157.0796",
      "         perimeter   44.4288",
      '                  VERTEX    Layer: "0"',
      "                            Space: Model space",
      "                at point, X=   0.0000  Y=   0.0000  Z=   0.0000",
      "    starting width    1.0000",
      "      ending width    0.7500",
      "             bulge    0.1989",
      "            center X=   5.0000  Y=   5.0000  Z=   0.0000",
      "            radius    7.0711",
      "       start angle    225",
      "         end angle    270",
      '                  VERTEX    Layer: "0"',
      "                            Space: Model space",
      "                at point, X=   5.0000  Y=  -2.0711  Z=   0.0000",
      "    starting width    0.7500",
      "      ending width    0.5000",
      "                   (Inserted by curve fitting)",
      "             bulge    0.1989",
      "            center X=   5.0000  Y=   5.0000  Z=   0.0000",
      "            radius    7.0711",
      "       start angle    270",
      "         end angle    315",
      '                  VERTEX    Layer: "0"',
      "                            Space: Model space",
      "                at point, X=  10.0000  Y=   0.0000  Z=   0.0000",
      "    starting width    0.5000",
      "      ending width    0.5000",
      "             bulge    0.1989",
      "            center X=   5.0000  Y=   5.0000  Z=   0.0000",
      "            radius    7.0711",
      "       start angle    315",
      "         end angle      0",
      '                  VERTEX    Layer: "0"',
      "                            Space: Model space",
      "                at point, X=  12.0711  Y=   5.0000  Z=   0.0000",
      "    starting width    0.5000",
      "      ending width    0.5000",
      "                   (Inserted by curve fitting)",
      "             bulge    0.1989",
      "            center X=   5.0000  Y=   5.0000  Z=   0.0000",
      "            radius    7.0711",
      "       start angle      0",
      "         end angle     45",
      '                  VERTEX    Layer: "0"',
      "                            Space: Model space",
      "                at point, X=  10.0000  Y=  10.0000  Z=   0.0000",
      "    starting width    0.5000",
      "      ending width    0.5000",
      "             bulge    0.1989",
      "            center X=   5.0000  Y=   5.0000  Z=   0.0000",
      "            radius    7.0711",
      "       start angle     45",
      "         end angle     90",
      '                  VERTEX    Layer: "0"',
      "                            Space: Model space",
      "                at point, X=   5.0000  Y=  12.0711  Z=   0.0000",
      "    starting width    0.5000",
      "      ending width    0.5000",
      "                   (Inserted by curve fitting)",
      "             bulge    0.1989",
      "            center X=   5.0000  Y=   5.0000  Z=   0.0000",
      "            radius    7.0711",
      "       start angle     90",
      "         end angle    135",
      '                  VERTEX    Layer: "0"',
      "                            Space: Model space",
      "                at point, X=   0.0000  Y=  10.0000  Z=   0.0000",
      "    starting width    0.5000",
      "      ending width    0.5000",
      "             bulge    0.1989",
      "            center X=   5.0000  Y=   5.0000  Z=   0.0000",
      "            radius    7.0711",
      "       start angle    135",
      "         end angle    180",
      '                  VERTEX    Layer: "0"',
      "                            Space: Model space",
      "                at point, X=  -2.0711  Y=   5.0000  Z=   0.0000",
      "    starting width    0.5000",
      "      ending width    0.5000",
      "                   (Inserted by curve fitting)",
      "             bulge    0.1989",
      "            center X=   5.0000  Y=   5.0000  Z=   0.0000",
      "            radius    7.0711",
      "       start angle    180",
      "         end angle    225",
      '                  END SEQUENCE  Layer: "0"',
      "                            Space: Model space",
    ])
  })

  it("lists text by justification (p431)", () => {
    const cad = run(
      en,
      "_-TEXT|_J|_TL|0,0|2.5|0|TL|_LIST|_L||_-TEXT|_J|_R|0,10|2.5|0|R|_LIST|_L||_-TEXT|_J|_C|0,20|2.5|0|C|_LIST|_L||_-TEXT|_J|_M|0,30|2.5|0|M|_LIST|_L||_-TEXT|_J|_BR|0,40|2.5|0|BR|_LIST|_L||_-TEXT|_J|_ML|0,50|2.5|0|ML|_LIST|_L|"
    )
    expect(listed(cad)).toEqual([
      '                  TEXT      Layer: "0"',
      "                            Space: Model space",
      '             Style = "Standard"',
      "        Annotative: No",
      "             Typeface = Arial",
      "          top/left point, X=   0.0000  Y=   0.0000  Z=   0.0000",
      "            height    2.5000",
      "              text TL",
      "          rotation angle      0",
      "             width scale factor    1.0000",
      "         obliquing angle      0",
      "        generation normal",
      '                  TEXT      Layer: "0"',
      "                            Space: Model space",
      '             Style = "Standard"',
      "        Annotative: No",
      "             Typeface = Arial",
      "               end point, X=   0.0000  Y=  10.0000  Z=   0.0000",
      "            height    2.5000",
      "              text R",
      "          rotation angle      0",
      "             width scale factor    1.0000",
      "         obliquing angle      0",
      "        generation normal",
      '                  TEXT      Layer: "0"',
      "                            Space: Model space",
      '             Style = "Standard"',
      "        Annotative: No",
      "             Typeface = Arial",
      "            center point, X=   0.0000  Y=  20.0000  Z=   0.0000",
      "            height    2.5000",
      "              text C",
      "          rotation angle      0",
      "             width scale factor    1.0000",
      "         obliquing angle      0",
      "        generation normal",
      '                  TEXT      Layer: "0"',
      "                            Space: Model space",
      '             Style = "Standard"',
      "        Annotative: No",
      "             Typeface = Arial",
      "               mid point, X=   0.0000  Y=  30.0000  Z=   0.0000",
      "            height    2.5000",
      "              text M",
      "          rotation angle      0",
      "             width scale factor    1.0000",
      "         obliquing angle      0",
      "        generation normal",
      '                  TEXT      Layer: "0"',
      "                            Space: Model space",
      '             Style = "Standard"',
      "        Annotative: No",
      "             Typeface = Arial",
      "      bottom/right point, X=   0.0000  Y=  40.0000  Z=   0.0000",
      "            height    2.5000",
      "              text BR",
      "          rotation angle      0",
      "             width scale factor    1.0000",
      "         obliquing angle      0",
      "        generation normal",
      '                  TEXT      Layer: "0"',
      "                            Space: Model space",
      '             Style = "Standard"',
      "        Annotative: No",
      "             Typeface = Arial",
      "          mid/left point, X=   0.0000  Y=  50.0000  Z=   0.0000",
      "            height    2.5000",
      "              text ML",
      "          rotation angle      0",
      "             width scale factor    1.0000",
      "         obliquing angle      0",
      "        generation normal",
    ])
  })

  it("lists MTEXT justified, spaced exactly and turned (p432)", () => {
    const cad = run(
      en,
      "_-MTEXT|0,0|_J|_MC|_L|_E|2|_R|30|_W|0|Line||_LIST|_L||_-MTEXT|0,0|_H|5|_J|_BR|40,-20|A{\\H2;b}c||_LIST|_L|"
    )
    expect(listed(cad)).toEqual([
      '                  MTEXT     Layer: "0"',
      "                            Space: Model space",
      '             Style = "Standard"',
      "        Annotative: No",
      "Location:        X=   0.0000  Y=   0.0000  Z=   0.0000",
      "Width:              0.0000",
      "Normal:          X=   0.0000  Y=   0.0000  Z=   1.0000",
      "Rotation:               30",
      "Text height:        2.5000",
      "Line spacing:    Exactly (0.48x =    2.0000)",
      "Attachment:      MiddleCenter",
      "Flow direction:  ByStyle",
      "Contents:        Line",
      '                  MTEXT     Layer: "0"',
      "                            Space: Model space",
      '             Style = "Standard"',
      "        Annotative: No",
      "Location:        X=  40.0000  Y= -20.0000  Z=   0.0000",
      "Width:             40.0000",
      "Normal:          X=   0.0000  Y=   0.0000  Z=   1.0000",
      "Rotation:                0",
      "Text height:        5.0000",
      "Line spacing:    Multiple (1x =    8.3333)",
      "Attachment:      BottomRight",
      "Flow direction:  ByStyle",
      "Contents:        A{\\H2;b}c",
    ])
  })

  it("lists a block reference and a rectangular array (p434)", () => {
    const cad = run(
      en,
      "_CIRCLE|0,0|2|_-BLOCK|B2|0,0|_L||_-INSERT|B2|10,10|1|1|0|_LIST|_L||_CIRCLE|0,0|2|_ARRAYRECT|_L||_X|_LIST|_L|"
    )
    expect(listed(cad)).toEqual([
      '                  BLOCK REFERENCE  Layer: "0"',
      "                            Space: Model space",
      '       Block Name: "B2"',
      "                at point, X=  10.0000  Y=  10.0000  Z=   0.0000",
      "   X scale factor:    1.0000",
      "   Y scale factor:    1.0000",
      "   rotation angle:      0",
      "   Z scale factor:    1.0000",
      "         InsUnits: Millimeters",
      "  Unit conversion:    1.0000",
      "  Scale uniformly: No",
      "  Allow exploding: Yes",
      '                  ARRAY     Layer: "0"',
      "                            Space: Model space",
      "      Array type:  Rectangular",
      "      Base point:  X=   0.0000  Y=   0.0000  Z=   0.0000",
      "        Number of columns:          4",
      "           Column spacing:     6.0000",
      "           Number of rows:          3",
      "              Row spacing:     6.0000",
      "  Row elevation increment:     0.0000",
      "         Number of levels:          1",
      "            Level spacing:     1.0000",
      "      Included axis angle:         90",
    ])
  })

  it("lists picks in the order picked (p435)", () => {
    const cad = run(
      en,
      "_ZOOM|_W|-20,-20|30,30|_LINE|0,0|10,0||_CIRCLE|5,5|2|_ARC|_C|0,0|3,0|0,3|_LIST|10,0|3,5|0,3|"
    )
    expect(listed(cad)).toEqual([
      '                  LINE      Layer: "0"',
      "                            Space: Model space",
      "              from point, X=   0.0000  Y=   0.0000  Z=   0.0000",
      "                to point, X=  10.0000  Y=   0.0000  Z=   0.0000",
      "          Length =  10.0000,  Angle in XY Plane =      0",
      "                  Delta X =  10.0000, Delta Y =    0.0000, Delta Z =   0.0000",
      '                  CIRCLE    Layer: "0"',
      "                            Space: Model space",
      "            center point, X=   5.0000  Y=   5.0000  Z=   0.0000",
      "            radius    2.0000",
      "     circumference   12.5664",
      "              area   12.5664",
      '                  ARC       Layer: "0"',
      "                            Space: Model space",
      "            center point, X=   0.0000  Y=   0.0000  Z=   0.0000",
      "            radius    3.0000",
      "             start angle      0",
      "               end angle     90",
      "            length    4.7124",
    ])
  })

  it("lists objects drawn in a tilted UCS (p436)", () => {
    const cad = run(
      en,
      "_UCS|_X|90|_LINE|0,0|10,0||_ARC|_C|0,0|3,0|0,3|_ELLIPSE|_C|0,0|10,0|4|_PLINE|0,0|10,0|10,10||_-TEXT|0,0|2.5|0|T|_SPLINE|_M|_F|0,0|10,10|20,0||_UCS|_W|_LIST|_ALL|"
    )
    expect(listed(cad)).toEqual([
      '                  SPLINE    Layer: "0"',
      "                            Space: Model space",
      "                           Length: 29.1448",
      "                            Order: 4",
      "                       Properties: Planar, Non-Rational, Non-Periodic",
      "                 Parametric Range: Start   0.0000",
      "                                     End  28.2843",
      "         Number of control points: 5",
      "                   Control Points: X = 0.0000   , Y = 0.0000   , Z = 0.0000",
      "                                   X = 3.3333   , Y = 0.0000   , Z = 5.0000",
      "                                   X = 10.0000  , Y = 0.0000   , Z = 15.0000",
      "                                   X = 16.6667  , Y = 0.0000   , Z = 5.0000",
      "                                   X = 20.0000  , Y = 0.0000   , Z = 0.0000",
      "             Number of fit points: 3",
      "                        User Data: Fit Points",
      "                                   X = 0.0000   , Y = 0.0000   , Z = 0.0000",
      "                                   X = 10.0000  , Y = 0.0000   , Z = 10.0000",
      "                                   X = 20.0000  , Y = 0.0000   , Z = 0.0000",
      "              Fit point tolerance: 1.0000E-10",
      '                  TEXT      Layer: "0"',
      "                            Space: Model space",
      '             Style = "Standard"',
      "        Annotative: No",
      "             Typeface = Arial",
      "             start point, X=   0.0000  Y=   0.0000  Z=   0.0000",
      "            height    2.5000",
      "              text T",
      "             width scale factor    1.0000",
      "         obliquing angle      0",
      "Extrusion direction relative to UCS:",
      "                   X=   0.0000  Y=  -1.0000  Z=   0.0000",
      "        generation normal",
      '                  LWPOLYLINE  Layer: "0"',
      "                            Space: Model space",
      "              Open",
      "    Constant width    0.0000",
      "Extrusion direction relative to UCS:",
      "                   X=   0.0000  Y=  -1.0000  Z=   0.0000",
      "              area   50.0000",
      "            length   20.0000",
      "          at point  X=   0.0000  Y=   0.0000  Z=   0.0000",
      "          at point  X=  10.0000  Y=   0.0000  Z=   0.0000",
      "          at point  X=  10.0000  Y=   0.0000  Z=  10.0000",
      '                  ELLIPSE   Layer: "0"',
      "                            Space: Model space",
      "                             Area: 125.6637",
      "                    Circumference: 46.0262",
      "                           Center: X = 0.0000   , Y = 0.0000   , Z = 0.0000",
      "                       Major Axis: X = 10.0000  , Y = 0.0000   , Z = 0.0000",
      "                       Minor Axis: X = 0.0000   , Y = 0.0000   , Z = 4.0000",
      "                     Radius Ratio: 0.4000",
      '                  ARC       Layer: "0"',
      "                            Space: Model space",
      "            center point, X=   0.0000  Y=   0.0000  Z=   0.0000",
      "            radius    3.0000",
      "Extrusion direction relative to UCS:",
      "                   X=   0.0000  Y=  -1.0000  Z=   0.0000",
      "            length    4.7124",
      "             total angle     90",
      '                  LINE      Layer: "0"',
      "                            Space: Model space",
      "              from point, X=   0.0000  Y=   0.0000  Z=   0.0000",
      "                to point, X=  10.0000  Y=   0.0000  Z=   0.0000",
      "Extrusion direction relative to UCS:",
      "                   X=   0.0000  Y=  -1.0000  Z=   0.0000",
      "          Length =  10.0000,  Angle in XY Plane =      0",
      "                  Delta X =  10.0000, Delta Y =    0.0000, Delta Z =   0.0000",
    ])
  })

  it("lists a reference, a dimension and MTEXT in a tilted UCS (p437)", () => {
    const cad = run(
      en,
      "_UCS|_X|90|_-MTEXT|0,0|40,-20|M||_-HATCH|_P|SOLID|_S|_N|||_DIMLINEAR|0,0|10,0|5,5|_CIRCLE|0,0|2|_-BLOCK|B3|0,0|_L||_-INSERT|B3|10,10|1|1|0|_UCS|_W|_LIST|_ALL|"
    )
    expect(listed(cad)).toEqual([
      '                  BLOCK REFERENCE  Layer: "0"',
      "                            Space: Model space",
      '       Block Name: "B3"',
      "                at point, X=  10.0000  Y=   0.0000  Z=  10.0000",
      "   X scale factor:    1.0000",
      "   Y scale factor:    1.0000",
      "   Z scale factor:    1.0000",
      "Extrusion direction relative to UCS:",
      "                   X=   0.0000  Y=  -1.0000  Z=   0.0000",
      "         InsUnits: Millimeters",
      "  Unit conversion:    1.0000",
      "  Scale uniformly: No",
      "  Allow exploding: Yes",
      '                  BLOCK REFERENCE  Layer: "0"',
      "                            Space: Model space",
      '       Block Name: "B3"',
      "                at point, X=   0.0000  Y=   0.0000  Z=   0.0000",
      "   X scale factor:    1.0000",
      "   Y scale factor:    1.0000",
      "   Z scale factor:    1.0000",
      "Extrusion direction relative to UCS:",
      "                   X=   0.0000  Y=  -1.0000  Z=   0.0000",
      "         InsUnits: Millimeters",
      "  Unit conversion:    1.0000",
      "  Scale uniformly: No",
      "  Allow exploding: Yes",
      '                  DIMENSION  Layer: "0"',
      "                            Space: Model space",
      "Extrusion direction relative to UCS:",
      "                   X=   0.0000  Y=  -1.0000  Z=   0.0000",
      "associative: no",
      "type: <linear, not parallel to UCS>",
      "1st extension  defining point: X=   0.0000  Y=   0.0000  Z=   0.0000",
      "2nd extension  defining point: X=  10.0000  Y=   0.0000  Z=   0.0000",
      "dimension line defining point: X=  10.0000  Y=   0.0000  Z=   5.0000",
      // AutoCAD's console sets the text by its own font
      "default text position: X=   5.0000  Y=   0.0000  Z=   6.8750",
      "default text",
      'dimension style: "ISO-25"',
      "Annotative: No",
      '                  MTEXT     Layer: "0"',
      "                            Space: Model space",
      '             Style = "Standard"',
      "        Annotative: No",
      "Location:        X=   0.0000  Y=   0.0000  Z=   0.0000",
      "Width:             40.0000",
      "Normal:          X=   0.0000  Y=  -1.0000  Z=   0.0000",
      "Rotation:                0",
      "Text height:        2.5000",
      "Line spacing:    Multiple (1x =    4.1667)",
      "Attachment:      TopLeft",
      "Flow direction:  ByStyle",
      "Contents:        M",
    ])
  })

  it("lists a hatch's area unpadded (p441)", () => {
    const cad = run(
      en,
      "LUPREC|2|_ZOOM|_W|-20,-20|20,20|_RECTANG|0,0|10,5|_-HATCH|_P|SOLID|5,2||_LIST|_L|"
    )
    expect(listed(cad)).toEqual([
      '                  HATCH     Layer: "0"',
      "                            Space: Model space",
      "                 Hatch pattern SOLID",
      "                 Not associative",
      "                 Area      50.00",
      "                 Origin    X=     0.00  Y=     0.00  Z=     0.00",
    ])
  })

  it("lists MTEXT heights (p442)", () => {
    const cad = run(
      en,
      "_-MTEXT|0,0|_J|_TC|40,-20|A||_LIST|_L||_-MTEXT|0,0|_H|5|40,-20|B||_LIST|_L||_-MTEXT|0,0|_J|_TL|40,-20|C||_LIST|_L|"
    )
    expect(listed(cad)).toEqual([
      '                  MTEXT     Layer: "0"',
      "                            Space: Model space",
      '             Style = "Standard"',
      "        Annotative: No",
      "Location:        X=  20.0000  Y=   0.0000  Z=   0.0000",
      "Width:             40.0000",
      "Normal:          X=   0.0000  Y=   0.0000  Z=   1.0000",
      "Rotation:                0",
      "Text height:        2.5000",
      "Line spacing:    Multiple (1x =    4.1667)",
      "Attachment:      TopCenter",
      "Flow direction:  ByStyle",
      "Contents:        A",
      '                  MTEXT     Layer: "0"',
      "                            Space: Model space",
      '             Style = "Standard"',
      "        Annotative: No",
      "Location:        X=   0.0000  Y=   0.0000  Z=   0.0000",
      "Width:             40.0000",
      "Normal:          X=   0.0000  Y=   0.0000  Z=   1.0000",
      "Rotation:                0",
      "Text height:        5.0000",
      "Line spacing:    Multiple (1x =    8.3333)",
      "Attachment:      TopLeft",
      "Flow direction:  ByStyle",
      "Contents:        B",
      '                  MTEXT     Layer: "0"',
      "                            Space: Model space",
      '             Style = "Standard"',
      "        Annotative: No",
      "Location:        X=   0.0000  Y=   0.0000  Z=   0.0000",
      "Width:             40.0000",
      "Normal:          X=   0.0000  Y=   0.0000  Z=   1.0000",
      "Rotation:                0",
      "Text height:        5.0000",
      "Line spacing:    Multiple (1x =    8.3333)",
      "Attachment:      TopLeft",
      "Flow direction:  ByStyle",
      "Contents:        C",
    ])
  })

  it("lists a closed CV spline and a closed fit spline that crosses itself (p444)", () => {
    const cad = run(
      en,
      "_SPLINE|_M|_CV|0,0|10,0|10,10|0,10|_C|_LIST|_L||_SPLINE|_M|_F|0,0|10,10|10,0|0,10|_C|_LIST|_L|"
    )
    expect(listed(cad)).toEqual([
      '                  SPLINE    Layer: "0"',
      "                            Space: Model space",
      "                             Area: 67.7778",
      "                    Circumference: 29.2057",
      "                            Order: 4",
      "                       Properties: Planar, Non-Rational, Periodic",
      "                 Parametric Range: Start   0.0000",
      "                                     End   4.0000",
      "         Number of control points: 4",
      "                   Control Points: X = 0.0000   , Y = 0.0000   , Z = 0.0000",
      "                                   X = 10.0000  , Y = 0.0000   , Z = 0.0000",
      "                                   X = 10.0000  , Y = 10.0000  , Z = 0.0000",
      "                                   X = 0.0000   , Y = 10.0000  , Z = 0.0000",
      '                  SPLINE    Layer: "0"',
      "                            Space: Model space",
      // AutoCAD 50.7829: its spline length is approximate
      "                    Circumference: 50.7827",
      "                            Order: 4",
      "                       Properties: Planar, Non-Rational, Periodic",
      "                 Parametric Range: Start   0.0000",
      "                                     End  48.2843",
      "         Number of control points: 4",
      "                   Control Points: X = 11.6019  , Y = -10.4044 , Z = 0.0000",
      "                                   X = -1.6019  , Y = 20.4044  , Z = 0.0000",
      "                                   X = -1.6019  , Y = -10.4044 , Z = 0.0000",
      "                                   X = 11.6019  , Y = 20.4044  , Z = 0.0000",
      "             Number of fit points: 5",
      "                        User Data: Fit Points",
      "                                   X = 0.0000   , Y = 0.0000   , Z = 0.0000",
      "                                   X = 10.0000  , Y = 10.0000  , Z = 0.0000",
      "                                   X = 10.0000  , Y = 0.0000   , Z = 0.0000",
      "                                   X = 0.0000   , Y = 10.0000  , Z = 0.0000",
      "                                   X = 0.0000   , Y = 0.0000   , Z = 0.0000",
      "              Fit point tolerance: 1.0000E-10",
    ])
  })
})

describe("LIST against AutoCAD 2027's console in Spanish", () => {
  it("lists a line (p400)", () => {
    const cad = run(es, "_LINE|0,0|10,5||_LIST|_L|")
    expect(listed(cad)).toEqual([
      '                  LINEA     Capa: "0"',
      "                            Espacio: Espacio modelo",
      "                de punto, X=   0.0000  Y=   0.0000  Z=   0.0000",
      "             hasta punto, X=  10.0000  Y=   5.0000  Z=   0.0000",
      "          Longitud =   11.1803, Ángulo en el plano XY =     27",
      "                  Incremento X =  10.0000,  Incremento Y =    5.0000,  Incremento Z =    0.0000",
    ])
  })

  it("lists an ellipse and an elliptical arc (p404)", () => {
    const cad = run(
      es,
      "_ELLIPSE|_C|0,0|10,0|4|_LIST|_L||_ELLIPSE|_A|_C|0,0|10,10|4|30|200|_LIST|_L|"
    )
    expect(listed(cad)).toEqual([
      '                  ELLIPSE   Capa: "0"',
      "                            Espacio: Espacio modelo",
      "                             Área: 125.6637",
      "                   Circunferencia: 46.0262",
      "                           Center: X = 0.0000   , Y = 0.0000   , Z = 0.0000",
      "                        Eje mayor: X = 10.0000  , Y = 0.0000   , Z = 0.0000",
      "                        Eje menor: X = 0.0000   , Y = 4.0000   , Z = 0.0000",
      "                  Relación del radio: 0.4000",
      '                  ELLIPSE   Capa: "0"',
      "                            Espacio: Espacio modelo",
      "                         Longitud: 28.2769",
      "                           Center: X = 0.0000   , Y = 0.0000   , Z = 0.0000",
      "                        Eje mayor: X = 10.0000  , Y = 10.0000  , Z = 0.0000",
      "                        Eje menor: X = -2.8284  , Y = 2.8284   , Z = 0.0000",
      "                    Punto inicial: X = 1.8594   , Y = 6.9394   , Z = 0.0000",
      "                      Punto final: X = -3.9027  , Y = -8.3694  , Z = 0.0000",
      "                   Ángulo inicial: 30",
      "                     Ángulo final: 200",
      "                  Relación del radio: 0.2828",
    ])
  })

  it("lists a fit spline (p405)", () => {
    const cad = run(es, "_SPLINE|_M|_F|0,0|10,10|20,0|30,10||_LIST|_L|")
    expect(listed(cad)).toEqual([
      '                  SPLINE    Capa: "0"',
      "                            Espacio: Espacio modelo",
      "                         Longitud: 44.2385",
      "                            Orden: 4",
      "                      Propiedades: Plana, No racional, No periódica",
      "                 Rango de parámetros: Inicio   0.0000",
      "                                     Fin  42.4264",
      "         Número de puntos de apoyo: 6",
      "                  Puntos de apoyo: X = 0.0000   , Y = 0.0000   , Z = 0.0000",
      "                                   X = 3.3333   , Y = 5.5556   , Z = 0.0000",
      "                                   X = 10.0000  , Y = 16.6667  , Z = 0.0000",
      "                                   X = 20.0000  , Y = -6.6667  , Z = 0.0000",
      "                                   X = 26.6667  , Y = 4.4444   , Z = 0.0000",
      "                                   X = 30.0000  , Y = 10.0000  , Z = 0.0000",
      "             Número de puntos de ajuste: 4",
      "                  Datos del usuario: Ajustar puntos",
      "                                   X = 0.0000   , Y = 0.0000   , Z = 0.0000",
      "                                   X = 10.0000  , Y = 10.0000  , Z = 0.0000",
      "                                   X = 20.0000  , Y = 0.0000   , Z = 0.0000",
      "                                   X = 30.0000  , Y = 10.0000  , Z = 0.0000",
      "              Tolerancia de punto de ajuste: 1.0000E-10",
    ])
  })

  it("lists lightweight polylines, an arc segment and a closed one (p407)", () => {
    const cad = run(
      es,
      "_PLINE|0,0|10,0|_A|20,10|_L|20,20||_LIST|_L||_PLINE|0,0|-10,0|-10,-10|_C|_LIST|_L|"
    )
    expect(listed(cad)).toEqual([
      '                  LWPOLYLINE  Capa: "0"',
      "                            Espacio: Espacio modelo",
      "             Abrir",
      " Anchura constante    0.0000",
      "              área   178.5398",
      "          longitud   35.7080",
      "          en el punto  X=   0.0000  Y=   0.0000  Z=   0.0000",
      "          en el punto  X=  10.0000  Y=   0.0000  Z=   0.0000",
      "         curvatura    0.4142",
      "            centro  X=  10.0000  Y=  10.0000  Z=   0.0000",
      "             radio   10.0000",
      "    ángulo inicial       270",
      "      ángulo final         0",
      "          en el punto  X=  20.0000  Y=  10.0000  Z=   0.0000",
      "          en el punto  X=  20.0000  Y=  20.0000  Z=   0.0000",
      '                  LWPOLYLINE  Capa: "0"',
      "                            Espacio: Espacio modelo",
      "           Cerrada",
      " Anchura constante    0.0000",
      "              área   50.0000",
      "         perímetro   34.1421",
      "          en el punto  X=   0.0000  Y=   0.0000  Z=   0.0000",
      "          en el punto  X= -10.0000  Y=   0.0000  Z=   0.0000",
      "          en el punto  X= -10.0000  Y= -10.0000  Z=   0.0000",
    ])
  })

  it("lists a curve-fit polyline's VERTEX entries and one decurved (p409)", () => {
    const cad = run(
      es,
      "_PLINE|0,0|10,0|20,10|30,0||_PEDIT|_L|_F||_LIST|_L||_PEDIT|_L|_D||_LIST|_L|"
    )
    expect(listed(cad)).toEqual([
      '                  POLILINEA  Capa: "0"',
      "                            Espacio: Espacio modelo",
      "           Abierta",
      "   anchura inicial    0.0000",
      "     anchura final    0.0000",
      // AutoCAD 138.8091, AREA too (p445): Missing
      "              área  127.9339",
      "            longitud   41.1094",
      '                  VERTICE   Capa: "0"',
      "                            Espacio: Espacio modelo",
      "                en punto; X=   0.0000  Y=   0.0000  Z=   0.0000",
      "   anchura inicial    0.0000",
      "     anchura final    0.0000",
      "         curvatura    0.0806",
      "            centro X=   5.0000  Y=  15.0000  Z=   0.0000",
      "             radio   15.8114",
      "    ángulo inicial    252",
      "      ángulo final    270",
      '                  VERTICE   Capa: "0"',
      "                            Espacio: Espacio modelo",
      "                en punto; X=   5.0000  Y=  -0.8114  Z=   0.0000",
      "   anchura inicial    0.0000",
      "     anchura final    0.0000",
      "                   (Inserción por adaptación de curva)",
      "         curvatura    0.0806",
      "            centro X=   5.0000  Y=  15.0000  Z=   0.0000",
      "             radio   15.8114",
      "    ángulo inicial    270",
      "      ángulo final    288",
      '                  VERTICE   Capa: "0"',
      "                            Espacio: Espacio modelo",
      "                en punto; X=  10.0000  Y=   0.0000  Z=   0.0000",
      "   anchura inicial    0.0000",
      "     anchura final    0.0000",
      "         curvatura    0.2549",
      "            centro X=   7.5138  Y=   7.4587  Z=   0.0000",
      "             radio    7.8621",
      "    ángulo inicial    288",
      "      ángulo final    346",
      '                  VERTICE   Capa: "0"',
      "                            Espacio: Espacio modelo",
      "                en punto; X=  15.1302  Y=   5.5084  Z=   0.0000",
      "   anchura inicial    0.0000",
      "     anchura final    0.0000",
      "                   (Inserción por adaptación de curva)",
      "         curvatura   -0.2957",
      "            centro X=  21.0298  Y=   3.9977  Z=   0.0000",
      "             radio    6.0900",
      "    ángulo inicial    100",
      "      ángulo final    166",
      '                  VERTICE   Capa: "0"',
      "                            Espacio: Espacio modelo",
      "                en punto; X=  20.0000  Y=  10.0000  Z=   0.0000",
      "   anchura inicial    0.0000",
      "     anchura final    0.0000",
      "         curvatura   -0.2435",
      "            centro X=  21.3019  Y=   2.4118  Z=   0.0000",
      "             radio    7.6991",
      "    ángulo inicial     45",
      "      ángulo final    100",
      '                  VERTICE   Capa: "0"',
      "                            Espacio: Espacio modelo",
      "                en punto; X=  26.7460  Y=   7.8559  Z=   0.0000",
      "   anchura inicial    0.0000",
      "     anchura final    0.0000",
      "                   (Inserción por adaptación de curva)",
      "         curvatura   -0.1989",
      "            centro X=  18.8901  Y=   0.0000  Z=   0.0000",
      "             radio   11.1099",
      "    ángulo inicial      0",
      "      ángulo final     45",
      '                  VERTICE   Capa: "0"',
      "                            Espacio: Espacio modelo",
      "                en punto; X=  30.0000  Y=   0.0000  Z=   0.0000",
      "   anchura inicial    0.0000",
      "     anchura final    0.0000",
      '                  FIN SECUENCIA  Capa: "0"',
      "                            Espacio: Espacio modelo",
      '                  LWPOLYLINE  Capa: "0"',
      "                            Espacio: Espacio modelo",
      "             Abrir",
      " Anchura constante    0.0000",
      "              área   100.0000",
      "          longitud   38.2843",
      "          en el punto  X=   0.0000  Y=   0.0000  Z=   0.0000",
      "          en el punto  X=  10.0000  Y=   0.0000  Z=   0.0000",
      "          en el punto  X=  20.0000  Y=  10.0000  Z=   0.0000",
      "          en el punto  X=  30.0000  Y=   0.0000  Z=   0.0000",
    ])
  })

  it("lists 3D polylines (p410)", () => {
    const cad = run(
      es,
      "_3DPOLY|0,0,0|10,0,5|10,10,-3||_LIST|_L||_3DPOLY|0,0,0|10,0,0|10,10,0|_C|_LIST|_L|"
    )
    expect(listed(cad)).toEqual([
      '                  POLILINEA  Capa: "0"',
      "                            Espacio: Espacio modelo",
      "           Abierta espacio",
      "              área   68.7386",
      "            longitud   23.9866",
      '                  VERTICE   Capa: "0"',
      "                            Espacio: Espacio modelo",
      "           Espacio",
      "                en punto, X=   0.0000  Y=   0.0000  Z=   0.0000",
      '                  VERTICE   Capa: "0"',
      "                            Espacio: Espacio modelo",
      "           Espacio",
      "                en punto, X=  10.0000  Y=   0.0000  Z=   5.0000",
      '                  VERTICE   Capa: "0"',
      "                            Espacio: Espacio modelo",
      "           Espacio",
      "                en punto, X=  10.0000  Y=  10.0000  Z=  -3.0000",
      '                  FIN SECUENCIA  Capa: "0"',
      "                            Espacio: Espacio modelo",
      '                  POLILINEA  Capa: "0"',
      "                            Espacio: Espacio modelo",
      "           Cerrada espacio",
      "              área   50.0000",
      "         perímetro   34.1421",
      '                  VERTICE   Capa: "0"',
      "                            Espacio: Espacio modelo",
      "           Espacio",
      "                en punto, X=   0.0000  Y=   0.0000  Z=   0.0000",
      '                  VERTICE   Capa: "0"',
      "                            Espacio: Espacio modelo",
      "           Espacio",
      "                en punto, X=  10.0000  Y=   0.0000  Z=   0.0000",
      '                  VERTICE   Capa: "0"',
      "                            Espacio: Espacio modelo",
      "           Espacio",
      "                en punto, X=  10.0000  Y=  10.0000  Z=   0.0000",
      '                  FIN SECUENCIA  Capa: "0"',
      "                            Espacio: Espacio modelo",
    ])
  })

  it("lists MTEXT (p412)", () => {
    const cad = run(es, "_-MTEXT|0,0|40,-20|First line|Second||_LIST|_L|")
    expect(listed(cad)).toEqual([
      '                  MTEXT     Capa: "0"',
      "                            Espacio: Espacio modelo",
      '             Estilo = "Standard"',
      "        Anotativo: no",
      "Ubicación:        X=   0.0000  Y=   0.0000  Z=   0.0000",
      "Anchura:            40.0000",
      "Normal:           X=   0.0000  Y=   0.0000  Z=   1.0000",
      "Rotación:                0",
      "Altura de texto:    2.5000",
      "Interlineado:     Múltiple (1x =    4.1667)",
      "Enlace:           SIzquierda",
      "Dirección:        PorEstilo",
      "Contenido:        First line\\PSecond",
    ])
  })

  it("lists attribute definitions (p413)", () => {
    const cad = run(
      es,
      "_-ATTDEF||TAG1|Your prompt|Dflt|0,0|2.5|0|_LIST|_L||_-ATTDEF|_I|_C||TAG2|Fixed value|10,0|2.5|0|_LIST|_L|"
    )
    expect(listed(cad)).toEqual([
      '                  DEFINICIÓN DE ATRIBUTO  Capa: "0"',
      "                            Espacio: Espacio modelo",
      '             Estilo = "Standard"',
      "        Anotativo: no",
      "             Tipo de letra = Arial",
      "           inicial punto, X=   0.0000  Y=   0.0000  Z=   0.0000",
      "            altura    2.5000",
      "       por defecto Dflt",
      "         solicitud Your prompt",
      "     identificador TAG1",
      "          rotación ángulo      0",
      "           anchura factor de escala    1.0000",
      "        oblicuidad ángulo      0",
      "       indicadores normal",
      "        generación normal",
      '                  DEFINICIÓN DE ATRIBUTO  Capa: "0"',
      "                            Espacio: Espacio modelo",
      '             Estilo = "Standard"',
      "        Anotativo: no",
      "             Tipo de letra = Arial",
      "           inicial punto, X=  10.0000  Y=   0.0000  Z=   0.0000",
      "            altura    2.5000",
      "       por defecto Fixed value",
      "         solicitud",
      "     identificador TAG2",
      "          rotación ángulo      0",
      "           anchura factor de escala    1.0000",
      "        oblicuidad ángulo      0",
      "       indicadores invisible  constante",
      "        generación normal",
    ])
  })

  it("lists linear and aligned dimensions (p414)", () => {
    const cad = run(
      es,
      "_DIMLINEAR|0,0|100,0|50,10|_LIST|_L||_DIMLINEAR|0,0|30,40|50,20|_LIST|_L||_DIMLINEAR|0,0|30,40|_R|30|50,20|_LIST|_L||_DIMALIGNED|0,0|30,40|-10,10|_LIST|_L|"
    )
    expect(listed(cad)).toEqual([
      '                  ACOTACION  Capa: "0"',
      "                            Espacio: Espacio modelo",
      "asociativo: no",
      "tipo: horizontal",
      "1ª extensión    punto definidor X=   0.0000  Y=   0.0000  Z=   0.0000",
      "2ª extensión    punto definidor X= 100.0000  Y=   0.0000  Z=   0.0000",
      "línea de cota punto definidor X= 100.0000  Y=  10.0000  Z=   0.0000",
      // AutoCAD's console sets the text by its own font
      "por defecto posición del texto: X=  50.0000  Y=  11.8750  Z=   0.0000",
      "texto por defecto",
      'estilo de cota: "ISO-25"',
      "Anotativo: No",
      '                  ACOTACION  Capa: "0"',
      "                            Espacio: Espacio modelo",
      "asociativo: no",
      "tipo: vertical",
      "1ª extensión    punto definidor X=   0.0000  Y=   0.0000  Z=   0.0000",
      "2ª extensión    punto definidor X=  30.0000  Y=  40.0000  Z=   0.0000",
      "línea de cota punto definidor X=  50.0000  Y=  40.0000  Z=   0.0000",
      // AutoCAD's console sets the text by its own font
      "por defecto posición del texto: X=  48.1250  Y=  20.0000  Z=   0.0000",
      "texto por defecto",
      'estilo de cota: "ISO-25"',
      "Anotativo: No",
      '                  ACOTACION  Capa: "0"',
      "                            Espacio: Espacio modelo",
      "asociativo: no",
      "tipo: girada",
      " rotación:     30",
      "1ª extensión    punto definidor X=   0.0000  Y=   0.0000  Z=   0.0000",
      "2ª extensión    punto definidor X=  30.0000  Y=  40.0000  Z=   0.0000",
      "línea de cota punto definidor X=  43.6603  Y=  16.3397  Z=   0.0000",
      // AutoCAD's console sets the text by its own font
      "por defecto posición del texto: X=  22.8125  Y=   6.4684  Z=   0.0000",
      "texto por defecto",
      'estilo de cota: "ISO-25"',
      "Anotativo: No",
      '                  ACOTACION  Capa: "0"',
      "                            Espacio: Espacio modelo",
      "asociativo: no",
      "tipo: alineado",
      "1ª extensión    punto definidor X=   0.0000  Y=   0.0000  Z=   0.0000",
      "2ª extensión    punto definidor X=  30.0000  Y=  40.0000  Z=   0.0000",
      "línea de cota punto definidor X=  18.8000  Y=  48.4000  Z=   0.0000",
      // AutoCAD's console sets the text by its own font
      "por defecto posición del texto: X=   2.3000  Y=  29.5250  Z=   0.0000",
      "texto por defecto",
      'estilo de cota: "ISO-25"',
      "Anotativo: No",
    ])
  })

  it("lists radial, diametric and an overridden dimension (p416)", () => {
    const cad = run(
      es,
      "_ZOOM|_W|-50,-50|50,50|_CIRCLE|0,0|10|_DIMRADIUS|10,0|20,10|_LIST|_L||_DIMDIAMETER|0,10|5,25|_LIST|_L||_DIMLINEAR|0,0|30,0|_T|Custom|15,10|_LIST|_L|"
    )
    expect(listed(cad)).toEqual([
      '                  ACOTACION  Capa: "0"',
      "                            Espacio: Espacio modelo",
      // AutoCAD sí: no dimension here is associative
      "asociativo: no",
      "tipo: radial",
      "punto de definición de centro: X=   0.0000  Y=   0.0000  Z=   0.0000",
      "punto definidor        X=   8.9443  Y=   4.4721  Z=   0.0000",
      "determinada por el usuario posición del texto: X=  20.0000  Y=  10.0000  Z=   0.0000",
      "texto por defecto",
      'estilo de cota: "ISO-25"',
      "modificaciones de estilos de cota:",
      " DIMUPT      ACT",
      "Anotativo: No",
      '                  ACOTACION  Capa: "0"',
      "                            Espacio: Espacio modelo",
      // AutoCAD sí: no dimension here is associative
      "asociativo: no",
      "tipo: diámetro",
      "       punto definidor X=  -1.9612  Y=  -9.8058  Z=   0.0000",
      "punto definidor        X=   1.9612  Y=   9.8058  Z=   0.0000",
      "determinada por el usuario posición del texto: X=   5.0000  Y=  25.0000  Z=   0.0000",
      "texto por defecto",
      'estilo de cota: "ISO-25"',
      "modificaciones de estilos de cota:",
      " DIMUPT      ACT",
      "Anotativo: No",
      '                  ACOTACION  Capa: "0"',
      "                            Espacio: Espacio modelo",
      "asociativo: no",
      "tipo: horizontal",
      "1ª extensión    punto definidor X=   0.0000  Y=   0.0000  Z=   0.0000",
      "2ª extensión    punto definidor X=  30.0000  Y=   0.0000  Z=   0.0000",
      "línea de cota punto definidor X=  30.0000  Y=  10.0000  Z=   0.0000",
      // AutoCAD's console sets the text by its own font
      "por defecto posición del texto: X=  15.0000  Y=  11.8750  Z=   0.0000",
      "modif. del texto de cota: Custom",
      'estilo de cota: "ISO-25"',
      "Anotativo: No",
    ])
  })

  it("lists hatches, solid and patterned (p417)", () => {
    const cad = run(
      es,
      "_ZOOM|_W|-200,-200|300,300|_RECTANG|0,0|100,50|_CIRCLE|50,25|10|_-HATCH|_P|SOLID|10,10||_LIST|_L||_-HATCH|_P|ANSI31|2|45|10,10||_LIST|_L|"
    )
    expect(listed(cad)).toEqual([
      '                  HATCH     Capa: "0"',
      "                            Espacio: Espacio modelo",
      "                 Patrón de sombreado SOLID",
      "                 No asociativo",
      "                 Área      4685.8407",
      "                 Origen    X=   0.0000  Y=   0.0000  Z=   0.0000",
      '                  HATCH     Capa: "0"',
      "                            Espacio: Espacio modelo",
      "                 Patrón de sombreado ANSI31",
      "                 Anotativo: no",
      "                 Escala de sombreado    2.0000",
      "                 Orientación del sombreado     45",
      "                 No asociativo",
      "                 Área      4685.8407",
      "                 Origen    X=   0.0000  Y=   0.0000  Z=   0.0000",
    ])
  })

  it("lists a polar and a path array (p419)", () => {
    const cad = run(
      es,
      "_ZOOM|_W|-200,-200|200,200|_CIRCLE|10,10|2|_ARRAYPOLAR|_L||0,0||_LIST|_L||_LINE|0,-50|100,-50||_CIRCLE|0,-40|2|_ARRAYPATH|_L||0,-50||_LIST|_L|"
    )
    expect(listed(cad)).toEqual([
      '                  MATRIZ    Capa: "0"',
      "                            Espacio: Espacio modelo",
      "  Tipo de matriz:      Polar",
      "      Punto base:  X=  10.0000  Y=  10.0000  Z=   0.0000",
      "          Centro:  X=   0.0000  Y=   0.0000  Z=   0.0000",
      "                    Radio:    14.1421",
      "                Dirección:  Antihoraria",
      "      Número de elementos:          6",
      "   Ángulo entre elementos:         60",
      "        Ángulo de relleno:        360",
      "          Número de filas:          1",
      "       Espaciado de filas:     6.0000",
      "  Incremento de elevación de fila:     0.0000",
      "        Número de niveles:          1",
      "     Espaciado de niveles:     1.0000",
      "            Girar objetos:         Sí",
      '                  MATRIZ    Capa: "0"',
      "                            Espacio: Espacio modelo",
      "  Tipo de matriz:       Ruta",
      "          Método:      Medir",
      "      Punto base:  X=   0.0000  Y= -50.0000  Z=   0.0000",
      "      Número de elementos:         17",
      "   Espaciado de elementos:     6.0000",
      "          Desfase inicial:     0.0000",
      "            Desfase final:     0.0000",
      "          Número de filas:          1",
      "       Espaciado de filas:     6.0000",
      "  Incremento de elevación de fila:     0.0000",
      "        Número de niveles:          1",
      "     Espaciado de niveles:     1.0000",
      "        Alinear elementos:         Sí",
    ])
  })

  it("lists in a UCS, and an object off its plane (p424)", () => {
    const cad = run(
      es,
      "_LINE|1,2|11,7||_UCS|_O|5,5,2|_LIST|_L||_UCS|_Z|90|_LIST|_L||_UCS|_W|_UCS|_X|90|_CIRCLE|0,0|5|_LIST|_L||_UCS|_W|_LIST|_L|"
    )
    expect(listed(cad)).toEqual([
      '                  LINEA     Capa: "0"',
      "                            Espacio: Espacio modelo",
      "                de punto, X=  -4.0000  Y=  -3.0000  Z=  -2.0000",
      "             hasta punto, X=   6.0000  Y=   2.0000  Z=  -2.0000",
      "          Longitud =   11.1803, Ángulo en el plano XY =     27",
      "                  Incremento X =  10.0000,  Incremento Y =    5.0000,  Incremento Z =    0.0000",
      '                  LINEA     Capa: "0"',
      "                            Espacio: Espacio modelo",
      "                de punto, X=  -3.0000  Y=   4.0000  Z=  -2.0000",
      "             hasta punto, X=   2.0000  Y=  -6.0000  Z=  -2.0000",
      "          Longitud =   11.1803, Ángulo en el plano XY =    297",
      "                  Incremento X =   5.0000,  Incremento Y =  -10.0000,  Incremento Z =    0.0000",
      '                  CIRCULO   Capa: "0"',
      "                            Espacio: Espacio modelo",
      "            centro punto, X=   0.0000  Y=   0.0000  Z=   0.0000",
      "             radio    5.0000",
      "     circunferencia   31.4159",
      "              área   78.5398",
      '                  CIRCULO   Capa: "0"',
      "                            Espacio: Espacio modelo",
      "            centro punto, X=   0.0000  Y=   0.0000  Z=   0.0000",
      "             radio    5.0000",
      "Dirección de extrusión relativa al SCP:",
      "                   X=   0.0000  Y=  -1.0000  Z=   0.0000",
      "     circunferencia   31.4159",
      "              área   78.5398",
    ])
  })

  it("lists text by justification (p431)", () => {
    const cad = run(
      es,
      "_-TEXT|_J|_TL|0,0|2.5|0|TL|_LIST|_L||_-TEXT|_J|_R|0,10|2.5|0|R|_LIST|_L||_-TEXT|_J|_C|0,20|2.5|0|C|_LIST|_L||_-TEXT|_J|_M|0,30|2.5|0|M|_LIST|_L||_-TEXT|_J|_BR|0,40|2.5|0|BR|_LIST|_L||_-TEXT|_J|_ML|0,50|2.5|0|ML|_LIST|_L|"
    )
    expect(listed(cad)).toEqual([
      '                  TEXT      Capa: "0"',
      "                            Espacio: Espacio modelo",
      '             Estilo = "Standard"',
      "        Anotativo: no",
      "             Tipo de letra = Arial",
      "  superior/izquierda punto, X=   0.0000  Y=   0.0000  Z=   0.0000",
      "            altura    2.5000",
      "             texto TL",
      "          rotación ángulo      0",
      "           anchura factor de escala    1.0000",
      "        oblicuidad ángulo      0",
      "        generación normal",
      '                  TEXT      Capa: "0"',
      "                            Espacio: Espacio modelo",
      '             Estilo = "Standard"',
      "        Anotativo: no",
      "             Tipo de letra = Arial",
      "             final punto, X=   0.0000  Y=  10.0000  Z=   0.0000",
      "            altura    2.5000",
      "             texto R",
      "          rotación ángulo      0",
      "           anchura factor de escala    1.0000",
      "        oblicuidad ángulo      0",
      "        generación normal",
      '                  TEXT      Capa: "0"',
      "                            Espacio: Espacio modelo",
      '             Estilo = "Standard"',
      "        Anotativo: no",
      "             Tipo de letra = Arial",
      "            centro punto, X=   0.0000  Y=  20.0000  Z=   0.0000",
      "            altura    2.5000",
      "             texto C",
      "          rotación ángulo      0",
      "           anchura factor de escala    1.0000",
      "        oblicuidad ángulo      0",
      "        generación normal",
      '                  TEXT      Capa: "0"',
      "                            Espacio: Espacio modelo",
      '             Estilo = "Standard"',
      "        Anotativo: no",
      "             Tipo de letra = Arial",
      "             mitad punto, X=   0.0000  Y=  30.0000  Z=   0.0000",
      "            altura    2.5000",
      "             texto M",
      "          rotación ángulo      0",
      "           anchura factor de escala    1.0000",
      "        oblicuidad ángulo      0",
      "        generación normal",
      '                  TEXT      Capa: "0"',
      "                            Espacio: Espacio modelo",
      '             Estilo = "Standard"',
      "        Anotativo: no",
      "             Tipo de letra = Arial",
      "  inferior/derecha punto, X=   0.0000  Y=  40.0000  Z=   0.0000",
      "            altura    2.5000",
      "             texto BR",
      "          rotación ángulo      0",
      "           anchura factor de escala    1.0000",
      "        oblicuidad ángulo      0",
      "        generación normal",
      '                  TEXT      Capa: "0"',
      "                            Espacio: Espacio modelo",
      '             Estilo = "Standard"',
      "        Anotativo: no",
      "             Tipo de letra = Arial",
      "   mitad/izquierda punto, X=   0.0000  Y=  50.0000  Z=   0.0000",
      "            altura    2.5000",
      "             texto ML",
      "          rotación ángulo      0",
      "           anchura factor de escala    1.0000",
      "        oblicuidad ángulo      0",
      "        generación normal",
    ])
  })

  it("lists a block reference and a rectangular array (p434)", () => {
    const cad = run(
      es,
      "_CIRCLE|0,0|2|_-BLOCK|B2|0,0|_L||_-INSERT|B2|10,10|1|1|0|_LIST|_L||_CIRCLE|0,0|2|_ARRAYRECT|_L||_X|_LIST|_L|"
    )
    expect(listed(cad)).toEqual([
      '                  REFERENCIA A BLOQUE  Capa: "0"',
      "                            Espacio: Espacio modelo",
      ' Nombre de bloque: "B2"',
      "                en punto, X=  10.0000  Y=  10.0000  Z=   0.0000",
      "Factor de escala X:    1.0000",
      "Factor de escala Y:    1.0000",
      "ángulo de rotación:      0",
      "Factor de escala Z:    1.0000",
      "      UnidadesIns: Milímetros",
      "Conversión de unidades:    1.0000",
      "Aplicar escala uniforme: No",
      "Permitir descomposición: Sí",
      '                  MATRIZ    Capa: "0"',
      "                            Espacio: Espacio modelo",
      "  Tipo de matriz:  Rectangular",
      "      Punto base:  X=   0.0000  Y=   0.0000  Z=   0.0000",
      "       Número de columnas:          4",
      "    Espaciado de columnas:     6.0000",
      "          Número de filas:          3",
      "       Espaciado de filas:     6.0000",
      "  Incremento de elevación de fila:     0.0000",
      "        Número de niveles:          1",
      "     Espaciado de niveles:     1.0000",
      "  Incluye el ángulo de eje:         90",
    ])
  })

  it("lists a reference, a dimension and MTEXT in a tilted UCS (p437)", () => {
    const cad = run(
      es,
      "_UCS|_X|90|_-MTEXT|0,0|40,-20|M||_-HATCH|_P|SOLID|_S|_N|||_DIMLINEAR|0,0|10,0|5,5|_CIRCLE|0,0|2|_-BLOCK|B3|0,0|_L||_-INSERT|B3|10,10|1|1|0|_UCS|_W|_LIST|_ALL|"
    )
    expect(listed(cad)).toEqual([
      '                  REFERENCIA A BLOQUE  Capa: "0"',
      "                            Espacio: Espacio modelo",
      ' Nombre de bloque: "B3"',
      "                en punto, X=  10.0000  Y=   0.0000  Z=  10.0000",
      "Factor de escala X:    1.0000",
      "Factor de escala Y:    1.0000",
      "Factor de escala Z:    1.0000",
      "Dirección de extrusión relativa al SCP:",
      "                   X=   0.0000  Y=  -1.0000  Z=   0.0000",
      "      UnidadesIns: Milímetros",
      "Conversión de unidades:    1.0000",
      "Aplicar escala uniforme: No",
      "Permitir descomposición: Sí",
      '                  REFERENCIA A BLOQUE  Capa: "0"',
      "                            Espacio: Espacio modelo",
      ' Nombre de bloque: "B3"',
      "                en punto, X=   0.0000  Y=   0.0000  Z=   0.0000",
      "Factor de escala X:    1.0000",
      "Factor de escala Y:    1.0000",
      "Factor de escala Z:    1.0000",
      "Dirección de extrusión relativa al SCP:",
      "                   X=   0.0000  Y=  -1.0000  Z=   0.0000",
      "      UnidadesIns: Milímetros",
      "Conversión de unidades:    1.0000",
      "Aplicar escala uniforme: No",
      "Permitir descomposición: Sí",
      '                  ACOTACION  Capa: "0"',
      "                            Espacio: Espacio modelo",
      "Dirección de extrusión relativa al SCP:",
      "                   X=   0.0000  Y=  -1.0000  Z=   0.0000",
      "asociativo: no",
      "tipo: <lineal, no paralelo al SCP>",
      "1ª extensión    punto definidor X=   0.0000  Y=   0.0000  Z=   0.0000",
      "2ª extensión    punto definidor X=  10.0000  Y=   0.0000  Z=   0.0000",
      "línea de cota punto definidor X=  10.0000  Y=   0.0000  Z=   5.0000",
      // AutoCAD's console sets the text by its own font
      "por defecto posición del texto: X=   5.0000  Y=   0.0000  Z=   6.8750",
      "texto por defecto",
      'estilo de cota: "ISO-25"',
      "Anotativo: No",
      '                  MTEXT     Capa: "0"',
      "                            Espacio: Espacio modelo",
      '             Estilo = "Standard"',
      "        Anotativo: no",
      "Ubicación:        X=   0.0000  Y=   0.0000  Z=   0.0000",
      "Anchura:            40.0000",
      "Normal:           X=   0.0000  Y=  -1.0000  Z=   0.0000",
      "Rotación:                0",
      "Altura de texto:    2.5000",
      "Interlineado:     Múltiple (1x =    4.1667)",
      "Enlace:           SIzquierda",
      "Dirección:        PorEstilo",
      "Contenido:        M",
    ])
  })
})

describe("LIST", () => {
  it("lists a preselection at once, newest first, and drops it (p421, p440)", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(10, 0), { id: "L" }),
        circleOf(p(5, 5), 2, { id: "C" }),
      ],
    })
    answer(cad, "_LUPREC", "4")
    cad.select("L", "C")
    answer(cad, "_LIST")
    expect(listed(cad).filter((line) => line.includes("Layer:"))).toEqual([
      '                  CIRCLE    Layer: "0"',
      '                  LINE      Layer: "0"',
    ])
    expect(cad.state().selectionCount).toBe(0)
    answer(cad, "_LIST", "_P", "")
    expect(cad.commandLog()).toContain("Select objects: _P")
    expect(listed(cad)).toHaveLength(24)
  })

  it("ends without a word at Enter on nothing (p421)", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(10, 0))] })
    answer(cad, "_LIST", "")
    expect(cad.commandLog().slice(-2)).toEqual(["LIST", "Select objects:"])
    expect(cad.activeToolId()).toBe("select")
  })

  it("refuses a word with the modes, as the console does (p421)", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(10, 0))] })
    answer(cad, "_LIST", "FOO")
    expect(cad.commandLog().slice(-2)).toEqual([
      "*Invalid selection*",
      "Expects a point or Window/Last/Crossing/BOX/ALL/Fence/WPolygon/CPolygon/Group/Add/Remove/Multiple/Previous/Undo/AUto/SIngle",
    ])
  })

  it("lists an object on a locked layer (p426)", () => {
    const cad = createHarness()
    cad.runtime.document.load([lineOf(p(0, 0), p(10, 0), { layerId: "LK" })], {
      layers: [layerOf("0"), layerOf("LK", { locked: true })],
    })
    answer(cad, "_LUPREC", "4", "_LIST", "_L", "")
    expect(listed(cad)[0]).toBe('                  LINE      Layer: "LK"')
  })

  it("is one step U takes back, named LIST (p440)", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(10, 0))] })
    answer(cad, "_LIST", "_L", "", "_U")
    expect(cad.commandLog().slice(-2)).toEqual(["U", "LIST"])
  })

  it("cannot run transparently (p425)", () => {
    const cad = createHarness()
    answer(cad, "_LINE", "0,0", "'_LIST")
    expect(cad.commandLog()).toContain(
      "** That command may not be invoked transparently **"
    )
  })

  it("writes an object's colour, linetype, lineweight and thickness (p401)", () => {
    const cad = createHarness({
      entities: [
        {
          ...lineOf(p(0, 0), p(10, 5)),
          color: "#ff0000",
          linetype: "Dashed",
          lineweight: 0.3,
          thickness: 2,
          elevation: 1,
          deltaZ: 2,
        },
        { ...lineOf(p(0, 0), p(-10, 5)), color: "#ff8000", thickness: 2 },
      ],
    })
    answer(cad, "_LUPREC", "4", "_LIST", "_ALL", "")
    expect(listed(cad)).toEqual([
      '                  LINE      Layer: "0"',
      "                            Space: Model space",
      '                   Color: 255,128,0    Linetype: "BYLAYER"',
      "                   Thickness =    2.0000",
      "              from point, X=   0.0000  Y=   0.0000  Z=   0.0000",
      "                to point, X= -10.0000  Y=   5.0000  Z=   0.0000",
      "          Length =  11.1803,  Angle in XY Plane =    153",
      "                  Delta X = -10.0000, Delta Y =    5.0000, Delta Z =   0.0000",
      '                  LINE      Layer: "0"',
      "                            Space: Model space",
      '                   Color: 1 (red)    Linetype: "DASHED"',
      "                   LineWeight: 0.30 mm",
      "                   Thickness =    2.0000",
      "              from point, X=   0.0000  Y=   0.0000  Z=   1.0000",
      "                to point, X=  10.0000  Y=   5.0000  Z=   3.0000",
      "          In Current UCS, Length =  11.1803,  Angle in XY Plane =     27",
      "                  3D Length  =  11.3578,  Angle from XY Plane =     10",
      "                  Delta X =  10.0000, Delta Y =    5.0000, Delta Z =   2.0000",
    ])
  })

  it("lists a reference's attributes and its END SEQUENCE (p418)", () => {
    const definition = createAttributeDefinition(p(0, 3), "TA", {
      prompt: "PA",
      value: "DA",
    })
    const cad = createHarness({
      blocks: [
        createBlockDefinition("B1", p(0, 0), [
          circleOf(p(0, 0), 2),
          definition,
        ]),
      ],
      entities: [
        createInsert("B1", p(100, 0), {
          scaleX: 2,
          scaleY: 3,
          rotation: Math.PI / 6,
          attributes: [blockAttribute(definition, "V1")],
        }),
      ],
    })
    answer(cad, "_LUPREC", "4", "_LIST", "_L", "")
    expect(listed(cad)).toEqual([
      '                  BLOCK REFERENCE  Layer: "0"',
      "                            Space: Model space",
      '       Block Name: "B1"',
      "                at point, X= 100.0000  Y=   0.0000  Z=   0.0000",
      "   X scale factor:    2.0000",
      "   Y scale factor:    3.0000",
      "   rotation angle:     30",
      "   Z scale factor:    2.0000",
      "         InsUnits: Millimeters",
      "  Unit conversion:    1.0000",
      "  Scale uniformly: No",
      "  Allow exploding: Yes",
      '                  ATTRIBUTE  Layer: "0"',
      "                            Space: Model space",
      '             Style = "Standard"',
      "        Annotative: No",
      "             Typeface = Arial",
      "             start point, X=  95.5000  Y=   7.7942  Z=   0.0000",
      "            height    7.5000",
      "             value V1",
      "               tag TA",
      "          rotation angle     30",
      "             width scale factor    0.6667",
      "         obliquing angle      0",
      "             flags normal",
      "        generation normal",
      '                  END SEQUENCE  Layer: "0"',
      "                            Space: Model space",
    ])
  })

  it("lists a rational spline's weights (p429)", () => {
    const cad = createHarness({
      entities: [
        createSpline("cv", [p(0, 0), p(10, 10), p(20, 0), p(30, 10)], {
          weights: [1, 1, 3, 1],
        }),
      ],
    })
    answer(cad, "_LUPREC", "4", "_LIST", "_L", "")
    expect(listed(cad).slice(2)).toEqual([
      // AutoCAD 33.4024: its spline length is approximate
      "                           Length: 33.3951",
      "                            Order: 4",
      "                       Properties: Planar, Rational, Non-Periodic",
      "                 Parametric Range: Start   0.0000",
      "                                     End   1.0000",
      "         Number of control points: 4",
      "                   Control Points: X = 0.0000   , Y = 0.0000   , Z = 0.0000",
      "                                   Weight   1.0000",
      "                                   X = 10.0000  , Y = 10.0000  , Z = 0.0000",
      "                                   Weight   1.0000",
      "                                   X = 20.0000  , Y = 0.0000   , Z = 0.0000",
      "                                   Weight   3.0000",
      "                                   X = 30.0000  , Y = 10.0000  , Z = 0.0000",
      "                                   Weight   1.0000",
    ])
  })
})
