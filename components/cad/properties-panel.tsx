"use client"

import { useState } from "react"
import { Info } from "lucide-react"
import { useTranslations } from "next-intl"

import { CadEngine, EngineState, PropertyEdit } from "@/cad"
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

/**
 * A properties palette, modelled on AutoCAD's: when one or more objects are
 * selected it lists their geometry (a line's length and angle, a circle's
 * radius/area, …) plus their colour, layer, linetype and lineweight. With a
 * single object selected the geometry values can be retyped to edit it. It
 * renders nothing when the selection is empty, so it never crowds the drawing
 * while you work.
 */
export function PropertiesPanel({
  engine,
  state,
}: {
  engine: CadEngine
  state: EngineState
}) {
  const t = useTranslations("Editor.Properties")
  const info = state.selectionInfo
  if (!info) return null

  return (
    <div className="pointer-events-auto w-56 overflow-hidden rounded-xl border border-border bg-card/90 text-[11px] shadow-lg backdrop-blur">
      <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2">
        <Info className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="font-medium text-foreground">{info.title}</span>
      </div>

      <div className="max-h-[calc(100svh-10rem)] overflow-y-auto">
        {/* General: the layer the selected objects live on (AutoCAD's first row). */}
        <div className="border-b border-border/60 px-3 py-2">
          <div className="mb-1 text-[10px] font-semibold tracking-wide text-muted-foreground/70 uppercase">
            {t("general")}
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">{t("color")}</span>
            <ColorSelect
              value={state.selectionColor}
              names={state.names}
              onValueChange={(value) => engine.setSelectionColor(value)}
              ariaLabel={t("colorLabel")}
              className="w-30"
            />
          </div>

          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="text-muted-foreground">{t("layer")}</span>
            <Select
              value={state.selectionLayerId}
              onValueChange={(value) =>
                engine.setSelectionLayer(value as string)
              }
            >
              <SelectTrigger
                size="sm"
                aria-label={t("layerLabel")}
                className="w-30 bg-background text-[11px] dark:bg-background"
              >
                <SelectValue placeholder={t("varies")} />
              </SelectTrigger>
              <SelectContent>
                {state.layers.map((layer) => (
                  <SelectItem
                    key={layer.id}
                    value={layer.id}
                    className="text-[11px]"
                  >
                    {layer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="text-muted-foreground">{t("linetype")}</span>
            <LinetypeSelect
              value={state.selectionLinetype}
              names={state.names}
              onValueChange={(value) => engine.setSelectionLinetype(value)}
              includeByLayer
              ariaLabel={t("linetypeLabel")}
              className="w-30 bg-background text-[11px] dark:bg-background"
            />
          </div>

          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="text-muted-foreground">{t("lineweight")}</span>
            <LineweightSelect
              value={state.selectionLineweight}
              names={state.names}
              onValueChange={(value) => engine.setSelectionLineweight(value)}
              includeByLayer
              ariaLabel={t("lineweightLabel")}
              className="w-30 bg-background text-[11px] dark:bg-background"
            />
          </div>

          {/* Only for the object kinds that wear a style, as AutoCAD shows it. */}
          {state.selectionTextStyleId !== null && (
            <StyleRow
              label={t("textStyle")}
              ariaLabel={t("textStyleLabel")}
              value={state.selectionTextStyleId}
              styles={state.textStyles}
              onValueChange={(id) => engine.setSelectionTextStyle(id)}
            />
          )}
          {state.selectionDimStyleId !== null && (
            <StyleRow
              label={t("dimStyle")}
              ariaLabel={t("dimStyleLabel")}
              value={state.selectionDimStyleId}
              styles={state.dimStyles}
              onValueChange={(id) => engine.setSelectionDimStyle(id)}
            />
          )}
        </div>

        {info.groups.map((group) => (
          <div key={group.id} className="px-3 py-2">
            <div className="mb-1 text-[10px] font-semibold tracking-wide text-muted-foreground/70 uppercase">
              {group.title}
            </div>
            <dl className="flex flex-col gap-0.5 font-mono">
              {group.rows.map((row) => (
                <div
                  key={row.id}
                  className="flex items-center justify-between gap-2"
                >
                  <dt className="text-muted-foreground">{row.label}</dt>
                  {row.edit ? (
                    <dd className="flex items-center gap-1">
                      <PropertyInput
                        engine={engine}
                        label={row.label}
                        edit={row.edit}
                      />
                      {row.edit.unit && (
                        <span className="w-4 shrink-0 text-muted-foreground">
                          {row.edit.unit}
                        </span>
                      )}
                    </dd>
                  ) : (
                    <dd className="text-right text-foreground tabular-nums">
                      {row.value}
                    </dd>
                  )}
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
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
      className="w-20 rounded-sm border border-transparent bg-transparent px-1 py-0.5 text-right text-foreground tabular-nums hover:border-border focus:border-ring focus:bg-background focus:outline-none"
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
          size="sm"
          aria-label={ariaLabel}
          className="w-30 bg-background text-[11px] dark:bg-background"
        >
          <SelectValue placeholder={t("varies")} />
        </SelectTrigger>
        <SelectContent>
          {styles.map((style) => (
            <SelectItem key={style.id} value={style.id} className="text-[11px]">
              {style.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
