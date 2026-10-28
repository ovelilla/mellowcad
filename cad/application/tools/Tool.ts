import { Vec2 } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import { DocumentReader } from "../../domain/Document"
import { Entity, EntityId, BlockLookup } from "../../domain/entities"
import type { TextStyleId } from "../../domain/textStyles"
import { Ucs } from "../../domain/ucs"
import { Viewport } from "../Viewport"
import { Selection } from "../Selection"
import { SnapResult, SnapType } from "../snapping/types"
import { TrackingResult } from "../tracking/types"
import { DynamicInputController } from "../input/DynamicInput"
import { Command, UndoSettings } from "../commands/Command"
import { ScenePrimitive } from "../../scene/types"
import type { CursorBadge } from "../SceneBuilder"
import type { MessageValues } from "../../i18n/types"
import type { FeedbackId, MessageId } from "../EngineText"
import type { PromptId } from "../../locales/types"

/** A normalised pointer event delivered to the active tool. */
export interface PointerInput {
  /** Cursor position in screen (CSS-pixel) coordinates. */
  readonly screen: Vec2
  /**
   * The cursor on the work plane (ELEVATION above the UCS's XY plane), with no
   * snapping applied: what picking and box selection read. Off the plan it is
   * where the line of sight meets that plane; seen edge-on, the point of the
   * plane facing the viewer drawn there. Either way it maps back to `screen`.
   */
  readonly world: Vec3
  readonly snap: SnapResult | null
  /**
   * The active object-snap-tracking result, if a guide is engaged. Present only
   * when no direct snap is active (a real snap wins over tracking).
   */
  readonly tracking: TrackingResult | null
  /**
   * The effective world point a tool should use: the snapped point when a snap
   * is active, otherwise the raw world position, after any active drawing
   * constraints (Ortho, ...) have been applied relative to the tool's anchor.
   * Its Z is the snapped object's, or the UCS's XY plane (see `ResolvedPoint`).
   */
  readonly point: Vec3
  readonly button: number
  readonly shiftKey: boolean
  readonly ctrlKey: boolean
  readonly altKey: boolean
}

/** A normalised keyboard event delivered to the active tool. */
export interface KeyInput {
  readonly key: string
  readonly shiftKey: boolean
  readonly ctrlKey: boolean
  readonly altKey: boolean
}

/**
 * A command-line-style option (keyword) a tool currently offers, mirroring
 * AutoCAD's `[Close/Undo]` prompt. The set is recomputed as the interaction
 * advances, so options appear and disappear in context (e.g. "Close" only once
 * enough segments exist). Data-driven on purpose: adding an option is just
 * pushing another entry — the UI renders whatever the tool exposes.
 *
 * A tool names an option by its **global keyword** — AutoCAD's
 * language-independent word — and never by a letter: the word, its
 * abbreviation and the key that runs it belong to the command language, which
 * the runtime resolves from the catalog.
 */
export interface CommandOption {
  /** The global keyword, e.g. `"Close"`; its key in the command's catalog. */
  readonly id: string
  /**
   * The keyword this option is currently set to, when the chip shows a state
   * (`Erase` + `Yes` reads `Erase: Yes`) — itself a keyword of the command,
   * as AutoCAD's sub-prompt offers it.
   */
  readonly value?: string
  /**
   * Answered when typed but left out of the prompt, the chips and the single
   * keys, as AutoCAD's unlisted keywords are (-VIEW's `_SWISO`). List hidden
   * options after the shown ones: a shown keyword wins a shared abbreviation.
   */
  readonly hidden?: true
  /**
   * The prompt whose `promptKeywords` spell it, when not the one asked: the
   * selection modes, which every `Select objects:` takes in the same words.
   */
  readonly prompt?: PromptId
  /**
   * Typed short of its capitals, where it alone starts so, the answer is
   * taken and does nothing: `S` at a whole-object set's SIngle (erase/p153).
   */
  readonly shortDoesNothing?: true
}

/**
 * A question with what a bare Enter keeps, which the prompt shows after its
 * keywords as AutoCAD does: a length (`Specify radius of circle or [Diameter]
 * <10.0000>:`), an angle (`{ angle: 0 }`) or a point (`<0.0000, 0.0000,
 * 0.0000>`), which the runtime formats in the drawing's units, a count
 * (`Enter number of sides <4>:`), a phrase of `commands.prompts` (`<use
 * first point as displacement>`), or a name the drawing holds, as it is
 * (HATCH's `<ANGLE>`).
 */
