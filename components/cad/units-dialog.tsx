"use client"

import { useState } from "react"
import { Dialog } from "@base-ui/react/dialog"
import { useTranslations } from "next-intl"

import {
  LengthUnit,
  LENGTH_UNITS,
  unitsSampleOutput,
  type CadEngine,
} from "@/cad"
import type { EditorState } from "@/hooks/useCadEngine"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

/** LUPREC's decimal places, 0 to 8, written as AutoCAD's list writes them. */
const PRECISIONS = Array.from({ length: 9 }, (_, places) =>
  places === 0 ? "0" : `0.${"0".repeat(places)}`
)

const UNIT_NAMES = {
  [LengthUnit.Millimeter]: "millimeters",
  [LengthUnit.Centimeter]: "centimeters",
  [LengthUnit.Meter]: "meters",
} as const satisfies Record<LengthUnit, string>

/**
 * AutoCAD's Drawing Units dialog (UNITS), with what exists here: Length's
 * type (Decimal, the only one) and precision (LUPREC), the insertion scale
 * (INSUNITS: the unit a drawing unit is) and the sample output. OK applies
 * both as one undo step; Cancel and Escape change nothing.
 */
export function UnitsDialog({
  engine,
  state,
}: {
  engine: CadEngine
  state: EditorState
}) {
  const close = () => engine.setUnitsDialog(false)
  return (
    <Dialog.Root
      open={state.unitsDialog}
      onOpenChange={(open) => {
        if (!open) close()
      }}
      // Back to the drawing, not to the control that opened it, so the next
      // key types a command.
      onOpenChangeComplete={(open) => {
        if (!open) engine.focusSurface()
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-background/60" />
        {/* aria-modal: the engine leaves a modal dialog's keys to it. */}
        <Dialog.Popup
          aria-modal="true"
          finalFocus={false}
          className="fixed inset-0 z-50 m-auto h-fit w-80 rounded-lg border bg-card p-3 text-popover-foreground shadow-lg outline-none"
        >
          {state.unitsDialog && (
            <UnitsForm
              engine={engine}
              unit={state.documentUnit}
              precision={state.documentPrecision}
              anglePrecision={state.documentAnglePrecision}
              onDone={close}
            />
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

/** The dialog's fields, starting from the drawing's settings each time it opens. */
function UnitsForm({
  engine,
  unit: initialUnit,
  precision: initialPrecision,
  anglePrecision,
  onDone,
}: {
  engine: CadEngine
  unit: LengthUnit
  precision: number
  anglePrecision: number
  onDone: () => void
}) {
  const t = useTranslations("Editor.Units")
  const [unit, setUnit] = useState(initialUnit)
  const [precision, setPrecision] = useState(initialPrecision)
  const sample = unitsSampleOutput({ precision, anglePrecision })
  const units = Object.fromEntries(
    LENGTH_UNITS.map((entry) => [entry, t(UNIT_NAMES[entry])])
  )
  const precisions = Object.fromEntries(
    PRECISIONS.map((label, places) => [String(places), label])
  )

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        engine.applyDrawingUnits(unit, precision)
        onDone()
      }}
    >
      <Dialog.Title className="mb-3 text-title">{t("title")}</Dialog.Title>

      <fieldset>
        <legend className="mb-1 text-title text-muted-foreground">
          {t("length")}
        </legend>
        <Row label={t("type")}>
          <Select items={{ decimal: t("decimal") }} value="decimal" disabled>
            <SelectTrigger aria-label={t("type")} className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="decimal">{t("decimal")}</SelectItem>
            </SelectContent>
          </Select>
        </Row>
        <Row label={t("precision")}>
          <Select
            items={precisions}
            value={String(precision)}
            onValueChange={(value) => {
              if (value != null) setPrecision(Number(value))
            }}
          >
            <SelectTrigger
              aria-label={t("precision")}
              className="w-36 font-mono"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRECISIONS.map((label, places) => (
                <SelectItem
                  key={label}
                  value={String(places)}
                  className="font-mono"
                >
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Row>
      </fieldset>

      <fieldset className="mt-3">
        <legend className="mb-1 text-title text-muted-foreground">
          {t("insertionScale")}
        </legend>
        <Select
          items={units}
          value={unit}
          onValueChange={(value) => {
            if (value != null) setUnit(value as LengthUnit)
          }}
        >
          <SelectTrigger aria-label={t("insertionScale")} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LENGTH_UNITS.map((entry) => (
              <SelectItem key={entry} value={entry}>
                {units[entry]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </fieldset>

      <fieldset className="mt-3">
        <legend className="mb-1 text-title text-muted-foreground">
          {t("sampleOutput")}
        </legend>
        <output dir="ltr" className="block font-mono text-muted-foreground">
          {sample.map((line) => (
            <span key={line} className="block text-start">
              {line}
            </span>
          ))}
        </output>
      </fieldset>

      <div className="mt-4 flex justify-end gap-2">
        {/* Outline, as Cancel: --primary is a near-white glare here. OK is
            the form's default, so Enter answers it. */}
        <Button type="submit" variant="outline">
          {t("ok")}
        </Button>
        <Dialog.Close
          render={
            <Button type="button" variant="outline">
              {t("cancel")}
            </Button>
          }
        />
      </div>
    </form>
  )
}

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex h-7 items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </div>
  )
}
