import { cn } from "@/lib/utils"

import { DimensionDivider } from "./dimension-divider"

/** A section's dimension-line separator, then its heading and lead. */
export function SectionHeading({
  id,
  label,
  title,
  lead,
  className,
}: {
  id: string
  label: string
  title: string
  lead?: string
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-10", className)}>
      <DimensionDivider label={label} />
      <div className="flex max-w-3xl flex-col gap-5">
        <h2 id={id} className="text-h2">
          {title}
        </h2>
        {lead && <p className="measure text-lead">{lead}</p>}
      </div>
    </div>
  )
}