export interface ToolQuestion {
  readonly id: PromptId
  /** Left out when Enter keeps nothing the prompt shows (an empty default). */
  readonly enter?:
    | number
    | { readonly angle: number }
    | { readonly count: number }
    | { readonly name: string }
    | Vec3
    | PromptId
  /** What the prompt's words name (UCS's `UCS "{name}" already exists.`). */
  readonly values?: MessageValues
  /**
   * The keyword ids in the order AutoCAD declares them, where it differs from
   * the order listed: the order it asks which was meant in (ATTDISP's
   * `[Normal/ON/OFF]` declares `OFf Normal ON`: `OFf or ON?`).
   */
  readonly declared?: readonly string[]
  /**
   * The default written against what comes before it, as AutoCAD's string
   * has it (`[Zdepth]<0,0,0>:`, `Specify Zdepth<0>:`).
   */
  readonly tight?: true
  /** No colon after the default, as AutoCAD's string ends (`OK? <Y>`). */
  readonly open?: true
  /**
   * A length or angle default written without its trailing zeros, at the
   * drawing's precision, as the arrays' prompts write theirs (`<6>`,
   * `<-4.3514>`; probes arrays/p116, p130).
   */
  readonly trimmed?: true
}

/** UNDO's operations on the undo history, which only its tool uses. */
export interface UndoHistory {
  /**
   * Takes back `count` steps, or back to the last mark (`"mark"`), saying
   * what it took back as U does.
   */
  takeBack(count: number | "mark"): void
  /**
   * MREDO: does again `count` of the steps taken back, all of them, or the
   * last undo's, saying what it did as REDO does.
   */
  redo(count: number | "all" | "last"): void
  /** Whether Back stops short of everything: at a mark or an open group's start. */
  backStops(): boolean
  /** Mark. */
  mark(): void
  /** BEgin: opens a group, closing one already open. */
  begin(): void
  /** End: closes the open group, if any. */
  end(): void
  /** Auto, Control, Combine and Layer, as the settings line says them. */
  settings(): UndoSettings
  /** Sets them: Control None and One drop what was kept. */
  configure(changes: Partial<UndoSettings>): void
}

/**
 * What a question takes besides its keywords: the AutoCAD input function
 * behind it, whose words refuse anything else typed there (AutoCAD 2023's
 * console) — a point (`Invalid point.`, `Point or option keyword required.`;
 * a 2D one as ARC's, MIRROR's and PLINE's later points ask it), a distance or
 * an angle (`Requires numeric distance, two points, or option keyword.`), a
 * number or a whole one, a keyword (`Invalid option keyword.`), a selection set
 * (`*Invalid selection*` and the selection modes it expects: with sub-objects
 * as MOVE's, and in their SUbobject mode, of whole objects as MIRROR's and
 * JOIN's, STRETCH's crossing one,
 * BREAK's set of one object, UCS OBject's, which takes a group, UCS Face's,
 * which takes Crossing, Fence and CPolygon only, or ARRAYPATH's path curve), one object picked (`*Invalid selection*` and
 * its keywords, `Last` first for a plain pick as DIMSPACE's base dimension, or
 * `Expects a single object.` for the dimension commands' picks), or a
 * command's own refusal (CIRCLE's radius, POLYGON's sides), a line each when
 * it is several (-VPOINT's `Invalid input. Try again.` and the current view
 * direction again).
 */
export type QuestionInput =
  | "point"
  | "point2d"
  | "distance"
  | "angle"
  | "number"
  | "integer"
  | "keyword"
  | "objects"
  | "subobjects"
  | "wholeObjects"
  | "crossingObjects"
  | "oneObject"
  | "singleSet"
  | "faceSet"
  | "pathCurve"
  | "object"
  | "objectOrLast"
  | "singleObject"
  | {
      readonly refusal: MessageId | readonly MessageId[]
      readonly values?: MessageValues
      /**
       * The keywords the refusal names as `{keywords}`, by id, in the command
       * language: as the prompt lists them (`cuTting edges`), or as they are
       * declared (`cuTting`) — TRIM's, whose console lists the prompt's words
       * but one, and its first corner's declared ones.
       */
      readonly keywords?: {
        readonly ids: readonly string[]
        readonly declared?: true
      }
    }

/**
 * The outcome of invoking a command option, telling the runtime what to do:
 * - `"unhandled"`: the key matched no option;
 * - `"continue"`: handled, the command keeps running (e.g. Undo one segment);
 * - `"end"`: handled and the command finished (e.g. Close) — drop to neutral.
 */
