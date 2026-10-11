import { Vec2 } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import { DocumentReader } from "../../domain/Document"
import { Entity, EntityId, BlockLookup } from "../../domain/entities"
import { Ucs } from "../../domain/ucs"
import { Viewport } from "../Viewport"
import { Selection } from "../Selection"
import { SnapResult, SnapType } from "../snapping/types"
import { TrackingResult } from "../tracking/types"
import { DynamicInputController } from "../input/DynamicInput"
import { Command } from "../commands/Command"
import { ScenePrimitive } from "../../scene/types"
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
}

/**
 * A question with what a bare Enter keeps, which the prompt shows after its
 * keywords as AutoCAD does: a length (`Specify radius of circle or [Diameter]
 * <10.0000>:`), an angle (`{ angle: 0 }`) or a point (`<0.0000, 0.0000,
 * 0.0000>`), which the runtime formats in the drawing's units, a count
 * (`Enter number of sides <4>:`), a phrase of `commands.prompts` (`<use
 * first point as displacement>`), or a name the drawing holds, as it is
 * (HATCH's `<ANSI31>`).
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
}

/**
 * What a question takes besides its keywords: the AutoCAD input function
 * behind it, whose words refuse anything else typed there (AutoCAD 2023's
 * console) — a point (`Invalid point.`, `Point or option keyword required.`;
 * a 2D one as ARC's, MIRROR's and PLINE's later points ask it), a distance or
 * an angle (`Requires numeric distance, two points, or option keyword.`), a
 * number or a whole one, a keyword (`Invalid option keyword.`), a selection set
 * (`*Invalid selection*` and the selection modes it expects: with sub-objects
 * as MOVE's, of whole objects as MIRROR's and JOIN's, STRETCH's crossing one,
 * BREAK's set of one object, UCS OBject's, which takes a group, or ARRAYPATH's path curve), one object picked (`*Invalid selection*` and
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
  | "wholeObjects"
  | "crossingObjects"
  | "oneObject"
  | "singleSet"
  | "pathCurve"
  | "object"
  | "objectOrLast"
  | "singleObject"
  | {
      readonly refusal: MessageId | readonly MessageId[]
      readonly values?: MessageValues
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
  readonly viewport: Viewport
  readonly selection: Selection
  readonly dynamicInput: DynamicInputController
  /**
   * The block table, to hand to `entityScenePrimitive` and the domain helpers
   * that have to look inside a block reference. A ghost drawn without it is an
   * empty ghost.
   */
  readonly blocks: BlockLookup

  /** Executes a reversible command against the document (the only write-path). */
  execute(command: Command): void

  /**
   * Reverts the most recently executed command, returning whether one existed.
   * During a continuous command the top of the history is always the tool's own
   * last step, so this backs out a single segment without leaving the command —
   * AutoCAD's LINE `Undo` (U) option.
   */
  undo(): boolean

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
   * prompt is while the command runs transparently.
   */
  report(text: string, kind?: "info" | "error" | "prompt"): void

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

  /** The command language, for what a tool writes or draws itself. */
  readonly text: ToolText

  /**
   * Puts a fragment of the drawing on the clipboard (COPYCLIP, CUTCLIP,
   * COPYBASE). The table entries the objects reference travel with them, and
   * `basePoint` is what a later paste lands on the insertion point.
   */
  copyToClipboard(entities: readonly Entity[], basePoint: Vec2 | Vec3): void

  /**
   * Shows or hides the ViewCube (NAVVCUBE). Saved in the drawing but, being
   * presentation, not a command: no undo step.
   */
  setViewCubeVisible(visible: boolean): void

  /**
   * The running object snaps (OSMODE), which -OSNAP reads and sets. Setting a
   * list turns object snapping on; an empty one leaves no snap running.
   */
  readonly runningSnaps: {
    enabled(): readonly SnapType[]
    set(types: readonly SnapType[]): void
  }

  /**
   * The one-shot object snap given for the point being asked (`tan`, the
   * Shift+right-click menu), or null: what LINE reads to defer a Tangent or a
   * Perpendicular picked before there is a point to measure from.
   */
  snapOverride(): SnapType | "none" | null

  /**
   * Ends the current command and drops back to the neutral Select tool. For
   * single-shot commands (MOVE, COPY, ...) that finish the moment their final
   * point is placed, rather than looping or waiting for Escape.
   */
  endCommand(): void
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
  /**
   * The keyword `input` names among `ids`, for a prompt whose keywords the
   * tool reads from a free-text field itself (TEXT's Justify).
   */
  resolveKeyword(input: string, ids: readonly string[]): string | null
  /** The keywords `ids` in the command language, as a prompt lists them. */
  keywordList(ids: readonly string[]): string
  /** A keyword's abbreviation in the command language (`U` for Undo). */
  abbreviation(id: string): string
  /** A keyword's whole word in the command language (`NONe` for None). */
  keyword(id: string): string
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

  onActivate?(ctx: ToolContext): void
  onDeactivate?(ctx: ToolContext): void

  onPointerDown?(input: PointerInput, ctx: ToolContext): void
  onPointerMove?(input: PointerInput, ctx: ToolContext): void
  onPointerUp?(input: PointerInput, ctx: ToolContext): void
  onKeyDown?(input: KeyInput, ctx: ToolContext): void

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
   * The command options (keywords) the tool offers right now — AutoCAD's
   * `[Close/Undo]` prompt. Recomputed on every engine-state rebuild so options
   * appear and disappear with the interaction. Defaults to none.
   */
  commandOptions?(): readonly CommandOption[]

  /**
   * Invokes a command option by its global keyword (`"Close"`), however the
   * user typed it, returning the outcome so the runtime knows whether the
   * command continues or has ended. Omit when the tool exposes no options.
   */
  invokeOption?(id: string, ctx: ToolContext): CommandOptionOutcome

  /**
   * The base point that drawing constraints (Ortho, Polar, ...) restrict
   * against — typically the last confirmed point of an in-progress operation.
   * Returns `null` when the tool has no anchor yet, disabling constraints.
   * Its Z, when it has one, is where a 3D view's `+Z` / `-Z` guide starts.
   */
  getConstraintAnchor?(): Vec2 | Vec3 | null

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
   * The tool's transient preview (rubber-band lines, selection boxes, ...) as
   * renderer-agnostic scene primitives in screen coordinates. World points are
   * converted via `ctx.viewport.worldToScreen`.
   */
  buildOverlay?(ctx: ToolContext): ScenePrimitive[]
}
