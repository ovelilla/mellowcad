"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

import {
  COLOR_BYLAYER,
  LINETYPE_BYLAYER,
  LINEWEIGHT_BYLAYER,
  type CadEngine,
  type EngineState,
  type EntityType,
  type PropertyEdit,
  type PropertyRow,
} from "@/cad"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ColorSelect } from "./color-select"
import { LinetypeSelect } from "./linetype-select"
import { LineweightSelect } from "./lineweight-select"

/** The type drop-down's value for All, which is no object type. */
const ALL = "*"

/**
 * The Properties palette, modelled on AutoCAD's. At its top the object type
 * drop-down: `All (6)`, `Line (5)`… with a selection, which narrows what the
 * palette edits to one type, and `No selection` without one. Then General —
 * colour, layer, linetype, lineweight — and the geometry of the objects
 * edited, retypeable for a single object. With nothing selected General shows
 * the current settings ("When no objects are selected, only the current
 * settings of general properties are displayed"): the current layer, which
 * can be changed there, and ByLayer for the rest until CECOLOR, CELTYPE and
 * CELWEIGHT exist. The palette never appears or disappears with the
 * selection; only its content changes, so the drawing does not resize.
 */
export function PropertiesPanel({
  engine,
  state,
}: {
  engine: CadEngine
  state: EngineState
}) {
  const t = useTranslations("Editor.Properties")
  const { properties } = state
  const info = properties.info
  const selected = info !== null
  const done = () => engine.focusSurface()
  const filterItems: Record<string, string> = selected
    ? Object.fromEntries(
        properties.filters.map((entry) => [entry.type ?? ALL, entry.label])
      )
    : { [ALL]: t("noSelection") }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-border/60 px-3 py-2">
        <Select
          items={filterItems}
          disabled={!selected}
          value={selected ? (properties.filter ?? ALL) : ALL}
          onValueChange={(value) => {
            if (value == null) return
            engine.setPropertiesFilter(
              value === ALL ? null : (value as EntityType)
            )
            done()
          }}
        >
          <SelectTrigger
            size="xs"
            aria-label={t("objectType")}
            className="w-full bg-background dark:bg-background"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(filterItems).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="border-b border-border/60 px-3 py-2">
          <div className="mb-1 text-title text-muted-foreground">
            {t("general")}
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">{t("color")}</span>
            <ColorSelect
              disabled={!selected}
              value={selected ? properties.color : COLOR_BYLAYER}
              names={state.names}
              onValueChange={(value) => {
                engine.setSelectionColor(value, "properties")
                done()
              }}
              ariaLabel={selected ? t("colorLabel") : t("currentColorLabel")}
              size="xs"
              className="w-36"
            />
          </div>

          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="text-muted-foreground">{t("layer")}</span>
            <Select
              items={Object.fromEntries(
                state.layers.map((layer) => [layer.id, layer.name])
              )}
              value={selected ? properties.layerId : state.currentLayerId}
              onValueChange={(value) => {
                if (value == null) return
                if (selected) engine.setSelectionLayer(value, "properties")
                else engine.setCurrentLayer(value)
                done()
              }}
            >
              <SelectTrigger
                size="xs"
                aria-label={selected ? t("layerLabel") : t("currentLayerLabel")}
                className="w-36 bg-background dark:bg-background"
              >
                <SelectValue placeholder={t("varies")} />
              </SelectTrigger>
              <SelectContent>
                {state.layers.map((layer) => (
                  <SelectItem key={layer.id} value={layer.id}>
                    {layer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="text-muted-foreground">{t("linetype")}</span>
            <LinetypeSelect
              disabled={!selected}
              value={selected ? properties.linetype : LINETYPE_BYLAYER}
              names={state.names}
              onValueChange={(value) => {
                engine.setSelectionLinetype(value, "properties")
                done()
              }}
              includeByLayer
              ariaLabel={
                selected ? t("linetypeLabel") : t("currentLinetypeLabel")
              }
              size="xs"
              className="w-36 bg-background dark:bg-background"
            />
          </div>

          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="text-muted-foreground">{t("lineweight")}</span>
            <LineweightSelect
              disabled={!selected}
              value={selected ? properties.lineweight : LINEWEIGHT_BYLAYER}
              names={state.names}
              onValueChange={(value) => {
                engine.setSelectionLineweight(value, "properties")
                done()
              }}
              includeByLayer
              ariaLabel={
                selected ? t("lineweightLabel") : t("currentLineweightLabel")
              }
              size="xs"
              className="w-36 bg-background dark:bg-background"
            />
          </div>

          {info && info.general.length > 0 && (
            <dl className="mt-1 flex flex-col gap-1">
              {info.general.map((row) => (
                <PropertyRowView key={row.id} engine={engine} row={row} />
              ))}
            </dl>
          )}

          {/* Only for the object kinds that wear a style, as AutoCAD shows it. */}
          {properties.textStyleId !== null && (
            <StyleRow
              label={t("textStyle")}
              ariaLabel={t("textStyleLabel")}
              value={properties.textStyleId}
              styles={state.textStyles}
              onValueChange={(id) => {
                engine.setSelectionTextStyle(id)
                done()
              }}
            />
          )}
          {properties.dimStyleId !== null && (
            <StyleRow
              label={t("dimStyle")}
              ariaLabel={t("dimStyleLabel")}
              value={properties.dimStyleId}
              styles={state.dimStyles}
              onValueChange={(id) => {
                engine.setSelectionDimStyle(id)
                done()
              }}
            />
          )}
        </div>

        {info?.groups.map((group) => (
          <div key={group.id} className="px-3 py-2">
            <div className="mb-1 text-title text-muted-foreground">
              {group.title}
            </div>
            <dl className="flex flex-col gap-1">
              {group.rows.map((row) => (
                <PropertyRowView key={row.id} engine={engine} row={row} />
              ))}
            </dl>
          </div>
        ))}
      </div>
    </div>
  )
}

function PropertyRowView({
  engine,
  row,
}: {
  engine: CadEngine
  row: PropertyRow
}) {
  return (
    <div className="flex min-h-7 items-center justify-between gap-2">
      <dt className="text-muted-foreground">{row.label}</dt>
      {row.edit ? (
        // A technical value with its unit: one LTR island, so -12.5 never
        // reads 12.5- and the unit stays after the number.
        <dd dir="ltr" className="flex items-center gap-1 font-mono">
          <PropertyInput engine={engine} label={row.label} edit={row.edit} />
          {row.edit.unit && (
            <span className="w-4 shrink-0 text-muted-foreground">
              {row.edit.unit}
            </span>
          )}
        </dd>
      ) : (
        // As wide as a typeable value with its unit, so both end on one
        // edge in a right-to-left page too.
        <dd
          dir="ltr"
          className="min-w-25 text-end font-mono text-foreground tabular-nums"
        >
          {row.value}
        </dd>
      )}
    </div>
  )
}

/**
 * One typeable geometry value. It shows the document-formatted number until you
 * edit it, then commits on Enter or blur and hands focus back to the drawing
 * surface so the next keystroke reaches the command line. Escape reverts.
 */
function PropertyInput({
  engine,
  label,
  edit,
}: {
  engine: CadEngine
  label: string
  edit: PropertyEdit
}) {
  const [draft, setDraft] = useState<string | null>(null)

  const commit = () => {
    if (draft !== null && draft !== edit.text) {
      engine.setSelectionProperty(edit.property, draft)
    }
    setDraft(null)
  }

  return (
    <input
      aria-label={label}
      value={draft ?? edit.text}
      onChange={(event) => setDraft(event.target.value)}
      onFocus={(event) => event.currentTarget.select()}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault()
          commit()
          engine.focusSurface()
        } else if (event.key === "Escape") {
          event.preventDefault()
          setDraft(null)
          engine.focusSurface()
        }
      }}
      className="w-20 rounded-sm border border-transparent bg-transparent px-1 py-0.5 text-end text-foreground tabular-nums hover:border-border focus:border-ring focus:bg-background focus:outline-none"
    />
  )
}

/** A named-style picker: the palette's Text style / Dim style row. */
function StyleRow({
  label,
  ariaLabel,
  value,
  styles,
  onValueChange,
}: {
  label: string
  ariaLabel: string
  value: string
  styles: ReadonlyArray<{ id: string; name: string }>
  onValueChange: (id: string) => void
}) {
  const t = useTranslations("Editor.Properties")
  return (
    <div className="mt-1 flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <Select
        value={value}
        onValueChange={(next) => {
          if (next != null) onValueChange(next as string)
        }}
      >
        <SelectTrigger
          size="xs"
          aria-label={ariaLabel}
          className="w-36 bg-background dark:bg-background"
        >
          <SelectValue placeholder={t("varies")} />
        </SelectTrigger>
        <SelectContent>
          {styles.map((style) => (
            <SelectItem key={style.id} value={style.id}>
              {style.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