export type CommandOptionOutcome = "unhandled" | "continue" | "end"

/**
 * The surface a tool is allowed to touch — the tool's *port* onto the rest of
 * the system. Crucially:
 *
 * - the document is **read-only**; the only way to change the drawing is
 *   {@link execute}, which routes through the command history (undo/redo);
 * - selection and dynamic input are transient interaction state and may be
 *   driven directly;
 * - there is no rendering technology here: tools describe their preview as
 *   neutral scene primitives via {@link Tool.buildOverlay};
 * - the document, the UCS, the view and every point are given in the frame of
 *   the UCS's XY plane (`UcsFrame`), where that plane is level, and what a
 *   tool executes is taken back to the WCS — unless the tool works in the WCS
 *   ({@link Tool.inWorld}).
 */
export interface ToolContext {
  readonly document: DocumentReader
  /**
   * The current UCS. Typed points and absolute angles are read in it, and the
   * defaults AutoCAD aligns with it (text rotation, hatch angle, H/V) follow it.
   */
  readonly ucs: Ucs
  /**
   * ELEVATION: a point picked or typed without a Z lies this far above the
   * UCS's XY plane.
   */
  readonly elevation: number
  /**
   * LASTPOINT, 0,0,0 until a point is given: what `@` is relative to at a
   * point with no base of the tool's own (a first point), and what Enter
   * takes at DIST's. The runtime keeps it; a tool reads it, and sets it only
   * where AutoCAD moves it with no point given ({@link setLastPoint}).
   */
  readonly lastPoint: Vec3
  readonly viewport: Viewport
  readonly selection: Selection
  readonly dynamicInput: DynamicInputController
  /**
   * The block table, to hand to `entityScenePrimitive` and the domain helpers
   * that have to look inside a block reference. A ghost drawn without it is an
   * empty ghost.
   */
  readonly blocks: BlockLookup

  /**
   * Puts LASTPOINT at `point`, read as {@link lastPoint} is (in the WCS for a
   * tool working there): UCS Previous and a restored named UCS put it at the
   * WCS's origin, as AutoCAD 2023's console does, where any other UCS change
   * puts it at the new UCS's origin; a point typed where the runtime reads
   * none (FILLET's object prompts) is the tool's to keep.
   */
  setLastPoint(point: Vec3): void

  /**
   * AutoCAD's direct distance for a number typed where no box takes it
   * (`Select objects:`, TRIM's object): the point that far from
   * {@link lastPoint} towards the cursor, as the runtime takes it in a box.
   */
  pointAtDistance(distance: number): Vec3

  /**
   * Executes a reversible command against the document (the only
   * write-path). `step`: the name U and REDO give an edit made with no
   * command running, which otherwise names nothing (a selection dragged,
   * `DROPGEOM GROUP`).
   */
  execute(command: Command, step?: string): void

  /**
   * Reverts the most recently executed command, returning whether one existed:
   * a tool's own last step, unless a transparent command ran since (then
   * {@link undoTo}).
   */
  undo(): boolean
  /** Where the undo history stands, for {@link undoTo}. */
  historyDepth(): number
  /**
   * Takes back everything executed since the history stood at `depth`:
   * LINE's Undo takes a transparent 'LTSCALE or '-COLOR back with its last
   * segment (AutoCAD 2027's console, line/p117, p118), regenerating if what
   * it took back had queued a regeneration. Returns whether it took any.
   */
  undoTo(depth: number): boolean
  /** UNDO's own operations: its number, Mark, Back, BEgin and End. */
  readonly undoHistory: UndoHistory

  /** World-unit tolerance for click hit-testing at the current zoom. */
  pickTolerance(): number

  /**
   * The object under `world`, honouring selection cycling: when the user has
   * cycled (Shift+Space) to another of the objects the pick box covers, that
   * one is returned instead of the topmost. Always use this rather than
   * `document.pick`, so every "which object?" prompt cycles alike.
   */
  pick(world: Vec2, tolerance?: number): Entity | null

  /** Requests a redraw on the next frame. */
  requestRender(): void

  /** Sets the cursor shown over the drawing surface (CSS cursor names). */
  setCursor(cursor: string): void

  /**
   * Writes a line to the command prompt. AutoCAD commands report what they did
   * there ("1 was not able to be exploded."), which is the only feedback a user
   * gets when a command deliberately does nothing. The text comes from
   * {@link text}, or is the user's own data (a block name in a `?` listing).
   * A `prompt` is one a tool writes itself (PAN's), headed `>>` as any
   * prompt is while the command runs transparently, and left open: a prompt
   * AutoCAD asks without a new line goes on it (`Select objects: Specify
   * opposite corner:`). A `gesture` is said by a press dragged on: it takes
   * the place of the prompt's line the press left bare (the lasso's).
   */
  report(text: string, kind?: "info" | "error" | "prompt" | "gesture"): void

  /** Whether the command runs inside another (`'ZOOM` mid-command). */
  runsTransparently(): boolean

  /**
   * Says `Regenerating model.` after a change AutoCAD regenerates for
   * (LTSCALE, ZOOM); inside another command `Regen queued.`, and
   * `Regenerating model.` once the one it interrupted ends. U and REDO of the
   * step regenerate too, unless `how` says otherwise. `"silently"`: a change
   * that says nothing as it is made but whose U and REDO regenerate (a block
   * redefined, probes blocks/p113, p137). `"once"`: said as it is made, but
   * not by its U (ATTDISP, probe blocks/p337). `"view"`: a view's own
   * (3DORBIT's), `Regenerating model.` at once inside another command too,
   * and by its U and REDO whether its line of sight turned or not (desktop
   * view/d04, VIEW-D62).
   */
  regenerate(how?: "silently" | "once" | "view"): void

  /**
   * Says what an answer found where AutoCAD says it: on the line of the
   * prompt a pick answered (`Select objects: 1 found`, `Specify opposite
   * corner: 2 found`), even once only the release knows it, or after the
   * command's echo for the objects selected before it (`Command: M MOVE 3
   * found`); on a line of its own after a typed answer or Enter (`Select
   * objects: L` then `1 found`).
   */
  answer(text: string): void

  /**
   * The Previous selection set, the last one a command was given, as
   * `Select objects:`'s Previous takes it again; {@link rememberSelection}
   * keeps a new one.
   */
  previousSelection(): readonly EntityId[]
  rememberSelection(ids: readonly EntityId[]): void
  /**
   * Whether the object was made since the drawing was opened: AutoCAD's
   * "current session", over which DIMBASELINE's Last ranges (probe
   * dimensions/p400). One the opened file held is not.
   */
  madeThisSession(id: EntityId): boolean

  /** The command language, for what a tool writes or draws itself. */
  readonly text: ToolText

  /**
   * Puts a fragment of the drawing on the clipboard (COPYCLIP, CUTCLIP,
   * COPYBASE). The table entries the objects reference travel with them, and
   * `basePoint` is what a later paste lands on the insertion point.
   */
  copyToClipboard(entities: readonly Entity[], basePoint: Vec2 | Vec3): void

  /**
   * Shows or hides the ViewCube (NAVVCUBE). Saved in the drawing, not through a
   * command: U leaves it, where AutoCAD's puts it back (move/p238).
   */
  setViewCubeVisible(visible: boolean): void

  /**
   * Makes a text style current (TEXTSTYLE), as TEXT's, MTEXT's and ATTDEF's
   * Style do (rectang/p313): part of the running command's undo step, which
   * U takes back (text/p162).
   */
  setCurrentTextStyle(id: TextStyleId): void

  /**
   * The running object snaps (OSMODE), which -OSNAP reads and sets. Setting a
   * list turns object snapping on; an empty one leaves no snap running.
   */
  readonly runningSnaps: {
    enabled(): readonly SnapType[]
    set(types: readonly SnapType[]): void
  }

  /** Snap mode (SNAPMODE) and its lattice's spacing (SNAPUNIT), which SNAP reads and sets. */
  readonly snapMode: {
    spacing(): Vec2
    set(on: boolean, spacing?: Vec2): void
  }

  /**
   * The one-shot object snap given for the point being asked (`tan`, the
   * Shift+right-click menu), or null: what LINE reads to defer a Tangent or a
   * Perpendicular picked before there is a point to measure from.
   */
  snapOverride(): SnapType | "none" | null

  /** The read-only system variables the runtime keeps, which SETVAR reads. */
  inquiry(): Inquiry

  /**
   * Ends the current command and drops back to the neutral Select tool. For
   * single-shot commands (MOVE, COPY, ...) that finish the moment their final
   * point is placed, rather than looping or waiting for Escape.
   */
  endCommand(): void
}

/** The read-only system variables the runtime keeps (AREA, UNDOCTL…). */
export interface Inquiry {
  /** AREA, PERIMETER: the last area AREA measured and the length around it. */
  readonly area: number
  readonly perimeter: number
  /** DISTANCE: the last distance DIST measured. */
  readonly distance: number
  readonly cleanScreenState: 0 | 1
  /** UNDOCTL's bits: 1 on, 2 One, 4 Auto, 8 a group open, 16 Combine, 32 Layer. */
  readonly undoControl: number
}

/**
 * The engine's catalog as a tool sees it, bound to the running command's
 * keywords. Prompts are not here: a dynamic-input field and {@link Tool.question}
 * name theirs by id and the runtime words them, so a language switch rewords
 * an open prompt too.
 */
export interface ToolText {
  message(id: MessageId, values?: MessageValues): string
  /** Text drawn on the canvas (a readout, a hint). */
  feedback(id: FeedbackId, values?: MessageValues): string
  /** One line of HATCH's `?` listing. */
  hatchPatternListing(id: string): string
  /** One line of -DIMSTYLE's STatus and Variables listings. */
  dimVariableListing(name: string, value: string | boolean): string
  /**
   * The keyword `input` names among `ids`, for a prompt whose keywords the
   * tool reads from a free-text field itself (TEXT's Justify).
   */
  resolveKeyword(input: string, ids: readonly string[]): string | null
  /** The keywords `ids` in the command language, as a prompt lists them. */
  keywordList(ids: readonly string[]): string
  /** A keyword's abbreviation in the command language (`U` for Undo). */
  abbreviation(id: string): string
  /**
   * A keyword as its prompt lists it in the command language: its whole word
   * (`NONe` for None), or the label it is listed with (`TL` for TLeft).
   */
  keyword(id: string): string
  /** A keyword of `command`'s, whichever runs (CECOLOR reads -COLOR's `BYLAYER`). */
  commandKeyword(command: string, id: string): string
  /** `text` headed as a transparent command's prompt (`>>BYLAYER`). */
  transparentPrompt(text: string): string
  /**
   * A prompt as it is asked, with the keywords `keywords` names by id
   * (`Select objects:`, `…to extend or [Crossing]:`).
   */
  prompt(id: PromptId, keywords?: readonly string[]): string
}

/** Waits, in a {@link RibbonMacro}'s answers, for the user's answer: `\`. */
export const MACRO_PAUSE = "\\"

/**
 * A ribbon button that runs a command and answers its prompts, as AutoCAD's
 * `^C^C_circle \_d` does: echoed `_circle`, repeated by Enter and named by U
 * as that command, its answers typed in turn as it asks.
 */
export interface RibbonMacro {
  /** The command it runs, by its global name (`CIRCLE`). */
  readonly command: string
  /** What it types after the command, {@link MACRO_PAUSE} waiting for the user. */
  readonly answers: readonly string[]
}

/**
 * A tool encapsulates one interactive editing mode (draw line, select, ...) as
 * an explicit interaction flow: the runtime forwards normalised input to the
 * active tool, and the tool advances its internal state machine, previews via
 * {@link buildOverlay} and commits results through commands.
 */
export interface Tool {
  /** Also the key of the tool's label in the interface catalog. */
  readonly id: string

  /**
   * Fallback hint shown in the tool rail for tools that have no command-line
   * alias. Commands are typed at the prompt (see `TOOL_COMMANDS`), so this is
   * display-only — it no longer dispatches keys.
   */
  readonly shortcut?: string

  /** The command the prompt names when one tool runs several (EATTEDIT); else `TOOL_COMMANDS`'. */
  runningCommand?(): string
  /**
   * The command whose questions the tool asks now on its behalf, where it
   * has handed its run to another (ARRAY's set to ARRAYRECT): its keywords
   * and labels are read from that command's tables. Null or omitted: the
   * tool's own command.
   */
  handedTo?(): string | null
  /**
   * AutoCAD's ribbon macro the tool runs, where it is a mode of another
   * command (`^C^C_circle _2p`): that command's keywords are the tool's, the
   * rail echoes, repeats and undoes it, and its answers are typed each time
   * the tool starts. Null or omitted: the tool's own command.
   */
  ribbonMacro?(): RibbonMacro | null
  /**
   * Its button's macro starts with an apostrophe (acad.cuix's `'_id `): the
   * rail runs it inside a running command, as if typed so, never ending it.
   */
  readonly transparentMacro?: boolean
  /**
   * The system variable the tool sets (AUPREC), empty while SETVAR asks its
   * name: it heads the prompt as it is named in every language but in a
   * SETVAR run, AutoCAD resumes it as SETVAR, and typed at its own prompt it
   * is a value, not another run (probes workspace/p410, p415).
   */
  systemVariable?(): string

  /**
   * What the command asks right now, by its id in `commands.prompts`
   * (`Specify next point or`): the runtime words it after the command's name
   * at the prompt, alone in the dynamic prompt, and writes it to the history
   * with its answer once answered. Null between questions; a tool without it
   * is prompted by its command's name and keywords alone.
   */
  question?(): PromptId | ToolQuestion | null

  /**
   * The keyword a bare Enter keeps, by id, shown after the list as AutoCAD
   * shows the current value (`[ON/OFF] <ON>:`).
   */
  defaultOption?(): string | null

  /**
   * What the question takes besides its keywords, when its box does not say.
   * Null or omitted, `selectObjects` is a selection set and the box's fields
   * tell a point (a coordinate, or a distance with an angle), a distance, an
   * angle or a number; with no box, a prompt with object snaps is a point and
   * any other a keyword.
   */
  takes?(): QuestionInput | null
  /**
   * Whether the point that answers the question becomes LASTPOINT, where
   * that is not what {@link takes} says (null: as it says) (a point does, a window's corner, a
   * distance or a keyword does not): AutoCAD 2023's console keeps it at
   * DIST's second point and COPY's, and sets it at ZOOM's first.
   */
  setsLastPoint?(): boolean | null
  /**
   * Whether a Tangent or Perpendicular override that found nothing at the
   * pick, on `entity` (null: no object there), is let through for the tool
   * to work out itself: LINE's first point defers it (`tools/deferredSnap.ts`),
   * CIRCLE's 2P and 3P solve the circle at the last point, its radius makes
   * the circle tangent to the object. False, the default, refuses it as any
   * override that finds nothing, as at PLINE's start point (pline/p29). WHY
   * not let through by default: a tool that does not work it out takes the
   * raw pick, a point that is not tangent, and says nothing (circle CTN-05).
   */
  defersSnap?(
    kind: SnapType.Tangent | SnapType.Perpendicular,
    entity: Entity | null
  ): boolean
  /**
   * Whether a Tangent or Perpendicular override is measured from LASTPOINT
   * where the prompt has no base point: CIRCLE's centre (probes circle/p343,
   * p345). Only the snap measures from it; Ortho and Polar still have no
   * base there.
   */
  snapsFromLastPoint?(): boolean
  /**
   * Whether `@` and the box's relative point are read from LASTPOINT where
   * the prompt's base is elsewhere: UCS's first prompt and ZAxis's origin,
   * whose band starts at the UCS's origin (probe ucs/p442). False, the
   * default: from the base ({@link getConstraintAnchor}).
   */
  relativeFromLastPoint?(): boolean
  /**
   * Whether an object snap override, typed or chosen, answers a question
   * that takes no point ({@link wantsSnap} false): TRIM's and EXTEND's object
   * prompt, FILLET's and CHAMFER's, BREAK's `Select object:`, ARRAYPATH's
   * `Select path curve:`, whose pick is then the snapped point, given as
   * `input.point` with `input.snap` (probes trim/p259–p263, corners/p257–p269,
   * pieces/p108–p115, arrays/p342). The running snaps stay off there,
   * so a click is never moved and selection cycling still works.
   */
  takesSnapOverride?(): boolean
  /**
   * Whether `<angle` typed at the question's lone angle box answers it with
   * that angle, as ELLIPSE's start angle takes `<45` (probes ellipse/p181,
   * p292), rather than holding the next point to that heading. False, the
   * default: the angle override of every other prompt with a base point.
   */
  answersAngleOverride?(): boolean
  /**
   * The override a prompt acts under when none is typed: CIRCLE Ttr's objects
   * are picked as under TAN, so the running snaps show nothing there (desktop
   * circle/d03). Null, the default: the running snaps.
   */
  impliedSnap?(): SnapType.Tangent | null
  /**
   * The marker a Tangent or Perpendicular finding nothing shows over `entity`
   * (on the object, the crosshair left on the pointer): `"deferred"`,
   * AutoCAD's glyph with three dots and `Deferred Tangent`, where the tool
   * works it out ({@link defersSnap}; desktop circle/d03); `"plain"`, the
   * snap's own, where the pick is then refused (Ttr over an ellipse, d13);
   * null, the default, none.
   */
  snapMarker?(
    kind: SnapType.Tangent | SnapType.Perpendicular,
    entity: Entity
  ): "deferred" | "plain" | null

  /**
   * An answer typed at a prompt with no box to take it — a point at `Select
   * objects:` (`ObjectSelector.answerTyped`). Returns whether it was taken;
   * if not, it is refused as {@link takes} says.
   */
  answerTyped?(text: string, ctx: ToolContext): boolean

  /**
   * Whether the tool works in the WCS rather than in the frame of the UCS's XY
   * plane, where every other tool works (see `UcsFrame`): the commands that
   * place the view or the UCS themselves (UCS, PLAN, VPOINT, -VIEW,
   * 3DORBIT). Everything it is given and gives back — the context, the
   * points of its input, its anchor — is then in the WCS.
   */
  readonly inWorld?: boolean

  /**
   * Whether the tool changes the view (ZOOM, PAN, -VIEW, VPOINT, PLAN,
   * 3DORBIT): what it does to it is part of the undo step of the command it
   * runs in, itself or the one it interrupts.
   */
  readonly changesView?: true

  onActivate?(ctx: ToolContext): void
  onDeactivate?(ctx: ToolContext): void
  /**
   * Whether the selection outlives the command, read as it ends: AutoCAD
   * drops it after every command but COPYCLIP (erase/p249–p251, p261).
   */
  keepsSelection?(): boolean
  /**
   * NEW, or a drawing opened: what AutoCAD keeps per drawing without saving it
   * (CIRCLERAD, OFFSETDIST, HPNAME…) goes back to its default (rectang/p301,
   * p303, p305, p309–p311, p314, p315, p321).
   */
  onNewDrawing?(): void

  onPointerDown?(input: PointerInput, ctx: ToolContext): void
  onPointerMove?(input: PointerInput, ctx: ToolContext): void
  onPointerUp?(input: PointerInput, ctx: ToolContext): void
  onKeyDown?(input: KeyInput, ctx: ToolContext): void

  /**
   * Whether Escape finds a multiline text editor holding changes, which
   * AutoCAD asks about before throwing them away (`Multiline Text - Unsaved
   * Changes`, desktop text/d05-5): the runtime then keeps the command and
   * opens that dialog, whose Yes commits the editor as Ctrl+Enter does and
   * whose No is the Escape it held back.
   */
  hasUnsavedText?(ctx: ToolContext): boolean

  /**
   * Escape steps back inside the command instead of ending it: `true` when
   * the tool took it so, and the command goes on with no `*Cancel*`
   * (TEXTEDIT's single-line editor drops its edit and asks for the next
   * object, desktop text/d06-6); `"cancelled"` when the prompt it leaves is
   * written answered `*Cancel*` first, ahead of what the step back says (DIST
   * at Length, desktop inquiry/d05).
   */
  onEscape?(ctx: ToolContext): boolean | "cancelled"

  /**
   * A line the dynamic prompt shows above the question, which moves with the
   * cursor: DIST's Multiple points' `Distance = 45.0546` above `Specify next
   * point or` (desktop inquiry/d02-1, e02-1). Null for none.
   */
  dynamicPromptLead?(ctx: ToolContext): string | null

  /**
   * Handles Enter as a command confirmation while the canvas holds focus.
   * Returns `true` when the tool consumes it to advance its own flow (e.g. MOVE
   * confirming the selection set), keeping the command running; `false` (the
   * default) lets Enter accept the default and end the command, matching
   * AutoCAD's repeat-prompt behaviour. Not reached while a dynamic-input box is
   * focused — there Enter commits the typed value instead.
   */
  onEnter?(ctx: ToolContext): boolean

  /**
   * The question stands to be asked again, after the runtime refused an
   * answer or a transparent command resumed it: what the console says before
   * it again (ARRAYPATH's `Maximum items = 11`, probes arrays/p367, p373).
   */
  onAskAgain?(ctx: ToolContext): void

  /**
   * Space with the left button held: a lasso under way takes its next mode
   * (Window → Fence → Crossing), before Space is anything else. Returns
   * whether one was under way.
   */
  cycleLasso?(ctx: ToolContext): boolean

  /**
   * The command options (keywords) the tool offers right now — AutoCAD's
   * `[Close/Undo]` prompt. Recomputed on every engine-state rebuild so options
   * appear and disappear with the interaction. Defaults to none.
   */
  commandOptions?(): readonly CommandOption[]

  /**
   * Invokes a command option by its global keyword (`"Close"`), however the
   * user typed it, returning the outcome so the runtime knows whether the
   * command continues or has ended. Omit when the tool exposes no options.
   * `typed` is the answer as typed, where one was (`_S`): HATCH's HPNAME
   * keeps its `_` (probe hatch/p207).
   */
  invokeOption?(
    id: string,
    ctx: ToolContext,
    typed?: string
  ): CommandOptionOutcome

  /**
   * The base point that drawing constraints (Ortho, Polar, ...) restrict
   * against — typically the last confirmed point of an in-progress operation.
   * Returns `null` when the tool has no anchor yet, disabling constraints.
   * Its Z, when it has one, is where a 3D view's `+Z` / `-Z` guide starts.
   * `ctx` for an anchor that is LASTPOINT, which only the runtime keeps
   * (DIST's Multiple points, inquiry/p170).
   */
  getConstraintAnchor?(ctx: ToolContext): Vec2 | Vec3 | null

  /**
   * Whether the tool is currently acquiring a point and therefore wants object
   * snaps (and their markers) and snap-tracking active. Mirrors AutoCAD, where
   * running object snaps only show while a command is prompting for a point —
   * not while merely selecting. Defaults to `true` when omitted.
   */
  wantsSnap?(): boolean

  /**
   * Whether the drawing crosshair replaces the OS cursor while this tool is
   * active. View tools (PAN) return `false` so the cursor they set — a hand —
   * stays visible, matching AutoCAD, where the crosshair belongs to drawing and
   * editing commands. Defaults to `true` when omitted.
   */
  usesCrosshair?(): boolean

  /**
   * A tool-provided magnetic attractor for the cursor, in **screen**
   * coordinates, or `null` when nothing attracts it. Unlike object snaps (which
   * only run during a point prompt, see {@link wantsSnap}), this lets a tool
   * pull the crosshair onto its own interactive handles even while merely
   * selecting — mirroring AutoCAD, where the crosshair clings to any grip it
   * passes over so the grips are easy to grab. Consulted only when the tool is
   * not requesting object snaps. Omit for tools with no magnetic handles.
   */
  magneticCursor?(screen: Vec2, ctx: ToolContext): Vec2 | null

  /**
   * Whether the tool wants acquired object-snap-tracking references to survive
   * the pointer-down that just happened. The runtime normally *consumes*
   * acquired references on every left-click (the point they helped define has
   * been placed). A tool returns `true` here when the click merely *began* an
   * edit that will place its point later — e.g. grabbing a grip to stretch or
   * move a line — so the acquired tracking points stay available during the
   * subsequent drag. Defaults to `false` when omitted.
   */
  retainsTrackingAfterPointerDown?(): boolean

  /**
   * Entities the scene must not draw because the tool is showing an edited
   * version of them in its overlay. Without this an in-place editor paints the
   * new state on top of the old one. Defaults to none.
   */
  hiddenEntityIds?(): readonly EntityId[]

  /**
   * Entities the scene draws faded instead of glowing or highlighted: ERASE's
   * preview of what it will erase, MOVE's originals while the set drags.
   * Defaults to none.
   */
  fadedEntityIds?(ctx: ToolContext): readonly EntityId[]

  /**
   * The badge the command shows beside the cursor: TRIM's ✕ where a click
   * trims, the circle-and-slash where it is refused. Defaults to none.
   */
  cursorBadge?(): CursorBadge | null

  /**
   * Whether `ctx.pick` takes an object on a locked layer, as `Command:`'s
   * pick does: MATCHPROP's source (desktop properties/d08-3). Defaults to
   * `false`, a command's pick passing over them (`lockedObjectAt`).
   */
  picksLocked?(): boolean

  /**
   * Whether the selected objects glow: not once ROTATE or SCALE has its base
   * point, where AutoCAD draws them as they are. Defaults to `true`.
   */
  selectionGlows?(): boolean

  /**
   * The object under the cursor that AutoCAD's rollover tooltip describes
   * (ROLLOVERTIPS 1): only Select's, at `Command:`.
   */
  rolloverEntityId?(): EntityId | null

  /**
   * The tool's transient preview (rubber-band lines, selection boxes, ...) as
   * renderer-agnostic scene primitives in screen coordinates. World points are
   * converted via `ctx.viewport.worldToScreen`.
   */
  buildOverlay?(ctx: ToolContext): ScenePrimitive[]
}
